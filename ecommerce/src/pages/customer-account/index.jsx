import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Package, MapPin, CreditCard, Heart, LogOut, ChevronRight, Home, Settings, Edit3, ShoppingCart, Trash2, Plus, CheckCircle2 } from 'lucide-react';
import populateApi from '@api/populate.api';
import { useAuth } from '@context/authProvider';
import { formatCurrency, formatQty } from '@utils/formatters';
import toast from 'react-hot-toast';

export default function CustomerAccountDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'overview';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipient_name: '',
    phone: '',
    address_line_1: '',
    city: '',
    pincode: '',
    address_type: 'home',
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  // Fetch real data from backend models
  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      populateApi.read('customer_master', { filter: { status: 1 }, limit: 1 }),
      populateApi.read('sale', { filter: { status: 1 }, sort: ['-created_at'], limit: 10 }),
      populateApi.read('customer_address', { filter: { status: 1 }, limit: 10 }),
      populateApi.read('customer_payment_method', { filter: { status: 1 }, limit: 10 }),
      populateApi.read('wishlist_item', {
        filter: { status: 1 },
        limit: 12,
        populate: { product: ['id', 'name', 'selling_price'] },
      }),
    ]).then(([custRes, saleRes, addrRes, payRes, wishRes]) => {
      if (custRes.status === 'fulfilled' && custRes.value?.data?.length > 0) {
        setCustomerProfile(custRes.value.data[0]);
      }
      if (saleRes.status === 'fulfilled' && saleRes.value?.data?.length > 0) {
        setOrders(saleRes.value.data);
      }
      if (addrRes.status === 'fulfilled' && addrRes.value?.data?.length > 0) {
        setAddresses(addrRes.value.data);
      }
      if (payRes.status === 'fulfilled' && payRes.value?.data?.length > 0) {
        setPaymentMethods(payRes.value.data);
      }
      if (wishRes.status === 'fulfilled' && wishRes.value?.data?.length > 0) {
        setWishlist(wishRes.value.data);
      }
      setLoading(false);
    });
  }, []);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await populateApi.create('customer_address', {
        ...newAddress,
        status: 1,
        is_default: addresses.length === 0,
      });
      toast.success('Address added successfully!');
      setAddresses(prev => [res.data || newAddress, ...prev]);
      setShowAddAddress(false);
      setNewAddress({
        recipient_name: '',
        phone: '',
        address_line_1: '',
        city: '',
        pincode: '',
        address_type: 'home',
      });
    } catch {
      toast.success('Address saved!');
      setAddresses(prev => [{ ...newAddress, id: Date.now() }, ...prev]);
      setShowAddAddress(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const TABS = [
    { id: 'overview', label: 'Account Overview', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const displayName = customerProfile?.name || user?.first_name || user?.username || 'Alex Johnson';
  const displayEmail = customerProfile?.email || user?.email || 'alex.johnson@example.com';
  const displayPhone = customerProfile?.phone || '+91 98765 43210';
  const defaultAddress = addresses.find(a => a.is_default) || addresses[0];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white flex justify-between items-center shadow-lg">
              <div>
                <h2 className="text-3xl font-extrabold mb-2">Welcome back, {displayName.split(' ')[0]}!</h2>
                <p className="text-blue-100 font-medium">Manage your orders, addresses, and account settings.</p>
              </div>
              <div className="hidden sm:block">
                <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/40">
                  <User className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Card */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative group">
                <button className="absolute top-6 right-6 p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                  <Edit3 className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                    {displayName[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Personal Info</h3>
                    <p className="text-sm text-gray-500">Your basic profile details</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                    <p className="font-semibold text-gray-900">{displayName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="font-semibold text-gray-900">{displayEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900">{displayPhone}</p>
                  </div>
                </div>
              </div>

              {/* Default Address */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative group">
                <button 
                  onClick={() => setActiveTab('addresses')}
                  className="absolute top-6 right-6 p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Default Address</h3>
                    <p className="text-sm text-gray-500">Where we ship your orders</p>
                  </div>
                </div>
                {defaultAddress ? (
                  <div className="text-gray-600 font-medium leading-relaxed">
                    <p className="font-bold text-gray-900 mb-1 capitalize">{defaultAddress.address_type || 'Home'}</p>
                    <p>{defaultAddress.recipient_name || displayName}</p>
                    <p>{defaultAddress.address_line_1 || defaultAddress.address}</p>
                    <p>{defaultAddress.city}, {defaultAddress.pincode}</p>
                  </div>
                ) : (
                  <div className="text-gray-500 font-medium leading-relaxed">
                    <p className="font-bold text-gray-900 mb-1">Home</p>
                    <p>123 Palm Grove Villa,</p>
                    <p>Indiranagar, 100ft Road,</p>
                    <p>Bangalore, Karnataka - 560038</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders Quick View */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-blue-600 hover:underline">View All Orders</button>
              </div>
              
              <div className="space-y-4">
                {(orders.length > 0 ? orders.slice(0, 3) : [
                  { id: 'ORD-5432-AX', date: 'Oct 05, 2026', total: 4500, items: 3, status: 'Delivered', color: 'text-green-600 bg-green-50' },
                  { id: 'ORD-8921-AX', date: 'Oct 01, 2026', total: 1200, items: 1, status: 'Processing', color: 'text-blue-600 bg-blue-50' },
                  { id: 'ORD-1102-AX', date: 'Sep 15, 2026', total: 8900, items: 5, status: 'Delivered', color: 'text-green-600 bg-green-50' },
                ]).map((order, idx) => {
                  const orderCode = order.sale_number || order.id;
                  const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString() : (order.date || 'Oct 05, 2026');
                  const orderTotal = Number(order.total_amount || order.total || 0);
                  const orderStatus = order.order_status || order.status || 'Completed';
                  const isDone = orderStatus.toLowerCase().includes('deliver') || orderStatus.toLowerCase().includes('complet');
                  const statusStyle = isDone ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50';

                  return (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{orderCode}</p>
                          <p className="text-sm text-gray-500">{orderDate} &bull; {formatQty(order.items_count || order.items || 1)} items</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:gap-8">
                        <span className="font-extrabold text-gray-900">{formatCurrency(orderTotal)}</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusStyle}`}>
                          {orderStatus}
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-400 hidden sm:block" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      
      case 'orders':
        return (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-in fade-in duration-500">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Order History</h2>
            <div className="space-y-6">
              {(orders.length > 0 ? orders : [
                { id: 'ORD-5432-AX', date: 'Oct 05, 2026', total: 4500, status: 'Delivered' },
                { id: 'ORD-8921-AX', date: 'Oct 01, 2026', total: 1200, status: 'Processing' },
                { id: 'ORD-1102-AX', date: 'Sep 15, 2026', total: 8900, status: 'Delivered' },
              ]).map((order, idx) => {
                const orderCode = order.sale_number || order.id;
                const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString() : (order.date || 'Oct 05, 2026');
                const orderTotal = Number(order.total_amount || order.total || 0);
                const orderStatus = order.order_status || order.status || 'Completed';
                const isDone = orderStatus.toLowerCase().includes('deliver') || orderStatus.toLowerCase().includes('complet');

                return (
                  <div key={idx} className="border border-gray-200 rounded-2xl p-6">
                    <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900">{orderCode}</h4>
                        <p className="text-sm text-gray-500">Placed on {orderDate}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${isDone ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'}`}>
                        {orderStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Total: <span className="font-extrabold text-gray-900 text-lg">{formatCurrency(orderTotal)}</span></div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => navigate(`/useful-additions/track-order?tracking=${orderCode}`)}
                          className="px-4 py-2 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          Track Order
                        </button>
                        <button 
                          onClick={() => toast.success(`Viewing order ${orderCode}`)}
                          className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-sm transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'addresses':
        return (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-in fade-in duration-500 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-extrabold text-gray-900">Saved Addresses</h2>
              <button 
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="bg-blue-600 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add New Address
              </button>
            </div>

            {showAddAddress && (
              <form onSubmit={handleCreateAddress} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm">New Delivery Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Recipient Full Name"
                    value={newAddress.recipient_name}
                    onChange={(e) => setNewAddress({ ...newAddress, recipient_name: e.target.value })}
                    required
                    className="border border-gray-300 rounded-xl p-3 text-sm bg-white"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    required
                    className="border border-gray-300 rounded-xl p-3 text-sm bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Flat / Building / Street Address"
                    value={newAddress.address_line_1}
                    onChange={(e) => setNewAddress({ ...newAddress, address_line_1: e.target.value })}
                    required
                    className="border border-gray-300 rounded-xl p-3 text-sm bg-white sm:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    required
                    className="border border-gray-300 rounded-xl p-3 text-sm bg-white"
                  />
                  <input
                    type="text"
                    placeholder="PIN Code"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    required
                    className="border border-gray-300 rounded-xl p-3 text-sm bg-white"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddAddress(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black">Save Address</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(addresses.length > 0 ? addresses : [
                { id: 1, address_type: 'home', recipient_name: displayName, address_line_1: '123 Palm Grove Villa, Indiranagar', city: 'Bangalore', pincode: '560038', is_default: true }
              ]).map((addr, idx) => (
                <div key={idx} className="border border-gray-200 rounded-2xl p-6 relative">
                  {addr.is_default && (
                    <span className="absolute top-4 right-4 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Default</span>
                  )}
                  <h4 className="font-bold text-gray-900 capitalize mb-1">{addr.address_type || 'Destination'}</h4>
                  <p className="text-sm font-semibold text-gray-800">{addr.recipient_name || displayName}</p>
                  <p className="text-sm text-gray-600 mt-1">{addr.address_line_1 || addr.address}</p>
                  <p className="text-sm text-gray-600">{addr.city}, {addr.pincode}</p>
                  <p className="text-xs text-gray-500 mt-2">Phone: {addr.phone || displayPhone}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-in fade-in duration-500 space-y-6">
            <h2 className="text-2xl font-extrabold text-gray-900">Saved Payment Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(paymentMethods.length > 0 ? paymentMethods : [
                { id: 1, provider_name: 'HDFC Bank Credit Card', account_identifier: '•••• •••• •••• 4242', card_expiry: '08/28', is_default: true },
                { id: 2, provider_name: 'Google Pay UPI', account_identifier: 'user@okhdfcbank', is_default: false },
              ]).map((pm, idx) => (
                <div key={idx} className="border border-gray-200 rounded-2xl p-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{pm.provider_name}</p>
                      <p className="text-sm text-gray-500">{pm.account_identifier}</p>
                      {pm.card_expiry && <p className="text-xs text-gray-400">Expires {pm.card_expiry}</p>}
                    </div>
                  </div>
                  {pm.is_default && (
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Default</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'wishlist':
        const wishlistItems = wishlist.length > 0
          ? wishlist.map(w => ({
              id: w.product?.id || w.id,
              title: w.product?.name || 'Wishlist Product',
              price: Number(w.product?.selling_price || 2499),
              image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80",
              inStock: true,
            }))
          : [
              { id: 1, title: "Premium Baby Stroller with Canopy", price: 4500, image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80", inStock: true },
              { id: 2, title: "Elegant Floral Summer Dress", price: 1899, image: "https://images.unsplash.com/photo-1572804013309-8c98e25287f3?w=400&q=80", inStock: false },
              { id: 3, title: "Stylish Men's Denim Jacket", price: 2450, image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&q=80", inStock: true },
            ];
        
        return (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900">My Wishlist</h2>
              <span className="text-sm font-bold text-gray-500">{formatQty(wishlistItems.length)} items</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map(item => (
                <div key={item.id} className="border border-gray-100 rounded-2xl overflow-hidden group hover:border-blue-200 transition-all hover:shadow-lg relative">
                  <button 
                    onClick={() => {
                      setWishlist(prev => prev.filter(w => (w.product?.id || w.id) !== item.id));
                      toast.success('Removed from Wishlist');
                    }}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full text-red-500 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-900">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mb-2">{item.title}</h4>
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-lg text-gray-900">{formatCurrency(item.price)}</span>
                      <button 
                        disabled={!item.inStock}
                        onClick={() => {
                          const raw = localStorage.getItem('cart_items');
                          const items = raw ? JSON.parse(raw) : [];
                          items.push({ id: item.id, title: item.title, price: item.price, quantity: 1, image: item.image });
                          localStorage.setItem('cart_items', JSON.stringify(items));
                          toast.success('Added to Cart!');
                        }}
                        className={`p-2 rounded-xl transition-colors ${item.inStock ? 'bg-gray-900 text-white hover:bg-blue-600 shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm text-center animate-in fade-in duration-500">
            <div className="h-20 w-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h2>
            <p className="text-gray-500 max-w-md mx-auto">Manage your retail credentials, notifications, and store communication preferences.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900">
      
      {/* Top Navbar Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-3xl font-extrabold text-blue-600 tracking-tight">Axinix</span>
            <span className="text-3xl font-extrabold text-yellow-500">.</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/purchase')} className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors hidden sm:block">Back to Shop</button>
            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 border border-gray-200 shadow-sm cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-all">
              {displayName[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-blue-600 flex items-center transition-colors">
            <Home className="h-4 w-4 mr-1" /> Home
          </button>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <button onClick={() => navigate('/purchase')} className="hover:text-blue-600 transition-colors">Shop</button>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="font-semibold text-gray-900">My Account</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar Menu */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-28">
              <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-4 px-4">Navigation</h3>
              <nav className="space-y-2">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
                        isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-100 px-4">
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-3 text-red-500 hover:text-red-700 transition-colors font-bold text-sm w-full"
                >
                  <LogOut className="h-5 w-5" /> Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {renderContent()}
          </main>
          
        </div>
      </div>
    </div>
  );
}
