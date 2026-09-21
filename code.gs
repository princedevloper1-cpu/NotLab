/**
 * NOTLAB.APP - Google Sheets backend
 *
 * Copy this entire file into Google Sheets > Extensions > Apps Script.
 * Deploy as Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Existing Kotlin actions:
 *   register_user, save_element, save_stroke, sync_batch
 *
 * Page actions:
 *   sync_pages, delete_page
 *
 * Chat actions:
 *   send_chat_message (POST)
 *   get_chat_messages (GET)
 */

var SHEETS = {
  USERS: 'Users',
  ELEMENTS: 'Elements_Texte',
  STROKES: 'Strokes_Dessin',
  PAGES: 'Pages',
  CHAT: 'Chat_Messages',
  INVITATIONS: 'Invitations'
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('NotLab Base de Donnees')
    .addItem('Initialiser / verifier les tables', 'setupDatabase')
    .addItem('Reparer les numeros de telephone', 'repairUserPhoneNumbers')
    .addToUi();
}

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  initSheet(ss, SHEETS.USERS,
    ['User ID', "Nom d'utilisateur", 'Telephone', "Date d'inscription", 'Statut'], '#1E3A8A');
  initSheet(ss, SHEETS.ELEMENTS,
    ['Element ID', 'Page ID', 'User ID', 'Nom Auteur', 'Tag Auteur', 'Ligne Index', 'Contenu', 'Couleur', 'Derniere Modification', 'Label JSON'], '#0F9D58');
  initSheet(ss, SHEETS.STROKES,
    ['Stroke ID', 'Page ID', 'User ID', 'Type Outil', 'Couleur', 'Epaisseur', 'Points JSON', 'Derniere Modification'], '#E65100');
  initSheet(ss, SHEETS.PAGES,
    ['Page ID', 'Numero Page', 'Titre', 'Nombre Lignes', 'Confidentiel', 'Derniere Modification', 'Owner User ID'], '#5E35B1');
  initSheet(ss, SHEETS.CHAT,
    ['Message ID', 'Project ID', 'Page ID', 'User ID', 'Nom Auteur', 'Auteur Tag', 'Contenu', 'Type', 'Date', 'Statut'], '#2563EB');
  initSheet(ss, SHEETS.INVITATIONS,
    ['Invitation ID', 'Project ID', 'Projet', 'Inviter User ID', 'Inviter Nom', 'Invitee User ID', 'Invitee Telephone', 'Statut', 'Date Creation', 'Date Reponse'], '#D97706');

  // Keep phone numbers as text so +509 is never interpreted as a formula.
  ss.getSheetByName(SHEETS.USERS).getRange('C:C').setNumberFormat('@');

  return jsonResponse({
    status: 'success',
    message: 'Base de donnees NotLab.app initialisee.',
    tables: [SHEETS.USERS, SHEETS.ELEMENTS, SHEETS.STROKES, SHEETS.PAGES, SHEETS.CHAT, SHEETS.INVITATIONS]
  });
}

