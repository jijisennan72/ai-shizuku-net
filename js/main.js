/* =====================================================
   AIしずくネット — main.js（大分類×中分類2段フィルター版）
   ===================================================== */

const PRICE_LABELS = {
  free:     { text: '完全無料',     cls: 'badge-free' },
  freemium: { text: '無料プランあり', cls: 'badge-freemium' },
  paid:     { text: '有料',         cls: 'badge-paid' }
};

const CAT_LABELS = {
  writing:     { text: '文章作成',       cls: 'badge-purple' },
  design:      { text: 'デザイン',       cls: 'badge-teal' },
  video:       { text: '動画',           cls: 'badge-orange' },
  productivity:{ text: '仕事効率化',     cls: 'badge-blue' },
  marketing:   { text: 'マーケティング', cls: 'badge-green' },
  coding:      { text: 'プログラミング', cls: 'badge-blue' },
  business:    { text: 'ビジネス',       cls: 'badge-purple' },
  education:   { text: '学習・教育',     cls: 'badge-green' },
  github:      { text: 'GitHub AI',      cls: 'badge-purple' }
};

const GENRE_LABELS = {
  all:       { text: 'すべて',         icon: '🌐' },
  chat:      { text: 'チャットAI',     icon: '🤖' },
  creative:  { text: 'クリエイティブ', icon: '🎨' },
  dev:       { text: '開発・コード',   icon: '💻' },
  work:      { text: '仕事・業務',     icon: '💼' },
  education: { text: '学習・教育',     icon: '📚' }
};

// 中分類：大分類ごとに表示するカテゴリを絞る
const GENRE_CATS = {
  all:       ['all','writing','design','video','productivity','marketing','coding','business','education','github'],
  chat:      ['all'],
  creative:  ['all','design','video'],
  dev:       ['all','coding','github'],
  work:      ['all','writing','productivity','marketing','business'],
  education: ['all']
};

let allTools = [];
let activeGenre = 'all';
let activeFilter = 'all';
let activePriceFilter = 'all';
let searchQuery = '';

// ===== カードHTML生成 =====
function toolCardHTML(t) {
  const cat   = CAT_LABELS[t.category] || { text: t.category, cls: 'badge-blue' };
  const price = PRICE_LABELS[t.price]  || { text: t.price,    cls: 'badge-freemium' };
  const stars = '⭐ ' + (t.rating || 0).toFixed(1);
  const newBadge = t.new ? '<span class="badge badge-orange" style="margin-left:6px;">NEW</span>' : '';
  return `
    <div class="tool-card" data-cat="${t.category}" data-price="${t.price}" data-genre="${t.genre || 'work'}">
      <div class="tool-card-header">
        <div class="tool-icon" style="background:${t.iconBg || '#f0fdf4'};">${t.icon || '🤖'}</div>
        <div>
          <div class="tool-name">${t.name}${newBadge}</div>
          <span class="badge ${cat.cls}">${cat.text}</span>
        </div>
      </div>
      <p class="tool-desc">${t.desc || ''}</p>
      <div class="tool-meta">
        <span class="badge ${price.cls}">${price.text}</span>
        <span class="rating">${stars}</span>
      </div>
      <a href="${t.url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="margin-top:8px;">使ってみる →</a>
    </div>`;
}

// ===== 大分類タブHTML生成 =====
function renderGenreTabs() {
  const wrap = document.getElementById('genreTabs');
  if (!wrap) return;
  wrap.innerHTML = Object.entries(GENRE_LABELS).map(([key, v]) => {
    const cnt = key === 'all' ? allTools.length : allTools.filter(t => t.genre === key).length;
    const active = key === activeGenre ? ' active' : '';
    return `<button class="genre-tab${active}" onclick="setGenre(this,'${key}')">${v.icon} ${v.text} <span class="genre-count">${cnt}</span></button>`;
  }).join('');
}

// ===== 中分類チップHTML生成 =====
function renderCatChips() {
  const wrap = document.getElementById('catChips');
  if (!wrap) return;
  const cats = GENRE_CATS[activeGenre] || ['all'];
  const catLabels = {
    all:          '🌐 すべて',
    writing:      '✍️ 文章作成',
    design:       '🎨 デザイン',
    video:        '🎬 動画',
    productivity: '⚡ 仕事効率化',
    marketing:    '📢 マーケティング',
    coding:       '💻 プログラミング',
    business:     '💼 ビジネス',
    education:    '📚 学習',
    github:       '🐙 GitHub AI'
  };
  wrap.innerHTML = cats.map(key => {
    const active = key === activeFilter ? ' active' : '';
    return `<button class="filter-chip${active}" onclick="setFilter(this,'${key}')">${catLabels[key] || key}</button>`;
  }).join('');
}

