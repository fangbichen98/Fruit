import React, { useState } from 'react';
import { CartItem } from '../types';
import { ShoppingBag, X, Minus, Plus } from 'lucide-react';

interface CartSummaryProps {
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ cart, updateQuantity, onCheckout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutClick = () => {
      onCheckout();
      setIsOpen(false);
  };

  if (count === 0 && !isOpen) return null;

  return (
    <>
      {/* Expanded Cart / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="text-emerald-600" />
                您的购物篮
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-5 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-14 h-14 rounded-xl object-cover border border-slate-100" 
                    />
                    <div>
                      <h4 className="font-medium text-slate-900">{item.name}</h4>
                      <p className="text-sm text-slate-500">¥{item.price.toFixed(2)} / {item.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-red-500"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-4 text-center font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-emerald-500"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <div className="flex justify-between items-end mb-4">
                <span className="text-slate-500">合计</span>
                <span className="text-3xl font-bold text-emerald-600">¥{total.toFixed(2)}</span>
              </div>
              <button 
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all"
                onClick={handleCheckoutClick}
              >
                立即结算
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bar (Sticky Footer) */}
      {!isOpen && (
        <div className="fixed bottom-6 left-0 right-0 px-4 sm:px-6 z-40 flex justify-center">
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-slate-900 text-white rounded-full px-6 py-4 shadow-xl flex items-center gap-6 hover:scale-105 transition-transform w-full max-w-md justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {count}
                    </div>
                    <span className="font-medium">查看购物车</span>
                </div>
                <span className="font-bold text-lg">¥{total.toFixed(2)}</span>
            </button>
        </div>
      )}
    </>
  );
};