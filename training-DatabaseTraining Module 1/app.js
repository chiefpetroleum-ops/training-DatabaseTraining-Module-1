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
    // Initialize SQL.js
    initSqlJs();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load the first module
    loadModule("welcome");
    
    // Load progress if any
    loadProgress();
});

// Initialize SQL.js
async function initSqlJs() {
    try {
        // Initialize SQL.js
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        
        // Create a database
        db = new SQL.Database();
        
        // Initialize schema
        initializeDatabase();
        
        console.log("SQL.js initialized successfully");
    } catch (err) {
        console.error("Error initializing SQL.js:", err);
        alert("Failed to load SQL.js. The SQL playground may not work properly.");
    }
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar menu clicks
    document.querySelectorAll('#sidebar-menu .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const module = this.getAttribute('data-module');
            loadModule(module);
        });
    });
    
    // Next button
    document.getElementById('next-btn').addEventListener('click', () => {
        const currentIndex = modules.indexOf(currentModule);
        if (currentIndex < modules.length - 1) {
            loadModule(modules[currentIndex + 1]);
        }
    });
    
    // Previous button
    document.getElementById('prev-btn').addEventListener('click', () => {
        const currentIndex = modules.indexOf(currentModule);
        if (currentIndex > 0) {
            loadModule(modules[currentIndex - 1]);
        }
    });
    
    // SQL Playground buttons
    document.getElementById('run-sql').addEventListener('click', runSqlQuery);
    document.getElementById('clear-results').addEventListener('click', clearSqlResults);
    document.getElementById('reset-db').addEventListener('click', resetDatabase);
}

// Load a module
async function loadModule(moduleName) {
    try {
        // Update current module
        currentModule = moduleName;
        
        // Update active menu item
        document.querySelectorAll('#sidebar-menu .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`#sidebar-menu .nav-link[data-module="${moduleName}"]`).classList.add('active');
        
        // Update page title
        const menuText = document.querySelector(`#sidebar-menu .nav-link[data-module="${moduleName}"]`).textContent.trim();
        document.getElementById('page-title').textContent = menuText;
        
        // Load module content
        const response = await fetch(`modules/${moduleName}.html`);
        if (!response.ok) {
            throw new Error(`Failed to load module: ${response.status} ${response.statusText}`);
        }
        
        const content = await response.text();
        document.getElementById('module-content').innerHTML = content;
        
        // Show/hide SQL playground based on module
        const showSqlPlayground = ["sql-basics", "joins", "exercises", "project"].includes(moduleName);
        document.getElementById('sql-playground').classList.toggle('d-none', !showSqlPlayground);
        
        // Apply syntax highlighting to code blocks
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
        
        // Add module completion button event listener
        const completeBtn = document.getElementById('complete-module-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => markModuleComplete(moduleName));
        }
        
        // Update UI based on completion status
        updateModuleUI(moduleName);
        
        // Update progress display
        updateProgressDisplay();
        
        // Update navigation buttons
        updateNavigationButtons();
        
        // Scroll to top
        window.scrollTo(0, 0);
    } catch (err) {
        console.error("Error loading module:", err);
        document.getElementById('module-content').innerHTML = `
            <div class="alert alert-danger">
                <h4>Error Loading Module</h4>
                <p>${err.message}</p>
                <p>Please try refreshing the page or contact support.</p>
            </div>
        `;
    }
}

// Mark a module as complete
function markModuleComplete(moduleName) {
    completedModules.add(moduleName);
    saveProgress();
    updateModuleUI(moduleName);
    updateProgressDisplay();
    
    // Auto-navigate to next module if not the last one
    const currentIndex = modules.indexOf(moduleName);
    if (currentIndex < modules.length - 1) {
        loadModule(modules[currentIndex + 1]);
    }
}

// Update module UI based on completion status
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
    
    // Update sidebar menu
    const menuItem = document.querySelector(`#sidebar-menu .nav-link[data-module="${moduleName}"]`);
    if (completedModules.has(moduleName)) {
        menuItem.innerHTML = menuItem.innerHTML.replace(/^([^<]*)/, "✓ $1");
    } else {
        menuItem.innerHTML = menuItem.innerHTML.replace(/^✓\s*/, "");
    }
}

// Update progress display
function updateProgressDisplay() {
    const total = modules.length;
    const completed = completedModules.size;
    const percentage = Math.round((completed / total) * 100);
    
    document.getElementById('progress-text').textContent = `${completed}/${total} completed`;
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
    progressBar.setAttribute('aria-valuenow', percentage);
}

// Update navigation buttons
function updateNavigationButtons() {
    const currentIndex = modules.indexOf(currentModule);
    
    // Previous button
    const prevBtn = document.getElementById('prev-btn');
    if (currentIndex <= 0) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }
    
    // Next button
    const nextBtn = document.getElementById('next-btn');
    if (currentIndex >= modules.length - 1) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

