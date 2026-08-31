import React from 'react';
import {
  ShieldCheck,
  BadgePercent,
  MessageSquare,
  Wrench,
  Users2,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export const WhySellSolar: React.FC = () => {
  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Verified Sellers & Dealers',
      desc: 'Every business dealer undergoes national CNIC identity verification and physical business audit so you can buy with confidence.',
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      icon: BadgePercent,
      title: 'Zero Broker Fees',
      desc: 'Connect directly with direct container importers and certified distributors with 0% marketplace commission or hidden markups.',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      icon: MessageSquare,
      title: 'Direct WhatsApp Contact',
      desc: 'Instant direct chat with equipment owners and store managers. Negotiate pricing, request live video testing, and arrange pickup.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: Wrench,
      title: 'Certified EPC Installers',
      desc: 'Hire certified solar engineers for professional structure fabrication, wiring, earthing bore, and DISCO Net-Metering approvals.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users2,
      title: 'Vibrant Solar Community',
      desc: 'Join tens of thousands of homeowners, commercial factory operators, and verified solar professionals across Pakistan.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: CheckCircle,
      title: 'Tier-1 Warranty Support',
      desc: 'Authentic barcode tracking and 12 to 25-year official manufacturer warranty verification on Longi, Canadian Solar, and Jinko modules.',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <section id="why-sellsolar" className="py-16 bg-white border-t border-gray-100">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-extrabold uppercase tracking-wider text-primary-600 mb-1.5">
            Why SellSolar
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Pakistan's Trusted Solar Marketplace
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            We make buying and selling solar equipment transparent, safe, and affordable across all major cities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="card p-6 border border-gray-200/80 hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${b.bgColor} ${b.color} mb-4`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">{b.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
