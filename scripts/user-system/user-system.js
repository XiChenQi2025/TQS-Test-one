/**
 * 用户系统模块
 * 功能：登录、注册、个人信息管理、积分系统集成
 * 版本：2.0.0（整合版）
 */
export default class UserSystemModule {
    constructor() {
        this.name = 'user-system';
        this.version = '2.0.0';
        this.dependencies = ['auth'];
        
        // 状态管理
        this.currentUser = null;
        this.isLoggedIn = false;
        this.sidebarVisible = false;
        
        // 预设头像列表（采用emoji）
        this.avatarPresets = [
            { id: 'default', emoji: '😊', name: '默认' },
            { id: 'cat', emoji: '🐱', name: '猫咪' },
            { id: 'dog', emoji: '🐶', name: '狗狗' },
            { id: 'rabbit', emoji: '🐰', name: '兔兔' },
            { id: 'fox', emoji: '🦊', name: '狐狸' },
            { id: 'panda', emoji: '🐼', name: '熊猫' },
            { id: 'unicorn', emoji: '🦄', name: '独角兽' },
            { id: 'dragon', emoji: '🐉', name: '小龙' },
            { id: 'star', emoji: '⭐', name: '星星' },
            { id: 'heart', emoji: '❤️', name: '爱心' },
            { id: 'rainbow', emoji: '🌈', name: '彩虹' },
            { id: 'sparkles', emoji: '✨', name: '闪光' },
            { id: 'sun', emoji: '☀️', name: '太阳' },
            { id: 'moon', emoji: '🌙', name: '月亮' },
            { id: 'flower', emoji: '🌸', name: '樱花' },
            { id: 'fire', emoji: '🔥', name: '火焰' }
        ];
        
        // DOM 元素引用
        this.loginModal = null;
        this.registerForm = null;
        this.sidebar = null;
        this.avatarTrigger = null;
        this.avatarSelector = null;
        
        // API客户端引用
        this.apiClient = null;
    }
    
    async init(context) {
        this.context = context;
        this.app = context.app;
        this.config = context.config;
        
        // 获取API客户端
        this.apiClient = window.TaociApi;
        if (!this.apiClient) {
            console.error('API客户端未找到，用户系统功能受限');
            return this;
        }
        
        // 初始化用户系统
        await this.setup();
        this.bindEvents();
        
        console.log(`✅ ${this.name} 模块已初始化`);
        return this;
    }
    
    async setup() {
        // 1. 创建登录弹窗
        this.createLoginModal();
        
        // 2. 创建注册表单
        this.createRegisterForm();
        
        // 3. 创建个人信息侧边栏
        this.createUserSidebar();
        
        // 4. 创建头像触发区域
        this.createAvatarTrigger();
        
        // 5. 创建独立头像选择器
        this.createAvatarSelector();
        
        // 6. 检查登录状态
        await this.checkLoginStatus();
    }
    
