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
    if(text.includes('抖音')) return '抖';
    if(text.includes('小红书')) return '红';
    if(text.includes('快手')) return '快';
    if(text.includes('全民k歌')) return 'K歌';
    if(text.includes('微信公众号') || text.includes('公众号')) return '微讯';
    if(text.includes('apple')) return 'AM';
    if(text.includes('spotify')) return 'S';
    if(text.includes('youtube')) return 'YT';
    if(text.includes('5sing')) return '5';
    if(text.includes('酷狗')) return '酷';
    if(text.includes('酷我')) return '我';
    if(text.includes('qq')) return 'Q';
    if(text.includes('amazon')) return 'A';
    if(text.includes('猫耳')) return 'M';
    if(text.includes('网易')) return '云';
    if(text.includes('百科') || text.includes('wiki')) return '百';
    if(text.includes('image') || text.includes('图')) return '▣';
    if(text.includes('data') || text.includes('audit')) return '{}';
    return '✦';
  }

  function platformBrand(item){
    const text = `${item.name || ''} ${item.type || ''}`.toLowerCase();
    const icon = sourceIcon({name:item.name, type:item.type});
    const brands = [
      ['bilibili', '#FB7299', '#fff'],
      ['微博', '#E6162D', '#fff'],
      ['weibo', '#E6162D', '#fff'],
      ['抖音', '#161823', '#fff'],
      ['网易', '#E60026', '#fff'],
      ['qq音乐', '#31C27C', '#fff'],
      ['酷狗', '#2CA2F9', '#fff'],
      ['酷我', '#FFCE00', '#4a3600'],
      ['5sing', '#FF8FAA', '#fff'],
      ['apple music', '#FA586A', '#fff'],
      ['spotify', '#1DB954', '#fff'],
      ['youtube music', '#FF0000', '#fff'],
      ['youtube', '#FF0000', '#fff'],
      ['小红书', '#FE2C55', '#fff'],
      ['快手', '#FF4906', '#fff'],
      ['全民k歌', '#F7B500', '#fff'],
      ['微信公众号', '#07C160', '#fff'],
      ['amazon', '#25D1DA', '#11353a'],
      ['猫耳', '#FF6B8A', '#fff']
    ];
    for (const [key, color, fg] of brands){
      if(text.includes(key)) return {icon, color, fg};
    }
    return {icon, color:'#bd7c9a', fg:'#fff'};
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

  function isNeteaseExternal(player){
    if(!player) return false;
    return player.type === 'external' && (
      player.kind === 'external' ||
      String(player.label || '').includes('网易')
    );
  }

  function embeddablePlayers(track){
    return (track.players || []).filter(player => !isNeteaseExternal(player));
  }

  function getNeteaseInfo(track){
    const list = data.audio_interfaces?.netease_candidates_from_solo || [];
    const hit = list.find(item => item.title === track.title);
    if(hit) return hit;
    const external = (track.players || []).find(isNeteaseExternal);
    const title = track.title || '';
    return {
      title,
      netease_id: null,
      search_url: external?.url || `https://music.163.com/#/search/m/?s=${encodeURIComponent(`${title} 封茗囧菌`)}&type=1`
    };
  }

  function renderNeteasePlayer(track){
    const box = $('#neteasePlayer');
    if(!box || !track) return;
    if(track.audio_audit?.netease_status === 'excluded'){
      box.innerHTML = '';
      return;
    }
    const info = getNeteaseInfo(track);
    const searchUrl = info.search_url || `https://music.163.com/#/search/m/?s=${encodeURIComponent(`${track.title || ''} 封茗囧菌`)}&type=1`;
    let html = '';
    if(info.netease_id){
      html += `<iframe class="netease-embed" title="${esc(track.title)} - 网易云音乐" src="https://music.163.com/outchain/player?type=2&id=${esc(info.netease_id)}&auto=1&height=66" allow="autoplay" loading="lazy"></iframe>`;
    }
    html += `<a class="netease-link" href="${esc(searchUrl)}" target="_blank" rel="noreferrer">🎵 在网易云音乐中收听</a>`;
    box.innerHTML = html;
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
      {label:'英文名', value:p.english_name || 'Mandy Sa'},
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
      profileLead.textContent = `${p.name || '封茗囧菌'}（${p.english_name || 'Mandy Sa'}）的资料页：重点整理${identity || '音乐人身份'}、代表曲目、公开平台入口、风格关键词与本地相册素材。`;
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
      'Apple Music', 'Spotify', 'Bilibili', 'YouTube Music', '5sing', '网易云搜索入口', '双模式相册'
    ].filter(Boolean);
    const repeated = [...keywords, ...keywords];
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
    const players = embeddablePlayers(track);
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
    const players = embeddablePlayers(track);
    tabs.innerHTML = players.map((player, index) => `
      <button class="player-tab ${index === activeIndex ? 'active' : ''}" type="button" data-track-index="${trackIndex}" data-player-index="${index}">
        ${esc(player.label || `接口 ${index + 1}`)}
      </button>`).join('');
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
    const players = embeddablePlayers(track);
    const player = players[playerIndex] || players[0];
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

    renderNeteasePlayer(track);

    if(actions){
      const links = players.map((item, index) => {
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
    grid.innerHTML = (data.platforms || []).map(item => {
      const brand = platformBrand(item);
      return `
      <a class="platform-card reveal card-floatable" href="${esc(item.url)}" target="_blank" rel="noreferrer">
        <span class="platform-icon" style="--platform-color:${brand.color};--platform-fg:${brand.fg}">${esc(brand.icon)}</span>
        <b>${esc(item.name)}</b>
        <span>${esc(item.handle || '')}<br>${esc(item.type || '')}</span>
        <em>${esc(item.note ? `备注：${item.note}` : `来源：${sourceName(item.verified_by)}`)}</em>
      </a>`;
    }).join('');
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

  function openLightbox(src, title, desc, source, fallback){
    const lightbox = $('#lightbox');
    const img = $('#lightboxImg');
    if(!lightbox || !img) return;
    const fallbackSrc = fallback || fallbackImage();
    img.src = src || fallbackSrc;
    img.onerror = () => { img.onerror = null; img.src = fallbackSrc; };
    $('#lightboxTitle').textContent = title || '图片预览';
    $('#lightboxDesc').textContent = `${desc || ''}${source ? ` 来源：${source}。` : ''}`;
    lightbox.classList.add('open');
  }

  function allGalleryImages(){
    const seen = new Set();
    const items = [];
    const push = img => {
      const web = img.web_file || img.thumb_file || img.src;
      if(!web || seen.has(web)) return;
      seen.add(web);
      items.push({
        title: img.title || '图片',
        subtitle: img.subtitle || img.description || '',
        desc: img.description || img.subtitle || '',
        src: img.web_file || img.src || img.thumb_file,
        thumb: img.thumb_file || img.web_file || img.src,
        fallback: img.fallback_file || fallbackImage(),
        source: img.source_name || img.source || '项目素材'
      });
    };
    (data.images || []).forEach(push);
    (data.solo_gallery || []).forEach(push);
    return items;
  }

  function initGallery(){
    const color = $('#galleryGrid');
    const carousel = $('#scrollCarousel');
    const galleryImages = allGalleryImages();
    const classes = ['wide', '', 'tall', '', '', '', 'wide', '', '', ''];

    if(color){
      color.innerHTML = galleryImages.map((img, index) => `
        <figure class="gallery-item ${classes[index % classes.length] || ''} reveal card-floatable" data-img="${esc(img.src)}" data-fallback="${esc(img.fallback)}" data-title="${esc(img.title)}" data-desc="${esc(img.desc)}" data-source="${esc(img.source)}">
          <img src="${esc(img.thumb || img.src)}" alt="${esc(img.title)}" loading="lazy" onerror="this.onerror=null;this.src='${esc(img.fallback)}';">
          <figcaption>${esc(img.desc || img.title)}<br>来源：${esc(img.source)}</figcaption>
        </figure>`).join('');
      color.addEventListener('click', event => {
        const fig = event.target.closest('.gallery-item');
        if(!fig) return;
        openLightbox(fig.dataset.img, fig.dataset.title, fig.dataset.desc, fig.dataset.source, fig.dataset.fallback);
      });
    }

    if(carousel){
      carousel.innerHTML = galleryImages.map((img, index) => `
        <div class="scroll-item" style="--i:${index}" data-img="${esc(img.src)}" data-title="${esc(img.title)}" data-desc="${esc(img.subtitle || img.desc)}" data-source="${esc(img.source)}">
          <div class="scroll-rod scroll-rod-top"></div>
          <div class="scroll-paper">
            <img src="${esc(img.thumb || img.src)}" alt="${esc(img.title)}" loading="lazy" onerror="this.onerror=null;this.src='${esc(img.fallback)}';">
            <div class="scroll-label"><span>${esc(img.title)}</span><small>${esc(img.subtitle || img.desc)}</small></div>
          </div>
          <div class="scroll-rod scroll-rod-bottom"></div>
        </div>`).join('');
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

    initScrollGallery();

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
    const scrollItems = $$('.scroll-item', carousel);
    if(!scrollItems.length) return;
    scrollGalleryReady = true;

    const totalItems = scrollItems.length;
    const sphereRadius = Math.min(320, 220 + totalItems * 8);
    const goldenAngle = Math.PI * (1 + Math.sqrt(5));
    const radToDeg = 180 / Math.PI;
    const degToRad = Math.PI / 180;
    const positions = [];

    for(let i = 0; i < totalItems; i++){
      const phi = Math.acos(1 - 2 * (i + 0.5) / totalItems);
      const theta = goldenAngle * i;
      const x = sphereRadius * Math.sin(phi) * Math.cos(theta);
      const y = sphereRadius * Math.cos(phi);
      const z = sphereRadius * Math.sin(phi) * Math.sin(theta);
      positions.push({x, y, z});
    }

    let autoRotationY = 0;
    let autoRotationX = 0;
    let isPaused = false;
    let zoomLevel = 1;
    const zoomMin = 0.5;
    const zoomMax = 2;
    const zoomStep = 0.08;
    let lastTime = performance.now();
    const hoverTimers = new Map();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function paintItems(){
      const cosX = Math.cos(autoRotationX * degToRad);
      const sinX = Math.sin(autoRotationX * degToRad);
      const cosY = Math.cos(autoRotationY * degToRad);
      const sinY = Math.sin(autoRotationY * degToRad);

      scrollItems.forEach((item, i) => {
        const pos = positions[i];
        if(!pos) return;

        let x1 = pos.x * cosY + pos.z * sinY;
        let z1 = -pos.x * sinY + pos.z * cosY;
        let y1 = pos.y;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        const x2 = x1;
        const faceAngle = Math.atan2(x2, z2) * radToDeg;
        const zoomed = item.classList.contains('zoomed');

        item.style.transform = zoomed
          ? `translate3d(${x2}px, ${y2}px, ${z2}px) rotateY(${faceAngle}deg) scale(1.8)`
          : `translate3d(${x2}px, ${y2}px, ${z2}px) rotateY(${faceAngle}deg)`;

        const depthNorm = (z2 + sphereRadius) / (2 * sphereRadius);
        item.style.opacity = String(0.3 + 0.7 * depthNorm);
      });
    }

    function updateCarousel(){
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if(!isPaused && !reduceMotion){
        autoRotationY += 10 * dt;
        autoRotationX = Math.sin(now / 4000) * 15;
      }

      carousel.style.transform = `scale(${zoomLevel})`;
      paintItems();
      if(!reduceMotion) requestAnimationFrame(updateCarousel);
    }

    gallery.addEventListener('wheel', event => {
      event.preventDefault();
      zoomLevel = event.deltaY < 0
        ? Math.min(zoomMax, zoomLevel + zoomStep)
        : Math.max(zoomMin, zoomLevel - zoomStep);
      carousel.style.transform = `scale(${zoomLevel})`;
    }, {passive:false});

    gallery.addEventListener('mouseenter', () => { isPaused = true; });
    gallery.addEventListener('mouseleave', () => {
      isPaused = false;
      scrollItems.forEach(item => item.classList.remove('zoomed'));
      hoverTimers.forEach(timer => clearTimeout(timer));
      hoverTimers.clear();
    });

    scrollItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const timer = setTimeout(() => item.classList.add('zoomed'), 750);
        hoverTimers.set(item, timer);
      });
      item.addEventListener('mouseleave', () => {
        const timer = hoverTimers.get(item);
        if(timer){
          clearTimeout(timer);
          hoverTimers.delete(item);
        }
        item.classList.remove('zoomed');
      });
    });

    paintItems();
    if(!reduceMotion) updateCarousel();
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
    const selector = '.card-floatable, .mini-card, .platform-card, .gallery-item, .source-card, .list-card, .track-option, .btn, .brand, .portrait-main';
    const cards = $$(selector);
    cards.forEach(card => {
      card.classList.add('card-floatable');
      const baseRotation = card.classList.contains('portrait-main') ? 2 : 0;
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
            rotationY: mx * 10,
            rotationX: -my * 8,
            rotation: baseRotation,
            transformPerspective: 900,
            duration:0.45,
            ease:'power2.out'
          });
        }
      });
      card.addEventListener('pointerleave', () => {
        if(window.gsap && !card.classList.contains('scroll-item')){
          gsap.to(card, {
            rotationX:0,
            rotationY:0,
            rotation: baseRotation,
            duration:0.7,
            ease:'elastic.out(1, .45)'
          });
        }
      });
    });
  }

  const HERO_REVEAL_SEL = '.hero .eyebrow, .hero h1, .hero .subtitle, .hero .hero-copy, .hero .cta-row, .hero .mini-card, .hero .visual-card, .hero .music-note, .hero .wave-notes';

  function revealHeroFallback(){
    $$(HERO_REVEAL_SEL).forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    const portrait = $('.portrait-main');
    if(portrait){
      portrait.style.opacity = '1';
      portrait.style.transform = 'none';
    }
    document.body.classList.add('hero-revealed');
  }

  function initAnimations(){
    document.body.classList.add('site-ready');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){
      $$('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
      revealHeroFallback();
      return;
    }

    if(window.gsap && window.ScrollTrigger){
      gsap.registerPlugin(ScrollTrigger);
      gsap.set(HERO_REVEAL_SEL, {autoAlpha:0, y:42, scale:0.985});
      gsap.set('.portrait-main', {autoAlpha:0, y:42, rotate:6, scale:0.985});

      const heroReveal = gsap.timeline({
        paused:true,
        onComplete:() => {
          document.body.classList.add('hero-revealed');
          gsap.to('.music-note', {y:-14, rotate:8, repeat:-1, yoyo:true, duration:2.4, stagger:0.35, ease:'sine.inOut'});
        }
      });
      heroReveal.to('.hero .eyebrow, .hero h1, .hero .subtitle, .hero .hero-copy, .hero .cta-row, .hero .visual-card', {
        autoAlpha:1, y:0, scale:1, duration:0.75, stagger:0.04, ease:'power3.out'
      });
      heroReveal.to('.portrait-main', {
        autoAlpha:1, y:0, rotate:2, scale:1, duration:0.75, ease:'power3.out'
      }, 0);
      heroReveal.to('.hero .mini-card', {
        autoAlpha:1, y:0, scale:1, duration:0.82, stagger:0.12, ease:'elastic.out(1,.65)'
      }, '-=0.42');
      heroReveal.to('.hero .music-note, .hero .wave-notes', {
        autoAlpha:1, y:0, scale:1, duration:0.75, stagger:0.04, ease:'power3.out'
      }, '-=0.55');

      let heroPlayed = false;
      const playHeroReveal = (force = false) => {
        if(heroPlayed) return;
        if(!force && window.scrollY < 48) return;
        heroPlayed = true;
        heroReveal.play();
        window.removeEventListener('scroll', onHeroScroll);
        window.removeEventListener('wheel', onHeroWheel);
        window.removeEventListener('touchstart', onHeroTouch);
        window.removeEventListener('touchmove', onHeroTouch);
      };
      const onHeroScroll = () => playHeroReveal();
      const onHeroWheel = event => {
        if(event.deltaY > 0) playHeroReveal(true);
      };
      let touchStartY = 0;
      const onHeroTouch = event => {
        if(event.type === 'touchstart'){
          touchStartY = event.touches[0]?.clientY || 0;
          return;
        }
        const currentY = event.touches[0]?.clientY || 0;
        if(touchStartY - currentY > 18) playHeroReveal(true);
      };
      window.addEventListener('scroll', onHeroScroll, {passive:true});
      window.addEventListener('wheel', onHeroWheel, {passive:true});
      window.addEventListener('touchstart', onHeroTouch, {passive:true});
      window.addEventListener('touchmove', onHeroTouch, {passive:true});

      gsap.utils.toArray('.reveal').forEach(el => {
        if(el.closest('.hero')) return;
        gsap.fromTo(el, {autoAlpha:0, y:42, scale:0.985}, {
          autoAlpha:1, y:0, scale:1, duration:0.85, ease:'power3.out',
          scrollTrigger:{trigger:el, start:'top 86%', once:true}
        });
      });
      gsap.to('.marquee', {
        scrollTrigger:{trigger:'#music', start:'top bottom', end:'bottom top', scrub:true},
        x:-24,
        ease:'none'
      });
    } else {
      let heroShown = false;
      const showHeroOnScroll = (force = false) => {
        if(heroShown) return;
        if(!force && window.scrollY < 48) return;
        heroShown = true;
        revealHeroFallback();
        window.removeEventListener('scroll', onFallbackScroll);
        window.removeEventListener('wheel', onFallbackWheel);
        window.removeEventListener('touchstart', onFallbackTouch);
        window.removeEventListener('touchmove', onFallbackTouch);
      };
      const onFallbackScroll = () => showHeroOnScroll();
      const onFallbackWheel = event => {
        if(event.deltaY > 0) showHeroOnScroll(true);
      };
      let touchStartY = 0;
      const onFallbackTouch = event => {
        if(event.type === 'touchstart'){
          touchStartY = event.touches[0]?.clientY || 0;
          return;
        }
        const currentY = event.touches[0]?.clientY || 0;
        if(touchStartY - currentY > 18) showHeroOnScroll(true);
      };
      window.addEventListener('scroll', onFallbackScroll, {passive:true});
      window.addEventListener('wheel', onFallbackWheel, {passive:true});
      window.addEventListener('touchstart', onFallbackTouch, {passive:true});
      window.addEventListener('touchmove', onFallbackTouch, {passive:true});

      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'none';
            io.unobserve(entry.target);
          }
        });
      }, {threshold:0.12});
      $$('.reveal').forEach(el => {
        if(!el.closest('.hero')) io.observe(el);
      });
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