function initSheet(ss, sheetName, headers, headerColor) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground(headerColor)
    .setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
  return sheet;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    ensureDatabase();
    var data = parsePostData(e);
    var action = data.action || 'register_user';
    var now = new Date().toISOString();

    if (action === 'register_user') return registerUser(data, now);
    if (action === 'verify_user') return verifyUser(data);
    if (action === 'create_invitation') return createInvitation(data, now);
    if (action === 'list_invitations') return listInvitations(data);
    if (action === 'respond_invitation') return respondInvitation(data, now);
    if (action === 'get_shared_projects') return getSharedProjects(data);
    if (action === 'get_project_collaborators') return getProjectCollaborators(data);
    if (action === 'logout_user') return logoutUser(data);
    if (action === 'delete_user') return deleteUser(data);
    if (action === 'save_element') return saveElement(data, now);
    if (action === 'update_element') return updateElement(data, now);
    if (action === 'delete_element') return deleteElement(data);
    if (action === 'delete_page_messages') return deletePageMessages(data, now);
    if (action === 'save_stroke') return saveStroke(data, now);
    if (action === 'sync_batch') return syncBatch(data, now);
    if (action === 'sync_pages') return syncPages(data, now);
    if (action === 'delete_page') return deletePage(data);
    if (action === 'send_chat_message') return sendChatMessage(data, now);
    if (action === 'update_chat_message') return updateChatMessage(data, now);
    if (action === 'delete_chat_message') return deleteChatMessage(data, now);

    return jsonResponse({ status: 'error', message: 'Action non reconnue: ' + action });
  } catch (error) {
    return jsonResponse({ status: 'error', message: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    ensureDatabase();
    var action = e && e.parameter ? e.parameter.action || 'init' : 'init';

    if (action === 'get_chat_messages') return getChatMessages(e.parameter);
    if (action === 'init') {
      return jsonResponse({
        status: 'success',
        message: 'API NotLab.app en ligne.',
        tables: [SHEETS.USERS, SHEETS.ELEMENTS, SHEETS.STROKES, SHEETS.PAGES, SHEETS.CHAT, SHEETS.INVITATIONS]
      });
    }

    return jsonResponse({ status: 'success', message: 'API NotLab.app en ligne.' });
  } catch (error) {
    return jsonResponse({ status: 'error', message: String(error) });
  }
}

// API requests only need the tables to exist. Full formatting stays in setupDatabase().
function ensureDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var definitions = [
    [SHEETS.USERS, ['User ID', "Nom d'utilisateur", 'Telephone', "Date d'inscription", 'Statut'], '#1E3A8A'],
    [SHEETS.ELEMENTS, ['Element ID', 'Page ID', 'User ID', 'Nom Auteur', 'Tag Auteur', 'Ligne Index', 'Contenu', 'Couleur', 'Derniere Modification', 'Label JSON'], '#0F9D58'],
    [SHEETS.STROKES, ['Stroke ID', 'Page ID', 'User ID', 'Type Outil', 'Couleur', 'Epaisseur', 'Points JSON', 'Derniere Modification'], '#E65100'],
    [SHEETS.PAGES, ['Page ID', 'Numero Page', 'Titre', 'Nombre Lignes', 'Confidentiel', 'Derniere Modification', 'Owner User ID'], '#5E35B1'],
    [SHEETS.CHAT, ['Message ID', 'Project ID', 'Page ID', 'User ID', 'Nom Auteur', 'Auteur Tag', 'Contenu', 'Type', 'Date', 'Statut'], '#2563EB'],
    [SHEETS.INVITATIONS, ['Invitation ID', 'Project ID', 'Projet', 'Inviter User ID', 'Inviter Nom', 'Invitee User ID', 'Invitee Telephone', 'Statut', 'Date Creation', 'Date Reponse'], '#D97706']
  ];

  definitions.forEach(function(definition) {
    var sheet = ss.getSheetByName(definition[0]);
    if (!sheet) {
      sheet = initSheet(ss, definition[0], definition[1], definition[2]);
      if (definition[0] === SHEETS.USERS) sheet.getRange('C:C').setNumberFormat('@');
    } else {
      var headers = definition[1];
      var existingLastHeader = String(sheet.getRange(1, headers.length).getDisplayValue() || '');
      if (existingLastHeader !== String(headers[headers.length - 1])) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
    }
  });
}

function parsePostData(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Aucune donnee recue');
  }
  return JSON.parse(e.postData.contents);
}

function registerUser(data, now) {
  var userId = data.id || data.user_id || createId('USER');
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USERS);
  var name = String(data.name || '').trim();
  var phone = normalizePhone(data.phone);
  var existing = findUser(sheet, name, phone);

  if (existing) {
    return jsonResponse({
      status: 'success',
      message: 'Utilisateur deja enregistre.',
      user_id: existing.userId,
      name: existing.name,
      phone: existing.phone
    });
  }

  sheet.appendRow([
    userId,
    name,
    asSheetText(phone),
    data.date || now,
    data.status || 'Actif'
  ]);
  return jsonResponse({ status: 'success', message: 'Utilisateur enregistre.', user_id: userId, name: name, phone: phone });
}

