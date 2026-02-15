import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../services/mockDb';
import { Appointment, AppointmentStatus } from '../types';
import { Search, Calendar, User, Clock, Stethoscope, CheckCircle2, XCircle, AlertCircle, Hash, History, ListChecks, ChevronDown, ChevronUp } from 'lucide-react';

const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  // Sections toggle state
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    const data = await db.getAppointments();
    setAppointments(data);
    if (!silent) setLoading(false);
  };

  const handleStatusChange = async (id: number, newStatus: AppointmentStatus) => {
    const confirmMessage = newStatus === AppointmentStatus.Completed 
        ? 'آیا از اتمام این نوبت اطمینان دارید؟' 
        : 'آیا از لغو این نوبت اطمینان دارید؟';
        
    if (window.confirm(confirmMessage)) {
        setProcessingId(id);
        try {
            // 1. Optimistic Update (Immediate UI change)
            setAppointments(prev => prev.map(a => 
                a.appointment_id === id ? { ...a, status: newStatus } : a
            ));

            // 2. Actual DB Update
            await db.updateAppointmentStatus(id, newStatus);
            
            // 3. Silent Refresh to ensure consistency
            loadData(true);
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert on error by reloading
            loadData(true);
        } finally {
            setProcessingId(null);
        }
    }
  };

  // Filter Data directly in render (Derived State) to avoid sync issues
  const filteredAppts = useMemo(() => {
    let result = appointments;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(a => 
        a.patient?.last_name.includes(searchTerm) ||
        a.patient?.national_code.includes(searchTerm) ||
        a.doctor?.last_name.includes(searchTerm) ||
        a.tracking_code.toLowerCase().includes(lowerTerm)
      );
    }

    if (dateFilter) {
       result = result.filter(a => a.reserved_date === dateFilter);
    }

    return result;
  }, [appointments, searchTerm, dateFilter]);

  const getStatusConfig = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Pending:
        return { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', icon: Clock, label: 'در انتظار' };
      case AppointmentStatus.Completed:
        return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2, label: 'انجام شده' };
      case AppointmentStatus.Canceled:
        return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: XCircle, label: 'لغو شده' };
      case AppointmentStatus.NoShow:
        return { color: 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300', icon: AlertCircle, label: 'عدم حضور' };
      default:
        return { color: 'bg-stone-100 text-stone-600', icon: Clock, label: status };
    }
  };

  // Split Data
  const pendingAppointments = filteredAppts.filter(a => a.status === AppointmentStatus.Pending);
  const historyAppointments = filteredAppts.filter(a => a.status !== AppointmentStatus.Pending);

  const renderCard = (appt: Appointment) => {
    const statusConfig = getStatusConfig(appt.status);
    const StatusIcon = statusConfig.icon;
    const isProcessing = processingId === appt.appointment_id;

    return (
      <div 
        key={appt.appointment_id}
        className={`glass-card glass-hover p-5 rounded-[28px] flex flex-col justify-between group relative overflow-hidden ${appt.status !== AppointmentStatus.Pending ? 'opacity-90 grayscale-[0.3]' : ''}`}
      >
         {/* Top Row: Date & Time */}
         <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-stone-100/50 dark:bg-stone-800/50 flex flex-col items-center justify-center text-stone-700 dark:text-stone-300 shadow-inner border border-white dark:border-white/5">
                  <span className="text-lg font-black leading-none">{appt.reserved_time}</span>
               </div>
               <div>
                  <span className="block text-xs text-stone-400 font-bold mb-0.5">تاریخ نوبت</span>
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-200 tracking-wider dir-ltr">{appt.reserved_date}</span>
               </div>
            </div>
            
            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 ${statusConfig.color}`}>
               <StatusIcon className="w-3.5 h-3.5" />
               {statusConfig.label}
            </div>
         </div>

         {/* Middle: Patient & Doctor */}
         <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                  <User className="w-4 h-4" />
               </div>
               <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-100 truncate">
                     {appt.patient?.first_name} {appt.patient?.last_name}
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono truncate">
                     {appt.patient?.national_code}
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                  <Stethoscope className="w-4 h-4" />
               </div>
               <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-100 truncate">
                     دکتر {appt.doctor?.last_name}
                  </div>
                  <div className="text-[10px] text-stone-500 truncate">
                     {appt.doctor?.specialty}
                  </div>
               </div>
            </div>
         </div>

         {/* Footer: Tracking Code & Actions */}
         <div className="pt-3 border-t border-stone-100 dark:border-white/5">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-stone-400 font-bold">کد پیگیری</span>
                <div className="flex items-center gap-1 bg-stone-100/50 dark:bg-black/20 px-2 py-1 rounded-lg text-xs font-mono font-bold text-stone-600 dark:text-stone-400">
                   <Hash className="w-3 h-3 opacity-50" />
                   {appt.tracking_code}
                </div>
            </div>

            {/* Action Buttons (Only for Pending) */}
            {appt.status === AppointmentStatus.Pending && (
               <div className="flex gap-2 mt-2">
                   <button 
                     disabled={isProcessing}
                     onClick={(e) => {
                         e.stopPropagation();
                         handleStatusChange(appt.appointment_id, AppointmentStatus.Completed);
                     }}
                     className={`flex-1 bg-stone-900 hover:bg-black text-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                     {isProcessing ? (
                        <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                     ) : (
                        <>
                           <CheckCircle2 className="w-3.5 h-3.5" />
                           اتمام نوبت
                        </>
                     )}
                   </button>
                   <button 
                     disabled={isProcessing}
                     onClick={(e) => {
                         e.stopPropagation();
                         handleStatusChange(appt.appointment_id, AppointmentStatus.Canceled);
                     }}
                     className={`px-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl transition-all active:scale-95 border border-red-100 dark:border-red-800/30 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                     title="لغو نوبت"
                   >
                     <XCircle className="w-4 h-4" />
                   </button>
               </div>
            )}
            
            {/* Status Message for Completed/Canceled */}
            {appt.status !== AppointmentStatus.Pending && (
                <div className={`mt-2 text-center text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-2 ${
                    appt.status === AppointmentStatus.Completed 
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                    {appt.status === AppointmentStatus.Completed ? <CheckCircle2 className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                    {appt.status === AppointmentStatus.Completed ? 'تکمیل شده' : 'لغو شده'}
                </div>
            )}
         </div>

      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 animate-item">
        <div>
           <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-3 drop-shadow-sm">
             <div className="bg-stone-200/50 dark:bg-stone-800/50 p-2 rounded-xl text-stone-600 dark:text-stone-300 backdrop-blur-sm">
                <Calendar className="w-6 h-6" />
             </div>
             لیست جامع نوبت‌ها
           </h1>
           <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 font-medium">مدیریت نوبت‌های فعال و سوابق</p>
        </div>
      </div>

      {/* Filters Container */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center animate-item" style={{animationDelay: '100ms'}}>
         <div className="relative w-full md:flex-1 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5 group-focus-within:text-stone-600 dark:group-focus-within:text-stone-200 transition-colors" />
            <input 
              type="text" 
              placeholder="جستجو..." 
              className="w-full pr-12 pl-4 py-3 glass-input rounded-xl outline-none text-sm transition-all text-stone-700 dark:text-stone-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         <div className="relative w-full md:w-48">
            <input 
              type="text" 
              placeholder="تاریخ (yyyy-mm-dd)"
              dir="ltr"
              className="w-full pl-4 pr-10 py-3 glass-input rounded-xl outline-none text-sm transition-all text-stone-700 dark:text-stone-200 text-right"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
         </div>
      </div>

      {/* Section 1: Pending (Active) */}
      <div className="space-y-4 animate-item" style={{animationDelay: '200ms'}}>
         <div className="flex items-center gap-2 px-2">
            <div className="p-1.5 bg-orange-100/50 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
               <ListChecks className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-stone-700 dark:text-stone-200">نوبت‌های در انتظار</h2>
            <span className="text-xs font-bold bg-stone-200 dark:bg-stone-800 px-2 py-0.5 rounded-full text-stone-500 dark:text-stone-400">{pendingAppointments.length}</span>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {loading ? (
                 <div className="col-span-full py-10 text-center"><div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin"></div></div>
             ) : pendingAppointments.length === 0 ? (
                 <div className="col-span-full glass-card p-8 text-center text-stone-400 flex flex-col items-center">
                    <CheckCircle2 className="w-8 h-8 mb-2 opacity-30 text-green-500" />
                    <span className="text-sm">هیچ نوبت در انتظاری وجود ندارد.</span>
                 </div>
             ) : pendingAppointments.map(renderCard)}
         </div>
      </div>

      {/* Section 2: History (Completed/Canceled) */}
      <div className="space-y-4 animate-item border-t border-stone-200/50 dark:border-white/5 pt-8 mt-4" style={{animationDelay: '300ms'}}>
         <button 
           onClick={() => setShowHistory(!showHistory)}
           className="flex items-center justify-between w-full group px-2"
         >
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-stone-100/50 dark:bg-white/5 rounded-lg text-stone-500 dark:text-stone-400 group-hover:bg-stone-200 dark:group-hover:bg-white/10 transition-colors">
                   <History className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-stone-700 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">تاریخچه و انجام شده‌ها</h2>
                <span className="text-xs font-bold bg-stone-200 dark:bg-stone-800 px-2 py-0.5 rounded-full text-stone-500 dark:text-stone-400">{historyAppointments.length}</span>
            </div>
            {showHistory ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
         </button>
         
         {showHistory && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {loading ? (
                     <div className="col-span-full py-10 text-center"><div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin"></div></div>
                 ) : historyAppointments.length === 0 ? (
                     <div className="col-span-full glass-card p-8 text-center text-stone-400 flex flex-col items-center">
                        <History className="w-8 h-8 mb-2 opacity-30" />
                        <span className="text-sm">تاریخچه‌ای یافت نشد.</span>
                     </div>
                 ) : historyAppointments.map(renderCard)}
             </div>
         )}
      </div>

    </div>
  );
};

export default AppointmentList;