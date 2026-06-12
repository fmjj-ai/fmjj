/* ============================================
   封茗囧菌个人网页 v2 - 交互脚本
   WebGL墨迹溶解 · 物理回弹 · 音乐控制 · 滚动浮现
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initWebGL();
    initNavbar();
    initMobileMenu();
    initMusic();
    initMusicTabs();
    initScrollReveal();
    initSmoothScroll();
    initSpectrumVisualizer();
    initSongPlayer();
    initDNAHelix();
    initScrollGallery();
});

/* ============================================
   WebGL 墨迹溶解背景着色器
   ============================================ */
function initWebGL() {
    const canvas = document.getElementById('webgl-bg');
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        // Fallback: CSS渐变背景
        canvas.style.background = 'linear-gradient(135deg, #FFE8ED 0%, #FFF3CC 40%, #F0FBF8 70%, #EDE5FF 100%)';
        return;
    }

    // 顶点着色器
    const vsSource = `
        attribute vec2 aPosition;
        void main() {
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;

    // 片段着色器 - 墨迹溶解效果
    const fsSource = `
        precision mediump float;
        uniform float uTime;
        uniform vec2 uResolution;

        // 简单噪声函数
        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            vec2 shift = vec2(100.0);
            for (int i = 0; i < 5; i++) {
                v += a * noise(p);
                p = p * 2.0 + shift;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution;
            float t = uTime * 0.15;

            // 墨迹溶解 - 多层噪声叠加
            vec2 q = vec2(fbm(uv * 3.0 + t * 0.3), fbm(uv * 3.0 + vec2(1.0)));
            vec2 r = vec2(fbm(uv * 3.0 + q + vec2(1.7, 9.2) + t * 0.2), fbm(uv * 3.0 + q + vec2(8.3, 2.8) + t * 0.15));
            float f = fbm(uv * 3.0 + r);

            // 柔和的粉色系配色
            vec3 pink = vec3(1.0, 0.91, 0.93);    // #FFE8ED
            vec3 peach = vec3(1.0, 0.95, 0.88);   // #FFF2E0
            vec3 cream = vec3(1.0, 0.97, 0.93);   // #FFF8ED
            vec3 mint = vec3(0.94, 0.97, 0.96);   // #F0F8F6
            vec3 lavender = vec3(0.97, 0.96, 1.0); // #F8F5FF

            // 基于噪声混合颜色
            vec3 color = mix(pink, cream, smoothstep(0.0, 1.0, f));
            color = mix(color, peach, smoothstep(0.3, 0.7, length(q)));
            color = mix(color, mint, smoothstep(0.4, 0.8, length(r) * 0.8));
            color = mix(color, lavender, smoothstep(0.5, 0.9, f * f));

            // 添加微妙的明暗变化
            float brightness = 0.98 + 0.04 * sin(f * 6.28);
            color *= brightness;

            // 边缘柔化
            float vignette = 1.0 - 0.15 * length((uv - 0.5) * 1.4);
            color *= vignette;

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    // 编译着色器
    function compileShader(source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program error:', gl.getProgramInfoLog(program));
        return;
    }

    gl.useProgram(program);

    // 全屏四边形
    const vertices = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');

    // 尺寸适配
    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    // 渲染循环
    const startTime = performance.now();
    function render() {
        const elapsed = (performance.now() - startTime) / 1000;
        gl.uniform1f(uTime, elapsed);
        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }
    render();
}

/* ============================================
   导航栏
   ============================================ */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    if (!navbar) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                if (window.scrollY > 60) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }

                // 活跃导航
                let current = '';
                sections.forEach(sec => {
                    const top = sec.offsetTop - 120;
                    if (window.scrollY >= top) current = sec.id;
                });
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
                });

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/* ============================================
   移动端菜单
   ============================================ */
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');
    const links = document.querySelectorAll('.mobile-link');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/* ============================================
   背景音乐控制
   ============================================ */
