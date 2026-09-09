-- ========================================================
-- POSTGRESQL SCHEMA FOR NEON.TECH (TIKTUBE PROJECT)
-- ========================================================

-- 1. Bảng người dùng
CREATE TABLE IF NOT EXISTS nguoi_dung (
    nguoi_dung_id SERIAL PRIMARY KEY,
    ten_dang_nhap VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    mat_khau_hash TEXT NOT NULL,
    anh_dai_dien TEXT NULL,
    do_tuoi VARCHAR(50) DEFAULT '18',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng danh mục
CREATE TABLE IF NOT EXISTS danh_muc (
    danh_muc_id SERIAL PRIMARY KEY,
    ten_danh_muc VARCHAR(255) NOT NULL
);

-- 3. Bảng thẻ tag
CREATE TABLE IF NOT EXISTS the_tag (
    tag_id SERIAL PRIMARY KEY,
    danh_muc_id INT REFERENCES danh_muc(danh_muc_id) ON DELETE SET NULL,
    ten_tag VARCHAR(255) NOT NULL
);

-- 4. Bảng video
CREATE TABLE IF NOT EXISTS video (
    video_id SERIAL PRIMARY KEY,
    nguoi_dung_id INT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    tieu_de VARCHAR(255) NOT NULL,
    mo_ta TEXT NULL,
    duong_dan_video TEXT NOT NULL,
    duong_dan_anh_bia TEXT NULL,
    thoi_luong DOUBLE PRECISION DEFAULT 0,
    luot_xem BIGINT DEFAULT 0,
    danh_muc_id INT REFERENCES danh_muc(danh_muc_id) ON DELETE SET NULL,
    tag_id INT REFERENCES the_tag(tag_id) ON DELETE SET NULL,
    trang_thai VARCHAR(50) DEFAULT 'da_duyet',
    danh_cho_tre_em BOOLEAN DEFAULT TRUE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng người xem (đếm lượt xem theo IP)
CREATE TABLE IF NOT EXISTS nguoi_xem (
    nguoi_xem_id SERIAL PRIMARY KEY,
    ip_address VARCHAR(50),
    video_id INT REFERENCES video(video_id) ON DELETE CASCADE,
    luot_xem INT DEFAULT 0,
    ngay_xem TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng bình luận
CREATE TABLE IF NOT EXISTS binh_luan (
    binh_luan_id SERIAL PRIMARY KEY,
    video_id INT NOT NULL REFERENCES video(video_id) ON DELETE CASCADE,
    nguoi_dung_id INT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    noi_dung TEXT NOT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bảng lượt thích
CREATE TABLE IF NOT EXISTS luot_thich (
    luot_thich_id SERIAL PRIMARY KEY,
    video_id INT NOT NULL REFERENCES video(video_id) ON DELETE CASCADE,
    nguoi_dung_id INT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_luot_thich UNIQUE (video_id, nguoi_dung_id)
);

-- 8. Bảng đăng ký kênh
CREATE TABLE IF NOT EXISTS dang_ky_kenh (
    dang_ky_id SERIAL PRIMARY KEY,
    nguoi_dung_id INT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    kenh_id INT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    ngay_dang_ky TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_dang_ky UNIQUE (nguoi_dung_id, kenh_id)
);

-- 9. Bảng thông báo
CREATE TABLE IF NOT EXISTS thong_bao (
    thong_bao_id SERIAL PRIMARY KEY,
    nguoi_dung_id INT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    noi_dung VARCHAR(1000) NOT NULL,
    link VARCHAR(500),
    da_xem BOOLEAN DEFAULT FALSE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Bảng lịch sử xem
CREATE TABLE IF NOT EXISTS lich_su_xem (
    lich_su_id SERIAL PRIMARY KEY,
    nguoi_dung_id INT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    video_id INT NOT NULL REFERENCES video(video_id) ON DELETE CASCADE,
    thoi_gian_xem TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Bảng lịch sử đăng video
CREATE TABLE IF NOT EXISTS lich_su_dang_video (
    id SERIAL PRIMARY KEY,
    video_id INT REFERENCES video(video_id) ON DELETE CASCADE,
    nguoi_dung_id INT,
    tieu_de VARCHAR(255),
    mo_ta TEXT,
    video_url TEXT,
    luot_xem BIGINT DEFAULT 0,
    thoi_gian_dang TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Bảng tài khoản admin
CREATE TABLE IF NOT EXISTS tai_khoan_admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- 13. Bảng kiểm duyệt video
CREATE TABLE IF NOT EXISTS kiem_duyet_video (
    id SERIAL PRIMARY KEY,
    video_id INT NOT NULL REFERENCES video(video_id) ON DELETE CASCADE,
    admin_username VARCHAR(50) NOT NULL REFERENCES tai_khoan_admin(username),
    trang_thai_moi VARCHAR(50) NOT NULL,
    ly_do TEXT,
    ngay_duyet TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Bảng thống kê
CREATE TABLE IF NOT EXISTS thong_ke (
    thong_ke_id SERIAL PRIMARY KEY,
    nguoi_dung_id INT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    ngay DATE NOT NULL DEFAULT CURRENT_DATE,
    so_luot_xem INT DEFAULT 0,
    so_luot_thich INT DEFAULT 0,
    so_binh_luan INT DEFAULT 0,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_thong_ke_ngay UNIQUE (nguoi_dung_id, ngay)
);

-- Seed admin
INSERT INTO tai_khoan_admin (username, password) 
VALUES ('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918')
ON CONFLICT (username) DO NOTHING;

-- Seed demo user
INSERT INTO nguoi_dung (ten_dang_nhap, email, mat_khau_hash, anh_dai_dien, ngay_tao, ngay_cap_nhat)
VALUES ('demo_upload', 'demo@local.test', 'demo_sha256_placeholder', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (ten_dang_nhap) DO NOTHING;

-- Seed Danh Mục & Thẻ Tag
INSERT INTO danh_muc (danh_muc_id, ten_danh_muc) VALUES
(1, 'Giải trí'),
(2, 'Âm nhạc & sáng tạo'),
(3, 'Gaming'),
(4, 'Giáo dục & kiến thức'),
(5, 'Làm đẹp & thời trang'),
(6, 'Ẩm thực'),
(7, 'Du lịch & trải nghiệm'),
(8, 'Lifestyle (đời sống)'),
(9, 'Thể thao & sức khỏe'),
(10, 'Review & kiếm tiền'),
(11, 'DIY & sáng tạo'),
(12, 'Tin tức & xã hội')
ON CONFLICT (danh_muc_id) DO NOTHING;

-- Views
DROP VIEW IF EXISTS video_xu_huong;
CREATE VIEW video_xu_huong AS
SELECT 
    v.video_id,
    v.tieu_de,
    v.mo_ta,
    v.duong_dan_video,
    v.ngay_tao,
    COALESCE(v.luot_xem, 0) AS luot_xem,
    COALESCE(lc.cnt, 0) AS so_like,
    COALESCE(cc.cnt, 0) AS so_binh_luan,
    (COALESCE(v.luot_xem, 0) * 1 + COALESCE(lc.cnt, 0) * 5 + COALESCE(cc.cnt, 0) * 10) AS diem_xu_huong
FROM video v
LEFT JOIN (SELECT video_id, COUNT(*) AS cnt FROM luot_thich GROUP BY video_id) lc ON lc.video_id = v.video_id
LEFT JOIN (SELECT video_id, COUNT(*) AS cnt FROM binh_luan GROUP BY video_id) cc ON cc.video_id = v.video_id
WHERE v.trang_thai = 'da_duyet' AND (COALESCE(v.luot_xem, 0) * 1 + COALESCE(lc.cnt, 0) * 5 + COALESCE(cc.cnt, 0) * 10) >= 50;

DROP VIEW IF EXISTS vw_tim_kiem_video;
CREATE VIEW vw_tim_kiem_video AS
SELECT 
    v.video_id AS Id, 
    v.tieu_de AS Title, 
    v.mo_ta AS Description, 
    v.duong_dan_video AS RelativeUrl, 
    v.ngay_tao AS UploadedAt,
    v.danh_muc_id AS CategoryId,
    v.luot_xem AS LuotXem,
    (SELECT COUNT(*) FROM luot_thich lt WHERE lt.video_id = v.video_id) AS SoLike,
    (SELECT COUNT(*) FROM binh_luan bl WHERE bl.video_id = v.video_id) AS SoBinhLuan,
    u.ten_dang_nhap AS UploaderName,
    u.anh_dai_dien AS Avatar,
    d.ten_danh_muc AS CategoryName
FROM video v
LEFT JOIN nguoi_dung u ON v.nguoi_dung_id = u.nguoi_dung_id
LEFT JOIN danh_muc d ON v.danh_muc_id = d.danh_muc_id
WHERE v.trang_thai = 'da_duyet';
