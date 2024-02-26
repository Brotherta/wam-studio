# Take in a language file and build a json file for the language
# CSV file format:
# key,en,ja
# key1,english1,japanese1
#
# Output Structure:
# src/locales/
# - en/
#   - translation.json
# - ja/
#   - translation.json
# --------------------
# translation.json format:
# {
#     "key": "translated value",
# }

import csv
import json

def main():
    filename = "languages.csv"
    dest = "./src/locales/"
    languages = ["en", "ja"]

    # Read in the csv file
    with open(filename, 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter=',')
        # Skip the first row
        next(reader)
        # Build the json files
        for lang in languages:
            # Create the json file if it doesn't exist
            # dest/lang/translation.json
            jsonFile = open(dest + "/" + lang + "/translation.json", "w")
            # Create the json object
            jsonObj = {}
            # Read in the csv file
            for row in reader:
                if (row != [] and row[0] != ""):
                    # Add the key and value to the json object
                    jsonObj[row[0]] = row[languages.index(lang) + 1]
            # Write the json object to the json file
            json.dump(jsonObj, jsonFile, indent=4)
            # Reset the csv file
            csvfile.seek(0)
            # Skip the first row
            next(reader)
            # Close the json file
            jsonFile.close()

if __name__ == "__main__":
    main()