function initMusic() {
    const bgm = document.getElementById('bgm');
    const btn = document.getElementById('musicBtn');
    if (!bgm || !btn) return;

    let isPlaying = false;
    bgm.volume = 0.35;

    btn.addEventListener('click', () => {
        if (isPlaying) {
            bgm.pause();
            btn.classList.remove('playing');
            isPlaying = false;
            // BGM暂停时，停止频谱动画（歌曲播放器有自己的暂停处理）
            isSpectrumActive = false;
            document.getElementById('heroAvatarWrap')?.classList.remove('playing');
        } else {
            bgm.play().then(() => {
                btn.classList.add('playing');
                isPlaying = true;
            }).catch((e) => {
                console.warn('[BGM] play() rejected:', e.message);
            });
        }
    });

    // 首次用户交互时尝试播放（静音启动）
    let firstInteraction = true;
    document.addEventListener('click', () => {
        if (firstInteraction && !isPlaying) {
            firstInteraction = false;
            // 不自动播放，等用户点击音乐按钮
        }
    }, { once: true });
}

/* ============================================
   音乐标签切换
   ============================================ */
function initMusicTabs() {
    const tabs = document.querySelectorAll('.mtab');
    const panels = document.querySelectorAll('.mpanel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            panels.forEach(p => {
                p.classList.remove('active');
                if (p.id === 'panel-' + target) p.classList.add('active');
            });
        });
    });
}

/* ============================================
   滚动浮现动画 (IntersectionObserver)
   ============================================ */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 计算同层级中的索引，实现错落效果
                const parent = entry.target.parentElement;
                const siblings = parent ? parent.querySelectorAll(':scope > .reveal') : [];
                let idx = 0;
                siblings.forEach((sib, i) => { if (sib === entry.target) idx = i; });

                entry.target.style.setProperty('--d', (idx * 0.06) + 's');
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

/* ============================================
   平滑滚动 (带物理回弹感)
   ============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;

            const offset = 80;
            const start = window.scrollY;
            const targetY = target.getBoundingClientRect().top + window.pageYOffset - offset;
            const distance = targetY - start;
            const duration = Math.min(Math.max(Math.abs(distance) * 0.8, 400), 1200);

            const startTime = performance.now();

            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // easeOutExpo - 轻盈流畅的减速
                const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

                window.scrollTo(0, start + distance * eased);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }

            requestAnimationFrame(animate);
        });
    });
}

/* ============================================
   频谱可视化 - Web Audio API
   头像外圈圆形频谱 + 旋转动画
   ============================================ */
let audioCtx = null;
let analyser = null;
let spectrumAnimId = null;
let isSpectrumActive = false;
const connectedSources = new Map(); // 跟踪已连接的audio元素，避免重复连接

