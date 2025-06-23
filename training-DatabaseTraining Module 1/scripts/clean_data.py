import pandas as pd
import os

# Set paths
project_root = r'C:\Users\jacob\Desktop\training-DatabaseTraining'.replace('\\', '\\\\')
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
