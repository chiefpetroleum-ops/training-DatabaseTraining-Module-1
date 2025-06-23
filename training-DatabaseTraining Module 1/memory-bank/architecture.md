# Architecture Documentation - Database Training Course

## System Overview

The Database Training Course is a comprehensive, local-first learning environment designed to teach database fundamentals using SQLite and Python with realistic petroleum industry data. The architecture emphasizes simplicity, portability, and business-relevant examples.

## Database Schema

### Core Tables and Relationships

```sql
-- Primary business entities with relationships
customers (customer_id PK) 
    ├── sales (customer_id FK)
    
products (product_id PK)
    ├── sales (product_id FK)
    
drivers (driver_id PK)
    ├── sales (driver_id FK)
    
sales (sale_id PK, customer_id FK, product_id FK, driver_id FK)
    -- Central transaction table linking all entities
```

### Table Structures

#### customers
```sql
CREATE TABLE customers (
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
```

#### products
```sql
CREATE TABLE products (
    product_id INTEGER PRIMARY KEY,
    product_name TEXT NOT NULL,
    product_type TEXT,          -- diesel, gasoline, heating_oil
    unit_price REAL,
    cost_per_unit REAL,
    margin_percentage REAL,
    active_status INTEGER DEFAULT 1
);
```

#### drivers
```sql
CREATE TABLE drivers (
    driver_id INTEGER PRIMARY KEY,
    driver_name TEXT NOT NULL,
    license_number TEXT,
    phone TEXT,
    vehicle_type TEXT,
    hire_date TEXT,
    active_status INTEGER DEFAULT 1
);
```

#### sales
```sql
CREATE TABLE sales (
    sale_id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    product_id INTEGER,
    driver_id INTEGER,
    sale_date TEXT,
    quantity REAL,
    unit_price REAL,
    total_amount REAL,
    delivery_address TEXT,
    delivery_date TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers (customer_id),
    FOREIGN KEY (product_id) REFERENCES products (product_id),
    FOREIGN KEY (driver_id) REFERENCES drivers (driver_id)
);
```

### Indexes for Performance
```sql
-- Query optimization indexes
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_product ON sales(product_id);
CREATE INDEX idx_sales_driver ON sales(driver_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_customers_name ON customers(customer_name);
```

## File System Architecture

```
DatabaseTraining/
├── data/                           # Database and source files
│   ├── petroleum_sales.db          # Main SQLite database (generated)
│   ├── sales_data.csv             # Raw transaction data
│   └── sales_data_clean.csv       # Processed transaction data
│
├── scripts/                        # Automation and utilities
│   ├── Buid_db_Code/              # Step-by-step build instructions
│   │   ├── 1-Folder_Directory_Setup.ps.txt
│   │   ├── 2-Create_Directory-Download_Extract_Remove_zip-SQLite.txt
│   │   ├── 3-Check_if_Python_is_installed.txt
│   │   ├── 4-Create_a_Python_script_for_data_c.txt
│   │   ├── 5-Create_a_SQL_script_for_database.txt
│   │   ├── 6-Create_Sample_JSON_Data.txt
│   │   ├── 7-Create_Drivers_JSON_Data.txt
│   │   ├── 8-Create_Import_JSON_Script.txt
│   │   ├── 9-Create_a_Python_script_to_add_columns_to_tables.txt
│   │   ├── 10-Create_a_markdown_file_to_track_progress.txt
│   │   └── 11-Initialize_Database_and_Sample_Data.txt
│   │
│   ├── create_database.sql        # DDL for table creation
│   ├── clean_data.py             # Data preprocessing and validation
│   ├── import_csv_data.py        # CSV to SQLite import
│   ├── import_json_data.py       # JSON to SQLite import
│   ├── add_column.py             # Schema modification utilities
│   └── sales_data.csv            # Duplicate for processing
│
├── json_data/                     # Reference data files
│   ├── customers.json            # Customer master data
│   ├── products.json             # Product catalog
│   └── drivers.json              # Driver information
│
├── sqlite/                       # Portable SQLite binaries
│   └── [SQLite executable files for Windows]
│
├── docs/                         # Documentation and references
│   └── [Additional course materials]
│
└── memory-bank/                  # Project documentation framework
    ├── README.md                 # Project overview
    ├── PRD.md                    # Product requirements
    ├── tech-stack.md             # Technology decisions
    ├── implementation-plan.md    # Development roadmap
    ├── progress.md               # Milestone tracking
    └── architecture.md           # This file
```

