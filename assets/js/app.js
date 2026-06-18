(function(){
  'use strict';

  const data = window.FMJJ_DATA || {};
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const sourceMap = new Map((data.sources || []).map(item => [item.id, item]));

  function renderList(target, items, renderItem){
    if(!target) return;
    target.innerHTML = (items || []).map(renderItem).join('');
  }

  function setActive(nodes, matcher){
    nodes.forEach((node, index) => {
      const active = typeof matcher === 'function' ? matcher(node, index) : node === matcher;
      node.classList.toggle('active', active);
    });
  }

  function esc(value){
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
    }[ch]));
  }

  function sourceName(id){
    const s = sourceMap.get(id);
    return s ? s.name : (id || '未标注来源');
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
    renderList($('#factList'), items, item => `
        <div class="fact reveal card-floatable">
          <small>${esc(item.label)}</small>
          <strong>${esc(item.value)}</strong>
        </div>`);

    const profileLead = $('#profileLead');
    if(profileLead){
      const identity = (p.primary_identity || []).join('、');
      profileLead.textContent = `${p.name || '封茗囧菌'}（${p.english_name || 'Mandy Sa'}）的资料页：重点整理${identity || '音乐人身份'}、代表曲目、公开平台入口、风格关键词与本地相册素材。`;
    }
    renderList($('#stylePills'), p.style_keywords || [], x =>
      `<span class="pill reveal card-floatable">${esc(x)}</span>`
    );
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
    renderList(list, tracks, (track, index) => {
      const sourceText = readableSourceList(track.sources).split(' / ')[0];
      return `<button class="track-option reveal card-floatable ${index === 0 ? 'active' : ''}" type="button" data-track-index="${index}">
        <img src="${esc(track.cover || fallbackImage())}" alt="${esc(track.title)}封面" loading="lazy">
        <span class="track-info">
          <b>${esc(track.title)}</b>
          <small>${esc(track.year || '')} · ${esc(track.tag || '')}</small>
          <em>${esc(sourceText)}</em>
        </span>
      </button>`;
    });

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

  // 默认播放源优先级：Bilibili 优先，其次 Apple Music，再退回其他可嵌入源
  const PLAYER_PRIORITY = ['bilibili', 'apple'];

  function playerRank(player){
    const kind = String(player.kind || '').toLowerCase();
    const label = String(player.label || '').toLowerCase();
    for(let i = 0; i < PLAYER_PRIORITY.length; i++){
      const key = PLAYER_PRIORITY[i];
      if(kind.includes(key) || label.includes(key)) return i;
    }
    return PLAYER_PRIORITY.length;
  }

  function firstPlayableIndex(track){
    const players = embeddablePlayers(track);
    let bestIndex = -1;
    let bestRank = Infinity;
    players.forEach((player, index) => {
      if(!isEmbeddable(player)) return;
      const rank = playerRank(player);
      if(rank < bestRank){
        bestRank = rank;
        bestIndex = index;
      }
    });
    if(bestIndex >= 0) return bestIndex;
    const fallback = players.findIndex(isEmbeddable);
    return fallback >= 0 ? fallback : 0;
  }

  function selectTrack(trackIndex, opts={}){
    const tracks = data.tracks || [];
    const track = tracks[trackIndex];
    if(!track) return;
    setActive($$('.track-option'), (el, i) => i === trackIndex);
    const playerIndex = firstPlayableIndex(track);
    renderTrackHeader(track);
    renderPlayerTabs(track, trackIndex, playerIndex);
    renderPlayer(track, playerIndex);
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
      renderPlayer(nextTrack, nextIndex);
    };
  }

  function setPlayerFrame(frame, placeholder, track, player){
    const canEmbed = isEmbeddable(player);
    if(canEmbed){
      frame.title = `${track.title} - ${player.label} 网页内播放`;
      frame.src = player.src;
      frame.classList.remove('is-empty');
      placeholder.classList.add('hidden');
      placeholder.classList.remove('no-embed');
      placeholder.innerHTML = `<span>♪</span><p>正在加载 ${esc(player.label)} 播放器；部分平台可能需要允许第三方 Cookie 或在新窗口打开。</p>`;
      return;
    }

    frame.title = `${track.title} - 外部平台入口`;
    frame.src = 'about:blank';
    frame.classList.add('is-empty');
    placeholder.classList.remove('hidden');
    placeholder.classList.add('no-embed');
    placeholder.innerHTML = `<span>↗</span><p>${esc(player.label || '外部入口')} 不直接嵌入网页播放器。已保留搜索 / 平台入口，避免未核验接口错播。</p><a class="btn secondary" href="${esc(playerSourceUrl(player))}" target="_blank" rel="noreferrer">打开外部入口</a>`;
  }

  function renderPlayerActions(actions, players, playerIndex, frame){
    if(!actions) return;
    const links = players.map((item, index) => {
      const label = index === playerIndex ? `当前：${item.label}` : item.label;
      return `<a class="player-link ${index === playerIndex ? 'active' : ''}" href="${esc(playerSourceUrl(item))}" target="_blank" rel="noreferrer">${esc(label)}</a>`;
    }).join('');
    actions.innerHTML = `${links}<button class="player-link" type="button" id="reloadPlayer">重载当前播放器</button>`;

    const reload = $('#reloadPlayer');
    if(!reload) return;
    reload.onclick = () => {
      const current = frame.src;
      if(current === 'about:blank') return;
      frame.src = 'about:blank';
      window.setTimeout(() => { frame.src = current; }, 120);
    };
  }

  function renderPlayer(track, playerIndex){
    const players = embeddablePlayers(track);
    const player = players[playerIndex] || players[0];
    const frame = $('#musicFrame');
    const placeholder = $('#playerPlaceholder');
    const actions = $('#playerActions');
    if(!player || !frame || !placeholder) return;

    setActive($$('.player-tab'), (el, index) => index === playerIndex);
    setPlayerFrame(frame, placeholder, track, player);
    renderNeteasePlayer(track);
    renderPlayerActions(actions, players, playerIndex, frame);
  }

  function initPlatforms(){
    const grid = $('#platformGrid');
    if(!grid) return;
    grid.innerHTML = (data.platforms || []).map(item => {
      const brand = platformBrand(item);
      return `
      <a class="platform-card reveal" href="${esc(item.url)}" target="_blank" rel="noreferrer">
        <div class="platform-card-header">
          <span class="platform-icon" style="--platform-color:${brand.color};--platform-fg:${brand.fg}">${esc(brand.icon)}</span>
          <div class="platform-card-title">
            <b>${esc(item.name)}</b>
            <span class="platform-type">${esc(item.type || 'platform')}</span>
          </div>
        </div>
        <div class="platform-card-body">
          ${item.handle ? `<div class="platform-handle">${esc(item.handle)}</div>` : ''}
          ${item.note ? `<div class="platform-note">${esc(item.note)}</div>` : ''}
        </div>
        <div class="platform-card-footer">
          <span class="platform-verified">${esc(sourceName(item.verified_by))}</span>
          <span>→</span>
        </div>
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
        <div class="time-card">
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.desc)}</p>
          <small>${esc(sourceName((item.source || '').split('/')[0]))} · ${esc(item.confidence || 'marked')}</small>
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

  function galleryFigure(img, className=''){
    return `
        <figure class="gallery-item ${className} reveal card-floatable" data-img="${esc(img.src)}" data-fallback="${esc(img.fallback)}" data-title="${esc(img.title)}" data-desc="${esc(img.desc)}" data-source="${esc(img.source)}">
          <img src="${esc(img.thumb || img.src)}" alt="${esc(img.title)}" loading="lazy" onerror="this.onerror=null;this.src='${esc(img.fallback)}';">
          <figcaption>${esc(img.desc || img.title)}<br>来源：${esc(img.source)}</figcaption>
        </figure>`;
  }

  function scrollGalleryItem(img, index){
    return `
        <div class="scroll-item" style="--i:${index}" data-img="${esc(img.src)}" data-title="${esc(img.title)}" data-desc="${esc(img.subtitle || img.desc)}" data-source="${esc(img.source)}">
          <div class="scroll-rod scroll-rod-top"></div>
          <div class="scroll-paper">
            <img src="${esc(img.thumb || img.src)}" alt="${esc(img.title)}" loading="lazy" onerror="this.onerror=null;this.src='${esc(img.fallback)}';">
            <div class="scroll-label"><span>${esc(img.title)}</span><small>${esc(img.subtitle || img.desc)}</small></div>
          </div>
          <div class="scroll-rod scroll-rod-bottom"></div>
        </div>`;
  }

  function openLightboxFromDataset(el, withFallback=false){
    if(!el) return;
    openLightbox(
      el.dataset.img,
      el.dataset.title,
      el.dataset.desc,
      el.dataset.source,
      withFallback ? el.dataset.fallback : undefined
    );
  }

  function initGallery(){
    const color = $('#galleryGrid');
    const carousel = $('#scrollCarousel');
    const galleryImages = allGalleryImages();
    const classes = ['wide', '', 'tall', '', '', '', 'wide', '', '', ''];

    if(color){
      color.innerHTML = galleryImages.map((img, index) => galleryFigure(img, classes[index % classes.length] || '')).join('');
      color.addEventListener('click', event => {
        openLightboxFromDataset(event.target.closest('.gallery-item'), true);
      });
    }

    if(carousel){
      carousel.innerHTML = galleryImages.map(scrollGalleryItem).join('');
      carousel.addEventListener('click', event => {
        openLightboxFromDataset(event.target.closest('.scroll-item'));
      });
    }

    $$('.gallery-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.galleryMode;
        setActive($$('.gallery-mode'), btn);
        $$('.gallery-mode').forEach(x => {
          x.setAttribute('aria-selected', x === btn ? 'true' : 'false');
        });
        $$('.gallery-pane').forEach(pane => pane.classList.toggle('active', pane.dataset.galleryPane === mode));
        if(mode === 'scroll' && !scrollGalleryReady){
          setTimeout(() => {
            initScrollGallery();
          }, 100);
        }
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
    const scrollItems = $$('.scroll-item', carousel);
    if(!scrollItems.length) return;
    scrollGalleryReady = true;

    if(window.gsap && window.ScrollTrigger){
      ScrollTrigger.getAll().forEach(st => {
        if(st.trigger && (st.trigger.closest('#scrollCarousel') || st.trigger.closest('.scroll-gallery'))){
          st.kill();
        }
      });

      scrollItems.forEach(item => {
        gsap.killTweensOf(item);
        gsap.set(item, {clearProps: 'all'});
        item.style.cssText = item.style.cssText.replace(/transform[^;]*/gi, '');
      });

      if(carousel){
        gsap.killTweensOf(carousel);
        gsap.set(carousel, {clearProps: 'all'});
      }
    }

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
      item.setAttribute('data-no-gsap', 'true');
    });

    if(gallery) gallery.setAttribute('data-no-gsap', 'true');
    if(carousel) carousel.setAttribute('data-no-gsap', 'true');

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
    let glowXTo, glowYTo;

    if(window.gsap && glow){
      glowXTo = gsap.quickTo(glow, 'x', {duration: 0.6, ease: 'power3.out'});
      glowYTo = gsap.quickTo(glow, 'y', {duration: 0.6, ease: 'power3.out'});
    }

    window.addEventListener('mousemove', event => {
      if(glow){
        if(glowXTo && glowYTo){
          glowXTo(event.clientX - 140);
          glowYTo(event.clientY - 140);
        } else {
          glow.style.left = `${event.clientX - 140}px`;
          glow.style.top = `${event.clientY - 140}px`;
        }
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
        gsap.fromTo(star,
          {x: 0, y: 0, autoAlpha: 1, scale: 0.72, rotation: 0},
          {
            x: (Math.random() - 0.5) * 90,
            y: -70 - Math.random() * 45,
            autoAlpha: 0,
            scale: 1.35,
            rotation: (Math.random() - 0.5) * 90,
            duration: 0.82,
            ease: 'power2.out',
            onComplete: () => star.remove()
          }
        );
      } else {
        window.setTimeout(() => star.remove(), 850);
      }
    });
  }

  let unlockBgm = null;
  let bgmUnlocked = false;

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

    async function tryPlay(){
      try{
        await audio.play();
        setState(true);
        return true;
      }catch{
        setState(false);
        return false;
      }
    }

    function removeUnlockListeners(){
      const events = ['click', 'pointerdown', 'keydown', 'touchstart', 'touchend'];
      events.forEach(evt => document.removeEventListener(evt, onFirstGesture, true));
    }

    let unlocking = false;

    async function onFirstGesture(){
      if(bgmUnlocked || unlocking) return;
      unlocking = true;
      audio.muted = false;
      if(audio.paused){
        const ok = await tryPlay();
        if(!ok){ unlocking = false; return; }
      } else {
        setState(true);
      }
      bgmUnlocked = true;
      removeUnlockListeners();
    }

    unlockBgm = onFirstGesture;

    btn.addEventListener('click', () => {
      bgmUnlocked = true;
      removeUnlockListeners();
      if(audio.paused){
        audio.muted = false;
        tryPlay();
      } else {
        audio.pause();
        setState(false);
      }
    });
    audio.addEventListener('ended', () => setState(false));
    audio.addEventListener('pause', () => setState(false));
    audio.addEventListener('play', () => setState(true));

    async function bootBgm(){
      // 先尝试直接播放（少数浏览器允许）
      audio.muted = false;
      const played = await tryPlay();
      if(played){
        bgmUnlocked = true;
        removeUnlockListeners();
        return;
      }
      // 退而求其次：静音播放，等待首次交互后解锁
      audio.muted = true;
      try{
        await audio.play();
        setState(false);
      }catch{
        audio.load();
      }
      // 注册用户激活事件（仅限真正授予 user activation 的事件类型）
      const events = ['click', 'pointerdown', 'keydown', 'touchstart', 'touchend'];
      events.forEach(evt => document.addEventListener(evt, onFirstGesture, {capture:true, once:false}));
    }

    if(audio.readyState >= 2) bootBgm();
    else audio.addEventListener('canplay', bootBgm, {once:true});
  }

  function initFloatingCards(){
    const selector = '.card-floatable, .mini-card, .platform-card, .gallery-item, .source-card, .list-card, .track-option, .btn, .brand, .portrait-main';
    const cards = $$(selector).filter(card => {
      return !card.hasAttribute('data-no-gsap') &&
             !card.classList.contains('scroll-item') &&
             !card.closest('.scroll-gallery') &&
             !card.closest('#scrollCarousel') &&
             !card.closest('[data-no-gsap]');
    });
    const quickToCache = new WeakMap();

    cards.forEach(card => {
      card.classList.add('card-floatable');
      const baseRotation = card.classList.contains('portrait-main') ? 2 : 0;

      if(window.gsap){
        const rotYTo = gsap.quickTo(card, 'rotationY', {duration: 0.45, ease: 'power2.out'});
        const rotXTo = gsap.quickTo(card, 'rotationX', {duration: 0.45, ease: 'power2.out'});
        quickToCache.set(card, {rotYTo, rotXTo});

        card.addEventListener('pointermove', event => {
          const rect = card.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const mx = (x / rect.width - 0.5) || 0;
          const my = (y / rect.height - 0.5) || 0;
          card.style.setProperty('--mx', `${x}px`);
          card.style.setProperty('--my', `${y}px`);

          rotYTo(mx * 10);
          rotXTo(-my * 8);
          gsap.set(card, {rotation: baseRotation, transformPerspective: 900});
        });

        card.addEventListener('pointerleave', () => {
          gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            rotation: baseRotation,
            duration: 0.7,
            ease: 'elastic.out(1, 0.45)'
          });
        });
      }
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

    if(!window.gsap || !window.ScrollTrigger){
      $$('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
      revealHeroFallback();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.config({
      nullTargetWarn: false
    });

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 768px)',
        reduceMotion: '(prefers-reduced-motion: reduce)'
      },
      (context) => {
        const {isDesktop, reduceMotion} = context.conditions;

        if(reduceMotion){
          $$('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
          revealHeroFallback();
          return;
        }

        gsap.set(HERO_REVEAL_SEL, {autoAlpha: 0, y: 42, scale: 0.985});
        gsap.set('.portrait-main', {autoAlpha: 0, y: 42, rotation: 6, scale: 0.985});

        const heroTl = gsap.timeline({
          paused: true,
          defaults: {ease: 'power3.out'},
          onComplete: () => {
            document.body.classList.add('hero-revealed');
            gsap.to('.music-note', {
              y: -14,
              rotation: 8,
              repeat: -1,
              yoyo: true,
              duration: 2.4,
              stagger: 0.35,
              ease: 'sine.inOut'
            });
          }
        });

        heroTl.to('.hero .eyebrow', {autoAlpha: 1, y: 0, scale: 1, duration: 0.75})
              .to('.hero h1', {autoAlpha: 1, y: 0, scale: 1, duration: 0.75}, '<0.08')
              .to('.hero .subtitle', {autoAlpha: 1, y: 0, scale: 1, duration: 0.75}, '<0.08')
              .to('.hero .hero-copy', {autoAlpha: 1, y: 0, scale: 1, duration: 0.75}, '<0.08')
              .to('.hero .cta-row', {autoAlpha: 1, y: 0, scale: 1, duration: 0.75}, '<0.08')
              .to('.hero .visual-card', {autoAlpha: 1, y: 0, scale: 1, duration: 0.75}, '<')
              .to('.portrait-main', {
                autoAlpha: 1,
                y: 0,
                rotation: 2,
                scale: 1,
                duration: 0.75,
                ease: 'back.out(1.2)'
              }, '<0.15')
              .to('.hero .mini-card', {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.82,
                stagger: 0.12,
                ease: 'elastic.out(1, 0.65)'
              }, '-=0.42')
              .to('.hero .music-note, .hero .wave-notes', {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.75,
                stagger: 0.04
              }, '-=0.55');

        let heroPlayed = false;
        const playHeroReveal = (force = false) => {
          if(heroPlayed) return;
          if(!force && window.scrollY < 48) return;
          heroPlayed = true;
          unlockBgm?.();
          heroTl.play();
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
        window.addEventListener('scroll', onHeroScroll, {passive: true});
        window.addEventListener('wheel', onHeroWheel, {passive: true});
        window.addEventListener('touchstart', onHeroTouch, {passive: true});
        window.addEventListener('touchmove', onHeroTouch, {passive: true});

        ScrollTrigger.batch('.reveal:not(.hero .reveal)', {
          onEnter: (elements) => {
            const filtered = elements.filter(el =>
              !el.hasAttribute('data-no-gsap') &&
              !el.closest('#scrollCarousel') &&
              !el.closest('.scroll-gallery') &&
              !el.closest('[data-no-gsap]')
            );
            if(filtered.length){
              gsap.to(filtered, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.85,
                stagger: 0.08,
                ease: 'power3.out',
                overwrite: true
              });
            }
          },
          start: 'top 86%',
          once: true
        });

        gsap.to('.marquee-track', {
          x: isDesktop ? -120 : -60,
          ease: 'none',
          scrollTrigger: {
            trigger: '.marquee',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        });

        gsap.utils.toArray('.section').forEach((section, i) => {
          const isGallerySection = section.id === 'gallery';

          const heading = section.querySelector('.section-head');
          if(heading){
            gsap.fromTo(heading,
              {autoAlpha: 0, y: 60},
              {
                autoAlpha: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 75%',
                  once: true
                }
              }
            );
          }

          if(!isGallerySection){
            const cards = section.querySelectorAll('.panel, .platform-card, .track-option, .time-item, .list-card');
            if(cards.length){
              gsap.fromTo(cards,
                {autoAlpha: 0, y: 50, scale: 0.95},
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.8,
                  stagger: {
                    amount: 0.3,
                    from: 'start'
                  },
                  ease: 'back.out(1.4)',
                  scrollTrigger: {
                    trigger: section,
                    start: 'top 70%',
                    once: true
                  }
                }
              );
            }
          }
        });

        const musicSection = $('#music');
        if(musicSection){
          gsap.to('.track-list', {
            y: isDesktop ? -80 : -40,
            ease: 'none',
            scrollTrigger: {
              trigger: musicSection,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5
            }
          });
        }

        const platformSection = $('#platforms');
        if(platformSection){
          const platformCards = platformSection.querySelectorAll('.platform-card');
          platformCards.forEach((card, i) => {
            const dir = i % 2 === 0 ? 1 : -1;
            gsap.to(card, {
              y: dir * (isDesktop ? 30 : 15),
              ease: 'none',
              scrollTrigger: {
                trigger: platformSection,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 2
              }
            });
          });
        }

        const timelineSection = $('#timeline-section');
        if(timelineSection){
          const timeItems = timelineSection.querySelectorAll('.time-item');
          timeItems.forEach((item) => {
            const isLeft = item.classList.contains('left');
            gsap.fromTo(item,
              {autoAlpha: 0, x: isLeft ? -100 : 100, scale: 0.9},
              {
                autoAlpha: 1,
                x: 0,
                scale: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: item,
                  start: 'top 80%',
                  once: true
                }
              }
            );
          });
        }

        const galleryGrid = $('#galleryGrid');
        if(galleryGrid){
          const galleryItems = galleryGrid.querySelectorAll('.gallery-item');
          if(galleryItems.length){
            gsap.fromTo(galleryItems,
              {autoAlpha: 0, scale: 0.8, rotation: (i) => (Math.random() - 0.5) * 10},
              {
                autoAlpha: 1,
                scale: 1,
                rotation: 0,
                duration: 0.8,
                stagger: {
                  amount: 0.6,
                  from: 'random',
                  grid: 'auto'
                },
                ease: 'back.out(1.7)',
                scrollTrigger: {
                  trigger: galleryGrid,
                  start: 'top 75%',
                  once: true
                }
              }
            );
          }
        }

        return () => {
          heroTl.kill();
        };
      }
    );
  }

  function collectIntroImages(){
    const seen = new Set();
    const imgs = [];
    const push = src => {
      if(!src || seen.has(src)) return;
      seen.add(src);
      imgs.push(src);
    };
    (data.images || []).forEach(img => push(img.thumb_file || img.web_file));
    (data.solo_gallery || []).forEach(img => push(img.src));
    return imgs;
  }

  function initIntro(onDone){
    const overlay = $('#introOverlay');
    const spiral = $('#introSpiral');
    const enterBtn = $('#introEnter');
    const canvas = $('#introCanvas');
    if(!overlay || !spiral || !enterBtn){
      onDone();
      return;
    }

    document.body.classList.add('intro-active');
    const images = collectIntroImages();
    if(!images.length){
      overlay.classList.add('dismissed');
      document.body.classList.remove('intro-active');
      onDone();
      return;
    }

    const W = window.innerWidth;
    const H = window.innerHeight;
    const cx = W / 2;
    const cy = H / 2;

    // canvas 丝线
    const ctx = canvas ? canvas.getContext('2d') : null;
    let canvasRunning = true;
    if(canvas){ canvas.width = W; canvas.height = H; }
    const threadColors = [
      '#f18ab4', '#84e7d4', '#ffe985', '#ede4ff',
      '#bd7c9a', '#c8fff1', '#ffd8e7', '#6b4a78'
    ];
    const threads = [];
    let converging = false;
    let convergeStart = 0;
    const convergeDuration = 1200;

    function spawnThreads(){
      const count = 36 + Math.floor(Math.random() * 18);
      for(let i = 0; i < count; i++){
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(cx, cy) * (0.7 + Math.random() * 0.55);
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;
        const segments = 80 + Math.floor(Math.random() * 40);
        const pts = [];
        // 用正弦波叠加生成丝滑曲线
        const freqA = 1.5 + Math.random() * 2;
        const freqB = 3 + Math.random() * 3;
        const ampA = 50 + Math.random() * 80;
        const ampB = 20 + Math.random() * 40;
        const phaseA = Math.random() * Math.PI * 2;
        const phaseB = Math.random() * Math.PI * 2;
        const perpAngle = angle + Math.PI / 2;

        for(let j = 0; j <= segments; j++){
          const t = j / segments;
          const baseX = sx + (cx - sx) * t;
          const baseY = sy + (cy - sy) * t;
          const wave = Math.sin(t * freqA * Math.PI + phaseA) * ampA * (1 - t)
                     + Math.sin(t * freqB * Math.PI + phaseB) * ampB * (1 - t * t);
          pts.push({
            x: baseX + Math.cos(perpAngle) * wave,
            y: baseY + Math.sin(perpAngle) * wave
          });
        }
        threads.push({
          pts,
          color: threadColors[Math.floor(Math.random() * threadColors.length)],
          width: 0.5 + Math.random() * 2.2,
          progress: 0,
          speed: 0.008 + Math.random() * 0.012,
          delay: Math.random() * 0.4,
          perpAngle,
          windFreq: 0.8 + Math.random() * 1.2,
          windAmp: 15 + Math.random() * 30,
          windPhase: Math.random() * Math.PI * 2
        });
      }
    }
    spawnThreads();

    function drawThreads(now){
      if(!ctx || !canvasRunning) return;
      ctx.clearRect(0, 0, W, H);

      const time = now * 0.001;
      const elapsed = converging ? (now - convergeStart) / convergeDuration : 0;
      const globalProgress = converging ? Math.min(elapsed, 1) : 0;

      threads.forEach(t => {
        if(converging){
          t.progress = Math.min(1, globalProgress + t.delay * 0.4);
        } else {
          t.progress = Math.min(1, t.progress + t.speed);
        }
        const drawLen = Math.floor(t.pts.length * t.progress);
        if(drawLen < 3) return;

        const alpha = converging ? Math.max(0, 1 - globalProgress * 0.7) : 0.75;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = t.color;
        ctx.lineWidth = t.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        const windOffset = (j) => {
          const segT = j / t.pts.length;
          // 靠近中心（segT接近1）不动，靠近外端（segT接近0）飘动大
          return Math.sin(time * t.windFreq + segT * 4 + t.windPhase) * t.windAmp * (1 - segT);
        };

        const px0 = t.pts[0].x + Math.cos(t.perpAngle) * windOffset(0);
        const py0 = t.pts[0].y + Math.sin(t.perpAngle) * windOffset(0);
        ctx.moveTo(px0, py0);

        for(let j = 1; j < drawLen - 1; j++){
          const wo = windOffset(j);
          const woNext = windOffset(j + 1);
          const pxJ = t.pts[j].x + Math.cos(t.perpAngle) * wo;
          const pyJ = t.pts[j].y + Math.sin(t.perpAngle) * wo;
          const pxNext = t.pts[j+1].x + Math.cos(t.perpAngle) * woNext;
          const pyNext = t.pts[j+1].y + Math.sin(t.perpAngle) * woNext;
          const xc = (pxJ + pxNext) / 2;
          const yc = (pyJ + pyNext) / 2;
          ctx.quadraticCurveTo(pxJ, pyJ, xc, yc);
        }
        const last = t.pts[drawLen - 1];
        const woLast = windOffset(drawLen - 1);
        ctx.lineTo(last.x + Math.cos(t.perpAngle) * woLast, last.y + Math.sin(t.perpAngle) * woLast);
        ctx.stroke();
        ctx.restore();
      });

      if(canvasRunning) requestAnimationFrame(drawThreads);
    }
    requestAnimationFrame(drawThreads);

    // 图片：沿阿基米德螺线从外向中心汇聚，然后爆炸
    const total = images.length;
    const maxRadius = Math.hypot(cx, cy) * 0.92;
    const spiralTurns = 2.5;
    const maxTheta = spiralTurns * 2 * Math.PI;
    const baseSize = Math.min(380, Math.max(cx, cy) * 0.55);

    const els = [];
    const imgStates = [];

    // 阿基米德螺线位置计算
    function spiralPos(theta){
      const r = maxRadius * (theta / maxTheta);  // 从内到外
      return {
        x: Math.cos(theta) * r,
        y: Math.sin(theta) * r,
        r
      };
    }

    images.forEach((src, i) => {
      const img = document.createElement('img');
      img.className = 'spiral-img';
      img.src = src;
      img.alt = '';
      img.loading = 'eager';

      const progress = i / (total - 1 || 1);
      const size = baseSize * (0.6 + Math.random() * 0.4);
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;

      spiral.appendChild(img);
      els.push(img);

      // 起始位置：螺线外圈
      const startTheta = progress * maxTheta;
      const startPos = spiralPos(startTheta);
      const rotate = (Math.random() - 0.5) * 360;

      imgStates.push({
        startTheta,
        startPos,
        rotate,
        explodeAngle: startTheta + Math.PI,  // 爆炸方向
        explodeSpeed: 800 + Math.random() * 400
      });

      // 初始位置在螺线外圈
      img.style.opacity = '0';
      img.style.transform = `translate(calc(-50% + ${startPos.x}px), calc(-50% + ${startPos.y}px)) scale(0.3) rotate(${rotate}deg)`;
    });

    // 阶段1：沿螺线向中心聚集
    const gatherDuration = 1500;
    const gatherDelay = 40;

    els.forEach((img, i) => {
      setTimeout(() => {
        img.style.transition = `all ${gatherDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        img.style.opacity = '1';
        // 目标：中心点
        img.style.transform = `translate(-50%, -50%) scale(1) rotate(${imgStates[i].rotate * 0.3}deg)`;
      }, i * gatherDelay);
    });

    // 阶段2：爆炸散开 + 显示按钮
    const explodeStartTime = total * gatherDelay + gatherDuration + 200;

    setTimeout(() => {
      // 同时显示按钮
      enterBtn.style.display = 'flex';
      enterBtn.style.opacity = '0';
      enterBtn.style.transform = 'scale(0.5)';
      enterBtn.style.transition = 'opacity 500ms ease, transform 500ms cubic-bezier(.34, 1.56, .64, 1)';
      requestAnimationFrame(() => {
        enterBtn.style.opacity = '1';
        enterBtn.style.transform = 'scale(1)';
      });

      // 图片沿原螺线方向爆炸
      els.forEach((img, i) => {
        const st = imgStates[i];
        const explodeX = Math.cos(st.explodeAngle) * st.explodeSpeed;
        const explodeY = Math.sin(st.explodeAngle) * st.explodeSpeed;

        setTimeout(() => {
          img.style.transition = `all 800ms cubic-bezier(0.4, 0, 0.6, 1)`;
          img.style.opacity = '0';
          img.style.transform = `translate(calc(-50% + ${explodeX}px), calc(-50% + ${explodeY}px)) scale(0.2) rotate(${st.rotate * 3}deg)`;
        }, i * 15);
      });
    }, explodeStartTime);

    enterBtn.addEventListener('click', () => {
      canvasRunning = false;
      overlay.classList.add('dismissed');
      document.body.classList.remove('intro-active');
      onDone();
    });
    const innerBtn = enterBtn.querySelector('.intro-card-btn');
    if(innerBtn) innerBtn.addEventListener('click', () => {
      canvasRunning = false;
      overlay.classList.add('dismissed');
      document.body.classList.remove('intro-active');
      onDone();
    });
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
    initFloatingCards();
    initAnimations();
    setTimeout(() => {
      initScrollGallery();
    }, 500);
    const year = $('#year');
    if(year) year.textContent = new Date().getFullYear();
  }

  function start(){
    initBgm();
    initIntro(() => {
      unlockBgm?.();
      boot();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
