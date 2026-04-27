import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import NavSettingsApp from './components/NavSettingsApp';

export interface INavSettingsWebPartProps {}

export default class NavSettingsWebPart extends BaseClientSideWebPart<INavSettingsWebPartProps> {
  public render(): void {
    ReactDom.render(React.createElement(NavSettingsApp, { context: this.context }), this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration() {
    return { pages: [] };
  }

  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }
}
