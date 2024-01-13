#!/bin/bash

# Define paths
source_file="./.dfx/local/canisters/internet_identity/internet_identity.did"
destination_dir="./.dfx/ic/canisters/idl/"
new_filename="rdmx6-jaaaa-aaaaa-aaadq-cai.did"

# Check if the source file exists
if [ -f "$source_file" ]; then
    # Create the destination directory if it doesn't exist
    mkdir -p "$destination_dir"

    # Copy the file to the destination directory with the new filename
    cp "$source_file" "$destination_dir$new_filename"

    # Print success message
    echo "File copied and renamed successfully."
else
    # Print an error message if the source file doesn't exist
    echo "Error: Source file not found."
fi
