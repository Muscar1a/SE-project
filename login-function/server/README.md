# MERN Auth Server with 2FA and Escrow System

This is the TypeScript-based backend server for a MERN stack application with 2FA authentication and an escrow payment system integrated with VNPay.

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the server directory with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   VNPAY_TMN_CODE=your_vnpay_tmn_code
   VNPAY_SECURE_SECRET=your_vnpay_secure_secret
   SERVER_URL=http://localhost:5000
   ```

3. Build the TypeScript application:
   ```
   npm run build
   ```

4. Start the server:
   ```
   npm start
   ```

## Development Mode

To run the server in development mode with auto-reloading:
