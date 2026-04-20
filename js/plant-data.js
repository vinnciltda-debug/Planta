/* ============================================
   PLANT DATA MODULE
   Manages fictitious plant sensor data
   with smart diagnostics and species-specific tips
   ============================================ */

const PlantData = (function () {

    // ---- Configuration ----
    const CONFIG = {
        plantName: 'Samambaia',
        plantSpecies: 'Nephrolepis exaltata',
        updateInterval: 30000, // 30 seconds
    };

    // ---- Ideal ranges for each metric ----
    const METRICS = {
        humidity: {
            label: 'Umidade do Solo',
            unit: '%',
            icon: 'bi-droplet-fill',
            min: 0,
            max: 100,
            idealMin: 55,
            idealMax: 85,
            warningMin: 35,
            warningMax: 90,
        },
        temperature: {
            label: 'Temperatura',
            unit: '°C',
            icon: 'bi-thermometer-half',
            min: 0,
            max: 50,
            idealMin: 18,
            idealMax: 28,
            warningMin: 12,
            warningMax: 35,
        },
        light: {
            label: 'Luminosidade',
            unit: 'lux',
            icon: 'bi-sun-fill',
            min: 0,
            max: 10000,
            idealMin: 2000,
            idealMax: 6000,
            warningMin: 800,
            warningMax: 8000,
        },
        soilPH: {
            label: 'pH do Solo',
            unit: 'pH',
            icon: 'bi-moisture',
            min: 0,
            max: 14,
            idealMin: 5.5,
            idealMax: 6.5,
            warningMin: 4.5,
            warningMax: 7.5,
        },
        waterLevel: {
            label: 'Nível de Água',
            unit: '%',
            icon: 'bi-water',
            min: 0,
            max: 100,
            idealMin: 40,
            idealMax: 80,
            warningMin: 20,
            warningMax: 90,
        },
        airHumidity: {
            label: 'Umidade do Ar',
            unit: '%',
            icon: 'bi-cloud-drizzle-fill',
            min: 0,
            max: 100,
            idealMin: 50,
            idealMax: 80,
            warningMin: 30,
            warningMax: 90,
        },
    };

    // ---- State ----
    let currentData = {};
    let weeklyHistory = {};
    let healthScore = 85;
    let plantState = 'healthy'; // 'healthy', 'sad', 'critical'

    // ---- Day labels ----
    const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    // ---- General Tips ----
    const TIPS = {
        healthy: [
            'Sua planta está adorando o ambiente atual! Continue assim. 🌿',
            'A rega regular está fazendo maravilhas. Parabéns pelo cuidado! 💧',
            'As condições de luz estão perfeitas para o crescimento. ☀️',
            'O solo está bem nutrido. Sua planta agradece! 🌱',
            'Mantenha a rotina de cuidados, sua planta está no caminho certo! 🎯',
        ],
        sad: [
            'Parece que sua planta precisa de um pouco mais de atenção. Verifique a rega. 😟',
            'Ajuste a iluminação — sua planta pode estar precisando de mais ou menos luz. 💡',
            'Verifique a umidade do solo, ela pode estar abaixo do ideal. 🏜️',
            'Uma leve adubação pode ajudar sua planta a recuperar a vitalidade. 🧪',
            'Mude a planta de lugar para ver se ela responde melhor. 🔄',
        ],
        critical: [
            '⚠️ Atenção! Sua planta precisa de cuidado urgente. Verifique todas as condições!',
            '⚠️ Regue imediatamente e mova para um local com luz indireta.',
            '⚠️ Os níveis estão críticos. Considere replantá-la em solo novo.',
            '⚠️ Verifique se não há pragas ou doenças nas folhas.',
            '⚠️ A planta precisa de socorro! Ajuste temperatura, rega e luz agora.',
        ],
    };

    // ---- Smart Diagnostic Tips (per metric + direction) ----
    const SMART_TIPS = {
        humidity: {
            low: [
                { title: 'Solo Seco Detectado', tip: 'O solo da sua Samambaia está muito seco! Regue abundantemente e coloque um prato com água embaixo do vaso.', icon: 'bi-droplet-fill', severity: 'danger' },
                { title: 'Rega Urgente', tip: 'Samambaias precisam de solo constantemente úmido. Regue agora e considere aumentar a frequência para 2-3 vezes por semana.', icon: 'bi-exclamation-circle', severity: 'danger' },
            ],
            high: [
                { title: 'Solo Encharcado', tip: 'Cuidado! Solo muito úmido pode causar apodrecimento das raízes. Reduza a rega e verifique se o vaso tem furos de drenagem.', icon: 'bi-droplet-fill', severity: 'warning' },
                { title: 'Excesso de Água', tip: 'Deixe o solo secar levemente entre as regas. Samambaias gostam de umidade, mas não de solo encharcado.', icon: 'bi-moisture', severity: 'warning' },
            ],
        },
        temperature: {
            low: [
                { title: 'Temperatura Baixa', tip: 'Sua Samambaia está com frio! Mova-a para longe de janelas com corrente de ar e mantenha acima de 18°C.', icon: 'bi-thermometer-snow', severity: 'danger' },
                { title: 'Proteção Contra Frio', tip: 'Samambaias são tropicais e não toleram temperaturas abaixo de 12°C. Leve-a para um ambiente mais quente.', icon: 'bi-shield-exclamation', severity: 'warning' },
            ],
            high: [
                { title: 'Calor Excessivo', tip: 'A temperatura está muito alta! Mova a planta para um local mais fresco e borrife água nas folhas para refrescar.', icon: 'bi-thermometer-sun', severity: 'danger' },
                { title: 'Estresse Térmico', tip: 'Samambaias preferem temperaturas entre 18-28°C. Evite exposição direta ao sol forte e fontes de calor.', icon: 'bi-sun-fill', severity: 'warning' },
            ],
        },
        light: {
            low: [
                { title: 'Pouca Luz', tip: 'Sua Samambaia está recebendo pouca luz! Mova para um local com luz indireta brilhante, como perto de uma janela com cortina.', icon: 'bi-brightness-low', severity: 'warning' },
                { title: 'Luz Insuficiente', tip: 'Sem luz adequada, sua planta vai enfraquecer. Samambaias precisam de luz indireta durante pelo menos 6 horas por dia.', icon: 'bi-lamp', severity: 'danger' },
            ],
            high: [
                { title: 'Luz Muito Forte', tip: 'A Samambaia está recebendo sol direto! Isso pode queimar as folhas. Mova para luz filtrada ou sombra parcial.', icon: 'bi-brightness-high', severity: 'danger' },
                { title: 'Queimadura Solar', tip: 'Folhas amareladas ou com manchas marrons podem indicar queimadura solar. Retire do sol direto imediatamente.', icon: 'bi-sun-fill', severity: 'warning' },
            ],
        },
        soilPH: {
            low: [
                { title: 'Solo Muito Ácido', tip: 'O pH do solo está muito baixo. Adicione um pouco de calcário dolomítico para elevar o pH gradualmente. Ideal: 5.5-6.5', icon: 'bi-moisture', severity: 'warning' },
            ],
            high: [
                { title: 'Solo Muito Alcalino', tip: 'O pH do solo está muito alto para samambaias. Adicione turfa ou substrato ácido para reduzir o pH. Ideal: 5.5-6.5', icon: 'bi-moisture', severity: 'warning' },
            ],
        },
        waterLevel: {
            low: [
                { title: 'Reserva de Água Baixa', tip: 'O nível de água está muito baixo! Complete a reserva de água do vaso e verifique se o substrato está absorvendo corretamente.', icon: 'bi-water', severity: 'danger' },
            ],
            high: [
                { title: 'Excesso no Reservatório', tip: 'O reservatório de água está transbordando. Esvazie um pouco para evitar que as raízes fiquem submersas.', icon: 'bi-water', severity: 'warning' },
            ],
        },
        airHumidity: {
            low: [
                { title: 'Ar Muito Seco', tip: 'Samambaias adoram umidade no ar! Borrife água nas folhas diariamente ou coloque um umidificador perto da planta.', icon: 'bi-cloud-drizzle', severity: 'warning' },
                { title: 'Umidade do Ar Crítica', tip: 'O ar está seco demais. Monte uma "bandeja de umidade" com pedras e água embaixo do vaso para aumentar a umidade naturalmente.', icon: 'bi-cloud', severity: 'danger' },
            ],
            high: [
                { title: 'Umidade do Ar Alta Demais', tip: 'Umidade excessiva pode favorecer fungos. Melhore a ventilação do ambiente sem expor a planta a correntes de ar diretas.', icon: 'bi-wind', severity: 'warning' },
            ],
        },
    };


    // ---- Helper Functions ----

    function randomBetween(min, max, decimals = 0) {
        const value = Math.random() * (max - min) + min;
        return parseFloat(value.toFixed(decimals));
    }

    function evaluateMetric(key, value) {
        const m = METRICS[key];
        if (value >= m.idealMin && value <= m.idealMax) return 'good';
        if (value >= m.warningMin && value <= m.warningMax) return 'warning';
        return 'danger';
    }

    function getPercentage(key, value) {
        const m = METRICS[key];
        return Math.min(100, Math.max(0, ((value - m.min) / (m.max - m.min)) * 100));
    }

    function generateSensorData(mode = 'mixed') {
        const data = {};

        Object.keys(METRICS).forEach(key => {
            const m = METRICS[key];
            let value;

            if (mode === 'healthy') {
                value = randomBetween(m.idealMin, m.idealMax, key === 'soilPH' ? 1 : 0);
            } else if (mode === 'sad') {
                const useHigh = Math.random() > 0.5;
                if (useHigh) {
                    value = randomBetween(m.idealMax, m.warningMax, key === 'soilPH' ? 1 : 0);
                } else {
                    value = randomBetween(m.warningMin, m.idealMin, key === 'soilPH' ? 1 : 0);
                }
            } else if (mode === 'critical') {
                const useHigh = Math.random() > 0.5;
                if (useHigh) {
                    value = randomBetween(m.warningMax, m.max, key === 'soilPH' ? 1 : 0);
                } else {
                    value = randomBetween(m.min, m.warningMin, key === 'soilPH' ? 1 : 0);
                }
            } else {
                const roll = Math.random();
                if (roll < 0.60) {
                    value = randomBetween(m.idealMin, m.idealMax, key === 'soilPH' ? 1 : 0);
                } else if (roll < 0.85) {
                    const useHigh = Math.random() > 0.5;
                    if (useHigh) {
                        value = randomBetween(m.idealMax, m.warningMax, key === 'soilPH' ? 1 : 0);
                    } else {
                        value = randomBetween(m.warningMin, m.idealMin, key === 'soilPH' ? 1 : 0);
                    }
                } else {
                    const useHigh = Math.random() > 0.5;
                    if (useHigh) {
                        value = randomBetween(m.warningMax, m.max, key === 'soilPH' ? 1 : 0);
                    } else {
                        value = randomBetween(m.min, m.warningMin, key === 'soilPH' ? 1 : 0);
                    }
                }
            }

            data[key] = {
                value: value,
                status: evaluateMetric(key, value),
                percentage: getPercentage(key, value),
                ...m,
            };
        });

        return data;
    }

    function calculateHealthScore(data) {
        let totalScore = 0;
        let count = 0;

        Object.keys(data).forEach(key => {
            count++;
            const status = data[key].status;
            if (status === 'good') totalScore += 100;
            else if (status === 'warning') totalScore += 55;
            else totalScore += 15;
        });

        return Math.round(totalScore / count);
    }

    function determinePlantState(score) {
        if (score >= 70) return 'healthy';
        if (score >= 40) return 'sad';
        return 'critical';
    }

    function generateWeeklyHistory() {
        const history = {
            humidity: [],
            temperature: [],
            light: [],
        };

        for (let i = 0; i < 7; i++) {
            history.humidity.push(randomBetween(35, 90));
            history.temperature.push(randomBetween(15, 35));
            history.light.push(randomBetween(1000, 8000));
        }

        return history;
    }

    function getRandomTip(state) {
        const tips = TIPS[state] || TIPS.healthy;
        return tips[Math.floor(Math.random() * tips.length)];
    }

    /**
     * Get smart diagnostic tips based on current data
     * Returns array of { title, tip, icon, severity, metric }
     */
    function getSmartDiagnostics() {
        const diagnostics = [];

        Object.keys(currentData).forEach(key => {
            const d = currentData[key];
            const m = METRICS[key];

            if (d.status === 'good') return;

            // Determine direction
            const isLow = d.value < m.idealMin;
            const direction = isLow ? 'low' : 'high';

            const tips = SMART_TIPS[key]?.[direction];
            if (tips && tips.length > 0) {
                const tip = tips[Math.floor(Math.random() * tips.length)];
                diagnostics.push({
                    ...tip,
                    metric: key,
                    metricLabel: d.label,
                    currentValue: d.value,
                    unit: d.unit,
                    idealRange: `${m.idealMin}–${m.idealMax}${d.unit}`,
                    status: d.status,
                });
            }
        });

        return diagnostics;
    }


    // ---- Public API ----

    function init() {
        currentData = generateSensorData('healthy');
        healthScore = 100;
        plantState = 'healthy';
        weeklyHistory = generateWeeklyHistory();
    }

    function refresh(mode) {
        mode = mode || 'mixed';
        currentData = generateSensorData(mode);
        healthScore = calculateHealthScore(currentData);
        plantState = determinePlantState(healthScore);
        weeklyHistory = generateWeeklyHistory();
    }

    function forceState(state) {
        if (state === 'healthy') {
            refresh('healthy');
        } else if (state === 'sad') {
            refresh('sad');
        } else if (state === 'critical') {
            refresh('critical');
        }
    }

    return {
        CONFIG,
        METRICS,
        DAY_LABELS,
        SMART_TIPS,
        get currentData() { return currentData; },
        get healthScore() { return healthScore; },
        get plantState() { return plantState; },
        get weeklyHistory() { return weeklyHistory; },
        getRandomTip,
        getSmartDiagnostics,
        evaluateMetric,
        getPercentage,
        init,
        refresh,
        forceState,
    };

})();