function initSpectrumVisualizer() {
    const canvas = document.getElementById('spectrumCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 260;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const innerRadius = 88;
    const maxBarHeight = 32;
    const barCount = 64;

    function drawSpectrum() {
        spectrumAnimId = requestAnimationFrame(drawSpectrum);
        ctx.clearRect(0, 0, size, size);

        let dataArray = null;
        if (analyser && isSpectrumActive) {
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
        }

        for (let i = 0; i < barCount; i++) {
            const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
            let barHeight = 2; // 静态时的最小高度

            if (dataArray) {
                // 从频率数据中采样
                const dataIndex = Math.floor((i / barCount) * (dataArray.length * 0.6));
                const value = dataArray[dataIndex] || 0;
                barHeight = Math.max(2, (value / 255) * maxBarHeight);
            }

            const x1 = centerX + Math.cos(angle) * innerRadius;
            const y1 = centerY + Math.sin(angle) * innerRadius;
            const x2 = centerX + Math.cos(angle) * (innerRadius + barHeight);
            const y2 = centerY + Math.sin(angle) * (innerRadius + barHeight);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';

            if (dataArray && barHeight > 4) {
                // 根据频率高度渐变颜色：粉色 -> 黄色
                const ratio = barHeight / maxBarHeight;
                const r = Math.round(255);
                const g = Math.round(107 + (217 - 107) * ratio);
                const b = Math.round(138 + (102 - 138) * ratio);
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.6 + ratio * 0.4})`;
            } else {
                ctx.strokeStyle = 'rgba(255, 182, 200, 0.25)';
            }
            ctx.stroke();
        }
    }

    drawSpectrum();
}

function connectAudioElement(audioEl) {
    if (!audioEl) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // 确保AudioContext处于运行状态（浏览器可能因自动播放策略将其暂停）
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                console.log('AudioContext resumed');
            }).catch(e => {
                console.warn('AudioContext resume failed:', e);
            });
        }

        // 每个audio元素只连接一次createMediaElementSource
        if (!connectedSources.has(audioEl)) {
            try {
                const source = audioCtx.createMediaElementSource(audioEl);
                const newAnalyser = audioCtx.createAnalyser();
                newAnalyser.fftSize = 128;
                newAnalyser.smoothingTimeConstant = 0.8;
                source.connect(newAnalyser);
                newAnalyser.connect(audioCtx.destination);
                connectedSources.set(audioEl, { source, analyser: newAnalyser });
                analyser = newAnalyser; // 更新全局analyser引用以驱动频谱
            } catch (e) {
                console.warn('Audio source connection failed:', e);
                return;
            }
        } else {
            // 已连接过，复用已有的analyser
            const existing = connectedSources.get(audioEl);
            if (existing && existing.analyser) {
                analyser = existing.analyser;
            }
        }

        isSpectrumActive = true;
        document.getElementById('heroAvatarWrap')?.classList.add('playing');
    } catch (e) {
        console.warn('频谱可视化初始化失败:', e);
    }
}

/* ============================================
   歌曲播放器 - 网易云音乐嵌入 + 本地mp3回退
   ============================================ */
function initSongPlayer() {
    const overlay = document.getElementById('playerOverlay');
    const closeBtn = document.getElementById('playerClose');
    const minimizeBtn = document.getElementById('playerMinimize');
    const modal = overlay.querySelector('.player-modal');
    const playerBody = document.getElementById('playerBody');
    const playerLocal = document.getElementById('playerLocal');
    const playerAudio = document.getElementById('playerAudio');
    const playerSongName = document.getElementById('playerSongName');
    const playerDisc = document.getElementById('playerDisc');
    const playerTip = document.getElementById('playerTip');
    const playBtns = document.querySelectorAll('.song-play-btn');

    let currentBtn = null;
    let currentLocalAudio = null;
    let isMinimized = false;

    // 关闭弹窗（停止播放）
    function closePlayer() {
        overlay.classList.remove('show');
        modal.classList.remove('minimized');
        modal.classList.remove('expanding');
        isMinimized = false;
        playerDisc.classList.remove('spinning');
        playerBody.innerHTML = '';
        playerLocal.style.display = 'none';
        playerTip.style.display = 'none';

        if (currentBtn) {
            currentBtn.classList.remove('active');
            currentBtn.querySelector('.play-icon').textContent = '▶';
            currentBtn = null;
        }

        // 停止频谱
        isSpectrumActive = false;
        document.getElementById('heroAvatarWrap')?.classList.remove('playing');

        // 暂停本地音频
        if (currentLocalAudio) {
            currentLocalAudio.pause();
            currentLocalAudio = null;
        }

        // 移除播放按钮的提升样式
        playBtns.forEach(b => b.classList.remove('elevated'));
    }

    // 最小化/展开切换
    function toggleMinimize() {
        isMinimized = !isMinimized;
        if (isMinimized) {
            modal.classList.add('minimized');
            minimizeBtn.textContent = '□';
            minimizeBtn.title = '展开';
        } else {
            modal.classList.remove('minimized');
            minimizeBtn.textContent = '—';
            minimizeBtn.title = '最小化';
        }
    }

    // 点击弹窗外部或被遮挡的播放按钮时处理
    overlay.addEventListener('click', (e) => {
        // 如果点击在 modal 内部，不处理（让 modal 内的元素自行处理）
        if (modal.contains(e.target)) return;

        // 暂时隐藏 overlay，用 elementFromPoint 找到被遮挡的元素
        overlay.style.pointerEvents = 'none';
        const target = document.elementFromPoint(e.clientX, e.clientY);
        overlay.style.pointerEvents = '';

        // 如果被遮挡的是播放按钮，手动触发其 click
        if (target && target.closest('.song-play-btn')) {
            target.closest('.song-play-btn').click();
            return;
        }

        // 否则关闭弹窗
        closePlayer();
    });

    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closePlayer(); });
    minimizeBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMinimize(); });
    modal.addEventListener('click', (e) => {
        if (isMinimized && !e.target.closest('.player-close')) toggleMinimize();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('show')) {
            if (!isMinimized) toggleMinimize();
            else closePlayer();
        }
    });

    // 播放按钮点击
    playBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const songName = btn.dataset.song;
            const neteaseId = btn.dataset.ne163;

            // 更新按钮状态
            if (currentBtn && currentBtn !== btn) {
                currentBtn.classList.remove('active');
                currentBtn.querySelector('.play-icon').textContent = '▶';
            }
            btn.classList.add('active');
            btn.querySelector('.play-icon').textContent = '⏸';
            currentBtn = btn;

            // 更新弹窗信息
            playerSongName.textContent = songName;
            playerDisc.classList.add('spinning');

            // 清空之前的内容
            playerBody.innerHTML = '';
            playerLocal.style.display = 'none';
            playerTip.style.display = 'none';

            // 优先本地文件，同时提供网易云音乐链接
            const localUrl = `audio/${songName}.mp3`;
            const hasLocal = await checkLocalFile(localUrl);

            if (hasLocal) {
                // 本地文件存在，直接播放
                playerLocal.style.display = 'block';
                playerAudio.src = localUrl;
                playerAudio.style.display = 'block';
                currentLocalAudio = playerAudio;
            }

            // 网易云音乐嵌入播放器
            if (neteaseId) {
                const iframe = document.createElement('iframe');
                iframe.src = `https://music.163.com/outchain/player?type=2&id=${neteaseId}&auto=1&height=66`;
                iframe.style.cssText = 'width:100%;height:66px;border:none;border-radius:12px;overflow:hidden;';
                iframe.allow = 'autoplay';
                playerBody.appendChild(iframe);
            }

            // 网易云音乐链接（始终显示，方便跳转）
            const ncLink = document.createElement('a');
            ncLink.href = `https://music.163.com/#/search/m/?s=${encodeURIComponent(songName + ' 封茗囧菌')}&type=1`;
            ncLink.target = '_blank';
            ncLink.rel = 'noopener';
            ncLink.className = 'netease-link';
            ncLink.innerHTML = '🎵 在网易云音乐中收听';
            playerBody.appendChild(ncLink);

            if (!hasLocal && !neteaseId) {
                playerTip.style.display = 'block';
                playerTip.querySelector('span').innerHTML =
                    `💡 本地未找到 <code>audio/${songName}.mp3</code><br>点击上方链接在网易云音乐中搜索，或将mp3放入 audio/ 文件夹`;
            }

            // 显示弹窗（如果最小化则展开）
            if (isMinimized) {
                modal.classList.remove('minimized');
                isMinimized = false;
                minimizeBtn.textContent = '—';
                minimizeBtn.title = '最小化';
            }
            overlay.classList.add('show');

            // 提升所有播放按钮的 z-index，使其在弹窗之上可点击
            playBtns.forEach(b => b.classList.add('elevated'));

            // 触发展开动效：先移除再添加，确保每次打开都重新播放动画
            modal.classList.remove('expanding');
            // 强制回流以重启动画
            void modal.offsetWidth;
            modal.classList.add('expanding');
        });
    });

    // 检测本地文件是否存在
    async function checkLocalFile(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }

    // 本地音频播放事件绑定
    function setupLocalAudio() {
        playerAudio.oncanplay = function() {
            playerAudio.play().then(() => {
                connectAudioElement(playerAudio);
            }).catch(() => {});
        };
        playerAudio.onerror = function() {
            playerLocal.style.display = 'none';
            if (currentBtn) {
                const songName = currentBtn.dataset.song;
                const neteaseId = currentBtn.dataset.ne163;
                if (neteaseId) {
                    playerTip.style.display = 'block';
                    playerTip.querySelector('span').innerHTML =
                        `💡 本地文件加载失败，请点击上方链接在网易云音乐中收听`;
                } else {
                    playerTip.style.display = 'block';
                    playerTip.querySelector('span').innerHTML =
                        `⚠️ 未找到本地文件 <code>audio/${songName}.mp3</code><br>请将mp3文件放入 audio/ 文件夹`;
                }
            }
        };
        playerAudio.onpause = function() {
            isSpectrumActive = false;
            document.getElementById('heroAvatarWrap')?.classList.remove('playing');
            playerDisc.classList.remove('spinning');
        };
        playerAudio.onplay = function() {
            isSpectrumActive = true;
            document.getElementById('heroAvatarWrap')?.classList.add('playing');
            playerDisc.classList.add('spinning');
        };
    }
    setupLocalAudio();

    // 注意：BGM不连接AudioContext，走浏览器原生音频输出，确保始终有声音
    // 频谱可视化仅用于歌曲播放器（本地mp3播放时）
}

