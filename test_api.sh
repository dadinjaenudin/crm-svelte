#!/bin/bash
API_BASE="https://3001-imiwsr37ew4twbhh8q98b-2b54fc91.sandbox.novita.ai/api"

echo "=== Testing Backend API ==="
echo ""

echo "1. Health Check..."
curl -s "https://3001-imiwsr37ew4twbhh8q98b-2b54fc91.sandbox.novita.ai/health" | jq '.'
echo ""

echo "2. Member Stats..."
curl -s "$API_BASE/members/stats" | jq '.data'
echo ""

echo "3. Point Stats..."
curl -s "$API_BASE/points/stats" | jq '.data'
echo ""

echo "4. Voucher Stats..."
curl -s "$API_BASE/vouchers/stats" | jq '.data'
echo ""

echo "5. Redeem Stats..."
curl -s "$API_BASE/redeem/stats" | jq '.data'
echo ""

echo "=== All API Tests Complete ==="
