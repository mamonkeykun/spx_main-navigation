import * as React from 'react';
import type { NavFolder, NavItem } from '../types/navTypes';
import styles from './NavItemEditor.module.css';

interface NavItemEditorFormProps {
  selectedLinkValue: string;
  allItems: NavItem[];
  title: string;
  description: string;
  url: string;
  openInNewWindow: boolean;
  parentFolderId: string;
  sortOrder: number;
  folders: NavFolder[];
  error: string | null;
  onSelectLinkChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onOpenInNewWindowChange: (value: boolean) => void;
  onParentFolderIdChange: (value: string) => void;
  onSortOrderChange: (value: number) => void;
}

/**
 * ナビアイテム編集フォーム。
 */
export const NavItemEditorForm: React.FC<NavItemEditorFormProps> = ({
  selectedLinkValue,
  allItems,
  title,
  description,
  url,
  openInNewWindow,
  parentFolderId,
  sortOrder,
  folders,
  error,
  onSelectLinkChange,
  onTitleChange,
  onDescriptionChange,
  onUrlChange,
  onOpenInNewWindowChange,
  onParentFolderIdChange,
  onSortOrderChange,
}) => (
  <div className={styles.body}>
    {error ? <div className={styles.errorMsg} role="alert">{error}</div> : null}
    <div className={styles.field}>
      <label className={styles.fieldLabel}>リンクを選択</label>
      <select
        className={styles.select}
        value={selectedLinkValue}
        onChange={(event) => onSelectLinkChange(event.target.value)}
        aria-label="リンクを選択"
      >
        <option value="新規">新規</option>
        {allItems.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        タイトル <span className={styles.required}>*</span>
      </label>
      <input
        type="text"
        className={styles.input}
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        aria-label="タイトル（必須）"
        aria-required="true"
      />
    </div>
    <div className={styles.field}>
      <label className={styles.fieldLabel}>説明</label>
      <textarea
        className={styles.textarea}
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        rows={3}
        aria-label="説明"
      />
    </div>
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        URL <span className={styles.required}>*</span>
      </label>
      <input
        type="url"
        className={styles.input}
        value={url}
        onChange={(event) => onUrlChange(event.target.value)}
        aria-label="URL（必須）"
        aria-required="true"
      />
    </div>
    <div className={styles.checkboxRow}>
      <input
        type="checkbox"
        id="openInNewWindow"
        checked={openInNewWindow}
        onChange={(event) => onOpenInNewWindowChange(event.target.checked)}
      />
      <label htmlFor="openInNewWindow">新しいウィンドウで開く</label>
    </div>
    <div className={styles.field}>
      <label className={styles.fieldLabel}>親フォルダ</label>
      <select
        className={styles.select}
        value={parentFolderId}
        onChange={(event) => onParentFolderIdChange(event.target.value)}
        aria-label="親フォルダ"
      >
        <option value="">（なし - トップレベル）</option>
        {folders.map((folder) => (
          <option key={folder.id} value={folder.id}>
            {folder.label}
          </option>
        ))}
      </select>
    </div>
    <div className={styles.field}>
      <label className={styles.fieldLabel}>並び順（数値）</label>
      <input
        type="number"
        className={styles.input}
        value={sortOrder}
        onChange={(event) => onSortOrderChange(Number(event.target.value))}
        aria-label="並び順"
      />
    </div>
  </div>
);
