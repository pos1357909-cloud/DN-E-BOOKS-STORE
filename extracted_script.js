
// ============================================================
// CONSTANTS & CONFIGURATION
// ============================================================
const ADMIN_EMAIL = 'exampaperlkonlinepapershop@gmail.com';
const ADMIN_PASS = 'FG@#478f';

const PLANS = {
  FREE:     { name: 'FREE',     price: 0,   days: null, color: '#60a5fa', bg: '#1e3a5f', border: '#2563eb', label: 'Free Forever' },
  BASIC:    { name: 'BASIC',    price: 100, days: 30,   color: '#34d399', bg: '#1e3a2f', border: '#10b981', label: '30 Days' },
  STANDARD: { name: 'STANDARD', price: 200, days: 30,   color: '#c084fc', bg: '#3b1f6e', border: '#9333ea', label: '30 Days' },
  PREMIUM:  { name: 'PREMIUM',  price: 300, days: 60,   color: '#fb923c', bg: '#451a03', border: '#ea580c', label: '60 Days' }
};

const PLAN_FEATURES = {
  FREE:     { read: false, fullRead: false, download: false, mcq: false, preview: 2,    desc: 'Grade content preview (2 pages)' },
  BASIC:    { read: true,  fullRead: true,  download: false, mcq: false, preview: null, desc: 'Full read access, no download' },
  STANDARD: { read: true,  fullRead: true,  download: true,  mcq: true,  preview: null, desc: 'Full access + download + MCQ' },
  PREMIUM:  { read: true,  fullRead: true,  download: true,  mcq: true,  preview: null, desc: 'Full access + download + MCQ (60 days)' }
};

const SUBJECTS = [
  'Mathematics','Science','English','Sinhala','Tamil','History','Geography',
  'Civic Education','ICT','Commerce','Accounting','Biology','Chemistry',
  'Physics','Buddhism','Art','Music','Drama','Health Science','Other'
];

// ============================================================
// LOCAL STORAGE DATA MANAGEMENT
// ============================================================
let books = [];
let students = [];
let orders = [];      // pending subscription requests
let salesHistory = [];

function loadData() {
  books = JSON.parse(localStorage.getItem('dn_books') || '[]');
  students = JSON.parse(localStorage.getItem('dn_students') || '[]');
  orders = JSON.parse(localStorage.getItem('dn_orders') || '[]');
  salesHistory = JSON.parse(localStorage.getItem('dn_sales_history') || '[]');
}

