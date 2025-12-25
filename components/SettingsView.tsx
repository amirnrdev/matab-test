import React, { useState } from 'react';
import { db } from '../services/mockDb';
import { Personnel, ThemeType } from '../types';
import { Settings, Lock, User, Save, CheckCircle, Palette, Check, Moon, Sun, Monitor } from 'lucide-react';

interface SettingsViewProps {
  currentUser: Personnel;
  onUpdateUser: (updatedUser: Personnel) => void;
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  currentUser, 
  onUpdateUser, 
  currentTheme, 
  onThemeChange,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [username, setUsername] = useState(currentUser.national_code);
  const [password, setPassword] = useState(currentUser.password || '123456');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (username.length < 5) {
      setMessage({ type: 'error', text: 'نام کاربری باید حداقل ۵ کاراکتر باشد.' });
      return;
    }
    if (password.length < 4) {
      setMessage({ type: 'error', text: 'رمز عبور باید حداقل ۴ کاراکتر باشد.' });
      return;
    }

    try {
      const updatedUser = await db.updateCredentials(currentUser.national_code, username, password);
      onUpdateUser(updatedUser);
      setMessage({ type: 'success', text: 'اطلاعات با موفقیت بروزرسانی شد.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Styles list (Updated names)
  const themes: { id: ThemeType; name: string; previewClass: string }[] = [
    { id: 'foundation', name: 'پایه (کرم)', previewClass: 'bg-theme-foundation' },
    { id: 'creative', name: 'خلاق (هلویی)', previewClass: 'bg-theme-creative' },
    { id: 'fluid', name: 'روان (آبی)', previewClass: 'bg-theme-fluid' },
    { id: 'nature', name: 'طبیعت (جنگلی)', previewClass: 'bg-theme-nature' },
    { id: 'urban', name: 'شهری (بنفش)', previewClass: 'bg-theme-urban' },
    { id: 'grid', name: 'تکنو (ساده)', previewClass: 'bg-theme-grid' },
    
    // Richer Backgrounds
    { id: 'dark', name: 'نیمه شب', previewClass: 'bg-theme-dark' },
    { id: 'rose', name: 'رز', previewClass: 'bg-theme-rose' },
    { id: 'sky', name: 'آسمان', previewClass: 'bg-theme-sky' },
    { id: 'gray', name: 'سربی', previewClass: 'bg-theme-gray' },
    { id: 'indigo', name: 'نیلی', previewClass: 'bg-theme-indigo' },
    { id: 'amber', name: 'کهربایی', previewClass: 'bg-theme-amber' },
    { id: 'stone', name: 'سنگی', previewClass: 'bg-theme-stone' },
    { id: 'slate', name: 'سبز خاص', previewClass: 'bg-theme-slate' },
    { id: 'fuchsia', name: 'ارکیده', previewClass: 'bg-theme-fuchsia' },
    { id: 'cream', name: 'بیسکویتی', previewClass: 'bg-theme-cream' },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-mac-window pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 animate-item">
        <div className="p-3 bg-stone-200/50 text-stone-600 rounded-2xl glass-card">
          <Settings className="w-8 h-8" />
        </div>
        <div>
           <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">تنظیمات و شخصی‌سازی</h1>
           <p className="text-stone-500 dark:text-stone-400 text-sm">مدیریت ظاهر و حساب کاربری</p>
        </div>
      </div>

      {/* Mode & Style Section */}
      <div className="glass-panel rounded-3xl shadow-sm border border-stone-100 dark:border-white/10 overflow-hidden animate-item hover:shadow-xl transition-all duration-300" style={{animationDelay: '100ms'}}>
         <div className="p-6 border-b border-stone-200/50 dark:border-white/10 bg-stone-50/30 dark:bg-white/5 flex justify-between items-center">
            <h2 className="font-bold text-stone-700 dark:text-stone-200 flex items-center gap-2">
               <Palette className="w-5 h-5 text-stone-400" />
               استایل و رنگ (Style)
            </h2>
         </div>
         
         <div className="p-6 space-y-8">
            
            {/* Display Mode (Light/Dark) */}
            <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-black/20 rounded-2xl border border-stone-200/50 dark:border-white/5">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors duration-500 ${isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-amber-100 text-amber-600'}`}>
                     {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                     <h3 className="font-bold text-stone-800 dark:text-stone-100">حالت روز / شب</h3>
                     <p className="text-xs text-stone-500 dark:text-stone-400">تمام استایل‌های زیر با این حالت هماهنگ می‌شوند</p>
                  </div>
               </div>
               
               {/* Toggle Switch */}
               <button 
                  onClick={onToggleDarkMode}
                  className={`
                     w-14 h-8 rounded-full p-1 transition-all duration-500 flex items-center shadow-inner
                     ${isDarkMode ? 'bg-stone-700/80 justify-end' : 'bg-stone-300/80 justify-start'}
                  `}
               >
                  <div className="w-6 h-6 rounded-full bg-white shadow-md"></div>
               </button>
            </div>

            {/* Background Style Selection */}
            <div>
               <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 font-bold flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  انتخاب استایل رنگی (Color Theme):
               </p>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {themes.map((t) => (
                     <button
                       key={t.id}
                       onClick={() => onThemeChange(t.id)}
                       className={`
                          relative group rounded-2xl border-2 transition-all duration-300 overflow-hidden p-1
                          ${currentTheme === t.id 
                             ? 'border-stone-800 dark:border-white scale-105 shadow-lg' 
                             : 'border-transparent hover:border-stone-300 dark:hover:border-stone-700'}
                       `}
                     >
                        {/* Dynamic Preview Box that reacts to parent .dark class */}
                        <div className={`w-full h-16 rounded-xl mb-2 shadow-inner ${t.previewClass} flex items-center justify-center transition-colors duration-500`}>
                           {currentTheme === t.id && (
                              <div className="bg-stone-800/80 dark:bg-white/80 text-white dark:text-black rounded-full p-1 animate-pop">
                                 <Check className="w-4 h-4" />
                              </div>
                           )}
                        </div>
                        <span className={`text-[10px] font-bold block text-center ${currentTheme === t.id ? 'text-stone-800 dark:text-white' : 'text-stone-500 dark:text-stone-400'}`}>
                           {t.name}
                        </span>
                     </button>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* User Info Section */}
      <div className="glass-panel rounded-3xl shadow-sm border border-stone-100 dark:border-white/10 overflow-hidden animate-item hover:shadow-xl transition-all duration-300" style={{animationDelay: '200ms'}}>
        <div className="p-6 border-b border-stone-200/50 dark:border-white/10 bg-stone-50/30 dark:bg-white/5">
          <h2 className="font-bold text-stone-700 dark:text-stone-200 flex items-center gap-2">
            <User className="w-5 h-5 text-stone-400" />
            مشخصات فردی (غیرقابل تغییر)
          </h2>
        </div>
        <div className="p-6 grid grid-cols-2 gap-6">
           <div>
             <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1 font-bold">نام</label>
             <div className="font-bold text-stone-800 dark:text-stone-100 text-lg">{currentUser.first_name}</div>
           </div>
           <div>
             <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1 font-bold">نام خانوادگی</label>
             <div className="font-bold text-stone-800 dark:text-stone-100 text-lg">{currentUser.last_name}</div>
           </div>
           <div>
             <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1 font-bold">نقش سازمانی</label>
             <div className="inline-block px-4 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs rounded-full font-bold border border-stone-200 dark:border-stone-700">
               {currentUser.role}
             </div>
           </div>
        </div>
      </div>

      {/* Security Form */}
      <form onSubmit={handleSave} className="glass-panel rounded-3xl shadow-lg border-0 p-8 border-t dark:border border-stone-100 dark:border-white/10 animate-item hover:shadow-xl transition-all duration-300" style={{animationDelay: '300ms'}}>
        <h2 className="font-bold text-stone-700 dark:text-stone-200 flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-stone-400" />
          تغییر اطلاعات ورود
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-600 dark:text-stone-300 mb-2">
              نام کاربری (کد ملی)
            </label>
            <input 
              type="text" 
              dir="ltr"
              className="w-full p-4 glass-input rounded-xl outline-none font-mono"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <p className="text-xs text-stone-400 mt-2">از این کد برای ورود به سیستم استفاده می‌شود.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-600 dark:text-stone-300 mb-2">
              رمز عبور جدید
            </label>
            <input 
              type="text" 
              dir="ltr"
              className="w-full p-4 glass-input rounded-xl outline-none font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-xl flex items-center gap-2 text-sm font-medium animate-item ${
            message.type === 'success' ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800'
          }`}>
            {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button 
            type="submit"
            className="bg-stone-700/90 dark:bg-stone-100/90 text-white dark:text-stone-900 px-8 py-3 rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-white/90 transition-all shadow-lg shadow-stone-400/30 dark:shadow-none flex items-center gap-2 active:scale-95 backdrop-blur-sm"
          >
            <Save className="w-5 h-5" />
            ذخیره تغییرات
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;