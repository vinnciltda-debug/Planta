/* ============================================
   PLANT AVATAR MODULE
   Generates and manages the SVG plant avatar
   ============================================ */

const PlantAvatar = (function () {

    // ---- Color Palettes ----
    const PALETTES = {
        healthy: {
            leaf: '#2ecc71',
            leafDark: '#27ae60',
            leafLight: '#82e0aa',
            stem: '#1e8449',
            pot: '#a0522d',
            potDark: '#8b4513',
            potHighlight: '#cd853f',
            soil: '#5d4037',
            soilLight: '#795548',
            face: '#196f3d',
            flower: '#f1c40f',
            flowerCenter: '#e67e22',
            sparkle: '#a8e6cf',
            cheek: 'rgba(46, 204, 113, 0.3)',
        },
        sad: {
            leaf: '#a9b87c',
            leafDark: '#8a9a5b',
            leafLight: '#c5d19a',
            stem: '#7d8a5c',
            pot: '#a0522d',
            potDark: '#8b4513',
            potHighlight: '#cd853f',
            soil: '#5d4037',
            soilLight: '#6d5047',
            face: '#6d7a4f',
            flower: '#d4ac5a',
            flowerCenter: '#c99a3a',
            sparkle: 'transparent',
            cheek: 'transparent',
        },
        critical: {
            leaf: '#8a7d5a',
            leafDark: '#6d6244',
            leafLight: '#a89870',
            stem: '#6d6244',
            pot: '#a0522d',
            potDark: '#8b4513',
            potHighlight: '#cd853f',
            soil: '#4a3530',
            soilLight: '#5a4038',
            face: '#5a4d3a',
            flower: '#b0a06a',
            flowerCenter: '#9a8a4a',
            sparkle: 'transparent',
            cheek: 'transparent',
        },
    };

    /**
     * Generate the full SVG plant based on state
     */
    function generateSVG(state) {
        const p = PALETTES[state] || PALETTES.healthy;
        const isHealthy = state === 'healthy';
        const isSad = state === 'sad';
        const isCritical = state === 'critical';

        // Leaf droop angles based on state
        const leftLeafRotate = isHealthy ? -25 : (isSad ? -10 : -5);
        const rightLeafRotate = isHealthy ? 25 : (isSad ? 10 : 5);
        const topLeafRotate = isHealthy ? 0 : (isSad ? -5 : -10);

        // Face expression
        let faceExpression;
        if (isHealthy) {
            faceExpression = `
                <!-- Happy Eyes -->
                <ellipse cx="96" cy="118" rx="4" ry="5" fill="${p.face}">
                    <animate attributeName="ry" values="5;1;5" dur="3s" repeatCount="indefinite" begin="1s"/>
                </ellipse>
                <ellipse cx="124" cy="118" rx="4" ry="5" fill="${p.face}">
                    <animate attributeName="ry" values="5;1;5" dur="3s" repeatCount="indefinite" begin="1s"/>
                </ellipse>
                <!-- Eye Sparkles -->
                <circle cx="98" cy="116" r="1.5" fill="white" opacity="0.8"/>
                <circle cx="126" cy="116" r="1.5" fill="white" opacity="0.8"/>
                <!-- Happy Mouth -->
                <path d="M102 128 Q110 138 118 128" stroke="${p.face}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <!-- Cheeks -->
                <ellipse cx="90" cy="126" rx="6" ry="4" fill="${p.cheek}"/>
                <ellipse cx="130" cy="126" rx="6" ry="4" fill="${p.cheek}"/>
            `;
        } else if (isSad) {
            faceExpression = `
                <!-- Sad Eyes -->
                <ellipse cx="96" cy="118" rx="4" ry="4.5" fill="${p.face}"/>
                <ellipse cx="124" cy="118" rx="4" ry="4.5" fill="${p.face}"/>
                <!-- Eyebrows (worried) -->
                <line x1="90" y1="110" x2="100" y2="112" stroke="${p.face}" stroke-width="2" stroke-linecap="round"/>
                <line x1="120" y1="112" x2="130" y2="110" stroke="${p.face}" stroke-width="2" stroke-linecap="round"/>
                <!-- Sad Mouth -->
                <path d="M102 132 Q110 125 118 132" stroke="${p.face}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <!-- Sweat Drop -->
                <g opacity="0.6">
                    <path d="M134 112 Q136 106 138 112 Q136 116 134 112Z" fill="#5dade2">
                        <animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="2.5s" repeatCount="indefinite"/>
                    </path>
                </g>
            `;
        } else {
            faceExpression = `
                <!-- Critical Eyes (X X) -->
                <g transform="translate(96, 118)">
                    <line x1="-4" y1="-4" x2="4" y2="4" stroke="${p.face}" stroke-width="2.5" stroke-linecap="round"/>
                    <line x1="4" y1="-4" x2="-4" y2="4" stroke="${p.face}" stroke-width="2.5" stroke-linecap="round"/>
                </g>
                <g transform="translate(124, 118)">
                    <line x1="-4" y1="-4" x2="4" y2="4" stroke="${p.face}" stroke-width="2.5" stroke-linecap="round"/>
                    <line x1="4" y1="-4" x2="-4" y2="4" stroke="${p.face}" stroke-width="2.5" stroke-linecap="round"/>
                </g>
                <!-- Dizzy Mouth -->
                <path d="M100 132 Q105 128 110 132 Q115 136 120 132" stroke="${p.face}" stroke-width="2" fill="none" stroke-linecap="round"/>
                <!-- Sweat Drops -->
                <g opacity="0.7">
                    <path d="M82 108 Q84 102 86 108 Q84 112 82 108Z" fill="#5dade2">
                        <animateTransform attributeName="transform" type="translate" values="0,0;-3,12;0,0" dur="2s" repeatCount="indefinite"/>
                    </path>
                    <path d="M136 106 Q138 100 140 106 Q138 110 136 106Z" fill="#5dade2">
                        <animateTransform attributeName="transform" type="translate" values="0,0;3,14;0,0" dur="2.2s" repeatCount="indefinite" begin="0.5s"/>
                    </path>
                </g>
            `;
        }

        // Sparkles (only healthy)
        const sparkles = isHealthy ? `
            <g class="sparkles">
                <circle cx="60" cy="60" r="2" fill="${p.sparkle}" opacity="0.8">
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="r" values="2;0;2" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="160" cy="50" r="2.5" fill="${p.sparkle}" opacity="0.6">
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" begin="0.8s"/>
                    <animate attributeName="r" values="2.5;0;2.5" dur="2.5s" repeatCount="indefinite" begin="0.8s"/>
                </circle>
                <circle cx="145" cy="85" r="1.8" fill="${p.sparkle}" opacity="0.7">
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="1.8s" repeatCount="indefinite" begin="1.4s"/>
                    <animate attributeName="r" values="1.8;0;1.8" dur="1.8s" repeatCount="indefinite" begin="1.4s"/>
                </circle>
                <circle cx="70" cy="90" r="2" fill="${p.sparkle}" opacity="0.5">
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" begin="0.3s"/>
                    <animate attributeName="r" values="2;0;2" dur="3s" repeatCount="indefinite" begin="0.3s"/>
                </circle>
            </g>
        ` : '';

        // Small flower on top (only healthy)
        const flower = isHealthy ? `
            <g transform="translate(110, 48)">
                <!-- Petals -->
                <ellipse cx="0" cy="-8" rx="4" ry="7" fill="${p.flower}" opacity="0.9">
                    <animateTransform attributeName="transform" type="rotate" values="0,0,-8;5,0,-8;0,0,-8" dur="4s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="7" cy="-3" rx="4" ry="7" fill="${p.flower}" opacity="0.85" transform="rotate(72)">
                    <animateTransform attributeName="transform" type="rotate" values="72,0,0;77,0,0;72,0,0" dur="4s" repeatCount="indefinite" begin="0.2s"/>
                </ellipse>
                <ellipse cx="4" cy="6" rx="4" ry="7" fill="${p.flower}" opacity="0.9" transform="rotate(144)">
                    <animateTransform attributeName="transform" type="rotate" values="144,0,0;149,0,0;144,0,0" dur="4s" repeatCount="indefinite" begin="0.4s"/>
                </ellipse>
                <ellipse cx="-4" cy="6" rx="4" ry="7" fill="${p.flower}" opacity="0.85" transform="rotate(216)">
                    <animateTransform attributeName="transform" type="rotate" values="216,0,0;221,0,0;216,0,0" dur="4s" repeatCount="indefinite" begin="0.6s"/>
                </ellipse>
                <ellipse cx="-7" cy="-3" rx="4" ry="7" fill="${p.flower}" opacity="0.9" transform="rotate(288)">
                    <animateTransform attributeName="transform" type="rotate" values="288,0,0;293,0,0;288,0,0" dur="4s" repeatCount="indefinite" begin="0.8s"/>
                </ellipse>
                <!-- Center -->
                <circle cx="0" cy="0" r="5" fill="${p.flowerCenter}"/>
            </g>
        ` : '';

        // Wilted leaves (only critical)
        const wiltedDetails = isCritical ? `
            <!-- Fallen leaf on ground -->
            <g transform="translate(62, 218) rotate(45)">
                <ellipse cx="0" cy="0" rx="10" ry="5" fill="${p.leaf}" opacity="0.4"/>
            </g>
            <g transform="translate(155, 222) rotate(-30)">
                <ellipse cx="0" cy="0" rx="8" ry="4" fill="${p.leaf}" opacity="0.3"/>
            </g>
        ` : '';

        return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 280" width="220" height="280">
            <defs>
                <!-- Pot gradient -->
                <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${p.potHighlight}" />
                    <stop offset="50%" stop-color="${p.pot}" />
                    <stop offset="100%" stop-color="${p.potDark}" />
                </linearGradient>
                <!-- Leaf gradient -->
                <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${p.leafLight}" />
                    <stop offset="60%" stop-color="${p.leaf}" />
                    <stop offset="100%" stop-color="${p.leafDark}" />
                </linearGradient>
                <!-- Soil gradient -->
                <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${p.soilLight}" />
                    <stop offset="100%" stop-color="${p.soil}" />
                </linearGradient>
            </defs>

            ${sparkles}
            ${wiltedDetails}

            <!-- POT -->
            <g>
                <!-- Pot rim -->
                <rect x="62" y="185" width="96" height="12" rx="4" fill="url(#potGrad)" />
                <!-- Pot body (trapezoid) -->
                <path d="M68 197 L72 250 Q72 256 78 256 L142 256 Q148 256 148 250 L152 197 Z" fill="url(#potGrad)"/>
                <!-- Pot shadow -->
                <path d="M72 250 Q72 256 78 256 L142 256 Q148 256 148 250 L152 197 L148 197 L145 248 Q145 252 140 252 L80 252 Q75 252 75 248 L72 197 L68 197 Z" fill="rgba(0,0,0,0.15)"/>
                <!-- Pot shine -->
                <rect x="75" y="200" width="6" height="40" rx="3" fill="rgba(255,255,255,0.08)"/>
                <!-- Soil -->
                <ellipse cx="110" cy="192" rx="44" ry="8" fill="url(#soilGrad)" />
                <!-- Soil texture dots -->
                <circle cx="95" cy="190" r="1.5" fill="${p.soilLight}" opacity="0.5"/>
                <circle cx="115" cy="193" r="1" fill="${p.soilLight}" opacity="0.4"/>
                <circle cx="125" cy="189" r="1.5" fill="${p.soilLight}" opacity="0.3"/>
            </g>

            <!-- STEM -->
            <g>
                <path d="M110 188 Q108 160 110 140 Q112 120 110 100 Q109 85 110 70"
                      stroke="${p.stem}" stroke-width="6" fill="none" stroke-linecap="round">
                    ${isHealthy ? `<animate attributeName="d"
                        values="M110 188 Q108 160 110 140 Q112 120 110 100 Q109 85 110 70;
                                M110 188 Q112 160 110 140 Q108 120 110 100 Q111 85 110 70;
                                M110 188 Q108 160 110 140 Q112 120 110 100 Q109 85 110 70"
                        dur="5s" repeatCount="indefinite"/>` : ''}
                </path>
                <!-- Stem vein -->
                <path d="M110 188 Q108 160 110 140 Q112 120 110 100 Q109 85 110 70"
                      stroke="${p.stemVein || 'rgba(255,255,255,0.08)'}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            </g>

            <!-- LEAVES -->
            <!-- Left leaf cluster -->
            <g transform="translate(110, 100) rotate(${leftLeafRotate})">
                <ellipse cx="-35" cy="-10" rx="30" ry="12" fill="url(#leafGrad)" opacity="0.95">
                    ${isHealthy ? `<animateTransform attributeName="transform" type="rotate" values="0,-35,-10;-3,-35,-10;0,-35,-10" dur="4s" repeatCount="indefinite"/>` : ''}
                </ellipse>
                <!-- Leaf vein -->
                <line x1="-10" y1="-10" x2="-58" y2="-10" stroke="${p.leafDark}" stroke-width="1" opacity="0.4"/>
                <line x1="-25" y1="-10" x2="-32" y2="-18" stroke="${p.leafDark}" stroke-width="0.7" opacity="0.3"/>
                <line x1="-35" y1="-10" x2="-42" y2="-4" stroke="${p.leafDark}" stroke-width="0.7" opacity="0.3"/>
            </g>

            <!-- Right leaf cluster -->
            <g transform="translate(110, 110) rotate(${rightLeafRotate})">
                <ellipse cx="35" cy="-8" rx="30" ry="11" fill="url(#leafGrad)" opacity="0.9">
                    ${isHealthy ? `<animateTransform attributeName="transform" type="rotate" values="0,35,-8;3,35,-8;0,35,-8" dur="4.5s" repeatCount="indefinite" begin="0.5s"/>` : ''}
                </ellipse>
                <!-- Leaf vein -->
                <line x1="10" y1="-8" x2="58" y2="-8" stroke="${p.leafDark}" stroke-width="1" opacity="0.4"/>
                <line x1="28" y1="-8" x2="35" y2="-16" stroke="${p.leafDark}" stroke-width="0.7" opacity="0.3"/>
                <line x1="42" y1="-8" x2="48" y2="-2" stroke="${p.leafDark}" stroke-width="0.7" opacity="0.3"/>
            </g>

            <!-- Top leaf -->
            <g transform="translate(110, 75) rotate(${topLeafRotate})">
                <ellipse cx="0" cy="-18" rx="14" ry="24" fill="url(#leafGrad)" opacity="0.95">
                    ${isHealthy ? `<animateTransform attributeName="transform" type="rotate" values="0,0,-18;2,0,-18;0,0,-18;-2,0,-18;0,0,-18" dur="5s" repeatCount="indefinite" begin="0.3s"/>` : ''}
                </ellipse>
                <!-- Leaf vein -->
                <line x1="0" y1="0" x2="0" y2="-38" stroke="${p.leafDark}" stroke-width="1" opacity="0.4"/>
            </g>

            <!-- Small left lower leaf -->
            <g transform="translate(110, 145) rotate(${leftLeafRotate - 10})">
                <ellipse cx="-22" cy="-5" rx="20" ry="8" fill="url(#leafGrad)" opacity="0.85">
                    ${isHealthy ? `<animateTransform attributeName="transform" type="rotate" values="0,-22,-5;-2,-22,-5;0,-22,-5" dur="3.5s" repeatCount="indefinite" begin="1s"/>` : ''}
                </ellipse>
            </g>

            <!-- Small right lower leaf -->
            <g transform="translate(110, 135) rotate(${rightLeafRotate + 8})">
                <ellipse cx="24" cy="-5" rx="22" ry="9" fill="url(#leafGrad)" opacity="0.88">
                    ${isHealthy ? `<animateTransform attributeName="transform" type="rotate" values="0,24,-5;2,24,-5;0,24,-5" dur="3.8s" repeatCount="indefinite" begin="0.7s"/>` : ''}
                </ellipse>
            </g>

            ${flower}

            <!-- FACE on the pot -->
            <g>
                ${faceExpression}
            </g>

        </svg>
        `;
    }

    /**
     * Render the SVG into the container
     */
    function render(state) {
        const container = document.getElementById('plant-svg-container');
        if (!container) return;

        container.innerHTML = generateSVG(state);

        // Apply animation class
        container.classList.remove('healthy', 'sad', 'critical');
        container.classList.add(state);

        // Update glow color
        const glow = document.getElementById('avatar-glow');
        if (glow) {
            glow.classList.remove('healthy', 'sad', 'critical');
            glow.classList.add(state);
        }
    }

    // ---- Public API ----
    return {
        render,
        generateSVG,
        PALETTES,
    };

})();