function saveData() {
  try {
    localStorage.setItem('dn_books', JSON.stringify(books));
    localStorage.setItem('dn_students', JSON.stringify(students));
    localStorage.setItem('dn_orders', JSON.stringify(orders));
    localStorage.setItem('dn_sales_history', JSON.stringify(salesHistory));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
      showToast('⚠️ Storage limit exceeded! Cannot save data. Please reduce PDF sizes or delete unused resources.', 'error');
    } else {
      showToast('❌ Failed to save data: ' + (e.message || 'Unknown error'), 'error');
      console.error('saveData error:', e);
    }
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ============================================================
// SAMPLE DATA & MIGRATION
// ============================================================
const SAMPLE_MCQ_QUIZZES = [
  {
    id: 'quiz-science-g10',
    title: 'Grade 10 Science - Unit 1: Photosynthesis & Plant Cells',
    type: 'MCQ Quiz Papers',
    grade: 10,
    subject: 'Science',
    mode: 'Read',
    previewPages: 2,
    readLink: null,
    downloadLink: null,
    pdfData: null,
    isFree: false,
    price: 0,
    published: true,
    allowRetry: true,
    textNotes: 'Answer all multiple choice questions. Choose the most appropriate answer for each question. Each correct answer carries 1 mark. You can review explanations after submission.',
    questions: [
      {
        id: 'q-s1',
        question: 'Which cell organelle is the primary site of photosynthesis in green plant cells?',
        options: {
          A: 'Mitochondrion',
          B: 'Chloroplast',
          C: 'Ribosome',
          D: 'Golgi Apparatus'
        },
        correctAnswer: 'B',
        explanation: 'Chloroplasts contain chlorophyll pigments that capture sunlight energy to synthesize glucose during photosynthesis.'
      },
      {
        id: 'q-s2',
        question: 'What is the main gas released as a byproduct during the light-dependent reactions of photosynthesis?',
        options: {
          A: 'Carbon Dioxide (CO2)',
          B: 'Nitrogen (N2)',
          C: 'Oxygen (O2)',
          D: 'Hydrogen (H2)'
        },
        correctAnswer: 'C',
        explanation: 'Water molecules (H2O) are split through photolysis during the light reactions, releasing oxygen gas into the atmosphere.'
      },
      {
        id: 'q-s3',
        question: 'Which of the following equations accurately summarizes the process of photosynthesis?',
        options: {
          A: '6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2',
          B: 'C6H12O6 + 6O2 -> 6CO2 + 6H2O + Energy',
          C: '6CO2 + 6O2 -> C6H12O6 + Light Energy',
          D: 'C6H12O6 + Light Energy -> 6CO2 + 6H2O'
        },
        correctAnswer: 'A',
        explanation: 'Carbon dioxide and water combine in the presence of sunlight and chlorophyll to form glucose and oxygen.'
      },
      {
        id: 'q-s4',
        question: 'Which tissue in vascular plants is responsible for transporting synthesized food (sucrose) from leaves to other parts of the plant?',
        options: {
          A: 'Xylem',
          B: 'Phloem',
          C: 'Epidermis',
          D: 'Cortex'
        },
        correctAnswer: 'B',
        explanation: 'Phloem tissue conducts synthesized organic nutrients (translocation), while xylem transports water and dissolved mineral salts.'
      },
      {
        id: 'q-s5',
        question: 'What is the function of guard cells in plant leaves?',
        options: {
          A: 'To absorb sunlight',
          B: 'To regulate the opening and closing of stomata',
          C: 'To absorb water from the soil',
          D: 'To produce floral pigments'
        },
        correctAnswer: 'B',
        explanation: 'Guard cells swell or shrink by turgor pressure changes to open or close the stomatal pore, controlling gas exchange and transpiration.'
      }
    ]
  },
  {
    id: 'quiz-maths-g11',
    title: 'Grade 11 Mathematics - Algebraic Expressions & Quadratic Equations',
    type: 'MCQ Quiz Papers',
    grade: 11,
    subject: 'Mathematics',
    mode: 'Read',
    previewPages: 2,
    readLink: null,
    downloadLink: null,
    pdfData: null,
    isFree: false,
    price: 0,
    published: true,
    allowRetry: true,
    textNotes: 'Calculators are not permitted. Select the best answer for each question.',
    questions: [
      {
        id: 'q-m1',
        question: 'What are the roots of the quadratic equation x^2 - 5x + 6 = 0?',
        options: {
          A: 'x = 2 and x = 3',
          B: 'x = -2 and x = -3',
          C: 'x = 1 and x = 6',
          D: 'x = -1 and x = 6'
        },
        correctAnswer: 'A',
        explanation: 'Factoring gives (x - 2)(x - 3) = 0, so x = 2 or x = 3.'
      },
      {
        id: 'q-m2',
        question: 'What is the discriminant formula for a quadratic equation ax^2 + bx + c = 0?',
        options: {
          A: 'b^2 + 4ac',
          B: 'b^2 - 4ac',
          C: '4ac - b^2',
          D: '-b +- sqrt(4ac)'
        },
        correctAnswer: 'B',
        explanation: 'The discriminant delta is calculated as b^2 - 4ac, which determines the nature of the roots.'
      },
      {
        id: 'q-m3',
        question: 'If the discriminant delta < 0, what can be concluded about the roots of the quadratic equation?',
        options: {
          A: 'Roots are real and distinct',
          B: 'Roots are real and equal',
          C: 'No real roots exist (roots are complex)',
          D: 'One root is zero'
        },
        correctAnswer: 'C',
        explanation: 'When delta < 0, the term under the square root is negative, meaning there are no real solutions.'
      },
      {
        id: 'q-m4',
        question: 'What is the value of 2^5 / 2^2?',
        options: {
          A: '2^7',
          B: '2^10',
          C: '2^3 = 8',
          D: '2^2.5'
        },
        correctAnswer: 'C',
        explanation: 'By the laws of indices: a^m / a^n = a^(m - n). Therefore 2^(5 - 2) = 2^3 = 8.'
      }
    ]
  }
];

const SAMPLE_STUDENTS = [
  {
    id: 'stu-standard-1',
    firstName: 'Kasun',
    lastName: 'Perera',
    grade: 10,
    email: 'kasun@gmail.com',
    phone: '0712345678',
    pass: '123456',
    status: 'active',
    allowedBooks: [],
    subscription: {
      plan: 'STANDARD',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      activatedAt: new Date().toISOString()
    },
    quizHistory: []
  },
  {
    id: 'stu-free-1',
    firstName: 'Kamal',
    lastName: 'Silva',
    grade: 10,
    email: 'kamal@gmail.com',
    phone: '0778901234',
    pass: '123456',
    status: 'active',
    allowedBooks: [],
    subscription: {
      plan: 'FREE',
      expiryDate: null,
      activatedAt: null
    },
    quizHistory: []
  }
];

function runMigration() {
  let changed = false;

  // Seed sample books / quizzes if none exist
  if (books.length === 0) {
    books = [...SAMPLE_MCQ_QUIZZES];
    changed = true;
  } else {
    // If books exist but have no MCQ quizzes, add sample MCQ quizzes so testing works immediately
    const hasMcq = books.some(b => b.type === 'MCQ Quiz Papers');
    if (!hasMcq) {
      books.push(...SAMPLE_MCQ_QUIZZES);
      changed = true;
    }
  }

  // Seed sample students if none exist
  if (students.length === 0) {
    students = [...SAMPLE_STUDENTS];
    changed = true;
  }

  // Migrate students: add subscription and quizHistory
  students = students.map(s => {
    if (!s.subscription) {
      s.subscription = { plan: 'FREE', expiryDate: null, activatedAt: null };
      changed = true;
    }
    if (!s.allowedBooks) {
      s.allowedBooks = [];
      changed = true;
    }
    if (!s.quizHistory) {
      s.quizHistory = [];
      changed = true;
    }
    return s;
  });

  // Migrate books: rename 'Online MCQ Papers' → 'MCQ Quiz Papers' and ensure MCQ properties
  books = books.map(b => {
    if (b.type === 'Online MCQ Papers') {
      b.type = 'MCQ Quiz Papers';
      changed = true;
    }
    if (b.type === 'MCQ Quiz Papers') {
      if (b.published === undefined) { b.published = true; changed = true; }
      if (b.allowRetry === undefined) { b.allowRetry = true; changed = true; }
      if (!b.questions) { b.questions = []; changed = true; }
      if (b.textNotes === undefined) { b.textNotes = ''; changed = true; }
    }
    return b;
  });

  if (changed) saveData();
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================
let currentUser = null; // { type: 'admin' } or { type: 'student', id: ... }

function getCurrentStudent() {
  if (!currentUser || currentUser.type !== 'student') return null;
  return students.find(s => s.id === currentUser.id) || null;
}

// ============================================================
// SUBSCRIPTION HELPERS
// ============================================================
function getEffectivePlan(student) {
  if (!student || !student.subscription) return 'FREE';
  const { plan, expiryDate } = student.subscription;
  if (plan === 'FREE') return 'FREE';
  if (!expiryDate) return plan;
  const now = new Date();
  const expiry = new Date(expiryDate);
  if (now > expiry) return 'FREE'; // expired → fallback
  return plan;
}

function isSubscriptionExpired(student) {
  if (!student || !student.subscription) return false;
  const { plan, expiryDate } = student.subscription;
  if (plan === 'FREE' || !expiryDate) return false;
  return new Date() > new Date(expiryDate);
}

function getDaysRemaining(student) {
  if (!student || !student.subscription || !student.subscription.expiryDate) return null;
  const diff = new Date(student.subscription.expiryDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function canRead(student, book) {
  const plan = getEffectivePlan(student);
  if (book.type === 'MCQ Quiz Papers') return canAccessMCQ(student);
  return PLAN_FEATURES[plan].fullRead;
}

function canDownload(student, book) {
  const plan = getEffectivePlan(student);
  return PLAN_FEATURES[plan].download && book.mode === 'Read+Download';
}

function canAccessMCQ(student) {
  const plan = getEffectivePlan(student);
  return PLAN_FEATURES[plan].mcq;
}

function getPreviewLimit(student) {
  const plan = getEffectivePlan(student);
  return PLAN_FEATURES[plan].preview; // null = no limit
}

function calcExpiryDate(plan) {
  const p = PLANS[plan];
  if (!p || !p.days) return null;
  const d = new Date();
  d.setDate(d.getDate() + p.days);
  return d.toISOString();
}

// ============================================================
// AUTH FUNCTIONS
// ============================================================
function switchAuthTab(tab) {
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
  document.getElementById('loginTabBtn').classList.toggle('active', tab === 'login');
  document.getElementById('registerTabBtn').classList.toggle('active', tab === 'register');
}

function quickFillLogin(role) {
  if (role === 'admin') {
    document.getElementById('loginEmail').value = ADMIN_EMAIL;
    document.getElementById('loginPass').value = ADMIN_PASS;
  } else if (role === 'standard') {
    document.getElementById('loginEmail').value = 'kasun@gmail.com';
    document.getElementById('loginPass').value = '123456';
  } else if (role === 'free') {
    document.getElementById('loginEmail').value = 'kamal@gmail.com';
    document.getElementById('loginPass').value = '123456';
  }
  doLogin();
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  errEl.classList.add('hidden');

  if (!email || !pass) { showLoginError('Please fill in all fields / සියළු ක්ෂේත්‍ර පුරවන්න'); return; }

  // Admin check
  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    currentUser = { type: 'admin' };
    showPage('admin');
    return;
  }

  // Student check
  const student = students.find(s => s.email.toLowerCase() === email.toLowerCase() && s.pass === pass);
  if (!student) { showLoginError('Invalid email or password / වැරදි ඊමේල් හෝ මුරපදය'); return; }
  if (student.status === 'inactive') { showLoginError('Account inactive. Contact admin / ගිණුම අක්‍රියයි'); return; }

  currentUser = { type: 'student', id: student.id };
  showPage('student');
}

function showLoginError(msg) {
  const el = document.getElementById('loginError');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function doRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const pass = document.getElementById('regPass').value;
  const grade = document.getElementById('regGrade').value;
  const errEl = document.getElementById('registerError');
  errEl.classList.add('hidden');

  if (!name || !email || !pass || !grade) {
    showRegisterError('Please fill in all required fields'); return;
  }
  if (pass.length < 6) { showRegisterError('Password must be at least 6 characters'); return; }
  if (!['6','7','8','9','10','11'].includes(grade)) { showRegisterError('Please select a valid grade (6-11)'); return; }
  if (students.find(s => s.email.toLowerCase() === email.toLowerCase())) {
    showRegisterError('Email already registered / ඊමේල් දැනටමත් ලියාපදිංචි වී ඇත'); return;
  }

  // Split name
  const nameParts = name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';

  const newStudent = {
    id: generateId(),
    firstName, lastName,
    grade: parseInt(grade),
    email, phone: phone || '',
    pass, status: 'active',
    allowedBooks: [],
    subscription: { plan: 'FREE', expiryDate: null, activatedAt: null }
  };

  students.push(newStudent);
  saveData();

  currentUser = { type: 'student', id: newStudent.id };
  showPage('student');
  showToast('Account created successfully! Welcome!', 'success');
}

function showRegisterError(msg) {
  const el = document.getElementById('registerError');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function doLogout() {
  currentUser = null;
  // Clear PDF state
  closePdfReader();
  showPage('auth');
  // Reset login fields
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').classList.add('hidden');
}

// ============================================================
// PAGE ROUTING
// ============================================================
function showPage(page) {
  document.getElementById('authPage').style.display = 'none';
  document.getElementById('studentDashboard').classList.add('hidden');
  document.getElementById('adminPanel').classList.add('hidden');

  if (page === 'auth') {
    document.getElementById('authPage').style.display = 'flex';
    if (typeof startAuthAnimation === 'function') {
      startAuthAnimation();
    }
  } else {
    if (typeof stopAuthAnimation === 'function') {
      stopAuthAnimation();
    }
    if (page === 'student') {
      document.getElementById('studentDashboard').classList.remove('hidden');
      initStudentDashboard();
    } else if (page === 'admin') {
      document.getElementById('adminPanel').classList.remove('hidden');
      initAdminPanel();
    }
  }
}

// ============================================================
// STUDENT DASHBOARD
// ============================================================
let currentStudentPanel = 'overview';

function initStudentDashboard() {
  showStudentPanel('overview');
}

function showStudentPanel(panel) {
  currentStudentPanel = panel;
  const panels = ['overview','ebooks','shortnotes','modelpapers','mcq','subscription'];
  panels.forEach(p => {
    document.getElementById('panel-' + p).classList.add('hidden');
    const navDesktop = document.getElementById('nav-' + p);
    const navMobile = document.getElementById('mob-' + p);
    if (navDesktop) navDesktop.classList.remove('active');
    if (navMobile) navMobile.classList.remove('active');
  });

  const el = document.getElementById('panel-' + panel);
  if (el) { el.classList.remove('hidden'); el.classList.add('fade-in'); }
  const navD = document.getElementById('nav-' + panel);
  const navM = document.getElementById('mob-' + panel);
  if (navD) navD.classList.add('active');
  if (navM) navM.classList.add('active');

  switch(panel) {
    case 'overview':    renderOverview(); break;
    case 'ebooks':      renderContentLibrary('e-Books', 'ebooks'); break;
    case 'shortnotes':  renderContentLibrary('Short Notes', 'shortnotes'); break;
    case 'modelpapers': renderContentLibrary('Model Papers', 'modelpapers'); break;
    case 'mcq':         renderMCQPanel(); break;
    case 'subscription': renderSubscriptionPanel(); break;
  }

  updateSidebarInfo();
}

function updateSidebarInfo() {
  const student = getCurrentStudent();
  if (!student) return;
  const initials = getInitials(student);
  const plan = getEffectivePlan(student);
  const planInfo = PLANS[plan];

  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('overviewAvatar').textContent = initials;
  document.getElementById('sidebarName').textContent = student.firstName + ' ' + student.lastName;
  document.getElementById('sidebarGrade').textContent = 'Grade ' + student.grade;

  const planBadgeHtml = `<span class="badge" style="background:${planInfo.bg};color:${planInfo.color};border-color:${planInfo.border}"><i class="fas fa-crown"></i>${plan}</span>`;
  document.getElementById('sidebarPlanBadge').innerHTML = planBadgeHtml;
  document.getElementById('headerPlanBadge').innerHTML = planBadgeHtml;
}

function getInitials(student) {
  const f = (student.firstName || '?')[0].toUpperCase();
  const l = (student.lastName || '?')[0].toUpperCase();
  return f + l;
}

// ----- OVERVIEW -----
function renderOverview() {
  const student = getCurrentStudent();
  if (!student) return;

  const plan = getEffectivePlan(student);
  const planInfo = PLANS[plan];
  const expired = isSubscriptionExpired(student);
  const daysLeft = getDaysRemaining(student);

  document.getElementById('overviewName').textContent = student.firstName + ' ' + student.lastName;
  document.getElementById('overviewGrade').textContent = 'Grade ' + student.grade + ' / ' + student.grade + ' ශ්‍රේණිය';
  document.getElementById('overviewAvatar').textContent = getInitials(student);

  // Plan badge
  document.getElementById('overviewPlanBadge').innerHTML =
    `<span class="badge" style="background:${planInfo.bg};color:${planInfo.color};border-color:${planInfo.border}"><i class="fas fa-crown mr-1"></i>${plan} Plan</span>`;

  // Expiry badge
  let expiryHtml = '';
  if (plan === 'FREE') {
    expiryHtml = `<span class="badge badge-free"><i class="fas fa-infinity mr-1"></i>No Expiry</span>`;
  } else if (expired) {
    expiryHtml = `<span class="badge badge-expired"><i class="fas fa-exclamation-triangle mr-1"></i>Expired</span>`;
  } else if (daysLeft !== null) {
    expiryHtml = `<span class="badge" style="background:#1e2d1e;color:#86efac;border:1px solid #22c55e"><i class="fas fa-calendar mr-1"></i>${daysLeft} days left</span>`;
  }
  document.getElementById('overviewExpiryBadge').innerHTML = expiryHtml;

  // Expiry warning
  const warnEl = document.getElementById('overviewExpiryWarning');
  if (expired) {
    warnEl.innerHTML = `<div class="expiry-expired"><i class="fas fa-exclamation-circle mr-2"></i><strong>Subscription Expired!</strong> Your ${student.subscription.plan} plan has expired. You now have FREE plan access. <button onclick="showStudentPanel('subscription')" style="text-decoration:underline;cursor:pointer;margin-left:8px">Renew now →</button></div>`;
    warnEl.classList.remove('hidden');
  } else if (daysLeft !== null && daysLeft <= 7) {
    warnEl.innerHTML = `<div class="expiry-warning"><i class="fas fa-clock mr-2"></i><strong>Expiry Warning!</strong> Your subscription expires in <strong>${daysLeft} day${daysLeft===1?'':'s'}</strong>. <button onclick="showStudentPanel('subscription')" style="text-decoration:underline;cursor:pointer;margin-left:8px">Renew now →</button></div>`;
    warnEl.classList.remove('hidden');
  } else {
    warnEl.classList.add('hidden');
  }

  // Quick stats
  const myBooks = books.filter(b => parseInt(b.grade) === parseInt(student.grade));
  const ebooks = myBooks.filter(b => b.type === 'e-Books').length;
  const notes = myBooks.filter(b => b.type === 'Short Notes').length;
  const papers = myBooks.filter(b => b.type === 'Model Papers').length;
  const mcq = myBooks.filter(b => b.type === 'MCQ Quiz Papers' && b.published !== false).length;

  const statsData = [
    { label: 'e-Books', value: ebooks, icon: 'fas fa-book', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', panel: 'ebooks' },
    { label: 'Short Notes', value: notes, icon: 'fas fa-sticky-note', color: '#10b981', bg: 'rgba(16,185,129,0.1)', panel: 'shortnotes' },
    { label: 'Model Papers', value: papers, icon: 'fas fa-file-alt', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', panel: 'modelpapers' },
    { label: 'MCQ Papers', value: mcq, icon: 'fas fa-puzzle-piece', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', panel: 'mcq' }
  ];

  document.getElementById('overviewStats').innerHTML = statsData.map(s => `
    <div class="stat-card cursor-pointer" onclick="showStudentPanel('${s.panel}')">
      <div class="stat-icon" style="background:${s.bg}">
        <i class="${s.icon}" style="color:${s.color}"></i>
      </div>
      <div>
        <div class="text-2xl font-black text-white">${s.value}</div>
        <div class="text-slate-400 text-xs">${s.label}</div>
      </div>
    </div>
  `).join('');
}

// ----- CONTENT LIBRARY (eBooks, Short Notes, Model Papers) -----
let subjectFilters = { ebooks: 'All', shortnotes: 'All', modelpapers: 'All', mcq: 'All' };

function renderContentLibrary(type, panelKey) {
  const student = getCurrentStudent();
  if (!student) return;

  let myBooks = books.filter(b => b.type === type && parseInt(b.grade) === parseInt(student.grade));
  if (type === 'MCQ Quiz Papers') {
    myBooks = myBooks.filter(b => b.published !== false);
  }
  const subjects = ['All', ...new Set(myBooks.map(b => b.subject).filter(Boolean))];

  const filterId = panelKey + 'SubjectFilter';
  const gridId = panelKey + 'Grid';

  // Subject filter pills
  document.getElementById(filterId).innerHTML = subjects.map(subj =>
    `<span class="subject-pill ${subjectFilters[panelKey] === subj ? 'active' : ''}"
      onclick="setSubjectFilter('${panelKey}','${subj}','${type}')">${subj}</span>`
  ).join('');

  // Filter books
  const filtered = myBooks.filter(b =>
    subjectFilters[panelKey] === 'All' || b.subject === subjectFilters[panelKey]
  );

  const grid = document.getElementById(gridId);
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state col-span-full"><i class="fas fa-folder-open"></i><p class="text-lg font-semibold">No ${type} available for Grade ${student.grade}</p><p class="text-sm mt-2">Check back later for new content!</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(book => buildBookCard(book, student)).join('');
}

function setSubjectFilter(panelKey, subject, type) {
  subjectFilters[panelKey] = subject;
  renderContentLibrary(type, panelKey);
}

function buildBookCard(book, student) {
  const plan = getEffectivePlan(student);
  const features = PLAN_FEATURES[plan];
  const isMCQ = book.type === 'MCQ Quiz Papers';
  const canReadBook = isMCQ ? features.mcq : features.fullRead;
  const canDl = features.download && book.mode === 'Read+Download';
  const isFreeBook = book.isFree;

  const typeColors = {
    'e-Books': { bg:'#1e3a5f', color:'#60a5fa', border:'#2563eb', icon:'fa-book' },
    'Short Notes': { bg:'#1e3a2f', color:'#34d399', border:'#10b981', icon:'fa-sticky-note' },
    'Model Papers': { bg:'#3b1f6e', color:'#c084fc', border:'#9333ea', icon:'fa-file-alt' },
    'MCQ Quiz Papers': { bg:'#451a03', color:'#fb923c', border:'#ea580c', icon:'fa-puzzle-piece' }
  };
  const tc = typeColors[book.type] || typeColors['e-Books'];

  let actionButtons = '';
  let lockOverlay = '';

  if (isMCQ) {
    const qCount = (book.questions || []).length;
    const history = student ? (student.quizHistory || []) : [];
    const attempts = history.filter(a => a.quizId === book.id);
    const latestAttempt = attempts.length > 0 ? attempts[0] : null;

    if (canReadBook || isFreeBook) {
      let scoreBadge = '';
      if (latestAttempt) {
        const isPass = latestAttempt.percentage >= 50;
        scoreBadge = `
          <div class="mb-2 text-xs flex items-center justify-between px-2.5 py-1.5 rounded-lg border" style="background:${isPass ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'};border-color:${isPass ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}">
            <span class="text-slate-300">Latest Score:</span>
            <span class="font-bold ${isPass ? 'text-emerald-400' : 'text-red-400'}">${latestAttempt.percentage}% (${latestAttempt.score}/${latestAttempt.total})</span>
          </div>`;
      }

      const allowRetry = book.allowRetry !== false;
      let btnText = 'Start Quiz';
      let btnIcon = 'fa-play';
      if (latestAttempt) {
        btnText = allowRetry ? 'Retry Quiz' : 'View Results';
        btnIcon = allowRetry ? 'fa-redo-alt' : 'fa-chart-bar';
      }

      actionButtons = `
        <div class="w-full space-y-2">
          ${scoreBadge}
          <div class="flex gap-2">
            <button onclick="openQuizModal('${book.id}')" class="btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5">
              <i class="fas ${btnIcon}"></i><span>${btnText}</span>
            </button>
            ${latestAttempt ? `
              <button onclick="viewQuizAttemptResults('${latestAttempt.attemptId}')" class="btn-secondary btn-sm" title="Review Last Attempt Answers">
                <i class="fas fa-eye"></i>
              </button>
            ` : ''}
          </div>
        </div>`;
    } else {
      lockOverlay = `
        <div class="locked-overlay p-3">
          <div class="text-3xl mb-1.5">🔒</div>
          <p class="text-white font-bold text-sm mb-0.5">MCQ Quiz Locked</p>
          <p class="text-slate-400 text-xs mb-3 text-center px-2 leading-tight">MCQ Quiz Papers require STANDARD or PREMIUM subscription. Upgrade your plan to take interactive quizzes.</p>
          <div class="flex items-center justify-center gap-2 flex-wrap">
            <button onclick="showUpgradeModal('mcq', '${book.id}')" class="btn-primary btn-sm">
              <i class="fas fa-crown mr-1"></i>Upgrade Plan
            </button>
          </div>
        </div>`;
    }
  } else if (isFreeBook || canReadBook) {
    // Has read access
    const readLink = book.readLink || (book.pdfData ? '#' : '');
    const hasPdf = book.pdfData || book.readLink;

    if (hasPdf) {
      if (plan === 'FREE' && !isFreeBook) {
        // Preview only
        actionButtons += `<button onclick="openPdfReader('${book.id}')" class="btn-secondary btn-sm flex-1"><i class="fas fa-eye mr-1"></i>Preview (2 pages)</button>`;
      } else {
        actionButtons += `<button onclick="openPdfReader('${book.id}')" class="btn-primary btn-sm flex-1"><i class="fas fa-book-open mr-1"></i>Read</button>`;
      }
    } else if (book.readLink) {
      actionButtons += `<a href="${book.readLink}" target="_blank" class="btn-primary btn-sm flex-1 text-center"><i class="fas fa-external-link-alt mr-1"></i>Open</a>`;
    }

    if (canDl && book.downloadLink) {
      actionButtons += `<a href="${book.downloadLink}" target="_blank" class="btn-secondary btn-sm"><i class="fas fa-download"></i></a>`;
    } else if (canDl && book.pdfData) {
      actionButtons += `<button onclick="downloadBook('${book.id}')" class="btn-secondary btn-sm"><i class="fas fa-download"></i></button>`;
    }
  } else {
    // Locked
    if (plan === 'FREE' && (book.pdfData || book.readLink)) {
      actionButtons = `<button onclick="openPdfReader('${book.id}')" class="btn-secondary btn-sm flex-1"><i class="fas fa-eye mr-1"></i>Free Plan (2 Pages)</button>`;
    }
    const hasPdfOrRead = book.pdfData || book.readLink;
    const freePlanBtn = (!isMCQ && hasPdfOrRead)
      ? `<button onclick="openPdfReader('${book.id}')" class="btn-secondary btn-sm" style="background:#1e3a5f;border:1px solid #2563eb;color:#60a5fa" title="Free Plan: Preview 2 pages"><i class="fas fa-eye mr-1"></i>Free Plan (2 Pages)</button>`
      : '';

    lockOverlay = `
      <div class="locked-overlay p-3">
        <div class="text-3xl mb-1.5">🔒</div>
        <p class="text-white font-bold text-sm mb-0.5">Content Locked</p>
        <p class="text-slate-400 text-xs mb-3 text-center px-2 leading-tight">${isMCQ ? 'STANDARD or PREMIUM required for MCQ' : 'Upgrade to access full content or view 2 pages with Free Plan'}</p>
        <div class="flex items-center justify-center gap-2 flex-wrap">
          <button onclick="showUpgradeModal('${isMCQ ? 'mcq' : 'read'}', '${book.id}')" class="btn-primary btn-sm">
            <i class="fas fa-crown mr-1"></i>Upgrade
          </button>
          ${freePlanBtn}
        </div>
      </div>`;
  }

  return `
    <div class="card book-card relative">
      ${lockOverlay}
      <div class="flex items-start justify-between mb-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:${tc.bg};border:1px solid ${tc.border}">
          <i class="fas ${tc.icon}" style="color:${tc.color}"></i>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span class="badge badge-type" style="background:${tc.bg};color:${tc.color};border-color:${tc.border}">${book.type}</span>
          ${book.mode === 'Read+Download' ? '<span class="badge badge-type text-xs"><i class="fas fa-download mr-1"></i>DL</span>' : ''}
        </div>
      </div>
      <h4 class="font-bold text-white text-sm mb-1 leading-tight">${escHtml(book.title)}</h4>
      <p class="text-slate-400 text-xs mb-3">${escHtml(book.subject || '')} • Grade ${book.grade}</p>
      <div class="flex gap-2 flex-wrap mt-auto">
        ${actionButtons || '<span class="text-slate-500 text-xs">No content link</span>'}
      </div>
    </div>`;
}

// ----- MCQ PANEL -----
function renderMCQPanel() {
  const student = getCurrentStudent();
  if (!student) return;
  const plan = getEffectivePlan(student);
  const hasMCQAccess = PLAN_FEATURES[plan].mcq;

  const warnEl = document.getElementById('mcqAccessWarning');
  if (!hasMCQAccess) {
    warnEl.innerHTML = `
      <div class="card" style="border-color:rgba(234,179,8,0.4);background:rgba(234,179,8,0.05)">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="text-3xl">🔒</div>
          <div class="flex-1">
            <p class="font-bold text-yellow-400 mb-1">MCQ Quiz Papers Locked / ප්‍රශ්න පත්‍ර අගුළු දමා ඇත</p>
            <p class="text-slate-400 text-sm">MCQ Quiz Papers require STANDARD or PREMIUM subscription. Upgrade your plan to unlock interactive quizzes.</p>
          </div>
          <button onclick="showStudentPanel('subscription')" class="btn-primary btn-sm flex-shrink-0"><i class="fas fa-crown mr-1"></i>Upgrade Plan</button>
        </div>
      </div>`;
    warnEl.classList.remove('hidden');
  } else {
    warnEl.classList.add('hidden');
  }

  renderContentLibrary('MCQ Quiz Papers', 'mcq');
  renderStudentScoreHistory();
}

// ----- SUBSCRIPTION PANEL -----
function renderSubscriptionPanel() {
  const student = getCurrentStudent();
  if (!student) return;
  const plan = getEffectivePlan(student);
  const expired = isSubscriptionExpired(student);
  const daysLeft = getDaysRemaining(student);
  const planInfo = PLANS[plan];

  document.getElementById('currentPlanName').textContent = plan;
  document.getElementById('currentPlanName').style.color = planInfo.color;

  let expiryText = '';
  if (plan === 'FREE') {
    expiryText = 'No Expiry — Free forever / නොමිලේ සදහටම';
  } else if (expired) {
    expiryText = `⚠️ Expired on ${formatDate(student.subscription.expiryDate)} — Reverted to FREE`;
  } else if (student.subscription.expiryDate) {
    expiryText = `Expires: ${formatDate(student.subscription.expiryDate)} (${daysLeft} days remaining)`;
  }
  document.getElementById('currentPlanExpiry').textContent = expiryText;

  const features = PLAN_FEATURES[plan];
  document.getElementById('currentPlanFeatures').innerHTML = `
    <div class="${features.fullRead ? 'text-emerald-400' : 'text-red-400'}"><i class="fas ${features.fullRead ? 'fa-check' : 'fa-times'} mr-2"></i>Full Read Access</div>
    <div class="${features.download ? 'text-emerald-400' : 'text-red-400'}"><i class="fas ${features.download ? 'fa-check' : 'fa-times'} mr-2"></i>Download Books</div>
    <div class="${features.mcq ? 'text-emerald-400' : 'text-red-400'}"><i class="fas ${features.mcq ? 'fa-check' : 'fa-times'} mr-2"></i>MCQ Quiz Papers</div>
    <div class="text-slate-300"><i class="fas fa-calendar mr-2 text-blue-400"></i>${planInfo.label}</div>
  `;

  // Plan cards
  const planOrder = ['FREE','BASIC','STANDARD','PREMIUM'];
  document.getElementById('planCardsGrid').innerHTML = planOrder.map(p => {
    const pi = PLANS[p];
    const fi = PLAN_FEATURES[p];
    const isCurrent = p === student.subscription.plan;
    const isEffCurrent = p === plan;
    const isPopular = p === 'STANDARD';

    return `
      <div class="plan-card ${isCurrent ? 'current' : ''} ${p === 'PREMIUM' ? 'premium-card' : ''}">
        ${isPopular ? '<div style="position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#eab308,#f59e0b);color:#0f172a;font-size:0.7rem;font-weight:700;padding:3px 12px;border-radius:0 0 8px 8px">POPULAR</div>' : ''}
        <div class="text-center mb-4 pt-2">
          <div class="font-black text-xl mb-1" style="color:${pi.color}">${p}</div>
          <div class="text-3xl font-black text-white">
            ${pi.price === 0 ? 'Free' : 'LKR ' + pi.price}
          </div>
          <div class="text-slate-400 text-xs mt-1">${pi.label}</div>
        </div>
        <div class="space-y-2 text-sm mb-4">
          <div class="${fi.fullRead ? 'text-emerald-400' : 'text-slate-500'}">
            <i class="fas ${fi.fullRead ? 'fa-check-circle' : 'fa-times-circle'} mr-2"></i>Full Read Access
          </div>
          <div class="${fi.download ? 'text-emerald-400' : 'text-slate-500'}">
            <i class="fas ${fi.download ? 'fa-check-circle' : 'fa-times-circle'} mr-2"></i>Download Books
          </div>
          <div class="${fi.mcq ? 'text-emerald-400' : 'text-slate-500'}">
            <i class="fas ${fi.mcq ? 'fa-check-circle' : 'fa-times-circle'} mr-2"></i>MCQ Quiz Papers
          </div>
          <div class="text-slate-400">
            <i class="fas fa-eye mr-2 text-blue-400"></i>${fi.preview ? fi.preview + ' page preview' : 'Unlimited pages'}
          </div>
        </div>
        ${isCurrent && !expired ? 
          `<div class="text-center text-sm font-bold text-yellow-400 py-2"><i class="fas fa-check mr-2"></i>Current Plan</div>` :
          p === 'FREE' ?
          `<div class="text-center text-sm text-slate-500 py-2">Always free</div>` :
          `<button onclick="openPaymentModal('${p}')" class="btn-primary w-full text-center text-sm" ${isCurrent && !expired ? 'disabled' : ''}>
            <i class="fas fa-credit-card mr-2"></i>Select Plan / තෝරන්න
          </button>`
        }
      </div>`;
  }).join('');
}

// ============================================================
// PDF READER
// ============================================================
let pdfDoc = null;
let pdfPage = 1;
let pdfTotalPages = 1;
let pdfPageLimit = null;
let pdfCurrentBook = null;
let pdfCurrentStudent = null;

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

function openPdfReader(bookId) {
  const student = getCurrentStudent();
  const book = books.find(b => b.id === bookId);
  if (!student || !book) return;

  const plan = getEffectivePlan(student);
  const features = PLAN_FEATURES[plan];

  // MCQ check
  if (book.type === 'MCQ Quiz Papers') {
    if (!features.mcq && !book.isFree) {
      showUpgradeModal('mcq', bookId);
    } else {
      openQuizModal(bookId);
    }
    return;
  }

  pdfCurrentBook = book;
  pdfCurrentStudent = student;
  pdfPageLimit = (!book.isFree) ? features.preview : null;

  document.getElementById('pdfTitle').textContent = book.title;
  document.getElementById('pdfStudentInfo').textContent = student.firstName + ' ' + student.lastName + ' • ' + student.email;

  // Download btn
  const canDl = canDownload(student, book);
  document.getElementById('pdfDownloadBtn').classList.toggle('hidden', !canDl);

  // Watermark
  buildWatermark(student);

  // Load PDF
  const modal = document.getElementById('pdfReaderModal');
  modal.classList.remove('hidden');
  modal.style.display = 'flex';

  pdfPage = 1;
  document.getElementById('pageLimitOverlay').classList.add('hidden');

  if (book.pdfData) {
    loadPdfFromData(book.pdfData);
  } else if (book.readLink) {
    // Open in new tab if no embedded PDF
    modal.classList.add('hidden');
    modal.style.display = 'none';
    window.open(book.readLink, '_blank');
    return;
  } else {
    showToast('No PDF content available for this book', 'error');
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

function loadPdfFromData(data) {
  let src;
  if (typeof data === 'string' && data.startsWith('data:')) {
    // base64 data URL
    const base64 = data.split(',')[1];
    const bin = atob(base64);
    const arr = new Uint8Array(bin.length);
    for (let i=0; i<bin.length; i++) arr[i] = bin.charCodeAt(i);
    src = { data: arr };
  } else {
    src = data;
  }

  pdfjsLib.getDocument(src).promise.then(doc => {
    pdfDoc = doc;
    pdfTotalPages = doc.numPages;
    renderPdfPage(1);
  }).catch(err => {
    console.error('PDF load error:', err);
    showToast('Failed to load PDF', 'error');
    closePdfReader();
  });
}

function renderPdfPage(num) {
  if (!pdfDoc) return;
  pdfPage = num;

  // Check page limit
  if (pdfPageLimit && pdfPage > pdfPageLimit) {
    pdfPage = pdfPageLimit;
    document.getElementById('pageLimitOverlay').classList.remove('hidden');
  } else {
    document.getElementById('pageLimitOverlay').classList.add('hidden');
  }

  pdfDoc.getPage(pdfPage).then(page => {
    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas.getContext('2d');
    const containerWidth = document.getElementById('pdfContainer').clientWidth - 40;
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(containerWidth / viewport.width, 2);
    const scaledViewport = page.getViewport({ scale });

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    page.render({ canvasContext: ctx, viewport: scaledViewport }).promise.then(() => {
      updatePdfNav();
    });
  });
}

function updatePdfNav() {
  const displayPage = pdfPage;
  document.getElementById('pdfPageInfo').textContent = `${displayPage} / ${pdfTotalPages}${pdfPageLimit ? ' (Free Plan: '+pdfPageLimit+' pages)' : ''}`;
  document.getElementById('pdfPrevBtn').disabled = pdfPage <= 1;
  document.getElementById('pdfNextBtn').disabled = (!pdfPageLimit && pdfPage >= pdfTotalPages);
}

function pdfPrevPage() {
  if (pdfPage > 1) renderPdfPage(pdfPage - 1);
}

function pdfNextPage() {
  if (pdfPageLimit && pdfPage >= pdfPageLimit) {
    document.getElementById('pageLimitOverlay').classList.remove('hidden');
    return;
  }
  if (pdfPage < pdfTotalPages) renderPdfPage(pdfPage + 1);
}

function pdfDownload() {
  const book = pdfCurrentBook;
  const student = pdfCurrentStudent;
  if (!book || !student) return;
  if (!canDownload(student, book)) { showUpgradeModal('download'); return; }

  if (book.downloadLink) {
    window.open(book.downloadLink, '_blank');
  } else if (book.pdfData) {
    const a = document.createElement('a');
    a.href = book.pdfData;
    a.download = book.title + '.pdf';
    a.click();
  }
}

function closePdfReader() {
  const modal = document.getElementById('pdfReaderModal');
  modal.classList.add('hidden');
  modal.style.display = 'none';
  pdfDoc = null;
  pdfCurrentBook = null;
  pdfCurrentStudent = null;
  // Clear canvas
  const canvas = document.getElementById('pdfCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function buildWatermark(student) {
  const container = document.getElementById('pdfWatermark');
  container.innerHTML = '';
  const text = `${student.firstName} ${student.lastName} • ${student.email}`;
  const positions = [
    {top:'15%',left:'5%'},{top:'35%',left:'25%'},{top:'55%',left:'5%'},
    {top:'75%',left:'25%'},{top:'20%',left:'55%'},{top:'45%',left:'55%'},
    {top:'65%',left:'70%'},{top:'85%',left:'5%'},{top:'90%',left:'50%'}
  ];
  positions.forEach(pos => {
    const el = document.createElement('div');
    el.className = 'watermark-text';
    el.textContent = text;
    el.style.top = pos.top;
    el.style.left = pos.left;
    el.style.animationDelay = (Math.random() * 4) + 's';
    container.appendChild(el);
  });
}

function downloadBook(bookId) {
  const student = getCurrentStudent();
  const book = books.find(b => b.id === bookId);
  if (!book || !student) return;
  if (!canDownload(student, book)) { showUpgradeModal('download'); return; }
  if (book.pdfData) {
    const a = document.createElement('a');
    a.href = book.pdfData;
    a.download = book.title + '.pdf';
    a.click();
  } else if (book.downloadLink) {
    window.open(book.downloadLink, '_blank');
  }
}

// ============================================================
// UPGRADE MODAL
// ============================================================
let activeUpgradeBookId = null;

function showUpgradeModal(reason, bookId = null) {
  activeUpgradeBookId = bookId;
  const msgs = {
    mcq: 'MCQ Quiz Papers require STANDARD or PREMIUM subscription to access.',
    download: 'Downloading files requires STANDARD or PREMIUM subscription.',
    read: 'Full reading access requires BASIC, STANDARD, or PREMIUM subscription. Free plan allows 2 pages preview.'
  };

  document.getElementById('upgradeModalMsg').textContent = msgs[reason] || msgs.read;

  const planOrder = ['FREE', 'BASIC', 'STANDARD', 'PREMIUM'];
  document.getElementById('upgradeModalPlans').innerHTML = planOrder.map(p => {
    const pi = PLANS[p];
    const fi = PLAN_FEATURES[p];
    const isFree = p === 'FREE';
    return `
      <div style="background:${pi.bg};border:1px solid ${pi.border};border-radius:10px;padding:12px;text-align:center">
        <div style="color:${pi.color};font-weight:700;font-size:0.85rem">${p}</div>
        <div style="color:#fff;font-weight:800;font-size:1.05rem">${isFree ? 'Free' : 'LKR ' + pi.price}</div>
        <div style="color:#94a3b8;font-size:0.7rem">${isFree ? 'Free Forever' : pi.label}</div>
        <div style="margin-top:6px;font-size:0.7rem;color:${isFree ? '#60a5fa' : (fi.mcq ? '#34d399' : '#ef4444')}">${isFree ? '📄 2 Pages Preview' : (fi.mcq ? '✅ MCQ' : '❌ MCQ')}</div>
        <div style="font-size:0.7rem;color:${fi.download ? '#34d399' : '#ef4444'}">${fi.download ? '✅ Download' : '❌ Download'}</div>
      </div>`;
  }).join('');

  const freeBtn = document.getElementById('upgradeModalFreeBtn');
  if (freeBtn) {
    if (activeUpgradeBookId && reason !== 'mcq') {
      freeBtn.classList.remove('hidden');
    } else {
      freeBtn.classList.add('hidden');
    }
  }

  document.getElementById('upgradeModal').classList.remove('hidden');
}

function closeUpgradeModal() {
  document.getElementById('upgradeModal').classList.add('hidden');
  activeUpgradeBookId = null;
}

// ============================================================
// PAYMENT / SUBSCRIPTION REQUEST MODAL
// ============================================================
let selectedPlanForPayment = null;

function openPaymentModal(plan) {
  selectedPlanForPayment = plan;
  const pi = PLANS[plan];

  document.getElementById('paymentPlanInfo').innerHTML = `
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div>
        <div style="color:${pi.color};font-weight:800;font-size:1.2rem">${plan} Plan</div>
        <div class="text-slate-300 text-sm">${pi.label} access</div>
      </div>
      <div class="text-right">
        <div class="text-white font-black text-2xl">LKR ${pi.price}</div>
        <div class="text-slate-400 text-xs">One-time payment</div>
      </div>
    </div>`;

  document.getElementById('paymentCode').value = '';
  document.getElementById('paymentError').classList.add('hidden');
  document.getElementById('paymentModal').classList.remove('hidden');
}

function closePaymentModal() {
  document.getElementById('paymentModal').classList.add('hidden');
  selectedPlanForPayment = null;
}

function submitPaymentRequest() {
  const student = getCurrentStudent();
  if (!student || !selectedPlanForPayment) return;

  const code = document.getElementById('paymentCode').value.trim();
  const errEl = document.getElementById('paymentError');

  if (!code || code.length < 6) {
    errEl.textContent = 'Please enter a valid payment code (minimum 6 characters)';
    errEl.classList.remove('hidden');
    return;
  }

  // Check for duplicate pending request
  const existing = orders.find(o => o.studentId === student.id && o.status === 'pending');
  if (existing) {
    errEl.textContent = 'You already have a pending subscription request. Please wait for admin approval.';
    errEl.classList.remove('hidden');
    return;
  }

  const request = {
    id: generateId(),
    studentId: student.id,
    studentName: student.firstName + ' ' + student.lastName,
    studentEmail: student.email,
    studentGrade: student.grade,
    plan: selectedPlanForPayment,
    paymentCode: code,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  orders.push(request);
  saveData();

  closePaymentModal();
  showToast('Subscription request submitted! Admin will review within 24 hours.', 'success');
  renderSubscriptionPanel();
}

// ============================================================
// ADMIN PANEL
// ============================================================
let currentAdminTab = 'analytics';
let planChartInst = null;
let revenueChartInst = null;

function initAdminPanel() {
  showAdminTab('analytics');
  updatePendingBadge();
  onResourceTypeChange();
}

function showAdminTab(tab) {
  const tabs = ['analytics','resources','quizzes','students','approvals'];
  tabs.forEach(t => {
    const el = document.getElementById('admin-' + t);
    const at = document.getElementById('atab-' + t);
    if (el) el.classList.add('hidden');
    if (at) at.classList.remove('active');
  });
  const target = document.getElementById('admin-' + tab);
  const targetTab = document.getElementById('atab-' + tab);
  if (target) target.classList.remove('hidden');
  if (targetTab) targetTab.classList.add('active');
  currentAdminTab = tab;

  switch(tab) {
    case 'analytics':  renderAdminAnalytics(); break;
    case 'resources':  renderResourcesTable(); break;
    case 'quizzes':    renderAdminQuizzes(); break;
    case 'students':   renderStudentsTable(); break;
    case 'approvals':  renderApprovals(); break;
  }
}

function updatePendingBadge() {
  const pending = orders.filter(o => o.status === 'pending').length;
  const badge = document.getElementById('pendingBadge');
  if (pending > 0) {
    badge.textContent = pending;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ----- ANALYTICS -----
function renderAdminAnalytics() {
  // Count plans
  const planCounts = { FREE:0, BASIC:0, STANDARD:0, PREMIUM:0 };
  const planRevenue = { FREE:0, BASIC:0, STANDARD:0, PREMIUM:0 };
  let activeStudents = 0;
  let totalRevenue = 0;

  students.forEach(s => {
    const plan = s.subscription ? s.subscription.plan : 'FREE';
    planCounts[plan] = (planCounts[plan] || 0) + 1;
    const expired = isSubscriptionExpired(s);
    if (!expired && plan !== 'FREE') {
      activeStudents++;
      const rev = PLANS[plan] ? PLANS[plan].price : 0;
      planRevenue[plan] += rev;
      totalRevenue += rev;
    }
  });

  // Stats grid
  document.getElementById('adminStatsGrid').innerHTML = [
    { label:'Total Students', value: students.length, icon:'fas fa-users', color:'#3b82f6', bg:'rgba(59,130,246,0.1)' },
    { label:'Active Subscribers', value: activeStudents, icon:'fas fa-crown', color:'#f59e0b', bg:'rgba(245,158,11,0.1)' },
    { label:'Total Resources', value: books.length, icon:'fas fa-book', color:'#10b981', bg:'rgba(16,185,129,0.1)' },
    { label:'Est. Revenue (LKR)', value: 'LKR '+totalRevenue, icon:'fas fa-coins', color:'#c084fc', bg:'rgba(192,132,252,0.1)' }
  ].map(s => `
    <div class="stat-card">
      <div class="stat-icon" style="background:${s.bg}"><i class="${s.icon}" style="color:${s.color}"></i></div>
      <div>
        <div class="text-xl font-black text-white">${s.value}</div>
        <div class="text-slate-400 text-xs">${s.label}</div>
      </div>
    </div>`).join('');

  // Destroy old charts
  if (planChartInst) { planChartInst.destroy(); planChartInst = null; }
  if (revenueChartInst) { revenueChartInst.destroy(); revenueChartInst = null; }

  // Plan chart
  const planCtx = document.getElementById('planChart').getContext('2d');
  planChartInst = new Chart(planCtx, {
    type: 'doughnut',
    data: {
      labels: ['FREE','BASIC','STANDARD','PREMIUM'],
      datasets: [{
        data: [planCounts.FREE, planCounts.BASIC, planCounts.STANDARD, planCounts.PREMIUM],
        backgroundColor: ['#1e3a5f','#1e3a2f','#3b1f6e','#451a03'],
        borderColor: ['#2563eb','#10b981','#9333ea','#ea580c'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 12 } } }
      }
    }
  });

  // Revenue chart
  const revCtx = document.getElementById('revenueChart').getContext('2d');
  revenueChartInst = new Chart(revCtx, {
    type: 'bar',
    data: {
      labels: ['FREE','BASIC','STANDARD','PREMIUM'],
      datasets: [{
        label: 'Revenue (LKR)',
        data: [planRevenue.FREE, planRevenue.BASIC, planRevenue.STANDARD, planRevenue.PREMIUM],
        backgroundColor: ['#1e3a5f','#1e3a2f','#3b1f6e','#451a03'],
        borderColor: ['#2563eb','#10b981','#9333ea','#ea580c'],
        borderWidth: 2, borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
      }
    }
  });

  // Subscription history table
  const tbody = document.getElementById('subscriptionHistoryBody');
  const subscribedStudents = students.filter(s => s.subscription && s.subscription.plan !== 'FREE');
  if (subscribedStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-slate-500 py-8">No subscription history yet</td></tr>`;
    return;
  }
  tbody.innerHTML = subscribedStudents.map(s => {
    const expired = isSubscriptionExpired(s);
    const plan = s.subscription.plan;
    const pi = PLANS[plan];
    return `
      <tr>
        <td class="font-semibold text-white">${escHtml(s.firstName)} ${escHtml(s.lastName)}</td>
        <td>Grade ${s.grade}</td>
        <td><span class="badge" style="background:${pi.bg};color:${pi.color};border-color:${pi.border}">${plan}</span></td>
        <td>${s.subscription.activatedAt ? formatDate(s.subscription.activatedAt) : '—'}</td>
        <td>${s.subscription.expiryDate ? formatDate(s.subscription.expiryDate) : '—'}</td>
        <td>${expired ? '<span class="badge badge-expired">Expired</span>' : '<span class="badge badge-basic">Active</span>'}</td>
      </tr>`;
  }).join('');
}

// ----- RESOURCES -----
function renderResourcesTable() {
  const gradeFilter = document.getElementById('resFilterGrade').value;
  const typeFilter = document.getElementById('resFilterType').value;
  const search = document.getElementById('resFilterSearch').value.toLowerCase();

  const filtered = books.filter(b => {
    const gradeMatch = !gradeFilter || String(b.grade) === gradeFilter;
    const typeMatch = !typeFilter || b.type === typeFilter;
    const searchMatch = !search || b.title.toLowerCase().includes(search) || (b.subject||'').toLowerCase().includes(search);
    return gradeMatch && typeMatch && searchMatch;
  });

  const tbody = document.getElementById('resourcesBody');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-slate-500 py-8">No resources found</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(b => {
    const typeColors = {
      'e-Books': '#3b82f6','Short Notes': '#10b981','Model Papers': '#8b5cf6','MCQ Quiz Papers': '#f59e0b'
    };
    const tc = typeColors[b.type] || '#94a3b8';
    const isMcq = b.type === 'MCQ Quiz Papers';
    const isPub = b.published !== false;
    const qCount = (b.questions || []).length;

    let detailsHtml = `<span class="text-xs ${b.mode==='Read+Download' ? 'text-emerald-400' : 'text-blue-400'}">${b.mode||'Read'}</span>`;
    if (isMcq) {
      detailsHtml = `
        <div>
          <span class="badge" style="background:rgba(245,158,11,0.15);color:#f59e0b">${qCount} Qs</span>
          <span class="badge ${isPub ? 'badge-basic' : 'badge-expired'} ml-1">${isPub ? 'Published' : 'Draft'}</span>
        </div>`;
    }

    let actionsHtml = '';
    if (isMcq) {
      actionsHtml = `
        <div class="flex items-center gap-1.5">
          <button onclick="adminTogglePublish('${b.id}')" class="btn-secondary btn-sm" title="${isPub ? 'Unpublish Quiz' : 'Publish Quiz'}">
            <i class="fas ${isPub ? 'fa-eye-slash text-yellow-400' : 'fa-globe text-emerald-400'}"></i>
          </button>
          <button onclick="openEditMcqModal('${b.id}')" class="btn-secondary btn-sm" title="Edit Quiz & Manage Questions">
            <i class="fas fa-edit text-blue-400"></i>
          </button>
          <button onclick="openQuizModal('${b.id}', true)" class="btn-secondary btn-sm" title="Preview Quiz as Student">
            <i class="fas fa-play text-yellow-400"></i>
          </button>
          <button onclick="adminDeleteResource('${b.id}')" class="btn-danger btn-sm" title="Delete Quiz">
            <i class="fas fa-trash"></i>
          </button>
        </div>`;
    } else {
      actionsHtml = `
        <button onclick="adminDeleteResource('${b.id}')" class="btn-danger btn-sm" title="Delete Resource">
          <i class="fas fa-trash"></i>
        </button>`;
    }

    return `
      <tr>
        <td>
          <div class="font-semibold text-white text-sm">${escHtml(b.title)}</div>
          ${b.pdfData ? '<div class="text-xs text-emerald-400 mt-1"><i class="fas fa-file-pdf mr-1"></i>PDF uploaded</div>' : ''}
          ${b.readLink ? '<div class="text-xs text-blue-400 mt-1"><i class="fas fa-link mr-1"></i>Link</div>' : ''}
          ${isMcq && b.textNotes ? `<div class="text-xs text-slate-400 mt-0.5 truncate max-w-xs"><i class="fas fa-sticky-note mr-1 text-yellow-500"></i>${escHtml(b.textNotes)}</div>` : ''}
        </td>
        <td><span style="color:${tc};font-size:0.78rem;font-weight:600">${b.type}</span></td>
        <td>Grade ${b.grade}</td>
        <td>${escHtml(b.subject||'—')}</td>
        <td>${detailsHtml}</td>
        <td>${actionsHtml}</td>
      </tr>`;
  }).join('');
}

function adminAddResource() {
  const title = document.getElementById('res_title').value.trim();
  const type = document.getElementById('res_type').value;
  const grade = document.getElementById('res_grade').value;
  const subject = document.getElementById('res_subject').value;
  const mode = document.getElementById('res_mode').value;
  const preview = parseInt(document.getElementById('res_preview').value) || 2;
  const readLink = document.getElementById('res_readLink').value.trim();
  const downloadLink = document.getElementById('res_downloadLink').value.trim();
  const pdfFile = document.getElementById('res_pdf')?.files?.[0];

  if (!title) { showToast('Please enter a title', 'error'); return; }

  if (type === 'MCQ Quiz Papers') {
    if (currentMcqQuestions.length === 0) {
      showToast('Please add at least 1 question using the MCQ Question Editor', 'error');
      return;
    }

    const allowRetry = document.getElementById('res_mcq_retry').checked;
    const published = document.getElementById('res_mcq_published').checked;
    const textNotes = document.getElementById('res_mcq_notes').value.trim();

    const newQuiz = {
      id: generateId(),
      title,
      type: 'MCQ Quiz Papers',
      grade: parseInt(grade),
      subject,
      mode: 'Read',
      previewPages: 2,
      readLink: null,
      downloadLink: null,
      pdfData: null,
      isFree: false,
      price: 0,
      published,
      allowRetry,
      textNotes,
      questions: JSON.parse(JSON.stringify(currentMcqQuestions))
    };

    books.push(newQuiz);
    saveData();
    renderResourcesTable();
    if (currentAdminTab === 'quizzes') renderAdminQuizzes();
    clearResourceForm();
    showToast(`MCQ Quiz Paper created with ${newQuiz.questions.length} questions!`, 'success');
    return;
  }

  const newBook = {
    id: generateId(),
    title, type, grade: parseInt(grade), subject, mode, previewPages: preview,
    readLink: readLink || null, downloadLink: downloadLink || null,
    pdfData: null, isFree: false, price: 0
  };

  if (pdfFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      newBook.pdfData = e.target.result;
      books.push(newBook);
      saveData();
      renderResourcesTable();
      clearResourceForm();
      showToast('Resource added successfully!', 'success');
    };
    reader.readAsDataURL(pdfFile);
  } else {
    books.push(newBook);
    saveData();
    renderResourcesTable();
    clearResourceForm();
    showToast('Resource added successfully!', 'success');
  }
}

function clearResourceForm() {
  ['res_title','res_readLink','res_downloadLink'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const prev = document.getElementById('res_preview');
  if (prev) prev.value = '2';
  const pdfInput = document.getElementById('res_pdf');
  if (pdfInput) pdfInput.value = '';

  const typeEl = document.getElementById('res_type');
  if (typeEl) { typeEl.value = 'e-Books'; onResourceTypeChange(); }
  // Clear MCQ editor
  currentMcqQuestions = [];
  adminCancelEditMcqQuestion();
  const notesEl = document.getElementById('res_mcq_notes');
  if (notesEl) notesEl.value = '';
  renderAdminMcqQuestionsList();
}

function adminDeleteResource(id) {
  showConfirmDelete('Are you sure you want to delete this resource? This cannot be undone.', () => {
    books = books.filter(b => b.id !== id);
    saveData();
    renderResourcesTable();
    showToast('Resource deleted', 'success');
  });
}

// ----- STUDENTS -----
function renderStudentsTable() {
  const gradeFilter = document.getElementById('stuFilterGrade').value;
  const planFilter = document.getElementById('stuFilterPlan').value;
  const search = document.getElementById('stuFilterSearch').value.toLowerCase();

  const filtered = students.filter(s => {
    const gradeMatch = !gradeFilter || String(s.grade) === gradeFilter;
    const plan = s.subscription ? s.subscription.plan : 'FREE';
    const planMatch = !planFilter || plan === planFilter;
    const searchMatch = !search ||
      (s.firstName||'').toLowerCase().includes(search) ||
      (s.lastName||'').toLowerCase().includes(search) ||
      (s.email||'').toLowerCase().includes(search);
    return gradeMatch && planMatch && searchMatch;
  });

  const tbody = document.getElementById('studentsBody');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-slate-500 py-8">No students found</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const plan = s.subscription ? s.subscription.plan : 'FREE';
    const pi = PLANS[plan] || PLANS.FREE;
    const expired = isSubscriptionExpired(s);
    const daysLeft = getDaysRemaining(s);
    return `
      <tr>
        <td>
          <div class="font-semibold text-white">${escHtml(s.firstName)} ${escHtml(s.lastName)}</div>
          <div class="text-xs text-slate-400">${escHtml(s.phone||'')}</div>
        </td>
        <td class="text-sm">${escHtml(s.email)}</td>
        <td>Grade ${s.grade}</td>
        <td>
          <span class="badge" style="background:${pi.bg};color:${pi.color};border-color:${pi.border}">${plan}</span>
          ${expired ? '<span class="badge badge-expired ml-1">Expired</span>' : ''}
        </td>
        <td class="text-sm">
          ${plan === 'FREE' ? '<span class="text-slate-500">—</span>' :
            s.subscription && s.subscription.expiryDate ?
            `<span class="${expired ? 'text-red-400' : daysLeft && daysLeft <=7 ? 'text-yellow-400' : 'text-slate-300'}">${formatDate(s.subscription.expiryDate)}</span>` : '—'}
        </td>
        <td>
          <span class="badge ${s.status==='active' ? 'badge-basic' : 'badge-expired'}">${s.status||'active'}</span>
        </td>
        <td>
          <div class="flex gap-2">
            <button onclick="openEditStudent('${s.id}')" class="btn-secondary btn-sm"><i class="fas fa-edit"></i></button>
            <button onclick="adminDeleteStudent('${s.id}')" class="btn-danger btn-sm"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function adminAddStudent() {
  const firstName = document.getElementById('stu_firstName').value.trim();
  const lastName = document.getElementById('stu_lastName').value.trim();
  const email = document.getElementById('stu_email').value.trim();
  const phone = document.getElementById('stu_phone').value.trim();
  const pass = document.getElementById('stu_pass').value;
  const grade = document.getElementById('stu_grade').value;
  const status = document.getElementById('stu_status').value;

  if (!firstName || !email || !pass) { showToast('First name, email and password are required', 'error'); return; }
  if (students.find(s => s.email.toLowerCase() === email.toLowerCase())) {
    showToast('Email already exists', 'error'); return;
  }

  const newStudent = {
    id: generateId(),
    firstName, lastName, email, phone, pass, grade: parseInt(grade),
    status, allowedBooks: [],
    subscription: { plan: 'FREE', expiryDate: null, activatedAt: null }
  };
  students.push(newStudent);
  saveData();
  renderStudentsTable();
  clearStudentForm();
  showToast('Student added successfully!', 'success');
}

function clearStudentForm() {
  ['stu_firstName','stu_lastName','stu_email','stu_phone','stu_pass'].forEach(id => document.getElementById(id).value = '');
}

function openEditStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  document.getElementById('edit_stu_id').value = id;
  document.getElementById('edit_stu_firstName').value = student.firstName || '';
  document.getElementById('edit_stu_lastName').value = student.lastName || '';
  document.getElementById('edit_stu_email').value = student.email || '';
  document.getElementById('edit_stu_phone').value = student.phone || '';
  document.getElementById('edit_stu_pass').value = '';
  document.getElementById('edit_stu_grade').value = student.grade || '6';
  document.getElementById('edit_stu_status').value = student.status || 'active';

  const plan = student.subscription ? student.subscription.plan : 'FREE';
  document.getElementById('edit_stu_plan').value = plan;

  if (student.subscription && student.subscription.expiryDate) {
    const d = new Date(student.subscription.expiryDate);
    document.getElementById('edit_stu_expiry').value = d.toISOString().split('T')[0];
  } else {
    document.getElementById('edit_stu_expiry').value = '';
  }

  updateExpiryFieldVisibility();
  document.getElementById('editStudentModal').classList.remove('hidden');
}

function updateExpiryFieldVisibility() {
  const plan = document.getElementById('edit_stu_plan').value;
  document.getElementById('edit_expiry_field').style.display = plan === 'FREE' ? 'none' : 'block';
}

function saveEditStudent() {
  const id = document.getElementById('edit_stu_id').value;
  const student = students.find(s => s.id === id);
  if (!student) return;

  student.firstName = document.getElementById('edit_stu_firstName').value.trim();
  student.lastName = document.getElementById('edit_stu_lastName').value.trim();
  student.email = document.getElementById('edit_stu_email').value.trim();
  student.phone = document.getElementById('edit_stu_phone').value.trim();
  student.grade = parseInt(document.getElementById('edit_stu_grade').value);
  student.status = document.getElementById('edit_stu_status').value;

  const newPass = document.getElementById('edit_stu_pass').value;
  if (newPass) student.pass = newPass;

  const plan = document.getElementById('edit_stu_plan').value;
  const expiryVal = document.getElementById('edit_stu_expiry').value;

  student.subscription = student.subscription || {};
  student.subscription.plan = plan;

  if (plan === 'FREE') {
    student.subscription.expiryDate = null;
    student.subscription.activatedAt = null;
  } else {
    student.subscription.expiryDate = expiryVal ? new Date(expiryVal).toISOString() : student.subscription.expiryDate;
    if (!student.subscription.activatedAt) student.subscription.activatedAt = new Date().toISOString();
  }

  saveData();
  closeEditStudentModal();
  renderStudentsTable();
  showToast('Student updated successfully!', 'success');
}

function closeEditStudentModal() {
  document.getElementById('editStudentModal').classList.add('hidden');
}

function adminDeleteStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;
  showConfirmDelete(
    `Delete student "${student.firstName} ${student.lastName}"? All their data will be removed.`,
    () => {
      students = students.filter(s => s.id !== id);
      orders = orders.filter(o => o.studentId !== id);
      saveData();
      renderStudentsTable();
      updatePendingBadge();
      showToast('Student deleted', 'success');
    }
  );
}

// ----- APPROVALS -----
function renderApprovals() {
  const pending = orders.filter(o => o.status === 'pending');
  const approved = orders.filter(o => o.status === 'approved').slice(-20).reverse();
  const rejected = orders.filter(o => o.status === 'rejected').slice(-10).reverse();

  let html = '';

  if (pending.length === 0) {
    html += `<div class="empty-state"><i class="fas fa-check-circle text-emerald-400"></i><p class="text-lg font-semibold text-emerald-400">No Pending Requests</p><p class="text-sm mt-2">All subscription requests have been processed.</p></div>`;
  } else {
    html += `<div class="card mb-6">
      <h3 class="font-bold text-white mb-4"><i class="fas fa-clock text-yellow-400 mr-2"></i>Pending Requests (${pending.length})</h3>
      <div class="space-y-4">
        ${pending.map(o => {
          const student = students.find(s => s.id === o.studentId);
          const pi = PLANS[o.plan] || PLANS.FREE;
          return `
            <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:16px">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div class="font-bold text-white">${escHtml(o.studentName)}</div>
                  <div class="text-slate-400 text-sm">${escHtml(o.studentEmail)} • Grade ${o.studentGrade}</div>
                  <div class="flex gap-2 mt-2 flex-wrap">
                    <span class="badge" style="background:${pi.bg};color:${pi.color};border-color:${pi.border}"><i class="fas fa-crown mr-1"></i>${o.plan} — LKR ${PLANS[o.plan].price}</span>
                    <span class="badge badge-type"><i class="fas fa-key mr-1"></i>Code: ${escHtml(o.paymentCode)}</span>
                    <span class="badge badge-type"><i class="fas fa-clock mr-1"></i>${formatDateTime(o.timestamp)}</span>
                  </div>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                  <button onclick="approveRequest('${o.id}')" class="btn-success btn-sm"><i class="fas fa-check mr-1"></i>Approve</button>
                  <button onclick="rejectRequest('${o.id}')" class="btn-danger btn-sm"><i class="fas fa-times mr-1"></i>Reject</button>
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  // Approved history
  if (approved.length > 0) {
    html += `<div class="card mb-4">
      <h3 class="font-bold text-white mb-4"><i class="fas fa-check-circle text-emerald-400 mr-2"></i>Recently Approved</h3>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>Student</th><th>Plan</th><th>Code</th><th>Approved</th></tr></thead>
          <tbody>
            ${approved.map(o => {
              const pi = PLANS[o.plan] || PLANS.FREE;
              return `<tr>
                <td><div class="font-semibold text-white">${escHtml(o.studentName)}</div><div class="text-xs text-slate-400">${escHtml(o.studentEmail)}</div></td>
                <td><span class="badge" style="background:${pi.bg};color:${pi.color};border-color:${pi.border}">${o.plan}</span></td>
                <td class="text-slate-300">${escHtml(o.paymentCode)}</td>
                <td class="text-slate-400 text-sm">${o.approvedAt ? formatDateTime(o.approvedAt) : '—'}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  // Rejected history
  if (rejected.length > 0) {
    html += `<div class="card">
      <h3 class="font-bold text-white mb-4"><i class="fas fa-times-circle text-red-400 mr-2"></i>Recently Rejected</h3>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>Student</th><th>Plan</th><th>Code</th><th>Rejected</th></tr></thead>
          <tbody>
            ${rejected.map(o => `<tr>
              <td><div class="font-semibold text-white">${escHtml(o.studentName)}</div></td>
              <td class="text-slate-400">${o.plan}</td>
              <td class="text-slate-300">${escHtml(o.paymentCode)}</td>
              <td class="text-slate-400 text-sm">${o.rejectedAt ? formatDateTime(o.rejectedAt) : '—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  document.getElementById('approvalsContent').innerHTML = html;
  updatePendingBadge();
}

function approveRequest(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const student = students.find(s => s.id === order.studentId);
  if (!student) {
    showToast('Student not found', 'error');
    order.status = 'rejected';
    order.rejectedAt = new Date().toISOString();
    saveData();
    renderApprovals();
    return;
  }

  const expiry = calcExpiryDate(order.plan);
  student.subscription = {
    plan: order.plan,
    expiryDate: expiry,
    activatedAt: new Date().toISOString()
  };

  order.status = 'approved';
  order.approvedAt = new Date().toISOString();

  // Move to sales history
  salesHistory.push({
    ...order,
    approvedAt: order.approvedAt,
    revenue: PLANS[order.plan] ? PLANS[order.plan].price : 0
  });

  saveData();
  renderApprovals();
  showToast(`Approved! ${student.firstName}'s ${order.plan} subscription activated.`, 'success');
}

function rejectRequest(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  showConfirmDelete(
    `Reject subscription request from "${order.studentName}" for ${order.plan} plan?`,
    () => {
      order.status = 'rejected';
      order.rejectedAt = new Date().toISOString();
      saveData();
      renderApprovals();
      showToast('Request rejected', 'warning');
    }
  );
}

// ============================================================
// CONFIRM DELETE MODAL
// ============================================================
let confirmDeleteCallback = null;

function showConfirmDelete(message, callback) {
  document.getElementById('confirmDeleteMsg').textContent = message;
  confirmDeleteCallback = callback;
  document.getElementById('confirmDeleteBtn').onclick = () => {
    if (confirmDeleteCallback) confirmDeleteCallback();
    closeConfirmDelete();
  };
  document.getElementById('confirmDeleteModal').classList.remove('hidden');
}

function closeConfirmDelete() {
  document.getElementById('confirmDeleteModal').classList.add('hidden');
  confirmDeleteCallback = null;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' +
         d.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' });
}

let toastTimer = null;
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const iconEl = document.getElementById('toastIcon');
  const msgEl = document.getElementById('toastMsg');

  const icons = { success: 'fas fa-check-circle', error: 'fas fa-exclamation-circle', warning: 'fas fa-exclamation-triangle' };
  const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b' };

  iconEl.className = icons[type] || icons.success;
  iconEl.style.color = colors[type] || colors.success;
  msgEl.textContent = msg;
  toast.className = 'show ' + type;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = type; }, 4000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePdfReader();
    closeUpgradeModal();
    closePaymentModal();
    closeEditStudentModal();
    closeConfirmDelete();
  }
  if (document.getElementById('pdfReaderModal').style.display !== 'none' &&
      !document.getElementById('pdfReaderModal').classList.contains('hidden')) {
    if (e.key === 'ArrowLeft') pdfPrevPage();
    if (e.key === 'ArrowRight') pdfNextPage();
  }
});

// ============================================================
// AUTH BACKGROUND ANIMATION (CONSTELLATION & FLOATING SPARKS)
// ============================================================
let authAnimRunning = false;
let authAnimFrameId = null;
let authCanvas = null;
let authCtx = null;
let authParticles = [];
let authSparks = [];
let authMouse = { x: -1000, y: -1000, active: false };

function initAuthCanvas() {
  authCanvas = document.getElementById('authCanvas');
  if (!authCanvas) return;
  authCtx = authCanvas.getContext('2d');

  function resizeCanvas() {
    if (!authCanvas || !authCtx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    authCanvas.width = Math.floor(w * dpr);
    authCanvas.height = Math.floor(h * dpr);
    authCanvas.style.width = w + 'px';
    authCanvas.style.height = h + 'px';
    authCtx.setTransform(1, 0, 0, 1, 0, 0);
    authCtx.scale(dpr, dpr);
  }

  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    createAuthParticles();
  });

  const authPage = document.getElementById('authPage');
  if (authPage) {
    authPage.addEventListener('mousemove', (e) => {
      authMouse.x = e.clientX;
      authMouse.y = e.clientY;
      authMouse.active = true;
    });
    authPage.addEventListener('mouseleave', () => {
      authMouse.active = false;
    });
    authPage.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        authMouse.x = e.touches[0].clientX;
        authMouse.y = e.touches[0].clientY;
        authMouse.active = true;
      }
    }, { passive: true });
    authPage.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        authMouse.x = e.touches[0].clientX;
        authMouse.y = e.touches[0].clientY;
        authMouse.active = true;
      }
    }, { passive: true });
    authPage.addEventListener('touchend', () => {
      authMouse.active = false;
    });
  }

  // Handle visibility changes to save battery and performance
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAuthAnimation();
    } else {
      const authEl = document.getElementById('authPage');
      if (authEl && authEl.style.display !== 'none') {
        startAuthAnimation();
      }
    }
  });

  createAuthParticles();
}

function createAuthParticles() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  // Node count proportional to screen resolution
  const count = Math.max(35, Math.min(75, Math.floor((w * h) / 19000)));
  authParticles = [];

  const colors = [
    { r: 245, g: 158, b: 11 },   // Amber gold
    { r: 251, g: 191, b: 36 },   // Warm amber
    { r: 56,  g: 189, b: 248 },  // Sky cyan
    { r: 129, g: 140, b: 248 },  // Soft indigo
    { r: 226, g: 232, b: 240 }   // Slate pearl
  ];

  for (let i = 0; i < count; i++) {
    const col = colors[Math.floor(Math.random() * colors.length)];
    authParticles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1.2,
      baseRadius: Math.random() * 2 + 1.2,
      color: col,
      alpha: Math.random() * 0.5 + 0.35,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.025
    });
  }

  // Floating ambient sparks / stardust
  const sparkCount = Math.max(16, Math.floor(w / 65));
  authSparks = [];
  for (let i = 0; i < sparkCount; i++) {
    authSparks.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vy: -(0.35 + Math.random() * 0.55),
      vx: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 2.8 + 1,
      alpha: Math.random() * 0.7,
      maxAlpha: 0.45 + Math.random() * 0.45,
      growing: Math.random() > 0.5,
      shape: Math.random() > 0.6 ? 'diamond' : 'circle',
      color: colors[Math.floor(Math.random() * 3)]
    });
  }
}

