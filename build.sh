#!/bin/bash

# Build script for ckPayment project
# Builds ckPayment-web3 first, then the parent project

set -e  # Exit on any error

echo "🏗️  Starting build process..."

# Build ckPayment-web3 (child project)
echo "📦 Building ckPayment-web3..."
cd /Users/cesarangulo/Documents/icp/ckPayment/ckPayment-web3
npm run build

# Build parent project
echo "📦 Building parent project..."
cd ..
npm run build

echo "✅ Build completed successfully!"
