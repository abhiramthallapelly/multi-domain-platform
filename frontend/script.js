// Global state management
const appState = {
  currentUser: null,
  isAuthenticated: false,
  currentDomain: 'medical', // Default domain
  experts: [],
  activeChats: [],
  notifications: [],
  userLocation: null,
  emergencyActive: false,
  map: null,
  trackingActive: false,
  trackingInterval: null,
  trackingStartTime: null,
  mapMarkers: [],
  trackingExperts: [],
  trackingInfoInterval: null
};

// Domain configurations
const domainConfig = {
  medical: {
    name: 'Medical',
    icon: 'fas fa-heartbeat',
    emergencyIcon: 'fas fa-exclamation-triangle',
    clientLabel: 'Patient',
    expertLabel: 'Doctor',
    expertTitle: 'Nearby Doctors',
    findExpertText: 'Find Doctor',
    recordsText: 'Health Records',
    reminderText: 'Medication Reminder',
    emergencyText: 'MEDICAL EMERGENCY',
    emergencySubtitle: 'Connect with nearest doctors instantly',
    features: ['Doctors', 'Emergency Care', 'Medication'],
    specialties: ['Cardiologist', 'General Physician', 'Pediatrician', 'Emergency Medicine', 'Surgeon', 'Dermatologist', 'Neurologist', 'Psychiatrist'],
    quickActions: {
      'find-expert': 'Find Doctor',
      'emergency-contacts': 'Emergency Contacts',
      'records': 'Health Records',
      'reminder': 'Medication Reminder'
    }
  },
  agriculture: {
    name: 'Agriculture',
    icon: 'fas fa-seedling',
    emergencyIcon: 'fas fa-exclamation-triangle',
    clientLabel: 'Farmer',
    expertLabel: 'Agricultural Expert',
    expertTitle: 'Nearby Agricultural Experts',
    findExpertText: 'Find Expert',
    recordsText: 'Crop Records',
    reminderText: 'Crop Reminders',
    emergencyText: 'AGRICULTURAL EMERGENCY',
    emergencySubtitle: 'Connect with nearest agricultural experts instantly',
    features: ['Farmers', 'Crop Care', 'Pest Control'],
    specialties: ['Crop Specialist', 'Soil Expert', 'Pest Control', 'Irrigation Expert', 'Organic Farming', 'Livestock Expert', 'Agricultural Technology', 'Plant Pathologist'],
    quickActions: {
      'find-expert': 'Find Expert',
      'emergency-contacts': 'Emergency Contacts',
      'records': 'Crop Records',
      'reminder': 'Crop Reminders'
    }
  },
  education: {
    name: 'Education',
    icon: 'fas fa-graduation-cap',
    emergencyIcon: 'fas fa-exclamation-triangle',
    clientLabel: 'Student',
    expertLabel: 'Educator',
    expertTitle: 'Nearby Educators',
    findExpertText: 'Find Educator',
    recordsText: 'Academic Records',
    reminderText: 'Study Reminders',
    emergencyText: 'EDUCATIONAL EMERGENCY',
    emergencySubtitle: 'Connect with nearest educators instantly',
    features: ['Teachers', 'Tutoring', 'Learning Support'],
    specialties: ['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Language Tutor', 'Special Education', 'Test Preparation'],
    quickActions: {
      'find-expert': 'Find Educator',
      'emergency-contacts': 'Emergency Contacts',
      'records': 'Academic Records',
      'reminder': 'Study Reminders'
    }
  }
};

// DOM Elements
const elements = {
  loadingScreen: document.getElementById('loadingScreen'),
  domainModal: document.getElementById('domainModal'),
  authModal: document.getElementById('authModal'),
  mainApp: document.getElementById('mainApp'),
  emergencyBtn: document.getElementById('emergencyBtn'),
  emergencyModal: document.getElementById('emergencyModal'),
  chatModal: document.getElementById('chatModal'),
  paymentModal: document.getElementById('paymentModal'),
  trackingModal: document.getElementById('trackingModal'),
  expertList: document.getElementById('expertList'),
  activityFeed: document.getElementById('activityFeed'),
  userLocation: document.getElementById('userLocation'),
  notificationCount: document.getElementById('notificationCount'),
  mapContainer: document.getElementById('mapContainer'),
  map: document.getElementById('map'),
  trackingMap: document.getElementById('trackingMap'),
  trackLocationBtn: document.getElementById('trackLocationBtn'),
  toggleTrackingBtn: document.getElementById('toggleTrackingBtn'),
  refreshMap: document.getElementById('refreshMap'),
  trackingStatus: document.getElementById('trackingStatus'),
  stopTracking: document.getElementById('stopTracking'),
  minimizeTracking: document.getElementById('minimizeTracking'),
  trackingExpertsCount: document.getElementById('trackingExpertsCount'),
  trackingDuration: document.getElementById('trackingDuration'),
  lastLocationUpdate: document.getElementById('lastLocationUpdate')
};

// Enhanced Authentication and User Management
let currentUser = null;
let userHistory = [];
let userSettings = {
  pushNotifications: true,
  emailNotifications: true,
  locationSharing: true,
  profileVisibility: false
};

// Password strength checker
function checkPasswordStrength(password) {
  let strength = 0;
  let feedback = [];
  
  if (password.length >= 8) strength++;
  else feedback.push("At least 8 characters");
  
  if (/[a-z]/.test(password)) strength++;
  else feedback.push("Include lowercase letter");
  
  if (/[A-Z]/.test(password)) strength++;
  else feedback.push("Include uppercase letter");
  
  if (/[0-9]/.test(password)) strength++;
  else feedback.push("Include number");
  
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  else feedback.push("Include special character");
  
  let strengthText = "";
  let strengthClass = "";
  
  if (strength <= 2) {
    strengthText = "Weak";
    strengthClass = "weak";
  } else if (strength <= 3) {
    strengthText = "Medium";
    strengthClass = "medium";
  } else {
    strengthText = "Strong";
    strengthClass = "strong";
  }
  
  return { strength, strengthText, strengthClass, feedback };
}

// Password visibility toggle
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const toggle = input.parentElement.querySelector('.password-toggle i');
  
  if (input.type === 'password') {
    input.type = 'text';
    toggle.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    toggle.className = 'fas fa-eye';
  }
}

// Password strength indicator
function updatePasswordStrength() {
  const password = document.getElementById('registerPassword').value;
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');
  
  if (password.length === 0) {
    strengthFill.className = 'strength-fill';
    strengthFill.style.width = '0%';
    strengthText.textContent = 'Password strength';
    return;
  }
  
  const result = checkPasswordStrength(password);
  strengthFill.className = `strength-fill ${result.strengthClass}`;
  strengthText.textContent = result.strengthText;
}

// Input validation
function validateInput(input, type) {
  const validation = input.parentElement.querySelector('.input-validation');
  let isValid = false;
  let message = '';
  
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(input.value);
      message = isValid ? 'Valid email' : 'Please enter a valid email address';
      break;
    case 'phone':
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      isValid = phoneRegex.test(input.value.replace(/\s/g, ''));
      message = isValid ? 'Valid phone number' : 'Please enter a valid phone number';
      break;
    case 'password':
      const result = checkPasswordStrength(input.value);
      isValid = result.strength >= 3;
      message = isValid ? 'Password is strong enough' : 'Password is too weak';
      break;
    case 'confirm':
      const password = document.getElementById('registerPassword').value;
      isValid = input.value === password;
      message = isValid ? 'Passwords match' : 'Passwords do not match';
      break;
  }
  
  validation.textContent = message;
  validation.className = `input-validation show ${isValid ? 'valid' : ''}`;
  return isValid;
}