function startAuthAnimation() {
  if (authAnimRunning) return;
  authAnimRunning = true;
  if (!authCanvas || !authCtx) {
    initAuthCanvas();
  }
  let lastTime = performance.now();

  function loop(currentTime) {
    if (!authAnimRunning) return;
    const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;

    updateAndRenderAuthCanvas(dt);
    authAnimFrameId = requestAnimationFrame(loop);
  }

  authAnimFrameId = requestAnimationFrame(loop);
}

function stopAuthAnimation() {
  authAnimRunning = false;
  if (authAnimFrameId) {
    cancelAnimationFrame(authAnimFrameId);
    authAnimFrameId = null;
  }
}

function updateAndRenderAuthCanvas(dt) {
  if (!authCtx || !authCanvas) return;
  const w = window.innerWidth;
  const h = window.innerHeight;

  authCtx.clearRect(0, 0, w, h);

  // Mouse interactive aura
  if (authMouse.active) {
    const mouseGlow = authCtx.createRadialGradient(
      authMouse.x, authMouse.y, 0,
      authMouse.x, authMouse.y, 140
    );
    mouseGlow.addColorStop(0, 'rgba(234, 179, 8, 0.12)');
    mouseGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.04)');
    mouseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    authCtx.fillStyle = mouseGlow;
    authCtx.beginPath();
    authCtx.arc(authMouse.x, authMouse.y, 140, 0, Math.PI * 2);
    authCtx.fill();
  }

  // Update & Draw Floating Sparks
  for (let s of authSparks) {
    s.y += s.vy * (dt * 60);
    s.x += s.vx * (dt * 60) + Math.sin(s.y * 0.015) * 0.2;

    if (s.growing) {
      s.alpha += 0.012;
      if (s.alpha >= s.maxAlpha) s.growing = false;
    } else {
      s.alpha -= 0.01;
      if (s.alpha <= 0.05) {
        s.growing = true;
        s.alpha = 0.05;
      }
    }

    if (s.y < -20) {
      s.y = h + 10;
      s.x = Math.random() * w;
    }

    authCtx.fillStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${Math.max(0, s.alpha)})`;
    if (s.shape === 'diamond') {
      authCtx.save();
      authCtx.translate(s.x, s.y);
      authCtx.rotate(Math.PI / 4);
      authCtx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size);
      authCtx.restore();
    } else {
      authCtx.beginPath();
      authCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      authCtx.fill();
    }
  }

  // Update & Draw Constellation Nodes & Connections
  const maxConnDist = 115;
  const maxConnDistSq = maxConnDist * maxConnDist;

  // Inter-particle connection lines
  for (let i = 0; i < authParticles.length; i++) {
    const p1 = authParticles[i];
    for (let j = i + 1; j < authParticles.length; j++) {
      const p2 = authParticles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < maxConnDistSq) {
        const dist = Math.sqrt(distSq);
        const lineAlpha = (1 - dist / maxConnDist) * 0.22 * Math.min(p1.alpha, p2.alpha);
        authCtx.strokeStyle = `rgba(234, 179, 8, ${lineAlpha})`;
        authCtx.lineWidth = 0.85;
        authCtx.beginPath();
        authCtx.moveTo(p1.x, p1.y);
        authCtx.lineTo(p2.x, p2.y);
        authCtx.stroke();
      }
    }

    // Connect to mouse if active & within distance
    if (authMouse.active) {
      const mdx = p1.x - authMouse.x;
      const mdy = p1.y - authMouse.y;
      const mDistSq = mdx * mdx + mdy * mdy;
      const mouseDistThreshold = 140;
      if (mDistSq < mouseDistThreshold * mouseDistThreshold) {
        const mDist = Math.sqrt(mDistSq);
        const mLineAlpha = (1 - mDist / mouseDistThreshold) * 0.35;
        authCtx.strokeStyle = `rgba(56, 189, 248, ${mLineAlpha})`;
        authCtx.lineWidth = 1;
        authCtx.beginPath();
        authCtx.moveTo(p1.x, p1.y);
        authCtx.lineTo(authMouse.x, authMouse.y);
        authCtx.stroke();

        // Gentle interactive repulsion
        const force = (1 - mDist / mouseDistThreshold) * 1.5;
        p1.x += (mdx / (mDist || 1)) * force;
        p1.y += (mdy / (mDist || 1)) * force;
      }
    }
  }

  // Draw Particles
  for (let p of authParticles) {
    p.pulse += p.pulseSpeed;
    p.x += p.vx * (dt * 60);
    p.y += p.vy * (dt * 60);

    // Screen wrapping / bounce
    if (p.x < 0) { p.x = 0; p.vx *= -1; }
    if (p.x > w) { p.x = w; p.vx *= -1; }
    if (p.y < 0) { p.y = 0; p.vy *= -1; }
    if (p.y > h) { p.y = h; p.vy *= -1; }

    const curRadius = p.baseRadius + Math.sin(p.pulse) * 0.6;
    const curAlpha = p.alpha + Math.sin(p.pulse) * 0.15;

    // Glowing halo
    const glow = authCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, curRadius * 2.8);
    glow.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${Math.max(0, curAlpha * 0.85)})`);
    glow.addColorStop(0.5, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${Math.max(0, curAlpha * 0.22)})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    authCtx.fillStyle = glow;
    authCtx.beginPath();
    authCtx.arc(p.x, p.y, curRadius * 2.8, 0, Math.PI * 2);
    authCtx.fill();

    // Solid core
    authCtx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${Math.min(1, curAlpha + 0.3)})`;
    authCtx.beginPath();
    authCtx.arc(p.x, p.y, Math.max(0.8, curRadius * 0.7), 0, Math.PI * 2);
    authCtx.fill();
  }
}

// ============================================================

// ============================================================
// ADMIN MCQ QUIZ & QUESTION EDITOR LOGIC
// ============================================================
let currentMcqQuestions = [];
let editingMcqQuestionIndex = -1;

function onResourceTypeChange() {
  const type = document.getElementById('res_type').value;
  const isMcq = type === 'MCQ Quiz Papers';
  const normalFields = document.getElementById('res_normal_fields');
  const mcqFields = document.getElementById('res_mcq_fields');

  if (isMcq) {
    if (normalFields) normalFields.classList.add('hidden');
    if (mcqFields) mcqFields.classList.remove('hidden');
  } else {
    if (normalFields) normalFields.classList.remove('hidden');
    if (mcqFields) mcqFields.classList.add('hidden');
  }
}

function adminSaveMcqQuestion() {
  const qText = document.getElementById('mcq_q_text').value.trim();
  const optA = document.getElementById('mcq_opt_a').value.trim();
  const optB = document.getElementById('mcq_opt_b').value.trim();
  const optC = document.getElementById('mcq_opt_c').value.trim();
  const optD = document.getElementById('mcq_opt_d').value.trim();
  const correctRadio = document.querySelector('input[name="mcq_correct_option"]:checked');
  const correctAnswer = correctRadio ? correctRadio.value : 'A';
  const explanation = document.getElementById('mcq_explanation').value.trim();

  if (!qText) {
    showToast('Please enter the question text', 'error');
    return;
  }
  if (!optA || !optB || !optC || !optD) {
    showToast('Please provide all 4 options (A, B, C, D)', 'error');
    return;
  }

  const qData = {
    id: editingMcqQuestionIndex >= 0 ? currentMcqQuestions[editingMcqQuestionIndex].id : generateId(),
    question: qText,
    options: { A: optA, B: optB, C: optC, D: optD },
    correctAnswer: correctAnswer,
    explanation: explanation
  };

  if (editingMcqQuestionIndex >= 0) {
    currentMcqQuestions[editingMcqQuestionIndex] = qData;
    showToast('Question #' + (editingMcqQuestionIndex + 1) + ' updated', 'success');
    adminCancelEditMcqQuestion();
  } else {
    currentMcqQuestions.push(qData);
    showToast('Question added (' + currentMcqQuestions.length + ' total)', 'success');
    document.getElementById('mcq_q_text').value = '';
    document.getElementById('mcq_opt_a').value = '';
    document.getElementById('mcq_opt_b').value = '';
    document.getElementById('mcq_opt_c').value = '';
    document.getElementById('mcq_opt_d').value = '';
    document.getElementById('mcq_explanation').value = '';
    const rA = document.querySelector('input[name="mcq_correct_option"][value="A"]');
    if (rA) rA.checked = true;
  }

  renderAdminMcqQuestionsList();
}

function adminEditMcqQuestion(index) {
  const q = currentMcqQuestions[index];
  if (!q) return;

  editingMcqQuestionIndex = index;
  document.getElementById('mcq_q_text').value = q.question;
  document.getElementById('mcq_opt_a').value = q.options?.A || '';
  document.getElementById('mcq_opt_b').value = q.options?.B || '';
  document.getElementById('mcq_opt_c').value = q.options?.C || '';
  document.getElementById('mcq_opt_d').value = q.options?.D || '';
  document.getElementById('mcq_explanation').value = q.explanation || '';

  const r = document.querySelector(`input[name="mcq_correct_option"][value="${q.correctAnswer || 'A'}"]`);
  if (r) r.checked = true;

  document.getElementById('mcq_editing_badge').textContent = `Editing Question #${index + 1}`;
  document.getElementById('mcq_editing_badge').classList.remove('hidden');
  document.getElementById('btn_save_mcq_q').innerHTML = `<i class="fas fa-check mr-2"></i>Update Question #${index + 1}`;
  document.getElementById('btn_cancel_mcq_q').classList.remove('hidden');

  document.getElementById('mcq_q_text').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function adminCancelEditMcqQuestion() {
  editingMcqQuestionIndex = -1;
  document.getElementById('mcq_q_text').value = '';
  document.getElementById('mcq_opt_a').value = '';
  document.getElementById('mcq_opt_b').value = '';
  document.getElementById('mcq_opt_c').value = '';
  document.getElementById('mcq_opt_d').value = '';
  document.getElementById('mcq_explanation').value = '';
  const rA = document.querySelector('input[name="mcq_correct_option"][value="A"]');
  if (rA) rA.checked = true;

  document.getElementById('mcq_editing_badge').classList.add('hidden');
  document.getElementById('btn_save_mcq_q').innerHTML = `<i class="fas fa-plus mr-2"></i>Add Question to Quiz`;
  document.getElementById('btn_cancel_mcq_q').classList.add('hidden');
}

function adminDeleteMcqQuestion(index) {
  if (editingMcqQuestionIndex === index) {
    adminCancelEditMcqQuestion();
  } else if (editingMcqQuestionIndex > index) {
    editingMcqQuestionIndex--;
  }
  currentMcqQuestions.splice(index, 1);
  renderAdminMcqQuestionsList();
  showToast('Question removed', 'success');
}

function adminMoveMcqQuestion(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= currentMcqQuestions.length) return;

  const temp = currentMcqQuestions[index];
  currentMcqQuestions[index] = currentMcqQuestions[targetIndex];
  currentMcqQuestions[targetIndex] = temp;

  if (editingMcqQuestionIndex === index) {
    editingMcqQuestionIndex = targetIndex;
  } else if (editingMcqQuestionIndex === targetIndex) {
    editingMcqQuestionIndex = index;
  }

  renderAdminMcqQuestionsList();
}


// ============================================================
// BULK MCQ IMPORT LOGIC
// ============================================================
let bulkMcqTarget = 'create'; // 'create' or 'modal'
let bulkParsedQuestions = [];

const BULK_SAMPLES = {
  en: `1. What is the SI unit of electrical resistance?
A) Ampere
B) Volt
C) Ohm
D) Watt
Answer: C
Explanation: Ohm is the standard unit of electrical resistance.

2. Which organelle is known as the powerhouse of the cell?
A) Nucleus
B) Ribosome
C) Mitochondria
D) Golgi apparatus
Answer: C
Explanation: Mitochondria generate most of the chemical energy needed by the cell.

3. What is the formula for calculating velocity?
A) Mass × Acceleration
B) Displacement ÷ Time
C) Force × Distance
D) Work ÷ Time
Answer: B
Explanation: Velocity is the rate of change of displacement with time.`,

  si: `1. ආලෝකය තත්පරයකට ගමන් කරන ආසන්න වේගය කොපමණද?
A) 3 × 10^8 m/s
B) 3 × 10^6 m/s
C) 3 × 10^5 m/s
D) 330 m/s
පිළිතුර: A
විවරණය: රික්තයකදී ආලෝකයේ වේගය තත්පරයට මීටර 300,000,000 කි.

2. ශාක වල ජලය හා ඛනිජ ලවණ පරිවහනය කරන පටකය කුමක්ද?
A) ප්ලෝයමය
B) ශෛලමය
C) පාරෙන්කිමාව
D) කොලෙන්කිමාව
පිළිතුර: B
විවරණය: ශෛලම පටකය මගින් මුල් වල සිට ඉහළට ජලය පරිවහනය කරයි.

3. නිව්ටන්ගේ පළමු නියමය හඳුන්වන වෙනත් නම කුමක්ද?
A) ත්වරණ නියමය
B) ක්‍රියා ප්‍රතික්‍රියා නියමය
C) අවස්ථිති නියමය
D) ගම්‍යතා නියමය
පිළිතුර: C
විවරණය: බාහිර අසමතුලිත බලයක් නොයෙදෙන තාක් වස්තුවක් නිශ්චලව හෝ ඒකාකාර ප්‍රවේගයෙන් චලනය වීම අවස්ථිතියයි.`,

  json: JSON.stringify([
    {
      "question": "What is the atomic number of Carbon?",
      "options": {
        "A": "4",
        "B": "6",
        "C": "8",
        "D": "12"
      },
      "correctAnswer": "B",
      "explanation": "Carbon has 6 protons in its nucleus."
    },
    {
      "question": "Which gas is released during photosynthesis?",
      "options": {
        "A": "Carbon dioxide",
        "B": "Nitrogen",
        "C": "Oxygen",
        "D": "Hydrogen"
      },
      "correctAnswer": "C",
      "explanation": "Plants release oxygen as a byproduct of photosynthesis."
    }
  ], null, 2)
};

