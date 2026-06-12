(function(){
  'use strict';

  const data = window.FMJJ_DATA || {};
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function esc(value){
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
    }[ch]));
  }

  function sourceName(id){
    const list = data.sources || [];
    const s = list.find(x => x.id === id);
    return s ? s.name : (id || '未标注来源');
  }

  function sourceUrl(id){
    const list = data.sources || [];
    const s = list.find(x => x.id === id);
    return s ? s.url : '#';
  }

  function sourceIcon(item){
    const text = `${item.name || ''} ${item.type || ''}`.toLowerCase();
    if(text.includes('bilibili')) return 'B';
    if(text.includes('微博') || text.includes('weibo')) return '微';
    if(text.includes('apple')) return '';
    if(text.includes('spotify')) return 'S';
    if(text.includes('youtube')) return 'YT';
    if(text.includes('5sing')) return '5';
    if(text.includes('酷狗')) return '酷';
    if(text.includes('酷我')) return 'K';
    if(text.includes('qq')) return 'Q';
    if(text.includes('amazon')) return 'A';
    if(text.includes('猫耳')) return 'M';
    if(text.includes('网易')) return '云';
    if(text.includes('百科') || text.includes('wiki')) return '百';
    if(text.includes('image') || text.includes('图')) return '▣';
    if(text.includes('data') || text.includes('audit')) return '{}';
    return '✦';
  }

  function platformIcon(item){
    return sourceIcon({name:item.name, type:item.type});
  }

  function playerSourceUrl(player){
    return player.url || player.src || '#';
  }

  function isEmbeddable(player){
    return Boolean(player && player.src && player.type !== 'external');
  }

  function readableSourceList(ids){
    return (ids || []).map(sourceName).join(' / ') || '项目资料包';
  }

  function fallbackImage(){
    return 'assets/images/gallery/bili_fengxiangshuangzi_cover.webp';
  }

  function initFacts(){
    const p = data.profile || {};
    const items = p.profile_keywords || [
      {label:'艺名', value:p.name || '封茗囧菌'},
      {label:'英文名', value:p.english_name || 'Mandi Sa'},
      {label:'公开生日', value:p.birthday_public || '06·07'},
      {label:'星座', value:p.zodiac || '双子座'},
      {label:'代表作', value:(p.representative_works || []).slice(0,3).join(' / ')},
      {label:'商务邮箱', value:p.contact && p.contact.email}
    ];
    const factList = $('#factList');
    if(factList){
      factList.innerHTML = items.map(item => `
        <div class="fact reveal card-floatable">
          <small>${esc(item.label)}</small>
          <strong>${esc(item.value)}</strong>
        </div>`).join('');
    }
    const profileLead = $('#profileLead');
    if(profileLead){
      const identity = (p.primary_identity || []).join('、');
      profileLead.textContent = `${p.name || '封茗囧菌'}（${p.english_name || 'Mandi Sa'}）的资料页：重点整理${identity || '音乐人身份'}、代表曲目、公开平台入口、风格关键词与本地相册素材。`;
    }
    const pills = $('#stylePills');
    if(pills){
      pills.innerHTML = (p.style_keywords || []).map(x => `<span class="pill reveal card-floatable">${esc(x)}</span>`).join('');
    }
  }

  function initMarquee(){
    const target = $('#tagMarquee');
    if(!target) return;
    const p = data.profile || {};
    const keywords = [
      ...(p.style_keywords || []),
      ...(p.representative_works || []).slice(0,8),
      'Apple Music', 'Spotify', 'Bilibili', 'YouTube Music', '5sing', '网易云搜索入口', '背景音乐', '双模式相册'
    ].filter(Boolean);
    const repeated = [...keywords, ...keywords, ...keywords];
    target.innerHTML = repeated.map(x => `<span>${esc(x)}</span>`).join('');
  }

  function initTracks(){
    const list = $('#trackList');
    if(!list) return;
    const tracks = data.tracks || [];
    list.innerHTML = tracks.map((track, index) => {
      const sourceText = readableSourceList(track.sources).split(' / ')[0];
      return `<button class="track-option reveal card-floatable ${index === 0 ? 'active' : ''}" type="button" data-track-index="${index}">
        <img src="${esc(track.cover || fallbackImage())}" alt="${esc(track.title)}封面" loading="lazy">
        <span class="track-info">
          <b>${esc(track.title)}</b>
          <small>${esc(track.year || '')} · ${esc(track.tag || '')}</small>
          <em>${esc(sourceText)}</em>
        </span>
      </button>`;
    }).join('');

    list.addEventListener('click', event => {
      const btn = event.target.closest('.track-option');
      if(!btn) return;
      const index = Number(btn.dataset.trackIndex);
      selectTrack(index, {scroll:true});
    });

    if(tracks.length){
      selectTrack(0, {scroll:false});
    }
  }

  function firstPlayableIndex(track){
    const players = track.players || [];
    const preferred = players.findIndex(isEmbeddable);
    return preferred >= 0 ? preferred : 0;
  }

  function selectTrack(trackIndex, opts={}){
    const tracks = data.tracks || [];
    const track = tracks[trackIndex];
    if(!track) return;
    $$('.track-option').forEach((el, i) => el.classList.toggle('active', i === trackIndex));
    renderTrackHeader(track);
    renderPlayerTabs(track, trackIndex, firstPlayableIndex(track));
    renderPlayer(track, trackIndex, firstPlayableIndex(track));
    if(opts.scroll){
      const panel = $('#playerPanel');
      if(panel) panel.scrollIntoView({behavior:'smooth', block:'nearest'});
    }
  }

  function renderTrackHeader(track){
    const name = $('#currentTrackName');
    const meta = $('#currentTrackMeta');
    if(name) name.textContent = track.title || '未命名曲目';
    if(meta){
      const sourceText = readableSourceList(track.sources);
      meta.textContent = `${track.year || '年份待核'} · ${track.tag || '曲目'}｜${track.summary || ''}｜来源：${sourceText}`;
    }
  }

  function renderPlayerTabs(track, trackIndex, activeIndex){
    const tabs = $('#playerTabs');
    if(!tabs) return;
    tabs.innerHTML = (track.players || []).map((player, index) => {
      const externalMark = isEmbeddable(player) ? '' : '<small>外链</small>';
      return `<button class="player-tab ${index === activeIndex ? 'active' : ''} ${isEmbeddable(player) ? '' : 'external'}" type="button" data-track-index="${trackIndex}" data-player-index="${index}">
        ${esc(player.label || `接口 ${index + 1}`)}${externalMark}
      </button>`;
    }).join('');
    tabs.onclick = event => {
      const btn = event.target.closest('.player-tab');
      if(!btn) return;
      const nextTrack = (data.tracks || [])[Number(btn.dataset.trackIndex)];
      const nextIndex = Number(btn.dataset.playerIndex);
      renderPlayerTabs(nextTrack, Number(btn.dataset.trackIndex), nextIndex);
      renderPlayer(nextTrack, Number(btn.dataset.trackIndex), nextIndex);
    };
  }

  function renderPlayer(track, trackIndex, playerIndex){
    const player = (track.players || [])[playerIndex] || (track.players || [])[0];
    const frame = $('#musicFrame');
    const placeholder = $('#playerPlaceholder');
    const actions = $('#playerActions');
    if(!player || !frame || !placeholder) return;

    $$('.player-tab').forEach((el, index) => el.classList.toggle('active', index === playerIndex));
    const canEmbed = isEmbeddable(player);
    if(canEmbed){
      frame.title = `${track.title} - ${player.label} 网页内播放`;
      frame.src = player.src;
      frame.classList.remove('is-empty');
      placeholder.classList.add('hidden');
      placeholder.classList.remove('no-embed');
      placeholder.innerHTML = `<span>♪</span><p>正在加载 ${esc(player.label)} 播放器；部分平台可能需要允许第三方 Cookie 或在新窗口打开。</p>`;
    } else {
      frame.title = `${track.title} - 外部平台入口`;
      frame.src = 'about:blank';
      frame.classList.add('is-empty');
      placeholder.classList.remove('hidden');
      placeholder.classList.add('no-embed');
      placeholder.innerHTML = `<span>↗</span><p>${esc(player.label || '外部入口')} 不直接嵌入网页播放器。已保留搜索 / 平台入口，避免未核验接口错播。</p><a class="btn secondary" href="${esc(playerSourceUrl(player))}" target="_blank" rel="noreferrer">打开外部入口</a>`;
    }

    if(actions){
      const links = (track.players || []).map((item, index) => {
        const label = index === playerIndex ? `当前：${item.label}` : item.label;
        return `<a class="player-link ${index === playerIndex ? 'active' : ''}" href="${esc(playerSourceUrl(item))}" target="_blank" rel="noreferrer">${esc(label)}</a>`;
      }).join('');
      actions.innerHTML = `${links}<button class="player-link" type="button" id="reloadPlayer">重载当前播放器</button>`;
      const reload = $('#reloadPlayer');
      if(reload){
        reload.onclick = () => {
          if(isEmbeddable(player)){
            const current = frame.src;
            frame.src = 'about:blank';
            window.setTimeout(() => { frame.src = current; }, 120);
          }
        };
      }
    }
  }

  function initPlatforms(){
    const grid = $('#platformGrid');
    if(!grid) return;
    grid.innerHTML = (data.platforms || []).map(item => `
      <a class="platform-card reveal card-floatable" href="${esc(item.url)}" target="_blank" rel="noreferrer">
        <span class="platform-icon">${esc(platformIcon(item))}</span>
        <b>${esc(item.name)}</b>
        <span>${esc(item.handle || '')}<br>${esc(item.type || '')}</span>
        <em>${esc(item.note ? `备注：${item.note}` : `来源：${sourceName(item.verified_by)}`)}</em>
      </a>`).join('');
  }

  function initMusicMaps(){
    const box = $('#musicMaps');
    if(!box) return;
    const m = data.popular_music || {};
    const cards = [
      ['Apple Music Top Songs', m.apple_music_top_sample || [], ''],
      ['5sing 热门歌曲采样', m.five_sing_hot_sample || [], '5'],
      ['YouTube Music Top Songs', m.youtube_music_top_sample || [], 'YT']
    ];
    box.innerHTML = cards.map(([title, items, icon]) => `
      <article class="list-card panel reveal card-floatable">
        <h3><span class="source-icon small">${esc(icon)}</span>${esc(title)}</h3>
        <ol>${items.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
      </article>`).join('');
  }

  function initTimeline(){
    const box = $('#timeline');
    if(!box) return;
    box.innerHTML = (data.timeline || []).map((item, index) => `
      <article class="time-item ${index % 2 ? 'right' : 'left'} reveal">
        <div class="time-year">${esc(item.year)}</div>
        <div class="time-card card-floatable">
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.desc)}</p>
          <small>来源：${esc(sourceName((item.source || '').split('/')[0]))} · ${esc(item.confidence || 'marked')}</small>
        </div>
      </article>`).join('');
  }

  function openLightbox(src, title, desc, source){
    const lightbox = $('#lightbox');
    const img = $('#lightboxImg');
    if(!lightbox || !img) return;
    img.src = src || fallbackImage();
    img.onerror = () => { img.onerror = null; img.src = fallbackImage(); };
    $('#lightboxTitle').textContent = title || '图片预览';
    $('#lightboxDesc').textContent = `${desc || ''}${source ? ` 来源：${source}。` : ''}`;
    lightbox.classList.add('open');
  }

  function initGallery(){
    const color = $('#galleryGrid');
    const carousel = $('#scrollCarousel');
    const classes = ['wide', '', 'tall', '', '', '', 'wide', '', '', ''];

    if(color){
      color.innerHTML = (data.images || []).map((img, index) => `
        <figure class="gallery-item ${classes[index] || ''} reveal card-floatable" data-img="${esc(img.web_file)}" data-title="${esc(img.title)}" data-desc="${esc(img.description)}" data-source="${esc(img.source_name)}">
          <img src="${esc(img.thumb_file || img.web_file || fallbackImage())}" alt="${esc(img.title)}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImage()}';">
          <figcaption>${esc(img.description)}<br>来源：${esc(img.source_name || '项目素材')}</figcaption>
        </figure>`).join('');
      color.addEventListener('click', event => {
        const fig = event.target.closest('.gallery-item');
        if(!fig) return;
        openLightbox(fig.dataset.img, fig.dataset.title, fig.dataset.desc, fig.dataset.source);
      });
    }

    if(carousel){
      carousel.innerHTML = (data.solo_gallery || []).map((img, index) => `
        <figure class="scroll-item" data-scroll-index="${index}" data-img="${esc(img.src)}" data-title="${esc(img.title)}" data-desc="${esc(img.subtitle || '')}" data-source="${esc(img.source || 'solo 囧菌相册')}">
          <div class="scroll-rod scroll-rod-top"></div>
          <div class="scroll-paper">
            <img src="${esc(img.src)}" alt="${esc(img.title)}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImage()}';">
            <figcaption class="scroll-label"><span>${esc(img.title)}</span><small>${esc(img.subtitle || '')}</small></figcaption>
          </div>
          <div class="scroll-rod scroll-rod-bottom"></div>
        </figure>`).join('');
      carousel.addEventListener('click', event => {
        const fig = event.target.closest('.scroll-item');
        if(!fig) return;
        openLightbox(fig.dataset.img, fig.dataset.title, fig.dataset.desc, fig.dataset.source);
      });
    }

    $$('.gallery-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.galleryMode;
        $$('.gallery-mode').forEach(x => {
          const active = x === btn;
          x.classList.toggle('active', active);
          x.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        $$('.gallery-pane').forEach(pane => pane.classList.toggle('active', pane.dataset.galleryPane === mode));
        if(mode === 'scroll') initScrollGallery();
      });
    });

    const lightbox = $('#lightbox');
    const close = $('#closeLightbox');
    if(close) close.onclick = () => lightbox && lightbox.classList.remove('open');
    if(lightbox){
      lightbox.addEventListener('click', event => {
        if(event.target === lightbox) lightbox.classList.remove('open');
      });
    }
  }

  let scrollGalleryReady = false;
  function initScrollGallery(){
    const gallery = $('#scrollGallery');
    const carousel = $('#scrollCarousel');
    if(!gallery || !carousel || scrollGalleryReady) return;
    const items = $$('.scroll-item', carousel);
    if(!items.length) return;
    scrollGalleryReady = true;

    const count = items.length;
    const radius = Math.max(260, Math.min(430, 92 * count));
    const angleStep = 360 / count;
    items.forEach((item, index) => {
      const angle = index * angleStep;
      item.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
      item.style.transitionDelay = `${index * 55}ms`;
    });

    let rotation = 0;
    let paused = false;
    let zoom = 1;
    function frame(){
      if(!paused){
        rotation -= 0.14;
        carousel.style.transform = `translateZ(-${radius}px) rotateY(${rotation}deg) scale(${zoom})`;
      }
      requestAnimationFrame(frame);
    }
    frame();

    gallery.addEventListener('mouseenter', () => { paused = true; });
    gallery.addEventListener('mouseleave', () => { paused = false; });
    gallery.addEventListener('wheel', event => {
      event.preventDefault();
      zoom = Math.max(0.72, Math.min(1.22, zoom + (event.deltaY > 0 ? -0.045 : 0.045)));
      carousel.style.transform = `translateZ(-${radius}px) rotateY(${rotation}deg) scale(${zoom})`;
    }, {passive:false});

    items.forEach(item => {
      item.addEventListener('mouseenter', () => item.classList.add('is-hovered'));
      item.addEventListener('mouseleave', () => item.classList.remove('is-hovered'));
    });
  }

  function initSources(){
    const grid = $('#sourcesGrid');
    if(!grid) return;
    const sourceCards = (data.sources || []).map(item => `
      <article class="source-card reveal card-floatable">
        <span class="source-icon">${esc(sourceIcon(item))}</span>
        <b>${esc(item.name)}</b>
        <span>${esc(item.type)} · ${esc(item.confidence)}</span>
        <em>${esc((item.used_for || []).slice(0,3).join(' / '))}</em>
        <a href="${esc(item.url)}" target="_blank" rel="noreferrer">打开来源</a>
      </article>`).join('');
    const structureCards = (data.file_structure || []).map(item => `
      <article class="source-card structure reveal card-floatable">
        <span class="source-icon">${esc(item.icon || '□')}</span>
        <b>${esc(item.title)}</b>
        <span>${esc(item.text)}</span>
      </article>`).join('');
    grid.innerHTML = sourceCards + structureCards;
  }

  function initCursor(){
    const glow = $('.cursor-glow');
    let lastStar = 0;
    const icons = ['✦', '✧', '♪', '♫', '♡', '☆'];

    window.addEventListener('mousemove', event => {
      if(glow){
        glow.style.left = `${event.clientX - 140}px`;
        glow.style.top = `${event.clientY - 140}px`;
      }
      const now = performance.now();
      if(now - lastStar < 70 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      lastStar = now;
      const star = document.createElement('span');
      star.className = 'cursor-star';
      star.textContent = icons[Math.floor(Math.random() * icons.length)];
      star.style.left = `${event.clientX}px`;
      star.style.top = `${event.clientY}px`;
      document.body.appendChild(star);

      if(window.gsap){
        gsap.fromTo(star, {x:0, y:0, opacity:1, scale:0.72, rotate:0}, {
          x:(Math.random() - 0.5) * 90,
          y:-70 - Math.random() * 45,
          opacity:0,
          scale:1.35,
          rotate:(Math.random() - 0.5) * 90,
          duration:0.82,
          ease:'power2.out',
          onComplete:() => star.remove()
        });
      } else {
        window.setTimeout(() => star.remove(), 850);
      }
    });
  }

  function initBgm(){
    const btn = $('#musicBtn');
    const audio = $('#bgm');
    if(!btn || !audio) return;
    audio.volume = 0.36;
    function setState(playing){
      btn.classList.toggle('playing', playing);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      const label = btn.querySelector('.music-label');
      if(label) label.textContent = playing ? 'BGM ON' : 'BGM';
    }
    btn.addEventListener('click', () => {
      if(audio.paused){
        audio.play().then(() => setState(true)).catch(() => setState(false));
      } else {
        audio.pause();
        setState(false);
      }
    });
    audio.addEventListener('ended', () => setState(false));
    audio.addEventListener('pause', () => setState(false));
    audio.addEventListener('play', () => setState(true));
  }

  function initFloatingCards(){
    const selector = '.card-floatable, .mini-card, .platform-card, .gallery-item, .source-card, .list-card, .track-option, .btn, .brand';
    const cards = $$(selector);
    cards.forEach(card => {
      card.classList.add('card-floatable');
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const mx = (x / rect.width - 0.5) || 0;
        const my = (y / rect.height - 0.5) || 0;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        if(window.gsap && !card.classList.contains('scroll-item')){
          gsap.to(card, {
            x: mx * 8,
            y: my * 8,
            rotationY: mx * 4,
            rotationX: -my * 4,
            transformPerspective: 900,
            duration:0.35,
            ease:'power2.out'
          });
        }
      });
      card.addEventListener('pointerleave', () => {
        if(window.gsap && !card.classList.contains('scroll-item')){
          gsap.to(card, {x:0, y:0, rotationX:0, rotationY:0, duration:0.78, ease:'elastic.out(1, .52)'});
        }
      });
    });
  }

  function initAnimations(){
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){
      $$('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
      return;
    }

    if(window.gsap && window.ScrollTrigger){
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo('.hero .eyebrow, .hero h1, .hero .subtitle, .hero .hero-copy, .hero .cta-row',
        {y:28, opacity:0}, {y:0, opacity:1, duration:0.9, stagger:0.08, ease:'power3.out'});
      gsap.fromTo('.portrait-main', {rotate:6, y:42, opacity:0}, {rotate:2, y:0, opacity:1, duration:1.1, ease:'elastic.out(1,.6)'});
      gsap.fromTo('.hero .mini-card', {y:44, opacity:0, scale:0.96}, {
        scrollTrigger:{trigger:'.hero-meta', start:'top 72%', once:true},
        y:0, opacity:1, scale:1, duration:0.82, stagger:0.12, ease:'elastic.out(1,.65)'
      });
      gsap.utils.toArray('.reveal').forEach(el => {
        if(el.closest('.hero')) return;
        gsap.fromTo(el, {y:32, opacity:0}, {
          scrollTrigger:{trigger:el, start:'top 88%', once:true},
          y:0,
          opacity:1,
          duration:0.74,
          ease:'power3.out'
        });
      });
      gsap.to('.music-note', {y:-14, rotate:8, repeat:-1, yoyo:true, duration:2.4, stagger:0.35, ease:'sine.inOut'});
      gsap.to('.marquee', {
        scrollTrigger:{trigger:'#music', start:'top bottom', end:'bottom top', scrub:true},
        x:-24,
        ease:'none'
      });
    } else {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'none';
            io.unobserve(entry.target);
          }
        });
      }, {threshold:0.12});
      $$('.reveal').forEach(el => io.observe(el));
    }
  }

  function boot(){
    initFacts();
    initMarquee();
    initTracks();
    initPlatforms();
    initMusicMaps();
    initTimeline();
    initGallery();
    initSources();
    initCursor();
    initBgm();
    initScrollGallery();
    initFloatingCards();
    initAnimations();
    const year = $('#year');
    if(year) year.textContent = new Date().getFullYear();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
