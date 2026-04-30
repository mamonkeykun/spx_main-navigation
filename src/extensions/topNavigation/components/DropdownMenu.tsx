import * as React from 'react';
import type { DropdownLayout, NavItem } from '../types/navTypes';
import NavItemLink from './NavItem';
import styles from './DropdownMenu.module.css';

interface DropdownMenuProps {
  items: NavItem[];
  layout: DropdownLayout;
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  ariaLabel?: string;
  onRequestClose?: () => void;
}

/**
 * Moves focus through a list of interactive dropdown items.
 */
function moveFocus(
  itemRefs: React.MutableRefObject<Array<HTMLAnchorElement | null>>,
  activeIndex: number,
  direction: number
): void {
  const nextIndex = (activeIndex + direction + itemRefs.current.length) % itemRefs.current.length;
  itemRefs.current[nextIndex]?.focus();
}

/**
 * Renders a keyboard-accessible dropdown menu for folder items.
 */
export default function DropdownMenu({
  items,
  layout,
  isOpen,
  anchorRef,
  ariaLabel,
  onRequestClose,
}: DropdownMenuProps): JSX.Element | null {
  const itemRefs = React.useRef<Array<HTMLAnchorElement | null>>([]);

  React.useEffect(() => {
    if (isOpen) {
      itemRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>): void => {
    const activeIndex = itemRefs.current.findIndex((entry) => entry === document.activeElement);

    if (event.key === 'Escape') {
      event.preventDefault();
      onRequestClose?.();
      anchorRef.current?.focus();
      return;
    }

    if (activeIndex === -1 || itemRefs.current.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveFocus(itemRefs, activeIndex, 1);
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      moveFocus(itemRefs, activeIndex, -1);
    }
  };

  if (!isOpen) {
    return null;
  }

  const menuClassName =
    layout === 'horizontal' ? `${styles.menu} ${styles.menuHorizontal}` : styles.menu;

  return (
    <ul
      className={menuClassName}
      role="menu"
      aria-label={ariaLabel ?? anchorRef.current?.textContent ?? 'ナビゲーションメニュー'}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <li key={item.id} className={styles.item} role="none">
          <NavItemLink
            item={item}
            className={styles.linkReset}
            onActivate={onRequestClose}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            role="menuitem"
          />
        </li>
      ))}
    </ul>
  );
}
