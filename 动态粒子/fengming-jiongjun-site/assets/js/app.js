(() => {
  const data = window.FMJJ_DATA;
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const setText = (sel, text) => {
    const node = $(sel);
    if (node) node.textContent = text;
  };

  setText('#heroIntro', data.profile.heroLine + ' ' + data.profile.intro);
  setText('#bioText', data.profile.intro);
  setText('#updatedDate', data.meta.updated);
  const heroImage = $('#heroImage');
  if (heroImage && data.gallery[0]) {
    heroImage.src = data.gallery[0].url;
    heroImage.onerror = () => { heroImage.src = 'assets/img/portrait-fallback.svg'; };
  }

  const tagMarquee = $('#tagMarquee');
  if (tagMarquee) {
    const tags = [...data.profile.tags, '乳酸菌', '淡黄色', '淡粉色', 'GSAP 动效', '站内嵌入播放'];
    [...tags, ...tags].forEach(t => tagMarquee.appendChild(el('span', 'tag', t)));
  }

  const tagCloud = $('#tagCloud');
  data.profile.tags.forEach(t => tagCloud?.appendChild(el('span', '', t)));

  const statsGrid = $('#statsGrid');
  data.profile.stats.forEach(item => {
    const card = el('article', 'stat-card reveal');
    card.innerHTML = `<span>${item.label}</span><strong>${item.value}</strong><small>${item.detail}</small>`;
    statsGrid?.appendChild(card);
  });

  const factsGrid = $('#factsGrid');
  data.profile.facts.forEach(item => {
    const card = el('article', 'fact-card reveal');
    card.innerHTML = `<span>${item.label}</span><strong>${item.value}</strong><small>${item.source}</small>`;
    factsGrid?.appendChild(card);
  });

  const sourceLabel = src => src.type === 'external' ? `${src.name} ↗` : src.name;
  const tracksGrid = $('#tracksGrid');
  data.tracks.forEach((track, index) => {
    const card = el('article', 'track-card reveal');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `播放 ${track.title}`);
    const playable = track.sources.filter(s => s.type === 'embed');
    card.innerHTML = `
      <div class="track-top"><h3>${track.title}</h3><span class="track-year">${track.year}</span></div>
      <p><strong>${track.type}</strong><br>${track.why}</p>
      <div class="track-tags">${track.tags.map(t => `<span class="track-chip">${t}</span>`).join('')}</div>
      <div class="track-sources">${track.sources.slice(0, 4).map(s => `<span class="source-chip">${sourceLabel(s)}</span>`).join('')}</div>
      <button class="play-cta" type="button" aria-label="播放 ${track.title}">${playable.length ? '▶' : '↗'}</button>`;
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    const play = () => setPlayer(track.id, 0);
    card.addEventListener('click', play);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
    });
    tracksGrid?.appendChild(card);
    if (index === 0) card.classList.add('is-suggested');
  });

  const playerTitle = $('#playerTitle');
  const playerMeta = $('#playerMeta');
  const sourceTabs = $('#sourceTabs');
  const embedFrameWrap = $('#embedFrameWrap');
  const clearPlayer = $('#clearPlayer');

  window.setPlayer = (trackId, sourceIndex = 0) => {
    const track = data.tracks.find(t => t.id === trackId) || data.tracks[0];
    const sources = track.sources;
    let selected = sources[sourceIndex] || sources.find(s => s.type === 'embed') || sources[0];
    playerTitle.textContent = track.title;
    playerMeta.textContent = `${track.year} · ${track.type} · ${track.mood}`;
    sourceTabs.innerHTML = '';
    sources.forEach((source, i) => {
      if (source.type === 'embed') {
        const btn = el('button', `source-tab ${source === selected ? 'active' : ''}`, source.name);
        btn.type = 'button';
        btn.addEventListener('click', () => window.setPlayer(track.id, i));
        sourceTabs.appendChild(btn);
      } else {
        const a = el('a', 'source-tab external', source.name + ' ↗');
        a.href = source.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        sourceTabs.appendChild(a);
      }
    });
    if (selected?.type === 'embed') {
      embedFrameWrap.className = 'embed-frame ' + (selected.name.includes('Apple') ? 'apple' : '');
      embedFrameWrap.innerHTML = `<iframe title="${track.title} - ${selected.name}" loading="lazy" allow="autoplay; encrypted-media; clipboard-write; picture-in-picture; fullscreen" allowfullscreen src="${selected.embed}"></iframe>`;
    } else if (selected?.url) {
      embedFrameWrap.className = 'embed-frame empty';
      embedFrameWrap.innerHTML = `<div class="empty-player"><span>↗</span><p>该来源只有外部链接：<a href="${selected.url}" target="_blank" rel="noopener noreferrer">打开 ${selected.name}</a></p></div>`;
    }
    $('#music')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  clearPlayer?.addEventListener('click', () => {
    playerTitle.textContent = '选择一首歌';
    playerMeta.textContent = '点击右侧曲目卡片，站内播放器会在这里加载。';
    sourceTabs.innerHTML = '';
    embedFrameWrap.className = 'embed-frame empty';
    embedFrameWrap.innerHTML = '<div class="empty-player"><span>♪</span><p>这里会出现平台播放器</p></div>';
  });

  const platformGrid = $('#platformGrid');
  data.platforms.forEach(p => {
    const card = el('article', 'platform-card reveal');
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.kind}</p>
      <span class="trust">可信度：${p.trust}</span>
      <small><strong>${p.handle}</strong><br>${p.note}</small>
      <div class="platform-actions">${p.url ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer">打开主页</a>` : `<span>待补直链</span>`}</div>`;
    platformGrid?.appendChild(card);
  });

  const galleryGrid = $('#galleryGrid');
  data.gallery.forEach((g, i) => {
    const card = el('figure', 'gallery-card reveal');
    card.innerHTML = `<img src="${g.url}" alt="${g.title}" loading="lazy"><figcaption class="gallery-caption"><strong>${g.title}</strong><span>${g.source}</span></figcaption>`;
    const img = $('img', card);
    img.onerror = () => { img.src = 'assets/img/portrait-fallback.svg'; };
    galleryGrid?.appendChild(card);
  });

  const timeline = $('#timelineList');
  data.timeline.forEach(item => {
    const row = el('article', 'timeline-item reveal');
    row.innerHTML = `<div class="timeline-year">${item.year}</div><div class="timeline-card"><h3>${item.title}</h3><p>${item.text}</p><small>来源：${item.source}</small></div>`;
    timeline?.appendChild(row);
  });

  const paletteGrid = $('#paletteGrid');
  data.palette.forEach(p => {
    const card = el('article', 'palette-card reveal');
    card.innerHTML = `<div class="swatch" style="background:${p.hex}"></div><strong>${p.name}</strong><small>${p.hex}<br>${p.usage}</small>`;
    paletteGrid?.appendChild(card);
  });

  const warningsList = $('#warningsList');
  if (warningsList) warningsList.innerHTML = `<ul>${data.warnings.map(w => `<li>${w}</li>`).join('')}</ul>`;

  const sourceList = $('#sourceList');
  data.sourceLinks.forEach(s => {
    const item = el('article', 'source-item reveal');
    item.innerHTML = `<div><strong>${s.name}</strong><span>${s.use}</span></div><a href="${s.url}" target="_blank" rel="noopener noreferrer">查看</a>`;
    sourceList?.appendChild(item);
  });

  const navToggle = $('.nav-toggle');
  const header = $('.site-header');
  navToggle?.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.site-nav a').forEach(a => a.addEventListener('click', () => header.classList.remove('open')));

  function initAnimations(){
    document.body.classList.add('site-ready');
    if (!window.gsap) {
      document.body.classList.add('ready-no-gsap');
      return;
    }
    gsap.registerPlugin(window.ScrollTrigger);
    gsap.to('.reveal', { opacity: 1, y: 0, duration: .75, ease: 'power3.out', stagger: .04, scrollTrigger: { trigger: 'body', start: 'top top' }});
    gsap.utils.toArray('.section-heading, .glass-card, .track-card, .platform-card, .gallery-card, .timeline-item, .palette-card, .source-item, .fact-card, .stat-card').forEach((node) => {
      gsap.fromTo(node, { autoAlpha: 0, y: 42, scale: .985 }, { autoAlpha: 1, y: 0, scale: 1, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: node, start: 'top 86%', once: true }});
    });
    gsap.to('.blob-a', { xPercent: 12, yPercent: -8, duration: 9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.blob-b', { xPercent: -10, yPercent: 12, duration: 11, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.blob-c', { xPercent: 8, yPercent: -14, duration: 10, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.utils.toArray('[data-parallax]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        gsap.to(card, { rotateY: x * 10, rotateX: -y * 8, duration: .45, ease: 'power2.out', transformPerspective: 900 });
      });
      card.addEventListener('mouseleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: .7, ease: 'elastic.out(1,.45)' }));
    });
    gsap.utils.toArray('.magnetic').forEach(node => {
      node.addEventListener('mousemove', e => {
        const r = node.getBoundingClientRect();
        gsap.to(node, { x: (e.clientX - r.left - r.width / 2) * .18, y: (e.clientY - r.top - r.height / 2) * .18, duration: .35, ease: 'power2.out' });
      });
      node.addEventListener('mouseleave', () => gsap.to(node, { x: 0, y: 0, duration: .45, ease: 'elastic.out(1,.4)' }));
    });
    gsap.to('.portrait-frame', { y: -14, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.marquee-track', { xPercent: -50, duration: 34, ease: 'none', repeat: -1 });
  }

  let lastStar = 0;
  window.addEventListener('pointermove', e => {
    const now = Date.now();
    if (now - lastStar < 85 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    lastStar = now;
    const star = el('span', 'cursor-star', ['✦','♪','♡'][Math.floor(Math.random()*3)]);
    star.style.left = e.clientX + 'px';
    star.style.top = e.clientY + 'px';
    document.body.appendChild(star);
    if (window.gsap) {
      gsap.fromTo(star, { x: 0, y: 0, opacity: .9, scale: .6 }, { x: (Math.random()-.5)*52, y: -52 - Math.random()*40, opacity: 0, scale: 1.4, rotate: Math.random()*120, duration: .9, ease: 'power2.out', onComplete: () => star.remove() });
    } else {
      setTimeout(() => star.remove(), 900);
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAnimations);
  else initAnimations();
})();
