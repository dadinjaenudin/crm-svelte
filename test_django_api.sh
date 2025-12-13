#!/bin/bash

# =============================================================================
# Django Backend API Testing Script
# =============================================================================
# This script tests all major API endpoints to verify the Django backend
# is working correctly with the Svelte frontend.
#
# Usage:
#   chmod +x test_django_api.sh
#   ./test_django_api.sh
# =============================================================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:8000"
API_URL="${BASE_URL}/api"

# Test counters
PASSED=0
FAILED=0

# Print banner
echo ""
echo "========================================="
echo "🧪 Django Backend API Testing"
echo "========================================="
echo ""

# Function to test endpoint
test_endpoint() {
    local test_name=$1
    local method=$2
    local url=$3
    local headers=$4
    local data=$5
    local expected_pattern=$6
    
    echo -n "Testing: $test_name ... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -X "$method" "$url" $headers)
    else
        response=$(curl -s -X "$method" "$url" $headers -d "$data")
    fi
    
    if echo "$response" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "Response: $response"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Health Check
echo -e "${BLUE}1. Health Check${NC}"
test_endpoint \
    "Health endpoint" \
    "GET" \
    "${BASE_URL}/health" \
    "" \
    "" \
    "healthy"
echo ""

# Test 2: Login
echo -e "${BLUE}2. Authentication${NC}"
echo -n "Testing: Login ... "
login_response=$(curl -s -X POST "${API_URL}/auth/login/" \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}')

if echo "$login_response" | grep -q "access"; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
    TOKEN=$(echo "$login_response" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
    echo "  Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "  Response: $login_response"
    ((FAILED++))
    echo ""
    echo -e "${RED}Cannot continue without token. Exiting...${NC}"
    exit 1
fi
echo ""

# Test 3: Get Current User
echo -e "${BLUE}3. User Profile${NC}"
test_endpoint \
    "Get current user" \
    "GET" \
    "${API_URL}/auth/me/" \
    "-H 'Authorization: Bearer $TOKEN'" \
    "" \
    "admin"
echo ""

# Test 4: Members API
echo -e "${BLUE}4. Members Management${NC}"
test_endpoint \
    "Get members list" \
    "GET" \
    "${API_URL}/members/" \
    "-H 'Authorization: Bearer $TOKEN'" \
    "" \
    "results"

test_endpoint \
    "Get member statistics" \
    "GET" \
    "${API_URL}/members/statistics/" \
    "-H 'Authorization: Bearer $TOKEN'" \
    "" \
    "success"
echo ""

# Test 5: Vouchers API
echo -e "${BLUE}5. Vouchers Management${NC}"
test_endpoint \
    "Get vouchers list" \
    "GET" \
    "${API_URL}/vouchers/" \
    "-H 'Authorization: Bearer $TOKEN'" \
    "" \
    "results"

test_endpoint \
    "Get voucher statistics" \
    "GET" \
    "${API_URL}/vouchers/statistics/" \
    "-H 'Authorization: Bearer $TOKEN'" \
    "" \
    "success"
echo ""

# Test 6: Points API
echo -e "${BLUE}6. Points Management${NC}"
test_endpoint \
    "Get points transactions" \
    "GET" \
    "${API_URL}/points/" \
    "-H 'Authorization: Bearer $TOKEN'" \
    "" \
    "results"

test_endpoint \
    "Get points statistics" \
    "GET" \
    "${API_URL}/points/statistics/" \
    "-H 'Authorization: Bearer $TOKEN'" \
    "" \
    "success"
echo ""

# Test 7: Redeem API
echo -e "${BLUE}7. Redeem Management${NC}"
test_endpoint \
    "Get redeem transactions" \
    "GET" \
    "${API_URL}/redeem/" \
    "-H 'Authorization: Bearer $TOKEN'" \
    "" \
    "results"

test_endpoint \
    "Get redeem statistics" \
    "GET" \
    "${API_URL}/redeem/statistics/" \
    "-H 'Authorization: Bearer $TOKEN'" \
    "" \
    "success"
echo ""

# Test 8: Token Refresh
echo -e "${BLUE}8. Token Refresh${NC}"
echo -n "Testing: Token refresh ... "
refresh_token=$(echo "$login_response" | grep -o '"refresh":"[^"]*' | cut -d'"' -f4)
refresh_response=$(curl -s -X POST "${API_URL}/auth/token/refresh/" \
    -H "Content-Type: application/json" \
    -d "{\"refresh\": \"$refresh_token\"}")

if echo "$refresh_response" | grep -q "access"; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
    NEW_TOKEN=$(echo "$refresh_response" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
    echo "  New Token: ${NEW_TOKEN:0:50}..."
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "  Response: $refresh_response"
    ((FAILED++))
fi
echo ""

# Test 9: Unauthenticated Access (should fail)
echo -e "${BLUE}9. Security Test${NC}"
echo -n "Testing: Unauthorized access protection ... "
unauth_response=$(curl -s "${API_URL}/members/")

if echo "$unauth_response" | grep -q "credentials"; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
    echo "  Properly rejected unauthorized request"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "  Response: $unauth_response"
    ((FAILED++))
fi
echo ""

# Summary
echo "========================================="
echo "📊 Test Summary"
echo "========================================="
TOTAL=$((PASSED + FAILED))
echo "Total Tests:   $TOTAL"
echo -e "Passed:        ${GREEN}$PASSED${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "Failed:        ${GREEN}$FAILED${NC}"
else
    echo -e "Failed:        ${RED}$FAILED${NC}"
fi

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Check the output above.${NC}"
fi

echo ""
echo "========================================="
echo "🌐 Service URLs"
echo "========================================="
echo "Frontend:      http://localhost:5173"
echo "Backend API:   http://localhost:8000/api"
echo "Admin Panel:   http://localhost:8000/admin"
echo "API Docs:      http://localhost:8000/api/docs"
echo "ReDoc:         http://localhost:8000/api/redoc"
echo ""
echo "Login credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""

# Exit with proper code
if [ $FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
