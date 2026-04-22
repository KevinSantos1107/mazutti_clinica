/* ============================================================
   MAZUTTI CLÍNICA MÉDICA — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. HEADER SCROLL ---------- */
  const header = document.getElementById('header');
  const handleScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  /* ---------- 2. MENU MOBILE ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      const spans = menuToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        const spans = menuToggle.querySelectorAll('span');
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });

    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        nav.classList.remove('open');
        const spans = menuToggle.querySelectorAll('span');
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
  }

  /* ---------- 3. FADE-IN AO ROLAR ---------- */
  const fadeEls = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeEls.forEach(el => observer.observe(el));

  /* ---------- 4. FAQ ACCORDION ---------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      faqItems.forEach(other => {
        if (other !== item) {
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-answer').classList.remove('open');
        }
      });

      if (isOpen) {
        question.setAttribute('aria-expanded', 'false');
        answer.classList.remove('open');
      } else {
        question.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });

  /* ---------- 5. SMOOTH SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- 6. CONTADOR ANIMADO ---------- */
  const animateCounter = (el, target, suffix = '') => {
    const duration = 1800;
    const start = performance.now();
    const isDecimal = String(target).includes('.');

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isDecimal
        ? (eased * target).toFixed(1)
        : Math.round(eased * target).toLocaleString('pt-BR');

      el.textContent = (target >= 1000 ? '+' : '') + current + suffix;

      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = (target >= 1000 ? '+' : '') + (isDecimal ? target.toFixed(1) : target.toLocaleString('pt-BR')) + suffix;
    };

    requestAnimationFrame(update);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent.trim();

        if (text === '+5.000' || text.includes('5.000')) {
          animateCounter(el, 5000);
        } else if (text === '+20') {
          animateCounter(el, 20);
        } else if (text === '5.0') {
          animateCounter(el, 5.0);
        }

        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-big').forEach(el => counterObserver.observe(el));

  /* ---------- 7. WHATSAPP FLOAT — esconder no topo ---------- */
  const waFloat = document.querySelector('.whatsapp-float');
  if (waFloat) {
    const toggleWa = () => {
      if (window.scrollY > 300) {
        waFloat.style.opacity = '1';
        waFloat.style.pointerEvents = 'auto';
      } else {
        waFloat.style.opacity = '0';
        waFloat.style.pointerEvents = 'none';
      }
    };
    waFloat.style.transition = 'opacity .4s ease, transform .3s ease, box-shadow .3s ease';
    waFloat.style.opacity = '0';
    waFloat.style.pointerEvents = 'none';
    window.addEventListener('scroll', toggleWa, { passive: true });
    toggleWa();
  }

  /* ---------- 8. STAGGER DELAY NOS CARDS ---------- */
  const applyStagger = (selector, delayStep = 80) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.style.transitionDelay = `${i * delayStep}ms`;
    });
  };

  applyStagger('.specialty-card');
  applyStagger('.problem-card', 100);
  applyStagger('.why-card', 70);
  applyStagger('.testimonial-card', 100);

  /* ---------- 9. ACTIVE LINK NO SCROLL ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');

  const activeLinkObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.style.color = 'var(--blue)';
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => activeLinkObserver.observe(s));

  /* ---------- 10. RIPPLE NOS BOTÕES ---------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255,255,255,0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: rippleAnim 0.5s linear;
        pointer-events: none;
      `;

      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);

      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes rippleAnim {
        to { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ---------- 11. TOAST DE CONFIRMAÇÃO AO CLICAR NO CTA ---------- */
  const ctaLinks = document.querySelectorAll('a[href*="wa.me"]');
  ctaLinks.forEach(link => {
    link.addEventListener('click', () => {
      showToast('Redirecionando para o WhatsApp... 📱');
    });
  });

  function showToast(msg) {
    const existing = document.querySelector('.mazutti-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'mazutti-toast';
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 28px;
      background: var(--title, #0F172A);
      color: #fff;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 600;
      font-size: .88rem;
      padding: 12px 20px;
      border-radius: 100px;
      box-shadow: 0 4px 20px rgba(0,0,0,.2);
      z-index: 9999;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity .3s ease, transform .3s ease;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  /* ---------- 12. LAZY LOAD DO MAPA ---------- */
  const mapIframe = document.querySelector('.location-map iframe');
  if (mapIframe) {
    const mapObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const src = mapIframe.getAttribute('src');
        if (!mapIframe.getAttribute('data-loaded')) {
          mapIframe.setAttribute('data-loaded', 'true');
          mapIframe.src = src;
        }
        mapObserver.disconnect();
      }
    }, { threshold: 0.1 });
    mapObserver.observe(mapIframe);
  }

  /* ---------- 13. TOGGLE ESPECIALIDADES ---------- */
  const specialtiesExtra = document.getElementById('specialties-extra');
  const specialtiesToggleBtn = document.getElementById('specialties-toggle');

  if (specialtiesExtra && specialtiesToggleBtn) {
    specialtiesToggleBtn.addEventListener('click', () => {
      const isOpen = specialtiesExtra.classList.toggle('open');

      if (isOpen) {
        specialtiesToggleBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          Ver menos especialidades
        `;
        // anima os cards recém-visíveis
        specialtiesExtra.querySelectorAll('.specialty-card').forEach((el, i) => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(24px)';
          setTimeout(() => {
            el.style.transition = 'opacity .4s ease, transform .4s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, i * 60);
        });
      } else {
        specialtiesToggleBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          Ver todas as especialidades (+12)
        `;
        // rola de volta ao topo da seção
        const section = document.getElementById('especialidades');
        if (section) {
          const top = section.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  }

  console.log('✅ Mazutti Clínica Médica — scripts carregados com sucesso!');
});
