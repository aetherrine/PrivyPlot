import pandas as pd
import os

ARCHIVE_DATA_FOLDER = os.pardir + "/archive/"

input_file = ARCHIVE_DATA_FOLDER + 'Netflix_Dataset_Rating.csv'
output_file = ARCHIVE_DATA_FOLDER + 'Netflix_Dataset_Rating_Sorted_By_User.csv'


data = pd.read_csv(input_file)
sorting_order = ['User_ID']
new_data = data.sort_values(by=sorting_order)
new_data.to_csv(output_file, index=False)

print(f"CSV file '{output_file}' export done.")
