import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { spfi, SPFx } from '@pnp/sp';
import type { IListItemFormUpdateValue } from '@pnp/sp/lists';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import type { NavFolder, NavItem } from '../types/navTypes';
import { NavItemEditorForm } from './NavItemEditorForm';
import styles from './NavItemEditor.module.css';

interface NavItemEditorProps {
  context: ApplicationCustomizerContext;
  folders: NavFolder[];
  items: NavItem[];
  onClose: () => void;
  onSaved: () => void;
}

type SelectLinkOption = '新規' | NavItem;

function toFormValues(itemData: {
  Title: string;
  NavUrl: string;
  NavDescription?: string;
  NavOpenInNewTab: boolean;
  NavOrder: number;
}): IListItemFormUpdateValue[] {
  return [
    { FieldName: 'Title', FieldValue: itemData.Title },
    { FieldName: 'NavUrl', FieldValue: itemData.NavUrl },
    { FieldName: 'NavDescription', FieldValue: itemData.NavDescription ?? '' },
    { FieldName: 'NavOpenInNewTab', FieldValue: itemData.NavOpenInNewTab ? '1' : '0' },
    { FieldName: 'NavOrder', FieldValue: String(itemData.NavOrder) },
  ];
}

export const NavItemEditor: React.FC<NavItemEditorProps> = ({
  context,
  folders,
  items,
  onClose,
  onSaved,
}) => {
  const [selectedLink, setSelectedLink] = useState<SelectLinkOption>('新規');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [openInNewWindow, setOpenInNewWindow] = useState(false);
  const [parentFolderId, setParentFolderId] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedLinkValue = selectedLink === '新規' ? '新規' : selectedLink.id;

  useEffect(() => {
    if (selectedLink === '新規') {
      setTitle('');
      setDescription('');
      setUrl('');
      setOpenInNewWindow(false);
      setParentFolderId('');
      setSortOrder(0);
      return;
    }

    setTitle(selectedLink.label);
    setDescription(selectedLink.description ?? '');
    setUrl(selectedLink.url);
    setOpenInNewWindow(selectedLink.openInNewTab);
    setSortOrder(selectedLink.order);
    const matchedFolder = folders.find(
      (folder) => folder.folderPath === selectedLink.parentFolderPath
    );
    setParentFolderId(matchedFolder?.id ?? '');
  }, [folders, selectedLink]);

  const handleSelectLinkChange = useCallback(
    (value: string) => {
      if (value === '新規') {
        setSelectedLink('新規');
        return;
      }
      const found = items.find((item) => item.id === value);
      if (found) {
        setSelectedLink(found);
      }
    },
    [items]
  );

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setError('タイトルは必須です');
      return;
    }
    if (!url.trim()) {
      setError('URLは必須です');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const sp = spfi().using(SPFx(context));
      const list = sp.web.lists.getByTitle('Navigation');
      const parentInfos = await list.getParentInfos();
      const rootFolderPath = parentInfos.List.RootFolderServerRelativeUrl;
      const parentFolder = folders.find((folder) => folder.id === parentFolderId);
      if (parentFolderId && !parentFolder) {
        setError('選択したフォルダが見つかりません');
        return;
      }
      const targetFolderPath = parentFolder?.folderPath ?? rootFolderPath;
      const itemData = {
        Title: title.trim(),
        NavUrl: url.trim(),
        NavDescription: description.trim() || undefined,
        NavOpenInNewTab: openInNewWindow,
        NavOrder: sortOrder,
      };

      if (selectedLink === '新規') {
        if (parentFolder) {
          // DECISION: Use native SharePoint folder paths so new items land directly in the selected folder.
          await list.addValidateUpdateItemUsingPath(toFormValues(itemData), targetFolderPath);
        } else {
          await list.items.add(itemData);
        }
      } else {
        const currentItem = await list.items
          .getById(selectedLink.spItemId)
          .select('FileRef', 'FileLeafRef', 'FileDirRef')<{
            FileRef: string;
            FileLeafRef: string;
            FileDirRef: string;
          }>();

        await list.items.getById(selectedLink.spItemId).update(itemData);

        if (currentItem.FileDirRef !== targetFolderPath) {
          const destinationPath = `${targetFolderPath}/${currentItem.FileLeafRef}`;
          await sp.web.getFileByServerRelativePath(currentItem.FileRef).moveByPath(destinationPath, true);
        }
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('move') || message.includes('Path')) {
        setError('フォルダへの移動に失敗しました。フォルダが存在するか確認してください。');
      } else {
        setError('保存に失敗しました。もう一度お試しください。');
      }
      console.error('[TopNav] NavItemEditor save error:', err);
    } finally {
      setSaving(false);
    }
  }, [context, description, folders, onClose, onSaved, openInNewWindow, parentFolderId, selectedLink, sortOrder, title, url]);

  return (
    <div className={styles.panel} role="dialog" aria-label="ナビゲーションを追加・編集">
      <div className={styles.header}>
        <span className={styles.title}>ナビゲーションを追加・編集</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="閉じる" type="button">
          ✕
        </button>
      </div>
      <NavItemEditorForm
        selectedLinkValue={selectedLinkValue}
        allItems={items}
        title={title}
        description={description}
        url={url}
        openInNewWindow={openInNewWindow}
        parentFolderId={parentFolderId}
        sortOrder={sortOrder}
        folders={folders}
        error={error}
        onSelectLinkChange={handleSelectLinkChange}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onUrlChange={setUrl}
        onOpenInNewWindowChange={setOpenInNewWindow}
        onParentFolderIdChange={setParentFolderId}
        onSortOrderChange={setSortOrder}
      />
      <div className={styles.footer}>
        <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving} aria-label="保存">
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
};