// Enhanced authentication functions
function showAuthModal() {
  document.getElementById('authModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Update domain-specific labels
  updateAuthLabels();
}

function hideAuthModal() {
  document.getElementById('authModal').style.display = 'none';
  document.body.style.overflow = 'auto';
  clearAuthForms();
}

function showForgotPassword() {
  hideAuthModal();
  document.getElementById('forgotPasswordModal').style.display = 'flex';
}

function hideForgotPassword() {
  document.getElementById('forgotPasswordModal').style.display = 'none';
  showAuthModal();
}

function showTerms() {
  document.getElementById('termsModal').style.display = 'flex';
}

function hideTerms() {
  document.getElementById('termsModal').style.display = 'none';
}

function clearAuthForms() {
  document.getElementById('loginForm').reset();
  document.getElementById('registerForm').reset();
  document.getElementById('forgotPasswordForm').reset();
  
  // Clear validation messages
  document.querySelectorAll('.input-validation').forEach(el => {
    el.className = 'input-validation';
    el.textContent = '';
  });
  
  // Reset password strength
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');
  if (strengthFill && strengthText) {
    strengthFill.className = 'strength-fill';
    strengthFill.style.width = '0%';
    strengthText.textContent = 'Password strength';
  }
}

// Social login simulation
function socialLogin(provider) {
  const btn = event.target.closest('.social-btn');
  const originalText = btn.innerHTML;
  
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
  btn.disabled = true;
  
  setTimeout(() => {
    // Simulate successful social login
    const mockUser = {
      id: 'social_' + Date.now(),
      name: 'Social User',
      email: 'user@' + provider + '.com',
      type: 'client',
      avatar: `https://via.placeholder.com/80/667eea/FFFFFF?text=${provider.charAt(0).toUpperCase()}`,
      provider: provider
    };
    
    loginUser(mockUser);
    btn.innerHTML = originalText;
    btn.disabled = false;
  }, 2000);
}

// Enhanced login function
function loginUser(userData) {
  currentUser = {
    ...userData,
    emergencyCount: 0,
    chatCount: 0,
    rating: 0.0,
    joinDate: new Date().toISOString()
  };
  
  // Save to localStorage
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('userSettings', JSON.stringify(userSettings));
  
  // Update UI
  updateUserInterface();
  hideAuthModal();
  
  // Show welcome message
  showNotification(`Welcome back, ${currentUser.name}!`, 'success');
}

// Enhanced registration function
function registerUser(userData) {
  const newUser = {
    ...userData,
    id: 'user_' + Date.now(),
    emergencyCount: 0,
    chatCount: 0,
    rating: 0.0,
    joinDate: new Date().toISOString()
  };
  
  // Save to localStorage
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  localStorage.setItem('userSettings', JSON.stringify(userSettings));
  
  currentUser = newUser;
  
  // Update UI
  updateUserInterface();
  hideAuthModal();
  
  // Show welcome message
  showNotification(`Welcome to EmergencyCare, ${newUser.name}!`, 'success');
}

// Logout function
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  
  // Update UI
  updateUserInterface();
  hideProfileModal();
  
  // Show login modal
  showAuthModal();
  
  showNotification('You have been logged out successfully', 'info');
}

// Update user interface based on authentication state
function updateUserInterface() {
  const authBtn = document.querySelector('.auth-btn');
  const profileBtn = document.querySelector('[data-tab="profile"]');
  
  if (currentUser) {
    // User is logged in
    authBtn.style.display = 'none';
    profileBtn.style.display = 'flex';
    
    // Update profile information
    updateProfileInfo();
    
    // Update navigation badge
    updateChatBadge();
    
  } else {
    // User is not logged in
    authBtn.style.display = 'flex';
    profileBtn.style.display = 'none';
    
    // Clear profile information
    clearProfileInfo();
  }
}

// Update profile information
function updateProfileInfo() {
  if (!currentUser) return;
  
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userEmail').textContent = currentUser.email;
  document.getElementById('userTypeBadge').textContent = currentUser.type === 'expert' ? 'Expert' : 'Client';
  document.getElementById('emergencyCount').textContent = currentUser.emergencyCount || 0;
  document.getElementById('chatCount').textContent = currentUser.chatCount || 0;
  document.getElementById('ratingValue').textContent = (currentUser.rating || 0).toFixed(1);
  
  if (currentUser.avatar) {
    document.getElementById('userAvatar').src = currentUser.avatar;
  }
}

// Clear profile information
function clearProfileInfo() {
  document.getElementById('userName').textContent = 'User Name';
  document.getElementById('userEmail').textContent = 'user@example.com';
  document.getElementById('userTypeBadge').textContent = 'Client';
  document.getElementById('emergencyCount').textContent = '0';
  document.getElementById('chatCount').textContent = '0';
  document.getElementById('ratingValue').textContent = '0.0';
  document.getElementById('userAvatar').src = 'https://via.placeholder.com/80/667eea/FFFFFF?text=U';
}

// Update chat badge
function updateChatBadge() {
  const chatBadge = document.getElementById('chatBadge');
  const unreadCount = getUnreadChatCount();
  
  if (unreadCount > 0) {
    chatBadge.textContent = unreadCount;
    chatBadge.style.display = 'block';
  } else {
    chatBadge.style.display = 'none';
  }
}

// Get unread chat count
function getUnreadChatCount() {
  // This would typically come from a backend
  return Math.floor(Math.random() * 5); // Simulate unread messages
}

