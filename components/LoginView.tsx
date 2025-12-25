import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { Personnel, ThemeType } from '../types';
import { ArrowLeft, Stethoscope, ChevronDown, User, Lock, Moon, Sun, ShieldCheck, Wifi, WifiOff, Database, X, Copy, Check } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: Personnel) => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  currentTheme?: ThemeType;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, isDarkMode, toggleTheme, currentTheme = 'grid' }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState('مدیر');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [showDbHelp, setShowDbHelp] = useState(false);
  const [copied, setCopied] = useState(false);

  const rlsCommands = `-- دستورات باز کردن قفل دیتابیس (RLS)
-- این کدها را در انتهای همان اسکریپت موجود در Supabase کپی و اجرا کنید

ALTER TABLE personnel DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE medicines DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records DISABLE ROW LEVEL SECURITY;`;

  useEffect(() => {
    // Check DB connection on mount
    const checkServer = async () => {
        const status = await db.checkConnection();
        setIsConnected(status);
    };
    checkServer();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Now async!
      const user = await db.login(username, role, password);
      if (user) {
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در برقراری ارتباط با سرور');
      
      // هوشمندسازی: اگر ادمین پیدا نشد، یعنی به احتمال ۹۹٪ دیتابیس قفل است (RLS)
      // پس راهنما را خودکار باز می‌کنیم.
      if (username === 'admin' && (err.message.includes('یافت نشد') || err.message.includes('خطا'))) {
          setTimeout(() => setShowDbHelp(true), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rlsCommands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative font-vazir overflow-hidden transition-colors duration-500 bg-theme-${currentTheme}`} dir="rtl">
      
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
           <p className="font-medium text-sm text-stone-500 dark:text-stone-400">ورود به سیستم مدیریت یکپارچه</p>
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
                    className="w-full text-right pr-10 pl-4 py-3.5 glass-input rounded-xl outline-none font-bold placeholder-stone-400"
                    placeholder="نام کاربری"
                 />
              </div>

              {/* Password Input */}
              <div className="relative group animate-item" style={{animationDelay: '300ms'}}>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors z-10 text-stone-400 group-focus-within:text-stone-700 dark:group-focus-within:text-stone-200">
                    <Lock className="w-5 h-5" />
                 </div>
                 <input 
                    type="password" 
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-right pr-10 pl-4 py-3.5 glass-input rounded-xl outline-none font-bold tracking-widest placeholder-stone-400"
                    placeholder="••••••"
                 />
              </div>

              {/* Role Select */}
              <div className="relative group animate-item" style={{animationDelay: '400ms'}}>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors z-10 text-stone-400 group-focus-within:text-stone-700 dark:group-focus-within:text-stone-200">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
                 <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pr-10 pl-4 py-3.5 glass-input rounded-xl outline-none font-bold appearance-none cursor-pointer text-stone-700 dark:text-stone-200"
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
              style={{animationDelay: '500ms'}}
           >
              {loading ? (
                <span className="w-5 h-5 border-2 border-stone-500 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span className="text-base">ورود به سیستم</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
           </button>
        </form>
        
        {/* Connection Status Indicator */}
        <div className="mt-8 flex flex-col items-center gap-2 animate-item" style={{animationDelay: '600ms'}}>
           <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors ${
               isConnected === true ? 'bg-green-100/50 text-green-700 border-green-200' : 
               isConnected === false ? 'bg-red-100/50 text-red-700 border-red-200' : 
               'bg-stone-100/50 text-stone-500 border-stone-200'
           }`}>
               {isConnected === true ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
               {isConnected === true ? 'متصل به سرور' : isConnected === false ? 'عدم ارتباط با سرور' : 'در حال بررسی اتصال...'}
           </div>
           
           <button 
             onClick={() => setShowDbHelp(true)}
             className="text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 underline decoration-dashed underline-offset-4 cursor-pointer"
           >
             مشکل در ورود؟ (راهنمای دیتابیس)
           </button>
        </div>
        
        {toggleTheme && (
           <button 
             onClick={toggleTheme} 
             className="absolute top-6 left-6 p-2 rounded-full bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-stone-500 dark:text-stone-300 transition-all border border-stone-100 dark:border-white/5 shadow-sm"
           >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
           </button>
        )}
      </div>

      {/* --- DB Help Modal --- */}
      {showDbHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
           <div className="glass-panel w-full max-w-lg p-6 rounded-[24px] relative shadow-2xl animate-pop bg-white dark:bg-[#1e1e1e]">
              <button 
                 onClick={() => setShowDbHelp(false)}
                 className="absolute top-4 left-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
              >
                 <X className="w-5 h-5 text-stone-500" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                 <div className="bg-orange-100/50 dark:bg-orange-900/30 p-3 rounded-xl text-orange-600 dark:text-orange-400">
                    <Database className="w-6 h-6" />
                 </div>
                 <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">فعال‌سازی دیتابیس</h2>
              </div>

              <p className="text-sm text-stone-600 dark:text-stone-300 mb-4 leading-relaxed">
                 <span className="block mb-2 font-bold text-red-500">مشکل: دیتابیس قفل است یا جدول‌ها خالی هستند.</span>
                 برای رفع این مشکل، لطفاً کد زیر را کپی کنید و در بخش <span dir="ltr" className="font-mono bg-stone-100 dark:bg-stone-800 px-1 rounded">SQL Editor</span> (در پنل Supabase) اجرا کنید:
              </p>

              <div className="relative bg-[#1e1e1e] p-4 rounded-xl border border-stone-200/50 dark:border-white/10 overflow-hidden" dir="ltr">
                  <pre className="text-xs font-mono text-stone-300 overflow-x-auto whitespace-pre-wrap">
                     {rlsCommands}
                  </pre>
                  <button 
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    title="کپی کد"
                  >
                     {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
              </div>

              <div className="mt-6 flex justify-end">
                 <button 
                   onClick={() => setShowDbHelp(false)}
                   className="bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
                 >
                   متوجه شدم
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LoginView;