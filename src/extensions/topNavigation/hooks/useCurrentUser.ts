import { useEffect, useMemo, useState } from 'react';
import { spfi, type SPFI } from '@pnp/sp';
import { SPFx } from '@pnp/sp/presets/all';
import '@pnp/sp/presets/all';
import type { SpfxContext } from '../../../shared/spfxContext';

interface ISPGroup {
  LoginName?: string;
}

interface UseCurrentUserResult {
  groups: string[];
  loading: boolean;
  error: string | null;
}

function normalizeGroups(groups: ISPGroup[]): string[] {
  const seen = new Set<string>();

  return groups.reduce<string[]>((result, group) => {
    const loginName = group.LoginName?.trim();

    if (!loginName || seen.has(loginName)) {
      return result;
    }

    seen.add(loginName);
    result.push(loginName);

    return result;
  }, []);
}

async function loadCurrentUserGroups(sp: SPFI): Promise<string[]> {
  const groups = await sp.web.currentUser.groups<ISPGroup[]>();

  return normalizeGroups(groups);
}

export function useCurrentUser(context: SpfxContext): UseCurrentUserResult {
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sp = useMemo(
    () => spfi(context.pageContext.web.absoluteUrl).using(SPFx(context)),
    [context]
  );

  useEffect(() => {
    let isActive = true;

    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const nextGroups = await loadCurrentUserGroups(sp);

        if (isActive) {
          setGroups(nextGroups);
        }
      } catch (caughtError: unknown) {
        if (!isActive) {
          return;
        }

        setGroups([]);
        setError(
          caughtError instanceof Error ? caughtError.message : 'Failed to load current user groups.'
        );
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
  }, [sp]);

  return {
    groups,
    loading,
    error,
  };
}
