// ===== AUTH =====

const VALID_ID = 'KUALITI-PTSS';
const VALID_PWD = 'kualiti@ptss2025'; // compare lowercase
const MAX_ATTEMPTS = 3;
const AUTH_KEY = 'ptss_auth';
const LOCK_KEY = 'ptss_locked';
const ATTEMPTS_KEY = 'ptss_attempts';

const form = document.getElementById('loginForm');
const errorEl = document.getElementById('login-error');
const lockedEl = document.getElementById('login-locked');
const attemptsEl = document.getElementById('attempts-info');
const toggleBtn = document.getElementById('togglePwd');
const pwdInput = document.getElementById('password');
const unlockBtn = document.getElementById('btn-unlock');

// Redirect if already logged in
if (sessionStorage.getItem(AUTH_KEY) === 'true') {
  window.location.href = 'dashboard.html';
}

// Check if locked
function checkLocked() {
  const locked = localStorage.getItem(LOCK_KEY);
  if (locked === 'true') {
    lockedEl.classList.remove('hidden');
    unlockBtn.classList.remove('hidden');
    form.querySelector('button[type="submit"]').disabled = true;
    return true;
  }
  unlockBtn.classList.add('hidden');
  return false;
}

checkLocked();

// Unlock button — reset lock so user can try again
unlockBtn.addEventListener('click', () => {
  localStorage.removeItem(LOCK_KEY);
  localStorage.removeItem(ATTEMPTS_KEY);
  lockedEl.classList.add('hidden');
  unlockBtn.classList.add('hidden');
  errorEl.classList.add('hidden');
  attemptsEl.classList.add('hidden');
  form.querySelector('button[type="submit"]').disabled = false;
});

// Toggle password visibility
toggleBtn.addEventListener('click', () => {
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    toggleBtn.textContent = '🙈';
  } else {
    pwdInput.type = 'password';
    toggleBtn.textContent = '👁️';
  }
});

// Login form submit
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (checkLocked()) return;

  const id = document.getElementById('userId').value.trim().toUpperCase();
  const pwd = pwdInput.value.toLowerCase();

  if (id === VALID_ID && pwd === VALID_PWD) {
    // Success
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCK_KEY);
    sessionStorage.setItem(AUTH_KEY, 'true');
    window.location.href = 'dashboard.html';
  } else {
    // Fail
    let attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0') + 1;
    localStorage.setItem(ATTEMPTS_KEY, attempts);

    errorEl.classList.remove('hidden');
    lockedEl.classList.add('hidden');

    if (attempts >= MAX_ATTEMPTS) {
      localStorage.setItem(LOCK_KEY, 'true');
      lockedEl.classList.remove('hidden');
      unlockBtn.classList.remove('hidden');
      errorEl.classList.add('hidden');
      attemptsEl.classList.add('hidden');
      form.querySelector('button[type="submit"]').disabled = true;
    } else {
      const remaining = MAX_ATTEMPTS - attempts;
      attemptsEl.classList.remove('hidden');
      attemptsEl.textContent = `⚠️ ${remaining} cubaan lagi sebelum akaun dikunci.`;
    }
  }
});
