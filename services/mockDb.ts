import { createClient } from '@supabase/supabase-js';
import { 
  Doctor, 
  Patient, 
  Appointment, 
  AppointmentStatus, 
  MedicalRecord, 
  Personnel,
  Medicine
} from '../types';

// --- SUPABASE CONFIGURATION ---
// IMPORTANT: Replace these with YOUR actual Supabase project URL and Key.
// You can find these in your Supabase Dashboard -> Project Settings -> API.
const SUPABASE_URL = 'https://wafuszdmmeincramoqjy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZnVzemRtbWVpbmNyYW1vcWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTcyOTksImV4cCI6MjA4MjIzMzI5OX0.B8GKIF2BbzFeAms2VNu40O2kt0PHyPYNOoVXXDY_sp4';

// Check if Supabase is properly configured
const isOnline = SUPABASE_URL.startsWith('https') && !SUPABASE_URL.includes('YOUR_SUPABASE');
const supabase = isOnline ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// --- FALLBACK MOCK DATA (Only used if Supabase keys are missing or offline) ---
const DEFAULT_DOCTORS: Doctor[] = [
  { doctor_id: 1, first_name: "علی", last_name: "رضایی (آفلاین)", national_code: "0011223344", specialty: "متخصص قلب", medical_system_number: "12345", work_days: "شنبه,دوشنبه", password: "123" }
];

