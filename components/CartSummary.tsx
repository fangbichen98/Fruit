
import React, { useState } from 'react';
import { CartItem } from '../types';
import { ShoppingBag, X, Minus, Plus, MapPin, Phone } from 'lucide-react';

interface CartSummaryProps {
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  onCheckout: (address: string, phone: string) => void;
}

// Payment Modal Component
const PaymentModal: React.FC<{
  total: number;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ total, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="font-bold text-slate-800">请扫码支付</h3>
             <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
               <X size={20} className="text-slate-500"/>
             </button>
          </div>
          <div className="p-6 flex flex-col items-center text-center">
             <div className="text-3xl font-bold text-slate-900 mb-4">¥{total.toFixed(2)}</div>
             <div className="w-56 h-56 bg-slate-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 p-2">
                <img 
                  src="pic/payment.jpg" 
                  alt="Payment QR" 
                  className="w-full h-full object-cover rounded-lg" 
                  onError={(e) => {
                      // Fallback placeholder if image missing
                      e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=alipayqr://platformapi/startapp?saId=10000007'; 
                  }}
                />
             </div>
             <p className="text-sm text-slate-600 font-medium mb-1">请扫描上方二维码进行支付</p>
             <div className="mt-2 text-xs text-orange-600 font-medium bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
               ⚠️ 支付备注：地址 + 手机号后四位
             </div>
          </div>
          <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-3 bg-slate-50">
             <button onClick={onClose} className="py-2.5 rounded-xl font-bold text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
               取消
             </button>
             <button onClick={onConfirm} className="py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95 transition-all">
               我已支付
             </button>
          </div>
       </div>
    </div>
  );
};

export const CartSummary: React.FC<CartSummaryProps> = ({ cart, updateQuantity, onCheckout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutClick = () => {
      if (!address.trim()) {
        alert('请填写收货地址');
        return;
      }
      if (!phone.trim()) {
        alert('请填写联系电话');
        return;
      }
      // Open Payment Modal instead of direct checkout
      setShowPayment(true);
  };

  const handlePaymentConfirm = () => {
      onCheckout(address, phone);
      setShowPayment(false);
      setIsOpen(false);
      setAddress(''); 
      setPhone('');   
  };

  if (count === 0 && !isOpen) return null;

  return (
    <>
      {/* Payment Modal Overlay */}
      {showPayment && (
        <PaymentModal 
          total={total} 
          onClose={() => setShowPayment(false)} 
          onConfirm={handlePaymentConfirm} 
        />
      )}

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
            <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-4">
              
              {/* Phone Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  <Phone size={16} className="text-slate-400" /> 联系电话
                </label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号 (必填)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Address Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  <MapPin size={16} className="text-slate-400" /> 收货地址
                </label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="请输入宿舍区或校门口 (必填)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div className="flex justify-between items-end pt-2">
                <span className="text-slate-500">合计</span>
                <span className="text-3xl font-bold text-emerald-600">¥{total.toFixed(2)}</span>
              </div>
              <button 
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCheckoutClick}
                disabled={!address.trim() || !phone.trim()}
              >
                {address.trim() && phone.trim() ? '去结算' : '请填写完整信息'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bar (Sticky Footer) */}
      {!isOpen && !showPayment && (
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
