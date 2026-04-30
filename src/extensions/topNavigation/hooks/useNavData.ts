import { useState, useEffect, useMemo, useCallback } from 'react';
import { spfi, SPFx, type SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/folders';

import type { NavFolder, NavItem } from '../types/navTypes';
import type { SpfxContext } from '../../../shared/spfxContext';

const LIST_TITLE = 'Navigation';

export interface UseNavDataResult {
  folders: NavFolder[];
  items: NavItem[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  getItemsForFolder: (folder: NavFolder) => NavItem[];
  getTopLevelItems: () => NavItem[];
}

export function useNavData(
  context: SpfxContext,
  sourceUrl?: string
): UseNavDataResult {
  const [folders, setFolders] = useState<NavFolder[]>([]);
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);

  const sp: SPFI = useMemo(() => {
    const targetUrl = sourceUrl && sourceUrl.trim() !== ''
      ? sourceUrl.trim()
      : context.pageContext.web.absoluteUrl;

    return spfi(targetUrl).using(SPFx(context));
  }, [sourceUrl, context]);

  const reload = useCallback(() => {
    setReloadCounter((count) => count + 1);
  }, []);

  const getItemsForFolder = useCallback(
    (folder: NavFolder): NavItem[] => {
      // DECISION: Parentage is resolved in the hook using the native SharePoint folder path.
      return items.filter((item) => item.parentFolderPath === folder.folderPath);
    },
    [items]
  );

  const getTopLevelItems = useCallback((): NavItem[] => {
    const folderPaths = new Set(folders.map((folder) => folder.folderPath));
    return items.filter((item) => !folderPaths.has(item.parentFolderPath));
  }, [folders, items]);

  useEffect(() => {
    let cancelled = false;

    async function fetchNav(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const listItems = sp.web.lists.getByTitle(LIST_TITLE);
        const [rawFolders, rawItems] = await Promise.all([
          listItems.items
            .filter('FSObjType eq 1')
            .select('Id', 'Title', 'NavUrl', 'NavOrder', 'FileDirRef')
            .orderBy('NavOrder', true)
            <{ Id: number; Title: string; NavUrl?: string; NavOrder?: number; FileDirRef: string }[]>(),
          listItems.items
            .filter('FSObjType eq 0')
            .select(
              'Id',
              'Title',
              'NavUrl',
              'NavDescription',
              'NavOrder',
              'NavOpenInNewTab',
              'FileDirRef'
            )
            .orderBy('FileDirRef', true)
            .orderBy('NavOrder', true)
            <{
              Id: number;
              Title: string;
              NavUrl?: string;
              NavDescription?: string;
              NavOrder?: number;
              NavOpenInNewTab?: boolean;
              FileDirRef: string;
            }[]>(),
        ]);

        if (cancelled) {
          return;
        }

        setFolders(
          rawFolders.map((folder) => ({
            id: String(folder.Id),
            spItemId: folder.Id,
            label: folder.Title,
            url: folder.NavUrl,
            order: folder.NavOrder ?? 0,
            folderPath: folder.FileDirRef,
          }))
        );

        setItems(
          rawItems.map((item) => ({
            id: String(item.Id),
            spItemId: item.Id,
            label: item.Title,
            url: item.NavUrl ?? '',
            description: item.NavDescription,
            order: item.NavOrder ?? 0,
            parentFolderPath: item.FileDirRef,
            openInNewTab: item.NavOpenInNewTab ?? false,
          }))
        );
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        const is404 =
          err instanceof Error &&
          (err.message.includes('404') || err.message.includes('does not exist'));

        if (is404) {
          setFolders([]);
          setItems([]);
          setError(null);
          console.warn(
            '[TopNav] Navigationリストが見つかりません。provision-navigation-list.ps1 を実行してください。'
          );
        } else {
          setError('ナビゲーションデータの取得に失敗しました');
          console.error('[TopNav] useNavData error:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchNav();

    return () => {
      cancelled = true;
    };
  }, [sp, reloadCounter]);

  return {
    folders,
    items,
    loading,
    error,
    reload,
    getItemsForFolder,
    getTopLevelItems,
  };
}