## Data Flow Architecture

### 1. Environment Setup
```
PowerShell Script → Verify Admin Rights → Create Directories → Install Dependencies
```

### 2. Database Creation
```
create_database.sql → SQLite Engine → petroleum_sales.db (empty schema)
```

### 3. Data Import Pipeline
```
Raw CSV/JSON → clean_data.py → Validation → import_scripts → Populated Database
```

### 4. Query Development
```
Business Requirements → SQL Queries → Results → Reporting/Analysis
```

## Component Responsibilities

### Python Scripts

#### clean_data.py
- **Purpose**: Data preprocessing and quality validation
- **Input**: `sales_data.csv`
- **Output**: `sales_data_clean.csv`
- **Functions**:
  - Remove duplicate records
  - Validate data types and formats
  - Handle missing values
  - Standardize text fields
  - Generate data quality reports

#### import_csv_data.py
- **Purpose**: CSV data import to SQLite
- **Input**: `sales_data_clean.csv`
- **Output**: Populated sales table
- **Functions**:
  - Establish database connection
  - Bulk insert with transaction management
  - Foreign key validation
  - Error logging and rollback

#### import_json_data.py
- **Purpose**: JSON reference data import
- **Input**: `customers.json`, `products.json`, `drivers.json`
- **Output**: Populated master tables
- **Functions**:
  - JSON parsing and validation
  - Referential integrity checking
  - Incremental updates
  - Conflict resolution

#### add_column.py
- **Purpose**: Schema modification utilities
- **Functions**:
  - Add new columns to existing tables
  - Create backup before changes
  - Update existing data
  - Validate schema changes

### SQL Scripts

#### create_database.sql
- **Purpose**: Database schema definition
- **Components**:
  - Table creation with constraints
  - Index creation for performance
  - Foreign key relationships
  - Default value assignments

## Performance Considerations

### Database Optimization
- **Indexes**: Created on frequently queried columns
- **Constraints**: Foreign keys ensure data integrity
- **Data Types**: Optimized for SQLite performance
- **Query Planning**: EXPLAIN QUERY PLAN examples included

### Memory Management
- **Batch Processing**: Large imports handled in chunks
- **Connection Pooling**: Efficient database connections
- **Resource Cleanup**: Proper connection and cursor management
- **Error Handling**: Graceful failure and recovery

### File System Performance
- **Local Storage**: All operations on local filesystem
- **File Sizes**: Optimized for quick backup and transfer
- **Directory Structure**: Logical organization for fast access

## Security Architecture

### Data Protection
- **Sample Data Only**: No sensitive business information
- **Local Processing**: No cloud dependencies or data transmission
- **File Permissions**: Standard user access controls
- **Database Security**: No network exposure, file-based access

### Access Control
- **Admin Rights**: Required only for initial setup
- **Script Execution**: PowerShell execution policy management
- **Database Access**: SQLite file-level permissions
- **Backup Strategy**: Simple file copy procedures

## Integration Points

### External Systems (Future)
- **Google Sheets**: API integration for live reporting
- **Business Intelligence**: Looker Studio, Power BI connections
- **Email Systems**: Automated report distribution
- **Web Applications**: Streamlit dashboard development

### Data Sources (Future)
- **OPIS Integration**: Real-time fuel pricing data
- **DTN Services**: Market data and analytics
- **QuickBooks**: Financial system integration
- **CRM Systems**: Customer data synchronization

## Error Handling Strategy

### Database Operations
- **Transaction Management**: All imports wrapped in transactions
- **Rollback Capability**: Failed operations revert changes
- **Validation**: Pre-import data quality checks
- **Logging**: Comprehensive error reporting

### Script Execution
- **Try/Catch Blocks**: All Python scripts include error handling
- **Progress Reporting**: Console output for user feedback
- **Graceful Degradation**: Continue processing after non-critical errors
- **Recovery Procedures**: Clear instructions for common failures

## Backup and Recovery

### Database Backup
- **Method**: Simple file copy of SQLite database
- **Frequency**: Before schema changes or large imports
- **Storage**: Local backup directory with timestamps
- **Recovery**: Replace current database with backup file

### Code Versioning
- **Git Integration**: All scripts and documentation version controlled
- **Change Tracking**: Commit messages document modifications
- **Branching**: Feature development in separate branches
- **Release Management**: Tagged versions for stable releases

---

*Architecture designed for educational use with business-realistic complexity and enterprise-grade reliability patterns.*