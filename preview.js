// ===== SHARED DOCUMENT PREVIEW =====

function openPreview(doc) {
  const overlay = document.getElementById('preview-overlay');
  const title = document.getElementById('preview-title');
  const body = document.getElementById('preview-body');
  const dlBtn = document.getElementById('preview-download');

  title.textContent = '📄 ' + doc.name + ' (' + doc.version + ')';
  body.innerHTML = '';

  // Set download button
  dlBtn.href = doc.filedata;
  dlBtn.download = doc.filename;

  const mime = doc.filemime || '';
  const ext = doc.filename ? doc.filename.split('.').pop().toLowerCase() : '';

  if (mime === 'application/pdf' || ext === 'pdf') {
    // PDF — embed in iframe
    const iframe = document.createElement('iframe');
    iframe.src = doc.filedata;
    iframe.title = doc.name;
    body.appendChild(iframe);

  } else if (mime.startsWith('image/') || ['jpg','jpeg','png','gif','webp','bmp'].includes(ext)) {
    // Image — show inline
    const img = document.createElement('img');
    img.src = doc.filedata;
    img.alt = doc.name;
    body.appendChild(img);

  } else {
    // Word, Excel, or others — cannot render in browser
    const extLabel = ext ? ext.toUpperCase() : 'Dokumen';
    const icon = ['doc','docx'].includes(ext) ? '📝' : ['xls','xlsx'].includes(ext) ? '📊' : '📄';
    body.innerHTML = `
      <div class="preview-unsupported">
        <div class="icon">${icon}</div>
        <strong>${doc.name}</strong>
        <p>Fail format <strong>.${ext}</strong> tidak boleh dipaparkan terus dalam pelayar.</p>
        <p>Sila muat turun fail untuk membukanya.</p>
        <a href="${doc.filedata}" download="${doc.filename}" class="btn btn-primary">📥 Muat Turun ${extLabel}</a>
      </div>
    `;
  }

  overlay.classList.remove('hidden');
}

function initPreview() {
  const overlay = document.getElementById('preview-overlay');
  const closeBtn = document.getElementById('preview-close');

  closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    document.getElementById('preview-body').innerHTML = '';
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('hidden');
      document.getElementById('preview-body').innerHTML = '';
    }
  });
}
