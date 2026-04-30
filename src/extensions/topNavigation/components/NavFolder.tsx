import * as React from 'react';
import type { DropdownLayout, NavFolder as NavFolderType, NavItem } from '../types/navTypes';
import DropdownMenu from './DropdownMenu';
import styles from './NavFolder.module.css';

interface NavFolderProps {
  folder: NavFolderType;
  items: NavItem[];
  dropdownLayout: DropdownLayout;
}

/**
 * Renders a top-level folder trigger and manages its dropdown state.
 */
export default function NavFolder({
  folder,
  items,
  dropdownLayout,
}: NavFolderProps): JSX.Element {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const hasItems = items.length > 0;

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  React.useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  const handleOpen = (): void => {
    window.clearTimeout(closeTimerRef.current);
    if (hasItems) {
      setIsOpen(true);
    }
  };

  const handleClose = (): void => {
    closeTimerRef.current = window.setTimeout(() => setIsOpen(false), 150);
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }

    if ((event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') && hasItems) {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const triggerClassName = isOpen ? `${styles.trigger} ${styles.triggerOpen}` : styles.trigger;
  const hasLandingPage = typeof folder.url === 'string' && folder.url.trim() !== '';

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-expanded={hasItems ? isOpen : undefined}
        aria-haspopup={hasItems ? 'menu' : undefined}
        aria-label={folder.label}
        onClick={() => {
          if (hasItems) {
            setIsOpen((current) => !current);
          } else if (hasLandingPage) {
            window.location.assign(folder.url as string);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        {folder.label}
        {hasItems && !isOpen ? <span className={styles.chevron} aria-hidden="true">∨</span> : null}
      </button>
      {isOpen && hasItems ? (
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setIsOpen(false)}
          aria-label={`${folder.label}を閉じる`}
        >
          ✕
        </button>
      ) : null}
      <DropdownMenu
        items={items}
        layout={dropdownLayout}
        isOpen={isOpen}
        anchorRef={triggerRef}
        ariaLabel={folder.label}
        onRequestClose={() => setIsOpen(false)}
      />
    </div>
  );
}
