import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { IonActionSheet, IonAlert, IonApp, IonContent, IonIcon, IonInput, IonPopover, IonToast } from '@ionic/angular';
import { BackendPage, NotlabBackendService } from './notlab-backend.service';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  arrowRedoOutline,
  arrowBackOutline,
  arrowUndoOutline,
  attachOutline,
  bookOutline,
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
  pencilOutline,
  peopleOutline,
  personOutline,
  pricetagOutline,
  reorderFourOutline,
  reorderThreeOutline,
  searchOutline,
  timeOutline,
  sendOutline,
  settingsOutline,
  trashOutline,
} from 'ionicons/icons';

addIcons({
  addCircleOutline,
  arrowRedoOutline,
  arrowBackOutline,
  arrowUndoOutline,
  attachOutline,
  bookOutline,
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
  pencilOutline,
  peopleOutline,
  personOutline,
  pricetagOutline,
  reorderFourOutline,
  reorderThreeOutline,
  searchOutline,
  timeOutline,
  sendOutline,
  settingsOutline,
  trashOutline,
});

interface LabelStyle {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  opacity: number;
}

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
  labelStyle?: LabelStyle;
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
  paperType?: 'lined' | 'draft';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, IonActionSheet, IonAlert, IonApp, IonContent, IonIcon, IonInput, IonPopover, IonToast, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  @ViewChild('composerInput') composerInput?: IonInput;
  @ViewChild('drawingCanvas') drawingCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('attachmentPicker') attachmentPicker?: ElementRef<HTMLInputElement>;
  @ViewChild('galleryPicker') galleryPicker?: ElementRef<HTMLInputElement>;
  @ViewChild('cameraPicker') cameraPicker?: ElementRef<HTMLInputElement>;
  @ViewChild('filePicker') filePicker?: ElementRef<HTMLInputElement>;

  pageNumber = 1;
  totalPages = 0;
  isEditorRoute = false;
  creationDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  draftText = '';
  selectedLine?: NotebookLine;
  showTypography = false;
  showEmojiPicker = false;
  emojiCategory: 'smiley' | 'marker' | 'recent' = 'smiley';
  readonly smileyStickers = ['😀', '😂', '😍', '😎', '🥳', '😢', '😡', '🤔', '👍', '👏', '🙏', '💡', '❤️', '🔥', '🚀', '✅', '✨', '🎉'];
  readonly markerStyles = ['⭐', '🌟', '✨', '💫', '🔖', '📌', '📍', '✅', '☑️', '❗', '❓', '⚠️', '💡', '❤️', '🔥', '🎯', '🏷️', '🔵', '🟢', '🔴'];
  recentStickers = this.loadRecentStickers();
  showCollabSheet = false;
  pendingInvitationCount = 0;
  collaboratorCount = 1;
  isCheckingInvitations = false;
  showPageManager = false;
  showProjectOptions = false;
  showDrawingTools = false;
  isDrawingMode = false;
  showDynamicMode = false;
  drawingTool: 'pencil' | 'eraser' = 'pencil';
  drawingColor = localStorage.getItem('notlab.editor.drawingColor') || '#4b16c7';
  drawingSize = 4;
  showLineMenu = false;
  showLineMoreMenu = false;
  showLineDeleteActions = false;
  showLabelEditor = false;
  showLabelManageActions = false;
  showCustomLabelControls = false;
  showAuthorPopover = false;
  authorPopoverEvent?: Event;
  selectedAuthor?: AuthorView;
  editingLineId?: string;
  lineMenuPosition = { top: 0, left: 0 };
  showAttachmentActions = false;
  showAllPages = false;
  pageSearchQuery = '';
  showPageActions = false;
  showDeleteAlert = false;
  showRenameAlert = false;
  showToast = false;
  selectedPage?: NotebookPage;
  toastMessage = '';
  toastColor: 'primary' | 'success' | 'danger' = 'primary';
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
  private pagePressConsumed = false;
  private linePressTimer?: number;
  private drawingPressTimer?: number;
  private drawingPressConsumed = false;
  private isDrawing = false;
  private drawingHistory: string[] = [];
  private drawingRedoHistory: string[] = [];
  private activeTouchPointers = new Set<number>();
  private lastTwoFingerTap = 0;
  private readonly authorPalette = ['#2563eb', '#059669', '#7c3aed', '#db2777', '#d97706', '#0891b2', '#4f46e5', '#be123c'];
  readonly globalColorPalette = ['#173b7a', '#4b16c7', '#2563eb', '#059669', '#d97706', '#db2777', '#dc2626', '#111827'];
  readonly labelPresets: LabelStyle[] = [
    { id: 'yellow', name: 'Important', backgroundColor: '#FDE68A', textColor: '#1F2937', opacity: 0.9 },
    { id: 'blue', name: 'Design', backgroundColor: '#BFDBFE', textColor: '#0F172A', opacity: 0.9 },
    { id: 'green', name: 'Développement', backgroundColor: '#BBF7D0', textColor: '#14532D', opacity: 0.9 },
    { id: 'purple', name: 'Google', backgroundColor: '#DDD6FE', textColor: '#2E1065', opacity: 0.9 },
    { id: 'pink', name: 'Test', backgroundColor: '#FBCFE8', textColor: '#4C0519', opacity: 0.9 },
    { id: 'orange', name: 'Démo', backgroundColor: '#FED7AA', textColor: '#7C2D12', opacity: 0.9 },
  ];
  labelRecentStyles: LabelStyle[] = this.loadRecentLabelStyles();
  labelEditorDraft: LabelStyle = this.labelPresets[0];
  labelEditorSelectedId = this.labelPresets[0].id;

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
  get currentProjectId(): string { return localStorage.getItem('notlab.activeProjectId') || `project:${this.currentUserId}`; }
  get currentProjectTitle(): string { return localStorage.getItem('notlab.activeProjectTitle') || 'Projet Notlab'; }
  get collaborationIconName(): string { return this.collaboratorCount > 1 ? 'people-outline' : 'person-outline'; }
  get canUndoDrawing(): boolean { return this.drawingHistory.length > 1; }
  get canRedoDrawing(): boolean { return this.drawingRedoHistory.length > 0; }

  ngAfterViewInit() {
    this.resizeDrawingCanvas();
    setTimeout(() => this.loadDrawing(), 0);
  }

  @HostListener('document:click', ['$event'])
  closePanelsOnOutsideClick(event: Event) {
    const target = event.target as HTMLElement | null;
    if (!target || target.closest(
      '.typography-popover, .emoji-picker, .line-menu, .composer-wrap, .editor-header, '
      + '.pages-modal-layout, .label-editor-panel, .modal-sheet, ion-popover, ion-action-sheet, ion-alert, ion-modal'
    )) return;

    this.closeFloatingPanels();
  }

  private closeFloatingPanels() {
    this.showTypography = false;
    this.showEmojiPicker = false;
    this.showProjectOptions = false;
    this.closeLineMenus();
    this.showAuthorPopover = false;
    this.showDrawingTools = false;
    this.showDynamicMode = false;
  }

  handleEditorPointerDown(event: PointerEvent) {
    if (event.pointerType !== 'touch') return;
    this.activeTouchPointers.add(event.pointerId);
    if (this.activeTouchPointers.size !== 2) return;
    const now = Date.now();
    if (now - this.lastTwoFingerTap < 450) {
      this.openDynamicModeOnDraftPage();
      this.lastTwoFingerTap = 0;
    } else {
      this.lastTwoFingerTap = now;
    }
  }

  handleEditorPointerUp(event: PointerEvent) {
    this.activeTouchPointers.delete(event.pointerId);
  }

  private openDynamicModeOnDraftPage() {
    const draftPage = this.pages.find((page) => page.paperType === 'draft');
    if (draftPage && draftPage.pageNumber !== this.pageNumber) {
      this.openPage(draftPage.pageNumber);
    } else if (!draftPage) {
      this.addPage('draft');
    }
    this.isDrawingMode = false;
    this.showDrawingTools = false;
    this.showEmojiPicker = false;
    this.showTypography = false;
    setTimeout(() => this.showDynamicMode = true, 0);
  }

  addDynamicChecklist() {
    this.addAttachmentLine('[ ] ');
    this.showDynamicMode = false;
  }

  addDynamicLabel() {
    this.addAttachmentLine('# ');
    this.showDynamicMode = false;
  }

  createDynamicPoll() {
    const question = window.prompt('Kesyon sondaj la:')?.trim();
    if (!question) return;
    const options = window.prompt('Opsyon yo, separe yo ak vigil:')?.trim();
    if (!options) return;
    const formattedOptions = options.split(',').map((option) => option.trim()).filter(Boolean).join(' | ');
    if (!formattedOptions) return;
    this.addAttachmentLine(`[Sondaj] ${question} :: ${formattedOptions}`);
    this.showDynamicMode = false;
  }

  toggleDrawingMode() {
    if (this.drawingPressConsumed) {
      this.drawingPressConsumed = false;
      return;
    }
    this.isDrawingMode = !this.isDrawingMode;
    if (this.isDrawingMode) this.showDrawingTools = false;
  }

  startDrawingToolPress() {
    this.cancelDrawingToolPress();
    this.drawingPressConsumed = false;
    this.drawingPressTimer = window.setTimeout(() => {
      this.drawingPressConsumed = true;
      this.showDrawingTools = true;
      this.isDrawingMode = true;
    }, 500);
  }

  cancelDrawingToolPress() {
    if (this.drawingPressTimer) window.clearTimeout(this.drawingPressTimer);
    this.drawingPressTimer = undefined;
  }

  selectDrawingTool(tool: 'pencil' | 'eraser') {
    this.drawingTool = tool;
    this.isDrawingMode = true;
  }

  setDrawingSize(size: number) {
    this.drawingSize = Math.max(1, Math.min(24, size));
  }

  setDrawingColor(color: string) {
    this.drawingColor = color;
    localStorage.setItem('notlab.editor.drawingColor', color);
    this.drawingTool = 'pencil';
    this.isDrawingMode = true;
  }

  private resizeDrawingCanvas() {
    const canvas = this.drawingCanvas?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.resizeDrawingCanvas();
    this.loadDrawing();
  }

  startDrawing(event: PointerEvent) {
    if (!this.isDrawingMode) return;
    const canvas = this.drawingCanvas?.nativeElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const point = this.drawingPoint(event, canvas);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = this.drawingSize;
    context.strokeStyle = this.drawingTool === 'eraser' ? '#ffffff' : this.drawingColor;
    this.isDrawing = true;
    canvas.setPointerCapture(event.pointerId);
  }

  draw(event: PointerEvent) {
    if (!this.isDrawing) return;
    const canvas = this.drawingCanvas?.nativeElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const events = event.getCoalescedEvents ? event.getCoalescedEvents() : [event];
    events.forEach((coalescedEvent) => {
      const point = this.drawingPoint(coalescedEvent, canvas);
      context.lineTo(point.x, point.y);
      context.stroke();
      context.beginPath();
      context.moveTo(point.x, point.y);
    });
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.saveDrawingSnapshot();
  }

  undoDrawing() {
    if (this.drawingHistory.length <= 1) return;
    const current = this.drawingHistory.pop();
    if (current) this.drawingRedoHistory.push(current);
    this.restoreDrawing(this.drawingHistory[this.drawingHistory.length - 1]);
  }

  redoDrawing() {
    const next = this.drawingRedoHistory.pop();
    if (!next) return;
    this.drawingHistory.push(next);
    this.restoreDrawing(next);
  }

  private drawingPoint(event: PointerEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private saveDrawingSnapshot() {
    const canvas = this.drawingCanvas?.nativeElement;
    if (!canvas) return;
    const snapshot = canvas.toDataURL();
    if (this.drawingHistory[this.drawingHistory.length - 1] === snapshot) return;
    this.drawingHistory.push(snapshot);
    this.drawingRedoHistory = [];
    localStorage.setItem(this.drawingStorageKey(), snapshot);
  }

  private restoreDrawing(snapshot?: string) {
    const canvas = this.drawingCanvas?.nativeElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !snapshot) return;
    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      context.drawImage(image, 0, 0, canvas.clientWidth, canvas.clientHeight);
    };
    image.src = snapshot;
  }

  private loadDrawing() {
    const canvas = this.drawingCanvas?.nativeElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    const snapshot = localStorage.getItem(this.drawingStorageKey());
    if (snapshot) {
      this.restoreDrawing(snapshot);
      this.drawingHistory = [snapshot];
    } else {
      this.drawingHistory = [canvas.toDataURL()];
    }
    this.drawingRedoHistory = [];
  }

  private drawingStorageKey() { return `notlab.editor.drawing.${this.currentPage?.pageId || this.pageNumber}`; }
  get currentPage(): NotebookPage | undefined { return this.pages.find((page) => page.pageNumber === this.pageNumber); }
  get filteredPages(): NotebookPage[] {
    const query = this.pageSearchQuery.trim().toLowerCase();
    if (!query) return this.pages;
    return this.pages.filter((page) => page.name.toLowerCase().includes(query) || String(page.pageNumber).includes(query));
  }
  get isCurrentUserPageOwner(): boolean {
    return !!this.currentPage && (!this.currentPage.ownerUserId || this.currentPage.ownerUserId === this.currentUserId);
  }
  get canManageSelectedPage(): boolean {
    return !!this.selectedPage && (!this.selectedPage.ownerUserId || this.selectedPage.ownerUserId === this.currentUserId);
  }
  get canManageSelectedLine(): boolean {
    return !!this.selectedLine && this.canManageLine(this.selectedLine);
  }

  get pageActionButtons() {
    return [
      {
        text: 'Renommer',
        icon: 'create-outline',
        disabled: !this.canManageSelectedPage,
        handler: () => this.beginRenameSelectedPage(),
      },
      {
        text: 'Dupliquer',
        icon: 'documents-outline',
        handler: () => this.duplicateSelectedPage(),
      },
      {
        text: 'Supprimer',
        icon: 'trash-outline',
        role: 'destructive',
        disabled: !this.canManageSelectedPage || this.pages.length <= 1,
        handler: () => this.beginDeleteSelectedPage(),
      },
      { text: 'Annuler', role: 'cancel' },
    ];
  }
  get selectedLabelText(): string {
    return (this.selectedLine?.text || this.draftText || 'Texte sélectionné').trim() || 'Texte sélectionné';
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
  get labelManageActionButtons() {
    return [
      { text: 'Modifier le label', icon: 'create-outline', handler: () => this.beginEditSelectedLabel(false) },
      { text: 'Changer de couleur', icon: 'pricetag-outline', handler: () => this.beginEditSelectedLabel(true) },
      { text: 'Supprimer le label', icon: 'trash-outline', role: 'destructive', handler: () => this.removeSelectedLabel() },
      { text: 'Annuler', role: 'cancel' },
    ];
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

  openLabelEditor() {
    if (!this.selectedLine) return;
    this.showLineMoreMenu = false;
    this.showEmojiPicker = false;
    this.showTypography = false;

    if (this.selectedLine.labelStyle) {
      this.showLabelManageActions = true;
      return;
    }

    this.prepareLabelEditor(false);
  }

  beginEditSelectedLabel(showCustomControls = false) {
    this.showLabelManageActions = false;
    this.prepareLabelEditor(showCustomControls);
  }

  private prepareLabelEditor(showCustomControls = false) {
    if (!this.selectedLine) return;
    const currentStyle = this.selectedLine.labelStyle;
    const selectedPreset = currentStyle
      ? this.labelPresets.find((preset) => preset.id === currentStyle.id)
      : this.labelPresets[0];

    this.labelEditorSelectedId = selectedPreset ? selectedPreset.id : 'custom';
    this.labelEditorDraft = currentStyle ? { ...currentStyle } : { ...this.labelPresets[0] };
    this.showCustomLabelControls = showCustomControls || (!!currentStyle && !selectedPreset);
    if (showCustomControls) this.labelEditorSelectedId = 'custom';
    this.showLabelEditor = true;
  }

  closeLabelEditor() {
    this.showLabelEditor = false;
    this.showCustomLabelControls = false;
  }

  startCustomLabel() {
    this.showCustomLabelControls = true;
    this.labelEditorSelectedId = 'custom';
    const isPresetName = this.labelPresets.some((preset) => preset.name === this.labelEditorDraft.name);
    this.labelEditorDraft = {
      ...this.labelEditorDraft,
      id: 'custom',
      name: this.selectedLine?.labelStyle?.name || (isPresetName ? 'Label' : this.labelEditorDraft.name) || 'Label',
    };
  }

  applyLabelStyle(style: LabelStyle) {
    if (!this.selectedLine) return;
    const nextStyle: LabelStyle = {
      ...style,
      name: String(style.name || 'Label').trim() || 'Label',
      opacity: Number(style.opacity ?? 0.9),
    };
    const updated = this.updateSelectedLine({ labelStyle: nextStyle });
    if (!updated) return;

    const styleKey = nextStyle.name + ':' + nextStyle.backgroundColor + ':' + nextStyle.textColor;
    this.labelRecentStyles = [
      nextStyle,
      ...this.labelRecentStyles.filter((item) => item.name + ':' + item.backgroundColor + ':' + item.textColor !== styleKey),
    ].slice(0, 6);
    this.persistRecentLabelStyles();
    this.syncLineLabel(updated);
    this.showLabelEditor = false;
    this.showLabelManageActions = false;
    this.showCustomLabelControls = false;
    this.showSuccess('Label appliqué.');
  }

  removeSelectedLabel() {
    if (!this.selectedLine) return;
    const updated = this.updateSelectedLine({ labelStyle: undefined });
    if (!updated) return;
    this.syncLineLabel(updated);
    this.showLabelEditor = false;
    this.showLabelManageActions = false;
    this.showCustomLabelControls = false;
    this.showSuccess('Label supprimé.');
  }

  chooseLabelPreset(style: LabelStyle) {
    this.labelEditorSelectedId = style.id;
    this.labelEditorDraft = { ...style };
    this.showCustomLabelControls = false;
  }

  chooseRecentLabel(style: LabelStyle) {
    this.labelEditorSelectedId = style.id;
    this.labelEditorDraft = { ...style };
    this.showCustomLabelControls = style.id.startsWith('custom-');
  }

  onCustomLabelName(value: string) {
    this.labelEditorDraft = { ...this.labelEditorDraft, name: value };
    this.labelEditorSelectedId = 'custom';
  }

  onCustomLabelColor(property: 'backgroundColor' | 'textColor', value: string) {
    this.labelEditorDraft = { ...this.labelEditorDraft, [property]: value };
    this.labelEditorSelectedId = 'custom';
  }

  onCustomLabelOpacity(value: number) {
    this.labelEditorDraft = { ...this.labelEditorDraft, opacity: Number(value) };
    this.labelEditorSelectedId = 'custom';
  }

  applyCurrentLabelDraft() {
    const preset = this.labelPresets.find((item) => item.id === this.labelEditorSelectedId);
    const isCustom = this.labelEditorSelectedId === 'custom' || this.labelEditorSelectedId.startsWith('custom-');
    const style: LabelStyle = {
      id: isCustom ? 'custom-' + Date.now() : this.labelEditorSelectedId,
      name: String(this.labelEditorDraft.name || preset?.name || 'Label').trim() || 'Label',
      backgroundColor: this.labelEditorDraft.backgroundColor,
      textColor: this.labelEditorDraft.textColor,
      opacity: Number(this.labelEditorDraft.opacity ?? 0.9),
    };
    this.applyLabelStyle(style);
  }

  private syncLineLabel(line: NotebookLine) {
    this.backend.updateElement(
      line.id,
      this.currentUserId,
      line.text,
      line.color,
      line.labelStyle ?? null,
    ).subscribe({
      error: () => this.showSuccess('Label enregistré localement. Synchronisation en attente.'),
    });
  }

  private loadRecentLabelStyles(): LabelStyle[] {
    try {
      const parsed = JSON.parse(localStorage.getItem('notlab.label.recentStyles') || '[]') as LabelStyle[];
      return Array.isArray(parsed)
        ? parsed.filter((style) => style?.id && style?.backgroundColor && style?.textColor).map((style) => this.normalizeLabelStyle(style)!).slice(0, 6)
        : [];
    } catch {
      return [];
    }
  }

  private normalizeLabelStyle(style?: LabelStyle): LabelStyle | undefined {
    if (!style) return undefined;
    const oldPresetNames = ['Jaune', 'Bleu', 'Vert', 'Rose', 'Violet', 'Orange'];
    const preset = this.labelPresets.find((item) => item.id === style.id);
    return preset && oldPresetNames.includes(style.name) ? { ...style, name: preset.name } : style;
  }
  private persistRecentLabelStyles() {
    localStorage.setItem('notlab.label.recentStyles', JSON.stringify(this.labelRecentStyles));
  }
  asLabelBackground(style?: LabelStyle): string {
    if (!style) return '';
    return this.hexToRgba(style.backgroundColor, style.opacity ?? 0.9);
  }

  private hexToRgba(hex: string, opacity: number): string {
    const normalized = hex.replace('#', '');
    const full = normalized.length === 3 ? normalized.split('').map((char) => char + char).join('') : normalized;
    const numeric = Number.parseInt(full, 16);
    const r = (numeric >> 16) & 255;
    const g = (numeric >> 8) & 255;
    const b = numeric & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
    this.loadCollaborationState();
    if (this.pages.length) this.syncPageState();
    else this.ensurePageForWriting();
  }

  private syncPageState() {
    this.totalPages = this.pages.length;
    this.pageNumbers = this.pages.map((page) => page.pageNumber);
  }

  goHome() { void this.router.navigateByUrl('/home'); }

  previousPage() {
    this.openPage(Math.max(1, this.pageNumber - 1));
  }

  nextPage() {
    this.openPage(Math.min(this.totalPages, this.pageNumber + 1));
  }

  openPageManager() {
    this.saveCurrentPage();
    this.showProjectOptions = false;
    this.showPageActions = false;
    this.selectedPage = undefined;
    this.showAllPages = true;
  }

  closePageManager() {
    this.showPageActions = false;
    this.pagePressConsumed = false;
    this.selectedPage = undefined;
    this.showAllPages = false;
    this.pageSearchQuery = '';
  }

  selectPage(page: number) {
    if (this.pagePressConsumed) {
      this.pagePressConsumed = false;
      return;
    }
    this.openPage(page);
    this.closePageManager();
  }

  openPage(pageNumber: number, saveCurrent = true) {
    const page = this.pages.find((item) => item.pageNumber === pageNumber);
    if (!page) return;
    if (saveCurrent) this.saveCurrentPage();
    this.pageNumber = page.pageNumber;
    this.lines = page.lines;
    this.closeLineMenus();
    setTimeout(() => {
      this.resizeDrawingCanvas();
      this.loadDrawing();
    }, 0);
  }
  addPage(paperType: NotebookPage['paperType'] = 'lined') {
    this.saveCurrentPage();
    const pageNumber = this.pages.length + 1;
    const page: NotebookPage = {
      pageId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      pageNumber,
      name: `Page ${pageNumber}`,
      createdAt: this.toLocalCreatedAt(),
      lines: [],
      ownerUserId: this.currentUserId,
      paperType,
    };
    this.pages = [...this.pages, page];
    this.syncPageState();
    this.persistPages();
    this.syncPagesToBackend();
    this.openPage(pageNumber, false);
    this.closePageManager();
    this.showSuccess('Nouvelle page créée.');
    setTimeout(() => void this.composerInput?.setFocus(), 0);
  }
  startPagePress(page: NotebookPage) {
    this.endPagePress();
    this.pagePressConsumed = false;
    this.selectedPage = page;
    this.renameAlertInputs[0].value = page.name;
    this.pagePressTimer = window.setTimeout(() => {
      this.pagePressTimer = undefined;
      this.pagePressConsumed = true;
      this.selectedPage = page;
      this.showPageActions = true;
    }, 550);
  }

  endPagePress() {
    if (this.pagePressTimer) window.clearTimeout(this.pagePressTimer);
    this.pagePressTimer = undefined;
  }

  openPageActions(page: NotebookPage, event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    this.endPagePress();
    this.pagePressConsumed = true;
    this.selectedPage = page;
    this.renameAlertInputs[0].value = page.name;
    this.showPageActions = true;
  }

  closePageActions() {
    this.showPageActions = false;
    this.pagePressConsumed = false;
  }

  beginRenameSelectedPage() {
    if (!this.canManageSelectedPage) {
      this.closePageActions();
      this.showSuccess('Seul le propriétaire peut renommer cette page.', 'danger');
      return;
    }
    this.showPageActions = false;
    this.renameAlertInputs[0].value = this.selectedPage?.name || '';
    this.showRenameAlert = true;
  }

  beginDeleteSelectedPage() {
    if (this.pages.length <= 1) {
      this.closePageActions();
      this.showSuccess('La dernière page ne peut pas être supprimée.', 'danger');
      return;
    }
    if (!this.canManageSelectedPage) {
      this.closePageActions();
      this.showSuccess('Seul le propriétaire peut supprimer cette page.', 'danger');
      return;
    }
    this.showPageActions = false;
    this.showDeleteAlert = true;
  }
  renameSelectedPage(name: string) {
    if (!this.selectedPage || !name.trim()) return;
    if (!this.canManageSelectedPage) {
      this.showRenameAlert = false;
      this.showSuccess('Seul le propriétaire peut renommer cette page.', 'danger');
      return;
    }
    this.selectedPage.name = name.trim();
    this.persistPages();
    this.syncPagesToBackend();
    this.showRenameAlert = false;
    this.showPageActions = false;
    this.showSuccess('Page renommée.');
  }
  deleteSelectedPage() {
    if (!this.selectedPage || this.pages.length <= 1) return;
    if (!this.canManageSelectedPage) {
      this.showDeleteAlert = false;
      this.showSuccess('Seul le propriétaire peut supprimer cette page.', 'danger');
      return;
    }

    this.saveCurrentPage();
    const removedPage = this.selectedPage;
    const removedNumber = removedPage.pageNumber;
    this.pages = this.pages
      .filter((page) => page.pageId !== removedPage.pageId)
      .map((page, index) => ({ ...page, pageNumber: index + 1 }));
    this.syncPageState();

    const nextPageNumber = Math.min(removedNumber, this.totalPages);
    this.persistPages();
    this.backend.deletePage(removedPage.pageId, this.currentUserId).subscribe({ error: () => undefined });
    this.syncPagesToBackend();
    this.selectedPage = undefined;
    this.showDeleteAlert = false;
    this.showPageActions = false;
    this.showAllPages = false;
    this.openPage(nextPageNumber, false);
    this.showSuccess('Page supprimée.', 'success');
  }
  createPageFromProjectMenu() {
    this.showProjectOptions = false;
    this.addPage('draft');
  }

  returnToDefaultPage() {
    this.showProjectOptions = false;
    this.openPage(1);
  }

  deletePageFromProjectMenu() {
    this.showProjectOptions = false;
    this.selectedPage = this.pages.find((page) => page.pageNumber === this.pageNumber);
    this.beginDeleteSelectedPage();
  }

  duplicateSelectedPage() {
    if (!this.selectedPage) return;
    this.saveCurrentPage();
    const sourcePage = this.selectedPage;
    const copy: NotebookPage = {
      ...sourcePage,
      pageId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      pageNumber: sourcePage.pageNumber + 1,
      name: `${sourcePage.name} (copie)`,
      createdAt: this.toLocalCreatedAt(),
      ownerUserId: this.currentUserId,
      lines: sourcePage.lines.map((line) => ({
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
    this.openPage(copy.pageNumber, false);
    this.showPageActions = false;
    this.showAllPages = false;
    this.selectedPage = undefined;
    this.showSuccess('Page dupliquée.');
  }
  showSuccess(message: string, color: 'primary' | 'success' | 'danger' = 'primary') {
    this.toastMessage = message;
    this.toastColor = color;
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
      this.backend.updateElement(updated.id, this.currentUserId, text, updated.color, updated.labelStyle).subscribe({
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
    this.showEmojiPicker = false;
    this.showTypography = false;
    this.showAttachmentActions = false;
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
      createdAt: this.toLocalCreatedAt(),
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
      label_style: copy.labelStyle,
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

  private updateSelectedLine(changes: Partial<NotebookLine>): NotebookLine | undefined {
    if (!this.selectedLine || !this.canManageLine(this.selectedLine)) return undefined;
    const updated = { ...this.selectedLine, ...changes };
    this.lines = this.lines.map((line) => line.id === updated.id ? updated : line);
    this.selectedLine = updated;
    this.saveCurrentPage();
    return updated;
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
    this.recentStickers = [emoji, ...this.recentStickers.filter((item) => item !== emoji)].slice(0, 12);
    localStorage.setItem('notlab.editor.recentStickers', JSON.stringify(this.recentStickers));
    this.showEmojiPicker = false;
    setTimeout(() => void this.composerInput?.setFocus(), 0);
  }

  selectEmojiCategory(category: 'smiley' | 'marker' | 'recent') {
    this.emojiCategory = category;
  }

  private loadRecentStickers(): string[] {
    try {
      const saved = JSON.parse(localStorage.getItem('notlab.editor.recentStickers') || '[]');
      return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === 'string').slice(0, 12) : [];
    } catch {
      return [];
    }
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

  openCollabSheet() {
    if (this.isCheckingInvitations) return;
    this.isCheckingInvitations = true;
    this.loadInvitationsForIcon();
  }

  private loadInvitationsForIcon() {
    if (!this.currentUserId || this.currentUserId === 'web-user') {
      this.isCheckingInvitations = false;
      this.showCollabSheet = true;
      return;
    }
    this.backend.listInvitations(this.currentUserId).subscribe({
      next: (response) => {
        this.pendingInvitationCount = response.invitations?.length || 0;
        this.isCheckingInvitations = false;
        if (this.pendingInvitationCount > 0) {
          void this.router.navigateByUrl('/invitations');
          return;
        }
        this.showCollabSheet = true;
        this.loadCollaborationState();
      },
      error: () => {
        this.isCheckingInvitations = false;
        this.showCollabSheet = true;
        this.loadCollaborationState();
      },
    });
  }
  closeCollabSheet() { this.showCollabSheet = false; }

  openInvitations() {
    this.showCollabSheet = false;
    void this.router.navigateByUrl('/invitations');
  }

  invitePerson() {
    if (!this.isInviteValid) {
      this.phoneError = 'Le numéro doit contenir exactement 8 chiffres.';
      return;
    }
    const normalizedPhone = this.phoneValue.replace(/\s+/g, '');
    const memberName = this.contactName.trim() || normalizedPhone;
    this.backend.createInvitation(this.currentProjectId, this.currentProjectTitle, this.currentUserId, `${this.countryCode}${normalizedPhone}`).subscribe({
      next: (response) => {
        const memberId = response.invitee_user_id || `phone:${this.countryCode}${normalizedPhone}`;
        this.collaborators = [...this.collaborators, {
          id: memberId,
          name: memberName,
          online: false,
          presenceKnown: false,
          canWrite: true,
          color: this.stableAuthorColor(memberId),
          initials: this.initialsFor(memberName),
        }];
        this.collaboratorCount = Math.max(2, this.collaboratorCount);
        this.phoneValue = '';
        this.contactName = '';
        this.phoneError = '';
        this.showCollabSheet = false;
        this.showSuccess('Invitation envoyée.');
      },
      error: (error: Error) => {
        this.phoneError = error.message || 'Invitation impossible.';
      },
    });
  }

  private loadCollaborationState(redirectToInvitations = false) {
    if (!this.currentUserId || this.currentUserId === 'web-user') return;
    this.backend.listInvitations(this.currentUserId).subscribe({
      next: (response) => {
        this.pendingInvitationCount = response.invitations?.length || 0;
        if (redirectToInvitations && this.pendingInvitationCount > 0) this.openInvitations();
      },
      error: () => undefined,
    });
    this.backend.getProjectCollaborators(this.currentProjectId).subscribe({
      next: (response) => {
        this.collaboratorCount = Math.max(1, response.count || 1);
        this.collaborators = (response.collaborators || []).map((member) => ({
          id: member.user_id,
          name: member.name,
          online: false,
          presenceKnown: false,
          canWrite: true,
          color: this.stableAuthorColor(member.user_id),
          initials: this.initialsFor(member.name),
        }));
      },
      error: () => undefined,
    });
  }

  openAttachmentPicker(type: 'image' | 'photo' | 'file') {
    this.attachmentType = type;
    const picker = type === 'image'
      ? this.galleryPicker?.nativeElement
      : type === 'photo'
        ? this.cameraPicker?.nativeElement
        : this.filePicker?.nativeElement;
    if (!picker) return;
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
      this.openPageManager();
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
          label_style: line.labelStyle,
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

  formatPageDate(value: string): string {
    if (!value) return '';
    const localDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    const date = localDate
      ? new Date(Number(localDate[3]), Number(localDate[2]) - 1, Number(localDate[1]))
      : new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
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
        const migrated = saved.map((page, index) => ({
          ...page,
          pageNumber: index + 1,
          ownerUserId: page.ownerUserId || this.currentUserId,
          lines: (page.lines || []).map((line) => {
            const authorId = line.authorId || line.userId || page.ownerUserId || this.currentUserId;
            return {
              ...line,
              userId: authorId,
              authorId,
              authorName: line.authorName || (authorId === this.currentUserId ? this.currentUserName : undefined),
              labelStyle: this.normalizeLabelStyle(line.labelStyle),
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

  private toLocalCreatedAt(date: Date = new Date()): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
