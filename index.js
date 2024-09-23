// netsh interface portproxy add v4tov4 listenaddress=<ip_lắng_nghe> listenport=<cổng_lắng_nghe> connectaddress=<ip_kết_nối> connectport=<cổng_kết_nối>
// netsh interface portproxy show all
// netsh interface portproxy delete v4tov4 listenport=<cổng_lắng_nghe>

const http = require('http');
const httpProxy = require('http-proxy');
const { logErrorToFile } = require('./logErrorToFile');
const { logProxyResponse } = require('./logProxyResponse');
const { isBlocked } = require('./rateLimit');

// Tạo một proxy server
const proxy = httpProxy.createProxyServer({});
const ipAddress = '0.0.0.0';
const servers = [
    { exposePort: 6868, mappingUrl: '172.21.150.0:22' },
    { exposePort: 6969, mappingUrl: 'http://homeservice.inviv.vn/' }
];

proxy.on('error', (err, req, res) => {
    console.error(`Đã xảy ra lỗi khi yêu cầu proxy: ${req.method} ${req.url}`);
    console.error('Chi tiết lỗi:', err.message);
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.error('Client IP:', userIp);
    console.log('------------------------------------------------------')

    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        message: 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn.',
        error: err.message,
        code: err.code || 'UNKNOWN_ERROR'
    }));

    // Ghi log lỗi
    // logErrorToFile(err, req);
});

// proxy.on('proxyReq', (proxyReq, req, res) => {
//     let targetServer = req.url.startsWith('/graphql-service1') ? mappingUrl : (req.url.startsWith('/graphql-service2') ? mappingUrl2 : mappingUrl);
//     console.log(`Proxying request to ${targetServer}${req.url}`);
// });

proxy.on('proxyRes', (proxyRes, req, res) => {

    // Log method và headers
    console.log(`Method: ${req.method}`);
    // console.log('Response Headers:', JSON.stringify(proxyRes.headers, null, 2));
    const { server, date, contentType = 'content-type' } = proxyRes.headers;
    console.log(`Server: ${server}\nDate: ${date}\nContent-Type: ${contentType}`);

    // Lấy thông tin username từ headers của request
    const username = req.headers['x-username']
    console.log('Username:', username);

    // Lấy IP của người dùng từ headers
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('Client IP:', userIp);

    // Log trạng thái phản hồi
    const { statusCode, statusMessage } = proxyRes;
    console[statusCode < 300 ? 'log' : statusCode < 500 ? 'warn' : 'error'](
        `${statusCode < 300 ? 'Success' :
            statusCode < 500 ? 'Client Error' : 'Server Error'
        }: ${statusCode} - ${statusMessage}`
    );

    console.log('---------------------------------')

    if (proxyRes.headers['set-cookie']) {
        console.log('Cookies set by target server:', proxyRes.headers['set-cookie']);
    }

    res.setHeader('X-Proxy-Response-Time', Date.now());
    res.setHeader('X-Powered-By', 'Node.js Proxy');

    // Ghi log phản hồi
    // logProxyResponse(proxyRes, req);
});

// export server proxy
for (const server of servers) {
    const mappingUrl = server.mappingUrl
    const exposePort = server.exposePort
    const proxyServer = http.createServer((req, res) => {
        proxy.web(req, res, { target: mappingUrl });
    });
    proxyServer.listen(exposePort, ipAddress, () => {
        console.log(`Proxy server running at http://${ipAddress}:${exposePort}`);
    });
}
