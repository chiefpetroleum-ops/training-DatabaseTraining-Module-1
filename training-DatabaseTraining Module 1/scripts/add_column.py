import sqlite3
import os

# Set paths
project_root = r'C:\Users\jacob\Desktop\training-DatabaseTraining'.replace('\\', '\\\\')
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
