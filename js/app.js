/* ============================================
   APP.JS - Main Application Controller
   3-tab layout: Home, IA, Social
   Settings panel from header gear icon
   Plant click → Customization page
   ============================================ */

(function () {
    'use strict';

    // ---- DOM References ----
    const DOM = {
        // Home page
        statusPill: document.getElementById('status-pill'),
        statusText: document.getElementById('status-text'),
        plantName: document.getElementById('plant-name'),
        plantSpecies: document.getElementById('plant-species'),
        healthScore: document.getElementById('health-score'),
        healthMessage: document.getElementById('health-message'),
        healthRingFill: document.getElementById('health-ring-fill'),
        dataCardsContainer: document.getElementById('data-cards-container'),
        miniChart: document.getElementById('mini-chart'),
        chartLabels: document.getElementById('chart-labels'),
        tipText: document.getElementById('tip-text'),
        lastUpdate: document.getElementById('last-update'),
        btnRefresh: document.getElementById('btn-refresh'),
        headerTitle: document.getElementById('header-title'),
        chartTabs: document.querySelectorAll('.chart-tab'),
        navItems: document.querySelectorAll('.nav-item'),
        careActionBtns: document.querySelectorAll('.care-btn-compact'),
        coinsDisplayHome: document.getElementById('coins-display-home'),

        // AI Quick Banner
        aiQuickBannerBtn: document.getElementById('ai-quick-banner-btn'),
        aiQuickTipText: document.getElementById('ai-quick-tip-text'),

        // Diagnostics
        diagnosticsSection: document.getElementById('diagnostics-section'),
        diagnosticsContainer: document.getElementById('diagnostics-container'),

        // Avatar (clickable)
        plantSvgContainer: document.getElementById('plant-svg-container'),
        avatarEditHint: document.getElementById('avatar-edit-hint'),
        btnBackCustomize: document.getElementById('btn-back-customize'),

        // Pages
        pages: document.querySelectorAll('.app-page'),

        // Settings panel
        btnSettings: document.getElementById('btn-settings'),
        settingsPanel: document.getElementById('settings-panel'),
        settingsOverlay: document.getElementById('settings-overlay'),
        btnCloseSettings: document.getElementById('btn-close-settings'),
        settingPlantName: document.getElementById('setting-plant-name'),
        settingPlantSpecies: document.getElementById('setting-plant-species'),
        btnSavePlantInfo: document.getElementById('btn-save-plant-info'),
        settingRefreshRate: document.getElementById('setting-refresh-rate'),
        settingAnimations: document.getElementById('setting-animations'),
        btnResetData: document.getElementById('btn-reset-data'),

        // Customization page
        customizeSubtabs: document.querySelectorAll('#customize-subtabs .care-subtab'),
        customizeSubtabContents: document.querySelectorAll('#page-customize .care-subtab-content'),
        customizePreviewSvg: document.getElementById('customize-preview-svg'),
        potColorPicker: document.getElementById('pot-color-picker'),
        potPatternPicker: document.getElementById('pot-pattern-picker'),
        potAccessoryPicker: document.getElementById('pot-accessory-picker'),
        scenePicker: document.getElementById('scene-picker'),

        // Shop
        shopCoins: document.getElementById('shop-coins'),
        shopItemsContainer: document.getElementById('shop-items-container'),
        achievementsContainer: document.getElementById('achievements-container'),

        // AI Page
        aiSpeciesName: document.getElementById('ai-species-name'),
        aiSpeciesScientific: document.getElementById('ai-species-scientific'),
        aiSpeciesTags: document.getElementById('ai-species-tags'),
        aiChatMessages: document.getElementById('ai-chat-messages'),
        aiChatInput: document.getElementById('ai-chat-input'),
        aiSendBtn: document.getElementById('ai-send-btn'),
        aiDiagnoseBtn: document.getElementById('ai-diagnose-btn'),
        aiActionChips: document.querySelectorAll('.ai-action-chip'),

        // Social
        socialFeed: document.getElementById('social-feed'),
        newPostText: document.getElementById('new-post-text'),
        btnNewPost: document.getElementById('btn-new-post'),
        storiesScroll: document.getElementById('stories-scroll'),
        moodBtns: document.querySelectorAll('.mood-btn'),

        // Toast
        toastContainer: document.getElementById('toast-container'),
    };

    // ---- State ----
    let activeChartMetric = 'humidity';
    let animationTimeout = null;
    let autoRefreshInterval = null;
    let currentPage = 'home';
    let careHistory = [];
    let careStreak = 0;
    let careDays = {};
    let socialPosts = [];
    let likedPosts = {};
    let coins = 999999;
    let unlockedItems = { colors: ['terracotta'], patterns: ['none'], accessories: ['none'], scenes: ['default'] };
    let currentScene = 'default';
    let selectedMood = 'happy';
    let aiChatHistory = [];

    // ---- Constants ----
    const HEALTH_MESSAGES = {
        healthy: ['Sua planta está muito bem! 🌿','Crescendo forte e saudável! 💪','Condições ideais detectadas! ✨'],
        sad: ['Precisa de atenção em breve 😟','Alguns valores fora do ideal ⚠️'],
        critical: ['Atenção urgente necessária! 🚨','Sua planta não está bem! ❌'],
    };
    const STATUS_LABELS = { healthy: 'Saudável', sad: 'Precisa de Atenção', critical: 'Estado Crítico' };
    const PAGE_TITLES = { home: 'Minha Planta', customize: 'Personalizar', ai: 'PlantIA', social: 'Comunidade' };

    const CARE_ACTIONS = {
        water:     { label: 'Rega realizada',     icon: 'bi-droplet-fill',  iconClass: 'water-icon',     emoji: '💧', coins: 5 },
        fertilize: { label: 'Adubação realizada',  icon: 'bi-flower2',      iconClass: 'fertilize-icon', emoji: '🌸', coins: 8 },
        rotate:    { label: 'Vaso girado',          icon: 'bi-arrow-repeat', iconClass: 'rotate-icon',    emoji: '🔄', coins: 3 },
        prune:     { label: 'Poda realizada',       icon: 'bi-scissors',     iconClass: 'prune-icon',     emoji: '✂️', coins: 6 },
    };

    const SCENES = {
        'default': { label: 'Padrão', emoji: '🏠', price: 0 },
        'garden':  { label: 'Jardim', emoji: '🌳', price: 30 },
        'beach':   { label: 'Praia',  emoji: '🏖️', price: 40 },
        'night':   { label: 'Noite',  emoji: '🌙', price: 25 },
        'rainbow': { label: 'Arco-íris', emoji: '🌈', price: 35 },
        'snow':    { label: 'Neve',   emoji: '❄️', price: 45 },
        'space':   { label: 'Espaço', emoji: '🚀', price: 60 },
        'cherry':  { label: 'Cerejeira', emoji: '🌸', price: 50 },
    };

    const SHOP_ITEMS = [
        { id: 'color-ocean',    type: 'colors',      key: 'ocean',      label: 'Vaso Oceano',    emoji: '🌊', price: 20, desc: 'Um vaso na cor do mar' },
        { id: 'color-rose',     type: 'colors',      key: 'rose',       label: 'Vaso Rosa',      emoji: '🌹', price: 20, desc: 'Cor de rosa' },
        { id: 'color-forest',   type: 'colors',      key: 'forest',     label: 'Vaso Floresta',  emoji: '🌲', price: 20, desc: 'Verde floresta' },
        { id: 'color-snow',     type: 'colors',      key: 'snow',       label: 'Vaso Neve',      emoji: '⬜', price: 15, desc: 'Branco elegante' },
        { id: 'color-midnight', type: 'colors',      key: 'midnight',   label: 'Meia-Noite',     emoji: '🌑', price: 25, desc: 'Escuro' },
        { id: 'color-gold',     type: 'colors',      key: 'gold',       label: 'Vaso Ouro',      emoji: '✨', price: 35, desc: 'Dourado' },
        { id: 'color-lavender', type: 'colors',      key: 'lavender',   label: 'Lavanda',        emoji: '💜', price: 25, desc: 'Lilás' },
        { id: 'pat-stripes',    type: 'patterns',    key: 'stripes',    label: 'Listras',        emoji: '📏', price: 15, desc: 'Listras verticais' },
        { id: 'pat-dots',       type: 'patterns',    key: 'dots',       label: 'Bolinhas',       emoji: '⚪', price: 15, desc: 'Bolinhas' },
        { id: 'pat-hearts',     type: 'patterns',    key: 'hearts',     label: 'Corações',       emoji: '💕', price: 20, desc: 'Corações' },
        { id: 'pat-zigzag',     type: 'patterns',    key: 'zigzag',     label: 'Zigzag',         emoji: '⚡', price: 18, desc: 'Zigzag' },
        { id: 'pat-stars',      type: 'patterns',    key: 'stars',      label: 'Estrelas',       emoji: '⭐', price: 22, desc: 'Estrelado' },
        { id: 'acc-bow',        type: 'accessories', key: 'bow',        label: 'Laço',           emoji: '🎀', price: 25, desc: 'Laço vermelho' },
        { id: 'acc-sunglasses', type: 'accessories', key: 'sunglasses', label: 'Óculos',         emoji: '😎', price: 30, desc: 'Estiloso' },
        { id: 'acc-hat',        type: 'accessories', key: 'hat',        label: 'Chapéu',         emoji: '🎩', price: 35, desc: 'Elegante' },
        { id: 'acc-crown',      type: 'accessories', key: 'crown',      label: 'Coroa',          emoji: '👑', price: 50, desc: 'Rainha do jardim' },
        { id: 'acc-scarf',      type: 'accessories', key: 'scarf',      label: 'Cachecol',       emoji: '🧣', price: 28, desc: 'Para frio' },
        { id: 'acc-flower',     type: 'accessories', key: 'flower_deco',label: 'Flor',           emoji: '🌺', price: 22, desc: 'Decorativa' },
        { id: 'sc-garden',      type: 'scenes',      key: 'garden',     label: 'Jardim',         emoji: '🌳', price: 30, desc: 'Um lindo jardim' },
        { id: 'sc-beach',       type: 'scenes',      key: 'beach',      label: 'Praia',          emoji: '🏖️', price: 40, desc: 'Vista pro mar' },
        { id: 'sc-night',       type: 'scenes',      key: 'night',      label: 'Noite',          emoji: '🌙', price: 25, desc: 'Sob as estrelas' },
        { id: 'sc-rainbow',     type: 'scenes',      key: 'rainbow',    label: 'Arco-Íris',      emoji: '🌈', price: 35, desc: 'Colorido' },
        { id: 'sc-snow',        type: 'scenes',      key: 'snow',       label: 'Neve',           emoji: '❄️', price: 45, desc: 'Inverno mágico' },
        { id: 'sc-space',       type: 'scenes',      key: 'space',      label: 'Espaço',         emoji: '🚀', price: 60, desc: 'No espaço!' },
        { id: 'sc-cherry',      type: 'scenes',      key: 'cherry',     label: 'Cerejeira',      emoji: '🌸', price: 50, desc: 'Pétalas' },
    ];

    const ACHIEVEMENTS = [
        { id: 'first-water',  label: 'Primeira Rega',   emoji: '💧', desc: 'Regou pela primeira vez',     condition: () => careHistory.some(c => c.action === 'water') },
        { id: 'streak-3',     label: '3 Dias Seguidos',  emoji: '🔥', desc: '3 dias cuidando',             condition: () => careStreak >= 3 },
        { id: 'streak-7',     label: '1 Semana!',        emoji: '🏆', desc: '7 dias cuidando',             condition: () => careStreak >= 7 },
        { id: 'first-post',   label: 'Influencer Verde', emoji: '📱', desc: 'Fez primeira publicação',     condition: () => socialPosts.some(p => p.isOwn) },
        { id: 'customizer',   label: 'Estilista',        emoji: '🎨', desc: 'Personalizou o vaso',         condition: () => PlantAvatar.getCustomization().potColor !== 'terracotta' },
        { id: 'coins-100',    label: 'Rico em Folhas',   emoji: '🪙', desc: 'Acumulou 100 moedas',         condition: () => coins >= 100 },
        { id: 'ai-user',      label: 'Tech Verde',       emoji: '🤖', desc: 'Consultou a PlantIA',         condition: () => aiChatHistory.length > 0 },
        { id: 'full-health',  label: 'Planta Perfeita',  emoji: '💚', desc: 'Alcançou 100% de saúde',      condition: () => PlantData.healthScore >= 95 },
    ];

    const FAKE_USERS = [
        { name: 'Ana Jardim', emoji: '👩‍🌾', badge: 'Jardineira' },
        { name: 'Pedro Verde', emoji: '🧑‍🌾', badge: 'Mestre Cactos' },
        { name: 'Julia Flor', emoji: '👩', badge: 'Tulipeira' },
        { name: 'Carlos Silva', emoji: '👨', badge: 'Novato' },
        { name: 'Maria Rosa', emoji: '👵', badge: 'Veterana' },
        { name: 'Lucas Bot', emoji: '🤖', badge: 'Bot Verde' },
    ];

    const FAKE_POSTS = [
        { text: 'Minha planta está linda hoje! 🌸 Acabei de regar e ela parece tão feliz.', mood: 'happy' },
        { text: 'Alguém sabe por que as folhas estão ficando amarelas? 😟', mood: 'worried' },
        { text: 'Novo vaso para minha suculenta! Ficou super fofo com as bolinhas 💕', mood: 'proud' },
        { text: 'Dia de adubação! Usando adubo orgânico caseiro 🌱', mood: 'happy' },
        { text: 'Meu cacto finalmente floresceu depois de 3 anos!! 🎉🌵', mood: 'celebrate' },
        { text: 'Dica: borrifar água nas folhas ajuda muito na umidade! 💧', mood: 'happy' },
        { text: 'Primeira vez cuidando de uma planta, deseje-me sorte! 🍀', mood: 'question' },
        { text: 'Minha samambaia está enorme! Ela adora o banheiro 🚿🌿', mood: 'proud' },
    ];

    const MOOD_EMOJIS = { happy: '😊', proud: '🤩', worried: '😟', question: '🤔', celebrate: '🥳' };


    // ---- Init ----
    function init() {
        loadSavedState();
        PlantData.init();
        DOM.plantName.textContent = PlantData.CONFIG.plantName;
        DOM.plantSpecies.textContent = PlantData.CONFIG.plantSpecies;
        DOM.settingPlantName.value = PlantData.CONFIG.plantName;
        DOM.settingPlantSpecies.value = PlantData.CONFIG.plantSpecies;

        renderAll();
        bindEvents();
        // startAutoRefresh(); // Desativado a pedido do usuário
        renderCustomizationPickers();
        updateCustomizePreview();
        generateFakeFeed();
        renderSocialFeed();
        renderStories();
        renderShop();
        renderAchievements();
        renderAIPage();
        renderScenePicker();
        updateAIQuickTip();
        updateCoinsDisplay();
    }


    // ---- State Persistence ----
    function loadSavedState() {
        try {
            const saved = localStorage.getItem('plantApp');
            if (saved) {
                const d = JSON.parse(saved);
                careHistory = d.careHistory || [];
                careStreak = d.careStreak || 0;
                careDays = d.careDays || {};
                socialPosts = d.socialPosts || [];
                likedPosts = d.likedPosts || {};
                coins = d.coins ?? 999999;
                if (coins < 999999) coins = 999999; // Garante moedas infinitas conforme pedido
                unlockedItems = d.unlockedItems || { colors: ['terracotta'], patterns: ['none'], accessories: ['none'], scenes: ['default'] };
                currentScene = d.currentScene || 'default';
                aiChatHistory = d.aiChatHistory || [];
                if (d.plantName) PlantData.CONFIG.plantName = d.plantName;
                if (d.plantSpecies) PlantData.CONFIG.plantSpecies = d.plantSpecies;
                if (d.customization) PlantAvatar.setCustomization(d.customization);
            }
        } catch (e) { /* ignore */ }
    }

    function saveState() {
        try {
            localStorage.setItem('plantApp', JSON.stringify({
                careHistory: careHistory.slice(0, 50), careStreak, careDays,
                socialPosts: socialPosts.slice(0, 30), likedPosts, coins, unlockedItems, currentScene,
                aiChatHistory: aiChatHistory.slice(-20),
                plantName: PlantData.CONFIG.plantName, plantSpecies: PlantData.CONFIG.plantSpecies,
                customization: PlantAvatar.getCustomization(),
            }));
        } catch (e) { /* ignore */ }
    }


    // ---- Rendering (Home) ----
    function renderAll() {
        const state = PlantData.plantState;
        PlantAvatar.render(state);
        renderStatus(state);
        renderHealthScore();
        renderDataCards();
        renderChart(activeChartMetric);
        renderTip(state);
        renderDiagnostics();
        updateTimestamp();
        animateCards();
        updateAIQuickTip();
    }

    function renderStatus(state) {
        DOM.statusPill.className = 'status-pill ' + state;
        DOM.statusText.textContent = STATUS_LABELS[state];
    }

    function renderHealthScore() {
        const score = PlantData.healthScore;
        const state = PlantData.plantState;
        animateValue(DOM.healthScore, parseInt(DOM.healthScore.textContent) || 0, score, 1200);
        const circumference = 2 * Math.PI * 52;
        DOM.healthRingFill.style.strokeDashoffset = circumference - (score / 100) * circumference;
        DOM.healthRingFill.style.stroke = { healthy: '#2ecc71', sad: '#e67e22', critical: '#e74c3c' }[state];
        const msgs = HEALTH_MESSAGES[state];
        DOM.healthMessage.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    }

    function renderDataCards() {
        const data = PlantData.currentData;
        let html = '';
        Object.keys(data).forEach((key, i) => {
            const d = data[key];
            const badgeText = d.status === 'good' ? 'Normal' : (d.status === 'warning' ? 'Atenção' : 'Crítico');
            const badgeIcon = d.status === 'good' ? 'bi-check-circle-fill' : (d.status === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-x-circle-fill');
            html += `<div class="col-6"><div class="glass-card data-card ${d.status}" style="animation-delay:${i*0.08}s"><div class="card-top"><div class="card-icon"><i class="bi ${d.icon}"></i></div><span class="card-badge"><i class="bi ${badgeIcon}"></i> ${badgeText}</span></div><div class="card-value">${d.value}<small>${d.unit}</small></div><div class="card-label">${d.label}</div><div class="card-progress"><div class="card-progress-fill" style="width:${d.percentage}%"></div></div></div></div>`;
        });
        DOM.dataCardsContainer.innerHTML = html;
    }

    function renderChart(metric) {
        const data = PlantData.weeklyHistory[metric];
        if (!data) return;
        const m = PlantData.METRICS[metric];
        DOM.miniChart.innerHTML = data.map(v => `<div class="chart-bar" style="height:${Math.max(8,(v/m.max)*100)}%"><span class="bar-tooltip">${v}${m.unit}</span></div>`).join('');
        DOM.chartLabels.innerHTML = PlantData.DAY_LABELS.map(d => `<span>${d}</span>`).join('');
    }

    function renderTip(state) {
        DOM.tipText.textContent = typeof PlantAI !== 'undefined' ? PlantAI.getQuickTip() : PlantData.getRandomTip(state);
    }

    function updateTimestamp() {
        const now = new Date();
        DOM.lastUpdate.textContent = `Atualizado às ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    }

    function updateAIQuickTip() {
        if (typeof PlantAI !== 'undefined' && DOM.aiQuickTipText)
            DOM.aiQuickTipText.textContent = PlantAI.getQuickTip();
    }

    function renderDiagnostics() {
        const diagnostics = PlantData.getSmartDiagnostics();
        if (!diagnostics.length) { DOM.diagnosticsSection.style.display = 'none'; return; }
        DOM.diagnosticsSection.style.display = 'block';
        DOM.diagnosticsContainer.innerHTML = diagnostics.map((d, i) => {
            const cls = d.severity === 'danger' ? 'danger-card' : 'warning-card';
            return `<div class="diagnostic-card ${cls}" style="animation-delay:${i*0.1}s"><div class="diagnostic-icon"><i class="bi ${d.icon}"></i></div><div class="diagnostic-info"><div class="diag-title">${d.title}</div><div class="diag-tip">${d.tip}</div><div class="diag-meta"><span>📊 ${d.currentValue}${d.unit}</span><span>🎯 ${d.idealRange}</span></div></div></div>`;
        }).join('');
    }


    // ---- Care Actions ----
    function handleCareAction(action) {
        const cfg = CARE_ACTIONS[action];
        if (!cfg) return;
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        careHistory.unshift({ action, label: cfg.label, icon: cfg.icon, iconClass: cfg.iconClass, time, date: now.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}), timestamp: Date.now() });
        careDays[now.toISOString().split('T')[0]] = true;
        calculateStreak();
        coins += cfg.coins;
        updateCoinsDisplay();
        const btn = document.getElementById('care-' + action);
        if (btn) { btn.classList.add('just-used'); setTimeout(() => btn.classList.remove('just-used'), 800); }
        renderAchievements();
        showToast(`${cfg.emoji} ${cfg.label}! +${cfg.coins}🪙`, 'success');
        saveState();
    }

    function calculateStreak() {
        const today = new Date();
        let streak = 0, d = new Date(today);
        for (let i = 0; i < 365; i++) {
            if (careDays[d.toISOString().split('T')[0]]) { streak++; d.setDate(d.getDate() - 1); } else break;
        }
        careStreak = streak;
    }

    function updateCoinsDisplay() {
        if (DOM.shopCoins) DOM.shopCoins.textContent = coins;
        if (DOM.coinsDisplayHome) DOM.coinsDisplayHome.textContent = coins;
    }


    // ---- Customization ----
    function renderCustomizationPickers() {
        const custom = PlantAvatar.getCustomization();
        // Colors
        let colorHTML = '';
        Object.entries(PlantAvatar.POT_COLORS).forEach(([key, val]) => {
            const unlocked = unlockedItems.colors.includes(key);
            colorHTML += `<div class="color-swatch ${custom.potColor===key?'selected':''} ${!unlocked?'locked':''}" data-color="${key}"><div class="swatch-circle" style="background:${val.main};">${!unlocked?'<i class="bi bi-lock-fill lock-icon"></i>':''}</div><span class="swatch-label">${val.label}</span></div>`;
        });
        DOM.potColorPicker.innerHTML = colorHTML;
        // Patterns
        DOM.potPatternPicker.innerHTML = Object.entries(PlantAvatar.POT_PATTERNS).map(([key, val]) => {
            const unlocked = unlockedItems.patterns.includes(key);
            return `<button class="pattern-option ${custom.potPattern===key?'selected':''} ${!unlocked?'locked':''}" data-pattern="${key}">${!unlocked?'🔒 ':''}${val.label}</button>`;
        }).join('');
        // Accessories
        DOM.potAccessoryPicker.innerHTML = Object.entries(PlantAvatar.POT_ACCESSORIES).map(([key, val]) => {
            const unlocked = unlockedItems.accessories.includes(key);
            const emoji = val.emoji || '❌';
            return `<button class="accessory-option ${custom.accessory===key?'selected':''} ${!unlocked?'locked':''}" data-accessory="${key}">${!unlocked?'<span class="acc-emoji">🔒</span>':`<span class="acc-emoji">${emoji}</span>`}${val.label}</button>`;
        }).join('');
    }

    function renderScenePicker() {
        if (!DOM.scenePicker) return;
        DOM.scenePicker.innerHTML = Object.entries(SCENES).map(([key, val]) => {
            const unlocked = unlockedItems.scenes.includes(key);
            return `<button class="scene-option ${currentScene===key?'selected':''} ${!unlocked?'locked':''}" data-scene="${key}"><span class="scene-emoji">${val.emoji}</span><span class="scene-label">${val.label}</span>${!unlocked?'<span class="scene-lock">🔒</span>':''}</button>`;
        }).join('');
    }

    function updateCustomizePreview() {
        DOM.customizePreviewSvg.innerHTML = PlantAvatar.generateSVG('healthy');
    }

    function handlePickerAction(type, key) {
        if (!unlockedItems[type].includes(key)) { showToast('🔒 Compre na loja!', 'warning'); return; }
        const update = {};
        if (type === 'colors') update.potColor = key;
        if (type === 'patterns') update.potPattern = key;
        if (type === 'accessories') update.accessory = key;
        if (type === 'scenes') { currentScene = key; renderScenePicker(); saveState(); showToast(`${SCENES[key].emoji} Cenário: ${SCENES[key].label}!`, 'success'); return; }
        PlantAvatar.setCustomization(update);
        renderCustomizationPickers(); updateCustomizePreview(); PlantAvatar.render(PlantData.plantState);
        saveState();
        showToast('✨ Personalização aplicada!', 'success');
    }


    // ---- Shop ----
    function renderShop() {
        updateCoinsDisplay();
        DOM.shopItemsContainer.innerHTML = SHOP_ITEMS.map(item => {
            const owned = unlockedItems[item.type] && unlockedItems[item.type].includes(item.key);
            return `<div class="shop-item-card ${owned?'owned':''}" data-item-id="${item.id}"><div class="shop-item-emoji">${item.emoji}</div><div class="shop-item-info"><div class="shop-item-name">${item.label}</div><div class="shop-item-desc">${item.desc}</div></div><div class="shop-item-action">${owned?'<span class="shop-owned-badge"><i class="bi bi-check-circle-fill"></i></span>':`<button class="shop-buy-btn" data-item-id="${item.id}"><span class="shop-price">${item.price}</span> 🪙</button>`}</div></div>`;
        }).join('');
    }

    function updateCoinsDisplay() {
        if (DOM.coinsDisplayHome) DOM.coinsDisplayHome.textContent = coins.toLocaleString();
        if (DOM.shopCoins) DOM.shopCoins.textContent = coins.toLocaleString();
    }

    function handleBuyItem(itemId) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return;
        if (unlockedItems[item.type]?.includes(item.key)) { showToast('✅ Já tem!', 'info'); return; }
        if (coins < item.price) { showToast(`🪙 Precisa de ${item.price} moedas (tem ${coins})`, 'warning'); return; }
        coins -= item.price;
        if (!unlockedItems[item.type]) unlockedItems[item.type] = [];
        unlockedItems[item.type].push(item.key);
        updateCoinsDisplay(); renderShop(); renderCustomizationPickers(); renderScenePicker(); renderAchievements(); saveState();
        showToast(`🎉 ${item.emoji} ${item.label} desbloqueado!`, 'success');
    }

    function renderAchievements() {
        if (!DOM.achievementsContainer) return;
        DOM.achievementsContainer.innerHTML = ACHIEVEMENTS.map(a => {
            const ok = a.condition();
            return `<div class="achievement-card ${ok?'unlocked':'locked'}"><div class="achievement-emoji">${ok?a.emoji:'🔒'}</div><div class="achievement-info"><div class="achievement-name">${a.label}</div><div class="achievement-desc">${a.desc}</div></div>${ok?'<i class="bi bi-check-circle-fill achievement-check"></i>':''}</div>`;
        }).join('');
    }


    // ---- AI Page ----
    function renderAIPage() {
        if (!DOM.aiSpeciesName) return;
        DOM.aiSpeciesName.textContent = PlantData.CONFIG.plantName;
        DOM.aiSpeciesScientific.textContent = PlantData.CONFIG.plantSpecies;
        const info = typeof PlantAI !== 'undefined' ? PlantAI.getSpeciesCard() : null;
        if (info && DOM.aiSpeciesTags)
            DOM.aiSpeciesTags.innerHTML = `<span class="species-tag"><i class="bi bi-geo-alt"></i> ${info.origin}</span><span class="species-tag"><i class="bi bi-sun"></i> Luz indireta</span><span class="species-tag"><i class="bi bi-droplet"></i> Solo úmido</span><span class="species-tag">${info.toxicity.includes('Não')?'🐾 Pet-friendly':'⚠️ Tóxica'}</span>`;
        renderAIChatHistory();
    }

    function renderAIChatHistory() {
        if (!DOM.aiChatMessages) return;
        if (!aiChatHistory.length) {
            DOM.aiChatMessages.innerHTML = `<div class="ai-welcome-msg"><div class="ai-welcome-avatar"><i class="bi bi-robot"></i></div><h3>Olá! Sou a PlantIA 🌿</h3><p>Posso ajudar com diagnósticos, dicas e informações sobre a sua planta. Toque nos botões rápidos ou digite sua pergunta!</p></div>`;
            return;
        }
        DOM.aiChatMessages.innerHTML = aiChatHistory.map(msg => msg.role === 'user'
            ? `<div class="chat-bubble user-bubble"><div class="bubble-content">${msg.text}</div></div>`
            : `<div class="chat-bubble ai-bubble"><div class="ai-bubble-avatar"><i class="bi bi-robot"></i></div><div class="bubble-content">${msg.html||msg.text}</div></div>`
        ).join('');
        DOM.aiChatMessages.scrollTop = DOM.aiChatMessages.scrollHeight;
    }

    function handleAISend() {
        const text = DOM.aiChatInput.value.trim();
        if (!text) return;
        aiChatHistory.push({ role: 'user', text });
        DOM.aiChatInput.value = '';
        renderAIChatHistory();
        showAIThinking();
        setTimeout(() => {
            const r = PlantAI.answerQuestion(text);
            aiChatHistory.push({ role: 'ai', text: r, html: PlantAI.formatResponse(r) });
            renderAIChatHistory(); renderAchievements(); saveState();
        }, 800 + Math.random() * 1200);
    }

    function handleAIDiagnose() {
        aiChatHistory.push({ role: 'user', text: '🔍 Diagnóstico Completo' });
        renderAIChatHistory(); showAIThinking();
        setTimeout(() => {
            const r = PlantAI.generateDiagnosis();
            aiChatHistory.push({ role: 'ai', text: r, html: PlantAI.formatResponse(r) });
            renderAIChatHistory(); renderAchievements(); saveState();
        }, 1500 + Math.random() * 1000);
    }

    function showAIThinking() {
        DOM.aiChatMessages.insertAdjacentHTML('beforeend', `<div class="chat-bubble ai-bubble thinking-bubble" id="ai-thinking"><div class="ai-bubble-avatar"><i class="bi bi-robot"></i></div><div class="bubble-content"><div class="thinking-dots"><span></span><span></span><span></span></div></div></div>`);
        DOM.aiChatMessages.scrollTop = DOM.aiChatMessages.scrollHeight;
    }


    // ---- Social ----
    function renderStories() {
        if (!DOM.storiesScroll) return;
        let html = `<div class="story-item your-story"><div class="story-avatar-wrapper"><div class="story-avatar your-story-avatar">🌱</div><div class="story-add-icon">+</div></div><span class="story-name">Você</span></div>`;
        FAKE_USERS.forEach(u => {
            html += `<div class="story-item ${Math.random()>0.3?'has-story':''}"><div class="story-avatar-wrapper"><div class="story-avatar">${u.emoji}</div></div><span class="story-name">${u.name.split(' ')[0]}</span></div>`;
        });
        DOM.storiesScroll.innerHTML = html;
    }

    function generateFakeFeed() {
        if (socialPosts.length > 0) return;
        const now = Date.now();
        const potColors = ['terracotta','ocean','rose','forest','gold','midnight','lavender','snow'];
        const accs = ['none','sunglasses','bow','crown','hat','none','scarf','flower_deco'];
        FAKE_POSTS.forEach((p, i) => {
            const u = FAKE_USERS[i % FAKE_USERS.length];
            socialPosts.push({ id: 'fake-'+i, username: u.name, emoji: u.emoji, badge: u.badge, text: p.text, mood: p.mood,
                plantState: i%3===2?'sad':'healthy', potColor: potColors[i%potColors.length], accessory: accs[i%accs.length],
                likes: Math.floor(Math.random()*30)+5, comments: [], timestamp: now-(i*3600000*(Math.random()*5+1)), isOwn: false });
        });
    }

    function renderSocialFeed() {
        if (!socialPosts.length) { DOM.socialFeed.innerHTML = '<div class="empty-state"><i class="bi bi-people"></i><p>Nenhuma publicação.<br>Seja o primeiro!</p></div>'; return; }
        const sorted = [...socialPosts].sort((a,b) => b.timestamp - a.timestamp);
        DOM.socialFeed.innerHTML = sorted.map(post => {
            const liked = likedPosts[post.id];
            const svg = PlantAvatar.generateSVG(post.plantState||'healthy', { potColor: post.potColor||'terracotta', potPattern: post.potPattern||'none', accessory: post.accessory||'none' });
            const comments = post.comments||[];
            return `<div class="post-card"><div class="post-header"><div class="post-avatar">${post.emoji}</div><div class="post-user-info"><div class="post-username">${post.username} ${MOOD_EMOJIS[post.mood]||''}</div><div class="post-time">${getTimeAgo(post.timestamp)}</div></div><span class="post-badge">${post.badge||'🌱'}</span></div><div class="post-plant-preview">${svg}</div><div class="post-text">${post.text}</div><div class="post-stats"><span>${post.likes+(liked?1:0)} curtidas</span><span>${comments.length} comentários</span></div><div class="post-actions"><button class="post-action-btn ${liked?'liked':''}" data-post-id="${post.id}" data-action="like"><i class="bi ${liked?'bi-heart-fill':'bi-heart'}"></i><span>${liked?'Curtido':'Curtir'}</span></button><button class="post-action-btn" data-post-id="${post.id}" data-action="comment"><i class="bi bi-chat"></i><span>Comentar</span></button><button class="post-action-btn" data-post-id="${post.id}" data-action="share"><i class="bi bi-share"></i><span>Compartilhar</span></button></div><div class="post-comments-section" id="comments-${post.id}" style="display:none"><div class="post-comments-list" id="comments-list-${post.id}">${renderComments(comments)}</div><div class="post-comment-input-row"><input type="text" class="post-comment-input" id="comment-input-${post.id}" placeholder="Comentar..."><button class="post-comment-send" data-post-id="${post.id}"><i class="bi bi-send-fill"></i></button></div></div></div>`;
        }).join('');

        // Bind
        DOM.socialFeed.querySelectorAll('.post-action-btn').forEach(b => b.addEventListener('click', handlePostAction));
        DOM.socialFeed.querySelectorAll('.post-comment-send').forEach(b => b.addEventListener('click', handleSendComment));
        DOM.socialFeed.querySelectorAll('.post-comment-input').forEach(inp => inp.addEventListener('keydown', e => { if(e.key==='Enter') handleSendComment({currentTarget:{dataset:{postId:inp.id.replace('comment-input-','')}}}) }));
    }

    function renderComments(comments) {
        if (!comments?.length) return '<div class="no-comments">Nenhum comentário</div>';
        return comments.map(c => `<div class="comment-item"><span class="comment-avatar">${c.emoji||'🌱'}</span><div class="comment-content"><strong>${c.username}</strong><span>${c.text}</span></div><span class="comment-time">${getTimeAgo(c.timestamp)}</span></div>`).join('');
    }

    function handleNewPost() {
        const text = DOM.newPostText.value.trim();
        if (!text) { showToast('📝 Escreva algo!', 'warning'); return; }
        const c = PlantAvatar.getCustomization();
        socialPosts.unshift({ id: 'user-'+Date.now(), username: PlantData.CONFIG.plantName+' 🌱', emoji: '🌱', badge: 'Você', text, mood: selectedMood, plantState: PlantData.plantState, potColor: c.potColor, potPattern: c.potPattern, accessory: c.accessory, likes: 0, comments: [], timestamp: Date.now(), isOwn: true });
        DOM.newPostText.value = '';
        coins += 10; updateCoinsDisplay(); renderSocialFeed(); renderAchievements(); saveState();
        showToast('📱 Publicado! +10🪙', 'success');
    }

    function handlePostAction(e) {
        const id = e.currentTarget.dataset.postId, act = e.currentTarget.dataset.action;
        if (act === 'like') { likedPosts[id] ? delete likedPosts[id] : likedPosts[id] = true; renderSocialFeed(); saveState(); }
        else if (act === 'comment') {
            const sec = document.getElementById('comments-'+id);
            if (sec) { sec.style.display = sec.style.display==='none'?'block':'none'; const inp = document.getElementById('comment-input-'+id); if(inp && sec.style.display==='block') inp.focus(); }
        }
        else if (act === 'share') showToast('📤 Compartilhado!', 'success');
    }

    function handleSendComment(e) {
        const id = e.currentTarget.dataset.postId, inp = document.getElementById('comment-input-'+id);
        if (!inp) return;
        const text = inp.value.trim(); if (!text) return;
        const post = socialPosts.find(p => p.id===id);
        if (post) {
            if (!post.comments) post.comments = [];
            post.comments.push({ username: PlantData.CONFIG.plantName, emoji: '🌱', text, timestamp: Date.now() });
            inp.value = '';
            setTimeout(() => {
                const u = FAKE_USERS[Math.floor(Math.random()*FAKE_USERS.length)];
                const replies = ['Que linda! 🌿💚','Adorei! 😍','Parabéns! 👏','A minha também! 🌱','Muito bonita! 🤩','Maravilhosa! ✨'];
                post.comments.push({ username: u.name, emoji: u.emoji, text: replies[Math.floor(Math.random()*replies.length)], timestamp: Date.now() });
                renderSocialFeed(); const sec=document.getElementById('comments-'+id); if(sec) sec.style.display='block'; saveState();
            }, 1500+Math.random()*2000);
            renderSocialFeed(); const sec=document.getElementById('comments-'+id); if(sec) sec.style.display='block'; saveState();
            showToast('💬 Comentário!', 'success');
        }
    }

    function getTimeAgo(ts) {
        const mins = Math.floor((Date.now()-ts)/60000);
        if (mins < 1) return 'Agora';
        if (mins < 60) return mins+' min';
        const h = Math.floor(mins/60);
        if (h < 24) return h+'h atrás';
        return Math.floor(h/24)+'d atrás';
    }


    // ---- Settings Panel ----
    function openSettings() { DOM.settingsPanel.classList.add('open'); DOM.settingsOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function closeSettings() { DOM.settingsPanel.classList.remove('open'); DOM.settingsOverlay.classList.remove('open'); document.body.style.overflow = ''; }

    function handleSavePlantInfo() {
        const name = DOM.settingPlantName.value.trim(), species = DOM.settingPlantSpecies.value.trim();
        if (name) { PlantData.CONFIG.plantName = name; DOM.plantName.textContent = name; }
        if (species) { PlantData.CONFIG.plantSpecies = species; DOM.plantSpecies.textContent = species; }
        renderAIPage(); saveState(); showToast('🌱 Salvo!', 'success');
    }

    function handleResetData() {
        if (!confirm('Resetar todos os dados?')) return;
        localStorage.removeItem('plantApp');
        careHistory=[]; careStreak=0; careDays={}; socialPosts=[]; likedPosts={}; coins=999999;
        unlockedItems={colors:['terracotta'],patterns:['none'],accessories:['none'],scenes:['default']};
        currentScene='default'; aiChatHistory=[];
        PlantData.CONFIG.plantName='Samambaia'; PlantData.CONFIG.plantSpecies='Nephrolepis exaltata';
        DOM.settingPlantName.value='Samambaia'; DOM.settingPlantSpecies.value='Nephrolepis exaltata';
        DOM.plantName.textContent='Samambaia'; DOM.plantSpecies.textContent='Nephrolepis exaltata';
        PlantAvatar.setCustomization({potColor:'terracotta',potPattern:'none',accessory:'none'});
        PlantData.refresh(); renderAll(); renderCustomizationPickers(); updateCustomizePreview();
        generateFakeFeed(); renderSocialFeed(); renderStories(); renderShop(); renderAchievements(); renderAIPage(); renderScenePicker();
        updateCoinsDisplay();
        showToast('🔄 Resetado!', 'warning');
    }


    // ---- Navigation ----
    function navigateTo(page) {
        currentPage = page;
        DOM.pages.forEach(p => p.classList.remove('active'));
        const target = document.getElementById('page-' + page);
        if (target) { target.classList.add('active'); target.style.animation='none'; target.offsetHeight; target.style.animation=''; }
        // For customize page (not in nav), deselect all nav items
        if (page === 'customize') {
            DOM.navItems.forEach(i => i.classList.remove('active'));
        } else {
            DOM.navItems.forEach(i => i.classList.toggle('active', i.dataset.page === page));
        }
        DOM.headerTitle.textContent = PAGE_TITLES[page] || 'Minha Planta';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (page === 'ai') renderAIPage();
        if (page === 'social') { renderSocialFeed(); renderStories(); }
        if (page === 'customize') { updateCustomizePreview(); renderCustomizationPickers(); renderShop(); renderAchievements(); renderScenePicker(); }
        if (navigator.vibrate) navigator.vibrate(10);
    }


    // ---- Toast ----
    function showToast(msg, type = 'info') {
        const icons = { success: 'bi-check-circle-fill', info: 'bi-info-circle-fill', warning: 'bi-exclamation-triangle-fill' };
        
        // Limpa notificações anteriores para não acumular
        DOM.toastContainer.innerHTML = '';
        
        const t = document.createElement('div');
        t.className = `toast-msg ${type}`;
        t.innerHTML = `<i class="bi ${icons[type]||icons.info}"></i><span>${msg}</span>`;
        DOM.toastContainer.appendChild(t);
        setTimeout(() => { 
            if (t.parentElement) {
                t.style.animation = 'toastOut 0.3s ease forwards'; 
                setTimeout(() => t.remove(), 300); 
            }
        }, 2500);
    }


    // ---- Auto Refresh ----
    function startAutoRefresh() {
        // Desativado: o usuário prefere que a planta não atualize sozinha
        return;
    }


    // ---- Animations ----
    function animateCards() {
        if (animationTimeout) clearTimeout(animationTimeout);
        const cards = DOM.dataCardsContainer.querySelectorAll('.data-card');
        cards.forEach((card, i) => {
            card.style.opacity = '0'; card.style.transform = 'translateY(20px)';
            animationTimeout = setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1'; card.style.transform = 'translateY(0)';
            }, i * 100);
        });
    }

    function animateValue(el, start, end, dur) {
        const t0 = performance.now();
        function update(t) {
            const p = Math.min((t-t0)/dur, 1);
            el.textContent = Math.round(start + (end-start) * (1 - Math.pow(1-p, 3)));
            if (p < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }


    // ---- Event Binding ----
    function bindEvents() {
        // Header
        DOM.btnSettings.addEventListener('click', openSettings);
        DOM.settingsOverlay.addEventListener('click', closeSettings);
        DOM.btnCloseSettings.addEventListener('click', closeSettings);
        DOM.btnRefresh.addEventListener('click', handleRefresh);

        // Navigation (3 tabs)
        DOM.navItems.forEach(i => i.addEventListener('click', () => navigateTo(i.dataset.page)));

        // Plant avatar click → customize page
        DOM.plantSvgContainer.addEventListener('click', () => navigateTo('customize'));
        DOM.plantSvgContainer.addEventListener('keydown', e => { if(e.key==='Enter') navigateTo('customize'); });

        // Back button from customize page
        if (DOM.btnBackCustomize) DOM.btnBackCustomize.addEventListener('click', () => navigateTo('home'));

        // Chart tabs
        DOM.chartTabs.forEach(t => t.addEventListener('click', e => {
            activeChartMetric = e.currentTarget.dataset.metric;
            DOM.chartTabs.forEach(x => x.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderChart(activeChartMetric);
        }));

        // Care action buttons
        DOM.careActionBtns.forEach(b => b.addEventListener('click', () => handleCareAction(b.dataset.action)));

        // AI Quick Banner → navigate to AI page
        if (DOM.aiQuickBannerBtn) DOM.aiQuickBannerBtn.addEventListener('click', () => navigateTo('ai'));

        // AI Chat
        if (DOM.aiSendBtn) DOM.aiSendBtn.addEventListener('click', handleAISend);
        if (DOM.aiChatInput) DOM.aiChatInput.addEventListener('keydown', e => { if(e.key==='Enter') handleAISend(); });
        if (DOM.aiDiagnoseBtn) DOM.aiDiagnoseBtn.addEventListener('click', handleAIDiagnose);
        DOM.aiActionChips.forEach(c => c.addEventListener('click', () => { DOM.aiChatInput.value = c.dataset.question; handleAISend(); }));

        // Social
        DOM.btnNewPost.addEventListener('click', handleNewPost);
        DOM.newPostText.addEventListener('keydown', e => { if(e.key==='Enter') handleNewPost(); });
        DOM.moodBtns.forEach(b => b.addEventListener('click', () => { DOM.moodBtns.forEach(x=>x.classList.remove('active')); b.classList.add('active'); selectedMood=b.dataset.mood; }));

        // Settings
        DOM.btnSavePlantInfo.addEventListener('click', handleSavePlantInfo);
        DOM.btnResetData.addEventListener('click', handleResetData);
        DOM.settingRefreshRate.addEventListener('change', () => { startAutoRefresh(); showToast('⚙️ Atualização alterada!', 'info'); });
        DOM.settingAnimations.addEventListener('change', e => { document.body.classList.toggle('no-animations', !e.target.checked); });

        // Customize sub-tabs
        DOM.customizeSubtabs.forEach(tab => tab.addEventListener('click', () => {
            const st = tab.dataset.subtab;
            DOM.customizeSubtabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            DOM.customizeSubtabContents.forEach(c => c.classList.remove('active'));
            document.getElementById('subtab-'+st).classList.add('active');
            if (st === 'customize-look') updateCustomizePreview();
            if (st === 'customize-shop') { renderShop(); renderAchievements(); }
        }));

        // Customization pickers (event delegation)
        DOM.potColorPicker.addEventListener('click', e => { const s = e.target.closest('.color-swatch'); if(s) handlePickerAction('colors', s.dataset.color); });
        DOM.potPatternPicker.addEventListener('click', e => { const o = e.target.closest('.pattern-option'); if(o) handlePickerAction('patterns', o.dataset.pattern); });
        DOM.potAccessoryPicker.addEventListener('click', e => { const o = e.target.closest('.accessory-option'); if(o) handlePickerAction('accessories', o.dataset.accessory); });
        if (DOM.scenePicker) DOM.scenePicker.addEventListener('click', e => { const o = e.target.closest('.scene-option'); if(o) handlePickerAction('scenes', o.dataset.scene); });

        // Shop buy
        if (DOM.shopItemsContainer) DOM.shopItemsContainer.addEventListener('click', e => { const b = e.target.closest('.shop-buy-btn'); if(b) handleBuyItem(b.dataset.itemId); });

        // Keyboard
        document.addEventListener('keydown', e => { if(e.key==='Escape') closeSettings(); });

        // Swipe refresh
        let touchY = 0;
        document.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
        document.addEventListener('touchend', e => { if(e.changedTouches[0].clientY - touchY > 100 && window.scrollY === 0) handleRefresh(); }, { passive: true });
    }

    function handleRefresh() {
        DOM.btnRefresh.classList.add('spinning');
        setTimeout(() => DOM.btnRefresh.classList.remove('spinning'), 800);
        
        // Ciclo de estados para o sorteio manual
        const modes = ['healthy', 'sad', 'critical', 'mixed'];
        const curMode = PlantData._lastMode || 'healthy';
        const nextMode = modes[(modes.indexOf(curMode) + 1) % modes.length];
        PlantData._lastMode = nextMode;
        
        PlantData.refresh(nextMode);
        renderAll();
        
        const stateLabels = { healthy: 'Saudável', sad: 'Atenção', critical: 'Crítico', mixed: 'Aleatório' };
        showToast(`🔄 Simulação: ${stateLabels[nextMode]}`, 'info');
    }

    // ---- Boot ----
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();
