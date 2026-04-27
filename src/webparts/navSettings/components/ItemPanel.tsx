import * as React from 'react';
import { Checkbox, ContextualMenu, DefaultButton, TextField } from '@fluentui/react';
import type { NavItem } from '../../../extensions/topNavigation/types/navTypes';
import type { ItemDraft } from '../utils/navSettingsSp';
import styles from './ItemPanel.module.css';

interface ItemPanelProps {
  title: string;
  items: NavItem[];
  disabled: boolean;
  onCreateItem: (draft: ItemDraft) => Promise<void>;
  onUpdateItem: (itemId: number, draft: ItemDraft) => Promise<void>;
  onOpenPermissions: (itemId: number, groups: string[]) => void;
  onConfirmDelete: (itemId: number) => void;
  onReorder: (draggedId: number, targetId: number) => Promise<void>;
}

const EMPTY_DRAFT: ItemDraft = { title: '', url: '', description: '', openInNewTab: false };

/**
 * Renders the item list, inline item editor, and drag-and-drop reordering.
 */
export default function ItemPanel({
  title,
  items,
  disabled,
  onCreateItem,
  onUpdateItem,
  onOpenPermissions,
  onConfirmDelete,
  onReorder,
}: ItemPanelProps): JSX.Element {
  const [editingItemId, setEditingItemId] = React.useState<number | 'new' | null>(null);
  const [draft, setDraft] = React.useState<ItemDraft>(EMPTY_DRAFT);
  const [menuTarget, setMenuTarget] = React.useState<HTMLElement | null>(null);
  const [menuItemId, setMenuItemId] = React.useState<number | null>(null);
  const draggedItemIdRef = React.useRef<number | null>(null);
  const [dragOverItemId, setDragOverItemId] = React.useState<number | null>(null);

  const submitDraft = async (itemId?: number): Promise<void> => {
    if (!draft.title.trim() || !draft.url.trim()) {
      setEditingItemId(null);
      setDraft(EMPTY_DRAFT);
      return;
    }
    try {
      if (typeof itemId === 'number') {
        await onUpdateItem(itemId, draft);
      } else {
        await onCreateItem(draft);
      }
    } catch {
      return;
    }
    setEditingItemId(null);
    setDraft(EMPTY_DRAFT);
  };

  const renderEditor = (itemId?: number): JSX.Element => (
    <div className={styles.inlineInput}>
      <TextField label="ラベル" value={draft.title} onChange={(_, value) => setDraft((current) => ({ ...current, title: value ?? '' }))} />
      <TextField label="URL" value={draft.url} onChange={(_, value) => setDraft((current) => ({ ...current, url: value ?? '' }))} />
      <TextField label="説明" value={draft.description ?? ''} onChange={(_, value) => setDraft((current) => ({ ...current, description: value ?? '' }))} />
      <Checkbox label="新しいタブで開く" checked={draft.openInNewTab} onChange={(_, checked) => setDraft((current) => ({ ...current, openInNewTab: Boolean(checked) }))} />
      <div>
        <DefaultButton
          text="保存"
          onClick={() => void submitDraft(itemId).catch(() => undefined)}
          disabled={disabled}
        />
        <DefaultButton text="キャンセル" onClick={() => { setEditingItemId(null); setDraft(EMPTY_DRAFT); }} />
      </div>
    </div>
  );

  return (
    <div>
      <div className={styles.panelHeader}>
        <div>{title}</div>
        <DefaultButton text="+ アイテム追加" onClick={() => { setDraft(EMPTY_DRAFT); setEditingItemId('new'); }} disabled={disabled} />
      </div>
      {editingItemId === 'new' ? renderEditor() : null}
      {items.map((item) => {
        const rowClassName = dragOverItemId === item.id ? `${styles.itemRow} ${styles.itemDragOver}` : styles.itemRow;
        const isEditing = editingItemId === item.id;

        return isEditing ? (
          <div key={item.id}>{renderEditor(item.id)}</div>
        ) : (
          <div
            key={item.id}
            className={draggedItemIdRef.current === item.id ? `${rowClassName} ${styles.itemDragging}` : rowClassName}
            draggable={true}
            onDragStart={() => { draggedItemIdRef.current = item.id; }}
            onDragOver={(event) => { event.preventDefault(); setDragOverItemId(item.id); }}
            onDragLeave={() => setDragOverItemId(null)}
            onDrop={() => {
              const draggedId = draggedItemIdRef.current;
              setDragOverItemId(null);
              draggedItemIdRef.current = null;
              if (draggedId && draggedId !== item.id) {
                void onReorder(draggedId, item.id).catch(() => undefined);
              }
            }}
          >
            <div>
              <div>{item.title}</div>
              <div className={styles.url}>{item.url}</div>
            </div>
            <span className={styles.badge}>{item.openInNewTab ? '新規タブ' : '同一タブ'}</span>
            <button type="button" className={styles.menuButton} aria-label={`${item.title} の操作`} onClick={(event) => {
              setMenuTarget(event.currentTarget);
              setMenuItemId(item.id);
            }}>...</button>
          </div>
        );
      })}
      {menuTarget && menuItemId ? (
        <ContextualMenu
          target={menuTarget}
          items={[
            {
              key: 'edit',
              text: '編集',
              onClick: () => {
                const item = items.find((entry) => entry.id === menuItemId);
                setDraft({
                  title: item?.title ?? '',
                  url: item?.url ?? '',
                  description: item?.description ?? '',
                  openInNewTab: item?.openInNewTab ?? false,
                });
                setEditingItemId(menuItemId);
              },
            },
            {
              key: 'permission',
              text: '権限設定',
              onClick: () => {
                const item = items.find((entry) => entry.id === menuItemId);
                onOpenPermissions(menuItemId, item?.allowedGroups ?? []);
              },
            },
            { key: 'delete', text: '削除', onClick: () => onConfirmDelete(menuItemId) },
          ]}
          onDismiss={() => {
            setMenuTarget(null);
            setMenuItemId(null);
          }}
        />
      ) : null}
    </div>
  );
}
