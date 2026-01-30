#!/bin/bash

# =====================================================
# Script: Test Admin Upgrade API
# Description: Tests the admin upgrade user endpoint
# =====================================================

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3000/api/admin/upgrade-user"
TARGET_USER_ID="replace-with-target-user-id"

echo -e "${YELLOW}Testing Admin Upgrade API${NC}"
echo "==========================================="

# Test 1: Upgrade to PRO with expiration
echo -e "\n${YELLOW}Test 1: Upgrade user to PRO tier${NC}"
EXPIRE_DATE=$(date -d "+30 days" -u +"%Y-%m-%dT%H:%M:%SZ")
echo "Expiration date: $EXPIRE_DATE"

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"targetUserId\": \"$TARGET_USER_ID\",
    \"tier\": \"PRO\",
    \"expireAt\": \"$EXPIRE_DATE\"
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ PRO upgrade successful${NC}"
else
  echo -e "${RED}✗ PRO upgrade failed${NC}"
fi

# Wait a bit before next test
sleep 2

# Test 2: Upgrade to VIP (lifetime)
echo -e "\n${YELLOW}Test 2: Upgrade user to VIP tier${NC}"

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"targetUserId\": \"$TARGET_USER_ID\",
    \"tier\": \"VIP\",
    \"expireAt\": null
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ VIP upgrade successful${NC}"
else
  echo -e "${RED}✗ VIP upgrade failed${NC}"
fi

# Test 3: Invalid tier
echo -e "\n${YELLOW}Test 3: Try invalid tier (should fail)${NC}"

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"targetUserId\": \"$TARGET_USER_ID\",
    \"tier\": \"INVALID\",
    \"expireAt\": null
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"error"'; then
  echo -e "${GREEN}✓ Correctly rejected invalid tier${NC}"
else
  echo -e "${RED}✗ Should have rejected invalid tier${NC}"
fi

# Test 4: PRO without expiration (should fail)
echo -e "\n${YELLOW}Test 4: PRO tier without expireAt (should fail)${NC}"

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"targetUserId\": \"$TARGET_USER_ID\",
    \"tier\": \"PRO\",
    \"expireAt\": null
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"error"'; then
  echo -e "${GREEN}✓ Correctly rejected PRO without expireAt${NC}"
else
  echo -e "${RED}✗ Should have rejected PRO without expireAt${NC}"
fi

echo -e "\n${YELLOW}==========================================="
echo -e "Testing complete!${NC}\n"
