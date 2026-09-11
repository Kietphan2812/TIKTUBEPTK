const { spawn } = require('child_process');
const path = require('path');

const builderBin = path.join(__dirname, 'node_modules', 'electron-builder', 'cli.js');

console.log('🚀 Đang bắt đầu đóng gói phần mềm TIKTUBE-Setup.exe...');
console.log('⏳ Quá trình này có thể mất 1 - 2 phút, vui lòng đợi...');

const child = spawn(process.execPath, [builderBin, '--win', '--x64'], {
  stdio: 'inherit',
  cwd: __dirname
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n======================================================');
    console.log('🎉 XUẤT FILE THÀNH CÔNG!');
    console.log('📁 File cài đặt TIKTUBE-Setup.exe nằm tại thư mục: dist/');
    console.log('======================================================\n');
  } else {
    console.error('\n❌ Có lỗi xảy ra trong quá trình đóng gói, mã lỗi:', code);
  }
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('❌ Lỗi tiến trình đóng gói:', err);
  process.exit(1);
});
