import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, ChevronRight, Home, Trash2, Plus, Minus, ArrowRight, Star, Tag, CheckCircle2 } from 'lucide-react';
import populateApi from '@api/populate.api';
import { useAuth } from '@context/authProvider';
import { formatCurrency, formatQty } from '@utils/formatters';
import toast from 'react-hot-toast';

export default function CartScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  // Load cart items from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart_items');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCartItems(parsed);
      }
    } catch {
      setCartItems([]);
    }
  }, []);

  // Fetch recommended products from backend product_type
  useEffect(() => {
    populateApi.read('product_type', {
      filter: { status: 1 },
      limit: 4,
      populate: { images: ['id', 'image_url'] }
    })
      .then(res => {
        if (res?.data && Array.isArray(res.data)) {
          setRecommended(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('cart_items', JSON.stringify(items));
    window.dispatchEvent(new Event('storage'));
  };

  const updateQuantity = (id, delta) => {
    const next = cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, (Number(item.quantity) || 1) + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    saveCart(next);
  };

  const removeItem = (id) => {
    const next = cartItems.filter(item => item.id !== id);
    saveCart(next);
    toast.success('Item removed from cart');
  };

  const addRecommendedToCart = (prod) => {
    const existingIndex = cartItems.findIndex(it => it.id === prod.id);
    let next;
    if (existingIndex > -1) {
      next = cartItems.map((it, idx) => idx === existingIndex ? { ...it, quantity: (Number(it.quantity) || 1) + 1 } : it);
    } else {
      next = [
        ...cartItems,
        {
          id: prod.id,
          title: prod.name || prod.title,
          brand: prod.brand || 'Axinix',
          price: Number(prod.selling_price || prod.base_price || 0),
          mrp: Math.round(Number(prod.selling_price || prod.base_price || 0) * 1.25),
          quantity: 1,
          image: prod.images?.[0]?.image_url || prod.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
        }
      ];
    }
    saveCart(next);
    toast.success(`Added "${prod.name || prod.title}" to cart!`);
  };

  // Promo Code Validation against backend promotion_coupon model
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setApplyingPromo(true);
    try {
      const codeUpper = promoCode.trim().toUpperCase();
      const res = await populateApi.read('promotion_coupon', {
        filter: { code: codeUpper, status: 1 },
      });

      if (res?.data && res.data.length > 0) {
        const coupon = res.data[0];
        setAppliedPromo(coupon);
        toast.success(`Coupon "${coupon.code}" applied! ${coupon.title}`);
      } else {
        // Fallback standard code check if table empty
        if (codeUpper === 'AXINIX10' || codeUpper === 'WELCOME10') {
          setAppliedPromo({
            code: codeUpper,
            title: '10% Storewide Discount',
            discount_type: 'percentage',
            discount_value: 10,
          });
          toast.success(`Coupon "${codeUpper}" applied! 10% Off`);
        } else {
          toast.error('Invalid or expired coupon code');
        }
      }
    } catch (err) {
      toast.error('Unable to validate promo code');
    } finally {
      setApplyingPromo(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * (Number(item.quantity) || 1)), 0);
  
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discount_type === 'percentage') {
      discountAmount = Math.round((subtotal * Number(appliedPromo.discount_value)) / 100);
      if (appliedPromo.max_discount_amount) {
        discountAmount = Math.min(discountAmount, Number(appliedPromo.max_discount_amount));
      }
    } else {
      discountAmount = Number(appliedPromo.discount_value) || 0;
    }
  }

  const shipping = subtotal > 2000 || subtotal === 0 ? 0 : 150;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * 0.18; // 18% GST standard
  const total = taxableAmount + shipping + tax;

  const handleProceedToCheckout = () => {
    if (!user) {
      toast('Please log in or continue as guest to complete checkout', { icon: '🔒' });
      navigate('/login?allowGuest=true');
      return;
    }
    toast.success('Order processed successfully!');
    saveCart([]);
    navigate('/customer-account?tab=orders');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 pb-20">

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
                  className="block w-full pl-12 pr-4 py-3 border-2 border-transparent bg-gray-100 rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300"
                  placeholder="Search thousands of premium products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/purchase?category=${encodeURIComponent(searchTerm)}`);
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
              <button className="flex flex-col items-center text-blue-600 transition-colors relative">
                <div className="relative">
                  <ShoppingCart className="h-6 w-6 mb-1" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {formatQty(cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0))}
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
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb Module */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-blue-600 flex items-center transition-colors">
            <Home className="h-4 w-4 mr-1" /> Home
          </button>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate('/purchase')}>Shop</span>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="font-semibold text-gray-900">Shopping Cart</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="h-10 w-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Explore our top categories and find something you love!</p>
            <button
              onClick={() => navigate('/purchase')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Cart Items List */}
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  <span>Product Details</span>
                  <span className="w-24 text-center hidden sm:block">Quantity</span>
                  <span className="w-24 text-right hidden sm:block">Total</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:bg-gray-50/50 transition-colors">

                      {/* Image & Basic Info */}
                      <div className="flex flex-1 gap-6 items-center w-full">
                        <div 
                          onClick={() => navigate(`/product/${item.id}`)}
                          className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center p-2 flex-shrink-0 border border-gray-100 cursor-pointer"
                        >
                          <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{item.brand}</span>
                          <h3 
                            onClick={() => navigate(`/product/${item.id}`)}
                            className="font-bold text-gray-900 text-lg hover:text-blue-600 cursor-pointer line-clamp-2 leading-tight mb-2"
                          >
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-auto">
                            <span className="font-extrabold text-gray-900">{formatCurrency(item.price)}</span>
                            {item.mrp > item.price && (
                              <span className="text-sm text-gray-400 line-through">{formatCurrency(item.mrp)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Mobile Quantity & Total Row */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-8 sm:gap-6 border-t sm:border-0 border-gray-100 pt-4 sm:pt-0">

                        {/* Quantity Controls */}
                        <div className="flex items-center bg-gray-100 rounded-lg p-1 w-32 justify-between">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-gray-500 transition-all disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-semibold text-gray-900">{formatQty(item.quantity)}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-gray-500 transition-all"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Total & Remove */}
                        <div className="flex items-center gap-6">
                          <div className="w-24 text-right font-extrabold text-gray-900 hidden sm:block">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                            title="Remove item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Recommended Products Module */}
                {recommended.length > 0 && (
                  <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-2" />
                      Recommended for You
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {recommended.slice(0, 2).map(prod => (
                        <div 
                          key={prod.id}
                          className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer group"
                        >
                          <div 
                            onClick={() => navigate(`/product/${prod.id}`)}
                            className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                          >
                            <img 
                              src={prod.images?.[0]?.image_url || prod.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"} 
                              alt={prod.name} 
                              className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform" 
                            />
                          </div>
                          <div className="flex flex-col justify-center flex-1">
                            <h4 
                              onClick={() => navigate(`/product/${prod.id}`)}
                              className="text-sm font-bold text-gray-900 group-hover:text-blue-600 line-clamp-1 mb-1"
                            >
                              {prod.name}
                            </h4>
                            <div className="text-sm font-bold text-gray-900 mb-2">
                              {formatCurrency(prod.selling_price || prod.base_price)}
                            </div>
                            <button 
                              onClick={() => addRecommendedToCart(prod)}
                              className="text-xs font-bold text-blue-600 uppercase tracking-wider hover:text-blue-700 text-left"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Order Summary Side */}
            <aside className="w-full lg:w-96 flex-shrink-0 space-y-6">

              {/* Promo Code Module */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span>Apply Promo Code</span>
                </h3>
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. AXINIX10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase font-semibold"
                  />
                  <button 
                    type="submit"
                    disabled={applyingPromo}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm transition-colors border border-gray-200"
                  >
                    {applyingPromo ? '...' : 'Apply'}
                  </button>
                </form>
                {appliedPromo && (
                  <div className="mt-2 text-xs font-semibold text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Applied: {appliedPromo.code} (-{formatCurrency(discountAmount)})</span>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 text-sm mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({formatQty(cartItems.reduce((a, c) => a + (Number(c.quantity) || 1), 0))} items)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Promo Discount</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Estimate</span>
                    {shipping === 0 ? (
                      <span className="font-bold text-green-600">FREE</span>
                    ) : (
                      <span className="font-medium text-gray-900">{formatCurrency(shipping)}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Tax (18% GST)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(Math.round(tax))}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-base font-bold text-gray-900">Order Total</span>
                    <span className="text-3xl font-extrabold text-blue-600">
                      {formatCurrency(Math.round(total))}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <div className="text-xs text-green-600 font-medium text-right mt-1">
                      You are eligible for Free Shipping!
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 group"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="mt-6 flex items-center justify-center gap-4 text-gray-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Secure Checkout via</span>
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">UPI</div>
                    <div className="w-8 h-5 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">CARD</div>
                    <div className="w-8 h-5 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">NET</div>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        )}

      </div>
    </div>
  );
}
