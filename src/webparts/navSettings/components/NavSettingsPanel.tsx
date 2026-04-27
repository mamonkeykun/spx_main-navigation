import * as React from 'react';
import {
  ChoiceGroup,
  Dropdown,
  type IDropdownOption,
  MessageBar,
  MessageBarType,
  Spinner,
  TextField,
  Toggle,
} from '@fluentui/react';
import type { NavConfig, FontSize, LogoSize } from '../../../extensions/topNavigation/types/navTypes';
import { validateSourceUrl } from '../../../extensions/topNavigation/utils/validateSourceUrl';
import CrossSiteSettings from './CrossSiteSettings';
import { debounce } from '../utils/debounce';
import styles from './NavSettingsPanel.module.css';

interface NavSettingsPanelProps {
  config: NavConfig;
  onSave: (patch: Partial<NavConfig>) => Promise<void>;
  saving: boolean;
  error: string | null;
}

const FONT_OPTIONS: IDropdownOption[] = [{ key: 'system-ui, sans-serif', text: 'system-ui' }, { key: "'Segoe UI', sans-serif", text: "'Segoe UI'" }, { key: 'Georgia', text: 'Georgia' }, { key: "'Times New Roman'", text: "'Times New Roman'" }, { key: "'Courier New'", text: "'Courier New'" }, { key: "'BIZ UDPGothic'", text: "'BIZ UDPGothic'" }, { key: "'Noto Sans JP'", text: "'Noto Sans JP'" }];

type ColorFieldKey = 'backgroundColor' | 'textColor' | 'hoverColor' | 'accentColor';

const LOGO_SIZE_OPTIONS = [{ key: 'small', text: '小' }, { key: 'medium', text: '中' }, { key: 'large', text: '大' }];

const FONT_SIZE_OPTIONS = [{ key: 'sm', text: '小' }, { key: 'md', text: '中' }, { key: 'lg', text: '大' }];

const COLOR_FIELDS = [{ key: 'backgroundColor' as const, label: '背景色' }, { key: 'textColor' as const, label: 'テキスト色' }, { key: 'hoverColor' as const, label: 'ホバー色' }, { key: 'accentColor' as const, label: 'アクセント色' }];

/**
 * Renders the visual settings form for navigation configuration.
 */
