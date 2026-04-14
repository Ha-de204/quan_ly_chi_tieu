const tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

/**
 * Hàm hỗ trợ trích xuất số tiền (Lấy số lớn nhất thường là tổng thanh toán)
 */
const extractAmount = (text) => {
  // Loại bỏ khoảng trắng nằm giữa các con số
  const cleanText = text.replace(/(?<=\d)\s+(?=\d)/g, '');

  // Regex tìm các cụm số có dấu phân cách nghìn là (.) hoặc (,)
  const amountRegex = /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?/g;
  const matches = cleanText.match(amountRegex) || [];

  const numbers = matches
    .map(m => {
      return parseFloat(m.replace(/[.,]/g, ''));
    })
    .filter(n => n >= 1000 && n < 100000000);

  return numbers.length > 0 ? Math.max(...numbers) : 0;
};

/**
 * Hàm hỗ trợ trích xuất ngày tháng
 */
const extractDate = (text) => {
  // Bắt các định dạng dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy
  const dateRegex = /(\d{1,2})\s*[\/\.\-]\s*(\d{1,2})\s*[\/\.\-]\s*(\d{2,4})/;
  const match = text.match(dateRegex);
  if (match) {
      let day = match[1].padStart(2, '0');
      let month = match[2].padStart(2, '0');
      let year = match[3];

      // Chuẩn hóa năm 2 chữ số thành 4 chữ số
      if (year.length === 2) year = '20' + year;

      return `${year}-${month}-${day}`;
    }

  return new Date().toISOString();
};

/**
 * Hàm gợi ý danh mục dựa trên từ khóa trong text
 */
const suggestCategory = (text) => {
  const content = text.toLowerCase();
  const categories = {
    'Đồ ăn': ['coffee', 'highlands', 'phúc long', 'starbucks', 'nhà hàng', 'trà sữa', 'mì', 'cơm', 'ăn sáng', 'nước uống', 'gà', 'cá', 'thịt', 'tôm', 'chả', 'ốc', 'xúc xích', 'rau'],
    'Di chuyển': ['grab', 'be', 'xăng', 'gas', 'taxi', 'vận tải', 'phí gửi xe'],
    'Mua sắm': ['siêu thị', 'mart', 'mall', 'shopee', 'lazada', 'tiki', 'winmart', 'circle k', 'tạp hóa'],
    'Giải trí': ['cinema', 'rạp chiếu phim', 'cgv', 'lotte', 'vé xem phim', 'karaoke'],
    'Sức khỏe': ['nhà thuốc', 'pharmacity', 'long châu', 'bệnh viện', 'phòng khám']
  };

  for (const [name, keys] of Object.entries(categories)) {
    if (keys.some(key => content.includes(key))) return name;
  }
  return 'Khác';
};

exports.scanReceipt = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng tải lên hình ảnh hóa đơn.' });
  }

  const imagePath = req.file.path;

  try {
    console.time("OCR_Duration");

    // 1. Chạy Tesseract OCR
    const { data: { text } } = await tesseract.recognize(
      imagePath,
      'vie+eng',
      {
        logger: m => console.log(m.status + ': ' + Math.round(m.progress * 100) + '%')
      }
    );

    console.log("--------- DỮ LIỆU THÔ TESSERACT ĐỌC ĐƯỢC ---------");
    console.log(text);
    console.log("--------------------------------------------------");

    // 2. Trích xuất thông tin bằng Regex
    const amount = extractAmount(text);
    const date = extractDate(text);
    const categoryName = suggestCategory(text);

    // Tên cửa hàng: Lấy dòng đầu tiên không rỗng và có độ dài > 3 ký tự
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
    const title = lines.length > 0 ? lines[0] : 'Hóa đơn mới';

    // 3. Xóa file ảnh tạm sau khi xử lý để giải phóng bộ nhớ server
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    console.timeEnd("OCR_Duration");

    // 4. Trả kết quả về Frontend
    res.status(200).json({
      amount: amount,
      type: 'expense',
      title: title,
      note: 'Dữ liệu quét tự động',
      date: date,
      category_name: categoryName,
      raw_text: text
    });

  } catch (error) {
    console.error('Lỗi xử lý OCR:', error);

    // Đảm bảo xóa file ngay cả khi gặp lỗi
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    res.status(500).json({
      message: 'Không thể xử lý hình ảnh.',
      error: error.message
    });
  }
};