import pandas as pd
import json

# Array to store the JSON information for each day
gui_data = []

# Function to get cell data for a specific day
def get_cell_data(day: int):
    # Read the map file to a DataFrame
    raw_df = pd.read_csv(f'../../../data/world_array_data_day_{day}.csv')

    # Create a new DataFrame to store coordinates
    cell_df = raw_df[['x', 'y']].copy()

    # Get the resource objects for each cells
    oil_data = get_resource_data('oil', day)
    metal_data = get_resource_data('metal', day)
    helium_data = get_resource_data('helium', day)
    ship_data = get_resource_data('ship', day)
    coral_data = get_resource_data('coral', day)
    species_data = get_resource_data('species', day)
    temperature_data = get_resource_data('temperature', day)
    algal_data = get_resource_data('algal', day)
    wind_data = get_resource_data('wind', day)
    
    # For each cell, add the ranking data for each resource
    cell_df = cell_df.merge(oil_data[['x', 'y', 'oil']], on=['x', 'y'], how='left')
    cell_df = cell_df.merge(metal_data[['x', 'y', 'metal']], on=['x', 'y'], how='left')
    cell_df = cell_df.merge(helium_data[['x', 'y', 'helium']], on=['x', 'y'], how='left')
    cell_df = cell_df.merge(ship_data[['x', 'y', 'ship']], on=['x', 'y'], how='left')
    cell_df = cell_df.merge(coral_data[['x', 'y', 'coral']], on=['x', 'y'], how='left')
    cell_df = cell_df.merge(species_data[['x', 'y', 'species']], on=['x', 'y'], how='left')
    cell_df = cell_df.merge(temperature_data[['x', 'y', 'temperature']], on=['x', 'y'], how='left')
    cell_df = cell_df.merge(algal_data[['x', 'y', 'algal']], on=['x', 'y'], how='left')
    cell_df = cell_df.merge(wind_data[['x', 'y', 'wind']], on=['x', 'y'], how='left')

    # Add the land type of the cell to the DataFrame using the 'value' column of the map data
    cell_df['type'] = raw_df['value'].apply(lambda x: 'land' if x > 0 else 'water')

    # Convert to a dictionary
    cells = cell_df.to_dict('records')
    return cells

def rank_apply(x):
    if not pd.isnull(x):
        return int(x)
    return None

# Function to get resource data for a specific day
def get_resource_data(name: str, day: int):
    # Read the CSV file to a DataFrame
    raw_df = pd.read_csv(f'../../../data/{name}_data_day_{day}.csv')

    # Create a new DataFrame to store coordinates
    cell_df = raw_df[['x', 'y', 'value']].copy()

    # Get the ranking from 1-10000 based on the value of the resource
    cell_df[f'{name}'] = cell_df['value'].rank(ascending=False,na_option='bottom').apply(rank_apply)

    return cell_df

# Read the CSV files for each day
for i in range (1, 31):

    # Get the data for each coordinate
    cell_data = get_cell_data(i)

    cells = []

    for cell in cell_data:
        cells.append({
            'x': cell['x'],
            'y': cell['y'],
            'type': cell['type'] if not pd.isnull(cell['type']) else None,
            'resources': {
                'oil': cell['oil'] if not pd.isnull(cell['oil']) else None,
                'metal': cell['metal'] if not pd.isnull(cell['metal']) else None,
                'helium': cell['helium'] if not pd.isnull(cell['helium']) else None,
                'ship': cell['ship'] if not pd.isnull(cell['ship']) else None,
                'coral': cell['coral'] if not pd.isnull(cell['coral']) else None,
                'species': cell['species'] if not pd.isnull(cell['species']) else None,
                'temperature': cell['temperature'] if not pd.isnull(cell['temperature']) else None,
                'algal': cell['algal'] if not pd.isnull(cell['algal']) else None,
                'wind': cell['wind'] if not pd.isnull(cell['wind']) else None,
            }
        })
    
    # Append the object to the array
    gui_data.append({
        'day': i,
        'cells': cells,
    })

# Save the data to a JSON file
with open('gui_data.json', 'w') as f:
    json.dump(gui_data, f)