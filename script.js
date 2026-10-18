const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.topbar nav');
menuToggle.addEventListener('click', () => {
  const opened = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(opened));
  menuToggle.textContent = opened ? '×' : '☰';
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.textContent = '☰';
}));

const overlay = document.getElementById('secretOverlay');
const toast = document.getElementById('toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function openSecret() { overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false'); }
function closeSecret() { overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true'); }
document.getElementById('secretButton').addEventListener('click', openSecret);
document.getElementById('closeSecret').addEventListener('click', closeSecret);
overlay.addEventListener('click', e => { if (e.target === overlay) closeSecret(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSecret(); });

// Easter egg 1: clique cinco vezes no título/logo da peça.
let logoClicks = 0, logoReset;
document.querySelector('.main-logo').addEventListener('click', () => {
  logoClicks++; clearTimeout(logoReset);
  logoReset = setTimeout(() => logoClicks = 0, 1800);
  if (logoClicks >= 5) { logoClicks = 0; showToast('VOCÊ OLHOU DE PERTO DEMAIS.'); openSecret(); }
});
// Easter egg 2: a pequena cruz escondida no hero.
document.getElementById('deathMark').addEventListener('click', () => showToast('ELA ESTAVA AQUI O TEMPO TODO.'));
// Easter egg 3: digite NADINE em qualquer lugar da página.
let typed = '';
document.addEventListener('keydown', e => {
  if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
    typed = (typed + e.key.toLowerCase()).slice(-12);
    if (typed.endsWith('nadine')) { showToast('NADINE NÃO É A RESPOSTA.'); typed = ''; }
  }
});
// Easter egg 4: clique três vezes na frase do manifesto.
let manifestoClicks = 0;
document.querySelector('.redline').addEventListener('click', () => {
  manifestoClicks++;
  if (manifestoClicks >= 3) { manifestoClicks = 0; showToast('A CULPA NUNCA FICA ONDE VOCÊ DEIXOU.'); }
});
