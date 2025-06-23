import sqlite3
import csv
import os

# Set paths
project_root = r'C:\Users\jacob\Desktop\training-DatabaseTraining'.replace('\\', '\\\\')
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
