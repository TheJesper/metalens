#!/bin/bash
# Build script for metalens - handles @covers/ui dependency
set -e

echo "Preparing @covers/ui package..."
rm -rf covers-ui-package
cp -r ../covers/packages/ui covers-ui-package

echo "Building Docker image..."
docker build -t metalens .

echo "Cleaning up..."
rm -rf covers-ui-package

echo "Done! Run 'docker compose up -d' to start"
