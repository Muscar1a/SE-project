// client/src/pages/admin/ApiDocumentation.jsx
import React, { useState } from 'react';
import { API_URL } from '../../config';

const ApiDocumentation = () => {
  const [selectedExample, setSelectedExample] = useState('curl');

  const exampleToken = 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz';
  const exampleOrderId = 'PART01-1234567890ABCDEF';

  const examples = {
    curl: {
      title: 'cURL',
      createEscrow: `curl -X POST "${API_URL}/api/partner/escrow/create" \\
  -H "Content-Type: application/json" \\
  -H "X-Partner-Token: ${exampleToken}" \\
  -d '{
    "customerEmail": "customer@example.com",
    "amount": 100000,
    "description": "Payment for digital services",
    "returnUrl": "https://yoursite.com/payment-success"
  }'`,
      getEscrows: `curl -X GET "${API_URL}/api/partner/escrow?page=1&limit=10&status=paid" \\
  -H "X-Partner-Token: ${exampleToken}"`,
      getEscrow: `curl -X GET "${API_URL}/api/partner/escrow/${exampleOrderId}" \\
  -H "X-Partner-Token: ${exampleToken}"`,
      getStats: `curl -X GET "${API_URL}/api/partner/stats" \\
  -H "X-Partner-Token: ${exampleToken}"`
    },
    javascript: {
      title: 'JavaScript (Fetch)',
      createEscrow: `const response = await fetch('${API_URL}/api/partner/escrow/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Partner-Token': '${exampleToken}'
  },
  body: JSON.stringify({
    customerEmail: 'customer@example.com',
    amount: 100000,
    description: 'Payment for digital services',
    returnUrl: 'https://yoursite.com/payment-success'
  })
});

const data = await response.json();
console.log(data);`,
      getEscrows: `const response = await fetch('${API_URL}/api/partner/escrow?page=1&limit=10&status=paid', {
  headers: {
    'X-Partner-Token': '${exampleToken}'
  }
});

const data = await response.json();
console.log(data);`,
      getEscrow: `const response = await fetch('${API_URL}/api/partner/escrow/${exampleOrderId}', {
  headers: {
    'X-Partner-Token': '${exampleToken}'
  }
});

const data = await response.json();
console.log(data);`,
      getStats: `const response = await fetch('${API_URL}/api/partner/stats', {
  headers: {
    'X-Partner-Token': '${exampleToken}'
  }
});

const data = await response.json();
console.log(data);`
    },
    nodejs: {
      title: 'Node.js (axios)',
      createEscrow: `const axios = require('axios');

const response = await axios.post('${API_URL}/api/partner/escrow/create', {
  customerEmail: 'customer@example.com',
  amount: 100000,
  description: 'Payment for digital services',
  returnUrl: 'https://yoursite.com/payment-success'
}, {
  headers: {
    'X-Partner-Token': '${exampleToken}'
  }
});

console.log(response.data);`,
      getEscrows: `const axios = require('axios');

const response = await axios.get('${API_URL}/api/partner/escrow', {
  params: { page: 1, limit: 10, status: 'paid' },
  headers: {
    'X-Partner-Token': '${exampleToken}'
  }
});

console.log(response.data);`,
      getEscrow: `const axios = require('axios');

const response = await axios.get('${API_URL}/api/partner/escrow/${exampleOrderId}', {
  headers: {
    'X-Partner-Token': '${exampleToken}'
  }
});

console.log(response.data);`,
      getStats: `const axios = require('axios');

const response = await axios.get('${API_URL}/api/partner/stats', {
  headers: {
    'X-Partner-Token': '${exampleToken}'
  }
});

console.log(response.data);`
    },
    dispute: {
      title: 'Dispute APIs',
      initiate: `POST /api/dispute/initiate\n\nTạo dispute mới cho một giao dịch escrow.\n\nRequest body (JSON):\n{
  "escrowId": "<id giao dịch escrow>",
  "reason": "<lý do>",
  "evidence": { "message": "<mô tả bằng chứng>", "files": [] },
  "sellerId": "<id người bán>"
}\n\nResponse:\n{
  "success": true,
  "dispute": { ... }
}`,
      respond: `POST /api/dispute/respond\n\nNgười bán phản hồi dispute.\n\nRequest body (JSON):\n{
  "disputeId": "<id dispute>",
  "evidence": { "message": "<phản hồi>", "files": [] },
  "buyerId": "<id người mua>"
}\n\nResponse:\n{
  "success": true,
  "dispute": { ... }
}`,
      resolve: `POST /api/dispute/resolve\n\nAdmin giải quyết dispute.\n\nRequest body (JSON):\n{
  "disputeId": "<id dispute>",
  "action": "refund|release",
  "note": "<ghi chú>"
}\n\nResponse:\n{
  "success": true,
  "dispute": { ... }
}`,
      getStatus: `GET /api/dispute/:disputeId/status\n\nLấy trạng thái và quyết định của một dispute.\n\nResponse:\n{
  "status": "open|responded|resolved",
  "decision": { ... }
}`,
      getAll: `GET /api/dispute/all\n\nLấy danh sách tất cả dispute (có populate escrowId).\n\nResponse:\n{
  "success": true,
  "disputes": [ ... ]
}`,
      getDetail: `GET /api/dispute/:disputeId\n\nLấy chi tiết dispute (có populate escrowId).\n\nResponse:\n{
  "success": true,
  "dispute": { ... }
}`,
      update: `PATCH /api/dispute/:disputeId\n\nCập nhật trạng thái/kết quả dispute.\n\nRequest body (JSON):\n{
  "status": "open|responded|resolved",
  "decision": "refund|release",
  "note": "<ghi chú>"
}\n\nResponse:\n{
  "success": true,
  "dispute": { ... }
}`
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h2>Partner API Documentation</h2>
        </div>

        <div className="card-body">
          <div className="api-intro">
            <h3>Overview</h3>
            <p>
              The Partner API allows you to create and manage escrow transactions programmatically.
              All API requests require authentication using your secret token.
            </p>

            <div className="auth-section">
              <h4>Authentication</h4>
              <p>Include your secret token in the request header:</p>
              <code className="auth-example">X-Partner-Token: YOUR_SECRET_TOKEN</code>
            </div>

            <div className="base-url-section">
              <h4>Base URL</h4>
              <code className="base-url">{API_URL}/api/partner</code>
            </div>
          </div>

          <div className="language-selector">
            <h4>Code Examples</h4>
            <div className="language-tabs">
              {Object.entries(examples).map(([key, example]) => (
                <button
                  key={key}
                  className={`tab-button ${selectedExample === key ? 'active' : ''}`}
                  onClick={() => setSelectedExample(key)}
                >
                  {example.title}
                </button>
              ))}
            </div>
          </div>

          <div className="endpoints-section">
            {/* Escrow APIs Card */}
            <div className="api-group-card escrow-card">
              <h3 className="api-group-title">Escrow APIs</h3>
              <p className="api-group-desc">Các API để tạo, truy vấn, và quản lý giao dịch escrow.</p>

              {/* Create Escrow */}
              <div className="endpoint">
                <div className="endpoint-header">
                  <span className="method post">POST</span>
                  <span className="path">/escrow/create</span>
                </div>
                <div className="endpoint-description">
                  <p>Create a new escrow transaction and get a VNPay payment URL.</p>
                </div>
                <div className="endpoint-params">
                  <h5>Request Body</h5>
                  <table className="params-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>customerEmail</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Customer's email address</td>
                      </tr>
                      <tr>
                        <td><code>amount</code></td>
                        <td>number</td>
                        <td>Yes</td>
                        <td>Amount in VND (minimum 1,000)</td>
                      </tr>
                      <tr>
                        <td><code>description</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Transaction description</td>
                      </tr>
                      <tr>
                        <td><code>returnUrl</code></td>
                        <td>string</td>
                        <td>No</td>
                        <td>Custom return URL after payment</td>
                      </tr>
                      <tr>
                        <td><code>metadata</code></td>
                        <td>object</td>
                        <td>No</td>
                        <td>Additional data for your reference</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="endpoint-example">
                  <h5>Example Request</h5>
                  <pre><code>{examples[selectedExample].createEscrow}</code></pre>
                </div>
                <div className="endpoint-response">
                  <h5>Response</h5>
                  <pre><code>{`{
  "success": true,
  "data": {
    "orderId": "PART01-1234567890ABCDEF",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "amount": 100000,
    "description": "Payment for digital services",
    "customerEmail": "customer@example.com",
    "partner": {
      "id": "60f4d2e5c1234567890abcde",
      "name": "John Doe",
      "companyName": "Example Corp"
    },
    "transaction": {
      "orderId": "PART01-1234567890ABCDEF",
      "status": "pending",
      "createdAt": "2023-12-07T10:30:00.000Z"
    }
  }
}`}</code></pre>
                </div>
              </div>

              {/* Get Escrows */}
              <div className="endpoint">
                <div className="endpoint-header">
                  <span className="method get">GET</span>
                  <span className="path">/escrow</span>
                </div>
                <div className="endpoint-description">
                  <p>Get a list of your escrow transactions with optional filtering.</p>
                </div>
                <div className="endpoint-params">
                  <h5>Query Parameters</h5>
                  <table className="params-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>page</code></td>
                        <td>number</td>
                        <td>No</td>
                        <td>Page number (default: 1)</td>
                      </tr>
                      <tr>
                        <td><code>limit</code></td>
                        <td>number</td>
                        <td>No</td>
                        <td>Items per page (default: 10)</td>
                      </tr>
                      <tr>
                        <td><code>status</code></td>
                        <td>string</td>
                        <td>No</td>
                        <td>Filter by status: pending, paid, completed, refunded, cancelled</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="endpoint-example">
                  <h5>Example Request</h5>
                  <pre><code>{examples[selectedExample].getEscrows}</code></pre>
                </div>
              </div>

              {/* Get Single Escrow */}
              <div className="endpoint">
                <div className="endpoint-header">
                  <span className="method get">GET</span>
                  <span className="path">/escrow/:orderId</span>
                </div>
                <div className="endpoint-description">
                  <p>Get details of a specific escrow transaction.</p>
                </div>
                <div className="endpoint-example">
                  <h5>Example Request</h5>
                  <pre><code>{examples[selectedExample].getEscrow}</code></pre>
                </div>
              </div>

              {/* Get Stats */}
              <div className="endpoint">
                <div className="endpoint-header">
                  <span className="method get">GET</span>
                  <span className="path">/stats</span>
                </div>
                <div className="endpoint-description">
                  <p>Get your account statistics and transaction summary.</p>
                </div>
                <div className="endpoint-example">
                  <h5>Example Request</h5>
                  <pre><code>{examples[selectedExample].getStats}</code></pre>
                </div>
              </div>
            </div>

            {/* Dispute APIs Card */}
            <div className="api-group-card dispute-card">
              <h3 className="api-group-title">Dispute APIs</h3>
              <p className="api-group-desc">Các API để tạo, phản hồi, và cập nhật dispute cho giao dịch escrow.</p>

              {/* Initiate Dispute */}
              <div className="endpoint">
                <div className="endpoint-header">
                  <span className="method post">POST</span>
                  <span className="path">/dispute/initiate</span>
                </div>
                <div className="endpoint-description">
                  <p>Tạo dispute mới cho một giao dịch escrow.</p>
                </div>
                <div className="endpoint-params">
                  <h5>Request Body</h5>
                  <pre><code>{`{
  "escrowId": "<id giao dịch escrow>",
  "reason": "<lý do>",
  "evidence": { "message": "<mô tả bằng chứng>", "files": [] },
  "sellerId": "<id người bán>"
}`}</code></pre>
                </div>
                <div className="endpoint-example">
                  <h5>Example Request</h5>
                  <pre><code>{examples[selectedExample].dispute?.initiate || ''}</code></pre>
                </div>
              </div>

              {/* Respond Dispute */}
              <div className="endpoint">
                <div className="endpoint-header">
                  <span className="method post">POST</span>
                  <span className="path">/dispute/respond</span>
                </div>
                <div className="endpoint-description">
                  <p>Người bán phản hồi dispute.</p>
                </div>
                <div className="endpoint-params">
                  <h5>Request Body</h5>
                  <pre><code>{`{
  "disputeId": "<id dispute>",
  "evidence": { "message": "<phản hồi>", "files": [] },
  "buyerId": "<id người mua>"
}`}</code></pre>
                </div>
                <div className="endpoint-example">
                  <h5>Example Request</h5>
                  <pre><code>{examples[selectedExample].dispute?.respond || ''}</code></pre>
                </div>
              </div>

              {/* Resolve Dispute */}
              <div className="endpoint">
                <div className="endpoint-header">
                  <span className="method post">POST</span>
                  <span className="path">/dispute/resolve</span>
                </div>
                <div className="endpoint-description">
                  <p>Admin giải quyết dispute.</p>
                </div>
                <div className="endpoint-params">
                  <h5>Request Body</h5>
                  <pre><code>{`{
  "disputeId": "<id dispute>",
  "action": "refund|release",
  "note": "<ghi chú>"
}`}</code></pre>
                </div>
                <div className="endpoint-example">
                  <h5>Example Request</h5>
                  <pre><code>{examples[selectedExample].dispute?.resolve || ''}</code></pre>
                </div>
              </div>

              {/* Get Dispute Status */}
              <div className="endpoint">
                <div className="endpoint-header">
                  <span className="method get">GET</span>
                  <span className="path">/dispute/:disputeId/status</span>
                </div>
                <div className="endpoint-description">
                  <p>Lấy trạng thái và quyết định của một dispute.</p>
                </div>
                <div className="endpoint-example">
                  <h5>Example Request</h5>
                  <pre><code>{examples[selectedExample].dispute?.getStatus || ''}</code></pre>
                </div>
              </div>

              {/* Get All Disputes */}
              <div className="endpoint">
                <div className="endpoint-header">
                  <span className="method get">GET</span>
                  <span className="path">/dispute/all</span>
                </div>
                <div className="endpoint-description">
                  <p>Lấy danh sách tất cả dispute (có populate escrowId).</p>
                </div>
                <div className="endpoint-example">
                  <h5>Example Request</h5>
                  <pre><code>{examples[selectedExample].dispute?.getAll || ''}</code></pre>
                </div>
              </div>

              {/* Get Dispute Detail */}
              <div className="endpoint">
                <div className="endpoint-header">
                  <span className="method get">GET</span>
                  <span className="path">/dispute/:disputeId</span>
                </div>
                <div className="endpoint-description">
                  <p>Lấy chi tiết dispute (có populate escrowId).</p>
                </div>
                <div className="endpoint-example">
                  <h5>Example Request</h5>
                  <pre><code>{examples[selectedExample].dispute?.getDetail || ''}</code></pre>
                </div>
              </div>

              {/* Update Dispute */}
              <div className="endpoint">
                <div className="endpoint-header">
                  <span className="method patch">PATCH</span>
                  <span className="path">/dispute/:disputeId</span>
                </div>
                <div className="endpoint-description">
                  <p>Cập nhật trạng thái/kết quả dispute.</p>
                </div>
                <div className="endpoint-params">
                  <h5>Request Body</h5>
                  <pre><code>{`{
  "status": "open|responded|resolved",
  "decision": "refund|release",
  "note": "<ghi chú>"
}`}</code></pre>
                </div>
                <div className="endpoint-example">
                  <h5>Example Request</h5>
                  <pre><code>{examples[selectedExample].dispute?.update || ''}</code></pre>
                </div>
              </div>
            </div>
          </div>

          <div className="status-codes-section">
            <h3>Response Status Codes</h3>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>200</code></td>
                  <td>Success</td>
                </tr>
                <tr>
                  <td><code>201</code></td>
                  <td>Created</td>
                </tr>
                <tr>
                  <td><code>400</code></td>
                  <td>Bad Request - Invalid parameters</td>
                </tr>
                <tr>
                  <td><code>401</code></td>
                  <td>Unauthorized - Invalid or missing token</td>
                </tr>
                <tr>
                  <td><code>404</code></td>
                  <td>Not Found - Resource doesn't exist</td>
                </tr>
                <tr>
                  <td><code>500</code></td>
                  <td>Internal Server Error</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="transaction-flow-section">
            <h3>Transaction Flow</h3>
            <ol className="flow-steps">
              <li>Partner creates escrow via API and receives payment URL</li>
              <li>Partner redirects customer to payment URL</li>
              <li>Customer completes payment through VNPay</li>
              <li>VNPay processes payment and updates transaction status</li>
              <li>Customer is redirected to success/failure page</li>
              <li>Partner can check transaction status via API</li>
              <li>Funds are held in escrow until completion or refund</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation;
