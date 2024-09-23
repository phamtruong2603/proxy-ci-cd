// Thông tin về số lượng yêu cầu của mỗi IP
const requestCounts = {};
const MAX_REQUESTS = 100;  // Số lượng yêu cầu tối đa
const WINDOW_TIME = 15 * 60 * 1000;  // 15 phút

// Hàm kiểm tra nếu IP vượt quá giới hạn
function isBlocked(ip) {
    const currentTime = Date.now();
    const requestInfo = requestCounts[ip];

    if (!requestInfo) {
        // Nếu IP này chưa được ghi nhận, khởi tạo thông tin
        requestCounts[ip] = { count: 1, firstRequestTime: currentTime };
        return false;
    }

    const elapsedTime = currentTime - requestInfo.firstRequestTime;

    if (elapsedTime > WINDOW_TIME) {
        // Reset lại số lượng yêu cầu nếu vượt quá thời gian cửa sổ
        requestCounts[ip] = { count: 1, firstRequestTime: currentTime };
        return false;
    }

    if (requestInfo.count >= MAX_REQUESTS) {
        return true;  // IP đã gửi quá số lượng yêu cầu cho phép
    }

    requestInfo.count++;
    return false;
}

module.exports = { isBlocked };