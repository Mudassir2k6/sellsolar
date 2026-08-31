import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryGrid } from './components/CategoryGrid';
import { FilterBar } from './components/FilterBar';
import { ListingsGrid } from './components/ListingsGrid';
import { SolarCalculator } from './components/SolarCalculator';
import { WhySellSolar } from './components/WhySellSolar';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { ListingDetailModal } from './components/ListingDetailModal';
import { PostAdModal } from './components/PostAdModal';
import { UserDashboard } from './components/UserDashboard';
import { DealersDirectory } from './components/DealersDirectory';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { PlusCircle, ArrowUp } from 'lucide-react';

function MainApp() {
  const { user } = useAuth();
  const { setFilter } = useMarketplace();

  const [currentPage, setCurrentPage] = useState<
    'home' | 'dealers' | 'calculator' | 'dashboard' | 'admin' | 'listing-detail' | 'post-ad'
  >('home');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      setSelectedListingId(null);
      setCurrentPage('home');
    } else if (page === 'dealers') {
      setCurrentPage('dealers');
    } else if (page === 'calculator') {
      setCurrentPage('calculator');
    } else if (page === 'dashboard') {
      if (!user) {
        setAuthModalOpen(true);
        return;
      }
      setCurrentPage('dashboard');
    } else if (page === 'admin') {
      if (!user?.is_admin) {
        // Switch to admin demo persona or open auth
        setAuthModalOpen(true);
        return;
      }
      setCurrentPage('admin');
    } else if (page === 'post-ad') {
      setCurrentPage('post-ad');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectListing = (id: string) => {
    setSelectedListingId(id);
    setCurrentPage('listing-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostAdClick = () => {
    setCurrentPage('post-ad');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (catId: string) => {
    setFilter('category', catId);
    setCurrentPage('home');
    const el = document.getElementById('listings');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-primary-500 selection:text-gray-900 font-sans antialiased">
      {/* Top Main Navigation */}
      <Navbar
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onOpenAuth={() => setAuthModalOpen(true)}
        onPostAd={handlePostAdClick}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <div>
            <HeroSection
              onSearchSubmit={() => {
                const el = document.getElementById('listings');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <CategoryGrid onSelectCategory={handleCategorySelect} />

            <div className="container-page pt-4 pb-2">
              <FilterBar />
            </div>

            <ListingsGrid
              onSelectListing={handleSelectListing}
              onPostAd={handlePostAdClick}
            />

            <SolarCalculator
              onFindMatchingPackages={(kw) => {
                setFilter('category', 'complete_system');
                setFilter('query', `${kw}kW`);
                const el = document.getElementById('listings');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onPostAd={handlePostAdClick}
            />

            <WhySellSolar />

            <HowItWorks />
          </div>
        )}

        {currentPage === 'listing-detail' && selectedListingId && (
          <ListingDetailModal
            listingId={selectedListingId}
            onBack={() => {
              setSelectedListingId(null);
              setCurrentPage('home');
            }}
            onSelectRelatedListing={(relId) => {
              setSelectedListingId(relId);
            }}
          />
        )}

        {currentPage === 'post-ad' && (
          <PostAdModal
            onBack={() => setCurrentPage('home')}
            onSuccess={(newId) => {
              setSelectedListingId(newId);
              setCurrentPage('listing-detail');
            }}
          />
        )}

        {currentPage === 'dealers' && (
          <DealersDirectory
            onBack={() => setCurrentPage('home')}
            onSelectDealerListings={(city) => {
              setFilter('city', city);
              setCurrentPage('home');
            }}
          />
        )}

        {currentPage === 'calculator' && (
          <div className="py-8 bg-gray-50">
            <SolarCalculator
              onFindMatchingPackages={(kw) => {
                setFilter('category', 'complete_system');
                setFilter('query', `${kw}kW`);
                setCurrentPage('home');
                setTimeout(() => {
                  const el = document.getElementById('listings');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              onPostAd={handlePostAdClick}
            />
          </div>
        )}

        {currentPage === 'dashboard' && (
          <UserDashboard
            onBack={() => setCurrentPage('home')}
            onPostAd={handlePostAdClick}
            onSelectListing={handleSelectListing}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPanel
            onBack={() => setCurrentPage('home')}
            onSelectListing={handleSelectListing}
          />
        )}
      </main>

      {/* Floating Bottom Action for Mobile */}
      <div className="fixed bottom-5 right-5 z-30 flex flex-col gap-2.5 sm:hidden">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg hover:bg-gray-800 transition-all"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={handlePostAdClick}
          className="btn-primary py-3 px-4 rounded-full shadow-xl flex items-center gap-2 font-bold text-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Ad</span>
        </button>
      </div>

      {/* Scroll to top desktop */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="hidden sm:flex fixed bottom-6 right-6 z-30 w-11 h-11 rounded-full bg-gray-900/90 hover:bg-gray-900 text-white items-center justify-center shadow-xl hover:scale-105 transition-all"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onPostAd={handlePostAdClick}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MarketplaceProvider>
        <MainApp />
      </MarketplaceProvider>
    </AuthProvider>
  );
}
