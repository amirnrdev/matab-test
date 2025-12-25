import React, { useEffect, useState } from 'react';
import { db } from '../services/mockDb';
import { Patient } from '../types';
import { Search, FileText } from 'lucide-react';

interface PatientListProps {
  onViewRecords: (patientId: number) => void;
}

const PatientList: React.FC<PatientListProps> = ({ onViewRecords }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await db.getPatients();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  const filtered = patients.filter(p => 
    p.last_name.includes(searchTerm) || 
    p.national_code.includes(searchTerm) ||
    p.phone_number.includes(searchTerm)
  );

  return (
    <div className="space-y-8 relative max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-item">
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 drop-shadow-sm">لیست بیماران</h1>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5 group-focus-within:text-stone-600 transition-colors" />
          <input 
            type="text" 
            placeholder="جستجو (نام، کد ملی)..." 
            className="w-full pr-12 pl-4 py-3 glass-input rounded-2xl outline-none text-sm transition-all text-stone-700 dark:text-stone-200"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((patient, index) => (
          <div 
            key={patient.patient_id} 
            className="glass-card glass-hover p-6 rounded-3xl flex flex-col justify-between group animate-item"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100 mb-1">{patient.first_name} {patient.last_name}</h3>
                  <span className="text-xs text-stone-400 font-mono">ID: {patient.patient_id}</span>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${patient.gender === 'Male' ? 'bg-blue-50/50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-rose-50/50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300'}`}>
                  {patient.gender === 'Male' ? 'آقا' : 'خانم'}
                </span>
              </div>
              
              <div className="space-y-4 text-sm text-stone-600 dark:text-stone-300 mb-6">
                <div className="flex justify-between border-b border-stone-100/50 dark:border-white/5 pb-3">
                  <span className="text-stone-400">کد ملی:</span>
                  <span className="font-mono font-bold tracking-wider">{patient.national_code}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100/50 dark:border-white/5 pb-3">
                  <span className="text-stone-400">تاریخ تولد:</span>
                  <span className="font-mono">{patient.birth_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">شماره تماس:</span>
                  <span className="font-mono tracking-wider">{patient.phone_number}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => onViewRecords(patient.patient_id)}
              className="w-full mt-2 flex items-center justify-center gap-2 glass-input text-stone-600 dark:text-stone-300 py-3 rounded-2xl hover:bg-stone-800 hover:text-white dark:hover:bg-stone-100 dark:hover:text-stone-900 transition-all text-sm font-bold shadow-sm"
            >
               <FileText className="w-4 h-4" />
               مشاهده سوابق پزشکی
            </button>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="glass-panel p-12 text-center text-stone-400 dark:text-stone-500 rounded-3xl animate-item">بیماری یافت نشد.</div>
      )}
    </div>
  );
};

export default PatientList;