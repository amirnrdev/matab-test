import React, { useEffect, useState } from 'react';
import { db, utils } from '../services/mockDb';
import { Doctor } from '../types';
import { Search, Plus, Trash2, Stethoscope, Award, CalendarDays, Hash, Fingerprint } from 'lucide-react';

const DoctorList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [newDoctor, setNewDoctor] = useState({
    first_name: '',
    last_name: '',
    national_code: '',
    specialty: '',
    medical_system_number: '',
    work_days: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await db.getDoctors();
    setDoctors(data);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این پزشک و تمام سوابق مربوطه اطمینان دارید؟')) {
      await db.deleteDoctor(id);
      loadData();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor.first_name || !newDoctor.last_name || !newDoctor.medical_system_number || !newDoctor.national_code) return;

    // Validation
    if (!utils.isValidNationalCode(newDoctor.national_code)) {
      alert('کد ملی وارد شده معتبر نیست. لطفاً کد ۱۰ رقمی صحیح وارد کنید.');
      return;
    }

    await db.createDoctor({
      first_name: newDoctor.first_name,
      last_name: newDoctor.last_name,
      national_code: newDoctor.national_code,
      specialty: newDoctor.specialty,
      medical_system_number: newDoctor.medical_system_number,
      work_days: newDoctor.work_days || 'شنبه,دوشنبه,چهارشنبه' // Default if empty (Persian)
    });

    setNewDoctor({ 
      first_name: '', 
      last_name: '', 
      national_code: '',
      specialty: '', 
      medical_system_number: '',
      work_days: '' 
    });
    setIsAdding(false);
    loadData();
  };

  const filtered = doctors.filter(d => 
    d.last_name.includes(searchTerm) || 
    d.medical_system_number.includes(searchTerm) ||
    d.specialty.includes(searchTerm) ||
    d.national_code?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-item">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 drop-shadow-sm flex items-center gap-3">
             <div className="bg-stone-200/50 dark:bg-stone-800/50 p-2 rounded-xl text-stone-600 dark:text-stone-300 backdrop-blur-sm">
                <Stethoscope className="w-6 h-6" />
             </div>
             مدیریت پزشکان
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 font-medium">لیست پزشکان، تخصص‌ها و برنامه کاری</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64 group">
             <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5 group-focus-within:text-stone-600 dark:group-focus-within:text-stone-200 transition-colors" />
             <input 
               type="text" 
               placeholder="جستجو..." 
               className="w-full pr-12 pl-4 py-3 glass-input rounded-2xl outline-none text-sm transition-all text-stone-700 dark:text-stone-200"
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-stone-800/90 dark:bg-stone-100/90 text-white dark:text-stone-900 px-5 py-3 rounded-2xl hover:shadow-xl hover:shadow-stone-900/10 dark:hover:shadow-white/5 transition-all font-bold active:scale-95 whitespace-nowrap backdrop-blur-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">پزشک جدید</span>
          </button>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="glass-panel p-8 rounded-3xl animate-mac-window border border-stone-200/50 dark:border-white/10">
          <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-2">
             <Stethoscope className="w-5 h-5 text-stone-400" />
             ثبت اطلاعات پزشک
          </h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-end">
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">نام</label>
              <input 
                type="text" 
                required
                className="w-full p-4 glass-input rounded-2xl outline-none font-bold"
                value={newDoctor.first_name}
                onChange={e => setNewDoctor({...newDoctor, first_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">نام خانوادگی</label>
              <input 
                type="text" 
                required
                className="w-full p-4 glass-input rounded-2xl outline-none font-bold"
                value={newDoctor.last_name}
                onChange={e => setNewDoctor({...newDoctor, last_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">کد ملی</label>
              <input 
                type="text" 
                required
                dir="ltr"
                className="w-full p-4 glass-input rounded-2xl outline-none font-mono font-bold text-center"
                value={newDoctor.national_code}
                onChange={e => setNewDoctor({...newDoctor, national_code: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">تخصص</label>
              <input 
                type="text" 
                placeholder="مثلا: قلب و عروق"
                required
                className="w-full p-4 glass-input rounded-2xl outline-none font-bold"
                value={newDoctor.specialty}
                onChange={e => setNewDoctor({...newDoctor, specialty: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">ش. نظام پزشکی</label>
              <input 
                type="text" 
                required
                dir="ltr"
                className="w-full p-4 glass-input rounded-2xl outline-none font-mono font-bold text-center"
                value={newDoctor.medical_system_number}
                onChange={e => setNewDoctor({...newDoctor, medical_system_number: e.target.value})}
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">روزهای کاری (با کاما)</label>
              <input 
                type="text" 
                placeholder="شنبه,دوشنبه,چهارشنبه"
                dir="rtl"
                className="w-full p-4 glass-input rounded-2xl outline-none font-bold text-right"
                value={newDoctor.work_days}
                onChange={e => setNewDoctor({...newDoctor, work_days: e.target.value})}
              />
            </div>
            <div className="lg:col-span-6 flex gap-3 mt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-4 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/10 rounded-2xl font-bold transition-colors">انصراف</button>
              <button type="submit" className="flex-1 bg-stone-800/90 dark:bg-stone-100/90 text-white dark:text-stone-900 py-4 rounded-2xl hover:shadow-lg transition-all font-bold backdrop-blur-sm">ثبت پزشک</button>
            </div>
          </form>
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
             <div className="col-span-full glass-panel p-16 text-center text-stone-400 flex flex-col items-center animate-item">
                <Stethoscope className="w-12 h-12 mb-4 opacity-30" />
                <span>پزشکی یافت نشد.</span>
             </div>
          ) : filtered.map((doc, index) => (
            <div 
              key={doc.doctor_id} 
              className="glass-card glass-hover p-6 rounded-[32px] group flex flex-col justify-between relative overflow-hidden animate-item"
              style={{ animationDelay: `${index * 50}ms` }}
            >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100/50 dark:bg-stone-800/50 flex items-center justify-center text-stone-700 dark:text-stone-300 shadow-inner">
                      <Stethoscope className="w-6 h-6" />
                  </div>
                  <button 
                    onClick={() => handleDelete(doc.doctor_id)}
                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div>
                   <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100 mb-1">{doc.first_name} {doc.last_name}</h3>
                   <span className="inline-flex items-center gap-1 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-xs font-bold mb-4">
                      <Award className="w-3 h-3" />
                      {doc.specialty}
                   </span>

                   <div className="space-y-2 mt-2">
                       {/* Medical System Number */}
                       <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400 bg-white/40 dark:bg-white/5 p-3 rounded-2xl">
                          <div className="flex items-center gap-2">
                             <Hash className="w-4 h-4 opacity-50" />
                             <span className="text-xs font-bold">نظام پزشکی:</span>
                          </div>
                          <span className="font-mono font-bold text-stone-700 dark:text-stone-300">{doc.medical_system_number}</span>
                       </div>

                       {/* National Code */}
                       <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400 bg-white/40 dark:bg-white/5 p-3 rounded-2xl">
                          <div className="flex items-center gap-2">
                             <Fingerprint className="w-4 h-4 opacity-50" />
                             <span className="text-xs font-bold">کد ملی:</span>
                          </div>
                          <span className="font-mono font-bold text-stone-700 dark:text-stone-300">{doc.national_code}</span>
                       </div>

                       <div className="p-3">
                          <div className="flex items-center gap-2 text-stone-400 mb-2">
                             <CalendarDays className="w-4 h-4" />
                             <span className="text-xs font-bold">روزهای کاری:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                             {doc.work_days.split(',').map((d, i) => (
                               <span key={i} className="text-[10px] bg-stone-100/50 dark:bg-stone-800/50 px-2 py-1 rounded-md text-stone-600 dark:text-stone-400 font-bold">
                                 {d}
                               </span>
                             ))}
                          </div>
                       </div>
                   </div>
                </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default DoctorList;