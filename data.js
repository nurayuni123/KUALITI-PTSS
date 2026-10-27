// ===== SHARED DATA STORE (localStorage) =====

const STORAGE_KEY = 'ptss_documents';

const DEFAULT_DOCS = [
  {
    id: 1,
    name: 'SOP Kawalan Dokumen',
    category: 'SOP',
    version: 'v3.0',
    holder: 'Unit Kualiti',
    date: '2024-01-15',
    expiry: '2026-01-15',
    status: 'Aktif',
    filename: ''
  },
  {
    id: 2,
    name: 'Manual Prosedur Kualiti',
    category: 'Manual',
    version: 'v2.1',
    holder: 'Jabatan Kualiti',
    date: '2023-06-01',
    expiry: '2025-06-01',
    status: 'Aktif',
    filename: ''
  },
  {
    id: 3,
    name: 'Borang Semakan Dokumen',
    category: 'Borang',
    version: 'v1.2',
    holder: 'Pemegang Dokumen A',
    date: '2024-03-10',
    expiry: '2025-08-10',
    status: 'Semakan',
    filename: ''
  },
  {
    id: 4,
    name: 'SOP Pengurusan Rekod',
    category: 'SOP',
    version: 'v2.0',
    holder: 'Unit Rekod',
    date: '2022-09-01',
    expiry: '2025-07-20',
    status: 'Aktif',
    filename: ''
  },
  {
    id: 5,
    name: 'Manual Audit Dalaman',
    category: 'Manual',
    version: 'v1.0',
    holder: 'Juruaudit Dalaman',
    date: '2023-11-01',
    expiry: '2024-11-01',
    status: 'Tamat',
    filename: ''
  },
  {
    id: 6,
    name: 'Borang Tindakan Pembetulan',
    category: 'Borang',
    version: 'v2.3',
    holder: 'Unit Kualiti',
    date: '2024-05-01',
    expiry: '2026-05-01',
    status: 'Aktif',
    filename: ''
  }
];

function getDocs() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DOCS));
    return DEFAULT_DOCS;
  }
  // Migrate old records that may not have filedata/filemime fields
  const docs = JSON.parse(raw);
  let migrated = false;
  docs.forEach(d => {
    if (d.filedata === undefined) { d.filedata = ''; migrated = true; }
    if (d.filemime === undefined) { d.filemime = ''; migrated = true; }
    if (d.filename === undefined) { d.filename = ''; migrated = true; }
  });
  if (migrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  return docs;
}

function saveDocs(docs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

function getNextId(docs) {
  return docs.length > 0 ? Math.max(...docs.map(d => d.id)) + 1 : 1;
}

function isExpiringSoon(expiryStr) {
  const today = new Date();
  const expiry = new Date(expiryStr);
  const diff = (expiry - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 30;
}

function isExpired(expiryStr) {
  return new Date(expiryStr) < new Date();
}

function formatDate(dateStr) {
  if (!dateStr) return '–';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getStatusClass(status, expiry) {
  if (status === 'Tamat' || isExpired(expiry)) return 'status-tamat';
  if (status === 'Semakan') return 'status-semakan';
  if (isExpiringSoon(expiry)) return 'status-hampir';
  return 'status-aktif';
}

function getStatusLabel(status, expiry) {
  if (status === 'Tamat' || isExpired(expiry)) return 'Tamat Tempoh';
  if (status === 'Semakan') return 'Dalam Semakan';
  if (isExpiringSoon(expiry)) return 'Hampir Luput';
  return 'Aktif';
}

function computeSummary(docs) {
  const total = docs.filter(d => d.status === 'Aktif' && !isExpired(d.expiry)).length;
  const expiring = docs.filter(d => isExpiringSoon(d.expiry) && !isExpired(d.expiry)).length;
  const review = docs.filter(d => d.status === 'Semakan').length;
  const corrective = docs.filter(d => d.status === 'Tamat' || isExpired(d.expiry)).length;
  return { total, expiring, review, corrective };
}
