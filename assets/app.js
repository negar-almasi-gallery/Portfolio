(() => {
  const grid = document.getElementById('galleryGrid');
  const counter = document.getElementById('worksCount');
  const dialog = document.getElementById('videoDialog');
  const player = document.getElementById('dialogVideo');
  const title = document.getElementById('dialogTitle');
  const description = document.getElementById('dialogDescription');
  const technique = document.getElementById('dialogTechnique');
  const shareButton = document.getElementById('copyLink');
  let works = [];
  try { works = JSON.parse(document.getElementById('galleryData').textContent); }
  catch (e) { console.warn('Unable to read gallery', e); }
  works.sort((a,b) => (b.featured === true) - (a.featured === true) || a.id.localeCompare(b.id,'fa'));
  counter.textContent = String(works.length).replace(/\d/g, x=>'۰۱۲۳۴۵۶۷۸۹'[Number(x)]);
  const text = (s) => String(s ?? '');
  const photo = (work, holder) => {
    const img = new Image(); img.alt = 'تصویر واقعی اثر: '+text(work.title);
    img.loading = 'lazy';
    img.onerror = () => { img.remove(); holder.classList.add('missing-poster'); };
    img.src = work.poster;
    holder.prepend(img);
  };
  const openVideo = (work, updateHash=true) => {
    title.textContent = text(work.title); description.textContent = text(work.description);
    technique.textContent = text(work.technique);
    player.poster = work.poster; player.src = work.video;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open','');
    player.focus();
    if (updateHash) history.replaceState(null,'','#'+encodeURIComponent(work.id));
  };
  const closeVideo = () => { player.pause(); player.removeAttribute('src'); player.load(); if (dialog.open) dialog.close(); if (location.hash && works.some(w=>'#'+encodeURIComponent(w.id)===location.hash)) history.replaceState(null,'',location.pathname+location.search); };
  document.getElementById('closeDialog').addEventListener('click',closeVideo);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeVideo();});
  dialog.addEventListener('close',()=>{player.pause();player.removeAttribute('src');player.load();});
  shareButton.addEventListener('click', async () => {
    const url=location.href;
    try { await navigator.clipboard.writeText(url); shareButton.textContent='لینک کپی شد ✓'; }
    catch { shareButton.textContent='لینک در نوار آدرس قابل کپی است'; }
    setTimeout(()=>shareButton.textContent='کپی لینک این اثر ↗',1800);
  });
  if (!works.length) { grid.innerHTML = '<div class="empty-state">هنوز ویدیویی در گالری ثبت نشده است. ویدیوها را در پوشه videos مخزن قرار دهید.</div>'; return; }
  grid.replaceChildren();
  works.forEach((work,index)=>{
    const card = document.createElement('article'); card.className='work-card'+(index===0?' featured':'');
    const visual=document.createElement('button');visual.type='button';visual.className='work-visual';visual.setAttribute('aria-label','نمایش ویدیوی '+text(work.title));
    photo(work,visual);
    const stamp=document.createElement('span');stamp.className='work-stamp';stamp.textContent=text(work.category);
    const play=document.createElement('span');play.className='play-circle';play.textContent='▶';play.setAttribute('aria-hidden','true');
    visual.append(stamp,play);visual.addEventListener('click',()=>openVideo(work));
    const details=document.createElement('div'); details.className='work-details';
    const indexLabel=document.createElement('span');indexLabel.className='work-index';indexLabel.textContent='ARTWORK / '+String(index+1).padStart(2,'0');
    const badge=document.createElement('span');badge.className='work-badge';badge.textContent='✳ '+text(work.technique);
    const heading=document.createElement('h3');heading.textContent=text(work.title);
    const desc=document.createElement('p');desc.textContent=text(work.description);
    const watch=document.createElement('button');watch.className='watch-work';watch.type='button';watch.textContent='مشاهده ویدیوی اثر ↗';watch.addEventListener('click',()=>openVideo(work));
    details.append(indexLabel,badge,heading,desc,watch);
    card.append(visual,details);grid.append(card);
  });
  const initial=decodeURIComponent(location.hash.slice(1));const selected=works.find(w=>w.id===initial);if(selected)openVideo(selected,false);
  window.addEventListener('hashchange',()=>{const id=decodeURIComponent(location.hash.slice(1));const found=works.find(w=>w.id===id);if(found)openVideo(found,false);});
})();
