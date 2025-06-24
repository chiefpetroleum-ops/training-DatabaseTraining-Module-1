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

// Define initializeDatabase function first
function initializeDatabase() {
  if (!db) return;
  
  try {
    // Create tables
    db.exec(`
      CREATE TABLE customers (
        CustomerID INTEGER PRIMARY KEY,
        CustomerName TEXT NOT NULL,
        ContactName TEXT,
        Address TEXT,
        City TEXT,
        State TEXT,
        ZipCode TEXT,
        Phone TEXT
      );
      
      CREATE TABLE products (
        ProductID INTEGER PRIMARY KEY,
        ProductName TEXT NOT NULL,
        Category TEXT,
        UnitPrice REAL NOT NULL,
        UnitsInStock INTEGER DEFAULT 0
      );
      
      CREATE TABLE sales (
        SaleID INTEGER PRIMARY KEY,
        CustomerID INTEGER,
        ProductID INTEGER,
        Quantity INTEGER NOT NULL,
        SaleDate TEXT,
        TotalAmount REAL,
        FOREIGN KEY (CustomerID) REFERENCES customers(CustomerID),
        FOREIGN KEY (ProductID) REFERENCES products(ProductID)
      );
      
      CREATE TABLE drivers (
        DriverID INTEGER PRIMARY KEY,
        FirstName TEXT NOT NULL,
        LastName TEXT NOT NULL,
        LicenseNumber TEXT,
        HireDate TEXT
      );
      
      CREATE TABLE deliveries (
        DeliveryID INTEGER PRIMARY KEY,
        SaleID INTEGER,
        DriverID INTEGER,
        DeliveryDate TEXT,
        Status TEXT,
        FOREIGN KEY (SaleID) REFERENCES sales(SaleID),
        FOREIGN KEY (DriverID) REFERENCES drivers(DriverID)
      );
    `);
    
    // Insert sample data
    db.exec(`
      -- Sample Customers
      INSERT INTO customers VALUES (1, "ABC Construction", "John Smith", "123 Main St", "Denver", "CO", "80201", "303-555-1234");
      INSERT INTO customers VALUES (2, "XYZ Mining", "Jane Doe", "456 Oak Ave", "Boulder", "CO", "80302", "303-555-5678");
      INSERT INTO customers VALUES (3, "Mountain Transport", "Bob Johnson", "789 Pine Rd", "Colorado Springs", "CO", "80901", "719-555-9012");
      INSERT INTO customers VALUES (4, "Foothills Excavation", "Sarah Williams", "321 Maple Dr", "Fort Collins", "CO", "80521", "970-555-3456");
      INSERT INTO customers VALUES (5, "Rocky Mountain Drilling", "Mike Brown", "654 Cedar Ln", "Grand Junction", "CO", "81501", "970-555-7890");
      
      -- Sample Products
      INSERT INTO products VALUES (1, "Regular Gasoline", "Fuel", 3.25, 5000);
      INSERT INTO products VALUES (2, "Premium Gasoline", "Fuel", 3.75, 3500);
      INSERT INTO products VALUES (3, "Diesel", "Fuel", 3.50, 4200);
      INSERT INTO products VALUES (4, "Engine Oil 10W-30", "Lubricant", 25.99, 150);
      INSERT INTO products VALUES (5, "Hydraulic Fluid", "Lubricant", 18.50, 200);
      
      -- Sample Sales
      INSERT INTO sales VALUES (1, 1, 3, 500, "2023-01-15", 1750.00);
      INSERT INTO sales VALUES (2, 2, 1, 350, "2023-01-20", 1137.50);
      INSERT INTO sales VALUES (3, 3, 3, 600, "2023-01-25", 2100.00);
      INSERT INTO sales VALUES (4, 4, 2, 200, "2023-02-01", 750.00);
      INSERT INTO sales VALUES (5, 5, 3, 450, "2023-02-05", 1575.00);
      INSERT INTO sales VALUES (6, 1, 4, 10, "2023-02-10", 259.90);
      INSERT INTO sales VALUES (7, 2, 5, 15, "2023-02-15", 277.50);
      INSERT INTO sales VALUES (8, 3, 1, 300, "2023-02-20", 975.00);
      
      -- Sample Drivers
      INSERT INTO drivers VALUES (1, "David", "Miller", "DL123456", "2022-01-10");
      INSERT INTO drivers VALUES (2, "Linda", "Garcia", "DL234567", "2022-03-15");
      INSERT INTO drivers VALUES (3, "James", "Wilson", "DL345678", "2022-05-20");
      INSERT INTO drivers VALUES (4, "Patricia", "Martinez", "DL456789", "2022-07-25");
      
      -- Sample Deliveries
      INSERT INTO deliveries VALUES (1, 1, 1, "2023-01-16", "Delivered");
      INSERT INTO deliveries VALUES (2, 2, 2, "2023-01-21", "Delivered");
      INSERT INTO deliveries VALUES (3, 3, 3, "2023-01-26", "Delivered");
      INSERT INTO deliveries VALUES (4, 4, 4, "2023-02-02", "Delivered");
      INSERT INTO deliveries VALUES (5, 5, 1, "2023-02-06", "Delivered");
      INSERT INTO deliveries VALUES (6, 6, 2, "2023-02-11", "In Transit");
      INSERT INTO deliveries VALUES (7, 7, 3, "2023-02-16", "Scheduled");
    `);
    
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    db = new SQL.Database();
    initializeDatabase();
    console.log("SQL.js initialized successfully");
  } catch (err) {
    console.error("SQL.js initialization error:", err);
    document.getElementById("module-content").innerHTML += `
      <div class="alert alert-danger">
        <h4>SQL.js Error</h4>
        <p>Failed to initialize SQL.js. Some features may not work correctly.</p>
        <p>Technical details: ${err.message}</p>
      </div>
    `;
  }
  
  setupEventListeners();
  loadModule("welcome");
  loadProgress();
});

