import * as React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { describe, beforeEach, expect, it, jest } from '@jest/globals';
import { DEFAULT_NAV_CONFIG } from '../types/navTypes';
import { useNavConfig } from './useNavConfig';

const usingMock = jest.fn();
const spfiMock = jest.fn();
const allPropertiesMock = jest.fn();
const updateMock = jest.fn();

jest.mock('@pnp/sp', () => ({
  spfi: (...args: unknown[]) => spfiMock(...args),
  SPFx: jest.fn(() => 'spfx-behavior'),
}));

jest.mock('@pnp/sp/webs', () => ({}));

describe('useNavConfig', () => {
  const context = {
    pageContext: {
      web: {
        absoluteUrl: 'https://tenant.sharepoint.com/sites/current',
      },
    },
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();

    spfiMock.mockReturnValue({
      using: usingMock.mockReturnValue({
        web: {
          allProperties: allPropertiesMock,
          update: updateMock,
        },
      }),
    });
  });

  function renderHook<T>(callback: () => T): { result: { current: T } } {
    const result = { current: undefined as unknown as T };

    function TestComponent(): React.ReactElement | null {
      result.current = callback();
      return React.createElement(React.Fragment);
    }

    render(React.createElement(TestComponent));

    return { result };
  }

  it('returns DEFAULT_NAV_CONFIG when no stored config exists', async () => {
    allPropertiesMock.mockResolvedValue({});

    const { result } = renderHook(() => useNavConfig(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.config).toEqual(DEFAULT_NAV_CONFIG);
    expect(result.current.error).toBeNull();
  });

  it('merges stored config over defaults correctly', async () => {
    allPropertiesMock.mockResolvedValue({
      OrigamiNavConfig: JSON.stringify({
        version: 1,
        logoUrl: '/logo.svg',
        showBreadcrumb: true,
      }),
    });

    const { result } = renderHook(() => useNavConfig(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.config).toEqual({
      ...DEFAULT_NAV_CONFIG,
      logoUrl: '/logo.svg',
      showBreadcrumb: true,
    });
  });

  it('falls back to defaults when stored config JSON is invalid', async () => {
    allPropertiesMock.mockResolvedValue({
      OrigamiNavConfig: '{bad json',
    });

    const { result } = renderHook(() => useNavConfig(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.config).toEqual(DEFAULT_NAV_CONFIG);
  });

  it('saveConfig updates state optimistically and persists merged config', async () => {
    allPropertiesMock.mockResolvedValue({});
    updateMock.mockResolvedValue({});

    const { result } = renderHook(() => useNavConfig(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.saveConfig({
        logoUrl: '/next.svg',
        showBreadcrumb: true,
      });
    });

    expect(result.current.config).toEqual({
      ...DEFAULT_NAV_CONFIG,
      logoUrl: '/next.svg',
      showBreadcrumb: true,
    });
    expect(updateMock).toHaveBeenCalledWith({
      AllProperties: {
        OrigamiNavConfig: JSON.stringify({
          ...DEFAULT_NAV_CONFIG,
          logoUrl: '/next.svg',
          showBreadcrumb: true,
        }),
      },
    });
  });

  it('reverts the optimistic update and sets error when save fails', async () => {
    allPropertiesMock.mockResolvedValue({});
    updateMock.mockRejectedValue(new Error('save failed'));

    const { result } = renderHook(() => useNavConfig(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.saveConfig({
        logoUrl: '/broken.svg',
      });
    });

    expect(result.current.config).toEqual(DEFAULT_NAV_CONFIG);
    expect(result.current.error).toBe('設定の保存に失敗しました');
  });
});
