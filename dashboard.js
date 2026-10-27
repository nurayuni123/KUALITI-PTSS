// ===== DASHBOARD (ADMIN / KUALITI) =====

const AUTH_KEY = 'ptss_auth';

// Guard: must be logged in
if (sessionStorage.getItem(AUTH_KEY) !== 'true') {
  window.location.href = 'index.html';
}

let docs = getDocs();
let editingId = null;
let deletingId = null;
const docMap = {};

// ===== SUMMARY =====
function renderSummary() {
  const s = computeSummary(docs);
  document.getElementById('sum-total').textContent = s.total;
  document.getElementById('sum-expiring').textContent = s.expiring;
  document.getElementById('sum-review').textContent = s.review;
  document.getElementById('sum-corrective').textContent = s.corrective;
}

// ===== TABLE =====
function getFilteredDocs() {
  const search = document.getElementById('adm-search').value.toLowerCase();
  const cat = document.getElementById('adm-filter-cat').value;
  const status = document.getElementById('adm-filter-status').value;

  return docs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search) ||
                        d.holder.toLowerCase().includes(search);
    const matchCat = cat === '' || d.category === cat;
    const matchStatus = status === '' || d.status === status ||
      (status === 'Tamat' && isExpired(d.expiry));
    return matchSearch && matchCat && matchStatus;
  });
}

