const type = document.body.dataset.type;           // "film" eller "serie"
const grid = document.getElementById('grid');
const chipsEl = document.getElementById('chips');
const countEl = document.getElementById('count');
const qEl = document.getElementById('q');
const sortEl = document.getElementById('sort');

let items = [];
let state = { q: '', genre: 'Alle', sort: 'rating' };

fetch('data.json')
  .then(r => r.json())
  .then(all => {
    items = all.filter(d => d.type === type);
    buildChips();
    render();
  })
  .catch(() => {
    grid.innerHTML = '<div class="none">Klarte ikkje laste data.json. Opne sida med Live Server i VS Code.</div>';
  });

function buildChips() {
  const genres = [...new Set(items.flatMap(d => d.genres))].sort((a, b) => a.localeCompare(b, 'nn'));
  ['Alle', ...genres].forEach(g => {
    const b = document.createElement('button');
    b.className = 'chip' + (g === state.genre ? ' on' : '');
    b.textContent = g;
    b.onclick = () => {
      state.genre = g;
      [...chipsEl.children].forEach(c => c.classList.toggle('on', c.textContent === g));
      render();
    };
    chipsEl.appendChild(b);
  });
}

qEl.addEventListener('input', e => { state.q = e.target.value; render(); });
sortEl.addEventListener('change', e => { state.sort = e.target.value; render(); });

function render() {
  const q = state.q.trim().toLowerCase();
  const result = items
    .filter(d =>
      (state.genre === 'Alle' || d.genres.includes(state.genre)) &&
      (!q || (d.title + ' ' + d.desc + ' ' + d.genres.join(' ')).toLowerCase().includes(q)))
    .sort((a, b) => state.sort === 'title'
      ? a.title.localeCompare(b.title, 'nn')
      : b[state.sort] - a[state.sort]);

  countEl.textContent = result.length + (type === 'film' ? ' filmar' : ' seriar');
  grid.innerHTML = '';

  if (!result.length) {
    grid.innerHTML = '<div class="none">Ingen treff. Prøv eit anna søk.</div>';
    return;
  }

  result.forEach(d => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = '<span class="rate"></span><h3></h3><div class="meta"></div><p></p><div class="tags"></div>';
    card.querySelector('.rate').textContent = '★ ' + d.rating.toFixed(1);
    card.querySelector('h3').textContent = d.title;
    card.querySelector('.meta').textContent = d.year + ' · ' + d.length;
    card.querySelector('p').textContent = d.desc;
    d.genres.forEach(g => {
      const t = document.createElement('span');
      t.className = 'tag';
      t.textContent = g;
      card.querySelector('.tags').appendChild(t);
    });
    grid.appendChild(card);
  });
}
