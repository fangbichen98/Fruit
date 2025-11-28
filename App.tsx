
import React, { useState } from 'react';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_USERS } from './constants';
import { Product, CartItem, UserProfile, Order, RegisteredUser } from './types';
import { ProductCard } from './components/ProductCard';
import { CartSummary } from './components/CartSummary';
import { MerchantPanel } from './components/MerchantPanel';
import { LoginScreen } from './components/LoginScreen';
import { LogOut } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Configuration ---
const supabaseUrl = 'https://xysfaxlpbczibjsxjwjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5c2ZheGxwYmN6aWJqc3hqd2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTYwOTcsImV4cCI6MjA3OTg3MjA5N30.PaC7CN212lHAVIX1le0BtPu9-2gw-B-MDinhEOYEG98';
const supabase = createClient(supabaseUrl, supabaseKey);

type UserRole = 'shopper' | 'merchant' | null;

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [users, setUsers] = useState<RegisteredUser[]>(INITIAL_USERS);

  // Generic Product Update Logic (Shared state)
  const handleUpdateProduct = (id: string, field: keyof Product, value: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    setCart(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
        id: Date.now().toString(), 
        name: '新商品',
        image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=500&q=80', 
        price: 1.0,
        unit: '份'
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const handleDeleteProduct = (id: string) => {
      if (window.confirm('确定要删除这个商品吗？此操作不可撤销。')) {
          setProducts(prev => prev.filter(p => p.id !== id));
          setCart(prev => prev.filter(c => c.id !== id)); 
      }
  };

  // Order Management Logic
  const handleDeleteOrder = (id: string) => {
    if (window.confirm('确定要删除此订单吗？')) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  // User Management Logic
  const handleRegisterUser = (newUser: Omit<RegisteredUser, 'id' | 'joinDate'>) => {
      // Check if username exists
      if (users.some(u => u.username === newUser.username)) {
          return false;
      }
      const user: RegisteredUser = {
          ...newUser,
          id: `u${Date.now()}`,
          joinDate: Date.now()
      };
      setUsers(prev => [...prev, user]);
      return true;
  };

  const handleDeleteUser = (id: string) => {
      if (window.confirm('确定要删除此用户吗？')) {
          setUsers(prev => prev.filter(u => u.id !== id));
      }
  };


  // Shopper Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleCheckout = async () => {
    if (!userProfile || cart.length === 0) return;

    // Generate standardized ID: ORD-YYYYMMDD-XXXX
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateKey = `${year}${month}${day}`;
    
    // Find how many orders exist for today to generate sequence
    const todayPrefix = `ORD-${dateKey}`;
    const todayOrdersCount = orders.filter(o => o.id.startsWith(todayPrefix)).length;
    const sequence = (todayOrdersCount + 1).toString().padStart(4, '0');
    const newId = `${todayPrefix}-${sequence}`;

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Create the order object for DB
    const orderData = {
      id: newId,
      user_info: userProfile, // Sending user profile object
      items: cart,            // Sending cart items array
      total: total,
      timestamp: Date.now(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      // Insert into Supabase 'orders' table
      const { error } = await supabase.from('orders').insert(orderData);

      if (error) {
        console.error('Supabase error:', error);
        alert('提交失败，请查看控制台');
        return;
      }

      // Success: Update local state and UI
      const newOrder: Order = {
        id: newId,
        user: userProfile,
        items: [...cart],
        total: total,
        timestamp: Date.now(),
        status: 'pending'
      };

      setOrders(prev => [newOrder, ...prev]);
      setCart([]);
      alert('提交成功');

    } catch (err) {
      console.error('Unexpected error:', err);
      alert('发生意外错误');
    }
  };

  // Render Logic
  if (!userRole) {
    return (
        <LoginScreen 
            onLogin={(role) => setUserRole(role)} 
            onUserProfileFetch={(profile) => setUserProfile(profile)}
            users={users}
            onRegister={handleRegisterUser}
        />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${userRole === 'merchant' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {userRole === 'merchant' ? '🔧' : '🍋'}
                </div>
                <span className="font-bold text-xl tracking-tight">
                    {userRole === 'merchant' ? '鲜果后台' : '鲜果优选'}
                </span>
            </div>
            
            <div className="flex items-center gap-4">
                {userRole === 'shopper' && userProfile && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <img src={userProfile.avatar} alt="avatar" className="w-5 h-5 rounded-full" />
                        <span className="font-medium max-w-[100px] truncate">{userProfile.nickname}</span>
                        {userProfile.isGuest && <span className="text-[10px] bg-gray-200 text-gray-500 px-1 rounded">游客</span>}
                    </div>
                )}
                <button 
                    onClick={() => {
                        setUserRole(null);
                        setUserProfile(null);
                        setCart([]); // Clear cart on logout
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="退出登录"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto">
        {userRole === 'shopper' ? (
            <div className="p-4 sm:p-6 animate-in slide-in-from-bottom-2 duration-500">
                <div className="mb-6 bg-emerald-600 rounded-3xl p-8 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2">今日鲜果到货 🌿</h1>
                        <p className="text-emerald-100">为您精选全球优质产地，全场满 ¥20 免校内配送费。</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {products.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onAdd={addToCart} 
                        />
                    ))}
                </div>
                
                <div className="mt-12 text-center text-slate-400 text-sm pb-8">
                    <p>我们可以为您提供最新鲜的当季水果。</p>
                </div>
            </div>
        ) : (
            <div className="animate-in slide-in-from-bottom-2 duration-500">
                <MerchantPanel 
                    products={products} 
                    orders={orders}
                    users={users}
                    onUpdateProduct={handleUpdateProduct} 
                    onAddProduct={handleAddProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onDeleteOrder={handleDeleteOrder}
                    onUpdateOrder={handleUpdateOrder}
                    onDeleteUser={handleDeleteUser}
                    onLogout={() => {
                        setUserRole(null);
                        setUserProfile(null);
                    }}
                />
            </div>
        )}
      </main>

      {/* Cart Widget */}
      {userRole === 'shopper' && (
        <CartSummary 
            cart={cart} 
            updateQuantity={updateQuantity} 
            onCheckout={handleCheckout}
        />
      )}
    </div>
  );
};

export default App;
