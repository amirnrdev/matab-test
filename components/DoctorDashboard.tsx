import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { Appointment, AppointmentStatus, Medicine, Personnel } from '../types';
import { Clock, XCircle, FileText, ClipboardList, CheckCircle, UserCheck, Calendar, ArrowRight, User, History, ListChecks } from 'lucide-react';

interface DoctorDashboardProps {
  currentUser: Personnel;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ currentUser }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'record'>('list');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  
  // Medical Record Form
  const [description, setDescription] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState(''); 
  const [selectedMedicineId, setSelectedMedicineId] = useState<number | ''>('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
        const appts = await db.getAppointments();
        const meds = await db.getMedicines();
        setAppointments(appts);
        setMedicines(meds);
    } finally {
        setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: AppointmentStatus) => {
    await db.updateAppointmentStatus(id, status);
    refreshData();
  };

  const openMedicalRecord = (appt: Appointment) => {
    setSelectedAppt(appt);
    setDescription('');
    setChiefComplaint(''); 
    setSelectedMedicineId('');
    setViewMode('record');
  };

  const saveRecord = async () => {
    if (!selectedAppt || !selectedMedicineId) {
      alert("لطفا داروی تجویزی را انتخاب کنید");
      return;
    }
    
    await db.createMedicalRecord({
      patient_id: selectedAppt.patient_id,
      doctor_id: selectedAppt.doctor_id,
      personnel_national_code: currentUser.national_code,
      medicine_id: Number(selectedMedicineId),
      visit_date: selectedAppt.reserved_date,
      specialty: selectedAppt.doctor?.specialty || 'General',
      chief_complaint: chiefComplaint,
      description: description
    });
    
    await db.updateAppointmentStatus(selectedAppt.appointment_id, AppointmentStatus.Completed);
    setViewMode('list');
    refreshData();
  };

  // FIX: Use local time calculation instead of UTC
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const activeAppointments = appointments.filter(a => {
     const isPending = a.status === AppointmentStatus.Pending;
     const isTodayOrFuture = a.reserved_date >= today;
     return isPending && isTodayOrFuture;
  });

  const historyAppointments = appointments.filter(a => {
     const isDone = a.status !== AppointmentStatus.Pending;
     const isPast = a.reserved_date < today;
     return isDone || isPast;
  }).sort((a, b) => {
     return new Date(b.reserved_date).getTime() - new Date(a.reserved_date).getTime();
  });

  const displayList = activeTab === 'active' ? activeAppointments : historyAppointments;

  const statusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Pending: return 'bg-orange-100/50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-200/50 dark:border-orange-800/30';
      case AppointmentStatus.Completed: return 'bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-800/30';
      case AppointmentStatus.Canceled: return 'bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200/50 dark:border-red-800/30';
      case AppointmentStatus.NoShow: return 'bg-gray-100/50 dark:bg-gray-800/30 text-gray-700 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/30';
    }
  };

  const statusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Pending: return 'در انتظار ویزیت';
      case AppointmentStatus.Completed: return 'ویزیت شده';
      case AppointmentStatus.Canceled: return 'لغو شده';
      case AppointmentStatus.NoShow: return 'عدم حضور';
    }
  };

  if (viewMode === 'record' && selectedAppt) {
    return (
      <div className="glass-panel rounded-[32px] shadow-2xl p-8 max-w-3xl mx-auto animate-mac-window">
        {/* Keeping existing record view but ensuring it works */}
        <div className="flex justify-between items-center mb-6 border-b border-stone-200/50 dark:border-white/10 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-3 text-stone-800 dark:text-stone-100">
            <div className="p-2 glass-card rounded-xl text-stone-600 dark:text-stone-300">
               <FileText className="w-5 h-5" />
            </div>
            ثبت ویزیت و پرونده پزشکی
          </h2>
          <button onClick={() => setViewMode('list')} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-medium transition-colors text-sm">بستن</button>
        </div>

        {/* ... (Existing record UI structure preserved) ... */}
        
        <div className="space-y-6">
          <div className="bg-orange-50/50 dark:bg-orange-900/10 backdrop-blur-sm p-5 rounded-[24px] border border-orange-100/60 dark:border-orange-800/20 shadow-sm animate-item" style={{animationDelay: '200ms'}}>
             <div className="flex items-center gap-2 mb-2 text-stone-700 dark:text-orange-200 font-bold text-sm">
               <ClipboardList className="w-4 h-4 text-stone-500 dark:text-orange-300" />
               <h3>شکایت اصلی بیمار (خود اظهاری)</h3>
             </div>
             <textarea 
               rows={3}
               className="w-full p-3 glass-input rounded-xl outline-none text-stone-700 dark:text-stone-200 placeholder-stone-400 text-sm transition-all resize-none font-bold"
               placeholder="علت مراجعه بیمار، علائم ذکر شده توسط بیمار و..."
               value={chiefComplaint}
               onChange={(e) => setChiefComplaint(e.target.value)}
             ></textarea>
          </div>

          <div className="w-full h-px bg-stone-200/50 dark:bg-white/10 my-4"></div>

          <div className="space-y-4 animate-item" style={{animationDelay: '300ms'}}>
             <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">داروی تجویزی <span className="text-red-400">*</span></label>
                  <select 
                    className="w-full p-3 glass-input rounded-xl outline-none text-stone-800 dark:text-stone-100 cursor-pointer font-bold text-sm"
                    value={selectedMedicineId}
                    onChange={(e) => setSelectedMedicineId(Number(e.target.value))}
                  >
                    <option value="" className="dark:bg-stone-800">انتخاب دارو...</option>
                    {medicines.map(m => (
                      <option key={m.medicine_id} value={m.medicine_id} className="dark:bg-stone-800">
                        {m.medicine_name} - {m.dosage_medicine_name} ({m.consumption_time})
                      </option>
                    ))}
                  </select>
               </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">تشخیص و توضیحات پزشک <span className="text-red-400">*</span></label>
              <textarea 
                rows={5}
                className="w-full p-3 glass-input rounded-xl outline-none placeholder-stone-400 text-stone-800 dark:text-stone-100 transition-all font-bold text-sm"
                placeholder="شرح حال بالینی، نتایج معاینه و دستورات پزشک..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 animate-item" style={{animationDelay: '400ms'}}>
             <button onClick={() => setViewMode('list')} className="px-5 py-3 text-stone-500 hover:bg-stone-100/50 dark:hover:bg-white/10 rounded-xl transition-colors font-bold text-sm">انصراف</button>
             <button onClick={saveRecord} className="px-6 py-3 bg-stone-800/90 dark:bg-stone-100/90 text-white dark:text-stone-900 rounded-xl hover:shadow-lg transition-all font-bold flex items-center gap-2 active:scale-95 text-sm backdrop-blur-sm">
               <CheckCircle className="w-4 h-4" />
               ثبت نهایی ویزیت
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-item">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 drop-shadow-sm flex items-center gap-3">
             <div className="glass-card p-2 rounded-xl text-stone-600 dark:text-stone-300">
                <Calendar className="w-6 h-6" />
             </div>
             لیست نوبت‌ها
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm font-medium">مدیریت نوبت‌های فعال و مشاهده تاریخچه مراجعات</p>
        </div>
        <div className="text-sm font-bold text-stone-600 dark:text-stone-300 glass-card px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm">
          <Calendar className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          امروز: {new Date().toLocaleDateString('fa-IR')}
        </div>
      </div>
      
      <div className="flex glass-panel p-1 rounded-2xl w-full md:w-fit animate-item backdrop-blur-sm border border-stone-200/50 dark:border-white/10">
         <button 
           onClick={() => setActiveTab('active')}
           className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex-1 md:flex-none justify-center ${activeTab === 'active' ? 'bg-white/60 dark:bg-stone-800/60 text-stone-800 dark:text-white shadow-sm' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700'}`}
         >
           <ListChecks className="w-4 h-4" />
           نوبت‌های فعال (امروز)
         </button>
         <button 
           onClick={() => setActiveTab('history')}
           className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex-1 md:flex-none justify-center ${activeTab === 'history' ? 'bg-white/60 dark:bg-stone-800/60 text-stone-800 dark:text-white shadow-sm' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700'}`}
         >
           <History className="w-4 h-4" />
           تاریخچه نوبت‌ها
         </button>
      </div>

      <div className="flex flex-col gap-4">
         {loading ? (
             <div className="glass-panel p-16 text-center text-stone-400 flex flex-col items-center">
                 <div className="w-10 h-10 border-4 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4"></div>
                 <span>در حال بارگذاری اطلاعات...</span>
             </div>
         ) : displayList.length === 0 ? (
            <div className="glass-panel p-16 text-center text-stone-400 flex flex-col items-center animate-item" style={{animationDelay: '100ms'}}>
               <Clock className="w-12 h-12 mb-4 opacity-30" />
               <span>{activeTab === 'active' ? 'هیچ نوبتی برای امروز وجود ندارد.' : 'تاریخچه‌ای یافت نشد.'}</span>
            </div>
         ) : displayList.map((appt, index) => (
            <div 
              key={appt.appointment_id} 
              className={`glass-card glass-hover p-5 md:p-6 rounded-[28px] group flex flex-col md:flex-row items-center gap-6 animate-item ${activeTab === 'history' ? 'grayscale-[0.5] hover:grayscale-0' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
               <div className={`flex flex-col items-center justify-center min-w-[80px] p-3 rounded-2xl ${activeTab === 'history' ? 'bg-stone-50/50 dark:bg-white/5' : 'bg-stone-100/40 dark:bg-stone-800/40'}`}>
                  <span className="font-black text-xl text-stone-800 dark:text-stone-100" dir="ltr">{appt.reserved_time}</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-bold" dir="ltr">{appt.reserved_date}</span>
               </div>

               <div className="flex-1 text-center md:text-right w-full">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                     <User className="w-5 h-5 text-stone-400" />
                     <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100">{appt.patient?.first_name} {appt.patient?.last_name}</h3>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-stone-500 dark:text-stone-400 font-mono">
                     <span>کد ملی: {appt.patient?.national_code}</span>
                     <span>|</span>
                     <span>کد پیگیری: {appt.tracking_code}</span>
                  </div>
               </div>

               <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                  <span className={`px-4 py-2 rounded-xl text-xs font-bold ${statusColor(appt.status)}`}>
                      {statusLabel(appt.status)}
                  </span>

                  <div className="flex items-center gap-2">
                      {activeTab === 'active' && appt.status !== AppointmentStatus.Completed && appt.status !== AppointmentStatus.Canceled && (
                        <>
                          <button 
                            onClick={() => openMedicalRecord(appt)}
                            className="flex items-center gap-2 bg-stone-800/90 dark:bg-stone-100/90 text-white dark:text-stone-900 px-6 py-3 rounded-2xl text-sm font-bold hover:shadow-lg transition-all active:scale-95 backdrop-blur-sm"
                          >
                            <FileText className="w-4 h-4" />
                            ثبت ویزیت
                          </button>
                          <button 
                            onClick={() => handleStatusChange(appt.appointment_id, AppointmentStatus.Canceled)}
                            className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors"
                            title="لغو نوبت"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                  </div>
               </div>

            </div>
         ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;