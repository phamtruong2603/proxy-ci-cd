const http = require('http');
const axios = require('axios');

const postData = {
  username: 'testuser',
  password: 'password123'
};

const targetUrl = 'http://localhost:6868/'; // URL đích mà bạn muốn gửi yêu cầu POST

// Hàm gửi yêu cầu POST đồng thời
async function sendConcurrentRequests() {
  const promises = [];
  const requestCount = 110000; // Số lượng yêu cầu đồng thời mỗi lần gửi

  for (let i = 0; i < requestCount; i++) {
    promises.push(
      axios.post(targetUrl, postData)
        .then(response => {
          console.log(`Request ${i} - STATUS: ${response.status}`);
        })
        .catch(error => {
          console.error(`Request ${i} - ERROR: ${error.message}`);
        })
    );
  }

  // Thực hiện tất cả các yêu cầu POST đồng thời
  await Promise.all(promises);

  // Tiếp tục gửi yêu cầu
  sendConcurrentRequests();
}

// server nodejs
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server đang gửi các yêu cầu POST đồng thời.\n');
});
server.listen(3000, () => {
  console.log('Server đang chạy tại http://localhost:3000');

  // Bắt đầu gửi yêu cầu POST đồng thời
  sendConcurrentRequests();
});

// Xử lý khi tắt server
process.on('SIGINT', () => {
  console.log('Đã tắt server.');
  process.exit();
});
