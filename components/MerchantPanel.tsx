
import React, { useState, useMemo } from 'react';
import { Product, Order, CartItem, RegisteredUser } from '../types';
import { Settings, Save, Image as ImageIcon, LogOut, Trash2, Plus, Package, ClipboardList, Download, LayoutDashboard, TrendingUp, Filter, CalendarDays, Pencil, X, Minus, Users } from 'lucide-react';

interface MerchantPanelProps {
  products: Product[];
  orders: Order[];
  users: RegisteredUser[];
  onUpdateProduct: (id: string, field: keyof Product, value: any) => void;
  onAddProduct: () => void;
  onDeleteProduct: (id: string) => void;
  onDeleteOrder: (id: string) => void;
  onUpdateOrder: (order: Order) => void;
  onDeleteUser: (id: string) => void;
  onLogout: () => void;
}

type DashboardRange = 'day' | 'week' | 'month' | 'year';

// --- Edit Order Modal Component ---
const EditOrderModal: React.FC<{
  order: Order;
  onClose: () => void;
  onSave: (updatedOrder: Order) => void;
}> = ({ order, onClose, onSave }) => {
  const [editedOrder, setEditedOrder] = useState<Order>(JSON.parse(JSON.stringify(order)));

  const handleUpdateItemQuantity = (itemId: string, delta: number) => {
    setEditedOrder(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      }).filter(item => item.quantity > 0);
      
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { ...prev, items: newItems, total: newTotal };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">修改订单</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">订单号</label>
              <div className="font-mono text-sm font-medium">{editedOrder.id}</div>
            </div>
            <div>
               <label className="text-xs font-semibold text-slate-500 uppercase">当前状态</label>
               <select 
                value={editedOrder.status}
                onChange={(e) => setEditedOrder({...editedOrder, status: e.target.value as 'completed' | 'pending'})}
                className="w-full mt-1 px-2 py-1 bg-white border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none"
               >
                 <option value="pending">待处理</option>
                 <option value="completed">已完成</option>
               </select>
            </div>
          </div>

          <div>
             <label className="text-xs font-semibold text-slate-500 uppercase">收货人昵称</label>
             <input 
                type="text" 
                value={editedOrder.user.nickname}
                onChange={(e) => setEditedOrder({...editedOrder, user: {...editedOrder.user, nickname: e.target.value}})}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
             />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">商品明细</label>
            <div className="space-y-3">
              {editedOrder.items.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <div className="flex items-center gap-3">
                     <img src={item.image} alt={item.name} className="w-10 h-10 rounded-md object-cover bg-white" />
                     <div>
                       <div className="text-sm font-medium text-slate-900">{item.name}</div>
                       <div className="text-xs text-slate-500">¥{item.price}/{item.unit}</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <button onClick={() => handleUpdateItemQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors">
                       <Minus size={12} />
                     </button>
                     <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                     <button onClick={() => handleUpdateItemQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded hover:bg-green-50 hover:border-green-200 hover:text-green-500 transition-colors">
                       <Plus size={12} />
                     </button>
                   </div>
                </div>
              ))}
              {editedOrder.items.length === 0 && (
                <div className="text-center py-4 text-sm text-red-500 bg-red-50 rounded-lg">
                  订单不能为空，请删除订单。
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <div className="text-xs text-slate-500">修改后总额</div>
            <div className="text-xl font-bold text-blue-600">¥{editedOrder.total.toFixed(2)}</div>
          </div>
          <div className="flex gap-3">
             <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">取消</button>
             <button 
                onClick={() => {
                  if(editedOrder.items.length > 0) onSave(editedOrder);
                }}
                disabled={editedOrder.items.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               保存修改
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export const MerchantPanel: React.FC<MerchantPanelProps> = ({ 
    products, 
    orders,
    users,
    onUpdateProduct, 
    onAddProduct, 
    onDeleteProduct,
    onDeleteOrder,
    onUpdateOrder,
    onDeleteUser,
    onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users'>('dashboard');
  const [filterDate, setFilterDate] = useState<string>(''); // YYYY-MM-DD
  const [dashboardRange, setDashboardRange] = useState<DashboardRange>('week');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProduct(id, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Data Processing for Dashboard & Orders ---

  // Filter orders by specific date (for Orders Tab)
  const filteredOrdersList = useMemo(() => {
    if (!filterDate) return orders;
    return orders.filter(order => {
        const orderDate = new Date(order.timestamp).toISOString().slice(0, 10);
        return orderDate === filterDate;
    });
  }, [orders, filterDate]);

  // Dashboard Statistics
  const dashboardStats = useMemo(() => {
    const now = new Date();
    // Helper to get start of day timestamps
    const getStartOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    
    let filtered: Order[] = [];
    let chartData: { label: string; value: number; fullLabel?: string }[] = [];
    let chartTitle = '';

    if (dashboardRange === 'day') {
        const startOfToday = getStartOfDay(now);
        filtered = orders.filter(o => o.timestamp >= startOfToday);
        chartTitle = '今日实时销售 (24小时)';
        
        // Bucket by Hour
        const hours = Array(24).fill(0);
        filtered.forEach(o => {
            const h = new Date(o.timestamp).getHours();
            hours[h] += o.total;
        });
        chartData = hours.map((val, h) => ({ label: `${h}时`, value: val }));

    } else if (dashboardRange === 'week') {
        // Last 7 days
        const msPerDay = 86400000;
        const startOfPeriod = getStartOfDay(now) - (6 * msPerDay); 
        filtered = orders.filter(o => o.timestamp >= startOfPeriod);
        chartTitle = '近7日销售趋势';

        // Bucket by Day
        const days = Array(7).fill(0).map((_, i) => {
            const d = new Date(startOfPeriod + i * msPerDay);
            return { 
                dateStr: d.toISOString().slice(0, 10), 
                display: `${d.getMonth()+1}/${d.getDate()}`
            };
        });

        const dataMap: Record<string, number> = {};
        filtered.forEach(o => {
            const dStr = new Date(o.timestamp).toISOString().slice(0, 10);
            dataMap[dStr] = (dataMap[dStr] || 0) + o.total;
        });

        chartData = days.map(d => ({
            label: d.display,
            fullLabel: d.dateStr,
            value: dataMap[d.dateStr] || 0
        }));

    } else if (dashboardRange === 'month') {
        // Current Month
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const startOfMonth = new Date(currentYear, currentMonth, 1).getTime();
        filtered = orders.filter(o => o.timestamp >= startOfMonth);
        chartTitle = '本月每日销售';

        // Bucket by Day of Month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const days = Array(daysInMonth).fill(0);
        
        filtered.forEach(o => {
            const d = new Date(o.timestamp).getDate() - 1; // 0-indexed
            days[d] += o.total;
        });
        chartData = days.map((val, d) => ({ label: `${d + 1}`, value: val }));

    } else if (dashboardRange === 'year') {
        // Current Year
        const currentYear = now.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).getTime();
        filtered = orders.filter(o => o.timestamp >= startOfYear);
        chartTitle = '今年月度销售';

        // Bucket by Month
        const months = Array(12).fill(0);
        filtered.forEach(o => {
            const m = new Date(o.timestamp).getMonth();
            months[m] += o.total;
        });
        chartData = months.map((val, m) => ({ label: `${m + 1}月`, value: val }));
    }

    const totalRevenue = filtered.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filtered.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const maxRevenue = Math.max(...chartData.map(d => d.value), 10); // Ensure scale

    // Top Selling Products (Global or Period? Usually period is more useful)
    // Let's use the filtered period for top products
    const productSales: Record<string, number> = {};
    filtered.forEach(order => {
        order.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        });
    });
    const topProducts = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return { totalRevenue, totalOrders, avgOrderValue, chartData, chartTitle, maxRevenue, topProducts };
  }, [orders, dashboardRange]);


  const downloadOrdersCSV = () => {
    // BOM for Excel to read UTF-8 correctly
    const bom = '\uFEFF'; 
    const headers = "订单号,下单时间,客户昵称,状态,商品列表,总金额(元)\n";
    const rows = filteredOrdersList.map(order => {
        const date = new Date(order.timestamp).toLocaleString();
        const items = order.items.map(i => `${i.name}x${i.quantity}`).join(' | ');
        const status = order.status === 'completed' ? '已完成' : '待处理';
        return `${order.id},"${date}",${order.user.nickname},${status},"${items}",${order.total.toFixed(2)}`;
    }).join("\n");

    const csvContent = bom + headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `订单导出_${filterDate || '全部'}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  return (
    <div className="p-4 sm:p-6 pb-24 max-w-6xl mx-auto">
        {editingOrder && (
            <EditOrderModal 
                order={editingOrder} 
                onClose={() => setEditingOrder(null)} 
                onSave={(updated) => {
                    onUpdateOrder(updated);
                    setEditingOrder(null);
                }} 
            />
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <Settings className="text-blue-600" />
                    商家管理后台
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    {activeTab === 'dashboard' ? '查看经营数据与销售趋势' : 
                     activeTab === 'products' ? '管理您的库存、定价及展示图片' : 
                     activeTab === 'orders' ? '查看顾客订单与配送信息' : '管理注册用户名单'}
                </p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
                <div className="flex p-1 bg-slate-100 rounded-lg shrink-0">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <LayoutDashboard size={16} /> 概览
                    </button>
                    <button 
                        onClick={() => setActiveTab('products')}
                        className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'products' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Package size={16} /> 商品
                    </button>
                    <button 
                        onClick={() => setActiveTab('orders')}
                         className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'orders' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ClipboardList size={16} /> 订单
                        {orders.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full ml-1">{orders.length}</span>}
                    </button>
                     <button 
                        onClick={() => setActiveTab('users')}
                         className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Users size={16} /> 用户
                    </button>
                </div>
                <button 
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors shrink-0"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </div>

        {/* --- DASHBOARD VIEW --- */}
        {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-500">
                
                {/* Dashboard Filter Tabs */}
                <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex space-x-1">
                        {(['day', 'week', 'month', 'year'] as const).map((r) => (
                             <button
                                key={r}
                                onClick={() => setDashboardRange(r)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    dashboardRange === r 
                                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                             >
                                {r === 'day' && '今日'}
                                {r === 'week' && '本周'}
                                {r === 'month' && '本月'}
                                {r === 'year' && '全年'}
                             </button>
                        ))}
                    </div>
                    <div className="text-xs text-slate-400 px-2 flex items-center gap-1 hidden sm:flex">
                        <CalendarDays size={14} /> 数据统计截止至当前
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-500" /> 销售额 ({dashboardRange === 'day' ? '今日' : dashboardRange === 'week' ? '本周' : dashboardRange === 'month' ? '本月' : '全年'})
                        </div>
                        <div className="text-3xl font-bold text-slate-800">¥{dashboardStats.totalRevenue.toFixed(2)}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                         <div className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2">
                            <ClipboardList size={16} className="text-blue-500" /> 订单数
                        </div>
                        <div className="text-3xl font-bold text-slate-800">{dashboardStats.totalOrders} <span className="text-sm font-normal text-slate-400">单</span></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2">
                            <Package size={16} className="text-purple-500" /> 平均客单价
                        </div>
                        <div className="text-3xl font-bold text-slate-800">¥{dashboardStats.avgOrderValue.toFixed(2)}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sales Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6">{dashboardStats.chartTitle}</h3>
                        <div className="h-64 flex items-end justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-2">
                            {dashboardStats.chartData.map((data, index) => (
                                <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group min-w-[12px] sm:min-w-[20px]">
                                    <div className="relative w-full bg-blue-50/50 rounded-t-sm flex items-end justify-center hover:bg-blue-100 transition-colors" style={{ height: '100%' }}>
                                        <div 
                                            className={`w-full ${dashboardRange === 'month' ? 'sm:w-2' : 'sm:w-6'} bg-blue-500 rounded-t-sm transition-all duration-1000 ease-out relative`}
                                            style={{ height: `${(data.value / dashboardStats.maxRevenue) * 100}%` }}
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-lg pointer-events-none">
                                                {data.fullLabel || data.label}: ¥{data.value.toFixed(0)}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Smart labels: show all if not many, otherwise skip some */}
                                    <span className="text-[10px] text-slate-500 mt-2 font-medium truncate w-full text-center">
                                        {dashboardRange === 'month' 
                                            ? (index % 5 === 0 || index === dashboardStats.chartData.length -1 ? data.label : '') 
                                            : dashboardRange === 'day'
                                                ? (index % 3 === 0 ? data.label : '')
                                                : data.label}
                                    </span>
                                </div>
                            ))}
                            {dashboardStats.chartData.length === 0 && (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                    暂无数据
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                         <h3 className="font-bold text-slate-800 mb-4">热销商品排行 ({dashboardRange === 'day' ? '今日' : dashboardRange === 'week' ? '本周' : dashboardRange === 'month' ? '本月' : '今年'})</h3>
                         <div className="space-y-4">
                             {dashboardStats.topProducts.map(([name, count], index) => (
                                 <div key={name} className="flex items-center justify-between animate-in slide-in-from-right duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                                     <div className="flex items-center gap-3">
                                         <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                                             {index + 1}
                                         </span>
                                         <span className="text-sm text-slate-700 font-medium truncate max-w-[120px]">{name}</span>
                                     </div>
                                     <span className="text-sm text-slate-500">{count} 份</span>
                                 </div>
                             ))}
                             {dashboardStats.topProducts.length === 0 && <p className="text-slate-400 text-sm text-center py-4">暂无销售数据</p>}
                         </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- PRODUCTS VIEW --- */}
        {activeTab === 'products' && (
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">商品图片</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">商品名称</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">价格 (¥)</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">单位</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group-hover:border-blue-300 transition-colors cursor-pointer bg-slate-100">
                                            <img 
                                                src={product.image} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover" 
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ImageIcon className="text-white mb-1" size={16} />
                                                <span className="text-[10px] text-white font-medium">更换</span>
                                            </div>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handleImageUpload(e, product.id)}
                                                title="点击上传新图片"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <input 
                                            type="text" 
                                            defaultValue={product.name}
                                            className="w-full px-3 py-2 border border-transparent hover:border-slate-200 focus:border-blue-500 rounded-lg bg-transparent focus:bg-white transition-all font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            onBlur={(e) => {
                                                if (e.target.value.trim() !== product.name) {
                                                    onUpdateProduct(product.id, 'name', e.target.value);
                                                }
                                            }}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="relative max-w-[120px]">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">¥</span>
                                            <input 
                                                type="number" 
                                                step="0.1"
                                                defaultValue={product.price}
                                                className="w-full pl-6 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono text-slate-700 transition-all"
                                                onBlur={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (!isNaN(val) && val >= 0) {
                                                        onUpdateProduct(product.id, 'price', val);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                         <input 
                                            type="text" 
                                            defaultValue={product.unit}
                                            className="w-20 px-2 py-1 bg-slate-100 hover:bg-white border border-transparent hover:border-slate-200 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-slate-600"
                                            onBlur={(e) => {
                                                if (e.target.value.trim() !== product.unit) {
                                                    onUpdateProduct(product.id, 'unit', e.target.value);
                                                }
                                            }}
                                        />
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => onDeleteProduct(product.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="删除商品"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Add Product Button */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center">
                    <button 
                        onClick={onAddProduct}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                    >
                        <Plus size={18} />
                        添加新商品
                    </button>
                </div>
            </div>
        )}

        {/* --- ORDERS VIEW --- */}
        {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] animate-in fade-in duration-300">
                <div className="flex flex-col h-full">
                    {/* Orders Toolbar */}
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex items-center">
                                <Filter size={16} className="absolute left-3 text-slate-400" />
                                <input 
                                    type="date" 
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 w-full sm:w-auto"
                                />
                            </div>
                            {filterDate && (
                                <button 
                                    onClick={() => setFilterDate('')}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2"
                                >
                                    清除筛选
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={downloadOrdersCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:border-green-500 hover:text-green-600 transition-all shadow-sm w-full sm:w-auto justify-center"
                        >
                            <Download size={16} /> 导出{filterDate ? '当前' : '全部'}订单
                        </button>
                    </div>

                    {/* Orders List */}
                    {filteredOrdersList.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
                            <p>{filterDate ? '该日期暂无订单' : '暂无订单数据'}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white border-b border-slate-100 text-slate-500">
                                    <tr>
                                        <th className="p-5 text-xs font-bold uppercase tracking-wider">订单信息</th>
                                        <th className="p-5 text-xs font-bold uppercase tracking-wider">客户</th>
                                        <th className="p-5 text-xs font-bold uppercase tracking-wider">商品明细</th>
                                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-right">总金额</th>
                                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-center">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredOrdersList.map(order => (
                                        <tr key={order.id} className="hover:bg-slate-50">
                                            <td className="p-5">
                                                <div className="font-mono text-xs text-slate-500 mb-1">{order.id}</div>
                                                <div className="text-sm font-medium text-slate-700">
                                                    {new Date(order.timestamp).toLocaleString()}
                                                </div>
                                                <div className={`mt-1 inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {order.status === 'completed' ? '已完成' : '待处理'}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <img src={order.user.avatar} className="w-8 h-8 rounded-full bg-slate-100" alt="avatar" />
                                                    <span className="text-sm font-medium text-slate-900">{order.user.nickname}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="space-y-1">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="text-sm text-slate-600">
                                                            {item.name} <span className="text-slate-400">x{item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <span className="text-lg font-bold text-emerald-600">¥{order.total.toFixed(2)}</span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => setEditingOrder(order)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="修改订单"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => onDeleteOrder(order.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="删除订单"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- USERS VIEW --- */}
        {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
                 <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><Users size={18} /> 注册用户名单</h3>
                    <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">共 {users.length} 人</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                         <thead className="bg-white border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider">用户</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider">登录账号</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider">注册时间</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-100" alt={user.nickname} />
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{user.nickname}</div>
                                                <div className="text-xs text-slate-400">ID: {user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-sm text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded">{user.username}</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-sm text-slate-600">{new Date(user.joinDate).toLocaleString()}</div>
                                    </td>
                                    <td className="p-5 text-center">
                                         <button 
                                            onClick={() => onDeleteUser(user.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="删除用户"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-400">暂无注册用户</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>
        )}
        
        {activeTab === 'products' && (
            <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm border border-blue-100 flex items-start gap-3">
                <Save className="shrink-0 mt-0.5" size={18} />
                <div>
                    <p className="font-bold">操作提示</p>
                    <p>点击文本可直接修改内容（名称、价格、单位），点击图片可更换。添加商品后请完善商品信息。</p>
                </div>
            </div>
        )}
    </div>
  );
};