// Save progress to localStorage
function saveProgress() {
    localStorage.setItem('dbTraining_completedModules', JSON.stringify([...completedModules]));
}

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('dbTraining_completedModules');
    if (saved) {
        completedModules = new Set(JSON.parse(saved));
        updateProgressDisplay();
        
        // Update all module UIs
        modules.forEach(module => {
            const menuItem = document.querySelector(`#sidebar-menu .nav-link[data-module="${module}"]`);
            if (completedModules.has(module)) {
                menuItem.innerHTML = menuItem.innerHTML.replace(/^([^<]*)/, "✓ $1");
            } else {
                menuItem.innerHTML = menuItem.innerHTML.replace(/^✓\s*/, "");
            }
        });
    }
}

// Run SQL query
function runSqlQuery() {
    const query = document.getElementById('sql-query').value.trim();
    if (!query) {
        return;
    }
    
    try {
        // Execute the query
        const results = db.exec(query);
        
        // Display results
        displaySqlResults(results);
    } catch (err) {
        displaySqlError(err);
    }
}

// Display SQL results
function displaySqlResults(results) {
    const resultsDiv = document.getElementById('sql-results');
    
    if (!results || results.length === 0) {
        resultsDiv.innerHTML = `
            <div class="alert alert-success">
                Query executed successfully. No results returned.
            </div>
        `;
        return;
    }
    
    let output = '';
    
    results.forEach(result => {
        // Create table header
        output += '<table class="table table-striped table-bordered">';
        output += '<thead><tr>';
        result.columns.forEach(column => {
            output += `<th>${column}</th>`;
        });
        output += '</tr></thead>';
        
        // Create table body
        output += '<tbody>';
        result.values.forEach(row => {
            output += '<tr>';
            row.forEach(cell => {
                output += `<td>${cell === null ? 'NULL' : cell}</td>`;
            });
            output += '</tr>';
        });
        output += '</tbody>';
        output += '</table>';
    });
    
    resultsDiv.innerHTML = output;
}

// Display SQL error
function displaySqlError(err) {
    const resultsDiv = document.getElementById('sql-results');
    resultsDiv.innerHTML = `
        <div class="alert alert-danger">
            <h5>SQL Error</h5>
            <p>${err.message}</p>
        </div>
    `;
}

// Clear SQL results
function clearSqlResults() {
    document.getElementById('sql-results').innerHTML = `
        <div class="text-muted text-center py-5">
            No results to display. Run a query to see results here.
        </div>
    `;
    document.getElementById('sql-query').value = '';
}

// Initialize database schema
function initializeDatabase() {
    // Define schema creation SQL
    const schemaSql = `
        -- Create database tables
        CREATE TABLE IF NOT EXISTS customers (
            customer_id INTEGER PRIMARY KEY,
            customer_name TEXT NOT NULL,
            contact_person TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            created_date TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            product_id INTEGER PRIMARY KEY,
            product_name TEXT NOT NULL,
            category TEXT,
            unit_price REAL NOT NULL,
            unit_cost REAL NOT NULL,
            description TEXT,
            created_date TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sales (
            sale_id INTEGER PRIMARY KEY,
            customer_id INTEGER,
            product_id INTEGER,
            sale_date TEXT NOT NULL,
            quantity REAL NOT NULL,
            total_amount REAL NOT NULL,
            cost REAL,
            profit REAL,
            FOREIGN KEY (customer_id) REFERENCES customers (customer_id),
            FOREIGN KEY (product_id) REFERENCES products (product_id)
        );

        CREATE TABLE IF NOT EXISTS drivers (
            driver_id INTEGER PRIMARY KEY,
            driver_name TEXT NOT NULL,
            license_number TEXT,
            hire_date TEXT,
            status TEXT CHECK(status IN ('Active', 'Inactive', 'On Leave')),
            created_date TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS deliveries (
            delivery_id INTEGER PRIMARY KEY,
            sale_id INTEGER,
            driver_id INTEGER,
            delivery_date TEXT,
            status TEXT CHECK(status IN ('Scheduled', 'In Transit', 'Delivered', 'Failed')),
            notes TEXT,
            FOREIGN KEY (sale_id) REFERENCES sales (sale_id),
            FOREIGN KEY (driver_id) REFERENCES drivers (driver_id)
        );
    `;
    
    // Execute schema creation
    db.exec(schemaSql);
    
    // Insert sample data
    insertSampleData();
}