// Profile modal functions
function showProfileModal() {
  if (!currentUser) {
    showAuthModal();
    return;
  }
  
  document.getElementById('profileModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function hideProfileModal() {
  document.getElementById('profileModal').style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Settings modal functions
function showSettings() {
  hideProfileModal();
  document.getElementById('settingsModal').style.display = 'flex';
  loadUserSettings();
}

function hideSettingsModal() {
  document.getElementById('settingsModal').style.display = 'none';
  showProfileModal();
}

function loadUserSettings() {
  const settings = JSON.parse(localStorage.getItem('userSettings')) || userSettings;
  
  document.getElementById('pushNotifications').checked = settings.pushNotifications;
  document.getElementById('emailNotifications').checked = settings.emailNotifications;
  document.getElementById('locationSharing').checked = settings.locationSharing;
  document.getElementById('profileVisibility').checked = settings.profileVisibility;
}

function saveUserSettings() {
  userSettings = {
    pushNotifications: document.getElementById('pushNotifications').checked,
    emailNotifications: document.getElementById('emailNotifications').checked,
    locationSharing: document.getElementById('locationSharing').checked,
    profileVisibility: document.getElementById('profileVisibility').checked
  };
  
  localStorage.setItem('userSettings', JSON.stringify(userSettings));
  showNotification('Settings saved successfully', 'success');
}

// History modal functions
function showHistory() {
  hideProfileModal();
  document.getElementById('historyModal').style.display = 'flex';
  loadUserHistory();
}

function hideHistoryModal() {
  document.getElementById('historyModal').style.display = 'none';
  showProfileModal();
}

function loadUserHistory() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';
  
  if (userHistory.length === 0) {
    historyList.innerHTML = '<p class="no-data">No activity history yet</p>';
    return;
  }
  
  userHistory.forEach(item => {
    const historyItem = createHistoryItem(item);
    historyList.appendChild(historyItem);
  });
}

function createHistoryItem(item) {
  const div = document.createElement('div');
  div.className = 'history-item';
  
  const icon = getHistoryIcon(item.type);
  const color = getHistoryColor(item.type);
  
  div.innerHTML = `
    <div class="history-icon" style="background: ${color}">
      <i class="${icon}"></i>
    </div>
    <div class="history-content">
      <h5>${item.title}</h5>
      <p>${item.description}</p>
      <small>${formatDate(item.timestamp)}</small>
    </div>
  `;
  
  return div;
}

function getHistoryIcon(type) {
  const icons = {
    emergency: 'fas fa-phone',
    chat: 'fas fa-comments',
    payment: 'fas fa-credit-card',
    profile: 'fas fa-user-edit'
  };
  return icons[type] || 'fas fa-info-circle';
}

function getHistoryColor(type) {
  const colors = {
    emergency: '#ff6b6b',
    chat: '#667eea',
    payment: '#51cf66',
    profile: '#ffd43b'
  };
  return colors[type] || '#6c757d';
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

// Help modal functions
function showHelp() {
  hideProfileModal();
  document.getElementById('helpModal').style.display = 'flex';
}

function hideHelpModal() {
  document.getElementById('helpModal').style.display = 'none';
  showProfileModal();
}

// Contact support function
function contactSupport(method) {
  const methods = {
    email: 'support@emergencycare.com',
    chat: 'Live chat service',
    phone: '+1-800-EMERGENCY'
  };
  
  showNotification(`Contacting ${methods[method]}...`, 'info');
  
  // Simulate contact
  setTimeout(() => {
    showNotification('Support team will contact you soon', 'success');
  }, 2000);
}

// Change password function
function changePassword() {
  const newPassword = prompt('Enter new password:');
  if (newPassword) {
    const result = checkPasswordStrength(newPassword);
    if (result.strength >= 3) {
      showNotification('Password changed successfully', 'success');
    } else {
      showNotification('Password is too weak', 'error');
    }
  }
}

// Delete account function
function deleteAccount() {
  const confirm = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
  if (confirm) {
    logout();
    showNotification('Account deleted successfully', 'info');
  }
}

// Edit profile function
function editProfile() {
  const newName = prompt('Enter new name:', currentUser.name);
  if (newName && newName.trim()) {
    currentUser.name = newName.trim();
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateProfileInfo();
    showNotification('Profile updated successfully', 'success');
  }
}

// Edit avatar function
function editAvatar() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        currentUser.avatar = e.target.result;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateProfileInfo();
        showNotification('Avatar updated successfully', 'success');
      };
      reader.readAsDataURL(file);
    }
  };
  
  input.click();
}

// Add to history
function addToHistory(type, title, description) {
  const historyItem = {
    type,
    title,
    description,
    timestamp: new Date().toISOString()
  };
  
  userHistory.unshift(historyItem);
  
  // Keep only last 50 items
  if (userHistory.length > 50) {
    userHistory = userHistory.slice(0, 50);
  }
  
  localStorage.setItem('userHistory', JSON.stringify(userHistory));
}

// Enhanced notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas ${getNotificationIcon(type)}"></i>
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

function getNotificationIcon(type) {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  return icons[type] || 'fa-info-circle';
}

