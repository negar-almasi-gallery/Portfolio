(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const grid = $('galleryGrid');
  const counter = $('worksCount');
  const filters = $('galleryFilters');
  const dialog = $('videoDialog');
  const player = $('dialogVideo');
  const title = $('dialogTitle');
  const description = $('dialogDescription');
  const technique = $('dialogTechnique');
  const shareButton = $('copyLink');
  const errorMessage = $('videoError');
  const heroImg = $('heroArtworkImage');
  const text = (value) => String(value ?? '');
  const faDigits = (value) => String(value).replace(/[0-9]/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
  let works = [];
  let lastTrigger = null;
  let openId = null;
  try {
    const data = JSON.parse($('galleryData').textContent);
    if (Array.isArray(data)) works = data.filter((w) => w && w.id && w.video);
  } catch (error) {
    console.error('خطا در خواندن اطلاعات گالری:', error);
  }
  works.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || text(a.id).localeCompare(text(b.id), 'fa'));
  const findHashWork = () => {
    try { return works.find((w) => text(w.id) === decodeURIComponent(location.hash.slice(1))); }
    catch { return undefined; }
  };
  const setHash = (id) => {
    const url = new URL(location.href);
    url.hash = id ? encodeURIComponent(id) : '';
    history.replaceState(null, '', url.toString());
  };
  const populateHero = () => {
    let i = 0;
    const tryNext = () => {
      if (i >= works.length) { heroImg.hidden = true; return; }
      const work = works[i++];
      const probe = new Image();
      probe.onload = () => {
        heroImg.src = work.poster;
        heroImg.alt = 'نمونه‌کار: ' + text(work.title);
        heroImg.hidden = false;
        $('heroVisual').setAttribute('aria-label', 'تصویر ' + text(work.title));
      };
      probe.onerror = tryNext;
      probe.src = work.poster;
    };
    tryNext();
  };
  const addPoster = (work, holder) => {
    if (!work.poster) { holder.classList.add('missing-poster'); return; }
    const img = new Image();
    img.alt = 'تصویر واقعی نمونه‌کار: ' + text(work.title);
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = () => { img.remove(); holder.classList.add('missing-poster'); };
    img.src = work.poster;
    holder.prepend(img);
  };
  const stopPlayback = () => {
    player.pause();
    player.removeAttribute('src');
    player.removeAttribute('poster');
    player.load();
  };
  const onClosed = () => {
    stopPlayback();
    errorMessage.hidden = true;
    if (openId && findHashWork()?.id === openId) setHash('');
    openId = null;
    if (lastTrigger?.isConnected) lastTrigger.focus({ preventScroll: true });
  };
  dialog.addEventListener('close', onClosed);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  $('closeDialog').addEventListener('click', () => dialog.close());
  player.addEventListener('error', () => { errorMessage.hidden = false; });
  player.addEventListener('loadeddata', () => { errorMessage.hidden = true; });
  const openVideo = (work, updateHash = true, trigger = null) => {
    if (!work) return;
    if (trigger) lastTrigger = trigger;
    errorMessage.hidden = true;
    if (dialog.open) stopPlayback();
    title.textContent = text(work.title);
    description.textContent = text(work.description);
    technique.textContent = text(work.technique);
    if (work.poster) player.poster = work.poster;
    player.src = work.video;
    openId = work.id;
    if (!dialog.open) dialog.showModal();
    if (updateHash) setHash(work.id);
    $('closeDialog').focus({ preventScroll: true });
  };
  const render = () => {
    grid.replaceChildren();
    works.forEach((work, index) => {
      const card = document.createElement('article');
      card.className = 'work-card' + (index === 0 ? ' featured' : '');
      card.dataset.category = text(work.category || 'سفال و سرامیک');
      const visual = document.createElement('button');
      visual.type = 'button'; visual.className = 'work-visual';
      visual.setAttribute('aria-label', 'تماشای ویدیوی ' + text(work.title));
      addPoster(work, visual);
      const stamp = document.createElement('span');
      stamp.className = 'work-stamp'; stamp.textContent = text(work.category || 'سفال و سرامیک');
      const play = document.createElement('span');
      play.className = 'play-circle'; play.textContent = '▶'; play.setAttribute('aria-hidden', 'true');
      visual.append(stamp, play);
      visual.addEventListener('click', () => openVideo(work, true, visual));
      const details = document.createElement('div'); details.className = 'work-details';
      const number = document.createElement('span');
      number.className = 'work-index'; number.textContent = 'ARTWORK / ' + String(index + 1).padStart(2, '0');
      const badge = document.createElement('span');
      badge.className = 'work-badge'; badge.textContent = '✳ ' + text(work.technique);
      const heading = document.createElement('h3'); heading.textContent = text(work.title);
      const summary = document.createElement('p'); summary.textContent = text(work.description);
      const watch = document.createElement('button'); watch.className = 'watch-work';
      watch.type = 'button'; watch.textContent = 'مشاهده ویدیوی اثر ↗';
      watch.addEventListener('click', () => openVideo(work, true, watch));
      details.append(number, badge, heading, summary, watch);
      card.append(visual, details); grid.append(card);
    });
  };
  const renderFilters = () => {
    const categories = [...new Set(works.map((w) => text(w.category || 'سفال و سرامیک')))];
    if (categories.length < 2) return;
    filters.hidden = false;
    const selection = ['همه آثار', ...categories];
    const buttons = selection.map((label, i) => {
      const button = document.createElement('button');
      button.className = 'filter-chip'; button.type = 'button'; button.textContent = label;
      button.setAttribute('aria-pressed', String(i === 0));
      button.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        let count = 0;
        for (const card of grid.querySelectorAll('.work-card')) {
          card.hidden = i !== 0 && card.dataset.category !== label;
          if (!card.hidden) count++;
        }
        counter.textContent = faDigits(count);
      });
      filters.append(button);
      return button;
    });
  };
  shareButton.addEventListener('click', async () => {
    const url = location.href;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      shareButton.textContent = 'لینک کپی شد ✓';
    } catch {
      shareButton.textContent = 'لینک در نوار آدرس قابل کپی است';
    }
    window.setTimeout(() => { shareButton.textContent = 'کپی لینک این اثر ↗'; }, 2000);
  });
  counter.textContent = faDigits(works.length);
  if (works.length === 0) {
    grid.innerHTML = '<div class="empty-state">هنوز اثری به گالری افزوده نشده است.</div>';
    return;
  }
  render(); renderFilters(); populateHero();
  const selected = findHashWork();
  if (selected) openVideo(selected, false);
  window.addEventListener('hashchange', () => {
    const work = findHashWork();
    if (work && work.id !== openId) openVideo(work, false);
    else if (!work && dialog.open) dialog.close();
  });
})();
