
import React, { useState, useEffect, useRef } from 'react';
import { Order } from '../types';
import { X, MessageSquare, Clock, MapPin, Package, Send, Image as ImageIcon, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Re-initialize client here or pass as prop. Using the same config for simplicity.
const supabaseUrl = 'https://xysfaxlpbczibjsxjwjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5c2ZheGxwYmN6aWJqc3hqd2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTYwOTcsImV4cCI6MjA3OTg3MjA5N30.PaC7CN212lHAVIX1le0BtPu9-2gw-B-MDinhEOYEG98';
const supabase = createClient(supabaseUrl, supabaseKey);

interface UserOrdersModalProps {
  userId: string;
  onClose: () => void;
}

export const UserOrdersModal: React.FC<UserOrdersModalProps> = ({ userId, onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackImage, setFeedbackImage] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Orders on Mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
           const mappedOrders: Order[] = data.map((o: any) => {
               // Parse cart_items safely
               const rawItems = o.cart_items || [];
               const items = Array.isArray(rawItems) ? rawItems.map((ri: any) => ({
                 id: ri.name, // Simplified mapping since we just need display
                 name: ri.name,
                 quantity: ri.num,
                 image: '', 
                 price: 0, 
                 unit: ''
               })) : [];

               return {
                 id: o.id,
                 user: o.user_info,
                 items: items,
                 total: o.total || 0, 
                 timestamp: new Date(o.created_at).getTime(),
                 status: o.status,
                 address: o.address, 
                 phone: o.phone
               };
           });
           setOrders(mappedOrders);
        }
      } catch (e) {
        console.error('Error fetching history:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeedbackImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim() || !feedbackOrderId) return;
    
    setSubmittingFeedback(true);
    try {
      const { error } = await supabase.from('feedbacks').insert({
        user_id: userId,
        order_id: feedbackOrderId,
        content: feedbackContent,
        image_url: feedbackImage || null,
        status: 'pending'
      });

      if (error) throw error;

      alert('反馈已提交，商家将尽快联系您');
      setFeedbackOrderId(null);
      setFeedbackContent('');
      setFeedbackImage('');
    } catch (e: any) {
      alert('提交反馈失败: ' + e.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-emerald-600" />
            我的历史订单
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-4">
          {loading ? (
             <div className="text-center py-10 text-slate-400">加载中...</div>
          ) : orders.length === 0 ? (
             <div className="text-center py-10 text-slate-400">您还没有下过单哦</div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-3 border-b border-slate-50 pb-2">
                  <div>
                    <div className="text-xs text-slate-400 font-mono">订单号: {order.id}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      {new Date(order.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {order.status === 'completed' ? '已完成' : '待处理'}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-700 font-medium">{item.name} x {item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-lg font-bold text-slate-800">¥{order.total.toFixed(2)}</div>
                  <button 
                    onClick={() => setFeedbackOrderId(order.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    <MessageSquare size={16} /> 售后反馈
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Feedback Modal Overlay */}
        {feedbackOrderId && (
           <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[1px] flex items-end sm:items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-10 duration-200 max-h-[90vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-800">提交售后反馈</h4>
                    <button onClick={() => { setFeedbackOrderId(null); setFeedbackContent(''); setFeedbackImage(''); }} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                 </div>
                 <p className="text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded">订单: {feedbackOrderId}</p>
                 
                 <div className="space-y-3 mb-4">
                     <textarea 
                        value={feedbackContent}
                        onChange={(e) => setFeedbackContent(e.target.value)}
                        placeholder="请描述您遇到的问题（必填）..."
                        className="w-full h-24 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                     />
                     
                     {/* Image Upload Area */}
                     <div>
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={handleImageSelect} 
                            className="hidden" 
                        />
                        {!feedbackImage ? (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-blue-300 transition-all"
                            >
                                <ImageIcon size={16} /> 上传图片 (可选)
                            </button>
                        ) : (
                            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 group">
                                <img src={feedbackImage} alt="Feedback" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => setFeedbackImage('')}
                                        className="p-2 bg-white/20 hover:bg-red-500 hover:text-white rounded-full text-white backdrop-blur-sm transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                     </div>
                 </div>

                 <div className="flex gap-2">
                   <button 
                     onClick={() => { setFeedbackOrderId(null); setFeedbackContent(''); setFeedbackImage(''); }}
                     className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold"
                   >
                     取消
                   </button>
                   <button 
                     onClick={handleSubmitFeedback}
                     disabled={submittingFeedback || !feedbackContent.trim()}
                     className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {submittingFeedback ? '提交中...' : <><Send size={14}/> 提交反馈</>}
                   </button>
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};
