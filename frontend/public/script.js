document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = '/api';
  const STORAGE_KEYS = {
    token: 'foodconnect_token',
    refresh: 'foodconnect_refresh',
    user: 'foodconnect_user'
  };

  const body = document.body;
  const navLinks = document.getElementById('navLinks');
  const menuToggle = document.getElementById('menuToggle');
  const themeToggleBtn = document.getElementById('themeToggle');
  const themes = ['light', 'dark', 'pastel'];

  const foodList = document.getElementById('food-list');
  const donationForm = document.getElementById('donationForm');
  const donationStatus = document.getElementById('donationStatus');
  const donationList = document.getElementById('donationList');
  const partnerForm = document.getElementById('partnerForm');
  const partnerStatus = document.getElementById('partnerStatus');
  const partnerList = document.getElementById('partnerList');
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');
  const signupStatus = document.getElementById('signupStatus');
  const loginStatus = document.getElementById('loginStatus');
  const gameGrid = document.getElementById('gameGrid');
  const rewardTrack = document.getElementById('rewardTrack');
  const gameSelect = document.getElementById('gameSelect');
  const gamePointsInput = document.getElementById('gamePoints');
  const gamePointsForm = document.getElementById('gamePointsForm');
  const gamePointsStatus = document.getElementById('gamePointsStatus');
  const dashboardPage = document.querySelector('.dashboard-page');
  const dashboardName = document.getElementById('dashboardName');
  const dashboardGreeting = document.getElementById('dashboardGreeting');
  const pointsBalanceEl = document.getElementById('pointsBalance');

  // Role selection for signup
  if (window.location.pathname.endsWith('signup.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    const roleSelect = document.getElementById('signupRole');
    const roleDisplay = document.getElementById('roleDisplay');
    if (roleSelect && role && (role === 'donor' || role === 'receiver')) {
      roleSelect.value = role;
    }
    if (roleDisplay && role) {
      roleDisplay.textContent = `Signing up as: ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    }
    if (signupForm) {
      signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setStatus(signupStatus, '');
        const password = document.getElementById('signupPassword')?.value;
        const confirm = document.getElementById('confirmPassword')?.value;
        if (password !== confirm) {
          setStatus(signupStatus, 'Passwords do not match.', 'error');
          return;
        }
        const formData = new FormData(signupForm);
        try {
          const selectedRole = formData.get('role') || role || 'receiver';
          const payload = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            role: selectedRole
          };
          const data = await request(`${API_BASE}/auth/signup`, { method: 'POST', body: payload });
          saveSession(data);
          setStatus(signupStatus, 'Account created! Redirecting…');
          setTimeout(() => (window.location.href = 'dashboard.html'), 900);
        } catch (error) {
          setStatus(signupStatus, error.message, 'error');
        }
      });
    }
  }
  const donationCountEl = document.getElementById('donationCount');
  const partnerCountEl = document.getElementById('partnerCount');
  const dashboardDonations = document.getElementById('dashboardDonations');
  const dashboardPartners = document.getElementById('dashboardPartners');
  const pointsHistoryList = document.getElementById('pointsHistory');
  const dashboardRewards = document.getElementById('dashboardRewards');
  const rewardStatus = document.getElementById('rewardStatus');
  const cartList = document.getElementById('cartList');
  const orderList = document.getElementById('orderList');
  const cartStatus = document.getElementById('cartStatus');
  const orderStatus = document.getElementById('orderStatus');
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  let currentThemeIndex = 0;
  let currentUser = null;
  let latestGames = [];
  let currentCart = [];
  let cachedRewards = [];

  const readStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.user));
    } catch (error) {
      return null;
    }
  };

  const getToken = () => localStorage.getItem(STORAGE_KEYS.token);

  const saveSession = ({ user, token, refreshToken }) => {
    if (user) {
      currentUser = user;
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    }
    if (token) {
      localStorage.setItem(STORAGE_KEYS.token, token);
    }
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.refresh, refreshToken);
    }
  };

  const clearSession = () => {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.refresh);
  };

  currentUser = readStoredUser();

  const setStatus = (node, message, type = 'success') => {
    if (!node) return;
    node.textContent = message || '';
    node.classList.remove('success', 'error');
    if (!message) {
      node.style.display = 'none';
      return;
    }
    node.style.display = 'block';
    node.classList.add(type === 'error' ? 'error' : 'success');
  };

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resolveImageUrl = (value) => {
    if (!value) return '';
    // Handle full URLs
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
      return value;
    }
    // Handle absolute paths
    if (value.startsWith('/')) {
      return value;
    }
    // Handle relative paths - ensure /uploads/ prefix
    if (value.includes('uploads/')) {
      return `/${value}`;
    }
    return `/uploads/${value}`;
  };

  // Placeholder image (SVG data URI)
  const getPlaceholderImage = () => {
    return 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23999\' font-size=\'18\'%3ENo Image%3C/text%3E%3C/svg%3E';
  };

  // Image error handler that replaces with placeholder (global for inline handlers)
  window.handleImageError = (img) => {
    const placeholder = getPlaceholderImage();
    if (img.src !== placeholder) {
      img.src = placeholder;
      img.style.opacity = '0.6';
    }
  };

  const notifyCart = (message, type = 'success') => {
    if (!message) return;
    if (cartStatus) {
      setStatus(cartStatus, message, type);
    } else if (type === 'error') {
      alert(message);
    } else {
      console.info(message);
    }
  };

  const request = async (path, { method = 'GET', body, auth = false } = {}) => {
    // Ensure path starts with /api if it's an API call
    const fullPath = path.startsWith('http') ? path : (path.startsWith('/api') ? path : `${API_BASE}${path.startsWith('/') ? path : '/' + path}`);
    
    const headers = {};
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    if (auth) {
      const token = getToken();
      if (!token) {
        throw new Error('Please login to continue');
      }
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(fullPath, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: 'include' // Include cookies for CORS
      });

      if (!response.ok) {
        let detail = {};
        try {
          detail = await response.json();
        } catch (error) {
          detail = {};
        }
        const message = detail.message || detail?.errors?.[0]?.msg || `Request failed: ${response.status} ${response.statusText}`;
        throw new Error(message);
      }

      if (response.status === 204) return null;
      try {
        return await response.json();
      } catch (error) {
        return null;
      }
    } catch (error) {
      // Network errors or fetch failures
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  };

  const ensureAuth = (statusNode) => {
    if (getToken()) return true;
    if (statusNode) {
      setStatus(statusNode, 'Please login to continue.', 'error');
    } else {
      alert('Please login to continue.');
    }
    return false;
  };

  // Test backend connectivity on page load
  const testBackendConnection = async () => {
    try {
      const response = await fetch('/health', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connected:', data);
        return true;
      }
      console.warn('⚠️ Backend health check failed:', response.status);
      return false;
    } catch (error) {
      console.error('❌ Cannot connect to backend:', error.message);
      return false;
    }
  };

  // Navigation menu controls
  const toggleMenu = () => {
    if (navLinks) navLinks.classList.toggle('show');
  };

  window.toggleMenu = toggleMenu;

  const hideMenuOnOutsideEvent = (event) => {
    if (navLinks && menuToggle && navLinks.classList.contains('show')) {
      const isClickOnToggle = menuToggle.contains(event.target);
      const isClickInsideMenu = navLinks.contains(event.target);

      if (!isClickOnToggle && !isClickInsideMenu) {
        navLinks.classList.remove('show');
      }
    }
  };

  if (navLinks) {
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => navLinks.classList.remove('show'));
    });
  }

  document.addEventListener('click', hideMenuOnOutsideEvent);
  document.addEventListener('touchstart', hideMenuOnOutsideEvent);

  // Theme toggle
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme && themes.includes(savedTheme)) {
    body.classList.add(savedTheme);
    currentThemeIndex = themes.indexOf(savedTheme);
  } else {
    body.classList.add('light');
  }

  if (themeToggleBtn) {
    const themeIcon = themeToggleBtn.querySelector('i');
    const updateThemeIcon = (theme) => {
      themeIcon.classList.remove('fa-moon', 'fa-sun', 'fa-wand-magic-sparkles');
      if (theme === 'dark') themeIcon.classList.add('fa-sun');
      else if (theme === 'pastel') themeIcon.classList.add('fa-wand-magic-sparkles');
      else themeIcon.classList.add('fa-moon');
    };

    updateThemeIcon(themes[currentThemeIndex]);

    themeToggleBtn.addEventListener('click', () => {
      body.classList.remove(themes[currentThemeIndex]);
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      const newTheme = themes[currentThemeIndex];
      body.classList.add(newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  // Hero scroll animation
  const sections = document.querySelectorAll('section');
  const revealOnScroll = () => {
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        section.classList.add('visible');
      }
    });
  };
  revealOnScroll();
  window.addEventListener('scroll', revealOnScroll);

  // Foods listing on Home page
  const renderFoods = (items = []) => {
    if (!foodList) return;
    foodList.innerHTML = '';
    if (!items.length) {
      foodList.innerHTML = `<p class="placeholder">No meals are available right now. Please check back soon.</p>`;
      return;
    }

    items.forEach((item) => {
      const imagePath = item.image_url || item.imageUrl;
      const imageSrc = imagePath ? resolveImageUrl(imagePath) : getPlaceholderImage();
      const actionMarkup = getToken()
        ? `<button class="btn small add-to-cart" data-food-id="${item.id}">Add to cart</button>`
        : `<small>Login to add to cart</small>`;

      const card = document.createElement('article');
      card.className = 'food-card';
      card.innerHTML = `
        <img src="${imageSrc}" alt="${item.name}" loading="lazy" onerror="handleImageError(this)">
        <div class="food-card-body">
          <h3>${item.name}</h3>
          <p>${item.description || 'Delicious surplus meal'}</p>
          <div class="food-card-meta">
            <span class="price">₹${Number(item.price).toFixed(2)}</span>
            <span class="category">${item.category || 'General'}</span>
          </div>
          <div class="food-card-meta">
            ${actionMarkup}
          </div>
        </div>
      `;
      foodList.appendChild(card);
    });
  };

  const loadFoods = async () => {
    if (!foodList) return;
    foodList.setAttribute('aria-busy', 'true');
    foodList.innerHTML = `<p class="placeholder">Fetching fresh meals…</p>`;
    try {
      const data = await request(`${API_BASE}/foods`);
      renderFoods(data);
    } catch (error) {
      console.error('Error loading foods:', error);
      foodList.innerHTML = `<p class="placeholder error">Unable to load meals at the moment.</p>`;
    } finally {
      foodList.setAttribute('aria-busy', 'false');
    }
  };
  
  // Test backend connectivity on page load (non-blocking)
  testBackendConnection();
  
  loadFoods();

  if (foodList) {
    foodList.addEventListener('click', async (event) => {
      const button = event.target.closest('button[data-food-id]');
      if (!button) return;
      if (!ensureAuth(cartStatus)) return;
      const foodId = Number(button.dataset.foodId);
      const qtyInput = prompt('How many portions would you like?', '1');
      const qty = Number(qtyInput);
      if (!Number.isInteger(qty) || qty <= 0) {
        notifyCart('Please enter a valid quantity.', 'error');
        return;
      }
      try {
        const response = await request(`${API_BASE}/cart/add`, {
          method: 'POST',
          auth: true,
          body: { foodId, qty }
        });
        const items = response.cart || response;
        currentCart = items;
        renderCart(items);
        notifyCart('Item added to cart!');
        await loadCart();
      } catch (error) {
        notifyCart(error.message, 'error');
      }
    });
  }

  // Generic timeline renderer
  const renderTimeline = (target, items, emptyMessage, formatter) => {
    if (!target) return;
    target.innerHTML = '';
    if (!items?.length) {
      target.innerHTML = `<li class="placeholder">${emptyMessage}</li>`;
      return;
    }

    items.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = formatter(item);
      target.appendChild(li);
    });
  };

  const renderCart = (items = []) => {
    if (!cartList) return;
    cartList.innerHTML = '';
    if (!items.length) {
      cartList.innerHTML = '<li class="placeholder">Your cart is empty. Add meals from the live menu.</li>';
      return;
    }

    let subtotal = 0;
    items.forEach((item) => {
      const lineTotal = Number(item.price) * Number(item.qty);
      subtotal += lineTotal;
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="list-head">
          <strong>${item.name}</strong>
          <span>₹${lineTotal.toFixed(2)}</span>
        </div>
        <div class="cart-item-meta">
          <span>Qty: ${item.qty} @ ₹${Number(item.price).toFixed(2)}</span>
          <button class="cart-remove" data-remove="${item.foodId}">Remove</button>
        </div>
      `;
      cartList.appendChild(li);
    });

    const summary = document.createElement('li');
    summary.innerHTML = `
      <div class="list-head">
        <strong>Total</strong>
        <span>₹${subtotal.toFixed(2)}</span>
      </div>
    `;
    cartList.appendChild(summary);
  };

  const renderOrders = (orders = []) => {
    if (!orderList) return;
    orderList.innerHTML = '';
    if (!orders.length) {
      orderList.innerHTML = '<li class="placeholder">No orders yet. Add items to your cart and place an order.</li>';
      return;
    }

    orders.forEach((order) => {
      const items = order.items || [];
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="list-head">
          <strong>Order #${order.id}</strong>
          <span class="badge ${order.status}">${order.status}</span>
        </div>
        <small>${items.length} item(s) • ₹${Number(order.total).toFixed(2)} • ${formatDate(order.created_at)}</small>
        ${
          items.length
            ? `<ul class="mini-list">
                ${items
                  .slice(0, 3)
                  .map(
                    (item) =>
                      `<li>${item.qty} × ${item.name} <span style="float:right;">₹${Number(item.lineTotal || item.price * item.qty).toFixed(2)}</span></li>`
                  )
                  .join('')}
                ${items.length > 3 ? '<li>+ more items…</li>' : ''}
              </ul>`
            : ''
        }
      `;
      orderList.appendChild(li);
    });
  };

  // Rewards
  const renderRewards = (rewards, { trackTarget, gridTarget, showCta = false } = {}) => {
    cachedRewards = rewards;

    if (trackTarget) {
      trackTarget.innerHTML = '';
      if (!rewards.length) {
        trackTarget.innerHTML = '<p class="placeholder">No rewards configured yet.</p>';
      } else {
        rewards.forEach((reward) => {
          const card = document.createElement('div');
          card.className = 'reward-card';
          card.innerHTML = `
            <i class="fas fa-gift reward-icon"></i>
            <h3>${reward.title}</h3>
            <p>${reward.description || ''}</p>
            <small>${reward.pointsRequired} pts</small>
          `;
          trackTarget.appendChild(card);
        });
      }
    }

    if (gridTarget) {
      gridTarget.innerHTML = '';
      if (!rewards.length) {
        gridTarget.innerHTML = '<p class="placeholder">Rewards will appear here soon.</p>';
        return;
      }

      rewards.forEach((reward) => {
        const tile = document.createElement('article');
        tile.className = 'reward-card';
        tile.innerHTML = `
          <h4>${reward.title}</h4>
          <p>${reward.description || 'Exclusive community perk'}</p>
          <div class="reward-meta">
            <span>${reward.pointsRequired} pts</span>
            ${showCta ? `<button data-reward="${reward.id}" data-points="${reward.pointsRequired}" class="btn small">Redeem</button>` : ''}
          </div>
        `;
        gridTarget.appendChild(tile);
      });
    }
  };

  const loadRewards = async () => {
    try {
      const rewards = await request(`${API_BASE}/rewards`);
      renderRewards(rewards, {
        trackTarget: rewardTrack,
        gridTarget: dashboardRewards,
        showCta: !!dashboardRewards
      });
    } catch (error) {
      console.error('Failed to load rewards', error);
      if (rewardTrack) {
        rewardTrack.innerHTML = '<p class="placeholder error">Unable to load rewards.</p>';
      }
    }
  };
  loadRewards();

  if (cartList) {
    cartList.addEventListener('click', async (event) => {
      const button = event.target.closest('button[data-remove]');
      if (!button) return;
      if (!ensureAuth(cartStatus)) return;
      const foodId = Number(button.dataset.remove);
      try {
        await request(`${API_BASE}/cart/remove/${foodId}`, {
          method: 'DELETE',
          auth: true
        });
        notifyCart('Item removed from cart.');
        await loadCart();
      } catch (error) {
        notifyCart(error.message, 'error');
      }
    });
  }

  const loadCart = async () => {
    if (!cartList || !getToken()) return;
    try {
      const response = await request(`${API_BASE}/cart`, { auth: true });
      const items = response.cart || response;
      currentCart = items || [];
      renderCart(currentCart);
    } catch (error) {
      console.error('Failed to load cart', error);
      notifyCart('Unable to load cart right now.', 'error');
    }
  };

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', async () => {
      if (!ensureAuth(cartStatus)) return;
      if (!currentCart.length) {
        notifyCart('Your cart is empty.', 'error');
        return;
      }
      placeOrderBtn.disabled = true;
      placeOrderBtn.textContent = 'Placing...';
      try {
        const payload = {
          items: currentCart.map((item) => ({
            foodId: item.foodId,
            qty: item.qty
          }))
        };
        const response = await request(`${API_BASE}/orders`, {
          method: 'POST',
          auth: true,
          body: payload
        });
        const orderId = response.orderId || response.order?.id;
        notifyCart(`Order placed successfully${orderId ? ` (#${orderId})` : ''}!`);
        if (orderStatus) setStatus(orderStatus, 'Order placed successfully.');
        await Promise.all([loadCart(), loadOrders(), loadPoints(), loadProfile()]);
      } catch (error) {
        notifyCart(error.message, 'error');
      } finally {
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'Place Order';
      }
    });
  }

  const loadOrders = async () => {
    if (!orderList || !getToken()) return;
    try {
      const response = await request(`${API_BASE}/orders/my`, { auth: true });
      const orders = response.orders || response;
      renderOrders(orders);
    } catch (error) {
      console.error('Failed to load orders', error);
      if (orderStatus) {
        setStatus(orderStatus, 'Unable to load orders right now.', 'error');
      }
    }
  };

  if (dashboardRewards) {
    dashboardRewards.addEventListener('click', async (event) => {
      if (!event.target.matches('button[data-reward]')) return;
      if (!ensureAuth(rewardStatus)) return;
      const rewardId = Number(event.target.dataset.reward);
      try {
        await request(`${API_BASE}/rewards/redeem`, {
          method: 'POST',
          body: { rewardId },
          auth: true
        });
        setStatus(rewardStatus, 'Reward redeemed! Check your email for details.');
        await Promise.all([loadRewards(), loadPoints()]);
        await loadProfile();
      } catch (error) {
        setStatus(rewardStatus, error.message, 'error');
      }
    });
  }

  // Games
  const renderGames = (games) => {
    if (!gameGrid) return;
    gameGrid.innerHTML = '';
    if (!games.length) {
      gameGrid.innerHTML = `<p class="placeholder">Games will be available soon.</p>`;
      return;
    }

    games.forEach((game) => {
      const card = document.createElement('article');
      card.className = 'game-card';
      card.innerHTML = `
        ${game.iconUrl ? `<img src="${game.iconUrl.startsWith('http') ? game.iconUrl : '/uploads/' + game.iconUrl}" alt="${game.title}" onerror="this.style.display='none'">` : ''}
        <h3>${game.title}</h3>
        <p>${game.description || 'Play now and earn points.'}</p>
        <div class="game-card-footer">
          <span class="pill">${game.pointsPerPlay} pts</span>
          <a href="${game.url}" target="_blank" rel="noopener" class="btn">Play Now</a>
        </div>
      `;
      gameGrid.appendChild(card);
    });
  };

  const populateGameSelect = () => {
    if (!gameSelect) return;
    gameSelect.innerHTML = '<option value="">Select a game</option>';
    latestGames.forEach((game) => {
      const option = document.createElement('option');
      option.value = game.id;
      option.textContent = `${game.title} (${game.pointsPerPlay} pts)`;
      gameSelect.appendChild(option);
    });
  };

  const loadGames = async () => {
    try {
      const games = await request(`${API_BASE}/games`);
      latestGames = games || [];
      renderGames(latestGames);
      populateGameSelect();
    } catch (error) {
      console.error('Unable to load games', error);
      if (gameGrid) {
        gameGrid.innerHTML = '<p class="placeholder error">Unable to fetch games.</p>';
      }
    }
  };
  loadGames();

  if (gameSelect && gamePointsInput) {
    gameSelect.addEventListener('change', () => {
      const selected = latestGames.find((game) => game.id === Number(gameSelect.value));
      if (selected && selected.pointsPerPlay) {
        gamePointsInput.value = selected.pointsPerPlay;
      }
    });
  }

  if (gamePointsForm) {
    gamePointsForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!ensureAuth(gamePointsStatus)) return;
      if (!gameSelect.value) {
        setStatus(gamePointsStatus, 'Select a game to continue.', 'error');
        return;
      }

      try {
        await request(`${API_BASE}/points/add`, {
          method: 'POST',
          auth: true,
          body: {
            points: Number(gamePointsInput.value || 0),
            sourceType: 'game',
            sourceId: Number(gameSelect.value),
            note: `Logged score for ${gameSelect.options[gameSelect.selectedIndex].text}`
          }
        });
        setStatus(gamePointsStatus, 'Points added! Check your dashboard.');
        await Promise.all([loadPoints(), loadProfile()]);
      } catch (error) {
        setStatus(gamePointsStatus, error.message, 'error');
      }
    });
  }

  // Signup
  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      setStatus(signupStatus, '');
      const password = document.getElementById('signupPassword')?.value;
      const confirm = document.getElementById('confirmPassword')?.value;
      if (password !== confirm) {
        setStatus(signupStatus, 'Passwords do not match.', 'error');
        return;
      }

      const formData = new FormData(signupForm);
      try {
        const payload = {
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          password: formData.get('password')
        };
        const data = await request(`${API_BASE}/auth/signup`, { method: 'POST', body: payload });
        saveSession(data);
        setStatus(signupStatus, 'Account created! Redirecting…');
        setTimeout(() => (window.location.href = 'dashboard.html'), 900);
      } catch (error) {
        setStatus(signupStatus, error.message, 'error');
      }
    });
  }

  // Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      setStatus(loginStatus, '');
      const formData = new FormData(loginForm);
      try {
        const payload = {
          email: formData.get('email'),
          password: formData.get('password')
        };
        const data = await request(`${API_BASE}/auth/login`, { method: 'POST', body: payload });
        saveSession(data);
        setStatus(loginStatus, 'Welcome back! Redirecting…');
        setTimeout(() => (window.location.href = 'dashboard.html'), 700);
      } catch (error) {
        setStatus(loginStatus, error.message, 'error');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      window.location.href = 'login.html';
    });
  }

  // Donations
  const renderDonations = (target, donations, { emptyMessage = 'No donations yet.' } = {}) => {
    renderTimeline(
      target,
      donations,
      emptyMessage,
      (donation) => `
        <div class="list-head">
          <strong>${donation.food_type || donation.foodType}</strong>
          <span class="badge ${donation.status}">${donation.status}</span>
        </div>
        <small>${donation.quantity || ''} • ${formatDate(donation.created_at)}</small>
        <p>${donation.pickup_address || donation.pickupAddress || ''}</p>
      `
    );
  };

  const loadDonations = async () => {
    if (!getToken()) return;
    try {
      const donations = await request(`${API_BASE}/donations/me`, { auth: true });
      renderDonations(donationList, donations);
      if (dashboardDonations) {
        renderDonations(dashboardDonations, donations.slice(0, 3));
      }
      if (donationCountEl) {
        donationCountEl.textContent = donations.length;
      }
    } catch (error) {
      console.error('Failed to load donations', error);
    }
  };

  if (donationForm) {
    donationForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!ensureAuth(donationStatus)) return;
      const formData = new FormData(donationForm);
      const payload = Object.fromEntries(formData.entries());
      try {
        await request(`${API_BASE}/donations`, {
          method: 'POST',
          body: payload,
          auth: true
        });
        donationForm.reset();
        setStatus(donationStatus, 'Donation submitted! We will coordinate pickup soon.');
        await Promise.all([loadDonations(), loadPoints()]);
      } catch (error) {
        setStatus(donationStatus, error.message, 'error');
      }
    });
  }

  // Partner applications
  const renderPartnersList = (target, partners, { emptyMessage = 'No applications yet.' } = {}) => {
    renderTimeline(
      target,
      partners,
      emptyMessage,
      (partner) => `
        <div class="list-head">
          <strong>${partner.organization_name || partner.organizationName}</strong>
          <span class="badge ${partner.status}">${partner.status}</span>
        </div>
        <small>${partner.organization_type || partner.organizationType} • ${formatDate(partner.created_at)}</small>
        <p>${partner.location || ''}</p>
      `
    );
  };

  const loadPartners = async () => {
    if (!getToken()) return;
    try {
      const partners = await request(`${API_BASE}/partners/me`, { auth: true });
      renderPartnersList(partnerList, partners);
      if (dashboardPartners) {
        renderPartnersList(dashboardPartners, partners.slice(0, 3));
      }
      if (partnerCountEl) {
        partnerCountEl.textContent = partners.length;
      }
    } catch (error) {
      console.error('Failed to fetch partners', error);
    }
  };

  if (partnerForm) {
    partnerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!ensureAuth(partnerStatus)) return;
      const formData = new FormData(partnerForm);
      const payload = Object.fromEntries(formData.entries());
      try {
        await request(`${API_BASE}/partners`, {
          method: 'POST',
          body: payload,
          auth: true
        });
        partnerForm.reset();
        setStatus(partnerStatus, 'Application received! We will review it soon.');
        await loadPartners();
      } catch (error) {
        setStatus(partnerStatus, error.message, 'error');
      }
    });
  }

  // Points
  const loadPoints = async () => {
    if (!pointsHistoryList && !pointsBalanceEl) return;
    if (!getToken()) return;
    try {
      const result = await request(`${API_BASE}/points/me`, { auth: true });
      if (pointsBalanceEl) {
        pointsBalanceEl.textContent = result.balance ?? 0;
      }
      if (pointsHistoryList) {
        renderTimeline(
          pointsHistoryList,
          result.history,
          'No activity yet.',
          (entry) => `
            <div class="list-head">
              <strong>${entry.direction === 'debit' ? '-' : '+'}${entry.points} pts</strong>
              <span class="badge subtle">${entry.source_type}</span>
            </div>
            <small>${formatDate(entry.created_at)}</small>
            <p>${entry.note || ''}</p>
          `
        );
      }
    } catch (error) {
      console.error('Failed to load points', error);
    }
  };

  // Profile / dashboard
  const loadProfile = async () => {
    if (!getToken()) return;
    try {
      const response = await request(`${API_BASE}/auth/me`, { auth: true });
      const user = response?.user || response;
      if (!user) return;
      currentUser = user;
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      if (dashboardName) {
        dashboardName.textContent = user.name || 'Changemaker';
      }
      if (dashboardGreeting) {
        dashboardGreeting.textContent = `You have ${user.points || 0} points to redeem today.`;
      }
      if (pointsBalanceEl) {
        pointsBalanceEl.textContent = user.points || 0;
      }
    } catch (error) {
      console.error('Failed to load profile', error);
    }
  };

  const initializeDashboard = async () => {
    if (!dashboardPage) return;
    if (!getToken()) {
      window.location.href = 'login.html';
      return;
    }
    await loadProfile();
    await Promise.all([loadDonations(), loadPartners(), loadPoints(), loadCart(), loadOrders()]);
  };
  initializeDashboard();

  // Preload data for logged-in users even outside dashboard
  if (getToken() && (donationList || partnerList || cartList || orderList)) {
    loadProfile();
    if (donationList) loadDonations();
    if (partnerList) loadPartners();
    if (cartList) loadCart();
    if (orderList) loadOrders();
    loadPoints();
  }
});

// Password visibility toggle function (global for onclick handlers)
function togglePasswordVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  const icon = button.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}