// ===== フィルター適用 =====
function applyFilters() {
  const grid = document.getElementById('toolsGrid');
  const nr   = document.getElementById('noResults');
  if (!grid) return;

  const filtered = allTools.filter(t => {
    const genreOK = activeGenre === 'all' || t.genre === activeGenre;
    const catOK   = activeFilter === 'all' || t.category === activeFilter;
    const priceOK = activePriceFilter === 'all' || t.price === activePriceFilter;
    const q = searchQuery.toLowerCase();
    const searchOK = q === '' || t.name.toLowerCase().includes(q) || (t.desc || '').toLowerCase().includes(q);
    return genreOK && catOK && priceOK && searchOK;
  });

  grid.innerHTML = filtered.map(toolCardHTML).join('');
  if (nr) nr.classList.toggle('hidden', filtered.length > 0);
}

// ===== 大分類切り替え =====
function setGenre(btn, genre) {
  activeGenre  = genre;
  activeFilter = 'all';
  renderGenreTabs();
  renderCatChips();
  applyFilters();
}

// ===== 中分類切り替え =====
function setFilter(btn, cat) {
  activeFilter = cat;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

function setPriceFilter(btn, price) {
  activePriceFilter = activePriceFilter === price ? 'all' : price;
  document.querySelectorAll('[onclick*="setPriceFilter"]').forEach(b => b.classList.remove('active'));
  if (activePriceFilter !== 'all') btn.classList.add('active');
  applyFilters();
}

function filterTools(query) {
  searchQuery = query;
  applyFilters();
}

// ===== ディレクトリページ初期化 =====
function renderDirectory() {
  const grid = document.getElementById('toolsGrid');
  if (!grid) return;
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  if (catParam) activeFilter = catParam;
  renderGenreTabs();
  renderCatChips();
  applyFilters();
}

// ===== インデックスページ描画 =====
function renderIndex() {
  const featured = allTools.filter(t => t.featured).slice(0, 6);
  const grid = document.getElementById('featuredGrid');
  if (grid) grid.innerHTML = featured.map(toolCardHTML).join('');
  const cnt = document.getElementById('toolCount');
  if (cnt) cnt.textContent = allTools.length + '+';
}

// ===== 今週の新着描画 =====
function renderNew() {
  const grid = document.getElementById('newGrid');
  if (!grid) return;
  const newTools = allTools.filter(t => t.new).slice(0, 4);
  grid.innerHTML = newTools.map(t => `
    <div class="card" style="display:flex;gap:16px;align-items:flex-start;">
      <div style="width:44px;height:44px;background:${t.iconBg || '#f0fdf4'};border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">${t.icon || '🤖'}</div>
      <div>
        <div style="font-weight:700;color:var(--navy);margin-bottom:4px;">${t.name}</div>
        <div style="font-size:0.83rem;color:#64748b;margin-bottom:8px;">${t.desc || ''}</div>
        <span class="badge ${(PRICE_LABELS[t.price]||{cls:'badge-freemium'}).cls}">${(PRICE_LABELS[t.price]||{text:'無料プランあり'}).text}</span>
      </div>
    </div>`).join('');
}

// ===== カテゴリカウント更新 =====
function updateCategoryCounts() {
  const counts = {};
  allTools.forEach(t => { counts[t.category] = (counts[t.category]||0)+1; });
  document.querySelectorAll('.cat-chip .count').forEach(el => {
    const chip = el.closest('.cat-chip');
    if (!chip) return;
    const href = chip.getAttribute('href') || '';
    const m = href.match(/cat=(\w+)/);
    if (m && counts[m[1]]) el.textContent = counts[m[1]] + 'ツール';
  });
  const totalEl = document.querySelector('.hero-count-total');
  if (totalEl) totalEl.textContent = allTools.length + '+';
}

// ===== ナビゲーション =====
function toggleMenu() {
  const m = document.getElementById('navMenu');
  if (m) m.classList.toggle('open');
}

// ===== ヒーロー検索 =====
function goSearch() {
  const q = document.getElementById('heroSearch');
  if (q && q.value.trim()) window.location.href = 'directory.html?q=' + encodeURIComponent(q.value.trim());
}

// ===== フォーム送信 =====
function handleSubmit(e) {
  e.preventDefault();
  const f = document.getElementById('submitForm');
  const s = document.getElementById('submitSuccess');
  if (f && s) { f.style.display = 'none'; s.classList.remove('hidden'); window.scrollTo({ top: s.offsetTop - 100, behavior: 'smooth' }); }
}

// ===== 初期化 =====
fetch('tools.json')
  .then(r => r.json())
  .then(data => {
    allTools = data;

    // URLパラメータで検索
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      searchQuery = q;
      const si = document.getElementById('dirSearch');
      if (si) si.value = q;
    }

    renderIndex();
    renderDirectory();
    renderNew();
    updateCategoryCounts();
  })
  .catch(err => console.error('tools.json 読み込みエラー:', err));
