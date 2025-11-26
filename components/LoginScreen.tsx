
import React, { useState } from 'react';
import { User, Store, ArrowRight, Lock, UserPlus, LogIn, Github as Gift } from 'lucide-react';
import { RegisteredUser, UserProfile } from '../types';

interface LoginScreenProps {
  onLogin: (role: 'shopper' | 'merchant') => void;
  onUserProfileFetch: (profile: UserProfile) => void;
  users: RegisteredUser[];
  onRegister: (user: Omit<RegisteredUser, 'id' | 'joinDate'>) => boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onUserProfileFetch, users, onRegister }) => {
  const [activeTab, setActiveTab] = useState<'shopper' | 'merchant'>('shopper');
  
  // Shopper State
  const [shopperMode, setShopperMode] = useState<'guest' | 'login' | 'register'>('guest');
  const [shopperUsername, setShopperUsername] = useState('');
  const [shopperPassword, setShopperPassword] = useState('');
  const [shopperNickname, setShopperNickname] = useState('');
  const [shopperError, setShopperError] = useState('');

  // Merchant State
  const [merchantPassword, setMerchantPassword] = useState('');
  const [merchantError, setMerchantError] = useState('');

  // --- Merchant Logic ---
  const handleMerchantLogin = () => {
    if (merchantPassword === '123456') {
      onLogin('merchant');
    } else {
      setMerchantError('密码错误 (提示: 123456)');
    }
  };

  // --- Shopper Logic ---

  const handleGuestLogin = () => {
    // Generate a random seed for the avatar
    const seed = Math.random().toString(36).substring(7);
    onUserProfileFetch({
      nickname: '游客' + Math.floor(Math.random() * 1000),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
      isGuest: true
    });
    onLogin('shopper');
  };

  const handleUserLogin = () => {
    const user = users.find(u => u.username === shopperUsername && u.password === shopperPassword);
    if (user) {
      onUserProfileFetch({
        nickname: user.nickname,
        avatar: user.avatar,
        username: user.username,
        isGuest: false
      });
      onLogin('shopper');
    } else {
      setShopperError('账号或密码错误');
    }
  };

  const handleUserRegister = () => {
    if (!shopperUsername || !shopperPassword || !shopperNickname) {
      setShopperError('请填写所有必填项');
      return;
    }

    const seed = Math.random().toString(36).substring(7);
    const success = onRegister({
      username: shopperUsername,
      password: shopperPassword,
      nickname: shopperNickname,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${shopperNickname + seed}`
    });

    if (success) {
      // Auto login after register
      onUserProfileFetch({
        nickname: shopperNickname,
        username: shopperUsername,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${shopperNickname + seed}`,
        isGuest: false
      });
      onLogin('shopper');
    } else {
      setShopperError('该账号已存在');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
          🍋
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">鲜果优选</h1>
        <p className="text-slate-500 mt-2">您的每日新鲜水果管家</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('shopper')}
            className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 relative
              ${activeTab === 'shopper' ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <User size={18} /> 顾客入口
            {activeTab === 'shopper' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('merchant')}
            className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 relative
              ${activeTab === 'merchant' ? 'text-blue-700 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <Store size={18} /> 商家入口
            {activeTab === 'merchant' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        </div>

        <div className="p-8 min-h-[350px] flex flex-col justify-center">
          {activeTab === 'shopper' ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* Shopper Mode Tabs */}
              <div className="flex justify-center mb-6 bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => { setShopperMode('guest'); setShopperError(''); }}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${shopperMode === 'guest' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  游客访问
                </button>
                <button 
                  onClick={() => { setShopperMode('login'); setShopperError(''); }}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${shopperMode === 'login' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  账号登录
                </button>
                <button 
                   onClick={() => { setShopperMode('register'); setShopperError(''); }}
                   className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${shopperMode === 'register' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  注册新号
                </button>
              </div>

              {/* Guest View */}
              {shopperMode === 'guest' && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center text-emerald-600 ring-4 ring-emerald-50/50">
                    <User size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">快捷访问</h3>
                    <p className="text-slate-500 mt-1">无需注册，直接选购新鲜水果</p>
                  </div>
                  <button
                    onClick={handleGuestLogin}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                     <Gift size={18} /> 一键登录
                  </button>
                </div>
              )}

              {/* Login View */}
              {shopperMode === 'login' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">账号</label>
                    <input 
                      type="text" 
                      value={shopperUsername}
                      onChange={(e) => setShopperUsername(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="请输入账号"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">密码</label>
                    <input 
                      type="password" 
                      value={shopperPassword}
                      onChange={(e) => setShopperPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUserLogin()}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="请输入密码"
                    />
                  </div>
                  {shopperError && <p className="text-red-500 text-sm font-medium">⚠️ {shopperError}</p>}
                  <button
                    onClick={handleUserLogin}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                  >
                     <LogIn size={18} /> 登录
                  </button>
                </div>
              )}

              {/* Register View */}
              {shopperMode === 'register' && (
                <div className="space-y-3">
                   <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">用户昵称</label>
                    <input 
                      type="text" 
                      value={shopperNickname}
                      onChange={(e) => setShopperNickname(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="如：水果达人"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">设置账号</label>
                    <input 
                      type="text" 
                      value={shopperUsername}
                      onChange={(e) => setShopperUsername(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="设置登录账号"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">设置密码</label>
                    <input 
                      type="password" 
                      value={shopperPassword}
                      onChange={(e) => setShopperPassword(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="设置登录密码"
                    />
                  </div>
                  {shopperError && <p className="text-red-500 text-sm font-medium">⚠️ {shopperError}</p>}
                  <button
                    onClick={handleUserRegister}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                  >
                     <UserPlus size={18} /> 注册并登录
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
               <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center text-blue-600 ring-4 ring-blue-50/50">
                <Lock size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800">商家管理</h3>
                <p className="text-slate-500 mt-1">请验证身份以管理商品信息</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">管理密码</label>
                <input
                  type="password"
                  value={merchantPassword}
                  onChange={(e) => {
                    setMerchantPassword(e.target.value);
                    setMerchantError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleMerchantLogin()}
                  placeholder="请输入密码"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                />
                {merchantError && <p className="text-red-500 text-sm font-medium flex items-center gap-1">⚠️ {merchantError}</p>}
              </div>
              <button
                onClick={handleMerchantLogin}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                登录后台
              </button>
              <p className="text-center text-xs text-slate-400">测试密码: 123456</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
