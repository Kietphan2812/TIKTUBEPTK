/**
 * moderation.js - Hệ thống kiểm duyệt nội dung tự động (Auto-Moderation Engine)
 * Tự động phát hiện:
 * 1. Nội dung 18+, dâm dục, khiêu dâm, đồi trụy
 * 2. Nội dung kinh dị, máu me, rùng rợn, bạo lực, tự sát
 * 3. Từ ngữ tục tĩu, chửi thề, lăng mạ, xúc phạm
 */

// Danh mục 1: 18+, Dâm dục, Khiêu dâm
const TU_KHOA_18_PLUS = [
  "18+", "18 cộng", "sex", "xxx", "porn", "jav", "hentai", "nude", "khỏa thân", "khoa than",
  "khiêu dâm", "khieu dam", "dâm dục", "dam duc", "kích dục", "kich duc", "tình dục", "tinh duc",
  "lộ clip", "lo clip", "lộ hàng", "lo hang", "lột đồ", "lot do", "show hàng", "show hang",
  "thủ dâm", "thu dam", "loạn luân", "loan luan", "hiếp dâm", "hiep dam", "ấu dâm", "au dam",
  "bán dâm", "ban dam", "gái gọi", "gai goi", "quay lén", "quay len", "phim heo", "phim người lớn",
  "phim nguoi lon", "bú cu", "bu cu", "bú liếm", "bu liem", "thông dâm", "thong dam", "gạ tình", "ga tinh",
  "chat sex", "show body", "lo clip nong", "lộ clip nóng", "khoe ngực", "khoe mong", "khoe nguc", "khoe mông"
];

// Danh mục 2: Kinh dị, Máu me, Rùng rợn, Bạo lực cực đoan, Tự sát
const TU_KHOA_KINH_DI = [
  "kinh dị", "kinh di", "máu me", "mau me", "chém giết", "chem giet", "chặt đầu", "chat dau",
  "phanh thây", "phanh thay", "xác chết", "xac chet", "tự tử", "tu tu", "tự sát", "tu sat",
  "rùng rợn", "rung ron", "ghê rợn", "ghe ron", "tra tấn", "tra tan", "giết người", "giet nguoi",
  "đẫm máu", "dam mau", "cắt cổ", "cat co", "mổ bụng", "mo bung", "thảm sát", "tham sat",
  "tai nạn chết người", "tai nan chet nguoi", "man rợ", "man ro", "kinh tởm", "kinh tom", "chết thảm", "chet tham"
];

// Danh mục 3: Từ ngữ tục tĩu, Chửi thề, Lăng mạ
const TU_KHOA_TUC_TIU = [
  "đm", "dm", "dcm", "đcm", "dmm", "đmm", "đclm", "dclm", "vcl", "vkl", "vl",
  "địt", "dit", "địt mẹ", "dit me", "địt cụ", "dit cu", "đụ", "du ma", "đụ má", "đụ mẹ", "du me",
  "lồn", "lon", "cặc", "cak", "cac", "buồi", "buoi", "đĩ", "di", "con đĩ", "con di",
  "chó đẻ", "cho de", "chó chết", "cho chet", "súc vật", "suc vat", "súc sinh", "suc sinh",
  "đéo", "deo", "đụt", "dut", "óc chó", "oc cho", "ngu lồn", "ngu lon", "hãm lồn", "ham lon",
  "mẹ kiếp", "me kiep", "clgt", "cút mẹ", "cut me", "bố mày", "bo may", "tổ cha", "to cha",
  "bà già mày", "ba gia may", "thằng chó", "thang cho", "con chó", "con cho"
];

// Danh mục 4: Cờ bạc, Cá độ, Nhà cái, Lừa đảo trực tuyến
const TU_KHOA_CO_BAC_LUA_DAO = [
  "kubet", "thabet", "bj88", "hi88", "jun88", "shbet", "new88", "f8bet", "789bet", "88online", "fun88", "w88",
  "tài xỉu", "tai xiu", "nổ hũ", "no hu", "bắn cá đổi thưởng", "ban ca doi thuong", "baccarat", "xóc đĩa", "xoc dia",
  "cá độ bóng đá", "ca do bong da", "cờ bạc", "co bac", "kèo nhà cái", "keo nha cai", "soi cầu", "soi cau", "lô đề", "lo de",
  "nhận 88k", "nhan 88k", "tặng 88k", "tang 88k", "link bio nhận tiền", "kiếm tiền online lừa đảo", "hoa hồng nạp tiền",
  "đánh bạc", "danh bac", "casino online", "sòng bạc", "song bac"
];

// Hàm loại bỏ dấu tiếng Việt để phát hiện viết không dấu
function removeVietnameseAccents(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
}

// Chuẩn hóa văn bản loại bỏ khoảng trắng và ký tự đặc biệt xen kẽ (ví dụ: s.e.x, d_m, l-o-n)
function normalizeText(text) {
  if (!text) return "";
  return String(text).toLowerCase().trim();
}

