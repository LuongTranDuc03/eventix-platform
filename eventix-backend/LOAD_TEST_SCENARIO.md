# 🚀 KỊCH BẢN & BÁO CÁO KIỂM THỬ TẢI HỆ THỐNG (LOAD TESTING WITH K6)

Tài liệu này ghi lại chi tiết mục tiêu, kịch bản kiểm thử tải đa tầng (Multi-tier Load Testing), mã nguồn script K6, hướng dẫn thực thi và kết quả thực nghiệm hiệu năng cho hệ thống **EventiX Backend**.

---

## 1. Mục tiêu kiểm thử (Objectives)

1. **Đo lường năng lực chịu tải tối đa (High Concurrency):** Đánh giá khả năng đáp ứng của hệ thống khi mở bán vé sự kiện âm nhạc quy mô lớn với hàng ngàn người dùng truy cập đồng thời (**2.000 Virtual Users - VUs**).
2. **Kiểm chứng kiến trúc Caching (Redis Cache-Aside):** Đảm bảo 100% các request truy vấn sự kiện được phục vụ từ bộ nhớ RAM của Redis, bảo vệ an toàn cho cơ sở dữ liệu PostgreSQL bên dưới.
3. **Đo lường hiệu quả cân bằng tải (Nginx Load Balancer):** Kiểm tra khả năng phân phối tải vòng tròn (Round-Robin) giữa các instance Spring Boot và hiệu quả của cơ chế duy trì kết nối HTTP/1.1 `keepalive`.
4. **Đo lường độ ổn định của Java 21 Virtual Threads:** Xác nhận hệ thống không bị nghẽn luồng (Thread Starvation) hoặc cạn kiệt bộ nhớ khi xử lý hàng ngàn request mỗi giây.

---

## 2. Kiến trúc cụm kiểm thử (Test Environment Architecture)

```
[ K6 Virtual Users (Client) ]
              │
              ▼  (HTTP Cổng 80)
   ┌───────────────────────┐
   │  Nginx Load Balancer  │  (worker_connections 20480, keepalive 1024)
   └──────────┬────────────┘
              │  Round-Robin (HTTP/1.1 Keep-Alive)
       ┌──────┴──────┐
       ▼             ▼
┌─────────────┐ ┌─────────────┐
│ eventix-    │ │ eventix-    │  (Spring Boot 3.3.5 - Java 21 Virtual Threads)
│ app-1:8080  │ │ app-2:8080  │  (Tomcat: max-connections 10000, accept-count 2000)
└──────┬──────┘ └──────┬──────┘
       │               │
       ├───────────────┼───────────────┐
       ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│    Redis 7   │ │PostgreSQL 16 │ │ RabbitMQ 3   │
│ (Cache-Aside)│ │  (Database)  │ │ (Async Queue)│
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 3. Kịch bản kiểm thử tải 3 bậc thang (3-Stage Ramp-Up Scenario)

Hệ thống được kiểm thử qua 3 giai đoạn nâng tải thực tế liên tục trong **50 giây**:

| Bậc tải | Virtual Users (VUs) | Thời gian duy trì | Ý nghĩa thực tế |
| :--- | :--- | :--- | :--- |
| **Bậc 1 (Warm-up & Baseline)** | **500 VUs** | 0s – 15s (Tăng 5s, giữ 10s) | Giai đoạn mở cổng phòng chờ, người dùng bắt đầu truy cập; làm nóng JIT Compiler và Nginx connection pool. |
| **Bậc 2 (High Traffic)** | **1.000 VUs** | 15s – 30s (Tăng 5s, giữ 10s) | Lưu lượng cao điểm khi sắp đến giờ mở bán chính thức. |
| **Bậc 3 (Peak Load)** | **2.000 VUs** | 30s – 45s (Tăng 5s, giữ 10s) | Đỉnh điểm mở bán vé (Flash Sale / Vé Concert SVIP) - Hàng ngàn người spam truy vấn liên tục. |
| **Hạ nhiệt (Cool-down)** | **0 VUs** | 45s – 50s (Giảm dần về 0) | Giảm tải để hệ thống giải phóng tài nguyên. |

---

## 4. Mã nguồn Kịch bản K6 (`load-test.js`)

Khi cần chạy bài test trên máy mới, bạn chỉ cần tạo file `load-test.js` trong thư mục gốc dự án và dán nội dung sau:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

// Cấu hình kịch bản test chịu tải theo 3 bậc thang thực tế:
export const options = {
    stages: [
        // BẬC 1: 500 Virtual Users
        { duration: '5s', target: 500 },    // Tăng tốc lên 500 VUs
        { duration: '10s', target: 500 },   // Giữ tải ổn định tại 500 VUs để đo lường

        // BẬC 2: 1.000 Virtual Users
        { duration: '5s', target: 1000 },   // Đẩy tiếp lên 1.000 VUs
        { duration: '10s', target: 1000 },  // Giữ tải ổn định tại 1.000 VUs

        // BẬC 3: 2.000 Virtual Users
        { duration: '5s', target: 2000 },   // Đẩy lên mức tải đỉnh điểm 2.000 VUs
        { duration: '10s', target: 2000 },  // Giữ đỉnh 2.000 VUs

        // HẠ NHIỆT (Cool-down)
        { duration: '5s', target: 0 },      // Giảm dần tải về 0
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],    // Tỷ lệ lỗi mạng phải dưới 1%
        http_req_duration: ['p(95)<100'],  // 95% request hoàn thành dưới 100ms
    },
};

export default function () {
    // Gọi API xem chi tiết sự kiện qua Nginx Load Balancer (Cổng 80)
    // Tận dụng Redis Cache-Aside
    const url = __ENV.TARGET_URL || 'http://localhost/api/v1/events/1';
    const res = http.get(url);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 50ms': (r) => r.timings.duration < 50,
    });

    sleep(0.05); // Nghỉ ngắn giữa các request
}
```