function setupEventListeners() {
  document.querySelectorAll("#sidebar-menu .nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const module = this.getAttribute("data-module");
      loadModule(module);
    });
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    const currentIndex = modules.indexOf(currentModule);
    if (currentIndex < modules.length - 1) {
      loadModule(modules[currentIndex + 1]);
    }
  });

  document.getElementById("prev-btn").addEventListener("click", () => {
    const currentIndex = modules.indexOf(currentModule);
    if (currentIndex > 0) {
      loadModule(modules[currentIndex - 1]);
    }
  });

  // Check if SQL playground elements exist before adding event listeners
  const runSqlBtn = document.getElementById("run-sql");
  const clearResultsBtn = document.getElementById("clear-results");
  const resetDbBtn = document.getElementById("reset-db");
  
  if (runSqlBtn) runSqlBtn.addEventListener("click", runSqlQuery);
  if (clearResultsBtn) clearResultsBtn.addEventListener("click", clearSqlResults);
  if (resetDbBtn) resetDbBtn.addEventListener("click", resetDatabase);
}

async function loadModule(moduleName) {
  try {
    currentModule = moduleName;

    document.querySelectorAll("#sidebar-menu .nav-link").forEach((link) =>
      link.classList.remove("active")
    );
    
    const activeLink = document.querySelector(`#sidebar-menu .nav-link[data-module="${moduleName}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
      
      const menuText = activeLink.textContent.trim();
      document.getElementById("page-title").textContent = menuText;
    }

    // Try loading from the current directory first
    let response;
    let content;
    
    try {
      response = await fetch(`${moduleName}.html`);
      if (response.ok) {
        content = await response.text();
      }
    } catch (err) {
      console.log("Could not load from current directory");
    }
    
    // If that fails, try the root directory
    if (!response || !response.ok) {
      try {
        response = await fetch(`../${moduleName}.html`);
        if (response.ok) {
          content = await response.text();
        } else {
          throw new Error(`Missing: ${moduleName}.html`);
        }
      } catch (err) {
        throw new Error(`Could not load ${moduleName}.html from any location`);
      }
    }

    document.getElementById("module-content").innerHTML = content;

    const showSql = ["sql-basics", "joins", "exercises", "project"].includes(moduleName);
    const sqlPlayground = document.getElementById("sql-playground");
    if (sqlPlayground) {
      sqlPlayground.classList.toggle("d-none", !showSql);
    }

    document.querySelectorAll("pre code").forEach((block) => {
      if (window.hljs) {
        hljs.highlightElement(block);
      }
    });

    const completeBtn = document.getElementById("complete-module-btn");
    if (completeBtn) {
      completeBtn.addEventListener("click", () => markModuleComplete(moduleName));
    }

    updateModuleUI(moduleName);
    updateProgressDisplay();
    updateNavigationButtons();
    window.scrollTo(0, 0);
  } catch (err) {
    console.error("Module load error:", err);
    document.getElementById("module-content").innerHTML = `
      <div class="alert alert-danger">
        <h4>Error</h4>
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
  const completeBtn = document.getElementById("complete-module-btn");
  if (completeBtn) {
    if (completedModules.has(moduleName)) {
      completeBtn.textContent = "✓ Completed";
      completeBtn.classList.replace("btn-primary", "btn-success");
      completeBtn.disabled = true;
    } else {
      completeBtn.textContent = "Mark as Complete";
      completeBtn.classList.replace("btn-success", "btn-primary");
      completeBtn.disabled = false;
    }
  }

  const menuItem = document.querySelector(`#sidebar-menu .nav-link[data-module="${moduleName}"]`);
  if (menuItem) {
    if (completedModules.has(moduleName)) {
      if (!menuItem.innerHTML.includes("✓")) {
        menuItem.innerHTML = menuItem.innerHTML.replace(/^([^<]*)/, "✓ $1");
      }
    } else {
      menuItem.innerHTML = menuItem.innerHTML.replace(/^✓\s*/, "");
    }
  }
}

function updateProgressDisplay() {
  const total = modules.length;
  const completed = completedModules.size;
  const percent = Math.round((completed / total) * 100);
  
  const progressText = document.getElementById("progress-text");
  const progressBar = document.querySelector(".progress-bar");
  
  if (progressText) {
    progressText.textContent = `${completed}/${total} completed`;
  }
  
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
    progressBar.textContent = `${percent}%`;
    progressBar.setAttribute("aria-valuenow", percent);
  }
}

function updateNavigationButtons() {
  const i = modules.indexOf(currentModule);
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  
  if (prevBtn) prevBtn.disabled = i <= 0;
  if (nextBtn) nextBtn.disabled = i >= modules.length - 1;
}

function saveProgress() {
  try {
    localStorage.setItem("dbTraining_completedModules", JSON.stringify([...completedModules]));
  } catch (err) {
    console.error("Error saving progress:", err);
  }
}

function loadProgress() {
  try {
    const saved = localStorage.getItem("dbTraining_completedModules");
    if (saved) {
      completedModules = new Set(JSON.parse(saved));
      updateProgressDisplay();
      modules.forEach((module) => {
        const item = document.querySelector(`#sidebar-menu .nav-link[data-module="${module}"]`);
        if (item && completedModules.has(module)) {
          if (!item.innerHTML.includes("✓")) {
            item.innerHTML = item.innerHTML.replace(/^([^<]*)/, "✓ $1");
          }
        } else if (item) {
          item.innerHTML = item.innerHTML.replace(/^✓\s*/, "");
        }
      });
    }
  } catch (err) {
    console.error("Error loading progress:", err);
  }
}

function runSqlQuery() {
  const queryInput = document.getElementById("sql-query");
  if (!queryInput) return;
  
  const q = queryInput.value.trim();
  if (!q || !db) return;
  
  try {
    const results = db.exec(q);
    displaySqlResults(results);
  } catch (err) {
    document.getElementById("sql-results").innerHTML = `
      <div class="alert alert-danger">
        <h5>SQL Error</h5>
        <p>${err.message}</p>
      </div>
    `;
  }
}

function clearSqlResults() {
  const resultsElement = document.getElementById("sql-results");
  if (resultsElement) {
    resultsElement.innerHTML = `
      <div class="alert alert-info">
        Enter a SQL query and click "Run Query" to see results.
      </div>
    `;
  }
  
  const queryInput = document.getElementById("sql-query");
  if (queryInput) {
    queryInput.value = "";
  }
}

function displaySqlResults(results) {
  const resultsElement = document.getElementById("sql-results");
  if (!resultsElement) return;
  
  if (!results || results.length === 0) {
    resultsElement.innerHTML = `
      <div class="alert alert-success">
        Query executed successfully. No results returned.
      </div>
    `;
    return;
  }

  let html = "";
  results.forEach((result) => {
    html += `<div class="table-responsive mb-4">`;
    html += `<table class="table table-striped table-bordered">`;
    html += `<thead><tr>`;
    result.columns.forEach((column) => {
      html += `<th>${column}</th>`;
    });
    html += `</tr></thead>`;
    html += `<tbody>`;
    result.values.forEach((row) => {
      html += `<tr>`;
      row.forEach((cell) => {
        html += `<td>${cell === null ? "NULL" : cell}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table>`;
    html += `<p class="text-muted">${result.values.length} row(s) returned</p>`;
    html += `</div>`;
  });

  resultsElement.innerHTML = html;
}

function resetDatabase() {
  if (!db) return;
  
  // Clear existing tables
  try {
    db.exec("DROP TABLE IF EXISTS customers");
    db.exec("DROP TABLE IF EXISTS products");
    db.exec("DROP TABLE IF EXISTS sales");
    db.exec("DROP TABLE IF EXISTS drivers");
    db.exec("DROP TABLE IF EXISTS deliveries");
    
    // Reinitialize
    initializeDatabase();
    
    document.getElementById("sql-results").innerHTML = `
      <div class="alert alert-success">
        Database has been reset to initial state.
      </div>
    `;
  } catch (err) {
    document.getElementById("sql-results").innerHTML = `
      <div class="alert alert-danger">
        <h5>Error Resetting Database</h5>
        <p>${err.message}</p>
      </div>
    `;
  }
}
