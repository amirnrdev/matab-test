import React, { useEffect, useState } from 'react';
import { db } from '../services/mockDb';
import { MedicalRecord, Patient, Personnel, Medicine } from '../types';
import { Search, FileText, Calendar, User, Stethoscope, Pill, ClipboardList, Fingerprint, X, Edit, Save, CheckCircle } from 'lucide-react';

interface MedicalRecordsViewProps {
  targetPatientId: number | null;
  onClearFilter: () => void;
  currentUser: Personnel;
}

const MedicalRecordsView: React.FC<MedicalRecordsViewProps> = ({ targetPatientId, onClearFilter, currentUser }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]); // Load medicines for edit dropdown
  const [searchTerm, setSearchTerm] = useState('');
  const [targetPatient, setTargetPatient] = useState<Patient | undefined>(undefined);

  // Edit State
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [editChiefComplaint, setEditChiefComplaint] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editMedicineId, setEditMedicineId] = useState<number | ''>('');

  useEffect(() => {
    loadData();
    db.getMedicines().then(setMedicines); // Load medicines list
  }, [targetPatientId]);

  const loadData = async () => {
    // Load all records with relations
    const allRecords = await db.getMedicalRecords();
    setRecords(allRecords);

    // If specific patient is requested, clear other searches
    if (targetPatientId) {
       const patients = await db.getPatients();
       const patient = patients.find(p => p.patient_id === targetPatientId);
       setTargetPatient(patient);
       setSearchTerm(''); 
    } else {
       setTargetPatient(undefined);
    }
  };

  const filtered = records.filter(r => {
    // 1. If target filter exists, strictly filter by ID
    if (targetPatientId) {
      return r.patient_id === targetPatientId;
    }
    // 2. Otherwise use search box
    return (
      r.patient?.last_name.includes(searchTerm) || 
      r.patient?.national_code.includes(searchTerm) ||
      r.doctor?.last_name.includes(searchTerm) ||
      r.description.includes(searchTerm)
    );
  });

  const sorted = [...filtered].sort((a, b) => 
    new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
  );

  const handleEditClick = (record: MedicalRecord) => {
    setEditingRecord(record);
    setEditChiefComplaint(record.chief_complaint || '');
    setEditDescription(record.description || '');
    setEditMedicineId(record.medicine_id || '');
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;

    if (!editDescription.trim()) {
      alert("توضیحات پزشک نمی‌تواند خالی باشد.");
      return;
    }

    const updatedRecord: MedicalRecord = {
      ...editingRecord,
      chief_complaint: editChiefComplaint,
      description: editDescription,
      medicine_id: Number(editMedicineId),
      // Update the modifier logic if needed, currently keeping original doctor
    };

    try {
      db.updateMedicalRecord(updatedRecord);
      setEditingRecord(null);
      loadData(); // Refresh list
    } catch (e) {
      alert("خطا در ویرایش اطلاعات");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-item">
        <div>
           <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 drop-shadow-sm">
             <div className="bg-stone-200/50 dark:bg-stone-800/50 p-2 rounded-xl text-stone-600 dark:text-stone-300 backdrop-blur-sm">
                <FileText className="w-6 h-6" />
             </div>
             {targetPatient ? `پرونده‌های پزشکی: ${targetPatient.first_name} ${targetPatient.last_name}` : 'پرونده‌های پزشکی و سوابق'}
           </h1>
           <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 font-medium">آرشیو کامل ویزیت‌ها، خود اظهاری‌ها و تجویزهای انجام شده</p>
        </div>
        
        {targetPatient ? (
          <button 
            onClick={onClearFilter}
            className="flex items-center gap-2 glass-card text-stone-600 dark:text-stone-300 px-5 py-2.5 rounded-xl hover:bg-white/80 dark:hover:bg-white/10 transition-all font-bold text-sm shadow-sm"
          >
            <X className="w-4 h-4" />
            نمایش همه بیماران
          </button>
        ) : (
          <div className="relative w-full md:w-96 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5 group-focus-within:text-stone-600 dark:group-focus-within:text-stone-200 transition-colors" />
            <input 
              type="text" 
              placeholder="جستجو (نام بیمار، کد ملی، پزشک...)" 
              className="w-full pr-12 pl-4 py-3 glass-input rounded-2xl outline-none text-sm transition-all text-stone-700 dark:text-stone-200"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sorted.length === 0 ? (
          <div className="glass-panel rounded-3xl p-16 text-center text-stone-400 dark:text-stone-500 border border-white/50 dark:border-white/5 shadow-sm flex flex-col items-center animate-item">
            <div className="bg-stone-100/50 dark:bg-stone-800/50 p-4 rounded-full mb-4">
               <FileText className="w-12 h-12 opacity-30" />
            </div>
            <p className="font-medium">
              {targetPatient 
                ? 'هیچ سابقه‌ای برای این بیمار ثبت نشده است.' 
                : 'هیچ پرونده پزشکی با مشخصات وارد شده یافت نشد.'}
            </p>
          </div>
        ) : sorted.map((record, index) => (
          <div 
            key={record.record_id} 
            className="glass-card glass-hover rounded-3xl overflow-hidden group border border-white/60 dark:border-white/10 animate-item"
            style={{ animationDelay: `${index * 100}ms` }}
          >
             
             {/* Header Section */}
             <div className="bg-white/30 dark:bg-white/5 p-5 border-b border-white/50 dark:border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 backdrop-blur-md">
                <div className="flex items-center gap-4">
                   <div className="bg-gradient-to-tr from-stone-400/80 to-stone-500/80 dark:from-stone-600/80 dark:to-stone-700/80 p-3 rounded-2xl shadow-lg shadow-stone-300/50 dark:shadow-black/40 text-white backdrop-blur-sm">
                     <User className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100">
                        {record.patient?.first_name} {record.patient?.last_name}
                      </h3>
                      <div className="text-xs text-stone-500 dark:text-stone-400 flex gap-2 font-mono mt-1 opacity-80">
                        <span>کد ملی: {record.patient?.national_code}</span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                   <div className="px-4 py-1.5 bg-white/50 dark:bg-white/10 border border-white/60 dark:border-white/5 rounded-full text-stone-600 dark:text-stone-300 flex items-center gap-2 backdrop-blur-sm" title="شناسه پرونده">
                      <Fingerprint className="w-4 h-4 text-stone-400" />
                      <span className="font-mono font-bold">ID: {record.record_id}</span>
                   </div>
                   <div className="px-4 py-1.5 bg-white/50 dark:bg-white/10 border border-white/60 dark:border-white/5 rounded-full text-stone-600 dark:text-stone-300 flex items-center gap-2 backdrop-blur-sm">
                      <Calendar className="w-4 h-4 text-stone-500" />
                      <span dir="ltr" className="font-bold">{record.visit_date}</span>
                   </div>
                   
                   {/* Edit Button - Visible to Doctor, Admin, Nurse */}
                   <button 
                      onClick={() => handleEditClick(record)}
                      className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-800 hover:text-white dark:hover:bg-stone-100 dark:hover:text-stone-900 rounded-full transition-all duration-300 text-stone-500 shadow-sm ml-2"
                      title="ویرایش پرونده"
                   >
                      <Edit className="w-4 h-4" />
                   </button>
                </div>
             </div>

             {/* Content Section */}
             <div className="p-6 flex flex-col md:flex-row gap-8">
                
                {/* Left Col: Doctor Info */}
                <div className="md:w-1/4 space-y-4 border-l-0 md:border-l border-stone-200/40 dark:border-white/10 md:pl-8">
                   <div className="p-4 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/50 dark:border-white/5">
                     <span className="text-xs text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider block mb-2">پزشک معالج</span>
                     <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2 text-lg">
                        <Stethoscope className="w-5 h-5 text-stone-500" />
                        {record.doctor?.first_name} {record.doctor?.last_name}
                     </div>
                     <span className="text-xs text-stone-600 dark:text-stone-400 inline-block bg-stone-200/50 dark:bg-stone-800/50 px-2 py-1 rounded-lg mt-2 font-bold">
                       {record.specialty}
                     </span>
                   </div>
                   
                   <div className="px-2">
                     <span className="text-xs text-stone-400 dark:text-stone-500 font-bold block mb-1">ثبت کننده</span>
                     <div className="text-sm text-stone-600 dark:text-stone-400 font-medium">
                        {record.personnel?.first_name} {record.personnel?.last_name}
                     </div>
                   </div>
                </div>

                {/* Right Col: Diagnosis Details */}
                <div className="md:w-3/4 space-y-6">
                   
                   {/* Chief Complaint (Self Declaration) */}
                   <div className="bg-orange-50/50 dark:bg-orange-900/10 backdrop-blur-sm p-5 rounded-2xl border border-orange-100/50 dark:border-orange-800/30">
                      <div className="flex items-center gap-2 text-stone-700 dark:text-orange-200 font-bold mb-2">
                         <div className="p-1 bg-orange-100/50 dark:bg-orange-900/30 rounded-lg">
                            <ClipboardList className="w-4 h-4" />
                         </div>
                         <h4>خود اظهاری بیمار (شکایت اصلی)</h4>
                      </div>
                      <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed font-medium">
                        {record.chief_complaint || "توضیحاتی ثبت نشده است."}
                      </p>
                   </div>

                   {/* Doctor's Diagnosis */}
                   <div className="pl-2">
                      <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-3 flex items-center gap-2">
                         <FileText className="w-5 h-5 text-stone-400" />
                         تشخیص و توضیحات پزشک
                      </h4>
                      <p className="text-stone-600 dark:text-stone-300 text-sm leading-7 border-r-4 border-stone-300/50 dark:border-stone-700 pr-4 mr-1">
                        {record.description}
                      </p>
                   </div>

                   {/* Medicine */}
                   {record.medicine && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-stone-100/50 dark:bg-stone-800/40 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/50 dark:border-white/5 text-sm transition-colors hover:bg-stone-100/80 dark:hover:bg-stone-800/60">
                      <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-bold min-w-[120px] bg-white/50 dark:bg-white/10 p-2 rounded-xl">
                        <Pill className="w-5 h-5" />
                        <span>تجویز دارو:</span>
                      </div>
                      <div className="text-stone-700 dark:text-stone-300 flex flex-wrap items-center gap-2">
                        <span className="font-bold text-lg text-stone-800 dark:text-stone-100">{record.medicine.medicine_name}</span>
                        <span className="text-stone-300 dark:text-stone-600 text-xs">●</span>
                        <span className="bg-white/60 dark:bg-white/10 px-2 py-1 rounded-lg">{record.medicine.dosage_medicine_name}</span>
                        <span className="text-stone-300 dark:text-stone-600 text-xs">●</span>
                        <span className="text-stone-800 dark:text-stone-200 font-medium">{record.medicine.consumption_time}</span>
                      </div>
                    </div>
                   )}
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* --- EDIT MODAL --- */}
      {editingRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in-up">
           <div className="glass-panel w-full max-w-2xl p-6 md:p-8 rounded-[32px] relative shadow-2xl animate-pop">
              <button 
                onClick={() => setEditingRecord(null)}
                className="absolute top-6 left-6 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
              >
                 <X className="w-5 h-5 text-stone-500" />
              </button>

              <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 mb-6">
                 <Edit className="w-5 h-5 text-stone-400" />
                 ویرایش پرونده پزشکی
              </h2>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar px-1">
                 {/* Read-Only Info */}
                 <div className="grid grid-cols-2 gap-4 text-xs text-stone-500 dark:text-stone-400 bg-stone-50/50 dark:bg-white/5 p-4 rounded-2xl mb-4">
                    <div>بیمار: <span className="font-bold text-stone-800 dark:text-stone-200">{editingRecord.patient?.first_name} {editingRecord.patient?.last_name}</span></div>
                    <div>پزشک: <span className="font-bold text-stone-800 dark:text-stone-200">{editingRecord.doctor?.last_name}</span></div>
                    <div>تاریخ: <span className="font-bold text-stone-800 dark:text-stone-200 font-mono">{editingRecord.visit_date}</span></div>
                    <div>شناسه: <span className="font-bold text-stone-800 dark:text-stone-200 font-mono">{editingRecord.record_id}</span></div>
                 </div>

                 {/* Edit Fields */}
                 <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">شکایت اصلی بیمار</label>
                    <textarea 
                      className="w-full p-3 glass-input rounded-xl outline-none font-bold text-sm min-h-[80px]"
                      value={editChiefComplaint}
                      onChange={(e) => setEditChiefComplaint(e.target.value)}
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">تشخیص و توضیحات پزشک</label>
                    <textarea 
                      className="w-full p-3 glass-input rounded-xl outline-none font-bold text-sm min-h-[120px]"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">داروی تجویزی</label>
                    <select 
                      className="w-full p-3 glass-input rounded-xl outline-none cursor-pointer font-bold text-sm"
                      value={editMedicineId}
                      onChange={(e) => setEditMedicineId(Number(e.target.value))}
                    >
                      <option value="" className="dark:bg-stone-800">بدون دارو / انتخاب دارو...</option>
                      {medicines.map(m => (
                        <option key={m.medicine_id} value={m.medicine_id} className="dark:bg-stone-800">
                          {m.medicine_name} - {m.dosage_medicine_name}
                        </option>
                      ))}
                    </select>
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-stone-200/50 dark:border-white/10">
                 <button 
                   onClick={() => setEditingRecord(null)}
                   className="px-6 py-3 text-stone-500 hover:bg-stone-100 dark:hover:bg-white/10 rounded-xl transition-colors font-bold text-sm"
                 >
                   انصراف
                 </button>
                 <button 
                   onClick={handleSaveEdit}
                   className="px-8 py-3 bg-stone-800/90 dark:bg-stone-100/90 text-white dark:text-stone-900 rounded-xl hover:shadow-lg transition-all font-bold flex items-center gap-2 active:scale-95 text-sm backdrop-blur-sm"
                 >
                   <Save className="w-4 h-4" />
                   ذخیره تغییرات
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default MedicalRecordsView;