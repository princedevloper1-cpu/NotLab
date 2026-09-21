import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { NotlabBackendService, SharedProject } from './notlab-backend.service';

interface NotebookItem {
  id: string;
  projectId: string;
  title: string;
  date: string;
  dateModified: number;
  people: string;
  memberCount: number;
  pages: number;
  isShared: boolean;
  isFavorite: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  userName = localStorage.getItem('notlab.currentUserName') || 'John';
  selectedTabIndex = 0;
  isSearchActive = false;
  searchQuery = '';
  openOptionsId = '';
  showAccountMenu = false;
  isAccountBusy = false;
  accountMessage = '';

  notebooks: NotebookItem[] = this.loadNotebooks();

  constructor(
    private readonly router: Router,
    private readonly backend: NotlabBackendService,
  ) {
    this.loadSharedProjects();
  }


  toggleAccountMenu() {
    this.showAccountMenu = !this.showAccountMenu;
    this.accountMessage = '';
  }

  logout() {
    if (this.isAccountBusy) return;
    const userId = localStorage.getItem('notlab.userId') || '';
    this.isAccountBusy = true;
    if (!userId) {
      this.finishLogout(false);
      return;
    }
    this.backend.logoutUser(userId).subscribe({
      next: () => this.finishLogout(false),
      error: () => this.finishLogout(false),
    });
  }

  deleteAccount() {
    if (this.isAccountBusy) return;
    const confirmed = window.confirm('Supprimer définitivement votre compte et vos données NotLab ?');
    if (!confirmed) return;
    const userId = localStorage.getItem('notlab.userId') || '';
    if (!userId) {
      this.finishLogout(true);
      return;
    }
    this.isAccountBusy = true;
    this.backend.deleteUser(userId).subscribe({
      next: () => this.finishLogout(true),
      error: (error: Error) => {
        this.isAccountBusy = false;
        this.accountMessage = error.message || 'Suppression impossible. Réessayez.';
      },
    });
  }

  private finishLogout(deleteLocalData: boolean) {
    const authKeys = ['notlab.userId', 'notlab.currentUserName', 'notlab.currentUserPhone', 'notlab.isRegistered'];
    if (deleteLocalData) {
      Object.keys(localStorage).filter((key) => key.startsWith('notlab.')).forEach((key) => localStorage.removeItem(key));
    } else {
      authKeys.forEach((key) => localStorage.removeItem(key));
    }
    this.isAccountBusy = false;
    this.showAccountMenu = false;
    void this.router.navigateByUrl('/onboarding', { replaceUrl: true });
  }
  get filteredNotebooks(): NotebookItem[] {
    const tabFiltered = this.selectedTabIndex === 1
      ? this.notebooks.filter((notebook) => notebook.isShared || notebook.memberCount > 1)
      : this.selectedTabIndex === 2
        ? this.notebooks.filter((notebook) => notebook.isFavorite)
        : this.notebooks;

    const query = this.searchQuery.trim().toLowerCase();
    return (query ? tabFiltered.filter((notebook) => notebook.title.toLowerCase().includes(query)) : tabFiltered)
      .slice()
      .sort((a, b) => b.dateModified - a.dateModified);
  }

  selectTab(index: number) {
    this.selectedTabIndex = index;
    this.openOptionsId = '';
  }

  toggleSearch() {
    this.isSearchActive = !this.isSearchActive;
    if (!this.isSearchActive) this.searchQuery = '';
  }

  toggleOptions(notebookId: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.openOptionsId = this.openOptionsId === notebookId ? '' : notebookId;
  }

  toggleFavorite(notebookId: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.notebooks = this.notebooks.map((notebook) => notebook.id === notebookId
      ? { ...notebook, isFavorite: !notebook.isFavorite }
      : notebook);
    this.openOptionsId = '';
    this.saveNotebooks();
  }

  deleteNotebook(notebookId: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.notebooks = this.notebooks.filter((notebook) => notebook.id !== notebookId);
    this.openOptionsId = '';
    this.saveNotebooks();
  }

  createNewNotebook() {
    const now = Date.now();
    const notebook: NotebookItem = {
      id: `nb_${now}`,
      projectId: `project:${this.userName}:${now}`,
      title: 'Nouvelle note',
      date: 'Aujourd’hui',
      dateModified: now,
      people: '1 personne',
      memberCount: 1,
      pages: 1,
      isShared: false,
      isFavorite: false,
    };
    this.notebooks = [notebook, ...this.notebooks];
    this.saveNotebooks();
    localStorage.setItem('notlab.activeProjectId', notebook.projectId);
    localStorage.setItem('notlab.activeProjectTitle', notebook.title);
    void this.router.navigateByUrl('/notebook');
  }

  selectNotebook(notebook: NotebookItem, event: Event) {
    event.stopPropagation();
    localStorage.setItem('notlab.activeProjectId', notebook.projectId || notebook.id);
    localStorage.setItem('notlab.activeProjectTitle', notebook.title);
  }

  private loadSharedProjects() {
    const userId = localStorage.getItem('notlab.userId') || '';
    if (!userId) return;
    this.backend.getSharedProjects(userId).subscribe({
      next: (response) => {
        const shared = (response.projects || []).map((project) => this.toSharedNotebook(project));
        const localIds = new Set(this.notebooks.map((notebook) => notebook.projectId || notebook.id));
        this.notebooks = [...this.notebooks, ...shared.filter((notebook) => !localIds.has(notebook.projectId))];
        this.saveNotebooks();
      },
      error: () => undefined,
    });
  }

  private toSharedNotebook(project: SharedProject): NotebookItem {
    return {
      id: `shared:${project.project_id}`,
      projectId: project.project_id,
      title: project.project_title,
      date: 'Partagé récemment',
      dateModified: Date.now(),
      people: project.inviter_name ? `Avec ${project.inviter_name}` : 'Projet partagé',
      memberCount: 2,
      pages: 1,
      isShared: true,
      isFavorite: false,
    };
  }

  private loadNotebooks(): NotebookItem[] {
    const saved = localStorage.getItem('notlab.notebooks');
    if (saved) {
      try {
        const notebooks = JSON.parse(saved) as NotebookItem[];
        const defaultIds = new Set(['nb_1', 'nb_2', 'nb_3', 'nb_4', 'nb_5', 'nb_6']);
        const userNotebooks = notebooks.filter((notebook) => !defaultIds.has(notebook.id)).map((notebook) => ({
          ...notebook,
          projectId: notebook.projectId || notebook.id,
        }));
        localStorage.setItem('notlab.notebooks', JSON.stringify(userNotebooks));
        return userNotebooks;
      } catch {
        localStorage.removeItem('notlab.notebooks');
      }
    }

    return [];
  }

  private saveNotebooks() {
    localStorage.setItem('notlab.notebooks', JSON.stringify(this.notebooks));
  }
}