// Add enhanced CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
  }
  
  .notification-success {
    border-left: 4px solid #28a745;
  }
  
  .notification-error {
    border-left: 4px solid #dc3545;
  }
  
  .notification-warning {
    border-left: 4px solid #ffc107;
  }
  
  .notification-info {
    border-left: 4px solid #17a2b8;
  }
  
  .notification i {
    font-size: 1.2rem;
  }
  
  .notification-success i {
    color: #28a745;
  }
  
  .notification-error i {
    color: #dc3545;
  }
  
  .notification-warning i {
    color: #ffc107;
  }
  
  .notification-info i {
    color: #17a2b8;
  }
  
  .notification button {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  
  .notification button:hover {
    background: #f8f9fa;
    color: #333;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .history-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 12px;
    transition: all 0.3s ease;
  }
  
  .history-item:hover {
    background: #e9ecef;
  }
  
  .history-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }
  
  .history-content h5 {
    margin: 0 0 0.25rem 0;
    color: #333;
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  .history-content p {
    margin: 0 0 0.25rem 0;
    color: #666;
    font-size: 0.8rem;
  }
  
  .history-content small {
    color: #999;
    font-size: 0.7rem;
  }
  
  .no-data {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 2rem;
  }
`;
document.head.appendChild(notificationStyles);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('EmergencyCare Platform Initializing...');
  
  // Load user data on page load
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
  }
  
  const savedSettings = localStorage.getItem('userSettings');
  if (savedSettings) {
    userSettings = JSON.parse(savedSettings);
  }
  
  const savedHistory = localStorage.getItem('userHistory');
  if (savedHistory) {
    userHistory = JSON.parse(savedHistory);
  }
  
  // Initialize the main app
  initializeApp();
  
  // Setup enhanced authentication features
  setupFormEventListeners();
  setupSettingsListeners();
  setupHistoryFilters();
  
  // Update UI based on authentication state
  updateUserInterface();
});

// App initialization
function initializeApp() {
  console.log('Initializing app...');
  
  // Setup event listeners first
  setupEventListeners();
  
  // Get user location
  getUserLocation();
  
  // Simulate loading
  setTimeout(() => {
    elements.loadingScreen.style.opacity = '0';
    setTimeout(() => {
      elements.loadingScreen.style.display = 'none';
      
      // Force show domain selection
      console.log('Attempting to show domain selection...');
      const domainModal = document.getElementById('domainModal');
      if (domainModal) {
        console.log('Domain modal found, showing...');
        domainModal.classList.add('active');
      } else {
        console.error('Domain modal not found in DOM');
        // Show auth modal as fallback
        showAuthModal();
      }
    }, 500);
  }, 2000);
}

// Setup all event listeners
function setupEventListeners() {
  // Domain selection
  setupDomainListeners();
  
  // Authentication
  setupAuthListeners();
  
  // Emergency functionality
  setupEmergencyListeners();
  
  // Navigation
  setupNavigationListeners();
  
  // Chat functionality
  setupChatListeners();
  
  // Payment functionality
  setupPaymentListeners();
  
  // Quick actions
  setupQuickActionListeners();
  
  // Map functionality
  setupMapListeners();
}

// Domain selection event listeners
function setupDomainListeners() {
  const domainCards = document.querySelectorAll('.domain-card');
  const selectDomainBtn = document.getElementById('selectDomainBtn');
  
  console.log('Setting up domain listeners...');
  console.log('Found domain cards:', domainCards.length);
  
  if (domainCards.length === 0) {
    console.error('No domain cards found!');
    return;
  }
  
  domainCards.forEach(card => {
    card.addEventListener('click', () => {
      console.log('Domain card clicked:', card.dataset.domain);
      // Remove active class from all cards
      domainCards.forEach(c => c.classList.remove('active'));
      // Add active class to clicked card
      card.classList.add('active');
      
      const domain = card.dataset.domain;
      appState.currentDomain = domain;
      selectDomainBtn.disabled = false;
    });
  });
  
  if (selectDomainBtn) {
    selectDomainBtn.addEventListener('click', () => {
      console.log('Select domain button clicked');
      hideDomainModal();
      checkAuthentication();
    });
  }
  
  // Change domain button
  const changeDomainBtn = document.getElementById('changeDomainBtn');
  if (changeDomainBtn) {
    changeDomainBtn.addEventListener('click', () => {
      showDomainSelection();
    });
  }
}

// Authentication event listeners
function setupAuthListeners() {
  // Tab switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });

  // Login form
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', handleLogin);

  // Register form
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', handleRegister);
}

// Emergency event listeners
function setupEmergencyListeners() {
  elements.emergencyBtn.addEventListener('click', () => {
    if (!appState.isAuthenticated) {
      showAuthModal();
      return;
    }
    showEmergencyModal();
  });

  const sendEmergencyBtn = document.getElementById('sendEmergency');
  if (sendEmergencyBtn) {
    sendEmergencyBtn.addEventListener('click', handleEmergencyAlert);
  }
  
  // Domain selection button
  const showDomainBtn = document.getElementById('showDomainSelectionBtn');
  if (showDomainBtn) {
    showDomainBtn.addEventListener('click', () => {
      const domainModal = document.getElementById('domainModal');
      if (domainModal) {
        domainModal.classList.add('active');
      }
    });
  }
}

// Navigation event listeners
function setupNavigationListeners() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchNavigationTab(tab);
    });
  });

  // Profile and notifications
  document.getElementById('profileBtn').addEventListener('click', showProfile);
  document.getElementById('notificationsBtn').addEventListener('click', showNotifications);
  document.getElementById('refreshExperts').addEventListener('click', loadExperts);
}

// Chat event listeners
function setupChatListeners() {
  const closeChatBtn = document.getElementById('closeChat');
  if (closeChatBtn) {
    closeChatBtn.addEventListener('click', closeChatModal);
  }

  const sendMessageBtn = document.getElementById('sendMessage');
  const messageInput = document.getElementById('messageInput');
  
  if (sendMessageBtn) {
    sendMessageBtn.addEventListener('click', sendMessage);
  }
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
}

// Payment event listeners
function setupPaymentListeners() {
  const processPaymentBtn = document.getElementById('processPayment');
  if (processPaymentBtn) {
    processPaymentBtn.addEventListener('click', processPayment);
  }
}

// Quick action event listeners
function setupQuickActionListeners() {
  const actionCards = document.querySelectorAll('.action-card');
  actionCards.forEach(card => {
    card.addEventListener('click', () => {
      const action = card.dataset.action;
      handleQuickAction(action);
    });
  });
}

// Map event listeners
function setupMapListeners() {
  if (elements.trackLocationBtn) {
    elements.trackLocationBtn.addEventListener('click', centerMapOnUser);
  }
  if (elements.toggleTrackingBtn) {
    elements.toggleTrackingBtn.addEventListener('click', toggleLiveTracking);
  }
  if (elements.refreshMap) {
    elements.refreshMap.addEventListener('click', refreshMapData);
  }
  if (elements.stopTracking) {
    elements.stopTracking.addEventListener('click', stopLiveTracking);
  }
  if (elements.minimizeTracking) {
    elements.minimizeTracking.addEventListener('click', minimizeTrackingModal);
  }
}

// Domain functions
function showDomainSelection() {
  console.log('Showing domain selection...');
  if (elements.domainModal) {
    elements.domainModal.classList.add('active');
    console.log('Domain modal activated');
  } else {
    console.error('Domain modal element not found!');
    // Fallback: show auth modal directly
    showAuthModal();
  }
}

function hideDomainModal() {
  if (elements.domainModal) {
    elements.domainModal.classList.remove('active');
  }
}

function updateDomainUI() {
  const config = domainConfig[appState.currentDomain];
  
  // Update header
  document.getElementById('domainIcon').className = config.icon;
  document.getElementById('currentDomain').textContent = config.name;
  
  // Update emergency button
  document.getElementById('emergencyIcon').className = config.emergencyIcon;
  document.getElementById('emergencyText').textContent = config.emergencyText;
  document.getElementById('emergencySubtitle').textContent = config.emergencySubtitle;
  
  // Update quick actions
  document.getElementById('findExpertText').textContent = config.findExpertText;
  document.getElementById('recordsText').textContent = config.recordsText;
  document.getElementById('reminderText').textContent = config.reminderText;
  
  // Update experts section
  document.getElementById('expertsTitle').textContent = config.expertTitle;
  document.getElementById('expertsNavText').textContent = config.expertLabel + 's';
  
  // Update auth labels
  document.getElementById('clientLabel').textContent = config.clientLabel;
  document.getElementById('expertLabel').textContent = config.expertLabel;
  
  // Update icons based on domain
  updateDomainIcons();
}

function updateDomainIcons() {
  const config = domainConfig[appState.currentDomain];
  
  // Update quick action icons
  if (appState.currentDomain === 'agriculture') {
    document.getElementById('findExpertIcon').className = 'fas fa-tractor';
    document.getElementById('recordsIcon').className = 'fas fa-leaf';
    document.getElementById('reminderIcon').className = 'fas fa-calendar-alt';
    document.getElementById('expertsNavIcon').className = 'fas fa-tractor';
  } else if (appState.currentDomain === 'education') {
    document.getElementById('findExpertIcon').className = 'fas fa-chalkboard-teacher';
    document.getElementById('recordsIcon').className = 'fas fa-book';
    document.getElementById('reminderIcon').className = 'fas fa-clock';
    document.getElementById('expertsNavIcon').className = 'fas fa-chalkboard-teacher';
  } else {
    document.getElementById('findExpertIcon').className = 'fas fa-user-md';
    document.getElementById('recordsIcon').className = 'fas fa-file-medical';
    document.getElementById('reminderIcon').className = 'fas fa-pills';
    document.getElementById('expertsNavIcon').className = 'fas fa-user-md';
  }
}

// Authentication functions
function checkAuthentication() {
  const token = localStorage.getItem('emergencyCare_token');
  if (token) {
    // In a real app, validate token with backend
    appState.isAuthenticated = true;
    appState.currentUser = JSON.parse(localStorage.getItem('emergencyCare_user'));
    showMainApp();
  } else {
    showAuthModal();
  }
}

function showAuthModal() {
  elements.authModal.classList.add('active');
}

function hideAuthModal() {
  elements.authModal.classList.remove('active');
}

function switchTab(tabName) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => content.classList.remove('active'));
  
  // Remove active class from all tab buttons
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => btn.classList.remove('active'));
  
  // Show selected tab content
  document.getElementById(tabName + 'Tab').classList.add('active');
  
  // Add active class to selected tab button
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;
  
  simulateLogin(email, password);
}

function handleRegister(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const userData = {
    name: e.target.querySelector('input[type="text"]').value,
    email: e.target.querySelector('input[type="email"]').value,
    phone: e.target.querySelector('input[type="tel"]').value,
    password: e.target.querySelector('input[type="password"]').value,
    userType: e.target.querySelector('input[name="userType"]:checked').value,
    domain: appState.currentDomain
  };
  
  simulateRegister(userData);
}

function simulateLogin(email, password) {
  // Simulate API call
  setTimeout(() => {
    const user = {
      id: 1,
      name: 'John Doe',
      email: email,
      phone: '+1234567890',
      userType: 'client',
      domain: appState.currentDomain
    };
    
    // Store user data
    localStorage.setItem('emergencyCare_token', 'mock_token_123');
    localStorage.setItem('emergencyCare_user', JSON.stringify(user));
    
    appState.currentUser = user;
    appState.isAuthenticated = true;
    
    hideAuthModal();
    showMainApp();
    
    showSuccessMessage('Login successful!');
  }, 1000);
}

function simulateRegister(userData) {
  // Simulate API call
  setTimeout(() => {
    const user = {
      id: 2,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      userType: userData.userType,
      domain: appState.currentDomain
    };
    
    // Store user data
    localStorage.setItem('emergencyCare_token', 'mock_token_456');
    localStorage.setItem('emergencyCare_user', JSON.stringify(user));
    
    appState.currentUser = user;
    appState.isAuthenticated = true;
    
    hideAuthModal();
    showMainApp();
    
    showSuccessMessage('Registration successful!');
  }, 1000);
}

function showMainApp() {
  elements.mainApp.classList.remove('hidden');
  updateDomainUI();
  loadExperts();
  loadActivityFeed();
  initializeMap();
}

function switchNavigationTab(tabName) {
  // Remove active class from all nav buttons
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));
  
  // Add active class to selected nav button
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Handle tab-specific actions
  switch(tabName) {
    case 'home':
      // Already on home
      break;
    case 'experts':
      loadExperts();
      break;
    case 'chat':
      // Show chat interface
      break;
    case 'profile':
      showProfile();
      break;
  }
}

function updateLocationDisplay() {
  if (appState.userLocation) {
    elements.userLocation.textContent = `${appState.userLocation.city}, ${appState.userLocation.state}`;
  }
}

// Expert/Doctor functions
function loadExperts() {
  const config = domainConfig[appState.currentDomain];
  
  // Simulate loading experts based on domain
  setTimeout(() => {
    appState.experts = generateMockExperts(config);
    renderExperts();
  }, 500);
}

function generateMockExperts(config) {
  const experts = [];
  const specialties = config.specialties;
  
  for (let i = 1; i <= 8; i++) {
    const specialty = specialties[Math.floor(Math.random() * specialties.length)];
    const expert = {
      id: i,
      name: `${config.expertLabel} ${i}`,
      specialty: specialty,
      location: `Location ${i}`,
      locationCoords: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.0060 + (Math.random() - 0.5) * 0.1
      },
      available: Math.random() > 0.3,
      rating: (4 + Math.random()).toFixed(1),
      experience: Math.floor(Math.random() * 20) + 1,
      consultationFee: Math.floor(Math.random() * 100) + 20,
      responseTime: Math.floor(Math.random() * 10) + 1,
      avatar: `https://via.placeholder.com/60/4CAF50/FFFFFF?text=${config.expertLabel.charAt(0)}${i}`,
      domain: appState.currentDomain
    };
    experts.push(expert);
  }
  
  return experts;
}