function parseBulkMcqText(rawText) {
  rawText = (rawText || '').trim();
  if (!rawText) return [];

  // 1. Check if JSON
  if (rawText.startsWith('[') || rawText.startsWith('{')) {
    try {
      const parsed = JSON.parse(rawText);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const results = [];
      for (const item of arr) {
        if (item.question && item.options) {
          results.push({
            id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '_' + results.length,
            question: String(item.question).trim(),
            options: {
              A: String(item.options.A || item.options.a || (Array.isArray(item.options) ? item.options[0] : '') || '').trim(),
              B: String(item.options.B || item.options.b || (Array.isArray(item.options) ? item.options[1] : '') || '').trim(),
              C: String(item.options.C || item.options.c || (Array.isArray(item.options) ? item.options[2] : '') || '').trim(),
              D: String(item.options.D || item.options.d || (Array.isArray(item.options) ? item.options[3] : '') || '').trim()
            },
            correctAnswer: String(item.correctAnswer || item.answer || item.correct || 'A').trim().toUpperCase().charAt(0),
            explanation: String(item.explanation || item.exp || '').trim()
          });
        }
      }
      if (results.length > 0) return results;
    } catch (e) {}
  }

  const lines = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const questions = [];
  let currentQ = null;

  function finalizeCurrentQ() {
    if (currentQ && currentQ.question && (currentQ.options.A || currentQ.options.B)) {
      currentQ.options.A = currentQ.options.A || '';
      currentQ.options.B = currentQ.options.B || '';
      currentQ.options.C = currentQ.options.C || '';
      currentQ.options.D = currentQ.options.D || '';
      if (!['A', 'B', 'C', 'D'].includes(currentQ.correctAnswer)) currentQ.correctAnswer = 'A';
      currentQ.id = 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '_' + questions.length;
      questions.push(currentQ);
    }
    currentQ = null;
  }

  let emptyLines = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      emptyLines++;
      continue;
    }

    // 1. TSV / Tab delimited line (Question \t A \t B \t C \t D \t Ans \t Exp)
    if (line.includes('\t')) {
      const parts = line.split('\t').map(s => s.trim());
      if (parts.length >= 5) {
        finalizeCurrentQ();
        const ans = (parts[5] || 'A').toUpperCase().charAt(0);
        questions.push({
          id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '_' + questions.length,
          question: parts[0],
          options: { A: parts[1], B: parts[2], C: parts[3], D: parts[4] },
          correctAnswer: ['A', 'B', 'C', 'D'].includes(ans) ? ans : 'A',
          explanation: parts[6] || ''
        });
        emptyLines = 0;
        continue;
      }
    }

    // 2. Option line (e.g. "A) ...", "A. ...", "(A) ...", "*B) ...", "B: ...", "1) ...", "1. ..." if in question)
    const optMatch = line.match(/^(\*?)\s*(?:\(?([A-Da-d])[\)\.:\-\]]|(?:\(([1-5])\)|([1-5])[\)\.\:\-]))\s*(\*?)\s*(.*)/);
    if (optMatch && currentQ) {
      const hasStar = optMatch[1] === '*' || optMatch[5] === '*';
      let optKey = (optMatch[2] || '').toUpperCase();
      const numKey = optMatch[3] || optMatch[4];
      if (!optKey && numKey) {
        const numMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E' };
        optKey = numMap[numKey];
      }
      
      const isNumDot = numKey && line.match(/^\*?\s*[1-5]\./);
      if (optKey && optKey !== 'E' && (!isNumDot || !currentQ.options[optKey])) {
        currentQ.options[optKey] = optMatch[6].trim();
        if (hasStar) currentQ.correctAnswer = optKey;
        currentQ._last = optKey;
        emptyLines = 0;
        continue;
      }
    }

    // 3. Question Header Line (e.g., "1. What is...", "Q1: What is...", "Question 1: What is...", "ප්‍රශ්නය 1: ...")
    // Changed \s+ to \s* to support "1.Question" without spaces
    const qMatch = line.match(/^(?:(?:Q(?:uestion)?|ප්‍රශ්න(?:ය)?)\s*\d*[\.\)\:\-\s]+|\d+[\.\)\:\-\]]\s*)(.*)/i);
    if (qMatch) {
      finalizeCurrentQ();
      currentQ = {
        question: qMatch[1].trim() || line,
        options: { A: '', B: '', C: '', D: '' },
        correctAnswer: 'A',
        explanation: '',
        _last: 'q'
      };
      emptyLines = 0;
      continue;
    }

    // 4. Answer line (e.g. "Answer: B", "Ans: B", "Correct: B", "පිළිතුර: B")
    const ansMatch = line.match(/^(?:Answer|Ans|Correct\s*Answer|Correct|පිළිතුර|නිවැරදි\s*පිළිතුර)\s*[:=\-–]?\s*([A-Da-d1-4])/i);
    if (ansMatch && currentQ) {
      let val = ansMatch[1].toUpperCase();
      if (val === '1') val = 'A';
      if (val === '2') val = 'B';
      if (val === '3') val = 'C';
      if (val === '4') val = 'D';
      currentQ.correctAnswer = val;
      currentQ._last = 'ans';
      emptyLines = 0;
      continue;
    }

    // 5. Explanation line (e.g. "Explanation: ...", "Exp: ...", "විවරණය: ...")
    const expMatch = line.match(/^(?:Explanation|Exp|Reason|Note|විවරණය|විස්තරය)\s*[:=\-–]?\s*(.*)/i);
    if (expMatch && currentQ) {
      currentQ.explanation = expMatch[1].trim();
      currentQ._last = 'exp';
      emptyLines = 0;
      continue;
    }

    // 6. Continuation or fallback
    if (currentQ) {
      if (emptyLines > 0 && currentQ.options.A && currentQ.options.B) {
        // If there was a blank line, and we already have some options, this is likely a new question!
        finalizeCurrentQ();
        currentQ = { question: line, options: {A:'', B:'', C:'', D:''}, correctAnswer: 'A', explanation: '', _last: 'q' };
      } else {
        if (currentQ._last === 'q') {
          currentQ.question += '\n' + line;
        } else if (currentQ._last === 'ans' || currentQ._last === 'exp') {
          currentQ.explanation += (currentQ.explanation ? '\n' : '') + line;
        } else if (['A','B','C','D'].includes(currentQ._last)) {
          currentQ.options[currentQ._last] += '\n' + line;
        } else {
          currentQ.question += '\n' + line;
        }
      }
    } else {
      currentQ = {
        question: line,
        options: { A: '', B: '', C: '', D: '' },
        correctAnswer: 'A',
        explanation: '',
        _last: 'q'
      };
    }
    emptyLines = 0;
  }

  finalizeCurrentQ();
  return questions;
}

