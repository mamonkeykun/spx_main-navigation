import * as React from 'react';
import { MessageBar, MessageBarType, Spinner } from '@fluentui/react';
import type { WebPartContext } from '@microsoft/sp-webpart-base';

import { SettingsPanel } from '../../../extensions/topNavigation/components/SettingsPanel';
import { NavItemEditor } from '../../../extensions/topNavigation/components/NavItemEditor';
import { useNavConfig } from '../../../extensions/topNavigation/hooks/useNavConfig';
import { useNavData } from '../../../extensions/topNavigation/hooks/useNavData';
import styles from './NavSettingsApp.module.css';

interface NavSettingsAppProps {
  context: WebPartContext;
}

export default function NavSettingsApp({ context }: NavSettingsAppProps): JSX.Element {
  const { config, saveConfig, loading, error } = useNavConfig(context);
  const {
    folders,
    items,
    loading: navLoading,
    error: navError,
    reload,
  } = useNavData(context);
  const [settingsOpen, setSettingsOpen] = React.useState<boolean>(true);
  const [editorOpen, setEditorOpen] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState<boolean>(false);

  const handleSave = React.useCallback(
    async (patch: Partial<typeof config>) => {
      setSaving(true);
      try {
        await saveConfig(patch);
      } finally {
        setSaving(false);
      }
    },
    [config, saveConfig]
  );

  if (loading || navLoading) {
    return <Spinner label="ナビゲーション設定を読み込み中..." />;
  }

  if (error || navError) {
    return (
      <MessageBar messageBarType={MessageBarType.error}>
        {error ?? navError}
      </MessageBar>
    );
  }

  return (
    <section className={styles.app}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Origami 互換の設定画面</p>
          <h2 className={styles.title}>ナビゲーション設定</h2>
          <p className={styles.description}>
            見た目の設定とリンク編集はこの Web パーツから行います。上部ナビの常時表示は
            `scripts/install-customizer.ps1` で有効化してください。
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryAction}
            onClick={() => {
              setSettingsOpen(true);
              setEditorOpen(false);
            }}
          >
            ⚙ 表示設定
          </button>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() => {
              setEditorOpen(true);
              setSettingsOpen(false);
            }}
          >
            🧭 ナビ編集
          </button>
        </div>
      </div>
      <div className={styles.summary}>
        <span>検出フォルダ: {folders.length}</span>
        <span>検出リンク: {items.length}</span>
        <span>ロゴ: {config.logoUrl ? '設定済み' : '未設定'}</span>
      </div>
      <div className={styles.helpBox}>
        フォルダは SharePoint の `Navigation` リストで作成してください。各フォルダがトップレベルの
        ナビ見出しとして表示されます。
      </div>
      <div className={styles.stage}>
        {settingsOpen ? (
          <div className={styles.panelHost}>
            <SettingsPanel
              config={config}
              onSave={handleSave}
              onClose={() => setSettingsOpen(false)}
              saving={saving}
            />
          </div>
        ) : null}
        {editorOpen ? (
          <div className={styles.panelHost}>
            <NavItemEditor
              context={context}
              folders={folders}
              items={items}
              onClose={() => setEditorOpen(false)}
              onSaved={reload}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
