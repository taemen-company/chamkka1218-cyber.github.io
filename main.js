(function () {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.style.display = 'none';
    menuBtn?.setAttribute('aria-expanded', 'false');
  }
  menuBtn?.addEventListener('click', () => {
    const isOpen = mobileMenu.style.display === 'block';
    mobileMenu.style.display = isOpen ? 'none' : 'block';
    menuBtn.setAttribute('aria-expanded', String(!isOpen));
  });
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // Quote form -> mailto (no backend)
  const form = document.getElementById('quoteForm');
  const hint = document.getElementById('formHint');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name');
    const phone = data.get('phone');
    const company = data.get('company');
    const site = data.get('site');
    const product = data.get('product');
    const qty = data.get('qty');
    const due = data.get('due');
    const message = data.get('message');

    const subject = encodeURIComponent('[태멘] 견적/상담 문의');
    const body = encodeURIComponent(
      `이름: ${name}
연락처: ${phone}
회사/현장: ${company || '-'}
현장 위치: ${site || '-'}
관심 제품: ${product || '-'}
수량/규격: ${qty || '-'}
희망 납기: ${due || '-'}

문의 내용:
${message}`
    );

    const to = document.documentElement.dataset.contactEmail || 'tae-men@naver.com';
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    if (hint) hint.textContent = '메일 앱이 열리면 전송만 눌러주세요. (수신 이메일은 설정에서 변경 가능)';
  });
})();


// ===== HERO SLIDER (2~3장 자동 전환) =====
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const images = [
    'assets/hero-1.jpg',
    'assets/hero-2.jpg',
    'assets/hero-3.jpg'
  ];

  let idx = 0;
  function setHeroBg(src) {
    document.documentElement.style.setProperty('--hero-bg', `url('${src}')`);
  }

  setHeroBg(images[idx]);

  setInterval(() => {
    idx = (idx + 1) % images.length;
    setHeroBg(images[idx]);
  }, 5500);
})();


// ===== GALLERY LIGHTBOX (클릭하면 크게 보기) =====
(function () {
  const cards = document.querySelectorAll('.galleryCard');
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');

  if (!cards.length || !box || !img || !closeBtn) return;

  function open(src) {
    img.src = src;
    box.classList.add('open');
    box.setAttribute('aria-hidden', 'false');
  }

  function close() {
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    img.src = '';
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const src = card.getAttribute('data-full') || card.querySelector('img')?.src;
      if (src) open(src);
    });
  });

  closeBtn.addEventListener('click', close);
  box.addEventListener('click', (e) => {
    if (e.target === box) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();


// ===== CASE MODAL SLIDER (시공 사례) =====
(function () {
  const modal = document.getElementById('caseModal');
  const closeBtn = document.getElementById('caseModalClose');
  const titleEl = document.getElementById('caseModalTitle');
  const imgEl = document.getElementById('caseSlideImg');
  const captionEl = document.getElementById('caseCaption');
  const prevBtn = document.getElementById('casePrev');
  const nextBtn = document.getElementById('caseNext');
  const dotsEl = document.getElementById('caseDots');

  const cards = document.querySelectorAll('.caseCard');
  if (!modal || !closeBtn || !titleEl || !imgEl || !prevBtn || !nextBtn || !dotsEl || !cards.length) return;

  let current = 0;
  let gallery = [];
  let activeTitle = '시공 사례';

  function renderDots() {
    dotsEl.innerHTML = '';
    if (gallery.length <= 1) return;
    gallery.forEach((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'dot' + (i === current ? ' active' : '');
      d.setAttribute('aria-label', `슬라이드 ${i + 1}`);
      d.addEventListener('click', () => {
        current = i;
        render();
      });
      dotsEl.appendChild(d);
    });
  }

  function render() {
    const item = gallery[current];
    if (!item) return;

    titleEl.textContent = activeTitle;
    imgEl.src = item.src;
    imgEl.alt = activeTitle + ` (${current + 1}/${gallery.length})`;

    const cap = (item.caption || '').trim();
    if (captionEl) {
      captionEl.textContent = cap;
      captionEl.style.display = cap ? 'block' : 'none';
    }

    prevBtn.style.display = gallery.length > 1 ? 'flex' : 'none';
    nextBtn.style.display = gallery.length > 1 ? 'flex' : 'none';
    renderDots();
  }

  function openModal(title, items) {
    activeTitle = title || '시공 사례';
    gallery = Array.isArray(items) ? items : [];
    current = 0;
    if (!gallery.length) return;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    render();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    imgEl.src = '';
    if (captionEl) captionEl.textContent = '';
    gallery = [];
    current = 0;
  }

  function prev() {
    if (gallery.length <= 1) return;
    current = (current - 1 + gallery.length) % gallery.length;
    render();
  }

  function next() {
    if (gallery.length <= 1) return;
    current = (current + 1) % gallery.length;
    render();
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.getAttribute('data-title') || card.querySelector('b')?.textContent || '시공 사례';
      const raw = card.getAttribute('data-gallery') || '[]';
      let items = [];
      try {
        items = JSON.parse(raw);
      } catch (e) {
        items = [];
      }
      // normalize
      items = items.map(it => ({
        src: it.src || it,
        caption: it.caption || ''
      })).filter(it => !!it.src);

      openModal(title, items);
    });
  });

  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); });
  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
})();



