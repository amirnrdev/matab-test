
import React from 'react';
import { UserCog, Stethoscope, ArrowRight, Activity, ShieldCheck, HeartPulse } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, isDarkMode, toggleTheme }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6">
      
      {/* Decorative Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-stone-300/30 dark:bg-stone-700/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>

      {/* Main Container */}
      <div className="relative z-10 max-w-4xl w-full text-center space-y-12 animate-mac-window">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center gap-4">
           <div className="w-24 h-24 bg-stone-800 dark:bg-stone-100 rounded-[32px] flex items-center justify-center shadow-2xl shadow-stone-500/20 dark:shadow-none animate-pop rotate-3 hover:rotate-0 transition-transform duration-500">
              <Stethoscope className="w-12 h-12 text-white dark:text-stone-900" strokeWidth={2} />
           </div>
           <div>
             <h1 className="text-5xl md:text-7xl font-black text-stone-800 dark:text-stone-100 tracking-tighter mb-2">
               مطب <span className="text-stone-500 dark:text-stone-400">یار</span>
             </h1>
             <p className="text-lg md:text-xl font-bold text-stone-500 dark:text-stone-400 tracking-wide">
               سیستم جامع مدیریت کلینیک
             </p>
           </div>
        </div>

        {/* Action Cards */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-2xl mx-auto">
           {/* Staff / Login Card */}
           <button 
             onClick={onLogin}
             className="w-full max-w-sm glass-panel p-8 rounded-[32px] group hover:bg-stone-800 hover:text-white dark:hover:bg-stone-100 dark:hover:text-stone-900 transition-all duration-500 flex flex-col items-center justify-center gap-4 border-2 border-transparent hover:border-stone-800 dark:hover:border-stone-100 hover:scale-[1.02] shadow-xl"
           >
              <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                 <UserCog className="w-8 h-8 text-stone-600 dark:text-stone-300 group-hover:text-white dark:group-hover:text-stone-900" />
              </div>
              <div className="space-y-1">
                 <h2 className="text-2xl font-black group-hover:text-white dark:group-hover:text-stone-900 text-stone-800 dark:text-stone-100">ورود به سیستم</h2>
                 <p className="text-sm font-bold text-stone-400 group-hover:text-white/70 dark:group-hover:text-stone-900/70">
                   پنل مدیریت پزشکان و منشی
                 </p>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                 وارد شوید <ArrowRight className="w-3 h-3" />
              </div>
           </button>
        </div>

      </div>

    </div>
  );
};

export default LandingPage;
