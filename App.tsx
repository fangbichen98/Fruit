
import React, { useState, useEffect } from 'react';
import { INITIAL_USERS } from './constants';
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
  
  // Initialize with empty arrays as data is fetched from Supabase
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<RegisteredUser[]>(INITIAL_USERS);

  // --- Global Data Fetching (Products) ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        if (data) {
          const mappedProducts: Product[] = data.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            image: p.image_url || '', // Map DB field 'image_url' to UI field 'image'
            price: Number(p.price),
            unit: p.unit
          }));
          setProducts(mappedProducts);
        }
      } catch (e) {
        console.error('System error fetching products:', e);
      }
    };

    fetchProducts();
  }, []);

  // --- Merchant Data Fetching (Orders) ---
  useEffect(() => {
    if (userRole === 'merchant') {
      const fetchOrders = async () => {
        try {
          // Fetch Orders
          const { data: ordersData, error: ordError } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (ordError) {
             console.error('Fetching orders failed:', ordError);
             alert('获取订单列表失败，请检查控制台');
          } else if (ordersData) {
             const mappedOrders: Order[] = ordersData.map((o: any) => {
               // Parse cart_items (JSONB)
               // DB Format: [{ name: "...", num: ... }]
               const rawItems = o.cart_items || [];
               
               // Enrich items with product details (image, price) from current products state
               const items = Array.isArray(rawItems) ? rawItems.map((ri: any) => {
                 const productMatch = products.find(p => p.name === ri.name);
                 return {
                   id: productMatch?.id || ri.name,
                   name: ri.name,
                   quantity: ri.num,
                   image: productMatch?.image || '', // Fallback if product deleted
                   price: productMatch?.price || 0,
                   unit: productMatch?.unit || '份'
                 } as CartItem;
               }) : [];

               return {
                 id: o.id,
                 user: o.user_info || { nickname: '未知用户', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown' },
                 items: items,
                 total: o.total || 0, 
                 timestamp: new Date(o.created_at).getTime(),
                 status: o.status || 'completed',
                 address: o.address || '', 
                 phone: o.phone || ''
               };
             });
             setOrders(mappedOrders);
          }
        } catch (e) {
          console.error("System Error during merchant fetch:", e);
        }
      };

      fetchOrders();
    }
  }, [userRole, products]); // Re-run when products load so orders display correct images


  // Generic Product Update Logic (Shared state + DB persistence)
  const handleUpdateProduct = async (id: string, field: keyof Product, value: any) => {
    // 1. Optimistic Update (Local State)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    setCart(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));

    // 2. DB Update
    try {
      // Map 'image' field back to 'image_url' for DB
      const dbField = field === 'image' ? 'image_url' : field;
      const { error } = await supabase
        .from('products')
        .update({ [dbField]: value })
        .eq('id', id);

      if (error) {
        console.error('Supabase update failed:', error);
      }
    } catch (e) {
      console.error('System error updating product:', e);
    }
  };

  const handleAddProduct = async (name: string, price: number, unit: string, image: string) => {
    try {
        const { data, error } = await supabase.from('products').insert([
            { 
                name, 
                price, 
                unit, 
                image_url: image
            }
        ]).select();

        if (error) {
            console.error('Add product error:', error);
            alert(`添加商品失败: ${error.message}`);
            return;
        }

        alert('商品添加成功！');
        
        // Refresh local state from DB response
        if (data && data.length > 0) {
            const newProd = data[0];
             const newProduct: Product = {
                id: newProd.id.toString(),
                name: newProd.name,
                image: newProd.image_url,
                price: Number(newProd.price),
                unit: newProd.unit
            };
            setProducts(prev => [...prev, newProduct]);
        }
    } catch (e: any) {
        console.error('System error:', e);
        alert(`系统错误: ${e.message}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
      if (window.confirm('确定要删除这个商品吗？此操作不可撤销。')) {
          try {
             // Delete from DB
             const { error } = await supabase.from('products').delete().eq('id', id);
             if (error) {
                 console.error('Delete product error:', error);
                 if (error.code !== '42P01') { 
                     alert('删除商品失败');
                     return;
                 }
             }
             
             // Update Local State
             setProducts(prev => prev.filter(p => p.id !== id));
             setCart(prev => prev.filter(c => c.id !== id)); 
          } catch (e) {
              console.error(e);
          }
      }
  };

  // Order Management Logic
  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('确定要删除此订单吗？')) {
      try {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) {
            console.error('Delete order error:', error);
            alert('删除订单失败');
            return;
        }
        setOrders(prev => prev.filter(o => o.id !== id));
      } catch (e) {
          console.error(e);
          alert('操作异常');
      }
    }
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    // Optimistic Update
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));

    try {
        // Update in DB
        const { error } = await supabase
            .from('orders')
            .update({ 
                status: updatedOrder.status,
                address: updatedOrder.address,
                phone: updatedOrder.phone,
                // Update items in case they were modified in modal
                cart_items: updatedOrder.items.map(i => ({ name: i.name, num: i.quantity })),
                total: updatedOrder.total,
                // Update user info if nickname changed
                user_info: updatedOrder.user
            })
            .eq('id', updatedOrder.id);

        if (error) {
            console.error('Update order failed:', error);
            // Optionally revert local state here or alert user
        }
    } catch (e) {
        console.error('System error updating order:', e);
    }
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

  const handleCheckout = async (address: string, phone: string) => {
    if (!userProfile || cart.length === 0) return;

    // Generate robust ID: ORD-YYYYMMDD-HHMMSS-RRR (Random 3 digits)
    // This prevents duplicate keys regardless of how many users are active or if order list is empty locally
    const now = new Date();
    const dateStr = now.toISOString().slice(0,10).replace(/-/g, ''); // 20231128
    const timeStr = now.toTimeString().slice(0,8).replace(/:/g, ''); // 143005
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const newId = `ORD-${dateStr}-${timeStr}-${random}`;

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Format cart items for Supabase (JSON array: [{name: "苹果", num: 2}, ...])
    const formattedCartItems = cart.map(item => ({
      name: item.name,
      num: item.quantity
    }));

    // Create the order object for DB
    const orderData = {
      id: newId,
      user_info: userProfile,
      cart_items: formattedCartItems, 
      total: total,
      // REMOVED 'timestamp' field to avoid [object Object] error if column missing
      status: 'pending',
      address: address,
      phone: phone,
      created_at: new Date().toISOString()
    };

    try {
      // Insert into Supabase 'orders' table
      const { error } = await supabase.from('orders').insert(orderData);

      if (error) {
        console.error('Supabase error:', error);
        // Alert specific message instead of object
        alert('提交订单失败: ' + (error.message || '未知错误'));
        return;
      }

      // Success: Update local state and UI
      const newOrder: Order = {
        id: newId,
        user: userProfile,
        items: [...cart],
        total: total,
        timestamp: Date.now(),
        status: 'pending',
        address: address, 
        phone: phone      
      };

      setOrders(prev => [newOrder, ...prev]);
      setCart([]);
      alert('订单已提交，商家确认收款后将尽快发货！');

    } catch (err: any) {
      console.error('Unexpected error:', err);
      alert('系统异常: ' + (err.message || err));
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
                        setCart([]); 
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
                
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                        <p>正在加载新鲜水果...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                        {products.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onAdd={addToCart} 
                            />
                        ))}
                    </div>
                )}
                
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
                    onAddProduct={(name, price, unit, image) => handleAddProduct(name, price, unit, image)}
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
