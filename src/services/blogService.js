import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const BLOG_CATEGORIES = [
  'Buying Guides',
  'Technical',
  'Net Metering',
  'Market Rates',
  'Installation',
  'News',
];

export const BLOG_STORAGE_KEY = 'sellsolar_blog_posts';

export const DEFAULT_BLOG_POSTS = [
  {
    id: 'seed-blog-1',
    title: 'Tier-1 Solar Panels in Pakistan: Longi vs Jinko vs Canadian Solar',
    slug: 'tier-1-solar-panels-pakistan-longi-jinko-canadian',
    category: 'Buying Guides',
    read_time: '6 min read',
    published_at: '2026-05-10T00:00:00.000Z',
    author: 'Engr. Haris Tariq',
    summary:
      'A detailed breakdown of efficiency ratings, temperature coefficients, and degradation curves for Pakistan’s hottest summer climates.',
    content:
      '### Comparing the Top 3 Tier-1 Modules in Pakistan\n\nWhen purchasing solar panels in Pakistan, choosing a Tier-1 BloombergNEF manufacturer ensures genuine cell quality, verified warranty backing, and superior performance during scorching 45°C+ summer days.',
    is_published: true,
    cover_image_url: '',
  },
  {
    id: 'seed-blog-2',
    title: 'Net Metering in Pakistan: Complete Step-by-Step Guide (2026)',
    slug: 'net-metering-pakistan-complete-guide-2026',
    category: 'Net Metering',
    read_time: '8 min read',
    published_at: '2026-04-15T00:00:00.000Z',
    author: 'SellSolar Policy Desk',
    summary:
      'Everything you need to apply for a green bidirectional meter with LESCO, IESCO, K-Electric, and FESCO.',
    content:
      '### How to Successfully Get a Net-Metering Connection in Pakistan\n\nNet metering allows you to export excess solar electricity generated during midday back to the national grid.',
    is_published: true,
    cover_image_url: '',
  },
];

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || `post-${Date.now()}`;
}

function estimateReadTime(content) {
  const words = String(content || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const mins = Math.max(2, Math.ceil(words / 180));
  return `${mins} min read`;
}

function formatDisplayDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return String(iso).slice(0, 10);
  }
}

export function normalizeBlogPost(row) {
  if (!row) return null;
  const publishedAt = row.published_at || row.created_at || new Date().toISOString();
  return {
    id: row.id,
    title: row.title || 'Untitled',
    slug: row.slug || slugify(row.title),
    category: row.category || 'Buying Guides',
    summary: row.summary || '',
    content: row.content || '',
    author: row.author || 'SellSolar Team',
    cover_image_url: row.cover_image_url || '',
    read_time: row.read_time || estimateReadTime(row.content),
    is_published: row.is_published !== false,
    published_at: publishedAt,
    created_at: row.created_at || publishedAt,
    updated_at: row.updated_at || publishedAt,
    // UI aliases used by BlogContent
    date: formatDisplayDate(publishedAt),
    readTime: row.read_time || estimateReadTime(row.content),
  };
}

function getLocalBlogPosts() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BLOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeBlogPost).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveLocalBlogPosts(posts) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts || []));
    window.dispatchEvent(new Event('sellsolar_blog_updated'));
  } catch (err) {
    console.warn('Failed saving local blog posts:', err);
  }
}

export async function fetchBlogPosts({ publishedOnly = true, includeSeeds = true } = {}) {
  let remote = [];
  if (isSupabaseConfigured() && supabase) {
    try {
      let q = supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
      if (publishedOnly) q = q.eq('is_published', true);
      const { data, error } = await q.limit(100);
      if (!error && Array.isArray(data)) {
        remote = data.map(normalizeBlogPost).filter(Boolean);
      }
    } catch (err) {
      console.warn('Blog fetch notice:', err?.message);
    }
  }

  const local = getLocalBlogPosts().filter((p) => (publishedOnly ? p.is_published : true));
  const byId = new Map();
  [...remote, ...local].forEach((p) => {
    if (p?.id) byId.set(String(p.id), p);
  });

  let merged = Array.from(byId.values()).sort(
    (a, b) => new Date(b.published_at) - new Date(a.published_at)
  );

  if (includeSeeds && merged.length === 0) {
    merged = DEFAULT_BLOG_POSTS.map(normalizeBlogPost);
  }

  return merged;
}

export async function upsertBlogPost(input) {
  const title = String(input.title || '').trim();
  if (!title) throw new Error('Blog title is required.');
  const content = String(input.content || '').trim();
  if (!content) throw new Error('Blog content is required.');

  const now = new Date().toISOString();
  const payload = {
    id: input.id && String(input.id).startsWith('seed-') ? undefined : input.id || undefined,
    title,
    slug: String(input.slug || '').trim() || slugify(title),
    category: input.category || 'Buying Guides',
    summary: String(input.summary || '').trim(),
    content,
    author: String(input.author || 'SellSolar Team').trim() || 'SellSolar Team',
    cover_image_url: String(input.cover_image_url || '').trim() || null,
    read_time: input.read_time || estimateReadTime(content),
    is_published: input.is_published !== false,
    published_at: input.published_at || now,
    updated_at: now,
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      let data = null;
      let error = null;
      if (payload.id) {
        ({ data, error } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', payload.id)
          .select('*')
          .maybeSingle());
      } else {
        const insertPayload = { ...payload };
        delete insertPayload.id;
        ({ data, error } = await supabase
          .from('blog_posts')
          .insert(insertPayload)
          .select('*')
          .maybeSingle());
      }
      if (error) throw error;
      const normalized = normalizeBlogPost(data || payload);
      const local = getLocalBlogPosts().filter((p) => p.id !== normalized.id);
      saveLocalBlogPosts([normalized, ...local]);
      return { success: true, post: normalized, synced: true };
    } catch (err) {
      console.warn('Blog upsert DB notice:', err?.message);
    }
  }

  const localId = payload.id || `local-blog-${Date.now()}`;
  const normalized = normalizeBlogPost({ ...payload, id: localId, created_at: now });
  const local = getLocalBlogPosts().filter((p) => p.id !== normalized.id);
  saveLocalBlogPosts([normalized, ...local]);
  return { success: true, post: normalized, synced: false };
}

export async function deleteBlogPost(postId) {
  if (!postId) return { success: false };
  const local = getLocalBlogPosts().filter((p) => p.id !== postId);
  saveLocalBlogPosts(local);

  if (isSupabaseConfigured() && supabase && !String(postId).startsWith('seed-') && !String(postId).startsWith('local-')) {
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', postId);
      if (error) console.warn('Blog delete DB notice:', error.message);
    } catch (err) {
      console.warn('Blog delete notice:', err?.message);
    }
  }
  return { success: true };
}

export { slugify, estimateReadTime, formatDisplayDate };
