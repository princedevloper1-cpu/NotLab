import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { IonActionSheet, IonAlert, IonApp, IonContent, IonIcon, IonInput, IonModal, IonPopover, IonToast } from '@ionic/angular';
import { BackendPage, NotlabBackendService } from './notlab-backend.service';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  arrowBackOutline,
  attachOutline,
  cameraOutline,
  checkboxOutline,
  chevronBackOutline,
  chevronForwardOutline,
  cloudUploadOutline,
  copyOutline,
  createOutline,
  documentAttachOutline,
  documentsOutline,
  ellipsisHorizontal,
  ellipsisVerticalOutline,
  happyOutline,
  imageOutline,
  informationCircleOutline,
  micOutline,
  peopleOutline,
  pricetagOutline,
  reorderFourOutline,
  reorderThreeOutline,
  sendOutline,
  settingsOutline,
  trashOutline,
} from 'ionicons/icons';

addIcons({
  addCircleOutline,
  arrowBackOutline,
  attachOutline,
  cameraOutline,
  checkboxOutline,
  chevronBackOutline,
  chevronForwardOutline,
  cloudUploadOutline,
  copyOutline,
  createOutline,
  documentAttachOutline,
  documentsOutline,
  ellipsisHorizontal,
  ellipsisVerticalOutline,
  happyOutline,
  imageOutline,
  informationCircleOutline,
  micOutline,
  peopleOutline,
  pricetagOutline,
  reorderFourOutline,
  reorderThreeOutline,
  sendOutline,
  settingsOutline,
  trashOutline,
});

interface NotebookLine {
  id: string;
  text: string;
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  color: string;
  align: 'left' | 'center' | 'right';
  userId?: string;
  authorId?: string;
  authorName?: string;
  authorAvatarUrl?: string;
}

interface Collaborator {
  id: string;
  name: string;
  online: boolean;
  presenceKnown?: boolean;
  canWrite: boolean;
  color: string;
  initials: string;
  avatarUrl?: string;
}

interface AuthorView {
  id: string;
  name: string;
  initials: string;
  color: string;
  avatarUrl?: string;
  isCurrentUser: boolean;
  isOnline?: boolean;
}
interface NotebookPage {
  pageId: string;
  pageNumber: number;
  name: string;
  createdAt: string;
  lines: NotebookLine[];
  ownerUserId: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonActionSheet, IonAlert, IonApp, IonContent, IonIcon, IonInput, IonModal, IonPopover, IonToast, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  @ViewChild('composerInput') composerInput?: IonInput;
  @ViewChild('attachmentPicker') attachmentPicker?: ElementRef<HTMLInputElement>;

  pageNumber = 1;
  totalPages = 0;
  isEditorRoute = false;
  creationDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  draftText = '';
  selectedLine?: NotebookLine;
  showTypography = false;
  showEmojiPicker = false;
  showCollabSheet = false;
  showPageManager = false;
  showProjectOptions = false;
  showLineMenu = false;
  showLineMoreMenu = false;
  showLineDeleteActions = false;
  showAuthorPopover = false;
  authorPopoverEvent?: Event;
  selectedAuthor?: AuthorView;
  editingLineId?: string;
  lineMenuPosition = { top: 0, left: 0 };
  showAttachmentActions = false;
  showAllPages = false;
  showPageActions = false;
  showDeleteAlert = false;
  showRenameAlert = false;
  showToast = false;
  selectedPage?: NotebookPage;
  toastMessage = '';
  projectMessage = '';
  countryCode = '+509';
  contactName = '';
  phoneValue = '';
  phoneError = '';
  attachmentType: 'image' | 'photo' | 'file' = 'file';
  isRecordingVoice = false;
  private voiceRecorder?: MediaRecorder;
  private voiceChunks: Blob[] = [];
  typography = {
    font: localStorage.getItem('notlab.editor.font') || 'Handwriting 1',
    size: Number(localStorage.getItem('notlab.editor.size') || 18),
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    color: '#173b7a',
    align: 'left' as 'left' | 'center' | 'right',
  };

  pages: NotebookPage[] = this.loadPages();
  lines: NotebookLine[] = this.pages[0]?.lines || [];
  collaborators: Collaborator[] = [];
  pageNumbers: number[] = [];
  private pagePressTimer?: number;
  private linePressTimer?: number;
  private readonly authorPalette = ['#2563eb', '#059669', '#7c3aed', '#db2777', '#d97706', '#0891b2', '#4f46e5', '#be123c'];

