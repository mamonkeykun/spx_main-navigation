import { useState, useEffect, useCallback } from 'react';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';

import { DEFAULT_NAV_CONFIG, type NavConfig } from '../types/navTypes';
import type { SpfxContext } from '../../../shared/spfxContext';

interface UseNavConfigResult {
  config: NavConfig;
  saveConfig: (patch: Partial<NavConfig>) => Promise<void>;
  loading: boolean;
  error: string | null;
}
const CONFIG_KEY = 'OrigamiNavConfig';

export function useNavConfig(
  context: SpfxContext
): UseNavConfigResult {
  const [config, setConfig] = useState<NavConfig>(DEFAULT_NAV_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sp = spfi().using(SPFx(context));

    sp.web.allProperties()
      .then((props: Record<string, unknown>) => {
        const raw = props[CONFIG_KEY];

        if (typeof raw === 'string') {
          try {
            const parsed = JSON.parse(raw) as Partial<NavConfig>;
            setConfig({ ...DEFAULT_NAV_CONFIG, ...parsed });
          } catch {
            setConfig(DEFAULT_NAV_CONFIG);
          }
        }

        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error('[TopNav] 設定の読み込みに失敗しました:', err);
        setError('設定の読み込みに失敗しました');
        setLoading(false);
      });
  }, [context]);

  const saveConfig = useCallback(
    async (patch: Partial<NavConfig>) => {
      const next: NavConfig = {
        ...config,
        ...patch,
      };

      setConfig(next);
      try {
        const sp = spfi().using(SPFx(context));
        await sp.web.update({
          AllProperties: {
            [CONFIG_KEY]: JSON.stringify(next),
          },
        });
      } catch (err: unknown) {
        setConfig(config);
        setError('設定の保存に失敗しました');
        console.error('[TopNav] 設定の保存に失敗しました:', err);
      }
    },
    [config, context]
  );

  return {
    config,
    saveConfig,
    loading,
    error,
  };
}
