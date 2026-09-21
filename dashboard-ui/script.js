const mockNotes = [
  {
    id: '1',
    title: 'Plan marketing Q4',
    dateModified: '2026-09-20',
    memberCount: 4,
    isShared: true,
    isFavorite: true,
    color: '#3B82F6'
  },
  {
    id: '2',
    title: 'Notes réunion équipe',
    dateModified: '2026-09-18',
    memberCount: 2,
    isShared: false,
    isFavorite: false,
    color: '#10B981'
  },
  {
    id: '3',
    title: 'Idées produit',
    dateModified: '2026-09-15',
    memberCount: 1,
    isShared: false,
    isFavorite: true,
    color: '#F59E0B'
  },
  {
    id: '4',
    title: 'Checklist lancement',
    dateModified: '2026-09-10',
    memberCount: 5,
    isShared: true,
    isFavorite: false,
    color: '#8B5CF6'
  }
];

let activeTab = 'all';
let sortOrder = 'date';
let query = '';

const notesList = document.getElementById('notesList');
const searchBox = document.getElementById('searchBox');
const searchInput = document.getElementById('searchInput');
const sortLabel = document.getElementById('sortLabel');
const toggleSearchButton = document.getElementById('toggleSearch');
const sortToggle = document.getElementById('sortToggle');

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function getVisibleNotes() {
  let filtered = [...mockNotes];

  if (activeTab === 'shared') {
    filtered = filtered.filter((item) => item.isShared || item.memberCount > 1);
  } else if (activeTab === 'favorites') {
    filtered = filtered.filter((item) => item.isFavorite);
  }

  if (query.trim()) {
    const term = query.trim().toLowerCase();
    filtered = filtered.filter((item) => item.title.toLowerCase().includes(term));
  }

  if (sortOrder === 'name') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    filtered.sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified));
  }

  return filtered;
}

function renderNotes() {
  const notes = getVisibleNotes();

  if (!notes.length) {
    notesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📘</div>
        <div>Aucun cahier dans cet onglet</div>
      </div>
    `;
    return;
  }

  notesList.innerHTML = notes
    .map(
      (item) => `
        <article class="note-card" data-id="${item.id}">
          <div class="note-header">
            <div class="note-color" style="background:${item.color};"></div>
            <div class="note-meta">
              <h3>${item.title}</h3>
              <small>${formatDate(item.dateModified)}</small>
            </div>
            <div class="card-actions">
              <button class="favorite-btn" data-id="${item.id}" aria-label="Favoris">
                ${item.isFavorite ? '★' : '☆'}
              </button>
              <button class="delete-btn" data-id="${item.id}" aria-label="Supprimer">🗑</button>
            </div>
          </div>
          <div class="note-footer">
            <span>👥 ${item.memberCount || 1} membre(s)</span>
            ${item.isShared ? '<span class="shared-badge">⇄ Partagé</span>' : ''}
          </div>
        </article>
      `
    )
    .join('');
}

function attachCardEvents() {
  document.querySelectorAll('.favorite-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = mockNotes.find((note) => note.id === id);
      if (item) item.isFavorite = !item.isFavorite;
      renderNotes();
      attachCardEvents();
    });
  });

  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const id = btn.getAttribute('data-id');
      const index = mockNotes.findIndex((note) => note.id === id);
      if (index >= 0) mockNotes.splice(index, 1);
      renderNotes();
      attachCardEvents();
    });
  });

  document.querySelectorAll('.note-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const note = mockNotes.find((item) => item.id === id);
      if (note) alert(`Ou a ouvert: ${note.title}`);
    });
  });
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    activeTab = tab.dataset.tab;
    document.querySelectorAll('.tab').forEach((item) => item.classList.toggle('active', item === tab));
    renderNotes();
    attachCardEvents();
  });
});

toggleSearchButton.addEventListener('click', () => {
  searchBox.classList.toggle('hidden');
  if (!searchBox.classList.contains('hidden')) {
    searchInput.focus();
  } else {
    query = '';
    searchInput.value = '';
    renderNotes();
    attachCardEvents();
  }
});

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  renderNotes();
  attachCardEvents();
});

sortToggle.addEventListener('click', () => {
  sortOrder = sortOrder === 'date' ? 'name' : 'date';
  sortLabel.textContent = sortOrder === 'date' ? 'Trier par date' : 'Trier par nom';
  renderNotes();
  attachCardEvents();
});

document.getElementById('newNoteButton').addEventListener('click', () => {
  alert('Nouvelle note');
});

renderNotes();
attachCardEvents();
