import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { App } from './app';
import { NotlabBackendService } from './notlab-backend.service';

describe('Editor mode and paper type', () => {
  let app: App;
  beforeEach(() => {
    localStorage.clear();
    app = new App(
      { url: '/notebook', events: new Subject() } as unknown as Router,
      { syncPages: () => of({}) } as unknown as NotlabBackendService,
    );
  });

  const twoFingerDoubleTap = () => {
    for (let tap = 0; tap < 2; tap++) {
      for (const pointerId of [1, 2]) app.handleEditorPointerDown({ pointerType: 'touch', pointerId } as PointerEvent);
      for (const pointerId of [1, 2]) app.handleEditorPointerUp({ pointerId } as PointerEvent);
    }
  };

  it('switches modes in place without adding or changing pages', () => {
    const original = app.currentPage;
    twoFingerDoubleTap();
    expect(app.isDynamicMode).toBe(true);
    expect(app.currentPage).toBe(original);
    expect(app.pages.length).toBe(1);
    twoFingerDoubleTap();
    expect(app.isDynamicMode).toBe(false);
    expect(app.currentPage).toBe(original);
  });

  it('adds blank pages in either mode and preserves mode while navigating', () => {
    app.createPageFromProjectMenu();
    expect(app.currentPage?.paperType).toBe('draft');
    expect(app.isDynamicMode).toBe(false);
    app.toggleEditorMode();
    app.createPageFromProjectMenu();
    expect(app.pages.length).toBe(3);
    expect(app.currentPage?.paperType).toBe('draft');
    expect(app.isDynamicMode).toBe(true);
    app.returnToDefaultPage();
    expect(app.pageNumber).toBe(1);
    expect(app.isDynamicMode).toBe(true);
    app.openPage(2);
    expect(app.isDynamicMode).toBe(true);
    twoFingerDoubleTap();
    expect(app.isDynamicMode).toBe(false);
    expect(app.pageNumber).toBe(2);
  });

  it('does not exit dynamic mode when closing floating panels', () => {
    app.toggleEditorMode();
    app.closePanelsOnOutsideClick({ target: document.createElement('div') } as unknown as Event);
    expect(app.isDynamicMode).toBe(true);
  });
});
