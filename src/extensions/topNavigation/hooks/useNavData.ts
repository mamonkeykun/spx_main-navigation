import { useCallback, useEffect, useMemo, useState } from 'react';
import { spfi, type SPFI } from '@pnp/sp';
import { SPFx } from '@pnp/sp/presets/all';
import '@pnp/sp/presets/all';
import type { SpfxContext } from '../../../shared/spfxContext';
import type { NavFolder, NavItem } from '../types/navTypes';
import { provisionNavList } from '../utils/provisionNavList';

const NAVIGATION_LIST_TITLE = 'Navigation';

interface ISPNavListItem {
  Id: number;
  Title?: string;
  NavUrl?: string;
  NavDescription?: string;
  NavOrder?: number | null;
  NavFolderId?: number | null;
  NavAllowedGroups?: string | null;
  NavOpenInNewTab?: boolean | null;
}

interface UseNavDataResult {
  folders: NavFolder[];
  items: NavItem[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

function parseAllowedGroups(value?: string | null): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry): entry is string => typeof entry === 'string');
  } catch {
    return [];
  }
}

function mapFolder(item: ISPNavListItem, items: NavItem[]): NavFolder {
  return {
    id: item.Id,
    title: item.Title ?? '',
    order: item.NavOrder ?? 0,
    allowedGroups: parseAllowedGroups(item.NavAllowedGroups),
    items: items.filter((navItem) => navItem.folderId === item.Id),
  };
}

function isFolderLikeItem(item: ISPNavListItem): boolean {
  return !item.NavUrl && item.NavFolderId == null;
}

function mapItem(item: ISPNavListItem): NavItem {
  return {
    id: item.Id,
    title: item.Title ?? '',
    url: item.NavUrl ?? '',
    description: item.NavDescription ?? undefined,
    order: item.NavOrder ?? 0,
    folderId: item.NavFolderId ?? undefined,
    allowedGroups: parseAllowedGroups(item.NavAllowedGroups),
    openInNewTab: item.NavOpenInNewTab ?? false,
  };
}

function getErrorCode(caughtError: unknown): number | undefined {
  if (typeof caughtError !== 'object' || caughtError === null) {
    return undefined;
  }

  const maybeStatus = (caughtError as { status?: unknown }).status;
  return typeof maybeStatus === 'number' ? maybeStatus : undefined;
}

function isNotFoundError(caughtError: unknown): boolean {
  if (getErrorCode(caughtError) === 404) {
    return true;
  }

  return caughtError instanceof Error && caughtError.message.includes('404');
}

function sortNavItems<T extends { order: number; title: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order;
    }

    return left.title.localeCompare(right.title);
  });
}

async function fetchNavRows(sp: SPFI, filter: string): Promise<ISPNavListItem[]> {
  return sp.web.lists
    .getByTitle(NAVIGATION_LIST_TITLE)
    .items.filter(filter)
    .select(
      'Id',
      'Title',
      'NavUrl',
      'NavDescription',
      'NavOrder',
      'NavFolderId',
      'NavAllowedGroups',
      'NavOpenInNewTab'
    )<ISPNavListItem[]>();
}

async function fetchNavigationData(sp: SPFI): Promise<{
  folders: NavFolder[];
  items: NavItem[];
}> {
  const [folderRows, itemRows] = await Promise.all([
    fetchNavRows(sp, 'FSObjType eq 1'),
    fetchNavRows(sp, 'FSObjType eq 0'),
  ]);
  const normalizedFolderRows = [...folderRows, ...itemRows.filter(isFolderLikeItem)];
  const navItemRows = itemRows.filter((item) => !isFolderLikeItem(item));
  const nextItems = sortNavItems(navItemRows.map(mapItem));
  const nextFolders = sortNavItems(normalizedFolderRows.map((folder) => mapFolder(folder, nextItems)));

  return {
    folders: nextFolders,
    items: nextItems,
  };
}

export function useNavData(
  context: SpfxContext,
  sourceUrl?: string
): UseNavDataResult {
  const [folders, setFolders] = useState<NavFolder[]>([]);
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState<number>(0);
  const localSp = useMemo(
    () => spfi(context.pageContext.web.absoluteUrl).using(SPFx(context)),
    [context]
  );

  const targetUrl = sourceUrl || context.pageContext.web.absoluteUrl;
  const sp = useMemo(() => spfi(targetUrl).using(SPFx(context)), [context, targetUrl]);

  const reload = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const fetchRemoteData = async (): Promise<{ folders: NavFolder[]; items: NavItem[] }> => {
          if (!sourceUrl) {
            return fetchNavigationData(sp);
          }

          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 8000)
          );

          // DECISION: Promise.race gives a simple timeout path without layering AbortController into PnPjs calls.
          return Promise.race([fetchNavigationData(sp), timeout]);
        };

        const result = await fetchRemoteData();

        if (!isActive) {
          return;
        }

        setItems(result.items);
        setFolders(result.folders);
      } catch (caughtError: unknown) {
        if (!isActive) {
          return;
        }

        if (sourceUrl && caughtError instanceof Error && caughtError.message === 'timeout') {
          console.warn('Cross-site navigation timed out. Falling back to the local site.');

          try {
            const fallbackResult = await fetchNavigationData(localSp);

            if (!isActive) {
              return;
            }

            setItems(fallbackResult.items);
            setFolders(fallbackResult.folders);
            setError('参照先サイトへの接続がタイムアウトしました');
            return;
          } catch (fallbackError: unknown) {
            if (!isActive) {
              return;
            }

            const fallbackMessage =
              fallbackError instanceof Error
                ? fallbackError.message
                : 'Failed to load navigation data.';

            setError(fallbackMessage);
            return;
          }
        }

        if (sourceUrl && getErrorCode(caughtError) === 403) {
          setError('参照先サイトへのアクセス権限がありません');
          return;
        }

        if (isNotFoundError(caughtError)) {
          try {
            // DECISION: A missing Navigation list is recoverable, so the hook provisions the schema once and returns empty data.
            await provisionNavList(sp);

            if (!isActive) {
              return;
            }

            setFolders([]);
            setItems([]);
            setError(null);
            return;
          } catch {
            if (!isActive) {
              return;
            }

            setError(
              'Navigationリストの作成に失敗しました。サイト管理者に連絡してください。'
            );
            return;
          }
        }

        const message =
          caughtError instanceof Error ? caughtError.message : 'Failed to load navigation data.';

        setError(message);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [localSp, reloadCount, sourceUrl, sp]);

  return {
    folders,
    items,
    loading,
    error,
    reload,
  };
}
