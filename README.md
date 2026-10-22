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
npm run test:e2e
```

Kiểm tra trình duyệt dùng Chromium có sẵn trên máy cloud. Trên máy khác, chạy `npx playwright install chromium` một lần trước khi chạy `npm run test:e2e`.

Dữ liệu nhiệm vụ, xu, XP, phần thưởng và vé được lưu trong localStorage của trình duyệt; chưa đồng bộ tài khoản. Mỗi nhiệm vụ hoàn thành nhận 20 xu và 30 XP, chỉ nhận một lần. Mỗi lượt quay tốn 20 xu, luôn có thưởng. Người dùng có thể thêm phần thưởng, chỉnh trọng số xác suất và dùng vé trong túi đồ. Tài khoản mới có 30 xu để thử.

Bộ đếm dùng thời điểm kết thúc thực tế để tránh trôi thời gian khi tab chạy nền. Phiên đang chạy hoặc tạm dừng được khôi phục sau khi tải lại trang trên cùng trình duyệt. Font Google có font hệ thống dự phòng. Không có thanh toán hoặc tiền thật.

## Hành trình tập trung tự động

Mở **Trạm tập trung**, chọn 15/25/45 phút và bấm **Bắt đầu tập trung**. Nhân vật tự chạy, nhảy qua hố/chướng ngại và đánh quái; không cần điều khiển bằng phím hay nút game. Cảnh đi qua đồng cỏ (0–20%), rừng (20–40%), hầm pha lê (40–60%), biển (60–80%), cổng thành (80–90%) và đánh boss trong 10% thời gian cuối. Nhân vật tự cúi qua trần hầm thấp và bơi dưới biển với nhịp tay chân, bong bóng, cá và rong biển. Nhảy dùng quỹ đạo parabol, có độ nén khi tiếp đất và bụi nhẹ. Hết giờ, boss bị đánh bại và nhân vật về đích.

Hoạt ảnh lấy tiến độ trực tiếp từ thời gian tập trung đã trôi qua. Tạm dừng đóng băng cả đồng hồ lẫn nhân vật. Chuyển tab để làm việc vẫn tiếp tục phiên; quay lại hoặc tải lại sẽ ở đúng tiến độ. Đặt lại bắt đầu hành trình mới. Số phiên hoàn thành được lưu riêng và chỉ tăng một lần mỗi phiên. Nhiệm vụ không tự hoàn thành khi hết giờ: người dùng xác nhận đã làm xong để nhận xu và XP.

Trong khung hành trình có đồng hồ còn lại, phần trăm tiến độ và quote của người bạn đồng hành. Thanh tiến độ chạy từ 0–100% theo thời lượng thực tế của phiên. Bầu trời theo giờ và múi giờ hiện tại trên thiết bị: bình minh 05:00–07:00, ban ngày 07:00–17:00, hoàng hôn 17:00–19:00, ban đêm 19:00–05:00. Màu chuyển dần theo giờ thực, kể cả khi phiên tạm dừng hoặc đã hoàn thành; không cần quyền vị trí. Có thể giữ cảnh tự động theo từng chặng hoặc chọn đồng cỏ, rừng, bờ biển, đường hầm, dưới biển mà không đặt lại đồng hồ.

Quote đổi sau mỗi phút tập trung, dừng cùng phiên và có nút đổi thủ công. Các giọng gồm xen kẽ, dễ thương, hài hước, thực tế và thúc nhẹ; giọng thúc nhẹ được chọn riêng. Lựa chọn cảnh và giọng động viên được lưu trên trình duyệt.
