import React, { useState } from 'react';
import {
  Search,
  MessageCircle,
  ShieldCheck,
  Sun,
  Star,
  ChevronDown,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { TESTIMONIALS, FAQS } from '../data/mockData';

export const HowItWorks: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const steps = [
    {
      step: '01',
      title: 'Search or Post Free Ad',
      desc: 'Browse verified listings by brand and city, or post your own new/used solar panels, inverters, or batteries in 2 minutes.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Connect on WhatsApp',
      desc: 'Chat directly with certified solar dealers or individual equipment owners without broker commissions or hidden fees.',
      icon: MessageCircle,
    },
    {
      step: '03',
      title: 'Verify & Inspect',
      desc: 'Confirm original manufacturer barcode serials, testing reports, and official warranty stamps before completing purchase.',
      icon: ShieldCheck,
    },
    {
      step: '04',
      title: 'Install & Zero Bills',
      desc: 'Hire certified EPCs to commission your solar setup, activate Net-Metering, and eliminate heavy electricity costs.',
      icon: Sun,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gray-50/70 border-t border-gray-100">
      <div className="container-page">
        {/* Process Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-extrabold uppercase tracking-wider text-primary-600 mb-1.5">
            Simple 4-Step Process
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            How SellSolar Works
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            From discovering high efficiency panels to commissioning your complete home system.
          </p>
        </div>

        {/* 4 Steps Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="card p-6 bg-white border border-gray-200/80 hover:border-primary-300 hover:shadow-md transition-all duration-200 relative"
              >
                <div className="text-3xl font-black text-gray-200 absolute top-4 right-5">
                  {item.step}
                </div>

                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Verified Customer Reviews Section */}
        <div className="mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-extrabold uppercase tracking-wider text-secondary-600 mb-1.5">
              Real Experiences
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Trusted by Homeowners & Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="card p-6 bg-white border border-gray-200/80 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, r) => (
                      <Star key={r} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs text-gray-600 italic leading-relaxed">
                    "{t.content}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-900">{t.name}</div>
                    <div className="text-[11px] text-gray-500">{t.location}</div>
                    <div className="text-[10px] font-semibold text-primary-700">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-primary-600 mb-1">
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Got Questions About Solar in Pakistan?
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-gray-200/80 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isOpen ? 'rotate-180 text-primary-500' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
