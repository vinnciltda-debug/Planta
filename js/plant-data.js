/* ============================================
   PLANT DATA MODULE
   Manages fictitious plant sensor data
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

    // ---- Tips ----
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

    // ---- Helper Functions ----

    /**
     * Generate a random value between min and max
     */
    function randomBetween(min, max, decimals = 0) {
        const value = Math.random() * (max - min) + min;
        return parseFloat(value.toFixed(decimals));
    }

    /**
     * Evaluate a single metric and return status
     */
    function evaluateMetric(key, value) {
        const m = METRICS[key];
        if (value >= m.idealMin && value <= m.idealMax) return 'good';
        if (value >= m.warningMin && value <= m.warningMax) return 'warning';
        return 'danger';
    }

    /**
     * Calculate the percentage of a value within its total range
     */
    function getPercentage(key, value) {
        const m = METRICS[key];
        return Math.min(100, Math.max(0, ((value - m.min) / (m.max - m.min)) * 100));
    }

    /**
     * Generate a full set of sensor data (either healthy-biased or random)
     */
    function generateSensorData(mode = 'mixed') {
        const data = {};

        Object.keys(METRICS).forEach(key => {
            const m = METRICS[key];
            let value;

            if (mode === 'healthy') {
                // Values within ideal range
                value = randomBetween(m.idealMin, m.idealMax, key === 'soilPH' ? 1 : 0);
            } else if (mode === 'sad') {
                // Values in warning range
                const useHigh = Math.random() > 0.5;
                if (useHigh) {
                    value = randomBetween(m.idealMax, m.warningMax, key === 'soilPH' ? 1 : 0);
                } else {
                    value = randomBetween(m.warningMin, m.idealMin, key === 'soilPH' ? 1 : 0);
                }
            } else if (mode === 'critical') {
                // Values outside warning range
                const useHigh = Math.random() > 0.5;
                if (useHigh) {
                    value = randomBetween(m.warningMax, m.max, key === 'soilPH' ? 1 : 0);
                } else {
                    value = randomBetween(m.min, m.warningMin, key === 'soilPH' ? 1 : 0);
                }
            } else {
                // Mixed — 60% healthy, 25% warning, 15% critical
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

    /**
     * Calculate overall health score from current data
     */
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

    /**
     * Determine plant state from health score
     */
    function determinePlantState(score) {
        if (score >= 70) return 'healthy';
        if (score >= 40) return 'sad';
        return 'critical';
    }

    /**
     * Generate weekly history for charts
     */
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

    /**
     * Get a random tip based on plant state
     */
    function getRandomTip(state) {
        const tips = TIPS[state] || TIPS.healthy;
        return tips[Math.floor(Math.random() * tips.length)];
    }


    // ---- Public API ----

    /**
     * Initialize data
     */
    function init() {
        currentData = generateSensorData('mixed');
        healthScore = calculateHealthScore(currentData);
        plantState = determinePlantState(healthScore);
        weeklyHistory = generateWeeklyHistory();
    }

    /**
     * Refresh with new random data
     */
    function refresh(mode) {
        mode = mode || 'mixed';
        currentData = generateSensorData(mode);
        healthScore = calculateHealthScore(currentData);
        plantState = determinePlantState(healthScore);
        weeklyHistory = generateWeeklyHistory();
    }

    /**
     * Force a specific state for testing
     */
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
        get currentData() { return currentData; },
        get healthScore() { return healthScore; },
        get plantState() { return plantState; },
        get weeklyHistory() { return weeklyHistory; },
        getRandomTip,
        evaluateMetric,
        getPercentage,
        init,
        refresh,
        forceState,
    };

})();
