import * as React from 'react';
import LanguagePicker from './LanguagePicker';
import NavItemLink from './NavItem';
import type { NavConfig, NavFolder, NavItem } from '../types/navTypes';
import styles from './MobileDrawer.module.css';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  folders: NavFolder[];
  items: NavItem[];
  config: NavConfig;
}

/**
 * Renders the mobile navigation drawer with accordion folders.
 */
export default function MobileDrawer({
  isOpen,
  onClose,
  folders,
  items,
  config,
}: MobileDrawerProps): JSX.Element | null {
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const [openFolders, setOpenFolders] = React.useState<Record<number, boolean>>({});
  const topLevelItems = React.useMemo(
    () => items.filter((item) => typeof item.folderId !== 'number'),
    [items]
  );

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    // DECISION: A lightweight first-focus approach keeps the drawer accessible without adding a focus-trap dependency.
    const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${styles.drawerOpen}`}
        role="dialog"
        aria-modal="true"
        aria-label="モバイルナビゲーション"
      >
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="閉じる">
          X 閉じる
        </button>
        {config.logoUrl ? <img className={styles.logo} src={config.logoUrl} alt="" aria-hidden="true" /> : null}
        <hr className={styles.divider} />
        {topLevelItems.map((item) => (
          <NavItemLink
            key={item.id}
            item={item}
            className={styles.mobileLink}
            onActivate={onClose}
          />
        ))}
        {topLevelItems.length > 0 ? <hr className={styles.divider} /> : null}
        {folders.map((folder) => {
          const isExpanded = openFolders[folder.id] ?? false;
          return (
            <div key={folder.id}>
              <button
                type="button"
                className={styles.accordionToggle}
                aria-expanded={isExpanded}
                onClick={() =>
                  setOpenFolders((current) => ({ ...current, [folder.id]: !isExpanded }))
                }
              >
                <span>{folder.title}</span>
                <span
                  className={
                    isExpanded
                      ? `${styles.accordionChevron} ${styles.accordionChevronOpen}`
                      : styles.accordionChevron
                  }
                >
                  ▾
                </span>
              </button>
              {isExpanded ? (
                <div className={styles.accordionItems}>
                  {folder.items.map((item) => (
                    <NavItemLink
                      key={item.id}
                      item={item}
                      className={styles.mobileLink}
                      onActivate={onClose}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
        {config.showLanguagePicker ? (
          <>
            <hr className={styles.divider} />
            <LanguagePicker
              languages={config.availableLanguages}
              currentLanguage={config.currentLanguage}
              onLanguageChange={(code) => {
                const nextUrl = new URL(window.location.href);
                nextUrl.searchParams.set('lang', code);
                window.location.assign(nextUrl.toString());
              }}
            />
          </>
        ) : null}
      </div>
    </>
  );
}
