// WhisperChat - Client-side Application
// Real-time chat with Socket.io, whispers, and glassmorphic UI

(function() {
  'use strict';

  // ==================== State ====================
  let socket = null;
  let currentUsername = '';
  let onlineUsers = [];

  // ==================== DOM Elements ====================
  const elements = {
    // Screens
    loginScreen: document.getElementById('login-screen'),
    chatScreen: document.getElementById('chat-screen'),
    
    // Login
    loginForm: document.getElementById('login-form'),
    usernameInput: document.getElementById('username-input'),
    passwordInput: document.getElementById('password-input'),
    errorMessage: document.getElementById('error-message'),
    
    // Chat
    messagesContainer: document.getElementById('messages-container'),
    messageForm: document.getElementById('message-form'),
    messageInput: document.getElementById('message-input'),
    usersList: document.getElementById('users-list'),
    userCount: document.getElementById('user-count'),
    currentUserDisplay: document.getElementById('current-user'),
    logoutBtn: document.getElementById('logout-btn'),
    
    // Mobile
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    sidebar: document.querySelector('.sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    
    // Sounds
    sendSound: document.getElementById('send-sound'),
    receiveSound: document.getElementById('receive-sound')
  };

  // ==================== Utility Functions ====================
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }

  function playSound(soundElement) {
    if (soundElement) {
      soundElement.currentTime = 0;
      soundElement.volume = 0.3;
      soundElement.play().catch(() => {});
    }
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    });
  }

  // ==================== Error Handling ====================
  function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.add('visible');
    setTimeout(() => {
      elements.errorMessage.classList.remove('visible');
    }, 3000);
  }

  function hideError() {
    elements.errorMessage.classList.remove('visible');
  }

  // ==================== Screen Navigation ====================
  function showChatScreen() {
    elements.loginScreen.classList.add('hidden');
    elements.chatScreen.classList.remove('hidden');
    elements.currentUserDisplay.textContent = currentUsername;
    elements.messageInput.focus();
  }

  function showLoginScreen() {
    elements.chatScreen.classList.add('hidden');
    elements.loginScreen.classList.remove('hidden');
    elements.usernameInput.value = '';
    elements.passwordInput.value = '';
    elements.usernameInput.focus();
    clearMessages();
    clearUsersList();
  }

  // ==================== Mobile Sidebar ====================
  function openMobileSidebar() {
    elements.sidebar.classList.add('open');
    elements.sidebarOverlay.classList.remove('hidden');
  }

  function closeMobileSidebar() {
    elements.sidebar.classList.remove('open');
    elements.sidebarOverlay.classList.add('hidden');
  }

  // ==================== Users List ====================
  function updateUsersList(users) {
    onlineUsers = users;
    elements.userCount.textContent = users.length;
    elements.usersList.innerHTML = '';

    users.forEach(user => {
      const userItem = document.createElement('div');
      userItem.className = 'user-item' + (user === currentUsername ? ' current-user-item' : '');
      userItem.setAttribute('data-testid', `user-item-${user}`);
      userItem.innerHTML = `
        <span class="online-indicator"></span>
        <span class="user-name">${escapeHtml(user)}</span>
        ${user === currentUsername ? '<span class="you-badge">(you)</span>' : ''}
      `;
      
      if (user !== currentUsername) {
        userItem.addEventListener('click', () => {
          elements.messageInput.value = `/w ${user} `;
          elements.messageInput.focus();
          closeMobileSidebar();
        });
      }
      
      elements.usersList.appendChild(userItem);
    });
  }

  function clearUsersList() {
    elements.usersList.innerHTML = '';
    elements.userCount.textContent = '0';
    onlineUsers = [];
  }

  // ==================== Messages ====================
  function clearMessages() {
    elements.messagesContainer.innerHTML = `
      <div class="welcome-message">
        <div class="welcome-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </div>
        <h3>Welcome to WhisperChat</h3>
        <p>Start chatting with everyone or use <code>/w username message</code> to whisper privately</p>
      </div>
    `;
  }

  function removeWelcomeMessage() {
    const welcome = elements.messagesContainer.querySelector('.welcome-message');
    if (welcome) {
      welcome.remove();
    }
  }

  function addMessage(data) {
    removeWelcomeMessage();
    
    const messageDiv = document.createElement('div');
    const isOwn = data.username === currentUsername;
    const isWhisper = data.type === 'whisper';
    
    messageDiv.className = `message ${isOwn ? 'own' : ''} ${isWhisper ? 'whisper' : ''}`;
    messageDiv.setAttribute('data-testid', `message-${Date.now()}`);
    
    let whisperIndicator = '';
    if (isWhisper) {
      const direction = data.username === currentUsername ? 'To' : 'From';
      const target = data.username === currentUsername ? data.targetUsername : data.username;
      whisperIndicator = `
        <span class="whisper-indicator">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          ${direction} ${escapeHtml(target)}
        </span>
      `;
    }
    
    messageDiv.innerHTML = `
      <div class="message-bubble">
        <div class="message-header">
          ${whisperIndicator}
          <span class="message-username">${escapeHtml(data.username)}</span>
          <span class="message-time">${formatTime(new Date())}</span>
        </div>
        <div class="message-text">${escapeHtml(data.message)}</div>
      </div>
    `;
    
    elements.messagesContainer.appendChild(messageDiv);
    scrollToBottom();
    
    if (!isOwn) {
      playSound(elements.receiveSound);
    }
  }

  function addSystemMessage(message, type) {
    removeWelcomeMessage();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `system-message ${type}`;
    messageDiv.setAttribute('data-testid', `system-message-${Date.now()}`);
    
    const icon = type === 'join' 
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';
    
    messageDiv.innerHTML = `
      <span class="system-message-text">
        ${icon}
        ${escapeHtml(message)}
      </span>
    `;
    
    elements.messagesContainer.appendChild(messageDiv);
    scrollToBottom();
  }

  // ==================== Socket.io Connection ====================
  function connectSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    socket = io(wsUrl, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('login-success', (data) => {
      currentUsername = data.username;
      showChatScreen();
    });

    socket.on('login-error', (data) => {
      showError(data.message);
    });

    socket.on('user-list', (users) => {
      updateUsersList(users);
    });

    socket.on('user-joined', (data) => {
      addSystemMessage(`${data.username} joined the chat`, 'join');
    });

    socket.on('user-left', (data) => {
      addSystemMessage(`${data.username} left the chat`, 'leave');
    });

    socket.on('public-message', (data) => {
      addMessage({
        type: 'public',
        username: data.username,
        message: data.message
      });
    });

    socket.on('whisper', (data) => {
      addMessage({
        type: 'whisper',
        username: data.from,
        targetUsername: data.to,
        message: data.message
      });
    });

    socket.on('whisper-sent', (data) => {
      addMessage({
        type: 'whisper',
        username: currentUsername,
        targetUsername: data.to,
        message: data.message
      });
    });

    socket.on('whisper-error', (data) => {
      addSystemMessage(data.message, 'leave');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      showError('Connection failed. Please try again.');
    });
  }

  // ==================== Event Handlers ====================
  function handleLogin(e) {
    e.preventDefault();
    hideError();
    
    const username = elements.usernameInput.value.trim();
    const password = elements.passwordInput.value;
    
    if (!username) {
      showError('Please enter a username');
      elements.usernameInput.focus();
      return;
    }
    
    if (username.length < 2 || username.length > 20) {
      showError('Username must be 2-20 characters');
      elements.usernameInput.focus();
      return;
    }
    
    if (!password) {
      showError('Please enter the password');
      elements.passwordInput.focus();
      return;
    }
    
    socket.emit('login', { username, password });
  }

  function handleSendMessage(e) {
    e.preventDefault();
    
    const message = elements.messageInput.value.trim();
    if (!message) return;
    
    // Check for whisper command
    const whisperMatch = message.match(/^\/w\s+(\S+)\s+(.+)$/i);
    
    if (whisperMatch) {
      const targetUsername = whisperMatch[1];
      const whisperMessage = whisperMatch[2];
      
      if (targetUsername.toLowerCase() === currentUsername.toLowerCase()) {
        addSystemMessage("You can't whisper to yourself!", 'leave');
      } else {
        socket.emit('whisper', {
          to: targetUsername,
          message: whisperMessage
        });
        playSound(elements.sendSound);
      }
    } else {
      socket.emit('public-message', { message });
      playSound(elements.sendSound);
    }
    
    elements.messageInput.value = '';
    elements.messageInput.focus();
  }

  function handleLogout() {
    if (socket) {
      socket.emit('logout');
    }
    currentUsername = '';
    showLoginScreen();
  }

  // ==================== Initialize ====================
  function init() {
    // Connect to Socket.io
    connectSocket();
    
    // Login form
    elements.loginForm.addEventListener('submit', handleLogin);
    
    // Message form
    elements.messageForm.addEventListener('submit', handleSendMessage);
    
    // Logout button
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // Mobile menu
    elements.mobileMenuBtn.addEventListener('click', openMobileSidebar);
    elements.sidebarOverlay.addEventListener('click', closeMobileSidebar);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.sidebar.classList.contains('open')) {
        closeMobileSidebar();
      }
    });
    
    // Focus username input on load
    elements.usernameInput.focus();
    
    console.log('WhisperChat initialized');
  }

  // Start the app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
