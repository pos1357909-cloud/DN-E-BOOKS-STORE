const API_URL = "https://your-backend-service.onrender.com/api"; // Replace with your deployed backend URL

const ADMIN_EMAIL = "exampaperlkonlinepapershop@gmail.com";
const ADMIN_PASS = "FG@#478f";

let books = [];
let students = [];
let orders = [];
let approvedSalesHistory = [];

let loggedUser = null;
let isAdmin = false;

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

function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById('page' + pageId.charAt(0).toUpperCase() + pageId.slice(1));
    if(target) target.classList.remove('hidden');
    if(pageId === 'dashboard' && loggedUser) renderStudentDashboard();
}

function renderStore() {
    const store = document.getElementById('storeSection');
    if(books.length === 0) {
        store.innerHTML = `<div class="col-span-3 text-center text-slate-400 py-10">ද්‍රව්‍ය කිසිවක් හමු නොවුණි.</div>`;
        return;
    }
    store.innerHTML = books.map(b => `
        <div class="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
            <h3 class="font-bold text-white text-lg">${b.title}</h3>
            <span class="text-yellow-400 font-bold">LKR ${b.price}.00</span>
            <button onclick="alert('Viewing book: ${b.title}')" class="bg-emerald-600 text-white px-3 py-1.5 rounded mt-3">කියවන්න</button>
        </div>
    `).join('');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;

    if(email === ADMIN_EMAIL && pass === ADMIN_PASS) {
        isAdmin = true;
        document.getElementById('adminPanel').classList.remove('hidden');
        closeLoginModal();
        alert('Admin Logged In Successfully!');
        return;
    }
    alert('Invalid Login Credentials');
}

function handleBookUpload(e) {
    e.preventDefault();
    const fileInput = document.getElementById('uploadPdfFile');
    const file = fileInput.files[0];

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
    if(file) reader.readAsDataURL(file);
}

function openLoginModal() { document.getElementById('loginModal').classList.remove('hidden'); }
function closeLoginModal() { document.getElementById('loginModal').classList.add('hidden'); }

window.onload = initApp;