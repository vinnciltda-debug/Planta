/* ============================================
   AI TIPS MODULE
   Simulates an AI assistant that provides
   contextual, species-specific plant care advice
   with a chat-like interface
   ============================================ */

const PlantAI = (function () {

    // ---- AI Knowledge Base (species-specific) ----
    const SPECIES_DB = {
        'Nephrolepis exaltata': {
            commonName: 'Samambaia',
            family: 'Polypodiaceae',
            origin: 'Américas tropicais',
            light: 'Luz indireta brilhante — evite sol direto',
            water: 'Manter solo constantemente úmido, sem encharcar',
            humidity: 'Alta umidade (60-80%). Borrife folhas 2-3x por semana',
            temperature: '18-28°C — não tolera abaixo de 12°C',
            soil: 'Substrato rico, ácido (pH 5.5-6.5), boa drenagem',
            fertilizer: 'Adubo líquido mensal na primavera/verão, pausar no inverno',
            repotting: 'A cada 1-2 anos ou quando raízes saírem pelo furo',
            toxicity: 'Não tóxica para pets 🐾',
            commonProblems: [
                'Folhas amarelando → excesso de sol ou pouca água',
                'Pontas marrons → baixa umidade do ar',
                'Folhas caindo → mudanças bruscas de temperatura',
                'Crescimento lento → pouca luz ou falta de nutrientes',
                'Folhas pálidas → precisa de adubação',
            ],
        },
        'default': {
            commonName: 'Planta',
            family: 'Variada',
            origin: 'Variada',
            light: 'Verificar necessidade específica da espécie',
            water: 'Regar quando o solo estiver seco ao toque',
            humidity: 'Umidade moderada (40-60%)',
            temperature: '18-26°C para a maioria das plantas de interior',
            soil: 'Substrato universal com boa drenagem',
            fertilizer: 'Adubo balanceado a cada 2-4 semanas na estação de crescimento',
            repotting: 'Quando as raízes preencherem o vaso',
            toxicity: 'Verificar espécie específica',
            commonProblems: [
                'Folhas amarelas → pode ser excesso ou falta de água',
                'Pontas secas → baixa umidade ou excesso de fertilizante',
                'Pragas → verificar regularmente sob as folhas',
            ],
        },
    };

    // ---- AI Response Templates ----
    const AI_RESPONSES = {
        greeting: [
            'Olá! 🌱 Sou a PlantIA, sua assistente de cuidados com plantas. Analisei os dados da sua **{plantName}** e tenho algumas observações!',
            'Oi! 🤖🌿 Acabei de verificar os sensores da sua **{plantName}**. Veja o que encontrei:',
            'Bom te ver! 🌻 Fiz um diagnóstico completo da sua **{plantName}**. Aqui está minha análise:',
        ],
        allGood: [
            'Excelente! ✨ Todos os indicadores da sua **{plantName}** estão dentro da faixa ideal. Continue com esse cuidado maravilhoso!\n\n💚 **Saúde geral: {score}%**\n\nDica extra: {extraTip}',
            'Parabéns! 🎉 Sua **{plantName}** está radiante! Não encontrei nenhum problema nos dados atuais.\n\n💚 **Saúde: {score}%** — Nível excelente!\n\n🌟 {extraTip}',
            'Tudo perfeito! 🌿 A **{plantName}** está em ótimas condições. Seus cuidados estão fazendo toda a diferença!\n\n💚 **Score de saúde: {score}%**\n\n💡 {extraTip}',
        ],
        problemIntro: [
            'Encontrei {count} ponto(s) que precisam de atenção na sua **{plantName}**:\n\n',
            'Atenção! Detectei {count} indicador(es) fora do ideal para a sua **{plantName}**:\n\n',
            'A **{plantName}** precisa de ajuda! {count} sensor(es) estão alertando:\n\n',
        ],
        problemDetail: {
            humidity: {
                low: '💧 **Solo Seco** — A umidade do solo está em **{value}%** (ideal: {idealMin}-{idealMax}%). Para samambaias, o solo deve ficar constantemente úmido. Regue bem e considere um prato com água ou cachepô com reservatório.\n\n*Ação imediata:* Regue até a água escorrer pelo furo de drenagem.\n\n',
                high: '🚿 **Solo Encharcado** — Umidade em **{value}%** (ideal: {idealMin}-{idealMax}%). Raízes podem apodrecer! Verifique se o vaso tem drenagem adequada e reduza a frequência de rega.\n\n*Ação imediata:* Pare de regar por 2-3 dias e avalie.\n\n',
            },
            temperature: {
                low: '🥶 **Temperatura Baixa** — Registrando **{value}°C** (ideal: {idealMin}-{idealMax}°C). Samambaias são tropicais e sofrem com frio. Afaste de janelas abertas e ar-condicionado.\n\n*Ação imediata:* Mova para o ambiente mais quente da casa.\n\n',
                high: '🔥 **Temperatura Alta** — Registrando **{value}°C** (ideal: {idealMin}-{idealMax}°C). O calor excessivo desidrata as folhas. Borrife água e afaste de fontes de calor.\n\n*Ação imediata:* Borrife água nas folhas e mova para local mais fresco.\n\n',
            },
            light: {
                low: '🌑 **Pouca Luminosidade** — Apenas **{value} lux** (ideal: {idealMin}-{idealMax} lux). Sem luz adequada, a fotossíntese é comprometida e a planta enfraquece.\n\n*Ação imediata:* Mova para perto de uma janela com luz indireta.\n\n',
                high: '☀️ **Excesso de Luz** — **{value} lux** (ideal: {idealMin}-{idealMax} lux). Sol direto queima folhas de samambaia! Use cortinas para filtrar a luz.\n\n*Ação imediata:* Mova para sombra parcial imediatamente.\n\n',
            },
            soilPH: {
                low: '🧪 **pH Muito Ácido** — Medindo **{value}** (ideal: {idealMin}-{idealMax}). Solo ácido em excesso bloqueia absorção de nutrientes.\n\n*Solução:* Adicione calcário dolomítico ao substrato.\n\n',
                high: '🧪 **pH Muito Alcalino** — Medindo **{value}** (ideal: {idealMin}-{idealMax}). Samambaias preferem solo ácido.\n\n*Solução:* Adicione turfa ou substrato para plantas ácidas.\n\n',
            },
            waterLevel: {
                low: '⬇️ **Nível de Água Baixo** — Apenas **{value}%** (ideal: {idealMin}-{idealMax}%). O reservatório precisa ser reabastecido para manter a hidratação constante.\n\n*Ação:* Complete o reservatório de água.\n\n',
                high: '⬆️ **Nível de Água Alto** — **{value}%** (ideal: {idealMin}-{idealMax}%). Excesso de água no reservatório pode afogar raízes.\n\n*Ação:* Esvazie parte da água e melhore a drenagem.\n\n',
            },
            airHumidity: {
                low: '🏜️ **Ar Muito Seco** — Umidade do ar em **{value}%** (ideal: {idealMin}-{idealMax}%). Samambaias precisam de alta umidade! Pontas das folhas podem secar.\n\n*Soluções:*\n• Borrife água nas folhas diariamente\n• Use um umidificador\n• Monte uma bandeja de umidade com pedras e água\n\n',
                high: '🌫️ **Umidade do Ar Excessiva** — **{value}%** (ideal: {idealMin}-{idealMax}%). Risco de fungos! Melhore a ventilação sem expor a correntes de ar.\n\n*Ação:* Abra janelas ou use ventilador suave.\n\n',
            },
        },
        conclusion: {
            mild: [
                '---\n\n📊 **Resumo:** {problemCount} problema(s) leve(s) identificado(s). Com pequenos ajustes, sua planta ficará ótima!',
                '---\n\n🔧 **Conclusão:** Nada grave! Faça os ajustes sugeridos e monitore nos próximos dias.',
            ],
            serious: [
                '---\n\n⚠️ **Resumo Crítico:** {problemCount} problema(s) sério(s) detectado(s). Ação imediata recomendada para evitar danos permanentes!',
                '---\n\n🚨 **Atenção:** Sua planta precisa de cuidados urgentes! Siga as recomendações acima o quanto antes.',
            ],
        },
        extraTips: [
            'Samambaias adoram banheiros com boa luz — a umidade natural é perfeita para elas!',
            'Gire o vaso 90° a cada semana para crescimento uniforme.',
            'Nunca use água gelada — use água em temperatura ambiente.',
            'Folhas velhas e marrons podem ser podadas sem medo — isso estimula novas folhas!',
            'Samambaias amam ser borrifadas! Faça isso pela manhã para melhor absorção.',
            'No inverno, reduza a rega mas mantenha a umidade do ar com borrifações.',
            'Use substrato específico para samambaias com fibra de coco e casca de pinus.',
            'Se possível, use água filtrada ou de chuva — o cloro pode prejudicar a planta.',
            'Adube com NPK 10-10-10 diluído na primavera para um crescimento exuberante.',
            'Mantenha a planta longe de aparelhos que emitem calor como TV e computador.',
        ],
    };

    // ---- Conversation History ----
    let chatHistory = [];
    let isThinking = false;

    // ---- Helper: fill template ----
    function fill(template, data) {
        let result = template;
        Object.keys(data).forEach(key => {
            result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), data[key]);
        });
        return result;
    }

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Generate full AI diagnosis based on current plant data
     */
    function generateDiagnosis() {
        const data = PlantData.currentData;
        const score = PlantData.healthScore;
        const state = PlantData.plantState;
        const plantName = PlantData.CONFIG.plantName;
        const plantSpecies = PlantData.CONFIG.plantSpecies;
        const speciesInfo = SPECIES_DB[plantSpecies] || SPECIES_DB['default'];

        const templateData = {
            plantName: plantName,
            score: score,
            extraTip: pickRandom(AI_RESPONSES.extraTips),
        };

        let response = fill(pickRandom(AI_RESPONSES.greeting), templateData) + '\n\n';

        // Analyze problems
        const problems = [];
        Object.keys(data).forEach(key => {
            const d = data[key];
            const m = PlantData.METRICS[key];
            if (d.status !== 'good') {
                const direction = d.value < m.idealMin ? 'low' : 'high';
                problems.push({
                    key,
                    direction,
                    value: d.value,
                    unit: d.unit,
                    idealMin: m.idealMin,
                    idealMax: m.idealMax,
                    severity: d.status,
                });
            }
        });

        if (problems.length === 0) {
            response += fill(pickRandom(AI_RESPONSES.allGood), templateData);
        } else {
            templateData.count = problems.length;
            response += fill(pickRandom(AI_RESPONSES.problemIntro), templateData);

            problems.forEach((p, i) => {
                const templates = AI_RESPONSES.problemDetail[p.key];
                if (templates && templates[p.direction]) {
                    const detail = fill(templates[p.direction], {
                        value: p.value,
                        unit: p.unit,
                        idealMin: p.idealMin,
                        idealMax: p.idealMax,
                    });
                    response += `**${i + 1}.** ${detail}`;
                }
            });

            const hasDanger = problems.some(p => p.severity === 'danger');
            const conclusions = hasDanger ? AI_RESPONSES.conclusion.serious : AI_RESPONSES.conclusion.mild;
            response += fill(pickRandom(conclusions), { problemCount: problems.length });
        }

        return response;
    }

    /**
     * Generate a quick contextual tip (for the tip card on home)
     */
    function getQuickTip() {
        const data = PlantData.currentData;
        const state = PlantData.plantState;
        const speciesInfo = SPECIES_DB[PlantData.CONFIG.plantSpecies] || SPECIES_DB['default'];

        if (state === 'healthy') {
            const tips = [
                `Sua ${PlantData.CONFIG.plantName} está ótima! ${pickRandom(AI_RESPONSES.extraTips)}`,
                `💡 Sabia que ${speciesInfo.commonName || 'essa planta'} precisa de ${speciesInfo.humidity}?`,
                `🌡️ Temperatura ideal para ${speciesInfo.commonName}: ${speciesInfo.temperature}`,
                `☀️ Sobre luz: ${speciesInfo.light}`,
                `🪴 Replantio: ${speciesInfo.repotting}`,
                `🧴 Adubação: ${speciesInfo.fertilizer}`,
                `🐾 Toxicidade: ${speciesInfo.toxicity}`,
            ];
            return pickRandom(tips);
        }

        // Find worst metric
        let worstKey = null;
        let worstStatus = 'warning';
        Object.keys(data).forEach(key => {
            if (data[key].status === 'danger') {
                worstKey = key;
                worstStatus = 'danger';
            } else if (data[key].status === 'warning' && !worstKey) {
                worstKey = key;
            }
        });

        if (worstKey) {
            const d = data[worstKey];
            const m = PlantData.METRICS[worstKey];
            const direction = d.value < m.idealMin ? 'low' : 'high';
            const templates = AI_RESPONSES.problemDetail[worstKey];
            if (templates && templates[direction]) {
                const text = fill(templates[direction], {
                    value: d.value, unit: d.unit,
                    idealMin: m.idealMin, idealMax: m.idealMax,
                });
                // Extract first sentence
                return `⚠️ ${text.split('\n')[0]}`;
            }
        }

        return PlantData.getRandomTip(state);
    }

    /**
     * Get species info card
     */
    function getSpeciesCard() {
        const speciesInfo = SPECIES_DB[PlantData.CONFIG.plantSpecies] || SPECIES_DB['default'];
        return speciesInfo;
    }

    /**
     * Answer a user question using context
     */
    function answerQuestion(question) {
        const q = question.toLowerCase().trim();
        const speciesInfo = SPECIES_DB[PlantData.CONFIG.plantSpecies] || SPECIES_DB['default'];
        const data = PlantData.currentData;
        const plantName = PlantData.CONFIG.plantName;

        // Keyword matching for responses
        if (q.includes('regar') || q.includes('água') || q.includes('rega')) {
            const humidity = data.humidity;
            if (humidity && humidity.status !== 'good') {
                return `💧 Sobre rega da sua ${plantName}:\n\n${speciesInfo.water}\n\n📊 **Umidade atual do solo:** ${humidity.value}% (ideal: ${PlantData.METRICS.humidity.idealMin}-${PlantData.METRICS.humidity.idealMax}%)\n\n${humidity.value < PlantData.METRICS.humidity.idealMin ? '⚠️ O solo está seco! Regue agora.' : '⚠️ Cuidado, o solo está úmido demais. Espere secar um pouco.'}`;
            }
            return `💧 Sobre rega da sua ${plantName}:\n\n${speciesInfo.water}\n\n📊 **Umidade atual do solo:** ${humidity ? humidity.value + '%' : 'N/A'} — Está dentro do ideal! ✅`;
        }

        if (q.includes('luz') || q.includes('sol') || q.includes('luminosidade')) {
            return `☀️ Sobre iluminação da sua ${plantName}:\n\n${speciesInfo.light}\n\n📊 **Luminosidade atual:** ${data.light ? data.light.value + ' lux' : 'N/A'}${data.light && data.light.status !== 'good' ? '\n\n⚠️ A luz não está ideal! Ajuste a posição da planta.' : '\n\n✅ A iluminação está boa!'}`;
        }

        if (q.includes('temperatura') || q.includes('frio') || q.includes('calor') || q.includes('quente')) {
            return `🌡️ Sobre temperatura da sua ${plantName}:\n\n${speciesInfo.temperature}\n\n📊 **Temperatura atual:** ${data.temperature ? data.temperature.value + '°C' : 'N/A'}${data.temperature && data.temperature.status !== 'good' ? '\n\n⚠️ A temperatura não está ideal!' : '\n\n✅ Temperatura perfeita!'}`;
        }

        if (q.includes('adubo') || q.includes('fertiliz') || q.includes('nutriente')) {
            return `🧴 Sobre adubação da sua ${plantName}:\n\n${speciesInfo.fertilizer}\n\nO pH ideal do solo é ${PlantData.METRICS.soilPH.idealMin}-${PlantData.METRICS.soilPH.idealMax}.\n📊 **pH atual:** ${data.soilPH ? data.soilPH.value : 'N/A'}`;
        }

        if (q.includes('doença') || q.includes('praga') || q.includes('problema') || q.includes('amarela') || q.includes('marrom')) {
            let answer = `🔍 Problemas comuns da ${speciesInfo.commonName}:\n\n`;
            speciesInfo.commonProblems.forEach((p, i) => {
                answer += `${i + 1}. ${p}\n`;
            });
            return answer;
        }

        if (q.includes('vaso') || q.includes('replantar') || q.includes('substrato') || q.includes('terra')) {
            return `🪴 Sobre substrato e vaso da sua ${plantName}:\n\n**Solo recomendado:** ${speciesInfo.soil}\n\n**Replantio:** ${speciesInfo.repotting}`;
        }

        if (q.includes('umidade') || q.includes('seco') || q.includes('borrifar')) {
            return `💨 Sobre umidade do ar para sua ${plantName}:\n\n${speciesInfo.humidity}\n\n📊 **Umidade do ar atual:** ${data.airHumidity ? data.airHumidity.value + '%' : 'N/A'}`;
        }

        if (q.includes('pet') || q.includes('gato') || q.includes('cachorro') || q.includes('tóxic')) {
            return `🐾 Toxicidade da ${speciesInfo.commonName}:\n\n${speciesInfo.toxicity}`;
        }

        if (q.includes('dica') || q.includes('conselho') || q.includes('ajuda')) {
            return generateDiagnosis();
        }

        // Default response
        return `🤖 Entendo que você está perguntando sobre "${question}" para sua **${plantName}** (${PlantData.CONFIG.plantSpecies}).\n\nAqui estão algumas informações gerais:\n\n• **Rega:** ${speciesInfo.water}\n• **Luz:** ${speciesInfo.light}\n• **Umidade:** ${speciesInfo.humidity}\n• **Temperatura:** ${speciesInfo.temperature}\n\nPara uma dica mais específica, pergunte sobre: regar, luz, temperatura, adubo, doenças, vaso, ou umidade! 🌿`;
    }

    /**
     * Format markdown-like text to simple HTML
     */
    function formatResponse(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/---/g, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:12px 0;">');
    }

    // ---- Public API ----
    return {
        generateDiagnosis,
        getQuickTip,
        getSpeciesCard,
        answerQuestion,
        formatResponse,
        SPECIES_DB,
        get chatHistory() { return chatHistory; },
        set chatHistory(h) { chatHistory = h; },
        get isThinking() { return isThinking; },
        set isThinking(v) { isThinking = v; },
    };

})();
