'use strict';
(() => {
  const {pets, types, categories, classes} = window.WIKI_DATA;
  const catalog = window.WIKI_CATALOG;
  for (const c of categories) if (catalog[c.id]) c.count = catalog[c.id].length;
  const main = document.querySelector('main');
  const byId = new Map(pets.map(p => [p.id, p]));
  const byType = new Map(types.map(t => [t.id, t]));
  const rarityOrder = ['普通', '稀有', '史詩', '傳說'];
  const rarityColors = {'普通':['#B0B7C3','#686764'],'稀有':['#4C9AFF','#2166b5'],'史詩':['#A371F7','#7950bd'],'傳說':['#F0883E','#a2541e']};
  const paths = {
    paw:'M8 13c-2 1-4 3-3 5s3 2 7 0c4 2 6 2 7 0s-1-4-3-5c-2-2-6-2-8 0Z M6 6c-2-2-4 2-2 4s4-2 2-4Z M11 3c-2-1-3 4-1 5s3-4 1-5Z M16 3c-2-1-3 4-1 5s3-4 1-5Z M21 7c-1-2-4 1-3 3s4-1 3-3Z',
    monster:'m5 8-2-5 6 3h6l6-3-2 5v8l-7 5-7-5Z M8 12h1m6 0h1m-7 4h6',
    fish:'M3 12c4-9 11-9 15 0-4 9-11 9-15 0Zm15 0 4-5v10Z M7 10h.01',
    sprout:'M12 21V11M12 14C3 15 3 7 3 7s9-1 9 7Zm0-4C11 2 21 3 21 3s0 8-9 7Z',
    bowl:'M3 11h18c0 6-4 9-9 9s-9-3-9-9Zm4-6v2m5-4v4m5-2v2M8 22h8',
    gem:'m3 8 4-5h10l4 5-9 13L3 8Zm0 0h18M7 3l5 18 5-18',
    sword:'m14 3 7 0v7L10 19l-5-5Zm-9 9 7 7M3 21l5-5',
    arrow:'m9 5 7 7-7 7', back:'m14 5-7 7 7 7',
    search:'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
    book:'M12 5C8 2 3 4 3 4v16s5-2 9 0c4-2 9 0 9 0V4s-5-2-9 1Zm0 0v15',
    sparkle:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
    info:'M12 11v6m0-10h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    egg:'M20 14c0 5-3 8-8 8s-8-3-8-8S9 2 12 2s8 7 8 12Z M7 13l4 2 2-4 4 2',
    heart:'M12 21 3 12C-3 3 8-1 12 6c4-7 15-3 9 6Z',
    clock:'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    level:'M4 19h4v-5h4V9h4V4h4',
  };
  const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${paths[name] || paths.sparkle}"/></svg>`;
  const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = n => n.toLocaleString('zh-TW');
  const num = p => `#${String(p.number).padStart(4,'0')}`;
  const rarityStyle = r => `--rarity:${rarityColors[r]?.[0] || '#999'};--rarity-text:${rarityColors[r]?.[1] || '#686764'}`;
  const rarity = p => `<span class="rarity" style="${rarityStyle(p.rarity)}"><i class="rarity-dot" aria-hidden="true"></i>${esc(p.rarity)}</span>`;
  const typeTags = p => p.types.map(t => `<span class="type">${icon('sparkle')}${esc(byType.get(t)?.name || t)}</span>`).join('');
  const art = (p, eager = false) => p.image ? `<img src="./${esc(p.image)}" alt="${esc(p.name)}" width="480" height="480" loading="${eager ? 'eager' : 'lazy'}" decoding="async">` : `<div class="placeholder">${icon('paw')}<span>圖片待補・資料已公開</span></div>`;
  let state = {}, limit = 40;
  function params() { return new URLSearchParams(location.hash.split('?')[1] || ''); }
  function readState() {
    const p = params();
    return {q:p.get('q') || '', rarity:rarityOrder.includes(p.get('rarity')) ? p.get('rarity') : '', type:byType.has(p.get('type')) ? p.get('type') : '', sort:['number','name','rarity','stage'].includes(p.get('sort')) ? p.get('sort') : 'number'};
  }
  function query() {
    const p = new URLSearchParams();
    for (const [key,value] of Object.entries(state)) if (value && !(key === 'sort' && value === 'number')) p.set(key,value);
    return p.size ? '?' + p.toString() : '';
  }
  function home() {
    document.title = '呱馬圖鑑';
    main.innerHTML = `<div class="home"><section class="hero"><div class="hero-label">${icon('book')}你的口袋圖鑑</div><h1>呱馬的世界，<br>一起來探索。</h1><p>從小小夥伴到冒險寶物，<br>想找的資料，都在這裡。</p><img class="hero-portrait" src="./${esc(byId.get('p002s1').image)}" alt="${esc(byId.get('p002s1').name)}" width="480" height="480"><a class="hero-link" href="#/pets">認識寵物夥伴 ${icon('arrow')}</a></section><div class="section-heading"><h2>${icon('book')}探索圖鑑</h2><span>${categories.length} 個分類</span></div><div class="categories">${categories.map(c => `<${(['pets','classes'].includes(c.id) || Boolean(catalog[c.id])) ? `a href="#/${c.id}"` : 'div'} class="category ${(['pets','classes'].includes(c.id) || Boolean(catalog[c.id])) ? 'open' : ''}"><span class="tile-icon">${icon(c.icon)}</span><div><h3>${esc(c.name)}</h3><p>${fmt(c.count)} ${c.id === 'equipment' ? '件' : c.id === 'classes' ? '職業' : '種'}</p><span class="state">${(['pets','classes'].includes(c.id) || Boolean(catalog[c.id])) ? '查看圖鑑 ›' : '建置中'}</span></div></${(['pets','classes'].includes(c.id) || Boolean(catalog[c.id])) ? 'a' : 'div'}>`).join('')}</div><p class="home-note">${icon('info')}瀏覽各分類，找到想認識的夥伴與物品。</p></div>`;
  }
  function list() {
    state = readState(); limit = 40;
    document.title = '寵物圖鑑｜呱馬圖鑑';
    main.innerHTML = `<section class="page-head"><a class="back" href="#/">${icon('back')}全部圖鑑</a><div class="title-line"><h1>${icon('paw')}寵物圖鑑</h1><span class="count-pill">${fmt(pets.length)} 種</span></div><p>找找下一位想認識的夥伴。</p></section><section class="filters" aria-label="寵物搜尋與篩選"><label class="searchbox">${icon('search')}<input id="search" type="search" placeholder="搜尋名稱、編號或物種 ID" aria-label="搜尋寵物" value="${esc(state.q)}" autocomplete="off"></label><div class="filter-title"><span id="rarity-label">稀有度</span><button class="reset" id="reset">清除篩選</button></div><div class="chips" role="group" aria-labelledby="rarity-label">${['',...rarityOrder].map(r => `<button class="chip" data-rarity="${r}" aria-pressed="${state.rarity === r}" style="${rarityStyle(r)}">${r ? '<i class="rarity-dot" aria-hidden="true"></i>' : ''}${r || '全部'}</button>`).join('')}</div><div class="select-row"><label class="select-field">屬性<select id="type"><option value="">全部屬性</option>${types.map(t => `<option value="${t.id}" ${state.type === t.id ? 'selected' : ''}>${esc(t.name)}（${esc(t.concept)}）</option>`).join('')}</select></label><label class="select-field">排序<select id="sort">${[['number','圖鑑編號'],['name','名稱筆畫'],['rarity','稀有度優先'],['stage','進化階段']].map(([v,l]) => `<option value="${v}" ${state.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div></section><section class="results" aria-label="寵物列表"><div class="results-head"><strong id="result-count" role="status" aria-live="polite"></strong><span id="shown-count"></span></div><div id="cards" class="pet-grid"></div><div id="more-wrap"></div></section>`;
    document.querySelector('#search').addEventListener('input', e => update('q',e.target.value));
    document.querySelectorAll('[data-rarity]').forEach(b => b.addEventListener('click',() => update('rarity',b.dataset.rarity)));
    ['type','sort'].forEach(k => document.getElementById(k).addEventListener('change', e => update(k,e.target.value)));
    document.querySelector('#reset').addEventListener('click', reset);
    renderCards();
  }
  function reset() {
    state = {q:'',rarity:'',type:'',sort:'number'};
    document.querySelector('#search').value = ''; document.querySelector('#type').value = ''; document.querySelector('#sort').value = 'number';
    update();
  }
  function update(key,value) {
    if (key) state[key] = value;
    limit = 40; history.replaceState(null,'','#/pets'+query());
    document.querySelectorAll('[data-rarity]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.rarity === state.rarity)));
    renderCards();
  }
  function renderCards() {
    const q = state.q.trim().toLocaleLowerCase('zh-TW').replace(/^#/, '');
    const result = pets.filter(p => (!q || p.name.toLocaleLowerCase('zh-TW').includes(q) || p.id.toLowerCase().includes(q) || String(p.number).padStart(4,'0').includes(q)) && (!state.rarity || p.rarity === state.rarity) && (!state.type || p.types.includes(state.type)));
    result.sort((a,b) => (state.sort === 'name' ? a.name.localeCompare(b.name,'zh-Hant-u-co-stroke') : state.sort === 'rarity' ? rarityOrder.indexOf(b.rarity)-rarityOrder.indexOf(a.rarity) : state.sort === 'stage' ? a.stage-b.stage : a.number-b.number) || a.number-b.number);
    document.querySelector('#result-count').textContent = `找到 ${fmt(result.length)} 種寵物`;
    document.querySelector('#shown-count').textContent = result.length ? `顯示 ${fmt(Math.min(limit,result.length))} 種` : '';
    const cards = document.querySelector('#cards'); cards.className = result.length ? 'pet-grid' : '';
    cards.innerHTML = result.length ? result.slice(0,limit).map(p => `<a class="pet-card" href="#/pets/${p.id}${query()}" aria-label="${esc(p.name)}，${esc(p.rarity)}，查看詳情"><div class="pet-picture">${art(p)}<span class="pet-number">${num(p)}</span></div><div class="pet-info">${rarity(p)}<h2>${esc(p.name)}</h2><div class="types">${typeTags(p)}</div></div></a>`).join('') : `<div class="empty">${icon('search')}<h2>沒有符合的寵物</h2><p>試試其他名稱，或清除篩選重新找找。</p><button class="primary-button" id="empty-reset">清除篩選</button></div>`;
    document.querySelector('#empty-reset')?.addEventListener('click',reset);
    document.querySelector('#more-wrap').innerHTML = result.length > limit ? `<button id="more" class="more">再顯示 ${Math.min(40,result.length-limit)} 種</button>` : '';
    document.querySelector('#more')?.addEventListener('click', () => {const previous=limit;limit+=40;renderCards();document.querySelectorAll('.pet-card')[previous]?.focus({preventScroll:true});});
  }
  function detail(id) {
    state = readState(); const p = byId.get(id);
    if (!p) {document.title='找不到寵物｜呱馬圖鑑';main.innerHTML=`<div class="results empty">${icon('search')}<h1>找不到這隻寵物</h1><p>請回到圖鑑，使用名稱或編號搜尋。</p><a class="primary-button" href="#/pets">回寵物列表</a></div>`;return;}
    document.title = `${p.name}｜呱馬圖鑑`;
    const parent = byId.get(p.evolvesFrom), c = p.evolutionCondition;
    const acquire = parent ? `由「${parent.name}」進化取得。等級、親密度與累計有效餵食日數須同時達標。` : '透過寵物抽蛋、孵化取得；抽蛋池包含第一階物種。';
    main.innerHTML = `<div class="detail-back"><a class="back" href="#/pets${query()}">${icon('back')}寵物列表</a><span>寵物圖鑑</span></div><article class="detail"><div class="detail-art">${art(p,true)}<span class="pet-number">${num(p)}</span></div><div class="detail-summary">${rarity(p)}<h1>${esc(p.name)}</h1><div class="types">${typeTags(p)}</div><p class="description">${esc(p.description)}</p></div><section class="info-section"><h2>${icon('egg')}取得方式</h2><p>${esc(acquire)}</p>${parent ? '' : '<p class="subtle">各物種並非等機率抽出；此頁僅提供取得途徑。</p>'}${['p001s1','p002s1','p003s1','p004s1','p005s1','p006s1'].includes(p.id) ? '<p class="subtle">首隻寵物也可透過領養取得。</p>' : ''}</section><section class="info-section"><h2>${icon('level')}${parent ? '進化所需條件' : '物種資料'}</h2>${parent ? `<dl class="stat-grid"><div class="stat"><dt>${icon('level')}等級</dt><dd>${c.minLevel}</dd></div><div class="stat"><dt>${icon('heart')}親密度</dt><dd>${c.minIntimacy}</dd></div><div class="stat"><dt>${icon('clock')}餵食日數</dt><dd>${c.minFeedDays}<small>天</small></dd></div></dl><p class="subtle">進化另需素材；數量依遊戲進化操作顯示。</p>` : `<dl class="stat-grid"><div class="stat"><dt>${icon('level')}進化階段</dt><dd>${p.stage}</dd></div><div class="stat"><dt>${icon('sparkle')}屬性數</dt><dd>${p.types.length}</dd></div><div class="stat"><dt>${icon('paw')}進化方向</dt><dd>${p.evolvesTo.length}</dd></div></dl>`}</section><section class="info-section"><h2>${icon('sprout')}進化關係</h2>${parent ? `<a class="evolution-link" href="#/pets/${parent.id}${query()}"><span>前一階：${esc(parent.name)}</span>${icon('arrow')}</a>` : '<p class="subtle">目前為第一階物種。</p>'}${p.evolvesTo.length ? p.evolvesTo.map(id => `<a class="evolution-link" href="#/pets/${id}${query()}"><span>下一階：${esc(byId.get(id).name)}</span>${icon('arrow')}</a>`).join('') : '<p>已是此路線的最終階段。</p>'}</section><div class="detail-return"><a class="primary-button" href="#/pets${query()}">回寵物列表</a></div></article>`;
  }
  const statNames = {hp:'生命',attack:'攻擊',defense:'防禦',magic:'魔力',speed:'速度',luck:'幸運'};
  const expansionNote = '<p class="expansion-note">認識各職業的技能與分支</p>';
  function classList() {
    document.title='職業與技能｜呱馬圖鑑';
    main.innerHTML=`<section class="page-head"><a class="back" href="#/">${icon('back')}全部圖鑑</a><div class="title-line"><h1>${icon('sword')}職業與技能</h1><span class="count-pill">${classes.length} 職業</span></div><p>先認識成長與分支，再挑選冒險方向。</p>${expansionNote}</section><section class="results class-grid" aria-label="職業列表">${classes.map(c=>`<a class="class-card" href="#/classes/${c.id}"><h2>${icon('sword')}${esc(c.name)}</h2><p>A 分支 · ${esc(c.branches.A[0])}</p><p>B 分支 · ${esc(c.branches.B[0])}</p><span class="class-link">${c.skills.length} 招技能 · 查看介紹 ${icon('arrow')}</span></a>`).join('')}</section>`;
  }
  function classDetail(id) {
    const c=classes.find(c=>c.id===id);
    if(!c){document.title='找不到職業｜呱馬圖鑑';main.innerHTML='<div class="results empty"><h1>找不到這個職業</h1><a class="primary-button" href="#/classes">回職業列表</a></div>';return;}
    document.title=`${c.name}｜職業與技能｜呱馬圖鑑`;
    main.innerHTML=`<section class="page-head"><a class="back" href="#/classes">${icon('back')}職業列表</a><div class="title-line"><h1>${icon('sword')}${esc(c.name)}</h1><span class="count-pill">${c.skills.length} 招技能</span></div>${expansionNote}</section><article class="class-detail"><section class="info-section"><h2>${icon('level')}成長屬性</h2><p>每升一級的職業基礎成長；不含額外自動配點、裝備或其他加成。</p><dl class="stat-grid growth-grid">${Object.entries(c.growth).map(([k,v])=>`<div class="stat"><dt>${icon(k==='hp'?'heart':'level')}${statNames[k]}</dt><dd>+${v}</dd></div>`).join('')}</dl></section><section class="info-section"><h2>${icon('sprout')}二～六轉稱號</h2><div class="branch-grid">${['A','B'].map(b=>`<div><h3>${icon('sword')}${b} 分支 · ${esc(c.branches[b][0])}</h3><ol class="rank-list">${c.branches[b].map((name,i)=>`<li><span>${['二','三','四','五','六'][i]}轉</span><strong>${esc(name)}</strong></li>`).join('')}</ol></div>`).join('')}</div></section><section class="info-section"><h2>${icon('book')}目前技能</h2>${[null,'A','B'].map(b=>`<section class="skill-group"><h3>${icon('sparkle')}${b ? b+' 分支 · '+esc(c.branches[b][0]) : '基本技能 · 兩分支共用'}</h3><ul class="skill-list">${c.skills.filter(s=>s.branch===b).map(s=>`<li><div class="skill-title"><h4>${esc(s.name)}</h4><span>${b ? b+' 分支' : '基本'}</span></div><p>${esc(s.description)}。</p></li>`).join('')}</ul></section>`).join('')}</section><div class="detail-return"><a class="primary-button" href="#/classes">回職業列表</a></div></article>`;
  }

  // 六類沿用寵物的列表、搜尋、詳情骨架與深色主題變數。
  let catalogState, catalogLimit = 40, activeCategory;
  const categoryMeta = id => categories.find(c => c.id === id);
  const catalogQuery = () => {
    const p = new URLSearchParams();
    if (catalogState.q) p.set('q', catalogState.q);
    if (catalogState.sort !== 'number') p.set('sort', catalogState.sort);
    return p.size ? '?' + p.toString() : '';
  };
  function readCatalogState() {
    const p = params();
    catalogState = {q:p.get('q') || '',sort:p.get('sort') === 'name' ? 'name' : 'number'};
  }
  function catalogArt(p, c, image = p.image, eager = false) {
    return image ? `<img src="./${esc(image)}" alt="${esc(p.name)}" width="256" height="256" loading="${eager ? 'eager' : 'lazy'}" decoding="async">` : `<div class="placeholder">${icon(c.icon)}<span>圖片陸續補上</span></div>`;
  }
  const catalogTags = p => p.tags.map(t => `<span class="type">${icon('sparkle')}${esc(t)}</span>`).join('');
  function catalogList(id) {
    activeCategory = id; catalogLimit = 40; readCatalogState();
    const c = categoryMeta(id), entries = catalog[id];
    document.title = `${c.name}圖鑑｜呱馬圖鑑`;
    main.innerHTML = `<section class="page-head"><a class="back" href="#/">${icon('back')}全部圖鑑</a><div class="title-line"><h1>${icon(c.icon)}${esc(c.name)}圖鑑</h1><span class="count-pill">${fmt(entries.length)} ${id === 'equipment' ? '件' : '種'}</span></div><p>依名稱、編號或 ID 找到想認識的${esc(c.name)}。</p></section><section class="filters catalog-filters" aria-label="${esc(c.name)}搜尋與排序"><label class="searchbox">${icon('search')}<input id="catalog-search" type="search" placeholder="搜尋名稱、編號或 ID" aria-label="搜尋${esc(c.name)}" value="${esc(catalogState.q)}" autocomplete="off"></label><div class="select-row"><label class="select-field">排序<select id="catalog-sort"><option value="number" ${catalogState.sort === 'number' ? 'selected' : ''}>圖鑑編號</option><option value="name" ${catalogState.sort === 'name' ? 'selected' : ''}>名稱筆畫</option></select></label><button class="reset" id="catalog-reset">清除搜尋</button></div></section><section class="results" aria-label="${esc(c.name)}列表"><div class="results-head"><strong id="catalog-count" role="status" aria-live="polite"></strong><span id="catalog-shown"></span></div><div id="catalog-cards" class="pet-grid"></div><div id="catalog-more-wrap"></div></section>`;
    document.querySelector('#catalog-search').addEventListener('input', e => catalogUpdate('q',e.target.value));
    document.querySelector('#catalog-sort').addEventListener('change', e => catalogUpdate('sort',e.target.value));
    document.querySelector('#catalog-reset').addEventListener('click', catalogReset);
    renderCatalogCards();
  }
  function catalogReset() {
    catalogState = {q:'',sort:'number'};
    document.querySelector('#catalog-search').value = '';
    document.querySelector('#catalog-sort').value = 'number';
    catalogUpdate();
  }
  function catalogUpdate(key, value) {
    if (key) catalogState[key] = value;
    catalogLimit = 40;
    history.replaceState(null,'',`#/${activeCategory}${catalogQuery()}`);
    renderCatalogCards();
  }
  function renderCatalogCards() {
    const c = categoryMeta(activeCategory), q = catalogState.q.trim().toLocaleLowerCase('zh-TW').replace(/^#/,'');
    const rows = catalog[activeCategory].filter(p => !q || p.name.toLocaleLowerCase('zh-TW').includes(q) || p.id.toLocaleLowerCase('zh-TW').includes(q) || String(p.number).padStart(4,'0').includes(q));
    if (catalogState.sort === 'name') rows.sort((a,b) => a.name.localeCompare(b.name,'zh-Hant-u-co-stroke') || a.number-b.number);
    document.querySelector('#catalog-count').textContent = `找到 ${fmt(rows.length)} 筆${c.name}`;
    document.querySelector('#catalog-shown').textContent = rows.length ? `顯示 ${fmt(Math.min(catalogLimit,rows.length))} 筆` : '';
    const cards = document.querySelector('#catalog-cards');cards.className = rows.length ? 'pet-grid' : '';
    cards.innerHTML = rows.length ? rows.slice(0,catalogLimit).map(p => `<a class="pet-card" href="#/${activeCategory}/${encodeURIComponent(p.id)}${catalogQuery()}" aria-label="${esc(p.name)}，查看詳情"><div class="pet-picture">${catalogArt(p,c)}<span class="pet-number">${num(p)}</span></div><div class="pet-info">${p.rarity ? rarity(p) : ''}<h2>${esc(p.name)}</h2><div class="types">${catalogTags(p)}</div></div></a>`).join('') : `<div class="empty">${icon('search')}<h2>沒有符合的${esc(c.name)}</h2><p>試試其他名稱，或清除搜尋重新找找。</p><button class="primary-button" id="catalog-empty-reset">清除搜尋</button></div>`;
    document.querySelector('#catalog-empty-reset')?.addEventListener('click', catalogReset);
    document.querySelector('#catalog-more-wrap').innerHTML = rows.length > catalogLimit ? `<button class="more" id="catalog-more">再顯示 ${Math.min(40,rows.length-catalogLimit)} 筆</button>` : '';
    document.querySelector('#catalog-more')?.addEventListener('click', () => {const previous=catalogLimit;catalogLimit+=40;renderCatalogCards();document.querySelectorAll('.pet-card')[previous]?.focus({preventScroll:true});});
  }
  function catalogDetail(category,id) {
    readCatalogState();
    const c = categoryMeta(category), p = catalog[category].find(p => p.id === id), back = `#/${category}${catalogQuery()}`;
    if (!p) {document.title=`找不到${c.name}｜呱馬圖鑑`;main.innerHTML=`<div class="results empty">${icon('search')}<h1>找不到這筆${esc(c.name)}</h1><a class="primary-button" href="${back}">回${esc(c.name)}列表</a></div>`;return;}
    document.title = `${p.name}｜${c.name}圖鑑｜呱馬圖鑑`;
    const choices = Object.keys(p.variants || {});
    const quality = choices.includes(params().get('quality')) ? params().get('quality') : choices.includes('普通') ? '普通' : choices[0];
    const image = choices.length ? p.variants[quality] : p.image;
    main.innerHTML = `<div class="detail-back"><a class="back" href="${back}">${icon('back')}${esc(c.name)}列表</a><span>${esc(c.name)}圖鑑</span></div><article class="detail"><div class="detail-art" id="catalog-detail-art">${catalogArt(p,c,image,true)}<span class="pet-number">${num(p)}</span></div><div class="detail-summary">${p.rarity ? rarity(p) : ''}<h1>${esc(p.name)}</h1><div class="types">${catalogTags(p)}</div>${p.description ? `<p class="description">${esc(p.description)}</p>` : ''}</div><section class="info-section"><h2>${icon('info')}圖鑑資料</h2><p>資料 ID：${esc(p.id)}</p>${p.note ? `<p class="subtle">${esc(p.note)}</p>` : ''}${choices.length ? `<label class="select-field catalog-quality">${icon('gem')}外觀品質<select id="catalog-quality" aria-label="裝備外觀品質">${choices.map(r => `<option value="${esc(r)}" ${quality === r ? 'selected' : ''}>${esc(r)}${p.variants[r] ? '' : '・圖片陸續補上'}</option>`).join('')}</select></label>` : ''}</section><div class="detail-return"><a class="primary-button" href="${back}">回${esc(c.name)}列表</a></div></article>`;
    document.querySelector('#catalog-quality')?.addEventListener('change', e => {
      document.querySelector('#catalog-detail-art').innerHTML = `${catalogArt(p,c,p.variants[e.target.value],true)}<span class="pet-number">${num(p)}</span>`;
      const query = new URLSearchParams(catalogQuery().slice(1));query.set('quality',e.target.value);
      history.replaceState(null,'',`#/${category}/${encodeURIComponent(id)}?${query}`);
    });
  }

  function route() {
    const path = location.hash.split('?')[0].replace(/^#/, '') || '/';
    const parts = path.startsWith('/') ? path.split('/') : [];
    if (Object.prototype.hasOwnProperty.call(catalog, parts[1]) && parts.length === 2) catalogList(parts[1]);
    else if (Object.prototype.hasOwnProperty.call(catalog, parts[1]) && parts.length === 3 && parts[2]) {let id;try {id=decodeURIComponent(parts[2]);} catch (_) {id='';} catalogDetail(parts[1],id);}
    else if (path === '/classes') classList(); else if (/^\/classes\/[^/]+$/.test(path)) classDetail(path.slice(9)); else if (path === '/') home(); else if (path === '/pets') list(); else if (/^\/pets\/[^/]+$/.test(path)) detail(path.slice(6)); else {document.title='找不到頁面｜呱馬圖鑑';main.innerHTML='<div class="results empty"><h1>找不到這個頁面</h1><p>從圖鑑首頁重新開始探索。</p><a class="primary-button" href="#/">回首頁</a></div>';}
    window.scrollTo(0,0); main.focus({preventScroll:true});
  }
  document.querySelector('.skip').addEventListener('click', event => { event.preventDefault(); main.focus(); main.scrollIntoView(); });
  const theme = document.querySelector('#theme');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  theme.value = window.WIKI_THEME;
  function applyTheme() {
    document.documentElement.dataset.theme = theme.value === 'system' ? (systemTheme.matches ? 'dark' : 'light') : theme.value;
  }
  theme.addEventListener('change', () => {
    try { localStorage.setItem('guama-wiki-theme', theme.value); } catch (_) {}
    applyTheme();
  });
  systemTheme.addEventListener('change', applyTheme);
  applyTheme();
  window.addEventListener('hashchange',route); route();
})();