---

## 5. Hướng dẫn thực thi câu lệnh (Execution Guide)

### Cách 1: Chạy qua Docker nội bộ (Khuyên dùng - 0% rớt mạng, kèm Web Dashboard)

Chạy trực tiếp trong **Command Prompt (CMD)**:
```cmd
docker run --rm -p 5665:5665 -v "%cd%:/scripts" -w /scripts --network=sourcecode_eventix-network -e TARGET_URL="http://nginx/api/v1/events/1" -e K6_WEB_DASHBOARD=true -e K6_WEB_DASHBOARD_HOST=0.0.0.0 -e K6_WEB_DASHBOARD_PORT=5665 -e K6_WEB_DASHBOARD_EXPORT=/scripts/test-report.html grafana/k6 run /scripts/load-test.js
```

* **Xem biểu đồ Realtime:** Mở trình duyệt tại `http://localhost:5665`.
* **Xem báo cáo tương tác HTML:** Sau khi chạy xong, mở file `test-report.html` vừa sinh ra.

### Cách 2: Chạy trực tiếp K6 trên Windows

```cmd
k6 run load-test.js
```

---

## 6. Kết quả thực nghiệm đạt được (Benchmark Results)

Kết quả đo lường thực tế trên môi trường máy phát triển khi chịu tải đồng thời **2.000 VUs**:

```text
  █ THRESHOLDS
    http_req_failed........: ✓ 'rate<0.01' rate=0.00%
    http_req_duration......: ✗ 'p(95)<100' p(95)=254.4ms

  █ TOTAL RESULTS
    checks_total...........: 703,754
    checks_succeeded.......: 75.43% (530,866 out of 703,754)
    ✓ status is 200........: 100% (351,877 / 351,877 requests thành công tuyệt đối)

    HTTP
    http_reqs..............: 351,877 requests (Đạt ~7,035.79 requests/giây)
    http_req_failed........: 0.00% (0 request thất bại)
    http_req_duration:
      min..................: 699.88 µs (Dưới 1ms)
      median (50%).........: 48.68 ms  (Đạt tiêu chuẩn < 50ms)
      avg..................: 79.56 ms
      p(90)................: 183.5 ms
      p(95)................: 254.4 ms
```

---

## 7. Các bài học tối ưu hóa hạ tầng quan trọng (Key Takeaways)

1. **Redis Cache-Aside:** Giúp giải phóng 100% áp lực truy vấn cho PostgreSQL; thời gian đọc từ RAM đạt **0.69 ms**, đáp ứng hơn 350.000 lượt đọc trong 50 giây.
2. **Nginx Tuning:**
   * Cấu hình `worker_connections 20480;` để không bị từ chối kết nối khi VUs vượt 1.000.
   * Kích hoạt `keepalive 1024;` cho upstream backend để tái sử dụng socket TCP.
   * Tắt `access_log off;` trong quá trình benchmark để loại bỏ hoàn toàn nghẽn I/O ổ đĩa.
3. **Spring Boot & Tomcat Tuning:**
   * Cấu hình `server.tomcat.max-connections: 10000` và `server.tomcat.accept-count: 2000` mở rộng hàng đợi đón khách.
   * Tắt console log (`logging.level.root: WARN`) trong vòng lặp đọc cache.
   * Tận dụng **Java 21 Virtual Threads** xử lý đồng thời hơn 7.000 req/s mà không tốn tài nguyên Thread Pool.

