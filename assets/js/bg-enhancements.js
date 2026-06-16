(function(){
  'use strict';

  function initEnhancedBackground(){
    if(!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 768px)',
        reduceMotion: '(prefers-reduced-motion: reduce)'
      },
      (context) => {
        const {isDesktop, reduceMotion} = context.conditions;

        if(reduceMotion) return;

        // 创建音乐粒子 Canvas
        const canvas = document.createElement('canvas');
        canvas.className = 'music-particles-canvas';
        canvas.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
        `;
        document.body.insertBefore(canvas, document.body.firstChild);

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let particles = [];
        let mouse = {x: width / 2, y: height / 2};
        let animationId;

        window.addEventListener('resize', () => {
          width = canvas.width = window.innerWidth;
          height = canvas.height = window.innerHeight;
        });

        window.addEventListener('mousemove', (e) => {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
        });

        // 音符和符号
        const musicSymbols = ['♪', '♫', '♬', '♩', '♭', '♮', '♯', '𝄞', '✦', '✧', '○', '◇'];
        const colors = ['#f18ab4', '#84e7d4', '#ffe985', '#bd7c9a', '#c8fff1', '#ede4ff'];

        class Particle {
          constructor() {
            this.reset();
            this.y = Math.random() * height;
            this.life = Math.random();
          }

          reset() {
            this.x = Math.random() * width;
            this.y = height + 50;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = -(0.5 + Math.random() * 1);
            this.size = 12 + Math.random() * 16;
            this.life = 1;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.symbol = musicSymbols[Math.floor(Math.random() * musicSymbols.length)];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.swingOffset = Math.random() * Math.PI * 2;
            this.swingSpeed = 0.01 + Math.random() * 0.02;
            this.opacity = 0.3 + Math.random() * 0.4;
          }

          update() {
            // 摆动效果
            this.x += this.vx + Math.sin(this.swingOffset) * 0.3;
            this.y += this.vy;
            this.swingOffset += this.swingSpeed;
            this.rotation += this.rotationSpeed;

            // 鼠标互动
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if(dist < 150){
              const force = (150 - dist) / 150;
              this.x -= (dx / dist) * force * 2;
              this.y -= (dy / dist) * force * 2;
            }

            // 生命周期
            this.life -= 0.002;

            if(this.y < -50 || this.life <= 0 || this.x < -50 || this.x > width + 50){
              this.reset();
            }
          }

          draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.life * this.opacity;
            ctx.fillStyle = this.color;
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.symbol, 0, 0);
            ctx.restore();
          }
        }

        // 创建粒子
        const particleCount = isDesktop ? 60 : 30;
        for(let i = 0; i < particleCount; i++){
          particles.push(new Particle());
        }

        function animate(){
          ctx.clearRect(0, 0, width, height);

          particles.forEach(p => {
            p.update();
            p.draw();
          });

          animationId = requestAnimationFrame(animate);
        }

        animate();

        // 波纹效果 - 在特定区域触发
        const sections = gsap.utils.toArray('.section');
        sections.forEach((section) => {
          ScrollTrigger.create({
            trigger: section,
            start: 'top center',
            onEnter: () => createRipple(section)
          });
        });

        function createRipple(section){
          const rect = section.getBoundingClientRect();
          const ripple = document.createElement('div');
          ripple.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            width: 10px;
            height: 10px;
            margin: -5px 0 0 -5px;
            border-radius: 50%;
            border: 2px solid rgba(189, 124, 154, 0.4);
            pointer-events: none;
            z-index: 0;
          `;

          if(section.style.position !== 'absolute' && section.style.position !== 'fixed'){
            section.style.position = 'relative';
          }
          section.appendChild(ripple);

          gsap.to(ripple, {
            width: 500,
            height: 500,
            margin: '-250px 0 0 -250px',
            borderWidth: 0,
            opacity: 0,
            duration: 2,
            ease: 'power2.out',
            onComplete: () => ripple.remove()
          });
        }

        // 渐变背景流动
        const body = document.body;
        gsap.to(body, {
          backgroundPosition: '100% 100%',
          duration: 60,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

        // 导航栏
        const siteHeader = document.querySelector('.site-header');
        if(siteHeader){
          gsap.to(siteHeader, {
            backgroundColor: 'rgba(255, 249, 240, 0.88)',
            backdropFilter: 'blur(16px) saturate(1.2)',
            boxShadow: '0 4px 24px rgba(189, 124, 154, 0.12)',
            scrollTrigger: {
              trigger: 'body',
              start: 'top -50',
              end: 'top -51',
              toggleActions: 'play none none reverse'
            }
          });
        }

        // 鼠标跟随光晕
        const cursorGlow = document.querySelector('.cursor-glow');
        if(cursorGlow){
          gsap.to(cursorGlow, {
            scale: 1.15,
            opacity: 0.75,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        }

        return () => {
          cancelAnimationFrame(animationId);
          canvas.remove();
        };
      }
    );
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initEnhancedBackground, 300);
    });
  } else {
    setTimeout(initEnhancedBackground, 300);
  }
})();
