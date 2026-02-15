import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { Personnel, ThemeType } from '../types';
import { Stethoscope, ChevronDown, User, Moon, Sun, ShieldCheck, LogIn, Lock, Home, Wifi, WifiOff, Settings } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: Personnel) => void;
  onBack?: () => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  currentTheme?: ThemeType;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onBack, isDarkMode, toggleTheme, currentTheme = 'grid' }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('مدیر');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState('');

  useEffect(() => {
    // Check connection to API on mount for diagnostics
    db.checkConnection().then(setIsConnected);
    setCustomApiUrl(db.getApiUrl().replace('/api', ''));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await db.login(username, password, role);
      // Simulate a short network delay for realism
      await new Promise(resolve => setTimeout(resolve, 600));

      if (user) {
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ورود به سیستم');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApi = () => {
      if (customApiUrl) {
          db.setApiUrl(customApiUrl);
      } else {
          db.resetApiUrl();
      }
      setShowApiConfig(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative font-vazir overflow-hidden transition-colors duration-500 bg-theme-${currentTheme} ${isDarkMode ? 'dark' : ''}`} dir="rtl">
      
      {/* --- Animated Background Elements --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-stone-300 dark:bg-stone-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-stone-300 dark:bg-stone-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>

      {/* --- Main Login Card --- */}
      <div className="relative z-10 w-full max-w-[380px] glass-panel p-8 flex flex-col items-center animate-mac-window">
        
        {/* Logo Icon */}
        <div className="w-20 h-20 rounded-[24px] bg-stone-800/80 dark:bg-stone-100/80 flex items-center justify-center mb-6 shadow-2xl shadow-stone-400/50 dark:shadow-none animate-pop backdrop-blur-sm">
           <Stethoscope className="w-10 h-10 text-white dark:text-stone-900" strokeWidth={2} />
        </div>

        <div className="text-center mb-8 animate-item" style={{animationDelay: '100ms'}}>
           <h1 className="text-2xl font-black mb-1 tracking-tight text-stone-800 dark:text-stone-100">مطب یار</h1>
           <p className="font-medium text-sm text-stone-500 dark:text-stone-400">سیستم مدیریت (نسخه تولید)</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
           
           <div className="space-y-3">
              {/* Username Input */}
              <div className="relative group animate-item" style={{animationDelay: '200ms'}}>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors z-10 text-stone-400 group-focus-within:text-stone-700 dark:group-focus-within:text-stone-200">
                    <User className="w-5 h-5" />
                 </div>
                 <input 
                    type="text"
                    dir="ltr" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-right pr-10 pl-4 py-3.5 glass-input rounded-xl outline-none font-bold placeholder-stone-400 transition-all focus:border-stone-400"
                    placeholder="نام کاربری"
                 />
              </div>

              {/* Password Input */}
              <div className="relative group animate-item" style={{animationDelay: '250ms'}}>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors z-10 text-stone-400 group-focus-within:text-stone-700 dark:group-focus-within:text-stone-200">
                    <Lock className="w-5 h-5" />
                 </div>
                 <input 
                    type="password"
                    dir="ltr" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-right pr-10 pl-4 py-3.5 glass-input rounded-xl outline-none font-bold placeholder-stone-400 transition-all focus:border-stone-400"
                    placeholder="رمز عبور"
                 />
              </div>

              {/* Role Select */}
              <div className="relative group animate-item" style={{animationDelay: '300ms'}}>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors z-10 text-stone-400 group-focus-within:text-stone-700 dark:group-focus-within:text-stone-200">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
                 <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pr-10 pl-4 py-3.5 glass-input rounded-xl outline-none font-bold appearance-none cursor-pointer text-stone-700 dark:text-stone-200 transition-all focus:border-stone-400"
                 >
                   <option value="منشی" className="dark:bg-stone-900">منشی</option>
                   <option value="پرستار" className="dark:bg-stone-900">پرستار</option>
                   <option value="پزشک" className="dark:bg-stone-900">پزشک</option>
                   <option value="مدیر" className="dark:bg-stone-900">مدیر</option>
                 </select>
                 <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
           </div>

           {error && (
             <div className="animate-item bg-red-50/80 dark:bg-red-900/40 text-red-700 dark:text-red-200 text-xs py-2.5 px-4 rounded-xl text-center font-bold border border-red-100 dark:border-red-800 shadow-sm">
               {error}
             </div>
           )}

           <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-lg shadow-xl shadow-stone-400/20 dark:shadow-none hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-4 bg-stone-800/90 text-white dark:bg-stone-100/90 dark:text-stone-900 animate-item backdrop-blur-sm"
              style={{animationDelay: '400ms'}}
           >
              {loading ? (
                <span className="w-5 h-5 border-2 border-stone-500 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span className="text-base">ورود به سیستم</span>
                  <LogIn className="w-4 h-4" />
                </>
              )}
           </button>
        </form>
        
        {/* Buttons: Home (Right) & Theme (Left) */}
        {onBack && (
            <button 
              onClick={onBack}
              title="بازگشت به صفحه اصلی"
              className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-stone-500 dark:text-stone-300 transition-all border border-stone-100 dark:border-white/5 shadow-sm"
            >
               <Home className="w-4 h-4" />
            </button>
        )}

        {toggleTheme && (
           <button 
             onClick={toggleTheme} 
             className="absolute top-6 left-6 p-2 rounded-full bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-stone-500 dark:text-stone-300 transition-all border border-stone-100 dark:border-white/5 shadow-sm"
           >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
           </button>
        )}

        {/* Connection Diagnostics Footer */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-2 animate-item" style={{animationDelay: '500ms'}}>
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono border ${isConnected ? 'bg-green-50/50 text-green-600 border-green-200' : 'bg-red-50/50 text-red-600 border-red-200'} opacity-60 hover:opacity-100 transition-opacity`}>
               {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
               <span dir="ltr">{db.getApiUrl().replace('http://', '').replace('/api', '')}</span>
            </div>
            
            <button 
               onClick={() => setShowApiConfig(true)}
               className="p-1 rounded-md bg-stone-100 dark:bg-white/10 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors opacity-60 hover:opacity-100"
               title="تنظیمات سرور"
            >
               <Settings className="w-3 h-3" />
            </button>
        </div>
        
        {/* API Config Modal */}
        {showApiConfig && (
            <div className="absolute inset-0 z-50 glass-panel rounded-3xl flex flex-col items-center justify-center p-6 animate-pop bg-white/90 dark:bg-stone-900/95">
                <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-4 text-center">آدرس سرور (Ngrok/Local)</h3>
                <p className="text-[10px] text-stone-500 mb-4 text-center">اگر از Ngrok استفاده می‌کنید، آدرس کامل (http/https) را وارد کنید.</p>
                <input 
                   type="text" 
                   dir="ltr"
                   value={customApiUrl}
                   onChange={(e) => setCustomApiUrl(e.target.value)}
                   className="w-full p-3 glass-input rounded-xl text-xs font-mono mb-4 text-center"
                   placeholder="http://localhost:3001"
                />
                <div className="flex gap-2 w-full">
                    <button onClick={() => setShowApiConfig(false)} className="flex-1 py-2 rounded-xl text-stone-500 hover:bg-stone-100 font-bold text-xs">لغو</button>
                    <button onClick={handleSaveApi} className="flex-1 py-2 rounded-xl bg-stone-800 text-white font-bold text-xs">ذخیره و بارگذاری</button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default LoginView;