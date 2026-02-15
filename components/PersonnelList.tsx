import React, { useEffect, useState } from 'react';
import { db } from '../services/mockDb';
import { Personnel } from '../types';
import { Search, Plus, Trash2, ShieldCheck, UserCog, Edit, X, Save, Stethoscope, Briefcase } from 'lucide-react';

const PersonnelList: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State for Adding
  const [newPerson, setNewPerson] = useState({
    first_name: '',
    last_name: '',
    national_code: '',
    role: 'منشی'
  });

  // Form State for Editing
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    role: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await db.getPersonnel();
    setPersonnel(data);
  };

  const handleDelete = async (code: string) => {
    if (window.confirm('آیا از حذف این پرسنل اطمینان دارید؟')) {
      await db.deletePersonnel(code);
      loadData();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerson.first_name || !newPerson.last_name || !newPerson.national_code) return;

    try {
      await db.createPersonnel({
        first_name: newPerson.first_name,
        last_name: newPerson.last_name,
        national_code: newPerson.national_code,
        role: newPerson.role
      });

      setNewPerson({ first_name: '', last_name: '', national_code: '', role: 'منشی' });
      setIsAdding(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startEdit = (person: Personnel) => {
    setEditingPerson(person);
    setEditFormData({
      first_name: person.first_name,
      last_name: person.last_name,
      role: person.role
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerson) return;

    try {
      await db.updatePersonnel({
        ...editingPerson,
        first_name: editFormData.first_name,
        last_name: editFormData.last_name,
        role: editFormData.role
      });
      setEditingPerson(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = personnel.filter(p => 
    p.last_name.includes(searchTerm) || 
    p.national_code.includes(searchTerm) ||
    p.role.includes(searchTerm)
  );

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'پزشک': return <Stethoscope className="w-5 h-5" />;
      case 'مدیر': return <ShieldCheck className="w-5 h-5" />;
      case 'پرستار': return <UserCog className="w-5 h-5" />;
      default: return <Briefcase className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'مدیر': return 'bg-stone-800 text-white dark:bg-white dark:text-stone-900';
      case 'پزشک': return 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200';
      default: return 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-item">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 drop-shadow-sm flex items-center gap-3">
             <div className="bg-stone-200/50 dark:bg-stone-800/50 p-2 rounded-xl text-stone-600 dark:text-stone-300 backdrop-blur-sm">
                <UserCog className="w-6 h-6" />
             </div>
             مدیریت پرسنل
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 font-medium">مدیریت دسترسی‌ها و لیست کارکنان</p>
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
             <span className="hidden md:inline">پرسنل جدید</span>
           </button>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="glass-panel p-8 rounded-3xl animate-mac-window border border-stone-200/50 dark:border-white/10">
          <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-stone-400" />
            ثبت مشخصات همکار جدید
          </h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">نام</label>
              <input 
                type="text" 
                required
                className="w-full p-4 glass-input rounded-2xl outline-none font-bold"
                value={newPerson.first_name}
                onChange={e => setNewPerson({...newPerson, first_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">نام خانوادگی</label>
              <input 
                type="text" 
                required
                className="w-full p-4 glass-input rounded-2xl outline-none font-bold"
                value={newPerson.last_name}
                onChange={e => setNewPerson({...newPerson, last_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">کد ملی</label>
              <input 
                type="text" 
                required
                dir="ltr"
                className="w-full p-4 glass-input rounded-2xl outline-none font-mono text-center font-bold"
                value={newPerson.national_code}
                onChange={e => setNewPerson({...newPerson, national_code: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">نقش (Role)</label>
              <select 
                className="w-full p-4 glass-input rounded-2xl outline-none cursor-pointer font-bold"
                value={newPerson.role}
                onChange={e => setNewPerson({...newPerson, role: e.target.value})}
              >
                <option value="منشی" className="dark:bg-stone-900">منشی</option>
                <option value="پرستار" className="dark:bg-stone-900">پرستار</option>
                <option value="مدیر" className="dark:bg-stone-900">مدیر</option>
              </select>
              <p className="text-[10px] text-stone-400 mt-1 mr-1">پزشکان را از بخش مدیریت پزشکان اضافه کنید.</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-4 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/10 rounded-2xl font-bold transition-colors">انصراف</button>
              <button type="submit" className="flex-1 bg-stone-800/90 dark:bg-stone-100/90 text-white dark:text-stone-900 py-4 rounded-2xl hover:shadow-lg transition-all font-bold backdrop-blur-sm">ثبت</button>
            </div>
          </form>
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.length === 0 ? (
             <div className="col-span-full glass-panel p-16 text-center text-stone-400 flex flex-col items-center animate-item">
                <UserCog className="w-12 h-12 mb-4 opacity-30" />
                <span>هیچ پرسنلی یافت نشد.</span>
             </div>
          ) : filtered.map((person, index) => (
            <div 
              key={person.national_code} 
              className="glass-card glass-hover p-6 rounded-[32px] group flex flex-col justify-between relative overflow-hidden animate-item"
              style={{ animationDelay: `${index * 50}ms` }}
            >
               
               <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${getRoleColor(person.role)} bg-opacity-20`}>
                     {getRoleIcon(person.role)}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                        onClick={() => startEdit(person)}
                        className="p-2 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                        title="ویرایش"
                    >
                        <Edit className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => handleDelete(person.national_code)}
                        className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        title="حذف"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
               </div>

               <div>
                 <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100 mb-1">{person.first_name} {person.last_name}</h3>
                 <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-4 ${getRoleColor(person.role)} bg-opacity-10 border border-current border-opacity-20`}>
                   {person.role}
                 </span>
                 
                 <div className="pt-4 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
                    <span className="text-xs font-bold">کد ملی:</span>
                    <span className="font-mono tracking-wider font-bold">{person.national_code}</span>
                 </div>
               </div>

            </div>
          ))}
      </div>

      {/* Edit Modal */}
      {editingPerson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in-up">
           <div className="glass-panel w-full max-w-lg p-8 rounded-[32px] relative shadow-2xl animate-pop border border-white/20">
              <button 
                onClick={() => setEditingPerson(null)}
                className="absolute top-6 left-6 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
              >
                 <X className="w-5 h-5 text-stone-500" />
              </button>

              <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 mb-6">
                 <Edit className="w-5 h-5 text-stone-400" />
                 ویرایش اطلاعات پرسنل
              </h2>

              <form onSubmit={handleUpdate} className="space-y-4">
                 
                 <div className="p-4 bg-stone-50 dark:bg-white/5 rounded-2xl mb-4 text-xs font-medium text-stone-500 dark:text-stone-400 border border-stone-100 dark:border-white/5 flex justify-between items-center">
                    <span>کد ملی (غیر قابل تغییر):</span>
                    <span className="font-mono font-bold text-stone-800 dark:text-stone-200 text-sm">{editingPerson.national_code}</span>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">نام</label>
                        <input 
                            className="w-full p-3 glass-input rounded-xl outline-none font-bold text-sm"
                            value={editFormData.first_name}
                            onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">نام خانوادگی</label>
                        <input 
                            className="w-full p-3 glass-input rounded-xl outline-none font-bold text-sm"
                            value={editFormData.last_name}
                            onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                        />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">نقش سازمانی</label>
                    <select 
                        className="w-full p-3 glass-input rounded-xl outline-none cursor-pointer font-bold text-sm"
                        value={editFormData.role}
                        onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                    >
                        <option value="منشی" className="dark:bg-stone-900">منشی</option>
                        <option value="پرستار" className="dark:bg-stone-900">پرستار</option>
                        <option value="مدیر" className="dark:bg-stone-900">مدیر</option>
                    </select>
                 </div>

                 <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-stone-200/50 dark:border-white/10">
                    <button 
                        type="button"
                        onClick={() => setEditingPerson(null)}
                        className="px-6 py-3 text-stone-500 hover:bg-stone-100 dark:hover:bg-white/10 rounded-xl transition-colors font-bold text-sm"
                    >
                        انصراف
                    </button>
                    <button 
                        type="submit"
                        className="px-8 py-3 bg-stone-800/90 dark:bg-stone-100/90 text-white dark:text-stone-900 rounded-xl hover:shadow-lg transition-all font-bold flex items-center gap-2 active:scale-95 text-sm backdrop-blur-sm"
                    >
                        <Save className="w-4 h-4" />
                        ذخیره تغییرات
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelList;