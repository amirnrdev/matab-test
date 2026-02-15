import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  LayoutDashboard, 
  Stethoscope, 
  Menu, 
  Briefcase, 
  Pill, 
  LogOut, 
  Settings, 
  FileText, 
  Moon, 
  Sun, 
  Database, 
  Activity, 
  CalendarCheck 
} from 'lucide-react';
import BookingView from './components/BookingView';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import PatientList from './components/PatientList';
import PersonnelList from './components/PersonnelList';
import MedicineList from './components/MedicineList';
import DoctorList from './components/DoctorList';
import MedicalRecordsView from './components/MedicalRecordsView';
import DatabaseView from './components/DatabaseView';
import LoginView from './components/LoginView';
import SettingsView from './components/SettingsView';
import LandingPage from './components/LandingPage';
import AppointmentList from './components/AppointmentList';
import { Personnel, ThemeType, Appointment, Doctor, Patient, View } from './types';
import { db } from './services/mockDb';

// --- REDESIGNED MENU BUTTON COMPONENT ---
const MenuButton = ({ active, onClick, icon: Icon, label, visible = true }: any) => {
  if (!visible) return null;
  return (
    <button 
      onClick={onClick}
      className={`
        w-full p-3.5 mb-2 rounded-[20px] flex items-center justify-center lg:justify-start gap-3 transition-all duration-500 group relative overflow-hidden
        ${active 
          ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xl shadow-stone-400/20 dark:shadow-none scale-105' 
          : 'text-stone-500 dark:text-stone-400 hover:bg-white/60 dark:hover:bg-white/10 hover:text-stone-800 dark:hover:text-stone-200'}
      `}
    >
      <div className={`
        relative z-10 p-1.5 rounded-xl transition-all duration-300
        ${active ? 'bg-white/20 dark:bg-black/10' : 'bg-transparent group-hover:bg-stone-200/50 dark:group-hover:bg-white/5'}
      `}>
        <Icon className={`w-5 h-5 ${active ? '' : 'opacity-70 group-hover:opacity-100'}`} strokeWidth={active ? 2.5 : 2} />
      </div>
      
      <span className={`
        font-bold text-sm hidden lg:inline relative z-10 transition-all duration-300
        ${active ? 'tracking-wide' : ''}
      `}>
        {label}
      </span>
      
      {/* Active Indicator Glow */}
      {active && (
         <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
      )}
    </button>
  );
};

// --- MOBILE NAVIGATION COMPONENTS ---
const MobileNavButton = ({ active, onClick, icon: Icon }: any) => (
  <button 
    onClick={onClick}
    className={`p-3.5 rounded-[22px] transition-all duration-300 flex items-center justify-center ${active ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xl scale-110' : 'text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-white/5'}`}
  >
    <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
  </button>
);

const MobileMenuCard = ({ label, icon: Icon, onClick, active }: any) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${active ? 'bg-white dark:bg-stone-800 shadow-md border border-stone-100 dark:border-white/5' : 'bg-stone-100/50 dark:bg-white/5 hover:bg-white dark:hover:bg-stone-800'}`}
  >
    <div className={`p-3 rounded-full ${active ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900' : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400'}`}>
        <Icon className="w-6 h-6" />
    </div>
    <span className={`text-xs font-bold ${active ? 'text-stone-800 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}>{label}</span>
  </button>
);

