import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  { db: { schema: 'ai_shizuku' } }
);

app.use(cors({ origin: ['https://ai.shizuku.net', 'http://localhost:3000'] }));
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));

app.get('/api/tools', async (req, res) => {
  try {
    const { q, category, subcategory, vendor, price, page=1, limit=100 } = req.query;
    const p = Math.max(1, parseInt(page));
    const l = Math.min(200, parseInt(limit));
    let qb = supabase.from('tools')
      .select('id,name,category,subcategory,icon,icon_bg,desc_short,price,rating,url,vendor,tags,is_new,is_featured', { count:'exact' });
    if (q)           qb = qb.textSearch('search_vector', q, { type:'websearch', config:'simple' });
    if (category)    qb = qb.eq('category', category);
    if (subcategory) qb = qb.eq('subcategory', subcategory);
    if (vendor)      qb = qb.eq('vendor', vendor);
    if (price)       qb = qb.eq('price', price);
    qb = qb.order('is_featured',{ascending:false}).order('rating',{ascending:false})
           .range((p-1)*l, p*l-1);
    const { data, error, count } = await qb;
    if (error) throw error;
    const tools = data.map(t => ({
      id:t.id, name:t.name, category:t.category, genre:t.subcategory,
      icon:t.icon, iconBg:t.icon_bg, desc:t.desc_short,
      price:t.price, rating:t.rating, url:t.url, vendor:t.vendor,
      tags:t.tags, new:t.is_new, featured:t.is_featured,
    }));
    res.json({ tools, total:count, page:p, limit:l, pages:Math.ceil(count/l) });
  } catch(e){ res.status(500).json({ error:e.message }); }
});

app.get('/api/tools/:id', async (req, res) => {
  try {
    const { data:t, error } = await supabase.from('tools').select('*').eq('id',req.params.id).single();
    if (error||!t) return res.status(404).json({ error:'Not found' });
    let related = [];
    if (t.related?.length) {
      const { data:r } = await supabase.from('tools')
        .select('id,name,icon,icon_bg,desc_short,price,rating,url,vendor').in('id',t.related);
      related = (r||[]).map(x=>({...x, iconBg:x.icon_bg, desc:x.desc_short}));
    }
    res.json({
      id:t.id, name:t.name, category:t.category, genre:t.subcategory,
      icon:t.icon, iconBg:t.icon_bg, desc:t.desc_short, descLong:t.desc_long,
      price:t.price, rating:t.rating, url:t.url, vendor:t.vendor,
      tags:t.tags, new:t.is_new, featured:t.is_featured, related,
    });
  } catch(e){ res.status(500).json({ error:e.message }); }
});

app.get('/api/categories', async (_, res) => {
  try {
    const { data, error } = await supabase.rpc('get_category_counts');
    if (error) throw error;
    res.json(data);
  } catch(e){ res.status(500).json({ error:e.message }); }
});

app.listen(PORT, () => console.log(`AI Shizuku API :${PORT}`));
