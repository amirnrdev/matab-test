import React, { useState, useEffect } from 'react';
import { db, utils } from '../services/mockDb';
import { Doctor, Appointment } from '../types';
import { User, Check, CheckCircle, Copy, ArrowRight, ArrowLeft, Activity, CalendarDays, UserPlus, Clock, Phone, FileText, Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react';

const BookingView: React.FC = () => {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalCode: '',
    birthDate: '',
    phone: '',
    gender: 'Male'
  });

  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [availabilityCache, setAvailabilityCache] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadDocs = async () => {
        try {
            setLoadingDocs(true);
            const docs = await db.getDoctors();
            setDoctors(docs);
        } finally {
            setLoadingDocs(false);
        }
    }
    loadDocs();
  }, []);

  // Pre-check availability for UI rendering is tricky in Async mode.
  // For now, we will assume available in UI until clicked, or cache checks.
  // In a real app, you fetch available slots for a day from API.
  const checkSlot = async (date: string, time: string) => {
      if (!selectedDoctor) return false;
      // In online mode, we'd ideally fetch all busy slots for the day.
      // Here we check individually (simplification)
      const key = `${date}-${time}`;
      if (availabilityCache[key] !== undefined) return availabilityCache[key];
      
      const available = await db.checkAvailability(selectedDoctor.doctor_id, date, time);
      setAvailabilityCache(prev => ({...prev, [key]: available}));
      return available;
  };


  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
    setSelectedDate('');
    setSelectedTime('');
    setAvailabilityCache({});
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i < 18; i++) {
      slots.push(`${i}:00`);
      slots.push(`${i}:30`);
    }
    return slots;
  };

  const generateNext14Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const getPersianDayName = (date: Date) => {
    const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
    return days[date.getDay()];
  };

  const formatDateValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleBooking = async () => {
    try {
      setMessage(null);
      setIsSubmitting(true);

      if (!selectedDoctor || !selectedDate || !selectedTime) {
         setMessage({ type: 'error', text: 'لطفاً زمان نوبت را انتخاب کنید.' });
         setIsSubmitting(false);
         return;
      }
      if (!formData.firstName.trim() || !formData.lastName.trim() || 
          !formData.nationalCode.trim() || !formData.phone.trim()) {
         setMessage({ type: 'error', text: 'لطفاً تمام فیلدهای اطلاعات فردی را تکمیل نمایید.' });
         setIsSubmitting(false);
         return;
      }

      if (!utils.isValidNationalCode(formData.nationalCode)) {
         setMessage({ type: 'error', text: 'کد ملی وارد شده معتبر نیست. لطفاً کد ملی ۱۰ رقمی صحیح وارد کنید.' });
         setIsSubmitting(false);
         return;
      }
      
      if (!utils.isValidPhoneNumber(formData.phone)) {
         setMessage({ type: 'error', text: 'شماره موبایل نامعتبر است. باید ۱۱ رقم باشد و با ۰۹ شروع شود.' });
         setIsSubmitting(false);
         return;
      }

      // Check Patient Async
      let patient = await db.findPatientByNationalCode(formData.nationalCode);
      
      if (!patient) {
        patient = await db.createPatient({
          first_name: formData.firstName,
          last_name: formData.lastName,
          national_code: formData.nationalCode,
          birth_date: formData.birthDate || '1370-01-01',
          phone_number: formData.phone,
          gender: formData.gender,
        });
      } else {
        const updated = {
          ...patient,
          first_name: formData.firstName,
          last_name: formData.lastName,
          birth_date: formData.birthDate || patient.birth_date,
          phone_number: formData.phone,
          gender: formData.gender,
        };
        await db.updatePatient(updated);
        patient = updated;
      }

      const appt = await db.createAppointment({
        patient_id: patient.patient_id,
        doctor_id: selectedDoctor.doctor_id,
        reserved_date: selectedDate,
        reserved_time: selectedTime,
      });

      if (appt) {
        setCreatedAppointment(appt);
        setMessage({ type: 'success', text: 'نوبت شما با موفقیت ثبت شد.' });
        setStep(4); 
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'خطا در ثبت نوبت' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const Timeline = () => {
    const steps = [
      { id: 1, label: 'پزشک', icon: Stethoscope },
      { id: 2, label: 'زمان', icon: CalendarDays },
      { id: 3, label: 'بیمار', icon: UserPlus },
    ];

    return (
      <div className="flex justify-center mb-6 relative z-20 animate-fade-in-up">
         <div className="glass-panel px-5 py-3 rounded-full flex items-center gap-4 md:gap-10 relative shadow-sm">
            <div className="absolute top-1/2 left-6 right-6 h-[2px] bg-stone-200 dark:bg-stone-700/50 -z-10 rounded-full"></div>
            {steps.map((s) => {
               const isActive = step === s.id;
               const isCompleted = step > s.id;
               return (
                  <div key={s.id} className="relative flex flex-col items-center justify-center">
                     <div 
                        className={`
                           w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 z-10 border-[3px]
                           ${isActive 
                              ? 'bg-stone-800 dark:bg-stone-100 border-white dark:border-stone-800 text-white dark:text-stone-900 scale-110 shadow-lg' 
                              : isCompleted 
                                 ? 'bg-stone-200 dark:bg-stone-700 border-stone-100 dark:border-stone-600 text-stone-500 dark:text-stone-400'
                                 : 'bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-300'}
                        `}
                     >
                        {isCompleted ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <s.icon className="w-3.5 h-3.5" />}
                     </div>
                     <span className={`
                        absolute top-10 whitespace-nowrap text-[9px] font-black uppercase tracking-wider transition-all duration-300 bg-white/80 dark:bg-black/80 px-2 py-0.5 rounded-md backdrop-blur-sm
                        ${isActive ? 'opacity-100 translate-y-0 text-stone-800 dark:text-stone-100 shadow-sm' : 'opacity-0 translate-y-1 scale-90 md:opacity-50 md:translate-y-0 md:text-stone-400 pointer-events-none'}
                     `}>
                        {s.label}
                     </span>
                  </div>
               );
            })}
         </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 font-vazir pb-12 relative">
      <header className="mb-2 text-center md:text-right flex flex-col md:flex-row justify-between items-end gap-4 animate-mac-window max-w-6xl mx-auto px-4 md:px-0">
        <div>
          <h1 className="text-4xl font-black text-stone-800 dark:text-stone-100 mb-2 tracking-tighter">نوبت دهی آنلاین</h1>
        </div>
      </header>

      {step < 4 && <Timeline />}

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <div className="mt-8 max-w-6xl mx-auto animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-2 rounded-xl text-stone-600 dark:text-stone-300 glass-card">
                 <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                 <h2 className="text-lg font-black text-stone-800 dark:text-stone-100">لیست پزشکان متخصص</h2>
                 <p className="text-xs text-stone-500 dark:text-stone-400 font-bold">پزشک مورد نظر خود را انتخاب کنید</p>
              </div>
          </div>

          {loadingDocs ? (
              <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doc, i) => (
                <div 
                    key={doc.doctor_id} 
                    onClick={() => handleDoctorSelect(doc)}
                    className="glass-card glass-hover p-6 flex flex-col items-center text-center gap-4 relative overflow-hidden animate-item"
                    style={{ animationDelay: `${i * 100}ms` }}
                >
                    <div className="w-20 h-20 rounded-[24px] bg-stone-100/50 dark:bg-stone-800/50 flex items-center justify-center mb-4 text-stone-700 dark:text-stone-300 shadow-inner group-hover:scale-110 transition-transform duration-500 relative z-10 border border-white dark:border-stone-600">
                        <User className="w-10 h-10 opacity-50" strokeWidth={1.5} />
                    </div>

                    <div className="relative z-10 mb-6 w-full">
                    <h3 className="font-black text-xl text-stone-800 dark:text-stone-100 mb-2 truncate">{doc.first_name} {doc.last_name}</h3>
                    <span className="text-stone-500 dark:text-stone-400 text-xs font-bold bg-stone-50/50 dark:bg-black/30 px-4 py-1.5 rounded-full inline-block border border-stone-200 dark:border-white/10">
                        {doc.specialty}
                    </span>
                    </div>
                    
                    <div className="w-full relative z-10 pt-4 border-t border-stone-200/50 dark:border-white/10 flex items-center justify-between mt-auto">
                    <div className="text-[10px] font-bold text-stone-400 dark:text-stone-500 tracking-wide">
                        {doc.work_days.split(',').length} روز کاری فعال
                    </div>
                    <div className="w-10 h-10 rounded-full bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-500 group-hover:bg-stone-800 dark:group-hover:bg-stone-100 group-hover:text-white dark:group-hover:text-stone-900 transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    </div>
                </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && selectedDoctor && (
        <div className="mt-8 glass-panel p-6 md:p-8 animate-fade-in-up relative overflow-hidden max-w-4xl mx-auto">
          <div className="glass-card p-4 rounded-2xl mb-6 flex items-center gap-4 relative overflow-hidden animate-item" style={{animationDelay: '100ms'}}>
             <div className="w-12 h-12 rounded-xl bg-stone-100/50 dark:bg-stone-800/50 flex items-center justify-center text-stone-700 dark:text-stone-300 border border-white dark:border-stone-600 relative z-10">
                  <User className="w-6 h-6 opacity-50" />
             </div>
             <div className="relative z-10">
                <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block">پزشک انتخاب شده</span>
                <h2 className="text-lg font-black text-stone-800 dark:text-stone-100">{selectedDoctor.first_name} {selectedDoctor.last_name}</h2>
             </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="animate-item" style={{animationDelay: '200ms'}}>
              <div className="flex items-center gap-2 mb-4 px-2">
                 <div className="w-8 h-8 rounded-lg bg-stone-100/50 dark:bg-stone-800/50 flex items-center justify-center text-stone-600 dark:text-stone-300">
                    <CalendarDays className="w-4 h-4" />
                 </div>
                 <h3 className="text-sm font-black text-stone-800 dark:text-stone-100">انتخاب روز ویزیت</h3>
              </div>
              
              <div className="relative group">
                <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-2 custom-scrollbar snap-x">
                  {generateNext14Days().map((date, idx) => {
                    const persianDayName = getPersianDayName(date);
                    const formattedDateValue = formatDateValue(date);
                    const isWorkingDay = selectedDoctor.work_days.includes(persianDayName);
                    const isSelected = selectedDate === formattedDateValue;

                    return (
                      <button
                        key={idx}
                        disabled={!isWorkingDay}
                        onClick={() => {
                          setSelectedDate(formattedDateValue);
                          setSelectedTime('');
                        }}
                        className={`
                          flex-shrink-0 w-24 h-28 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 snap-start glass-card
                          ${!isWorkingDay 
                             ? 'opacity-50 grayscale cursor-not-allowed border-transparent shadow-none' 
                             : isSelected 
                                ? 'bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-800 dark:border-stone-100 shadow-xl scale-105 z-10' 
                                : 'hover:bg-white dark:hover:bg-white/10'}
                        `}
                      >
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-white/70 dark:text-black/60' : 'text-stone-400'}`}>
                           {persianDayName}
                        </span>
                        <span className="text-2xl font-black tracking-tighter" dir="ltr">
                           {date.getDate()}
                        </span>
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-white/70 dark:text-black/60' : 'text-stone-400'}`}>
                           {date.toLocaleDateString('fa-IR', {month: 'long'})}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`glass-card p-5 flex flex-col transition-all duration-500 animate-item ${selectedDate ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none grayscale'}`} style={{animationDelay: '300ms'}}>
               <div className="flex items-center gap-2 mb-4">
                 <div className="w-8 h-8 rounded-lg bg-stone-100/50 dark:bg-stone-800/50 flex items-center justify-center text-stone-600 dark:text-stone-300">
                    <Clock className="w-4 h-4" />
                 </div>
                 <h3 className="text-sm font-black text-stone-800 dark:text-stone-100">ساعت ویزیت</h3>
              </div>

               <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                 {generateTimeSlots().map(time => {
                   const isSelected = selectedTime === time;
                   // Note: Availability check logic for Async is simplified here. 
                   // In a real scenario, you'd fetch blocked slots for the day.
                   // Here we allow selection and check on submit for demo smoothness.
                   return (
                     <button
                        key={time}
                        disabled={!selectedDate}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 relative overflow-hidden group
                          ${isSelected 
                            ? 'bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-800 dark:border-stone-100 shadow-lg scale-105' 
                            : 'glass-input hover:bg-white dark:hover:bg-white/10'}
                        `}
                     >
                       {time}
                     </button>
                   )
                 })}
               </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse sm:flex-row gap-4 border-t border-stone-200/30 dark:border-white/10 pt-6 animate-item" style={{animationDelay: '400ms'}}>
            <button 
              onClick={() => setStep(1)}
              className="flex-1 glass-input py-3 rounded-xl font-bold text-sm hover:bg-stone-200 dark:hover:bg-stone-700 transition-all active:scale-[0.98]"
            >
              بازگشت
            </button>
            <button 
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(3)}
              className="flex-[2] bg-stone-800 dark:bg-stone-100 text-[#F5F5F4] dark:text-stone-900 py-3 rounded-xl font-bold hover:shadow-xl disabled:opacity-50 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
            >
              مرحله بعدی
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Info */}
      {step === 3 && (
        <div className="mt-8 glass-panel p-6 md:p-8 max-w-2xl mx-auto animate-fade-in-up">
           <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-stone-800 dark:text-stone-100 mb-1">تکمیل اطلاعات بیمار</h2>
              <p className="text-stone-500 dark:text-stone-400 font-medium text-xs">لطفاً مشخصات فردی خود را با دقت وارد نمایید</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4 mb-6 animate-item" style={{animationDelay: '100ms'}}>
              <div 
                onClick={() => setFormData({...formData, gender: 'Male'})}
                className={`glass-card glass-hover p-4 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 group border-2
                  ${formData.gender === 'Male' 
                    ? 'border-stone-800 dark:border-stone-100 shadow-lg' 
                    : 'border-transparent opacity-60 hover:opacity-100'}
                `}
              >
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${formData.gender === 'Male' ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900' : 'bg-stone-200 dark:bg-stone-800 text-stone-500'}`}>
                    <User className="w-5 h-5" />
                 </div>
                 <span className="font-bold text-sm text-stone-800 dark:text-stone-100">آقا</span>
              </div>

              <div 
                onClick={() => setFormData({...formData, gender: 'Female'})}
                className={`glass-card glass-hover p-4 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 group border-2
                  ${formData.gender === 'Female' 
                    ? 'border-stone-800 dark:border-stone-100 shadow-lg' 
                    : 'border-transparent opacity-60 hover:opacity-100'}
                `}
              >
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${formData.gender === 'Female' ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900' : 'bg-stone-200 dark:bg-stone-800 text-stone-500'}`}>
                    <User className="w-5 h-5" />
                 </div>
                 <span className="font-bold text-sm text-stone-800 dark:text-stone-100">خانم</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 animate-item" style={{animationDelay: '200ms'}}>
              <div className="relative group">
                 <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 mb-1.5 block mr-1">نام</label>
                 <input 
                   className="p-3 pr-4 glass-input rounded-xl w-full outline-none font-bold text-sm"
                   value={formData.firstName}
                   onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                 />
              </div>
              <div className="relative group">
                 <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 mb-1.5 block mr-1">نام خانوادگی</label>
                 <input 
                   className="p-3 pr-4 glass-input rounded-xl w-full outline-none font-bold text-sm"
                   value={formData.lastName}
                   onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                 />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 animate-item" style={{animationDelay: '300ms'}}>
              <div className="relative group">
                 <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 mb-1.5 block mr-1">کد ملی</label>
                 <input 
                   dir="ltr"
                   className="p-3 pr-4 glass-input rounded-xl w-full outline-none text-right font-mono text-sm font-bold"
                   value={formData.nationalCode}
                   onChange={(e) => setFormData({...formData, nationalCode: e.target.value})}
                 />
              </div>
              <div className="relative group">
                 <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 mb-1.5 block mr-1">شماره تماس</label>
                 <input 
                   dir="ltr"
                   className="p-3 pr-4 glass-input rounded-xl w-full outline-none text-right font-mono text-sm font-bold"
                   value={formData.phone}
                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
                 />
              </div>
           </div>

           <div className="mb-8 animate-item" style={{animationDelay: '400ms'}}>
               <div className="relative group">
                  <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 mb-1.5 block mr-1">تاریخ تولد</label>
                  <input 
                    type="date"
                    className="p-3 pr-4 glass-input rounded-xl w-full outline-none font-bold text-sm"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  />
               </div>
           </div>

           {message && (
             <div className={`mb-6 p-4 rounded-xl text-xs font-bold text-center animate-item ${message.type === 'error' ? 'bg-red-50/50 text-red-600' : 'bg-green-50/50 text-green-700'}`}>
               {message.text}
             </div>
           )}

           <div className="flex flex-col-reverse sm:flex-row gap-4 border-t border-stone-200/30 dark:border-white/10 pt-6 animate-item" style={{animationDelay: '500ms'}}>
              <button 
                onClick={() => setStep(2)} 
                disabled={isSubmitting}
                className="flex-1 glass-input py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
              >
                بازگشت
              </button>
              <button 
                  onClick={handleBooking}
                  disabled={isSubmitting}
                  className="flex-[2] bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 py-3 rounded-xl font-bold text-sm hover:shadow-xl transition-all active:scale-[0.98] flex justify-center gap-2 items-center"
              >
                {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : 'تایید و ثبت نهایی'}
              </button>
           </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="glass-panel p-10 text-center max-w-sm mx-auto animate-fade-in-up relative overflow-hidden">
          <div className="w-20 h-20 bg-green-50/50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-100 dark:border-green-800 animate-pop">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h2 className="text-2xl font-black text-stone-800 dark:text-stone-100 mb-2 animate-item" style={{animationDelay: '200ms'}}>رزرو با موفقیت انجام شد</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-8 text-sm animate-item" style={{animationDelay: '300ms'}}>منتظر دیدار شما هستیم.</p>
          
          <div className="glass-input p-6 rounded-[20px] mb-8 shadow-sm relative overflow-hidden group animate-item" style={{animationDelay: '400ms'}}>
             <div className="absolute top-0 left-0 w-1 h-full bg-stone-800 dark:bg-stone-100"></div>
             <span className="text-stone-400 dark:text-stone-500 text-[10px] font-bold uppercase tracking-widest block mb-1">کد پیگیری</span>
             <div className="text-3xl font-mono font-bold text-stone-800 dark:text-stone-100 tracking-widest flex justify-center items-center gap-2">
               {createdAppointment?.tracking_code}
               <Copy className="w-4 h-4 opacity-20 cursor-pointer hover:opacity-100 transition-opacity" />
             </div>
          </div>

          <button 
            onClick={() => { 
                setStep(1); 
                setFormData({firstName: '', lastName: '', nationalCode: '', birthDate: '', phone: '', gender: 'Male'}); 
                setMessage(null); 
                setCreatedAppointment(null);
            }}
            className="text-stone-800 dark:text-stone-200 font-bold hover:text-black dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10 px-6 py-2.5 rounded-xl transition-all animate-item text-sm" style={{animationDelay: '500ms'}}
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingView;