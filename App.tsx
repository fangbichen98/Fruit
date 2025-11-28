
import React, { useState, useEffect } from 'react';
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

  // --- Merchant Data Fetching ---
  useEffect(() => {
    if (userRole === 'merchant') {
      const fetchMerchantData = async () => {
        try {
          // 1. Fetch Products
          const { data: productsData, error: prodError } = await supabase
            .from('products')
            .select('*');
          
          let currentProducts = INITIAL_PRODUCTS;
          
          if (prodError) {
            console.error('Fetching products failed, using mocks:', prodError);
            // Fallback to INITIAL_PRODUCTS if table doesn't exist or error
          } else if (productsData && productsData.length > 0) {
            // Map Supabase data to Product interface
            currentProducts = productsData.map((p: any) => ({
              id: p.id.toString(),
              name: p.name,
              image: p.image_url || '', // Corrected from p.image to p.image_url
              price: Number(p.price),
              unit: p.unit
            }));
            setProducts(currentProducts);
          }

          // 2. Fetch Orders
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
               
               // Enrich items with product details (image, price) for display
               const items = Array.isArray(rawItems) ? rawItems.map((ri: any) => {
                 const productMatch = currentProducts.find(p => p.name === ri.name);
                 return {
                   id: productMatch?.id || ri.name,
                   name: ri.name,
                   quantity: ri.num,
                   image: productMatch?.image || '', // Fallback for UI
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
                 address: o.address || '', // Read address from DB
                 phone: o.phone || '' // Read phone from DB
               };
             });
             setOrders(mappedOrders);
          }

        } catch (e) {
          console.error("System Error during fetch:", e);
        }
      };

      fetchMerchantData();
    }
  }, [userRole]);


  // Generic Product Update Logic (Shared state)
  const handleUpdateProduct = (id: string, field: keyof Product, value: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    setCart(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleInitializeData = async () => {
    if (!window.confirm('确定要将 constants.ts 中的默认商品导入数据库吗？\n注意：这将写入 products 表。')) {
        return;
    }

    try {
        const payload = INITIAL_PRODUCTS.map(p => ({
            id: Number(p.id), // Convert ID to number as requested
            name: p.name,
            price: p.price,
            unit: p.unit,
            image_url: p.image // Map local 'image' to DB 'image_url'
        }));

        const { error } = await supabase.from('products').insert(payload);

        if (error) {
            console.error('Import error:', error);
            alert(`导入失败: ${error.message}`);
        } else {
            alert('数据导入成功！');
            // Trigger a refresh logic if needed, or user can reload page
        }
    } catch (e: any) {
        console.error('System error:', e);
        alert(`系统错误: ${e.message}`);
    }
  };

  const handleAddProduct = async (name: string, price: number, unit: string, image: string) => {
    try {
        const { data, error } = await supabase.from('products').insert([
            { 
                name, 
                price, 
                unit, 
                image_url: image // Corrected: map image to image_url
            }
        ]).select();

        if (error) {
            console.error('Add product error:', error);
            alert(`添加商品失败: ${error.message}`);
            return;
        }

        alert('商品添加成功！');
        
        // Refresh product list locally
        if (data && data.length > 0) {
            const newProd = data[0];
             const newProduct: Product = {
                id: newProd.id.toString(),
                name: newProd.name,
                image: newProd.image_url, // Map back for local state
                price: Number(newProd.price),
                unit: newProd.unit
            };
            setProducts(prev => [...prev, newProduct]);
        } else {
             // Fallback refresh logic if select() doesn't return data
             const { data: refreshedData } = await supabase.from('products').select('*');
             if(refreshedData) {
                 const mapped = refreshedData.map((p: any) => ({
                    id: p.id.toString(),
                    name: p.name,
                    image: p.image_url,
                    price: Number(p.price),
                    unit: p.unit
                 }));
                 setProducts(mapped);
             }
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
                 // Assuming if table doesn't exist we just update local state
                 if (error.code !== '42P01') { // 42P01 is undefined_table
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

  const handleCheckout = async (address: string, phone: string) => {
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
    
    // Format cart items for Supabase (JSON array: [{name: "苹果", num: 2}, ...])
    const formattedCartItems = cart.map(item => ({
      name: item.name,
      num: item.quantity
    }));

    // Create the order object for DB
    const orderData = {
      id: newId,
      user_info: userProfile,
      cart_items: formattedCartItems, // Store structured JSON array here as requested
      total: total,
      timestamp: Date.now(),
      status: 'pending',
      address: address, // Save address to DB
      phone: phone,     // Save phone to DB
      created_at: new Date().toISOString()
    };

    try {
      // Insert into Supabase 'orders' table
      const { error } = await supabase.from('orders').insert(orderData);

      if (error) {
        console.error('Supabase error:', error);
        alert('提交订单失败，请稍后重试');
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
        address: address, // Update local model
        phone: phone      // Update local model
      };

      setOrders(prev => [newOrder, ...prev]);
      setCart([]);
      alert('提交成功');

    } catch (err) {
      console.error('Unexpected error:', err);
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
                    onAddProduct={(name, price, unit, image) => handleAddProduct(name, price, unit, image)}
                    onDeleteProduct={handleDeleteProduct}
                    onDeleteOrder={handleDeleteOrder}
                    onUpdateOrder={handleUpdateOrder}
                    onDeleteUser={handleDeleteUser}
                    onInitializeData={handleInitializeData}
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
