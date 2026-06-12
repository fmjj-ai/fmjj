
(function(){
  const data = window.FMJJ_DATA;
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function sourceName(id){
    const s = data.sources.find(x=>x.id===id);
    return s ? s.name : id;
  }

  function initFacts(){
    const p = data.profile;
    const facts = [
      ['全网ID', p.name], ['英文名', p.english_name], ['昵称', p.nickname], ['生日', p.birthday_public], ['星座', p.zodiac], ['代表作', p.representative_works.slice(0,3).join(' / ')], ['商务邮箱', p.contact.email], ['商务微信', p.contact.business_wechat]
    ];
    const box = $('#factList');
    box.innerHTML = facts.map(([k,v])=>`<div class="fact reveal"><small>${k}</small><strong>${v}</strong></div>`).join('');
    $('#profileLead').textContent = `${p.name}（${p.english_name}），公开资料中常见身份为${p.primary_identity.join('、')}。本页优先呈现可被平台页或资讯站核验的信息，二级百科资料单独标注。`;
    $('#stylePills').innerHTML = p.style_keywords.map(x=>`<span class="pill">${x}</span>`).join('');
  }

  function initTracks(){
    const grid = $('#trackGrid');
    grid.innerHTML = data.tracks.map((t,i)=>`<article class="track-card reveal ${i===0?'active':''}" data-track="${t.id}">
      <img src="${t.cover}" alt="${t.title}视觉卡"><div><span class="track-tag">${t.tag}</span><h3>${t.title}</h3><p>${t.summary}</p></div>
    </article>`).join('');
    grid.addEventListener('click', e=>{
      const card = e.target.closest('.track-card'); if(!card) return;
      const t = data.tracks.find(x=>x.id===card.dataset.track);
      $$('.track-card').forEach(c=>c.classList.remove('active'));
      card.classList.add('active');
      setPlayer(t, 0);
    });
    setPlayer(data.tracks[0], 0, false);
  }

  function setPlayer(track, index=0, userClicked=true){
    const player = track.players[index] || track.players[0];
    $('#playerCover').src = track.cover;
    $('#playerCover').alt = `${track.title}视觉卡`;
    $('#playerTitle').textContent = track.title;
    $('#playerMeta').textContent = `${track.year} · ${track.tag}`;
    $('#playerDesc').textContent = track.summary;
    const buttons = $('#platformButtons');
    buttons.innerHTML = track.players.map((p,i)=>`<button class="platform-btn ${i===index?'active':''}" data-i="${i}">${p.label}</button>`).join('');
    buttons.onclick = e=>{
      const btn=e.target.closest('.platform-btn'); if(!btn) return;
      setPlayer(track, Number(btn.dataset.i));
    };
    $('#playerSources').textContent = '核验来源：' + track.sources.map(sourceName).join(' / ');
    const frame = $('#playerFrame');
    frame.title = `${track.title} - ${player.label} 内嵌播放器`;
    frame.src = player.src;
    if(userClicked) $('#playerPanel').scrollIntoView({behavior:'smooth', block:'nearest'});
  }

  function initPlatforms(){
    $('#platformGrid').innerHTML = data.platforms.map(p=>`<a class="platform-card reveal" href="${p.url}" target="_blank" rel="noreferrer">
      <b>${p.name}</b><span>${p.handle}<br>${p.type}</span><em>${p.note ? '备注：'+p.note : '来源：'+sourceName(p.verified_by)}</em>
    </a>`).join('');
  }

  function initMusicMaps(){
    const m = data.popular_music;
    const cards = [
      ['Apple Music排行样本', m.apple_music_top_sample], ['5sing热门歌曲样本', m.five_sing_hot_sample], ['YouTube Music高播放样本', m.youtube_music_top_sample]
    ];
    $('#musicMaps').innerHTML = cards.map(([title, items])=>`<article class="list-card panel reveal"><h3>${title}</h3><ol>${items.map(x=>`<li>${x}</li>`).join('')}</ol></article>`).join('');
  }

  function initTimeline(){
    $('#timeline').innerHTML = data.timeline.map(t=>`<article class="time-item reveal"><b>${t.year}</b><h3>${t.title}</h3><p>${t.desc}</p><p style="font-size:12px;margin-top:8px;color:#9b879e">来源：${sourceName(t.source.split('/')[0]) || t.source} · ${t.confidence}</p></article>`).join('');
  }

  function initGallery(){
    const classes = ['wide','', 'tall', '', '', '', 'wide', '', ''];
    $('#galleryGrid').innerHTML = data.images.map((img,i)=>`<figure class="gallery-item ${classes[i]||''} reveal" data-img="${img.web_file}" data-title="${img.title}" data-desc="${img.description}" data-source="${img.source_name}">
      <img src="${img.thumb_file}" alt="${img.title}" loading="lazy"><figcaption>${img.description}<br>来源：${img.source_name}</figcaption>
    </figure>`).join('');
    const lightbox = $('#lightbox');
    $('#galleryGrid').addEventListener('click', e=>{
      const fig=e.target.closest('.gallery-item'); if(!fig) return;
      $('#lightboxImg').src = fig.dataset.img;
      $('#lightboxTitle').textContent = fig.dataset.title;
      $('#lightboxDesc').textContent = `${fig.dataset.desc} 来源：${fig.dataset.source}。`;
      lightbox.classList.add('open');
    });
    $('#closeLightbox').onclick = ()=> lightbox.classList.remove('open');
    lightbox.addEventListener('click', e=>{ if(e.target===lightbox) lightbox.classList.remove('open'); });
  }

  function initSources(){
    $('#sourcesGrid').innerHTML = data.sources.map(s=>`<article class="source-card reveal"><b>${s.name}</b><span>${s.type} · ${s.confidence}</span><a href="${s.url}" target="_blank" rel="noreferrer">${s.url}</a></article>`).join('');
  }

  function initCursor(){
    const glow = $('.cursor-glow');
    window.addEventListener('mousemove', e=>{glow.style.left=(e.clientX-140)+'px'; glow.style.top=(e.clientY-140)+'px';});
  }

  function initAnimations(){
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){ $$('.reveal').forEach(el=>{el.style.opacity=1; el.style.transform='none'}); return; }
    if(window.gsap && window.ScrollTrigger){
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo('.hero .reveal, .hero .eyebrow, .hero h1, .hero .subtitle, .hero .hero-copy, .hero .cta-row, .hero .mini-card', {y:26, opacity:0}, {y:0, opacity:1, duration:.9, stagger:.08, ease:'power3.out'});
      gsap.fromTo('.portrait-main', {rotate:6, y:40, opacity:0}, {rotate:2, y:0, opacity:1, duration:1.1, ease:'elastic.out(1,.6)'});
      gsap.utils.toArray('.reveal').forEach(el=>{
        gsap.fromTo(el, {y:28, opacity:0}, {scrollTrigger:{trigger:el,start:'top 88%'}, y:0, opacity:1, duration:.75, ease:'power3.out'});
      });
      gsap.to('.music-note', {y:-14, rotate:8, repeat:-1, yoyo:true, duration:2.4, stagger:.35, ease:'sine.inOut'});
    } else {
      const io = new IntersectionObserver(entries=>{
        entries.forEach(ent=>{ if(ent.isIntersecting){ ent.target.style.opacity=1; ent.target.style.transform='none'; io.unobserve(ent.target);} });
      }, {threshold:.12});
      $$('.reveal').forEach(el=>io.observe(el));
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    initFacts(); initTracks(); initPlatforms(); initMusicMaps(); initTimeline(); initGallery(); initSources(); initCursor(); initAnimations();
    $('#year').textContent = new Date().getFullYear();
  });
})();
