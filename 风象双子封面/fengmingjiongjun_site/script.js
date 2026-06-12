const data = window.FMJ_DATA;
const $ = (sel) => document.querySelector(sel);
const make = (tag, cls) => { const el = document.createElement(tag); if (cls) el.className = cls; return el; };

document.documentElement.dataset.theme = localStorage.getItem('fmj-theme') || 'light';
$('#themeToggle').textContent = document.documentElement.dataset.theme === 'dark' ? '☀' : '☾';
$('#themeToggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('fmj-theme', next);
  $('#themeToggle').textContent = next === 'dark' ? '☀' : '☾';
});

$('#englishName').textContent = data.profile.englishName;
$('#profileText').textContent = `${data.profile.name}，${data.profile.style}。公开资料记录其自 ${data.profile.activeSince}，代表内容包括原创、翻唱、国风音乐与二次元相关曲目。`;
$('#aliasText').textContent = data.profile.aliases.join(' / ');
$('#fanName').textContent = data.profile.fanName;
$('#styleText').textContent = data.profile.style;
$('#verifiedNote').textContent = data.profile.verifiedNote;
const roleTags = $('#roleTags');
data.profile.roles.forEach(role => { const span = make('span'); span.textContent = role; roleTags.appendChild(span); });

const songGrid = $('#songGrid');
function renderSongs(filter = '') {
  songGrid.innerHTML = '';
  const term = filter.trim().toLowerCase();
  const songs = data.topSongs.filter(s => !term || `${s.title}${s.tag}${s.year}${s.source}`.toLowerCase().includes(term));
  songs.forEach((song, index) => {
    const card = make('article', 'song-card');
    card.innerHTML = `<h3>${index + 1}. ${song.title}</h3><p>${song.tag}</p><div class="song-meta"><span class="pill">${song.year}</span><span class="pill source">${song.source}</span></div>`;
    songGrid.appendChild(card);
  });
  if (!songs.length) {
    const empty = make('p'); empty.textContent = '没有匹配的歌曲。'; songGrid.appendChild(empty);
  }
}
renderSongs();
$('#songSearch').addEventListener('input', e => renderSongs(e.target.value));

const platformGrid = $('#platformGrid');
data.platforms.forEach(p => {
  const card = make('article', `platform-card ${p.url ? '' : 'disabled'}`);
  const link = p.url ? `<a class="link" href="${p.url}" target="_blank" rel="noopener">打开主页 ↗</a>` : `<span class="link">站内搜索同ID</span>`;
  card.innerHTML = `<div class="top"><h3>${p.name}</h3><span class="kind">${p.kind}</span></div><p><b>ID：</b>${p.handle}</p><p>${p.verified}</p>${link}`;
  platformGrid.appendChild(card);
});

const imageGrid = $('#imageGrid');
data.imageCards.forEach(img => {
  const card = make('figure', 'image-card');
  card.innerHTML = `<img src="${img.url}" alt="${img.title}" onerror="this.src='./assets/images/avatar-placeholder.svg'"><figcaption class="image-caption"><h3>${img.title}</h3><p>${img.source} · ${img.note}</p></figcaption>`;
  imageGrid.appendChild(card);
});

const timeline = document.querySelector('.timeline');
data.timeline.forEach(item => {
  const el = make('article', 'timeline-item');
  el.innerHTML = `<div class="year">${item.year}</div><div><h3>${item.title}</h3><p>${item.desc}</p></div>`;
  timeline.appendChild(el);
});

const sourceList = $('#sourceList');
data.sources.forEach(s => {
  const item = make('article', 'source-item');
  item.innerHTML = `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a><p>${s.usedFor}</p>`;
  sourceList.appendChild(item);
});
