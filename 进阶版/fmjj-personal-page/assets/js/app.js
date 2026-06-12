(() => {
  const data = window.FMJJ_DATA || {};
  const profile = data.profile || {};
  const platforms = data.platforms || [];
  const tracks = data.tracks || [];
  const charts = data.charts || {};
  const photos = data.photos || [];
  const tour = data.tour || [];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const compact = (items) => items.filter(Boolean);

  const platformIcon = (name) => {
    const map = {
      "Bilibili": "B",
      "微博": "微",
      "抖音": "抖",
      "5Sing 原创音乐": "5",
      "QQ 音乐": "Q",
      "酷狗音乐": "酷",
      "酷我音乐": "我",
      "Apple Music": "",
      "Spotify": "S",
      "YouTube Music": "▶",
      "LINE MUSIC": "L",
      "网易云音乐": "网"
    };
    return map[name] || name.slice(0, 1).toUpperCase();
  };

  const parsePlayCount = (value) => {
    const raw = String(value ?? "0").replaceAll(",", "").trim();
    const number = Number.parseFloat(raw);
    if (!Number.isFinite(number)) return 0;
    if (/M/i.test(raw)) return number * 1_000_000;
    if (/k/i.test(raw)) return number * 1_000;
    if (/W/i.test(raw) || /万/.test(raw)) return number * 10_000;
    return number;
  };

  const formatDate = (dateText) => {
    const [datePart, timePart] = String(dateText).split(" ");
    if (!datePart) return dateText;
    const [year, month, day] = datePart.split("-");
    return `${year}.${month}.${day}${timePart ? " " + timePart : ""}`;
  };

  const setText = (selector, text) => {
    const el = $(selector);
    if (el) el.textContent = text || "";
  };

  function renderProfile() {
    setText("#heroBio", profile.bio);
    setText("#artistName", profile.name || "封茗囧菌");
    setText("#artistTagline", profile.tagline);
    setText("#confidenceNote", profile.confidenceNote);

    const styleTags = $("#styleTags");
    if (styleTags) {
      styleTags.innerHTML = (profile.styleKeywords || []).map((tag) => `<span class="tag">${esc(tag)}</span>`).join("");
    }

    const identityItems = [
      ["英文名", profile.englishName],
      ["昵称", (profile.nicknames || []).join(" / ")],
      ["生日", profile.birthday],
      ["星座", profile.zodiac],
      ["身份", (profile.roles || []).slice(0, 2).join(" / ")],
      ["应援句", profile.fanSlogan]
    ];
    const identityGrid = $("#identityGrid");
    if (identityGrid) {
      identityGrid.innerHTML = identityItems.map(([label, value]) => `
        <div class="identity-item">
          <small>${esc(label)}</small>
          <strong>${esc(value)}</strong>
        </div>
      `).join("");
    }

    const statsGrid = $("#statsGrid");
    if (statsGrid) {
      statsGrid.innerHTML = (profile.counts || []).map((item) => `
        <article class="stat-card">
          <strong>${esc(item.value)}</strong>
          <span>${esc(item.label)}</span>
          <small>${esc(item.asOf)}</small>
        </article>
      `).join("");
    }

    const factList = $("#factList");
    if (factList) {
      const facts = [
        ["姓名", profile.name],
        ["英文名", profile.englishName],
        ["昵称", (profile.nicknames || []).join(" / ")],
        ["生日", profile.birthday],
        ["星座", profile.zodiac],
        ["身份", (profile.roles || []).join(" / ")],
        ["应援句", profile.fanSlogan]
      ];
      factList.innerHTML = facts.map(([dt, dd]) => `<div><dt>${esc(dt)}</dt><dd>${esc(dd)}</dd></div>`).join("");
    }

    const workCloud = $("#workCloud");
    if (workCloud) {
      workCloud.innerHTML = (profile.representativeWorks || []).map((work) => `<span class="tag">${esc(work)}</span>`).join("");
    }
  }

  function actionLinks(track) {
    return compact([
      track.sourceUrl && ["来源页", track.sourceUrl],
      track.appleUrl && ["Apple Music", track.appleUrl],
      track.youtubeUrl && ["YouTube", track.youtubeUrl]
    ]);
  }

  function renderTracks() {
    const list = $("#trackList");
    if (!list) return;

    list.innerHTML = tracks.map((track, index) => `
      <button class="track-card" type="button" data-track-index="${index}">
        <strong><span>${esc(track.title)}</span><span>${track.embed ? "可嵌入" : "来源链接"}</span></strong>
        <small>${esc(track.year)} · ${esc(track.kind)}</small>
        <p>${esc(track.why)}</p>
      </button>
    `).join("");

    list.addEventListener("click", (event) => {
      const button = event.target.closest(".track-card");
      if (!button) return;
      selectTrack(Number(button.dataset.trackIndex));
    });

    if (tracks.length) selectTrack(0, { silent: true });
  }

  function selectTrack(index, options = {}) {
    const track = tracks[index];
    if (!track) return;

    const frame = $("#musicFrame");
    const placeholder = $("#playerPlaceholder");
    const currentName = $("#currentTrackName");
    const actions = $("#playerActions");

    $$(".track-card").forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.trackIndex) === index);
    });

    if (currentName) currentName.textContent = `${track.title} · ${track.kind}`;

    if (frame && placeholder) {
      if (track.embed) {
        frame.src = track.embed;
        placeholder.classList.add("hidden");
        placeholder.classList.remove("no-embed");
        placeholder.innerHTML = `<span>♪</span><p>正在加载 ${esc(track.title)} 的官方嵌入播放器。</p>`;
      } else {
        frame.src = "about:blank";
        placeholder.classList.remove("hidden");
        placeholder.classList.add("no-embed");
        placeholder.innerHTML = `<span>☾</span><p>${esc(track.title)} 暂未找到稳定可嵌入播放器，请使用下方来源按钮打开官方平台。</p>`;
      }
    }

    if (actions) {
      const links = actionLinks(track).map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`).join("");
      const reload = track.embed ? `<button type="button" data-reload-track="${index}">重新载入播放器</button>` : "";
      actions.innerHTML = links + reload;
    }

    if (!options.silent) {
      $("#music")?.scrollIntoView({ behavior: "smooth", block: "start" });
      sparkle();
    }
  }

  function renderCharts() {
    const apple = $("#appleTopSongs");
    if (apple) {
      apple.innerHTML = (charts.appleTopSongs || []).map((song) => `<li>${esc(song)}</li>`).join("");
    }

    const renderBars = (selector, items) => {
      const target = $(selector);
      if (!target) return;
      const max = Math.max(...items.map((item) => parsePlayCount(item.plays)), 1);
      target.innerHTML = items.map((item) => {
        const value = parsePlayCount(item.plays);
        const width = Math.max(8, Math.round((value / max) * 100));
        return `
          <div class="bar-row">
            <header><strong>${esc(item.title)}</strong><span>${esc(item.plays)}</span></header>
            <div class="bar-track"><div class="bar-fill" style="--w:${width}%"></div></div>
          </div>
        `;
      }).join("");
    };

    renderBars("#youtubeBars", charts.youtubeMusicTopSongs || []);
    renderBars("#fiveSingBars", charts.fiveSingPopular || []);
  }

  function renderPlatforms() {
    const grid = $("#platformGrid");
    if (!grid) return;
    grid.innerHTML = platforms.map((platform) => `
      <article class="platform-card reveal">
        <div class="icon" aria-hidden="true">${esc(platformIcon(platform.name))}</div>
        <h3>${esc(platform.name)}</h3>
        <p><strong>${esc(platform.label)}</strong></p>
        <p>${esc(platform.type)}</p>
        <p>${esc(platform.note)}</p>
        <a class="open-link" href="${esc(platform.url)}" target="_blank" rel="noopener noreferrer">打开主页 ↗</a>
      </article>
    `).join("");
  }

  function renderPhotos() {
    const wall = $("#photoWall");
    if (!wall) return;
    wall.innerHTML = photos.map((photo, index) => `
      <article class="photo-card reveal">
        <a class="photo-visual" href="${esc(photo.hires || photo.src)}" target="_blank" rel="noopener noreferrer" aria-label="查看${esc(photo.title)}本地大图">
          <img src="${esc(photo.src)}" alt="${esc(photo.title)}" loading="lazy" data-photo-index="${index}" />
        </a>
        <div class="photo-missing"><p>本地图片未找到。<br />请检查 assets/images/photos 目录。</p></div>
        <div class="photo-caption">
          <h3>${esc(photo.title)}</h3>
          <p>${esc(photo.credit)}</p>
          <div class="photo-links">
            <a href="${esc(photo.hires || photo.src)}" target="_blank" rel="noopener noreferrer">本地大图</a>
            ${photo.source ? `<a href="${esc(photo.source)}" target="_blank" rel="noopener noreferrer">来源核验</a>` : ""}
          </div>
        </div>
      </article>
    `).join("");

    $$(".photo-card img", wall).forEach((image) => {
      image.addEventListener("error", () => image.closest(".photo-card")?.classList.add("image-missing"), { once: true });
    });
  }

  function renderTour() {
    const timeline = $("#tourTimeline");
    if (!timeline) return;
    timeline.innerHTML = tour.map((event) => `
      <article class="timeline-item reveal">
        <time datetime="${esc(event.date)}">${esc(formatDate(event.date))}</time>
        <h3>${esc(event.title)}</h3>
        <p>${esc(event.venue)}</p>
        <p>${esc(event.price)} · ${esc(event.source)}</p>
        <span class="city">${esc(event.city)}</span>
      </article>
    `).join("");
  }

  function bindPlayerActions() {
    document.addEventListener("click", (event) => {
      const reload = event.target.closest("[data-reload-track]");
      if (!reload) return;
      const index = Number(reload.dataset.reloadTrack);
      const track = tracks[index];
      if (!track?.embed) return;
      const frame = $("#musicFrame");
      if (frame) {
        frame.src = "about:blank";
        window.setTimeout(() => frame.src = track.embed, 70);
      }
    });
  }

  function initTheme() {
    const button = $("[data-theme-toggle]");
    const saved = localStorage.getItem("fmjj-theme");
    if (saved === "dark") document.body.classList.add("dark");
    updateThemeText();

    button?.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("fmjj-theme", document.body.classList.contains("dark") ? "dark" : "light");
      updateThemeText();
    });
  }

  function updateThemeText() {
    const button = $("[data-theme-toggle]");
    if (button) button.textContent = document.body.classList.contains("dark") ? "日光" : "月光";
  }

  function initTilt() {
    const card = $(".hero-card");
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
    });
  }

  function initMotion() {
    const revealItems = $$(".reveal");
    if (window.gsap && window.ScrollTrigger && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      revealItems.forEach((item, index) => {
        window.gsap.to(item, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          delay: Math.min(index * 0.025, 0.22),
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            once: true
          }
        });
      });

      window.gsap.to(".record-ring", {
        y: -8,
        duration: 2.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
      return;
    }

    const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 }) : null;

    revealItems.forEach((item) => {
      if (observer) observer.observe(item);
      else item.classList.add("is-visible");
    });
  }

  function sparkle() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sparkleWrap = document.createElement("div");
    sparkleWrap.style.position = "fixed";
    sparkleWrap.style.inset = "0";
    sparkleWrap.style.pointerEvents = "none";
    sparkleWrap.style.zIndex = "100";
    document.body.appendChild(sparkleWrap);

    for (let i = 0; i < 18; i += 1) {
      const dot = document.createElement("span");
      dot.textContent = i % 3 === 0 ? "♪" : "✦";
      dot.style.position = "absolute";
      dot.style.left = `${48 + (Math.random() * 18 - 9)}vw`;
      dot.style.top = `${46 + (Math.random() * 16 - 8)}vh`;
      dot.style.fontSize = `${14 + Math.random() * 16}px`;
      dot.style.color = i % 2 ? "#fb7dac" : "#59c9a6";
      dot.style.opacity = "0";
      sparkleWrap.appendChild(dot);

      const x = (Math.random() - 0.5) * 240;
      const y = (Math.random() - 0.5) * 190;
      if (window.gsap) {
        window.gsap.to(dot, { opacity: 1, duration: 0.12, delay: i * 0.012 });
        window.gsap.to(dot, { x, y, opacity: 0, rotate: Math.random() * 180, duration: 0.9, delay: i * 0.014, ease: "power2.out" });
      } else {
        dot.animate([
          { opacity: 0, transform: "translate3d(0,0,0) rotate(0deg)" },
          { opacity: 1, offset: 0.16 },
          { opacity: 0, transform: `translate3d(${x}px, ${y}px, 0) rotate(${Math.random() * 180}deg)` }
        ], { duration: 900, easing: "cubic-bezier(.2,.8,.2,1)" });
      }
    }

    window.setTimeout(() => sparkleWrap.remove(), 1100);
  }

  function init() {
    renderProfile();
    renderTracks();
    renderCharts();
    renderPlatforms();
    renderPhotos();
    renderTour();
    bindPlayerActions();
    initTheme();
    initTilt();
    initMotion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