function verifyUser(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USERS);
  var user = findUser(sheet, data.name, data.phone);
  if (!user || String(user.status).toLowerCase() === 'supprime') {
    return jsonResponse({ status: 'error', message: 'Utilisateur introuvable.' });
  }
  return jsonResponse({
    status: 'success',
    message: 'Utilisateur verifie.',
    user_id: user.userId,
    name: user.name,
    phone: user.phone
  });
}

function createInvitation(data, now) {
  var projectId = requireValue(data.project_id, 'Project ID manquant.');
  var inviterId = requireValue(data.inviter_user_id, 'Inviter User ID manquant.');
  var inviteePhone = normalizePhone(data.invitee_phone);
  if (!inviteePhone) return jsonResponse({ status: 'error', message: 'Telephone du destinataire manquant.' });

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var usersSheet = ss.getSheetByName(SHEETS.USERS);
  var invitationsSheet = ss.getSheetByName(SHEETS.INVITATIONS);
  var invitee = findUserByPhone(usersSheet, inviteePhone);
  if (!invitee) return jsonResponse({ status: 'error', message: 'Aucun compte ne correspond a ce numero.' });
  if (String(invitee.userId) === inviterId) return jsonResponse({ status: 'error', message: 'Vous ne pouvez pas vous inviter vous-meme.' });

  var existing = findInvitation(invitationsSheet, projectId, invitee.userId);
  if (existing && (existing.status === 'pending' || existing.status === 'accepted')) {
    return jsonResponse({ status: 'success', message: 'Invitation deja envoyee.', invitation_id: existing.id });
  }

  var inviter = findRowByValue(usersSheet, 1, inviterId);
  var inviterName = inviter ? String(usersSheet.getRange(inviter, 2).getDisplayValue() || 'Utilisateur') : 'Utilisateur';
  var invitationId = createId('INV');
  invitationsSheet.appendRow([
    invitationId,
    projectId,
    String(data.project_title || 'Projet partage'),
    inviterId,
    inviterName,
    invitee.userId,
    inviteePhone,
    'pending',
    now,
    ''
  ]);
  return jsonResponse({ status: 'success', message: 'Invitation envoyee.', invitation_id: invitationId, invitee_user_id: invitee.userId });
}

function listInvitations(data) {
  var userId = requireValue(data.user_id, 'User ID manquant.');
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INVITATIONS);
  var invitations = [];
  if (sheet && sheet.getLastRow() >= 2) {
    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getDisplayValues();
    rows.forEach(function(row) {
      if (String(row[5]) !== userId || String(row[7]).toLowerCase() !== 'pending') return;
      invitations.push({
        invitation_id: row[0],
        project_id: row[1],
        project_title: row[2],
        inviter_user_id: row[3],
        inviter_name: row[4],
        created_at: row[8]
      });
    });
  }
  return jsonResponse({ status: 'success', invitations: invitations });
}

function respondInvitation(data, now) {
  var invitationId = requireValue(data.invitation_id, 'Invitation ID manquant.');
  var userId = requireValue(data.user_id, 'User ID manquant.');
  var response = String(data.response || '').toLowerCase();
  if (response !== 'accepted' && response !== 'declined') {
    return jsonResponse({ status: 'error', message: 'Reponse invitation invalide.' });
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INVITATIONS);
  var row = findRowByValue(sheet, 1, invitationId);
  if (!row) return jsonResponse({ status: 'error', message: 'Invitation introuvable.' });
  var values = sheet.getRange(row, 1, 1, 10).getDisplayValues()[0];
  if (String(values[5]) !== userId) return jsonResponse({ status: 'error', message: 'Invitation non autorisee.' });
  if (String(values[7]).toLowerCase() !== 'pending') return jsonResponse({ status: 'success', message: 'Invitation deja traitee.' });

  sheet.getRange(row, 8).setValue(response);
  sheet.getRange(row, 10).setValue(now);
  return jsonResponse({ status: 'success', message: response === 'accepted' ? 'Invitation acceptee.' : 'Invitation refusee.', project_id: values[1], project_title: values[2] });
}

