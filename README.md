# 🎟️ EventiX - High-Concurrency Event Ticketing Platform

> Nền tảng phân phối và quản lý vé sự kiện, âm nhạc quy mô lớn. Được thiết kế chuyên biệt để giải quyết các bài toán chịu tải cao (High Concurrency), chống tranh chấp dữ liệu (Race Condition) và ngăn chặn tình trạng sập hệ thống (Crash) trong các đợt mở bán Flash-sale vé concert.

---

## 🎯 1. Ý Nghĩa Của Dự Án (Problem Statement & Solution)
* **Thực trạng:** Các hệ thống bán vé hiện nay tại Việt Nam thường xuyên gặp tình trạng sập trang (Timeout 504), lỗi treo hệ thống, hoặc xảy ra hiện tượng bán quá số lượng vé thực tế (Overbooking) khi hàng chục ngàn người cùng truy cập tại một thời điểm (Ví dụ: Các concert âm nhạc lớn).
* **Giải pháp của EventiX:** 
  - Xây dựng một kiến trúc backend chuẩn công nghiệp, tách rời các lớp xử lý bằng **Phòng chờ ảo (Virtual Waiting Room)**.
  - Sử dụng **In-Memory Database (Redis)** kết hợp **Lua Script** để xử lý hàng đợi và trừ kho vé trực tiếp trên RAM với tốc độ mili-giây, bảo vệ Database quan hệ khỏi việc bị quá tải.
  - Đảm bảo tính nhất quán dữ liệu tuyệt đối (Zero Overbooking) và chống gian lận trong khâu soát vé tại cổng.

---

## 🛠️ 2. Các Công Nghệ Sử Dụng (Tech Stack)
* **Ngôn ngữ & Framework:** Java 21 (tận dụng *Virtual Threads*), Spring Boot 3.3.x, Spring Data JPA, Spring Security 6 (JWT)
* **Database & Caching:** PostgreSQL 16 (Quản lý dữ liệu quan hệ ACID, Flyway Migration), Redis 7 (Caching, ZSET Waiting Room, Redisson Client)
* **Message Broker:** RabbitMQ (Xử lý bất đồng bộ tác vụ nặng, Traffic Smoothing)
* **Load Balancer & DevOps:** Nginx (Reverse Proxy, Round-Robin Load Balancing), Docker & Docker Compose (Multi-instance deployment)
* **Stress Testing:** k6 (Kiểm thử tải hiệu năng hệ thống)

---

## 💡 3. Các Kỹ Thuật & Tính Năng Nổi Bật (Key Technical Highlights)
1. **Atomic Stock Deduction (Trừ kho nguyên tử):** Sử dụng **Redis Lua Script** để thực thi việc kiểm tra và trừ kho vé trên RAM trong một chu kỳ nguyên tử duy nhất, loại bỏ hoàn toàn hiện tượng Race Condition.
2. **Virtual Waiting Room (Phòng chờ ảo):** Ứng dụng **Redis Sorted Set (ZSET)** để xếp hàng người dùng theo thời gian thực (`timestamp`), kiểm soát lưu lượng truy cập bằng cơ chế cấp Pass-Token tự động.
3. **Distributed Lock & Concurrency Control:** Kết hợp **Redisson Distributed Lock** và **Optimistic Locking (`@Version` trong JPA)** để vô hiệu hóa các kịch bản tấn công xung đột đa thiết bị (Ví dụ: 1 tài khoản cố tình thao tác Mua và Hủy đồng thời).
4. **Asynchronous Ticket Issuance (Xử lý bất đồng bộ):** Tích hợp **RabbitMQ** để làm mịn lưu lượng. Sau khi thanh toán thành công, hệ thống phản hồi ngay cho khách trong 50ms, trong khi các tác vụ nặng như sinh vé và tạo mã QR được đẩy cho Worker ngầm xử lý.
5. **Anti-Fraud Gate Check-in (Chống gian lận tại cổng):** Cơ chế đổi trạng thái vé tức thì từ `ISSUED` sang `CHECKED_IN`, phát hiện và báo động đỏ ngay lập tức nếu phát hiện vé quét trùng lặp (Duplicate Scan Detection).

---

## 🔄 4. Luồng Nghiệp Vụ Toàn Diện (End-to-End Business Flow)

Hệ thống vận hành qua **5 giai đoạn khép kín**:
1. **Khởi tạo & Pre-warm Cache:** Ban tổ chức (Organizer) tạo sự kiện và phân khu (Zones). Khi Admin duyệt (Publish), hệ thống tự động nạp trước (Pre-warm) số lượng vé của các Zone thẳng lên RAM của Redis.
2. **Xếp hàng Phòng chờ (Waiting Room):** Khi mở bán, người dùng truy cập được đưa vào hàng đợi Redis ZSET để nhận số thứ tự và thời gian chờ ước tính thay vì làm sập server.
3. **Săn vé & Giữ chỗ (Hold Ticket):** Người dùng có Pass-Token hợp lệ tiến hành chọn vé. Hệ thống dùng **Redis Lua Script** trừ kho và tạo đơn hàng tạm thời (`PENDING`) có thời hạn **10 phút**.
4. **Thanh toán & Xuất vé (Payment & RabbitMQ Worker):** Sau khi khách thanh toán thành công, đơn hàng chuyển sang `PAID`, hệ thống bắn message sang **RabbitMQ**. Tiến trình ngầm (Consumer) bốc message ra và tiến hành xuất bản các bản ghi `Ticket` chính thức vào PostgreSQL.
5. **Soát vé tại cổng (Gate Check-in):** Nhân viên tại cửa dùng app/web quét mã `ticketCode` của khán giả. Hệ thống kiểm tra và cập nhật trạng thái `CHECKED_IN`, chặn đứng mọi nỗ lực chụp màn hình để tái sử dụng vé.

---

## ⚙️ 5. Hướng dẫn Khởi chạy (Getting Started)

### Yêu cầu tiên quyết:
- Đã cài đặt **Java 21**, **Maven**, và **Docker Desktop**.

### Bước 1: Khởi chạy hạ tầng (PostgreSQL, Redis, RabbitMQ, Multi-instance App, Nginx)
```bash
docker compose up -d
```

### Bước 2: Build và Chạy ứng dụng (nếu chạy local debug)
```bash
./mvnw spring-boot:run
```bash
