/**
 * EventSphere — Profile Picture & Categorized Emoji Avatar Selector Modal
 */

const AvatarModal = {
  DEFAULT_AVATAR: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  
  gradients: [
    { name: 'Royal Indigo', css: 'linear-gradient(135deg, #6366F1, #8B5CF6)', stops: '<stop offset="0%" stop-color="#6366F1"/><stop offset="100%" stop-color="#8B5CF6"/>' },
    { name: 'Cyber Neon', css: 'linear-gradient(135deg, #06B6D4, #3B82F6)', stops: '<stop offset="0%" stop-color="#06B6D4"/><stop offset="100%" stop-color="#3B82F6"/>' },
    { name: 'Sunset Glow', css: 'linear-gradient(135deg, #F43F5E, #FB923C)', stops: '<stop offset="0%" stop-color="#F43F5E"/><stop offset="100%" stop-color="#FB923C"/>' },
    { name: 'Emerald Mint', css: 'linear-gradient(135deg, #10B981, #059669)', stops: '<stop offset="0%" stop-color="#10B981"/><stop offset="100%" stop-color="#059669"/>' },
    { name: 'Amber Fire', css: 'linear-gradient(135deg, #F59E0B, #EF4444)', stops: '<stop offset="0%" stop-color="#F59E0B"/><stop offset="100%" stop-color="#EF4444"/>' },
    { name: 'Berry Velvet', css: 'linear-gradient(135deg, #EC4899, #8B5CF6)', stops: '<stop offset="0%" stop-color="#EC4899"/><stop offset="100%" stop-color="#8B5CF6"/>' },
    { name: 'Ocean Pulse', css: 'linear-gradient(135deg, #0EA5E9, #2563EB)', stops: '<stop offset="0%" stop-color="#0EA5E9"/><stop offset="100%" stop-color="#2563EB"/>' },
    { name: 'Midnight Onyx', css: 'linear-gradient(135deg, #1E293B, #0F172A)', stops: '<stop offset="0%" stop-color="#1E293B"/><stop offset="100%" stop-color="#0F172A"/>' }
  ],

  categories: {
    smileys: {
      name: 'Smileys',
      icon: '😀',
      emojis: ['😀', '😎', '🤩', '🥳', '😇', '🤠', '🤓', '🚀', '✨', '🔥', '💎', '🌟', '⚡', '💫', '💖', '👾', '🌈', '🎉', '🏆', '🦄']
    },
    people: {
      name: 'People',
      icon: '🧑‍💻',
      emojis: ['🧑‍💻', '👩‍💻', '👨‍🎨', '👩‍🎤', '🧑‍🚀', '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧝‍♀️', '👑', '🤴', '👸', '🕵️‍♂️', '👩‍🔬', '👨‍🍳', '🥷', '🧑‍🎤', '🧑‍🏫', '👩‍🚀', '🧑‍💼']
    },
    animals: {
      name: 'Animals',
      icon: '🦁',
      emojis: ['🦁', '🐯', '🦊', '🐼', '🐨', '🦄', '🦅', '🦉', '🐺', '🐬', '🐙', '🐉', '🐱', '🐶', '🐵', '🦚', '🐢', '🦋', '🐳', '🦩']
    },
    gaming: {
      name: 'Gaming',
      icon: '🎮',
      emojis: ['🎮', '🕹️', '👾', '🎲', '🏆', '🥇', '🎯', '⚔️', '🛡️', '🎪', '🪄', '🃏', '🎳', '🥊', '🏎️', '🚀', '👑', '💎', '💣', '🏅']
    },
    creative: {
      name: 'Creative',
      icon: '🎨',
      emojis: ['🎨', '🎬', '📷', '🎧', '🎸', '🎹', '🎙️', '🎭', '🖌️', '🎼', '🎟️', '🍿', '🎷', '🎻', '📻', '🎆', '🎪', '🪕', '🥁', '🎺']
    },
    study: {
      name: 'Study',
      icon: '📚',
      emojis: ['📚', '🎓', '🔬', '🧪', '📖', '📝', '💡', '📐', '🔭', '🧠', '📜', '🏛️', '📊', '📈', '💻', '🖊️', '🔍', '📓', '📌', '🏷️']
    },
    tech: {
      name: 'Tech',
      icon: '⚡',
      emojis: ['💻', '🖥️', '⚡', '🤖', '🌐', '🛰️', '📱', '🔋', '💾', '🔒', '📡', '🛸', '⚙️', '🔌', '🕹️', '🧬', '🔑', '🚀', '💿', '📡']
    },
    nature: {
      name: 'Nature',
      icon: '🌲',
      emojis: ['🌲', '🌸', '🌊', '🏔️', '🌴', '🍀', '🌻', '🍁', '🌙', '☀️', '🪐', '🌈', '🌺', '🌵', '🍂', '🌋', '🍄', '🌿', '🌾', '💫']
    }
  },

  activeTab: 'emoji', // 'emoji' | 'upload'
  activeCategory: 'all',
  selectedEmoji: '🧑‍💻',
  selectedGradientIndex: 0,
  uploadedDataUrl: null,
  uploadedFile: null,
  selectedAvatarUrl: '',
  onSaveCallback: null,

  init() {
    this.injectModalHtml();
    this.bindEvents();
  },

  injectModalHtml() {
    if (document.getElementById('avatarSelectorModal')) return;

    const modalHtml = `
      <div class="avatar-modal-backdrop" id="avatarSelectorModal">
        <div class="avatar-modal-card" role="dialog" aria-modal="true" aria-labelledby="avatarModalTitle">
          
          <!-- Header -->
          <div class="avatar-modal-header">
            <div>
              <h2 class="avatar-modal-title" id="avatarModalTitle">Customize Profile Picture</h2>
              <p class="avatar-modal-desc">Select a modern emoji avatar or upload your own custom photo</p>
            </div>
            <button class="avatar-modal-close" id="avatarModalCloseBtn" aria-label="Close modal">&times;</button>
          </div>

          <!-- Navigation Tabs -->
          <div class="avatar-tabs">
            <button class="avatar-tab-btn active" data-avatar-tab="emoji">
              <span>✨</span> Emoji Avatar Library
            </button>
            <button class="avatar-tab-btn" data-avatar-tab="upload">
              <span>📷</span> Upload Custom Photo
            </button>
          </div>

          <!-- Modal Body -->
          <div class="avatar-modal-body">
            
            <!-- Live Preview -->
            <div class="avatar-preview-wrap">
              <div class="avatar-preview-circle">
                <img id="avatarModalLivePreview" src="${this.DEFAULT_AVATAR}" alt="Preview">
              </div>
              <div class="avatar-preview-info">
                <div class="avatar-preview-label">Live Preview</div>
                <div class="avatar-preview-type" id="avatarPreviewTypeName">Emoji Avatar</div>
                <div class="avatar-preview-hint">This image will appear on your tickets, profile, navbar, and reviews.</div>
              </div>
            </div>

            <!-- TAB 1: EMOJI LIBRARY -->
            <div id="avatarTabContentEmoji">
              
              <!-- Category Filter Pills -->
              <div style="margin-bottom: 0.75rem;">
                <div style="font-size: var(--font-size-xs); font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">
                  CATEGORIES
                </div>
                <div class="emoji-category-pills" id="emojiCategoryPills">
                  <button class="emoji-cat-pill active" data-cat="all">🌟 All Categories</button>
                  ${Object.keys(this.categories).map(catKey => `
                    <button class="emoji-cat-pill" data-cat="${catKey}">
                      <span>${this.categories[catKey].icon}</span> ${this.categories[catKey].name}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Gradient Palette -->
              <div class="emoji-gradient-palette">
                <div class="emoji-gradient-label">AVATAR BACKDROP STYLE</div>
                ${this.gradients.map((grad, idx) => `
                  <div class="emoji-gradient-swatch ${idx === 0 ? 'active' : ''}" 
                       data-gradient-idx="${idx}" 
                       style="background: ${grad.css};" 
                       title="${grad.name}">
                  </div>
                `).join('')}
              </div>

              <!-- Emoji Grid -->
              <div style="margin-top: 0.5rem;">
                <div style="font-size: var(--font-size-xs); font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">
                  SELECT AN ICON
                </div>
                <div class="emoji-grid-container" id="emojiGridContainer">
                  <!-- Injected via JS -->
                </div>
              </div>

            </div>

            <!-- TAB 2: UPLOAD CUSTOM PHOTO -->
            <div id="avatarTabContentUpload" style="display: none;">
              <input type="file" id="avatarFileInput" accept="image/jpeg,image/png,image/webp" style="display: none;">
              
              <div class="avatar-upload-dropzone" id="avatarDropzone">
                <div class="avatar-upload-icon">📁</div>
                <div class="avatar-upload-title">Drag & drop your photo here</div>
                <div class="avatar-upload-desc">Supports JPG, PNG, and WEBP images up to 5MB.</div>
                <button type="button" class="btn btn-primary btn-sm" id="avatarBrowseBtn" style="margin-top: 0.5rem;">
                  Browse Files
                </button>
                <div class="avatar-upload-badge">Recommended: Square format (1:1), at least 200x200px</div>
              </div>

              <div id="avatarUploadStatus" style="display: none; margin-top: 1rem; padding: 0.75rem; border-radius: var(--radius-md); background: var(--bg-subtle); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span>🖼️</span>
                  <span id="avatarUploadFileName" style="font-size: 0.8125rem; font-weight: 600; color: var(--text-primary);">photo.jpg</span>
                </div>
                <button type="button" id="avatarUploadRemoveBtn" class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">Clear</button>
              </div>
            </div>

          </div>

          <!-- Footer Actions -->
          <div class="avatar-modal-footer">
            <div class="avatar-footer-left">
              <button type="button" class="btn btn-secondary btn-sm" id="avatarResetDefaultBtn" title="Reset to default EventSphere avatar">
                🔄 Reset Default
              </button>
            </div>
            <div class="avatar-footer-right">
              <button type="button" class="btn btn-secondary btn-sm" id="avatarCancelBtn">
                Cancel
              </button>
              <button type="button" class="btn btn-primary btn-sm" id="avatarSaveBtn">
                Save Avatar ✨
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  bindEvents() {
    // Close modal triggers
    const modal = document.getElementById('avatarSelectorModal');
    const closeBtn = document.getElementById('avatarModalCloseBtn');
    const cancelBtn = document.getElementById('avatarCancelBtn');

    [closeBtn, cancelBtn].forEach(btn => {
      btn?.addEventListener('click', () => this.close());
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    // Tab switching
    document.querySelectorAll('[data-avatar-tab]').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        const tab = tabBtn.getAttribute('data-avatar-tab');
        this.switchTab(tab);
      });
    });

    // Category pills
    document.querySelectorAll('[data-cat]').forEach(catBtn => {
      catBtn.addEventListener('click', () => {
        const cat = catBtn.getAttribute('data-cat');
        this.filterCategory(cat);
      });
    });

    // Gradient swatches
    document.querySelectorAll('[data-gradient-idx]').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const idx = parseInt(swatch.getAttribute('data-gradient-idx'), 10);
        this.selectGradient(idx);
      });
    });

    // File upload handlers
    const fileInput = document.getElementById('avatarFileInput');
    const dropzone = document.getElementById('avatarDropzone');
    const browseBtn = document.getElementById('avatarBrowseBtn');
    const removeUploadBtn = document.getElementById('avatarUploadRemoveBtn');

    browseBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });

    dropzone?.addEventListener('click', () => fileInput.click());

    dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone?.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.handleFileSelected(e.dataTransfer.files[0]);
      }
    });

    fileInput?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleFileSelected(e.target.files[0]);
      }
    });

    removeUploadBtn?.addEventListener('click', () => {
      this.uploadedDataUrl = null;
      this.uploadedFile = null;
      document.getElementById('avatarUploadStatus').style.display = 'none';
      this.renderEmojiAvatar();
    });

    // Reset default button
    document.getElementById('avatarResetDefaultBtn')?.addEventListener('click', () => {
      this.selectedAvatarUrl = this.DEFAULT_AVATAR;
      this.updateLivePreview(this.DEFAULT_AVATAR, 'Default Avatar');
    });

    // Save button
    document.getElementById('avatarSaveBtn')?.addEventListener('click', () => {
      this.saveAvatar();
    });
  },

  open(options = {}) {
    this.init();
    this.onSaveCallback = options.onSave || null;
    const currentUser = API.getCurrentUser();
    const currentAvatar = options.currentAvatar || currentUser?.profileImage || this.DEFAULT_AVATAR;

    this.selectedAvatarUrl = currentAvatar;
    this.uploadedDataUrl = null;
    this.uploadedFile = null;

    // Check if current avatar is an uploaded image or default
    if (!currentAvatar.startsWith('data:image/svg+xml')) {
      this.updateLivePreview(currentAvatar, 'Current Photo');
    } else {
      this.renderEmojiAvatar();
    }

    this.renderEmojiGrid();
    this.switchTab('emoji');

    const modal = document.getElementById('avatarSelectorModal');
    modal?.classList.add('active');
  },

  close() {
    const modal = document.getElementById('avatarSelectorModal');
    modal?.classList.remove('active');
  },

  switchTab(tab) {
    this.activeTab = tab;
    
    document.querySelectorAll('[data-avatar-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-avatar-tab') === tab);
    });

    const emojiContent = document.getElementById('avatarTabContentEmoji');
    const uploadContent = document.getElementById('avatarTabContentUpload');

    if (tab === 'emoji') {
      if (emojiContent) emojiContent.style.display = 'block';
      if (uploadContent) uploadContent.style.display = 'none';
      this.renderEmojiAvatar();
    } else {
      if (emojiContent) emojiContent.style.display = 'none';
      if (uploadContent) uploadContent.style.display = 'block';
      if (this.uploadedDataUrl) {
        this.updateLivePreview(this.uploadedDataUrl, 'Uploaded Photo (Preview)');
      }
    }
  },

  filterCategory(cat) {
    this.activeCategory = cat;
    document.querySelectorAll('[data-cat]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
    });
    this.renderEmojiGrid();
  },

  selectGradient(idx) {
    this.selectedGradientIndex = idx;
    document.querySelectorAll('[data-gradient-idx]').forEach(swatch => {
      swatch.classList.toggle('active', parseInt(swatch.getAttribute('data-gradient-idx'), 10) === idx);
    });
    this.renderEmojiAvatar();
  },

  renderEmojiGrid() {
    const grid = document.getElementById('emojiGridContainer');
    if (!grid) return;

    let emojis = [];
    if (this.activeCategory === 'all') {
      Object.values(this.categories).forEach(c => {
        emojis = emojis.concat(c.emojis);
      });
      // De-duplicate
      emojis = [...new Set(emojis)];
    } else if (this.categories[this.activeCategory]) {
      emojis = this.categories[this.activeCategory].emojis;
    }

    grid.innerHTML = emojis.map(emoji => `
      <button type="button" class="emoji-item-btn ${emoji === this.selectedEmoji ? 'active' : ''}" data-emoji="${emoji}">
        ${emoji}
      </button>
    `).join('');

    grid.querySelectorAll('[data-emoji]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedEmoji = btn.getAttribute('data-emoji');
        grid.querySelectorAll('[data-emoji]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderEmojiAvatar();
      });
    });
  },

  renderEmojiAvatar() {
    const grad = this.gradients[this.selectedGradientIndex] || this.gradients[0];
    const svgDataUrl = this.generateEmojiSvg(this.selectedEmoji, grad);
    this.selectedAvatarUrl = svgDataUrl;
    this.updateLivePreview(svgDataUrl, `Emoji: ${this.selectedEmoji} (${grad.name})`);
  },

  generateEmojiSvg(emoji, gradient) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
      <defs>
        <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          ${gradient.stops}
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="128" fill="url(#avatarGrad)" />
      <text x="50%" y="54%" font-family="system-ui, -apple-system, 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif" font-size="124" dominant-baseline="central" text-anchor="middle">${emoji}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  },

  handleFileSelected(file) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      Components.showToast('Please select a valid JPG, PNG, or WEBP image file.', 'error');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      Components.showToast('Image size exceeds 5MB limit. Please choose a smaller photo.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedDataUrl = e.target.result;
      this.uploadedFile = file;
      this.selectedAvatarUrl = e.target.result;
      
      const statusWrap = document.getElementById('avatarUploadStatus');
      const fileNameEl = document.getElementById('avatarUploadFileName');
      if (statusWrap && fileNameEl) {
        fileNameEl.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        statusWrap.style.display = 'flex';
      }

      this.updateLivePreview(this.uploadedDataUrl, `Custom Photo: ${file.name}`);
    };
    reader.readAsDataURL(file);
  },

  updateLivePreview(url, typeName) {
    const previewImg = document.getElementById('avatarModalLivePreview');
    const typeLabel = document.getElementById('avatarPreviewTypeName');
    if (previewImg) previewImg.src = url;
    if (typeLabel) typeLabel.textContent = typeName || 'Avatar Preview';
  },

  async saveAvatar() {
    const saveBtn = document.getElementById('avatarSaveBtn');
    if (!saveBtn) return;

    saveBtn.disabled = true;
    saveBtn.innerHTML = 'Saving... ⏳';

    try {
      let finalAvatarUrl = this.selectedAvatarUrl;

      // If user uploaded a physical file, upload via POST /api/users/avatar
      if (this.activeTab === 'upload' && this.uploadedFile) {
        const formData = new FormData();
        formData.append('avatar', this.uploadedFile);

        const token = API.getToken();
        const response = await fetch('/api/users/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.message || 'Failed to upload photo');
        }
        finalAvatarUrl = resData.avatarUrl;
        API.setCurrentUser(resData.user);
      } else {
        // Emoji avatar or default URL
        const data = await API.put('/users/profile', {
          profileImage: finalAvatarUrl
        });
        API.setCurrentUser(data.user);
      }

      // Update all avatar instances on the current page immediately
      this.broadcastAvatarUpdate(finalAvatarUrl);

      Components.showToast('Profile picture updated successfully! ✨', 'success');
      
      if (typeof this.onSaveCallback === 'function') {
        this.onSaveCallback(finalAvatarUrl);
      }

      this.close();
    } catch (err) {
      Components.showToast(err.message || 'Failed to update profile picture', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Save Avatar ✨';
    }
  },

  broadcastAvatarUpdate(newAvatarUrl) {
    // 1. Navbar avatar
    document.querySelectorAll('.user-avatar, [data-user-avatar], [data-preview]').forEach(img => {
      if (img.tagName === 'IMG') {
        img.src = newAvatarUrl;
      }
    });

    // 2. Settings profile avatar
    const settingsAvatarImg = document.getElementById('settingsAvatarPreviewImg');
    if (settingsAvatarImg) {
      settingsAvatarImg.src = newAvatarUrl;
    }
    const settingsInput = document.getElementById('settingsAvatar');
    if (settingsInput) {
      settingsInput.value = newAvatarUrl;
    }

    // 3. Admin avatar
    const adminAvatar = document.querySelector('[data-preview]');
    if (adminAvatar) {
      adminAvatar.src = newAvatarUrl;
    }
  }
};

window.AvatarModal = AvatarModal;

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AvatarModal !== 'undefined') {
    AvatarModal.init();
  }
});
