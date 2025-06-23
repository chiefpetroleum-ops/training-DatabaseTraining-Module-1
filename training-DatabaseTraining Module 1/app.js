// Global variables
let db;
let currentModule = "welcome";
const modules = [
    "welcome",
    "concepts",
    "setup",
    "data-import",
    "sql-basics",
    "joins",
    "exercises",
    "project",
    "summary"
];
let completedModules = new Set();

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    await initSqlJs();
    setupEventListeners();
    loadModule("welcome");
    loadProgress();
});

// Initialize SQL.js
async function initSqlJs() {
    try {
        const SQL = await initSqlJsInternal();
        db = new SQL.Database();
        initializeDatabase();
        console.log("SQL.js initialized successfully");
    } catch (err) {
        console.error("Error initializing SQL.js:", err);
        alert("Failed to load SQL.js. The SQL playground may not work properly.");
    }
}

// Setup event listeners
function setupEventListeners() {
    document.querySelectorAll('#sidebar-menu .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const module = this.getAttribute('data-module');
            loadModule(module);
        });
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        const currentIndex = modules.indexOf(currentModule);
        if (currentIndex < modules.length - 1) {
            loadModule(modules[currentIndex + 1]);
        }
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        const currentIndex = modules.indexOf(currentModule);
        if (currentIndex > 0) {
            loadModule(modules[currentIndex - 1]);
        }
    });

    document.getElementById('run-sql').addEventListener('click', runSqlQuery);
    document.getElementById('clear-results').addEventListener('click', clearSqlResults);
    document.getElementById('reset-db').addEventListener('click', resetDatabase);
}

// Load a module
async function loadModule(moduleName) {
    try {
        currentModule = moduleName;

        // Update sidebar active state
        document.querySelectorAll('#sidebar-menu .nav-link').forEach(link => link.classList.remove('active'));
        document.querySelector(`#sidebar-menu .nav-link[data-module="${moduleName}"]`).classList.add('active');

        // Update page title
        const menuText = document.querySelector(`#sidebar-menu .nav-link[data-module="${moduleName}"]`).textContent.trim();
        document.getElementById('page-title').textContent = menuText;

        // ✅ FIXED PATH: Load module HTML from root folder
        const response = await fetch(`${moduleName}.html`);
        if (!response.ok) throw new Error(`Failed to load ${moduleName}.html`);

        const content = await response.text();
        document.getElementById('module-content').innerHTML = content;

        // Show/hide SQL playground
        const showSqlPlayground = ["sql-basics", "joins", "exercises", "project"].includes(moduleName);
        document.getElementById('sql-playground').classList.toggle('d-none', !showSqlPlayground);

        // Highlight code if any
        document.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));

        // Mark as complete handler
        const completeBtn = document.getElementById('complete-module-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => markModuleComplete(moduleName));
        }

        updateModuleUI(moduleName);
        updateProgressDisplay();
        updateNavigationButtons();
        window.scrollTo(0, 0);
    } catch (err) {
        console.error("Error loading module:", err);
        document.getElementById('module-content').innerHTML = `
            <div class="alert alert-danger">
                <h4>Error Loading Module</h4>
                <p>${err.message}</p>
            </div>
        `;
    }
}

function markModuleComplete(moduleName) {
    completedModules.add(moduleName);
    saveProgress();
    updateModuleUI(moduleName);
    updateProgressDisplay();

    const currentIndex = modules.indexOf(moduleName);
    if (currentIndex < modules.length - 1) {
        loadModule(modules[currentIndex + 1]);
    }
}

