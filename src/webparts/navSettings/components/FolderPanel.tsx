import * as React from 'react';
import { ContextualMenu, DefaultButton, TextField } from '@fluentui/react';
import type { NavFolder } from '../../../extensions/topNavigation/types/navTypes';
import styles from './FolderPanel.module.css';

interface FolderPanelProps {
  folders: NavFolder[];
  selectedFolderId: number | 'top';
  disabled: boolean;
  onSelectFolder: (folderId: number | 'top') => void;
  onCreateFolder: (title: string) => Promise<void>;
  onUpdateFolder: (folderId: number, title: string) => Promise<void>;
  onOpenPermissions: (folderId: number, groups: string[]) => void;
  onConfirmDelete: (folderId: number) => void;
}

/**
 * Renders the folder list and folder-level actions.
 */
export default function FolderPanel({
  folders,
  selectedFolderId,
  disabled,
  onSelectFolder,
  onCreateFolder,
  onUpdateFolder,
  onOpenPermissions,
  onConfirmDelete,
}: FolderPanelProps): JSX.Element {
  const [isAdding, setIsAdding] = React.useState<boolean>(false);
  const [editingFolderId, setEditingFolderId] = React.useState<number | null>(null);
  const [draftTitle, setDraftTitle] = React.useState<string>('');
  const [menuTarget, setMenuTarget] = React.useState<HTMLElement | null>(null);
  const [menuFolderId, setMenuFolderId] = React.useState<number | null>(null);

  const saveFolder = async (folderId?: number): Promise<void> => {
    const nextTitle = draftTitle.trim();
    if (!nextTitle) {
      setIsAdding(false);
      setEditingFolderId(null);
      return;
    }
    if (typeof folderId === 'number') {
      try {
        await onUpdateFolder(folderId, nextTitle);
      } catch {
        return;
      }
      setEditingFolderId(null);
    } else {
      try {
        await onCreateFolder(nextTitle);
      } catch {
        return;
      }
      setIsAdding(false);
    }
    setDraftTitle('');
  };

  return (
    <div>
      <div className={styles.panelHeader}>
        <div>フォルダ</div>
        <DefaultButton text="+ フォルダ追加" onClick={() => { setDraftTitle(''); setIsAdding(true); }} disabled={disabled} />
      </div>
      <div className={selectedFolderId === 'top' ? `${styles.folderRow} ${styles.folderRowActive}` : styles.folderRow}>
        <button
          type="button"
          className={styles.folderSelectButton}
          aria-label="トップレベルを選択"
          onClick={() => onSelectFolder('top')}
        >
          トップレベル
        </button>
      </div>
      {folders.map((folder) => (
        <div key={folder.id} className={selectedFolderId === folder.id ? `${styles.folderRow} ${styles.folderRowActive}` : styles.folderRow}>
          {editingFolderId === folder.id ? (
            <TextField
              value={draftTitle}
              autoFocus={true}
              onChange={(_, value) => setDraftTitle(value ?? '')}
              onBlur={() => void saveFolder(folder.id).catch(() => undefined)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void saveFolder(folder.id).catch(() => undefined);
                }
                if (event.key === 'Escape') {
                  setEditingFolderId(null);
                }
              }}
            />
          ) : (
            <>
              <button
                type="button"
                className={styles.folderSelectButton}
                aria-label={`${folder.title} を選択`}
                onClick={() => onSelectFolder(folder.id)}
              >
                {folder.title}
              </button>
              <span className={styles.badge}>{folder.items.length}</span>
              <button type="button" className={styles.menuButton} aria-label={`${folder.title} の操作`} onClick={(event) => {
                event.stopPropagation();
                setMenuTarget(event.currentTarget);
                setMenuFolderId(folder.id);
              }}>...</button>
            </>
          )}
        </div>
      ))}
      {isAdding ? (
        <div className={styles.inlineInput}>
          <TextField
            value={draftTitle}
            autoFocus={true}
            onChange={(_, value) => setDraftTitle(value ?? '')}
            onBlur={() => void saveFolder().catch(() => undefined)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void saveFolder().catch(() => undefined);
              }
              if (event.key === 'Escape') {
                setIsAdding(false);
              }
            }}
          />
        </div>
      ) : null}
      {menuTarget && menuFolderId ? (
        <ContextualMenu
          target={menuTarget}
          items={[
            {
              key: 'edit',
              text: '編集',
              onClick: () => {
                const folder = folders.find((entry) => entry.id === menuFolderId);
                setDraftTitle(folder?.title ?? '');
                setEditingFolderId(menuFolderId);
              },
            },
            {
              key: 'permission',
              text: '権限設定',
              onClick: () => {
                const folder = folders.find((entry) => entry.id === menuFolderId);
                onOpenPermissions(menuFolderId, folder?.allowedGroups ?? []);
              },
            },
            { key: 'delete', text: '削除', onClick: () => onConfirmDelete(menuFolderId) },
          ]}
          onDismiss={() => {
            setMenuTarget(null);
            setMenuFolderId(null);
          }}
        />
      ) : null}
    </div>
  );
}
