-- ============================================================================
-- EVENTIX - V2: SEED DỮ LIỆU ĐA DẠNG, TOÀN DIỆN CHO CÁC BẢNG (COMPREHENSIVE DATA)
-- Mật khẩu mặc định cho toàn bộ tài khoản thử nghiệm: "123456" hoặc "Password123@"
-- Hash BCrypt chuẩn: $2a$10$3/oVaphbbCEJqANFzDRlIO8F0ZS6D6RwSqQlaIYm5K9oyhWO9nMaW
-- ============================================================================

-- 1. SEED TÀI KHOẢN NGƯỜI DÙNG (USERS)
INSERT INTO users (email, password_hash, full_name, phone_number, is_active, created_at, updated_at)
VALUES 
-- Quản trị viên
('admin@eventix.com', '$2a$10$3/oVaphbbCEJqANFzDRlIO8F0ZS6D6RwSqQlaIYm5K9oyhWO9nMaW', 'Quản Trị Viên Hệ Thống', '0901234567', TRUE, NOW() - INTERVAL '30 days', NOW()),

-- Ban tổ chức sự kiện
('organizer.music@eventix.com', '$2a$10$3/oVaphbbCEJqANFzDRlIO8F0ZS6D6RwSqQlaIYm5K9oyhWO9nMaW', 'Nexus Entertainment Vietnam', '0912345678', TRUE, NOW() - INTERVAL '25 days', NOW()),
('organizer.tech@eventix.com', '$2a$10$3/oVaphbbCEJqANFzDRlIO8F0ZS6D6RwSqQlaIYm5K9oyhWO9nMaW', 'Hiệp Hội Công Nghệ & AI Summit', '0923456789', TRUE, NOW() - INTERVAL '20 days', NOW()),

-- Nhân viên soát vé tại cổng
('staff.gate.a@eventix.com', '$2a$10$3/oVaphbbCEJqANFzDRlIO8F0ZS6D6RwSqQlaIYm5K9oyhWO9nMaW', 'Nguyễn Văn Minh (Soát vé Cổng A)', '0934567890', TRUE, NOW() - INTERVAL '15 days', NOW()),
('staff.gate.b@eventix.com', '$2a$10$3/oVaphbbCEJqANFzDRlIO8F0ZS6D6RwSqQlaIYm5K9oyhWO9nMaW', 'Lê Thị Ngọc Lan (Soát vé Cổng B)', '0945678901', TRUE, NOW() - INTERVAL '15 days', NOW()),

