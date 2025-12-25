import React, { useState, useEffect } from 'react';
import { Calendar, Users, LayoutDashboard, Stethoscope, Menu, X, Briefcase, Pill, UserPlus, LogOut, Settings, ShieldAlert, FileText, Moon, Sun, Palette, ListChecks, Database } from 'lucide-react';
import BookingView from './components/BookingView';
import DoctorDashboard from './components/DoctorDashboard';
import PatientList from './components/PatientList';
import PersonnelList from './components/PersonnelList';
import MedicineList from './components/MedicineList';
import DoctorList from './components/DoctorList';
import MedicalRecordsView from './components/MedicalRecordsView';
import DatabaseView from './components/DatabaseView';
import LoginView from './components/LoginView';
import SettingsView from './components/SettingsView';
import { Personnel, ThemeType } from './types';

enum View {
  Dashboard = 'dashboard',
  Booking = 'booking',
  DoctorPanel = 'doctor_panel',
  PatientList = 'patient_list',
  MedicalRecords = 'medical_records',
  Medicines = 'medicines',
  DoctorsManagement = 'doctors_management',
  Personnel = 'personnel',
  Database = 'database',
  Settings = 'settings',
}

// Simple Welcome Component to replace the complex dashboard
const WelcomeDashboard = () => (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8 glass-panel animate-mac-window">
      <div className="w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-[32px] flex items-center justify-center mb-8 shadow-inner animate-pop">
        <Stethoscope className="w-12 h-12 text-stone-500 dark:text-stone-300" strokeWidth={1.5} />
      </div>
      <h2 className="text-4xl font-black text-stone-800 dark:text-stone-100 mb-4 tracking-tight">مطب یار</h2>
      <p className="text-stone-500 dark:text-stone-400 font-bold text-lg max-w-md leading-relaxed">
        سیستم جامع مدیریت نوبت دهی و پرونده الکترونیک
        <br/>
        <span className="text-sm opacity-70 mt-2 block font-medium">برای دسترسی به بخش‌های مختلف، از منوی سمت راست استفاده کنید.</span>
      </p>
    </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('app_dark_mode');
      return savedMode === 'true' || document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app_theme');
      return (savedTheme as ThemeType) || 'grid';
    }
    return 'grid';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('app_theme', currentTheme);
  }, [currentTheme]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'مدیر' || currentUser.role === 'منشی') {
        setCurrentView(View.Dashboard);
      } else {
        setCurrentView(View.DoctorPanel);
      }
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
        <LoginView 
            onLogin={setCurrentUser} 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleDarkMode} 
            currentTheme={currentTheme}
        />
    );
  }

  const handleGoToRecords = (patientId: number) => {
    setSelectedPatientId(patientId);
    setCurrentView(View.MedicalRecords);
  };

  const canAccessBooking = ['مدیر', 'منشی'].includes(currentUser.role);
  const canAccessManagement = currentUser.role === 'مدیر';
  
  const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 glass-panel animate-mac-window">
      <div className="bg-[#F5F5F4]/50 dark:bg-white/10 p-6 rounded-full mb-6">
        <ShieldAlert className="w-12 h-12 text-stone-400 dark:text-stone-300" />
      </div>
      <h2 className="text-3xl font-black text-stone-800 dark:text-stone-100 mb-2">عدم دسترسی</h2>
      <p className="text-stone-500 dark:text-stone-400 font-medium">شما مجوز دسترسی به این بخش را ندارید.</p>
    </div>
  );

  const goHome = () => {
    if (canAccessBooking) {
        setCurrentView(View.Dashboard);
    } else {
        setCurrentView(View.DoctorPanel);
    }
    setIsSidebarOpen(false);
    setSelectedPatientId(null);
  };

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return canAccessBooking ? <WelcomeDashboard /> : <AccessDenied />;
      case View.Booking:
        return canAccessBooking ? <BookingView /> : <AccessDenied />;
      case View.DoctorPanel:
        return <DoctorDashboard currentUser={currentUser} />;
      case View.PatientList:
        return <PatientList onViewRecords={handleGoToRecords} />;
      case View.MedicalRecords:
        return <MedicalRecordsView targetPatientId={selectedPatientId} onClearFilter={() => setSelectedPatientId(null)} currentUser={currentUser} />;
      case View.Medicines:
        return <MedicineList />;
      case View.DoctorsManagement:
        return canAccessManagement ? <DoctorList /> : <AccessDenied />;
      case View.Personnel:
        return canAccessManagement ? <PersonnelList /> : <AccessDenied />;
      case View.Database:
        return canAccessManagement ? <DatabaseView /> : <AccessDenied />;
      case View.Settings:
        return (
            <SettingsView 
                currentUser={currentUser} 
                onUpdateUser={setCurrentUser}
                currentTheme={currentTheme}
                onThemeChange={setCurrentTheme}
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
            />
        );
      default:
        return <AccessDenied />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          if (currentView !== view) {
            setCurrentView(view);
            setIsSidebarOpen(false);
            setSelectedPatientId(null);
          }
        }}
        className={`flex items-center w-full p-3.5 mb-2 transition-all duration-300 rounded-xl group relative overflow-hidden border ${
          isActive
            ? 'text-white bg-stone-800/80 border-stone-800/50 dark:bg-white/90 dark:text-black dark:border-white/50 shadow-md backdrop-blur-md' 
            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/50 dark:hover:bg-white/10 border-transparent'
        }`}
      >
        <Icon 
          className={`w-5 h-5 ml-4 transition-transform duration-500 ${isActive ? 'scale-110' : 'text-stone-400 dark:text-stone-500 group-hover:scale-110'}`} 
          strokeWidth={2} 
        />
        <span className="text-sm font-bold tracking-tight z-10">{label}</span>
      </button>
    );
  };

  const ThemeToggle = ({ className = "" }: { className?: string }) => (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-full glass-card hover:bg-white dark:hover:bg-white/20 text-stone-500 dark:text-stone-300 transition-all active:scale-95 ${className}`}
      title={isDarkMode ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}
    >
      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );

  return (
    <div 
      className={`min-h-screen flex flex-col md:flex-row overflow-hidden font-vazir relative bg-theme-${currentTheme}`}
    >
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-6 glass-panel rounded-none border-b border-white/20 sticky top-0 z-50">
        <div 
          onClick={goHome}
          className="flex items-center gap-3 font-black text-xl tracking-tight text-stone-800 dark:text-stone-100 cursor-pointer"
        >
          <div className="w-10 h-10 bg-stone-800/80 dark:bg-stone-100/80 rounded-xl flex items-center justify-center text-white dark:text-stone-900 shadow-sm backdrop-blur-sm">
             <Stethoscope className="w-5 h-5" />
          </div>
          <span>مطب یار</span>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 glass-input rounded-xl hover:bg-stone-200 dark:hover:bg-white/20 transition-colors text-stone-800 dark:text-stone-100">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar - Unified Glass Panel */}
      <aside
        className={`
          fixed md:sticky top-0 md:top-4 right-0 
          h-screen md:h-[calc(100vh-2rem)] 
          w-72 py-6 px-5 
          transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-40 flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          glass-panel
          md:mr-4
        `}
      >
        <div className="h-full w-full flex flex-col">
          {/* Logo Area */}
          <div 
            onClick={goHome}
            className="px-2 mb-10 mt-2 flex items-center gap-4 cursor-pointer group select-none"
            title="بازگشت به داشبورد"
          >
            <div className="w-12 h-12 bg-[#292524]/80 dark:bg-stone-100/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 backdrop-blur-sm">
              <Stethoscope className="w-6 h-6 text-white dark:text-stone-900" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter text-stone-800 dark:text-stone-100 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">مطب یار</h1>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest opacity-80">نسخه ۴.۵</span>
            </div>
          </div>

          {/* User Widget */}
          <div className="mb-8 glass-card p-4 rounded-2xl flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center text-stone-700 dark:text-stone-100 font-black text-sm shadow-sm border border-stone-100 dark:border-white/5">
                {currentUser.first_name[0]}
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm truncate">{currentUser.first_name} {currentUser.last_name}</p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 font-bold tracking-wide">{currentUser.role}</p>
             </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-1 pl-1">
            <div>
              <div className="text-[11px] font-bold text-stone-400 dark:text-stone-500 mb-3 px-4 uppercase tracking-widest">عمومی</div>
              {canAccessBooking && <NavItem view={View.Dashboard} icon={LayoutDashboard} label="داشبورد" />}
              {canAccessBooking && <NavItem view={View.Booking} icon={Calendar} label="نوبت دهی" />}
              <NavItem view={View.DoctorPanel} icon={ListChecks} label="لیست نوبت‌ها" />
            </div>
            
            <div>
              <div className="text-[11px] font-bold text-stone-400 dark:text-stone-500 mb-3 px-4 uppercase tracking-widest">پرونده‌ها</div>
              <NavItem view={View.PatientList} icon={Users} label="بیماران" />
              <NavItem view={View.MedicalRecords} icon={FileText} label="سوابق پزشکی" />
            </div>

            <div>
               <div className="text-[11px] font-bold text-stone-400 dark:text-stone-500 mb-3 px-4 uppercase tracking-widest">خدمات</div>
               <NavItem view={View.Medicines} icon={Pill} label="داروخانه" />
            </div>
            
            {canAccessManagement && (
              <div>
                <div className="text-[11px] font-bold text-stone-400 dark:text-stone-500 mb-3 px-4 uppercase tracking-widest">مدیریت</div>
                <NavItem view={View.DoctorsManagement} icon={UserPlus} label="پزشکان" />
                <NavItem view={View.Personnel} icon={Briefcase} label="پرسنل" />
                <NavItem view={View.Database} icon={Database} label="دیتابیس (SQL)" />
              </div>
            )}
          </nav>

          {/* Footer Actions */}
          <div className="mt-4 pt-4 border-t border-stone-200/50 dark:border-white/10 space-y-2">
             <NavItem view={View.Settings} icon={Settings} label="تنظیمات" />
             <button 
               onClick={() => setCurrentUser(null)}
               className="flex items-center w-full p-3.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all text-sm font-bold border border-transparent"
             >
                <LogOut className="w-5 h-5 ml-4" />
                <span>خروج از حساب</span>
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 relative z-10 custom-scrollbar">
         {/* Desktop Theme Toggle */}
         <div className="hidden md:block absolute top-6 left-6 z-50">
            <ThemeToggle />
         </div>

         {renderView()}
      </main>

    </div>
  );
};

export default App;