// --- APP COMPONENT ---
const App = () => {
  const [view, setView] = useState<View>(View.Landing);
  const [user, setUser] = useState<Personnel | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState<ThemeType>('grid');
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Specific State for passing data between views
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState({
    appointments: [] as Appointment[],
    doctors: [] as Doctor[],
    patients: [] as Patient[],
    loading: false
  });

  // Load Dashboard Data
  useEffect(() => {
    if (view === View.Dashboard) {
      loadDashboardData();
    }
  }, [view]);

  const loadDashboardData = async () => {
    setDashboardData(prev => ({ ...prev, loading: true }));
    try {
      const [appts, docs, pats] = await Promise.all([
        db.getAppointments(),
        db.getDoctors(),
        db.getPatients()
      ]);
      setDashboardData({
        appointments: appts,
        doctors: docs,
        patients: pats,
        loading: false
      });
    } catch (e) {
      console.error(e);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Navigation Guard
  const navigateTo = (v: View) => {
    setView(v);
  };

  const handleLogin = (loggedInUser: Personnel) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'پزشک') {
      navigateTo(View.DoctorPanel);
    } else {
      navigateTo(View.Dashboard);
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigateTo(View.Landing);
    setIsMobileMenuOpen(false);
  };

  // Render Logic
  if (view === View.Landing) {
    return (
      <div className={`min-h-screen font-vazir bg-theme-${theme} ${isDarkMode ? 'dark' : ''} transition-colors duration-500 relative`} dir="rtl">
        <div className="absolute top-6 left-6 z-50">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full glass-card hover:bg-white dark:hover:bg-white/20 text-stone-500 dark:text-stone-300 transition-all active:scale-95"
                title={isDarkMode ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}
            >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
        </div>
        <LandingPage onLogin={() => setView(View.Login)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>
    );
  }

  if (view === View.Login) {
    return <LoginView onLogin={handleLogin} onBack={() => setView(View.Landing)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentTheme={theme} />;
  }

  // Layout for authenticated views
  return (
    <div className={`min-h-screen transition-colors duration-500 bg-theme-${theme} ${isDarkMode ? 'dark' : ''}`} dir="rtl">
       
       {/* Mobile Header */}
       <div className="md:hidden pt-6 px-6 flex justify-between items-center animate-fade-in-up">
            <button 
              onClick={() => navigateTo(View.Dashboard)}
              className="flex items-center gap-3 transition-transform active:scale-95"
            >
               <div className="w-10 h-10 bg-stone-800 dark:bg-stone-100 rounded-[14px] flex items-center justify-center text-white dark:text-stone-900 shadow-lg">
                   <Stethoscope className="w-5 h-5" />
               </div>
               <h1 className="font-black text-xl text-stone-800 dark:text-stone-100">مطب یار</h1>
            </button>
            <button onClick={toggleTheme} className="p-2.5 glass-card rounded-full text-stone-600 dark:text-stone-300 shadow-sm active:scale-95 transition-transform">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
       </div>

       {/* Sidebar & Content Layout - UPDATED: Added padding and gap for floating effect */}
       <div className="flex h-[calc(100vh-80px)] md:h-screen overflow-hidden md:p-6 gap-6">
          
          {/* REDESIGNED SIDEBAR (Desktop) - UPDATED: h-full and removed margins */}
          <aside className="w-20 lg:w-72 glass-panel hidden md:flex flex-col rounded-[40px] border border-white/40 dark:border-white/5 shadow-2xl shadow-stone-400/10 dark:shadow-black/40 relative overflow-hidden backdrop-blur-2xl h-full transition-all duration-300 hover:shadow-3xl z-20">
             
             {/* Decorative Top Gradient */}
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-stone-200/50 to-transparent dark:from-white/5 pointer-events-none"></div>

             {/* Header */}
             <div className="p-8 pb-4 flex flex-col items-center gap-4 relative z-10">
                <div className="w-16 h-16 bg-stone-800 dark:bg-stone-100 rounded-[24px] flex items-center justify-center text-white dark:text-stone-900 shadow-2xl shadow-stone-500/30 dark:shadow-none group cursor-pointer hover:rotate-6 transition-transform duration-500">
                   <Stethoscope className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <div className="hidden lg:block text-center space-y-1">
                   <h1 className="font-black text-2xl text-stone-800 dark:text-stone-100 tracking-tight">مطب یار</h1>
                   <div className="inline-block px-3 py-1 rounded-full bg-stone-100/80 dark:bg-white/10 border border-stone-200 dark:border-white/5">
                      <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">پنل مدیریت</p>
                   </div>
                </div>
             </div>
             
             {/* Divider */}
             <div className="mx-8 h-px bg-stone-200/50 dark:bg-white/10 mb-4"></div>

             {/* Nav - UPDATED: Removed custom-scrollbar, added no-scrollbar */}
             <nav className="flex-1 px-4 lg:px-6 space-y-1 overflow-y-auto no-scrollbar relative z-10">
                
                {/* Section: General */}
                <div className="mb-6">
                    <p className="px-4 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2 opacity-70">عمومی</p>
                    <MenuButton 
                      active={view === View.Dashboard} 
                      onClick={() => navigateTo(View.Dashboard)} 
                      icon={LayoutDashboard} 
                      label="داشبورد" 
                      visible={user?.role === 'مدیر' || user?.role === 'منشی'}
                    />
                    <MenuButton 
                      active={view === View.DoctorPanel} 
                      onClick={() => navigateTo(View.DoctorPanel)} 
                      icon={Activity} 
                      label="پنل پزشک" 
                      visible={user?.role === 'پزشک'} 
                    />
                </div>
                
                {/* Section: Booking (Only Non-Doctors) */}
                {(user?.role !== 'پزشک') && (
                  <div className="mb-6">
                    <p className="px-4 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2 opacity-70">نوبت دهی</p>
                    <MenuButton 
                      active={view === View.BookingAdmin} 
                      onClick={() => navigateTo(View.BookingAdmin)} 
                      icon={Calendar} 
                      label="رزرو نوبت جدید" 
                      visible={true} 
                    />
                    <MenuButton 
                      active={view === View.AppointmentList} 
                      onClick={() => navigateTo(View.AppointmentList)} 
                      icon={CalendarCheck} 
                      label="لیست نوبت‌ها" 
                      visible={true} 
                    />
                  </div>
                )}

                {/* Section: Patients */}
                <div className="mb-6">
                    <p className="px-4 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2 opacity-70">بیماران</p>
                    <MenuButton 
                      active={view === View.PatientList} 
                      onClick={() => navigateTo(View.PatientList)} 
                      icon={Users} 
                      label="لیست بیماران" 
                    />
                    <MenuButton 
                      active={view === View.MedicalRecords} 
                      onClick={() => navigateTo(View.MedicalRecords)} 
                      icon={FileText} 
                      label="پرونده‌های پزشکی" 
                    />
                </div>

                {/* Section: Management (Admin Only) */}
                {(user?.role === 'مدیر') && (
                  <div className="mb-6">
                    <p className="px-4 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2 opacity-70">مدیریت کلینیک</p>
                    <MenuButton 
                      active={view === View.DoctorsManagement} 
                      onClick={() => navigateTo(View.DoctorsManagement)} 
                      icon={Stethoscope} 
                      label="پزشکان" 
                      visible={true} 
                    />
                    <MenuButton 
                      active={view === View.Personnel} 
                      onClick={() => navigateTo(View.Personnel)} 
                      icon={Briefcase} 
                      label="پرسنل" 
                      visible={true} 
                    />
                  </div>
                )}

                {/* Section: Pharmacy (Admin/Doctor) */}
                {(user?.role === 'مدیر' || user?.role === 'پزشک') && (
                   <div className="mb-6">
                     <p className="px-4 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2 opacity-70">داروخانه</p>
                     <MenuButton 
                       active={view === View.Medicines} 
                       onClick={() => navigateTo(View.Medicines)} 
                       icon={Pill} 
                       label="لیست داروها" 
                       visible={true} 
                    />
                   </div>
                )}

                {/* Section: System */}
                <div className="mb-6">
                    <p className="px-4 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2 opacity-70">سیستم</p>
                    <MenuButton 
                      active={view === View.Settings} 
                      onClick={() => navigateTo(View.Settings)} 
                      icon={Settings} 
                      label="تنظیمات" 
                    />
                    <MenuButton 
                       active={view === View.Database} 
                       onClick={() => navigateTo(View.Database)} 
                       icon={Database} 
                       label="دیتابیس" 
                       visible={user?.role === 'مدیر'} 
                    />
                </div>
             </nav>

             {/* User / Logout */}
             <div className="p-4 lg:p-6 relative z-10">
                <div className="glass-card p-1 rounded-[24px] border border-stone-200/50 dark:border-white/5 bg-white/30 dark:bg-black/20">
                    <button onClick={handleLogout} className="w-full p-3.5 rounded-[20px] flex items-center justify-center lg:justify-start gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-300 group font-bold text-sm">
                        <div className="w-9 h-9 rounded-xl bg-red-100/50 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <span className="hidden lg:inline group-hover:tracking-wide transition-all">خروج از حساب</span>
                    </button>
                </div>
             </div>
          </aside>

          {/* Main View Area - UPDATED: h-full, rounded corners, padding tweaks */}
          <main className="flex-1 h-full overflow-y-auto rounded-[40px] relative custom-scrollbar pb-32 md:pb-0 pl-1 pr-1">
             
             {view === View.Dashboard && (
               <AdminDashboard 
                 appointments={dashboardData.appointments}
                 doctors={dashboardData.doctors}
                 patients={dashboardData.patients}
                 loading={dashboardData.loading}
                 onNavigate={navigateTo}
               />
             )}
             
             {view === View.DoctorPanel && user && <DoctorDashboard currentUser={user} />}
             
             {view === View.BookingAdmin && <BookingView />}

             {view === View.AppointmentList && <AppointmentList />}
             
             {view === View.PatientList && (
               <PatientList onViewRecords={(pid) => {
                  setSelectedPatientId(pid);
                  navigateTo(View.MedicalRecords);
               }} />
             )}

             {view === View.MedicalRecords && user && (
                <MedicalRecordsView 
                  targetPatientId={selectedPatientId} 
                  onClearFilter={() => setSelectedPatientId(null)}
                  currentUser={user} 
                />
             )}

             {view === View.Personnel && <PersonnelList />}
             {view === View.Medicines && <MedicineList />}
             {view === View.DoctorsManagement && <DoctorList />}
             {view === View.Database && <DatabaseView />}
             {view === View.Settings && user && (
                <SettingsView 
                  currentUser={user} 
                  onUpdateUser={setUser} 
                  currentTheme={theme} 
                  onThemeChange={setTheme}
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={toggleTheme}
                />
             )}
          </main>
       </div>

        {/* Mobile Floating Nav (Bottom) */}
        <div className="md:hidden fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none">
           <div className="glass-panel p-2 flex items-center gap-2 shadow-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[28px] pointer-events-auto scale-100 animate-fade-in-up">
               <MobileNavButton active={view === View.Dashboard} onClick={() => navigateTo(View.Dashboard)} icon={LayoutDashboard} />
               <MobileNavButton active={view === View.BookingAdmin} onClick={() => navigateTo(View.BookingAdmin)} icon={Calendar} />
               <MobileNavButton active={view === View.PatientList} onClick={() => navigateTo(View.PatientList)} icon={Users} />
               
               <div className="w-px h-6 bg-stone-300 dark:bg-stone-700 mx-1"></div>
               
               <button 
                 onClick={() => setIsMobileMenuOpen(true)}
                 className="p-3.5 rounded-[20px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
               >
                  <Menu className="w-6 h-6" />
               </button>
           </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden animate-fade-in-up" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="absolute bottom-0 left-0 right-0 bg-[#f5f5f4] dark:bg-[#1c1917] rounded-t-[32px] p-6 max-h-[80vh] overflow-y-auto shadow-2xl border-t border-white/20" onClick={e => e.stopPropagation()}>
                   <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-6"></div>
                   
                   <div className="space-y-6">
                      
                      {/* Section: General */}
                      <div>
                         <p className="px-1 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2 opacity-70">عمومی</p>
                         <div className="grid grid-cols-2 gap-3">
                            <MobileMenuCard label="داشبورد" icon={LayoutDashboard} onClick={() => { navigateTo(View.Dashboard); setIsMobileMenuOpen(false); }} active={view === View.Dashboard} />
                            {user?.role === 'پزشک' && <MobileMenuCard label="پنل پزشک" icon={Activity} onClick={() => { navigateTo(View.DoctorPanel); setIsMobileMenuOpen(false); }} active={view === View.DoctorPanel} />}
                         </div>
                      </div>

                      {/* Section: Booking */}
                      {(user?.role !== 'پزشک') && (
                        <div>
                           <p className="px-1 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2 opacity-70">نوبت دهی</p>
                           <div className="grid grid-cols-2 gap-3">
                              <MobileMenuCard label="رزرو جدید" icon={Calendar} onClick={() => { navigateTo(View.BookingAdmin); setIsMobileMenuOpen(false); }} active={view === View.BookingAdmin} />
                              <MobileMenuCard label="لیست نوبت‌ها" icon={CalendarCheck} onClick={() => { navigateTo(View.AppointmentList); setIsMobileMenuOpen(false); }} active={view === View.AppointmentList} />
                           </div>
                        </div>
                      )}

                      {/* Section: Patients */}
                      <div>
                         <p className="px-1 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2 opacity-70">بیماران</p>
                         <div className="grid grid-cols-2 gap-3">
                            <MobileMenuCard label="بیماران" icon={Users} onClick={() => { navigateTo(View.PatientList); setIsMobileMenuOpen(false); }} active={view === View.PatientList} />
                            <MobileMenuCard label="پرونده‌ها" icon={FileText} onClick={() => { navigateTo(View.MedicalRecords); setIsMobileMenuOpen(false); }} active={view === View.MedicalRecords} />
                         </div>
                      </div>

                      {/* Section: Management */}
                      {(user?.role === 'مدیر' || user?.role === 'پزشک') && (
                         <div>
                            <p className="px-1 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2 opacity-70">مدیریت</p>
                            <div className="grid grid-cols-2 gap-3">
                               {user?.role === 'مدیر' && <MobileMenuCard label="پزشکان" icon={Stethoscope} onClick={() => { navigateTo(View.DoctorsManagement); setIsMobileMenuOpen(false); }} active={view === View.DoctorsManagement} />}
                               {user?.role === 'مدیر' && <MobileMenuCard label="پرسنل" icon={Briefcase} onClick={() => { navigateTo(View.Personnel); setIsMobileMenuOpen(false); }} active={view === View.Personnel} />}
                               <MobileMenuCard label="داروخانه" icon={Pill} onClick={() => { navigateTo(View.Medicines); setIsMobileMenuOpen(false); }} active={view === View.Medicines} />
                            </div>
                         </div>
                      )}

                      {/* Section: System */}
                      <div>
                         <p className="px-1 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2 opacity-70">سیستم</p>
                         <div className="grid grid-cols-2 gap-3">
                            <MobileMenuCard label="تنظیمات" icon={Settings} onClick={() => { navigateTo(View.Settings); setIsMobileMenuOpen(false); }} active={view === View.Settings} />
                            {user?.role === 'مدیر' && <MobileMenuCard label="دیتابیس" icon={Database} onClick={() => { navigateTo(View.Database); setIsMobileMenuOpen(false); }} active={view === View.Database} />}
                         </div>
                      </div>

                   </div>

                   <button onClick={handleLogout} className="w-full mt-8 p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-2xl font-bold flex items-center justify-center gap-2">
                       <LogOut className="w-5 h-5" />
                       خروج از حساب کاربری
                   </button>
                </div>
            </div>
        )}

    </div>
  );
};

export default App;