function getSharedProjects(data) {
  var userId = requireValue(data.user_id, 'User ID manquant.');
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INVITATIONS);
  var projects = {};
  if (sheet && sheet.getLastRow() >= 2) {
    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getDisplayValues();
    rows.forEach(function(row) {
      if (String(row[5]) !== userId || String(row[7]).toLowerCase() !== 'accepted') return;
      projects[row[1]] = { project_id: row[1], project_title: row[2], inviter_name: row[4] };
    });
  }
  return jsonResponse({ status: 'success', projects: Object.keys(projects).map(function(projectId) { return projects[projectId]; }) });
}

function getProjectCollaborators(data) {
  var projectId = requireValue(data.project_id, 'Project ID manquant.');
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INVITATIONS);
  var collaborators = [];
  if (sheet && sheet.getLastRow() >= 2) {
    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getDisplayValues();
    rows.forEach(function(row) {
      if (String(row[1]) !== projectId || String(row[7]).toLowerCase() !== 'accepted') return;
      if (!collaborators.some(function(member) { return member.user_id === row[5]; })) {
        collaborators.push({ user_id: row[5], name: row[5], role: 'collaborator' });
      }
      if (!collaborators.some(function(member) { return member.user_id === row[3]; })) {
        collaborators.push({ user_id: row[3], name: row[4], role: 'owner' });
      }
    });
  }
  return jsonResponse({ status: 'success', collaborators: collaborators, count: collaborators.length });
}

function findUser(sheet, name, phone) {
  if (!sheet || sheet.getLastRow() < 2) return null;
  var expectedName = String(name || '').trim().toLowerCase();
  var expectedPhone = normalizePhone(phone);
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getDisplayValues();

  for (var index = 0; index < rows.length; index++) {
    var row = rows[index];
    if (String(row[1] || '').trim().toLowerCase() !== expectedName) continue;
    if (normalizePhone(row[2]) !== expectedPhone) continue;
    return { userId: row[0], name: row[1], phone: row[2], status: row[4] };
  }
  return null;
}

function findUserByPhone(sheet, phone) {
  if (!sheet || sheet.getLastRow() < 2) return null;
  var expectedPhone = normalizePhone(phone);
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getDisplayValues();
  for (var index = 0; index < rows.length; index++) {
    if (normalizePhone(rows[index][2]) === expectedPhone) {
      return { userId: rows[index][0], name: rows[index][1], phone: rows[index][2], status: rows[index][4] };
    }
  }
  return null;
}

function findInvitation(sheet, projectId, inviteeUserId) {
  if (!sheet || sheet.getLastRow() < 2) return null;
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getDisplayValues();
  for (var index = 0; index < rows.length; index++) {
    if (String(rows[index][1]) === String(projectId) && String(rows[index][5]) === String(inviteeUserId)) {
      return { id: rows[index][0], status: rows[index][7] };
    }
  }
  return null;
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}


/** Force values such as +509 phone numbers to remain plain text. */
function asSheetText(value) {
  var text = String(value || '').trim();
  if (!text) return '';
  return text.charAt(0) === "'" ? text : "'" + text;
}

/** Repair phone cells that Google Sheets interpreted as formulas. */
function repairUserPhoneNumbers() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USERS);
  if (!sheet || sheet.getLastRow() < 2) return;

  var range = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1);
  var displayValues = range.getDisplayValues();
  var formulas = range.getFormulas();
  var repaired = displayValues.map(function(row, index) {
    var formula = formulas[index][0];
    if (formula) {
      var original = formula.replace(/^=/, '').replace(/\s+/g, ' ').trim();
      return [asSheetText(original)];
    }
    return [asSheetText(row[0])];
  });

  range.clearContent();
  range.setNumberFormat('@');
  range.setValues(repaired);
}

function logoutUser(data) {
  var userId = requireValue(data.user_id, 'User ID manquant.');
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USERS);
  var row = findRowByValue(sheet, 1, userId);
  if (!row) return jsonResponse({ status: 'error', message: 'Utilisateur introuvable.' });
  sheet.getRange(row, 5).setValue('Deconnecte');
  return jsonResponse({ status: 'success', message: 'Utilisateur deconnecte.' });
}

