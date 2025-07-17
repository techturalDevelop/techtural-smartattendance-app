// --- 1. SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('sw.js')
      .then(reg => console.log('Service Worker: Registered'))
      .catch(err => console.log(`Service Worker: Error: ${err}`));
  });
}

// --- 2. INDEXEDDB SETUP ---
let db;
const dbRequest = indexedDB.open('AttendanceDB', 1);

dbRequest.onupgradeneeded = event => {
  db = event.target.result;
  const objectStore = db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
  objectStore.createIndex('name', 'name', { unique: false });
  objectStore.createIndex('date', 'date', { unique: false });
};

dbRequest.onsuccess = event => {
  db = event.target.result;
  console.log('Database opened successfully');
  renderUI(); // Initial render of all data
};

dbRequest.onerror = event => {
  console.error('Database error:', event.target.errorCode);
};

// --- 3. DOM ELEMENTS & MODALS ---
const addModalEl = document.getElementById('addAttendanceModal');
const addModal = new bootstrap.Modal(addModalEl);
const addForm = addModalEl.querySelector('form');
const attendanceTableBody = document.querySelector('table tbody');

// --- 4. EVENT LISTENERS ---
addForm.addEventListener('submit', event => {
  event.preventDefault();
  const newRecord = {
    name: document.getElementById('employeeName').value,
    date: document.getElementById('attendanceDate').value,
    status: document.getElementById('attendanceStatus').value,
  };
  addRecord(newRecord);
});

function addRecord(record) {
  const transaction = db.transaction(['records'], 'readwrite');
  const objectStore = transaction.objectStore('records');
  const request = objectStore.add(record);

  request.onsuccess = () => {
    console.log('Record added to DB');
    addForm.reset();
    addModal.hide();
    renderUI(); // Re-render everything to show the new data
  };

  transaction.onerror = () => {
    console.error('Error adding record');
  };
}

// --- 5. UI RENDERING ---
function renderUI() {
  renderTable();
  // In a full app, you would also call functions to update the dashboard stats and chart here
}

function renderTable() {
  attendanceTableBody.innerHTML = ''; // Clear existing table
  const transaction = db.transaction(['records'], 'readonly');
  const objectStore = transaction.objectStore('records');
  const request = objectStore.openCursor();

  request.onsuccess = event => {
    const cursor = event.target.result;
    if (cursor) {
      const record = cursor.value;
      const row = document.createElement('tr');
      
      const statusBadges = {
        present: 'badge-present',
        absent: 'badge-absent',
        late: 'badge-late'
      };
      
      row.innerHTML = `
        <td>${record.name}</td>
        <td>${record.date}</td>
        <td><span class="badge ${statusBadges[record.status]}">${record.status}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editRecord(${record.id})">
            <i class="fas fa-edit"></i> Edit
          </button>
        </td>
      `;
      attendanceTableBody.appendChild(row);
      cursor.continue();
    }
  };
}

// Placeholder functions for chart, stats, and editing
function editRecord(id) {
    alert(`Editing record with ID: ${id}. (Full implementation needed)`);
    // Here you would open the edit modal and populate it with data for this ID
}

// Initialize the static chart for now
const ctx = document.getElementById('attendanceChart').getContext('2d');
new Chart(ctx, {
    type: 'bar',
    data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{
        label: 'Present Employees',
        data: [140, 142, 138, 145, 130], // This would be dynamic in a full app
        backgroundColor: '#4A90E2',
    }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
});