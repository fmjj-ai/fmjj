(function(){
  'use strict';

  function bindHoverTimeline(target, timeline, onEnter, onLeave){
    target.addEventListener('mouseenter', () => {
      timeline.play();
      onEnter?.();
    });
    target.addEventListener('mouseleave', () => {
      timeline.reverse();
      onLeave?.();
    });
  }

  function setTimeCardShadow(card, boxShadow){
    gsap.to(card, {
      boxShadow,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  function startAfterReady(task, delay){
    const start = () => setTimeout(task, delay);
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  }

  function initEnhancedAnimations(){
    if(!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      const softBg = document.querySelector('.soft-bg');
      if(softBg){
        const orbs = softBg.querySelectorAll('.orb');
        orbs.forEach((orb, i) => {
          gsap.to(orb, {
            x: () => (Math.random() - 0.5) * 300,
            y: () => (Math.random() - 0.5) * 300,
            scale: () => 1 + Math.random() * 0.3,
            duration: 8 + i * 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        });
      }

      const brandLogo = document.querySelector('.brand img');
      if(brandLogo){
        gsap.to(brandLogo, {
          rotation: 360,
          duration: 20,
          repeat: -1,
          ease: 'none'
        });
      }

      const siteHeader = document.querySelector('.site-header');
      if(siteHeader){
        gsap.to(siteHeader, {
          boxShadow: '0 4px 30px rgba(189, 124, 154, 0.15)',
          scrollTrigger: {
            trigger: 'body',
            start: 'top -50',
            end: 'top -51',
            toggleActions: 'play none none reverse'
          }
        });
      }

      const musicPlayer = document.querySelector('#playerPanel');
      if(musicPlayer){
        gsap.fromTo(musicPlayer,
          {
            rotationY: -5,
            transformPerspective: 1000
          },
          {
            rotationY: 5,
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            scrollTrigger: {
              trigger: musicPlayer,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play pause play pause'
            }
          }
        );
      }

      const pills = document.querySelectorAll('.pill');
      pills.forEach((pill, i) => {
        gsap.to(pill, {
          y: -8,
          duration: 1.5 + (i % 3) * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.1
        });
      });

      const factCards = document.querySelectorAll('.fact');
      factCards.forEach((card, i) => {
        const hoverTl = gsap.timeline({paused: true});
        hoverTl.to(card, {
          scale: 1.05,
          y: -10,
          boxShadow: '0 20px 40px rgba(189, 124, 154, 0.3)',
          duration: 0.3,
          ease: 'power2.out'
        });

        bindHoverTimeline(card, hoverTl);
      });

      const trackOptions = document.querySelectorAll('.track-option');
      trackOptions.forEach((track) => {
        const img = track.querySelector('img');
        if(img){
          const hoverTl = gsap.timeline({paused: true});
          hoverTl.to(img, {
            scale: 1.1,
            rotation: 3,
            duration: 0.4,
            ease: 'back.out(1.7)'
          });

          bindHoverTimeline(track, hoverTl);
        }
      });

      const platformCards = document.querySelectorAll('.platform-card');
      platformCards.forEach((card) => {
        const icon = card.querySelector('.platform-icon');
        if(icon){
          const hoverTl = gsap.timeline({paused: true});
          hoverTl.to(icon, {
            rotation: 360,
            scale: 1.2,
            duration: 0.6,
            ease: 'back.out(2)'
          });

          bindHoverTimeline(card, hoverTl);
        }
      });

      const timeCards = document.querySelectorAll('.time-card');
      timeCards.forEach((card) => {
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 60%',
            end: 'bottom 40%',
            onEnter: () => {
              setTimeCardShadow(card, '0 15px 35px rgba(189, 124, 154, 0.25)');
            },
            onLeave: () => {
              setTimeCardShadow(card, '0 8px 20px rgba(189, 124, 154, 0.15)');
            },
            onEnterBack: () => {
              setTimeCardShadow(card, '0 15px 35px rgba(189, 124, 154, 0.25)');
            },
            onLeaveBack: () => {
              setTimeCardShadow(card, '0 8px 20px rgba(189, 124, 154, 0.15)');
            }
          }
        });
      });

      const ctaButtons = document.querySelectorAll('.btn');
      ctaButtons.forEach((btn) => {
        const hoverTl = gsap.timeline({paused: true, defaults: {duration: 0.3, ease: 'power2.out'}});
        hoverTl.to(btn, {
          scale: 1.08,
          y: -4
        });

        bindHoverTimeline(btn, hoverTl, () => {
          gsap.to(btn, {
            boxShadow: '0 12px 30px rgba(189, 124, 154, 0.4)',
            duration: 0.3
          });
        }, () => {
          gsap.to(btn, {
            boxShadow: '0 6px 15px rgba(189, 124, 154, 0.2)',
            duration: 0.3
          });
        });
      });

      const visualCard = document.querySelector('.visual-card');
      if(visualCard){
        gsap.to(visualCard, {
          y: -20,
          rotation: 1,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      const waveNotes = document.querySelector('.wave-notes');
      if(waveNotes){
        gsap.to(waveNotes, {
          x: 10,
          rotation: 3,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      const sections = document.querySelectorAll('.section');
      sections.forEach((section) => {
        const kicker = section.querySelector('.section-kicker');
        if(kicker){
          gsap.fromTo(kicker,
            {
              backgroundPosition: '0% 50%'
            },
            {
              backgroundPosition: '100% 50%',
              duration: 3,
              repeat: -1,
              yoyo: true,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play pause play pause'
              }
            }
          );
        }
      });

      const listCards = document.querySelectorAll('.list-card li');
      listCards.forEach((li, i) => {
        const hoverTl = gsap.timeline({paused: true});
        hoverTl.to(li, {
          x: 10,
          color: '#bd7c9a',
          duration: 0.3,
          ease: 'power2.out'
        });

        bindHoverTimeline(li, hoverTl);
      });

      const gradientText = document.querySelector('.gradient-text');
      if(gradientText){
        gsap.to(gradientText, {
          backgroundPosition: '200% center',
          duration: 5,
          repeat: -1,
          ease: 'none'
        });
      }

      const introRipples = document.querySelectorAll('.intro-ripple');
      introRipples.forEach((ripple, i) => {
        gsap.fromTo(ripple,
          {
            scale: 1,
            opacity: 0.8
          },
          {
            scale: 2.5,
            opacity: 0,
            duration: 2,
            repeat: -1,
            delay: i * 0.6,
            ease: 'power1.out'
          }
        );
      });

      return () => {
        ScrollTrigger.getAll().forEach(st => st.kill());
      };
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.globalTimeline.timeScale(0);
      ScrollTrigger.getAll().forEach(st => st.disable());
    });
  }

  startAfterReady(initEnhancedAnimations, 100);
})();