function renderTable() {
  const filtered = getFilteredDocs();
  const tbody = document.getElementById('adm-tbody');
  const empty = document.getElementById('adm-empty');
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  filtered.forEach((doc, idx) => {
    const statusClass = getStatusClass(doc.status, doc.expiry);
    const statusLabel = getStatusLabel(doc.status, doc.expiry);
    const hasFile = doc.filedata && doc.filedata !== '';
    docMap[doc.id] = doc;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>
        ${hasFile
          ? `<a href="javascript:void(0)" onclick="openPreview(docMap[${doc.id}])" style="color:#0d5ca8;font-weight:600;text-decoration:none;cursor:pointer;" title="Klik untuk lihat dokumen">📎 ${doc.name}</a>`
          : `<strong>${doc.name}</strong>`}
        ${doc.filename ? '<br><span style="font-size:0.72rem;color:#57606a">' + doc.filename + '</span>' : ''}
      </td>
      <td>${doc.category}</td>
      <td>${doc.version}</td>
      <td>${doc.holder}</td>
      <td>${formatDate(doc.date)}</td>
      <td>${formatDate(doc.expiry)}</td>
      <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
      <td>
        <div class="tbl-actions">
          ${hasFile ? `<button class="btn btn-sm btn-success btn-icon" onclick="downloadDoc(${doc.id})" title="Muat Turun">📥</button>` : ''}
          <button class="btn btn-sm btn-warn btn-icon" onclick="openEdit(${doc.id})" title="Edit">✏️</button>
          <button class="btn btn-sm btn-danger btn-icon" onclick="openDelete(${doc.id})" title="Padam">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ===== FILTERS =====
document.getElementById('adm-search').addEventListener('input', renderTable);
document.getElementById('adm-filter-cat').addEventListener('change', renderTable);
document.getElementById('adm-filter-status').addEventListener('change', renderTable);

// ===== LOGOUT =====
document.getElementById('btn-logout').addEventListener('click', () => {
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = 'index.html';
});

// ===== MODAL HELPERS =====
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const docForm = document.getElementById('doc-form');

function openModal() { modalOverlay.classList.remove('hidden'); }
function closeModal() {
  modalOverlay.classList.add('hidden');
  docForm.reset();
  editingId = null;
  document.getElementById('doc-id').value = '';
  document.getElementById('doc-file-current').classList.add('hidden');
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

// ===== UPLOAD =====
document.getElementById('btn-upload').addEventListener('click', () => {
  editingId = null;
  modalTitle.textContent = '📤 Muat Naik Dokumen';
  document.getElementById('modal-save').textContent = '💾 Simpan';
  docForm.reset();
  document.getElementById('doc-file-current').classList.add('hidden');

  // Default today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('doc-date').value = today;
  openModal();
});

// ===== EDIT =====
function openEdit(id) {
  const doc = docs.find(d => d.id === id);
  if (!doc) return;
  editingId = id;
  modalTitle.textContent = '✏️ Edit Dokumen';
  document.getElementById('modal-save').textContent = '💾 Kemaskini';

  document.getElementById('doc-id').value = doc.id;
  document.getElementById('doc-name').value = doc.name;
  document.getElementById('doc-cat').value = doc.category;
  document.getElementById('doc-ver').value = doc.version;
  document.getElementById('doc-holder').value = doc.holder;
  document.getElementById('doc-date').value = doc.date;
  document.getElementById('doc-expiry').value = doc.expiry;
  document.getElementById('doc-status').value = doc.status;

  if (doc.filename) {
    const fc = document.getElementById('doc-file-current');
    fc.textContent = '📎 Fail sedia ada: ' + doc.filename;
    fc.classList.remove('hidden');
  }
  openModal();
}

// ===== SAVE FORM =====
docForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const fileInput = document.getElementById('doc-file');
  const file = fileInput.files[0];

  const name = document.getElementById('doc-name').value.trim();
  const category = document.getElementById('doc-cat').value;
  const version = document.getElementById('doc-ver').value.trim();
  const holder = document.getElementById('doc-holder').value.trim();
  const date = document.getElementById('doc-date').value;
  const expiry = document.getElementById('doc-expiry').value;
  const status = document.getElementById('doc-status').value;

  function saveWithFile(fileData, fileName, fileMime) {
    if (editingId !== null) {
      const idx = docs.findIndex(d => d.id === editingId);
      if (idx !== -1) {
        docs[idx] = {
          ...docs[idx],
          name, category, version, holder, date, expiry, status,
          filename: fileName || docs[idx].filename,
          filedata: fileData || docs[idx].filedata,
          filemime: fileMime || docs[idx].filemime
        };
      }
    } else {
      docs.push({
        id: getNextId(docs),
        name, category, version, holder, date, expiry, status,
        filename: fileName || '',
        filedata: fileData || '',
        filemime: fileMime || ''
      });
    }
    saveDocs(docs);
    renderSummary();
    renderTable();
    closeModal();
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = function (ev) {
      saveWithFile(ev.target.result, file.name, file.type);
    };
    reader.readAsDataURL(file);
  } else {
    saveWithFile(null, null, null);
  }
});

// ===== DOWNLOAD =====
function downloadDoc(id) {
  const doc = docs.find(d => d.id === id);
  if (!doc || !doc.filedata) return;
  const a = document.createElement('a');
  a.href = doc.filedata;
  a.download = doc.filename;
  a.click();
}

// ===== DELETE =====
const deleteOverlay = document.getElementById('delete-overlay');
const deleteMsg = document.getElementById('delete-msg');

function openDelete(id) {
  const doc = docs.find(d => d.id === id);
  if (!doc) return;
  deletingId = id;
  deleteMsg.textContent = `Adakah anda pasti mahu memadam "${doc.name}"? Tindakan ini tidak boleh dibatalkan.`;
  deleteOverlay.classList.remove('hidden');
}

document.getElementById('delete-close').addEventListener('click', () => {
  deleteOverlay.classList.add('hidden');
  deletingId = null;
});
document.getElementById('delete-cancel').addEventListener('click', () => {
  deleteOverlay.classList.add('hidden');
  deletingId = null;
});
deleteOverlay.addEventListener('click', (e) => {
  if (e.target === deleteOverlay) {
    deleteOverlay.classList.add('hidden');
    deletingId = null;
  }
});

document.getElementById('delete-confirm').addEventListener('click', () => {
  if (deletingId === null) return;
  docs = docs.filter(d => d.id !== deletingId);
  saveDocs(docs);
  renderSummary();
  renderTable();
  deleteOverlay.classList.add('hidden');
  deletingId = null;
});

// ===== INIT =====
initPreview();
renderSummary();
renderTable();
