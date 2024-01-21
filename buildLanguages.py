# Take in a language file and build a json file for the language
# CSV file format:
# key,en,ja
#
# output:
# en.json
# - key: en_value
# ja.json
# - key: ja_value

import csv
import json
import sys

def main():
    filename = "languages.csv"
    dest = "./public/static/languages/"
    languages = ["en", "ja"]

    # Read in the csv file
    with open(filename, 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter=',')
        # Skip the first row
        next(reader)
        # Build the json files
        for lang in languages:
            # Create the json file if it doesn't exist
            jsonFile = open(dest + lang + ".json", "w+")
            # Create the json object
            jsonObj = {}
            # Read in the csv file
            for row in reader:
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