  pageActionButtons = [
    { text: 'Renommer', handler: () => { this.showRenameAlert = true; } },
    { text: 'Dupliquer', handler: () => this.duplicateSelectedPage() },
    { text: 'Supprimer', role: 'destructive', handler: () => { if (this.pages.length > 1) this.showDeleteAlert = true; } },
    { text: 'Annuler', role: 'cancel' },
  ];

  deleteAlertButtons = [
    { text: 'Annuler', role: 'cancel' },
    { text: 'Supprimer', role: 'destructive', handler: () => this.deleteSelectedPage() },
  ];

  renameAlertButtons = [
    { text: 'Annuler', role: 'cancel' },
    { text: 'Enregistrer', handler: (data: { name: string }) => this.renameSelectedPage(data.name) },
  ];

  renameAlertInputs = [{ name: 'name', value: '', placeholder: 'Nom de la page' }];

  attachmentActionButtons = [
    { text: 'Image', icon: 'image-outline', handler: () => this.openAttachmentPicker('image') },
    { text: 'Photo', icon: 'camera-outline', handler: () => this.openAttachmentPicker('photo') },
    { text: 'Fichier', icon: 'document-attach-outline', handler: () => this.openAttachmentPicker('file') },
    { text: 'Note vocale', icon: 'mic-outline', handler: () => this.toggleVoiceRecording() },
    { text: 'Checklist', icon: 'checkbox-outline', handler: () => this.addAttachmentLine('[ ] ') },
    { text: 'Label', icon: 'pricetag-outline', handler: () => this.addAttachmentLine('# ') },
    { text: 'Annuler', role: 'cancel' },
  ];

  get currentUserId(): string { return localStorage.getItem('notlab.userId') || 'web-user'; }
  get currentUserName(): string { return localStorage.getItem('notlab.currentUserName') || 'Utilisateur'; }
  get currentUserAvatarUrl(): string { return localStorage.getItem('notlab.currentUserAvatar') || ''; }
  get currentPage(): NotebookPage | undefined { return this.pages.find((page) => page.pageNumber === this.pageNumber); }
  get isCurrentUserPageOwner(): boolean {
    return !!this.currentPage && (!this.currentPage.ownerUserId || this.currentPage.ownerUserId === this.currentUserId);
  }
  get canManageSelectedLine(): boolean {
    return !!this.selectedLine && this.canManageLine(this.selectedLine);
  }

  get lineDeleteActionButtons() {
    const buttons: Array<Record<string, unknown>> = [
      { text: 'Supprimer pour moi', handler: () => this.deleteSelectedLine('local') },
    ];
    if (this.canManageSelectedLine) {
      buttons.push({ text: 'Supprimer pour tout le monde', role: 'destructive', handler: () => this.deleteSelectedLine('everyone') });
    }
    if (this.isCurrentUserPageOwner) {
      buttons.push({ text: 'Supprimer tous les messages de la page', role: 'destructive', handler: () => this.deleteAllPageMessages() });
    }
    buttons.push({ text: 'Annuler', role: 'cancel' });
    return buttons;
  }
  get canGoPrevious(): boolean { return this.pageNumber > 1; }
  get canGoNext(): boolean { return this.pageNumber < this.totalPages; }
  authorForLine(line: NotebookLine): AuthorView {
    const id = line.authorId || line.userId || this.currentUserId;
    const member = this.collaborators.find((item) => item.id === id);
    const isCurrentUser = id === this.currentUserId;
    const name = isCurrentUser ? this.currentUserName : member?.name || line.authorName || 'Membre';
    return {
      id,
      name,
      initials: this.initialsFor(name),
      color: member?.color || this.stableAuthorColor(id),
      avatarUrl: isCurrentUser ? this.currentUserAvatarUrl || undefined : member?.avatarUrl || line.authorAvatarUrl,
      isCurrentUser,
      isOnline: member?.presenceKnown && member.online ? true : undefined,
    };
  }

