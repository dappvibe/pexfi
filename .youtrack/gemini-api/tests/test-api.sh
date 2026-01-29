#!/bin/bash
# Test script for Gemini Service

echo "Moving old tests..."
mv gemini/test.ts gemini/tests/test-client.ts 2>/dev/null || true

echo "Testing Gemini Service..."
echo "1. Creating Interaction via POST /api"

RESPONSE=$(curl -s -X POST http://localhost:3000/api \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Tell me a short joke", "system_instruction": "You are a comedian"}')

echo "Response from API:"
echo "$RESPONSE"

# Extract ID roughly (assuming JSON response)
ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ID" ]; then
    # Fallback if id is not top level or grep failed
    # Try one more time assuming it might be in an object
    ID=$(echo "$RESPONSE" | grep -o '"id": "[^"]*"' | cut -d'"' -f4)
fi

echo ""
if [ ! -z "$ID" ]; then
    echo "Extracted ID: $ID"
    echo "2. Retrieving Interaction Log via GET /chat/$ID"

    LOG=$(curl -s http://localhost:3000/chat/$ID)
    echo "Log Response:"
    echo "$LOG"
else
    echo "Could not extract ID to test GET endpoint. Response might be error or different format."
fi
