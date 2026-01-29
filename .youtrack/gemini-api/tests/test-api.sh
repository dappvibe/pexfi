#!/bin/bash
# Test script for Gemini Service

echo "Testing Gemini Service..."
CHAT_ID="test-chat-$(date +%s)"
echo "1. Creating Interaction via POST /chat/$CHAT_ID"

RESPONSE=$(curl -s -X POST "http://localhost:3000/chat/$CHAT_ID" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Tell me a short joke", "system_instruction": "You are a comedian"}')

echo "Response from API:"
echo "$RESPONSE"

# Extract ID roughly (assuming JSON response)
ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ID" ]; then
    ID=$(echo "$RESPONSE" | grep -o '"id": "[^"]*"' | cut -d'"' -f4)
fi

echo ""
if [ ! -z "$ID" ]; then
    echo "Extracted Interaction ID: $ID"
    echo "2. Retrieving Chat Log via GET /chat/$CHAT_ID"

    LOG=$(curl -s "http://localhost:3000/chat/$CHAT_ID")
    echo "Log Response:"
    echo "$LOG"
else
    echo "Could not extract ID to test GET endpoint. Response might be error or different format."
fi