// ===== SPEC MODAL SLIDER (규격/도면 자료) =====
(function () {
  const modal = document.getElementById('specModal');
  const closeBtn = document.getElementById('specModalClose');
  const titleEl = document.getElementById('specModalTitle');
  const descEl = document.getElementById('specModalDesc');
  const imgEl = document.getElementById('specSlideImg');
  const prevBtn = document.getElementById('specPrev');
  const nextBtn = document.getElementById('specNext');
  const dotsEl = document.getElementById('specDots');

  const cards = document.querySelectorAll('.specCard');
  if (!modal || !closeBtn || !titleEl || !imgEl || !prevBtn || !nextBtn || !dotsEl || !cards.length) return;

  const sets = {
    spec500: {
      title: '규격/도면 자료 · 500 × 500',
      desc: '클릭하여 사진/도면을 확대해서 확인할 수 있습니다.',
      images: [
        'assets/spec-500-types.png',
        'assets/spec-500-45mm.png'
      ]
    },
    spec730: {
      title: '규격/도면 자료 · 730 × 2,200',
      desc: '클릭하여 사진/도면을 확대해서 확인할 수 있습니다.',
      images: [
        'assets/spec-730-1.jpg',
        'assets/spec-730-2.jpg'
      ]
    },
    specDetail: {
      title: '규격/도면 자료 · 배수판 상세도',
      desc: '클릭하여 사진/도면을 확대해서 확인할 수 있습니다.',
      images: [
        'assets/spec-detail-original-1.svg',
        'assets/spec-detail-original-2.svg',
        'assets/spec-detail-original-3.svg'
      ]
    },

    // ===== Waterproof page extra sets =====
    outerSpec: {
      title: 'TM 외벽 방수 보호판 · 제품 규격',
      desc: '클릭하여 이미지를 확대해서 확인할 수 있습니다.',
      images: ['assets/spec-730-1.jpg']
    },
    outerDetail: {
      title: 'TM 외벽 방수 보호판 · 상세도',
      desc: '클릭하여 이미지를 확대해서 확인할 수 있습니다.',
      images: ['assets/spec-detail-1.png']
    },
    absSpec: {
      title: 'TM 방수 보호판 (ABS) · 정면/배면',
      desc: '클릭하여 정면/배면도를 슬라이드로 확인할 수 있습니다.',
      images: ['assets/company-front.jpg', 'assets/company-front.jpg']
    }
  };

  let current = { key: null, idx: 0, images: [] };

  function renderDots() {
    dotsEl.innerHTML = '';
    current.images.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot' + (i === current.idx ? ' active' : '');
      b.setAttribute('aria-label', `슬라이드 ${i + 1}`);
      b.addEventListener('click', () => go(i));
      dotsEl.appendChild(b);
    });
  }

  function go(i) {
    if (!current.images.length) return;
    current.idx = (i + current.images.length) % current.images.length;
    const src = current.images[current.idx];
    imgEl.src = src;
    imgEl.alt = titleEl.textContent + ` (${current.idx + 1}/${current.images.length})`;
    Array.from(dotsEl.children).forEach((d, di) => d.classList.toggle('active', di === current.idx));
  }

  function open(key) {
    const set = sets[key];
    if (!set) return;
    current.key = key;
    current.images = set.images;
    current.idx = 0;
    titleEl.textContent = set.title;
    if (descEl) descEl.textContent = set.desc;
    renderDots();
    go(0);

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    imgEl.src = '';
    dotsEl.innerHTML = '';
    current = { key: null, idx: 0, images: [] };
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-spec-set');
      open(key);
    });

    // Keyboard accessibility (Enter/Space)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const key = card.getAttribute('data-spec-set');
        open(key);
      }
    });
  });

  prevBtn.addEventListener('click', () => go(current.idx - 1));
  nextBtn.addEventListener('click', () => go(current.idx + 1));
  closeBtn.addEventListener('click', close);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  function isOpen() {
    return modal.classList.contains('open');
  }

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(current.idx - 1); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(current.idx + 1); return; }
  });

  // Swipe (mobile)
  let startX = 0;
  let startY = 0;
  let swiping = false;

  function onSwipeStart(e) {
    if (!isOpen()) return;
    const t = e.touches ? e.touches[0] : e;
    startX = t.clientX;
    startY = t.clientY;
    swiping = true;
  }

  function onSwipeEnd(e) {
    if (!isOpen() || !swiping) return;
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    swiping = false;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 50;

    // Only treat as swipe when it's mostly horizontal
    if (absX > absY && absX > threshold) {
      if (dx < 0) go(current.idx + 1);
      else go(current.idx - 1);
    }
  }

  // Attach swipe to the image area (best UX)
  imgEl.addEventListener('touchstart', onSwipeStart, { passive: true });
  imgEl.addEventListener('touchend', onSwipeEnd, { passive: true });

  // Pointer events for some mobile browsers
  imgEl.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    onSwipeStart(e);
  });
  imgEl.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse') return;
    onSwipeEnd(e);
  });
})();
