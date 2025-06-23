import json
import sqlite3
import os

# Set paths
project_root = r'C:\Users\jacob\Desktop\training-DatabaseTraining'.replace('\\', '\\\\')
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
