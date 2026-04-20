/* ============================================
   APP.JS - Main Application Controller
   Orchestrates data, avatar, and UI rendering
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

        // Pages
        pages: document.querySelectorAll('.app-page'),
        pageHome: document.getElementById('page-home'),
        pageStats: document.getElementById('page-stats'),
        pageCare: document.getElementById('page-care'),
        pageSettings: document.getElementById('page-settings'),

        // Side menu
        btnMenu: document.getElementById('btn-menu'),
        sideMenu: document.getElementById('side-menu'),
        menuOverlay: document.getElementById('menu-overlay'),
        menuLinks: document.querySelectorAll('.menu-link'),

        // Stats page
        statsAvgHealth: document.getElementById('stats-avg-health'),
        statsBestMetric: document.getElementById('stats-best-metric'),
        statsAlerts: document.getElementById('stats-alerts'),
        statsDetailList: document.getElementById('stats-detail-list'),
        statsMiniChart: document.getElementById('stats-mini-chart'),
        statsChartLabels: document.getElementById('stats-chart-labels'),
        statsChartY: document.getElementById('stats-chart-y'),
        statsChartLegend: document.getElementById('stats-chart-legend'),
        chartTabsStats: document.querySelectorAll('.chart-tab-stats'),

        // Care page
        careLog: document.getElementById('care-log'),
        careStreak: document.getElementById('care-streak'),
        streakCalendar: document.getElementById('streak-calendar'),
        careActionCards: document.querySelectorAll('.care-action-card'),

        // Settings
        settingPlantName: document.getElementById('setting-plant-name'),
        settingPlantSpecies: document.getElementById('setting-plant-species'),
        btnSavePlantInfo: document.getElementById('btn-save-plant-info'),
        settingRefreshRate: document.getElementById('setting-refresh-rate'),
        settingAnimations: document.getElementById('setting-animations'),
        btnResetData: document.getElementById('btn-reset-data'),

        // Toast
        toastContainer: document.getElementById('toast-container'),
    };

    // ---- State ----
    let activeChartMetric = 'humidity';
    let statsChartMetric = 'humidity';
    let animationTimeout = null;
    let autoRefreshInterval = null;
    let currentPage = 'home';
    let careHistory = [];
    let careStreak = 0;
    let careDays = {};

    // ---- Health Messages ----
    const HEALTH_MESSAGES = {
        healthy: [
            'Sua planta está muito bem! 🌿',
            'Crescendo forte e saudável! 💪',
            'Condições ideais detectadas! ✨',
            'Tudo perfeito por aqui! 🌟',
        ],
        sad: [
            'Precisa de atenção em breve 😟',
            'Alguns valores fora do ideal ⚠️',
            'Ajuste os cuidados, por favor 🔧',
        ],
        critical: [
            'Atenção urgente necessária! 🚨',
            'Sua planta não está bem! ❌',
            'Cuide dela agora! ⚡',
        ],
    };

    const STATUS_LABELS = {
        healthy: 'Saudável',
        sad: 'Precisa de Atenção',
        critical: 'Estado Crítico',
    };

    const PAGE_TITLES = {
        home: 'Minha Planta',
        stats: 'Estatísticas',
        care: 'Cuidar',
        settings: 'Configurações',
    };

    const CARE_ACTIONS = {
        water: { label: 'Rega realizada', icon: 'bi-droplet-fill', iconClass: 'water-icon', emoji: '💧' },
        fertilize: { label: 'Adubação realizada', icon: 'bi-flower2', iconClass: 'fertilize-icon', emoji: '🌸' },
        rotate: { label: 'Vaso girado', icon: 'bi-arrow-repeat', iconClass: 'rotate-icon', emoji: '🔄' },
        prune: { label: 'Poda realizada', icon: 'bi-scissors', iconClass: 'prune-icon', emoji: '✂️' },
    };


    // ---- Initialization ----

    function init() {
        // Load saved state
        loadSavedState();

        // Initialize data
        PlantData.init();

        // Set plant info
        DOM.plantName.textContent = PlantData.CONFIG.plantName;
        DOM.plantSpecies.textContent = PlantData.CONFIG.plantSpecies;
        DOM.settingPlantName.value = PlantData.CONFIG.plantName;
        DOM.settingPlantSpecies.value = PlantData.CONFIG.plantSpecies;

        // Render everything
        renderAll();

        // Bind events
        bindEvents();

        // Start auto-refresh
        startAutoRefresh();

        // Render streak calendar
        renderStreakCalendar();
    }


    // ---- State Persistence ----

    function loadSavedState() {
        try {
            const saved = localStorage.getItem('plantApp');
            if (saved) {
                const data = JSON.parse(saved);
                careHistory = data.careHistory || [];
                careStreak = data.careStreak || 0;
                careDays = data.careDays || {};
                if (data.plantName) PlantData.CONFIG.plantName = data.plantName;
                if (data.plantSpecies) PlantData.CONFIG.plantSpecies = data.plantSpecies;
            }
        } catch (e) {
            // ignore parse errors
        }
    }

    function saveState() {
        try {
            localStorage.setItem('plantApp', JSON.stringify({
                careHistory: careHistory.slice(0, 50), // keep last 50
                careStreak,
                careDays,
                plantName: PlantData.CONFIG.plantName,
                plantSpecies: PlantData.CONFIG.plantSpecies,
            }));
        } catch (e) {
            // ignore
        }
    }


    // ---- Rendering (Home) ----

    function renderAll() {
        const state = PlantData.plantState;

        renderAvatar(state);
        renderStatus(state);
        renderHealthScore();
        renderDataCards();
        renderChart(activeChartMetric);
        renderTip(state);
        updateTimestamp();

        // Staggered card animations
        animateCards();

        // Also update stats if on stats page
        if (currentPage === 'stats') {
            renderStatsPage();
        }
    }

    function renderAvatar(state) {
        PlantAvatar.render(state);
    }

    function renderStatus(state) {
        DOM.statusPill.className = 'status-pill ' + state;
        DOM.statusText.textContent = STATUS_LABELS[state];
    }

    function renderHealthScore() {
        const score = PlantData.healthScore;
        const state = PlantData.plantState;

        // Animate number
        animateValue(DOM.healthScore, parseInt(DOM.healthScore.textContent) || 0, score, 1200);

        // Update ring
        const circumference = 2 * Math.PI * 52; // r=52
        const offset = circumference - (score / 100) * circumference;
        DOM.healthRingFill.style.strokeDashoffset = offset;

        // Ring color based on state
        const colors = {
            healthy: '#2ecc71',
            sad: '#e67e22',
            critical: '#e74c3c',
        };
        DOM.healthRingFill.style.stroke = colors[state];

        // Message
        const messages = HEALTH_MESSAGES[state];
        DOM.healthMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
    }

    function renderDataCards() {
        const data = PlantData.currentData;
        let html = '';

        Object.keys(data).forEach((key, index) => {
            const d = data[key];
            const badgeText = d.status === 'good' ? 'Normal' : (d.status === 'warning' ? 'Atenção' : 'Crítico');
            const badgeIcon = d.status === 'good' ? 'bi-check-circle-fill' : (d.status === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-x-circle-fill');

            html += `
                <div class="col-6">
                    <div class="glass-card data-card ${d.status}" style="animation-delay: ${index * 0.08}s">
                        <div class="card-top">
                            <div class="card-icon">
                                <i class="bi ${d.icon}"></i>
                            </div>
                            <span class="card-badge">
                                <i class="bi ${badgeIcon}"></i> ${badgeText}
                            </span>
                        </div>
                        <div class="card-value">
                            ${d.value}<small>${d.unit}</small>
                        </div>
                        <div class="card-label">${d.label}</div>
                        <div class="card-progress">
                            <div class="card-progress-fill" style="width: ${d.percentage}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        DOM.dataCardsContainer.innerHTML = html;
    }

    function renderChart(metric, chartEl, labelsEl) {
        const history = PlantData.weeklyHistory;
        const data = history[metric];
        if (!data) return;

        const targetChart = chartEl || DOM.miniChart;
        const targetLabels = labelsEl || DOM.chartLabels;
        const metricConfig = PlantData.METRICS[metric];

        let barsHTML = '';
        data.forEach((val, i) => {
            const heightPercent = (val / metricConfig.max) * 100;
            const h = Math.max(8, heightPercent);
            barsHTML += `
                <div class="chart-bar" style="height: ${h}%">
                    <span class="bar-tooltip">${val}${metricConfig.unit}</span>
                </div>
            `;
        });

        targetChart.innerHTML = barsHTML;

        // Labels
        let labelsHTML = '';
        PlantData.DAY_LABELS.forEach(day => {
            labelsHTML += `<span>${day}</span>`;
        });
        targetLabels.innerHTML = labelsHTML;
    }

    function renderTip(state) {
        DOM.tipText.textContent = PlantData.getRandomTip(state);
    }

    function updateTimestamp() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        DOM.lastUpdate.textContent = `Atualizado às ${hours}:${minutes}`;
    }


    // ---- Stats Page ----

    function renderStatsPage() {
        const data = PlantData.currentData;
        const score = PlantData.healthScore;

        // Summary cards
        DOM.statsAvgHealth.textContent = score + '%';

        // Best metric
        let bestKey = null;
        let bestPercent = 0;
        let alertCount = 0;

        Object.keys(data).forEach(key => {
            const d = data[key];
            if (d.status === 'good' && d.percentage > bestPercent) {
                bestPercent = d.percentage;
                bestKey = key;
            }
            if (d.status !== 'good') alertCount++;
        });

        DOM.statsBestMetric.textContent = bestKey ? data[bestKey].label.split(' ')[0] : '--';
        DOM.statsAlerts.textContent = alertCount;

        // Detail list
        renderStatsDetailList(data);

        // Chart
        renderChart(statsChartMetric, DOM.statsMiniChart, DOM.statsChartLabels);

        // Y labels
        const metric = PlantData.METRICS[statsChartMetric];
        DOM.statsChartY.innerHTML = `
            <span>${metric.max}${metric.unit}</span>
            <span>${Math.round(metric.max * 0.75)}${metric.unit}</span>
            <span>${Math.round(metric.max * 0.5)}${metric.unit}</span>
            <span>${Math.round(metric.max * 0.25)}${metric.unit}</span>
            <span>0</span>
        `;

        // Legend
        DOM.statsChartLegend.innerHTML = `
            <div class="legend-item">
                <span class="legend-dot" style="background: #2ecc71;"></span>
                <span>${metric.label}</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot" style="background: rgba(255,255,255,0.15);"></span>
                <span>Ideal: ${metric.idealMin}–${metric.idealMax}${metric.unit}</span>
            </div>
        `;
    }

    function renderStatsDetailList(data) {
        let html = '';

        Object.keys(data).forEach(key => {
            const d = data[key];
            const m = PlantData.METRICS[key];

            const statusText = d.status === 'good' ? 'Normal' : (d.status === 'warning' ? 'Atenção' : 'Crítico');
            const statusColor = d.status === 'good'
                ? 'background: rgba(46,204,113,0.12); color: #2ecc71;'
                : (d.status === 'warning'
                    ? 'background: rgba(230,126,34,0.12); color: #e67e22;'
                    : 'background: rgba(231,76,60,0.12); color: #e74c3c;');

            const iconBg = d.status === 'good'
                ? 'background: rgba(46,204,113,0.12); color: #2ecc71;'
                : (d.status === 'warning'
                    ? 'background: rgba(230,126,34,0.12); color: #e67e22;'
                    : 'background: rgba(231,76,60,0.12); color: #e74c3c;');

            const barColor = d.status === 'good' ? '#2ecc71' : (d.status === 'warning' ? '#e67e22' : '#e74c3c');

            // Calculate ideal range position
            const idealStart = ((m.idealMin - m.min) / (m.max - m.min)) * 100;
            const idealWidth = ((m.idealMax - m.idealMin) / (m.max - m.min)) * 100;

            html += `
                <div class="stats-detail-item">
                    <div class="stats-detail-icon" style="${iconBg}">
                        <i class="bi ${d.icon}"></i>
                    </div>
                    <div class="stats-detail-info">
                        <div class="detail-label">${d.label}</div>
                        <div class="detail-range">Ideal: ${m.idealMin}–${m.idealMax}${d.unit}</div>
                        <div class="stats-detail-bar">
                            <div class="stats-detail-bar-fill" style="width: ${d.percentage}%; background: ${barColor};"></div>
                            <div class="stats-detail-bar-ideal" style="left: ${idealStart}%; width: ${idealWidth}%;"></div>
                        </div>
                    </div>
                    <div class="stats-detail-value">
                        <div class="detail-number">${d.value}<small style="font-size:0.7rem;color:rgba(232,245,233,0.5);">${d.unit}</small></div>
                        <span class="detail-status" style="${statusColor}">${statusText}</span>
                    </div>
                </div>
            `;
        });

        DOM.statsDetailList.innerHTML = html;
    }


    // ---- Care Page ----

    function handleCareAction(action) {
        const config = CARE_ACTIONS[action];
        if (!config) return;

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

        // Add to history
        careHistory.unshift({
            action,
            label: config.label,
            icon: config.icon,
            iconClass: config.iconClass,
            time: timeStr,
            date: dateStr,
            timestamp: Date.now(),
        });

        // Update streak
        const todayKey = now.toISOString().split('T')[0];
        careDays[todayKey] = true;
        calculateStreak();

        // Update last action timestamp
        const lastEl = document.getElementById(`${action}-last`);
        if (lastEl) {
            lastEl.textContent = `Último: ${timeStr}`;
        }

        // Animate the card
        const cardEl = document.getElementById(`care-${action}`);
        if (cardEl) {
            cardEl.classList.add('just-used');
            setTimeout(() => cardEl.classList.remove('just-used'), 800);
        }

        // Render log
        renderCareLog();
        renderStreakCalendar();

        // Toast
        showToast(`${config.emoji} ${config.label}!`, 'success');

        // Save
        saveState();
    }

    function renderCareLog() {
        if (careHistory.length === 0) {
            DOM.careLog.innerHTML = `
                <div class="care-log-empty">
                    <i class="bi bi-journal-text"></i>
                    <p>Nenhum cuidado registrado ainda.<br>Use os botões acima para começar!</p>
                </div>
            `;
            return;
        }

        let html = '';
        careHistory.slice(0, 15).forEach(item => {
            html += `
                <div class="care-log-item">
                    <div class="log-icon ${item.iconClass}">
                        <i class="bi ${item.icon}"></i>
                    </div>
                    <div class="log-info">
                        <div class="log-action">${item.label}</div>
                        <div class="log-time">${item.date} às ${item.time}</div>
                    </div>
                </div>
            `;
        });

        DOM.careLog.innerHTML = html;
    }

    function calculateStreak() {
        const today = new Date();
        let streak = 0;
        let checkDate = new Date(today);

        for (let i = 0; i < 365; i++) {
            const key = checkDate.toISOString().split('T')[0];
            if (careDays[key]) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        careStreak = streak;
        DOM.careStreak.textContent = streak;
    }

    function renderStreakCalendar() {
        const today = new Date();
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        let html = '';

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const key = date.toISOString().split('T')[0];
            const isDone = careDays[key];
            const isToday = i === 0;
            const dayName = dayNames[date.getDay()];

            html += `
                <div class="streak-day">
                    <span class="streak-day-label">${dayName}</span>
                    <div class="streak-day-dot ${isDone ? 'done' : ''} ${isToday ? 'today' : ''}">
                        ${isDone ? '<i class="bi bi-check"></i>' : ''}
                    </div>
                </div>
            `;
        }

        DOM.streakCalendar.innerHTML = html;
        calculateStreak();
    }


    // ---- Settings ----

    function handleSavePlantInfo() {
        const name = DOM.settingPlantName.value.trim();
        const species = DOM.settingPlantSpecies.value.trim();

        if (name) {
            PlantData.CONFIG.plantName = name;
            DOM.plantName.textContent = name;
        }
        if (species) {
            PlantData.CONFIG.plantSpecies = species;
            DOM.plantSpecies.textContent = species;
        }

        saveState();
        showToast('🌱 Informações salvas!', 'success');
    }

    function handleResetData() {
        if (confirm('Tem certeza que deseja resetar todos os dados? Isso apagará o histórico de cuidados e configurações.')) {
            localStorage.removeItem('plantApp');
            careHistory = [];
            careStreak = 0;
            careDays = {};
            PlantData.CONFIG.plantName = 'Samambaia';
            PlantData.CONFIG.plantSpecies = 'Nephrolepis exaltata';
            DOM.settingPlantName.value = 'Samambaia';
            DOM.settingPlantSpecies.value = 'Nephrolepis exaltata';
            DOM.plantName.textContent = 'Samambaia';
            DOM.plantSpecies.textContent = 'Nephrolepis exaltata';

            PlantData.refresh();
            renderAll();
            renderCareLog();
            renderStreakCalendar();

            showToast('🔄 Dados resetados!', 'warning');
        }
    }


    // ---- Navigation ----

    function navigateTo(page) {
        if (page === currentPage) return;
        currentPage = page;

        // Switch pages
        DOM.pages.forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById('page-' + page);
        if (targetPage) {
            targetPage.classList.add('active');
            // Re-trigger animation
            targetPage.style.animation = 'none';
            targetPage.offsetHeight; // force reflow
            targetPage.style.animation = '';
        }

        // Update nav items
        DOM.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Update menu links
        DOM.menuLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Update header title
        DOM.headerTitle.textContent = PAGE_TITLES[page] || 'Minha Planta';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Render page-specific content
        if (page === 'stats') renderStatsPage();
        if (page === 'care') {
            renderCareLog();
            renderStreakCalendar();
        }

        // Close menu if open
        closeMenu();

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(10);
    }

    function openMenu() {
        DOM.sideMenu.classList.add('open');
        DOM.menuOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        DOM.sideMenu.classList.remove('open');
        DOM.menuOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }


    // ---- Toast Notifications ----

    function showToast(message, type = 'info') {
        const icons = {
            success: 'bi-check-circle-fill',
            info: 'bi-info-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
        };

        const toast = document.createElement('div');
        toast.className = `toast-msg ${type}`;
        toast.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${message}</span>`;

        DOM.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }


    // ---- Auto Refresh ----

    function startAutoRefresh() {
        const interval = parseInt(DOM.settingRefreshRate.value) || 30000;
        if (interval === 0) return;

        if (autoRefreshInterval) clearInterval(autoRefreshInterval);
        autoRefreshInterval = setInterval(() => {
            PlantData.refresh();
            renderAll();
        }, interval);
    }


    // ---- Animations ----

    function animateCards() {
        if (animationTimeout) clearTimeout(animationTimeout);

        const cards = DOM.dataCardsContainer.querySelectorAll('.data-card');
        cards.forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            animationTimeout = setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, i * 100);
        });
    }

    function animateValue(element, start, end, duration) {
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }


    // ---- Event Handlers ----

    function bindEvents() {
        // Refresh button
        DOM.btnRefresh.addEventListener('click', handleRefresh);

        // Chart tabs (home)
        DOM.chartTabs.forEach(tab => {
            tab.addEventListener('click', handleChartTab);
        });

        // Chart tabs (stats)
        DOM.chartTabsStats.forEach(tab => {
            tab.addEventListener('click', handleStatsChartTab);
        });

        // Bottom nav
        DOM.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                navigateTo(e.currentTarget.dataset.page);
            });
        });

        // Side menu
        DOM.btnMenu.addEventListener('click', openMenu);
        DOM.menuOverlay.addEventListener('click', closeMenu);
        DOM.menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(e.currentTarget.dataset.page);
            });
        });

        // Care actions
        DOM.careActionCards.forEach(card => {
            card.addEventListener('click', () => {
                handleCareAction(card.dataset.action);
            });
        });

        // Settings
        DOM.btnSavePlantInfo.addEventListener('click', handleSavePlantInfo);
        DOM.btnResetData.addEventListener('click', handleResetData);

        DOM.settingRefreshRate.addEventListener('change', () => {
            startAutoRefresh();
            showToast('⚙️ Taxa de atualização alterada!', 'info');
        });

        DOM.settingAnimations.addEventListener('change', (e) => {
            document.body.classList.toggle('no-animations', !e.target.checked);
            showToast(e.target.checked ? '✨ Animações ativadas!' : '⏸️ Animações desativadas!', 'info');
        });

        // Swipe to refresh (mobile)
        let touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchEndY - touchStartY;
            if (diff > 100 && window.scrollY === 0) {
                handleRefresh();
            }
        }, { passive: true });

        // Keyboard shortcut for menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    }

    function handleRefresh() {
        // Spin animation
        DOM.btnRefresh.classList.add('spinning');
        setTimeout(() => DOM.btnRefresh.classList.remove('spinning'), 800);

        // Cycle through states for demo purposes
        const states = ['mixed', 'healthy', 'sad', 'critical'];
        const currentIndex = states.indexOf(PlantData._lastMode) || 0;
        const nextMode = states[(currentIndex + 1) % states.length];
        PlantData._lastMode = nextMode;

        if (nextMode === 'mixed') {
            PlantData.refresh('mixed');
        } else {
            PlantData.forceState(nextMode);
        }

        renderAll();
        showToast('🔄 Dados atualizados!', 'info');
    }

    function handleChartTab(e) {
        const metric = e.currentTarget.dataset.metric;
        activeChartMetric = metric;

        DOM.chartTabs.forEach(tab => tab.classList.remove('active'));
        e.currentTarget.classList.add('active');

        renderChart(metric);
    }

    function handleStatsChartTab(e) {
        const metric = e.currentTarget.dataset.metric;
        statsChartMetric = metric;

        DOM.chartTabsStats.forEach(tab => tab.classList.remove('active'));
        e.currentTarget.classList.add('active');

        renderStatsPage();
    }


    // ---- Boot ----
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
