/**
 * 重构版用户系统模块
 * 优化：样式继承主骨架、修复侧边栏逻辑、添加查看他人信息功能
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
        
        // DOM 元素引用
        this.loginModal = null;
        this.registerForm = null;
        this.sidebar = null;
        this.userInfoTrigger = null;
        this.viewUserModal = null;
        
        // 预设头像列表
        this.avatarOptions = [
            { id: 'default', name: '默认', icon: 'fa-user', color: 'var(--color-primary)' },
            { id: 'cat', name: '猫咪', icon: 'fa-cat', color: 'var(--color-accent-red)' },
            { id: 'dog', name: '狗狗', icon: 'fa-dog', color: 'var(--color-accent-orange)' },
            { id: 'rabbit', name: '兔兔', icon: 'fa-paw', color: 'var(--color-accent-purple)' },
            { id: 'star', name: '星星', icon: 'fa-star', color: 'var(--color-accent-yellow)' },
            { id: 'heart', name: '爱心', icon: 'fa-heart', color: 'var(--color-accent-red)' },
            { id: 'gamepad', name: '游戏', icon: 'fa-gamepad', color: 'var(--color-accent-blue)' },
            { id: 'music', name: '音乐', icon: 'fa-music', color: 'var(--color-accent-purple)' },
            { id: 'camera', name: '相机', icon: 'fa-camera', color: 'var(--color-accent-green)' },
            { id: 'rocket', name: '火箭', icon: 'fa-rocket', color: 'var(--color-accent-red)' }
        ];
    }
    
    async init(context) {
        this.context = context;
        this.app = context.app;
        this.config = context.config;
        
        // 检查依赖
        if (!this.app.getModule('auth')) {
            console.warn('认证模块未找到，用户系统功能受限');
        }
        
        // 初始化用户系统
        await this.setup();
        this.bindEvents();
        
        console.log(`✅ ${this.name} 模块已初始化 v${this.version}`);
        return this;
    }
    
    async setup() {
        // 1. 使用现有的用户信息区域作为触发器
        this.attachToExistingUserInfo();
        
        // 2. 创建登录弹窗
        this.createLoginModal();
        
        // 3. 创建注册表单
        this.createRegisterForm();
        
        // 4. 创建个人信息侧边栏
        this.createUserSidebar();
        
        // 5. 创建查看他人信息弹窗
        this.createViewUserModal();
        
        // 6. 检查登录状态
        await this.checkLoginStatus();
    }
    
    attachToExistingUserInfo() {
        // 查找现有的用户信息区域
        this.userInfoTrigger = document.querySelector('.user-info');
        
        if (!this.userInfoTrigger) {
            console.warn('未找到用户信息区域，将在头部创建');
            this.createUserInfoTrigger();
        } else {
            console.log('已找到用户信息区域:', this.userInfoTrigger);
            
            // 添加点击事件
            this.userInfoTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleUserInfoClick();
            });
            
            // 添加悬停效果
            this.userInfoTrigger.style.cursor = 'pointer';
            this.userInfoTrigger.style.transition = 'transform var(--transition-normal)';
            
            this.userInfoTrigger.addEventListener('mouseenter', () => {
                this.userInfoTrigger.style.transform = 'translateY(-2px)';
            });
            
            this.userInfoTrigger.addEventListener('mouseleave', () => {
                this.userInfoTrigger.style.transform = 'translateY(0)';
            });
        }
    }
    
    handleUserInfoClick() {
        if (this.isLoggedIn) {
            this.toggleSidebar();
        } else {
            this.showLoginModal();
        }
    }
    
    createUserInfoTrigger() {
        // 创建新的用户信息触发器
        this.userInfoTrigger = document.createElement('div');
        this.userInfoTrigger.className = 'user-info';
        this.userInfoTrigger.innerHTML = `
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-details">
                <div class="username">未登录</div>
                <div class="user-points">
                    <span>✨</span>
                    <span id="user-points">0</span>
                </div>
            </div>
        `;
        
        // 添加到页面（假设有一个头部区域）
        const header = document.querySelector('.app-header, .header-content, header');
        if (header) {
            header.appendChild(this.userInfoTrigger);
        } else {
            // 如果找不到头部，添加到body
            document.body.appendChild(this.userInfoTrigger);
            this.userInfoTrigger.style.position = 'fixed';
            this.userInfoTrigger.style.top = '20px';
            this.userInfoTrigger.style.right = '20px';
            this.userInfoTrigger.style.zIndex = '100';
        }
        
        // 添加点击事件
        this.userInfoTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleUserInfoClick();
        });
    }
    
    bindEvents() {
        // 监听应用事件
        this.context.on('app:ready', this.onAppReady.bind(this));
        this.context.on('auth:login', this.onUserLogin.bind(this));
        this.context.on('auth:logout', this.onUserLogout.bind(this));
        this.context.on('points:updated', this.onPointsUpdated.bind(this));
        
        // 监听其他模块触发查看用户信息
        this.context.on('user:view', this.showViewUserModal.bind(this));
        
        // 窗口大小变化时调整侧边栏
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // ESC键关闭弹窗和侧边栏
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.sidebarVisible) {
                    this.hideSidebar();
                }
                if (this.viewUserModal && this.viewUserModal.classList.contains('active')) {
                    this.hideViewUserModal();
                }
            }
        });
    }
    
    // ==================== 登录系统 ====================
    
    createLoginModal() {
        this.loginModal = document.createElement('div');
        this.loginModal.className = 'user-login-modal';
        this.loginModal.innerHTML = `
            <div class="user-modal-overlay"></div>
            <div class="user-modal-content">
                <div class="user-modal-header">
                    <h2>欢迎来到魔力补给站</h2>
                    <button class="user-modal-close" type="button" aria-label="关闭">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="user-modal-body">
                    <form id="loginForm" class="user-form">
                        <div class="form-group">
                            <div class="form-label">
                                <i class="fas fa-user"></i>
                                <span>用户名</span>
                            </div>
                            <input 
                                type="text" 
                                id="loginUsername" 
                                placeholder="请输入用户名" 
                                required
                                autocomplete="username"
                                class="form-input"
                            >
                        </div>
                        
                        <div class="form-group">
                            <div class="form-label">
                                <i class="fas fa-lock"></i>
                                <span>密码</span>
                            </div>
                            <input 
                                type="password" 
                                id="loginPassword" 
                                placeholder="请输入密码" 
                                required
                                autocomplete="current-password"
                                class="form-input"
                            >
                        </div>
                        
                        <div class="form-options">
                            <label class="checkbox-label">
                                <input type="checkbox" id="rememberMe">
                                <span>记住我</span>
                            </label>
                            <button type="button" class="text-button" id="forgotPassword">
                                忘记密码？
                            </button>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-sign-in-alt"></i>
                                <span>登录</span>
                            </button>
                        </div>
                    </form>
                    
                    <div class="user-modal-divider">
                        <span>还没有账号？</span>
                    </div>
                    
                    <div class="user-modal-footer">
                        <button type="button" class="btn btn-secondary" id="switchToRegister">
                            <i class="fas fa-user-plus"></i>
                            <span>立即注册</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.loginModal);
        this.bindLoginModalEvents();
    }
    
    bindLoginModalEvents() {
        const closeBtn = this.loginModal.querySelector('.user-modal-close');
        const loginForm = this.loginModal.querySelector('#loginForm');
        const switchToRegister = this.loginModal.querySelector('#switchToRegister');
        const forgotPassword = this.loginModal.querySelector('#forgotPassword');
        
        // 关闭按钮
        closeBtn.addEventListener('click', () => this.hideLoginModal());
        
        // 点击遮罩层关闭
        this.loginModal.querySelector('.user-modal-overlay').addEventListener('click', () => {
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
            this.handleForgotPassword();
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
            const submitBtn = this.loginModal.querySelector('.btn-primary');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>登录中...</span>';
            submitBtn.disabled = true;
            
            // 调用登录逻辑
            const user = await this.localUserLogin(username, password);
            
            if (user) {
                // 登录成功
                this.currentUser = user;
                this.isLoggedIn = true;
                
                // 保存登录状态
                if (rememberMe) {
                    this.saveLoginSession(user);
                }
                
                // 更新UI
                this.updateUserInfoTrigger();
                this.updateSidebar();
                
                // 触发登录事件
                this.context.emit('user:login', user);
                
                // 关闭登录弹窗
                this.hideLoginModal();
                
                this.showToast(`欢迎回来，${user.nickname || user.username}！`, 'success');
            } else {
                this.showToast('用户名或密码错误', 'error');
            }
            
        } catch (error) {
            console.error('登录失败:', error);
            this.showToast('登录失败，请稍后重试', 'error');
        } finally {
            // 恢复按钮状态
            const submitBtn = this.loginModal.querySelector('.btn-primary');
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>登录</span>';
            submitBtn.disabled = false;
        }
    }
    
    handleForgotPassword() {
        const username = prompt('请输入您的用户名：');
        
        if (!username) return;
        
        const users = this.getLocalUsers();
        const user = users.find(u => u.username === username);
        
        if (user) {
            // 重置密码为123456
            user.password = '123456';
            this.saveLocalUsers(users);
            
            this.showToast(`密码已重置为：123456，请登录后及时修改`, 'success');
            
            // 自动填充登录表单
            document.getElementById('loginUsername').value = username;
            document.getElementById('loginPassword').value = '123456';
        } else {
            this.showToast('用户不存在', 'error');
        }
    }
    
    // ==================== 注册系统 ====================
    
    createRegisterForm() {
        this.registerForm = document.createElement('div');
        this.registerForm.className = 'user-register-modal';
        this.registerForm.innerHTML = `
            <div class="user-modal-overlay"></div>
            <div class="user-modal-content">
                <div class="user-modal-header">
                    <h2>注册新账号</h2>
                    <button class="user-modal-close" type="button" aria-label="关闭">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="user-modal-body">
                    <form id="registerForm" class="user-form">
                        <div class="form-row">
                            <div class="form-group">
                                <div class="form-label">
                                    <i class="fas fa-user"></i>
                                    <span>用户名 *</span>
                                </div>
                                <input 
                                    type="text" 
                                    id="regUsername" 
                                    placeholder="4-16位字母或数字"
                                    required
                                    pattern="[A-Za-z0-9]{4,16}"
                                    class="form-input"
                                >
                                <div class="form-hint" id="usernameHint"></div>
                            </div>
                            
                            <div class="form-group">
                                <div class="form-label">
                                    <i class="fas fa-user-tag"></i>
                                    <span>昵称 *</span>
                                </div>
                                <input 
                                    type="text" 
                                    id="regNickname" 
                                    placeholder="2-10位字符"
                                    required
                                    minlength="2"
                                    maxlength="10"
                                    class="form-input"
                                >
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <div class="form-label">
                                    <i class="fas fa-lock"></i>
                                    <span>密码 *</span>
                                </div>
                                <input 
                                    type="password" 
                                    id="regPassword" 
                                    placeholder="至少6位字符"
                                    required
                                    minlength="6"
                                    class="form-input"
                                >
                                <div class="password-strength">
                                    <div class="strength-bar"></div>
                                    <div class="strength-text">密码强度</div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <div class="form-label">
                                    <i class="fas fa-lock"></i>
                                    <span>确认密码 *</span>
                                </div>
                                <input 
                                    type="password" 
                                    id="regConfirmPassword" 
                                    placeholder="再次输入密码"
                                    required
                                    class="form-input"
                                >
                                <div class="form-hint" id="passwordMatchHint"></div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="form-label">
                                <i class="fas fa-pen"></i>
                                <span>个性签名</span>
                            </div>
                            <input 
                                type="text" 
                                id="regSignature" 
                                placeholder="一句话介绍自己（可选）"
                                maxlength="50"
                                class="form-input"
                            >
                        </div>
                        
                        <!-- 头像选择区域 -->
                        <div class="form-group">
                            <div class="form-label">
                                <i class="fas fa-user-circle"></i>
                                <span>选择头像</span>
                            </div>
                            <div class="avatar-selection-grid">
                                ${this.generateAvatarSelection()}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="agreeTerms" required>
                                <span>我已阅读并同意用户协议</span>
                            </label>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancelRegister">
                                <i class="fas fa-arrow-left"></i>
                                <span>返回登录</span>
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-user-plus"></i>
                                <span>注册账号</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.registerForm);
        this.bindRegisterFormEvents();
    }
    
    generateAvatarSelection() {
        return this.avatarOptions.map(avatar => `
            <div class="avatar-option" data-avatar="${avatar.id}" title="${avatar.name}">
                <div class="avatar-icon" style="background-color: ${avatar.color}">
                    <i class="fas ${avatar.icon}"></i>
                </div>
                <div class="avatar-name">${avatar.name}</div>
            </div>
        `).join('');
    }
    
    bindRegisterFormEvents() {
        const closeBtn = this.registerForm.querySelector('.user-modal-close');
        const registerForm = this.registerForm.querySelector('#registerForm');
        const cancelBtn = this.registerForm.querySelector('#cancelRegister');
        
        // 关闭按钮
        closeBtn.addEventListener('click', () => this.hideRegisterForm());
        
        // 遮罩层关闭
        this.registerForm.querySelector('.user-modal-overlay').addEventListener('click', () => {
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
        const avatarOptions = this.registerForm.querySelectorAll('.avatar-option');
        avatarOptions.forEach(option => {
            option.addEventListener('click', () => {
                avatarOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // 默认选择第一个头像
        if (avatarOptions.length > 0) {
            avatarOptions[0].classList.add('selected');
        }
        
        // 用户名实时验证
        const usernameInput = document.getElementById('regUsername');
        usernameInput.addEventListener('input', () => {
            this.validateUsername(usernameInput.value);
        });
        
        // 密码强度检测
        const passwordInput = document.getElementById('regPassword');
        passwordInput.addEventListener('input', () => {
            this.checkPasswordStrength(passwordInput.value);
        });
        
        // 密码一致性检查
        const confirmPasswordInput = document.getElementById('regConfirmPassword');
        confirmPasswordInput.addEventListener('input', () => {
            this.checkPasswordMatch();
        });
    }
    
    validateUsername(username) {
        const hint = document.getElementById('usernameHint');
        const users = this.getLocalUsers();
        
        if (username.length < 4) {
            hint.textContent = '用户名至少4位';
            hint.className = 'form-hint error';
            return false;
        }
        
        if (username.length > 16) {
            hint.textContent = '用户名最多16位';
            hint.className = 'form-hint error';
            return false;
        }
        
        if (!/^[A-Za-z0-9]+$/.test(username)) {
            hint.textContent = '只能包含字母和数字';
            hint.className = 'form-hint error';
            return false;
        }
        
        if (users.some(user => user.username === username)) {
            hint.textContent = '用户名已存在';
            hint.className = 'form-hint error';
            return false;
        }
        
        hint.textContent = '用户名可用';
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
        strengthText.textContent = text;
        strengthText.style.color = color;
    }
    
    checkPasswordMatch() {
        const password = document.getElementById('regPassword')?.value || '';
        const confirm = document.getElementById('regConfirmPassword')?.value || '';
        const hint = document.getElementById('passwordMatchHint');
        
        if (!hint) return;
        
        if (confirm === '') {
            hint.textContent = '';
            return false;
        }
        
        if (password === confirm) {
            hint.textContent = '密码一致';
            hint.className = 'form-hint success';
            return true;
        } else {
            hint.textContent = '密码不一致';
            hint.className = 'form-hint error';
            return false;
        }
    }
    
    async handleRegister() {
        // 获取表单数据
        const username = document.getElementById('regUsername')?.value.trim() || '';
        const nickname = document.getElementById('regNickname')?.value.trim() || '';
        const password = document.getElementById('regPassword')?.value || '';
        const confirmPassword = document.getElementById('regConfirmPassword')?.value || '';
        const signature = document.getElementById('regSignature')?.value.trim() || '';
        const selectedAvatar = this.registerForm.querySelector('.avatar-option.selected');
        const avatar = selectedAvatar ? selectedAvatar.dataset.avatar : 'default';
        const agreeTerms = document.getElementById('agreeTerms')?.checked || false;
        
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
            const submitBtn = this.registerForm.querySelector('.btn-primary');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>注册中...</span>';
            submitBtn.disabled = true;
            
            // 创建新用户
            const newUser = await this.createNewUser({
                username,
                password,
                nickname,
                avatar,
                signature
            });
            
            if (newUser) {
                // 注册成功，自动登录
                this.currentUser = newUser;
                this.isLoggedIn = true;
                
                // 更新UI
                this.updateUserInfoTrigger();
                this.updateSidebar();
                
                // 触发事件
                this.context.emit('user:registered', newUser);
                this.context.emit('user:login', newUser);
                
                // 关闭注册表单
                this.hideRegisterForm();
                
                this.showToast(`欢迎加入，${nickname}！`, 'success');
                
                // 发放初始积分
                await this.addPoints(100, '初始积分', '注册奖励');
            }
            
        } catch (error) {
            console.error('注册失败:', error);
            this.showToast('注册失败，请稍后重试', 'error');
        } finally {
            // 恢复按钮状态
            const submitBtn = this.registerForm.querySelector('.btn-primary');
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i><span>注册账号</span>';
            submitBtn.disabled = false;
        }
    }
    
    async createNewUser(userData) {
        const users = this.getLocalUsers();
        
        // 生成用户ID
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newUser = {
            id: userId,
            username: userData.username,
            password: userData.password,
            nickname: userData.nickname,
            avatar: userData.avatar,
            signature: userData.signature || '这个人很懒，什么都没有写~',
            points: 0,
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        // 添加到用户列表
        users.push(newUser);
        this.saveLocalUsers(users);
        
        return {
            id: newUser.id,
            username: newUser.username,
            nickname: newUser.nickname,
            avatar: newUser.avatar,
            signature: newUser.signature,
            points: newUser.points,
            joinDate: newUser.joinDate
        };
    }
    
    // ==================== 个人信息侧边栏 ====================
    
    createUserSidebar() {
        this.sidebar = document.createElement('div');
        this.sidebar.className = 'user-sidebar';
        this.sidebar.innerHTML = `
            <div class="sidebar-overlay"></div>
            <div class="sidebar-content">
                <div class="sidebar-header">
                    <div class="sidebar-user-info">
                        <div class="sidebar-avatar" id="sidebarAvatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="sidebar-user-details">
                            <h3 class="sidebar-username" id="sidebarUsername">未登录</h3>
                            <p class="sidebar-nickname" id="sidebarNickname">游客</p>
                        </div>
                    </div>
                    <button class="sidebar-close" type="button" aria-label="关闭">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="sidebar-body">
                    <!-- 积分卡片 -->
                    <div class="sidebar-card">
                        <div class="card-header">
                            <i class="fas fa-coins"></i>
                            <h4>我的积分</h4>
                        </div>
                        <div class="card-content">
                            <div class="points-total" id="pointsTotal">0</div>
                            <div class="points-details">
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
                    </div>
                    
                    <!-- 个人信息 -->
                    <div class="sidebar-card">
                        <div class="card-header">
                            <i class="fas fa-id-card"></i>
                            <h4>个人信息</h4>
                        </div>
                        <div class="card-content">
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
                    <div class="sidebar-card">
                        <div class="card-header">
                            <i class="fas fa-bolt"></i>
                            <h4>快捷操作</h4>
                        </div>
                        <div class="card-content">
                            <div class="action-buttons">
                                <button class="btn btn-secondary edit-profile">
                                    <i class="fas fa-edit"></i>
                                    <span>编辑资料</span>
                                </button>
                                <button class="btn btn-secondary change-avatar">
                                    <i class="fas fa-user-circle"></i>
                                    <span>更换头像</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 系统设置 -->
                    <div class="sidebar-card">
                        <div class="card-header">
                            <i class="fas fa-cog"></i>
                            <h4>设置</h4>
                        </div>
                        <div class="card-content">
                            <div class="settings-list">
                                <label class="setting-item">
                                    <span>显示在线状态</span>
                                    <input type="checkbox" id="showOnlineStatus" checked>
                                    <div class="toggle-switch"></div>
                                </label>
                                <label class="setting-item">
                                    <span>接收通知</span>
                                    <input type="checkbox" id="receiveNotifications" checked>
                                    <div class="toggle-switch"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="sidebar-footer">
                    <button class="btn btn-logout" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>退出登录</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.sidebar);
        this.bindSidebarEvents();
    }
    
    bindSidebarEvents() {
        const closeBtn = this.sidebar.querySelector('.sidebar-close');
        const logoutBtn = this.sidebar.querySelector('#logoutBtn');
        const editProfileBtn = this.sidebar.querySelector('.edit-profile');
        const changeAvatarBtn = this.sidebar.querySelector('.change-avatar');
        const overlay = this.sidebar.querySelector('.sidebar-overlay');
        
        // 关闭侧边栏
        closeBtn.addEventListener('click', () => this.hideSidebar());
        overlay.addEventListener('click', () => this.hideSidebar());
        
        // 退出登录
        logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // 编辑资料
        editProfileBtn.addEventListener('click', () => this.showEditProfile());
        
        // 更换头像
        changeAvatarBtn.addEventListener('click', () => this.showAvatarSelector());
    }
    
    // ==================== 查看他人信息弹窗 ====================
    
    createViewUserModal() {
        this.viewUserModal = document.createElement('div');
        this.viewUserModal.className = 'user-view-modal';
        this.viewUserModal.innerHTML = `
            <div class="user-modal-overlay"></div>
            <div class="user-modal-content">
                <div class="user-modal-header">
                    <h2>用户信息</h2>
                    <button class="user-modal-close" type="button" aria-label="关闭">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="user-modal-body">
                    <div class="view-user-profile">
                        <div class="view-user-avatar" id="viewUserAvatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="view-user-details">
                            <h3 class="view-username" id="viewUsername">用户名</h3>
                            <p class="view-nickname" id="viewNickname">昵称</p>
                        </div>
                    </div>
                    
                    <div class="view-user-info">
                        <div class="info-item">
                            <span class="info-label">个性签名</span>
                            <span class="info-value" id="viewSignature">--</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">加入时间</span>
                            <span class="info-value" id="viewJoinDate">--</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">积分</span>
                            <span class="info-value" id="viewPoints">0</span>
                        </div>
                    </div>
                    
                    <div class="view-user-actions">
                        <button class="btn btn-secondary" id="sendMessageBtn">
                            <i class="fas fa-envelope"></i>
                            <span>发送消息</span>
                        </button>
                        <button class="btn btn-primary" id="followUserBtn">
                            <i class="fas fa-user-plus"></i>
                            <span>关注</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.viewUserModal);
        this.bindViewUserModalEvents();
    }
    
    bindViewUserModalEvents() {
        const closeBtn = this.viewUserModal.querySelector('.user-modal-close');
        const overlay = this.viewUserModal.querySelector('.user-modal-overlay');
        
        closeBtn.addEventListener('click', () => this.hideViewUserModal());
        overlay.addEventListener('click', () => this.hideViewUserModal());
    }
    
    showViewUserModal(userData) {
        if (!this.viewUserModal) return;
        
        // 设置用户信息
        const avatarEl = document.getElementById('viewUserAvatar');
        const usernameEl = document.getElementById('viewUsername');
        const nicknameEl = document.getElementById('viewNickname');
        const signatureEl = document.getElementById('viewSignature');
        const joinDateEl = document.getElementById('viewJoinDate');
        const pointsEl = document.getElementById('viewPoints');
        
        // 设置头像
        avatarEl.className = 'view-user-avatar';
        const avatar = this.avatarOptions.find(a => a.id === userData.avatar) || this.avatarOptions[0];
        avatarEl.style.backgroundColor = avatar.color;
        avatarEl.innerHTML = `<i class="fas ${avatar.icon}"></i>`;
        
        // 设置其他信息
        usernameEl.textContent = userData.username || '未知用户';
        nicknameEl.textContent = userData.nickname || '未知昵称';
        signatureEl.textContent = userData.signature || '这个人很懒，什么都没有写~';
        
        if (userData.joinDate) {
            const date = new Date(userData.joinDate);
            joinDateEl.textContent = date.toLocaleDateString('zh-CN');
        } else {
            joinDateEl.textContent = '--';
        }
        
        pointsEl.textContent = userData.points || 0;
        
        // 显示弹窗
        this.viewUserModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    hideViewUserModal() {
        if (this.viewUserModal) {
            this.viewUserModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // ==================== 用户信息触发器更新 ====================
    
    updateUserInfoTrigger() {
        if (!this.userInfoTrigger) return;
        
        const avatarEl = this.userInfoTrigger.querySelector('.user-avatar');
        const usernameEl = this.userInfoTrigger.querySelector('.username');
        const pointsEl = this.userInfoTrigger.querySelector('#user-points');
        
        if (this.isLoggedIn && this.currentUser) {
            // 更新头像
            avatarEl.innerHTML = '';
            const avatar = this.avatarOptions.find(a => a.id === this.currentUser.avatar) || this.avatarOptions[0];
            avatarEl.style.backgroundColor = avatar.color;
            avatarEl.innerHTML = `<i class="fas ${avatar.icon}"></i>`;
            
            // 更新用户名和积分
            usernameEl.textContent = this.currentUser.nickname || this.currentUser.username;
            pointsEl.textContent = this.currentUser.points || 0;
        } else {
            // 游客状态
            avatarEl.innerHTML = '<i class="fas fa-user"></i>';
            avatarEl.style.backgroundColor = 'var(--color-primary)';
            usernameEl.textContent = '未登录';
            pointsEl.textContent = '0';
        }
    }
    
    updateSidebar() {
        if (!this.sidebar) return;
        
        if (this.isLoggedIn && this.currentUser) {
            // 更新用户信息
            document.getElementById('sidebarUsername').textContent = this.currentUser.username;
            document.getElementById('sidebarNickname').textContent = this.currentUser.nickname;
            document.getElementById('infoSignature').textContent = this.currentUser.signature;
            
            // 更新头像
            const sidebarAvatar = document.getElementById('sidebarAvatar');
            sidebarAvatar.innerHTML = '';
            const avatar = this.avatarOptions.find(a => a.id === this.currentUser.avatar) || this.avatarOptions[0];
            sidebarAvatar.style.backgroundColor = avatar.color;
            sidebarAvatar.innerHTML = `<i class="fas ${avatar.icon}"></i>`;
            
            // 更新积分
            this.updatePointsDisplay();
            
            // 更新日期信息
            if (this.currentUser.joinDate) {
                const joinDate = new Date(this.currentUser.joinDate);
                document.getElementById('infoJoinDate').textContent = joinDate.toLocaleDateString('zh-CN');
            }
            
            document.getElementById('infoLastLogin').textContent = new Date().toLocaleDateString('zh-CN');
            
        } else {
            // 游客状态
            document.getElementById('sidebarUsername').textContent = '未登录';
            document.getElementById('sidebarNickname').textContent = '游客';
            document.getElementById('infoSignature').textContent = '请先登录';
            document.getElementById('infoJoinDate').textContent = '--';
            document.getElementById('infoLastLogin').textContent = '--';
            
            const sidebarAvatar = document.getElementById('sidebarAvatar');
            sidebarAvatar.innerHTML = '<i class="fas fa-user"></i>';
            sidebarAvatar.style.backgroundColor = 'var(--color-primary)';
            
            // 重置积分显示
            document.getElementById('pointsTotal').textContent = '0';
            document.getElementById('pointsToday').textContent = '0';
            document.getElementById('pointsTotalEarned').textContent = '0';
            document.getElementById('pointsRank').textContent = '--';
        }
    }
    
    updatePointsDisplay() {
        if (!this.isLoggedIn || !this.currentUser) return;
        
        // 更新积分总数
        document.getElementById('pointsTotal').textContent = this.currentUser.points || 0;
        
        // 获取今日积分
        const today = new Date().toDateString();
        const gameRecords = this.getGameRecords();
        const todayPoints = gameRecords
            .filter(record => new Date(record.timestamp).toDateString() === today)
            .reduce((sum, record) => sum + (record.pointsEarned || 0), 0);
        
        document.getElementById('pointsToday').textContent = todayPoints;
        
        // 累计积分
        const totalEarned = gameRecords.reduce((sum, record) => sum + (record.pointsEarned || 0), 0);
        document.getElementById('pointsTotalEarned').textContent = totalEarned;
        
        // 排名
        const rank = this.calculateUserRank();
        document.getElementById('pointsRank').textContent = rank > 0 ? `#${rank}` : '--';
    }
    
    // ==================== 核心功能方法 ====================
    
    async checkLoginStatus() {
        try {
            const savedSession = this.getLoginSession();
            
            if (savedSession && savedSession.userId) {
                const users = this.getLocalUsers();
                const user = users.find(u => u.id === savedSession.userId);
                
                if (user) {
                    this.currentUser = {
                        id: user.id,
                        username: user.username,
                        nickname: user.nickname,
                        avatar: user.avatar,
                        signature: user.signature,
                        points: user.points || 0,
                        joinDate: user.joinDate
                    };
                    this.isLoggedIn = true;
                    
                    // 更新最后登录时间
                    user.lastLogin = new Date().toISOString();
                    this.saveLocalUsers(users);
                    
                    // 更新UI
                    this.updateUserInfoTrigger();
                    this.updateSidebar();
                    
                    console.log('已恢复登录状态:', this.currentUser.nickname);
                    return;
                }
            }
            
            // 未登录，延迟显示登录弹窗
            setTimeout(() => {
                if (!this.isLoggedIn && this.loginModal && !this.loginModal.classList.contains('active')) {
                    this.showLoginModal();
                }
            }, 1000);
            
        } catch (error) {
            console.error('检查登录状态失败:', error);
        }
    }
    
    async addPoints(points, reason, game) {
        if (!this.isLoggedIn || !this.currentUser) {
            console.warn('用户未登录，无法添加积分');
            return false;
        }
        
        try {
            const users = this.getLocalUsers();
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            
            if (userIndex >= 0) {
                users[userIndex].points = (users[userIndex].points || 0) + points;
                this.saveLocalUsers(users);
                
                this.currentUser.points = users[userIndex].points;
                
                // 保存游戏记录
                this.saveGameRecord({
                    userId: this.currentUser.id,
                    game: game || 'system',
                    pointsEarned: points,
                    reason: reason,
                    timestamp: new Date().toISOString()
                });
                
                // 更新UI
                this.updateUserInfoTrigger();
                this.updatePointsDisplay();
                
                // 触发积分更新事件
                this.context.emit('points:updated', {
                    userId: this.currentUser.id,
                    points: this.currentUser.points,
                    delta: points,
                    reason: reason
                });
                
                this.showPointsNotification(points, reason);
                return true;
            }
        } catch (error) {
            console.error('添加积分失败:', error);
        }
        
        return false;
    }
    
    // ==================== UI控制方法 ====================
    
    showLoginModal() {
        if (this.loginModal) {
            this.loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
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
            
            const loginForm = document.getElementById('loginForm');
            if (loginForm) loginForm.reset();
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
            const firstAvatar = this.registerForm.querySelector('.avatar-option');
            if (firstAvatar) {
                this.registerForm.querySelectorAll('.avatar-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                firstAvatar.classList.add('selected');
            }
            
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
            document.body.style.overflow = 'hidden';
            
            this.updateSidebar();
        }
    }
    
    hideSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.remove('active');
            this.sidebarVisible = false;
            document.body.style.overflow = '';
        }
    }
    
    toggleSidebar() {
        if (this.sidebarVisible) {
            this.hideSidebar();
        } else {
            this.showSidebar();
        }
    }
    
    // ==================== 事件处理 ====================
    
    onAppReady() {
        console.log('用户系统模块：应用已准备就绪');
    }
    
    onUserLogin(user) {
        this.currentUser = user;
        this.isLoggedIn = true;
        
        this.updateUserInfoTrigger();
        this.updateSidebar();
        
        console.log('用户系统模块：用户登录', user);
    }
    
    onUserLogout() {
        this.handleLogout();
    }
    
    onPointsUpdated(data) {
        if (this.isLoggedIn && this.currentUser && data.userId === this.currentUser.id) {
            this.currentUser.points = data.points;
            this.updateUserInfoTrigger();
            this.updatePointsDisplay();
        }
    }
    
    async handleLogout() {
        if (!confirm('确定要退出登录吗？')) {
            return;
        }
        
        try {
            this.clearLoginSession();
            this.currentUser = null;
            this.isLoggedIn = false;
            
            this.updateUserInfoTrigger();
            this.updateSidebar();
            this.hideSidebar();
            
            this.context.emit('user:logout');
            this.showToast('已退出登录', 'info');
            
            setTimeout(() => {
                this.showLoginModal();
            }, 500);
            
        } catch (error) {
            console.error('退出登录失败:', error);
        }
    }
    
    showEditProfile() {
        const currentSignature = this.currentUser?.signature || '';
        const newSignature = prompt('请输入新的个性签名（最多50字）：', currentSignature);
        
        if (newSignature !== null) {
            if (newSignature.length > 50) {
                this.showToast('个性签名不能超过50字', 'error');
                return;
            }
            
            const users = this.getLocalUsers();
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            
            if (userIndex >= 0) {
                users[userIndex].signature = newSignature;
                this.saveLocalUsers(users);
                
                this.currentUser.signature = newSignature;
                this.updateSidebar();
                
                this.showToast('个性签名已更新', 'success');
            }
        }
    }
    
    showAvatarSelector() {
        let selectedAvatar = this.currentUser?.avatar || 'default';
        
        const selector = document.createElement('div');
        selector.className = 'user-avatar-selector';
        selector.innerHTML = `
            <div class="selector-header">
                <h3>选择头像</h3>
                <button class="selector-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="selector-body">
                <div class="avatar-grid">
                    ${this.avatarOptions.map(avatar => `
                        <div class="avatar-option ${avatar.id === selectedAvatar ? 'selected' : ''}" 
                             data-avatar="${avatar.id}" title="${avatar.name}">
                            <div class="avatar-icon" style="background-color: ${avatar.color}">
                                <i class="fas ${avatar.icon}"></i>
                            </div>
                            <div class="avatar-name">${avatar.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="selector-footer">
                <button class="btn btn-secondary cancel-btn">取消</button>
                <button class="btn btn-primary confirm-btn">确定</button>
            </div>
        `;
        
        document.body.appendChild(selector);
        
        // 显示动画
        setTimeout(() => selector.classList.add('active'), 10);
        
        // 绑定事件
        const closeBtn = selector.querySelector('.selector-close');
        const cancelBtn = selector.querySelector('.cancel-btn');
        const confirmBtn = selector.querySelector('.confirm-btn');
        const avatarOptions = selector.querySelectorAll('.avatar-option');
        
        const closeSelector = () => {
            selector.classList.remove('active');
            setTimeout(() => {
                if (selector.parentNode) {
                    selector.parentNode.removeChild(selector);
                }
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeSelector);
        cancelBtn.addEventListener('click', closeSelector);
        
        avatarOptions.forEach(option => {
            option.addEventListener('click', () => {
                avatarOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedAvatar = option.dataset.avatar;
            });
        });
        
        confirmBtn.addEventListener('click', () => {
            if (selectedAvatar) {
                const users = this.getLocalUsers();
                const userIndex = users.findIndex(u => u.id === this.currentUser.id);
                
                if (userIndex >= 0) {
                    users[userIndex].avatar = selectedAvatar;
                    this.saveLocalUsers(users);
                    
                    this.currentUser.avatar = selectedAvatar;
                    this.updateUserInfoTrigger();
                    this.updateSidebar();
                    
                    this.showToast('头像已更新', 'success');
                }
            }
            closeSelector();
        });
    }
    
    // ==================== 辅助方法 ====================
    
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
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
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
    
    showPointsNotification(points, reason) {
        const notification = document.createElement('div');
        notification.className = 'user-points-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-coins"></i>
                <div class="notification-text">
                    <div class="notification-points">+${points} 积分</div>
                    <div class="notification-reason">${reason}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    handleResize() {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.add('mobile');
        } else {
            this.sidebar.classList.remove('mobile');
        }
    }
    
    // ==================== 本地存储管理 ====================
    
    getLocalUsers() {
        try {
            const usersJson = localStorage.getItem('taoci_users');
            return usersJson ? JSON.parse(usersJson) : [];
        } catch (error) {
            console.error('读取用户数据失败:', error);
            return [];
        }
    }
    
    saveLocalUsers(users) {
        try {
            localStorage.setItem('taoci_users', JSON.stringify(users));
        } catch (error) {
            console.error('保存用户数据失败:', error);
        }
    }
    
    getLoginSession() {
        try {
            const sessionJson = localStorage.getItem('taoci_session');
            return sessionJson ? JSON.parse(sessionJson) : null;
        } catch (error) {
            console.error('读取登录会话失败:', error);
            return null;
        }
    }
    
    saveLoginSession(user) {
        try {
            const session = {
                userId: user.id,
                username: user.username,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('taoci_session', JSON.stringify(session));
        } catch (error) {
            console.error('保存登录会话失败:', error);
        }
    }
    
    clearLoginSession() {
        try {
            localStorage.removeItem('taoci_session');
        } catch (error) {
            console.error('清除登录会话失败:', error);
        }
    }
    
    getGameRecords() {
        try {
            const recordsJson = localStorage.getItem('taoci_game_records');
            return recordsJson ? JSON.parse(recordsJson) : [];
        } catch (error) {
            console.error('读取游戏记录失败:', error);
            return [];
        }
    }
    
    saveGameRecord(record) {
        try {
            const records = this.getGameRecords();
            records.push(record);
            localStorage.setItem('taoci_game_records', JSON.stringify(records));
        } catch (error) {
            console.error('保存游戏记录失败:', error);
        }
    }
    
    calculateUserRank() {
        if (!this.currentUser) return 0;
        
        const users = this.getLocalUsers();
        const sortedUsers = [...users].sort((a, b) => (b.points || 0) - (a.points || 0));
        const rankIndex = sortedUsers.findIndex(user => user.id === this.currentUser.id);
        return rankIndex >= 0 ? rankIndex + 1 : 0;
    }
    
    localUserLogin(username, password) {
        const users = this.getLocalUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            user.lastLogin = new Date().toISOString();
            this.saveLocalUsers(users);
            
            return {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                avatar: user.avatar,
                signature: user.signature,
                points: user.points || 0,
                joinDate: user.joinDate
            };
        }
        
        return null;
    }
    
    // ==================== 公共API ====================
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isUserLoggedIn() {
        return this.isLoggedIn;
    }
    
    getUserPoints() {
        return this.currentUser?.points || 0;
    }
    
    async awardPoints(points, reason, game) {
        return await this.addPoints(points, reason, game);
    }
    
    async registerUser(userData) {
        return await this.createNewUser(userData);
    }
    
    async logoutUser() {
        return await this.handleLogout();
    }
    
    viewUser(userId) {
        const users = this.getLocalUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
            this.showViewUserModal({
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                avatar: user.avatar,
                signature: user.signature,
                points: user.points || 0,
                joinDate: user.joinDate
            });
            return true;
        }
        
        return false;
    }
    
    // ==================== 销毁方法 ====================
    
    destroy() {
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeydown);
        
        [this.loginModal, this.registerForm, this.sidebar, this.viewUserModal].forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        console.log(`✅ ${this.name} 模块已销毁`);
    }
}