function updateModuleUI(moduleName) {
    const completeBtn = document.getElementById('complete-module-btn');
    if (completeBtn) {
        if (completedModules.has(moduleName)) {
            completeBtn.textContent = "✓ Completed";
            completeBtn.classList.remove('btn-primary');
            completeBtn.classList.add('btn-success');
            completeBtn.disabled = true;
        } else {
            completeBtn.textContent = "Mark as Complete";
            completeBtn.classList.remove('btn-success');
            completeBtn.classList.add('btn-primary');
            completeBtn.disabled = false;
        }
    }

    const menuItem = document.querySelector(`#sidebar-menu .nav-link[data-module="${moduleName}"]`);
    if (completedModules.has(moduleName)) {
        menuItem.innerHTML = menuItem.innerHTML.replace(/^([^<]*)/, "✓ $1");
    } else {
        menuItem.innerHTML = menuItem.innerHTML.replace(/^✓\s*/, "");
    }
}

function updateProgressDisplay() {
    const total = modules.length;
    const completed = completedModules.size;
    const percentage = Math.round((completed / total) * 100);

    document.getElementById('progress-text').textContent = `${completed}/${total} completed`;
    const bar = document.querySelector('.progress-bar');
    bar.style.width = `${percentage}%`;
    bar.textContent = `${percentage}%`;
    bar.setAttribute('aria-valuenow', percentage);
}

function updateNavigationButtons() {
    const index = modules.indexOf(currentModule);
    document.getElementById('prev-btn').disabled = index <= 0;
    document.getElementById('next-btn').disabled = index >= modules.length - 1;
}

function saveProgress() {
    localStorage.setItem('dbTraining_completedModules', JSON.stringify([...completedModules]));
}

function loadProgress() {
    const saved = localStorage.getItem('dbTraining_completedModules');
    if (saved) {
        completedModules = new Set(JSON.parse(saved));
        updateProgressDisplay();

        modules.forEach(module => {
            const item = document.querySelector(`#sidebar-menu .nav-link[data-module="${module}"]`);
            if (completedModules.has(module)) {
                item.innerHTML = item.innerHTML.replace(/^([^<]*)/, "✓ $1");
            } else {
                item.innerHTML = item.innerHTML.replace(/^✓\s*/, "");
            }
        });
    }
}

function runSqlQuery() {
    const query = document.getElementById('sql-query').value.trim();
    if (!query) return;

    try {
        const results = db.exec(query);
        displaySqlResults(results);
    } catch (err) {
        displaySqlError(err);
    }
}

function displaySqlResults(results) {
    const div = document.getElementById('sql-results');
    if (!results || results.length === 0) {
        div.innerHTML = `<div class="alert alert-success">Query executed successfully. No results returned.</div>`;
        return;
    }

    let output = '';
    results.forEach(result => {
        output += '<table class="table table-striped table-bordered">';
        output += '<thead><tr>';
        result.columns.forEach(col => output += `<th>${col}</th>`);
        output += '</tr></thead><tbody>';
        result.values.forEach(row => {
            output += '<tr>';
            row.forEach(cell => output += `<td>${cell ?? 'NULL'}</td>`);
            output += '</tr>';
        });
        output += '</tbody></table>';
    });

    div.innerHTML = output;
}

function displaySqlError(err) {
    document.getElementById('sql-results').innerHTML = `
        <div class="alert alert-danger">
            <h5>SQL Error</h5>
            <p>${err.message}</p>
        </div>
    `;
}

function clearSqlResults() {
    document.getElementById('sql-results').innerHTML = `
        <div class="text-muted text-center py-5">
            No results to display. Run a query to see results here.
        </div>
    `;
    document.getElementById('sql-query').value = '';
}

function resetDatabase() {
    if (confirm("Reset database to default sample data?")) {
        try {
            db.exec("DROP TABLE IF EXISTS deliveries;");
            db.exec("DROP TABLE IF EXISTS sales;");
            db.exec("DROP TABLE IF EXISTS customers;");
            db.exec("DROP TABLE IF EXISTS products;");
            db.exec("DROP TABLE IF EXISTS drivers;");
            initializeDatabase();
            clearSqlResults();
            alert("Database reset successfully.");
        } catch (err) {
            console.error("Error resetting database:", err);
            alert("Error: " + err.message);
        }
    }
}

async function initSqlJsInternal() {
    const sqlPromise = initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    return await sqlPromise;
}