import React from 'react';
import { Sun, Cpu, BatteryCharging, Home, ArrowRight } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

interface CategoryGridProps {
  onSelectCategory: (category: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  const { listings } = useMarketplace();

  const countFor = (cat: string) => listings.filter((l) => l.category === cat && l.status === 'active').length;

  const categories = [
    {
      id: 'panel',
      name: 'Solar Panels',
      desc: 'Tier-1 Monocrystalline, N-Type TOPCon & Bifacial Panels',
      icon: Sun,
      color: 'from-amber-400 to-amber-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      count: countFor('panel'),
      tag: '550W - 600W+',
    },
    {
      id: 'inverter',
      name: 'Solar Inverters',
      desc: 'Hybrid, On-Grid Net-Metering & Off-Grid Pure Sine Wave',
      icon: Cpu,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      count: countFor('inverter'),
      tag: '3kW - 100kW',
    },
    {
      id: 'battery',
      name: 'Solar Batteries',
      desc: '48V Lithium-ion LiFePO4 & Deep Cycle Tall Tubular Batteries',
      icon: BatteryCharging,
      color: 'from-emerald-500 to-green-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      count: countFor('battery'),
      tag: '6000+ Cycles',
    },
    {
      id: 'complete_system',
      name: 'Complete Systems',
      desc: 'Turnkey Residential, Commercial & Net-Metering Packages',
      icon: Home,
      color: 'from-primary-500 to-amber-600',
      textColor: 'text-primary-700',
      bgColor: 'bg-primary-50',
      count: countFor('complete_system'),
      tag: 'Turnkey Installed',
    },
  ];

  return (
    <section id="categories" className="py-14 bg-white">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-extrabold uppercase tracking-wider text-primary-600 mb-1.5">
            Equipment Categories
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Browse by Category
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Find certified solar components and turnkey power solutions from top international manufacturers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  const el = document.getElementById('listings');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group card p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary-300 relative overflow-hidden bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.bgColor} ${cat.textColor} group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {cat.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-700">
                  <span className="text-gray-500 font-medium">
                    {cat.count} {cat.count === 1 ? 'Listing' : 'Listings'}
                  </span>
                  <span className="flex items-center gap-1 text-primary-600 group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
