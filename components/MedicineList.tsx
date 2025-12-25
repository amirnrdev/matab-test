import React, { useEffect, useState } from 'react';
import { db } from '../services/mockDb';
import { Medicine } from '../types';
import { Search, Plus, Trash2, Pill, Clock, FileText } from 'lucide-react';

const MedicineList: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [newMedicine, setNewMedicine] = useState({
    medicine_name: '',
    dosage_medicine_name: '',
    dosage_count: 1,
    consumption_time: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await db.getMedicines();
    setMedicines(data);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این دارو اطمینان دارید؟')) {
      await db.deleteMedicine(id);
      loadData();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedicine.medicine_name) return;

    await db.createMedicine({
      medicine_name: newMedicine.medicine_name,
      dosage_medicine_name: newMedicine.dosage_medicine_name,
      dosage_count: Number(newMedicine.dosage_count),
      consumption_time: newMedicine.consumption_time,
      description: newMedicine.description
    });

    setNewMedicine({ 
      medicine_name: '', 
      dosage_medicine_name: '', 
      dosage_count: 1, 
      consumption_time: '',
      description: '' 
    });
    setIsAdding(false);
    loadData();
  };

  const filtered = medicines.filter(m => 
    m.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.description.includes(searchTerm)
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-item">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 drop-shadow-sm flex items-center gap-3">
            <div className="bg-stone-200/50 dark:bg-stone-800/50 p-2 rounded-xl text-stone-600 dark:text-stone-300 backdrop-blur-sm">
              <Pill className="w-6 h-6" />
            </div>
            مدیریت داروخانه
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 font-medium">لیست داروها و دستورات مصرفی</p>
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
            <span className="hidden md:inline">دارو جدید</span>
          </button>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="glass-panel p-8 rounded-3xl animate-mac-window border border-stone-200/50 dark:border-white/10">
          <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-2">
             <Pill className="w-5 h-5 text-stone-400" />
             ثبت اطلاعات دارو
          </h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-end">
            <div className="lg:col-span-2">
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">نام دارو</label>
              <input 
                type="text" 
                required
                placeholder="مثلا: استامینوفن"
                className="w-full p-4 glass-input rounded-2xl outline-none font-bold"
                value={newMedicine.medicine_name}
                onChange={e => setNewMedicine({...newMedicine, medicine_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">دوز/شکل دارو</label>
              <input 
                type="text" 
                placeholder="مثلا: ۵۰۰ میلی‌گرم"
                className="w-full p-4 glass-input rounded-2xl outline-none font-bold"
                value={newMedicine.dosage_medicine_name}
                onChange={e => setNewMedicine({...newMedicine, dosage_medicine_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">تعداد مصرف</label>
              <input 
                type="number" 
                min="1"
                className="w-full p-4 glass-input rounded-2xl outline-none font-bold text-center"
                value={newMedicine.dosage_count}
                onChange={e => setNewMedicine({...newMedicine, dosage_count: parseInt(e.target.value)})}
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">زمان مصرف</label>
              <input 
                type="text" 
                placeholder="مثلا: هر ۸ ساعت بعد از غذا"
                className="w-full p-4 glass-input rounded-2xl outline-none font-bold"
                value={newMedicine.consumption_time}
                onChange={e => setNewMedicine({...newMedicine, consumption_time: e.target.value})}
              />
            </div>
            <div className="lg:col-span-6">
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">توضیحات تکمیلی</label>
              <input 
                type="text" 
                className="w-full p-4 glass-input rounded-2xl outline-none font-bold"
                value={newMedicine.description}
                onChange={e => setNewMedicine({...newMedicine, description: e.target.value})}
              />
            </div>
            
            <div className="lg:col-span-6 flex gap-3 mt-4">
               <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-4 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/10 rounded-2xl font-bold transition-colors">انصراف</button>
               <button type="submit" className="flex-1 bg-stone-800/90 dark:bg-stone-100/90 text-white dark:text-stone-900 py-4 rounded-2xl hover:shadow-lg transition-all font-bold backdrop-blur-sm">ثبت دارو</button>
            </div>
          </form>
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
             <div className="col-span-full glass-panel p-16 text-center text-stone-400 flex flex-col items-center animate-item">
                <Pill className="w-12 h-12 mb-4 opacity-30" />
                <span>دارویی یافت نشد.</span>
             </div>
          ) : filtered.map((medicine, index) => (
            <div 
              key={medicine.medicine_id} 
              className="glass-card glass-hover p-6 rounded-[32px] group flex flex-col justify-between relative overflow-hidden animate-item"
              style={{ animationDelay: `${index * 50}ms` }}
            >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100/50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-inner">
                      <Pill className="w-6 h-6" />
                  </div>
                  <button 
                    onClick={() => handleDelete(medicine.medicine_id)}
                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div>
                   <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100 mb-1">{medicine.medicine_name}</h3>
                   <p className="text-sm text-stone-500 dark:text-stone-400 font-bold mb-4">{medicine.dosage_medicine_name}</p>

                   <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-300 bg-white/40 dark:bg-white/5 p-3 rounded-2xl">
                          <Clock className="w-4 h-4 text-stone-400" />
                          <span className="font-bold">{medicine.consumption_time}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-stone-500 dark:text-stone-400 px-2">
                          <FileText className="w-4 h-4 mt-1 opacity-50" />
                          <span className="leading-6">{medicine.description || 'توضیحات ندارد'}</span>
                      </div>
                   </div>
                </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MedicineList;