import json

# Hardcoded filenames
input_file = "russel.json"
output_file = "output.json"

# Read the JSON
with open(input_file, "r") as f:
    data = json.load(f)

# Write the JSON without whitespace (compact form)
with open(output_file, "w") as f:
    json.dump(data, f, separators=(',', ':'))

print(f"Whitespace removed and saved to {output_file}")
