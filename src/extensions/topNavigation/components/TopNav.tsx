import * as React from 'react';
import type { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import Breadcrumb from './Breadcrumb';
import LanguagePicker from './LanguagePicker';
import MobileDrawer from './MobileDrawer';
import NavFolder from './NavFolder';
import NavItemLink from './NavItem';
import NavStructureContext from './NavStructureContext';
import { NavItemEditor } from './NavItemEditor';
import { SettingsPanel } from './SettingsPanel';
import { injectHideSpNav, removeHideSpNav } from '../utils/hideSpNav';
import { useNavConfig } from '../hooks/useNavConfig';
import { useNavData } from '../hooks/useNavData';
import styles from './TopNav.module.css';

interface TopNavProps {
  context: ApplicationCustomizerContext;
}

/**
 * Renders the main application customizer navigation.
 */
export function TopNav({ context }: TopNavProps): JSX.Element | null {
  const {
    config,
    saveConfig,
    loading: configLoading,
    error: configError,
  } = useNavConfig(context);
  const {
    folders,
    items,
    loading: navLoading,
    error: navError,
    reload,
    getItemsForFolder,
    getTopLevelItems,
  } = useNavData(context, config.sourceUrl);
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = React.useState<boolean>(false);
  const [editorOpen, setEditorOpen] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState<boolean>(false);
  const isAdmin =
    (context.pageContext.legacyPageContext as Record<string, unknown> | undefined)?.isSiteAdmin === true;
  const topLevelItems = getTopLevelItems();
  const languageOptions = React.useMemo(() => [{ code: 'ja', label: '日本語' }], []);

  React.useEffect(() => {
    if (!config.hideSharePointNav) {
      removeHideSpNav();
      return;
    }

    injectHideSpNav();

    return () => {
      removeHideSpNav();
    };
  }, [config.hideSharePointNav]);

  const handleSaveConfig = React.useCallback(
    async (patch: Partial<typeof config>) => {
      setSaving(true);
      try {
        await saveConfig(patch);
      } finally {
        setSaving(false);
      }
    },
    [saveConfig]
  );

  if (configLoading || navLoading) {
    return <div className={styles.skeleton} aria-label="ナビゲーション読み込み中" />;
  }

  if (configError || navError) {
    return null;
  }

  return (
    <NavStructureContext.Provider value={folders}>
      <>
        <nav
          className={styles.nav}
          aria-label="メインナビゲーション"
          style={
            {
              '--nav-bg': config.backgroundColor,
              '--nav-text': config.textColor,
              '--nav-hover': config.hoverColor,
              '--nav-font-size': `${config.fontSize}px`,
              '--nav-logo-height': `${config.logoSize}px`,
            } as React.CSSProperties
          }
        >
          {isAdmin ? (
            <div className={styles.adminArea}>
              <button
                type="button"
                className={styles.gearBtn}
                onClick={() => {
                  setSettingsOpen((open) => !open);
                  setEditorOpen(false);
                }}
                aria-label="ナビゲーション設定"
                aria-expanded={settingsOpen}
                aria-haspopup="dialog"
              >
                ⚙
              </button>
              <button
                type="button"
                className={styles.editBtn}
                onClick={() => {
                  setEditorOpen((open) => !open);
                  setSettingsOpen(false);
                }}
                aria-label="ナビゲーションを追加・編集"
                aria-expanded={editorOpen}
                aria-haspopup="dialog"
              >
                ナビゲーションを追加・編集
              </button>
            </div>
          ) : null}
          {config.logoUrl ? <img className={styles.logo} src={config.logoUrl} alt="ロゴ" /> : null}
          <div className={styles.folderRow}>
            {folders.map((folder) => (
              <NavFolder
                key={folder.id}
                folder={folder}
                items={getItemsForFolder(folder)}
                dropdownLayout={config.dropdownLayout}
              />
            ))}
            {topLevelItems.map((item) => (
              <NavItemLink key={item.id} item={item} />
            ))}
          </div>
          <button
            type="button"
            className={styles.hamburger}
            aria-label="メニューを開く"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            ☰
          </button>
          {config.showLanguagePicker ? (
            <LanguagePicker
              languages={languageOptions}
              currentLanguage="ja"
              onLanguageChange={(code) => {
                const nextUrl = new URL(window.location.href);
                nextUrl.searchParams.set('lang', code);
                window.location.assign(nextUrl.toString());
              }}
            />
          ) : null}
          {isAdmin && settingsOpen ? (
            <SettingsPanel
              config={config}
              onSave={handleSaveConfig}
              onClose={() => setSettingsOpen(false)}
              saving={saving}
            />
          ) : null}
          {isAdmin && editorOpen ? (
            <NavItemEditor
              context={context}
              folders={folders}
              items={items}
              onClose={() => setEditorOpen(false)}
              onSaved={reload}
            />
          ) : null}
        </nav>
        <MobileDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          folders={folders}
          config={config}
          getItemsForFolder={getItemsForFolder}
          getTopLevelItems={getTopLevelItems}
        />
        {config.showBreadcrumb ? <Breadcrumb items={items} fontSize={config.breadcrumbFontSize} /> : null}
      </>
    </NavStructureContext.Provider>
  );
}

export default TopNav;
