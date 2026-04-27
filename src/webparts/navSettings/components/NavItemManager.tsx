import * as React from 'react';
import {
  Dialog,
  DefaultButton,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Spinner,
} from '@fluentui/react';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import type { NavFolder, NavItem } from '../../../extensions/topNavigation/types/navTypes';
import FolderPanel from './FolderPanel';
import ItemPanel from './ItemPanel';
import PermissionEditor from './PermissionEditor';
import {
  createFolder,
  createItem,
  createSettingsSp,
  deleteFolder,
  deleteItem,
  reorderItems,
  saveAllowedGroups,
  updateFolder,
  updateItem,
  type ItemDraft,
} from '../utils/navSettingsSp';
import styles from './NavItemManager.module.css';

interface NavItemManagerProps {
  context: WebPartContext;
  folders: NavFolder[];
  items: NavItem[];
  onReload: () => void;
}

interface PermissionTarget {
  targetType: 'folder' | 'item';
  targetId: number;
  currentGroups: string[];
}

interface DeleteTarget {
  targetType: 'folder' | 'item';
  targetId: number;
}

/**
 * Coordinates folder/item CRUD, reorder operations, and permission editing.
 */
export default function NavItemManager({
  context,
  folders,
  items,
  onReload,
}: NavItemManagerProps): JSX.Element {
  const sp = React.useMemo(() => createSettingsSp(context), [context]);
  const [selectedFolderId, setSelectedFolderId] = React.useState<number | 'top'>('top');
  const [isOperating, setIsOperating] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [permissionTarget, setPermissionTarget] = React.useState<PermissionTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget | null>(null);
  const selectedItems = React.useMemo(
    () => items.filter((item) => (selectedFolderId === 'top' ? item.folderId == null : item.folderId === selectedFolderId)),
    [items, selectedFolderId]
  );

  React.useEffect(() => {
    if (!error) {
      return;
    }
    const timer = window.setTimeout(() => setError(null), 5000);
    return () => window.clearTimeout(timer);
  }, [error]);

  const runOperation = async (operation: () => Promise<void>, errorMessage: string): Promise<void> => {
    setIsOperating(true);
    setError(null);
    try {
      await operation();
      onReload();
    } catch {
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsOperating(false);
    }
  };

  const selectedTitle = selectedFolderId === 'top'
    ? 'トップレベル'
    : folders.find((folder) => folder.id === selectedFolderId)?.title ?? 'フォルダ';

  return (
    <div>
      {error ? <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar> : null}
      {isOperating ? <Spinner label="処理中..." /> : null}
      <div className={styles.manager}>
        <div className={styles.folderPanel}>
          <FolderPanel
            folders={folders}
            selectedFolderId={selectedFolderId}
            disabled={isOperating}
            onSelectFolder={setSelectedFolderId}
            onCreateFolder={(title) => runOperation(() => createFolder(sp, title, folders.length * 10), 'フォルダの作成に失敗しました')}
            onUpdateFolder={(folderId, title) => runOperation(() => updateFolder(sp, folderId, title), 'アイテムの更新に失敗しました')}
            onOpenPermissions={(folderId, groups) => setPermissionTarget({ targetType: 'folder', targetId: folderId, currentGroups: groups })}
            onConfirmDelete={(folderId) => setDeleteTarget({ targetType: 'folder', targetId: folderId })}
          />
        </div>
        <div className={styles.itemPanel}>
          <ItemPanel
            title={selectedTitle}
            items={selectedItems}
            disabled={isOperating}
            onCreateItem={(draft: ItemDraft) => runOperation(() => createItem(sp, draft, selectedFolderId === 'top' ? undefined : selectedFolderId, selectedItems.length * 10), 'アイテムの作成に失敗しました')}
            onUpdateItem={(itemId, draft) => runOperation(() => updateItem(sp, itemId, draft), 'アイテムの更新に失敗しました')}
            onOpenPermissions={(itemId, groups) => setPermissionTarget({ targetType: 'item', targetId: itemId, currentGroups: groups })}
            onConfirmDelete={(itemId) => setDeleteTarget({ targetType: 'item', targetId: itemId })}
            onReorder={(draggedId, targetId) => runOperation(async () => {
              // DECISION: Use native HTML5 drag and drop to avoid bringing a heavy DnD dependency into SPFx.
              const reorderedItems = [...selectedItems];
              const draggedIndex = reorderedItems.findIndex((item) => item.id === draggedId);
              const targetIndex = reorderedItems.findIndex((item) => item.id === targetId);
              const [draggedItem] = reorderedItems.splice(draggedIndex, 1);
              reorderedItems.splice(targetIndex, 0, draggedItem);
              await reorderItems(sp, reorderedItems);
            }, 'アイテムの更新に失敗しました')}
          />
        </div>
      </div>
      {permissionTarget ? (
        <PermissionEditor
          context={context}
          targetType={permissionTarget.targetType}
          targetId={permissionTarget.targetId}
          currentGroups={permissionTarget.currentGroups}
          onSave={(groups) => runOperation(() => saveAllowedGroups(sp, permissionTarget.targetId, groups), '権限設定の保存に失敗しました')}
          onDismiss={() => setPermissionTarget(null)}
        />
      ) : null}
      {deleteTarget ? (
        <Dialog
          hidden={false}
          dialogContentProps={{ title: '削除の確認', subText: 'この操作は元に戻せません。' }}
          onDismiss={() => setDeleteTarget(null)}
        >
          <DefaultButton text="キャンセル" onClick={() => setDeleteTarget(null)} />
          <PrimaryButton
            text="削除"
            onClick={() =>
              void runOperation(async () => {
                if (deleteTarget.targetType === 'folder') {
                  const childIds = items
                    .filter((item) => item.folderId === deleteTarget.targetId)
                    .map((item) => item.id);
                  await deleteFolder(sp, deleteTarget.targetId, childIds);
                } else {
                  await deleteItem(sp, deleteTarget.targetId);
                }
                setDeleteTarget(null);
              }, deleteTarget.targetType === 'folder' ? 'フォルダの削除に失敗しました' : 'アイテムの削除に失敗しました').catch(() => undefined)
            }
          />
        </Dialog>
      ) : null}
    </div>
  );
}
