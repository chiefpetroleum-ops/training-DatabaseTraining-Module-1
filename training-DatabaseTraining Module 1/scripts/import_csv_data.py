# Create a file named 'import_csv_data.py' in your scripts folder
import pandas as pd
import sqlite3
import os

# Set paths
project_root = r'C:\Users\jacob\Desktop\DatabaseTraining'
data_path = os.path.join(project_root, 'data', 'sales_data.csv')
db_path = os.path.join(project_root, 'data', 'petroleum_sales.db')

# Load CSV data
print('Loading CSV data...')
df = pd.read_csv(data_path)
print(f'Loaded {len(df)} rows from CSV')

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# For each row in the CSV, find or create the customer, product, and then create the sale
sales_inserted = 0

for index, row in df.iterrows():
    try:
        # Find or create customer
        cursor.execute("SELECT customer_id FROM customers WHERE customer_name = ?", (row['Customer'],))
        customer_result = cursor.fetchone()
        
        if customer_result:
            customer_id = customer_result[0]
        else:
            # Create new customer
            cursor.execute("""
                INSERT INTO customers (customer_name, city, state)
                VALUES (?, 'Unknown', 'Unknown')
            """, (row['Customer'],))
            customer_id = cursor.lastrowid
            
        # Find or create product
        cursor.execute("SELECT product_id FROM products WHERE product_name = ?", (row['Product'],))
        product_result = cursor.fetchone()
        
        if product_result:
            product_id = product_result[0]
        else:
            # Create new product
            cursor.execute("""
                INSERT INTO products (product_name, category, unit_price, unit_cost, description)
                VALUES (?, 'Unknown', ?, ?, 'Imported from CSV')
            """, (row['Product'], row['Price'], row['Price'] * 0.8))  # Assuming 20% profit margin
            product_id = cursor.lastrowid
            
        # Create sale record
        cursor.execute("""
            INSERT INTO sales (customer_id, product_id, sale_date, quantity, total_amount)
            VALUES (?, ?, ?, ?, ?)
        """, (customer_id, product_id, row['Date'], row['Quantity'], row['Total']))
        
        sales_inserted += 1
        
    except Exception as e:
        print(f"Error processing row {index}: {e}")
        print(f"Row data: {row}")

# Commit changes and close connection
conn.commit()
conn.close()

print(f'Successfully inserted {sales_inserted} sales records into the database')