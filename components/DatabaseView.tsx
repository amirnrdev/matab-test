import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { Database, Table, RefreshCw, Server, HardDrive, FileText, Trash2, AlertTriangle, Key } from 'lucide-react';

const DatabaseView: React.FC = () => {
  const [activeTable, setActiveTable] = useState<'doctors' | 'patients' | 'appointments' | 'medicines' | 'personnel' | 'medical_records'>('doctors');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);

  const tables = [
    { id: 'doctors', label: 'پزشکان (Doctors)', icon: Table },
    { id: 'patients', label: 'بیماران (Patients)', icon: Table },
    { id: 'personnel', label: 'پرسنل (Personnel)', icon: Table },
    { id: 'medicines', label: 'داروها (Medicines)', icon: Table },
    { id: 'appointments', label: 'نوبت‌ها (Appointments)', icon: Table },
    { id: 'medical_records', label: 'سوابق پزشکی (Records)', icon: FileText },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      let result: any[] = [];
      switch (activeTable) {
        case 'doctors':
          // Clone to avoid mutating original state if we modify it
          result = (await db.getDoctors()).map(d => ({
             id: d.doctor_id,
             name: `${d.first_name} ${d.last_name}`,
             code: d.national_code,
             specialty: d.specialty,
             sys_num: d.medical_system_number,
             days: d.work_days
          }));
          break;
        case 'patients':
          result = (await db.getPatients()).map(p => ({
             id: p.patient_id,
             name: `${p.first_name} ${p.last_name}`,
             code: p.national_code,
             phone: p.phone_number,
             birth: p.birth_date,
             gender: p.gender
          }));
          break;
        case 'personnel':
          result = (await db.getPersonnel()).map(p => ({
             code: p.national_code,
             name: `${p.first_name} ${p.last_name}`,
             role: p.role,
             password: '***' // Hide password
          }));
          break;
        case 'medicines':
          result = await db.getMedicines();
          break;
        case 'appointments':
          const rawAppts = await db.getAppointments();
          // Flatten for better table view
          result = rawAppts.map(a => ({
            id: a.appointment_id,
            tracking: a.tracking_code,
            patient: a.patient ? `${a.patient.first_name} ${a.patient.last_name} (${a.patient.national_code})` : `ID: ${a.patient_id}`,
            doctor: a.doctor ? `${a.doctor.first_name} ${a.doctor.last_name}` : `ID: ${a.doctor_id}`,
            date: a.reserved_date,
            time: a.reserved_time,
            status: a.status
          }));
          break;
        case 'medical_records':
           const rawRecords = await db.getMedicalRecords();
           result = rawRecords.map(r => ({
             id: r.record_id,
             patient: r.patient ? `${r.patient.first_name} ${r.patient.last_name}` : r.patient_id,
             doctor: r.doctor ? `${r.doctor.first_name} ${r.doctor.last_name}` : r.doctor_id,
             medicine: r.medicine ? r.medicine.medicine_name : '-',
             visit_date: r.visit_date,
             complaint: r.chief_complaint ? (r.chief_complaint.length > 20 ? r.chief_complaint.substring(0, 20) + '...' : r.chief_complaint) : '-',
             desc: r.description ? (r.description.length > 20 ? r.description.substring(0, 20) + '...' : r.description) : '-'
           }));
           break;
      }
      setData(result);
      if (result.length > 0) {
        setColumns(Object.keys(result[0]));
      } else {
        setColumns([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTable]);

  const handleResetDatabase = () => {
      if (window.confirm('هشدار: آیا مطمئن هستید؟\n\nبا این کار تمام تغییرات شما حذف شده و دیتابیس به داده‌های نمونه اولیه بازمی‌گردد.\nاین عملیات غیرقابل بازگشت است.')) {
          // Use the internal reset method of the new pure JS db
          (db as any).reset();
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-mac-window pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-item">
        <div>
           <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-3 drop-shadow-sm">
             <div className="bg-stone-200/50 dark:bg-stone-800/50 p-2 rounded-xl text-stone-600 dark:text-stone-300 backdrop-blur-sm">
                <Database className="w-6 h-6" />
             </div>
             مشاهده دیتابیس داخلی
           </h1>
           <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 font-medium">نمایش داده‌های خام (JSON Objects)</p>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={handleResetDatabase}
                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 px-5 py-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all font-bold text-sm shadow-sm active:scale-95 border border-red-200 dark:border-red-800/50"
            >
                <Trash2 className="w-4 h-4" />
                بازنشانی دیتابیس
            </button>
            <button 
                onClick={fetchData}
                className="flex items-center gap-2 glass-card text-stone-600 dark:text-stone-300 px-5 py-3 rounded-xl hover:bg-stone-800 hover:text-white dark:hover:bg-stone-100 dark:hover:text-stone-900 transition-all font-bold text-sm shadow-sm active:scale-95"
            >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                بروزرسانی
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar: Table List */}
        <div className="glass-panel p-4 rounded-3xl h-fit animate-item" style={{animationDelay: '100ms'}}>
           <div className="flex items-center gap-2 mb-4 px-2 text-stone-400 dark:text-stone-500 font-bold text-xs uppercase tracking-wider">
              <Server className="w-4 h-4" />
              <span>آرایه‌های موجود</span>
           </div>
           <div className="space-y-2">
              {tables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTable(t.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTable === t.id 
                      ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 shadow-md scale-105' 
                      : 'hover:bg-stone-100 dark:hover:bg-white/5 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
           </div>

           <div className="mt-6 pt-6 border-t border-stone-200/50 dark:border-white/10 px-2 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                 <HardDrive className="w-3 h-3" />
                 <span>Engine: Native JS Objects</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-green-500 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/10 p-2 rounded-lg">
                 <AlertTriangle className="w-3 h-3" />
                 <span>Status: In-Memory (Fast)</span>
              </div>
           </div>
        </div>

        {/* Main Content: Data Grid */}
        <div className="lg:col-span-3 glass-panel rounded-3xl overflow-hidden shadow-lg border border-stone-200/50 dark:border-white/10 animate-item flex flex-col min-h-[500px]" style={{animationDelay: '200ms'}}>
           
           {/* Grid Toolbar */}
           <div className="bg-stone-100/50 dark:bg-white/5 px-6 py-4 flex justify-between items-center border-b border-stone-200/50 dark:border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2">
                 <Table className="w-5 h-5 text-stone-500" />
                 <span className="font-bold text-stone-800 dark:text-stone-100 font-mono text-lg capitalize">{activeTable.replace('_', ' ')}</span>
                 <span className="bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded text-xs font-mono ml-2 font-bold">
                    {data.length} Items
                 </span>
              </div>
              <div className="flex gap-2 text-stone-400">
                 <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
           </div>

           {/* Data Table */}
           <div className="flex-1 overflow-auto custom-scrollbar bg-white/40 dark:bg-[#1e1e1e]/90 relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-8 h-8 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : data.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                   <Database className="w-12 h-12 mb-4 opacity-20" />
                   <span className="text-sm font-bold">داده‌ای یافت نشد</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky top-0 z-10 bg-stone-100 dark:bg-[#252526] p-4 text-[11px] font-black uppercase text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-white/10 w-12 text-center">
                        #
                      </th>
                      {columns.map((col) => (
                        <th key={col} className="sticky top-0 z-10 bg-stone-100 dark:bg-[#252526] p-4 text-[11px] font-black uppercase text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-white/10 whitespace-nowrap font-mono">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-white/5 transition-colors group">
                        <td className="p-4 border-b border-stone-100 dark:border-white/5 text-xs text-stone-400 text-center font-mono font-bold group-hover:text-stone-600 dark:group-hover:text-stone-300">
                          {idx + 1}
                        </td>
                        {columns.map((col) => (
                          <td key={`${idx}-${col}`} className="p-4 border-b border-stone-100 dark:border-white/5 text-xs font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap font-mono max-w-[200px] truncate">
                            {/* Render Object/Array as string, otherwise raw value */}
                            {typeof row[col] === 'object' && row[col] !== null 
                              ? JSON.stringify(row[col]) 
                              : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
           </div>

           {/* Footer */}
           <div className="bg-stone-100/50 dark:bg-white/5 px-4 py-2 border-t border-stone-200/50 dark:border-white/10 text-[10px] text-stone-400 font-mono flex justify-between font-bold">
              <span>Persistence: LocalStorage</span>
              <span>Mode: In-Memory JS</span>
           </div>
        </div>

      </div>
    </div>
  );
};

export default DatabaseView;