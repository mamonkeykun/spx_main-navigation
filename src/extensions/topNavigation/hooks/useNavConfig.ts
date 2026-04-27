import { useCallback, useEffect, useMemo, useState } from 'react';
import { spfi, type SPFI } from '@pnp/sp';
import { SPFx } from '@pnp/sp/presets/all';
import '@pnp/sp/presets/all';
import type { SpfxContext } from '../../../shared/spfxContext';
import { DEFAULT_NAV_CONFIG, type NavConfig } from '../types/navTypes';

const CONFIG_KEY = 'OrigamiNavConfig';
const CURRENT_CONFIG_VERSION = 1;

interface IAllPropertiesResponse {
  AllProperties?: Record<string, unknown>;
}

interface UseNavConfigResult {
  config: NavConfig;
  saveConfig: (patch: Partial<NavConfig>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function migrateConfig(config: NavConfig): NavConfig {
  if (config.version < CURRENT_CONFIG_VERSION) {
    return {
      ...config,
      version: CURRENT_CONFIG_VERSION,
    };
  }

  return config;
}

function mergeConfig(value: unknown): NavConfig {
  if (!isRecord(value)) {
    return DEFAULT_NAV_CONFIG;
  }

  return migrateConfig({
    ...DEFAULT_NAV_CONFIG,
    ...value,
  } as NavConfig);
}

async function loadStoredConfig(sp: SPFI): Promise<NavConfig> {
  const response = await sp.web.select('AllProperties')<IAllPropertiesResponse>();
  const storedValue = response.AllProperties?.[CONFIG_KEY];

  if (typeof storedValue !== 'string' || storedValue.trim() === '') {
    return DEFAULT_NAV_CONFIG;
  }

  try {
    const parsed = JSON.parse(storedValue) as unknown;

    return mergeConfig(parsed);
  } catch {
    return DEFAULT_NAV_CONFIG;
  }
}

export function useNavConfig(context: SpfxContext): UseNavConfigResult {
  const [config, setConfig] = useState<NavConfig>(DEFAULT_NAV_CONFIG);
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
        const nextConfig = await loadStoredConfig(sp);

        if (isActive) {
          setConfig(nextConfig);
        }
      } catch (caughtError: unknown) {
        if (!isActive) {
          return;
        }

        setConfig(DEFAULT_NAV_CONFIG);
        setError(
          caughtError instanceof Error ? caughtError.message : 'Failed to load navigation config.'
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

  const saveConfig = useCallback(
    async (patch: Partial<NavConfig>): Promise<void> => {
      const previousConfig = config;
      const nextConfig = migrateConfig({
        ...config,
        ...patch,
      });

      setConfig(nextConfig);
      setError(null);

      try {
        await sp.web.update({
          AllProperties: {
            [CONFIG_KEY]: JSON.stringify(nextConfig),
          },
        });
      } catch (caughtError: unknown) {
        setConfig(previousConfig);
        setError(
          caughtError instanceof Error ? caughtError.message : 'Failed to save navigation config.'
        );
        throw caughtError;
      }
    },
    [config, sp]
  );

  return {
    config,
    saveConfig,
    loading,
    error,
  };
}
