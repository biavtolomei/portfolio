const buttons = document.querySelectorAll('[data-lang]');
const translatable = document.querySelectorAll('[data-pt][data-en]');
function setLang(lang){
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  translatable.forEach(el => { el.textContent = el.dataset[lang]; });
  buttons.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  localStorage.setItem('portfolio-lang', lang);
}
buttons.forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
setLang(localStorage.getItem('portfolio-lang') || 'pt');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduced){ document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible')); }
else{
  const io = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } }), {threshold:.08});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
}