function openBulkMcqModal(target) {
  bulkMcqTarget = target || 'create';
  bulkParsedQuestions = [];
  const modal = document.getElementById('bulkMcqModal');
  if (!modal) return;

  // Clear textarea and reset state for a clean start each time
  const input = document.getElementById('bulk_mcq_input');
  if (input) input.value = '';

  // Reset the append mode radio by default
  const appendRadio = document.querySelector('input[name="bulk_mcq_mode"][value="append"]');
  if (appendRadio) appendRadio.checked = true;

  modal.classList.remove('hidden');
  onBulkMcqInputChange();
}

function closeBulkMcqModal() {
  const modal = document.getElementById('bulkMcqModal');
  if (modal) modal.classList.add('hidden');
}

function insertBulkMcqSample(type) {
  const input = document.getElementById('bulk_mcq_input');
  if (!input) return;
  input.value = BULK_SAMPLES[type] || '';
  onBulkMcqInputChange();
}

function clearBulkMcqInput() {
  const input = document.getElementById('bulk_mcq_input');
  if (input) input.value = '';
  onBulkMcqInputChange();
}

function onBulkMcqInputChange() {
  const input = document.getElementById('bulk_mcq_input');
  const badge = document.getElementById('bulk_live_detected_badge');
  const countEl = document.getElementById('bulk_preview_count');
  const btnCount = document.getElementById('bulk_apply_count_btn');

  const text = input ? input.value : '';
  bulkParsedQuestions = parseBulkMcqText(text);

  const count = bulkParsedQuestions.length;
  if (badge) {
    badge.textContent = `${count} Question${count === 1 ? '' : 's'} Detected`;
    badge.className = count > 0 ? 'badge badge-premium text-xs' : 'badge badge-basic text-xs';
  }
  if (countEl) countEl.textContent = count;
  if (btnCount) btnCount.textContent = count;

  renderBulkMcqPreview();
}

