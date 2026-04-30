import * as React from 'react';
import type { NavItem } from '../types/navTypes';
import { useNavStructure } from './NavStructureContext';
import styles from './Breadcrumb.module.css';

interface BreadcrumbProps {
  items: NavItem[];
  fontSize: number;
}

interface BreadcrumbSegment {
  href?: string;
  label: string;
}

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
      return [{ href: currentOrigin, label: 'ホーム' }];
    }

    const parentFolder = folders.find(
      (folder) => folder.folderPath === currentItem.parentFolderPath
    );
    const nextSegments: BreadcrumbSegment[] = [{ href: currentOrigin, label: 'ホーム' }];

    if (parentFolder) {
      nextSegments.push({ label: parentFolder.label });
    }

    nextSegments.push({ label: currentItem.label });

    return nextSegments;
  }, [currentOrigin, currentPath, folders, items]);

  return (
    <div
      className={styles.breadcrumb}
      style={{ '--bc-font-size': `${fontSize}px` } as React.CSSProperties}
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
