import * as React from 'react';
import type { NavItem as NavItemType } from '../types/navTypes';
import styles from './NavItem.module.css';

interface NavItemProps {
  item: NavItemType;
  className?: string;
  onActivate?: () => void;
  role?: string;
  tabIndex?: number;
}

/**
 * Renders a navigation link with optional secondary description text.
 */
const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(function NavItem(
  { item, className, onActivate, role, tabIndex },
  ref
): JSX.Element {
  const linkClassName = className ? `${styles.link} ${className}` : styles.link;

  return (
    <a
      ref={ref}
      className={linkClassName}
      href={item.url}
      target={item.openInNewTab ? '_blank' : undefined}
      rel={item.openInNewTab ? 'noreferrer' : undefined}
      aria-label={item.title}
      role={role}
      tabIndex={tabIndex}
      onClick={onActivate}
    >
      <span className={styles.label}>{item.title}</span>
      {item.description ? <span className={styles.description}>{item.description}</span> : null}
    </a>
  );
});

export default NavItem;
