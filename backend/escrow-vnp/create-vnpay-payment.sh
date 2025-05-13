#!/bin/bash

echo "you need to npm run dev first"
curl -X POST http://localhost:3000/escrow/create \
  -H "Content-Type: application/json" \
  -d '{
    "buyerId": "jane_smith",
    "sellerId": "electronics_shop",
    "amount": 1500000,
    "description": "Laptop purchase"
  }'
