import * as React from 'react';
import * as ReactDom from 'react-dom';

import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
} from '@microsoft/sp-application-base';

export interface ITopNavigationApplicationCustomizerProperties {}

export default class TopNavigationApplicationCustomizer extends BaseApplicationCustomizer<ITopNavigationApplicationCustomizerProperties> {
  private _topPlaceholder: PlaceholderContent | undefined;

  public onInit(): Promise<void> {
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceholders);
    this._renderPlaceholders();

    return Promise.resolve();
  }

  private _renderPlaceholders = (): void => {
    if (this._topPlaceholder) {
      return;
    }

    this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
      PlaceholderName.Top,
      {
        onDispose: this._onDispose,
      }
    );

    if (!this._topPlaceholder?.domElement) {
      return;
    }

    ReactDom.render(
      React.createElement('div', { id: 'spfx-top-nav-root' }, 'Loading...'),
      this._topPlaceholder.domElement
    );
  };

  private _onDispose = (): void => {
    if (this._topPlaceholder?.domElement) {
      ReactDom.unmountComponentAtNode(this._topPlaceholder.domElement);
    }

    this._topPlaceholder = undefined;
  };
}
