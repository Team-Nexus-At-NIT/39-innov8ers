#!/usr/bin/env bash
# exit on error
set -o errexit

echo ">>> Installing Server Dependencies..."
cd server
npm install

echo ">>> Installing Client Dependencies & Building..."
cd ../client
# Using --legacy-peer-deps to handle react version conflicts
# Including dev dependencies to ensure vite is available for the build
npm install --include=dev --legacy-peer-deps
npm run build

echo ">>> Build Successful!"
