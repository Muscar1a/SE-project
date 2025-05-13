# Escrow Payment API Integration Guide

## Overview

The Escrow Payment API provides a secure payment solution where funds are held in escrow until transactions are completed. This API integrates with VNPay for payment processing while adding an escrow layer for buyer/seller protection.

## API Base URL

```
Production: https://api.yourcompany.com
Development: http://localhost:3000
```

## Quick Start

### 1. Create an Escrow Transaction

```javascript
const response = await fetch('https://api.yourcompany.com/escrow/create', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        buyerId: 'customer123',
        sellerId: 'merchant456',
        amount: 1500000,  // Amount in VND
        description: 'Order #12345 - Laptop purchase'
    })
});

const data = await response.json();
// Redirect user to: data.paymentUrl
```

### 2. Handle Payment Return

After payment, VNPay redirects users back to YOUR site with status:
```
https://yoursite.com/payment-success?orderId=xxx
```

### 3. Check Transaction Status

```javascript
const response = await fetch(`https://api.yourcompany.com/escrow/${orderId}`);
const data = await response.json();
console.log(data.transaction.status); // 'pending', 'paid', 'completed', 'refunded'
```

## API Reference

### Create Escrow Transaction

Creates a new escrow transaction and returns a VNPay payment URL.

**Endpoint:** `POST /escrow/create`

**Request:**
```json
{
    "buyerId": "string",
    "sellerId": "string",
    "amount": 1500000,
    "description": "string"
}
```

**Response:**
```json
{
    "success": true,
    "orderId": "4d0c0e94b0cb40c1ace2e61705ca09b4",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/...",
    "escrowTransaction": {
        "orderId": "4d0c0e94b0cb40c1ace2e61705ca09b4",
        "buyerId": "customer123",
        "sellerId": "merchant456",
        "amount": 1500000,
        "status": "pending",
        "createdAt": "2024-01-01T00:00:00.000Z"
    }
}
```

### Get Transaction Status

Retrieves the current status of an escrow transaction.

**Endpoint:** `GET /escrow/{orderId}`

**Response:**
```json
{
    "transaction": {
        "orderId": "4d0c0e94b0cb40c1ace2e61705ca09b4",
        "buyerId": "customer123",
        "sellerId": "merchant456",
        "amount": 1500000,
        "status": "paid",
        "vnpayTransactionNo": "14953201",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "paidAt": "2024-01-01T00:01:00.000Z"
    }
}
```

### Complete Transaction (Release Funds)

Completes the escrow and releases funds to the seller. Only available for transactions in "paid" status.

**Endpoint:** `POST /escrow/{orderId}/complete`

**Response:**
```json
{
    "success": true,
    "message": "Escrow completed, funds released to seller",
    "transaction": {
        "orderId": "4d0c0e94b0cb40c1ace2e61705ca09b4",
        "status": "completed",
        "completedAt": "2024-01-01T00:02:00.000Z"
    }
}
```

### Refund Transaction

Refunds the transaction to the buyer. Only available for transactions in "paid" status.

**Endpoint:** `POST /escrow/{orderId}/refund`

**Request:**
```json
{
    "reason": "Product not as described"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Escrow refunded to buyer",
    "transaction": {
        "orderId": "4d0c0e94b0cb40c1ace2e61705ca09b4",
        "status": "refunded",
        "refundedAt": "2024-01-01T00:02:00.000Z"
    }
}
```

## Transaction Flow

```
1. Create Transaction → status: "pending"
2. User Pays → status: "paid"
3. Complete/Refund → status: "completed" or "refunded"
```

## Integration Examples

### React/Next.js

```jsx
// Create payment
const createPayment = async (productData) => {
    const res = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            buyerId: user.id,
            sellerId: productData.merchantId,
            amount: productData.price,
            description: productData.name
        })
    });

    const data = await res.json();
    window.location.href = data.paymentUrl;
};

