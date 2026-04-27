import * as React from 'react';
import { MessageBar, MessageBarType, Pivot, PivotItem, Spinner } from '@fluentui/react';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import type { NavConfig } from '../../../extensions/topNavigation/types/navTypes';
import NavItemManager from './NavItemManager';
import NavSettingsPanel from './NavSettingsPanel';
import { useNavConfig } from '../../../extensions/topNavigation/hooks/useNavConfig';
import { useNavData } from '../../../extensions/topNavigation/hooks/useNavData';
import styles from './NavSettingsApp.module.css';

interface NavSettingsAppProps {
  context: WebPartContext;
}

/**
 * Renders the settings web part shell and tabs.
 */
export default function NavSettingsApp({ context }: NavSettingsAppProps): JSX.Element {
  const { config, saveConfig, loading, error } = useNavConfig(context);
  const { folders, items, loading: navLoading, error: navError, reload } = useNavData(context);
  const [saving, setSaving] = React.useState<boolean>(false);

  const handleSave = async (patch: Partial<NavConfig>): Promise<void> => {
    setSaving(true);
    try {
      await saveConfig(patch);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner label="読み込み中..." />;
  }

  if (error || navError) {
    return <MessageBar messageBarType={MessageBarType.error}>{error ?? navError}</MessageBar>;
  }

  return (
    <div className={styles.app}>
      <h2 className={styles.title}>Top Navigation 設定</h2>
      <Pivot>
        <PivotItem headerText="ビジュアル設定">
          <NavSettingsPanel config={config} onSave={handleSave} saving={saving} error={error} />
        </PivotItem>
        <PivotItem headerText="ナビゲーション管理">
          {navLoading ? <Spinner label="読み込み中..." /> : (
            <NavItemManager context={context} folders={folders} items={items} onReload={reload} />
          )}
        </PivotItem>
      </Pivot>
    </div>
  );
}
