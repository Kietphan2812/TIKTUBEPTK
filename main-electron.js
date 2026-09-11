const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const { fork } = require('child_process');

let mainWindow = null;
let serverProcess = null;
const PORT = process.env.PORT || 3000;

// Đặt Application User Model ID chuẩn cho Windows (để Icon trên Taskbar không bị gán logo lạ)
app.setAppUserModelId('com.tiktube.desktop');

// Kiểm tra xem backend đã chạy chưa
function checkServerRunning(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      resolve(true);
    });
    req.on('error', () => {
      // Thử kiểm tra root
      const reqRoot = http.get(`http://localhost:${port}`, (res2) => {
        resolve(true);
      });
      reqRoot.on('error', () => resolve(false));
      reqRoot.setTimeout(1000, () => {
        reqRoot.destroy();
        resolve(false);
      });
    });
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Tự động khởi động backend nếu chưa chạy
async function ensureBackendServer() {
  const isRunning = await checkServerRunning(PORT);
  if (!isRunning) {
    console.log(`[Electron] Khởi chạy backend nội bộ trên port ${PORT}...`);
    serverProcess = fork(path.join(__dirname, 'server.js'), [], {
      env: { ...process.env, PORT: String(PORT) },
      silent: false
    });

    serverProcess.on('error', (err) => {
      console.error('[Electron] Backend error:', err);
    });

    // Đợi 2.5s để server khởi động xong
    await new Promise(r => setTimeout(r, 2500));
  } else {
    console.log(`[Electron] Backend đã chạy sẵn trên port ${PORT}.`);
  }
}

function createWindow() {
  const iconPath = path.join(__dirname, 'icon-512.png');

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: 'TIKTUBE - Mạng Xã Hội Video',
    icon: iconPath,
    backgroundColor: '#0f0f13',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Giúp tải video / media mượt mà
    }
  });

  // Tải giao diện ứng dụng từ máy chủ local
  mainWindow.loadURL(`http://localhost:${PORT}`).catch(() => {
    // Dự phòng mở file trực tiếp nếu server có sự cố
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  });

  // Mở các liên kết ngoài bằng trình duyệt mặc định
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (!url.includes(`localhost:${PORT}`)) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
    }
    return { action: 'allow' };
  });

  // Tạo Menu tiếng Việt chuyên nghiệp cho phần mềm
  const menuTemplate = [
    {
      label: 'TIKTUBE',
      submenu: [
        { label: 'Về TIKTUBE', role: 'about' },
        { type: 'separator' },
        { label: 'Thoát ứng dụng', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Điều hướng',
      submenu: [
        { label: 'Quay lại', accelerator: 'Alt+Left', click: () => mainWindow.webContents.canGoBack() && mainWindow.webContents.goBack() },
        { label: 'Tiến lên', accelerator: 'Alt+Right', click: () => mainWindow.webContents.canGoForward() && mainWindow.webContents.goForward() },
        { type: 'separator' },
        { label: 'Trang chủ', accelerator: 'CmdOrCtrl+H', click: () => mainWindow.loadURL(`http://localhost:${PORT}`) },
        { label: 'Tải lại trang', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() }
      ]
    },
    {
      label: 'Hiển thị',
      submenu: [
        { label: 'Phóng to', role: 'zoomIn' },
        { label: 'Thu nhỏ', role: 'zoomOut' },
        { label: 'Kích thước mặc định', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Toàn màn hình', role: 'togglefullscreen' },
        { label: 'Công cụ phát triển (DevTools)', accelerator: 'F12', click: () => mainWindow.webContents.toggleDevTools() }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Khởi chạy ứng dụng
app.whenReady().then(async () => {
  await ensureBackendServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Tự động đóng backend process khi người dùng tắt app
app.on('window-all-closed', () => {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch (_) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
