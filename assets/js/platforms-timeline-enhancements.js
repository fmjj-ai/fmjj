(function(){
  'use strict';

  function bindHoverTimeline(target, timeline){
    target.addEventListener('mouseenter', () => timeline.play());
    target.addEventListener('mouseleave', () => timeline.reverse());
  }

  function startAfterReady(task, delay){
    const run = () => setTimeout(task, delay);
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
  }

  function enhancePlatformsAndTimeline(){
    if(!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      // ========== 平台卡片增强 ==========
      const platformCards = document.querySelectorAll('.platform-card');

      platformCards.forEach((card, i) => {
        const icon = card.querySelector('.platform-icon');

        // 入场动画 - 3D翻转
        gsap.fromTo(card,
          {
            autoAlpha: 0,
            rotationY: -90,
            z: -100
          },
          {
            autoAlpha: 1,
            rotationY: 0,
            z: 0,
            duration: 0.8,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              once: true
            },
            delay: i * 0.05
          }
        );

        // 悬停动画 - Timeline编排
        const hoverTl = gsap.timeline({paused: true, defaults: {ease: 'power2.out'}});

        hoverTl.to(card, {
          y: -12,
          scale: 1.05,
          boxShadow: '0 20px 50px rgba(189, 124, 154, 0.25)',
          duration: 0.4
        }, 0)
        .to(icon, {
          scale: 1.3,
          rotation: 360,
          duration: 0.6,
          ease: 'back.out(2)'
        }, 0)
        .to(card, {
          background: 'rgba(255, 255, 255, 0.95)',
          duration: 0.3
        }, 0);

        bindHoverTimeline(card, hoverTl);

        // 图标呼吸动画
        if(icon){
          gsap.to(icon, {
            scale: 1.1,
            duration: 2 + i * 0.3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        }

        // 视差效果
        gsap.to(card, {
          y: (i % 2 === 0 ? 1 : -1) * 30,
          ease: 'none',
          scrollTrigger: {
            trigger: '#platforms',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2
          }
        });
      });

      // ========== 时间线增强 ==========
      const timelineBox = document.querySelector('#timeline');
      if(timelineBox){
        const timeItems = timelineBox.querySelectorAll('.time-item');

        timeItems.forEach((item, i) => {
          const isLeft = item.classList.contains('left');
          const year = item.querySelector('.time-year');
          const card = item.querySelector('.time-card');

          // 年份入场
          gsap.fromTo(year,
            {
              autoAlpha: 0,
              scale: 0,
              rotation: -180
            },
            {
              autoAlpha: 1,
              scale: 1,
              rotation: 0,
              duration: 0.8,
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                once: true
              }
            }
          );

          // 卡片入场 - 从侧边滑入
          gsap.fromTo(card,
            {
              autoAlpha: 0,
              x: isLeft ? -100 : 100,
              rotationY: isLeft ? -45 : 45
            },
            {
              autoAlpha: 1,
              x: 0,
              rotationY: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 75%',
                once: true
              },
              delay: 0.2
            }
          );

          // 卡片悬停效果
          const cardHoverTl = gsap.timeline({paused: true});
          cardHoverTl.to(card, {
            scale: 1.08,
            rotationY: isLeft ? 5 : -5,
            boxShadow: '0 20px 60px rgba(189, 124, 154, 0.3)',
            duration: 0.4,
            ease: 'power2.out'
          });

          bindHoverTimeline(card, cardHoverTl);

          // 连接线动画
          if(i < timeItems.length - 1){
            const line = document.createElement('div');
            line.className = 'timeline-connector';
            line.style.cssText = `
              position: absolute;
              ${isLeft ? 'right' : 'left'}: 50%;
              top: 100%;
              width: 2px;
              height: 80px;
              background: linear-gradient(to bottom, rgba(189, 124, 154, 0.3), transparent);
              transform-origin: top;
            `;
            item.appendChild(line);

            gsap.fromTo(line,
              {scaleY: 0},
              {
                scaleY: 1,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: item,
                  start: 'top 70%',
                  once: true
                },
                delay: 0.8
              }
            );
          }

          // 年份脉动
          gsap.to(year, {
            scale: 1.05,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play pause play pause'
            }
          });
        });

        // 整体时间线进度条
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
          position: absolute;
          left: 50%;
          top: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(to bottom,
            rgba(189, 124, 154, 0.2),
            rgba(132, 231, 212, 0.2),
            rgba(255, 230, 109, 0.2)
          );
          transform: translateX(-50%) scaleY(0);
          transform-origin: top;
          border-radius: 2px;
        `;
        timelineBox.style.position = 'relative';
        timelineBox.insertBefore(progressBar, timelineBox.firstChild);

        gsap.to(progressBar, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: timelineBox,
            start: 'top 60%',
            end: 'bottom 40%',
            scrub: 1
          }
        });
      }

      return () => {};
    });

    // 移动端优化
    mm.add('(max-width: 767px)', () => {
      const platformCards = document.querySelectorAll('.platform-card');

      platformCards.forEach((card, i) => {
        gsap.fromTo(card,
          {autoAlpha: 0, y: 30},
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              once: true
            },
            delay: i * 0.08
          }
        );
      });

      const timeItems = document.querySelectorAll('.time-item');
      timeItems.forEach((item) => {
        gsap.fromTo(item,
          {autoAlpha: 0, x: -30},
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              once: true
            }
          }
        );
      });
    });
  }

  startAfterReady(enhancePlatformsAndTimeline, 400);
})();
