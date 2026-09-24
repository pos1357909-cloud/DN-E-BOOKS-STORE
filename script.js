// ඔබගේ Render හෝ වෙනත් සර්වර් එකක Deploy කර ඇති Backend URL එක මෙහි ලබා දෙන්න
const API_URL = "https://your-backend-service.onrender.com/api";

const ADMIN_EMAIL = "exampaperlkonlinepapershop@gmail.com";
const ADMIN_PASS = "FG@#478f";

let books = [];
let students = [];
let orders = [];
let approvedSalesHistory = [];

let loggedUser = null;
let isAdmin = false;

// 1. Backend එකෙන් දත්ත ලබා ගැනීම
async function fetchBackendData() {
    try {
        const response = await fetch(`${API_URL}/data`);
        const data = await response.json();
        books = data.books || [];
        students = data.students || [];
        orders = data.orders || [];
        approvedSalesHistory = data.salesHistory || [];
        renderStore();
    } catch (err) {
        console.error("Error fetching data from MongoDB:", err);
    }
}

// 2. Backend එක සමඟ දත්ත Sync කිරීම
async function syncBackendData() {
    try {
        await fetch(`${API_URL}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ books, students, orders, salesHistory: approvedSalesHistory })
        });
    } catch (err) {
        console.error("Error syncing data:", err);
    }
}

function initApp() {
    fetchBackendData();
}

// Pages මාරු කිරීම
function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById('page' + pageId.charAt(0).toUpperCase() + pageId.slice(1));
    if(target) target.classList.remove('hidden');
    if(pageId === 'dashboard' && loggedUser) renderStudentDashboard();
}

// Store එකේ පොත් පෙන්වීම
function renderStore() {
    const store = document.getElementById('storeSection');
    if(!store) return;
    
    if(books.length === 0) {
        store.innerHTML = `<div class="col-span-3 text-center text-slate-400 py-10">ද්‍රව්‍ය කිසිවක් හමු නොවුණි.</div>`;
        return;
    }
    store.innerHTML = books.map(b => `
        <div class="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-between shadow-lg">
            <div>
                <span class="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-semibold">${b.grade} - ${b.subject}</span>
                <h3 class="font-bold text-white text-lg mt-2">${b.title}</h3>
            </div>
            <div class="flex items-center justify-between mt-4">
                <span class="text-yellow-400 font-bold">LKR ${b.price}.00</span>
                <button onclick="alert('Viewing book: ${b.title}')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 rounded-lg font-semibold transition">කියවන්න</button>
            </div>
        </div>
    `).join('');
}

// Login හැසිරවීම
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;

    if(email === ADMIN_EMAIL && pass === ADMIN_PASS) {
        isAdmin = true;
        const adminPanel = document.getElementById('adminPanel');
        if(adminPanel) adminPanel.classList.remove('hidden');
        closeLoginModal();
        alert('Admin Logged In Successfully!');
        return;
    }
    alert('Invalid Login Credentials');
}

// Admin Panel මඟින් අලුත් පොතක් Upload කිරීම
function handleBookUpload(e) {
    e.preventDefault();
    const fileInput = document.getElementById('uploadPdfFile');
    const file = fileInput.files[0];

    if(!file) {
        alert('దయచే කරුණාකර PDF ගොනුවක් තෝරන්න.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(evt) {
        const newBook = {
            id: Date.now(),
            title: document.getElementById('uploadTitle').value,
            grade: document.getElementById('uploadGrade').value,
            subject: document.getElementById('uploadSubject').value,
            price: parseInt(document.getElementById('uploadPrice').value) || 0,
            pdfData: evt.target.result
        };
        books.push(newBook);
        await syncBackendData();
        renderStore();
        alert('Resource uploaded and saved to MongoDB successfully!');
    };
    reader.readAsDataURL(file);
}

// Modal පාලනය
function openLoginModal() { 
    const modal = document.getElementById('loginModal');
    if(modal) modal.classList.remove('hidden'); 
}

function closeLoginModal() { 
    const modal = document.getElementById('loginModal');
    if(modal) modal.classList.add('hidden'); 
}

// Admin Tabs මාරු කිරීම
function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById('adminTab-' + tabName);
    if(target) target.classList.remove('hidden');
}

window.onload = initApp;