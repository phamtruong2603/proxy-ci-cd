const fs = require('fs');
const path = require('path');

// Hàm ghi lỗi vào file log
function logErrorToFile(err, req) {
  const logMessage = `
  Date: ${new Date().toISOString()}
  Request: ${req.method} ${req.url}
  Error: ${err.message}
  Stack: ${err.stack}\n`;

  // Đường dẫn file log
  const logFilePath = path.join(__dirname, 'log/error.log');

  // Ghi lỗi vào file (thêm vào cuối file)
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    } else {
      console.log('Error logged successfully.');
    }
  });
}

module.exports = { logErrorToFile };
