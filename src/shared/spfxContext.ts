import type { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import type { WebPartContext } from '@microsoft/sp-webpart-base';

/**
 * Shared SPFx context surface used by both the customizer and the settings web part.
 */
export type SpfxContext = ApplicationCustomizerContext | WebPartContext;
