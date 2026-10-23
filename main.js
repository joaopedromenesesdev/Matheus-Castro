/**
 * Portfólio Executivo — Matheus Castro, CFP®
 * Lógica Vanilla JS: IntersectionObserver, Animação de Contadores, Header Blur & Navegação
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Atualizar Ano Corrente no Rodapé
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // 2. Header Scroll Controller (Backdrop Blur e Sombra)
  const header = document.getElementById('header');
  const handleScroll = () => {
    if (window.scrollY > 25) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Execução inicial

  // 3. Menu Mobile Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');

  if (mobileToggle && mainNav) {
    const closeMobileMenu = () => {
      mainNav.classList.remove('is-open');
      mobileToggle.classList.remove('is-active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };

    mobileToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      mobileToggle.classList.toggle('is-active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
    });

    // Fechar menu mobile ao clicar em qualquer link interno
    const navClickables = mainNav.querySelectorAll('.nav-link');
    navClickables.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Fechar ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });

    // Fechar ao clicar fora do menu se ele estiver aberto
    document.addEventListener('click', (e) => {
      if (mainNav.classList.contains('is-open') && !mainNav.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  // 4. Animação de Contadores Numéricos (Ease-Out)
  const animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-counter'), 10);
    if (isNaN(target)) return;

    const duration = 1800; // ms
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Função de Easing: easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeProgress * target);

      element.textContent = currentVal;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target;
      }
    };

    requestAnimationFrame(step);
  };

  // 5. Intersection Observer para Revelação de Elementos & Disparo de Contadores
  const revealElements = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');

          // Se o elemento contiver contadores estatísticos, dispará-los
          const counters = entry.target.querySelectorAll('[data-counter]');
          counters.forEach(counter => {
            if (!counter.dataset.animated) {
              counter.dataset.animated = 'true';
              animateCounter(counter);
            }
          });

          // Deixar de observar o elemento já revelado
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.05,
      rootMargin: '0px 0px 60px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback para navegadores sem IntersectionObserver
    revealElements.forEach(el => {
      el.classList.add('is-visible');
      const counters = el.querySelectorAll('[data-counter]');
      counters.forEach(counter => animateCounter(counter));
    });
  }

  // 6. ScrollSpy para Destacar Link Ativo no Header
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const updateActiveNavLink = () => {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

  // 6b. Scroll-Trigger Dinâmico da Linha do Tempo (Linha Dourada e Revelação de Cards)
  const initTimelineScrollProgress = () => {
    const timeline = document.querySelector('.timeline');
    const progressBar = document.getElementById('timelineProgressBar');
    const timelineItems = document.querySelectorAll('.timeline-item');

    if (!timeline || !progressBar || !timelineItems.length) return;

    let isTicking = false;

    const updateTimelineProgress = () => {
      const windowHeight = window.innerHeight;
      // Linha de gatilho visual natural nos olhos do usuário (60% da tela)
      const triggerY = windowHeight * 0.60;

      const firstItem = timelineItems[0];
      const lastItem = timelineItems[timelineItems.length - 1];

      const firstMarker = firstItem ? firstItem.querySelector('.marker-dot') : null;
      const lastMarker = lastItem ? lastItem.querySelector('.marker-dot') : null;

      if (!firstMarker || !lastMarker) return;

      const firstRect = firstMarker.getBoundingClientRect();
      const lastRect = lastMarker.getBoundingClientRect();

      // Ponto de início e fim da trilha útil da linha
      const startTrigger = firstRect.top;
      const endTrigger = lastRect.top;
      const totalDistance = endTrigger - startTrigger;

      // Progresso atual proporcional
      let progress = 0;
      if (totalDistance > 0) {
        const currentDistance = triggerY - startTrigger;
        progress = currentDistance / totalDistance;
      }

      // Limitar entre 0% e 100%
      const clampedProgress = Math.max(0, Math.min(1, progress));
      const percentage = (clampedProgress * 100).toFixed(1);

      progressBar.style.height = `${percentage}%`;
      progressBar.classList.toggle('is-active', clampedProgress > 0.02);

      // Ativar marcadores e revelar os cards corporativos conforme a linha avança
      timelineItems.forEach((item, index) => {
        const marker = item.querySelector('.marker-dot');
        if (!marker) return;

        const markerRect = marker.getBoundingClientRect();
        const isReached = markerRect.top <= triggerY + 15;

        if (isReached) {
          item.classList.add('is-active');
          item.classList.add('is-passed');
        } else {
          // O item atual (primeiro) permanece sempre ativo, os demais acompanham a descida da linha
          if (index !== 0) {
            item.classList.remove('is-active');
            item.classList.remove('is-passed');
          }
        }
      });

      isTicking = false;
    };

    const requestTick = () => {
      if (!isTicking) {
        requestAnimationFrame(updateTimelineProgress);
        isTicking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick, { passive: true });

    // Disparo inicial
    requestTick();
  };

  initTimelineScrollProgress();

  // 7. Carrossel Dinâmico de Credenciais & Formação com Autoplay e Painel Explicativo
  const initCredentialsCarousel = () => {
    const carouselWrapper = document.getElementById('credentialsCarousel');
    if (!carouselWrapper) return;

    const viewport = document.getElementById('carouselViewport');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const filterTabs = carouselWrapper.querySelectorAll('.filter-tab');
    const allCards = Array.from(carouselWrapper.querySelectorAll('.carousel-card'));
    const pagination = document.getElementById('carouselPagination');
    const credentialsSection = document.getElementById('credenciais');

    if (!viewport || !prevBtn || !nextBtn) return;

    let currentFilter = 'all';
    let autoplayTimer = null;
    let resumeTimeout = null;
    const autoplayInterval = 2500; // Tempo de exibição de cada card antes da rotação
    let isHovered = false;
    let isDragging = false;
    let isExpandedCardOpen = false;
    let isSectionVisible = false;

    // Obter cards visíveis atualmente com base no filtro ativo
    const getVisibleCards = () => {
      return allCards.filter(card => !card.classList.contains('is-hidden'));
    };

    // Atualizar estado das setas de navegação
    const updateNavButtons = () => {
      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      prevBtn.disabled = viewport.scrollLeft <= 10;
      nextBtn.disabled = viewport.scrollLeft >= maxScroll - 10;
    };

    // Avançar 1 card com transição suave e looping contínuo
    const stepForward = () => {
      const visibleCards = getVisibleCards();
      if (visibleCards.length <= 1) return;

      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      // Se estiver próximo ao final, retorna suavemente para o primeiro card
      if (viewport.scrollLeft >= maxScroll - 25) {
        viewport.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      // Localizar o próximo card alinhado além da posição atual
      const currentScroll = viewport.scrollLeft;
      let targetCard = null;
      for (let i = 0; i < visibleCards.length; i++) {
        const card = visibleCards[i];
        if (card.offsetLeft > currentScroll + 25) {
          targetCard = card;
          break;
        }
      }

      if (targetCard) {
        viewport.scrollTo({ left: targetCard.offsetLeft, behavior: 'smooth' });
      } else {
        viewport.scrollTo({ left: 0, behavior: 'smooth' });
      }
    };

    // Intervalo adaptativo: 5.0s em mobile para leitura tranquila, 2.5s no desktop
    const getAutoplayInterval = () => (window.innerWidth <= 768 ? 5000 : 2500);

    // Iniciar Autoplay
    const startAutoplay = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      stopAutoplay();
      if (isHovered || isDragging || isExpandedCardOpen || !isSectionVisible) return;

      autoplayTimer = setInterval(() => {
        stepForward();
      }, getAutoplayInterval());
    };

    // Pausar Autoplay imediatamente
    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
    };

    // Retomar Autoplay com delay gracioso
    const resumeAutoplayDelayed = (delay = 1000) => {
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        startAutoplay();
      }, delay);
    };

    // Criar e atualizar pontos de paginação (Dots)
    const updatePagination = () => {
      if (!pagination) return;
      pagination.innerHTML = '';
      const visibleCards = getVisibleCards();

      visibleCards.forEach((card, index) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Ir para item ${index + 1}`);
        dot.setAttribute('type', 'button');

        dot.addEventListener('click', () => {
          stopAutoplay();
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
          resumeAutoplayDelayed(2500);
        });

        pagination.appendChild(dot);
      });

      highlightActiveDot();
    };

    // Destacar o ponto ativo com base na posição do viewport
    const highlightActiveDot = () => {
      if (!pagination) return;
      const dots = pagination.querySelectorAll('.carousel-dot');
      const visibleCards = getVisibleCards();
      if (!dots.length || !visibleCards.length) return;

      const viewportRect = viewport.getBoundingClientRect();
      let closestIndex = 0;
      let minDistance = Infinity;

      visibleCards.forEach((card, idx) => {
        const cardRect = card.getBoundingClientRect();
        const distance = Math.abs(cardRect.left - viewportRect.left);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = idx;
        }
      });

      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === closestIndex);
      });
    };

    // Interações de Hover e Focus no Carrossel para Pausar e Retomar
    carouselWrapper.addEventListener('mouseenter', () => {
      isHovered = true;
      stopAutoplay();
    });

    carouselWrapper.addEventListener('mouseleave', () => {
      isHovered = false;
      if (!isExpandedCardOpen && !isDragging) {
        resumeAutoplayDelayed(900);
      }
    });

    carouselWrapper.addEventListener('focusin', () => {
      isHovered = true;
      stopAutoplay();
    });

    carouselWrapper.addEventListener('focusout', (e) => {
      // Se o novo elemento em foco estiver fora do carrossel
      if (!carouselWrapper.contains(e.relatedTarget)) {
        isHovered = false;
        if (!isExpandedCardOpen && !isDragging) {
          resumeAutoplayDelayed(900);
        }
      }
    });

    // Pausa tátil no mobile: congela o carrossel durante o toque e aguarda 4s após soltar
    viewport.addEventListener('touchstart', () => {
      stopAutoplay();
    }, { passive: true });

    viewport.addEventListener('touchend', () => {
      if (!isExpandedCardOpen && !isDragging) {
        resumeAutoplayDelayed(4000);
      }
    }, { passive: true });

    // Interações de Clique / Toque nos Cards e Botão Fechar Explicação
    allCards.forEach(card => {
      const closeBtn = card.querySelector('.explanation-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          card.classList.remove('is-expanded');
          isExpandedCardOpen = allCards.some(c => c.classList.contains('is-expanded'));
          if (!isHovered) {
            resumeAutoplayDelayed(800);
          }
        });
      }

      card.addEventListener('click', (e) => {
        // Se clicou no botão de fechar, o listener específico acima já cuidou
        if (e.target.closest('.explanation-close-btn')) return;

        const wasExpanded = card.classList.contains('is-expanded');

        // Fecha outros cards abertos
        allCards.forEach(c => {
          if (c !== card) c.classList.remove('is-expanded');
        });

        if (!wasExpanded) {
          card.classList.add('is-expanded');
          isExpandedCardOpen = true;
          stopAutoplay();
        } else {
          card.classList.remove('is-expanded');
          isExpandedCardOpen = false;
          if (!isHovered) {
            resumeAutoplayDelayed(1000);
          }
        }
      });

      // Acessibilidade via teclado (Enter / Barra de espaço)
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    // Clique fora fecha qualquer card expandido
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.carousel-card')) {
        if (isExpandedCardOpen) {
          allCards.forEach(c => c.classList.remove('is-expanded'));
          isExpandedCardOpen = false;
          if (!isHovered) {
            resumeAutoplayDelayed(1000);
          }
        }
      }
    });

    // Eventos de rolagem do Viewport
    let scrollTimeout;
    viewport.addEventListener('scroll', () => {
      updateNavButtons();
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(highlightActiveDot, 60);
    }, { passive: true });

    // Botões Anterior / Próximo
    prevBtn.addEventListener('click', () => {
      stopAutoplay();
      const scrollStep = viewport.clientWidth * 0.85;
      viewport.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      resumeAutoplayDelayed(2500);
    });

    nextBtn.addEventListener('click', () => {
      stopAutoplay();
      const scrollStep = viewport.clientWidth * 0.85;
      viewport.scrollBy({ left: scrollStep, behavior: 'smooth' });
      resumeAutoplayDelayed(2500);
    });

    // Filtros por Categoria (Todos / Certificações / Formação)
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter');
        if (filter === currentFilter) return;

        currentFilter = filter;
        stopAutoplay();

        // Fechar qualquer card expandido
        allCards.forEach(c => c.classList.remove('is-expanded'));
        isExpandedCardOpen = false;

        // Atualizar aba ativa
        filterTabs.forEach(t => {
          const isActive = t === tab;
          t.classList.toggle('active', isActive);
          t.setAttribute('aria-selected', isActive);
        });

        // Filtrar cards
        allCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          if (filter === 'all' || cardCategory === filter) {
            card.classList.remove('is-hidden');
          } else {
            card.classList.add('is-hidden');
          }
        });

        // Resetar rolagem para o início e atualizar paginação
        viewport.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(() => {
          updatePagination();
          updateNavButtons();
          resumeAutoplayDelayed(1200);
        }, 150);
      });
    });

    // Navegação por teclado quando o carrossel estiver em foco
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevBtn.click();
      } else if (e.key === 'ArrowRight') {
        nextBtn.click();
      }
    });

    // Suporte a arraste com o mouse (Drag to Scroll no Desktop)
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    viewport.addEventListener('mousedown', (e) => {
      isDown = true;
      isDragging = true;
      stopAutoplay();
      viewport.style.cursor = 'grabbing';
      viewport.style.userSelect = 'none';
      startX = e.pageX - viewport.offsetLeft;
      scrollStart = viewport.scrollLeft;
    });

    const stopDragging = () => {
      if (!isDown) return;
      isDown = false;
      isDragging = false;
      viewport.style.cursor = '';
      viewport.style.removeProperty('user-select');
      if (!isHovered && !isExpandedCardOpen) {
        resumeAutoplayDelayed(1200);
      }
    };

    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('mouseleave', stopDragging);

    viewport.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - viewport.offsetLeft;
      const walk = (x - startX) * 1.4;
      viewport.scrollLeft = scrollStart - walk;
    });

    // IntersectionObserver: pausa o autoplay quando a seção sair da tela
    if (credentialsSection && 'IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isSectionVisible = entry.isIntersecting;
          if (isSectionVisible) {
            if (!isHovered && !isExpandedCardOpen && !isDragging) {
              startAutoplay();
            }
          } else {
            stopAutoplay();
          }
        });
      }, { threshold: 0.15 });

      sectionObserver.observe(credentialsSection);
    } else {
      isSectionVisible = true;
      startAutoplay();
    }

    // Inicialização
    updatePagination();
    updateNavButtons();
  };

  initCredentialsCarousel();
});
