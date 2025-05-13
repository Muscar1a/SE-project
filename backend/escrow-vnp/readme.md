# VNPay Escrow Payment App

This is an example escrow payment application built using the VNPay payment gateway API. It demonstrates how to implement a basic escrow system where funds are held until certain conditions are met.

## Features

- Create escrow transactions
- Process payments through VNPay
- Hold funds in escrow
- Complete transactions (release funds to seller)
- Refund transactions (return funds to buyer)
- Query transaction status

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   VNPAY_TMN_CODE=2QXUI4B4
   VNPAY_SECURE_SECRET=SECRETKEY
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### 1. Create Escrow Transaction
```bash
POST /escrow/create
Content-Type: application/json

{
  "buyerId": "buyer123",
  "sellerId": "seller456",
  "amount": 100000,
  "description": "Purchase of item XYZ"
}
```

Response:
```json
{
  "success": true,
  "orderId": "ESC-xxxx-xxxx-xxxx",
  "paymentUrl": "https://sandbox.vnpayment.vn/...",
  "escrowTransaction": {
    "orderId": "ESC-xxxx-xxxx-xxxx",
    "buyerId": "buyer123",
    "sellerId": "seller456",
    "amount": 100000,
    "status": "pending",
    "createdAt": "2024-xx-xx"
  }
}
```

### 2. Get Transaction Details
```bash
GET /escrow/{orderId}
```

### 3. Complete Escrow (Release Funds)
```bash
POST /escrow/{orderId}/complete
```

### 4. Refund Escrow
```bash
POST /escrow/{orderId}/refund
Content-Type: application/json

{
  "reason": "Order cancelled by buyer"
}
```

## How It Works

1. **Create Escrow**: Buyer initiates an escrow transaction
2. **Payment**: Buyer is redirected to VNPay to complete payment
3. **Hold Funds**: Once payment is confirmed, funds are held in escrow
4. **Complete/Refund**:
   - If conditions are met, complete the escrow to release funds to seller
   - If transaction is cancelled, refund the funds to buyer

## Testing Flow

### 1. Create an Escrow Transaction
```bash
curl -X POST http://localhost:3000/escrow/create \
  -H "Content-Type: application/json" \
  -d '{
    "buyerId": "buyer123",
    "sellerId": "seller456",
    "amount": 100000,
    "description": "Test escrow payment"
  }'
```

**Response:**
```json
{
  "success": true,
  "orderId": "ESC-xxxx-xxxx-xxxx-xxxx",
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=...",
  "escrowTransaction": {
    "orderId": "ESC-xxxx-xxxx-xxxx-xxxx",
    "buyerId": "buyer123",
    "sellerId": "seller456",
    "amount": 100000,
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Complete Payment
Copy the `paymentUrl` from the response and open it in a browser. Use these test credentials:
- Use test card number: `9704198526191432198`
- Cardholder name: `NGUYEN VAN A`
- Issue date: `07/15`
- OTP: `123456`

### 3. Check Transaction Status
```bash
# Replace ESC-xxxx with your actual orderId
curl http://localhost:3000/escrow/ESC-xxxx-xxxx-xxxx-xxxx
```

**Response:**
```json
{
  "transaction": {
    "orderId": "ESC-xxxx-xxxx-xxxx-xxxx",
    "buyerId": "buyer123",
    "sellerId": "seller456",
    "amount": 100000,
    "status": "paid",
    "vnpayTransactionNo": "14515426",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "paidAt": "2024-01-01T00:01:00.000Z"
  },
  "vnpayStatus": {
    "vnp_ResponseCode": "00",
    "vnp_Message": "Success",
    "isSuccess": true,
    "isVerified": true
  }
}
```

### 4. Complete Escrow (Release Funds)
```bash
curl -X POST http://localhost:3000/escrow/ESC-xxxx-xxxx-xxxx-xxxx/complete
```

**Response:**
```json
{
  "success": true,
  "message": "Escrow completed, funds released to seller",
  "transaction": {
    "orderId": "ESC-xxxx-xxxx-xxxx-xxxx",
    "status": "completed",
    "completedAt": "2024-01-01T00:02:00.000Z"
  }
}
```

### 5. Refund Escrow (Alternative to Complete)
```bash
curl -X POST http://localhost:3000/escrow/ESC-xxxx-xxxx-xxxx-xxxx/refund \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Order cancelled by buyer"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Escrow refunded to buyer",
  "transaction": {
    "orderId": "ESC-xxxx-xxxx-xxxx-xxxx",
    "status": "refunded",
    "refundedAt": "2024-01-01T00:02:00.000Z"
  },
  "refundResult": {
    "vnp_ResponseCode": "00",
    "vnp_Message": "Success",
    "isSuccess": true,
    "isVerified": true
  }
}
```

## Curl Examples Reference

### Create Multiple Test Transactions
```bash
# Create transaction 1
curl -X POST http://localhost:3000/escrow/create \
  -H "Content-Type: application/json" \
  -d '{
    "buyerId": "john_doe",
    "sellerId": "acme_store",
    "amount": 250000,
    "description": "iPhone case purchase"
  }'

# Create transaction 2
curl -X POST http://localhost:3000/escrow/create \
  -H "Content-Type: application/json" \
  -d '{
    "buyerId": "jane_smith",
    "sellerId": "electronics_shop",
    "amount": 1500000,
    "description": "Laptop purchase"
  }'
```

### Test Different Amounts
```bash
# Small amount transaction
curl -X POST http://localhost:3000/escrow/create \
  -H "Content-Type: application/json" \
  -d '{
    "buyerId": "test_buyer",
    "sellerId": "test_seller",
    "amount": 10000,
    "description": "Test small payment"
  }'

# Large amount transaction
curl -X POST http://localhost:3000/escrow/create \
  -H "Content-Type: application/json" \
  -d '{
    "buyerId": "test_buyer",
    "sellerId": "test_seller",
    "amount": 50000000,
    "description": "Test large payment"
  }'
```

### Error Testing
```bash
# Test missing required fields
curl -X POST http://localhost:3000/escrow/create \
  -H "Content-Type: application/json" \
  -d '{
    "buyerId": "test_buyer"
  }'

# Test non-existent order
curl http://localhost:3000/escrow/INVALID-ORDER-ID

# Test refund on unpaid order
curl -X POST http://localhost:3000/escrow/ESC-unpaid-order/refund \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Testing error case"
  }'
```
