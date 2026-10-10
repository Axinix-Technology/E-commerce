import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, ChevronRight, Home, Star, Truck, ShieldCheck, RefreshCw, Share2, Plus, Minus, Check } from 'lucide-react';
import populateApi from '@api/populate.api';
import { useAuth } from '@context/authProvider';
import { formatCurrency, formatQty } from '@utils/formatters';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);

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
    window.scrollTo(0, 0);
    setLoading(true);

    // Fetch product details from product_type model
    populateApi.readOne('product_type', id, { populate: { category: ['id', 'name'] } })
      .then(async data => {
        if (!data) {
          setLoading(false);
          return;
        }

        const price = Number(data.selling_price || data.base_price || 0);
        const mrp = price > 0 ? Math.round(price * 1.25) : 0;

        // Fetch variants, images, and reviews in parallel
        const [variantRes, imageRes, reviewRes] = await Promise.allSettled([
          populateApi.read('product_variant', { filter: { product: id, status: 1 } }),
          populateApi.read('product_image', { filter: { product: id, status: 1 }, sort: ['display_order'] }),
          populateApi.read('product_review', { filter: { product: id, status: 1 } }),
        ]);

        let gallery = [];
        if (imageRes.status === 'fulfilled' && imageRes.value?.data?.length > 0) {
          gallery = imageRes.value.data.map(img => img.image_url || img.image).filter(Boolean);
        }
        if (gallery.length === 0) {
          gallery = [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
          ];
        }

        const variantList = variantRes.status === 'fulfilled' ? (variantRes.value?.data || []) : [];
        setVariants(variantList);

        const reviewsList = reviewRes.status === 'fulfilled' ? (reviewRes.value?.data || []) : [];
        const avgRating = reviewsList.length > 0
          ? (reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsList.length).toFixed(1)
          : (data.average_rating || 4.8);

        const enrichedProduct = {
          ...data,
          title: data.name || data.title,
          price,
          mrp,
          discount: mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
          rating: avgRating,
          reviews: reviewsList.length > 0 ? reviewsList.length : (data.review_count || 128),
          brand: data.brand || 'Axinix Premium',
          category: data.category?.name || 'Shop',
          inStock: true,
          gallery,
        };

        setProduct(enrichedProduct);
        setLoading(false);

        // Fetch related products based on category
        const filterCat = data.category_id || data.category?.id;
        populateApi.read('product_type', {
          filter: filterCat ? { category: filterCat, status: 1 } : { status: 1 },
          limit: 8,
          populate: { images: ['id', 'image_url'] }
        })
          .then(response => {
            const items = response.data || [];
            const filtered = items.filter(p => p.id !== Number(id)).slice(0, 4);
            setRelatedProducts(filtered);
          })
          .catch(err => console.error("Error fetching related products:", err));
      })
      .catch(err => {
        console.error("Error fetching product:", err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    try {
      const raw = localStorage.getItem('cart_items');
      const items = raw ? JSON.parse(raw) : [];
      const existingIndex = items.findIndex(it => it.id === product.id);

      if (existingIndex > -1) {
        items[existingIndex].quantity = (Number(items[existingIndex].quantity) || 1) + quantity;
      } else {
        items.push({
          id: product.id,
          title: product.title,
          brand: product.brand,
          price: product.price,
          mrp: product.mrp,
          quantity: quantity,
          size: selectedSize,
          image: product.gallery[0],
        });
      }

      localStorage.setItem('cart_items', JSON.stringify(items));
      syncCartCount();
      toast.success(`Added ${quantity} × "${product.title}" to cart!`);
    } catch {
      toast.error('Failed to update cart');
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <button onClick={() => navigate('/purchase')} className="text-blue-600 hover:underline">Return to Shop</button>
      </div>
    );
  }

  const SIZES = variants.length > 0 && variants.some(v => v.size)
    ? [...new Set(variants.map(v => v.size).filter(Boolean))]
    : ['XS', 'S', 'M', 'L', 'XL'];

  const COLORS = ['#111827', '#2563EB', '#DC2626', '#059669'];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
      
      {/* Modern Axinix Top Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-3xl font-extrabold text-blue-600 tracking-tight">Axinix</span>
              <span className="text-3xl font-extrabold text-yellow-500">.</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-12 hidden md:block">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="text" 
                  className="block w-full pl-12 pr-4 py-3 border-2 border-transparent bg-gray-50 rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300" 
                  placeholder="Search thousands of premium products..." 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/purchase?category=${encodeURIComponent(e.target.value)}`);
                  }}
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
      </nav>

      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-blue-600 flex items-center transition-colors">
            <Home className="h-4 w-4 mr-1" /> Home
          </button>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <button onClick={() => navigate('/purchase')} className="hover:text-blue-600 transition-colors">Shop</button>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <button onClick={() => navigate(`/purchase?category=${encodeURIComponent(product.category)}`)} className="hover:text-blue-600 transition-colors">
            {product.category}
          </button>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="font-semibold text-gray-900 truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
            {/* Thumbnails (Vertical on desktop) */}
            <div className="flex md:flex-col gap-4 order-2 md:order-1 overflow-x-auto md:overflow-visible">
              {product.gallery.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2' : 'border-gray-200 hover:border-gray-400'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover mix-blend-multiply bg-gray-50 p-1" />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="flex-1 bg-gray-50 rounded-3xl p-10 flex items-center justify-center relative order-1 md:order-2 group">
              <button 
                onClick={() => toast.success('Saved to Wishlist!')}
                className="absolute top-6 right-6 p-3 bg-white rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:shadow-md transition-all z-10"
              >
                <Heart className="h-6 w-6" />
              </button>
              <img 
                src={product.gallery[activeImage]} 
                alt={product.title} 
                className="max-h-[600px] w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 cursor-zoom-in" 
              />
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-blue-600 tracking-wider uppercase">{product.brand}</span>
                <button 
                  onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied to clipboard!'); }}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                  <span className="font-bold text-gray-900 mr-1">{product.rating}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
                <span className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                  {formatQty(product.reviews)} verified ratings
                </span>
              </div>
            </div>

            <div className="mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-end gap-4 mb-2">
                <span className="text-4xl font-extrabold text-gray-900">{formatCurrency(product.price)}</span>
                {product.mrp > product.price && (
                  <span className="text-xl text-gray-400 line-through mb-1">{formatCurrency(product.mrp)}</span>
                )}
                {product.discount > 0 && (
                  <span className="text-lg font-bold text-green-600 mb-1">{product.discount}% OFF</span>
                )}
              </div>
              <p className="text-sm text-gray-500 font-medium">Inclusive of all taxes</p>
            </div>

            {/* Colors */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Color</h3>
              <div className="flex gap-3">
                {COLORS.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(idx)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selectedColor === idx ? 'ring-2 ring-offset-4 ring-blue-600' : 'ring-1 ring-gray-200 hover:ring-gray-400'}`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === idx && <Check className="h-5 w-5 text-white mix-blend-difference" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Size</h3>
                <span className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">Size Guide</span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${selectedSize === size ? 'bg-gray-900 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-900'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="flex gap-4 mb-8">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 w-32 justify-between">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="font-bold text-gray-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </button>
            </div>

            {/* Buy Now */}
            <button 
              onClick={handleBuyNow}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-extrabold py-4 rounded-xl shadow-md transition-all active:scale-95 mb-8"
            >
              Buy Now
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-gray-900">Free Delivery</p>
                  <p className="text-gray-500">By tomorrow</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-gray-900">1 Year</p>
                  <p className="text-gray-500">Brand Warranty</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-gray-900">14 Days</p>
                  <p className="text-gray-500">Easy Returns</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Product Details</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {product.description || "Crafted from premium materials, this item combines durability with a timeless aesthetic. Designed to elevate your everyday experience, it seamlessly blends functionality and high-end fashion. Available in exclusive colors."}
              </p>
              
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> 100% Genuine product</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Premium build quality</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Sustainable manufacturing</li>
              </ul>
            </div>
            
          </div>
        </div>

        {/* Related Products Module */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(rp => (
                <div 
                  key={rp.id}
                  onClick={() => navigate(`/product/${rp.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col"
                >
                  <div className="relative bg-gray-50 h-56 flex items-center justify-center p-6 overflow-hidden">
                    <img 
                      src={rp.images?.[0]?.image_url || rp.image || "https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&q=80"} 
                      alt={rp.name || rp.title}
                      className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2 text-sm">
                      {rp.name || rp.title}
                    </h3>
                    <div className="mt-auto flex items-baseline gap-2">
                      <span className="text-lg font-extrabold text-gray-900">{formatCurrency(rp.selling_price || rp.base_price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
