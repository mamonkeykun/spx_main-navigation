import * as React from 'react';
import { DefaultButton, MessageBar, MessageBarType, Spinner, TextField } from '@fluentui/react';

interface CrossSiteSettingsProps {
  sourceUrl: string;
  sourceUrlError?: string;
  isTestingConnection: boolean;
  testMessage: string | null;
  testSucceeded: boolean;
  onChange: (value: string) => void;
  onTest: () => Promise<void>;
}

/**
 * Renders cross-site source URL editing and connection testing.
 */
export default function CrossSiteSettings({
  sourceUrl,
  sourceUrlError,
  isTestingConnection,
  testMessage,
  testSucceeded,
  onChange,
  onTest,
}: CrossSiteSettingsProps): JSX.Element {
  return (
    <>
      {testMessage ? (
        <MessageBar messageBarType={testSucceeded ? MessageBarType.success : MessageBarType.error}>
          {testMessage}
        </MessageBar>
      ) : null}
      <TextField
        label="ナビゲーション参照先URL"
        placeholder="https://tenant.sharepoint.com/sites/intranet"
        description="別サイトのNavigationリストを参照する場合に入力してください"
        value={sourceUrl}
        errorMessage={sourceUrlError}
        onChange={(_, value) => onChange(value ?? '')}
      />
      <DefaultButton
        text="接続テスト"
        onClick={() => void onTest()}
        disabled={!sourceUrl || Boolean(sourceUrlError) || isTestingConnection}
      />
      {isTestingConnection ? <Spinner label="接続確認中..." /> : null}
    </>
  );
}
