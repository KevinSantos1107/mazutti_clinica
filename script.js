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
    waFloat.style.transition    = 'opacity .4s ease, transform .3s ease, box-shadow .3s ease';
    waFloat.style.opacity       = '0';
    waFloat.style.pointerEvents = 'none';
    const toggleWa = () => {
      const show = window.scrollY > 300;
      waFloat.style.opacity       = show ? '1' : '0';
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
  const navLinks  = document.querySelectorAll('.nav a[href^="#"]');
  const activeObs = new IntersectionObserver((entries) => {
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
          el.style.opacity   = '0';
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

  /* ============================================================
     14. WHATSAPP — BOTÃO INDIVIDUAL POR ESPECIALIDADE
  ============================================================ */
  const WA_NUMBER = '5531995825395';

  const SPECIALTY_IMAGES = {
    'Cardiologista':                     'cardio.jpg',
    'Neurologista':                      'neuro.jpg',
    'Ortopedista / Traumatologista':     'orto.png',
    'Ginecologista':                     'gine.jpg',
    'Obstetra':                          'obstetra.jpg',
    'Pediatra':                          'pediatra.jpg',
    'Oftalmologista':                    'oftal.jpg',
    'Endocrinologista':                  'endo.jpg',
    'Gastroenterologista':               'gastro.jpg',
    'Otorrinolaringologista':            'otorrino.jpg',
    'Dermatologista':                    'derma.jpg',
    'Angiologista':                      'angio.jpg',
    'Urologista':                        'uro.jpg',
    'Geriatra':                          'geriatra.jpg',
    'Psicólogo':                         'psicologo.jpeg',
    'Psiquiatra':                        'psiquiatra.jpg',
    'Nutricionista':                     'nutri.jpg',
    'Reumatologista':                    'reuma.jpg',
    'Médico da Família / Clínico Geral': 'clinico-geral.jpg',
    'Medicina do Esporte':               'medicina-esporte.jpg',
    'Médico da Família':                 'medico-familia.jpg',
  };

  const SPECIALTY_MESSAGES = {
    'Cardiologista':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Cardiologista. Estou com dúvidas sobre minha saúde cardiovascular e preciso de avaliação. Podem verificar a disponibilidade de horário para mim?',

    'Neurologista':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Neurologista. Tenho sentido sintomas neurológicos e preciso de avaliação especializada. Podem verificar a disponibilidade de horário?',

    'Ortopedista / Traumatologista':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Ortopedista/Traumatologista. Estou com dores ou problemas musculoesqueléticos e preciso de avaliação. Podem verificar a disponibilidade de horário?',

    'Ginecologista':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com a Ginecologista. Preciso de acompanhamento da saúde feminina. Podem verificar a disponibilidade de horário para mim?',

    'Obstetra':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Obstetra para acompanhamento do pré-natal. Podem verificar a disponibilidade de horário para mim?',

    'Pediatra':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Pediatra para meu filho(a). Podem verificar a disponibilidade de horário?',

    'Oftalmologista':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Oftalmologista. Estou com problemas de visão e preciso de avaliação. Podem verificar a disponibilidade de horário?',

    'Endocrinologista':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Endocrinologista. Preciso de acompanhamento hormonal/metabólico. Podem verificar a disponibilidade de horário?',

    'Gastroenterologista':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Gastroenterologista. Estou com problemas digestivos e preciso de avaliação. Podem verificar a disponibilidade de horário?',

    'Otorrinolaringologista':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Otorrinolaringologista. Estou com problemas de ouvido, nariz ou garganta. Podem verificar a disponibilidade de horário?',

    'Dermatologista':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Dermatologista. Tenho uma questão de pele que precisa de avaliação especializada. Podem verificar a disponibilidade de horário?',

    'Angiologista':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Angiologista. Preciso de avaliação da minha circulação. Podem verificar a disponibilidade de horário?',

    'Urologista':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Urologista. Preciso de avaliação do sistema urinário. Podem verificar a disponibilidade de horário?',

    'Geriatra':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Geriatra para um paciente acima de 60 anos. Podem verificar a disponibilidade de horário?',

    'Psicólogo':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Psicólogo. Estou buscando apoio emocional e psicológico. Podem verificar a disponibilidade de horário?',

    'Psiquiatra':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Psiquiatra. Preciso de avaliação e acompanhamento especializado em saúde mental. Podem verificar a disponibilidade de horário?',

    'Nutricionista':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Nutricionista. Preciso de orientação alimentar e nutricional personalizada. Podem verificar a disponibilidade de horário?',

    'Reumatologista':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Reumatologista. Estou com dores articulares ou suspeita de doença reumática. Podem verificar a disponibilidade de horário?',

    'Médico da Família / Clínico Geral':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Clínico Geral. Preciso de avaliação geral e orientação sobre minha saúde. Podem verificar a disponibilidade de horário?',

    'Medicina do Esporte':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o especialista em Medicina do Esporte. Pratico atividade física e quero avaliação e acompanhamento. Podem verificar a disponibilidade?',

    'Médico da Família':
      'Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com o Médico de Família. Busco acompanhamento integral da minha saúde e da minha família. Podem verificar a disponibilidade de horário?'
  };

  // SVG do WhatsApp reutilizável
  const WA_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>`;

  document.querySelectorAll('.specialty-card').forEach(card => {
    const specialtyName = card.querySelector('h3')?.textContent?.trim() || '';

    // Aplica imagem de fundo se existir para esta especialidade
    const imgFile = SPECIALTY_IMAGES[specialtyName];
    if (imgFile) {
      card.style.setProperty('--card-bg', `url('${imgFile}')`);
    }

    const message = SPECIALTY_MESSAGES[specialtyName]
      || `Olá! Vim pelo site da Mazutti e gostaria de agendar uma consulta com ${specialtyName}. Podem verificar a disponibilidade de horário?`;

    const link = document.createElement('a');
    link.href      = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    link.target    = '_blank';
    link.rel       = 'noopener';
    link.className = 'specialty-wa';
    link.setAttribute('data-ga-section', 'especialidades_card');
    link.setAttribute('aria-label', `Agendar consulta de ${specialtyName} pelo WhatsApp`);
    link.innerHTML = `${WA_SVG} Agendar esta consulta`;

    link.addEventListener('click', (e) => {
      e.stopPropagation();
      gaEvent('whatsapp_click', {
        event_category: 'conversao',
        section:        'especialidades_card',
        cta_label:      specialtyName
      });
      showToast('Redirecionando para o WhatsApp... 📱');
    });

    card.appendChild(link);
  });

  /* ============================================================
     15. LUCIDE ICONS — inicializa todos os <i data-lucide="...">
     Chamado por último para garantir que o DOM está 100% montado,
     incluindo os botões de WA injetados dinamicamente acima.
     stroke-width: 1.5 — traço fino, estilo SaaS de saúde.
  ============================================================ */
  if (typeof lucide !== 'undefined') {
    lucide.createIcons({
      attrs: {
        'stroke-width': '1.5',
        'width':        '22',
        'height':       '22'
      }
    });
  }

  console.log('✅ Mazutti Clínica Médica — scripts + GA4 + Lucide Icons + WA especialidades carregados com sucesso!');
});