// Insert sample data
function insertSampleData() {
    // Customer data
    const customerData = `
        INSERT INTO customers (customer_id, customer_name, contact_person, email, phone, address, city, state, zip_code)
        VALUES
        (1, 'Acme Trucking', 'John Doe', 'john.doe@acmetrucking.com', '555-123-4567', '123 Main St', 'Denver', 'CO', '80014'),
        (2, 'Mountain Delivery Services', 'Jane Smith', 'jane.smith@mountaindelivery.com', '555-987-6543', '456 Pine Ave', 'Boulder', 'CO', '80302'),
        (3, 'Western Freight LLC', 'Bob Johnson', 'bob@westernfreight.com', '555-456-7890', '789 Oak Blvd', 'Fort Collins', 'CO', '80525'),
        (4, 'Rocky Mountain Transport', 'Sarah Williams', 'sarah@rmtransport.com', '555-789-0123', '101 River Rd', 'Pueblo', 'CO', '81001'),
        (5, 'Colorado Express', 'Mike Brown', 'mike@coloradoexpress.com', '555-321-6547', '202 Mountain View Dr', 'Colorado Springs', 'CO', '80903');
    `;
    
    // Product data
    const productData = `
        INSERT INTO products (product_id, product_name, category, unit_price, unit_cost, description)
        VALUES
        (1, 'Regular Unleaded Gasoline', 'Fuel', 3.45, 2.75, '87 octane unleaded gasoline'),
        (2, 'Premium Unleaded Gasoline', 'Fuel', 3.85, 3.15, '91 octane unleaded gasoline'),
        (3, 'Diesel Fuel', 'Fuel', 3.65, 2.95, 'Standard diesel fuel for trucks and equipment'),
        (4, 'Bio-Diesel Blend', 'Fuel', 3.75, 3.05, 'B20 bio-diesel blend'),
        (5, 'Engine Oil 10W-30', 'Lubricant', 25.99, 18.50, '5 quart container of 10W-30 engine oil'),
        (6, 'Transmission Fluid', 'Lubricant', 22.99, 16.25, 'Automatic transmission fluid, 1 gallon'),
        (7, 'Propane', 'Fuel', 2.99, 2.15, 'Propane by the gallon for heating and equipment');
    `;
    
    // Driver data
    const driverData = `
        INSERT INTO drivers (driver_id, driver_name, license_number, hire_date, status)
        VALUES
        (1, 'Michael Johnson', 'CDL12345CO', '2020-03-15', 'Active'),
        (2, 'Robert Garcia', 'CDL67890CO', '2018-07-22', 'Active'),
        (3, 'David Martinez', 'CDL24680CO', '2021-01-10', 'Active'),
        (4, 'James Wilson', 'CDL13579CO', '2019-05-03', 'On Leave'),
        (5, 'Thomas Anderson', 'CDL97531CO', '2017-11-28', 'Active'),
        (6, 'Christopher Lee', 'CDL86420CO', '2022-02-14', 'Active'),
        (7, 'Daniel Brown', 'CDL11223CO', '2020-09-01', 'Inactive');
    `;
    
    // Sales data
    const salesData = `
        INSERT INTO sales (sale_id, customer_id, product_id, sale_date, quantity, total_amount)
        VALUES
        (1, 1, 3, '2024-05-15', 500, 1825.00),
        (2, 2, 1, '2024-05-16', 350, 1207.50),
        (3, 3, 3, '2024-05-17', 800, 2920.00),
        (4, 4, 2, '2024-05-18', 200, 770.00),
        (5, 5, 3, '2024-05-19', 600, 2190.00);
    `;
    
    // Execute inserts
    try {
        db.exec(customerData);
        db.exec(productData);
        db.exec(driverData);
        db.exec(salesData);
        
        // Update cost and profit in sales
        db.exec(`
            -- Update cost
            UPDATE sales
            SET cost = (
                SELECT p.unit_cost * sales.quantity
                FROM products p
                WHERE p.product_id = sales.product_id
            );

            -- Update profit
            UPDATE sales
            SET profit = total_amount - cost;
        `);
        
        console.log("Sample data inserted successfully");
    } catch (err) {
        console.error("Error inserting sample data:", err);
    }
}

// Reset database
function resetDatabase() {
    if (confirm("Are you sure you want to reset the database? This will delete all your data and restore the initial sample data.")) {
        // Drop all tables
        try {
            db.exec("DROP TABLE IF EXISTS deliveries;");
            db.exec("DROP TABLE IF EXISTS sales;");
            db.exec("DROP TABLE IF EXISTS customers;");
            db.exec("DROP TABLE IF EXISTS products;");
            db.exec("DROP TABLE IF EXISTS drivers;");
            
            // Reinitialize the database
            initializeDatabase();
            
            // Clear results
            clearSqlResults();
            
            alert("Database has been reset successfully.");
        } catch (err) {
            console.error("Error resetting database:", err);
            alert("Error resetting database: " + err.message);
        }
    }
}

// Initialize SQL.js
async function initSqlJs() {
    return new Promise((resolve, reject) => {
        // Create script element
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
        script.onload = function() {
            initSqlJsInternal()
                .then(resolve)
                .catch(reject);
        };
        script.onerror = function() {
            reject(new Error('Failed to load SQL.js script'));
        };
        document.head.appendChild(script);
    });
}

// Internal SQL.js initialization
async function initSqlJsInternal() {
    try {
        // Initialize SQL.js
        const sqlPromise = initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        
        const SQL = await sqlPromise;
        db = new SQL.Database();
        
        // Initialize schema
        initializeDatabase();
        
        console.log("SQL.js initialized successfully");
        return SQL;
    } catch (err) {
        console.error("Error initializing SQL.js:", err);
        alert("Failed to load SQL.js. The SQL playground may not work properly.");
        throw err;
    }
}
