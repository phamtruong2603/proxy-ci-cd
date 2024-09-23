const fs = require('fs');
const path = require('path');

// Hàm ghi lại phản hồi từ proxy vào file log
function logProxyResponse(proxyRes, req) {
  const logMessage = `
  Method: ${req.method}
  Client IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}
  Username: ${req.headers['x-username']}
  Date: ${new Date().toISOString()}
  Request: ${req.method} ${req.url}
  Status: ${proxyRes.statusCode}
  Headers: ${JSON.stringify(proxyRes.headers)}
  `;

  // Đường dẫn file log
  const logFilePath = path.join(__dirname, 'log/proxy_response.log');

  // Ghi phản hồi vào file (thêm vào cuối file)
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Failed to write proxy response to log file:', err);
    } else {
      console.log('Proxy response logged successfully.');
    }
  });
}

module.exports = { logProxyResponse };