function renderBulkMcqPreview() {
  const list = document.getElementById('bulk_preview_list');
  if (!list) return;

  if (bulkParsedQuestions.length === 0) {
    list.innerHTML = `
      <div class="text-center text-slate-500 py-6 border border-dashed border-slate-700 rounded-xl text-xs">
        <i class="fas fa-arrow-up text-2xl mb-1 block text-slate-600"></i>
        Paste questions above to see the live parsed preview!
      </div>`;
    return;
  }

  list.innerHTML = bulkParsedQuestions.map((q, idx) => {
    return `
      <div class="p-3 rounded-xl border border-slate-700/80 bg-slate-950/70 hover:border-emerald-500/50 transition">
        <div class="flex items-start gap-2.5">
          <span class="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
            #${idx + 1}
          </span>
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-white text-xs sm:text-sm leading-snug">${escHtml(q.question)}</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2 text-xs">
              ${['A','B','C','D'].map(opt => {
                const isCorrect = q.correctAnswer === opt;
                return `
                  <div class="px-2 py-1 rounded truncate ${isCorrect ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'bg-slate-900/60 text-slate-300'}">
                    <span class="${isCorrect ? 'text-emerald-400' : 'text-slate-400'} font-bold mr-1">${opt}:</span>
                    <span>${escHtml(q.options?.[opt] || '')}</span>
                  </div>`;
              }).join('')}
            </div>
            ${q.explanation ? `<p class="text-xs text-yellow-300/80 mt-1.5 bg-yellow-500/5 px-2.5 py-1 rounded border border-yellow-500/20"><i class="fas fa-lightbulb mr-1"></i>${escHtml(q.explanation)}</p>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');
}

function applyBulkMcqImport() {
  if (!bulkParsedQuestions || bulkParsedQuestions.length === 0) {
    showToast('No valid questions found to import. Please check your text / වලංගු ප්‍රශ්න හඳුනාගෙන නැත.', 'error');
    return;
  }

  try {
    const mode = document.querySelector('input[name="bulk_mcq_mode"]:checked')?.value || 'append';
    const count = bulkParsedQuestions.length;

    if (bulkMcqTarget === 'create') {
      if (mode === 'replace') {
        currentMcqQuestions = [...bulkParsedQuestions];
      } else {
        currentMcqQuestions = [...currentMcqQuestions, ...bulkParsedQuestions];
      }
      renderAdminMcqQuestionsList();
    } else if (bulkMcqTarget === 'modal') {
      if (mode === 'replace') {
        modalMcqQuestions = [...bulkParsedQuestions];
      } else {
        modalMcqQuestions = [...modalMcqQuestions, ...bulkParsedQuestions];
      }
      renderModalMcqQuestionsList();
    }

    closeBulkMcqModal();
    showToast(`🎉 ${count} MCQ Question${count === 1 ? '' : 's'} imported successfully / ප්‍රශ්න ${count} ක් සාර්ථකව එක් විය!`, 'success');
  } catch (e) {
    console.error('Bulk import error:', e);
    showToast('❌ Import failed: ' + (e.message || 'Unknown error. Check the browser console for details.'), 'error');
  }
}

function renderAdminMcqQuestionsList() {
  const listEl = document.getElementById('mcq_questions_list');
  const countBadge = document.getElementById('mcq_questions_count_badge');
  if (!listEl) return;

  if (countBadge) countBadge.textContent = `${currentMcqQuestions.length} Question${currentMcqQuestions.length === 1 ? '' : 's'}`;

  if (currentMcqQuestions.length === 0) {
    listEl.innerHTML = `
      <div class="text-center text-slate-500 py-6 border border-dashed border-slate-700 rounded-xl">
        <i class="fas fa-question-circle text-3xl mb-2 block text-slate-600"></i>
        No questions added yet. Use the editor above to add MCQ questions!
      </div>`;
    return;
  }

  listEl.innerHTML = currentMcqQuestions.map((q, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === currentMcqQuestions.length - 1;
    const isEditing = idx === editingMcqQuestionIndex;

    return `
      <div class="p-3.5 rounded-xl border ${isEditing ? 'border-yellow-500 bg-yellow-500/10' : 'border-slate-700/80 bg-slate-800/60'} transition">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 min-w-0 flex-1">
            <span class="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              #${idx + 1}
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-white text-sm leading-snug">${escHtml(q.question)}</p>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                ${['A','B','C','D'].map(opt => {
                  const isCorrect = q.correctAnswer === opt;
                  return `
                    <div class="px-2 py-1 rounded truncate ${isCorrect ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'bg-slate-900/60 text-slate-300'}">
                      <span class="${isCorrect ? 'text-emerald-400' : 'text-slate-400'} font-bold mr-1">${opt}:</span>
                      <span>${escHtml(q.options?.[opt] || '')}</span>
                    </div>`;
                }).join('')}
              </div>
              ${q.explanation ? `<p class="text-xs text-yellow-300/80 mt-2 bg-yellow-500/5 px-2.5 py-1 rounded border border-yellow-500/20"><i class="fas fa-lightbulb mr-1"></i>${escHtml(q.explanation)}</p>` : ''}
            </div>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <button type="button" onclick="adminMoveMcqQuestion(${idx}, -1)" ${isFirst ? 'disabled' : ''} class="w-7 h-7 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 flex items-center justify-center text-xs" title="Move Up">
              <i class="fas fa-arrow-up"></i>
            </button>
            <button type="button" onclick="adminMoveMcqQuestion(${idx}, 1)" ${isLast ? 'disabled' : ''} class="w-7 h-7 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 flex items-center justify-center text-xs" title="Move Down">
              <i class="fas fa-arrow-down"></i>
            </button>
            <button type="button" onclick="adminEditMcqQuestion(${idx})" class="w-7 h-7 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white flex items-center justify-center text-xs transition" title="Edit Question">
              <i class="fas fa-edit"></i>
            </button>
            <button type="button" onclick="adminDeleteMcqQuestion(${idx})" class="w-7 h-7 rounded bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white flex items-center justify-center text-xs transition" title="Delete Question">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ============================================================
// ADMIN EDIT MCQ QUIZ MODAL
// ============================================================
let modalMcqQuiz = null;
let modalMcqQuestions = [];
let editingModalMcqQuestionIndex = -1;

function openEditMcqModal(quizId) {
  const quiz = books.find(b => b.id === quizId);
  if (!quiz) return;

  modalMcqQuiz = quiz;
  modalMcqQuestions = JSON.parse(JSON.stringify(quiz.questions || []));
  editingModalMcqQuestionIndex = -1;

  document.getElementById('edit_mcq_title').value = quiz.title || '';
  document.getElementById('edit_mcq_grade').value = String(quiz.grade || '10');
  document.getElementById('edit_mcq_subject').value = quiz.subject || 'Science';
  document.getElementById('edit_mcq_notes').value = quiz.textNotes || '';
  document.getElementById('edit_mcq_retry').checked = quiz.allowRetry !== false;
  document.getElementById('edit_mcq_published').checked = quiz.published !== false;

  modalCancelEditMcqQuestion();
  renderModalMcqQuestionsList();

  document.getElementById('editMcqModal').classList.remove('hidden');
}

function closeEditMcqModal() {
  document.getElementById('editMcqModal').classList.add('hidden');
  modalMcqQuiz = null;
  modalMcqQuestions = [];
  editingModalMcqQuestionIndex = -1;
}

function modalSaveMcqQuestion() {
  const qText = document.getElementById('modal_mcq_q_text').value.trim();
  const optA = document.getElementById('modal_mcq_opt_a').value.trim();
  const optB = document.getElementById('modal_mcq_opt_b').value.trim();
  const optC = document.getElementById('modal_mcq_opt_c').value.trim();
  const optD = document.getElementById('modal_mcq_opt_d').value.trim();
  const correctRadio = document.querySelector('input[name="modal_mcq_correct_option"]:checked');
  const correctAnswer = correctRadio ? correctRadio.value : 'A';
  const explanation = document.getElementById('modal_mcq_explanation').value.trim();

  if (!qText) {
    showToast('Please enter the question text', 'error');
    return;
  }
  if (!optA || !optB || !optC || !optD) {
    showToast('Please provide all 4 options (A, B, C, D)', 'error');
    return;
  }

  const qData = {
    id: editingModalMcqQuestionIndex >= 0 ? modalMcqQuestions[editingModalMcqQuestionIndex].id : generateId(),
    question: qText,
    options: { A: optA, B: optB, C: optC, D: optD },
    correctAnswer: correctAnswer,
    explanation: explanation
  };

  if (editingModalMcqQuestionIndex >= 0) {
    modalMcqQuestions[editingModalMcqQuestionIndex] = qData;
    showToast('Question updated', 'success');
    modalCancelEditMcqQuestion();
  } else {
    modalMcqQuestions.push(qData);
    showToast('Question added to quiz paper', 'success');
    document.getElementById('modal_mcq_q_text').value = '';
    document.getElementById('modal_mcq_opt_a').value = '';
    document.getElementById('modal_mcq_opt_b').value = '';
    document.getElementById('modal_mcq_opt_c').value = '';
    document.getElementById('modal_mcq_opt_d').value = '';
    document.getElementById('modal_mcq_explanation').value = '';
    const rA = document.querySelector('input[name="modal_mcq_correct_option"][value="A"]');
    if (rA) rA.checked = true;
  }

  renderModalMcqQuestionsList();
}

function modalEditMcqQuestion(index) {
  const q = modalMcqQuestions[index];
  if (!q) return;

  editingModalMcqQuestionIndex = index;
  document.getElementById('modal_mcq_q_text').value = q.question;
  document.getElementById('modal_mcq_opt_a').value = q.options?.A || '';
  document.getElementById('modal_mcq_opt_b').value = q.options?.B || '';
  document.getElementById('modal_mcq_opt_c').value = q.options?.C || '';
  document.getElementById('modal_mcq_opt_d').value = q.options?.D || '';
  document.getElementById('modal_mcq_explanation').value = q.explanation || '';

  const r = document.querySelector(`input[name="modal_mcq_correct_option"][value="${q.correctAnswer || 'A'}"]`);
  if (r) r.checked = true;

  document.getElementById('modal_mcq_editing_badge').textContent = `Editing Question #${index + 1}`;
  document.getElementById('modal_mcq_editing_badge').classList.remove('hidden');
  document.getElementById('btn_modal_save_mcq_q').innerHTML = `<i class="fas fa-check mr-1.5"></i>Update Question #${index + 1}`;
  document.getElementById('btn_modal_cancel_mcq_q').classList.remove('hidden');
}

function modalCancelEditMcqQuestion() {
  editingModalMcqQuestionIndex = -1;
  document.getElementById('modal_mcq_q_text').value = '';
  document.getElementById('modal_mcq_opt_a').value = '';
  document.getElementById('modal_mcq_opt_b').value = '';
  document.getElementById('modal_mcq_opt_c').value = '';
  document.getElementById('modal_mcq_opt_d').value = '';
  document.getElementById('modal_mcq_explanation').value = '';
  const rA = document.querySelector('input[name="modal_mcq_correct_option"][value="A"]');
  if (rA) rA.checked = true;

  document.getElementById('modal_mcq_editing_badge').classList.add('hidden');
  document.getElementById('btn_modal_save_mcq_q').innerHTML = `<i class="fas fa-plus mr-1.5"></i>Add Question`;
  document.getElementById('btn_modal_cancel_mcq_q').classList.add('hidden');
}

function modalDeleteMcqQuestion(index) {
  if (editingModalMcqQuestionIndex === index) {
    modalCancelEditMcqQuestion();
  } else if (editingModalMcqQuestionIndex > index) {
    editingModalMcqQuestionIndex--;
  }
  modalMcqQuestions.splice(index, 1);
  renderModalMcqQuestionsList();
  showToast('Question removed', 'success');
}

function modalMoveMcqQuestion(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= modalMcqQuestions.length) return;

  const temp = modalMcqQuestions[index];
  modalMcqQuestions[index] = modalMcqQuestions[targetIndex];
  modalMcqQuestions[targetIndex] = temp;

  if (editingModalMcqQuestionIndex === index) {
    editingModalMcqQuestionIndex = targetIndex;
  } else if (editingModalMcqQuestionIndex === targetIndex) {
    editingModalMcqQuestionIndex = index;
  }

  renderModalMcqQuestionsList();
}

function renderModalMcqQuestionsList() {
  const listEl = document.getElementById('modal_mcq_questions_list');
  const countEl = document.getElementById('modal_mcq_q_count');
  if (!listEl) return;

  if (countEl) countEl.textContent = modalMcqQuestions.length;

  if (modalMcqQuestions.length === 0) {
    listEl.innerHTML = `
      <div class="text-center text-slate-500 py-6 border border-dashed border-slate-700 rounded-xl">
        <i class="fas fa-question-circle text-2xl mb-1.5 block text-slate-600"></i>
        No questions in this quiz yet. Add questions using the form above!
      </div>`;
    return;
  }

  listEl.innerHTML = modalMcqQuestions.map((q, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === modalMcqQuestions.length - 1;
    const isEditing = idx === editingModalMcqQuestionIndex;

    return `
      <div class="p-3 rounded-xl border ${isEditing ? 'border-yellow-500 bg-yellow-500/10' : 'border-slate-700/80 bg-slate-800/60'} transition">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 min-w-0 flex-1">
            <span class="w-6 h-6 rounded-lg bg-yellow-500/20 text-yellow-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              #${idx + 1}
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-white text-xs sm:text-sm leading-snug">${escHtml(q.question)}</p>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2 text-xs">
                ${['A','B','C','D'].map(opt => {
                  const isCorrect = q.correctAnswer === opt;
                  return `
                    <div class="px-2 py-0.5 rounded truncate ${isCorrect ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'bg-slate-900/60 text-slate-300'}">
                      <span class="${isCorrect ? 'text-emerald-400' : 'text-slate-400'} font-bold mr-1">${opt}:</span>
                      <span>${escHtml(q.options?.[opt] || '')}</span>
                    </div>`;
                }).join('')}
              </div>
              ${q.explanation ? `<p class="text-xs text-yellow-300/80 mt-1.5 bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/20"><i class="fas fa-lightbulb mr-1"></i>${escHtml(q.explanation)}</p>` : ''}
            </div>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <button type="button" onclick="modalMoveMcqQuestion(${idx}, -1)" ${isFirst ? 'disabled' : ''} class="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 flex items-center justify-center text-xs" title="Move Up">
              <i class="fas fa-arrow-up text-xs"></i>
            </button>
            <button type="button" onclick="modalMoveMcqQuestion(${idx}, 1)" ${isLast ? 'disabled' : ''} class="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 flex items-center justify-center text-xs" title="Move Down">
              <i class="fas fa-arrow-down text-xs"></i>
            </button>
            <button type="button" onclick="modalEditMcqQuestion(${idx})" class="w-6 h-6 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white flex items-center justify-center text-xs transition" title="Edit Question">
              <i class="fas fa-edit text-xs"></i>
            </button>
            <button type="button" onclick="modalDeleteMcqQuestion(${idx})" class="w-6 h-6 rounded bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white flex items-center justify-center text-xs transition" title="Delete Question">
              <i class="fas fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function saveEditMcqModal() {
  if (!modalMcqQuiz) return;

  const title = document.getElementById('edit_mcq_title').value.trim();
  const grade = parseInt(document.getElementById('edit_mcq_grade').value);
  const subject = document.getElementById('edit_mcq_subject').value;
  const textNotes = document.getElementById('edit_mcq_notes').value.trim();
  const allowRetry = document.getElementById('edit_mcq_retry').checked;
  const published = document.getElementById('edit_mcq_published').checked;

  if (!title) {
    showToast('Please enter a quiz title', 'error');
    return;
  }
  if (modalMcqQuestions.length === 0) {
    showToast('Please add at least 1 question to the quiz', 'error');
    return;
  }

  const quiz = books.find(b => b.id === modalMcqQuiz.id);
  if (quiz) {
    quiz.title = title;
    quiz.grade = grade;
    quiz.subject = subject;
    quiz.textNotes = textNotes;
    quiz.allowRetry = allowRetry;
    quiz.published = published;
    quiz.questions = JSON.parse(JSON.stringify(modalMcqQuestions));

    saveData();
    renderResourcesTable();
    if (currentAdminTab === 'quizzes') renderAdminQuizzes();
    closeEditMcqModal();
    showToast('MCQ Quiz Paper updated successfully!', 'success');
  }
}

function adminTogglePublish(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  book.published = !(book.published !== false);
  saveData();
  renderResourcesTable();
  if (currentAdminTab === 'quizzes') renderAdminQuizzes();
  showToast(book.published ? 'Quiz published! Students can now access it.' : 'Quiz unpublished (hidden from students).', 'success');
}

function adminGoToCreateQuiz() {
  showAdminTab('resources');
  document.getElementById('res_type').value = 'MCQ Quiz Papers';
  onResourceTypeChange();
  const el = document.getElementById('res_title');
  if (el) {
    el.focus();
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function renderAdminQuizzes() {
  const quizzes = books.filter(b => b.type === 'MCQ Quiz Papers');
  const gradeFilter = document.getElementById('quizFilterGrade')?.value || '';
  const statusFilter = document.getElementById('quizFilterStatus')?.value || '';
  const search = (document.getElementById('quizFilterSearch')?.value || '').toLowerCase();

  const totalQuizzes = quizzes.length;
  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions || []).length, 0);
  const publishedCount = quizzes.filter(q => q.published !== false).length;
  
  let totalAttempts = 0;
  students.forEach(s => {
    totalAttempts += (s.quizHistory || []).length;
  });

  const statsEl = document.getElementById('adminQuizzesStats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(245,158,11,0.15)"><i class="fas fa-puzzle-piece text-yellow-400"></i></div>
        <div>
          <div class="text-2xl font-black text-white">${totalQuizzes}</div>
          <div class="text-slate-400 text-xs">Total MCQ Quizzes</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(59,130,246,0.15)"><i class="fas fa-list-ol text-blue-400"></i></div>
        <div>
          <div class="text-2xl font-black text-white">${totalQuestions}</div>
          <div class="text-slate-400 text-xs">Total Questions</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(16,185,129,0.15)"><i class="fas fa-globe text-emerald-400"></i></div>
        <div>
          <div class="text-2xl font-black text-white">${publishedCount}</div>
          <div class="text-slate-400 text-xs">Published Quizzes</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(139,92,246,0.15)"><i class="fas fa-user-check text-purple-400"></i></div>
        <div>
          <div class="text-2xl font-black text-white">${totalAttempts}</div>
          <div class="text-slate-400 text-xs">Student Attempts</div>
        </div>
      </div>`;
  }

  const filtered = quizzes.filter(b => {
    const gradeMatch = !gradeFilter || String(b.grade) === gradeFilter;
    const isPub = b.published !== false;
    const statusMatch = !statusFilter || (statusFilter === 'published' ? isPub : !isPub);
    const searchMatch = !search || b.title.toLowerCase().includes(search) || (b.subject || '').toLowerCase().includes(search);
    return gradeMatch && statusMatch && searchMatch;
  });

  const tbody = document.getElementById('adminQuizzesBody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-slate-500 py-8">No MCQ Quizzes found</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(b => {
    const isPub = b.published !== false;
    const allowRetry = b.allowRetry !== false;
    const qCount = (b.questions || []).length;

    return `
      <tr>
        <td>
          <div class="font-semibold text-white text-sm">${escHtml(b.title)}</div>
          ${b.textNotes ? `<div class="text-xs text-slate-400 mt-0.5 truncate max-w-xs"><i class="fas fa-sticky-note mr-1 text-yellow-500"></i>${escHtml(b.textNotes)}</div>` : ''}
        </td>
        <td>Grade ${b.grade}</td>
        <td>${escHtml(b.subject || '—')}</td>
        <td>
          <span class="badge" style="background:rgba(245,158,11,0.15);color:#f59e0b;border-color:rgba(245,158,11,0.3)">
            ${qCount} Question${qCount === 1 ? '' : 's'}
          </span>
        </td>
        <td>
          <span class="badge ${allowRetry ? 'badge-basic' : 'badge-expired'}">
            ${allowRetry ? 'Allowed' : 'Disabled'}
          </span>
        </td>
        <td>
          <span class="badge ${isPub ? 'badge-basic' : 'badge-expired'}">
            <i class="fas ${isPub ? 'fa-check-circle' : 'fa-clock'} mr-1"></i>${isPub ? 'Published' : 'Draft'}
          </span>
        </td>
        <td>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button onclick="adminTogglePublish('${b.id}')" class="btn-secondary btn-sm" title="${isPub ? 'Unpublish Quiz' : 'Publish Quiz'}">
              <i class="fas ${isPub ? 'fa-eye-slash text-yellow-400' : 'fa-globe text-emerald-400'}"></i>
            </button>
            <button onclick="openEditMcqModal('${b.id}')" class="btn-secondary btn-sm" title="Edit Quiz & Questions">
              <i class="fas fa-edit text-blue-400"></i>
            </button>
            <button onclick="openQuizModal('${b.id}', true)" class="btn-secondary btn-sm" title="Preview Quiz as Student">
              <i class="fas fa-play text-yellow-400"></i>
            </button>
            <button onclick="adminDeleteResource('${b.id}')" class="btn-danger btn-sm" title="Delete Quiz">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ============================================================
// INTERACTIVE STUDENT QUIZ PLAYER
// ============================================================
let activeQuiz = null;

function openQuizModal(quizId, isPreview = false) {
  const quiz = books.find(b => b.id === quizId);
  if (!quiz) return;

  if (!isPreview) {
    const student = getCurrentStudent();
    if (!student) {
      showToast('Please log in as a student to take this quiz', 'error');
      return;
    }
    const plan = getEffectivePlan(student);
    const hasAccess = PLAN_FEATURES[plan].mcq || quiz.isFree;
    if (!hasAccess) {
      showUpgradeModal('mcq', quizId);
      return;
    }
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    showToast('This quiz paper has no questions yet.', 'warning');
    return;
  }

  activeQuiz = {
    book: quiz,
    currentQuestionIndex: 0,
    userAnswers: {},
    submitted: false,
    score: 0,
    total: quiz.questions.length,
    percentage: 0,
    isPreview: isPreview
  };

  document.getElementById('quizModalTitle').textContent = quiz.title;
  document.getElementById('quizModalMeta').textContent = `${quiz.subject} • Grade ${quiz.grade} • ${quiz.questions.length} Questions`;
  
  const previewBadge = document.getElementById('quizModalAdminPreviewBadge');
  if (previewBadge) previewBadge.classList.toggle('hidden', !isPreview);

  renderActiveQuiz();
  document.getElementById('quizModal').classList.remove('hidden');
}

function closeQuizModal() {
  if (activeQuiz && !activeQuiz.submitted && Object.keys(activeQuiz.userAnswers).length > 0 && !activeQuiz.isPreview) {
    if (!confirm('Quiz is in progress. Are you sure you want to exit? Your answers will not be saved.')) {
      return;
    }
  }
  document.getElementById('quizModal').classList.add('hidden');
  activeQuiz = null;

  if (currentUser && currentUser.type === 'student') {
    renderMCQPanel();
  }
}

function selectQuizOption(qId, optKey) {
  if (!activeQuiz || activeQuiz.submitted) return;
  activeQuiz.userAnswers[qId] = optKey;
  renderActiveQuiz();
}

function navigateQuizQuestion(index) {
  if (!activeQuiz || activeQuiz.submitted) return;
  if (index >= 0 && index < activeQuiz.book.questions.length) {
    activeQuiz.currentQuestionIndex = index;
    renderActiveQuiz();
  }
}

function quizPrevQuestion() {
  if (!activeQuiz || activeQuiz.submitted) return;
  if (activeQuiz.currentQuestionIndex > 0) {
    activeQuiz.currentQuestionIndex--;
    renderActiveQuiz();
  }
}

function quizNextQuestion() {
  if (!activeQuiz || activeQuiz.submitted) return;
  if (activeQuiz.currentQuestionIndex < activeQuiz.book.questions.length - 1) {
    activeQuiz.currentQuestionIndex++;
    renderActiveQuiz();
  }
}

function submitQuiz() {
  if (!activeQuiz || activeQuiz.submitted) return;

  const total = activeQuiz.book.questions.length;
  const answeredCount = Object.keys(activeQuiz.userAnswers).length;
  const unanswered = total - answeredCount;

  if (unanswered > 0) {
    if (!confirm(`You have ${unanswered} unanswered question(s). Are you sure you want to submit the quiz now?`)) {
      return;
    }
  }

  let correctCount = 0;
  activeQuiz.book.questions.forEach(q => {
    if (activeQuiz.userAnswers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });

  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  activeQuiz.score = correctCount;
  activeQuiz.percentage = percentage;
  activeQuiz.submitted = true;

  if (!activeQuiz.isPreview) {
    const student = getCurrentStudent();
    if (student) {
      if (!student.quizHistory) student.quizHistory = [];
      const attempt = {
        attemptId: generateId(),
        quizId: activeQuiz.book.id,
        quizTitle: activeQuiz.book.title,
        subject: activeQuiz.book.subject,
        grade: activeQuiz.book.grade,
        score: correctCount,
        total: total,
        percentage: percentage,
        userAnswers: { ...activeQuiz.userAnswers },
        completedAt: new Date().toISOString()
      };
      student.quizHistory.unshift(attempt);
      saveData();
    }
  }

  renderActiveQuiz();
}

function retryActiveQuiz() {
  if (!activeQuiz) return;
  if (activeQuiz.book.allowRetry === false) {
    showToast('Retries are disabled by Admin for this quiz paper.', 'warning');
    return;
  }
  activeQuiz.userAnswers = {};
  activeQuiz.currentQuestionIndex = 0;
  activeQuiz.submitted = false;
  activeQuiz.score = 0;
  activeQuiz.percentage = 0;
  renderActiveQuiz();
}

function viewQuizAttemptResults(attemptId) {
  const student = getCurrentStudent();
  if (!student || !student.quizHistory) return;
  const attempt = student.quizHistory.find(a => a.attemptId === attemptId);
  if (!attempt) return;
  const quiz = books.find(b => b.id === attempt.quizId);
  if (!quiz) {
    showToast('Original quiz paper was removed', 'error');
    return;
  }

  activeQuiz = {
    book: quiz,
    currentQuestionIndex: 0,
    userAnswers: attempt.userAnswers || {},
    submitted: true,
    score: attempt.score,
    total: attempt.total,
    percentage: attempt.percentage,
    isPreview: false
  };

  document.getElementById('quizModalTitle').textContent = quiz.title;
  document.getElementById('quizModalMeta').textContent = `${quiz.subject} • Grade ${quiz.grade} (Attempt Record: ${formatDate(attempt.completedAt)})`;
  
  const previewBadge = document.getElementById('quizModalAdminPreviewBadge');
  if (previewBadge) previewBadge.classList.add('hidden');

  renderActiveQuiz();
  document.getElementById('quizModal').classList.remove('hidden');
}

function renderActiveQuiz() {
  const bodyEl = document.getElementById('quizModalBody');
  if (!bodyEl || !activeQuiz) return;

  if (activeQuiz.submitted) {
    renderQuizResultsView(bodyEl);
    return;
  }

  const quiz = activeQuiz.book;
  const qIndex = activeQuiz.currentQuestionIndex;
  const q = quiz.questions[qIndex];
  const total = quiz.questions.length;
  const answeredCount = Object.keys(activeQuiz.userAnswers).length;
  const progressPct = Math.round((answeredCount / total) * 100);
  const selectedOpt = activeQuiz.userAnswers[q.id];

  bodyEl.innerHTML = `
    ${quiz.textNotes ? `
      <div class="p-3.5 rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-xs text-slate-300">
        <span class="font-bold text-yellow-400 mr-1"><i class="fas fa-info-circle mr-1"></i>Instructions:</span>
        ${escHtml(quiz.textNotes)}
      </div>
    ` : ''}

    <div class="space-y-2">
      <div class="flex items-center justify-between text-xs text-slate-400">
        <span class="font-bold text-white">Question ${qIndex + 1} of ${total}</span>
        <span>${answeredCount} of ${total} Answered (${progressPct}%)</span>
      </div>
      <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
        <div class="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-300" style="width:${progressPct}%"></div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
      ${quiz.questions.map((item, idx) => {
        const isCur = idx === qIndex;
        const isAns = activeQuiz.userAnswers[item.id] !== undefined;
        let cls = 'unanswered';
        if (isCur) cls = 'current';
        else if (isAns) cls = 'answered';

        return `
          <button type="button" onclick="navigateQuizQuestion(${idx})" class="mcq-nav-pill ${cls}" title="Go to Question ${idx + 1}">
            ${idx + 1}
          </button>`;
      }).join('')}
    </div>

    <div class="card p-5 sm:p-6 bg-slate-800/80 border border-slate-700">
      <div class="flex items-center gap-2 mb-3">
        <span class="badge" style="background:#eab308;color:#0f172a;font-weight:800">Question ${qIndex + 1}</span>
        ${selectedOpt ? '<span class="text-xs text-emerald-400 font-semibold"><i class="fas fa-check-circle mr-1"></i>Answered</span>' : '<span class="text-xs text-slate-400">Select one option below</span>'}
      </div>

      <h3 class="text-white text-base sm:text-lg font-bold leading-relaxed mb-6">
        ${escHtml(q.question)}
      </h3>

      <div class="space-y-3">
        ${['A','B','C','D'].map(optKey => {
          const optText = q.options?.[optKey] || '';
          const isSelected = selectedOpt === optKey;
          return `
            <div onclick="selectQuizOption('${q.id}', '${optKey}')" class="mcq-option-card ${isSelected ? 'selected' : ''}">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${isSelected ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-slate-300'}">
                ${optKey}
              </div>
              <div class="flex-1 text-sm font-medium ${isSelected ? 'text-white font-semibold' : 'text-slate-200'}">
                ${escHtml(optText)}
              </div>
              <div class="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-yellow-400 bg-yellow-400' : 'border-slate-600'}">
                ${isSelected ? '<i class="fas fa-check text-slate-900 text-xs"></i>' : ''}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>

    <div class="flex items-center justify-between gap-3 pt-2 flex-wrap">
      <button type="button" onclick="quizPrevQuestion()" ${qIndex === 0 ? 'disabled' : ''} class="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed">
        <i class="fas fa-chevron-left mr-1.5"></i>Previous
      </button>

      <div class="flex items-center gap-2">
        ${qIndex < total - 1 ? `
          <button type="button" onclick="quizNextQuestion()" class="btn-secondary">
            Next<i class="fas fa-chevron-right ml-1.5"></i>
          </button>
        ` : ''}

        <button type="button" onclick="submitQuiz()" class="btn-primary" style="background:linear-gradient(135deg,#10b981,#059669);border-color:#059669">
          <i class="fas fa-check-circle mr-1.5"></i>Submit Quiz (${answeredCount}/${total})
        </button>
      </div>
    </div>
  `;
}

function renderQuizResultsView(bodyEl) {
  const quiz = activeQuiz.book;
  const score = activeQuiz.score;
  const total = activeQuiz.total;
  const pct = activeQuiz.percentage;
  const isPass = pct >= 50;
  const isHigh = pct >= 80;
  const allowRetry = quiz.allowRetry !== false;

  let badgeText = 'Needs Practice';
  let badgeColor = '#ef4444';
  let badgeIcon = 'fa-redo';
  if (isHigh) {
    badgeText = 'Outstanding! / විශිෂ්ඨයි';
    badgeColor = '#eab308';
    badgeIcon = 'fa-trophy';
  } else if (isPass) {
    badgeText = 'Good Job! Passed / සමත්';
    badgeColor = '#10b981';
    badgeIcon = 'fa-check-circle';
  }

  bodyEl.innerHTML = `
    <div class="card text-center p-6 sm:p-8" style="background:linear-gradient(135deg,rgba(30,41,59,0.9),rgba(15,23,42,0.95));border:1.5px solid ${badgeColor}">
      <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto flex items-center justify-center text-3xl sm:text-4xl mb-4 shadow-lg" style="background:${isPass ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'};color:${badgeColor}">
        <i class="fas ${badgeIcon}"></i>
      </div>
      <div class="text-4xl sm:text-5xl font-black text-white mb-2">${pct}%</div>
      <div class="text-lg font-bold mb-4" style="color:${badgeColor}">${badgeText}</div>
      <p class="text-slate-300 text-sm max-w-md mx-auto mb-6">
        You correctly answered <span class="font-bold text-white">${score}</span> out of <span class="font-bold text-white">${total}</span> questions on <span class="text-yellow-400 font-semibold">${escHtml(quiz.title)}</span>.
      </p>

      <div class="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
        <div class="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
          <div class="text-xl font-bold text-emerald-400">${score}</div>
          <div class="text-slate-400 text-xs">Correct</div>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
          <div class="text-xl font-bold text-red-400">${total - score}</div>
          <div class="text-slate-400 text-xs">Incorrect</div>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
          <div class="text-xl font-bold text-yellow-400">${total}</div>
          <div class="text-slate-400 text-xs">Total Qs</div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3 flex-wrap">
        ${allowRetry ? `
          <button type="button" onclick="retryActiveQuiz()" class="btn-primary px-6 py-2.5 flex items-center gap-2">
            <i class="fas fa-redo-alt"></i><span>Retry Quiz / නැවත උත්සාහ කරන්න</span>
          </button>
        ` : `
          <div class="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-yellow-400">
            <i class="fas fa-lock mr-1.5"></i>Retries are disabled by Admin for this quiz paper
          </div>
        `}
        <button type="button" onclick="closeQuizModal()" class="btn-secondary px-5 py-2.5">
          <i class="fas fa-times mr-1.5"></i>Back to Quizzes
        </button>
      </div>
    </div>

    <div class="space-y-4 pt-4">
      <div class="flex items-center justify-between border-b border-slate-700/80 pb-3">
        <h4 class="font-bold text-white text-base flex items-center gap-2">
          <i class="fas fa-tasks text-yellow-400"></i>
          <span>Question Review & Explanations / සවිස්තර සමාලෝචනය</span>
        </h4>
        <span class="text-xs text-slate-400">Review correct answers & solutions below</span>
      </div>

      ${quiz.questions.map((item, idx) => {
        const studentAns = activeQuiz.userAnswers[item.id];
        const isCorrect = studentAns === item.correctAnswer;
        const isAnswered = studentAns !== undefined;

        return `
          <div class="p-4 sm:p-5 rounded-xl border ${isCorrect ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5'} space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start gap-2.5">
                <span class="badge ${isCorrect ? 'badge-basic' : 'badge-expired'} font-bold mt-0.5">
                  Q${idx + 1}
                </span>
                <h5 class="font-bold text-white text-sm sm:text-base leading-snug">${escHtml(item.question)}</h5>
              </div>
              <span class="badge ${isCorrect ? 'badge-basic' : 'badge-expired'} flex-shrink-0">
                ${isCorrect ? '<i class="fas fa-check mr-1"></i>Correct' : (isAnswered ? '<i class="fas fa-times mr-1"></i>Incorrect' : 'Unanswered')}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              ${['A','B','C','D'].map(opt => {
                const optText = item.options?.[opt] || '';
                const isOptionCorrect = item.correctAnswer === opt;
                const isOptionStudent = studentAns === opt;

                let cardClass = 'bg-slate-800/60 border-slate-700/80 text-slate-300';
                let tag = '';

                if (isOptionCorrect && isOptionStudent) {
                  cardClass = 'correct';
                  tag = '<span class="text-xs text-emerald-400 font-bold ml-auto flex items-center gap-1"><i class="fas fa-check-circle"></i>Your Answer (Correct!)</span>';
                } else if (isOptionCorrect) {
                  cardClass = 'correct';
                  tag = '<span class="text-xs text-emerald-400 font-bold ml-auto flex items-center gap-1"><i class="fas fa-check"></i>Correct Answer</span>';
                } else if (isOptionStudent) {
                  cardClass = 'incorrect';
                  tag = '<span class="text-xs text-red-400 font-bold ml-auto flex items-center gap-1"><i class="fas fa-times-circle"></i>Your Answer (Incorrect)</span>';
                }

                return `
                  <div class="mcq-option-card ${cardClass}" style="cursor:default">
                    <span class="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 ${isOptionCorrect ? 'bg-emerald-500 text-slate-950' : (isOptionStudent ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300')}">
                      ${opt}
                    </span>
                    <span class="text-xs sm:text-sm font-medium ${isOptionCorrect ? 'text-emerald-200 font-semibold' : ''}">${escHtml(optText)}</span>
                    ${tag}
                  </div>`;
              }).join('')}
            </div>

            ${item.explanation ? `
              <div class="mcq-explanation-box">
                <p class="text-xs text-yellow-400 font-bold mb-1 flex items-center gap-1.5">
                  <i class="fas fa-lightbulb"></i>
                  <span>Explanation / පැහැදිලි කිරීම:</span>
                </p>
                <p class="text-xs text-slate-300 leading-relaxed">${escHtml(item.explanation)}</p>
              </div>
            ` : ''}
          </div>`;
      }).join('')}
    </div>
  `;
}

function renderStudentScoreHistory() {
  const student = getCurrentStudent();
  const tbody = document.getElementById('mcqHistoryBody');
  const countBadge = document.getElementById('mcqHistoryCount');
  if (!tbody) return;

  const history = student ? (student.quizHistory || []) : [];
  if (countBadge) {
    countBadge.textContent = `${history.length} Attempt${history.length === 1 ? '' : 's'}`;
  }

  if (history.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-slate-500 py-6">No quizzes attempted yet. Select a quiz above to start!</td></tr>`;
    return;
  }

  tbody.innerHTML = history.map(att => {
    const isPass = att.percentage >= 50;
    const quiz = books.find(b => b.id === att.quizId);
    const allowRetry = quiz ? quiz.allowRetry !== false : true;

    return `
      <tr>
        <td>
          <div class="font-semibold text-white text-sm">${escHtml(att.quizTitle)}</div>
        </td>
        <td>${escHtml(att.subject || '—')}</td>
        <td>
          <span class="font-bold text-white">${att.score}</span> / <span class="text-slate-400">${att.total}</span>
        </td>
        <td>
          <span class="badge ${isPass ? 'badge-basic' : 'badge-expired'}">
            ${att.percentage}%
          </span>
        </td>
        <td class="text-xs text-slate-300">
          ${formatDate(att.completedAt)}
        </td>
        <td>
          <div class="flex items-center gap-2">
            <button onclick="viewQuizAttemptResults('${att.attemptId}')" class="btn-secondary btn-sm" title="Review Answers">
              <i class="fas fa-eye mr-1"></i>Review
            </button>
            ${allowRetry && quiz ? `
              <button onclick="openQuizModal('${quiz.id}')" class="btn-primary btn-sm" title="Retry Quiz">
                <i class="fas fa-redo-alt mr-1"></i>Retry
              </button>
            ` : ''}
          </div>
        </td>
      </tr>`;
  }).join('');
}

// INITIALIZATION
// ============================================================
(function init() {
  loadData();
  runMigration();
  initAuthCanvas();
  showPage('auth');
})();