function deleteUser(data) {
  var userId = requireValue(data.user_id, 'User ID manquant.');
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pagesSheet = ss.getSheetByName(SHEETS.PAGES);
  var pageValues = pagesSheet.getDataRange().getValues();
  var ownedPageIds = [];

  for (var index = pageValues.length - 1; index >= 1; index--) {
    if (String(pageValues[index][6] || '') === userId) {
      ownedPageIds.push(String(pageValues[index][0]));
      pagesSheet.deleteRow(index + 1);
    }
  }

  ownedPageIds.forEach(function(pageId) {
    deleteRowsByValue(ss.getSheetByName(SHEETS.ELEMENTS), 2, pageId);
    deleteRowsByValue(ss.getSheetByName(SHEETS.STROKES), 2, pageId);
    markChatRowsDeletedByPage(ss.getSheetByName(SHEETS.CHAT), pageId, new Date().toISOString());
  });

  deleteRowsByValue(ss.getSheetByName(SHEETS.ELEMENTS), 3, userId);
  deleteRowsByValue(ss.getSheetByName(SHEETS.STROKES), 3, userId);
  deleteRowsByValue(ss.getSheetByName(SHEETS.CHAT), 4, userId);
  deleteRowsByValue(ss.getSheetByName(SHEETS.USERS), 1, userId);
  return jsonResponse({ status: 'success', message: 'Compte et donnees utilisateur supprimes.' });
}
function serializeLabelStyle(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}
function saveElement(data, now) {
  var elementId = data.element_id || createId('EL');
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ELEMENTS).appendRow([
    elementId,
    data.page_id || 'page_001',
    data.user_id || '',
    data.author_name || '',
    data.author_tag || 'A',
    data.line_index === undefined ? -1 : data.line_index,
    data.content || '',
    data.color || '#121212',
    now,
    serializeLabelStyle(data.label_style || data.labelStyle)
  ]);
  return jsonResponse({ status: 'success', message: 'Element texte enregistre.', element_id: elementId });
}


function updateElement(data, now) {
  var elementId = requireValue(data.element_id, 'Element ID manquant.');
  var userId = requireValue(data.user_id, 'User ID manquant.');
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ELEMENTS);
  var row = findRowByValue(sheet, 1, elementId);
  if (!row) return jsonResponse({ status: 'error', message: 'Message introuvable.' });

  var values = sheet.getRange(row, 1, 1, 9).getValues()[0];
  if (!canManageMessage(values[2], values[1], userId)) {
    return jsonResponse({ status: 'error', message: 'Action reservee a l auteur ou au proprietaire.' });
  }

  sheet.getRange(row, 7).setValue(String(data.content || ''));
  if (data.color) sheet.getRange(row, 8).setValue(data.color);
  sheet.getRange(row, 9).setValue(now);
  if (Object.prototype.hasOwnProperty.call(data, 'label_style') || Object.prototype.hasOwnProperty.call(data, 'labelStyle')) {
    sheet.getRange(row, 10).setValue(serializeLabelStyle(data.label_style || data.labelStyle));
  }
  return jsonResponse({ status: 'success', message: 'Message modifie.', element_id: elementId });
}

function deleteElement(data) {
  var elementId = requireValue(data.element_id, 'Element ID manquant.');
  var userId = requireValue(data.user_id, 'User ID manquant.');
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ELEMENTS);
  var row = findRowByValue(sheet, 1, elementId);
  if (!row) return jsonResponse({ status: 'error', message: 'Message introuvable.' });

  var values = sheet.getRange(row, 1, 1, 9).getValues()[0];
  if (!canManageMessage(values[2], values[1], userId)) {
    return jsonResponse({ status: 'error', message: 'Action reservee a l auteur ou au proprietaire.' });
  }

  sheet.deleteRow(row);
  return jsonResponse({ status: 'success', message: 'Message supprime pour tout le monde.', element_id: elementId });
}

