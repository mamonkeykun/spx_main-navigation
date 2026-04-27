import { renderHook } from '@testing-library/react';
import type { NavFolder, NavItem } from '../types/navTypes';
import { filterNavByGroups, useNavFilter } from './useNavFilter';

describe('useNavFilter', () => {
  const folders: NavFolder[] = [
    {
      id: 10,
      title: 'Policies',
      order: 1,
      allowedGroups: ['HR'],
      items: [],
    },
    {
      id: 20,
      title: 'General',
      order: 2,
      allowedGroups: [],
      items: [],
    },
  ];

  const items: NavItem[] = [
    {
      id: 1,
      title: 'Leave',
      url: '/leave',
      order: 1,
      folderId: 10,
      allowedGroups: ['HR'],
      openInNewTab: false,
    },
    {
      id: 2,
      title: 'Payroll',
      url: '/payroll',
      order: 2,
      folderId: 10,
      allowedGroups: ['Finance'],
      openInNewTab: false,
    },
    {
      id: 3,
      title: 'Home',
      url: '/home',
      order: 3,
      allowedGroups: [],
      openInNewTab: false,
    },
    {
      id: 4,
      title: 'Handbook',
      url: '/handbook',
      order: 4,
      folderId: 20,
      allowedGroups: [],
      openInNewTab: false,
    },
  ];

  it('filters folders and items to matching groups', () => {
    const { result } = renderHook(() =>
      useNavFilter({
        folders,
        items,
        userGroups: ['HR'],
      })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.folders).toEqual([
      {
        id: 10,
        title: 'Policies',
        order: 1,
        allowedGroups: ['HR'],
        items: [
          {
            id: 1,
            title: 'Leave',
            url: '/leave',
            order: 1,
            folderId: 10,
            allowedGroups: ['HR'],
            openInNewTab: false,
          },
        ],
      },
      {
        id: 20,
        title: 'General',
        order: 2,
        allowedGroups: [],
        items: [
          {
            id: 4,
            title: 'Handbook',
            url: '/handbook',
            order: 4,
            folderId: 20,
            allowedGroups: [],
            openInNewTab: false,
          },
        ],
      },
    ]);
    expect(result.current.items).toEqual([
      {
        id: 1,
        title: 'Leave',
        url: '/leave',
        order: 1,
        folderId: 10,
        allowedGroups: ['HR'],
        openInNewTab: false,
      },
      {
        id: 3,
        title: 'Home',
        url: '/home',
        order: 3,
        allowedGroups: [],
        openInNewTab: false,
      },
      {
        id: 4,
        title: 'Handbook',
        url: '/handbook',
        order: 4,
        folderId: 20,
        allowedGroups: [],
        openInNewTab: false,
      },
    ]);
  });

  it('hides child items when the folder itself is hidden', () => {
    const result = filterNavByGroups({
      folders,
      items,
      userGroups: ['Finance'],
    });

    expect(result.folders).toEqual([
      {
        id: 20,
        title: 'General',
        order: 2,
        allowedGroups: [],
        items: [
          {
            id: 4,
            title: 'Handbook',
            url: '/handbook',
            order: 4,
            folderId: 20,
            allowedGroups: [],
            openInNewTab: false,
          },
        ],
      },
    ]);
    expect(result.items).toEqual([
      {
        id: 3,
        title: 'Home',
        url: '/home',
        order: 3,
        allowedGroups: [],
        openInNewTab: false,
      },
      {
        id: 4,
        title: 'Handbook',
        url: '/handbook',
        order: 4,
        folderId: 20,
        allowedGroups: [],
        openInNewTab: false,
      },
    ]);
  });

  it('hides the folder when all of its items are filtered out', () => {
    const result = filterNavByGroups({
      folders: [
        {
          id: 30,
          title: 'Finance',
          order: 3,
          allowedGroups: [],
          items: [],
        },
      ],
      items: [
        {
          id: 5,
          title: 'Budget',
          url: '/budget',
          order: 1,
          folderId: 30,
          allowedGroups: ['Finance'],
          openInNewTab: false,
        },
      ],
      userGroups: ['HR'],
    });

    expect(result.folders).toEqual([]);
    expect(result.items).toEqual([]);
  });

  it('shows items when the user belongs to any matching group', () => {
    const result = filterNavByGroups({
      folders,
      items,
      userGroups: ['Visitors', 'HR', 'Owners'],
    });

    expect(result.items.map((item) => item.id)).toContain(1);
    expect(result.folders.map((folder) => folder.id)).toContain(10);
  });

  it('treats group matching as case-sensitive', () => {
    // DECISION: Group matching stays case-sensitive to mirror SharePoint LoginName behavior.
    const result = filterNavByGroups({
      folders,
      items,
      userGroups: ['hr'],
    });

    expect(result.folders.map((folder) => folder.id)).not.toContain(10);
    expect(result.items.map((item) => item.id)).not.toContain(1);
  });

  it('handles larger item sets without changing semantics', () => {
    const manyFolders: NavFolder[] = Array.from({ length: 5 }, (_, folderIndex) => ({
      id: folderIndex + 100,
      title: `Folder ${folderIndex + 1}`,
      order: folderIndex,
      allowedGroups: [],
      items: [],
    }));
    const manyItems: NavItem[] = Array.from({ length: 50 }, (_, itemIndex) => ({
      id: itemIndex + 1000,
      title: `Item ${itemIndex + 1}`,
      url: `/item-${itemIndex + 1}`,
      order: itemIndex,
      folderId: manyFolders[itemIndex % manyFolders.length].id,
      allowedGroups: itemIndex % 2 === 0 ? [] : ['Members'],
      openInNewTab: false,
    }));

    const result = filterNavByGroups({
      folders: manyFolders,
      items: manyItems,
      userGroups: ['Members'],
    });

    expect(result.folders).toHaveLength(5);
    expect(result.items).toHaveLength(50);
  });

  it('returns loading state while current user groups are loading', () => {
    const { result } = renderHook(() =>
      useNavFilter({
        folders,
        items,
        userGroups: [],
        loading: true,
      })
    );

    expect(result.current).toEqual({
      folders: [],
      items: [],
      loading: true,
    });
  });

  it('fails open when current user group lookup errors', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const { result } = renderHook(() =>
      useNavFilter({
        folders,
        items,
        userGroups: [],
        error: 'group lookup failed',
      })
    );

    expect(result.current).toEqual({
      folders,
      items,
      loading: false,
    });
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
