import * as React from 'react';
import styles from './LanguagePicker.module.css';

interface LanguageOption {
  code: string;
  label: string;
}

interface LanguagePickerProps {
  languages: LanguageOption[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
}

/**
 * Moves focus through language options in the open picker.
 */
function moveLanguageFocus(
  itemRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>,
  activeIndex: number,
  direction: number
): void {
  const nextIndex = (activeIndex + direction + itemRefs.current.length) % itemRefs.current.length;
  itemRefs.current[nextIndex]?.focus();
}

/**
 * Renders the language switcher dropdown.
 */
export default function LanguagePicker({
  languages,
  currentLanguage,
  onLanguageChange,
}: LanguagePickerProps): JSX.Element {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const currentLanguageLabel =
    languages.find((language) => language.code === currentLanguage)?.label ?? currentLanguage;

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      itemRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>): void => {
    const activeIndex = itemRefs.current.findIndex((entry) => entry === document.activeElement);

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (activeIndex === -1 || itemRefs.current.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveLanguageFocus(itemRefs, activeIndex, 1);
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      moveLanguageFocus(itemRefs, activeIndex, -1);
    }
  };

  return (
    <div ref={wrapperRef} className={styles.picker}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label="言語を選択"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsOpen(false);
          }
        }}
      >
        {currentLanguageLabel.slice(0, 2).toUpperCase()}
      </button>
      {isOpen ? (
        <ul className={styles.dropdown} role="menu" aria-label="言語一覧" onKeyDown={handleKeyDown}>
          {languages.map((language, index) => {
            const isActive = language.code === currentLanguage;
            const buttonClassName = isActive ? `${styles.langButton} ${styles.active}` : styles.langButton;

            return (
              <li key={language.code} className={styles.langItem} role="none">
                <button
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  type="button"
                  className={buttonClassName}
                  role="menuitem"
                  aria-label={language.label}
                  onClick={() => {
                    onLanguageChange(language.code);
                    setIsOpen(false);
                  }}
                >
                  {isActive ? '✓ ' : ''}
                  {language.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
