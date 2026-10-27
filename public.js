// ===== PUBLIC VIEW (READ ONLY) =====

let allDocs = getDocs();
let filteredDocs = [...allDocs];

// Store docs in a map for easy lookup by preview button
const docMap = {};

function renderSummary() {
  const s = computeSummary(allDocs);
  document.getElementById('pub-total').textContent = s.total;
  document.getElementById('pub-expiring').textContent = s.expiring;
  document.getElementById('pub-review').textContent = s.review;
}

function renderTable(docs) {
  const tbody = document.getElementById('pub-tbody');
  const empty = document.getElementById('pub-empty');
  tbody.innerHTML = '';

  if (docs.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  docs.forEach((doc, idx) => {
    const statusClass = getStatusClass(doc.status, doc.expiry);
    const statusLabel = getStatusLabel(doc.status, doc.expiry);
    const hasFile = doc.filedata && doc.filedata !== '';
    docMap[doc.id] = doc;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>
        <strong>${doc.name}</strong>
        ${doc.filename ? '<br><span style="font-size:0.72rem;color:#adb5bd">📎 ' + doc.filename + '</span>' : ''}
      </td>
      <td>${doc.category}</td>
      <td>${doc.version}</td>
      <td>${formatDate(doc.date)}</td>
      <td>${formatDate(doc.expiry)}</td>
      <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
      <td>
        ${hasFile
          ? `<button onclick="openPreview(docMap[${doc.id}])" class="btn btn-sm btn-primary" title="Lihat Dokumen">👁️ Lihat</button>`
          : `<span style="color:#adb5bd;font-size:0.78rem;">Tiada Fail</span>`}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function applyFilters() {
  const search = document.getElementById('pub-search').value.toLowerCase();
  const cat = document.getElementById('pub-filter-cat').value;

  filteredDocs = allDocs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search) ||
                        d.holder.toLowerCase().includes(search);
    const matchCat = cat === '' || d.category === cat;
    return matchSearch && matchCat;
  });
  renderTable(filteredDocs);
}

document.getElementById('pub-search').addEventListener('input', applyFilters);
document.getElementById('pub-filter-cat').addEventListener('change', applyFilters);

// Init
initPreview();
renderSummary();
renderTable(allDocs);
