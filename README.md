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

Mở **Trạm tập trung**, chọn 15/25/45 phút và bấm **Bắt đầu tập trung**. Nhân vật tự chạy, nhảy qua hố/chướng ngại và đánh quái; không cần điều khiển bằng phím hay nút game. Cảnh đi qua đồng cỏ (0–30%), rừng (30–65%), cổng thành (65–90%) và đánh boss trong 10% thời gian cuối. Hết giờ, boss bị đánh bại và nhân vật về đích.

Hoạt ảnh lấy tiến độ trực tiếp từ thời gian tập trung đã trôi qua. Tạm dừng đóng băng cả đồng hồ lẫn nhân vật. Chuyển tab để làm việc vẫn tiếp tục phiên; quay lại hoặc tải lại sẽ ở đúng tiến độ. Đặt lại bắt đầu hành trình mới. Số phiên hoàn thành được lưu riêng và chỉ tăng một lần mỗi phiên. Nhiệm vụ không tự hoàn thành khi hết giờ: người dùng xác nhận đã làm xong để nhận xu và XP.

Trong khung hành trình có đồng hồ còn lại, phần trăm tiến độ và quote của người bạn đồng hành. Thanh tiến độ chạy từ 0–100% theo thời lượng thực tế của phiên. Bầu trời chuyển ngày → hoàng hôn → đêm → bình minh theo tiến độ (không theo giờ địa phương). Có thể giữ cảnh tự động theo từng chặng hoặc chọn đồng cỏ, rừng, bờ biển mà không đặt lại đồng hồ.

Quote đổi sau mỗi phút tập trung, dừng cùng phiên và có nút đổi thủ công. Các giọng gồm xen kẽ, dễ thương, hài hước, thực tế và thúc nhẹ; giọng thúc nhẹ được chọn riêng. Lựa chọn cảnh và giọng động viên được lưu trên trình duyệt.
