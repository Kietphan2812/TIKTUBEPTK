// ============================================
// PWA INSTALLATION SYSTEM (TIKTUBE APP)
// ============================================

let deferredInstallPrompt = null;

// 1. Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('✅ PWA Service Worker registered'))
            .catch(err => console.warn('PWA SW registration failed:', err));
    });
}

// 2. Capture install prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.style.display = 'inline-flex';
    console.log('📱 PWA installation ready');
});

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.style.display = 'none';
    closePwaModal();
    alert('🎉 Cài đặt ứng dụng TIKTUBE thành công! Bạn có thể mở trực tiếp từ màn hình chính.');
});

// 3. Trigger direct installation
async function triggerPwaInstall() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        deferredInstallPrompt = null;
    } else {
        // Detect OS for fallback instructions
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS) {
            switchPwaTab('ios');
        } else if (isAndroid) {
            switchPwaTab('android');
        } else {
            switchPwaTab('pc');
        }
    }
}

// 4. Modal UI Logic
function openPwaModal() {
    const modal = document.getElementById('pwaModal');
    if (!modal) return;
    modal.style.display = 'flex';
    
    // Auto detect platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
        switchPwaTab('ios');
    } else if (isAndroid) {
        switchPwaTab('android');
    } else {
        switchPwaTab('pc');
    }
}

function closePwaModal() {
    const modal = document.getElementById('pwaModal');
    if (modal) modal.style.display = 'none';
}

function switchPwaTab(tab) {
    document.querySelectorAll('.pwa-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.pwa-tab-content').forEach(content => content.style.display = 'none');
    
    const targetBtn = document.getElementById(`pwaTabBtn_${tab}`);
    const targetContent = document.getElementById(`pwaTabContent_${tab}`);
    
    if (targetBtn) targetBtn.classList.add('active');
    if (targetContent) targetContent.style.display = 'block';
}

// 5. Inject PWA UI Elements automatically into the page
document.addEventListener('DOMContentLoaded', () => {
    // Inject Install Button into Header if not already present
    const headerActions = document.querySelector('.headerActions');
    if (headerActions && !document.getElementById('pwaInstallBtn')) {
        const btn = document.createElement('button');
        btn.id = 'pwaInstallBtn';
        btn.className = 'pwa-install-header-btn';
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Tải App</span>
        `;
        btn.onclick = openPwaModal;
        headerActions.insertBefore(btn, headerActions.firstChild);
    }

    // Inject Modal into body
    if (!document.getElementById('pwaModal')) {
        const modal = document.createElement('div');
        modal.id = 'pwaModal';
        modal.className = 'pwa-modal-overlay';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="pwa-modal-card">
                <div class="pwa-modal-header">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="pwa-icon-box">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </div>
                        <div>
                            <h3 class="pwa-title">Cài đặt Ứng dụng TIKTUBE</h3>
                            <p class="pwa-subtitle">Dùng mượt mà như App riêng trên PC, Android & iPhone</p>
                        </div>
                    </div>
                    <button class="pwa-close-btn" onclick="closePwaModal()">&times;</button>
                </div>

                <!-- Tabs -->
                <div class="pwa-tabs">
                    <button id="pwaTabBtn_pc" class="pwa-tab-btn active" onclick="switchPwaTab('pc')">
                        <i class="icon">💻</i> Máy tính
                    </button>
                    <button id="pwaTabBtn_android" class="pwa-tab-btn" onclick="switchPwaTab('android')">
                        <i class="icon">🤖</i> Android
                    </button>
                    <button id="pwaTabBtn_ios" class="pwa-tab-btn" onclick="switchPwaTab('ios')">
                        <i class="icon">🍎</i> iPhone (iOS)
                    </button>
                </div>

                <!-- Tab 1: PC -->
                <div id="pwaTabContent_pc" class="pwa-tab-content">
                    <div class="pwa-step-box">
                        <span class="pwa-badge">Cách 1</span> <strong>Bấm cài trực tiếp:</strong>
                        <button class="pwa-action-btn" onclick="triggerPwaInstall()">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Bấm để Cài đặt ngay lên Máy tính
                        </button>
                    </div>

                    <div class="pwa-instruction-box">
                        <span class="pwa-badge-sub">Cách 2</span> <strong>Cài qua thanh địa chỉ trình duyệt:</strong>
                        <ul>
                            <li>Trên <strong>Chrome / Edge / Cốc Cốc</strong>: Nhìn sang <strong>cuối thanh địa chỉ URL</strong>, bấm vào biểu tượng <strong>🖥️ Cài đặt ứng dụng</strong>.</li>
                            <li>Hoặc bấm dấu <strong>3 chấm ⋮</strong> ở góc phải trên cùng &rarr; <strong>Lưu và chia sẻ &rarr; Cài đặt TIKTUBE...</strong></li>
                        </ul>
                    </div>
                </div>

                <!-- Tab 2: Android -->
                <div id="pwaTabContent_android" class="pwa-tab-content" style="display:none;">
                    <div class="pwa-step-box">
                        <span class="pwa-badge">Cách 1</span> <strong>Bấm cài trực tiếp:</strong>
                        <button class="pwa-action-btn" onclick="triggerPwaInstall()">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Bấm để Cài đặt ngay lên Điện thoại
                        </button>
                    </div>

                    <div class="pwa-instruction-box">
                        <span class="pwa-badge-sub">Cách 2</span> <strong>Thêm qua trình duyệt Chrome / Cốc Cốc:</strong>
                        <ul>
                            <li>Mở trang web bằng trình duyệt <strong>Google Chrome</strong>.</li>
                            <li>Bấm biểu tượng <strong>3 chấm ⋮</strong> ở góc trên bên phải.</li>
                            <li>Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào màn hình chính"</strong>.</li>
                        </ul>
                    </div>
                </div>

                <!-- Tab 3: iPhone (iOS) -->
                <div id="pwaTabContent_ios" class="pwa-tab-content" style="display:none;">
                    <div class="pwa-instruction-box" style="margin-top: 5px;">
                        <span class="pwa-badge">Hướng dẫn</span> <strong>Cài đặt trên Safari (iPhone / iPad):</strong>
                        <ol style="margin-top: 12px; padding-left: 20px; line-height: 1.8;">
                            <li>Mở trang web bằng trình duyệt <strong>Safari</strong>.</li>
                            <li>Bấm nút <strong>Chia sẻ 📤</strong> (biểu tượng hình vuông có mũi tên chỉ lên ở thanh công cụ dưới đáy).</li>
                            <li>Cuộn xuống và chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>.</li>
                            <li>Bấm <strong>"Thêm" (Add)</strong> ở góc trên cùng bên phải.</li>
                        </ol>
                    </div>
                </div>

                <div class="pwa-modal-footer">
                    <button class="pwa-close-footer-btn" onclick="closePwaModal()">Đóng</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close when clicking background
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePwaModal();
        });
    }
});
