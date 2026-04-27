import * as React from 'react';
import {
  Checkbox,
  DefaultButton,
  MessageBar,
  MessageBarType,
  Panel,
  PanelType,
  PrimaryButton,
  Spinner,
  Toggle,
} from '@fluentui/react';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { createSettingsSp, loadSiteGroups, type SiteGroupInfo } from '../utils/navSettingsSp';
import styles from './PermissionEditor.module.css';

interface PermissionEditorProps {
  context: WebPartContext;
  targetType: 'folder' | 'item';
  targetId: number;
  currentGroups: string[];
  onSave: (groups: string[]) => Promise<void>;
  onDismiss: () => void;
}

/**
 * Renders the targeting editor in a side panel.
 */
export default function PermissionEditor({
  context,
  targetType,
  targetId,
  currentGroups,
  onSave,
  onDismiss,
}: PermissionEditorProps): JSX.Element {
  const sp = React.useMemo(() => createSettingsSp(context), [context]);
  const [groups, setGroups] = React.useState<SiteGroupInfo[]>([]);
  const [selectedGroups, setSelectedGroups] = React.useState<string[]>(currentGroups);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const showToEveryone = selectedGroups.length === 0;

  React.useEffect(() => {
    let isActive = true;

    const loadGroups = async (): Promise<void> => {
      try {
        const nextGroups = await loadSiteGroups(sp);
        if (isActive) {
          setGroups(nextGroups);
        }
      } catch {
        if (isActive) {
          setError('グループの読み込みに失敗しました');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadGroups();

    return () => {
      isActive = false;
    };
  }, [sp]);

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setError(null);

    try {
      await onSave(selectedGroups);
      onDismiss();
    } catch {
      setError('権限設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      isOpen={true}
      onDismiss={onDismiss}
      // DECISION: A side panel handles long group lists better than a modal dialog in the settings workspace.
      type={PanelType.medium}
      headerText={`権限設定 (${targetType === 'folder' ? 'フォルダ' : 'アイテム'} #${targetId})`}
    >
      <div className={styles.content}>
        {error ? <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar> : null}
        {loading ? <Spinner label="読み込み中..." /> : (
          <>
            <div className={styles.allToggle}>
              <Toggle
                label="全員に表示"
                checked={showToEveryone}
                onChange={(_, checked) => setSelectedGroups(checked ? [] : currentGroups)}
              />
            </div>
            <div className={styles.groupList}>
              {groups.map((group) => (
                <Checkbox
                  key={group.Id}
                  className={styles.groupItem}
                  label={group.Title}
                  checked={selectedGroups.includes(group.LoginName)}
                  disabled={showToEveryone}
                  onChange={(_, checked) => {
                    setSelectedGroups((current) =>
                      checked
                        ? [...current, group.LoginName]
                        : current.filter((loginName) => loginName !== group.LoginName)
                    );
                  }}
                />
              ))}
            </div>
          </>
        )}
        {saving ? <Spinner label="保存中..." /> : null}
        <div>
          <PrimaryButton text={saving ? '保存中...' : '保存'} onClick={() => void handleSave()} disabled={loading || saving} />
          <DefaultButton text="キャンセル" onClick={onDismiss} disabled={saving} />
        </div>
      </div>
    </Panel>
  );
}
