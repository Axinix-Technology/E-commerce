import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Star, ChevronDown, Check, Heart, Filter, Grid, List, ChevronRight, Home, ShieldCheck, Truck, RefreshCw, Share2 } from 'lucide-react';
import populateApi from '@api/populate.api';
import { useAuth } from '@context/authProvider';
import { formatCurrency, formatQty } from '@utils/formatters';
import toast from 'react-hot-toast';

export default function EcommercePurchase() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState(searchParam || categoryParam || '');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  
  // Filter states
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState(null);
  const [deliveryTomorrow, setDeliveryTomorrow] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [sortOrder, setSortOrder] = useState('featured');

  // Sync cart item badge count
  const syncCartCount = () => {
    try {
      const raw = localStorage.getItem('cart_items');
      if (raw) {
        const items = JSON.parse(raw);
        const total = Array.isArray(items) ? items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0) : 0;
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    syncCartCount();
    window.addEventListener('storage', syncCartCount);
    return () => window.removeEventListener('storage', syncCartCount);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, minRating, priceRange, deliveryTomorrow, freeShipping, sortOrder, categoryParam]);

  const clearAllFilters = () => {
    setMinRating(0);
    setPriceRange(null);
    setDeliveryTomorrow(false);
    setFreeShipping(false);
    setSearchTerm('');
    if (categoryParam || searchParam) navigate('/purchase');
  };

  // Fetch categories from Backend
  useEffect(() => {
    populateApi.read('category_master', { filter: { status: 1 }, limit: 50 })
      .then(res => {
        if (res?.data && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch products from Backend (product_type model)
  useEffect(() => {
    setLoading(true);
    const filter = { status: 1 };
    if (categoryParam && categoryParam !== 'All') {
      filter['category__name'] = categoryParam;
    }

    populateApi.read('product_type', {
      filter,
      limit: 100,
      populate: {
        category: ['id', 'name'],
        images: ['id', 'image_url', 'is_primary'],
      },
    })
      .then(response => {
        setProducts(response.data || []);
      })
      .catch(err => {
        console.error("Failed to fetch products from backend:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categoryParam]);

  const handlePriceClick = (min, max) => {
    if (priceRange && priceRange.min === min && priceRange.max === max) {
      setPriceRange(null);
    } else {
      setPriceRange({ min, max });
    }
  };

  const addToCart = (product, e) => {
    e.stopPropagation();
    try {
      const raw = localStorage.getItem('cart_items');
      const items = raw ? JSON.parse(raw) : [];
      const existingIndex = items.findIndex(it => it.id === product.id);

      if (existingIndex > -1) {
        items[existingIndex].quantity = (Number(items[existingIndex].quantity) || 1) + 1;
      } else {
        items.push({
          id: product.id,
          title: product.title,
          brand: product.brand?.name || product.brand || 'Axinix',
          price: product.price,
          mrp: product.mrp,
          quantity: 1,
          image: product.image,
        });
      }

      localStorage.setItem('cart_items', JSON.stringify(items));
      syncCartCount();
      toast.success(`Added "${product.title}" to cart!`);
    } catch (err) {
      toast.error('Failed to update cart');
    }
  };

  // Compute derived fields for filtering
  const processedProducts = products.map(p => {
    const isPrime = p.id % 2 === 0;
    const isTomorrow = p.id % 3 === 0;
    const priceNum = Number(p.selling_price || p.base_price || 0);
    const mrpNum = priceNum > 0 ? Math.round(priceNum * 1.25) : 0;
    const firstImg = p.images?.[0]?.image_url || p.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80";
    const secondImg = p.images?.[1]?.image_url || firstImg;

    return {
      ...p,
      title: p.name || p.title || 'Premium Item',
      price: priceNum,
      mrp: mrpNum,
      rating: p.average_rating || (p.id % 2 === 0 ? 5 : 4),
      reviews: p.review_count || (p.id * 17) % 300 + 45,
      image: firstImg,
      hoverImage: secondImg,
      prime: isPrime,
      freeShipping: isPrime || p.id % 5 === 0,
      delivery: isTomorrow ? "Tomorrow" : "3-5 Days",
      isNew: p.id % 7 === 0,
      isBestseller: p.id % 4 === 0,
      lowStock: p.id % 6 === 0 ? (p.id % 4) + 1 : null
    };
  });

  const filteredProducts = processedProducts.filter(p => {
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch = !term || 
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.brand && String(p.brand).toLowerCase().includes(term)) ||
      (p.category?.name && p.category.name.toLowerCase().includes(term));
    const matchesRating = p.rating >= minRating;
    const matchesPrice = priceRange ? (p.price >= priceRange.min && p.price <= priceRange.max) : true;
    const matchesTomorrow = deliveryTomorrow ? p.delivery === "Tomorrow" : true;
    const matchesShipping = freeShipping ? p.freeShipping : true;
    return matchesSearch && matchesRating && matchesPrice && matchesTomorrow && matchesShipping;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'price_asc') return a.price - b.price;
    if (sortOrder === 'price_desc') return b.price - a.price;
    if (sortOrder === 'rating_desc') return b.rating - a.rating;
    return 0; // featured
  });

  const itemsPerPage = 12;
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const currentProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const displayCategoryList = categories.length > 0 
    ? ['All', ...categories.map(c => c.name)]
    : ['All', 'Baby', 'Kids', 'Women', 'Men', 'Jewelry', 'Accessories'];

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900">
      
      {/* Top Announcement Bar */}
      <div className="bg-gray-900 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-4 relative z-[60]">
        <span>Free Shipping on orders over ₹2,000!</span>
        <span className="hidden sm:inline-block text-gray-400">|</span>
        <span className="hidden sm:inline-block">Use Code <span className="text-yellow-400 font-bold">AXINIX10</span> for 10% Off</span>
        <span className="hidden sm:inline-block text-gray-400">|</span>
        <span className="hidden sm:inline-block text-red-400 font-bold animate-pulse">Flash Sale Active</span>
      </div>

      {/* Modern Axinix Top Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-3xl font-extrabold text-blue-600 tracking-tight">Axinix</span>
              <span className="text-3xl font-extrabold text-yellow-500">.</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-12">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="text" 
                  className="block w-full pl-12 pr-4 py-3 border-2 border-transparent bg-gray-100 rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 peer" 
                  placeholder="Search thousands of premium products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Right Nav */}
            <div className="flex items-center space-x-8">
              {user ? (
                <button onClick={() => navigate('/customer-account')} className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <User className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium max-w-[80px] truncate">{user.first_name || user.username || 'Account'}</span>
                </button>
              ) : (
                <button onClick={() => navigate('/login?allowGuest=true')} className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <User className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">Account</span>
                </button>
              )}
              <button onClick={() => navigate('/customer-account?tab=wishlist')} className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors">
                <Heart className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">Saved</span>
              </button>
              <button onClick={() => navigate('/cart')} className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors relative">
                <div className="relative">
                  <ShoppingCart className="h-6 w-6 mb-1" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {formatQty(cartCount)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">Cart</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mega Menu Navigation Strip */}
        <div className="border-t border-gray-100 bg-white hidden md:block">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-8 h-12 text-sm font-semibold text-gray-600 overflow-x-auto no-scrollbar">
            <div className="relative group h-full flex items-center">
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors h-full">
                All Categories <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform" />
              </button>
              
              <div className="absolute top-full left-0 w-64 bg-white shadow-xl border border-gray-100 rounded-b-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                <div className="py-2 max-h-80 overflow-y-auto">
                  {displayCategoryList.filter(c => c !== 'All').map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => navigate(`/purchase?category=${encodeURIComponent(cat)}`)}
                      className="block w-full text-left px-6 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {displayCategoryList.slice(0, 8).map(item => (
              <button 
                key={item} 
                onClick={() => navigate(item === 'All' ? '/purchase' : `/purchase?category=${encodeURIComponent(item)}`)} 
                className={`hover:text-blue-600 transition-colors whitespace-nowrap ${categoryParam === item || (item === 'All' && !categoryParam) ? 'text-blue-600 font-bold' : ''}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Strip for Current Sale */}
      <div className="bg-blue-600 text-white overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 relative flex flex-col md:flex-row items-center justify-between">
          <div className="z-10 relative">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-yellow-400">The Great Summer Sale</h2>
            <p className="text-blue-100 font-medium">Up to 60% off on Premium Collections & Essentials.</p>
          </div>
          <button 
            onClick={() => clearAllFilters()}
            className="mt-4 md:mt-0 z-10 bg-white text-blue-600 font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-yellow-400 hover:text-gray-900 transition-colors"
          >
            Shop All Catalog
          </button>
          <div className="absolute top-0 right-0 h-full w-1/2 bg-blue-500 opacity-20 skew-x-12 transform origin-bottom"></div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb Module */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-blue-600 flex items-center transition-colors">
            <Home className="h-4 w-4 mr-1" /> Home
          </button>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span onClick={() => clearAllFilters()} className="hover:text-blue-600 cursor-pointer transition-colors">Shop</span>
          {categoryParam && (
            <>
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              <span className="font-semibold text-gray-900">{categoryParam}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Modern Filters Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <Filter className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              </div>
              
              {/* Filter Section: Categories */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 tracking-wide uppercase text-sm">Categories</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {displayCategoryList.map(cat => (
                    <div 
                      key={cat}
                      onClick={() => navigate(cat !== 'All' ? `/purchase?category=${encodeURIComponent(cat)}` : '/purchase')}
                      className={`cursor-pointer text-sm transition-colors ${categoryParam === cat || (cat === 'All' && !categoryParam) ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter Section: Price */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 tracking-wide uppercase text-sm">Price Range</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Under ₹500', min: 0, max: 500 },
                    { label: '₹500 - ₹1,000', min: 500, max: 1000 },
                    { label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
                    { label: 'Over ₹2,000', min: 2000, max: 999999 }
                  ].map((range, idx) => (
                    <label key={idx} className="flex items-center cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5 mr-3 border-2 border-gray-300 rounded-md group-hover:border-blue-500 transition-colors">
                        <input 
                          type="checkbox" 
                          className="opacity-0 absolute w-full h-full cursor-pointer"
                          checked={priceRange?.min === range.min && priceRange?.max === range.max}
                          onChange={() => handlePriceClick(range.min, range.max)}
                        />
                        {priceRange?.min === range.min && priceRange?.max === range.max && (
                          <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></div>
                        )}
                      </div>
                      <span className={`text-sm ${priceRange?.min === range.min ? 'font-medium text-gray-900' : 'text-gray-600 group-hover:text-gray-900 transition-colors'}`}>
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Section: Rating */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 tracking-wide uppercase text-sm">Rating</h3>
                <div className="space-y-3">
                  {[4, 3, 2].map((stars) => (
                    <div 
                      key={stars} 
                      onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                      className="flex items-center cursor-pointer group"
                    >
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < stars ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className={`text-sm ${minRating === stars ? 'font-bold text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}>& Up</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter Section: Perks */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 tracking-wide uppercase text-sm">Shipping & Delivery</h3>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-3"
                      checked={freeShipping}
                      onChange={(e) => setFreeShipping(e.target.checked)}
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">Free Shipping</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-3"
                      checked={deliveryTomorrow}
                      onChange={(e) => setDeliveryTomorrow(e.target.checked)}
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">Get it by Tomorrow</span>
                  </label>
                </div>
              </div>

            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            
            {/* Active Filters & Clear */}
            {(minRating > 0 || priceRange || deliveryTomorrow || freeShipping || searchTerm || categoryParam) && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">Active Filters:</span>
                {categoryParam && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">{categoryParam}</span>}
                {searchTerm && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">"{searchTerm}"</span>}
                {priceRange && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">{formatCurrency(priceRange.min)} - {formatCurrency(priceRange.max)}</span>}
                {minRating > 0 && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">{minRating}+ Stars</span>}
                {freeShipping && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">Free Shipping</span>}
                {deliveryTomorrow && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">Tomorrow</span>}
                <button onClick={clearAllFilters} className="text-xs font-bold text-red-500 hover:text-red-700 ml-2 underline">Clear All</button>
              </div>
            )}

            {/* Toolbar Module */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-bold text-gray-900">{sortedProducts.length}</span> results
                {searchTerm && <span> for "<span className="font-bold text-gray-900">{searchTerm}</span>"</span>}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Grid className="h-4 w-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <List className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                  <select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value)} 
                    className="border-none bg-gray-50 text-sm font-medium text-gray-700 py-2 px-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value="featured">Featured Picks</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating_desc">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Grid Module */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {loading ? (
                <div className="col-span-full flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <div className="text-gray-400 mb-4"><Search className="h-12 w-12 mx-auto" /></div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                </div>
              ) : currentProducts.map((product, idx) => (
                <div 
                  key={product.id} 
                  className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover-lift animate-slide-up group flex ${viewMode === 'list' ? 'flex-row h-64' : 'flex-col'}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Image Area */}
                  <div 
                    onClick={() => navigate(`/product/${product.id}`)}
                    className={`relative bg-gray-50 flex items-center justify-center p-6 overflow-hidden cursor-pointer ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'h-64'}`}
                  >
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="absolute inset-0 w-full h-full object-contain mix-blend-multiply p-6 transition-opacity duration-500 group-hover:opacity-0" 
                    />
                    <img 
                      src={product.hoverImage} 
                      alt={`${product.title} alternate`} 
                      className="absolute inset-0 w-full h-full object-contain mix-blend-multiply p-6 transition-transform duration-700 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100" 
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); toast.success('Saved to Wishlist!'); }}
                      className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:bg-white transition-all z-10 group/btn"
                    >
                      <Heart className="h-4 w-4 group-hover/btn:fill-current" />
                    </button>
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                      {product.isBestseller && <span className="bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">Bestseller</span>}
                      {product.isNew && <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">New</span>}
                    </div>
                    {product.mrp > product.price && (
                      <div className="absolute bottom-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                        {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  
                  {/* Content Area */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-xs text-gray-500 font-medium tracking-wide uppercase mb-1">
                      {product.brand?.name || product.brand || 'Axinix'}
                    </div>
                    <h2 
                      onClick={() => navigate(`/product/${product.id}`)}
                      className={`font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer mb-2 ${viewMode === 'list' ? 'text-xl' : 'text-base line-clamp-2'}`}
                    >
                      {product.title}
                    </h2>
                    
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">({formatQty(product.reviews)})</span>
                    </div>
                    
                    {viewMode === 'list' && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {product.description || "Premium quality product built with sustainable materials and top-tier craftsmanship."}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-gray-900">{formatCurrency(product.price)}</span>
                          {product.mrp > product.price && (
                            <span className="text-sm text-gray-400 line-through">{formatCurrency(product.mrp)}</span>
                          )}
                        </div>
                        <div className="text-xs font-medium mt-1 h-4">
                          {product.freeShipping ? (
                            <span className="text-green-600">Free Delivery {product.delivery}</span>
                          ) : (
                            <span className="text-gray-400">Delivery in {product.delivery}</span>
                          )}
                        </div>
                        {product.lowStock && (
                          <div className="text-[10px] text-red-500 font-bold mt-1">Only {formatQty(product.lowStock)} left in stock</div>
                        )}
                      </div>
                      
                      <button 
                        onClick={(e) => addToCart(product, e)}
                        className="bg-gray-900 text-white p-3 rounded-xl transition-colors hover:bg-blue-600 shadow-sm flex-shrink-0"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Module */}
            {!loading && totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white font-bold shadow-md' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Recently Viewed / Recommended Carousel */}
      <div className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            Recently Viewed & Recommended For You
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-6 snap-x no-scrollbar">
            {processedProducts.slice(0, 5).map((product, idx) => (
              <div 
                key={`rec-${product.id}`} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="min-w-[280px] w-[280px] snap-start bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden hover-lift animate-slide-in-right cursor-pointer p-4 flex flex-col group"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="h-48 flex items-center justify-center bg-white rounded-xl p-4 mb-4">
                  <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                </div>
                <h3 className="font-bold text-gray-900 line-clamp-2 text-sm mb-2">{product.title}</h3>
                <div className="mt-auto">
                  <span className="text-lg font-extrabold text-gray-900">{formatCurrency(product.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600"><ShieldCheck className="h-6 w-6" /></div>
              <div>
                <h4 className="font-bold text-gray-900">100% Secure Payments</h4>
                <p className="text-sm text-gray-500">All major cards & UPI accepted</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600"><Truck className="h-6 w-6" /></div>
              <div>
                <h4 className="font-bold text-gray-900">Fast & Free Delivery</h4>
                <p className="text-sm text-gray-500">On orders above ₹2,000</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-600"><RefreshCw className="h-6 w-6" /></div>
              <div>
                <h4 className="font-bold text-gray-900">Easy Returns</h4>
                <p className="text-sm text-gray-500">14-day hassle free return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-yellow-500"><Star className="h-6 w-6" /></div>
              <div>
                <h4 className="font-bold text-gray-900">Genuine Products</h4>
                <p className="text-sm text-gray-500">Sourced directly from brands</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Newsletter Signup */}
      <div className="relative py-20 overflow-hidden bg-gray-900 mx-4 lg:mx-8 rounded-[2.5rem] mb-16 shadow-2xl group">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 rounded-[2.5rem]">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[130%] rounded-full bg-gradient-to-b from-blue-500/20 to-purple-600/20 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[100%] rounded-full bg-gradient-to-t from-emerald-500/10 to-teal-400/20 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-blue-200 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Unlock Exclusive Perks
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">10% Off</span> Your First Order
          </h2>
          <p className="text-gray-400 mb-10 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            Join the Axinix inner circle. Receive curated style inspiration, early access to limited sales, and exclusive member-only discounts directly to your inbox.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => { e.preventDefault(); toast.success('Thank you for subscribing!'); }}>
            <div className="relative flex-1 group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500 group-focus-within/input:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 focus:border-blue-500 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-500 pl-12 pr-6 py-4 rounded-2xl outline-none transition-all duration-300 text-sm font-medium" 
                required
              />
            </div>
            <button 
              type="submit" 
              className="bg-white hover:bg-gray-100 text-gray-900 font-extrabold py-4 px-8 rounded-2xl transition-all duration-300 text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Subscribe Now
            </button>
          </form>
          <p className="text-gray-500 text-xs mt-6 font-medium">
            By subscribing, you agree to our Terms of Service and Privacy Policy. Unsubscribe at any time.
          </p>
        </div>
      </div>

      {/* Rich Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 pb-8">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <span className="text-3xl font-extrabold text-white tracking-tight">Axinix</span>
                <span className="text-3xl font-extrabold text-blue-500">.</span>
              </div>
              <p className="text-sm text-gray-400 mb-8 max-w-sm leading-relaxed">
                Your premium destination for discovering high-quality products across fashion, baby gear, toys, and home essentials. 
              </p>
              <div className="flex gap-4">
                <div onClick={() => navigate('/customer-account')} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"><User className="h-4 w-4" /></div>
                <div onClick={() => navigate('/customer-account?tab=wishlist')} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"><Heart className="h-4 w-4" /></div>
                <div onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied to clipboard!'); }} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"><Share2 className="h-4 w-4" /></div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Shop</h4>
              <ul className="space-y-4 text-sm">
                <li><button onClick={() => navigate('/purchase?category=Women')} className="hover:text-blue-400 transition-colors">Women's Fashion</button></li>
                <li><button onClick={() => navigate('/purchase?category=Men')} className="hover:text-blue-400 transition-colors">Men's Apparel</button></li>
                <li><button onClick={() => navigate('/purchase?category=Baby')} className="hover:text-blue-400 transition-colors">Baby & Kids</button></li>
                <li><button onClick={() => navigate('/purchase?category=Accessories')} className="hover:text-blue-400 transition-colors">Jewelry & Accessories</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Customer Care</h4>
              <ul className="space-y-4 text-sm">
                <li><button onClick={() => navigate('/useful-additions/track-order')} className="hover:text-blue-400 transition-colors">Track Your Order</button></li>
                <li><button onClick={() => navigate('/help-policies/returns')} className="hover:text-blue-400 transition-colors">Returns & Refunds</button></li>
                <li><button onClick={() => navigate('/help-policies/shipping')} className="hover:text-blue-400 transition-colors">Shipping Policy</button></li>
                <li><button onClick={() => navigate('/help-policies/contact')} className="hover:text-blue-400 transition-colors">Contact Us</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Legal & Policies</h4>
              <ul className="space-y-4 text-sm">
                <li><button onClick={() => navigate('/help-policies/privacy-policy')} className="hover:text-blue-400 transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/help-policies/terms')} className="hover:text-blue-400 transition-colors">Terms of Service</button></li>
                <li><button onClick={() => navigate('/help-policies/faq')} className="hover:text-blue-400 transition-colors">FAQ & Support</button></li>
                <li><button onClick={() => navigate('/useful-additions/promotions')} className="hover:text-blue-400 transition-colors">Promotions & Coupons</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Axinix E-Commerce Ltd. All rights reserved.
            </div>
            <div className="flex gap-2">
              <div className="w-10 h-6 bg-gray-800 rounded border border-gray-700"></div>
              <div className="w-10 h-6 bg-gray-800 rounded border border-gray-700"></div>
              <div className="w-10 h-6 bg-gray-800 rounded border border-gray-700"></div>
              <div className="w-10 h-6 bg-gray-800 rounded border border-gray-700"></div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
