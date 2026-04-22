/* ============================================================
   MAZUTTI CLÍNICA MÉDICA — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     GA4 — HELPER
     Chama gtag com segurança — não quebra se ad-blocker ativo
  ============================================================ */
  function gaEvent(eventName, params = {}) {
    try {
      if (typeof gtag === 'function') gtag('event', eventName, params);
    } catch (_) { /* silencia bloqueadores */ }
  }

  /* ============================================================
     GA4 — SCROLL DEPTH  (marcos: 25 / 50 / 75 / 90 %)
     Dispara uma única vez por marco por carregamento de página
  ============================================================ */
  const DEPTH_MILESTONES = [25, 50, 75, 90];
  const firedMilestones  = new Set();

  window.addEventListener('scroll', () => {
    const pct = Math.round(
      ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
    );
    DEPTH_MILESTONES.forEach(m => {
      if (pct >= m && !firedMilestones.has(m)) {
        firedMilestones.add(m);
        gaEvent('scroll_depth', {
          event_category:  'engajamento',
          percent_scrolled: m,
          non_interaction:  true
        });
      }
    });
  }, { passive: true });

  /* ============================================================
     GA4 — VISUALIZAÇÃO DE SEÇÕES (dispara uma vez por seção)
  ============================================================ */
  const SECTION_NAMES = {
    hero:           'Hero',
    problemas:      'Problemas',
    diferenciais:   'Por que a Mazutti',
    especialidades: 'Especialidades',
    social:         'Prova Social',
    faq:            'FAQ',
    localizacao:    'Localização'
  };

  const sectionViewObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        gaEvent('section_view', {
          event_category: 'navegacao',
          section_id:     id,
          section_name:   SECTION_NAMES[id] || id
        });
        sectionViewObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('section[id]').forEach(s => sectionViewObs.observe(s));

  /* ============================================================
     GA4 — CLIQUES NO WHATSAPP
     Cada link no HTML tem data-ga-section indicando o contexto
     exato de conversão (hero, faq, cta_final etc.)
  ============================================================ */
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => {
      gaEvent('whatsapp_click', {
        event_category: 'conversao',
        section:        link.dataset.gaSection || 'desconhecido',
        cta_label:      link.textContent.trim().replace(/\s+/g, ' ').slice(0, 80)
      });
      showToast('Redirecionando para o WhatsApp... 📱');
    });
  });

  /* ============================================================
     GA4 — CLIQUES EM LINKS EXTERNOS MARCADOS
     (Google Maps, Instagram, Google Reviews — via data-ga-action)
  ============================================================ */
  document.querySelectorAll('a[data-ga-action]').forEach(link => {
    link.addEventListener('click', () => {
      gaEvent('outbound_click', {
        event_category: 'externo',
        action:         link.dataset.gaAction,
        label:          link.dataset.gaLabel || link.href
      });
    });
  });

  /* ============================================================
     GA4 — CLIQUE EM TELEFONE (tel:)
  ============================================================ */
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      gaEvent('phone_click', {
        event_category: 'conversao',
        phone_number:   link.getAttribute('href').replace('tel:', '')
      });
    });
  });

  /* ============================================================
     GA4 — NAVEGAÇÃO PELOS LINKS DO MENU
  ============================================================ */
  document.querySelectorAll('.nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      gaEvent('nav_click', {
        event_category: 'navegacao',
        destination:    link.getAttribute('href').replace('#', '')
      });
    });
  });

  /* ---------- 1. HEADER SCROLL ---------- */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ---------- 2. MENU MOBILE ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const nav        = document.getElementById('nav');

  const closeMenu = () => {
    nav.classList.remove('open');
    menuToggle.querySelectorAll('span').forEach(s => {
      s.style.transform = '';
      s.style.opacity   = '';
    });
  };

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      const spans = menuToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
        gaEvent('menu_mobile_open', { event_category: 'navegacao' });
      } else {
        closeMenu();
      }
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', e => { if (!header.contains(e.target)) closeMenu(); });
  }

  /* ---------- 3. FADE-IN AO ROLAR ---------- */
  const fadeObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => fadeObs.observe(el));

  /* ---------- 4. FAQ ACCORDION + GA4 ---------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');
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

        // GA4: qual pergunta foi aberta e em qual posição
        gaEvent('faq_open', {
          event_category: 'engajamento',
          question_index: index + 1,
          question_text:  question.querySelector('span')?.textContent?.trim() || `Pergunta ${index + 1}`
        });
      }
    });
  });

  /* ---------- 5. SMOOTH SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href   = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ---------- 6. CONTADOR ANIMADO ---------- */
  const animateCounter = (el, target) => {
    const start     = performance.now();
    const isDecimal = String(target).includes('.');
    const tick = (now) => {
      const eased   = 1 - Math.pow(1 - Math.min((now - start) / 1800, 1), 3);
      const current = isDecimal
        ? (eased * target).toFixed(1)
        : Math.round(eased * target).toLocaleString('pt-BR');
      el.textContent = (target >= 1000 ? '+' : '') + current;
      if (eased < 1) requestAnimationFrame(tick);
      else el.textContent = (target >= 1000 ? '+' : '') +
        (isDecimal ? target.toFixed(1) : target.toLocaleString('pt-BR'));
    };
    requestAnimationFrame(tick);
  };

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const text = entry.target.textContent.trim();
        if (text.includes('5.000')) animateCounter(entry.target, 5000);
        else if (text === '+20')   animateCounter(entry.target, 20);
        else if (text === '5.0')   animateCounter(entry.target, 5.0);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-big').forEach(el => counterObs.observe(el));

  /* ---------- 7. WHATSAPP FLOAT — visibilidade ---------- */
  const waFloat = document.querySelector('.whatsapp-float');
  if (waFloat) {
    waFloat.style.transition   = 'opacity .4s ease, transform .3s ease, box-shadow .3s ease';
    waFloat.style.opacity      = '0';
    waFloat.style.pointerEvents = 'none';
    const toggleWa = () => {
      const show = window.scrollY > 300;
      waFloat.style.opacity      = show ? '1' : '0';
      waFloat.style.pointerEvents = show ? 'auto' : 'none';
    };
    window.addEventListener('scroll', toggleWa, { passive: true });
    toggleWa();
  }

  /* ---------- 8. STAGGER DELAY NOS CARDS ---------- */
  const applyStagger = (sel, step = 80) =>
    document.querySelectorAll(sel).forEach((el, i) => {
      el.style.transitionDelay = `${i * step}ms`;
    });

  applyStagger('.specialty-card');
  applyStagger('.problem-card',    100);
  applyStagger('.why-card',         70);
  applyStagger('.testimonial-card', 100);

  /* ---------- 9. ACTIVE LINK NO SCROLL ---------- */
  const navLinks    = document.querySelectorAll('.nav a[href^="#"]');
  const activeObs   = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === '#' + entry.target.id
            ? 'var(--blue)' : '';
        });
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('section[id]').forEach(s => activeObs.observe(s));

  /* ---------- 10. RIPPLE NOS BOTÕES ---------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute; border-radius:50%; pointer-events:none;
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size / 2}px;
        top:${e.clientY - rect.top - size / 2}px;
        background:rgba(255,255,255,.3);
        transform:scale(0); animation:rippleAnim .5s linear;
      `;
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent = '@keyframes rippleAnim{to{transform:scale(2.5);opacity:0;}}';
    document.head.appendChild(s);
  }

  /* ---------- 11. TOAST ---------- */
  function showToast(msg) {
    document.querySelector('.mazutti-toast')?.remove();
    const toast = document.createElement('div');
    toast.className   = 'mazutti-toast';
    toast.textContent = msg;
    toast.style.cssText = `
      position:fixed; bottom:100px; right:28px;
      background:var(--title,#0F172A); color:#fff;
      font-family:'Plus Jakarta Sans',sans-serif;
      font-weight:600; font-size:.88rem;
      padding:12px 20px; border-radius:100px;
      box-shadow:0 4px 20px rgba(0,0,0,.2);
      z-index:9999; opacity:0; transform:translateY(10px);
      transition:opacity .3s ease,transform .3s ease;
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  /* ---------- 12. LAZY LOAD DO MAPA ---------- */
  const mapIframe = document.querySelector('.location-map iframe');
  if (mapIframe) {
    const mapObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !mapIframe.dataset.loaded) {
        mapIframe.dataset.loaded = 'true';
        mapIframe.src = mapIframe.getAttribute('src');
        mapObs.disconnect();
      }
    }, { threshold: 0.1 });
    mapObs.observe(mapIframe);
  }

  /* ---------- 13. TOGGLE ESPECIALIDADES + GA4 ---------- */
  const specialtiesExtra     = document.getElementById('specialties-extra');
  const specialtiesToggleBtn = document.getElementById('specialties-toggle');

  if (specialtiesExtra && specialtiesToggleBtn) {
    specialtiesToggleBtn.addEventListener('click', () => {
      const isOpen = specialtiesExtra.classList.toggle('open');

      if (isOpen) {
        specialtiesToggleBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          Ver menos especialidades
        `;
        specialtiesExtra.querySelectorAll('.specialty-card').forEach((el, i) => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(24px)';
          setTimeout(() => {
            el.style.transition = 'opacity .4s ease, transform .4s ease';
            el.style.opacity    = '1';
            el.style.transform  = 'translateY(0)';
          }, i * 60);
        });
        gaEvent('specialty_expand', { event_category: 'engajamento', action: 'expandir' });

      } else {
        specialtiesToggleBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          Ver todas as especialidades (+12)
        `;
        const sec = document.getElementById('especialidades');
        if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
        gaEvent('specialty_expand', { event_category: 'engajamento', action: 'recolher' });
      }
    });
  }

  console.log('✅ Mazutti Clínica Médica — scripts + GA4 carregados com sucesso!');
});