export default function NavSettingsPanel({ config, onSave, saving, error }: NavSettingsPanelProps): JSX.Element {
  const [logoUrl, setLogoUrl] = React.useState<string>(config.logoUrl);
  const [sourceUrl, setSourceUrl] = React.useState<string>(config.sourceUrl);
  const [sourceUrlError, setSourceUrlError] = React.useState<string | undefined>(undefined);
  const [testMessage, setTestMessage] = React.useState<string | null>(null);
  const [testSucceeded, setTestSucceeded] = React.useState<boolean>(false);
  const [isTestingConnection, setIsTestingConnection] = React.useState<boolean>(false);
  const [colors, setColors] = React.useState<Record<ColorFieldKey, string>>({ backgroundColor: config.backgroundColor, textColor: config.textColor, hoverColor: config.hoverColor, accentColor: config.accentColor });

  React.useEffect(() => {
    setLogoUrl(config.logoUrl);
    setSourceUrl(config.sourceUrl);
    setSourceUrlError(validateSourceUrl(config.sourceUrl) ?? undefined);
    setColors({ backgroundColor: config.backgroundColor, textColor: config.textColor, hoverColor: config.hoverColor, accentColor: config.accentColor });
  }, [config]);

  const debouncedLogoSave = React.useMemo(
    // DECISION: Auto-save via debounce avoids a redundant explicit save button for singleton config.
    () => debounce((value: string) => void onSave({ logoUrl: value }), 500),
    [onSave]
  );
  const debouncedSourceSave = React.useMemo(
    () => debounce((value: string) => void onSave({ sourceUrl: value }), 1000),
    [onSave]
  );
  const debouncedColorSave = React.useMemo(
    () =>
      debounce((key: ColorFieldKey, value: string) => {
        void onSave({ [key]: value } as Pick<NavConfig, ColorFieldKey>);
      }, 500),
    [onSave]
  );
  const handleConnectionTest = async (): Promise<void> => {
    const validationError = validateSourceUrl(sourceUrl);
    if (validationError) {
      setSourceUrlError(validationError);
      setTestMessage(validationError);
      setTestSucceeded(false);
      return;
    }

    if (!sourceUrl) {
      return;
    }

    setIsTestingConnection(true);
    setTestMessage(null);
    setTestSucceeded(false);

    try {
      const response = await fetch(
        `${sourceUrl.replace(/\/$/, '')}/_api/web/lists/getbytitle('Navigation')/items?$top=5000`,
        {
          headers: { Accept: 'application/json;odata=nometadata' },
        }
      );

      if (!response.ok) {
        throw new Error('connect failed');
      }

      const payload = (await response.json()) as { value?: unknown[] };
      const itemCount = payload.value?.length ?? 0;
      setTestMessage(`接続成功 — ${itemCount}件のナビアイテムが見つかりました`);
      setTestSucceeded(true);
    } catch {
      setTestMessage('接続に失敗しました');
      setTestSucceeded(false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className={styles.panel}>
      {saving ? <Spinner label="保存中..." /> : null}
      {error ? <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar> : null}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>ロゴ設定</div>
        <TextField label="ロゴURL" value={logoUrl} onChange={(_, value) => {
          const nextValue = value ?? '';
          setLogoUrl(nextValue);
          debouncedLogoSave(nextValue);
        }} />
        <ChoiceGroup label="ロゴサイズ" selectedKey={config.logoSize} options={LOGO_SIZE_OPTIONS} onChange={(_, option) => option ? void onSave({ logoSize: option.key as LogoSize }) : undefined} />
      </section>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>カラー設定</div>
        {COLOR_FIELDS.map((field) => (
          <div key={field.key} className={styles.colorRow}>
            <div className={styles.colorLabel}>{field.label}</div>
            <input className={styles.colorInput} type="color" value={colors[field.key]} aria-label={field.label} onChange={(event) => {
              const nextValue = event.target.value;
              setColors((current) => ({ ...current, [field.key]: nextValue }));
              debouncedColorSave(field.key, nextValue);
            }} />
            <TextField className={styles.colorText} value={colors[field.key]} onChange={(_, value) => {
              const nextValue = value ?? '';
              setColors((current) => ({ ...current, [field.key]: nextValue }));
              debouncedColorSave(field.key, nextValue);
            }} />
          </div>
        ))}
      </section>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>フォント設定</div>
        <Dropdown label="フォントファミリー" selectedKey={config.fontFamily} options={FONT_OPTIONS} onChange={(_, option) => option ? void onSave({ fontFamily: String(option.key) }) : undefined} />
        <ChoiceGroup label="フォントサイズ" selectedKey={config.fontSize} options={FONT_SIZE_OPTIONS} onChange={(_, option) => option ? void onSave({ fontSize: option.key as FontSize }) : undefined} />
      </section>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>レイアウト設定</div>
        <Toggle label="ドロップダウン方向" onText="横並び" offText="縦並び" checked={config.dropdownLayout === 'horizontal'} onChange={(_, checked) => void onSave({ dropdownLayout: checked ? 'horizontal' : 'vertical' })} />
        <Toggle label="パンくずリストを表示" checked={config.showBreadcrumb} onChange={(_, checked) => void onSave({ showBreadcrumb: Boolean(checked) })} />
        {config.showBreadcrumb ? <ChoiceGroup label="パンくずサイズ" selectedKey={config.breadcrumbFontSize} options={FONT_SIZE_OPTIONS} onChange={(_, option) => option ? void onSave({ breadcrumbFontSize: option.key as FontSize }) : undefined} /> : null}
        <Toggle label="SharePointナビを非表示" checked={config.hideSharePointNav} onChange={(_, checked) => void onSave({ hideSharePointNav: Boolean(checked) })} />
        <Toggle label="言語ピッカーを表示" checked={config.showLanguagePicker} onChange={(_, checked) => void onSave({ showLanguagePicker: Boolean(checked) })} />
      </section>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>クロスサイト設定</div>
        <CrossSiteSettings
          sourceUrl={sourceUrl}
          sourceUrlError={sourceUrlError}
          isTestingConnection={isTestingConnection}
          testMessage={testMessage}
          testSucceeded={testSucceeded}
          onTest={handleConnectionTest}
          onChange={(nextValue) => {
            setSourceUrl(nextValue);
            const validationError = validateSourceUrl(nextValue);
            setSourceUrlError(validationError ?? undefined);
            setTestMessage(null);
            if (!validationError) {
              debouncedSourceSave(nextValue);
            }
          }}
        />
      </section>
    </div>
  );
}
