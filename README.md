# Deadline Run

Ứng dụng pixel giúp chia nhỏ deadline, tập trung và đổi tiến độ lấy phần thưởng ngoài đời.

## Chạy local

Node.js 22.12+ hoặc 24 LTS.

```sh
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5173
```

```sh
npm test
npm run build
```

Dữ liệu nhiệm vụ, xu, XP, phần thưởng và vé được lưu trong localStorage của trình duyệt; chưa đồng bộ tài khoản. Mỗi nhiệm vụ hoàn thành nhận 20 xu và 30 XP, chỉ nhận một lần. Mỗi lượt quay tốn 20 xu, luôn có thưởng. Người dùng có thể thêm phần thưởng, chỉnh trọng số xác suất và dùng vé trong túi đồ. Tài khoản mới có 30 xu để thử.

Bộ đếm dùng thời điểm kết thúc thực tế để tránh trôi thời gian khi tab chạy nền. Phiên đang chạy chưa được khôi phục sau khi tải lại trang. Font Google có font hệ thống dự phòng. Không có thanh toán hoặc tiền thật.

## Đấu trường pixel

Mở **Đấu trường pixel** hoặc **Vào đấu trường** từ trang nhiệm vụ. A/D hoặc mũi tên để di chuyển, Space/W/mũi tên lên để nhảy, J để vung kiếm, P để tạm dừng. Trên điện thoại dùng các nút dưới màn hình. Khi chuyển sang ứng dụng hoặc tab khác, trận đấu tự tạm dừng.

Ba đợt gồm slime, bóng ma và boss Trì Hoãn. Boss lóe sáng trước khi lao tới. Nhân vật có 100 HP và hồi 20 HP khi qua đợt. Mỗi nhiệm vụ hoàn thành tăng 2 sát thương (tối đa +40). Chiến thắng lưu số lần vượt ải; trận đang chơi không lưu sau khi rời màn hình hoặc tải lại. Trận đấu không tạo thêm xu quay thưởng.
