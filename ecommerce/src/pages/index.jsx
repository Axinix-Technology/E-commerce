import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, ChevronRight, Smartphone, Monitor, Shirt, Home, Baby, Headphones, Sparkles, Tag } from 'lucide-react';
import populateApi from '@api/populate.api';
import { useAuth } from '@context/authProvider';
import { formatCurrency, formatQty } from '@utils/formatters';

const DEFAULT_CATEGORY_ICONS = {
  baby: Baby,
  infant: Baby,
  kids: Shirt,
  children: Shirt,
  women: User,
  men: User,
  toys: Baby,
  home: Home,
  living: Home,
  accessories: Headphones,
  tech: Monitor,
  mobile: Smartphone,
  gadgets: Headphones,
};

const getCategoryIcon = (name = '') => {
  const lower = name.toLowerCase();
  for (const [key, IconComponent] of Object.entries(DEFAULT_CATEGORY_ICONS)) {
    if (lower.includes(key)) return IconComponent;
  }
  return Sparkles;
};

export default function StorefrontHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // Sync cart count from localStorage
  useEffect(() => {
    const updateCartBadge = () => {
      try {
        const raw = localStorage.getItem('cart_items');
        if (raw) {
          const items = JSON.parse(raw);
          const totalQty = Array.isArray(items) ? items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0) : 0;
          setCartCount(totalQty);
        } else {
          setCartCount(0);
        }
      } catch {
        setCartCount(0);
      }
    };
    updateCartBadge();
    window.addEventListener('storage', updateCartBadge);
    return () => window.removeEventListener('storage', updateCartBadge);
  }, []);

  // Fetch real data from Django Backend Populate API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      populateApi.read('category_master', { filter: { status: 1 }, limit: 12 }),
      populateApi.read('hero_banner', { filter: { status: 1 }, sort: ['display_order'] }),
      populateApi.read('product_type', {
        filter: { status: 1 },
        limit: 12,
        populate: { category: ['id', 'name'], images: ['id', 'image_url'] },
      }),
    ]).then(([catRes, bannerRes, prodRes]) => {
      if (!isMounted) return;

      if (catRes.status === 'fulfilled' && catRes.value?.data?.length > 0) {
        setCategories(catRes.value.data);
      }

      if (bannerRes.status === 'fulfilled' && bannerRes.value?.data?.length > 0) {
        setHeroBanners(bannerRes.value.data);
      }

      if (prodRes.status === 'fulfilled' && prodRes.value?.data?.length > 0) {
        setDeals(prodRes.value.data);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/purchase?category=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/purchase');
    }
  };

  // Curated hero banner fallbacks if backend table is not yet populated
  const primaryBanner = heroBanners[0] || {
    title: "The Mother & Baby Sale",
    subtitle: "Up to 60% off on premium maternity & infant care.",
    cta_text: "Shop Now",
    cta_link: "/purchase",
    image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80",
  };

  const secondaryBanner = heroBanners[1] || {
    title: "New Arrivals",
    subtitle: "Extra 10% Off via Cards",
    cta_link: "/purchase",
    image_url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80",
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <span className="text-2xl font-extrabold text-blue-600 tracking-tight">Axinix</span>
              <span className="text-2xl font-extrabold text-yellow-500">.</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors" 
                  placeholder="Search for Products, Brands and More" 
                />
              </form>
            </div>

            {/* Right Nav */}
            <div className="flex items-center space-x-6">
              {user ? (
                <button 
                  onClick={() => navigate('/customer-account')} 
                  className="flex items-center text-gray-700 hover:text-blue-600 font-medium"
                >
                  <User className="h-5 w-5 mr-1" />
                  <span className="max-w-[120px] truncate">{user.first_name || user.username || 'Account'}</span>
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')} 
                  className="flex items-center text-gray-700 hover:text-blue-600 font-medium"
                >
                  <User className="h-5 w-5 mr-1" />
                  Login
                </button>
              )}
              <button onClick={() => navigate('/cart')} className="flex items-center text-gray-700 hover:text-blue-600 font-medium relative">
                <ShoppingCart className="h-5 w-5 mr-1" />
                Cart
                {cartCount > 0 && (
                  <span className="ml-1 bg-blue-600 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                    {formatQty(cartCount)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Category Strip */}
      <div className="bg-white shadow-sm mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center overflow-x-auto no-scrollbar gap-2">
            {categories.length > 0 ? (
              categories.map((cat) => {
                const IconComponent = getCategoryIcon(cat.name);
                return (
                  <div 
                    key={cat.id} 
                    onClick={() => navigate(`/purchase?category=${encodeURIComponent(cat.name)}`)}
                    className="flex flex-col items-center min-w-[80px] cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <IconComponent className="h-7 w-7" />
                      )}
                    </div>
                    <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600 truncate max-w-[90px] text-center">
                      {cat.name}
                    </span>
                  </div>
                );
              })
            ) : (
              ['Baby', 'Kids', 'Women', 'Toys', 'Home', 'Accessories'].map((catName, idx) => {
                const IconComponent = getCategoryIcon(catName);
                return (
                  <div 
                    key={idx} 
                    onClick={() => navigate(`/purchase?category=${encodeURIComponent(catName)}`)}
                    className="flex flex-col items-center min-w-[80px] cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600">{catName}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Hero Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => navigate(primaryBanner.cta_link || '/purchase')}
            className="md:col-span-2 relative h-64 rounded-xl overflow-hidden group cursor-pointer"
          >
            <img 
              src={primaryBanner.image_url} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              alt={primaryBanner.title} 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-900/70 to-transparent flex items-center">
              <div className="p-8 text-white">
                <h2 className="text-4xl font-extrabold mb-2">{primaryBanner.title}</h2>
                <p className="text-lg mb-4">{primaryBanner.subtitle}</p>
                <button className="bg-white text-pink-900 px-6 py-2 rounded-sm font-bold shadow-lg">
                  {primaryBanner.cta_text || 'Shop Now'}
                </button>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate(secondaryBanner.cta_link || '/purchase')}
            className="relative h-64 rounded-xl overflow-hidden group cursor-pointer hidden md:block"
          >
            <img 
              src={secondaryBanner.image_url} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              alt={secondaryBanner.title} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h3 className="text-xl font-bold">{secondaryBanner.title}</h3>
                <p className="text-sm text-yellow-400 font-semibold">{secondaryBanner.subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Deal Row */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Top Deals on Tech & Accessories</h2>
            <button 
              onClick={() => navigate('/purchase')}
              className="bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {deals.length > 0 ? (
              deals.map((prod) => {
                const prodImg = prod.images?.[0]?.image_url || prod.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80";
                return (
                  <div 
                    key={prod.id} 
                    onClick={() => navigate(`/product/${prod.id}`)}
                    className="flex flex-col items-center border border-gray-100 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow group"
                  >
                    <div className="w-full h-32 mb-3 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center">
                      <img 
                        src={prodImg} 
                        alt={prod.name} 
                        className="max-h-full object-contain group-hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                    <h3 className="text-sm font-medium text-gray-800 text-center truncate w-full">{prod.name}</h3>
                    <p className="text-green-600 font-bold mt-1">
                      {formatCurrency(prod.selling_price)}
                    </p>
                  </div>
                );
              })
            ) : (
              [
                { id: 1, name: 'Premium Baby Strollers', offer: 'From ₹4,500', img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80' },
                { id: 2, name: 'Kids Educational Blocks', offer: 'Up to 30% Off', img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80' },
                { id: 3, name: 'Elegant Floral Dresses', offer: 'From ₹1,899', img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80' },
                { id: 4, name: 'Leather Tote Bags', offer: 'Min 40% Off', img: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400&q=80' },
                { id: 5, name: 'Silicone Teething Toys', offer: 'Under ₹500', img: 'https://images.unsplash.com/photo-1560506840-0ca68eb2a688?w=400&q=80' },
                { id: 6, name: 'School Backpacks', offer: 'From ₹850', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80' },
              ].map((deal) => (
                <div 
                  key={deal.id} 
                  onClick={() => navigate('/purchase')}
                  className="flex flex-col items-center border border-gray-100 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow group"
                >
                  <div className="w-full h-32 mb-3 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center">
                    <img src={deal.img} alt={deal.name} className="max-h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-800 text-center truncate w-full">{deal.name}</h3>
                  <p className="text-green-600 font-bold mt-1">{deal.offer}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
      
    </div>
  );
}