function renderExperts() {
  const expertList = document.getElementById('expertList');
  expertList.innerHTML = '';
  
  appState.experts.forEach(expert => {
    const expertCard = createExpertCard(expert);
    expertList.appendChild(expertCard);
  });
}

function createExpertCard(expert) {
  const config = domainConfig[appState.currentDomain];
  const card = document.createElement('div');
  card.className = 'expert-card';
  card.innerHTML = `
    <div class="expert-avatar">
      <img src="${expert.avatar}" alt="${expert.name}">
      <div class="availability-status ${expert.available ? 'available' : 'unavailable'}">
        <i class="fas fa-circle"></i>
      </div>
    </div>
    <div class="expert-info">
      <h4>${expert.name}</h4>
      <p class="specialty">${expert.specialty}</p>
      <div class="expert-stats">
        <span class="rating">
          <i class="fas fa-star"></i>
          ${expert.rating}
        </span>
        <span class="experience">
          <i class="fas fa-clock"></i>
          ${expert.experience} years
        </span>
        <span class="response-time">
          <i class="fas fa-bolt"></i>
          ${expert.responseTime} min
        </span>
      </div>
      <div class="expert-actions">
        <button class="btn-secondary" onclick="startChat(${expert.id})">
          <i class="fas fa-comments"></i>
          Chat
        </button>
        <button class="btn-primary" onclick="requestExpert(${expert.id})">
          <i class="fas fa-phone"></i>
          Request
        </button>
      </div>
    </div>
  `;
  return card;
}

// Emergency functions
function showEmergencyModal() {
  elements.emergencyModal.classList.add('active');
}

function hideEmergencyModal() {
  elements.emergencyModal.classList.remove('active');
}

function handleEmergencyAlert() {
  const description = document.getElementById('emergencyDescription').value;
  const urgencyLevel = document.querySelector('input[name="urgency"]:checked').value;
  const shareLocation = document.getElementById('shareLocation').checked;

  if (!description.trim()) {
    alert('Please describe your emergency');
    return;
  }

  // Show loading state
  const sendBtn = document.getElementById('sendEmergency');
  const originalText = sendBtn.innerHTML;
  sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  sendBtn.disabled = true;

  setTimeout(() => {
    // Simulate emergency alert
    appState.emergencyActive = true;
    
    // Start live tracking if location sharing is enabled
    if (shareLocation) {
      startLiveTracking();
    }
    
    // Find nearest available expert
    const nearestExpert = appState.experts.find(e => e.available) || appState.experts[0];
    
    // Create emergency activity
    const emergencyActivity = {
      id: Date.now(),
      type: 'emergency',
      title: 'Emergency Alert Sent',
      description: `Connected to ${nearestExpert.name} for ${urgencyLevel} emergency`,
      time: new Date().toLocaleTimeString(),
      expert: nearestExpert
    };

    addActivity(emergencyActivity);
    
    // Show success message
    hideEmergencyModal();
    showSuccessMessage('Emergency alert sent! Expert will contact you shortly.');
    
    // Reset button
    sendBtn.innerHTML = originalText;
    sendBtn.disabled = false;
    
    // Auto-start chat with expert
    setTimeout(() => {
      startChat(nearestExpert.id);
    }, 2000);
  }, 2000);
}

// Chat functions
function startChat(expertId) {
  const expert = appState.experts.find(e => e.id === expertId);
  if (!expert) return;

  // Update chat modal with expert info
  document.getElementById('chatExpertName').textContent = expert.name;
  document.getElementById('chatExpertSpecialty').textContent = expert.specialty;
  document.getElementById('chatExpertAvatar').src = expert.avatar;
  
  // Load chat messages
  loadChatMessages(expertId);
  
  // Show chat modal
  elements.chatModal.classList.add('active');
}

function closeChatModal() {
  elements.chatModal.classList.remove('active');
}

