const STYLE_TAG_ID = 'origami-hide-sp-nav';

const SP_NAV_CSS = `
  .ms-HorizontalNavV2,
  .ms-HorizontalNavV2--scrolled,
  #SuiteNavWrapper,
  [class*="navigationWrapper"],
  [class*="horizontalNav"],
  .ms-siteHeader-siteName,
  .ms-compositeHeader-topWrapper { display: none !important; }
`;

/**
 * Injects a <style> tag that hides SharePoint native navigation elements.
 * Safe to call multiple times — checks for existing tag before injecting.
 */
export function injectHideSpNav(): void {
  if (isSpNavHidden()) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = STYLE_TAG_ID;
  styleElement.textContent = SP_NAV_CSS;
  document.head.appendChild(styleElement);
}

/**
 * Removes the injected <style> tag if it exists.
 */
export function removeHideSpNav(): void {
  document.getElementById(STYLE_TAG_ID)?.remove();
}

/**
 * Returns true if the hide style tag is currently present in the DOM.
 */
export function isSpNavHidden(): boolean {
  return document.getElementById(STYLE_TAG_ID) !== null;
}