-- Khách hàng mua vé
('tranducluong@gmail.com', '$2a$10$3/oVaphbbCEJqANFzDRlIO8F0ZS6D6RwSqQlaIYm5K9oyhWO9nMaW', 'Trần Đức Lương', '0987654321', TRUE, NOW() - INTERVAL '10 days', NOW()),
('hoangnam.ticket@gmail.com', '$2a$10$3/oVaphbbCEJqANFzDRlIO8F0ZS6D6RwSqQlaIYm5K9oyhWO9nMaW', 'Hoàng Nam', '0976543210', TRUE, NOW() - INTERVAL '8 days', NOW()),
('thutrang.music@gmail.com', '$2a$10$3/oVaphbbCEJqANFzDRlIO8F0ZS6D6RwSqQlaIYm5K9oyhWO9nMaW', 'Vũ Thu Trang', '0965432109', TRUE, NOW() - INTERVAL '6 days', NOW()),
('ducminh.fan@gmail.com', '$2a$10$3/oVaphbbCEJqANFzDRlIO8F0ZS6D6RwSqQlaIYm5K9oyhWO9nMaW', 'Đỗ Đức Minh', '0954321098', TRUE, NOW() - INTERVAL '5 days', NOW()),
('ngocanh.concert@gmail.com', '$2a$10$3/oVaphbbCEJqANFzDRlIO8F0ZS6D6RwSqQlaIYm5K9oyhWO9nMaW', 'Phạm Ngọc Ánh', '0943210987', TRUE, NOW() - INTERVAL '3 days', NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. GÁN VAI TRÒ (USER_ROLES)
-- Admin
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@eventix.com' AND r.name IN ('ROLE_ADMIN', 'ROLE_ORGANIZER')
ON CONFLICT DO NOTHING;

-- Organizers
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email IN ('organizer.music@eventix.com', 'organizer.tech@eventix.com') AND r.name = 'ROLE_ORGANIZER'
ON CONFLICT DO NOTHING;

-- Staffs
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email IN ('staff.gate.a@eventix.com', 'staff.gate.b@eventix.com') AND r.name = 'ROLE_STAFF'
ON CONFLICT DO NOTHING;

-- Attendees
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email IN (
    'tranducluong@gmail.com',
    'hoangnam.ticket@gmail.com',
    'thutrang.music@gmail.com',
    'ducminh.fan@gmail.com',
    'ngocanh.concert@gmail.com'
) AND r.name = 'ROLE_ATTENDEE'
ON CONFLICT DO NOTHING;

-- 3. SEED DANH SÁCH SỰ KIỆN PHONG PHÚ (EVENTS)
-- Lấy ID của organizer.music@eventix.com làm ban tổ chức
DO $$
DECLARE
    v_music_org_id BIGINT;
    v_tech_org_id BIGINT;
    v_staff_user_id BIGINT;
    v_event1_id BIGINT;
    v_event2_id BIGINT;
    v_event3_id BIGINT;
    v_event4_id BIGINT;
    v_event5_id BIGINT;
    v_event6_id BIGINT;
    v_luong_user_id BIGINT;
    v_order1_id BIGINT;
    v_order2_id BIGINT;
    v_zone1_id BIGINT;
    v_zone2_id BIGINT;
    v_zone3_id BIGINT;
BEGIN
    SELECT id INTO v_music_org_id FROM users WHERE email = 'organizer.music@eventix.com';
    IF v_music_org_id IS NULL THEN
        SELECT id INTO v_music_org_id FROM users LIMIT 1;
    END IF;

    SELECT id INTO v_tech_org_id FROM users WHERE email = 'organizer.tech@eventix.com';
    IF v_tech_org_id IS NULL THEN
        v_tech_org_id := v_music_org_id;
    END IF;

    SELECT id INTO v_staff_user_id FROM users WHERE email = 'staff.gate.a@eventix.com';
    SELECT id INTO v_luong_user_id FROM users WHERE email = 'tranducluong@gmail.com';

    -- SỰ KIỆN 1: Đại nhạc hội Anh Trai Say Hi (PUBLISHED - Đang mở bán)
    INSERT INTO events (organizer_id, title, description, venue, banner_url, status, sales_start_time, sales_end_time, max_tickets_per_user)
    VALUES (
        v_music_org_id,
        'Anh Trai "Say Hi" - The Grand Final Live Concert 2026',
        E'🔥 ĐÊM ĐẠI NHẠC HỘI TRỰC TIẾP QUY MÔ 40.000 KHÁN GIẢ LỚN NHẤT NĂM 2026!\n\n' ||
        E'Sau hành trình bùng nổ đầy cảm xúc làm nức lòng hàng triệu người hâm mộ trên khắp cả nước, đêm Concert Chung kết "Anh Trai Say Hi 2026" chính thức đổ bộ Sân vận động Quốc gia Mỹ Đình. Sự kiện mang đến một trải nghiệm nghệ thuật và âm nhạc đỉnh cao chưa từng có tại Việt Nam.\n\n' ||
        E'✨ ĐIỂM NHẤN CÔNG NGHỆ VÀ SÂN KHẤU ĐỘC BẢN:\n' ||
        E'• Hệ thống sân khấu đa tầng 360 độ hiện đại với trục nâng thủy lực cao 15 mét, đưa các nghệ sĩ tiếp cận gần nhất với khán giả ở mọi khán đài.\n' ||
        E'• Dàn âm thanh L-Acoustics K1/K2 chuẩn lưu diễn thế giới kết hợp hơn 1.200 dàn đèn moving head, pháo hoa nghệ thuật và hiệu ứng visual 3D Hologram sống động.\n' ||
        E'• Hơn 35 ca khúc hit đình đám được Giám đốc Âm nhạc JustaTee và ban nhạc sống phối khí mới hoàn toàn theo phong cách Pop-Rock, R&B và EDM bùng cháy.\n\n' ||
        E'🎵 DÀN NGHỆ SĨ LINE-UP ĐỈNH CAO:\n' ||
        E'Quy tụ trọn vẹn 30 Anh Trai tài năng: HIEUTHUHAI, Isaac, Đức Phúc, Erik, Anh Tú Atus, Quang Hùng MasterD, Rhyder, HURRYKNG, Pháp Kiều, Song Luân... cùng sự xuất hiện đặc biệt của các nghệ sĩ khách mời quốc tế bí mật.\n\n' ||
        E'🛡️ CHÍNH SÁCH BẢO VỆ VÀ AN NINH VÉ CHUẨN EVENTIX:\n' ||
        E'1. Toàn bộ vé phát hành dưới dạng Vé Điện Tử với MÃ QR ĐỘNG XOAY TUA (Dynamic Anti-Screenshot QR) làm mới liên tục mỗi 15 giây. Nghiêm cấm chụp màn hình để bán lại.\n' ||
        E'2. Cổng soát vé Kiosk tự động tích hợp cảm biến camera tốc độ cao, đảm bảo check-in thông suốt 1.000 khán giả/phút.\n' ||
        E'3. Trạm tiếp nước miễn phí, lều Y tế khẩn cấp và đội ngũ tình nguyện viên hỗ trợ 24/7 xuyên suốt chương trình.',
        'Sân vận động Quốc gia Mỹ Đình, Hà Nội',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1400&q=80',
        'PUBLISHED',
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '14 days',
        4
    ) RETURNING id INTO v_event1_id;

    -- Phân khu sự kiện 1
    INSERT INTO zones (event_id, name, zone_type, price, total_capacity, available_capacity) VALUES
    (v_event1_id, 'VIP Fanzone Say Hi A1 (Đứng - Quanh Sân Khấu Chính)', 'STANDING', 2800000, 800, 142) RETURNING id INTO v_zone1_id;
    INSERT INTO zones (event_id, name, zone_type, price, total_capacity, available_capacity) VALUES
    (v_event1_id, 'VIP Fanzone Say Hi B1 (Đứng - Cánh Sân Khấu)', 'STANDING', 2800000, 800, 95) RETURNING id INTO v_zone2_id;
    INSERT INTO zones (event_id, name, zone_type, price, total_capacity, available_capacity) VALUES
    (v_event1_id, 'CAT 1 - Khán Đài A (Ghế VIP Trung Tâm)', 'SEATED', 2000000, 2500, 820) RETURNING id INTO v_zone3_id;
    INSERT INTO zones (event_id, name, zone_type, price, total_capacity, available_capacity) VALUES
    (v_event1_id, 'CAT 2 - Khán Đài B (Ghế Trực Diện Sân Khấu)', 'SEATED', 1400000, 3500, 1450);
    INSERT INTO zones (event_id, name, zone_type, price, total_capacity, available_capacity) VALUES
    (v_event1_id, 'CAT 3 - Khán Đài C & D (Ghế Cánh Vòm)', 'SEATED', 900000, 4000, 2100);
    INSERT INTO zones (event_id, name, zone_type, price, total_capacity, available_capacity) VALUES
    (v_event1_id, 'General Admission (GA Standing Sân Cỏ)', 'STANDING', 700000, 5000, 2800);

    -- SỰ KIỆN 2: Hà Anh Tuấn Live Concert - Chân Trời Rực Rỡ (PUBLISHED)
    INSERT INTO events (organizer_id, title, description, venue, banner_url, status, sales_start_time, sales_end_time, max_tickets_per_user)
    VALUES (
        v_music_org_id,
        'Hà Anh Tuấn Live Concert - Chân Trời Rực Rỡ (The Radiant Horizon)',
        E'Đêm nhạc acoustic lãng mạn hòa cùng dàn nhạc giao hưởng 60 nhạc công và huyền thoại âm nhạc thế giới Kitaro. ' ||
        E'Những thanh âm mộc mạc của đàn hạc, cello và piano dẫn dắt khán giả qua từng miền ký ức tươi đẹp. ' ||
        E'Chương trình được đầu tư tỉ mỉ từng chi tiết âm học phòng hòa nhạc nhằm mang lại trải nghiệm nghe thuần khiết nhất.',
        'Trung tâm Hội nghị Quốc gia, Hà Nội',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80',
        'PUBLISHED',
        NOW() - INTERVAL '5 days',
        NOW() + INTERVAL '20 days',
        2
    ) RETURNING id INTO v_event2_id;

    INSERT INTO zones (event_id, name, zone_type, price, total_capacity, available_capacity) VALUES
    (v_event2_id, 'Diamond VIP (Hàng Đầu)', 'SEATED', 3500000, 300, 45),
    (v_event2_id, 'Gold Premium', 'SEATED', 2500000, 600, 180),
    (v_event2_id, 'Silver Standard', 'SEATED', 1600000, 1000, 410),
    (v_event2_id, 'Balcony Tầng 2', 'SEATED', 1000000, 800, 290);

    -- SỰ KIỆN 3: Monsoon Music Festival 2026 (PUBLISHED)
    INSERT INTO events (organizer_id, title, description, venue, banner_url, status, sales_start_time, sales_end_time, max_tickets_per_user)
    VALUES (
        v_music_org_id,
        'Monsoon Music Festival 2026 - Lễ Hội Âm Nhạc Quốc Tế Gió Mùa',
        E'Lễ hội âm nhạc quốc tế ngoài trời thường niên lớn nhất miền Bắc kéo dài 3 ngày liên tục tại di sản Hoàng Thành Thăng Long. ' ||
        E'Quy tụ hơn 40 ban nhạc và nghệ sĩ độc lập từ Anh, Pháp, Nhật Bản, Hàn Quốc và Việt Nam. ' ||
        E'Không gian lễ hội kết hợp hội chợ sáng tạo, ẩm thực đường phố và các workshop nghệ thuật tương tác mở cho giới trẻ.',
        'Hoàng Thành Thăng Long, Hà Nội',
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1400&q=80',
        'PUBLISHED',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '30 days',
        6
    ) RETURNING id INTO v_event3_id;

    INSERT INTO zones (event_id, name, zone_type, price, total_capacity, available_capacity) VALUES
    (v_event3_id, 'Vé Trọn Gói 3 Ngày (All-Access 3-Day Pass)', 'STANDING', 2200000, 1500, 480),
    (v_event3_id, 'Vé 1 Ngày Thứ 7 (Saturday Pass)', 'STANDING', 850000, 3000, 1200),
    (v_event3_id, 'Vé 1 Ngày Chủ Nhật (Sunday Pass)', 'STANDING', 850000, 3000, 1560),
    (v_event3_id, 'Vé Sinh Viên (Student Early Bird)', 'STANDING', 550000, 2000, 320);

    -- SỰ KIỆN 4: Chung Kết VCS Mùa Hè 2026 - E-Sports (PUBLISHED)
    INSERT INTO events (organizer_id, title, description, venue, banner_url, status, sales_start_time, sales_end_time, max_tickets_per_user)
    VALUES (
        v_tech_org_id,
        'Chung Kết Thế Giới VCS Mùa Hè 2026 - Đấu Trường E-Sports Đỉnh Cao',
        E'Trận đại chiến nghẹt thở tranh cúp vô địch Liên Minh Huyền Thoại Việt Nam và tấm vé vàng tham dự Chung Kết Thế Giới. ' ||
        E'Màn so tài kỹ năng đỉnh cao giữa các chiến đội hàng đầu: GAM Esports, Vikings Force, Team Secret. ' ||
        E'Khán giả được trải nghiệm âm thanh bình luận vòm Dolby Atmos, màn hình LED cong 500m2 và nhận quà tặng trang phục ingame độc quyền.',
        'Nhà thi đấu Quân khu 7, TP. Hồ Chí Minh',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80',
        'PUBLISHED',
        NOW() - INTERVAL '3 days',
        NOW() + INTERVAL '10 days',
        4
    ) RETURNING id INTO v_event4_id;

    INSERT INTO zones (event_id, name, zone_type, price, total_capacity, available_capacity) VALUES
    (v_event4_id, 'Fanzone Trung Tâm Sân Đấu', 'STANDING', 750000, 800, 120),
    (v_event4_id, 'Khán Đài Khán Giả Khu A', 'SEATED', 500000, 1500, 430),
    (v_event4_id, 'Khán Đài Khán Giả Khu B', 'SEATED', 350000, 2000, 890);

    -- SỰ KIỆN 5: Vietnam Tech & AI Summit 2026 (PUBLISHED)
    INSERT INTO events (organizer_id, title, description, venue, banner_url, status, sales_start_time, sales_end_time, max_tickets_per_user)
    VALUES (
        v_tech_org_id,
        'Vietnam Tech & AI Summit 2026 - Định Hình Tương Lai Kỷ Nguyên Số',
        E'Hội nghị thượng đỉnh công nghệ và Trí tuệ nhân tạo quy mô 5.000 chuyên gia, kỹ sư và quỹ đầu tư mạo hiểm hàng đầu Đông Nam Á. ' ||
        E'Chủ đề: Generative AI, Hệ thống xử lý dữ liệu quy mô lớn (High-Concurrency Architecture), Điện toán đám mây và Bảo mật thế hệ mới.',
        'Trung tâm Hội chợ & Triển lãm Sài Gòn (SECC), TP. Hồ Chí Minh',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1400&q=80',
        'PUBLISHED',
        NOW() - INTERVAL '4 days',
        NOW() + INTERVAL '45 days',
        5
    ) RETURNING id INTO v_event5_id;

    INSERT INTO zones (event_id, name, zone_type, price, total_capacity, available_capacity) VALUES
    (v_event5_id, 'Vé VIP Executive Pass (Bao gồm Tiệc Gala Dinner)', 'SEATED', 4500000, 200, 68),
    (v_event5_id, 'Vé Tiêu Chuẩn (Standard Delegate)', 'SEATED', 1500000, 1000, 390),
    (v_event5_id, 'Vé Khởi Nghiệp & Sinh Viên (Developer Pass)', 'SEATED', 600000, 800, 210);

    -- SỰ KIỆN 6: Sơn Tùng M-TP World Tour (DRAFT - Dành cho ADMIN duyệt & Pre-warm)
    INSERT INTO events (organizer_id, title, description, venue, banner_url, status, sales_start_time, sales_end_time, max_tickets_per_user)
    VALUES (
        v_music_org_id,
        'Sơn Tùng M-TP - Sky Wave World Tour 2026',
        E'Tour diễn kỷ niệm hành trình âm nhạc của nghệ sĩ biểu tượng V-Pop Sơn Tùng M-TP. ' ||
        E'Sự kiện đang trong giai đoạn tiền thẩm định kỹ thuật hạ tầng và chờ Quản trị viên (Admin) phê duyệt để nạp kho vé lên cụm Redis Cache.',
        'Sân vận động Quân khu 7, TP. Hồ Chí Minh',
        'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1400&q=80',
        'DRAFT',
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '20 days',
        4
    ) RETURNING id INTO v_event6_id;

    INSERT INTO zones (event_id, name, zone_type, price, total_capacity, available_capacity) VALUES
    (v_event6_id, 'SVIP Sky Lounge A', 'SEATED', 3800000, 400, 400),
    (v_event6_id, 'Fanzone Wave A (Đứng)', 'STANDING', 2200000, 1000, 1000),
    (v_event6_id, 'CAT 1 - Khán Đài A', 'SEATED', 1800000, 1500, 1500),
    (v_event6_id, 'CAT 2 - Khán Đài B', 'SEATED', 1200000, 2500, 2500);

    -- 4. SEED ĐƠN HÀNG (ORDERS) & VÉ ĐIỆN TỬ (TICKETS) MẪU CHO TÀI KHOẢN KHÁCH HÀNG
    IF v_luong_user_id IS NOT NULL AND v_zone1_id IS NOT NULL THEN
        -- Đơn hàng 1: Đã thanh toán (PAID) 2 vé VIP Anh Trai Say Hi
        INSERT INTO orders (order_code, user_id, event_id, zone_id, quantity, total_amount, status, expires_at, created_at, updated_at)
        VALUES (
            'ORD-202611-HI01',
            v_luong_user_id,
            v_event1_id,
            v_zone1_id,
            2,
            5600000,
            'PAID',
            NOW() + INTERVAL '10 minutes',
            NOW() - INTERVAL '1 day',
            NOW() - INTERVAL '1 day'
        ) RETURNING id INTO v_order1_id;

        -- Sinh 2 vé điện tử tương ứng cho đơn hàng 1 (1 vé ISSUED sẵn sàng quét, 1 vé đã CHECKED_IN)
        INSERT INTO tickets (ticket_code, order_id, user_id, zone_id, seat_number, status, checked_in_at, checked_in_by, created_at)
        VALUES 
        ('TKT-SAYHI-VIP-001', v_order1_id, v_luong_user_id, v_zone1_id, NULL, 'ISSUED', NULL, NULL, NOW() - INTERVAL '1 day'),
        ('TKT-SAYHI-VIP-002', v_order1_id, v_luong_user_id, v_zone1_id, NULL, 'CHECKED_IN', NOW() - INTERVAL '2 hours', v_staff_user_id, NOW() - INTERVAL '1 day');

        -- Đơn hàng 2: Đã thanh toán 1 vé CAT 1 Khán đài A
        INSERT INTO orders (order_code, user_id, event_id, zone_id, quantity, total_amount, status, expires_at, created_at, updated_at)
        VALUES (
            'ORD-202611-HI02',
            v_luong_user_id,
            v_event1_id,
            v_zone3_id,
            1,
            2000000,
            'PAID',
            NOW() + INTERVAL '10 minutes',
            NOW() - INTERVAL '5 hours',
            NOW() - INTERVAL '5 hours'
        ) RETURNING id INTO v_order2_id;

        INSERT INTO tickets (ticket_code, order_id, user_id, zone_id, seat_number, status, created_at)
        VALUES 
        ('TKT-SAYHI-CAT1-A12', v_order2_id, v_luong_user_id, v_zone3_id, 'Hàng A - Ghế 12', 'ISSUED', NOW() - INTERVAL '5 hours');
    END IF;

END $$;