function hidePaymentModal() {
  elements.paymentModal.classList.remove('active');
}

function loadChatMessages(expertId) {
  const chatMessages = document.getElementById('chatMessages');
  const config = domainConfig[appState.currentDomain];
  
  // Generate domain-specific messages
  let mockMessages = [];
  
  if (appState.currentDomain === 'medical') {
    mockMessages = [
      {
        id: 1,
        text: 'Hello! I received your emergency alert. How can I help you?',
        sender: 'expert',
        time: '2:30 PM'
      },
      {
        id: 2,
        text: 'I have a high fever and severe headache',
        sender: 'user',
        time: '2:31 PM'
      },
      {
        id: 3,
        text: 'I understand. Can you tell me your temperature and when the symptoms started?',
        sender: 'expert',
        time: '2:32 PM'
      }
    ];
  } else if (appState.currentDomain === 'agriculture') {
    mockMessages = [
      {
        id: 1,
        text: 'Hello! I received your agricultural emergency alert. What crop issue are you facing?',
        sender: 'expert',
        time: '2:30 PM'
      },
      {
        id: 2,
        text: 'My crops are showing signs of disease and wilting',
        sender: 'user',
        time: '2:31 PM'
      },
      {
        id: 3,
        text: 'I understand. Can you describe the symptoms and share photos if possible?',
        sender: 'expert',
        time: '2:32 PM'
      }
    ];
  } else if (appState.currentDomain === 'education') {
    mockMessages = [
      {
        id: 1,
        text: 'Hello! I received your educational emergency alert. How can I help with your learning needs?',
        sender: 'expert',
        time: '2:30 PM'
      },
      {
        id: 2,
        text: 'I have an important exam tomorrow and need urgent help with a topic',
        sender: 'user',
        time: '2:31 PM'
      },
      {
        id: 3,
        text: 'I understand. Which subject and topic do you need help with?',
        sender: 'expert',
        time: '2:32 PM'
      }
    ];
  }

  chatMessages.innerHTML = '';
  mockMessages.forEach(message => {
    const messageElement = createMessageElement(message);
    chatMessages.appendChild(messageElement);
  });
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createMessageElement(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${message.sender}`;
  messageDiv.innerHTML = `
    <div class="message-content">${message.text}</div>
    <div class="message-time">${message.time}</div>
  `;
  return messageDiv;
}

function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  
  if (!message) return;

  const chatMessages = document.getElementById('chatMessages');
  const newMessage = {
    id: Date.now(),
    text: message,
    sender: 'user',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const messageElement = createMessageElement(newMessage);
  chatMessages.appendChild(messageElement);
  
  // Clear input
  messageInput.value = '';
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Simulate expert response based on domain
  setTimeout(() => {
    let responseText = '';
    
    if (appState.currentDomain === 'medical') {
      responseText = 'Thank you for the information. I recommend taking acetaminophen for the fever and resting. Would you like me to schedule a follow-up consultation?';
    } else if (appState.currentDomain === 'agriculture') {
      responseText = 'Thank you for the details. This sounds like a fungal infection. I recommend applying a fungicide and improving drainage. Can you send photos of the affected plants?';
    } else if (appState.currentDomain === 'education') {
      responseText = 'Thank you for sharing. I can help you with this topic. Let me prepare a quick study guide and we can go through the key concepts together.';
    }
    
    const expertResponse = {
      id: Date.now() + 1,
      text: responseText,
      sender: 'expert',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const responseElement = createMessageElement(expertResponse);
    chatMessages.appendChild(responseElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 2000);
}

// Payment functions
function showPaymentModal(expertId) {
  const expert = appState.experts.find(e => e.id === expertId);
  if (!expert) return;

  // Update payment details
  document.getElementById('paymentExpertAvatar').src = expert.avatar;
  document.getElementById('paymentExpertName').textContent = expert.name;
  document.getElementById('paymentExpertSpecialty').textContent = expert.specialty;
  document.getElementById('consultationFee').textContent = `$${expert.consultationFee}`;
  document.getElementById('emergencyFee').textContent = '$25';
  document.getElementById('totalAmount').textContent = `$${expert.consultationFee + 25}`;

  elements.paymentModal.classList.add('active');
}

function processPayment() {
  const paymentBtn = document.getElementById('processPayment');
  const originalText = paymentBtn.innerHTML;
  paymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  paymentBtn.disabled = true;

  setTimeout(() => {
    // Simulate successful payment
    elements.paymentModal.classList.remove('active');
    showSuccessMessage('Payment successful! Consultation completed.');
    
    // Add payment activity
    const paymentActivity = {
      id: Date.now(),
      type: 'payment',
      title: 'Payment Completed',
      description: 'Emergency consultation payment processed successfully',
      time: new Date().toLocaleTimeString()
    };
    addActivity(paymentActivity);
    
    // Reset button
    paymentBtn.innerHTML = originalText;
    paymentBtn.disabled = false;
  }, 2000);
}

// Activity feed functions
function loadActivityFeed() {
  const mockActivities = [
    {
      id: 1,
      type: 'emergency',
      title: 'Emergency Alert Sent',
      description: 'Connected to Dr. Sarah Johnson for urgent consultation',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Completed',
      description: 'Emergency consultation payment processed',
      time: '1 day ago'
    },
    {
      id: 3,
      type: 'chat',
      title: 'Chat Session',
      description: 'Consultation with Dr. Michael Chen completed',
      time: '2 days ago'
    }
  ];

  mockActivities.forEach(activity => {
    addActivity(activity);
  });
}

function addActivity(activity) {
  const activityElement = document.createElement('div');
  activityElement.className = 'activity-item';
  activityElement.innerHTML = `
    <h4>${activity.title}</h4>
    <p>${activity.description}</p>
    <div class="activity-time">${activity.time}</div>
  `;

  elements.activityFeed.insertBefore(activityElement, elements.activityFeed.firstChild);
}

// Quick action functions
function handleQuickAction(action) {
  const config = domainConfig[appState.currentDomain];
  
  switch (action) {
    case 'find-expert':
      // Scroll to experts section
      document.querySelector('.nearby-experts').scrollIntoView({ behavior: 'smooth' });
      break;
    case 'emergency-contacts':
      showEmergencyContacts();
      break;
    case 'records':
      if (appState.currentDomain === 'medical') {
        showHealthRecords();
      } else if (appState.currentDomain === 'agriculture') {
        showCropRecords();
      } else if (appState.currentDomain === 'education') {
        showAcademicRecords();
      }
      break;
    case 'reminder':
      if (appState.currentDomain === 'medical') {
        showMedicationReminder();
      } else if (appState.currentDomain === 'agriculture') {
        showCropReminder();
      } else if (appState.currentDomain === 'education') {
        showStudyReminder();
      }
      break;
  }
}

function showEmergencyContacts() {
  alert('Emergency Contacts:\n\nAmbulance: 911\nPoison Control: 1-800-222-1222\nLocal Hospital: (555) 123-4567');
}

function showHealthRecords() {
  alert('Health Records feature coming soon!');
}

function showMedicationReminder() {
  showSuccessMessage('Medication reminder set for tomorrow at 9:00 AM');
}

function showCropRecords() {
  showSuccessMessage('Crop records loaded successfully');
}

function showAcademicRecords() {
  showSuccessMessage('Academic records loaded successfully');
}

function showCropReminder() {
  showSuccessMessage('Crop maintenance reminder set for tomorrow at 7:00 AM');
}

function showStudyReminder() {
  showSuccessMessage('Study reminder set for tomorrow at 6:00 PM');
}

// Utility functions
function showSuccessMessage(message) {
  // Create a temporary success message
  const successDiv = document.createElement('div');
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  successDiv.textContent = message;
  
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

function updateNotificationCount() {
  const count = appState.notifications.length;
  elements.notificationCount.textContent = count;
  elements.notificationCount.style.display = count > 0 ? 'block' : 'none';
}

function showProfile() {
  alert('Profile page coming soon!');
}

function showNotifications() {
  alert('Notifications:\n\n- Dr. Sarah Johnson accepted your emergency request\n- Payment confirmation received\n- New message from Dr. Chen');
}

// Request expert function (called from expert card)
function requestExpert(expertId) {
  if (!appState.isAuthenticated) {
    showAuthModal();
    return;
  }
  
  showPaymentModal(expertId);
}

// Add CSS animation for success message
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// ===== MAP AND TRACKING FUNCTIONS =====

// Initialize Google Maps
function initializeMap() {
  if (!google || !google.maps) {
    console.error('Google Maps API not loaded');
    return;
  }

  // Default center (will be updated with user location)
  const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York

  appState.map = new google.maps.Map(elements.map, {
    center: defaultCenter,
    zoom: 13,
    styles: [
      {
        featureType: 'poi.medical',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      }
    ]
  });

  // Initialize tracking map
  if (elements.trackingMap) {
    appState.trackingMap = new google.maps.Map(elements.trackingMap, {
      center: defaultCenter,
      zoom: 15,
      styles: [
        {
          featureType: 'poi.medical',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ]
    });
  }

  // Update map when user location is available
  if (appState.userLocation) {
    centerMapOnUser();
  }
}

// Center map on user location
function centerMapOnUser() {
  if (!appState.map || !appState.userLocation) {
    getUserLocation();
    return;
  }

  const userLatLng = new google.maps.LatLng(
    appState.userLocation.lat,
    appState.userLocation.lng
  );

  appState.map.setCenter(userLatLng);
  appState.map.setZoom(15);

  // Add user marker if not exists
  addUserMarker(userLatLng);
}

// Add user marker to map
function addUserMarker(position) {
  // Remove existing user marker
  appState.mapMarkers = appState.mapMarkers.filter(marker => marker.type !== 'user');

  const userMarker = new google.maps.Marker({
    position: position,
    map: appState.map,
    title: 'Your Location',
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="12" fill="#667eea" stroke="white" stroke-width="3"/>
          <circle cx="15" cy="15" r="6" fill="white"/>
        </svg>
      `),
      scaledSize: new google.maps.Size(30, 30),
      anchor: new google.maps.Point(15, 15)
    }
  });

  userMarker.type = 'user';
  appState.mapMarkers.push(userMarker);
}

