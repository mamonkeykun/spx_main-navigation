/**
 * @jest-environment jsdom
 */

import { injectHideSpNav, isSpNavHidden, removeHideSpNav } from './hideSpNav';

describe('hideSpNav', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('injectHideSpNav adds a style tag', () => {
    injectHideSpNav();

    const styleTag = document.getElementById('origami-hide-sp-nav');

    expect(styleTag).not.toBeNull();
    expect(styleTag?.tagName).toBe('STYLE');
  });

  it('injectHideSpNav does not create duplicate tags', () => {
    injectHideSpNav();
    injectHideSpNav();

    expect(document.querySelectorAll('#origami-hide-sp-nav')).toHaveLength(1);
  });

  it('removeHideSpNav removes the injected tag', () => {
    injectHideSpNav();

    removeHideSpNav();

    expect(document.getElementById('origami-hide-sp-nav')).toBeNull();
  });

  it('removeHideSpNav does not throw when the tag is missing', () => {
    expect(() => removeHideSpNav()).not.toThrow();
  });

  it('isSpNavHidden tracks inject and remove', () => {
    expect(isSpNavHidden()).toBe(false);

    injectHideSpNav();
    expect(isSpNavHidden()).toBe(true);

    removeHideSpNav();
    expect(isSpNavHidden()).toBe(false);
  });
});
