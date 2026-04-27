import * as React from 'react';
import type { FontSize, NavItem } from '../types/navTypes';
import { useNavStructure } from './NavStructureContext';
import styles from './Breadcrumb.module.css';

interface BreadcrumbProps {
  items: NavItem[];
  fontSize: FontSize;
}

interface BreadcrumbSegment {
  href?: string;
  label: string;
}

const FONT_SIZE_MAP: Record<FontSize, string> = { sm: '12px', md: '14px', lg: '16px' };

/**
 * Resolves the most specific matching nav item for the current location.
 */
function findCurrentItem(items: NavItem[], currentOrigin: string, currentPath: string): NavItem | null {
  const matchingItems = items
    .filter((item) => item.url)
    .filter((item) =>
      currentPath.startsWith(new URL(item.url, currentOrigin).pathname.toLowerCase())
    )
    .sort((left, right) => right.url.length - left.url.length);

  return matchingItems[0] ?? null;
}

/**
 * Renders the page breadcrumb derived from the current URL.
 */
export default function Breadcrumb({ items, fontSize }: BreadcrumbProps): JSX.Element {
  const folders = useNavStructure();
  const currentOrigin = window.location.origin;
  const currentPath = window.location.pathname.toLowerCase();
  const segments = React.useMemo(() => {
    const currentItem = findCurrentItem(items, currentOrigin, currentPath);

    if (!currentItem) {
      return [{ href: currentOrigin, label: 'Home' }];
    }

    const parentFolder = folders.find((folder) => folder.id === currentItem.folderId);
    const nextSegments: BreadcrumbSegment[] = [{ href: currentOrigin, label: 'Home' }];

    if (parentFolder) {
      nextSegments.push({ label: parentFolder.title });
    }

    nextSegments.push({ label: currentItem.title });

    return nextSegments;
  }, [currentOrigin, currentPath, folders, items]);

  return (
    <div
      className={styles.breadcrumb}
      style={{ '--bc-font-size': FONT_SIZE_MAP[fontSize] } as React.CSSProperties}
      aria-label="パンくずリスト"
    >
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        return (
          <React.Fragment key={`${segment.label}-${index}`}>
            {segment.href && !isLast ? (
              <a className={styles.link} href={segment.href} aria-label={segment.label}>
                {segment.label}
              </a>
            ) : (
              <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                {segment.label}
              </span>
            )}
            {!isLast ? <span className={styles.separator}>›</span> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}
