import * as React from 'react';
import type { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import Breadcrumb from './Breadcrumb';
import LanguagePicker from './LanguagePicker';
import MobileDrawer from './MobileDrawer';
import NavFolder from './NavFolder';
import NavItemLink from './NavItem';
import NavStructureContext from './NavStructureContext';
import { injectHideSpNav, removeHideSpNav } from '../utils/hideSpNav';
import { useNavConfig } from '../hooks/useNavConfig';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useNavData } from '../hooks/useNavData';
import { useNavFilter } from '../hooks/useNavFilter';
import styles from './TopNav.module.css';

interface TopNavProps {
  context: ApplicationCustomizerContext;
}

const FONT_SIZE_MAP = { sm: '12px', md: '14px', lg: '16px' };
const LOGO_SIZE_MAP = { small: '32px', medium: '40px', large: '56px' };

/**
 * Renders the main application customizer navigation.
 */
export function TopNav({ context }: TopNavProps): JSX.Element | null {
  const { config, loading: configLoading, error: configError } = useNavConfig(context);
  const { folders, items, loading: navLoading, error: navError } = useNavData(context, config.sourceUrl);
  const { groups, loading: groupsLoading, error: groupsError } = useCurrentUser(context);
  const filteredNav = useNavFilter({ folders, items, userGroups: groups, loading: groupsLoading, error: groupsError });
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const topLevelItems = React.useMemo(
    () => filteredNav.items.filter((item) => typeof item.folderId !== 'number'),
    [filteredNav.items]
  );

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

  if (configLoading || navLoading || filteredNav.loading) {
    return <div className={styles.skeleton} aria-hidden="true" />;
  }

  if (configError || navError) {
    return null;
  }

  return (
    <NavStructureContext.Provider value={filteredNav.folders}>
      <div className={styles.shell}>
        <nav
          className={styles.nav}
          aria-label="メインナビゲーション"
          style={
            {
              '--nav-bg': config.backgroundColor,
              '--nav-text': config.textColor,
              '--nav-hover': config.hoverColor,
              '--nav-accent': config.accentColor,
              '--nav-font-family': config.fontFamily,
              '--nav-font-size': FONT_SIZE_MAP[config.fontSize],
              '--nav-logo-height': LOGO_SIZE_MAP[config.logoSize],
              '--nav-height': '56px',
            } as React.CSSProperties
          }
        >
          {config.logoUrl ? <img className={styles.logo} src={config.logoUrl} alt="" aria-hidden="true" /> : null}
          <div className={styles.folderRow}>
            {filteredNav.folders.map((folder) => (
              <NavFolder
                key={folder.id}
                folder={folder}
                items={folder.items}
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
            aria-label={drawerOpen ? 'メニューを閉じる' : 'メニューを開く'}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            ☰
          </button>
          {config.showLanguagePicker ? (
            <LanguagePicker
              languages={config.availableLanguages}
              currentLanguage={config.currentLanguage}
              onLanguageChange={(code) => {
                // DECISION: Persisted multilingual switching is deferred; reflect intent in the URL for now.
                const nextUrl = new URL(window.location.href);
                nextUrl.searchParams.set('lang', code);
                window.location.assign(nextUrl.toString());
              }}
            />
          ) : null}
        </nav>
        <MobileDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          folders={filteredNav.folders}
          items={filteredNav.items}
          config={config}
        />
        {config.showBreadcrumb ? <Breadcrumb items={filteredNav.items} fontSize={config.breadcrumbFontSize} /> : null}
      </div>
    </NavStructureContext.Provider>
  );
}

export default TopNav;
