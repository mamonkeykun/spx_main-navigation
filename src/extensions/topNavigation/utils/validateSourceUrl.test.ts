import { validateSourceUrl } from './validateSourceUrl';

describe('validateSourceUrl', () => {
  it('returns null for empty string', () => {
    expect(validateSourceUrl('')).toBeNull();
  });

  it('returns null for a valid SharePoint Online URL', () => {
    expect(validateSourceUrl('https://tenant.sharepoint.com/sites/intranet')).toBeNull();
  });

  it('returns an error for non-https URLs', () => {
    expect(validateSourceUrl('http://tenant.sharepoint.com/sites/intranet')).toBe(
      'URLはhttps://で始まる必要があります'
    );
  });

  it('returns an error for non-SharePoint domains', () => {
    expect(validateSourceUrl('https://example.com/sites/intranet')).toBe(
      'SharePoint OnlineのURLを入力してください'
    );
  });

  it('returns an error for malformed URLs', () => {
    expect(validateSourceUrl('tenant.sharepoint.com/sites/intranet')).toBe(
      'URLの形式が正しくありません'
    );
  });

  it('returns null for SharePoint China URLs', () => {
    expect(validateSourceUrl('https://tenant.sharepoint.cn/sites/intranet')).toBeNull();
  });
});