/**
 * Kiểm tra nội dung văn bản xem có chứa từ cấm không
 * @param {string} text 
 * @param {Array<string>} wordList 
 * @returns {Array<string>} Danh sách từ vi phạm tìm thấy
 */
function findViolations(text, wordList) {
  if (!text) return [];
  const rawText = String(text).toLowerCase();
  const noAccentText = removeVietnameseAccents(rawText);

  const matched = [];

  for (const word of wordList) {
    const wordLower = word.toLowerCase();
    const wordNoAccent = removeVietnameseAccents(wordLower);

    // Xây dựng regex ranh giới từ (word boundaries) hỗ trợ cả ký tự tiếng Việt Unicode
    // Không cho phép ký tự chữ cái/số dính liền trước hoặc sau
    const patternRaw = `(?:^|[^a-z0-9à-ỹ])${escapeRegExp(wordLower)}(?:$|[^a-z0-9à-ỹ])`;
    const regexRaw = new RegExp(patternRaw, "i");

    const patternNoAccent = `(?:^|[^a-z0-9])${escapeRegExp(wordNoAccent)}(?:$|[^a-z0-9])`;
    const regexNoAccent = new RegExp(patternNoAccent, "i");

    // Kiểm tra trên chuỗi gốc hoặc chuỗi bỏ dấu
    if (regexRaw.test(rawText) || regexNoAccent.test(noAccentText)) {
      matched.push(word);
      continue;
    }

    // Kiểm tra ký tự ngụy trang (ví dụ s.e.x, d_m, v.c.l, l.ồ.n)
    // Nếu từ khóa có dạng chữ cái đơn giản
    if (wordNoAccent.length >= 2 && wordNoAccent.length <= 5) {
      const letters = wordNoAccent.split("");
      const obfuscatedPattern = letters.map(l => escapeRegExp(l)).join("[.\\-_*\\s/]{1,3}");
      const regexObf = new RegExp(`(?:^|[^a-z0-9])${obfuscatedPattern}(?:$|[^a-z0-9])`, "i");
      if (regexObf.test(noAccentText)) {
        matched.push(word);
      }
    }
  }

  return [...new Set(matched)];
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Kiểm duyệt tổng hợp video
 * @param {Object} params { title, description, tags }
 * @returns {Object} { isClean: boolean, flagCategory: string|null, matchedWords: string[], reason: string }
 */
function moderateVideoContent({ title = "", description = "", tags = "" }) {
  const fullText = `${title} ${description} ${tags}`.trim();
  
  if (!fullText) {
    return {
      isClean: true,
      flagCategory: null,
      matchedWords: [],
      reason: "Nội dung hợp lệ (Trống)"
    };
  }

  // 1. Quét nhóm 18+ / Dâm dục
  const viPham18 = findViolations(fullText, TU_KHOA_18_PLUS);
  if (viPham18.length > 0) {
    return {
      isClean: false,
      flagCategory: "18_plus",
      matchedWords: viPham18,
      reason: `Phát hiện nội dung nhạy cảm / 18+ (${viPham18.slice(0, 3).join(", ")})`
    };
  }

  // 2. Quét nhóm Kinh dị / Máu me / Bạo lực
  const viPhamKinhDi = findViolations(fullText, TU_KHOA_KINH_DI);
  if (viPhamKinhDi.length > 0) {
    return {
      isClean: false,
      flagCategory: "kinh_di",
      matchedWords: viPhamKinhDi,
      reason: `Phát hiện nội dung kinh dị / bạo lực / máu me (${viPhamKinhDi.slice(0, 3).join(", ")})`
    };
  }

  // 3. Quét nhóm Từ ngữ tục tĩu / Chửi thề
  const viPhamTucTiu = findViolations(fullText, TU_KHOA_TUC_TIU);
  if (viPhamTucTiu.length > 0) {
    return {
      isClean: false,
      flagCategory: "tuc_tiu",
      matchedWords: viPhamTucTiu,
      reason: `Phát hiện từ ngữ thô tục / chửi bậy (${viPhamTucTiu.slice(0, 3).join(", ")})`
    };
  }

  // 4. Quét nhóm Cờ bạc / Cá độ / Lừa đảo trực tuyến
  const viPhamCoBac = findViolations(fullText, TU_KHOA_CO_BAC_LUA_DAO);
  if (viPhamCoBac.length > 0) {
    return {
      isClean: false,
      flagCategory: "co_bac_lua_dao",
      matchedWords: viPhamCoBac,
      reason: `Phát hiện nội dung cờ bạc / cá độ / lừa đảo (${viPhamCoBac.slice(0, 3).join(", ")})`
    };
  }

  // Nếu hoàn toàn sạch sẽ
  return {
    isClean: true,
    flagCategory: null,
    matchedWords: [],
    reason: "Hệ thống tự động duyệt: Video hợp lệ và an toàn"
  };
}

module.exports = {
  moderateVideoContent,
  TU_KHOA_18_PLUS,
  TU_KHOA_KINH_DI,
  TU_KHOA_TUC_TIU,
  TU_KHOA_CO_BAC_LUA_DAO
};