    bindEvents() {
        // 监听应用事件
        this.context.on('app:ready', this.onAppReady.bind(this));
        this.context.on('auth:login', this.onUserLogin.bind(this));
        this.context.on('auth:logout', this.onUserLogout.bind(this));
        this.context.on('points:updated', this.onPointsUpdated.bind(this));
        
        // 监听API事件
        document.addEventListener('api:sessionRestored', () => {
            this.checkLoginStatus();
        });
        
        // 窗口大小变化时调整侧边栏
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // ESC键关闭侧边栏
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebarVisible) {
                this.hideSidebar();
            }
        });
    }
    
    // ==================== 登录系统 ====================
    
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
                            >
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
                            >
                        </div>
                        
                        <div class="form-options">
                            <label class="remember-me">
                                <input type="checkbox" id="rememberMe">
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
                        本系统为粉丝娱乐向项目，账号仅用于记录积分和游戏进度
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
    }
    
    async handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!username || !password) {
            this.showToast('请输入用户名和密码', 'error');
            return;
        }
        
        try {
            // 显示加载状态
            const submitBtn = this.loginModal.querySelector('.login-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
            submitBtn.disabled = true;
            
            // 使用API客户端登录
            let result;
            if (this.apiClient.loginWithPassword) {
                // 使用密码登录
                result = await this.apiClient.loginWithPassword(username, password, '😊');
            } else {
                // 回退到普通登录
                result = await this.apiClient.login(username, '😊');
            }
            
            if (result.success) {
                // 登录成功
                this.currentUser = result.data;
                this.isLoggedIn = true;
                
                // 保存登录状态
                if (rememberMe) {
                    localStorage.setItem('remembered_user', username);
                }
                
                // 更新UI
                this.updateAvatarTrigger();
                this.updateSidebar();
                this.updateHeaderUserInfo();
                
                // 关闭登录弹窗
                this.hideLoginModal();
                
                // 显示欢迎消息
                const displayName = this.currentUser.nickname || this.currentUser.username;
                this.showToast(`欢迎回来，${displayName}！`, 'success');
                
                // 触发登录事件
                this.context.emit('user:login', this.currentUser);
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
    
    // ==================== 注册系统 ====================
    
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
                                    minlength="2"
                                    maxlength="12"
                                >
                                <div class="form-hint" id="usernameHint"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="regNickname">
                                    <i class="fas fa-user-tag"></i> 昵称 *
                                </label>
                                <input 
                                    type="text" 
                                    id="regNickname" 
                                    placeholder="显示名称，2-10位字符"
                                    required
                                    minlength="2"
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
                                ${this.generateAvatarOptions()}
                            </div>
                        </div>
                        
                        <div class="form-agreement">
                            <label class="agreement-checkbox">
                                <input type="checkbox" id="agreeTerms" required>
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
    }
    
    generateAvatarOptions() {
        return this.avatarPresets.map(avatar => `
            <div class="avatar-option" data-avatar="${avatar.id}">
                <div class="avatar-preview" data-emoji="${avatar.emoji}">
                    ${avatar.emoji}
                </div>
                <div class="avatar-name">${avatar.name}</div>
            </div>
        `).join('');
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
        
        // 默认选中第一个头像
        if (avatarOptions.length > 0) {
            avatarOptions[0].classList.add('selected');
        }
        
        // 用户名实时验证
        usernameInput.addEventListener('input', () => {
            this.validateUsername(usernameInput.value);
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
    
    validateUsername(username) {
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
        
        // 简单的用户名验证（字母、数字、中文）
        if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(username)) {
            hint.textContent = '只能包含中文、字母和数字';
            hint.className = 'form-hint error';
            return false;
        }
        
        hint.textContent = '✓ 用户名可用';
        hint.className = 'form-hint success';
        return true;
    }
    
    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
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
        const nickname = document.getElementById('regNickname').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const signature = document.getElementById('regSignature').value.trim();
        const selectedAvatar = this.registerForm.querySelector('.avatar-option.selected');
        const avatarEmoji = selectedAvatar ? selectedAvatar.querySelector('.avatar-preview').dataset.emoji : '😊';
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // 验证数据
        if (!this.validateUsername(username)) {
            this.showToast('用户名验证失败', 'error');
            return;
        }
        
        if (!nickname || nickname.length < 2) {
            this.showToast('昵称至少2位字符', 'error');
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
            
            // 使用API客户端注册
            let result;
            if (this.apiClient.registerAndLogin) {
                result = await this.apiClient.registerAndLogin(username, password, avatarEmoji);
            } else {
                // 回退到普通注册
                result = await this.apiClient.login(username, avatarEmoji);
            }
            
            if (result.success) {
                // 注册成功
                this.currentUser = result.data;
                this.isLoggedIn = true;
                
                // 更新用户信息（昵称、签名等）
                if (nickname !== username || signature) {
                    try {
                        if (this.apiClient.updateLocalUserInfo) {
                            await this.apiClient.updateLocalUserInfo({
                                nickname: nickname || username,
                                signature: signature || '这个人很懒，什么都没有写~'
                            });
                        }
                    } catch (error) {
                        console.warn('更新用户信息失败:', error);
                    }
                }
                
                // 重新获取用户信息
                try {
                    if (this.apiClient.getSmartUserInfo) {
                        const userInfo = await this.apiClient.getSmartUserInfo();
                        if (userInfo.success) {
                            this.currentUser = userInfo.data;
                        }
                    }
                } catch (error) {
                    console.warn('获取用户信息失败:', error);
                }
                
                // 更新UI
                this.updateAvatarTrigger();
                this.updateSidebar();
                this.updateHeaderUserInfo();
                
                // 关闭注册表单
                this.hideRegisterForm();
                
                // 显示欢迎消息
                this.showToast(`欢迎加入，${nickname}！`, 'success');
                
                // 触发注册成功事件
                this.context.emit('user:registered', this.currentUser);
                this.context.emit('user:login', this.currentUser);
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
    
    // ==================== 头像选择器 ====================
    
    createAvatarSelector() {
        this.avatarSelector = document.createElement('div');
        this.avatarSelector.className = 'avatar-selector-modal';
        this.avatarSelector.innerHTML = `
            <div class="avatar-selector-content">
                <div class="avatar-selector-header">
                    <h3>选择头像</h3>
                    <button class="avatar-selector-close" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="avatar-selector-body">
                    <div class="current-avatar-section">
                        <div class="current-avatar-label">当前头像</div>
                        <div class="current-avatar-display" id="currentAvatarDisplay">
                            <span id="currentAvatarEmoji">😊</span>
                        </div>
                    </div>
                    
                    <div class="avatar-presets-section">
                        <div class="avatar-presets-label">预设头像</div>
                        <div class="avatar-presets-grid" id="avatarPresetsGrid">
                            ${this.generateAvatarSelectorOptions()}
                        </div>
                    </div>
                    
                    <div class="avatar-actions">
                        <button type="button" class="btn btn-secondary avatar-selector-cancel">
                            取消
                        </button>
                        <button type="button" class="btn btn-primary avatar-selector-confirm">
                            <i class="fas fa-check"></i> 确认更换
                        </button>
                    </div>
                </div>
            </div>
            <div class="avatar-selector-overlay"></div>
        `;
        
        document.body.appendChild(this.avatarSelector);
        
        // 绑定头像选择器事件
        this.bindAvatarSelectorEvents();
    }
    
    generateAvatarSelectorOptions() {
        return this.avatarPresets.map(avatar => `
            <div class="avatar-preset-item" data-avatar-id="${avatar.id}" data-avatar-emoji="${avatar.emoji}">
                <div class="avatar-preset-preview">
                    ${avatar.emoji}
                </div>
                <div class="avatar-preset-name">${avatar.name}</div>
            </div>
        `).join('');
    }
    
    bindAvatarSelectorEvents() {
        const closeBtn = this.avatarSelector.querySelector('.avatar-selector-close');
        const cancelBtn = this.avatarSelector.querySelector('.avatar-selector-cancel');
        const confirmBtn = this.avatarSelector.querySelector('.avatar-selector-confirm');
        const presetItems = this.avatarSelector.querySelectorAll('.avatar-preset-item');
        const overlay = this.avatarSelector.querySelector('.avatar-selector-overlay');
        
        // 关闭按钮
        closeBtn.addEventListener('click', () => this.hideAvatarSelector());
        
        // 取消按钮
        cancelBtn.addEventListener('click', () => this.hideAvatarSelector());
        
        // 遮罩层关闭
        overlay.addEventListener('click', () => this.hideAvatarSelector());
        
        // 确认更换
        confirmBtn.addEventListener('click', async () => {
            await this.handleAvatarChange();
        });
        
        // 预设头像点击
        presetItems.forEach(item => {
            item.addEventListener('click', () => {
                // 移除其他选中状态
                presetItems.forEach(i => i.classList.remove('selected'));
                
                // 添加选中状态
                item.classList.add('selected');
                
                // 更新当前头像显示
                const emoji = item.dataset.avatarEmoji;
                const avatarId = item.dataset.avatarId;
                
                document.getElementById('currentAvatarEmoji').textContent = emoji;
                document.getElementById('currentAvatarDisplay').dataset.avatarId = avatarId;
            });
        });
    }
    
    async handleAvatarChange() {
        if (!this.isLoggedIn) {
            this.showToast('请先登录', 'error');
            return;
        }
        
        const currentAvatarDisplay = document.getElementById('currentAvatarDisplay');
        const selectedAvatarId = currentAvatarDisplay.dataset.avatarId;
        const selectedAvatarEmoji = document.getElementById('currentAvatarEmoji').textContent;
        
        if (!selectedAvatarId) {
            this.showToast('请选择一个头像', 'error');
            return;
        }
        
        try {
            // 显示加载状态
            const confirmBtn = this.avatarSelector.querySelector('.avatar-selector-confirm');
            const originalText = confirmBtn.innerHTML;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 更新中...';
            confirmBtn.disabled = true;
            
            // 更新用户头像
            if (this.apiClient.updateLocalUserInfo) {
                const result = await this.apiClient.updateLocalUserInfo({
                    avatar: selectedAvatarId,
                    avatarEmoji: selectedAvatarEmoji
                });
                
                if (result.success) {
                    // 更新当前用户数据
                    this.currentUser.avatar = selectedAvatarId;
                    this.currentUser.avatarEmoji = selectedAvatarEmoji;
                    
                    // 更新UI
                    this.updateAvatarTrigger();
                    this.updateSidebar();
                    this.updateHeaderUserInfo();
                    
                    // 关闭头像选择器
                    this.hideAvatarSelector();
                    
                    this.showToast('头像更新成功', 'success');
                    
                    // 触发头像更新事件
                    this.context.emit('user:avatar-updated', {
                        avatar: selectedAvatarId,
                        avatarEmoji: selectedAvatarEmoji
                    });
                } else {
                    this.showToast(result.error || '头像更新失败', 'error');
                }
            } else {
                this.showToast('头像更新功能暂不可用', 'error');
            }
            
        } catch (error) {
            console.error('更换头像失败:', error);
            this.showToast('更换头像失败，请稍后重试', 'error');
        } finally {
            // 恢复按钮状态
            const confirmBtn = this.avatarSelector.querySelector('.avatar-selector-confirm');
            confirmBtn.innerHTML = '<i class="fas fa-check"></i> 确认更换';
            confirmBtn.disabled = false;
        }
    }
    
    showAvatarSelector() {
        if (!this.isLoggedIn) {
            this.showToast('请先登录', 'error');
            return;
        }
        
        if (this.avatarSelector) {
            // 设置当前头像
            const currentAvatarId = this.currentUser?.avatar || 'default';
            const currentAvatar = this.avatarPresets.find(a => a.id === currentAvatarId) || this.avatarPresets[0];
            
            document.getElementById('currentAvatarEmoji').textContent = currentAvatar.emoji;
            document.getElementById('currentAvatarDisplay').dataset.avatarId = currentAvatar.id;
            
            // 选中当前头像
            const presetItems = this.avatarSelector.querySelectorAll('.avatar-preset-item');
            presetItems.forEach(item => {
                item.classList.remove('selected');
                if (item.dataset.avatarId === currentAvatarId) {
                    item.classList.add('selected');
                }
            });
            
            this.avatarSelector.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideAvatarSelector() {
        if (this.avatarSelector) {
            this.avatarSelector.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // ==================== 个人信息侧边栏 ====================
    
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
                        <h3 class="sidebar-username" id="sidebarUsername">未登录</h3>
                        <p class="sidebar-nickname" id="sidebarNickname">游客</p>
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
                            <span class="info-label">个性签名</span>
                            <span class="info-value" id="infoSignature">未设置</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">加入时间</span>
                            <span class="info-value" id="infoJoinDate">--</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">最后登录</span>
                            <span class="info-value" id="infoLastLogin">--</span>
                        </div>
                    </div>
                </div>
                
                <!-- 快捷操作 -->
                <div class="actions-section">
                    <h4><i class="fas fa-bolt"></i> 快捷操作</h4>
                    <div class="action-buttons">
                        <button class="btn btn-secondary edit-profile">
                            <i class="fas fa-edit"></i> 编辑资料
                        </button>
                        <button class="btn btn-secondary change-avatar">
                            <i class="fas fa-user-circle"></i> 更换头像
                        </button>
                        <button class="btn btn-secondary change-password">
                            <i class="fas fa-lock"></i> 修改密码
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="sidebar-footer">
                <button class="btn btn-logout" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i> 退出登录
                </button>
            </div>
        `;
        
        document.body.appendChild(this.sidebar);
        
        // 绑定侧边栏事件
        this.bindSidebarEvents();
    }
    
    bindSidebarEvents() {
        const closeBtn = this.sidebar.querySelector('.sidebar-close');
        const logoutBtn = this.sidebar.querySelector('#logoutBtn');
        const editProfileBtn = this.sidebar.querySelector('.edit-profile');
        const changeAvatarBtn = this.sidebar.querySelector('.change-avatar');
        const changePasswordBtn = this.sidebar.querySelector('.change-password');
        
        // 关闭侧边栏
        closeBtn.addEventListener('click', () => this.hideSidebar());
        
        // 退出登录
        logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // 编辑资料
        editProfileBtn.addEventListener('click', () => this.showEditProfile());
        
        // 更换头像
        changeAvatarBtn.addEventListener('click', () => {
            this.hideSidebar();
            setTimeout(() => this.showAvatarSelector(), 300);
        });
        
        // 修改密码
        changePasswordBtn.addEventListener('click', () => {
            this.hideSidebar();
            setTimeout(() => this.showChangePassword(), 300);
        });
        
        // 点击侧边栏外部关闭（移动端）
        document.addEventListener('click', (e) => {
            if (this.sidebarVisible && 
                !this.sidebar.contains(e.target) && 
                !this.avatarTrigger.contains(e.target)) {
                this.hideSidebar();
            }
        });
    }
    
    // ==================== 头像触发区域 ====================
    
    createAvatarTrigger() {
        // 查找现有的用户信息区域
        const existingUserInfo = document.querySelector('.user-info');
        
        if (existingUserInfo) {
            this.avatarTrigger = existingUserInfo;
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
                const headerContent = header.querySelector('.header-content');
                if (headerContent) {
                    headerContent.appendChild(this.avatarTrigger);
                } else {
                    header.appendChild(this.avatarTrigger);
                }
            } else {
                document.body.appendChild(this.avatarTrigger);
            }
        }
        
        // 绑定点击事件
        this.avatarTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.isLoggedIn) {
                this.toggleSidebar();
            } else {
                this.showLoginModal();
            }
        });
    }
    
    updateAvatarTrigger() {
        if (!this.avatarTrigger) return;
        
        const avatarEmoji = this.avatarTrigger.querySelector('#userAvatarEmoji');
        const statusIcon = this.avatarTrigger.querySelector('#userStatus');
        
        if (this.isLoggedIn && this.currentUser) {
            // 设置头像
            const avatarEmojiText = this.currentUser.avatarEmoji || 
                                   this.avatarPresets.find(a => a.id === this.currentUser.avatar)?.emoji || 
                                   '😊';
            
            if (avatarEmoji) {
                avatarEmoji.textContent = avatarEmojiText;
            }
            
            // 设置在线状态
            if (statusIcon) {
                statusIcon.className = 'avatar-status online';
                statusIcon.title = '在线';
            }
            
            // 添加登录状态类
            this.avatarTrigger.classList.add('logged-in');
        } else {
            // 游客状态
            if (avatarEmoji) {
                avatarEmoji.textContent = '😊';
            }
            
            if (statusIcon) {
                statusIcon.className = 'avatar-status offline';
                statusIcon.title = '离线';
            }
            
            // 移除登录状态类
            this.avatarTrigger.classList.remove('logged-in');
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
                                   this.avatarPresets.find(a => a.id === this.currentUser.avatar)?.emoji || 
                                   '😊';
                avatarElement.textContent = avatarEmoji;
            }
            
            if (usernameElement) {
                usernameElement.textContent = this.currentUser.nickname || this.currentUser.username;
            }
            
            if (pointsElement) {
                pointsElement.textContent = this.currentUser.points || 0;
            }
        }
    }
    
    // ==================== 主要功能方法 ====================
    
    async checkLoginStatus() {
        try {
            // 尝试获取当前用户信息
            if (this.apiClient.getSmartUserInfo) {
                const userInfo = await this.apiClient.getSmartUserInfo();
                
                if (userInfo.success) {
                    // 恢复用户信息
                    this.currentUser = userInfo.data;
                    this.isLoggedIn = true;
                    
                    // 更新UI
                    this.updateAvatarTrigger();
                    this.updateSidebar();
                    this.updateHeaderUserInfo();
                    
                    console.log('已恢复登录状态:', this.currentUser.nickname || this.currentUser.username);
                    return;
                }
            }
            
            // 检查是否有记住的用户
            const rememberedUser = localStorage.getItem('remembered_user');
            if (rememberedUser && !this.loginModal.classList.contains('active')) {
                // 自动填充用户名
                const usernameInput = document.getElementById('loginUsername');
                if (usernameInput) {
                    usernameInput.value = rememberedUser;
                }
            }
            
            // 未登录，显示登录弹窗（延迟显示）
            setTimeout(() => {
                if (!this.isLoggedIn && !this.loginModal.classList.contains('active')) {
                    this.showLoginModal();
                }
            }, 1000);
            
        } catch (error) {
            console.error('检查登录状态失败:', error);
        }
    }
    
    updateSidebar() {
        if (!this.sidebar) return;
        
        if (this.isLoggedIn && this.currentUser) {
            // 更新用户信息
            document.getElementById('sidebarUsername').textContent = this.currentUser.username;
            document.getElementById('sidebarNickname').textContent = this.currentUser.nickname || this.currentUser.username;
            document.getElementById('infoSignature').textContent = this.currentUser.signature || '这个人很懒，什么都没有写~';
            
            // 更新头像
            const avatarEmoji = this.currentUser.avatarEmoji || 
                               this.avatarPresets.find(a => a.id === this.currentUser.avatar)?.emoji || 
                               '😊';
            document.getElementById('sidebarAvatarEmoji').textContent = avatarEmoji;
            
            // 更新积分
            this.updatePointsDisplay();
            
            // 更新日期信息
            if (this.currentUser.joinDate) {
                const joinDate = new Date(this.currentUser.joinDate);
                document.getElementById('infoJoinDate').textContent = 
                    joinDate.toLocaleDateString('zh-CN');
            }
            
            // 更新最后登录时间
            document.getElementById('infoLastLogin').textContent = 
                new Date().toLocaleDateString('zh-CN');
            
        } else {
            // 游客状态
            document.getElementById('sidebarUsername').textContent = '未登录';
            document.getElementById('sidebarNickname').textContent = '游客';
            document.getElementById('infoSignature').textContent = '请先登录';
            document.getElementById('infoJoinDate').textContent = '--';
            document.getElementById('infoLastLogin').textContent = '--';
            
            document.getElementById('sidebarAvatarEmoji').textContent = '😊';
            
            // 重置积分显示
            document.getElementById('pointsTotal').textContent = '0';
            document.getElementById('pointsToday').textContent = '0';
            document.getElementById('pointsTotalEarned').textContent = '0';
            document.getElementById('pointsRank').textContent = '--';
        }
    }
    
    async updatePointsDisplay() {
        if (!this.isLoggedIn || !this.currentUser) return;
        
        // 更新积分总数
        const points = this.currentUser.points || 0;
        document.getElementById('pointsTotal').textContent = points;
        
        // 获取今日积分
        try {
            if (this.apiClient.getTodayLocalPoints) {
                const todayPoints = await this.apiClient.getTodayLocalPoints();
                document.getElementById('pointsToday').textContent = todayPoints;
            } else {
                document.getElementById('pointsToday').textContent = '0';
            }
        } catch (error) {
            document.getElementById('pointsToday').textContent = '0';
        }
        
        // 获取累计积分
        try {
            if (this.apiClient.getLocalPointsHistory) {
                const history = await this.apiClient.getLocalPointsHistory(1000);
                const totalEarned = history.reduce((sum, record) => sum + (record.points || 0), 0);
                document.getElementById('pointsTotalEarned').textContent = totalEarned;
            } else {
                document.getElementById('pointsTotalEarned').textContent = '0';
            }
        } catch (error) {
            document.getElementById('pointsTotalEarned').textContent = '0';
        }
        
        // 获取排名
        try {
            if (this.apiClient.getLocalUserRanking) {
                const ranking = await this.apiClient.getLocalUserRanking(100);
                const userRank = ranking.findIndex(item => item.userId === this.currentUser.userId);
                document.getElementById('pointsRank').textContent = userRank >= 0 ? `#${userRank + 1}` : '--';
            } else {
                document.getElementById('pointsRank').textContent = '--';
            }
        } catch (error) {
            document.getElementById('pointsRank').textContent = '--';
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
            // 更新本地积分
            this.currentUser.points = data.points;
            
            // 更新显示
            this.updatePointsDisplay();
            this.updateHeaderUserInfo();
        }
    }
    
    async handleLogout() {
        if (!confirm('确定要退出登录吗？')) {
            return;
        }
        
        try {
            // 调用API登出
            if (this.apiClient.logout) {
                await this.apiClient.logout();
            }
            
            // 重置用户状态
            this.currentUser = null;
            this.isLoggedIn = false;
            
            // 清除记住的用户
            localStorage.removeItem('remembered_user');
            
            // 更新UI
            this.updateAvatarTrigger();
            this.updateSidebar();
            this.updateHeaderUserInfo();
            this.hideSidebar();
            
            // 触发退出事件
            this.context.emit('user:logout');
            
            this.showToast('已退出登录', 'info');
            
            // 显示登录弹窗
            setTimeout(() => {
                this.showLoginModal();
            }, 500);
            
        } catch (error) {
            console.error('退出登录失败:', error);
        }
    }
    
    showEditProfile() {
        // 简单的编辑资料弹窗
        const currentSignature = this.currentUser?.signature || '';
        const currentNickname = this.currentUser?.nickname || this.currentUser?.username || '';
        
        const newNickname = prompt('请输入新的昵称：', currentNickname);
        if (newNickname === null) return;
        
        if (newNickname.length < 2 || newNickname.length > 10) {
            this.showToast('昵称长度应为2-10位', 'error');
            return;
        }
        
        const newSignature = prompt('请输入新的个性签名（最多50字，可选）：', currentSignature);
        if (newSignature === null) return;
        
        if (newSignature.length > 50) {
            this.showToast('个性签名不能超过50字', 'error');
            return;
        }
        
        // 更新用户信息
        if (this.apiClient.updateLocalUserInfo) {
            this.apiClient.updateLocalUserInfo({
                nickname: newNickname,
                signature: newSignature || ''
            }).then(result => {
                if (result.success) {
                    this.currentUser.nickname = newNickname;
                    this.currentUser.signature = newSignature;
                    this.updateSidebar();
                    this.updateHeaderUserInfo();
                    this.showToast('资料更新成功', 'success');
                } else {
                    this.showToast(result.error || '资料更新失败', 'error');
                }
            }).catch(error => {
                console.error('更新资料失败:', error);
                this.showToast('资料更新失败', 'error');
            });
        } else {
            this.showToast('资料更新功能暂不可用', 'error');
        }
    }
    
    showChangePassword() {
        const oldPassword = prompt('请输入旧密码：');
        if (!oldPassword) return;
        
        const newPassword = prompt('请输入新密码（6-20位）：');
        if (!newPassword) return;
        
        if (newPassword.length < 6 || newPassword.length > 20) {
            this.showToast('新密码长度应为6-20位', 'error');
            return;
        }
        
        const confirmPassword = prompt('请再次输入新密码：');
        if (!confirmPassword) return;
        
        if (newPassword !== confirmPassword) {
            this.showToast('两次输入的密码不一致', 'error');
            return;
        }
        
        // 修改密码
        if (this.apiClient.changeLocalPassword) {
            this.apiClient.changeLocalPassword(oldPassword, newPassword).then(result => {
                if (result.success) {
                    this.showToast('密码修改成功', 'success');
                } else {
                    this.showToast(result.error || '密码修改失败', 'error');
                }
            }).catch(error => {
                console.error('修改密码失败:', error);
                this.showToast('修改密码失败', 'error');
            });
        } else {
            this.showToast('密码修改功能暂不可用', 'error');
        }
    }
    
    async handlePasswordReset() {
        const username = document.getElementById('resetUsername').value.trim();
        
        if (!username) {
            this.showToast('请输入用户名', 'error');
            return;
        }
        
        try {
            let result;
            if (this.apiClient.resetLocalPassword) {
                result = await this.apiClient.resetLocalPassword(username);
            } else {
                // 回退到本地重置
                this.showToast('密码重置功能暂不可用', 'error');
                return;
            }
            
            if (result.success) {
                this.showToast(`密码已重置为：${result.data.defaultPassword}，请及时修改`, 'success');
                this.hideForgotPasswordPanel();
                
                // 自动填充登录表单
                document.getElementById('loginUsername').value = username;
                document.getElementById('loginPassword').value = result.data.defaultPassword;
            } else {
                this.showToast(result.error || '重置密码失败', 'error');
            }
        } catch (error) {
            console.error('重置密码失败:', error);
            this.showToast('重置密码失败', 'error');
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
            
            // 重置提示
            document.getElementById('usernameHint').textContent = '';
            document.getElementById('passwordMatchHint').textContent = '';
            
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
    
    showSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.add('active');
            this.sidebarVisible = true;
            
            // 更新侧边栏内容
            this.updateSidebar();
        }
    }
    
    hideSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.remove('active');
            this.sidebarVisible = false;
        }
    }
    
    toggleSidebar() {
        if (this.sidebarVisible) {
            this.hideSidebar();
        } else {
            this.showSidebar();
        }
    }
    
    // ==================== 辅助方法 ====================
    
    showToast(message, type = 'info') {
        // 创建Toast元素
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
        // 在移动端，侧边栏全屏显示
        if (window.innerWidth <= 768) {
            this.sidebar.classList.add('mobile');
            if (this.sidebarVisible) {
                document.body.style.overflow = 'hidden';
            }
        } else {
            this.sidebar.classList.remove('mobile');
            document.body.style.overflow = '';
        }
    }
    
    // ==================== 公共API ====================
    
    /**
     * 获取当前用户
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * 检查是否已登录
     */
    isUserLoggedIn() {
        return this.isLoggedIn;
    }
    
    /**
     * 获取用户积分
     */
    getUserPoints() {
        return this.currentUser?.points || 0;
    }
    
    /**
     * 添加积分（公开方法）
     */
    async awardPoints(points, reason, game) {
        try {
            let result;
            if (this.apiClient.smartAddPoints) {
                result = await this.apiClient.smartAddPoints(points, reason, game);
            } else if (this.apiClient.addPoints) {
                result = await this.apiClient.addPoints(points, reason, game);
            } else {
                console.error('积分添加功能不可用');
                return false;
            }
            
            if (result.success) {
                // 更新当前用户积分
                if (this.currentUser) {
                    this.currentUser.points = result.data.newPoints;
                }
                
                // 更新UI
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
    
    /**
     * 注册新用户（公开方法）
     */
    async registerUser(userData) {
        try {
            if (this.apiClient.registerAndLogin) {
                return await this.apiClient.registerAndLogin(
                    userData.username, 
                    userData.password, 
                    userData.avatarEmoji || '😊'
                );
            } else {
                console.error('用户注册功能不可用');
                return { success: false, error: '用户注册功能不可用' };
            }
        } catch (error) {
            console.error('注册用户失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 退出登录（公开方法）
     */
    async logoutUser() {
        return await this.handleLogout();
    }
    
    // ==================== 销毁方法 ====================
    
    destroy() {
        // 移除所有事件监听器
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('click', this.handleDocumentClick);
        
        // 移除所有DOM元素
        if (this.loginModal && this.loginModal.parentNode) {
            this.loginModal.parentNode.removeChild(this.loginModal);
        }
        
        if (this.registerForm && this.registerForm.parentNode) {
            this.registerForm.parentNode.removeChild(this.registerForm);
        }
        
        if (this.sidebar && this.sidebar.parentNode) {
            this.sidebar.parentNode.removeChild(this.sidebar);
        }
        
        if (this.avatarSelector && this.avatarSelector.parentNode) {
            this.avatarSelector.parentNode.removeChild(this.avatarSelector);
        }
        
        if (this.avatarTrigger && this.avatarTrigger.parentNode) {
            this.avatarTrigger.parentNode.removeChild(this.avatarTrigger);
        }
        
        console.log(`✅ ${this.name} 模块已销毁`);
    }
}