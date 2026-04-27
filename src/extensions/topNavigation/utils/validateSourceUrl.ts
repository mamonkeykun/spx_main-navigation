/**
 * Validates a cross-site navigation source URL.
 * Returns null if valid, or a Japanese error message string if invalid.
 */
export function validateSourceUrl(url: string): string | null {
  if (url === '' || typeof url === 'undefined') {
    return null;
  }

  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return 'URLの形式が正しくありません';
  }

  if (parsed.protocol !== 'https:') {
    return 'URLはhttps://で始まる必要があります';
  }

  if (
    !parsed.hostname.includes('.sharepoint.com') &&
    !parsed.hostname.includes('.sharepoint.cn')
  ) {
    return 'SharePoint OnlineのURLを入力してください';
  }

  return null;
}