// Add expert markers to map
function addExpertMarkers() {
  // Remove existing expert markers
  appState.mapMarkers = appState.mapMarkers.filter(marker => marker.type !== 'expert');

  appState.experts.forEach((expert, index) => {
    if (expert.locationCoords) {
      const expertLatLng = new google.maps.LatLng(
        expert.locationCoords.lat,
        expert.locationCoords.lng
      );

      const expertMarker = new google.maps.Marker({
        position: expertLatLng,
        map: appState.map,
        title: `Dr. ${expert.name} - ${expert.specialty}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="12" fill="#28a745" stroke="white" stroke-width="3"/>
              <text x="15" y="18" text-anchor="middle" fill="white" font-size="12" font-weight="bold">D</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(30, 30),
          anchor: new google.maps.Point(15, 15)
        }
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h4 style="margin: 0 0 5px 0; color: #333;">Dr. ${expert.name}</h4>
            <p style="margin: 0 0 5px 0; color: #666;">${expert.specialty}</p>
            <p style="margin: 0 0 10px 0; color: #888; font-size: 12px;">${expert.location} away</p>
            <button onclick="requestExpert('${expert.id}')" style="background: #667eea; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Request</button>
          </div>
        `
      });

      expertMarker.addListener('click', () => {
        infoWindow.open(appState.map, expertMarker);
      });

      expertMarker.type = 'expert';
      expertMarker.expertId = expert.id;
      appState.mapMarkers.push(expertMarker);
    }
  });
}

// Toggle live tracking
function toggleLiveTracking() {
  if (!appState.trackingActive) {
    startLiveTracking();
  } else {
    stopLiveTracking();
  }
}

// Start live tracking
function startLiveTracking() {
  if (!appState.isAuthenticated) {
    showAuthModal();
    return;
  }

  appState.trackingActive = true;
  appState.trackingStartTime = new Date();
  elements.toggleTrackingBtn.classList.add('active');
  elements.trackingStatus.style.display = 'flex';

  // Start location tracking
  appState.trackingInterval = setInterval(() => {
    getUserLocation(true);
  }, 10000); // Update every 10 seconds

  // Show tracking modal
  showTrackingModal();

  // Start continuous updates
  startTrackingInfoUpdates();

  // Send tracking start to backend
  sendTrackingUpdate('start');

  showSuccessMessage('Live tracking started! Your location is being shared.');
}

// Stop live tracking
function stopLiveTracking() {
  appState.trackingActive = false;
  elements.toggleTrackingBtn.classList.remove('active');
  elements.trackingStatus.style.display = 'none';

  if (appState.trackingInterval) {
    clearInterval(appState.trackingInterval);
    appState.trackingInterval = null;
  }

  // Stop continuous updates
  stopTrackingInfoUpdates();

  // Hide tracking modal
  hideTrackingModal();

  // Send tracking stop to backend
  sendTrackingUpdate('stop');

  showSuccessMessage('Live tracking stopped.');
}

// Show tracking modal
function showTrackingModal() {
  elements.trackingModal.classList.add('active');
  updateTrackingInfo();
}

// Hide tracking modal
function hideTrackingModal() {
  elements.trackingModal.classList.remove('active');
}

// Minimize tracking modal
function minimizeTrackingModal() {
  hideTrackingModal();
  // Could implement a minimized floating widget here
}

