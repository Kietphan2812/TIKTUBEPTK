require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: '"TIKTUBE Support" <' + process.env.EMAIL_USER + '>',
  to: 'kietphan28122004@gmail.com',
  subject: "Mã xác nhận đăng ký tài khoản - TIKTUBE",
  html: '<div style="font-family:Arial;padding:20px;border:1px solid #764ba2;border-radius:10px;"><h2 style="color:#764ba2;">TIKTUBE Verification Code</h2><div style="font-size:32px;font-weight:bold;color:#ff4757;background:#f0f0f0;padding:10px;text-align:center;border-radius:6px;">889900</div><p>Mã này có hiệu lực trong 15 phút.</p></div>'
}, (err, info) => {
  if (err) {
    console.error("Error sending email:", err.message);
    process.exit(1);
  } else {
    console.log("Email sent successfully to kietphan28122004@gmail.com:", info.response);
    process.exit(0);
  }
});
