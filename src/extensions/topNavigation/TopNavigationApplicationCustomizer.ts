import { override } from '@microsoft/decorators';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
} from '@microsoft/sp-application-base';
import { TopNav } from './components/TopNav';

export default class TopNavigationApplicationCustomizer extends BaseApplicationCustomizer<
  Record<string, never>
> {
  private _headerPlaceholder: PlaceholderContent | undefined;

  @override
  public onInit(): Promise<void> {
    // DECISION: Listen to changedEvent so nav re-renders if SP re-creates placeholders during SPA navigation.
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceholders);
    this._renderPlaceholders();
    return Promise.resolve();
  }

  private _renderPlaceholders = (): void => {
    if (!this._headerPlaceholder) {
      this._headerPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top,
        { onDispose: this._onDispose }
      );
    }

    if (!this._headerPlaceholder?.domElement) {
      return;
    }

    const element = React.createElement(TopNav, { context: this.context });
    ReactDom.render(element, this._headerPlaceholder.domElement);
  };

  private _onDispose = (): void => {
    if (this._headerPlaceholder?.domElement) {
      ReactDom.unmountComponentAtNode(this._headerPlaceholder.domElement);
    }
    this._headerPlaceholder = undefined;
  };
}
