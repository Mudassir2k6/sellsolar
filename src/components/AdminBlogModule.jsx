'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ExternalLink,
  Save,
  X,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  BLOG_CATEGORIES,
  fetchBlogPosts,
  upsertBlogPost,
  deleteBlogPost,
  slugify,
  estimateReadTime,
} from '../services/blogService';

const EMPTY_FORM = {
  id: '',
  title: '',
  slug: '',
  category: 'Buying Guides',
  summary: '',
  content: '',
  author: 'SellSolar Team',
  cover_image_url: '',
  is_published: true,
};

export default function AdminBlogModule() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all | published | draft
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const list = await fetchBlogPosts({ publishedOnly: false, includeSeeds: false });
      setPosts(list);
    } catch (err) {
      console.warn(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    const onUpdate = () => loadPosts();
    window.addEventListener('sellsolar_blog_updated', onUpdate);
    return () => window.removeEventListener('sellsolar_blog_updated', onUpdate);
  }, []);

  const filtered = useMemo(() => {
    return (posts || []).filter((p) => {
      if (filter === 'published' && !p.is_published) return false;
      if (filter === 'draft' && p.is_published) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (p.title || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.author || '').toLowerCase().includes(q) ||
        (p.summary || '').toLowerCase().includes(q)
      );
    });
  }, [posts, filter, searchQuery]);

  const startCreate = () => {
    setForm({ ...EMPTY_FORM });
    setIsEditing(true);
  };

  const startEdit = (post) => {
    setForm({
      id: post.id,
      title: post.title || '',
      slug: post.slug || '',
      category: post.category || 'Buying Guides',
      summary: post.summary || '',
      content: post.content || '',
      author: post.author || 'SellSolar Team',
      cover_image_url: post.cover_image_url || '',
      is_published: post.is_published !== false,
    });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      showToast({
        title: 'Missing fields',
        message: 'Title and content are required.',
        type: 'error',
      });
      return;
    }
    setSaving(true);
    try {
      const res = await upsertBlogPost({
        ...form,
        slug: form.slug.trim() || slugify(form.title),
        read_time: estimateReadTime(form.content),
      });
      showToast({
        title: form.id ? 'Blog Updated' : 'Blog Published',
        message: `"${res.post.title}" ${res.synced ? 'saved to database' : 'saved locally'}.`,
        type: 'success',
      });
      setIsEditing(false);
      setForm(EMPTY_FORM);
      await loadPosts();
    } catch (err) {
      showToast({
        title: 'Save failed',
        message: err.message || 'Could not save blog post.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post) => {
    if (!confirm(`Delete blog post "${post.title}"?`)) return;
    await deleteBlogPost(post.id);
    showToast({ title: 'Deleted', message: 'Blog post removed.', type: 'info' });
    await loadPosts();
  };

  const togglePublish = async (post) => {
    await upsertBlogPost({ ...post, is_published: !post.is_published });
    showToast({
      title: !post.is_published ? 'Published' : 'Unpublished',
      message: `"${post.title}" is now ${!post.is_published ? 'live on /blog' : 'hidden from public blog'}.`,
      type: 'success',
    });
    await loadPosts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-500" />
            Blog & Guides Manager
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Add, edit and publish solar guides that appear on the public <strong>/blog</strong> page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Blog
          </a>
          <button
            type="button"
            onClick={loadPosts}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-amber-500' : 'text-gray-500'}`} />
          </button>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Add Blog Post
          </button>
        </div>
      </div>

      {isEditing && (
        <form
          onSubmit={handleSave}
          className="p-5 sm:p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-black text-gray-900 dark:text-white">
              {form.id ? 'Edit Blog Post' : 'New Blog Post'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setForm(EMPTY_FORM);
              }}
              className="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="sm:col-span-2 text-xs font-bold text-gray-700 dark:text-gray-200 space-y-1">
              <span>Title *</span>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    title: e.target.value,
                    slug: f.id ? f.slug : slugify(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. How to Choose Solar Batteries in Pakistan"
                required
              />
            </label>

            <label className="text-xs font-bold text-gray-700 dark:text-gray-200 space-y-1">
              <span>URL Slug</span>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </label>

            <label className="text-xs font-bold text-gray-700 dark:text-gray-200 space-y-1">
              <span>Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              >
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold text-gray-700 dark:text-gray-200 space-y-1">
              <span>Author</span>
              <input
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="text-xs font-bold text-gray-700 dark:text-gray-200 space-y-1">
              <span>Cover Image URL (optional)</span>
              <input
                value={form.cover_image_url}
                onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="https://..."
              />
            </label>

            <label className="sm:col-span-2 text-xs font-bold text-gray-700 dark:text-gray-200 space-y-1">
              <span>Short Summary</span>
              <textarea
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                rows={2}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="1–2 lines shown on the blog listing card"
              />
            </label>

            <label className="sm:col-span-2 text-xs font-bold text-gray-700 dark:text-gray-200 space-y-1">
              <span>Full Content *</span>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={10}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                placeholder="Write the full guide here. You can use Markdown headings like ### Title"
                required
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              Publish live on /blog
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setForm(EMPTY_FORM);
                }}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? 'Saving…' : form.id ? 'Update Post' : 'Save Blog Post'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blogs…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
          {[
            { id: 'all', label: `All (${posts.length})` },
            { id: 'published', label: `Live (${posts.filter((p) => p.is_published).length})` },
            { id: 'draft', label: `Draft (${posts.filter((p) => !p.is_published).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                filter === tab.id
                  ? 'bg-white dark:bg-gray-700 text-amber-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400">Loading blog posts…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No blog posts yet</p>
          <p className="text-xs text-gray-400 mt-1">Click “Add Blog Post” to publish your first guide.</p>
          <button
            type="button"
            onClick={startCreate}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold"
          >
            <PlusCircle className="h-4 w-4" />
            Add Blog Post
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400">
                    {post.category}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      post.is_published
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {post.is_published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-[10px] text-gray-400">{post.date}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{post.title}</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                  By {post.author} • {post.readTime || post.read_time}
                  {post.summary ? ` — ${post.summary}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => togglePublish(post)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  title={post.is_published ? 'Unpublish' : 'Publish'}
                >
                  {post.is_published ? (
                    <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(post)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-bold"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(post)}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
