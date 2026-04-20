/* ============================================
   PLANT AVATAR MODULE
   Plant species + pot customization
   ============================================ */
const PlantAvatar = (function () {

    const PLANT_TYPES = {
        fern:       { label: 'Samambaia',  emoji: '🌿', desc: 'Clássica e elegante',  scientific: 'Nephrolepis exaltata' },
        cactus:     { label: 'Cacto',      emoji: '🌵', desc: 'Resistente e desértico', scientific: 'Cereus peruvianus' },
        succulent:  { label: 'Suculenta',  emoji: '🪴', desc: 'Pequena e fofa',       scientific: 'Echeveria elegans' },
        sunflower:  { label: 'Girassol',   emoji: '🌻', desc: 'Alegre e radiante',    scientific: 'Helianthus annuus' },
        tulip:      { label: 'Tulipa',     emoji: '🌷', desc: 'Delicada e colorida',  scientific: 'Tulipa gesneriana' },
        bonsai:     { label: 'Bonsai',     emoji: '🌳', desc: 'Milenar e sábio',       scientific: 'Juniperus procumbens' },
    };

    const PALETTES = {
        healthy: { leaf:'#2ecc71',leafDark:'#27ae60',leafLight:'#82e0aa',stem:'#1e8449',soil:'#5d4037',soilLight:'#795548',face:'#196f3d',flower:'#f1c40f',flowerCenter:'#e67e22',sparkle:'#a8e6cf',cheek:'rgba(46,204,113,0.3)' },
        sad:     { leaf:'#a9b87c',leafDark:'#8a9a5b',leafLight:'#c5d19a',stem:'#7d8a5c',soil:'#5d4037',soilLight:'#6d5047',face:'#6d7a4f',flower:'#d4ac5a',flowerCenter:'#c99a3a',sparkle:'transparent',cheek:'transparent' },
        critical:{ leaf:'#8a7d5a',leafDark:'#6d6244',leafLight:'#a89870',stem:'#6d6244',soil:'#4a3530',soilLight:'#5a4038',face:'#5a4d3a',flower:'#b0a06a',flowerCenter:'#9a8a4a',sparkle:'transparent',cheek:'transparent' },
    };

    const POT_COLORS = {
        terracotta:{main:'#a0522d',dark:'#8b4513',highlight:'#cd853f',label:'Terracota'},
        ocean:{main:'#2980b9',dark:'#1a5276',highlight:'#5dade2',label:'Oceano'},
        rose:{main:'#e91e63',dark:'#ad1457',highlight:'#f48fb1',label:'Rosa'},
        forest:{main:'#27ae60',dark:'#1e8449',highlight:'#82e0aa',label:'Floresta'},
        snow:{main:'#ecf0f1',dark:'#bdc3c7',highlight:'#ffffff',label:'Neve'},
        midnight:{main:'#2c3e50',dark:'#1a252f',highlight:'#4a6fa5',label:'Meia-Noite'},
        gold:{main:'#f39c12',dark:'#d68910',highlight:'#f9e79f',label:'Ouro'},
        lavender:{main:'#9b59b6',dark:'#7d3c98',highlight:'#d2b4de',label:'Lavanda'},
    };

    const POT_PATTERNS = { none:{label:'Liso'},stripes:{label:'Listras'},dots:{label:'Bolinhas'},hearts:{label:'Corações'},zigzag:{label:'Zigzag'},stars:{label:'Estrelas'} };

    const POT_ACCESSORIES = {
        none:{label:'Nenhum'},bow:{label:'Laço',emoji:'🎀'},sunglasses:{label:'Óculos',emoji:'😎'},
        hat:{label:'Chapéu',emoji:'🎩'},crown:{label:'Coroa',emoji:'👑'},
        scarf:{label:'Cachecol',emoji:'🧣'},flower_deco:{label:'Flor',emoji:'🌺'},
    };

    let currentCustom = { potColor:'terracotta', potPattern:'none', accessory:'none', plantType:'fern' };

    function setCustomization(o) {
        if(o.potColor) currentCustom.potColor=o.potColor;
        if(o.potPattern) currentCustom.potPattern=o.potPattern;
        if(o.accessory!==undefined) currentCustom.accessory=o.accessory;
        if(o.plantType) currentCustom.plantType=o.plantType;
    }
    function getCustomization() { return {...currentCustom}; }

    // ---- Pot Pattern ----
    function patternSVG(pat,col) {
        const pc=POT_COLORS[col]||POT_COLORS.terracotta, c=pc.highlight+'44';
        switch(pat){
            case 'stripes': return '<line x1="80" y1="205" x2="80" y2="245" stroke="'+c+'" stroke-width="3" opacity="0.5"/><line x1="95" y1="202" x2="93" y2="248" stroke="'+c+'" stroke-width="3" opacity="0.5"/><line x1="110" y1="200" x2="110" y2="250" stroke="'+c+'" stroke-width="3" opacity="0.5"/><line x1="125" y1="202" x2="127" y2="248" stroke="'+c+'" stroke-width="3" opacity="0.5"/><line x1="140" y1="205" x2="140" y2="245" stroke="'+c+'" stroke-width="3" opacity="0.5"/>';
            case 'dots': return '<circle cx="85" cy="215" r="3" fill="'+c+'" opacity="0.6"/><circle cx="105" cy="210" r="3" fill="'+c+'" opacity="0.6"/><circle cx="125" cy="215" r="3" fill="'+c+'" opacity="0.6"/><circle cx="95" cy="235" r="3" fill="'+c+'" opacity="0.6"/><circle cx="115" cy="230" r="3" fill="'+c+'" opacity="0.6"/><circle cx="135" cy="235" r="3" fill="'+c+'" opacity="0.6"/>';
            case 'hearts': return '<text x="90" y="220" font-size="10" opacity="0.4" fill="'+pc.highlight+'">♥</text><text x="110" y="215" font-size="12" opacity="0.4" fill="'+pc.highlight+'">♥</text><text x="130" y="220" font-size="10" opacity="0.4" fill="'+pc.highlight+'">♥</text>';
            case 'zigzag': return '<polyline points="75,220 85,210 95,220 105,210 115,220 125,210 135,220 145,210" stroke="'+c+'" stroke-width="2" fill="none" opacity="0.5"/><polyline points="77,240 87,230 97,240 107,230 117,240 127,230 137,240 147,230" stroke="'+c+'" stroke-width="2" fill="none" opacity="0.4"/>';
            case 'stars': return '<text x="85" y="218" font-size="9" opacity="0.4" fill="'+pc.highlight+'">★</text><text x="110" y="213" font-size="11" opacity="0.4" fill="'+pc.highlight+'">★</text><text x="133" y="218" font-size="9" opacity="0.4" fill="'+pc.highlight+'">★</text>';
            default: return '';
        }
    }

    // ---- Accessory ----
    function accessorySVG(acc) {
        switch(acc){
            case 'bow': return '<g transform="translate(110,185)"><path d="M-12,-3 Q-8,-10 -2,-3" fill="#e74c3c" stroke="#c0392b" stroke-width="0.8"/><path d="M2,-3 Q8,-10 12,-3" fill="#e74c3c" stroke="#c0392b" stroke-width="0.8"/><circle cx="0" cy="-3" r="2.5" fill="#c0392b"/></g>';
            case 'sunglasses': return '<g transform="translate(110,117)"><rect x="-22" y="-5" width="16" height="11" rx="3" fill="rgba(0,0,0,0.8)" stroke="#333" stroke-width="0.8"/><rect x="6" y="-5" width="16" height="11" rx="3" fill="rgba(0,0,0,0.8)" stroke="#333" stroke-width="0.8"/><line x1="-6" y1="0" x2="6" y2="0" stroke="#333" stroke-width="1.5"/></g>';
            case 'hat': return '<g transform="translate(110,52)"><ellipse cx="0" cy="12" rx="28" ry="5" fill="#2c3e50"/><rect x="-16" y="-12" width="32" height="24" rx="3" fill="#34495e"/><rect x="-16" y="4" width="32" height="5" fill="#e74c3c"/></g>';
            case 'crown': return '<g transform="translate(110,48)"><path d="M-18,8 L-18,-4 L-10,-1 L0,-10 L10,-1 L18,-4 L18,8 Z" fill="#f1c40f" stroke="#d4ac0d" stroke-width="1"/><circle cx="0" cy="1" r="2.5" fill="#e74c3c"/><circle cx="-10" cy="3" r="2" fill="#3498db"/><circle cx="10" cy="3" r="2" fill="#2ecc71"/></g>';
            case 'scarf': return '<g transform="translate(110,183)"><path d="M-48,0 Q-20,-8 0,-2 Q20,-8 48,0 Q20,6 0,3 Q-20,6 -48,0Z" fill="#e74c3c" opacity="0.9"/><path d="M15,2 Q18,12 14,20" stroke="#e74c3c" stroke-width="5" fill="none" stroke-linecap="round"/></g>';
            case 'flower_deco': return '<g transform="translate(152,192)"><ellipse cx="0" cy="-6" rx="3" ry="5" fill="#ff69b4" opacity="0.9"/><ellipse cx="5" cy="-2" rx="3" ry="5" fill="#ff69b4" opacity="0.85" transform="rotate(72)"/><ellipse cx="3" cy="4" rx="3" ry="5" fill="#ff69b4" opacity="0.9" transform="rotate(144)"/><ellipse cx="-3" cy="4" rx="3" ry="5" fill="#ff69b4" opacity="0.85" transform="rotate(216)"/><ellipse cx="-5" cy="-2" rx="3" ry="5" fill="#ff69b4" opacity="0.9" transform="rotate(288)"/><circle cx="0" cy="0" r="3.5" fill="#ff1493"/></g>';
            default: return '';
        }
    }

    // ---- Face ----
    function faceSVG(st,p) {
        if(st==='healthy') return '<ellipse cx="96" cy="118" rx="4" ry="5" fill="'+p.face+'"><animate attributeName="ry" values="5;1;5" dur="3s" repeatCount="indefinite" begin="1s"/></ellipse><ellipse cx="124" cy="118" rx="4" ry="5" fill="'+p.face+'"><animate attributeName="ry" values="5;1;5" dur="3s" repeatCount="indefinite" begin="1s"/></ellipse><circle cx="98" cy="116" r="1.5" fill="white" opacity="0.8"/><circle cx="126" cy="116" r="1.5" fill="white" opacity="0.8"/><path d="M102 128 Q110 138 118 128" stroke="'+p.face+'" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="90" cy="126" rx="6" ry="4" fill="'+p.cheek+'"/><ellipse cx="130" cy="126" rx="6" ry="4" fill="'+p.cheek+'"/>';
        if(st==='sad') return '<ellipse cx="96" cy="118" rx="4" ry="4.5" fill="'+p.face+'"/><ellipse cx="124" cy="118" rx="4" ry="4.5" fill="'+p.face+'"/><line x1="90" y1="110" x2="100" y2="112" stroke="'+p.face+'" stroke-width="2" stroke-linecap="round"/><line x1="120" y1="112" x2="130" y2="110" stroke="'+p.face+'" stroke-width="2" stroke-linecap="round"/><path d="M102 132 Q110 125 118 132" stroke="'+p.face+'" stroke-width="2.5" fill="none" stroke-linecap="round"/><g opacity="0.6"><path d="M134 112 Q136 106 138 112 Q136 116 134 112Z" fill="#5dade2"><animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="2.5s" repeatCount="indefinite"/></path></g>';
        return '<g transform="translate(96,118)"><line x1="-4" y1="-4" x2="4" y2="4" stroke="'+p.face+'" stroke-width="2.5" stroke-linecap="round"/><line x1="4" y1="-4" x2="-4" y2="4" stroke="'+p.face+'" stroke-width="2.5" stroke-linecap="round"/></g><g transform="translate(124,118)"><line x1="-4" y1="-4" x2="4" y2="4" stroke="'+p.face+'" stroke-width="2.5" stroke-linecap="round"/><line x1="4" y1="-4" x2="-4" y2="4" stroke="'+p.face+'" stroke-width="2.5" stroke-linecap="round"/></g><path d="M100 132 Q105 128 110 132 Q115 136 120 132" stroke="'+p.face+'" stroke-width="2" fill="none" stroke-linecap="round"/><g opacity="0.7"><path d="M82 108 Q84 102 86 108 Q84 112 82 108Z" fill="#5dade2"><animateTransform attributeName="transform" type="translate" values="0,0;-3,12;0,0" dur="2s" repeatCount="indefinite"/></path></g>';
    }

    // ---- Pot ----
    function potSVG(p,pc,cust) {
        return '<rect x="62" y="185" width="96" height="12" rx="4" fill="url(#potGrad)"/><path d="M68 197 L72 250 Q72 256 78 256 L142 256 Q148 256 148 250 L152 197 Z" fill="url(#potGrad)"/><path d="M72 250 Q72 256 78 256 L142 256 Q148 256 148 250 L152 197 L148 197 L145 248 Q145 252 140 252 L80 252 Q75 252 75 248 L72 197 L68 197 Z" fill="rgba(0,0,0,0.15)"/><rect x="75" y="200" width="6" height="40" rx="3" fill="rgba(255,255,255,0.08)"/>'+patternSVG(cust.potPattern,cust.potColor)+'<ellipse cx="110" cy="192" rx="44" ry="8" fill="url(#soilGrad)"/><circle cx="95" cy="190" r="1.5" fill="'+p.soilLight+'" opacity="0.5"/><circle cx="115" cy="193" r="1" fill="'+p.soilLight+'" opacity="0.4"/><circle cx="125" cy="189" r="1.5" fill="'+p.soilLight+'" opacity="0.3"/>';
    }

    function defsSVG(p,pc) {
        return '<defs><linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="'+pc.highlight+'"/><stop offset="50%" stop-color="'+pc.main+'"/><stop offset="100%" stop-color="'+pc.dark+'"/></linearGradient><linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="'+p.leafLight+'"/><stop offset="60%" stop-color="'+p.leaf+'"/><stop offset="100%" stop-color="'+p.leafDark+'"/></linearGradient><linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="'+p.soilLight+'"/><stop offset="100%" stop-color="'+p.soil+'"/></linearGradient></defs>';
    }

    function sparklesSVG(p) {
        return '<g class="sparkles"><circle cx="60" cy="60" r="2" fill="'+p.sparkle+'" opacity="0.8"><animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/></circle><circle cx="160" cy="50" r="2.5" fill="'+p.sparkle+'" opacity="0.6"><animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" begin="0.8s"/></circle><circle cx="145" cy="85" r="1.8" fill="'+p.sparkle+'" opacity="0.7"><animate attributeName="opacity" values="0.7;0;0.7" dur="1.8s" repeatCount="indefinite" begin="1.4s"/></circle></g>';
    }

    // ========= PLANT BODIES =========

    function fernBody(st,p) {
        var h=st==='healthy',s=st==='sad';
        var ll=h?-25:(s?-10:-5), rl=h?25:(s?10:5), tl=h?0:(s?-5:-10);
        var a=function(v,d,b){return h?'<animateTransform attributeName="transform" type="rotate" values="'+v+'" dur="'+d+'" repeatCount="indefinite" begin="'+b+'"/>':'';};
        var flower=h?'<g transform="translate(110,48)"><ellipse cx="0" cy="-8" rx="4" ry="7" fill="'+p.flower+'" opacity="0.9"><animateTransform attributeName="transform" type="rotate" values="0,0,-8;5,0,-8;0,0,-8" dur="4s" repeatCount="indefinite"/></ellipse><ellipse cx="7" cy="-3" rx="4" ry="7" fill="'+p.flower+'" opacity="0.85" transform="rotate(72)"/><ellipse cx="4" cy="6" rx="4" ry="7" fill="'+p.flower+'" opacity="0.9" transform="rotate(144)"/><ellipse cx="-4" cy="6" rx="4" ry="7" fill="'+p.flower+'" opacity="0.85" transform="rotate(216)"/><ellipse cx="-7" cy="-3" rx="4" ry="7" fill="'+p.flower+'" opacity="0.9" transform="rotate(288)"/><circle cx="0" cy="0" r="5" fill="'+p.flowerCenter+'"/></g>':'';
        var stem='<path d="M110 188 Q108 160 110 140 Q112 120 110 100 Q109 85 110 70" stroke="'+p.stem+'" stroke-width="6" fill="none" stroke-linecap="round">'+(h?'<animate attributeName="d" values="M110 188 Q108 160 110 140 Q112 120 110 100 Q109 85 110 70;M110 188 Q112 160 110 140 Q108 120 110 100 Q111 85 110 70;M110 188 Q108 160 110 140 Q112 120 110 100 Q109 85 110 70" dur="5s" repeatCount="indefinite"/>':'')+'</path>';
        return stem+
            '<g transform="translate(110,100) rotate('+ll+')"><ellipse cx="-35" cy="-10" rx="30" ry="12" fill="url(#leafGrad)" opacity="0.95">'+a('0,-35,-10;-3,-35,-10;0,-35,-10','4s','0s')+'</ellipse></g>'+
            '<g transform="translate(110,110) rotate('+rl+')"><ellipse cx="35" cy="-8" rx="30" ry="11" fill="url(#leafGrad)" opacity="0.9">'+a('0,35,-8;3,35,-8;0,35,-8','4.5s','0.5s')+'</ellipse></g>'+
            '<g transform="translate(110,75) rotate('+tl+')"><ellipse cx="0" cy="-18" rx="14" ry="24" fill="url(#leafGrad)" opacity="0.95">'+a('0,0,-18;2,0,-18;0,0,-18','5s','0.3s')+'</ellipse></g>'+
            '<g transform="translate(110,145) rotate('+(ll-10)+')"><ellipse cx="-22" cy="-5" rx="20" ry="8" fill="url(#leafGrad)" opacity="0.85">'+a('0,-22,-5;-2,-22,-5;0,-22,-5','3.5s','1s')+'</ellipse></g>'+
            '<g transform="translate(110,135) rotate('+(rl+8)+')"><ellipse cx="24" cy="-5" rx="22" ry="9" fill="url(#leafGrad)" opacity="0.88">'+a('0,24,-5;2,24,-5;0,24,-5','3.8s','0.7s')+'</ellipse></g>'+
            flower;
    }

    function cactusBody(st,p) {
        var h=st==='healthy',s=st==='sad';
        var c1=h?p.leaf:(s?p.leafDark:'#6d6244'), c2=h?p.leafDark:(s?'#7a8a4c':'#5a5034');
        var ad=h?0:(s?5:10);
        var fl=h?'<g transform="translate(110,58)"><circle cx="0" cy="-6" r="6" fill="#e74c3c"/><circle cx="-4" cy="-9" r="4" fill="#ff6b6b"/><circle cx="4" cy="-9" r="4" fill="#ff6b6b"/><circle cx="0" cy="-6" r="2.5" fill="#f1c40f"/></g>':'';
        return '<rect x="95" y="68" width="30" height="120" rx="15" fill="'+c1+'"/><rect x="95" y="68" width="30" height="120" rx="15" stroke="'+c2+'" stroke-width="1" fill="none"/><line x1="103" y1="75" x2="103" y2="185" stroke="'+c2+'" stroke-width="0.8" opacity="0.3"/><line x1="110" y1="70" x2="110" y2="188" stroke="'+c2+'" stroke-width="0.8" opacity="0.25"/><line x1="117" y1="75" x2="117" y2="185" stroke="'+c2+'" stroke-width="0.8" opacity="0.3"/><rect x="100" y="72" width="4" height="110" rx="2" fill="rgba(255,255,255,0.08)"/>'+
            '<g transform="translate(95,110) rotate('+ad+')"><rect x="-25" y="-10" width="28" height="20" rx="10" fill="'+c1+'"/><rect x="-25" y="-30" width="20" height="25" rx="10" fill="'+c1+'"/></g>'+
            '<g transform="translate(125,125) rotate('+(-ad)+')"><rect x="-3" y="-10" width="28" height="18" rx="9" fill="'+c1+'"/><rect x="7" y="-28" width="18" height="22" rx="9" fill="'+c1+'"/></g>'+
            (h?'<line x1="92" y1="90" x2="86" y2="86" stroke="'+c2+'" stroke-width="1" opacity="0.5"/><line x1="128" y1="85" x2="134" y2="81" stroke="'+c2+'" stroke-width="1" opacity="0.5"/><line x1="92" y1="120" x2="85" y2="118" stroke="'+c2+'" stroke-width="1" opacity="0.4"/><line x1="128" y1="130" x2="135" y2="128" stroke="'+c2+'" stroke-width="1" opacity="0.4"/>':'')+
            fl;
    }

    function succulentBody(st,p) {
        var h=st==='healthy',s=st==='sad';
        var c=h?'#5bb88a':(s?'#8a9a6c':'#7a7050'), cl=h?'#7ee0aa':(s?'#a0b080':'#9a8a68'), cd=h?'#3a8a60':(s?'#6a7a4c':'#5a5040');
        var sc=h?1:(s?0.95:0.88);
        return '<g transform="translate(110,140) scale('+sc+')">'+
            '<ellipse cx="0" cy="10" rx="20" ry="14" fill="'+c+'"/>'+
            '<ellipse cx="0" cy="-12" rx="12" ry="20" fill="'+cl+'" opacity="0.9" transform="rotate(0)"/><ellipse cx="0" cy="-12" rx="12" ry="20" fill="'+c+'" opacity="0.85" transform="rotate(60)"/><ellipse cx="0" cy="-12" rx="12" ry="20" fill="'+cl+'" opacity="0.9" transform="rotate(120)"/><ellipse cx="0" cy="-12" rx="12" ry="20" fill="'+c+'" opacity="0.85" transform="rotate(180)"/><ellipse cx="0" cy="-12" rx="12" ry="20" fill="'+cl+'" opacity="0.9" transform="rotate(240)"/><ellipse cx="0" cy="-12" rx="12" ry="20" fill="'+c+'" opacity="0.85" transform="rotate(300)"/>'+
            '<ellipse cx="0" cy="-6" rx="7" ry="12" fill="'+cl+'" opacity="0.95" transform="rotate(30)"/><ellipse cx="0" cy="-6" rx="7" ry="12" fill="'+c+'" opacity="0.9" transform="rotate(90)"/><ellipse cx="0" cy="-6" rx="7" ry="12" fill="'+cl+'" opacity="0.95" transform="rotate(150)"/><ellipse cx="0" cy="-6" rx="7" ry="12" fill="'+c+'" opacity="0.9" transform="rotate(210)"/><ellipse cx="0" cy="-6" rx="7" ry="12" fill="'+cl+'" opacity="0.95" transform="rotate(270)"/><ellipse cx="0" cy="-6" rx="7" ry="12" fill="'+c+'" opacity="0.9" transform="rotate(330)"/>'+
            '<circle cx="0" cy="0" r="6" fill="'+cd+'"/><circle cx="0" cy="0" r="4" fill="'+c+'"/>'+
            '</g>';
    }

    function sunflowerBody(st,p) {
        var h=st==='healthy',s=st==='sad';
        var petC=h?'#f1c40f':(s?'#d4b84a':'#b0a06a'), cenC=h?'#6d4c1a':(s?'#7a6030':'#5a4a30');
        var tilt=h?0:(s?3:8);
        var petals='';
        for(var i=0;i<12;i++){
            var ang=(360/12)*i, op=0.85+(i%2)*0.1;
            petals+='<ellipse cx="0" cy="-22" rx="7" ry="16" fill="'+petC+'" opacity="'+op+'" transform="rotate('+ang+')"/>';
        }
        return '<g transform="rotate('+tilt+',110,188)"><path d="M110 188 Q108 160 110 130 Q112 100 110 75" stroke="'+p.stem+'" stroke-width="7" fill="none" stroke-linecap="round"/><g transform="translate(110,140) rotate(-35)"><ellipse cx="-18" cy="0" rx="18" ry="8" fill="url(#leafGrad)" opacity="0.9"/></g><g transform="translate(110,115) rotate(30)"><ellipse cx="16" cy="0" rx="16" ry="7" fill="url(#leafGrad)" opacity="0.85"/></g></g>'+
            '<g transform="translate(110,72) rotate('+(tilt*0.5)+')">'+petals+'<circle cx="0" cy="0" r="14" fill="'+cenC+'"/><circle cx="-4" cy="-4" r="1.2" fill="rgba(0,0,0,0.2)"/><circle cx="2" cy="-5" r="1.2" fill="rgba(0,0,0,0.2)"/><circle cx="5" cy="-1" r="1.2" fill="rgba(0,0,0,0.2)"/><circle cx="3" cy="4" r="1.2" fill="rgba(0,0,0,0.2)"/><circle cx="-3" cy="3" r="1.2" fill="rgba(0,0,0,0.2)"/><circle cx="0" cy="0" r="1.2" fill="rgba(0,0,0,0.15)"/></g>';
    }

    function tulipBody(st,p) {
        var h=st==='healthy',s=st==='sad';
        var pc=h?'#e74c3c':(s?'#c0796a':'#a0705a'), pc2=h?'#ff6b6b':(s?'#d09080':'#b08a70');
        var tilt=h?0:(s?4:10);
        return '<g transform="rotate('+tilt+',110,188)"><path d="M110 188 Q109 160 110 110 Q111 85 110 65" stroke="'+p.stem+'" stroke-width="5" fill="none" stroke-linecap="round"/><g transform="translate(110,155) rotate(-20)"><ellipse cx="-20" cy="0" rx="22" ry="7" fill="url(#leafGrad)" opacity="0.9"/></g><g transform="translate(110,130) rotate(18)"><ellipse cx="18" cy="0" rx="20" ry="6" fill="url(#leafGrad)" opacity="0.85"/></g></g>'+
            '<g transform="translate(110,60) rotate('+(tilt*0.3)+')"><ellipse cx="-8" cy="-8" rx="10" ry="22" fill="'+pc+'" opacity="0.8" transform="rotate(-15)"/><ellipse cx="8" cy="-8" rx="10" ry="22" fill="'+pc+'" opacity="0.8" transform="rotate(15)"/><ellipse cx="0" cy="-10" rx="9" ry="24" fill="'+pc2+'" opacity="0.9"/><ellipse cx="-12" cy="-4" rx="8" ry="20" fill="'+pc+'" opacity="0.85" transform="rotate(-8)"/><ellipse cx="12" cy="-4" rx="8" ry="20" fill="'+pc+'" opacity="0.85" transform="rotate(8)"/><ellipse cx="0" cy="-4" rx="5" ry="10" fill="rgba(255,255,255,0.1)"/></g>';
    }

    function bonsaiBody(st,p) {
        var h=st==='healthy',s=st==='sad';
        var tc=h?'#6d4c1a':(s?'#7a6030':'#5a4830'), fo=h?0.9:(s?0.7:0.5);
        return '<path d="M110 188 Q105 170 100 155 Q95 140 100 130 Q105 120 110 115" stroke="'+tc+'" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M100 130 Q90 125 82 118" stroke="'+tc+'" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M105 140 Q115 135 125 130" stroke="'+tc+'" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M110 188 Q105 170 100 155" stroke="rgba(0,0,0,0.15)" stroke-width="3" fill="none"/>'+
            '<g opacity="'+fo+'"><ellipse cx="110" cy="95" rx="28" ry="22" fill="url(#leafGrad)"/><ellipse cx="82" cy="105" rx="22" ry="18" fill="'+p.leaf+'" opacity="0.85"/><ellipse cx="130" cy="110" rx="20" ry="16" fill="'+p.leaf+'" opacity="0.8"/><ellipse cx="95" cy="85" rx="18" ry="15" fill="'+p.leafLight+'" opacity="0.7"/><ellipse cx="125" cy="90" rx="15" ry="14" fill="'+p.leafLight+'" opacity="0.65"/><circle cx="100" cy="100" r="8" fill="'+p.leafDark+'" opacity="0.3"/><circle cx="120" cy="95" r="6" fill="'+p.leafDark+'" opacity="0.25"/></g>';
    }

    // ---- Main SVG ----
    function generateSVG(state, customOpts) {
        var p=PALETTES[state]||PALETTES.healthy;
        var cust=customOpts||currentCustom;
        var pc=POT_COLORS[cust.potColor]||POT_COLORS.terracotta;
        var h=state==='healthy';

        var body;
        switch(cust.plantType||'fern'){
            case 'cactus':    body=cactusBody(state,p); break;
            case 'succulent': body=succulentBody(state,p); break;
            case 'sunflower': body=sunflowerBody(state,p); break;
            case 'tulip':     body=tulipBody(state,p); break;
            case 'bonsai':    body=bonsaiBody(state,p); break;
            default:          body=fernBody(state,p); break;
        }

        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 280" width="220" height="280">'+
            defsSVG(p,pc)+
            (h?sparklesSVG(p):'')+
            '<g>'+potSVG(p,pc,cust)+'</g>'+
            body+
            '<g>'+faceSVG(state,p)+'</g>'+
            accessorySVG(cust.accessory)+
            '</svg>';
    }

    function render(state, customOpts) {
        var container=document.getElementById('plant-svg-container');
        if(!container) return;
        container.innerHTML=generateSVG(state,customOpts);
        container.classList.remove('healthy','sad','critical');
        container.classList.add(state);
        var glow=document.getElementById('avatar-glow');
        if(glow){glow.classList.remove('healthy','sad','critical');glow.classList.add(state);}
    }

    return {
        render, generateSVG, PALETTES, POT_COLORS, POT_PATTERNS, POT_ACCESSORIES,
        PLANT_TYPES, setCustomization, getCustomization,
    };
})();