// --- UTILS ---
export const utils = {
  isValidNationalCode: (code: string): boolean => {
    if (!/^\d{10}$/.test(code)) return false;
    const check = +code[9];
    const sum = code.split('').slice(0, 9).reduce((acc, x, i) => acc + +x * (10 - i), 0) % 11;
    return sum < 2 ? check === sum : check === 11 - sum;
  },
  
  isValidPhoneNumber: (phone: string): boolean => {
    return /^09\d{9}$/.test(phone);
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- DB ADAPTER ---
export const db = {
  
  // --- CONNECTION CHECK ---
  checkConnection: async (): Promise<boolean> => {
    if (isOnline && supabase) {
      try {
         // Try to fetch a simple count from personnel to verify connection
         const { error } = await supabase.from('personnel').select('national_code', { count: 'exact', head: true });
         return !error;
      } catch (e) {
         console.error("Connection check failed:", e);
         return false;
      }
    }
    return false;
  },

  // --- AUTH ---
  login: async (username: string, role: string, passwordAttempt: string): Promise<Personnel | null> => {
      if (isOnline && supabase) {
          // 1. Try Personnel Table
          let { data: person, error } = await supabase
            .from('personnel')
            .select('*')
            .eq('national_code', username)
            .single();
          
          if (error && error.code !== 'PGRST116') console.error('Auth Error Personnel:', error);

          // 2. If not found, Try Doctors Table
          let actualRole = '';
          let user: any = person;

          if (user) {
              actualRole = user.role;
          } else {
              const { data: doc, error: docError } = await supabase
                .from('doctors')
                .select('*')
                .eq('national_code', username)
                .single();
              
              if (doc) {
                  user = doc;
                  actualRole = 'پزشک';
              }
          }

          if (!user) throw new Error('کاربری با این مشخصات یافت نشد.');
          if (user.password !== passwordAttempt) throw new Error('رمز عبور اشتباه است.');
          if (role !== actualRole) throw new Error(`نقش شما ${actualRole} است، لطفا گزینه صحیح را انتخاب کنید.`);

          return { ...user, role: actualRole };
      } else {
          // Mock Fallback
          await delay(500);
          if (username === 'admin' && passwordAttempt === '123456') 
            return { national_code: 'admin', first_name: 'مدیر', last_name: 'آفلاین', role: 'مدیر', password: '123456' };
          throw new Error("اتصال به دیتابیس برقرار نیست و کاربر تست یافت نشد.");
      }
  },

  updateCredentials: async (currentNationalCode: string, newNationalCode: string, newPassword: string): Promise<Personnel> => {
      if (isOnline && supabase) {
          // Try updating personnel
          let { data, error } = await supabase
            .from('personnel')
            .update({ national_code: newNationalCode, password: newPassword })
            .eq('national_code', currentNationalCode)
            .select()
            .single();
          
          if (!data) {
             // Try updating doctor
             const { data: docData, error: docError } = await supabase
                .from('doctors')
                .update({ national_code: newNationalCode, password: newPassword })
                .eq('national_code', currentNationalCode)
                .select()
                .single();
             
             if (docData) return { ...docData, role: 'پزشک' };
          } else {
             return data;
          }
          throw new Error("خطا در بروزرسانی اطلاعات.");
      }
      throw new Error("در حالت آفلاین امکان تغییر رمز وجود ندارد.");
  },

  // --- DOCTORS ---
  getDoctors: async (): Promise<Doctor[]> => {
    if (isOnline && supabase) {
        const { data, error } = await supabase.from('doctors').select('*');
        if (error) throw error;
        return data || [];
    }
    return DEFAULT_DOCTORS;
  },

  createDoctor: async (doctor: Omit<Doctor, 'doctor_id'>): Promise<Doctor> => {
    if (isOnline && supabase) {
        const { data, error } = await supabase.from('doctors').insert([doctor]).select().single();
        if (error) throw error;
        return data;
    }
    return { ...doctor, doctor_id: 999 } as Doctor;
  },

  deleteDoctor: async (id: number) => {
    if (isOnline && supabase) {
        await supabase.from('doctors').delete().eq('doctor_id', id);
    }
  },

  // --- PATIENTS ---
  getPatients: async (): Promise<Patient[]> => {
    if (isOnline && supabase) {
        const { data, error } = await supabase.from('patients').select('*');
        if (error) throw error;
        return data || [];
    }
    return [];
  },

  findPatientByNationalCode: async (code: string): Promise<Patient | undefined> => {
      if (isOnline && supabase) {
          const { data, error } = await supabase.from('patients').select('*').eq('national_code', code).single();
          if (error && error.code !== 'PGRST116') return undefined;
          return data || undefined;
      }
      return undefined;
  },

  createPatient: async (patient: Omit<Patient, 'patient_id'>): Promise<Patient> => {
      if (isOnline && supabase) {
          const { data, error } = await supabase.from('patients').insert([patient]).select().single();
          if (error) throw error;
          return data;
      }
      return { ...patient, patient_id: 123 } as Patient;
  },

  updatePatient: async (updatedPatient: Patient) => {
      if (isOnline && supabase) {
          await supabase.from('patients').update(updatedPatient).eq('patient_id', updatedPatient.patient_id);
      }
  },

  // --- PERSONNEL ---
  getPersonnel: async (): Promise<Personnel[]> => {
    if (isOnline && supabase) {
        const { data, error } = await supabase.from('personnel').select('*');
        if (error) throw error;
        return data || [];
    }
    return [];
  },

  createPersonnel: async (person: Personnel): Promise<Personnel> => {
      if (isOnline && supabase) {
          const { data, error } = await supabase.from('personnel').insert([person]).select().single();
          if (error) throw error;
          return data;
      }
      return person;
  },

  deletePersonnel: async (nationalCode: string) => {
      if (isOnline && supabase) {
          await supabase.from('personnel').delete().eq('national_code', nationalCode);
      }
  },

  // --- MEDICINES ---
  getMedicines: async (): Promise<Medicine[]> => {
      if (isOnline && supabase) {
          const { data, error } = await supabase.from('medicines').select('*');
          if (error) throw error;
          return data || [];
      }
      return [];
  },

  createMedicine: async (medicine: Omit<Medicine, 'medicine_id'>): Promise<Medicine> => {
      if (isOnline && supabase) {
          const { data, error } = await supabase.from('medicines').insert([medicine]).select().single();
          if (error) throw error;
          return data;
      }
      return { ...medicine, medicine_id: 111 };
  },

  deleteMedicine: async (id: number) => {
      if (isOnline && supabase) {
          await supabase.from('medicines').delete().eq('medicine_id', id);
      }
  },

  // --- MEDICAL RECORDS ---
  getMedicalRecords: async (): Promise<MedicalRecord[]> => {
    if (isOnline && supabase) {
        // Fetch relations. Note: Personnel relation is manual due to schema limitations.
        const { data, error } = await supabase
            .from('medical_records')
            .select(`
                *,
                patient:patients(*),
                doctor:doctors(*),
                medicine:medicines(*)
            `);
        
        if (error) throw error;

        // Manually fetch personnel info to map names
        const { data: personnelList } = await supabase.from('personnel').select('national_code, first_name, last_name');
        
        return data.map((r: any) => ({
            ...r,
            personnel: personnelList?.find((p: any) => p.national_code === r.personnel_national_code)
        })) || [];
    }
    return [];
  },

  createMedicalRecord: async (record: Omit<MedicalRecord, 'record_id'>) => {
      if (isOnline && supabase) {
          // Remove expanded objects if any, keep only IDs
          const { patient, doctor, medicine, personnel, ...cleanRecord } = record as any;
          const { data, error } = await supabase.from('medical_records').insert([cleanRecord]).select().single();
          if (error) throw error;
          return data;
      }
  },

  updateMedicalRecord: async (updatedRecord: MedicalRecord) => {
      if (isOnline && supabase) {
          const { patient, doctor, medicine, personnel, ...cleanRecord } = updatedRecord as any;
          await supabase.from('medical_records').update(cleanRecord).eq('record_id', updatedRecord.record_id);
      }
  },

  // --- APPOINTMENTS ---
  getAppointments: async (): Promise<Appointment[]> => {
    if (isOnline && supabase) {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                patient:patients(*),
                doctor:doctors(*)
            `)
            .order('appointment_id', { ascending: false });
        if (error) throw error;
        return data || [];
    }
    return [];
  },

  checkAvailability: async (doctorId: number, date: string, time: string): Promise<boolean> => {
      if (isOnline && supabase) {
          const { data, error } = await supabase
            .from('appointments')
            .select('appointment_id')
            .eq('doctor_id', doctorId)
            .eq('reserved_date', date)
            .eq('reserved_time', time)
            .neq('status', 'Canceled'); // Ignore canceled appointments
          
          if (error) return false;
          return data.length === 0;
      }
      return true;
  },

  createAppointment: async (appt: Omit<Appointment, 'appointment_id' | 'created_at' | 'status' | 'tracking_code'>): Promise<Appointment | null> => {
      const isAvailable = await db.checkAvailability(appt.doctor_id, appt.reserved_date, appt.reserved_time);
      if (!isAvailable) throw new Error("این زمان قبلاً رزرو شده است.");
      
      if (isOnline && supabase) {
          const newAppt = {
              ...appt,
              tracking_code: 'TRK-' + Math.floor(100000 + Math.random() * 900000),
              status: AppointmentStatus.Pending
              // created_at is handled by DB default
          };
          
          const { data, error } = await supabase.from('appointments').insert([newAppt]).select().single();
          if (error) throw error;
          return data;
      }
      return null;
  },

  updateAppointmentStatus: async (id: number, status: AppointmentStatus) => {
      if (isOnline && supabase) {
          await supabase.from('appointments').update({ status }).eq('appointment_id', id);
      }
  }
};