function deletePageMessages(data, now) {
  var pageId = requireValue(data.page_id, 'Page ID manquant.');
  var userId = requireValue(data.user_id, 'User ID manquant.');
  if (!isPageOwner(pageId, userId)) {
    return jsonResponse({ status: 'error', message: 'Seul le proprietaire peut vider la page.' });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  deleteRowsByValue(ss.getSheetByName(SHEETS.ELEMENTS), 2, pageId);
  markChatRowsDeletedByPage(ss.getSheetByName(SHEETS.CHAT), pageId, now);
  return jsonResponse({ status: 'success', message: 'Tous les messages de la page ont ete supprimes.' });
}
function saveStroke(data, now) {
  var strokeId = data.stroke_id || createId('STRK');
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.STROKES).appendRow([
    strokeId,
    data.page_id || 'page_001',
    data.user_id || '',
    data.tool_type || 'PEN',
    data.color || '#000000',
    data.width || 3,
    typeof data.points === 'string' ? data.points : JSON.stringify(data.points || []),
    now
  ]);
  return jsonResponse({ status: 'success', message: 'Stroke enregistre.', stroke_id: strokeId });
}

function syncBatch(data, now) {
  (data.elements || []).forEach(function(element) { saveElement(element, now); });
  (data.strokes || []).forEach(function(stroke) { saveStroke(stroke, now); });
  return jsonResponse({ status: 'success', message: 'Synchronisation batch effectuee.' });
}

function syncPages(data, now) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.PAGES);
  var pages = data.pages || [];
  var requesterId = String(data.user_id || '');
  var updatedCount = 0;

  pages.forEach(function(page) {
    var pageId = String(page.page_id || page.pageId || createId('PAGE'));
    var ownerId = String(page.owner_user_id || requesterId || '');
    var row = findRowByValue(sheet, 1, pageId);
    var values = [
      pageId,
      page.page_number || page.pageNumber || 0,
      page.title || page.name || '',
      page.line_count || (page.lines ? page.lines.length : 0),
      page.confidential === true,
      page.modified_at || page.created_at || now,
      ownerId
    ];

    if (row) {
      var existingOwner = String(sheet.getRange(row, 7).getValue() || '');
      if (existingOwner && requesterId && existingOwner !== requesterId) return;
      if (!ownerId) values[6] = existingOwner;
      sheet.getRange(row, 1, 1, 7).setValues([values]);
    } else {
      sheet.appendRow(values);
    }
    updatedCount++;
  });

  return jsonResponse({ status: 'success', message: 'Pages synchronisees.', page_count: updatedCount });
}

function deletePage(data) {
  var pageId = requireValue(data.page_id || data.pageId, 'Page ID manquant.');
  var userId = requireValue(data.user_id, 'User ID manquant.');
  if (!isPageOwner(pageId, userId)) {
    return jsonResponse({ status: 'error', message: 'Seul le proprietaire peut supprimer la page.' });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  deleteRowsByValue(ss.getSheetByName(SHEETS.PAGES), 1, pageId);
  deleteRowsByValue(ss.getSheetByName(SHEETS.ELEMENTS), 2, pageId);
  deleteRowsByValue(ss.getSheetByName(SHEETS.STROKES), 2, pageId);
  markChatRowsDeletedByPage(ss.getSheetByName(SHEETS.CHAT), pageId, new Date().toISOString());
  return jsonResponse({ status: 'success', message: 'Page supprimee.', page_id: pageId });
}

/** Save one chat message. Messages are append-only so every user sees the same history. */
function sendChatMessage(data, now) {
  var message = String(data.content || data.message || '').trim();
  if (!message) return jsonResponse({ status: 'error', message: 'Message vide.' });

  var messageId = data.message_id || createId('MSG');
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CHAT).appendRow([
    messageId,
    data.project_id || 'default-project',
    data.page_id || '',
    data.user_id || '',
    data.author_name || 'Utilisateur',
    data.author_tag || 'A',
    message,
    data.type || 'text',
    now,
    'active'
  ]);

  return jsonResponse({ status: 'success', message: 'Message enregistre.', message_id: messageId, created_at: now });
}


function updateChatMessage(data, now) {
  var messageId = requireValue(data.message_id, 'Message ID manquant.');
  var userId = requireValue(data.user_id, 'User ID manquant.');
  var content = String(data.content || '').trim();
  if (!content) return jsonResponse({ status: 'error', message: 'Message vide.' });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CHAT);
  var row = findRowByValue(sheet, 1, messageId);
  if (!row) return jsonResponse({ status: 'error', message: 'Message introuvable.' });
  var values = sheet.getRange(row, 1, 1, 10).getValues()[0];
  if (!canManageMessage(values[3], values[2], userId)) {
    return jsonResponse({ status: 'error', message: 'Action reservee a l auteur ou au proprietaire.' });
  }

  sheet.getRange(row, 7).setValue(content);
  sheet.getRange(row, 9).setValue(now);
  return jsonResponse({ status: 'success', message: 'Message chat modifie.', message_id: messageId });
}

