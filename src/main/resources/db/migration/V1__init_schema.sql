-- ============================================================================
-- SCRIPT DI TRÚ DỮ LIỆU BAN ĐẦU: V1__init_schema.sql
-- HỆ THỐNG PHÂN PHỐI VÉ SỰ KIỆN EVENTIX
-- ============================================================================

-- 1. BẢNG QUẢN LÝ QUYỀN HẠN (PERMISSIONS)
CREATE TABLE permissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,       -- Ví dụ: 'event:create', 'ticket:scan'
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG VAI TRÒ (ROLES)
CREATE TABLE roles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,       -- Ví dụ: 'ROLE_ADMIN', 'ROLE_ORGANIZER', 'ROLE_ATTENDEE', 'ROLE_STAFF'
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- BẢNG TRUNG GIAN: ROLE - PERMISSION (N - N)
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 3. BẢNG NGƯỜI DÙNG (USERS)
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- BẢNG TRUNG GIAN: USER - ROLE (N - N)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 4. BẢNG SỰ KIỆN (EVENTS)
CREATE TABLE events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organizer_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    venue VARCHAR(255) NOT NULL,
    banner_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- DRAFT, PENDING_APPROVAL, PUBLISHED, COMPLETED, CANCELLED
    sales_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    sales_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_tickets_per_user INT DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. BẢNG PHÂN KHU VÉ (ZONES)
CREATE TABLE zones (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,                  -- Ví dụ: 'VIP 1', 'Fanzone A'
    zone_type VARCHAR(20) NOT NULL,              -- 'STANDING' hoặc 'SEATED'
    price NUMERIC(15, 2) NOT NULL,
    total_capacity INT NOT NULL,                 -- Tổng số vé phát hành của Zone
    available_capacity INT NOT NULL,             -- Số vé còn lại (sync với Redis)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG ĐƠN HÀNG (ORDERS) - CORE XỬ LÝ CONCURRENCY
CREATE TABLE orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,      -- Mã hiển thị cho khách: ORD-202611-XXXX
    user_id BIGINT NOT NULL REFERENCES users(id),
    event_id BIGINT NOT NULL REFERENCES events(id),
    zone_id BIGINT NOT NULL REFERENCES zones(id),
    quantity INT NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, CANCELLED, EXPIRED
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,  -- Mốc hết hạn 10 phút
    version INT NOT NULL DEFAULT 0,                -- CHỐT CHẶN OPTIMISTIC LOCKING CHỐNG XUNG ĐỘT 2 THIẾT BỊ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. BẢNG VÉ ĐIỆN TỬ (TICKETS)
CREATE TABLE tickets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ticket_code VARCHAR(100) NOT NULL UNIQUE,    -- Mã vé duy nhất dùng để tạo Dynamic QR
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    zone_id BIGINT NOT NULL REFERENCES zones(id),
    seat_number VARCHAR(50),                     -- NULL nếu là vé STANDING, 'A-12' nếu là SEATED
    status VARCHAR(30) NOT NULL DEFAULT 'ISSUED',-- ISSUED, CHECKED_IN, REVOKED
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_in_by BIGINT REFERENCES users(id),   -- ID của Staff quét vé
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ĐÁNH CHỈ MỤC (INDEXES) TỐI ƯU HÓA HIỆU NĂNG TRUY VẤN
-- ============================================================================
CREATE INDEX idx_events_status_sales_time ON events(status, sales_start_time);
CREATE INDEX idx_zones_event_id ON zones(event_id);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_expires_at ON orders(expires_at) WHERE status = 'PENDING';
CREATE INDEX idx_tickets_code ON tickets(ticket_code);
CREATE INDEX idx_tickets_order_id ON tickets(order_id);

-- ============================================================================
-- DỮ LIỆU KHỞI TẠO MẪU (SEED DATA)
-- ============================================================================
INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'Quản trị viên toàn hệ thống'),
('ROLE_ORGANIZER', 'Ban tổ chức sự kiện'),
('ROLE_ATTENDEE', 'Khách hàng săn vé'),
('ROLE_STAFF', 'Nhân viên soát vé tại cổng');

INSERT INTO permissions (code, description) VALUES
('event:create', 'Quyền tạo sự kiện'),
('event:approve', 'Quyền phê duyệt sự kiện'),
('zone:configure', 'Quyền cấu hình phân khu và giá vé'),
('order:hold', 'Quyền giữ chỗ vé'),
('ticket:scan', 'Quyền quét mã QR soát vé');

-- Gán quyền cho ADMIN (Sở hữu tất cả)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ROLE_ADMIN';

-- Gán quyền cho ORGANIZER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ROLE_ORGANIZER' AND p.code IN ('event:create', 'zone:configure');

-- Gán quyền cho ATTENDEE
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ROLE_ATTENDEE' AND p.code IN ('order:hold');

-- Gán quyền cho STAFF
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ROLE_STAFF' AND p.code IN ('ticket:scan');

-- Cấp quyền ROLE_ORGANIZER và ROLE_ADMIN cho User có id = 1
INSERT INTO user_roles (user_id, role_id) 
SELECT 1, id FROM roles WHERE name IN ('ROLE_ORGANIZER', 'ROLE_ADMIN');