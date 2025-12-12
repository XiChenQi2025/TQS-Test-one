/**
 * 用户系统模块 - 优化版 v2.2.0
 * 整合：游客账户、侧边栏逻辑修复、样式继承修复、新版API适配
 */
export default class UserSystemModule {
    constructor() {
        this.name = 'user-system';
        this.version = '2.2.0';
        this.dependencies = [];
        
        // 状态管理
        this.currentUser = null;
        this.isLoggedIn = false;
        this.isGuest = false;
        this.sidebarVisible = false;
        
        // 预设头像列表
        this.avatarPresets = [
            { id: 'default', emoji: '😊', name: '默认' },
            { id: 'cat', emoji: '🐱', name: '猫咪' },
            { id: 'dog', emoji: '🐶', name: '狗狗' },
            { id: 'rabbit', emoji: '🐰', name: '兔兔' },
            { id: 'fox', emoji: '🦊', name: '狐狸' },
            { id: 'panda', emoji: '🐼', name: '熊猫' },
            { id: 'bear', emoji: '🐻', name: '熊熊' },
            { id: 'unicorn', emoji: '🦄', name: '独角兽' },
            { id: 'dragon', emoji: '🐉', name: '小龙' },
            { id: 'star', emoji: '⭐', name: '星星' },
            { id: 'heart', emoji: '❤️', name: '爱心' },
            { id: 'rainbow', emoji: '🌈', name: '彩虹' },
            { id: 'sun', emoji: '☀️', name: '太阳' },
            { id: 'moon', emoji: '🌙', name: '月亮' },
            { id: 'flower', emoji: '🌸', name: '花花' },
            { id: 'peach', emoji: '🍑', name: '桃桃' }
        ];
        
        // 游客账户信息
        this.guestUser = {
            userId: 'guest_' + new Date().getTime(),
            username: '游客' + new Date().getTime().toString().slice(-6),
            nickname: '游客',
            avatar: 'default',
            avatarEmoji: '😊',
            points: 0,
            isGuest: true,
            isOffline: true,
            isOnline: false
        };
        
        // DOM 元素引用
        this.loginModal = null;
        this.registerForm = null;
        this.sidebar = null;
        this.avatarTrigger = null;
        this.avatarSelector = null;
    }
    
    async init(context) {
        this.context = context;
        this.app = context.app;
        this.config = context.config;
        
        // 初始化用户系统
        await this.setup();
        this.bindEvents();
        
        console.log(`✅ ${this.name} 模块已初始化 v${this.version}`);
        return this;
    }
    
    async setup() {
        // 1. 创建UI组件
        this.createLoginModal();
        this.createRegisterForm();
        this.createAvatarSelector();
        this.createUserSidebar();
        this.createAvatarTrigger();
        
        // 2. 检查登录状态
        await this.checkLoginStatus();
        
        // 3. 确保有活跃用户（游客或登录用户）
        await this.ensureActiveUser();
    }
    