function deleteChatMessage(data, now) {
  var messageId = requireValue(data.message_id, 'Message ID manquant.');
  var userId = requireValue(data.user_id, 'User ID manquant.');
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CHAT);
  var row = findRowByValue(sheet, 1, messageId);
  if (!row) return jsonResponse({ status: 'error', message: 'Message introuvable.' });
  var values = sheet.getRange(row, 1, 1, 10).getValues()[0];
  if (!canManageMessage(values[3], values[2], userId)) {
    return jsonResponse({ status: 'error', message: 'Action reservee a l auteur ou au proprietaire.' });
  }

  sheet.getRange(row, 9).setValue(now);
  sheet.getRange(row, 10).setValue('deleted');
  return jsonResponse({ status: 'success', message: 'Message chat supprime pour tout le monde.', message_id: messageId });
}
/** Read chat history. Filter by project_id and optionally page_id. */
function getChatMessages(params) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CHAT);
  var values = sheet.getDataRange().getValues();
  var projectId = params.project_id || 'default-project';
  var pageId = params.page_id || '';
  var limit = Math.min(Number(params.limit || 100), 500);
  var messages = [];

  for (var index = 1; index < values.length; index++) {
    var row = values[index];
    if (String(row[1]) !== String(projectId)) continue;
    if (pageId && String(row[2]) !== String(pageId)) continue;
    if (String(row[9] || 'active') === 'deleted') continue;

    messages.push({
      message_id: row[0],
      project_id: row[1],
      page_id: row[2],
      user_id: row[3],
      author_name: row[4],
      author_tag: row[5],
      content: row[6],
      type: row[7],
      created_at: row[8],
      status: row[9]
    });
  }

  messages = messages.slice(Math.max(0, messages.length - limit));
  return jsonResponse({ status: 'success', messages: messages });
}


function requireValue(value, message) {
  var normalized = String(value || '').trim();
  if (!normalized) throw new Error(message);
  return normalized;
}

function findRowByValue(sheet, column, value) {
  if (!sheet || sheet.getLastRow() < 2) return 0;
  var values = sheet.getRange(2, column, sheet.getLastRow() - 1, 1).getDisplayValues();
  for (var index = 0; index < values.length; index++) {
    if (String(values[index][0]) === String(value)) return index + 2;
  }
  return 0;
}

function isPageOwner(pageId, userId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.PAGES);
  var row = findRowByValue(sheet, 1, pageId);
  if (!row) return false;
  return String(sheet.getRange(row, 7).getValue() || '') === String(userId || '');
}

function canManageMessage(authorUserId, pageId, requesterUserId) {
  var requester = String(requesterUserId || '');
  return requester && (String(authorUserId || '') === requester || isPageOwner(String(pageId || ''), requester));
}

function deleteRowsByValue(sheet, column, value) {
  if (!sheet || sheet.getLastRow() < 2) return 0;
  var values = sheet.getRange(2, column, sheet.getLastRow() - 1, 1).getDisplayValues();
  var deleted = 0;
  for (var index = values.length - 1; index >= 0; index--) {
    if (String(values[index][0]) === String(value)) {
      sheet.deleteRow(index + 2);
      deleted++;
    }
  }
  return deleted;
}

function markChatRowsDeletedByPage(sheet, pageId, now) {
  if (!sheet || sheet.getLastRow() < 2) return;
  var values = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getDisplayValues();
  for (var index = 0; index < values.length; index++) {
    if (String(values[index][0]) === String(pageId)) {
      sheet.getRange(index + 2, 9).setValue(now);
      sheet.getRange(index + 2, 10).setValue('deleted');
    }
  }
}
function createId(prefix) {
  return prefix + '-' + new Date().getTime() + '-' + Math.floor(Math.random() * 100000);
}

function jsonResponse(object) {
  return ContentService
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}
