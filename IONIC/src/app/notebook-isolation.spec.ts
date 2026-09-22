import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { App } from './app';
import { NotlabBackendService } from './notlab-backend.service';

describe('Notebook isolation', () => {
  let events: Subject<NavigationEnd>;
  const key = (id: string) => `notlab.editor.pages.web-user.${id}`;
  const page = (id: string) => ({ pageId: id, pageNumber: 1, name: id, createdAt: '22/09/2026', lines: [], blocks: [] });
  const createEditor = () => new App(
    { url: '/home', events } as unknown as Router,
    {} as NotlabBackendService,
  );
  const open = (id: string) => {
    localStorage.setItem('notlab.activeProjectId', id);
    events.next(new NavigationEnd(1, '/notebook', '/notebook'));
  };

  beforeEach(() => {
    localStorage.clear();
    events = new Subject<NavigationEnd>();
    localStorage.setItem('notlab.activeProjectId', 'old');
  });

  it('starts a new notebook blank and restores the old notebook pages on return', () => {
    localStorage.setItem(key('old'), JSON.stringify([{ ...page('first'), lines: [{ id: 'line-1', text: 'Old note content', labelStyle: { id: 'yellow', name: 'Jaune' } }] }, { ...page('second'), pageNumber: 2 }]));
    const app = createEditor();
    app.draftText = 'Unsent old draft';
    open('new');
    expect(app.pages.length).toBe(1);
    expect(app.pages[0].pageId).not.toBe('first');
    expect(app.lines).toEqual([]);
    expect(app.draftText).toBe('');
    const newId = app.pages[0].pageId;
    open('old');
    expect(app.pages.map(item => item.pageId)).toEqual(['first', 'second']);
    expect(app.lines[0].text).toBe('Old note content');
    open('new');
    expect(app.pages[0].pageId).toBe(newId);
    expect(createEditor().pages[0].pageId).toBe(newId);
  });

  it('migrates legacy pages only to the previously active notebook and keeps the backup', () => {
    const legacy = JSON.stringify([page('legacy')]);
    localStorage.setItem('notlab.editor.pages', legacy);
    const app = createEditor();
    expect(app.pages[0].pageId).toBe('legacy');
    open('new');
    expect(app.pages[0].pageId).not.toBe('legacy');
    expect(localStorage.getItem('notlab.editor.pages')).toBe(legacy);
    expect(JSON.parse(localStorage.getItem(key('old'))!)[0].pageId).toBe('legacy');
    localStorage.setItem('notlab.activeProjectId', 'another');
    expect(createEditor().pages[0].pageId).not.toBe('legacy');
  });

  it('does not import demonstration pages into a notebook', () => {
    localStorage.setItem('notlab.editor.pages', JSON.stringify([page('demo')]));
    localStorage.setItem('notlab.editor.seeded', 'true');
    expect(createEditor().pages[0].pageId).not.toBe('demo');
  });
});