/* ============================================
   DNA 双螺旋 - 竖直方向 + 滚动驱动旋转
   ============================================ */
function initDNAHelix() {
    const helix = document.getElementById('dnaHelix');
    const rotator = document.getElementById('dnaRotator');
    if (!helix || !rotator) return;

    const HELIX_RADIUS = 180;
    const HELIX_HEIGHT = 1600;
    const TOTAL_PAIRS = 7;
    const DEG_TO_RAD = Math.PI / 180;
    const RAD_TO_DEG = 180 / Math.PI;

    const nodes = rotator.querySelectorAll('.dna-node');
    const rungs = rotator.querySelectorAll('.dna-rung');

    // 创建骨架线容器
    let backbone = rotator.querySelector('.dna-backbone');
    if (!backbone) {
        backbone = document.createElement('div');
        backbone.className = 'dna-backbone';
        rotator.appendChild(backbone);
    }

    // 生成骨架线小圆点
    const POINTS_PER_STRAND = 60;
    const backboneDots = [];
    for (let strand = 0; strand < 2; strand++) {
        for (let i = 0; i < POINTS_PER_STRAND; i++) {
            const dot = document.createElement('div');
            const color = strand === 0 ? 'var(--pink-300)' : 'var(--yellow-300)';
            dot.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;background:${color};pointer-events:none;`;
            backbone.appendChild(dot);
            backboneDots.push({ el: dot, strand, t: i / (POINTS_PER_STRAND - 1) });
        }
    }

    function updatePositions(scrollRotation) {
        // 更新节点
        nodes.forEach(node => {
            const yIndex = parseInt(node.style.getPropertyValue('--y-pos')) || 0;
            const theta = parseFloat(node.style.getPropertyValue('--theta')) || 0;
            const isLeft = node.classList.contains('left');

            const yPos = (yIndex / (TOTAL_PAIRS - 1)) * HELIX_HEIGHT - HELIX_HEIGHT / 2;
            const angle = (theta + scrollRotation) * DEG_TO_RAD;
            const offset = isLeft ? 0 : Math.PI;

            const x = HELIX_RADIUS * Math.cos(angle + offset);
            const z = HELIX_RADIUS * Math.sin(angle + offset);

            node.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${yPos}px, ${z}px)`;

            const depthFactor = (z + HELIX_RADIUS) / (2 * HELIX_RADIUS);
            node.style.opacity = 0.3 + 0.7 * depthFactor;
        });

        // 更新碱基对横杆
        rungs.forEach(rung => {
            const yIndex = parseInt(rung.style.getPropertyValue('--y-pos')) || 0;
            const theta = parseFloat(rung.style.getPropertyValue('--theta')) || 0;

            const yPos = (yIndex / (TOTAL_PAIRS - 1)) * HELIX_HEIGHT - HELIX_HEIGHT / 2;
            const angle = (theta + scrollRotation) * DEG_TO_RAD;

            const x1 = HELIX_RADIUS * Math.cos(angle);
            const z1 = HELIX_RADIUS * Math.sin(angle);
            const x2 = HELIX_RADIUS * Math.cos(angle + Math.PI);
            const z2 = HELIX_RADIUS * Math.sin(angle + Math.PI);

            const midX = (x1 + x2) / 2;
            const midZ = (z1 + z2) / 2;
            const length = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
            const rotY = Math.atan2(z2 - z1, x2 - x1) * RAD_TO_DEG;

            rung.style.width = length + 'px';
            rung.style.transform = `translate(-50%, -50%) translate3d(${midX}px, ${yPos}px, ${midZ}px) rotateY(${rotY}deg)`;

            const depthFactor = (midZ + HELIX_RADIUS) / (2 * HELIX_RADIUS);
            rung.style.opacity = 0.15 + 0.35 * depthFactor;
        });

        // 更新骨架线
        backboneDots.forEach(({ el, strand, t }) => {
            const offset = strand * Math.PI;
            const yPos = t * HELIX_HEIGHT - HELIX_HEIGHT / 2;
            const theta = t * 330 * DEG_TO_RAD + scrollRotation * DEG_TO_RAD + offset;

            const x = HELIX_RADIUS * Math.cos(theta);
            const z = HELIX_RADIUS * Math.sin(theta);

            el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${yPos}px, ${z}px)`;

            const depthFactor = (z + HELIX_RADIUS) / (2 * HELIX_RADIUS);
            el.style.opacity = 0.1 + 0.25 * depthFactor;
        });
    }

    let currentRotation = 0;
    let targetRotation = 0;
    let ticking = false;

    function updateHelix() {
        const rect = helix.getBoundingClientRect();
        const helixHeight = helix.offsetHeight;
        const viewportHeight = window.innerHeight;

        const scrollStart = rect.top + window.scrollY - viewportHeight;
        const scrollEnd = rect.top + window.scrollY + helixHeight - viewportHeight * 0.5;
        const scrolled = window.scrollY - scrollStart;
        const totalScroll = scrollEnd - scrollStart;

        let progress = 0;
        if (totalScroll > 0) {
            progress = Math.max(0, Math.min(1, scrolled / totalScroll));
        }

        targetRotation = progress * 360;
    }

    function animate() {
        const diff = targetRotation - currentRotation;
        if (Math.abs(diff) > 0.1) {
            currentRotation += diff * 0.08;
        } else {
            currentRotation = targetRotation;
        }
        updatePositions(currentRotation);
        requestAnimationFrame(animate);
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateHelix();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    updateHelix();
    animate();
}

/* ============================================
   卷轴球形分布相册 - 自动旋转 + 滚轮缩放 + 悬停放大
   ============================================ */
function initScrollGallery() {
    const gallery = document.getElementById('scrollGallery');
    const carousel = document.getElementById('scrollCarousel');
    if (!gallery || !carousel) return;

    const SPHERE_RADIUS = 280;
    const TOTAL_ITEMS = 16;
    const GOLDEN_ANGLE = Math.PI * (1 + Math.sqrt(5));
    const RAD_TO_DEG = 180 / Math.PI;
    const DEG_TO_RAD = Math.PI / 180;

    // 预计算球面坐标
    const positions = [];
    for (let i = 0; i < TOTAL_ITEMS; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / TOTAL_ITEMS);
        const theta = GOLDEN_ANGLE * i;

        const x = SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta);
        const y = SPHERE_RADIUS * Math.cos(phi);
        const z = SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta);
        const faceAngle = Math.atan2(x, z) * RAD_TO_DEG;

        positions.push({ x, y, z, faceAngle });
    }

    const scrollItems = carousel.querySelectorAll('.scroll-item');

    let autoRotationY = 0;
    let autoRotationX = 0;
    let isPaused = false;
    let zoomLevel = 1;
    const ZOOM_MIN = 0.5;
    const ZOOM_MAX = 2.0;
    const ZOOM_STEP = 0.08;
    let lastTime = performance.now();

    function updateCarousel() {
        const now = performance.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        if (!isPaused) {
            autoRotationY += 10 * dt;
            autoRotationX = Math.sin(now / 4000) * 15;
        }

        // 不旋转容器，而是将旋转应用到每个 item 的全局坐标
        carousel.style.transform = `scale(${zoomLevel})`;

        const cosX = Math.cos(autoRotationX * DEG_TO_RAD);
        const sinX = Math.sin(autoRotationX * DEG_TO_RAD);
        const cosY = Math.cos(autoRotationY * DEG_TO_RAD);
        const sinY = Math.sin(autoRotationY * DEG_TO_RAD);

        scrollItems.forEach((item, i) => {
            if (i >= positions.length) return;
            const pos = positions[i];

            // 在全局坐标系中旋转球面坐标
            // 先绕 Y 轴旋转
            let x1 = pos.x * cosY + pos.z * sinY;
            let z1 = -pos.x * sinY + pos.z * cosY;
            let y1 = pos.y;

            // 再绕 X 轴旋转
            let y2 = y1 * cosX - z1 * sinX;
            let z2 = y1 * sinX + z1 * cosX;
            let x2 = x1;

            // 计算面朝观察者的角度
            const faceAngle = Math.atan2(x2, z2) * RAD_TO_DEG;

            if (item.classList.contains('zoomed')) {
                item.style.transform = `translate3d(${x2}px, ${y2}px, ${z2}px) rotateY(${faceAngle}deg) scale(1.8)`;
            } else {
                item.style.transform = `translate3d(${x2}px, ${y2}px, ${z2}px) rotateY(${faceAngle}deg)`;
            }

            // 深度透明度
            const depthNorm = (z2 + SPHERE_RADIUS) / (2 * SPHERE_RADIUS);
            item.style.opacity = 0.3 + 0.7 * depthNorm;
        });

        requestAnimationFrame(updateCarousel);
    }

    // 滚轮缩放
    gallery.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
        } else {
            zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
        }
    }, { passive: false });

    // 鼠标进入暂停
    gallery.addEventListener('mouseenter', () => { isPaused = true; });
    gallery.addEventListener('mouseleave', () => {
        isPaused = false;
        gallery.querySelectorAll('.scroll-item.zoomed').forEach(item => {
            item.classList.remove('zoomed');
        });
    });

    // 0.75s 悬停放大
    const hoverTimers = new Map();
    scrollItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const timer = setTimeout(() => { item.classList.add('zoomed'); }, 750);
            hoverTimers.set(item, timer);
        });
        item.addEventListener('mouseleave', () => {
            const timer = hoverTimers.get(item);
            if (timer) { clearTimeout(timer); hoverTimers.delete(item); }
            item.classList.remove('zoomed');
        });
    });

    updateCarousel();
}
