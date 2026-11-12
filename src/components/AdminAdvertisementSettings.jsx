'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, GripVertical, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { DEFAULT_ADVERTISEMENT_SETTINGS } from '../lib/advertisementDefaults';
import HomeAdvertisementBoard from './HomeAdvertisementBoard';
import {
  deletePartnerAdSubmission,
  getPartnerAdSubmissions,
  PARTNER_AD_EVENT,
  setPartnerAdStatus,
} from '../lib/partnerAdSubmissions';

function FieldGrid({ fields, onField }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {fields.map(([field, label, val]) => (
        <label key={field} className="text-[10px] font-bold text-gray-500 block">
          {label}
          <input
            type="text"
            value={val || ''}
            onChange={(e) => onField(field, e.target.value)}
            className="input-field text-xs mt-0.5 font-normal"
          />
        </label>
      ))}
    </div>
  );
}

export default function AdminAdvertisementSettings({ value, onChange }) {
  const ad = { ...DEFAULT_ADVERTISEMENT_SETTINGS, ...(value || {}) };
  const [submissions, setSubmissions] = useState([]);

  const refreshSubs = () => setSubmissions(getPartnerAdSubmissions());
  useEffect(() => {
    refreshSubs();
    const onUpd = () => refreshSubs();
    window.addEventListener(PARTNER_AD_EVENT, onUpd);
    window.addEventListener('storage', onUpd);
    return () => {
      window.removeEventListener(PARTNER_AD_EVENT, onUpd);
      window.removeEventListener('storage', onUpd);
    };
  }, []);

  const patch = (partial) => onChange({ ...ad, ...partial });

  const updatePackage = (index, field, val) => {
    const packages = [...(ad.packages || [])];
    packages[index] = { ...packages[index], [field]: val };
    patch({ packages });
  };

  const addPackage = () => {
    patch({
      packages: [
        ...(ad.packages || []),
        {
          id: `pkg-${Date.now()}`,
          name: 'New Package',
          price: 0,
          priceLabel: 'Rs. 0',
          period: '14 days',
          description: '',
          features: ['Feature line 1'],
          ctaText: 'Contact Us',
          ctaLink: 'contact',
          highlighted: false,
          isActive: true,
        },
      ],
    });
  };

  const removePackage = (index) => {
    patch({ packages: (ad.packages || []).filter((_, i) => i !== index) });
  };

  const updateAdList = (listKey, index, field, val) => {
    const list = [...(ad[listKey] || [])];
    list[index] = { ...list[index], [field]: val };
    patch({ [listKey]: list });
  };

  const addAd = (listKey) => {
    patch({
      [listKey]: [
        ...(ad[listKey] || []),
        {
          id: `ad-${Date.now()}`,
          title: 'New banner',
          subtitle: '',
          imageUrl: '',
          linkUrl: '/pricing',
          packageId: 'free',
          advertiser: '',
          isActive: true,
        },
      ],
    });
  };

  const removeAd = (listKey, index) => {
    patch({ [listKey]: (ad[listKey] || []).filter((_, i) => i !== index) });
  };

  const renderAdEditor = (listKey, title, help) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{title}</p>
        <button
          type="button"
          onClick={() => addAd(listKey)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
      {help && <p className="text-[10px] text-gray-400">{help}</p>}
      {(ad[listKey] || []).map((item, idx) => (
        <div
          key={item.id || idx}
          className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-2"
        >
          <div className="flex items-center justify-between gap-2">
            <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
            <label className="flex items-center gap-2 text-[10px] font-bold ml-auto">
              <input
                type="checkbox"
                checked={item.isActive !== false}
                onChange={(e) => updateAdList(listKey, idx, 'isActive', e.target.checked)}
              />
              Active
            </label>
            <button
              type="button"
              onClick={() => removeAd(listKey, idx)}
              className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
              title="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <FieldGrid
            fields={[
              ['title', 'Headline', item.title],
              ['subtitle', 'Subtitle', item.subtitle],
              ['imageUrl', 'Image URL', item.imageUrl],
              ['linkUrl', 'Link (path or URL)', item.linkUrl],
              ['packageId', 'Package ID', item.packageId],
              ['advertiser', 'Advertiser name', item.advertiser],
            ]}
            onField={(field, val) => updateAdList(listKey, idx, field, val)}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 rounded-2xl border border-violet-200 dark:border-violet-900/50 bg-violet-50/20 dark:bg-violet-950/15 space-y-5 shadow-xs">
      <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-violet-600" />
        Homepage Advertisements & Packages
      </h3>

      <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-700 dark:text-gray-300">
        {[
          ['enabled', 'Master ON'],
          ['scrollEnabled', 'Scroll strip'],
          ['staticEnabled', 'Static cards'],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ad[key] !== false}
              onChange={(e) => patch({ [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
          Packages page link
          <input
            type="text"
            value={ad.packagesPageLink || '/pricing'}
            onChange={(e) => patch({ packagesPageLink: e.target.value })}
            className="input-field text-xs mt-1 font-mono"
          />
        </label>
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
          Packages button label
          <input
            type="text"
            value={ad.packagesCtaLabel || ''}
            onChange={(e) => patch({ packagesCtaLabel: e.target.value })}
            className="input-field text-xs mt-1"
          />
        </label>
      </div>

      <div className="space-y-3 pt-2 border-t border-violet-200/60 dark:border-violet-900/40">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black text-gray-900 dark:text-white">Advertisement packages (pricing page)</p>
          <button
            type="button"
            onClick={addPackage}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-violet-600 text-white hover:bg-violet-700"
          >
            <Plus className="h-3 w-3" /> Add package
          </button>
        </div>
        {(ad.packages || []).map((pkg, idx) => (
          <div
            key={pkg.id || idx}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-gray-400">{pkg.id}</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-[10px] font-bold">
                  <input
                    type="checkbox"
                    checked={pkg.isActive !== false}
                    onChange={(e) => updatePackage(idx, 'isActive', e.target.checked)}
                  />
                  Active
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold">
                  <input
                    type="checkbox"
                    checked={!!pkg.highlighted}
                    onChange={(e) => updatePackage(idx, 'highlighted', e.target.checked)}
                  />
                  Highlight
                </label>
                <button type="button" onClick={() => removePackage(idx)} className="text-rose-500 p-1">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <FieldGrid
              fields={[
                ['name', 'Name', pkg.name],
                ['priceLabel', 'Price label', pkg.priceLabel],
                ['period', 'Period', pkg.period],
                ['description', 'Description', pkg.description],
                ['ctaText', 'CTA text', pkg.ctaText],
                ['ctaLink', 'CTA link (page)', pkg.ctaLink],
              ]}
              onField={(field, val) => updatePackage(idx, field, val)}
            />
            <label className="text-[10px] font-bold text-gray-500 block">
              Features (one per line)
              <textarea
                rows={3}
                value={(pkg.features || []).join('\n')}
                onChange={(e) =>
                  updatePackage(
                    idx,
                    'features',
                    e.target.value
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
                className="input-field text-xs mt-0.5 font-normal"
              />
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-2 border-t border-violet-200/60 dark:border-violet-900/40">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-black text-gray-900 dark:text-white">Advertise-here submissions</p>
            <p className="text-[10px] text-gray-400">
              Approve to show on the homepage scroll. Hide anytime to remove from display.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshSubs}
            className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-bold dark:bg-gray-800"
          >
            Refresh
          </button>
        </div>

        {submissions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-400 dark:border-gray-700">
            No partner banner submissions yet.
          </p>
        ) : (
          <div className="space-y-2">
            {submissions.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center"
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="h-14 w-20 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40 shrink-0">
                    <Megaphone className="h-5 w-5 text-amber-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-gray-900 dark:text-white">{item.title}</p>
                  <p className="truncate text-[10px] text-gray-500">
                    {item.subtitle || item.advertiser || '—'}
                    {item.contactPhone ? ` · ${item.contactPhone}` : ''}
                    {item.contactEmail ? ` · ${item.contactEmail}` : ''}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : item.status === 'hidden'
                          ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                    }`}
                  >
                    {item.status || 'pending'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {item.status !== 'approved' && (
                    <button
                      type="button"
                      title="Show on homepage"
                      onClick={() => {
                        setPartnerAdStatus(item.id, 'approved');
                        refreshSubs();
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Approve / Show
                    </button>
                  )}
                  {item.status === 'approved' && (
                    <button
                      type="button"
                      title="Hide from homepage"
                      onClick={() => {
                        setPartnerAdStatus(item.id, 'hidden');
                        refreshSubs();
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-amber-700"
                    >
                      <EyeOff className="h-3 w-3" /> Hide from display
                    </button>
                  )}
                  {item.status === 'hidden' && (
                    <button
                      type="button"
                      onClick={() => {
                        setPartnerAdStatus(item.id, 'approved');
                        refreshSubs();
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-sky-700"
                    >
                      <Eye className="h-3 w-3" /> Show again
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this submission permanently?')) {
                        deletePartnerAdSubmission(item.id);
                        refreshSubs();
                      }
                    }}
                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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

      {renderAdEditor(
        'scrollAds',
        'Legacy scroll strip ads (optional / packages CMS)',
        'Homepage now prefers Advertise-here + approved submissions. These remain for package CMS editing.'
      )}

      {renderAdEditor(
        'staticAds',
        'Static spotlight ads',
        'Large cards under the scroll strip (legacy CMS).'
      )}

      <div className="pt-4 border-t border-violet-200/60 dark:border-violet-900/40 space-y-2">
        <p className="text-xs font-black text-gray-900 dark:text-white">Live preview (homepage)</p>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden opacity-95">
          <HomeAdvertisementBoard configOverride={ad} onNavigate={() => {}} />
        </div>
        <p className="text-[10px] text-gray-400">
          Homepage scroll shows approved submissions + Advertise here slots. Hide any live ad above anytime.
        </p>
      </div>
    </div>
  );
}
