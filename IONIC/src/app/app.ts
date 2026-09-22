import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
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
  backspaceOutline,
  barChartOutline,
  bookOutline,
  cameraOutline,
  calculatorOutline,
  calendarOutline,
  checkboxOutline,
  chevronBackOutline,
  chevronForwardOutline,
  closeOutline,
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
  gridOutline,
  linkOutline,
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
  backspaceOutline,
  barChartOutline,
  bookOutline,
  cameraOutline,
  calculatorOutline,
  calendarOutline,
  checkboxOutline,
  chevronBackOutline,
  chevronForwardOutline,
  closeOutline,
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
  gridOutline,
  linkOutline,
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

type PageBlockType = 'TEXT' | 'CHECKLIST' | 'POLL' | 'TABLE' | 'FORMULA' | 'IMAGE' | 'FILE' | 'LINK' | 'VOICE' | 'DRAWING' | 'DATE' | 'SHAPE';

interface PageBlock {
  id: string;
  pageId: string;
  authorId: string;
  type: PageBlockType;
  position: number;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface TableColumn {
  id: string;
  name: string;
}

interface TableRow {
  id: string;
  cells: Record<string, string>;
}

interface CalculatorHistoryItem {
  expression: string;
  result: number;
  createdAt: string;
}

interface NotebookPage {
  pageId: string;
  pageNumber: number;
  name: string;
  createdAt: string;
  lines: NotebookLine[];
  ownerUserId: string;
  paperType?: 'lined' | 'draft';
  blocks?: PageBlock[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, IonActionSheet, IonAlert, IonApp, IonContent, IonIcon, IonInput, IonPopover, IonToast, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit, OnDestroy {
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
  isDynamicMode = false;
  showDynamicTextEditor = false;
  showDateTimeEditor = false;
  dynamicTextEditingMode = false;
  showFormulaEditor = false;
  formulaDraft = '';
  calculatorResult?: number;
  calculatorError = '';
  calculatorMode: 'standard' | 'scientific' | 'history' = 'standard';
  calculatorAngleMode: 'DEG' | 'RAD' = 'DEG';
  showScientificKeys = false;
  calculatorHistory: CalculatorHistoryItem[] = this.loadCalculatorHistory();
  private calculatorClearTimer?: number;
  formulaResultDraft: Record<string, string> = {};
  formulaValidation: Record<string, 'correct' | 'incorrect'> = {};
  dynamicTextPosition = { top: 72, left: 18 };
  dateTimeDraft = '';
  clockTick = Date.now();
  private dateTimer?: number;
  drawingTool: 'pencil' | 'highlighter' | 'eraser' = 'pencil';
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

  private loadedProjectId = localStorage.getItem('notlab.activeProjectId') || `project:${this.currentUserId}`;
  private readonly legacyProjectId = localStorage.getItem('notlab.activeProjectId');
  pages: NotebookPage[] = [];
  lines: NotebookLine[] = [];
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
    { text: 'Anile', role: 'cancel' },
    { text: 'Efase', role: 'destructive', handler: () => this.deleteSelectedPage() },
  ];

  renameAlertButtons = [
    { text: 'Anile', role: 'cancel' },
    { text: 'Anrejistre', handler: (data: { name: string }) => this.renameSelectedPage(data.name) },
  ];

  renameAlertInputs = [{ name: 'name', value: '', placeholder: 'Non paj la' }];

  attachmentActionButtons = [
    { text: 'Capture rapide', icon: 'add-circle-outline', handler: () => this.startQuickCapture() },
    { text: 'Page dynamique', icon: 'documents-outline', handler: () => this.openDynamicPageMode() },
    { text: 'Collaboration', icon: 'people-outline', handler: () => this.openCollabSheet() },
    { text: 'Note avec étiquette', icon: 'pricetag-outline', handler: () => this.quickNoteWithLabel() },
    { text: 'Commentaires', icon: 'send-outline', handler: () => this.openCommentsPanel() },
    { text: 'Exporter PDF / partager', icon: 'cloud-upload-outline', handler: () => this.exportOrShare() },
    { text: 'Sondage', icon: 'bar-chart-outline', handler: () => this.createDynamicPoll() },
    { text: 'Image', icon: 'image-outline', handler: () => this.openAttachmentPicker('image') },
    { text: 'Photo', icon: 'camera-outline', handler: () => this.openAttachmentPicker('photo') },
    { text: 'Fichier', icon: 'document-attach-outline', handler: () => this.openAttachmentPicker('file') },
    { text: 'Note vocale', icon: 'mic-outline', handler: () => this.toggleVoiceRecording() },
    { text: 'Liste', icon: 'checkbox-outline', handler: () => this.addAttachmentLine('[ ] ') },
    { text: 'Tableau', icon: 'grid-outline', handler: () => this.createDefaultTable() },
    { text: 'Séparateur', icon: 'grid-outline', handler: () => this.openSeparatorEditor() },
    { text: 'Calculer', icon: 'calculator-outline', handler: () => this.openFormulaEditor() },
    { text: 'Lien', icon: 'link-outline', handler: () => this.addAttachmentLine('[Lyen] ') },
    { text: 'Date / rappel', icon: 'calendar-outline', handler: () => this.openDynamicDateEditor() },
    { text: 'Étiquette', icon: 'pricetag-outline', handler: () => this.addAttachmentLine('# ') },
    { text: 'Annuler', role: 'cancel' },
  ];

  get currentUserId(): string { return localStorage.getItem('notlab.userId') || 'web-user'; }
  get currentUserName(): string { return localStorage.getItem('notlab.currentUserName') || 'Utilisateur'; }
  get currentUserAvatarUrl(): string { return localStorage.getItem('notlab.currentUserAvatar') || ''; }
  get currentProjectId(): string { return this.loadedProjectId; }
  get currentProjectTitle(): string { return localStorage.getItem('notlab.activeProjectTitle') || 'Projet Notlab'; }
  get collaborationIconName(): string { return this.collaboratorCount > 1 ? 'people-outline' : 'person-outline'; }
  get canUndoDrawing(): boolean { return this.drawingHistory.length > 1; }
  get canRedoDrawing(): boolean { return this.drawingRedoHistory.length > 0; }

  ngAfterViewInit() {
    this.resizeDrawingCanvas();
    setTimeout(() => this.loadDrawing(), 0);
    this.dateTimer = window.setInterval(() => this.clockTick = Date.now(), 1000);
  }

  ngOnDestroy() {
    if (this.dateTimer) window.clearInterval(this.dateTimer);
  }

  @HostListener('document:click', ['$event'])
  closePanelsOnOutsideClick(event: Event) {
    const target = event.target as HTMLElement | null;
    if (this.isDynamicMode && target?.closest('.notebook-paper')) return;
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
    this.showDynamicTextEditor = false;
    this.showDateTimeEditor = false;
    this.dynamicTextEditingMode = false;
  }

  handleEditorPointerDown(event: PointerEvent) {
    if (event.pointerType !== 'touch') return;
    this.activeTouchPointers.add(event.pointerId);
    if (this.activeTouchPointers.size !== 2) return;
    const now = Date.now();
    if (now - this.lastTwoFingerTap < 450) {
      this.toggleEditorMode();
      this.lastTwoFingerTap = 0;
    } else {
      this.lastTwoFingerTap = now;
    }
  }

  handleEditorPointerUp(event: PointerEvent) {
    this.activeTouchPointers.delete(event.pointerId);
  }

  toggleEditorMode() {
    this.stopDrawing();
    this.closeFloatingPanels();
    this.showAttachmentActions = false;
    this.isDrawingMode = false;
    this.isDynamicMode = !this.isDynamicMode;
    this.dynamicTextEditingMode = this.isDynamicMode;
  }

  addDynamicChecklist() {
    this.addAttachmentLine('[ ] ');
  }

  addDynamicLabel() {
    this.addAttachmentLine('# ');
  }

  get currentTableBlocks(): PageBlock[] {
    return (this.currentPage?.blocks || []).filter((block) => block.type === 'TABLE');
  }

  get currentDateBlocks(): PageBlock[] {
    return (this.currentPage?.blocks || []).filter((block) => block.type === 'DATE');
  }

  dateBlockTarget(block: PageBlock): Date | undefined {
    const targetAt = String(block.data['targetAt'] || '');
    const target = new Date(targetAt);
    return targetAt && !Number.isNaN(target.getTime()) ? target : undefined;
  }

  dateBlockCountdown(block: PageBlock): string {
    const target = this.dateBlockTarget(block);
    if (!target) return 'Dat la pa valab';
    const remainingSeconds = Math.max(0, Math.floor((target.getTime() - this.clockTick) / 1000));
    const days = Math.floor(remainingSeconds / 86400);
    const hours = Math.floor((remainingSeconds % 86400) / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    const time = [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
    return days ? `${days} jou ${time}` : time;
  }

  dateBlockLabel(block: PageBlock): string {
    const target = this.dateBlockTarget(block);
    return target ? this.formatDynamicDateTime(target) : 'Dat / lè';
  }

  tableColumns(block: PageBlock): TableColumn[] {
    return (block.data['columns'] as TableColumn[] | undefined) || [];
  }

  tableRows(block: PageBlock): TableRow[] {
    return (block.data['rows'] as TableRow[] | undefined) || [];
  }

  createDefaultTable() {
    this.showAttachmentActions = false;
    const columns: TableColumn[] = Array.from({ length: 3 }, (_, index) => ({ id: `col-${Date.now()}-${index}`, name: String(index + 1) }));
    const rows: TableRow[] = Array.from({ length: 3 }, (_, rowIndex) => ({
      id: `row-${Date.now()}-${rowIndex}`,
      cells: Object.fromEntries(columns.map((column) => [column.id, ''])),
    }));
    this.addPageBlock('TABLE', { title: 'Nouveau tableau', columns, rows });
  }

  openSeparatorEditor() {
    this.showAttachmentActions = false;
    const value = window.prompt('Combien de colonnes voulez-vous sur cette page ? (2 à 6)', String(this.currentSeparatorCount || 2));
    if (value === null) return;
    const count = Number.parseInt(value, 10);
    if (!Number.isInteger(count) || count < 2 || count > 6) {
      this.showSuccess('Choisissez un nombre de colonnes entre 2 et 6.', 'danger');
      return;
    }

    const existing = this.currentSeparatorBlock;
    if (existing) {
      existing.data['columns'] = count;
      existing.updatedAt = new Date().toISOString();
      this.persistPages();
      this.showSuccess('Séparateur mis à jour.');
      return;
    }

    this.addPageBlock('SHAPE', { shape: 'separator', columns: count });
    this.showSuccess(`${count} colonnes prêtes pour vos exercices.`);
  }

  get currentSeparatorBlock(): PageBlock | undefined {
    return (this.currentPage?.blocks || []).find((block) => block.type === 'SHAPE' && block.data['shape'] === 'separator');
  }

  get currentSeparatorCount(): number {
    const count = Number(this.currentSeparatorBlock?.data['columns']);
    return Number.isInteger(count) && count >= 2 ? count : 0;
  }

  separatorIndexes(block: PageBlock): number[] {
    const count = Number(block.data['columns']);
    return Number.isInteger(count) && count >= 2 ? Array.from({ length: count - 1 }, (_, index) => index + 1) : [];
  }

  separatorPosition(block: PageBlock, index: number): number {
    const count = Number(block.data['columns']);
    return count >= 2 ? (index * 100) / count : 0;
  }

  addTableRow(block: PageBlock) {
    const columns = this.tableColumns(block);
    const rows = this.tableRows(block);
    rows.push({ id: `row-${Date.now()}-${rows.length}`, cells: Object.fromEntries(columns.map((column) => [column.id, ''])) });
    this.persistPages();
  }

  addTableColumn(block: PageBlock) {
    const columns = this.tableColumns(block);
    const id = `col-${Date.now()}-${columns.length}`;
    columns.push({ id, name: String(columns.length + 1) });
    this.tableRows(block).forEach((row) => row.cells[id] = '');
    this.persistPages();
  }

  updateTableCell(block: PageBlock) {
    block.updatedAt = new Date().toISOString();
    this.persistPages();
  }

  createDynamicPoll() {
    const question = window.prompt('Kesyon sondaj la:')?.trim();
    if (!question) return;
    const options = window.prompt('Opsyon yo, separe yo ak vigil:')?.trim();
    if (!options) return;
    const formattedOptions = options.split(',').map((option) => option.trim()).filter(Boolean).join(' | ');
    if (!formattedOptions) return;
    this.addAttachmentLine(`[Sondaj] ${question} :: ${formattedOptions}`);
  }

  startQuickCapture() {
    this.showAttachmentActions = false;
    this.draftText = '';
    this.dynamicTextEditingMode = true;
    this.showDynamicTextEditor = true;
    this.dynamicTextPosition = { top: 72, left: 18 };
    this.showSuccess('Capture rapid aktiv.');
  }

  openDynamicPageMode() {
    this.showAttachmentActions = false;
    this.addPage('draft');
    this.showSuccess('Paj dinamik ouvri.');
  }

  quickNoteWithLabel() {
    this.showAttachmentActions = false;
    this.addAttachmentLine('# ');
    this.showSuccess('Nòt ak etikèt pare.');
  }

  openCommentsPanel() {
    this.showAttachmentActions = false;
    this.showSuccess('Kòmantè yo disponib pou paj sa a.');
  }

  exportOrShare() {
    this.showAttachmentActions = false;
    const shareData = {
      title: this.currentProjectTitle,
      text: `NotLab - ${this.currentProjectTitle}`,
      url: window.location.href,
    };

    if (navigator.share) {
      void navigator.share(shareData).catch(() => undefined);
      return;
    }

    if (navigator.clipboard) {
      void navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`).catch(() => undefined);
      this.showSuccess('Lyen an te kopye pou pataje.');
      return;
    }

    this.showSuccess('Eksport PDF / pataje ap vini nan vèsyon pwochen.');
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

  selectDrawingTool(tool: 'pencil' | 'highlighter' | 'eraser') {
    this.drawingTool = tool;
    this.isDrawingMode = true;
  }

  startDynamicText() {
    this.showAttachmentActions = false;
    this.draftText = '';
    this.dynamicTextEditingMode = true;
    this.showDynamicTextEditor = false;
    this.showDateTimeEditor = false;
    this.showSuccess('Mòd tèks aktif. Klike sou paj la pou ekri.');
  }

  openDynamicDateEditor() {
    this.showAttachmentActions = false;
    this.showDynamicTextEditor = false;
    this.showFormulaEditor = false;
    this.dateTimeDraft = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 19);
    this.showDateTimeEditor = true;
    this.dynamicTextEditingMode = true;
  }

  saveDynamicDateReminder() {
    const value = this.dateTimeDraft.trim();
    if (!value) return;

    const selectedDate = new Date(value);
    if (Number.isNaN(selectedDate.getTime())) {
      this.showSuccess('Dat / lè a pa valab. Chwazi yon dat valab.');
      return;
    }

    this.showDateTimeEditor = false;
    this.addPageBlock('DATE', {
      content: this.formatDynamicDateTime(selectedDate),
      targetAt: selectedDate.toISOString(),
    });
    this.showSuccess('Rapèl dinamik la ap konte kounye a.');
  }

  private formatDynamicDateTime(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }

  deleteDynamicSelection() {
    if (this.selectedLine) {
      this.deleteSelectedLine('local');
      return;
    }
    this.showDynamicTextEditor = false;
    this.showFormulaEditor = false;
  }

  openFormulaEditor() {
    this.showAttachmentActions = false;
    this.formulaDraft = '';
    this.calculatorResult = undefined;
    this.calculatorError = '';
    this.calculatorMode = 'standard';
    this.showFormulaEditor = true;
  }

  addFormulaToken(token: string) {
    const normalized = token === '×' ? '*' : token === '÷' ? '/' : token === '−' ? '-' : token;
    const last = this.formulaDraft.slice(-1);
    if (/^[+*/-]$/.test(normalized) && (!this.formulaDraft || /^[+*/-]$/.test(last))) return;
    if (normalized === '.' && (last === '.' || /\d+\.\d*$/.test(this.formulaDraft))) return;
    this.formulaDraft += normalized;
    this.calculatorResult = undefined;
    this.calculatorError = '';
  }

  clearCalculator() {
    this.formulaDraft = '';
    this.calculatorResult = undefined;
    this.calculatorError = '';
  }

  deleteCalculatorCharacter() {
    this.formulaDraft = this.formulaDraft.slice(0, -1);
    this.calculatorResult = undefined;
    this.calculatorError = '';
  }

  toggleCalculatorSign() {
    if (!this.formulaDraft) return;
    this.formulaDraft = this.formulaDraft.startsWith('-') ? this.formulaDraft.slice(1) : `-(${this.formulaDraft})`;
    this.calculatorResult = undefined;
    this.calculatorError = '';
  }

  startCalculatorClear() {
    this.cancelCalculatorClear();
    this.calculatorClearTimer = window.setTimeout(() => this.clearCalculator(), 550);
  }

  cancelCalculatorClear() {
    if (this.calculatorClearTimer) window.clearTimeout(this.calculatorClearTimer);
    this.calculatorClearTimer = undefined;
  }

  setCalculatorMode(mode: 'standard' | 'scientific' | 'history') {
    this.calculatorMode = mode;
  }

  toggleScientificKeys() {
    this.showScientificKeys = !this.showScientificKeys;
  }

  addScientificFunction(functionName: string) {
    if (functionName === 'π' || functionName === 'e') {
      this.addFormulaToken(functionName === 'π' ? 'pi' : 'e');
      return;
    }
    if (functionName === 'x²') {
      this.addFormulaToken('^2');
      return;
    }
    if (functionName === 'xʸ') {
      this.addFormulaToken('^');
      return;
    }
    if (functionName === '1/x') {
      this.formulaDraft = this.formulaDraft ? `1/(${this.formulaDraft})` : '1/(';
      return;
    }
    if (functionName === '|x|') functionName = 'abs';
    if (functionName === '√') functionName = 'sqrt';
    if (functionName === 'x!') functionName = 'factorial';
    this.formulaDraft += `${functionName}(`;
    this.calculatorResult = undefined;
    this.calculatorError = '';
  }

  toggleCalculatorAngleMode() {
    this.calculatorAngleMode = this.calculatorAngleMode === 'DEG' ? 'RAD' : 'DEG';
  }

  calculateDraft() {
    const expression = this.formulaDraft.trim();
    const result = this.calculateFormula(expression);
    if (result === undefined) {
      this.calculatorResult = undefined;
      this.calculatorError = 'Expression invalide ou opération impossible';
      return;
    }
    this.calculatorResult = result;
    this.calculatorError = '';
    if (expression) this.addCalculatorHistory(expression, result);
  }

  saveFormula() {
    const formula = this.formulaDraft.trim();
    if (!formula || this.calculatorResult === undefined) return;
    this.showFormulaEditor = false;
    this.addAttachmentLine(`[Formule] ${formula}`, { expectedResult: this.calculatorResult });
    this.calculatorResult = undefined;
  }

  formattedCalculatorResult(): string {
    return this.calculatorResult === undefined ? '' : this.formatCalculatorNumber(this.calculatorResult);
  }

  formatCalculatorNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 10 }).format(value);
  }

  private addCalculatorHistory(expression: string, result: number) {
    this.calculatorHistory = [
      { expression, result, createdAt: new Date().toISOString() },
      ...this.calculatorHistory.filter((item) => item.expression !== expression),
    ].slice(0, 30);
    localStorage.setItem('notlab.calculator.history', JSON.stringify(this.calculatorHistory));
  }

  private loadCalculatorHistory(): CalculatorHistoryItem[] {
    try {
      const saved = JSON.parse(localStorage.getItem('notlab.calculator.history') || '[]');
      return Array.isArray(saved) ? saved.filter((item): item is CalculatorHistoryItem => typeof item?.expression === 'string' && Number.isFinite(item?.result)).slice(0, 30) : [];
    } catch {
      return [];
    }
  }

  reuseCalculatorHistory(item: CalculatorHistoryItem) {
    this.calculatorMode = 'standard';
    this.formulaDraft = item.expression;
    this.calculatorResult = item.result;
    this.calculatorError = '';
  }

  copyCalculatorResult(item: CalculatorHistoryItem) {
    void navigator.clipboard?.writeText(String(item.result));
  }

  insertCalculatorHistory(item: CalculatorHistoryItem) {
    this.showFormulaEditor = false;
    this.addAttachmentLine(`[Formule] ${item.expression}`, { expectedResult: item.result });
  }

  deleteCalculatorHistory(item: CalculatorHistoryItem) {
    this.calculatorHistory = this.calculatorHistory.filter((entry) => entry !== item);
    localStorage.setItem('notlab.calculator.history', JSON.stringify(this.calculatorHistory));
  }

  clearCalculatorHistory() {
    this.calculatorHistory = [];
    localStorage.removeItem('notlab.calculator.history');
  }

  get currentFormulaBlocks(): PageBlock[] {
    return (this.currentPage?.blocks || []).filter((block) => block.type === 'FORMULA');
  }

  formulaExpression(block: PageBlock): string {
    return String(block.data['expression'] || block.data['content'] || '').replace(/^\[Formule\]\s*/, '');
  }

  formulaResult(block: PageBlock): string {
    const expression = this.formulaExpression(block);
    const result = this.calculateFormula(expression);
    return result === undefined ? 'Ajoute yon ekspresyon nimerik' : String(result);
  }

  formulaResults(block: PageBlock): string[] {
    return Array.isArray(block.data['results']) ? block.data['results'].filter((result): result is string => typeof result === 'string') : [];
  }

  addFormulaResult(block: PageBlock) {
    const value = (this.formulaResultDraft[block.id] || '').trim();
    if (!value) {
      this.formulaValidation[block.id] = 'incorrect';
      return;
    }
    const storedExpected = Number(block.data['expectedResult']);
    const expected = Number.isFinite(storedExpected) ? storedExpected : this.calculateFormula(this.formulaExpression(block));
    const answer = Number(value.replace(',', '.'));
    if (expected === undefined || !Number.isFinite(answer)) {
      this.formulaValidation[block.id] = 'incorrect';
      return;
    }

    this.formulaValidation[block.id] = Math.abs(answer - expected) < 0.000001 ? 'correct' : 'incorrect';
  }

  formulaValidationMessage(block: PageBlock): string {
    const validation = this.formulaValidation[block.id];
    if (validation === 'correct') return 'Réponse correcte';
    if (validation === 'incorrect') return 'Réponse incorrecte';
    return '';
  }

  private calculateFormula(expression: string): number | undefined {
    const normalized = expression.replace(/,/g, '.').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\s+/g, '').replace(/π/g, 'pi');
    let index = 0;
    const parseExpression = (): number | undefined => {
      let value = parseTerm();
      while (value !== undefined && (normalized[index] === '+' || normalized[index] === '-')) {
        const operator = normalized[index++];
        const right = parseTerm();
        if (right === undefined) return undefined;
        value = operator === '+' ? value + right : value - right;
      }
      return value;
    };
    const parseTerm = (): number | undefined => {
      let value = parsePower();
      while (value !== undefined && (normalized[index] === '*' || normalized[index] === '/' || normalized[index] === '%')) {
        const operator = normalized[index++];
        const right = parsePower();
        if (right === undefined || (operator === '/' && right === 0)) return undefined;
        value = operator === '*' ? value * right : operator === '/' ? value / right : value % right;
      }
      return value;
    };
    const parsePower = (): number | undefined => {
      let value = parseUnary();
      if (value !== undefined && normalized[index] === '^') {
        index++;
        const exponent = parsePower();
        if (exponent === undefined) return undefined;
        value = Math.pow(value, exponent);
      }
      return value;
    };
    const parseUnary = (): number | undefined => {
      if (normalized[index] === '+') { index++; return parseUnary(); }
      if (normalized[index] === '-') { index++; const value = parseUnary(); return value === undefined ? undefined : -value; }
      return parsePrimary();
    };
    const parsePrimary = (): number | undefined => {
      if (normalized[index] === '(') {
        index++;
        const value = parseExpression();
        if (normalized[index++] !== ')') return undefined;
        return value;
      }
      const functionMatch = normalized.slice(index).match(/^(sin|cos|tan|log|ln|sqrt|abs|factorial)/);
      if (functionMatch) {
        index += functionMatch[0].length;
        if (normalized[index++] !== '(') return undefined;
        const argument = parseExpression();
        if (normalized[index++] !== ')' || argument === undefined) return undefined;
        return this.applyCalculatorFunction(functionMatch[0], argument);
      }
      if (normalized.slice(index, index + 2) === 'pi') { index += 2; return Math.PI; }
      if (normalized[index] === 'e') { index++; return Math.E; }
      const number = normalized.slice(index).match(/^\d+(?:\.\d+)?/);
      if (!number) return undefined;
      index += number[0].length;
      return Number(number[0]);
    };
    const result = parseExpression();
    return result !== undefined && index === normalized.length && Number.isFinite(result) && Math.abs(result) <= Number.MAX_SAFE_INTEGER ? Number(result.toFixed(10)) : undefined;
  }

  private applyCalculatorFunction(name: string, value: number): number | undefined {
    if (name === 'sin' || name === 'cos' || name === 'tan') {
      const angle = this.calculatorAngleMode === 'DEG' ? value * Math.PI / 180 : value;
      return name === 'sin' ? Math.sin(angle) : name === 'cos' ? Math.cos(angle) : Math.tan(angle);
    }
    if (name === 'log') return value > 0 ? Math.log10(value) : undefined;
    if (name === 'ln') return value > 0 ? Math.log(value) : undefined;
    if (name === 'sqrt') return value >= 0 ? Math.sqrt(value) : undefined;
    if (name === 'abs') return Math.abs(value);
    if (name === 'factorial') return value >= 0 && Number.isInteger(value) && value <= 170 ? Array.from({ length: value }, (_, i) => i + 1).reduce((total, current) => total * current, 1) : undefined;
    return undefined;
  }

  startDynamicTextAt(event: MouseEvent) {
    if (!this.isDynamicMode || this.isDrawingMode) return;
    const paper = (event.currentTarget as HTMLElement).closest('.notebook-paper')?.getBoundingClientRect();
    if (!paper) return;
    this.dynamicTextPosition = {
      top: Math.max(58, event.clientY - paper.top - 20),
      left: Math.max(12, Math.min(paper.width - 230, event.clientX - paper.left)),
    };
    this.showAttachmentActions = false;
    this.showDateTimeEditor = false;
    this.showFormulaEditor = false;
    this.editingLineId = undefined;
    this.selectedLine = undefined;
    this.draftText = '';
    this.dynamicTextEditingMode = true;
    this.showDynamicTextEditor = true;
  }

  editDynamicLine(line: NotebookLine, event: Event) {
    if (!this.isDynamicMode || !this.dynamicTextEditingMode) return;
    event.stopPropagation();
    if (!this.canManageLine(line)) return;
    this.editingLineId = line.id;
    this.draftText = line.text;
    this.showDynamicTextEditor = true;
  }

  sendDynamicText() {
    if (!this.draftText.trim()) return;
    this.sendLine();
    this.showDynamicTextEditor = false;
    this.showFormulaEditor = false;
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
    context.globalAlpha = this.drawingTool === 'highlighter' ? 0.35 : 1;
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
    const context = this.drawingCanvas?.nativeElement.getContext('2d');
    if (context) context.globalAlpha = 1;
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
        text: 'Renome',
        icon: 'create-outline',
        disabled: !this.canManageSelectedPage,
        handler: () => this.beginRenameSelectedPage(),
      },
      {
        text: 'Doubli',
        icon: 'documents-outline',
        handler: () => this.duplicateSelectedPage(),
      },
      {
        text: 'Efase',
        icon: 'trash-outline',
        role: 'destructive',
        disabled: !this.canManageSelectedPage || this.pages.length <= 1,
        handler: () => this.beginDeleteSelectedPage(),
      },
      { text: 'Anile', role: 'cancel' },
    ];
  }
  get selectedLabelText(): string {
    return (this.selectedLine?.text || this.draftText || 'Texte sélectionné').trim() || 'Texte sélectionné';
  }

  get lineDeleteActionButtons() {
    const buttons: Array<Record<string, unknown>> = [
      { text: 'Efase pou mwen', handler: () => this.deleteSelectedLine('local') },
    ];
    if (this.canManageSelectedLine) {
      buttons.push({ text: 'Efase pou tout moun', role: 'destructive', handler: () => this.deleteSelectedLine('everyone') });
    }
    if (this.isCurrentUserPageOwner) {
      buttons.push({ text: 'Efase tout mesaj paj la', role: 'destructive', handler: () => this.deleteAllPageMessages() });
    }
    buttons.push({ text: 'Anile', role: 'cancel' });
    return buttons;
  }
  get labelManageActionButtons() {
    return [
      { text: 'Modifye etikèt la', icon: 'create-outline', handler: () => this.beginEditSelectedLabel(false) },
      { text: 'Chanje koulè', icon: 'pricetag-outline', handler: () => this.beginEditSelectedLabel(true) },
      { text: 'Efase etikèt la', icon: 'trash-outline', role: 'destructive', handler: () => this.removeSelectedLabel() },
      { text: 'Anile', role: 'cancel' },
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
    this.pages = this.loadPages();
    this.lines = this.pages[0]?.lines || [];
    this.isEditorRoute = this.router.url === '/notebook';
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.isEditorRoute = (event as NavigationEnd).urlAfterRedirects === '/notebook';
      if (this.isEditorRoute) this.activateNotebook();
      else this.saveCurrentPage();
    });
    this.loadCollaborationState();
    if (this.pages.length) this.syncPageState();
    else this.ensurePageForWriting();
  }

  private activateNotebook() {
    const projectId = localStorage.getItem('notlab.activeProjectId') || `project:${this.currentUserId}`;
    if (projectId !== this.loadedProjectId) {
      this.stopDrawing();
      this.saveCurrentPage();
      this.loadedProjectId = projectId;
      this.pages = this.loadPages();
      this.pageNumber = 1;
      this.lines = this.pages[0]?.lines || [];
      this.draftText = '';
      this.selectedLine = undefined;
      this.closeLineMenus();
      this.closePageManager();
      this.showProjectOptions = false;
      this.isDynamicMode = false;
      this.showDrawingTools = false;
      this.isDrawingMode = false;
      this.activeTouchPointers.clear();
      this.collaborators = [];
      this.collaboratorCount = 1;
      this.loadCollaborationState();
    }
    this.ensurePageForWriting();
    this.syncPageState();
    setTimeout(() => {
      this.resizeDrawingCanvas();
      this.loadDrawing();
    }, 0);
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
      blocks: [],
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
    this.stopDrawing();
    this.closeFloatingPanels();
    this.isDrawingMode = false;
    const defaultPage = this.pages.find((page) => page.paperType !== 'draft');
    if (defaultPage) this.openPage(defaultPage.pageNumber);
    else this.addPage('lined');
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

  addAttachmentLine(text: string, extraData: Record<string, unknown> = {}) {
    this.showAttachmentActions = false;
    const type = text.startsWith('[Sondaj]') ? 'POLL' : text.startsWith('[Tableau]') ? 'TABLE' : text.startsWith('[Formule]') ? 'FORMULA' : text.startsWith('[Lien]') ? 'LINK' : text.startsWith('[Date / Rappel]') ? 'DATE' : text.startsWith('[Note vocale') ? 'VOICE' : text.startsWith('[Image') || text.startsWith('[Photo') ? 'IMAGE' : text.startsWith('[Fichier') ? 'FILE' : text.startsWith('[ ]') ? 'CHECKLIST' : 'TEXT';
    this.addPageBlock(type, type === 'FORMULA' ? { expression: text.replace(/^\[Formule\]\s*/, ''), results: [], ...extraData } : { content: text, ...extraData });
    this.draftText = text;
    this.sendLine();
  }

  private addPageBlock(type: PageBlockType, data: Record<string, unknown>) {
    const page = this.currentPage;
    if (!page) return;
    const now = new Date().toISOString();
    const block: PageBlock = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      pageId: page.pageId,
      authorId: this.currentUserId,
      type,
      position: page.blocks?.length || 0,
      data,
      createdAt: now,
      updatedAt: now,
    };
    page.blocks = [...(page.blocks || []), block];
    this.persistPages();
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
  private pagesStorageKey() {
    return `notlab.editor.pages.${encodeURIComponent(this.currentUserId)}.${encodeURIComponent(this.currentProjectId)}`;
  }

  private saveCurrentPage() {
    const page = this.pages.find((item) => item.pageNumber === this.pageNumber);
    if (page) page.lines = this.lines;
    this.persistPages();
  }

  private loadPages(): NotebookPage[] {
    try {
      const key = this.pagesStorageKey();
      let stored = localStorage.getItem(key);
      // Preserve the old shared snapshot once, under the previously active notebook.
      if (stored === null && this.currentProjectId === this.legacyProjectId
          && !localStorage.getItem('notlab.editor.pages.migratedTo')
          && localStorage.getItem('notlab.editor.seeded') !== 'true') {
        const legacy = localStorage.getItem('notlab.editor.pages');
        if (legacy && Array.isArray(JSON.parse(legacy))) {
          localStorage.setItem(key, legacy);
          localStorage.setItem('notlab.editor.pages.migratedTo', key);
          stored = legacy;
        }
      }
      const saved = JSON.parse(stored || 'null') as NotebookPage[] | null;
      if (Array.isArray(saved) && saved.length) {
        const migrated = saved.map((page, index) => ({
          ...page,
          pageNumber: index + 1,
          ownerUserId: page.ownerUserId || this.currentUserId,
          blocks: Array.isArray(page.blocks) ? page.blocks : [],
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
    localStorage.setItem(this.pagesStorageKey(), JSON.stringify(this.pages));
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
