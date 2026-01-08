#!/bin/bash

# Deploy to both OTC (backup) and Production (CF)
# This ensures the backup deployment stays in sync with the production one

# Check if tag is provided as an argument
if [ $# -eq 0 ]; then
  echo "Error: 'tag' is not provided. Use: ./deploy-cdse-otc-and-production.sh <tag>"
  exit 1
fi

tag="$1"

echo "=========================================="
echo "Starting deployment to OTC (backup)..."
echo "=========================================="
bash scripts/deploy-cdse-otc.sh
otc_exit_code=$?

if [ $otc_exit_code -ne 0 ]; then
  echo "Error: OTC deployment failed with exit code $otc_exit_code"
  exit $otc_exit_code
fi

echo ""
echo "=========================================="
echo "Starting deployment to Production (CF)..."
echo "=========================================="
bash scripts/deploy-cdse-production.sh "$tag"
production_exit_code=$?

if [ $production_exit_code -ne 0 ]; then
  echo "Error: Production deployment failed with exit code $production_exit_code"
  exit $production_exit_code
fi

echo ""
echo "=========================================="
echo "✓ All deployments completed successfully!"
echo "=========================================="
