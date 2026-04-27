import * as React from 'react';
import * as ReactDom from 'react-dom';

import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

export interface INavSettingsWebPartProps {}

export default class NavSettingsWebPart extends BaseClientSideWebPart<INavSettingsWebPartProps> {
  public render(): void {
    ReactDom.render(
      React.createElement('div', { id: 'spfx-nav-settings-root' }, 'Loading...'),
      this.domElement
    );
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration() {
    return {
      pages: [],
    };
  }
}
