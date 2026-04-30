import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { PropertyPaneLabel, type IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';

import NavSettingsApp from './components/NavSettingsApp';

export interface INavSettingsWebPartProps {}

export default class NavSettingsWebPart extends BaseClientSideWebPart<INavSettingsWebPartProps> {
  public render(): void {
    ReactDom.render(
      React.createElement(NavSettingsApp, {
        context: this.context,
      }),
      this.domElement
    );
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: 'この Web パーツ自体の詳細設定はありません',
          },
          groups: [
            {
              groupName: '使い方',
              groupFields: [
                PropertyPaneLabel('usage', {
                  text:
                    '表示設定とナビ編集は Web パーツ本体のボタンから行います。' +
                    '上部ナビをサイトに表示するには、PnP スクリプトで ' +
                    'Application Customizer を有効化してください。',
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