// Update tracking information
function updateTrackingInfo() {
  if (!appState.trackingStartTime) return;

  const now = new Date();
  const duration = Math.floor((now - appState.trackingStartTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  elements.trackingDuration.textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  elements.trackingExpertsCount.textContent = appState.trackingExperts.length;
  elements.lastLocationUpdate.textContent = 'Just now';

  // Update tracking map if available
  if (appState.trackingMap && appState.userLocation) {
    const userLatLng = new google.maps.LatLng(
      appState.userLocation.lat,
      appState.userLocation.lng
    );
    appState.trackingMap.setCenter(userLatLng);
  }
}

// Start continuous tracking info updates
function startTrackingInfoUpdates() {
  if (appState.trackingInfoInterval) {
    clearInterval(appState.trackingInfoInterval);
  }
  
  appState.trackingInfoInterval = setInterval(() => {
    if (appState.trackingActive) {
      updateTrackingInfo();
    }
  }, 1000); // Update every second
}

// Stop tracking info updates
function stopTrackingInfoUpdates() {
  if (appState.trackingInfoInterval) {
    clearInterval(appState.trackingInfoInterval);
    appState.trackingInfoInterval = null;
  }
}

// Refresh map data
function refreshMapData() {
  loadExperts();
  if (appState.userLocation) {
    centerMapOnUser();
  }
  showSuccessMessage('Map refreshed!');
}

// Send tracking update to backend
async function sendTrackingUpdate(action) {
  if (!appState.userLocation) return;

  const trackingData = {
    action: action,
    userId: appState.currentUser?.id || 'demo-user',
    location: appState.userLocation
  };

  try {
    const response = await fetch(`http://localhost:5000/api/tracking/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData)
    });

    if (response.ok) {
      console.log('Tracking update sent successfully');
      
      // Simulate doctors joining tracking for demo
      if (action === 'start') {
        setTimeout(() => {
          appState.trackingExperts = appState.experts.slice(0, 3);
          updateTrackingInfo();
        }, 2000);
      }
    } else {
      console.error('Failed to send tracking update');
    }
  } catch (error) {
    console.error('Error sending tracking update:', error);
    // Fallback to simulation for demo
    if (action === 'start') {
      setTimeout(() => {
        appState.trackingExperts = appState.experts.slice(0, 3);
        updateTrackingInfo();
      }, 2000);
    }
  }
}

// Enhanced getUserLocation function
function getUserLocation(isTracking = false) {
  if (!navigator.geolocation) {
    showSuccessMessage('Geolocation is not supported by this browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      appState.userLocation = location;
      updateLocationDisplay();

      if (appState.map) {
        centerMapOnUser();
        addExpertMarkers();
      }

      if (isTracking && appState.trackingActive) {
        updateTrackingInfo();
        sendTrackingUpdate('update');
      }
    },
    (error) => {
      console.error('Error getting location:', error);
      showSuccessMessage('Unable to get your location. Please check permissions.');
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }
  );
}

// Enhanced form handling functions

function setupFormEventListeners() {
  // Password strength checker
  const registerPassword = document.getElementById('registerPassword');
  if (registerPassword) {
    registerPassword.addEventListener('input', updatePasswordStrength);
  }
  
  // Input validation
  const inputs = document.querySelectorAll('.auth-form input');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.id === 'loginEmail' || this.id === 'registerEmail') {
        validateInput(this, 'email');
      } else if (this.id === 'registerPhone') {
        validateInput(this, 'phone');
      } else if (this.id === 'registerPassword') {
        validateInput(this, 'password');
      } else if (this.id === 'confirmPassword') {
        validateInput(this, 'confirm');
      }
    });
  });
  
  // Form submissions
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', handleForgotPassword);
  }
}

function setupSettingsListeners() {
  const settingsInputs = document.querySelectorAll('.settings-modal input[type="checkbox"]');
  settingsInputs.forEach(input => {
    input.addEventListener('change', saveUserSettings);
  });
}

function setupHistoryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const filter = this.dataset.filter;
      filterHistory(filter);
    });
  });
}

function filterHistory(filter) {
  const historyList = document.getElementById('historyList');
  const items = historyList.querySelectorAll('.history-item');
  
  items.forEach(item => {
    const itemType = item.querySelector('.history-icon').dataset.type;
    if (filter === 'all' || itemType === filter) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// Enhanced form handlers
function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  if (!email || !password) {
    showNotification('Please fill in all fields', 'error');
    return;
  }
  
  // Simulate login process
  const btn = e.target.querySelector('button[type="submit"]');
  const originalContent = btn.innerHTML;
  
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  btn.disabled = true;
  
  setTimeout(() => {
    // Simulate successful login
    const userData = {
      name: email.split('@')[0],
      email: email,
      type: 'client',
      avatar: `https://via.placeholder.com/80/667eea/FFFFFF?text=${email.charAt(0).toUpperCase()}`
    };
    
    loginUser(userData);
    addToHistory('profile', 'User Login', 'Successfully logged in to the platform');
    
    btn.innerHTML = originalContent;
    btn.disabled = false;
  }, 1500);
}

function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const phone = document.getElementById('registerPhone').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const userType = document.querySelector('input[name="userType"]:checked').value;
  const agreeTerms = document.getElementById('agreeTerms').checked;
  
  if (!name || !email || !phone || !password || !confirmPassword) {
    showNotification('Please fill in all fields', 'error');
    return;
  }
  
  if (!agreeTerms) {
    showNotification('Please agree to the terms and conditions', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showNotification('Passwords do not match', 'error');
    return;
  }
  
  const passwordStrength = checkPasswordStrength(password);
  if (passwordStrength.strength < 3) {
    showNotification('Password is too weak', 'error');
    return;
  }
  
  // Simulate registration process
  const btn = e.target.querySelector('button[type="submit"]');
  const originalContent = btn.innerHTML;
  
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
  btn.disabled = true;
  
  setTimeout(() => {
    const userData = {
      name: name,
      email: email,
      phone: phone,
      type: userType,
      avatar: `https://via.placeholder.com/80/667eea/FFFFFF?text=${name.charAt(0).toUpperCase()}`
    };
    
    registerUser(userData);
    addToHistory('profile', 'Account Created', 'Successfully registered new account');
    
    btn.innerHTML = originalContent;
    btn.disabled = false;
  }, 2000);
}

function handleForgotPassword(e) {
  e.preventDefault();
  
  const email = document.getElementById('resetEmail').value;
  
  if (!email) {
    showNotification('Please enter your email address', 'error');
    return;
  }
  
  // Simulate password reset
  const btn = e.target.querySelector('button[type="submit"]');
  const originalContent = btn.innerHTML;
  
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;
  
  setTimeout(() => {
    showNotification('Password reset link sent to your email', 'success');
    hideForgotPassword();
    
    btn.innerHTML = originalContent;
    btn.disabled = false;
  }, 2000);
}

// Enhanced tab switching for auth modal
function switchAuthTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(tabName + 'Tab').classList.add('active');
  
  // Clear forms when switching
  clearAuthForms();
}

// Enhanced navigation
function switchTab(tabName) {
  // Check if user needs to be logged in for certain tabs
  if ((tabName === 'profile' || tabName === 'chat') && !currentUser) {
    showAuthModal();
    return;
  }
  
  // Update navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = 'none';
  });
  document.getElementById(tabName + 'Tab').style.display = 'block';
  
  // Special handling for profile tab
  if (tabName === 'profile') {
    showProfileModal();
  }
}

// Enhanced emergency handling
function handleEmergency() {
  if (!currentUser) {
    showAuthModal();
    return;
  }
  
  // Add to history
  addToHistory('emergency', 'Emergency Reported', 'Emergency assistance requested');
  
  // Update user stats
  currentUser.emergencyCount++;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  updateProfileInfo();
  
  // Show emergency modal
  showEmergencyModal();
}

// Enhanced chat handling
function startChat() {
  if (!currentUser) {
    showAuthModal();
    return;
  }
  
  // Add to history
  addToHistory('chat', 'Chat Started', 'Started conversation with expert');
  
  // Update user stats
  currentUser.chatCount++;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  updateProfileInfo();
  
  // Show chat interface
  showChatModal();
}