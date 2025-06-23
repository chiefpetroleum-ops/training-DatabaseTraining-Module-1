# Interactive Database Training Script
# Created by True North Data Strategies
# Module 1: SQLite Database Setup and SQL Fundamentals

function Show-Header {
    param (
        [string]$Title
    )
    
    Clear-Host
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Menu {
    param (
        [string]$Title,
        [array]$Options
    )
    
    Show-Header -Title $Title
    
    for ($i = 0; $i -lt $Options.Count; $i++) {
        Write-Host "  $($i+1). $($Options[$i])" -ForegroundColor Yellow
    }
    
    Write-Host "  Q. Quit" -ForegroundColor Yellow
    Write-Host ""
    
    $selection = Read-Host "Select an option"
    
    if ($selection -eq "Q" -or $selection -eq "q") {
        return "Q"
    }
    
    try {
        $index = [int]$selection - 1
        if ($index -ge 0 -and $index -lt $Options.Count) {
            return $index
        }
        else {
            Write-Host "Invalid selection. Press any key to continue..." -ForegroundColor Red
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            return -1
        }
    }
    catch {
        Write-Host "Invalid selection. Press any key to continue..." -ForegroundColor Red
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return -1
    }
}

function Wait-ForKey {
    param (
        [string]$Message = "Press any key to continue..."
    )
    
    Write-Host ""
    Write-Host $Message -ForegroundColor Green
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Test-Prerequisites {
    Show-Header -Title "Checking Prerequisites"
    
    # Check if running as admin
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    Write-Host "✓ Admin Rights Check: " -NoNewline
    if ($isAdmin) {
        Write-Host "Running as administrator" -ForegroundColor Green
    } else {
        Write-Host "Not running as administrator" -ForegroundColor Yellow
        Write-Host "  Some operations may require administrator privileges." -ForegroundColor Yellow
    }
    
    # Check Python
    Write-Host "✓ Python Check: " -NoNewline
    try {
        $pythonVersion = python --version 2>&1
        Write-Host "$pythonVersion" -ForegroundColor Green
    } catch {
        Write-Host "Not installed" -ForegroundColor Red
        Write-Host "  Please install Python from https://www.python.org/downloads/" -ForegroundColor Red
        Write-Host "  Be sure to check 'Add Python to PATH' during installation" -ForegroundColor Red
        Wait-ForKey "Press any key to continue (but you'll need to install Python to complete the training)..."
    }
    
    # Check SQLite
    Write-Host "✓ SQLite Check: " -NoNewline
    $projectRoot = Split-Path -Parent $PSCommandPath
    $sqliteExe = Get-ChildItem -Path "$projectRoot\sqlite" -Filter "sqlite3.exe" -Recurse -ErrorAction SilentlyContinue | 
                Select-Object -First 1 -ExpandProperty FullName
    
    if ($sqliteExe) {
        Write-Host "Installed" -ForegroundColor Green
    } else {
        Write-Host "Not found" -ForegroundColor Yellow
        Write-Host "  SQLite will be downloaded as part of the setup process." -ForegroundColor Yellow
    }
    
    # Verify project structure
    Write-Host "✓ Project Structure: " -NoNewline
    $expectedDirs = @("data", "scripts", "docs", "json_data", "sqlite")
    $missingDirs = @()
    
    foreach ($dir in $expectedDirs) {
        if (-not (Test-Path "$projectRoot\$dir")) {
            $missingDirs += $dir
        }
    }
    
    if ($missingDirs.Count -eq 0) {
        Write-Host "Complete" -ForegroundColor Green
    } else {
        Write-Host "Incomplete" -ForegroundColor Yellow
        Write-Host "  Missing directories: $($missingDirs -join ', ')" -ForegroundColor Yellow
        Write-Host "  These will be created during setup." -ForegroundColor Yellow
    }
    
    Wait-ForKey
}

function Initialize-Environment {
    Show-Header -Title "Initializing Training Environment"
    
    $projectRoot = Split-Path -Parent $PSCommandPath
    Write-Host "Project root: $projectRoot" -ForegroundColor Yellow
    
    # Create project structure
    Write-Host "Creating project structure..." -ForegroundColor Yellow
    $directories = @(
        "data",
        "scripts",
        "docs",
        "json_data",
        "sqlite"
    )
    
    foreach ($dir in $directories) {
        $path = Join-Path -Path $projectRoot -ChildPath $dir
        if (-not (Test-Path $path)) {
            New-Item -ItemType Directory -Path $path -Force | Out-Null
            Write-Host "  Created: $dir" -ForegroundColor Green
        } else {
            Write-Host "  Already exists: $dir" -ForegroundColor Gray
        }
    }
    
    # Download SQLite if needed
    $sqliteExe = Get-ChildItem -Path "$projectRoot\sqlite" -Filter "sqlite3.exe" -Recurse -ErrorAction SilentlyContinue | 
                Select-Object -First 1 -ExpandProperty FullName
    
    if (-not $sqliteExe) {
        Write-Host "Downloading SQLite..." -ForegroundColor Yellow
        $sqliteUrl = "https://www.sqlite.org/2023/sqlite-tools-win32-x86-3410200.zip"
        $sqliteZip = "$projectRoot\sqlite\sqlite.zip"
        
        try {
            Invoke-WebRequest -Uri $sqliteUrl -OutFile $sqliteZip
            Write-Host "  Download complete" -ForegroundColor Green
            
            Write-Host "Extracting SQLite..." -ForegroundColor Yellow
            Expand-Archive -Path $sqliteZip -DestinationPath "$projectRoot\sqlite" -Force
            Remove-Item $sqliteZip
            Write-Host "  Extraction complete" -ForegroundColor Green
        } catch {
            Write-Host "  Error downloading or extracting SQLite: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "SQLite already installed" -ForegroundColor Gray
    }
    
    # Install required Python packages
    Write-Host "Installing required Python packages..." -ForegroundColor Yellow
    try {
        python -m pip install --upgrade pip
        python -m pip install pandas numpy matplotlib seaborn jupyter
        Write-Host "  Python packages installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "  Error installing Python packages: $_" -ForegroundColor Red
    }
    
    # Create scripts
    Write-Host "Creating necessary scripts and files..." -ForegroundColor Yellow
    
    # Data cleaning script
    $dataCleaningScript = @"
import pandas as pd
import os

# Set paths
project_root = r'$projectRoot'.replace('\\', '\\\\')
data_path = os.path.join(project_root, 'data', 'sales_data.csv')
clean_data_path = os.path.join(project_root, 'data', 'sales_data_clean.csv')

# Load the data
print('Loading data...')
try:
    df = pd.read_csv(data_path)
    print('Data loaded successfully!')
    print(f'Original data shape: {df.shape}')
    
    # Display the first few rows
    print('\nFirst 5 rows of original data:')
    print(df.head())
    
    # Check for missing values
    print('\nMissing values per column:')
    print(df.isnull().sum())
    
    # Basic data cleaning
    # Remove any completely empty rows
    df = df.dropna(how='all')
    
    # Handling date columns (assuming there's a date column)
    date_columns = df.filter(like='date').columns
    for col in date_columns:
        df[col] = pd.to_datetime(df[col], errors='coerce')
    
    # Convert any numeric columns that might be stored as strings
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            except:
                pass
    
    # Save the cleaned data
    df.to_csv(clean_data_path, index=False)
    print(f'\nCleaned data saved to: {clean_data_path}')
    print(f'Cleaned data shape: {df.shape}')
    
except Exception as e:
    print(f'Error processing data: {e}')
"@

    $dataCleaningScript | Out-File -FilePath "$projectRoot\scripts\clean_data.py" -Encoding utf8
    
    # Database schema
    $dbSetupScript = @"
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
"@

    $dbSetupScript | Out-File -FilePath "$projectRoot\scripts\create_database.sql" -Encoding utf8
    
    # JSON sample data
    $customersJson = @"
[
  {
    "customer_id": 1,
    "customer_name": "Acme Trucking",
    "contact_person": "John Doe",
    "email": "john.doe@acmetrucking.com",
    "phone": "555-123-4567",
    "address": "123 Main St",
    "city": "Denver",
    "state": "CO",
    "zip_code": "80014"
  },
  {
    "customer_id": 2,
    "customer_name": "Mountain Delivery Services",
    "contact_person": "Jane Smith",
    "email": "jane.smith@mountaindelivery.com",
    "phone": "555-987-6543",
    "address": "456 Pine Ave",
    "city": "Boulder",
    "state": "CO",
    "zip_code": "80302"
  },
  {
    "customer_id": 3,
    "customer_name": "Western Freight LLC",
    "contact_person": "Bob Johnson",
    "email": "bob@westernfreight.com",
    "phone": "555-456-7890",
    "address": "789 Oak Blvd",
    "city": "Fort Collins",
    "state": "CO",
    "zip_code": "80525"
  },
  {
    "customer_id": 4,
    "customer_name": "Rocky Mountain Transport",
    "contact_person": "Sarah Williams",
    "email": "sarah@rmtransport.com",
    "phone": "555-789-0123",
    "address": "101 River Rd",
    "city": "Pueblo",
    "state": "CO",
    "zip_code": "81001"
  },
  {
    "customer_id": 5,
    "customer_name": "Colorado Express",
    "contact_person": "Mike Brown",
    "email": "mike@coloradoexpress.com",
    "phone": "555-321-6547",
    "address": "202 Mountain View Dr",
    "city": "Colorado Springs",
    "state": "CO",
    "zip_code": "80903"
  }
]
"@

    $customersJson | Out-File -FilePath "$projectRoot\json_data\customers.json" -Encoding utf8
    
    # Products JSON
    $productsJson = @"
[
  {
    "product_id": 1,
    "product_name": "Regular Unleaded Gasoline",
    "category": "Fuel",
    "unit_price": 3.45,
    "unit_cost": 2.75,
    "description": "87 octane unleaded gasoline"
  },
  {
    "product_id": 2,
    "product_name": "Premium Unleaded Gasoline",
    "category": "Fuel",
    "unit_price": 3.85,
    "unit_cost": 3.15,
    "description": "91 octane unleaded gasoline"
  },
  {
    "product_id": 3,
    "product_name": "Diesel Fuel",
    "category": "Fuel",
    "unit_price": 3.65,
    "unit_cost": 2.95,
    "description": "Standard diesel fuel for trucks and equipment"
  },
  {
    "product_id": 4,
    "product_name": "Bio-Diesel Blend",
    "category": "Fuel",
    "unit_price": 3.75,
    "unit_cost": 3.05,
    "description": "B20 bio-diesel blend"
  },
  {
    "product_id": 5,
    "product_name": "Engine Oil 10W-30",
    "category": "Lubricant",
    "unit_price": 25.99,
    "unit_cost": 18.50,
    "description": "5 quart container of 10W-30 engine oil"
  },
  {
    "product_id": 6,
    "product_name": "Transmission Fluid",
    "category": "Lubricant",
    "unit_price": 22.99,
    "unit_cost": 16.25,
    "description": "Automatic transmission fluid, 1 gallon"
  },
  {
    "product_id": 7,
    "product_name": "Propane",
    "category": "Fuel",
    "unit_price": 2.99,
    "unit_cost": 2.15,
    "description": "Propane by the gallon for heating and equipment"
  }
]
"@

    $productsJson | Out-File -FilePath "$projectRoot\json_data\products.json" -Encoding utf8
    
    # Drivers JSON
    $driversJson = @"
[
  {
    "driver_id": 1,
    "driver_name": "Michael Johnson",
    "license_number": "CDL12345CO",
    "hire_date": "2020-03-15",
    "status": "Active"
  },
  {
    "driver_id": 2,
    "driver_name": "Robert Garcia",
    "license_number": "CDL67890CO",
    "hire_date": "2018-07-22",
    "status": "Active"
  },
  {
    "driver_id": 3,
    "driver_name": "David Martinez",
    "license_number": "CDL24680CO",
    "hire_date": "2021-01-10",
    "status": "Active"
  },
  {
    "driver_id": 4,
    "driver_name": "James Wilson",
    "license_number": "CDL13579CO",
    "hire_date": "2019-05-03",
    "status": "On Leave"
  },
  {
    "driver_id": 5,
    "driver_name": "Thomas Anderson",
    "license_number": "CDL97531CO",
    "hire_date": "2017-11-28",
    "status": "Active"
  },
  {
    "driver_id": 6,
    "driver_name": "Christopher Lee",
    "license_number": "CDL86420CO",
    "hire_date": "2022-02-14",
    "status": "Active"
  },
  {
    "driver_id": 7,
    "driver_name": "Daniel Brown",
    "license_number": "CDL11223CO",
    "hire_date": "2020-09-01",
    "status": "Inactive"
  }
]
"@

    $driversJson | Out-File -FilePath "$projectRoot\json_data\drivers.json" -Encoding utf8
    
    # Import JSON script
    $importJsonScript = @"
import json
import sqlite3
import os

# Set paths
project_root = r'$projectRoot'.replace('\\', '\\\\')
db_path = os.path.join(project_root, 'data', 'petroleum_sales.db')
json_dir = os.path.join(project_root, 'json_data')

def import_json_to_sqlite(json_file, table_name):
    """Import data from a JSON file to a SQLite table"""
    print(f'Importing {json_file} to {table_name}...')
    
    # Load JSON data
    with open(os.path.join(json_dir, json_file), 'r') as f:
        data = json.load(f)
    
    if not data:
        print(f'No data found in {json_file}')
        return
    
    # Connect to SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get the first item's keys to use as column names
    columns = list(data[0].keys())
    
    # Insert data into table
    for item in data:
        placeholders = ', '.join(['?'] * len(item))
        columns_str = ', '.join(columns)
        values = [item[column] for column in columns]
        
        query = f'INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})'
        cursor.execute(query, values)
    
    # Commit and close
    conn.commit()
    print(f'Successfully imported {len(data)} records to {table_name}')
    conn.close()

# Import all JSON files
try:
    # Import customers data
    import_json_to_sqlite('customers.json', 'customers')
    
    # Import products data
    import_json_to_sqlite('products.json', 'products')
    
    # Import drivers data
    import_json_to_sqlite('drivers.json', 'drivers')
    
    print('All JSON data imported successfully!')
    
except Exception as e:
    print(f'Error importing JSON data: {e}')
"@

    $importJsonScript | Out-File -FilePath "$projectRoot\scripts\import_json_data.py" -Encoding utf8
    
    # Add column script
    $addColumnScript = @"
import sqlite3
import os

# Set paths
project_root = r'$projectRoot'.replace('\\', '\\\\')
db_path = os.path.join(project_root, 'data', 'petroleum_sales.db')

def add_column_to_table(table_name, column_name, column_type):
    """Add a new column to an existing table"""
    print(f'Adding column {column_name} to {table_name}...')
    
    # Connect to SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [info[1] for info in cursor.fetchall()]
        
        if column_name in columns:
            print(f'Column {column_name} already exists in {table_name}')
        else:
            # Add the new column
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")
            conn.commit()
            print(f'Column {column_name} added successfully to {table_name}')
    
    except Exception as e:
        print(f'Error adding column: {e}')
    
    finally:
        conn.close()

# Example: Add a cost column to the sales table
add_column_to_table('sales', 'cost', 'REAL')

# Example: Add a profit column to the sales table
add_column_to_table('sales', 'profit', 'REAL')

print('Column addition completed!')
"@

    $addColumnScript | Out-File -FilePath "$projectRoot\scripts\add_column.py" -Encoding utf8
    
    # Import Sales Data Script
    $importSalesDataScript = @"
import sqlite3
import csv
import os

# Set paths
project_root = r'$projectRoot'.replace('\\', '\\\\')
db_path = os.path.join(project_root, 'data', 'petroleum_sales.db')
data_path = os.path.join(project_root, 'data', 'sales_data_clean.csv')

def import_sales_data():
    """Import data from the cleaned CSV into the sales table"""
    print(f'Importing sales data from {data_path}...')
    
    # Connect to SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # First, let's read the CSV file
        with open(data_path, 'r') as f:
            reader = csv.DictReader(f)
            sales_data = []
            
            for row in reader:
                # This is a simplified example. In practice, you'd need to:
                # 1. Look up customer_id based on customer name
                # 2. Look up product_id based on product name
                # 3. Format the date correctly
                
                # Get customer_id from customer_name
                cursor.execute("SELECT customer_id FROM customers WHERE customer_name = ?", (row.get('Customer', ''),))
                customer_result = cursor.fetchone()
                customer_id = customer_result[0] if customer_result else None
                
                # Get product_id from product_name
                cursor.execute("SELECT product_id FROM products WHERE product_name = ?", (row.get('Product', ''),))
                product_result = cursor.fetchone()
                product_id = product_result[0] if product_result else None
                
                # Add to sales data
                if customer_id and product_id:
                    sales_data.append({
                        'customer_id': customer_id,
                        'product_id': product_id,
                        'sale_date': row.get('Date', ''),
                        'quantity': float(row.get('Quantity', 0)),
                        'total_amount': float(row.get('Total', 0))
                    })
            
            # Insert sales data
            for sale in sales_data:
                cursor.execute('''
                    INSERT INTO sales (customer_id, product_id, sale_date, quantity, total_amount)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    sale['customer_id'],
                    sale['product_id'],
                    sale['sale_date'],
                    sale['quantity'],
                    sale['total_amount']
                ))
            
            conn.commit()
            print(f'Successfully imported {len(sales_data)} sales records')
    
    except Exception as e:
        print(f'Error importing sales data: {e}')
    
    finally:
        conn.close()

# Import the sales data
import_sales_data()
"@

    $importSalesDataScript | Out-File -FilePath "$projectRoot\scripts\import_sales_data.py" -Encoding utf8
    
    # Create sample sales data if needed
    if (-not (Test-Path "$projectRoot\data\sales_data.csv")) {
        @"
Date,Customer,Product,Quantity,Price,Total
2024-01-15,Acme Trucking,Diesel Fuel,500,3.65,1825.00
2024-01-16,Mountain Delivery Services,Regular Unleaded Gasoline,350,3.45,1207.50
2024-01-17,Western Freight LLC,Diesel Fuel,800,3.65,2920.00
2024-01-18,Rocky Mountain Transport,Premium Unleaded Gasoline,200,3.85,770.00
2024-01-19,Colorado Express,Diesel Fuel,600,3.65,2190.00
"@ | Out-File -FilePath "$projectRoot\data\sales_data.csv" -Encoding utf8
        Write-Host "  Created sample sales data" -ForegroundColor Green
    }
    
    # Create the SQLite database
    $sqliteExe = Get-ChildItem -Path "$projectRoot\sqlite" -Filter "sqlite3.exe" -Recurse -ErrorAction SilentlyContinue | 
                Select-Object -First 1 -ExpandProperty FullName
    
    if ($sqliteExe) {
        $dbPath = "$projectRoot\data\petroleum_sales.db"
        
        # Create an empty file first if it doesn't exist
        if (-not (Test-Path $dbPath)) {
            New-Item -ItemType File -Path $dbPath -Force | Out-Null
            
            # Execute the SQL script
            Write-Host "Creating database schema..." -ForegroundColor Yellow
            cmd /c "$sqliteExe $dbPath < $projectRoot\scripts\create_database.sql"
            Write-Host "  Database created successfully" -ForegroundColor Green
        } else {
            Write-Host "Database already exists" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "Environment initialization complete!" -ForegroundColor Green
    
    Wait-ForKey
}

function Show-DatabaseConcepts {
    Show-Header -Title "Database Concepts"
    
    Write-Host "What are databases?" -ForegroundColor Yellow
    Write-Host "A database is an organized collection of structured information, or data, typically stored electronically in a computer system."
    Write-Host "Databases are designed to store, retrieve, and manage data efficiently."
    Write-Host ""
    
    Write-Host "Key database concepts:" -ForegroundColor Yellow
    Write-Host "1. Tables - Collections of related data organized in rows and columns"
    Write-Host "2. Records - Individual entries in a table (rows)"
    Write-Host "3. Fields - Specific pieces of information in a record (columns)"
    Write-Host "4. Primary Keys - Unique identifiers for each record"
    Write-Host "5. Foreign Keys - Fields that link to primary keys in other tables"
    Write-Host "6. Relationships - Connections between tables through keys"
    Write-Host "7. SQL - Structured Query Language used to interact with databases"
    Write-Host ""
    
    Write-Host "Database Types:" -ForegroundColor Yellow
    Write-Host "1. Relational Databases (SQLite, MySQL, PostgreSQL, SQL Server, Oracle)"
    Write-Host "   - Organize data in tables with relationships between them"
    Write-Host "   - Use SQL for queries"
    Write-Host "   - Strong consistency and reliability"
    Write-Host ""
    Write-Host "2. NoSQL Databases (MongoDB, Cassandra, Redis)"
    Write-Host "   - Various data models: document, key-value, graph, etc."
    Write-Host "   - Often more flexible schema"
    Write-Host "   - Designed for specific use cases and scalability"
    Write-Host ""
    
    Write-Host "In this training, we'll focus on SQLite:" -ForegroundColor Yellow
    Write-Host "- Lightweight, serverless database engine"
    Write-Host "- Self-contained, high reliability"
    Write-Host "- Zero configuration - no setup or administration needed"
    Write-Host "- Cross-platform and widely used in applications"
    Write-Host "- Perfect for learning database concepts and SQL"
    Write-Host ""
    
    Wait-ForKey
}

function Show-ModuleGoals {
    Show-Header -Title "Module 1 Goals"
    
    Write-Host "By the end of this module, you will be able to:" -ForegroundColor Yellow
    Write-Host "1. Set up a local SQLite database"
    Write-Host "2. Create database tables with relationships"
    Write-Host "3. Import data from CSV and JSON files"
    Write-Host "4. Write basic SQL queries to retrieve and filter data"
    Write-Host "5. Join tables to create comprehensive reports"
    Write-Host "6. Create views for common queries"
    Write-Host "7. Calculate business metrics using SQL"
    Write-Host ""
    
    Write-Host "Our Example Project:" -ForegroundColor Yellow
    Write-Host "We'll be building a petroleum sales database for a fictional fuel distributor."
    Write-Host "This database will track:"
    Write-Host "- Customers who purchase fuel"
    Write-Host "- Products (different types of fuel and lubricants)"
    Write-Host "- Sales transactions"
    Write-Host "- Delivery drivers"
    Write-Host "- Delivery records"
    Write-Host ""
    
    Write-Host "This practical example will demonstrate real-world database applications while teaching fundamental concepts." -ForegroundColor Green
    
    Wait-ForKey
}

function Import-DataActivity {
    Show-Header -Title "Data Import and Cleaning"
    
    $projectRoot = Split-Path -Parent $PSCommandPath
    
    Write-Host "In this activity, we'll:" -ForegroundColor Yellow
    Write-Host "1. Clean and analyze the sales data CSV"
    Write-Host "2. Import JSON data for customers, products, and drivers"
    Write-Host "3. Import the cleaned sales data into our database"
    Write-Host "4. Add custom columns for business calculations"
    Write-Host ""
    
    # First, run the data cleaning script
    Write-Host "Step 1: Cleaning the CSV data" -ForegroundColor Yellow
    Write-Host "Running: python $projectRoot\scripts\clean_data.py"
    Write-Host "This script will:"
    Write-Host "- Load the CSV data"
    Write-Host "- Check for missing values"
    Write-Host "- Convert date columns to proper format"
    Write-Host "- Convert numeric columns from strings if needed"
    Write-Host "- Save a cleaned version of the data"
    Write-Host ""
    
    $runCleaning = Read-Host "Run the data cleaning script now? (Y/N)"
    if ($runCleaning -eq "Y" -or $runCleaning -eq "y") {
        Write-Host "Running data cleaning script..." -ForegroundColor Gray
        python "$projectRoot\scripts\clean_data.py"
        Write-Host ""
    }
    
    # Import JSON data
    Write-Host "Step 2: Importing JSON data" -ForegroundColor Yellow
    Write-Host "Running: python $projectRoot\scripts\import_json_data.py"
    Write-Host "This script will:"
    Write-Host "- Load JSON data for customers, products, and drivers"
    Write-Host "- Insert the data into the appropriate tables"
    Write-Host ""
    
    $runImportJSON = Read-Host "Run the JSON import script now? (Y/N)"
    if ($runImportJSON -eq "Y" -or $runImportJSON -eq "y") {
        Write-Host "Running JSON import script..." -ForegroundColor Gray
        python "$projectRoot\scripts\import_json_data.py"
        Write-Host ""
    }
    
    # Import sales data
    Write-Host "Step 3: Importing cleaned sales data" -ForegroundColor Yellow
    Write-Host "Running: python $projectRoot\scripts\import_sales_data.py"
    Write-Host "This script will:"
    Write-Host "- Read the cleaned sales data CSV"
    Write-Host "- Match customer names to customer IDs"
    Write-Host "- Match product names to product IDs"
    Write-Host "- Insert the sales records into the sales table"
    Write-Host ""
    
    $runImportSales = Read-Host "Run the sales import script now? (Y/N)"
    if ($runImportSales -eq "Y" -or $runImportSales -eq "y") {
        Write-Host "Running sales import script..." -ForegroundColor Gray
        python "$projectRoot\scripts\import_sales_data.py"
        Write-Host ""
    }
    
    # Add columns
    Write-Host "Step 4: Adding custom columns" -ForegroundColor Yellow
    Write-Host "Running: python $projectRoot\scripts\add_column.py"
    Write-Host "This script will:"
    Write-Host "- Add a 'cost' column to the sales table"
    Write-Host "- Add a 'profit' column to the sales table"
    Write-Host "- These columns will be used for business calculations later"
    Write-Host ""
    
    $runAddColumns = Read-Host "Run the add columns script now? (Y/N)"
    if ($runAddColumns -eq "Y" -or $runAddColumns -eq "y") {
        Write-Host "Running add columns script..." -ForegroundColor Gray
        python "$projectRoot\scripts\add_column.py"
        Write-Host ""
    }
    
    Write-Host "Data import activities completed!" -ForegroundColor Green
    Write-Host "Now our database has:"
    Write-Host "- Customer information"
    Write-Host "- Product catalog with prices and costs"
    Write-Host "- Driver information"
    Write-Host "- Sales transactions"
    Write-Host "- Custom columns for business calculations"
    Write-Host ""
    
    Wait-ForKey
}

function Learn-SQLBasics {
    Show-Header -Title "SQL Basics"
    
    $projectRoot = Split-Path -Parent $PSCommandPath
    $sqliteExe = Get-ChildItem -Path "$projectRoot\sqlite" -Filter "sqlite3.exe" -Recurse -ErrorAction SilentlyContinue | 
                Select-Object -First 1 -ExpandProperty FullName
    $dbPath = "$projectRoot\data\petroleum_sales.db"
    
    Write-Host "SQL (Structured Query Language) is the standard language for working with databases." -ForegroundColor Yellow
    Write-Host "Let's learn some basic SQL commands using our SQLite database."
    Write-Host ""
    
    Write-Host "First, let's open SQLite:" -ForegroundColor Yellow
    Write-Host "$sqliteExe $dbPath"
    Write-Host ""
    Write-Host "Once SQLite is open, try these commands:" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1. Listing all tables:" -ForegroundColor Cyan
    Write-Host ".tables"
    Write-Host ""
    
    Write-Host "2. Viewing table structure:" -ForegroundColor Cyan
    Write-Host ".schema customers"
    Write-Host ""
    
    Write-Host "3. Setting up better output formatting:" -ForegroundColor Cyan
    Write-Host ".mode column"
    Write-Host ".headers on"
    Write-Host ""
    
    Write-Host "4. Basic SELECT query - View all customers:" -ForegroundColor Cyan
    Write-Host "SELECT * FROM customers;"
    Write-Host ""
    
    Write-Host "5. Filtering data with WHERE - Find all fuel products:" -ForegroundColor Cyan
    Write-Host "SELECT * FROM products WHERE category = 'Fuel';"
    Write-Host ""
    
    Write-Host "6. Sorting data - List drivers by hire date:" -ForegroundColor Cyan
    Write-Host "SELECT driver_name, hire_date FROM drivers ORDER BY hire_date DESC;"
    Write-Host ""
    
    Write-Host "7. Counting records - How many products do we have?" -ForegroundColor Cyan
    Write-Host "SELECT COUNT(*) AS product_count FROM products;"
    Write-Host ""
    
    Write-Host "8. Exit SQLite:" -ForegroundColor Cyan
    Write-Host ".exit"
    Write-Host ""
    
    $runSQLite = Read-Host "Open SQLite now to try these commands? (Y/N)"
    if ($runSQLite -eq "Y" -or $runSQLite -eq "y") {
        Write-Host "Opening SQLite..." -ForegroundColor Gray
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c $sqliteExe $dbPath && pause"
    }
    
    Wait-ForKey
}

function Learn-JoinsAndRelationships {
    Show-Header -Title "SQL Joins and Relationships"
    
    $projectRoot = Split-Path -Parent $PSCommandPath
    $sqliteExe = Get-ChildItem -Path "$projectRoot\sqlite" -Filter "sqlite3.exe" -Recurse -ErrorAction SilentlyContinue | 
                Select-Object -First 1 -ExpandProperty FullName
    $dbPath = "$projectRoot\data\petroleum_sales.db"
    
    Write-Host "One of the most powerful features of relational databases is the ability to join tables." -ForegroundColor Yellow
    Write-Host "Joins allow us to combine data from multiple related tables."
    Write-Host ""
    
    Write-Host "Our database has these relationships:" -ForegroundColor Yellow
    Write-Host "- Sales link to Customers via customer_id"
    Write-Host "- Sales link to Products via product_id"
    Write-Host "- Deliveries link to Sales via sale_id"
    Write-Host "- Deliveries link to Drivers via driver_id"
    Write-Host ""
    
    Write-Host "Let's try some JOIN queries:" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1. Basic JOIN - Sales with Customer Names:" -ForegroundColor Cyan
    Write-Host @"
SELECT 
    s.sale_id, 
    c.customer_name, 
    s.sale_date, 
    s.total_amount
FROM 
    sales s
JOIN 
    customers c ON s.customer_id = c.customer_id;
"@
    Write-Host ""
    
    Write-Host "2. Multiple JOINs - Sales with Customer and Product Details:" -ForegroundColor Cyan
    Write-Host @"
SELECT 
    s.sale_id, 
    c.customer_name, 
    p.product_name,
    s.quantity,
    s.total_amount
FROM 
    sales s
JOIN 
    customers c ON s.customer_id = c.customer_id
JOIN 
    products p ON s.product_id = p.product_id;
"@
    Write-Host ""
    
    Write-Host "3. Adding Calculated Fields - Sales with Profit:" -ForegroundColor Cyan
    Write-Host @"
-- First, update the cost column based on product unit cost and quantity
UPDATE sales
SET cost = (
    SELECT p.unit_cost * sales.quantity
    FROM products p
    WHERE p.product_id = sales.product_id
);

-- Then, calculate and update profit
UPDATE sales
SET profit = total_amount - cost;

-- Now query with the calculated fields
SELECT 
    s.sale_id, 
    c.customer_name, 
    p.product_name,
    s.quantity,
    s.total_amount,
    s.cost,
    s.profit,
    ROUND((s.profit / s.total_amount) * 100, 2) AS profit_margin_percent
FROM 
    sales s
JOIN 
    customers c ON s.customer_id = c.customer_id
JOIN 
    products p ON s.product_id = p.product_id;
"@
    Write-Host ""
    
    Write-Host "4. Creating a View - Sales Report:" -ForegroundColor Cyan
    Write-Host @"
-- Create a view for our sales report
CREATE VIEW sales_report AS
SELECT 
    s.sale_id,
    s.sale_date,
    c.customer_name,
    p.product_name,
    p.category,
    s.quantity,
    s.total_amount,
    s.cost,
    s.profit,
    ROUND((s.profit / s.total_amount) * 100, 2) AS profit_margin_percent
FROM 
    sales s
JOIN 
    customers c ON s.customer_id = c.customer_id
JOIN 
    products p ON s.product_id = p.product_id;

-- Query the view
SELECT * FROM sales_report;
"@
    Write-Host ""
    
    Write-Host "5. Aggregate Queries - Sales by Product Category:" -ForegroundColor Cyan
    Write-Host @"
SELECT 
    p.category,
    SUM(s.quantity) AS total_quantity,
    SUM(s.total_amount) AS total_revenue,
    SUM(s.profit) AS total_profit,
    ROUND(AVG(s.profit / s.total_amount) * 100, 2) AS avg_profit_margin
FROM 
    sales s
JOIN 
    products p ON s.product_id = p.product_id
GROUP BY 
    p.category
ORDER BY 
    total_profit DESC;
"@
    Write-Host ""
    
    $runSQLite = Read-Host "Open SQLite now to try these JOIN queries? (Y/N)"
    if ($runSQLite -eq "Y" -or $runSQLite -eq "y") {
        Write-Host "Opening SQLite..." -ForegroundColor Gray
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c $sqliteExe $dbPath && pause"
    }
    
    Wait-ForKey
}

function Practice-SQLExercises {
    Show-Header -Title "SQL Practice Exercises"
    
    $projectRoot = Split-Path -Parent $PSCommandPath
    $sqliteExe = Get-ChildItem -Path "$projectRoot\sqlite" -Filter "sqlite3.exe" -Recurse -ErrorAction SilentlyContinue | 
                Select-Object -First 1 -ExpandProperty FullName
    $dbPath = "$projectRoot\data\petroleum_sales.db"
    
    Write-Host "Let's practice with some SQL exercises." -ForegroundColor Yellow
    Write-Host "Try these challenges yourself, then check the solutions."
    Write-Host ""
    
    Write-Host "Exercise 1: Basic Queries" -ForegroundColor Cyan
    Write-Host "1. List all customers in Colorado Springs"
    Write-Host "2. Find all products with a unit price greater than $3.50"
    Write-Host "3. List all active drivers hired after 2019"
    Write-Host ""
    
    Write-Host "Exercise 2: Joins and Relationships" -ForegroundColor Cyan
    Write-Host "1. List all sales of Diesel Fuel, showing customer name, date, and quantity"
    Write-Host "2. Calculate the total sales amount for each customer"
    Write-Host "3. Find the most popular product by total quantity sold"
    Write-Host ""
    
    Write-Host "Exercise 3: Business Intelligence" -ForegroundColor Cyan
    Write-Host "1. Calculate the profit margin for each product category"
    Write-Host "2. Find the customer with the highest total purchases"
    Write-Host "3. Calculate monthly sales totals for 2024"
    Write-Host ""
    
    Write-Host "Solutions:" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Exercise 1 Solutions:" -ForegroundColor Cyan
    Write-Host "1. List all customers in Colorado Springs"
    Write-Host "   SELECT * FROM customers WHERE city = 'Colorado Springs';"
    Write-Host ""
    Write-Host "2. Find all products with a unit price greater than $3.50"
    Write-Host "   SELECT * FROM products WHERE unit_price > 3.50;"
    Write-Host ""
    Write-Host "3. List all active drivers hired after 2019"
    Write-Host "   SELECT * FROM drivers WHERE status = 'Active' AND hire_date >= '2020-01-01';"
    Write-Host ""
    
    Write-Host "Exercise 2 Solutions:" -ForegroundColor Cyan
    Write-Host "1. List all sales of Diesel Fuel"
    Write-Host @"
   SELECT 
       c.customer_name, 
       s.sale_date, 
       s.quantity 
   FROM 
       sales s
   JOIN 
       customers c ON s.customer_id = c.customer_id
   JOIN 
       products p ON s.product_id = p.product_id
   WHERE 
       p.product_name = 'Diesel Fuel';
"@
    Write-Host ""
    Write-Host "2. Calculate the total sales amount for each customer"
    Write-Host @"
   SELECT 
       c.customer_name, 
       SUM(s.total_amount) AS total_purchases 
   FROM 
       sales s
   JOIN 
       customers c ON s.customer_id = c.customer_id
   GROUP BY 
       c.customer_name
   ORDER BY 
       total_purchases DESC;
"@
    Write-Host ""
    Write-Host "3. Find the most popular product by total quantity sold"
    Write-Host @"
   SELECT 
       p.product_name, 
       SUM(s.quantity) AS total_quantity 
   FROM 
       sales s
   JOIN 
       products p ON s.product_id = p.product_id
   GROUP BY 
       p.product_name
   ORDER BY 
       total_quantity DESC
   LIMIT 1;
"@
    Write-Host ""
    
    Write-Host "Exercise 3 Solutions:" -ForegroundColor Cyan
    Write-Host "1. Calculate the profit margin for each product category"
    Write-Host @"
   SELECT 
       p.category,
       SUM(s.total_amount) AS total_sales,
       SUM(s.profit) AS total_profit,
       ROUND((SUM(s.profit) / SUM(s.total_amount)) * 100, 2) AS profit_margin_percent
   FROM 
       sales s
   JOIN 
       products p ON s.product_id = p.product_id
   GROUP BY 
       p.category
   ORDER BY 
       profit_margin_percent DESC;
"@
    Write-Host ""
    Write-Host "2. Find the customer with the highest total purchases"
    Write-Host @"
   SELECT 
       c.customer_name,
       SUM(s.total_amount) AS total_purchases
   FROM 
       sales s
   JOIN 
       customers c ON s.customer_id = c.customer_id
   GROUP BY 
       c.customer_name
   ORDER BY 
       total_purchases DESC
   LIMIT 1;
"@
    Write-Host ""
    Write-Host "3. Calculate monthly sales totals for 2024"
    Write-Host @"
   SELECT 
       strftime('%Y-%m', sale_date) AS month,
       SUM(total_amount) AS monthly_sales,
       SUM(profit) AS monthly_profit
   FROM 
       sales
   WHERE 
       sale_date LIKE '2024%'
   GROUP BY 
       month
   ORDER BY 
       month;
"@
    Write-Host ""
    
    $runSQLite = Read-Host "Open SQLite now to try these exercises? (Y/N)"
    if ($runSQLite -eq "Y" -or $runSQLite -eq "y") {
        Write-Host "Opening SQLite..." -ForegroundColor Gray
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c $sqliteExe $dbPath && pause"
    }
    
    Wait-ForKey
}

function Complete-DeliveryTracking {
    Show-Header -Title "Complete the Delivery Tracking System"
    
    $projectRoot = Split-Path -Parent $PSCommandPath
    $sqliteExe = Get-ChildItem -Path "$projectRoot\sqlite" -Filter "sqlite3.exe" -Recurse -ErrorAction SilentlyContinue | 
                Select-Object -First 1 -ExpandProperty FullName
    $dbPath = "$projectRoot\data\petroleum_sales.db"
    
    Write-Host "For our final activity, let's complete our delivery tracking system." -ForegroundColor Yellow
    Write-Host "This will tie together all the concepts we've learned."
    Write-Host ""
    
    Write-Host "Steps to Complete:" -ForegroundColor Yellow
    Write-Host "1. Insert delivery records for each sale"
    Write-Host "2. Create a comprehensive delivery tracking view"
    Write-Host "3. Create a driver performance report"
    Write-Host ""
    
    Write-Host "SQL Commands:" -ForegroundColor Cyan
    Write-Host @"
-- Step 1: Insert delivery records
INSERT INTO deliveries (sale_id, driver_id, delivery_date, status, notes)
VALUES
(1, 1, '2024-05-16', 'Delivered', 'On-time delivery'),
(2, 3, '2024-05-17', 'Delivered', 'Customer very satisfied'),
(3, 2, '2024-05-18', 'Delivered', 'Slight delay due to traffic'),
(4, 5, '2024-05-19', 'Delivered', 'No issues'),
(5, 4, '2024-05-20', 'Delivered', 'Delivered ahead of schedule');

-- Step 2: Create a delivery tracking view
CREATE VIEW delivery_tracking AS
SELECT 
    d.delivery_id,
    d.delivery_date,
    d.status,
    c.customer_name,
    c.city,
    c.phone,
    dr.driver_name,
    p.product_name,
    s.quantity,
    s.total_amount,
    d.notes
FROM 
    deliveries d
JOIN 
    sales s ON d.sale_id = s.sale_id
JOIN 
    customers c ON s.customer_id = c.customer_id
JOIN 
    products p ON s.product_id = p.product_id
JOIN 
    drivers dr ON d.driver_id = dr.driver_id;

-- View the delivery tracking data
SELECT * FROM delivery_tracking;

-- Step 3: Create a driver performance report
CREATE VIEW driver_performance AS
SELECT 
    dr.driver_id,
    dr.driver_name,
    COUNT(d.delivery_id) AS delivery_count,
    SUM(s.quantity) AS total_quantity_delivered,
    SUM(s.total_amount) AS total_value_delivered,
    SUM(s.profit) AS total_profit_delivered,
    ROUND(AVG(julianday(d.delivery_date) - julianday(s.sale_date)), 1) AS avg_delivery_days
FROM 
    drivers dr
LEFT JOIN 
    deliveries d ON dr.driver_id = d.driver_id
LEFT JOIN 
    sales s ON d.sale_id = s.sale_id
GROUP BY 
    dr.driver_id, dr.driver_name
ORDER BY 
    total_value_delivered DESC;

-- View the driver performance report
SELECT * FROM driver_performance;
"@
    Write-Host ""
    
    $runSQLite = Read-Host "Open SQLite now to complete the delivery tracking system? (Y/N)"
    if ($runSQLite -eq "Y" -or $runSQLite -eq "y") {
        Write-Host "Opening SQLite..." -ForegroundColor Gray
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c $sqliteExe $dbPath && pause"
    }
    
    Wait-ForKey
}

function Show-ModuleSummary {
    Show-Header -Title "Module 1 Summary"
    
    Write-Host "Congratulations on completing Module 1!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "What you've learned:" -ForegroundColor Yellow
    Write-Host "1. Database concepts and terminology"
    Write-Host "2. Setting up a SQLite database"
    Write-Host "3. Creating tables with relationships"
    Write-Host "4. Importing data from CSV and JSON"
    Write-Host "5. Writing SQL queries with SELECT, WHERE, and JOIN"
    Write-Host "6. Creating views for common queries"
    Write-Host "7. Building business intelligence reports"
    Write-Host ""
    
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Continue exploring SQL with more complex queries"
    Write-Host "2. Add more features to your database"
    Write-Host "3. Explore other database systems like MySQL or PostgreSQL"
    Write-Host "4. Learn about database design principles"
    Write-Host "5. Practice with real-world data sets"
    Write-Host ""
    
    Write-Host "In Module 2, we'll explore Microsoft Access to see how the same database can be implemented with a graphical interface." -ForegroundColor Green
    Write-Host ""
    
    Wait-ForKey
}

# Main program flow
function Main {
    $quit = $false
    
    while (-not $quit) {
        $options = @(
            "Prerequisites Check",
            "Initialize Training Environment",
            "Database Concepts",
            "Module Goals",
            "Data Import and Cleaning",
            "SQL Basics",
            "SQL Joins and Relationships",
            "SQL Practice Exercises",
            "Complete Delivery Tracking System",
            "Module Summary"
        )
        
        $selection = Show-Menu -Title "Database Training Module 1" -Options $options
        
        switch ($selection) {
            0 { Test-Prerequisites }
            1 { Initialize-Environment }
            2 { Show-DatabaseConcepts }
            3 { Show-ModuleGoals }
            4 { Import-DataActivity }
            5 { Learn-SQLBasics }
            6 { Learn-JoinsAndRelationships }
            7 { Practice-SQLExercises }
            8 { Complete-DeliveryTracking }
            9 { Show-ModuleSummary }
            "Q" { $quit = $true }
            default { }
        }
    }
    
    Show-Header -Title "Thank You!"
    Write-Host "Thank you for completing the Database Training Module 1." -ForegroundColor Green
    Write-Host "Keep practicing and exploring databases!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Start the program
Main
