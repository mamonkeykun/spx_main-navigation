import { useMemo } from 'react';
import type { NavFolder, NavItem } from '../types/navTypes';

interface FilterNavByGroupsArgs {
  folders: NavFolder[];
  items: NavItem[];
  userGroups: string[];
}

interface UseNavFilterArgs extends FilterNavByGroupsArgs {
  loading?: boolean;
  error?: string | null;
}

interface UseNavFilterResult {
  folders: NavFolder[];
  items: NavItem[];
  loading: boolean;
}

function isVisibleToUser(allowedGroups: string[], userGroups: Set<string>): boolean {
  if (allowedGroups.length === 0) {
    return true;
  }

  return allowedGroups.some((group) => userGroups.has(group));
}

export function filterNavByGroups({
  folders,
  items,
  userGroups,
}: FilterNavByGroupsArgs): Pick<UseNavFilterResult, 'folders' | 'items'> {
  const normalizedUserGroups = new Set(
    userGroups.map((group) => group.trim()).filter((group) => group.length > 0)
  );

  const visibleFolders = folders
    .filter((folder) => isVisibleToUser(folder.allowedGroups, normalizedUserGroups))
    .map((folder) => {
      const visibleItems = items.filter(
        (item) =>
          item.folderId === folder.id && isVisibleToUser(item.allowedGroups, normalizedUserGroups)
      );

      return {
        ...folder,
        items: visibleItems,
      };
    })
    .filter((folder) => folder.items.length > 0);

  const visibleFolderIds = new Set(visibleFolders.map((folder) => folder.id));
  const visibleItems = items.filter((item) => {
    if (typeof item.folderId === 'number') {
      return (
        visibleFolderIds.has(item.folderId) &&
        isVisibleToUser(item.allowedGroups, normalizedUserGroups)
      );
    }

    return isVisibleToUser(item.allowedGroups, normalizedUserGroups);
  });

  return {
    folders: visibleFolders,
    items: visibleItems,
  };
}

export function useNavFilter({
  folders,
  items,
  userGroups,
  loading = false,
  error = null,
}: UseNavFilterArgs): UseNavFilterResult {
  return useMemo(() => {
    if (loading) {
      return {
        folders: [],
        items: [],
        loading: true,
      };
    }

    if (error) {
      if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('Falling back to unfiltered navigation because group lookup failed.', error);
      }

      return {
        folders,
        items,
        loading: false,
      };
    }

    const filteredNav = filterNavByGroups({
      folders,
      items,
      userGroups,
    });

    return {
      ...filteredNav,
      loading: false,
    };
  }, [error, folders, items, loading, userGroups]);
}
