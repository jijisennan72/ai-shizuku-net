/* =====================================================
   AIしずくネット — main.js（tools.json動的レンダリング対応版）
   ===================================================== */

const PRICE_LABELS = {
  free: { text: '完全無料', cls: 'badge-free' },
  freemium: { text: '無料プランあり', cls: 'badge-freemium' },
  paid: { text: '有料', cls: 'badge-paid' }
};

const CAT_LABELS = {
  writing: { text: '文章作成', cls: 'badge-purple' },
  design: { text: 'デザイン', cls: 'badge-teal' },
  video: { text: '動画', cls: 'badge-orange' },
  productivity: { text: '仕事効率化', cls: 'badge-blue' },
  marketing: { text: 'マーケティング', cls: 'badge-green' },
  coding: { text: 'プログラミング', cls: 'badge-blue' },
  business: { text: 'ビジネス', cls: 'badge-purple' },
  education: { text: '学習・教育', cls: 'badge-green' },
  github: { text: 'GitHub AI', cls: 'badge-purple' }
};

let allTools = [];
let activeFilter = 'all';
let activePriceFilter = 'all';
let searchQuery = '';

// ===== ツールカードHTML生成 =====
function toolCardHTML(t) {
  const cat = CAT_LABELS[t.category] || { text: t.category, cls: 'badge-blue' };
  const price = PRICE_LABELS[t.price] || { text: t.price, cls: 'badge-freemium' };
  const stars = '⭐ ' + t.rating.toFixed(1);
  const newBadge = t.new ? '<span class="badge badge-orange" style="margin-left:6px;">NEW</span>' : '';
  return `
    <div class="tool-card" data-cat="${t.category}" data-price="${t.price}">
      <div class="tool-card-header">
        <div class="tool-icon" style="background:${t.iconBg};">${t.icon}</div>
        <div>
          <div class="tool-name">${t.name}${newBadge}</div>
          <span class="badge ${cat.cls}">${cat.text}</span>
        </div>
      </div>
      <p class="tool-desc">${t.desc}</p>
      <div class="tool-meta">
        <span class="badge ${price.cls}">${price.text}</span>
        <span class="rating">${stars}</span>
      </div>
      <a href="${t.url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="margin-top:8px;">使ってみる →</a>
    </div>`;
}

// ===== ディレクトリページ描画 =====
function renderDirectory() {
  const grid = document.getElementById('toolsGrid');
  if (!grid) return;
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  if (catParam) {
    activeFilter = catParam;
    const btn = document.querySelector(`[onclick*="'${catParam}'"]`);
    if (btn) {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
    }
  }
  applyFilters();
}

// ===== フィルター適用 =====
function applyFilters() {
  const grid = document.getElementById('toolsGrid');
  const nr = document.getElementById('noResults');
  if (!grid) return;

  const filtered = allTools.filter(t => {
    const catOK = activeFilter === 'all' || t.category === activeFilter;
    const priceOK = activePriceFilter === 'all' || t.price === activePriceFilter;
    const q = searchQuery.toLowerCase();
    const searchOK = q === '' || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);
    return catOK && priceOK && searchOK;
  });

  grid.innerHTML = filtered.map(toolCardHTML).join('');
  if (nr) nr.classList.toggle('hidden', filtered.length > 0);
}

function setFilter(btn, cat) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = cat;
  applyFilters();
}

function setPriceFilter(btn, price) {
  activePriceFilter = activePriceFilter === price ? 'all' : price;
  btn.classList.toggle('active', activePriceFilter !== 'all');
  applyFilters();
}

function filterTools(query) {
  searchQuery = query;
  applyFilters();
}

// ===== ホーム・注目ツール描画 =====
function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  const featured = allTools.filter(t => t.featured).slice(0, 6);
  grid.innerHTML = featured.map(t => {
    const cat = CAT_LABELS[t.category] || { text: t.category, cls: 'badge-blue' };
    const price = PRICE_LABELS[t.price] || { text: t.price, cls: 'badge-freemium' };
    return `
      <div class="tool-card">
        <div class="tool-card-header">
          <div class="tool-icon" style="background:${t.iconBg};">${t.icon}</div>
          <div><div class="tool-name">${t.name}</div><span class="badge ${cat.cls}">${cat.text}</span></div>
        </div>
        <p class="tool-desc">${t.desc}</p>
        <div class="tool-meta">
          <span class="badge ${price.cls}">${price.text}</span>
          <span class="rating">⭐ ${t.rating.toFixed(1)}</span>
        </div>
        <a href="${t.url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="margin-top:8px;">使ってみる →</a>
      </div>`;
  }).join('');
}

// ===== 今週の新着描画 =====
function renderNew() {
  const grid = document.getElementById('newGrid');
  if (!grid) return;
  const newTools = allTools.filter(t => t.new).slice(0, 4);
  grid.innerHTML = newTools.map(t => `
    <div class="card" style="display:flex;gap:16px;align-items:flex-start;">
      <div style="width:44px;height:44px;background:${t.iconBg};border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">${t.icon}</div>
      <div>
        <div style="font-weight:700;color:var(--navy);margin-bottom:4px;">${t.name}</div>
        <div style="font-size:0.83rem;color:#64748b;margin-bottom:8px;">${t.desc}</div>
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
  // ヒーローの数字更新
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
window.addEventListener('DOMContentLoaded', async function() {
  // キーボードショートカット
  const hs = document.getElementById('heroSearch');
  if (hs) hs.addEventListener('keydown', e => { if (e.key === 'Enter') goSearch(); });

  // tools.json 読み込み
  try {
    const res = await fetch('tools.json');
    allTools = await res.json();
  } catch(e) {
    console.error('tools.json 読み込みエラー:', e);
    return;
  }

  // URLパラメータで検索
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    searchQuery = q;
    const si = document.getElementById('dirSearch');
    if (si) si.value = q;
  }

  // 各ページの初期化
  renderDirectory();
  renderFeatured();
  renderNew();
  updateCategoryCounts();
});