// Check status
const PaymentStatus = ({ orderId }) => {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            const res = await fetch(`/api/escrow/${orderId}`);
            const data = await res.json();
            setStatus(data.transaction.status);
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [orderId]);

    return <div>Status: {status}</div>;
};
```

### PHP/Laravel

```php
// Create payment
$response = Http::post('https://api.yourcompany.com/escrow/create', [
    'buyerId' => $user->id,
    'sellerId' => $product->merchant_id,
    'amount' => $product->price,
    'description' => $product->name
]);

$data = $response->json();
return redirect($data['paymentUrl']);

// Check status
$response = Http::get("https://api.yourcompany.com/escrow/{$orderId}");
$transaction = $response->json()['transaction'];
```

### Node.js/Express

```javascript
// Create payment endpoint
app.post('/checkout', async (req, res) => {
    const response = await fetch('https://api.yourcompany.com/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            buyerId: req.user.id,
            sellerId: req.body.sellerId,
            amount: req.body.amount,
            description: req.body.description
        })
    });

    const data = await response.json();
    res.json({ paymentUrl: data.paymentUrl });
});

// Handle return from payment
app.get('/payment-success', async (req, res) => {
    const { orderId } = req.query;
    const response = await fetch(`https://api.yourcompany.com/escrow/${orderId}`);
    const data = await response.json();

    res.render('payment-success', { transaction: data.transaction });
});
```

## Error Handling

```javascript
try {
    const response = await fetch('/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
    }

    // Success
    window.location.href = result.paymentUrl;

} catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
}
```

## Best Practices

### 1. Store Order References
```javascript
// Save orderId in your database
await db.orders.create({
    id: localOrderId,
    escrowOrderId: data.orderId,
    userId: buyerId,
    amount: amount,
    status: 'pending'
});
```

### 2. Implement Webhooks
```javascript
// Set up webhook endpoint to receive status updates
app.post('/webhooks/escrow', async (req, res) => {
    const { orderId, status, timestamp } = req.body;

    // Update your local order status
    await db.orders.update({
        where: { escrowOrderId: orderId },
        data: { status, updatedAt: timestamp }
    });

    res.json({ received: true });
});
```

### 3. Status Polling
```javascript
// Poll for status updates if webhooks aren't available
const pollStatus = async (orderId) => {
    const checkStatus = async () => {
        const res = await fetch(`/escrow/${orderId}`);
        const data = await res.json();

        if (data.transaction.status !== 'pending') {
            clearInterval(polling);
            handleStatusChange(data.transaction);
        }
    };

    const polling = setInterval(checkStatus, 5000);
    setTimeout(() => clearInterval(polling), 300000); // Stop after 5 minutes
};
```

## Testing

### Test Data
- **Buyer ID**: Use any string (e.g., "test_buyer_123")
- **Seller ID**: Use any string (e.g., "test_seller_456")
- **Amount**: Any positive number in VND

### Test Payment
1. Create transaction
2. Use VNPay test card:
   - Card: `9704195798459170488`
   - Name: `NGUYEN VAN A`
   - Date: `07/15`
   - OTP: `123456`

### Test Flow
```javascript
// 1. Create test transaction
const testTransaction = await createEscrowTransaction({
    buyerId: 'test_buyer',
    sellerId: 'test_seller',
    amount: 100000,
    description: 'Test transaction'
});

// 2. Simulate payment (manual in browser)
console.log('Pay at:', testTransaction.paymentUrl);

// 3. Check status
const status = await checkTransactionStatus(testTransaction.orderId);

// 4. Complete or refund
if (status === 'paid') {
    await completeTransaction(testTransaction.orderId);
    // or
    await refundTransaction(testTransaction.orderId, 'Test refund');
}
```

## Support

- **Email**: support@yourcompany.com
- **Documentation**: https://docs.yourcompany.com/escrow-api
- **Status Page**: https://status.yourcompany.com

## Rate Limits

- Create Transaction: 100 requests/minute
- Check Status: 1000 requests/minute
- Complete/Refund: 50 requests/minute

## API Versioning

Current version: `v1`

All endpoints are prefixed with version:
```
https://api.yourcompany.com/v1/escrow/create
```

## Changelog

### v1.0.0 (2024-01-01)
- Initial release
- Create, check, complete, and refund transactions
- VNPay integration
