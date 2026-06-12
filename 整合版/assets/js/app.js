(() => {
  const data = window.FMJJ_INTEGRATED_DATA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const make = (tag, cls) => { const el = document.createElement(tag); if (cls) el.className = cls; return el; };
  let activeCategory = 'popular';
  let activeTrackId = null;

  function initTheme(){
    const saved = localStorage.getItem('fmjj-integrated-theme') || 'light';
    document.documentElement.dataset.theme = saved;
    $('#themeToggle').textContent = saved === 'dark' ? '☀' : '☾';
    $('#themeToggle').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('fmjj-integrated-theme', next);
      $('#themeToggle').textContent = next === 'dark' ? '☀' : '☾';
    });
  }

  function initHeader(){
    const header = $('#siteHeader');
    const menu = $('#menuToggle');
    const nav = $('#siteNav');
    menu.addEventListener('click', () => {
      const open = header.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', e => {
      if(e.target.tagName === 'A'){
        header.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
      }
    });
    window.addEventListener('scroll', () => header.classList.toggle('compact', window.scrollY > 18), {passive:true});
    const sections = ['profile','music','platforms','timeline','gallery','sources'].map(id => document.getElementById(id));
    const links = $$('.site-nav a');
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, {rootMargin:'-35% 0px -55% 0px', threshold:.01});
    sections.forEach(sec => sec && io.observe(sec));
  }

  function initBgm(){
    const audio = $('#bgmAudio');
    const btn = $('#bgmToggle');
    if(!audio) return;
    btn.addEventListener('click', async () => {
      try{
        if(audio.paused){ await audio.play(); btn.classList.add('playing'); btn.textContent = '♫'; }
        else { audio.pause(); btn.classList.remove('playing'); btn.textContent = '♪'; }
      }catch(err){
        btn.textContent = '!';
        btn.title = '浏览器阻止了自动播放，请再次点击或检查音频文件。';
      }
    });
    audio.addEventListener('pause', () => btn.classList.remove('playing'));
  }

  function renderHero(){
    $('#heroTags').innerHTML = data.profile.tags.slice(0, 8).map((tag, i) => `<span class="pill ${i < 3 ? 'strong' : ''}">${tag}</span>`).join('');
    $('#statsRow').innerHTML = data.profile.stats.map(s => `<article class="stat-card reveal"><b>${s.value}</b><span>${s.label}</span></article>`).join('');
  }

  function renderProfile(){
    $('#profileIntro').textContent = data.profile.intro;
    $('#profileQuote').textContent = `“${data.profile.quote}”`;
    $('#factGrid').innerHTML = data.profile.facts.map(f => `<article class="fact-card reveal"><span>${f.label}</span><b>${f.value}</b></article>`).join('');
    $('#tagCloud').innerHTML = data.profile.tags.map(t => `<span>${t}</span>`).join('');
    $('#verificationNote').textContent = data.profile.verificationNote;
  }

  function renderMusicTabs(){
    $('#musicTabs').innerHTML = data.musicCategories.map(c => `<button class="tab-btn ${c.id === activeCategory ? 'active' : ''}" data-cat="${c.id}" role="tab" type="button">${c.label}</button>`).join('');
    $('#musicTabs').addEventListener('click', e => {
      const btn = e.target.closest('.tab-btn');
      if(!btn) return;
      activeCategory = btn.dataset.cat;
      $$('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      renderSongs();
    });
    $('#songSearch').addEventListener('input', renderSongs);
  }

  function songMatches(track, term){
    if(!track.category.includes(activeCategory)) return false;
    if(!term) return true;
    return `${track.title} ${track.year} ${track.tag} ${track.desc} ${track.category.join(' ')}`.toLowerCase().includes(term);
  }

  function renderSongs(){
    const term = $('#songSearch').value.trim().toLowerCase();
    const songs = data.tracks.filter(t => songMatches(t, term));
    const grid = $('#songGrid');
    grid.innerHTML = songs.length ? songs.map(t => `<article class="song-card reveal ${t.id === activeTrackId ? 'active' : ''}" tabindex="0" data-id="${t.id}">
      <p class="eyebrow">${t.year}</p><h3>${t.title}</h3><p class="song-meta">${t.tag}</p><p class="song-desc">${t.desc}</p>
      <div class="song-badges">${t.category.map(c => `<span>${(data.musicCategories.find(x=>x.id===c)||{}).label || c}</span>`).join('')}<span>${t.players.length} 个入口</span></div>
    </article>`).join('') : '<p class="verification-note">没有匹配的曲目。</p>';
    $$('.song-card', grid).forEach(card => {
      const play = () => setPlayer(card.dataset.id, 0, true);
      card.addEventListener('click', play);
      card.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }});
    });
    requestAnimationFrame(initReveal);
  }

  function setPlayer(trackId, sourceIndex = 0, scroll = false){
    const track = data.tracks.find(t => t.id === trackId) || data.tracks[0];
    activeTrackId = track.id;
    const source = track.players[sourceIndex] || track.players[0];
    $('#playerCover').src = track.cover;
    $('#playerCover').alt = `${track.title} 封面`;
    $('#playerTitle').textContent = track.title;
    $('#playerMeta').textContent = `${track.year} · ${track.tag}`;
    $('#playerDesc').textContent = track.desc;
    $('#playerSources').innerHTML = track.players.map((p, i) => `<button class="source-tab ${i === sourceIndex ? 'active' : ''}" type="button" data-i="${i}">${p.label}</button>`).join('');
    $('#playerSources').onclick = e => {
      const btn = e.target.closest('.source-tab');
      if(btn) setPlayer(track.id, Number(btn.dataset.i), false);
    };
    const frame = $('#playerFrame');
    if(source.type === 'embed'){
      frame.innerHTML = `<iframe title="${track.title} - ${source.label}" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen src="${source.src}"></iframe>`;
    }else if(source.type === 'netease'){
      frame.innerHTML = `<iframe title="${track.title} - 网易云音乐试听" loading="lazy" allow="autoplay" src="https://music.163.com/outchain/player?type=2&id=${source.id}&auto=0&height=66"></iframe>`;
    }else{
      frame.innerHTML = `<div class="empty-player">↗<span>该曲目当前提供外部入口，请点击下方按钮打开。</span></div>`;
    }
    const external = $('#playerExternal');
    external.href = source.url || '#';
    external.classList.toggle('disabled', !source.url);
    external.textContent = source.url ? `打开 ${source.label}` : '暂无外部入口';
    $$('.song-card').forEach(card => card.classList.toggle('active', card.dataset.id === track.id));
    if(scroll) $('#playerPanel').scrollIntoView({behavior:'smooth', block:'nearest'});
  }

  function initClearPlayer(){
    $('#clearPlayer').addEventListener('click', () => {
      activeTrackId = null;
      $('#playerCover').src = 'assets/images/brand/cover_fanghuaman.svg';
      $('#playerTitle').textContent = '选择一首歌';
      $('#playerMeta').textContent = '点击左侧曲目卡片，在这里加载播放器。';
      $('#playerDesc').textContent = '本站不保存受版权保护的音乐文件；有公开嵌入能力的平台会以内嵌播放器展示，其余提供外部搜索或打开入口。';
      $('#playerSources').innerHTML = '';
      $('#playerFrame').innerHTML = '<div class="empty-player">♪<span>播放器将在这里出现</span></div>';
      $('#playerExternal').href = '#';
      $('#playerExternal').classList.add('disabled');
      $('#playerExternal').textContent = '打开外部平台';
      $$('.song-card').forEach(card => card.classList.remove('active'));
    });
  }

  function renderPlatforms(){
    $('#platformGrid').innerHTML = data.platforms.map(p => `<article class="platform-card reveal" style="--accent:${p.color}"><h3>${p.name}</h3><p>${p.type}</p><small>${p.handle}</small><a class="open" href="${p.url}" target="_blank" rel="noopener">打开主页 ↗</a></article>`).join('');
    $('#contactCard').innerHTML = `<h3>商务合作 / 快速联系</h3><p>${data.contact.note}</p><div class="contact-list"><a href="mailto:${data.contact.email}"><span>邮箱</span><b>${data.contact.email}</b></a><div><span>商务微信</span><b>${data.contact.wechat}</b></div><a href="https://space.bilibili.com/1467772" target="_blank" rel="noopener"><span>B站主页</span><b>UID 1467772</b></a><a href="https://weibo.com/n/%E5%B0%81%E8%8C%97%E5%9B%A7%E8%8F%8C" target="_blank" rel="noopener"><span>微博</span><b>@封茗囧菌</b></a></div>`;
  }

  function renderTimeline(){
    $('#timelineList').innerHTML = data.timeline.map(item => `<article class="timeline-item reveal"><div class="timeline-year">${item.year}</div><div class="timeline-card"><h3>${item.title}</h3><p>${item.text}</p><small>来源：${item.source}</small></div></article>`).join('');
  }

  function renderGallery(){
    const items = data.gallery.map((g, i) => `<figure class="gallery-item reveal" data-index="${i}"><img src="${g.src}" alt="${g.title}" loading="lazy"><figcaption><b>${g.title}</b><span>${g.desc}</span></figcaption></figure>`).join('');
    $('#galleryGrid').innerHTML = items;
    $('#ribbonTrack').innerHTML = data.gallery.map((g, i) => `<figure class="ribbon-card" data-index="${i}"><img src="${g.src}" alt="${g.title}" loading="lazy"><div><b>${g.title}</b><span>${g.desc}</span></div></figure>`).join('');
    const open = index => openLightbox(data.gallery[index]);
    $$('#galleryGrid .gallery-item, #ribbonTrack .ribbon-card').forEach(card => card.addEventListener('click', () => open(Number(card.dataset.index))));
    $$('.gallery-mode').forEach(btn => btn.addEventListener('click', () => {
      $$('.gallery-mode').forEach(b => b.classList.toggle('active', b === btn));
      const mode = btn.dataset.mode;
      $('#galleryGrid').hidden = mode !== 'grid';
      $('#galleryRibbon').hidden = mode !== 'ribbon';
    }));
  }

  function openLightbox(g){
    $('#lightboxImg').src = g.src;
    $('#lightboxImg').alt = g.title;
    $('#lightboxTitle').textContent = g.title;
    $('#lightboxDesc').textContent = g.desc;
    $('#lightbox').classList.add('open');
  }
  function initLightbox(){
    const lb = $('#lightbox');
    $('#closeLightbox').addEventListener('click', () => lb.classList.remove('open'));
    lb.addEventListener('click', e => { if(e.target === lb) lb.classList.remove('open'); });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') lb.classList.remove('open'); });
  }

  function renderSources(){
    $('#sourceGrid').innerHTML = data.sources.map(s => `<article class="source-card reveal"><h3>${s.title}</h3><p>${s.text}</p></article>`).join('');
  }

  function initReveal(){
    const nodes = $$('.reveal:not(.visible)');
    if(!('IntersectionObserver' in window)) { nodes.forEach(n => n.classList.add('visible')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('visible'); io.unobserve(entry.target); }});
    }, {threshold:.08, rootMargin:'0px 0px -8% 0px'});
    nodes.forEach(n => io.observe(n));
  }

  function initTilt(){
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateY(${x*5}deg) rotateX(${-y*5}deg)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
  }

  function initSparkCanvas(){
    const canvas = $('#sparkCanvas');
    const ctx = canvas.getContext('2d');
    if(!ctx || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let w, h, dots = [];
    function resize(){
      w = canvas.width = Math.floor(innerWidth * devicePixelRatio);
      h = canvas.height = Math.floor(innerHeight * devicePixelRatio);
      canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px';
      dots = Array.from({length: Math.min(90, Math.floor(innerWidth/16))}, () => ({x:Math.random()*w,y:Math.random()*h,r:(Math.random()*2+1)*devicePixelRatio,v:Math.random()*0.35+0.08,a:Math.random()*Math.PI*2}));
    }
    function draw(){
      ctx.clearRect(0,0,w,h);
      dots.forEach(d => {
        d.y -= d.v * devicePixelRatio; d.x += Math.sin(d.a += .01) * .18 * devicePixelRatio;
        if(d.y < -10) { d.y = h + 10; d.x = Math.random()*w; }
        const grd = ctx.createRadialGradient(d.x,d.y,0,d.x,d.y,d.r*8);
        grd.addColorStop(0,'rgba(255,159,196,.22)'); grd.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(d.x,d.y,d.r*8,0,Math.PI*2); ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    resize(); draw(); addEventListener('resize', resize, {passive:true});
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme(); initHeader(); initBgm(); renderHero(); renderProfile(); renderMusicTabs(); renderSongs(); initClearPlayer(); renderPlatforms(); renderTimeline(); renderGallery(); renderSources(); initLightbox(); initReveal(); initTilt(); initSparkCanvas();
    setPlayer('fanghuaman', 0, false);
  });
})();
