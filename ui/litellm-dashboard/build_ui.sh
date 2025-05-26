#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

# Ensure nvm is installed and load it
if ! command -v nvm &> /dev/null; then
  echo "nvm not found, installing..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Ensure desired Node.js version is installed and used
if ! nvm ls v18.17.0 | grep -q 'v18.17.0'; then
  echo "Node.js v18.17.0 not found, installing..."
  nvm install v18.17.0
fi

# Use desired Node.js version
nvm use v18.17.0 || {
  echo "Error: Failed to switch to Node.js v18.17.0. Deployment aborted."
  exit 1
}

# Ensure pnpm is installed
if ! command -v pnpm &> /dev/null; then
  echo "pnpm not found, installing..."
  npm install -g pnpm
fi

# Install dependencies without manual confirmation
echo "Installing dependencies..."
yes | pnpm install

# Print contents of ui_colors.json (optional debug/info)
echo "Contents of ui_colors.json:"
cat ui_colors.json

# Run the build
pnpm run build

# If build is successful, proceed
echo "Build successful. Copying files..."

# Echo current directory
pwd

# Define destination
destination_dir="../../litellm/proxy/_experimental/out"

# Clean destination and copy new files
rm -rf "$destination_dir"/*
cp -r ./out/* "$destination_dir"

echo "Deployment completed."
