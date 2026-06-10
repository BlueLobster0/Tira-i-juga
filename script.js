// Estat del joc
const estat = {
  pantalla: 'inici',
  categories: [],
  ultimaCat: null,
  girant: false,
  rotacio: 0,
  actives: null
};

// Referències a pantalles
const pantalles = {
  inici:     document.getElementById('pantalla-inici'),
  regles:    document.getElementById('pantalla-regles'),
  ruleta:    document.getElementById('pantalla-ruleta'),
  categoria: document.getElementById('pantalla-categoria'),
  final:     document.getElementById('pantalla-final')
};

function mostrarPantalla(id) {
  Object.values(pantalles).forEach(p => p.classList.add('oculta'));
  pantalles[id].classList.remove('oculta');
  estat.pantalla = id;
  // Recalcular bombetes dels marcs visibles
  setTimeout(muntaMarcsDeBombetes, 50);
}

// -------------------- RULETA --------------------
function dibuixarRuleta() {
  const canvas = document.getElementById('canvas-ruleta');
  const ctx = canvas.getContext('2d');
  const actives = estat.categories.filter(c => c.torns > 0);

  if (actives.length === 0) {
    mostrarPantalla('final');
    return;
  }

  const segments = actives.length;
  const angle = (2 * Math.PI) / segments;
  const colors = ['#b22222', '#daa520', '#2e8b57', '#8b0000', '#cd853f', '#4682b4'];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(200, 200);
  ctx.rotate(estat.rotacio * Math.PI / 180);

  actives.forEach((cat, i) => {
    const inici = i * angle;
    const final = inici + angle;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 180, inici, final);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.save();
    const mig = inici + angle / 2;
    ctx.rotate(mig);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Georgia';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;
    ctx.fillText(cat.nom, 165, 6);
    ctx.restore();
  });

  ctx.restore();
  estat.actives = actives;
}

function girarRuleta() {
  if (estat.girant || !estat.actives || estat.actives.length === 0) return;
  estat.girant = true;

  const actives = estat.actives;
  let candidates = actives.filter(c => c.id !== estat.ultimaCat);
  if (candidates.length === 0) candidates = actives;

  const escollida = candidates[Math.floor(Math.random() * candidates.length)];
  const idx = actives.indexOf(escollida);
  const angleSegment = 360 / actives.length;
  const iniciSeg = idx * angleSegment;
  const aterratge = iniciSeg + Math.random() * angleSegment;

  const voltes = (5 + Math.floor(Math.random() * 4)) * 360;
  const novaRot = estat.rotacio + voltes + (360 - (estat.rotacio % 360) + aterratge) - (estat.rotacio % 360);

  const canvas = document.getElementById('canvas-ruleta');
  canvas.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
  canvas.style.transform = `rotate(${novaRot}deg)`;

  const acabar = () => {
    canvas.removeEventListener('transitionend', acabar);
    estat.rotacio = novaRot % 360;
    canvas.style.transition = 'none';
    canvas.style.transform = `rotate(${estat.rotacio}deg)`;

    estat.ultimaCat = escollida.id;
    escollida.torns -= 1;
    document.getElementById('nom-categoria').textContent = escollida.nom;
    mostrarPantalla('categoria');
    estat.girant = false;
  };
  canvas.addEventListener('transitionend', acabar);
}

// -------------------- BOMBETES AUTOMÀTIQUES --------------------
function muntaMarcsDeBombetes() {
  const marcs = document.querySelectorAll('.marc-bombetes');
  marcs.forEach(marc => {
    const estil = getComputedStyle(marc);
    const ample = marc.offsetWidth;
    const alt = marc.offsetHeight;
    const marge = 15; // distància des de la vora
    const pas = 22;   // espai entre bombetes

    const bulbsLit = [];
    const bulbsDim = [];
    const colorLit = '#ffd700';
    const colorDim = '#8b7500';

    // Vora superior
    for (let x = marge; x <= ample - marge; x += pas) {
      bulbsLit.push(`${x - ample/2}px ${-alt/2 + marge}px 0 6px ${colorLit}`);
      bulbsDim.push(`${x - ample/2}px ${-alt/2 + marge}px 0 6px ${colorDim}`);
    }
    // Vora inferior
    for (let x = marge; x <= ample - marge; x += pas) {
      bulbsLit.push(`${x - ample/2}px ${alt/2 - marge}px 0 6px ${colorLit}`);
      bulbsDim.push(`${x - ample/2}px ${alt/2 - marge}px 0 6px ${colorDim}`);
    }
    // Vora esquerra
    for (let y = marge; y <= alt - marge; y += pas) {
      bulbsLit.push(`${-ample/2 + marge}px ${y - alt/2}px 0 6px ${colorLit}`);
      bulbsDim.push(`${-ample/2 + marge}px ${y - alt/2}px 0 6px ${colorDim}`);
    }
    // Vora dreta
    for (let y = marge; y <= alt - marge; y += pas) {
      bulbsLit.push(`${ample/2 - marge}px ${y - alt/2}px 0 6px ${colorLit}`);
      bulbsDim.push(`${ample/2 - marge}px ${y - alt/2}px 0 6px ${colorDim}`);
    }

    marc.style.setProperty('--bulbs-lit', bulbsLit.join(','));
    marc.style.setProperty('--bulbs-dim', bulbsDim.join(','));
  });
}

// -------------------- INICIALITZACIÓ --------------------
function iniciarJoc() {
  estat.categories = JSON.parse(JSON.stringify(categories));
  estat.ultimaCat = null;
  mostrarPantalla('inici');
  dibuixarRuleta();
  muntaMarcsDeBombetes();
}

// -------------------- ESDEVENIMENTS --------------------
document.getElementById('boto-comencar').addEventListener('click', () => {
  mostrarPantalla('regles');
});

document.getElementById('boto-continuar').addEventListener('click', () => {
  const marc = document.getElementById('marc-regles');
  marc.classList.add('tancant');
  marc.addEventListener('animationend', () => {
    marc.classList.remove('tancant');
    mostrarPantalla('ruleta');
  }, { once: true });
});

document.getElementById('boto-girar').addEventListener('click', girarRuleta);

document.getElementById('boto-tornar').addEventListener('click', () => {
  dibuixarRuleta();
  mostrarPantalla('ruleta');
});

document.getElementById('boto-premi').addEventListener('click', () => {
  document.getElementById('contingut-premi').classList.remove('oculta');
});

// Redibuixar bombetes si la finestra canvia de mida
window.addEventListener('resize', () => {
  muntaMarcsDeBombetes();
});

// Engegar el circ
iniciarJoc();