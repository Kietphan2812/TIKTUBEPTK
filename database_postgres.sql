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

-- Seed Thẻ Tag
INSERT INTO the_tag (danh_muc_id, ten_tag) VALUES
(1, '#haihuoc'), (1, '#meme'), (1, '#funny'), (1, '#trend'), (1, '#viral'), (1, '#storytime'), (1, '#drama'), (1, '#parody'), (1, '#reaction'), (1, '#troll'), (1, '#prank'), (1, '#shortfilm'), (1, '#giaitri'), (1, '#cliphai'), (1, '#noidunghay'),
(2, '#amnhac'), (2, '#music'), (2, '#cover'), (2, '#remix'), (2, '#dance'), (2, '#nhay'), (2, '#lipsync'), (2, '#trendmusic'), (2, '#beat'), (2, '#sangtac'), (2, '#dj'), (2, '#karaoke'), (2, '#lofi'), (2, '#nhachay'), (2, '#mv'),
(3, '#gaming'), (3, '#game'), (3, '#gameplay'), (3, '#stream'), (3, '#livestream'), (3, '#highlight'), (3, '#funnygame'), (3, '#reviewgame'), (3, '#mobilegame'), (3, '#pcgame'), (3, '#freefire'), (3, '#pubg'), (3, '#lienquan'), (3, '#minecraft'), (3, '#fifa'),
(4, '#giaoduc'), (4, '#hoctap'), (4, '#learning'), (4, '#tienganh'), (4, '#hoctienganh'), (4, '#kienthuc'), (4, '#khoahoc'), (4, '#congnghe'), (4, '#fact'), (4, '#lifehack'), (4, '#tips'), (4, '#study'), (4, '#studytips'), (4, '#education'), (4, '#dayhoc'),
(5, '#lamdep'), (5, '#beauty'), (5, '#makeup'), (5, '#skincare'), (5, '#thoitrang'), (5, '#fashion'), (5, '#outfit'), (5, '#ootd'), (5, '#reviewmypham'), (5, '#trangdiem'), (5, '#duongda'), (5, '#style'), (5, '#makeuptutorial'), (5, '#fashionstyle'),
(6, '#amthuc'), (6, '#food'), (6, '#anuong'), (6, '#reviewdoan'), (6, '#monngon'), (6, '#nauan'), (6, '#cooking'), (6, '#streetfood'), (6, '#mukbang'), (6, '#foodreview'), (6, '#anvat'), (6, '#doanvietnam'), (6, '#delicious'), (6, '#foodvlog'),
(7, '#dulich'), (7, '#travel'), (7, '#vlogdulich'), (7, '#khampha'), (7, '#checkin'), (7, '#reviewdulich'), (7, '#phuot'), (7, '#travelvlog'), (7, '#diadiemdep'), (7, '#vanhoa'), (7, '#trai_nghiem'), (7, '#explore'), (7, '#trip'),
(8, '#lifestyle'), (8, '#cuocsong'), (8, '#vlog'), (8, '#dailyvlog'), (8, '#routine'), (8, '#selfcare'), (8, '#songtichcuc'), (8, '#minimalism'), (8, '#habits'), (8, '#motngay'), (8, '#tam_su'), (8, '#life'), (8, '#dayinmylife'),
(9, '#thethao'), (9, '#fitness'), (9, '#gym'), (9, '#workout'), (9, '#yoga'), (9, '#health'), (9, '#suckhoe'), (9, '#giamcan'), (9, '#tangcan'), (9, '#cardio'), (9, '#tapluyen'), (9, '#bodybuilding'), (9, '#fit'), (9, '#healthy'),
(10, '#review'), (10, '#unboxing'), (10, '#danhgia'), (10, '#kiem_tien'), (10, '#makemoney'), (10, '#kinhdoanh'), (10, '#onlinebusiness'), (10, '#affiliate'), (10, '#banhang'), (10, '#dropshipping'), (10, '#startup'), (10, '#marketing'),
(11, '#diy'), (11, '#handmade'), (11, '#thucong'), (11, '#sangtao'), (11, '#decor'), (11, '#trangtri'), (11, '#craft'), (11, '#hack'), (11, '#meovat'), (11, '#y_tuong'), (11, '#creative'), (11, '#design'), (11, '#lamdo'),
(12, '#tintuc'), (12, '#news'), (12, '#drama'), (12, '#xahoi'), (12, '#trend'), (12, '#sukien'), (12, '#viral'), (12, '#hot'), (12, '#capnhat'), (12, '#tinnhanh'), (12, '#thoisu'), (12, '#phantich'), (12, '#tinnong');

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
