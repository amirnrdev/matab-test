import React from 'react';
import { Appointment, Doctor, Patient, View } from '../types';
import { 
  Calendar, 
  TrendingUp, 
  Stethoscope, 
  Users, 
  ListChecks, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Activity, 
  UserPlus 
} from 'lucide-react';

interface AdminDashboardProps {
  appointments: Appointment[];
  doctors: Doctor[];
  patients: Patient[];
  loading: boolean;
  onNavigate: (view: View) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  appointments, 
  doctors, 
  patients, 
  loading,
  onNavigate 
}) => {
  
  // Helpers
  const d = new Date();
  const todayDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  const todayName = days[d.getDay()];

  // Stats Calculations
  const todayAppointments = appointments.filter(a => a.reserved_date === todayDate);
  const pendingToday = todayAppointments.filter(a => a.status === 'Pending').length;
  
  // Future Appointments (Date > Today)
  const futureAppointments = appointments.filter(a => a.reserved_date > todayDate).length;

  // Doctors present today
  const doctorsOnDuty = doctors.filter(doc => doc.work_days.includes(todayName));

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, delay }: any) => (
    <div className="glass-card p-4 md:p-6 rounded-[20px] md:rounded-[24px] flex flex-col justify-between h-32 md:h-36 animate-item active:scale-95 transition-all duration-200 relative overflow-hidden touch-manipulation" style={{ animationDelay: delay }}>
       <div className={`absolute top-0 left-0 w-1 h-full ${colorClass.split(' ')[0].replace('bg-', 'bg-')}`}></div>
       <div className="flex justify-between items-start">
          <div>
             <p className="text-stone-500 dark:text-stone-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 truncate">{title}</p>
             <h3 className="text-2xl md:text-3xl font-black text-stone-800 dark:text-stone-100 font-mono tracking-tight">
                {loading ? '...' : value}
             </h3>
          </div>
          <div className={`p-2.5 md:p-3 rounded-2xl ${colorClass} shadow-inner`}>
             <Icon className="w-5 h-5 md:w-6 md:h-6" />
          </div>
       </div>
       {subtitle && (
         <div className="flex items-center gap-1 text-[10px] md:text-[11px] font-bold text-stone-400 mt-2 truncate">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span>{subtitle}</span>
         </div>
       )}
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto pb-24 md:pb-10">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-end gap-4 animate-mac-window">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-stone-800 dark:text-stone-100 tracking-tighter mb-2">داشبورد عملیاتی</h1>
            <p className="text-stone-500 dark:text-stone-400 font-bold text-xs md:text-sm flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               سیستم فعال | {new Date().toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
       </div>

       {/* Top Metrics Grid - Mobile Optimized (2 cols) */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard 
            title="نوبت‌های امروز" 
            value={todayAppointments.length}
            subtitle={`${pendingToday} نوبت در انتظار`} 
            icon={Calendar} 
            colorClass="bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
            delay="100ms"
          />
          <StatCard 
            title="نوبت‌های آتی" 
            value={futureAppointments}
            subtitle="رزرو شده"
            icon={TrendingUp} 
            colorClass="bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300"
            delay="200ms"
          />
           <StatCard 
            title="پزشکان حاضر" 
            value={doctorsOnDuty.length}
            subtitle={`از ${doctors.length} پزشک`}
            icon={Stethoscope} 
            colorClass="bg-purple-100/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300"
            delay="300ms"
          />
          <StatCard 
            title="کل پرونده‌ها" 
            value={patients.length} 
            subtitle="ثبت شده"
            icon={Users} 
            colorClass="bg-amber-100/50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300"
            delay="400ms"
          />
       </div>

       {/* Main Content Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Left: Today's Timeline */}
          <div className="lg:col-span-2 glass-panel p-4 md:p-6 rounded-[24px] md:rounded-[32px] animate-item h-full" style={{ animationDelay: '500ms' }}>
             <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="font-bold text-lg md:text-xl text-stone-800 dark:text-stone-100 flex items-center gap-2">
                   <ListChecks className="w-5 h-5 text-stone-400" />
                   وضعیت نوبت‌های امروز
                </h3>
                <span className="text-xs font-bold text-stone-400 bg-stone-100 dark:bg-white/5 px-3 py-1 rounded-full">
                   {todayAppointments.length} مورد
                </span>
             </div>

             <div className="space-y-3">
                {todayAppointments.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-8 md:py-12 text-stone-400 opacity-50">
                      <Calendar className="w-10 h-10 md:w-12 md:h-12 mb-2" />
                      <p className="text-xs md:text-sm font-bold">امروز نوبتی ثبت نشده است</p>
                   </div>
                ) : (
                   todayAppointments.sort((a,b) => a.reserved_time.localeCompare(b.reserved_time)).map((appt, idx) => (
                      <div key={idx} className="glass-card p-3 md:p-4 rounded-2xl flex items-center gap-3 md:gap-4 active:bg-stone-100 dark:active:bg-white/10 transition-colors group touch-manipulation">
                         <div className={`
                            w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex flex-col items-center justify-center shadow-inner font-bold border shrink-0
                            ${appt.status === 'Completed' ? 'bg-green-100/30 text-green-700 border-green-200/50' : 
                              appt.status === 'Canceled' ? 'bg-red-100/30 text-red-700 border-red-200/50' :
                              'bg-stone-100/50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200/50 dark:border-white/10'}
                         `}>
                            <span className="text-base md:text-lg leading-none">{appt.reserved_time.split(':')[0]}</span>
                            <span className="text-[10px] md:text-xs opacity-70">:{appt.reserved_time.split(':')[1]}</span>
                         </div>
                         
                         <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm md:text-base text-stone-800 dark:text-stone-100 truncate">{appt.patient?.first_name} {appt.patient?.last_name}</h4>
                            <div className="flex items-center gap-2 text-[10px] md:text-xs text-stone-500 dark:text-stone-400 mt-0.5 md:mt-1 truncate">
                               <Stethoscope className="w-3 h-3 shrink-0" />
                               <span className="truncate">{appt.doctor?.last_name}</span>
                            </div>
                         </div>

                         <div className={`px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1
                            ${appt.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
                              appt.status === 'Canceled' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                              'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'}
                         `}>
                            {appt.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : 
                             appt.status === 'Canceled' ? <AlertCircle className="w-3 h-3" /> :
                             <Clock className="w-3 h-3" />}
                            <span className="hidden sm:inline">{appt.status === 'Pending' ? 'منتظر' : appt.status === 'Completed' ? 'انجام شد' : 'لغو'}</span>
                         </div>
                      </div>
                   ))
                )}
             </div>
          </div>

          {/* Right: Doctors & Quick Actions */}
          <div className="space-y-4 md:space-y-6">
             
             {/* Doctors On Duty */}
             <div className="glass-panel p-4 md:p-6 rounded-[24px] md:rounded-[32px] animate-item" style={{ animationDelay: '600ms' }}>
                <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
                   <Stethoscope className="w-5 h-5 text-purple-500" />
                   شیفت امروز
                </h3>
                <div className="space-y-3">
                   {doctorsOnDuty.length === 0 ? (
                      <p className="text-xs text-stone-400 text-center py-4">پزشکی برای امروز تعریف نشده است.</p>
                   ) : (
                      doctorsOnDuty.map(doc => (
                         <div key={doc.doctor_id} className="flex items-center gap-3 p-3 rounded-2xl border border-stone-100 dark:border-white/5 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors touch-manipulation">
                            <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 font-bold text-xs shrink-0">
                               Dr
                            </div>
                            <div className="flex-1 min-w-0">
                               <h5 className="font-bold text-sm text-stone-800 dark:text-stone-100 truncate">{doc.last_name}</h5>
                               <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{doc.specialty}</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse shrink-0"></div>
                         </div>
                      ))
                   )}
                </div>
             </div>

             {/* Quick Actions - Optimized for Mobile (Grid on small screens) */}
             <div className="glass-panel p-4 md:p-6 rounded-[24px] md:rounded-[32px] animate-item" style={{ animationDelay: '700ms' }}>
                 <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
                   <Activity className="w-5 h-5 text-rose-500" />
                   عملیات سریع
                 </h3>
                 <div className="grid grid-cols-2 md:flex md:flex-col gap-3">
                    <button 
                      onClick={() => onNavigate(View.PatientList)}
                      className="group w-full glass-card hover:bg-blue-50 dark:hover:bg-blue-900/20 p-4 rounded-2xl flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-4 transition-all active:scale-95 border-b-4 md:border-b-0 md:border-l-4 border-blue-500 touch-manipulation"
                    >
                       <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform">
                          <UserPlus className="w-5 h-5" />
                       </div>
                       <div className="text-center md:text-right">
                          <span className="block font-bold text-stone-800 dark:text-stone-100 text-sm">بیمار جدید</span>
                          <span className="hidden md:block text-[10px] text-stone-500 dark:text-stone-400">ثبت پرونده و پذیرش</span>
                       </div>
                    </button>

                    <button 
                      onClick={() => onNavigate(View.BookingAdmin)}
                      className="group w-full glass-card hover:bg-orange-50 dark:hover:bg-orange-900/20 p-4 rounded-2xl flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-4 transition-all active:scale-95 border-b-4 md:border-b-0 md:border-l-4 border-orange-500 touch-manipulation"
                    >
                       <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-300 group-hover:scale-110 transition-transform">
                          <Calendar className="w-5 h-5" />
                       </div>
                       <div className="text-center md:text-right">
                          <span className="block font-bold text-stone-800 dark:text-stone-100 text-sm">رزرو نوبت</span>
                          <span className="hidden md:block text-[10px] text-stone-500 dark:text-stone-400">نوبت دهی جدید</span>
                       </div>
                    </button>
                 </div>
             </div>

          </div>
       </div>
    </div>
  );
};

export default AdminDashboard;