import * as React from 'react';
import { useState, useCallback } from 'react';
import type { NavConfig } from '../types/navTypes';
import { ColorPicker } from './ColorPicker';
import { SizeSlider } from './SizeSlider';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  config: NavConfig;
  onSave: (patch: Partial<NavConfig>) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  onSave,
  onClose,
  saving,
}) => {
  const [draft, setDraft] = useState<NavConfig>({ ...config });
  const [logoPreview, setLogoPreview] = useState<string>(config.logoUrl ?? '');

  const update = useCallback(
    <K extends keyof NavConfig>(key: K, value: NavConfig[K]) => {
      setDraft((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    await onSave(draft);
    onClose();
  }, [draft, onClose, onSave]);

  return (
    <div className={styles.panel} role="dialog" aria-label="ナビゲーション設定">
      <div className={styles.header}>
        <span className={styles.title}>ナビゲーション設定</span>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="閉じる"
          type="button"
        >
          ✕
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>ロゴ</label>
          <div className={styles.logoArea}>
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="ロゴプレビュー"
                className={styles.logoPreview}
              />
            ) : null}
            <input
              type="text"
              className={styles.logoInput}
              value={draft.logoUrl ?? ''}
              placeholder="ロゴ画像のURLを入力"
              aria-label="ロゴ画像URL"
              onChange={(event) => {
                update('logoUrl', event.target.value);
                setLogoPreview(event.target.value);
              }}
            />
          </div>
        </div>
        <ColorPicker
          label="ナビゲーション背景色"
          value={draft.backgroundColor}
          onChange={(value) => update('backgroundColor', value)}
        />
        <ColorPicker
          label="ナビゲーションリンクの色"
          value={draft.textColor}
          onChange={(value) => update('textColor', value)}
        />
        <ColorPicker
          label="ホバー時の色"
          value={draft.hoverColor}
          onChange={(value) => update('hoverColor', value)}
        />
        <SizeSlider
          label="ナビゲーションフォントサイズ"
          value={draft.fontSize}
          min={10}
          max={32}
          onChange={(value) => update('fontSize', value)}
        />
        <SizeSlider
          label="ロゴ画像サイズ"
          value={draft.logoSize}
          min={20}
          max={80}
          onChange={(value) => update('logoSize', value)}
        />
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>SharePointヘッダーナビを非表示</span>
          <button
            type="button"
            role="switch"
            aria-checked={draft.hideSharePointNav}
            className={`${styles.toggle} ${draft.hideSharePointNav ? styles.toggleOn : ''}`}
            onClick={() => update('hideSharePointNav', !draft.hideSharePointNav)}
            aria-label="SharePointヘッダーナビを非表示"
          >
            <span className={styles.toggleThumb} />
          </button>
        </div>
      </div>
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving}
          aria-label="設定を保存"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
};