  initialsFor(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  openAuthorPopover(line: NotebookLine, event: Event) {
    event.stopPropagation();
    this.selectedAuthor = this.authorForLine(line);
    this.authorPopoverEvent = event;
    this.showAuthorPopover = true;
  }

  closeAuthorPopover() {
    this.showAuthorPopover = false;
    this.authorPopoverEvent = undefined;
  }

  private stableAuthorColor(authorId: string): string {
    const projectKey = this.currentPage?.ownerUserId || 'notlab';
    const key = projectKey + ':' + authorId;
    let hash = 0;
    for (let index = 0; index < key.length; index++) hash = ((hash << 5) - hash + key.charCodeAt(index)) | 0;
    return this.authorPalette[Math.abs(hash) % this.authorPalette.length];
  }

  get isInviteValid(): boolean {
    return /^\d{8}$/.test(this.phoneValue.replace(/\s+/g, ''));
  }

  constructor(
    private readonly router: Router,
    private readonly backend: NotlabBackendService,
  ) {
    this.isEditorRoute = this.router.url === '/notebook';
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.isEditorRoute = (event as NavigationEnd).urlAfterRedirects === '/notebook';
    });
  }

  private syncPageState() {
    this.totalPages = this.pages.length;
    this.pageNumbers = this.pages.map((page) => page.pageNumber);
  }

  goHome() { void this.router.navigateByUrl('/home'); }

  previousPage() {
    this.pageNumber = Math.max(1, this.pageNumber - 1);
    this.openPage(this.pageNumber);
  }

  nextPage() {
    this.pageNumber = Math.min(this.totalPages, this.pageNumber + 1);
    this.openPage(this.pageNumber);
  }

  openPageManager() { this.showAllPages = true; }

  selectPage(page: number) {
    this.openPage(page);
    this.showAllPages = false;
    this.selectedLine = undefined;
  }

  openPage(pageNumber: number) {
    const page = this.pages.find((item) => item.pageNumber === pageNumber);
    if (!page) return;
    this.saveCurrentPage();
    this.pageNumber = page.pageNumber;
    this.lines = page.lines;
  }

  addPage() {
    this.saveCurrentPage();
    const pageNumber = this.pages.length + 1;
    const page: NotebookPage = {
      pageId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      pageNumber,
      name: `Page ${pageNumber}`,
      createdAt: new Date().toISOString(),
      lines: [],
      ownerUserId: this.currentUserId,
    };
    this.pages = [...this.pages, page];
    this.syncPageState();
    this.persistPages();
    this.syncPagesToBackend();
    this.openPage(pageNumber);
    this.showAllPages = false;
    this.showSuccess(`Page ${pageNumber} créée.`);
  }

  startPagePress(page: NotebookPage) {
    this.selectedPage = page;
    this.renameAlertInputs[0].value = page.name;
    this.pagePressTimer = window.setTimeout(() => {
      this.selectedPage = page;
      this.showPageActions = true;
    }, 550);
  }

  endPagePress() {
    if (this.pagePressTimer) window.clearTimeout(this.pagePressTimer);
  }

  renameSelectedPage(name: string) {
    if (!this.selectedPage || !name.trim()) return;
    if (this.selectedPage.ownerUserId && this.selectedPage.ownerUserId !== this.currentUserId) {
      this.showRenameAlert = false;
      this.showSuccess('Seul le propriétaire peut renommer cette page.');
      return;
    }
    this.selectedPage.name = name.trim();
    this.persistPages();
    this.syncPagesToBackend();
    this.showRenameAlert = false;
    this.showSuccess('Page renommée.');
  }

  deleteSelectedPage() {
    if (!this.selectedPage || this.pages.length <= 1) return;
    if (this.selectedPage.ownerUserId && this.selectedPage.ownerUserId !== this.currentUserId) {
      this.showDeleteAlert = false;
      this.showSuccess('Seul le propriétaire peut supprimer cette page.');
      return;
    }
    const removedNumber = this.selectedPage.pageNumber;
    this.pages = this.pages.filter((page) => page.pageId !== this.selectedPage?.pageId)
      .map((page, index) => ({ ...page, pageNumber: index + 1 }));
    this.syncPageState();
    const nextPage = Math.min(removedNumber, this.totalPages);
    this.persistPages();
    this.backend.deletePage(this.selectedPage.pageId, this.currentUserId).subscribe({ error: () => undefined });
    this.syncPagesToBackend();
    this.selectedPage = undefined;
    this.showDeleteAlert = false;
    this.openPage(nextPage);
    this.showSuccess('Page supprimée.');
  }

  createPageFromProjectMenu() {
    this.showProjectOptions = false;
    this.addPage();
  }

  deletePageFromProjectMenu() {
    this.showProjectOptions = false;
    if (this.totalPages <= 1) {
      this.showSuccess('La dernière page ne peut pas être supprimée.');
      return;
    }
    this.selectedPage = this.pages.find((page) => page.pageNumber === this.pageNumber);
    this.showDeleteAlert = true;
  }

  duplicateSelectedPage() {
    if (!this.selectedPage) return;
    this.saveCurrentPage();
    const copy: NotebookPage = {
      ...this.selectedPage,
      pageId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      pageNumber: this.selectedPage.pageNumber + 1,
      name: `${this.selectedPage.name} (copie)`,
      createdAt: new Date().toISOString(),
      ownerUserId: this.currentUserId,
      lines: this.selectedPage.lines.map((line) => ({
        ...line,
        id: `${Date.now()}-${Math.random()}`,
        userId: this.currentUserId,
        authorId: this.currentUserId,
        authorName: this.currentUserName,
        authorAvatarUrl: this.currentUserAvatarUrl || undefined,
      })),
    };
    this.pages.splice(copy.pageNumber - 1, 0, copy);
    this.pages = this.pages.map((page, index) => ({ ...page, pageNumber: index + 1 }));
    this.syncPageState();
    this.persistPages();
    this.syncPagesToBackend();
    this.openPage(copy.pageNumber);
    this.showPageActions = false;
    this.showSuccess('Page dupliquée.');
  }

  showSuccess(message: string) {
    this.toastMessage = message;
    this.showToast = true;
  }

  sendLine() {
    const text = this.draftText.trim();
    if (!text) return;
    this.ensurePageForWriting();

    if (this.editingLineId) {
      const target = this.lines.find((line) => line.id === this.editingLineId);
      if (!target || !this.canManageLine(target)) {
        this.showSuccess('Vous ne pouvez modifier que vos messages.');
        return;
      }
      const updated = { ...target, text };
      this.lines = this.lines.map((line) => line.id === updated.id ? updated : line);
      this.editingLineId = undefined;
      this.selectedLine = undefined;
      this.showLineMenu = false;
      this.showLineMoreMenu = false;
      this.draftText = '';
      this.saveCurrentPage();
      this.backend.updateElement(updated.id, this.currentUserId, text, updated.color).subscribe({
        next: () => this.showSuccess('Message modifié pour tout le monde.'),
        error: () => this.showSuccess('Modification locale enregistrée. Synchronisation en attente.'),
      });
      setTimeout(() => void this.composerInput?.setFocus(), 0);
      return;
    }

    this.lines = [...this.lines, {
      id: Date.now() + '-' + Math.random().toString(36).slice(2),
      text,
      userId: this.currentUserId,
      authorId: this.currentUserId,
      authorName: this.currentUserName,
      authorAvatarUrl: this.currentUserAvatarUrl || undefined,
      ...this.typography,
    }];
    this.draftText = '';
    this.saveCurrentPage();
    const page = this.pages.find((item) => item.pageNumber === this.pageNumber);
    this.backend.saveElement({
      action: 'save_element',
      element_id: this.lines[this.lines.length - 1].id,
      page_id: page?.pageId || `page-${this.pageNumber}`,
      user_id: this.currentUserId,
      author_name: this.currentUserName,
      author_tag: this.initialsFor(this.currentUserName),
      line_index: this.lines.length - 1,
      content: text,
      color: this.typography.color,
    }).subscribe({
      next: () => this.showSuccess('Ligne synchronisée.'),
      error: () => this.showSuccess('Ligne enregistrée localement. Synchronisation en attente.'),
    });
    setTimeout(() => void this.composerInput?.setFocus(), 0);
  }

  startLinePress(line: NotebookLine, event: PointerEvent) {
    this.cancelLinePress();
    this.linePressTimer = window.setTimeout(() => {
      const target = event.currentTarget as HTMLElement | null;
      const rect = target?.getBoundingClientRect();
      this.selectLine(line, rect);
    }, 550);
  }

  cancelLinePress() {
    if (this.linePressTimer) window.clearTimeout(this.linePressTimer);
  }

  selectLine(line: NotebookLine, rect?: DOMRect | null) {
    this.selectedLine = line;
    this.showLineMenu = true;
    this.showLineMoreMenu = false;
    this.draftText = line.text;
    if (rect) {
      this.lineMenuPosition = {
        top: Math.max(70, rect.top - 62),
        left: Math.max(12, Math.min(window.innerWidth - 310, rect.left + rect.width / 2 - 145)),
      };
    }
  }

  onDraftInput(value: string) {
    this.draftText = value;
    if (value.trim()) this.ensurePageForWriting();
  }

  private ensurePageForWriting() {
    if (this.pages.length) return;
    const page: NotebookPage = {
      pageId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      pageNumber: 1,
      name: 'Page 1',
      createdAt: new Date().toISOString(),
      lines: [],
      ownerUserId: this.currentUserId,
    };
    this.pages = [page];
    this.pageNumber = 1;
    this.lines = [];
    this.syncPageState();
    this.persistPages();
  }

  copySelectedLine() {
    if (this.selectedLine) void navigator.clipboard?.writeText(this.selectedLine.text);
    this.showLineMenu = false;
    this.showLineMoreMenu = false;
  }

  duplicateSelectedLine() {
    if (!this.selectedLine) return;
    const index = this.lines.findIndex((line) => line.id === this.selectedLine?.id);
    const copy: NotebookLine = { ...this.selectedLine, id: Date.now() + '-copy', userId: this.currentUserId, authorId: this.currentUserId, authorName: this.currentUserName, authorAvatarUrl: this.currentUserAvatarUrl || undefined };
    this.lines = index < 0 ? [...this.lines, copy] : [...this.lines.slice(0, index + 1), copy, ...this.lines.slice(index + 1)];
    this.saveCurrentPage();
    const page = this.currentPage;
    this.backend.saveElement({
      action: 'save_element', element_id: copy.id, page_id: page?.pageId || `page-${this.pageNumber}`,
      user_id: this.currentUserId, author_name: this.currentUserName,
      author_tag: this.initialsFor(this.currentUserName), line_index: Math.max(0, index + 1), content: copy.text, color: copy.color,
    }).subscribe({ error: () => this.showSuccess('Copie locale créée. Synchronisation en attente.') });
    this.closeLineMenus();
  }

  openLineDeleteActions() {
    if (!this.selectedLine) return;
    this.showLineDeleteActions = true;
  }

  deleteSelectedLine(scope: 'local' | 'everyone' = 'everyone') {
    if (!this.selectedLine) return;
    const target = this.selectedLine;
    const previousLines = this.lines;
    this.lines = this.lines.filter((line) => line.id !== target.id);
    this.saveCurrentPage();
    this.closeLineMenus();
    this.showLineDeleteActions = false;

    if (scope === 'local') {
      this.showSuccess('Message masqué sur cet appareil.');
      return;
    }
    if (!this.canManageLine(target)) {
      this.lines = previousLines;
      this.saveCurrentPage();
      this.showSuccess('Action non autorisée.');
      return;
    }
    this.backend.deleteElement(target.id, this.currentUserId).subscribe({
      next: () => this.showSuccess('Message supprimé pour tout le monde.'),
      error: () => {
        this.lines = previousLines;
        this.saveCurrentPage();
        this.showSuccess('Suppression backend impossible; message restauré.');
      },
    });
  }

  deleteAllPageMessages() {
    if (!this.isCurrentUserPageOwner || !this.currentPage) {
      this.showSuccess('Seul le propriétaire peut vider cette page.');
      return;
    }
    const previousLines = this.lines;
    const pageId = this.currentPage.pageId;
    this.lines = [];
    this.saveCurrentPage();
    this.closeLineMenus();
    this.showLineDeleteActions = false;
    this.backend.deletePageMessages(pageId, this.currentUserId).subscribe({
      next: () => this.showSuccess('Tous les messages ont été supprimés pour tout le monde.'),
      error: () => {
        this.lines = previousLines;
        this.saveCurrentPage();
        this.showSuccess('Suppression impossible; messages restaurés.');
      },
    });
  }

  private closeLineMenus() {
    this.selectedLine = undefined;
    this.showLineMenu = false;
    this.showLineMoreMenu = false;
  }

  private canManageLine(line: NotebookLine): boolean {
    return this.isCurrentUserPageOwner || !(line.authorId || line.userId) || (line.authorId || line.userId) === this.currentUserId;
  }

  toggleLineMoreMenu() {
    this.showLineMoreMenu = !this.showLineMoreMenu;
  }

  toggleSelectedLineStyle(style: 'bold' | 'italic' | 'underline') {
    if (!this.selectedLine) return;
    this.updateSelectedLine({ [style]: !this.selectedLine[style] });
  }

  setSelectedLineAlign(align: NotebookLine['align']) {
    this.updateSelectedLine({ align });
  }

  private updateSelectedLine(changes: Partial<NotebookLine>) {
    if (!this.selectedLine || !this.canManageLine(this.selectedLine)) return;
    const updated = { ...this.selectedLine, ...changes };
    this.lines = this.lines.map((line) => line.id === updated.id ? updated : line);
    this.selectedLine = updated;
    this.saveCurrentPage();
  }
  editSelectedLine() {
    if (!this.selectedLine || !this.canManageLine(this.selectedLine)) return;
    this.editingLineId = this.selectedLine.id;
    this.draftText = this.selectedLine.text;
    this.showLineMenu = false;
    this.showLineMoreMenu = false;
    setTimeout(() => void this.composerInput?.setFocus(), 0);
  }

  updateTypography(key: keyof typeof this.typography, value: string | number | boolean) {
    (this.typography as Record<string, string | number | boolean>)[key] = value;
    if (key === 'font' || key === 'size') localStorage.setItem(`notlab.editor.${key}`, String(value));
  }

  fontFamilyFor(font: string): string {
    const families: Record<string, string> = {
      'Handwriting 1': 'Caveat, cursive',
      'Handwriting 2': 'Patrick Hand, cursive',
      'Handwriting 3': 'Satisfy, cursive',
      Roboto: 'Roboto, sans-serif',
      Poppins: 'Poppins, sans-serif',
      Montserrat: 'Montserrat, sans-serif',
    };
    return families[font] || families['Handwriting 1'];
  }

  chooseEmoji(emoji: string) {
    this.draftText += emoji;
    this.showEmojiPicker = false;
    setTimeout(() => void this.composerInput?.setFocus(), 0);
  }

  onPhoneInput(value: string) {
    this.phoneValue = value;
    this.phoneError = this.isInviteValid ? '' : 'Le numéro doit contenir exactement 8 chiffres.';
  }

  async chooseContact() {
    const contactsApi = (navigator as Navigator & {
      contacts?: { select: (properties: string[], options?: { multiple?: boolean }) => Promise<Array<{ name?: string[]; tel?: string[] }>> };
    }).contacts;

    if (!contactsApi?.select) {
      this.showSuccess('La sélection de contacts n’est pas disponible dans ce navigateur.');
      return;
    }

    try {
      const contacts = await contactsApi.select(['name', 'tel'], { multiple: false });
      const contact = contacts[0];
      const phone = contact?.tel?.[0] || '';
      if (!contact || !phone) {
        this.showSuccess('Ce contact n’a pas de numéro de téléphone.');
        return;
      }
      this.contactName = contact.name?.[0] || '';
      this.onPhoneInput(phone);
    } catch {
      // The user cancelled the native contact picker.
    }
  }

  openCollabSheet() { this.showCollabSheet = true; }
  closeCollabSheet() { this.showCollabSheet = false; }

  invitePerson() {
    if (!this.isInviteValid) {
      this.phoneError = 'Le numéro doit contenir exactement 8 chiffres.';
      return;
    }
    const normalizedPhone = this.phoneValue.replace(/\s+/g, '');
    const memberName = this.contactName.trim() || normalizedPhone;
    const memberId = 'phone:' + this.countryCode + normalizedPhone;
    this.collaborators = [...this.collaborators, {
      id: memberId,
      name: memberName,
      online: false,
      presenceKnown: false,
      canWrite: true,
      color: this.stableAuthorColor(memberId),
      initials: this.initialsFor(memberName),
    }];
    this.phoneValue = '';
    this.contactName = '';
    this.phoneError = '';
    this.showCollabSheet = false;
  }

  openAttachmentPicker(type: 'image' | 'photo' | 'file') {
    this.attachmentType = type;
    const picker = this.attachmentPicker?.nativeElement;
    if (!picker) return;
    picker.accept = type === 'file' ? '*/*' : 'image/*';
    picker.capture = type === 'photo' ? 'environment' : '';
    picker.value = '';
    picker.click();
  }

  onAttachmentSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const label = this.attachmentType === 'photo' ? 'Photo' : this.attachmentType === 'image' ? 'Image' : 'Fichier';
    this.addAttachmentLine(`[${label}: ${file.name}]`);
  }

  addAttachmentLine(text: string) {
    this.showAttachmentActions = false;
    this.draftText = text;
    this.sendLine();
  }

  async toggleVoiceRecording() {
    if (this.isRecordingVoice) {
      this.voiceRecorder?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      this.showSuccess('L’enregistrement vocal n’est pas disponible.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.voiceChunks = [];
      this.voiceRecorder = new MediaRecorder(stream);
      this.voiceRecorder.ondataavailable = (event) => this.voiceChunks.push(event.data);
      this.voiceRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        this.isRecordingVoice = false;
        this.addAttachmentLine('[Note vocale enregistrée]');
      };
      this.voiceRecorder.start();
      this.isRecordingVoice = true;
      this.showSuccess('Enregistrement vocal en cours. Ouvrez le menu pour arrêter.');
    } catch {
      this.showSuccess('L’accès au microphone a été refusé.');
    }
  }

  onTogglePermission(member: Collaborator) { member.canWrite = !member.canWrite; }

  handleProjectOption(option: 'pages' | 'settings' | 'sync') {
    if (option === 'pages') {
      this.showAllPages = true;
    } else if (option === 'sync') {
      this.saveCurrentPage();
      this.syncPagesToBackend();
      const elements = this.lines.map((line, index) => {
        const author = this.authorForLine(line);
        return {
          action: 'save_element' as const,
          element_id: line.id,
          page_id: this.pages.find((page) => page.pageNumber === this.pageNumber)?.pageId || 'page-' + this.pageNumber,
          user_id: author.id,
          author_name: author.name,
          author_tag: author.initials,
          line_index: index,
          content: line.text,
          color: line.color,
        };
      });
      this.backend.syncBatch(elements).subscribe({
        next: () => this.projectMessage = 'Synchronisation Google Sheets réussie.',
        error: () => this.projectMessage = 'Synchronisation en attente. Données locales conservées.',
      });
    } else {
      this.projectMessage = 'Paramètres du projet';
    }
    this.showProjectOptions = false;
    setTimeout(() => this.projectMessage = '', 2200);
  }

  private storageKey() { return `notlab.editor.page.${this.pageNumber}`; }

  private saveCurrentPage() {
    const page = this.pages.find((item) => item.pageNumber === this.pageNumber);
    if (page) page.lines = this.lines;
    this.persistPages();
  }

  private loadTotalPages(): number {
    const savedTotal = Number(localStorage.getItem('notlab.editor.totalPages'));
    return Number.isInteger(savedTotal) && savedTotal > 0 ? savedTotal : 10;
  }

  private loadPages(): NotebookPage[] {
    try {
      const saved = JSON.parse(localStorage.getItem('notlab.editor.pages') || 'null') as NotebookPage[] | null;
      if (saved?.length) {
        if (localStorage.getItem('notlab.editor.seeded') === 'true') {
          localStorage.removeItem('notlab.editor.pages');
          localStorage.removeItem('notlab.editor.totalPages');
          localStorage.removeItem('notlab.editor.seeded');
          return [];
        }
        const migrated = saved.map((page) => ({
          ...page,
          ownerUserId: page.ownerUserId || this.currentUserId,
          lines: (page.lines || []).map((line) => {
            const authorId = line.authorId || line.userId || page.ownerUserId || this.currentUserId;
            return {
              ...line,
              userId: authorId,
              authorId,
              authorName: line.authorName || (authorId === this.currentUserId ? this.currentUserName : undefined),
            };
          }),
        }));
        this.totalPages = migrated.length;
        this.pageNumbers = migrated.map((page) => page.pageNumber);
        return migrated;
      }
    } catch { /* Use the empty frontend adapter below. */ }

    this.totalPages = 0;
    this.pageNumbers = [];
    return [];
  }

  private persistPages() {
    localStorage.setItem('notlab.editor.pages', JSON.stringify(this.pages));
    localStorage.setItem('notlab.editor.totalPages', String(this.pages.length));
  }

  private syncPagesToBackend() {
    const payload: BackendPage[] = this.pages.map((page) => ({
      page_id: page.pageId,
      page_number: page.pageNumber,
      title: page.name,
      line_count: page.lines.length,
      created_at: page.createdAt,
      modified_at: new Date().toISOString(),
      owner_user_id: page.ownerUserId || this.currentUserId,
    }));
    this.backend.syncPages(payload, this.currentUserId).subscribe({ error: () => undefined });
  }
}