    bindEvents() {
        // 监听应用事件
        this.context.on('app:ready', this.onAppReady.bind(this));
        this.context.on('auth:login', this.onUserLogin.bind(this));
        this.context.on('auth:logout', this.onUserLogout.bind(this));
        this.context.on('points:updated', this.onPointsUpdated.bind(this));
        
        // 窗口大小变化时调整侧边栏
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // ESC键关闭侧边栏
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebarVisible) {
                this.hideSidebar();
            }
        });
    }
    
    // ==================== 核心功能 - 合并改进 ====================
    
    async ensureActiveUser() {
        // 如果没有当前用户，设置为游客
        if (!this.currentUser || !this.isLoggedIn) {
            await this.useGuestAccount();
        }
    }
    
    async useGuestAccount() {
        this.currentUser = { ...this.guestUser };
        this.isLoggedIn = false;
        this.isGuest = true;
        
        console.log('使用游客账户:', this.currentUser.username);
        
        // 更新UI
        this.updateAvatarTrigger();
        this.updateSidebar();
        this.updateHeaderUserInfo();
        
        return this.currentUser;
    }
    
    async checkLoginStatus() {
        try {
            // 检查是否有保存的登录状态
            const savedToken = localStorage.getItem('taoci_token');
            const savedUserId = localStorage.getItem('taoci_userId');
            
            if (savedToken && savedUserId) {
                // 尝试获取用户信息
                const userInfo = await window.TaociApi.getSmartUserInfo();
                
                if (userInfo.success && userInfo.data) {
                    // 登录成功
                    this.currentUser = userInfo.data;
                    this.isLoggedIn = true;
                    this.isGuest = false;
                    
                    console.log('已恢复登录状态:', this.currentUser.nickname || this.currentUser.username);
                    
                    // 更新UI
                    this.updateAvatarTrigger();
                    this.updateSidebar();
                    this.updateHeaderUserInfo();
                    
                    return;
                }
            }
            
            // 登录失败或未登录，使用游客账户
            await this.useGuestAccount();
            
        } catch (error) {
            console.error('检查登录状态失败:', error);
            // 发生错误也使用游客账户
            await this.useGuestAccount();
        }
    }
    
    // ==================== 侧边栏逻辑 - 整合改进 ====================
    
    createUserSidebar() {
        this.sidebar = document.createElement('div');
        this.sidebar.className = 'user-sidebar';
        this.sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="sidebar-user-info">
                    <div class="sidebar-avatar" id="sidebarAvatar">
                        <span id="sidebarAvatarEmoji">😊</span>
                    </div>
                    <div class="sidebar-user-details">
                        <h3 class="sidebar-username" id="sidebarUsername">游客</h3>
                        <p class="sidebar-nickname" id="sidebarNickname">未登录</p>
                        <div class="user-status" id="userStatus">
                            <span class="status-dot offline"></span>
                            <span class="status-text">离线</span>
                        </div>
                    </div>
                </div>
                <button class="sidebar-close" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="sidebar-body">
                <!-- 积分卡片 -->
                <div class="points-card">
                    <div class="points-header">
                        <h4><i class="fas fa-coins"></i> 我的积分</h4>
                        <div class="points-total" id="pointsTotal">0</div>
                    </div>
                    <div class="points-history">
                        <div class="points-item">
                            <span>今日获得</span>
                            <span class="points-value" id="pointsToday">0</span>
                        </div>
                        <div class="points-item">
                            <span>累计获得</span>
                            <span class="points-value" id="pointsTotalEarned">0</span>
                        </div>
                        <div class="points-item">
                            <span>排名</span>
                            <span class="points-value" id="pointsRank">--</span>
                        </div>
                    </div>
                </div>
                
                <!-- 个人信息 -->
                <div class="info-section">
                    <h4><i class="fas fa-id-card"></i> 个人信息</h4>
                    <div class="info-list">
                        <div class="info-item">
                            <span class="info-label">用户状态</span>
                            <span class="info-value" id="infoStatus">游客</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">个性签名</span>
                            <span class="info-value" id="infoSignature">--</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">最后登录</span>
                            <span class="info-value" id="infoLastLogin">--</span>
                        </div>
                    </div>
                </div>
                
                <!-- 快捷操作 -->
                <div class="actions-section" id="actionsSection">
                    <h4><i class="fas fa-bolt"></i> 快捷操作</h4>
                    <div class="action-buttons">
                        <button class="btn btn-secondary edit-profile">
                            <i class="fas fa-edit"></i> 编辑资料
                        </button>
                        <button class="btn btn-secondary change-avatar">
                            <i class="fas fa-user-circle"></i> 更换头像
                        </button>
                    </div>
                </div>
                
                <!-- 账号管理 -->
                <div class="account-section" id="accountSection">
                    <h4><i class="fas fa-user-cog"></i> 账号管理</h4>
                    <div class="account-actions">
                        <button class="btn btn-secondary change-password">
                            <i class="fas fa-key"></i> 修改密码
                        </button>
                        <button class="btn btn-secondary sync-data" id="syncDataBtn">
                            <i class="fas fa-sync-alt"></i> 同步数据
                        </button>
                    </div>
                </div>
                
                <!-- 游客提示 -->
                <div class="guest-notice" id="guestNotice">
                    <i class="fas fa-info-circle"></i>
                    <p>游客模式只能体验基本功能，登录后可保存进度和参与排行</p>
                </div>
            </div>
            
            <div class="sidebar-footer" id="sidebarFooter">
                <!-- 动态内容：根据登录状态显示不同按钮 -->
            </div>
        `;
        
        document.body.appendChild(this.sidebar);
        
        // 绑定侧边栏事件
        this.bindSidebarEvents();
        
        // 初始化更新
        this.updateSidebar();
    }
    
    bindSidebarEvents() {
        const closeBtn = this.sidebar.querySelector('.sidebar-close');
        const editProfileBtn = this.sidebar.querySelector('.edit-profile');
        const changeAvatarBtn = this.sidebar.querySelector('.change-avatar');
        const changePasswordBtn = this.sidebar.querySelector('.change-password');
        const syncDataBtn = this.sidebar.querySelector('#syncDataBtn');
        
        // 关闭侧边栏
        closeBtn.addEventListener('click', () => this.hideSidebar());
        
        // 编辑资料
        editProfileBtn.addEventListener('click', () => this.showEditProfile());
        
        // 更换头像
        changeAvatarBtn.addEventListener('click', () => {
            const currentAvatarId = this.getAvatarIdFromEmoji(this.currentUser?.avatar);
            this.showAvatarSelector(currentAvatarId);
        });
        
        // 修改密码
        changePasswordBtn.addEventListener('click', () => this.showChangePassword());
        
        // 同步数据
        syncDataBtn.addEventListener('click', () => this.syncUserData());
        
        // 点击侧边栏外部关闭（修复事件冒泡问题）
        document.addEventListener('click', (e) => {
            if (this.sidebarVisible && 
                !this.sidebar.contains(e.target) && 
                this.avatarTrigger && 
                !this.avatarTrigger.contains(e.target)) {
                this.hideSidebar();
            }
        });
        
        // 绑定底部按钮事件（会在updateSidebarFooter中动态绑定）
    }
    
    updateSidebar() {
        if (!this.sidebar) return;
        
        if (this.currentUser) {
            const username = this.currentUser.username || '未知用户';
            const nickname = this.currentUser.nickname || username;
            
            // 更新用户信息
            document.getElementById('sidebarUsername').textContent = username;
            document.getElementById('sidebarNickname').textContent = nickname;
            
            // 更新头像
            const avatarEmoji = this.currentUser.avatarEmoji || 
                               this.getAvatarEmoji(this.currentUser.avatar) || 
                               '😊';
            document.getElementById('sidebarAvatarEmoji').textContent = avatarEmoji;
            
            // 更新状态
            const userStatus = document.getElementById('userStatus');
            if (userStatus) {
                const statusDot = userStatus.querySelector('.status-dot');
                const statusText = userStatus.querySelector('.status-text');
                
                if (this.isLoggedIn && !this.isGuest) {
                    if (this.currentUser.isOffline) {
                        statusDot.className = 'status-dot offline';
                        statusText.textContent = '离线';
                        document.getElementById('infoStatus').textContent = '离线用户';
                    } else {
                        statusDot.className = 'status-dot online';
                        statusText.textContent = '在线';
                        document.getElementById('infoStatus').textContent = '已登录';
                    }
                } else {
                    statusDot.className = 'status-dot offline';
                    statusText.textContent = '游客';
                    document.getElementById('infoStatus').textContent = '游客';
                }
            }
            
            // 更新积分
            this.updatePointsDisplay();
            
            // 更新个人信息
            document.getElementById('infoSignature').textContent = this.currentUser.signature || '--';
            
            if (this.currentUser.lastLogin && !this.isGuest) {
                document.getElementById('infoLastLogin').textContent = this.formatDate(this.currentUser.lastLogin);
            } else {
                document.getElementById('infoLastLogin').textContent = '--';
            }
            
            // 显示/隐藏功能区域
            const actionsSection = document.getElementById('actionsSection');
            const accountSection = document.getElementById('accountSection');
            const guestNotice = document.getElementById('guestNotice');
            
            if (this.isLoggedIn && !this.isGuest) {
                if (actionsSection) actionsSection.style.display = 'block';
                if (accountSection) accountSection.style.display = 'block';
                if (guestNotice) guestNotice.style.display = 'none';
            } else {
                if (actionsSection) actionsSection.style.display = 'none';
                if (accountSection) accountSection.style.display = 'none';
                if (guestNotice) guestNotice.style.display = 'block';
            }
        }
        
        // 更新侧边栏底部按钮
        this.updateSidebarFooter();
    }
    
    updateSidebarFooter() {
        const sidebarFooter = document.getElementById('sidebarFooter');
        if (!sidebarFooter) return;
        
        if (this.isLoggedIn && !this.isGuest) {
            // 已登录用户：显示退出登录按钮
            sidebarFooter.innerHTML = `
                <button class="btn btn-logout" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i> 退出登录
                </button>
            `;
            
            // 绑定退出登录事件
            setTimeout(() => {
                const logoutBtn = sidebarFooter.querySelector('#logoutBtn');
                if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());
            }, 100);
            
        } else {
            // 未登录/游客：显示登录注册按钮
            sidebarFooter.innerHTML = `
                <div class="sidebar-auth-buttons">
                    <button class="btn btn-primary" id="sidebarLoginBtn">
                        <i class="fas fa-sign-in-alt"></i> 登录
                    </button>
                    <button class="btn btn-secondary" id="sidebarRegisterBtn">
                        <i class="fas fa-user-plus"></i> 注册
                    </button>
                </div>
            `;
            
            // 绑定事件
            setTimeout(() => {
                const loginBtn = sidebarFooter.querySelector('#sidebarLoginBtn');
                const registerBtn = sidebarFooter.querySelector('#sidebarRegisterBtn');
                
                if (loginBtn) {
                    loginBtn.addEventListener('click', () => {
                        this.hideSidebar();
                        setTimeout(() => this.showLoginModal(), 300);
                    });
                }
                
                if (registerBtn) {
                    registerBtn.addEventListener('click', () => {
                        this.hideSidebar();
                        setTimeout(() => this.showRegisterForm(), 300);
                    });
                }
            }, 100);
        }
    }
    
    // ==================== 头像触发区域 - 修复版 ====================
    
    createAvatarTrigger() {
        // 查找现有的用户信息区域
        const existingUserInfo = document.querySelector('.user-info');
        
        if (existingUserInfo) {
            this.avatarTrigger = existingUserInfo;
            console.log('找到现有用户信息区域');
            
            // 确保点击事件绑定
            if (!existingUserInfo.hasAttribute('data-bound')) {
                existingUserInfo.setAttribute('data-bound', 'true');
                existingUserInfo.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleSidebar();
                });
            }
        } else {
            // 创建新的头像触发区域
            this.avatarTrigger = document.createElement('div');
            this.avatarTrigger.className = 'user-avatar-trigger';
            this.avatarTrigger.innerHTML = `
                <div class="avatar-wrapper">
                    <div class="avatar-icon" id="userAvatar">
                        <span id="userAvatarEmoji">😊</span>
                    </div>
                    <div class="avatar-status" id="userStatus"></div>
                </div>
            `;
            
            // 添加到页面头部
            const header = document.querySelector('.app-header');
            if (header) {
                // 插入到header-content中
                const headerContent = header.querySelector('.header-content');
                if (headerContent) {
                    headerContent.appendChild(this.avatarTrigger);
                } else {
                    header.appendChild(this.avatarTrigger);
                }
                console.log('创建新的头像触发区域');
            } else {
                document.body.appendChild(this.avatarTrigger);
                console.log('添加到body');
            }
            
            // 绑定点击事件
            this.avatarTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSidebar();
            });
        }
        
        // 初始化显示
        this.updateAvatarTrigger();
    }
    
    updateAvatarTrigger() {
        if (!this.avatarTrigger) return;
        
        const avatarEmoji = this.avatarTrigger.querySelector('#userAvatarEmoji');
        const statusIcon = this.avatarTrigger.querySelector('#userStatus');
        
        if (avatarEmoji && this.currentUser) {
            // 设置头像
            const avatarEmojiText = this.currentUser.avatarEmoji || 
                                   this.getAvatarEmoji(this.currentUser.avatar) || 
                                   '😊';
            avatarEmoji.textContent = avatarEmojiText;
        }
        
        if (statusIcon) {
            if (this.isLoggedIn && !this.isGuest) {
                if (this.currentUser.isOffline) {
                    statusIcon.className = 'avatar-status offline';
                    statusIcon.title = '离线';
                } else {
                    statusIcon.className = 'avatar-status online';
                    statusIcon.title = '在线';
                }
            } else {
                statusIcon.className = 'avatar-status guest';
                statusIcon.title = '游客';
            }
        }
        
        // 添加或移除登录状态类
        if (this.isLoggedIn && !this.isGuest) {
            this.avatarTrigger.classList.add('logged-in');
            this.avatarTrigger.classList.remove('guest');
        } else {
            this.avatarTrigger.classList.remove('logged-in');
            this.avatarTrigger.classList.add('guest');
        }
    }
    
    // ==================== 更新首页用户信息 ====================
    
    updateHeaderUserInfo() {
        // 查找现有的用户信息区域
        const userInfoElement = document.querySelector('.user-info');
        
        if (userInfoElement && this.currentUser) {
            const avatarElement = userInfoElement.querySelector('.user-avatar');
            const usernameElement = userInfoElement.querySelector('.username');
            const pointsElement = userInfoElement.querySelector('#user-points');
            
            if (avatarElement) {
                const avatarEmoji = this.currentUser.avatarEmoji || 
                                   this.getAvatarEmoji(this.currentUser.avatar) || 
                                   '😊';
                avatarElement.textContent = avatarEmoji;
            }
            
            if (usernameElement) {
                usernameElement.textContent = this.currentUser.nickname || this.currentUser.username;
            }
            
            if (pointsElement) {
                pointsElement.textContent = this.currentUser.points || 0;
            }
            
            // 确保点击事件绑定
            if (!userInfoElement.hasAttribute('data-bound')) {
                userInfoElement.setAttribute('data-bound', 'true');
                userInfoElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleSidebar();
                });
            }
        }
    }
    
    // ==================== 侧边栏控制方法 ====================
    
    showSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.add('active');
            this.sidebarVisible = true;
            
            // 更新侧边栏内容
            this.updateSidebar();
            
            // 移动端隐藏背景滚动
            if (window.innerWidth <= 768) {
                document.body.style.overflow = 'hidden';
                this.sidebar.classList.add('mobile');
            }
        }
    }
    
    hideSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.remove('active');
            this.sidebarVisible = false;
            document.body.style.overflow = '';
            this.sidebar.classList.remove('mobile');
        }
    }
    
    toggleSidebar() {
        if (this.sidebarVisible) {
            this.hideSidebar();
        } else {
            this.showSidebar();
        }
    }
    
    // ==================== 登录系统 - 保留1.js完整功能 ====================
    
    createLoginModal() {
        this.loginModal = document.createElement('div');
        this.loginModal.className = 'login-modal';
        this.loginModal.innerHTML = `
            <div class="login-modal-content">
                <div class="login-modal-header">
                    <h2>魔力补给站登录</h2>
                    <button class="login-modal-close" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="login-modal-body">
                    <form id="loginForm" class="login-form">
                        <div class="form-group">
                            <label for="loginUsername">
                                <i class="fas fa-user"></i> 用户名
                            </label>
                            <input 
                                type="text" 
                                id="loginUsername" 
                                placeholder="请输入用户名" 
                                required
                                autocomplete="username"
                                maxlength="12"
                            >
                            <div class="form-hint" id="loginUsernameHint">
                                用户名2-12位字符
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="loginPassword">
                                <i class="fas fa-lock"></i> 密码
                            </label>
                            <input 
                                type="password" 
                                id="loginPassword" 
                                placeholder="请输入密码" 
                                required
                                autocomplete="current-password"
                                minlength="6"
                                maxlength="20"
                            >
                            <div class="form-hint" id="loginPasswordHint">
                                密码6-20位字符
                            </div>
                        </div>
                        
                        <div class="form-options">
                            <label class="remember-me">
                                <input type="checkbox" id="rememberMe" checked>
                                <span>记住我</span>
                            </label>
                            <a href="#" class="forgot-password" id="forgotPassword">
                                忘记密码？
                            </a>
                        </div>
                        
                        <button type="submit" class="btn btn-primary login-submit">
                            <i class="fas fa-sign-in-alt"></i> 登录
                        </button>
                        
                        <div class="login-divider">
                            <span>还没有账号？</span>
                        </div>
                        
                        <button type="button" class="btn btn-secondary switch-to-register">
                            <i class="fas fa-user-plus"></i> 立即注册
                        </button>
                    </form>
                    
                    <!-- 找回密码面板 -->
                    <div id="forgotPasswordPanel" class="forgot-password-panel" style="display: none;">
                        <div class="password-reset-form">
                            <h3><i class="fas fa-key"></i> 找回密码</h3>
                            <p class="reset-info">
                                请输入您的用户名，系统将为您重置密码。
                                <br>
                                <small>（密码将重置为：123456，请登录后及时修改）</small>
                            </p>
                            
                            <div class="form-group">
                                <label for="resetUsername">
                                    <i class="fas fa-user"></i> 用户名
                                </label>
                                <input 
                                    type="text" 
                                    id="resetUsername" 
                                    placeholder="请输入要重置的用户名"
                                    required
                                    maxlength="12"
                                >
                            </div>
                            
                            <div class="reset-actions">
                                <button type="button" class="btn btn-secondary cancel-reset">
                                    取消
                                </button>
                                <button type="button" class="btn btn-primary reset-password">
                                    <i class="fas fa-redo"></i> 重置密码
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="login-modal-footer">
                    <p class="login-tips">
                        <i class="fas fa-info-circle"></i>
                        本系统为粉丝娱乐向项目，支持离线模式
                    </p>
                </div>
            </div>
            <div class="login-modal-overlay"></div>
        `;
        
        document.body.appendChild(this.loginModal);
        
        // 绑定登录弹窗事件
        this.bindLoginModalEvents();
    }
    
    bindLoginModalEvents() {
        const closeBtn = this.loginModal.querySelector('.login-modal-close');
        const loginForm = this.loginModal.querySelector('#loginForm');
        const switchToRegister = this.loginModal.querySelector('.switch-to-register');
        const forgotPassword = this.loginModal.querySelector('#forgotPassword');
        const cancelReset = this.loginModal.querySelector('.cancel-reset');
        const resetPasswordBtn = this.loginModal.querySelector('.reset-password');
        
        // 关闭按钮
        closeBtn.addEventListener('click', () => this.hideLoginModal());
        
        // 点击遮罩层关闭
        this.loginModal.querySelector('.login-modal-overlay').addEventListener('click', () => {
            this.hideLoginModal();
        });
        
        // 登录表单提交
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
        
        // 切换到注册
        switchToRegister.addEventListener('click', () => {
            this.hideLoginModal();
            this.showRegisterForm();
        });
        
        // 忘记密码
        forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForgotPasswordPanel();
        });
        
        // 取消密码重置
        cancelReset.addEventListener('click', () => {
            this.hideForgotPasswordPanel();
        });
        
        // 重置密码
        resetPasswordBtn.addEventListener('click', async () => {
            await this.handlePasswordReset();
        });
        
        // 输入验证
        const usernameInput = this.loginModal.querySelector('#loginUsername');
        const passwordInput = this.loginModal.querySelector('#loginPassword');
        
        usernameInput.addEventListener('input', () => this.validateLoginForm());
        passwordInput.addEventListener('input', () => this.validateLoginForm());
    }
    
    validateLoginForm() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const usernameHint = document.getElementById('loginUsernameHint');
        const passwordHint = document.getElementById('loginPasswordHint');
        const submitBtn = this.loginModal.querySelector('.login-submit');
        
        let isValid = true;
        
        // 验证用户名
        if (username.length < 2 || username.length > 12) {
            usernameHint.textContent = '用户名应为2-12位字符';
            usernameHint.className = 'form-hint error';
            isValid = false;
        } else {
            usernameHint.textContent = '✓ 用户名格式正确';
            usernameHint.className = 'form-hint success';
        }
        
        // 验证密码
        if (password.length < 6) {
            passwordHint.textContent = '密码至少6位字符';
            passwordHint.className = 'form-hint error';
            isValid = false;
        } else if (password.length > 20) {
            passwordHint.textContent = '密码最多20位字符';
            passwordHint.className = 'form-hint error';
            isValid = false;
        } else {
            passwordHint.textContent = '✓ 密码格式正确';
            passwordHint.className = 'form-hint success';
        }
        
        // 更新按钮状态
        submitBtn.disabled = !isValid;
        
        return isValid;
    }
    
    async handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // 验证表单
        if (!this.validateLoginForm()) {
            return;
        }
        
        try {
            // 显示加载状态
            const submitBtn = this.loginModal.querySelector('.login-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
            submitBtn.disabled = true;
            
            // 使用新版API登录
            const result = await window.TaociApi.loginWithPassword(username, password);
            
            if (result.success) {
                // 登录成功
                this.currentUser = result.data;
                this.isLoggedIn = true;
                this.isGuest = false;
                
                // 保存登录状态
                if (rememberMe) {
                    localStorage.setItem('taoci_remember_login', 'true');
                }
                
                // 更新UI
                this.updateAvatarTrigger();
                this.updateSidebar();
                this.updateHeaderUserInfo();
                
                // 关闭登录弹窗
                this.hideLoginModal();
                
                // 触发登录事件
                this.context.emit('user:login', this.currentUser);
                
                // 显示欢迎消息
                this.showToast(`欢迎回来，${this.currentUser.nickname || this.currentUser.username}！`, 'success');
                
                // 如果是离线用户，提示
                if (result.data.isOffline) {
                    setTimeout(() => {
                        this.showToast('您当前处于离线模式，部分功能可能受限', 'info');
                    }, 1000);
                }
            } else {
                this.showToast(result.error || '登录失败', 'error');
            }
            
        } catch (error) {
            console.error('登录失败:', error);
            this.showToast('登录失败，请稍后重试', 'error');
        } finally {
            // 恢复按钮状态
            const submitBtn = this.loginModal.querySelector('.login-submit');
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> 登录';
            submitBtn.disabled = false;
        }
    }
    
    // ==================== 注册系统 - 保留1.js完整功能 ====================
    
    createRegisterForm() {
        this.registerForm = document.createElement('div');
        this.registerForm.className = 'register-modal';
        this.registerForm.innerHTML = `
            <div class="register-modal-content">
                <div class="register-modal-header">
                    <h2>注册新账号</h2>
                    <button class="register-modal-close" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="register-modal-body">
                    <form id="registerForm" class="register-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="regUsername">
                                    <i class="fas fa-user"></i> 用户名 *
                                </label>
                                <input 
                                    type="text" 
                                    id="regUsername" 
                                    placeholder="用于登录，2-12位字符"
                                    required
                                    maxlength="12"
                                >
                                <div class="form-hint" id="usernameHint"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="regNickname">
                                    <i class="fas fa-user-tag"></i> 昵称
                                </label>
                                <input 
                                    type="text" 
                                    id="regNickname" 
                                    placeholder="显示名称（可选）"
                                    maxlength="10"
                                >
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="regPassword">
                                    <i class="fas fa-lock"></i> 密码 *
                                </label>
                                <input 
                                    type="password" 
                                    id="regPassword" 
                                    placeholder="6-20位字符"
                                    required
                                    minlength="6"
                                    maxlength="20"
                                >
                                <div class="password-strength" id="passwordStrength">
                                    <div class="strength-bar"></div>
                                    <span class="strength-text">密码强度</span>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="regConfirmPassword">
                                    <i class="fas fa-lock"></i> 确认密码 *
                                </label>
                                <input 
                                    type="password" 
                                    id="regConfirmPassword" 
                                    placeholder="再次输入密码"
                                    required
                                >
                                <div class="form-hint" id="passwordMatchHint"></div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="regSignature">
                                <i class="fas fa-pen"></i> 个性签名
                            </label>
                            <input 
                                type="text" 
                                id="regSignature" 
                                placeholder="一句话介绍自己（可选）"
                                maxlength="50"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <i class="fas fa-user-circle"></i> 选择头像
                            </label>
                            <div class="avatar-selection" id="registerAvatarSelection">
                                <!-- 头像选项由JavaScript动态生成 -->
                            </div>
                        </div>
                        
                        <div class="form-agreement">
                            <label class="agreement-checkbox">
                                <input type="checkbox" id="agreeTerms" required checked>
                                <span>我已阅读并同意 <a href="#" class="terms-link">用户协议</a></span>
                            </label>
                        </div>
                        
                        <div class="register-actions">
                            <button type="button" class="btn btn-secondary cancel-register">
                                返回登录
                            </button>
                            <button type="submit" class="btn btn-primary register-submit">
                                <i class="fas fa-user-plus"></i> 注册账号
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="register-modal-overlay"></div>
        `;
        
        document.body.appendChild(this.registerForm);
        
        // 绑定注册表单事件
        this.bindRegisterFormEvents();
        
        // 生成头像选项
        this.populateRegisterAvatarOptions();
    }
    
    populateRegisterAvatarOptions() {
        const avatarContainer = document.getElementById('registerAvatarSelection');
        if (!avatarContainer) return;
        
        avatarContainer.innerHTML = this.avatarPresets.map(avatar => `
            <div class="avatar-option" data-avatar="${avatar.id}" title="${avatar.name}">
                <div class="avatar-preview">${avatar.emoji}</div>
                <div class="avatar-name">${avatar.name}</div>
            </div>
        `).join('');
        
        // 设置默认选中
        const defaultAvatar = avatarContainer.querySelector('.avatar-option[data-avatar="default"]');
        if (defaultAvatar) {
            defaultAvatar.classList.add('selected');
        }
    }
    
    bindRegisterFormEvents() {
        const closeBtn = this.registerForm.querySelector('.register-modal-close');
        const registerForm = this.registerForm.querySelector('#registerForm');
        const cancelBtn = this.registerForm.querySelector('.cancel-register');
        const avatarOptions = this.registerForm.querySelectorAll('.avatar-option');
        const usernameInput = this.registerForm.querySelector('#regUsername');
        const passwordInput = this.registerForm.querySelector('#regPassword');
        const confirmPasswordInput = this.registerForm.querySelector('#regConfirmPassword');
        
        // 关闭按钮
        closeBtn.addEventListener('click', () => this.hideRegisterForm());
        
        // 遮罩层关闭
        this.registerForm.querySelector('.register-modal-overlay').addEventListener('click', () => {
            this.hideRegisterForm();
        });
        
        // 返回登录
        cancelBtn.addEventListener('click', () => {
            this.hideRegisterForm();
            this.showLoginModal();
        });
        
        // 注册表单提交
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister();
        });
        
        // 头像选择
        avatarOptions.forEach(option => {
            option.addEventListener('click', () => {
                avatarOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // 用户名实时验证
        usernameInput.addEventListener('input', () => {
            this.validateRegisterUsername(usernameInput.value);
        });
        
        // 密码强度检测
        passwordInput.addEventListener('input', () => {
            this.checkPasswordStrength(passwordInput.value);
        });
        
        // 密码一致性检查
        confirmPasswordInput.addEventListener('input', () => {
            this.checkPasswordMatch();
        });
    }
    
    validateRegisterUsername(username) {
        const hint = document.getElementById('usernameHint');
        
        if (username.length < 2) {
            hint.textContent = '用户名至少2位';
            hint.className = 'form-hint error';
            return false;
        }
        
        if (username.length > 12) {
            hint.textContent = '用户名最多12位';
            hint.className = 'form-hint error';
            return false;
        }
        
        // 使用新版API检查用户名
        const exists = window.TaociApi.isLocalUserExists?.(username);
        if (exists) {
            hint.textContent = '用户名已存在';
            hint.className = 'form-hint error';
            return false;
        }
        
        hint.textContent = '✓ 用户名可用';
        hint.className = 'form-hint success';
        return true;
    }
    
    checkPasswordStrength(password) {
        const strengthBar = this.registerForm.querySelector('.strength-bar');
        const strengthText = this.registerForm.querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return;
        
        let strength = 0;
        let text = '弱';
        let color = 'var(--color-accent-red)';
        
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        if (strength >= 4) {
            text = '强';
            color = 'var(--color-accent-green)';
        } else if (strength >= 2) {
            text = '中';
            color = 'var(--color-accent-yellow)';
        }
        
        strengthBar.style.width = `${strength * 20}%`;
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = `密码强度: ${text}`;
        strengthText.style.color = color;
    }
    
    checkPasswordMatch() {
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirmPassword').value;
        const hint = document.getElementById('passwordMatchHint');
        
        if (!hint) return;
        
        if (confirm === '') {
            hint.textContent = '';
            return false;
        }
        
        if (password === confirm) {
            hint.textContent = '✓ 密码一致';
            hint.className = 'form-hint success';
            return true;
        } else {
            hint.textContent = '✗ 密码不一致';
            hint.className = 'form-hint error';
            return false;
        }
    }
    
    async handleRegister() {
        // 获取表单数据
        const username = document.getElementById('regUsername').value.trim();
        const nickname = document.getElementById('regNickname').value.trim() || username;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const signature = document.getElementById('regSignature').value.trim();
        const selectedAvatar = this.registerForm.querySelector('.avatar-option.selected');
        const avatar = selectedAvatar ? selectedAvatar.dataset.avatar : 'default';
        const avatarEmoji = this.getAvatarEmoji(avatar);
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // 验证数据
        if (!this.validateRegisterUsername(username)) {
            this.showToast('用户名验证失败', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showToast('密码至少6位字符', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showToast('两次输入的密码不一致', 'error');
            return;
        }
        
        if (!agreeTerms) {
            this.showToast('请同意用户协议', 'error');
            return;
        }
        
        try {
            // 显示加载状态
            const submitBtn = this.registerForm.querySelector('.register-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 注册中...';
            submitBtn.disabled = true;
            
            // 使用新版API注册（registerAndLogin方法）
            const result = await window.TaociApi.registerAndLogin(username, password, avatarEmoji);
            
            if (result.success) {
                // 注册成功，自动登录
                this.currentUser = result.data;
                this.isLoggedIn = true;
                this.isGuest = false;
                
                // 如果有昵称或签名，更新用户信息
                if (nickname !== username || signature) {
                    const updates = {};
                    if (nickname !== username) updates.nickname = nickname;
                    if (signature) updates.signature = signature;
                    
                    await window.TaociApi.updateLocalUserInfo?.(updates);
                    
                    // 更新当前用户对象
                    this.currentUser = { ...this.currentUser, ...updates };
                }
                
                // 更新UI
                this.updateAvatarTrigger();
                this.updateSidebar();
                this.updateHeaderUserInfo();
                
                // 触发注册成功事件
                this.context.emit('user:registered', this.currentUser);
                this.context.emit('user:login', this.currentUser);
                
                // 关闭注册表单
                this.hideRegisterForm();
                
                this.showToast(`欢迎加入，${nickname}！初始积分已发放`, 'success');
                
                // 显示离线提示
                if (result.data.isOffline) {
                    setTimeout(() => {
                        this.showToast('当前为离线模式，网络恢复后数据将自动同步', 'info');
                    }, 1500);
                }
            } else {
                this.showToast(result.error || '注册失败', 'error');
            }
            
        } catch (error) {
            console.error('注册失败:', error);
            this.showToast('注册失败，请稍后重试', 'error');
        } finally {
            // 恢复按钮状态
            const submitBtn = this.registerForm.querySelector('.register-submit');
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> 注册账号';
            submitBtn.disabled = false;
        }
    }
    
    // ==================== 头像选择器组件 ====================
    
    createAvatarSelector() {
        this.avatarSelector = document.createElement('div');
        this.avatarSelector.className = 'avatar-selector-modal';
        this.avatarSelector.innerHTML = `
            <div class="avatar-selector-content">
                <div class="avatar-selector-header">
                    <h3><i class="fas fa-user-circle"></i> 选择头像</h3>
                    <button class="avatar-selector-close" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="avatar-selector-body">
                    <div class="avatar-presets" id="avatarPresetsGrid">
                        <!-- 预设头像由JavaScript动态生成 -->
                    </div>
                    
                    <div class="avatar-selector-actions">
                        <button type="button" class="btn btn-secondary cancel-select-avatar">
                            取消
                        </button>
                        <button type="button" class="btn btn-primary confirm-select-avatar" disabled>
                            <i class="fas fa-check"></i> 确定选择
                        </button>
                    </div>
                </div>
                
                <div class="avatar-selector-footer">
                    <p class="avatar-selector-tips">
                        <i class="fas fa-lightbulb"></i>
                        点击头像进行选择，支持离线使用
                    </p>
                </div>
            </div>
            <div class="avatar-selector-overlay"></div>
        `;
        
        document.body.appendChild(this.avatarSelector);
        
        // 生成预设头像
        this.populateAvatarPresets();
        
        // 绑定事件
        this.bindAvatarSelectorEvents();
    }
    
    populateAvatarPresets() {
        const grid = document.getElementById('avatarPresetsGrid');
        if (!grid) return;
        
        grid.innerHTML = this.avatarPresets.map(avatar => `
            <div class="avatar-preset-item" data-avatar-id="${avatar.id}" title="${avatar.name}">
                <div class="avatar-preset-emoji">${avatar.emoji}</div>
                <div class="avatar-preset-name">${avatar.name}</div>
            </div>
        `).join('');
    }
    
    bindAvatarSelectorEvents() {
        const closeBtn = this.avatarSelector.querySelector('.avatar-selector-close');
        const cancelBtn = this.avatarSelector.querySelector('.cancel-select-avatar');
        const confirmBtn = this.avatarSelector.querySelector('.confirm-select-avatar');
        const overlay = this.avatarSelector.querySelector('.avatar-selector-overlay');
        const presetItems = this.avatarSelector.querySelectorAll('.avatar-preset-item');
        
        // 关闭按钮
        closeBtn.addEventListener('click', () => this.hideAvatarSelector());
        
        // 取消按钮
        cancelBtn.addEventListener('click', () => this.hideAvatarSelector());
        
        // 遮罩层关闭
        overlay.addEventListener('click', () => this.hideAvatarSelector());
        
        // 选择头像
        presetItems.forEach(item => {
            item.addEventListener('click', () => {
                // 移除所有选中状态
                presetItems.forEach(i => i.classList.remove('selected'));
                
                // 添加选中状态
                item.classList.add('selected');
                
                // 启用确认按钮
                confirmBtn.disabled = false;
                
                // 保存选择的头像ID
                this.selectedAvatarId = item.dataset.avatarId;
            });
        });
        
        // 确认选择
        confirmBtn.addEventListener('click', () => {
            this.handleAvatarSelection();
        });
    }
    
    showAvatarSelector(currentAvatarId = 'default') {
        if (!this.avatarSelector) return;
        
        // 显示模态框
        this.avatarSelector.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // 重置选择
        const presetItems = this.avatarSelector.querySelectorAll('.avatar-preset-item');
        presetItems.forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.avatarId === currentAvatarId) {
                item.classList.add('selected');
                this.selectedAvatarId = currentAvatarId;
            }
        });
        
        // 更新确认按钮状态
        const confirmBtn = this.avatarSelector.querySelector('.confirm-select-avatar');
        confirmBtn.disabled = !currentAvatarId;
    }
    
    hideAvatarSelector() {
        if (!this.avatarSelector) return;
        
        this.avatarSelector.classList.remove('active');
        document.body.style.overflow = '';
        
        // 重置选择
        this.selectedAvatarId = null;
    }
    
    async handleAvatarSelection() {
        if (!this.selectedAvatarId || !this.isLoggedIn || !this.currentUser) {
            this.showToast('请先选择头像', 'error');
            return;
        }
        
        try {
            // 获取对应的emoji
            const avatarEmoji = this.getAvatarEmoji(this.selectedAvatarId);
            
            // 更新用户信息（使用新版API）
            const result = await window.TaociApi.updateLocalUserInfo({
                avatar: avatarEmoji
            });
            
            if (result.success) {
                // 更新当前用户对象
                this.currentUser.avatar = avatarEmoji;
                this.currentUser.avatarId = this.selectedAvatarId;
                
                // 更新UI
                this.updateAvatarTrigger();
                this.updateSidebar();
                this.updateHeaderUserInfo();
                
                // 关闭头像选择器
                this.hideAvatarSelector();
                
                this.showToast('头像更新成功', 'success');
            } else {
                this.showToast(result.error || '更新失败', 'error');
            }
        } catch (error) {
            console.error('更新头像失败:', error);
            this.showToast('更新头像失败，请稍后重试', 'error');
        }
    }
    
    // ==================== 主要功能方法 ====================
    
    async handleLogout() {
        if (!confirm('确定要退出登录吗？')) return;
        
        try {
            // 调用API登出
            await window.TaociApi.logout();
            
            // 切换回游客账户
            await this.useGuestAccount();
            
            // 隐藏侧边栏
            this.hideSidebar();
            
            // 触发退出事件
            this.context.emit('user:logout');
            
            this.showToast('已退出登录，切换为游客模式', 'info');
            
        } catch (error) {
            console.error('退出登录失败:', error);
            // 即使出错也切换到游客
            await this.useGuestAccount();
        }
    }
    
    // ==================== 密码相关操作 ====================
    
    async handlePasswordReset() {
        const username = document.getElementById('resetUsername').value.trim();
        
        if (!username) {
            this.showToast('请输入用户名', 'error');
            return;
        }
        
        try {
            // 使用新版API重置密码
            const result = await window.TaociApi.resetLocalPassword(username);
            
            if (result.success) {
                this.showToast(`密码已重置为：${result.data.defaultPassword}`, 'success');
                this.hideForgotPasswordPanel();
                
                // 自动填充登录表单
                document.getElementById('loginUsername').value = username;
                document.getElementById('loginPassword').value = result.data.defaultPassword;
                
            } else {
                this.showToast(result.error || '重置失败', 'error');
            }
        } catch (error) {
            console.error('重置密码失败:', error);
            this.showToast('重置密码失败', 'error');
        }
    }
    
    showChangePassword() {
        if (!this.isLoggedIn || !this.currentUser) {
            this.showToast('请先登录', 'error');
            return;
        }
        
        const oldPassword = prompt('请输入旧密码：');
        if (oldPassword === null) return;
        
        const newPassword = prompt('请输入新密码（6-20位）：');
        if (newPassword === null) return;
        
        if (newPassword.length < 6 || newPassword.length > 20) {
            this.showToast('新密码应为6-20位字符', 'error');
            return;
        }
        
        const confirmPassword = prompt('请再次输入新密码：');
        if (confirmPassword === null) return;
        
        if (newPassword !== confirmPassword) {
            this.showToast('两次输入的新密码不一致', 'error');
            return;
        }
        
        // 使用新版API修改密码
        window.TaociApi.changeLocalPassword?.(oldPassword, newPassword)
            .then(result => {
                if (result.success) {
                    this.showToast('密码修改成功', 'success');
                } else {
                    this.showToast(result.error || '修改失败', 'error');
                }
            })
            .catch(error => {
                console.error('修改密码失败:', error);
                this.showToast('修改密码失败', 'error');
            });
    }
    
    // ==================== 数据同步 ====================
    
    async syncUserData() {
        if (!this.isLoggedIn || !this.currentUser) {
            this.showToast('请先登录', 'error');
            return;
        }
        
        // 显示同步中状态
        const syncBtn = document.getElementById('syncDataBtn');
        const originalText = syncBtn.innerHTML;
        syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 同步中...';
        syncBtn.disabled = true;
        
        try {
            // 尝试重新登录以同步数据
            if (this.currentUser.username && !this.currentUser.isOffline) {
                // 使用现有token重新获取用户信息
                const userResult = await window.TaociApi.getSmartUserInfo();
                
                if (userResult.success) {
                    this.currentUser = userResult.data;
                    this.updateSidebar();
                    this.showToast('数据同步成功', 'success');
                } else {
                    this.showToast('同步失败：' + (userResult.error || '未知错误'), 'error');
                }
            } else {
                this.showToast('离线用户数据已是最新', 'info');
            }
        } catch (error) {
            console.error('数据同步失败:', error);
            this.showToast('数据同步失败', 'error');
        } finally {
            // 恢复按钮状态
            syncBtn.innerHTML = originalText;
            syncBtn.disabled = false;
        }
    }
    
    // ==================== 积分更新显示 ====================
    
    async updatePointsDisplay() {
        if (!this.currentUser) return;
        
        const points = this.currentUser.points || 0;
        const pointsTotal = document.getElementById('pointsTotal');
        if (pointsTotal) pointsTotal.textContent = points;
        
        // 更新其他积分显示
        if (this.isLoggedIn && !this.isGuest) {
            try {
                // 获取今日积分
                const todayPoints = await window.TaociApi.getTodayLocalPoints?.();
                const pointsToday = document.getElementById('pointsToday');
                if (pointsToday) pointsToday.textContent = todayPoints || 0;
                
                // 累计积分
                const records = await window.TaociApi.getLocalPointsHistory?.();
                const totalEarned = records ? records.reduce((sum, record) => sum + (record.points || 0), 0) : 0;
                const pointsTotalEarned = document.getElementById('pointsTotalEarned');
                if (pointsTotalEarned) pointsTotalEarned.textContent = totalEarned || 0;
            } catch (error) {
                console.error('获取积分数据失败:', error);
            }
        } else {
            // 游客模式下显示0
            const pointsToday = document.getElementById('pointsToday');
            if (pointsToday) pointsToday.textContent = '0';
            const pointsTotalEarned = document.getElementById('pointsTotalEarned');
            if (pointsTotalEarned) pointsTotalEarned.textContent = '0';
        }
    }
    
    // ==================== UI控制方法 ====================
    
    showLoginModal() {
        if (this.loginModal) {
            this.loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // 自动聚焦到用户名输入框
            setTimeout(() => {
                const usernameInput = document.getElementById('loginUsername');
                if (usernameInput) usernameInput.focus();
            }, 100);
        }
    }
    
    hideLoginModal() {
        if (this.loginModal) {
            this.loginModal.classList.remove('active');
            document.body.style.overflow = '';
            
            // 重置表单
            const loginForm = document.getElementById('loginForm');
            if (loginForm) loginForm.reset();
            
            // 隐藏找回密码面板
            this.hideForgotPasswordPanel();
        }
    }
    
    showForgotPasswordPanel() {
        const loginForm = document.getElementById('loginForm');
        const forgotPanel = document.getElementById('forgotPasswordPanel');
        
        if (loginForm && forgotPanel) {
            loginForm.style.display = 'none';
            forgotPanel.style.display = 'block';
            
            // 聚焦到重置用户名输入框
            setTimeout(() => {
                const resetInput = document.getElementById('resetUsername');
                if (resetInput) resetInput.focus();
            }, 100);
        }
    }
    
    hideForgotPasswordPanel() {
        const loginForm = document.getElementById('loginForm');
        const forgotPanel = document.getElementById('forgotPasswordPanel');
        
        if (loginForm && forgotPanel) {
            loginForm.style.display = 'block';
            forgotPanel.style.display = 'none';
            
            // 重置输入框
            const resetInput = document.getElementById('resetUsername');
            if (resetInput) resetInput.value = '';
        }
    }
    
    showRegisterForm() {
        if (this.registerForm) {
            this.registerForm.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // 重置表单
            const registerForm = document.getElementById('registerForm');
            if (registerForm) registerForm.reset();
            
            // 重置头像选择
            const defaultAvatar = this.registerForm.querySelector('.avatar-option[data-avatar="default"]');
            if (defaultAvatar) {
                this.registerForm.querySelectorAll('.avatar-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                defaultAvatar.classList.add('selected');
            }
            
            // 聚焦到用户名输入框
            setTimeout(() => {
                const usernameInput = document.getElementById('regUsername');
                if (usernameInput) usernameInput.focus();
            }, 100);
        }
    }
    
    hideRegisterForm() {
        if (this.registerForm) {
            this.registerForm.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // ==================== 事件处理 ====================
    
    onAppReady() {
        console.log('用户系统模块：应用已准备就绪');
    }
    
    onUserLogin(user) {
        console.log('用户系统模块：用户登录', user);
        this.currentUser = user;
        this.isLoggedIn = true;
        this.isGuest = false;
        
        this.updateAvatarTrigger();
        this.updateSidebar();
        this.updateHeaderUserInfo();
    }
    
    onUserLogout() {
        console.log('用户系统模块：用户退出');
        this.handleLogout();
    }
    
    async onPointsUpdated(data) {
        if (this.isLoggedIn && this.currentUser && data.userId === this.currentUser.userId) {
            this.currentUser.points = data.points;
            this.updatePointsDisplay();
            this.updateHeaderUserInfo();
        }
    }
    
    // ==================== 编辑资料功能 ====================
    
    showEditProfile() {
        // 简单的编辑资料弹窗
        const currentUser = this.currentUser;
        if (!currentUser) return;
        
        const currentNickname = currentUser.nickname || currentUser.username;
        const currentSignature = currentUser.signature || '';
        
        const newNickname = prompt('请输入新的昵称（留空保持原样）：', currentNickname);
        if (newNickname === null) return;
        
        const newSignature = prompt('请输入新的个性签名（留空保持原样）：', currentSignature);
        if (newSignature === null) return;
        
        const updates = {};
        if (newNickname !== '' && newNickname !== currentNickname) {
            updates.nickname = newNickname;
        }
        if (newSignature !== '' && newSignature !== currentSignature) {
            updates.signature = newSignature;
        }
        
        if (Object.keys(updates).length === 0) {
            this.showToast('没有修改任何内容', 'info');
            return;
        }
        
        // 使用新版API更新用户信息
        window.TaociApi.updateLocalUserInfo?.(updates)
            .then(result => {
                if (result.success) {
                    // 更新当前用户对象
                    this.currentUser = { ...this.currentUser, ...result.data };
                    this.updateSidebar();
                    this.updateHeaderUserInfo();
                    this.showToast('个人信息已更新', 'success');
                } else {
                    this.showToast(result.error || '更新失败', 'error');
                }
            })
            .catch(error => {
                console.error('更新个人信息失败:', error);
                this.showToast('更新失败', 'error');
            });
    }
    
    // ==================== 辅助方法 ====================
    
    getAvatarEmoji(avatarId) {
        const avatar = this.avatarPresets.find(a => a.id === avatarId);
        return avatar ? avatar.emoji : '😊';
    }
    
    getAvatarIdFromEmoji(emoji) {
        if (!emoji) return 'default';
        const avatar = this.avatarPresets.find(a => a.emoji === emoji);
        return avatar ? avatar.id : 'default';
    }
    
    formatDate(dateString) {
        if (!dateString) return '--';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '--';
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `user-toast user-toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // 自动移除
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    getToastIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }
    
    handleResize() {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.add('mobile');
            if (this.sidebarVisible) {
                document.body.style.overflow = 'hidden';
            }
        } else {
            this.sidebar.classList.remove('mobile');
            if (!this.sidebarVisible) {
                document.body.style.overflow = '';
            }
        }
    }
    
    // ==================== 公共API ====================
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isUserLoggedIn() {
        return this.isLoggedIn && !this.isGuest;
    }
    
    isUserGuest() {
        return this.isGuest;
    }
    
    getUserPoints() {
        return this.currentUser?.points || 0;
    }
    
    async awardPoints(points, reason, game) {
        try {
            const result = await window.TaociApi.smartAddPoints(points, reason, game);
            if (result.success && this.currentUser) {
                this.currentUser.points = result.data.newPoints;
                this.updatePointsDisplay();
                this.updateHeaderUserInfo();
                return true;
            }
            return false;
        } catch (error) {
            console.error('添加积分失败:', error);
            return false;
        }
    }
    
    destroy() {
        // 清理资源
        if (this.loginModal && this.loginModal.parentNode) {
            this.loginModal.parentNode.removeChild(this.loginModal);
        }
        
        if (this.registerForm && this.registerForm.parentNode) {
            this.registerForm.parentNode.removeChild(this.registerForm);
        }
        
        if (this.avatarSelector && this.avatarSelector.parentNode) {
            this.avatarSelector.parentNode.removeChild(this.avatarSelector);
        }
        
        if (this.sidebar && this.sidebar.parentNode) {
            this.sidebar.parentNode.removeChild(this.sidebar);
        }
        
        if (this.avatarTrigger && this.avatarTrigger.parentNode) {
            this.avatarTrigger.parentNode.removeChild(this.avatarTrigger);
        }
        
        console.log(`✅ ${this.name} 模块已销毁`);
    }
}