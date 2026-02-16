
import { 
  Doctor, 
  Patient, 
  Appointment, 
  AppointmentStatus, 
  MedicalRecord, 
  Personnel,
  Medicine
} from '../types';

// Dynamic API URL Logic
// We use a relative path '/api' to rely on:
// 1. Vite Proxy (in Development) -> forwards to http://localhost:3001
// 2. Express Static Serve (in Production) -> serves from same origin
const getBaseUrl = () => {
  return '/api';
};

const API_URL = getBaseUrl();

// --- MOCK DATA STORE (Fallback for Offline Mode) ---
const localStore = {
  doctors: [
    { doctor_id: 1, first_name: 'آرش', last_name: 'همتی', national_code: '1234567890', specialty: 'قلب و عروق', medical_system_number: '12345', work_days: 'شنبه,دوشنبه,چهارشنبه', password: '1234567890' },
    { doctor_id: 2, first_name: 'سارا', last_name: 'جلالی', national_code: '0987654321', specialty: 'مغز و اعصاب', medical_system_number: '67890', work_days: 'یکشنبه,سه‌شنبه', password: '0987654321' }
  ] as Doctor[],
  patients: [
    { patient_id: 1, first_name: 'محمد', last_name: 'رضایی', national_code: '1111111111', birth_date: '1365/01/01', phone_number: '09121234567', gender: 'Male' },
    { patient_id: 2, first_name: 'زهرا', last_name: 'کریمی', national_code: '2222222222', birth_date: '1370/06/15', phone_number: '09351234567', gender: 'Female' }
  ] as Patient[],
  personnel: [
    { national_code: 'admin', first_name: 'مدیر', last_name: 'سیستم', role: 'مدیر', password: '123' },
    { national_code: '100', first_name: 'مینا', last_name: 'علوی', role: 'منشی', password: '100' },
    { national_code: '200', first_name: 'پرستار', last_name: 'نمونه', role: 'پرستار', password: '200' }
  ] as Personnel[],
  medicines: [
    { medicine_id: 1, medicine_name: 'استامینوفن', dosage_medicine_name: '325mg', dosage_count: 10, consumption_time: 'هر 6 ساعت', description: 'مسکن' },
    { medicine_id: 2, medicine_name: 'آموکسی‌سیلین', dosage_medicine_name: '500mg', dosage_count: 20, consumption_time: 'هر 8 ساعت', description: 'آنتی‌بیوتیک' }
  ] as Medicine[],
  appointments: [] as Appointment[],
  records: [] as MedicalRecord[]
};

// Helper: Try fetch, if fail (NetworkError), use fallback
async function tryFetch<T>(url: string, options: RequestInit | undefined, fallback: () => Promise<T> | T): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      // If server responds with error (e.g. 401, 500), throw it
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || res.statusText);
    }
    // Safer parsing: handle empty response bodies
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err: any) {
    // If connection failed entirely (Network Error / Failed to fetch), use fallback
    // We log a clear warning that we are switching to offline mode
    if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message.includes('NetworkError')) {
       console.warn(`Server unreachable (${url}), using offline mock data.`);
       return await fallback();
    }
    throw err;
  }
}

export const db = {
  getApiUrl: () => API_URL, // Exposed for UI Diagnostics
  
  // New methods to manage API URL from UI
  setApiUrl: (url: string) => {
      // Ensure URL ends with /api if not present, but handle base urls gracefully
      let cleanUrl = url.replace(/\/$/, ""); 
      if (!cleanUrl.endsWith('/api')) {
          cleanUrl += '/api';
      }
      localStorage.setItem('MATAB_API_URL', cleanUrl);
      location.reload();
  },
  
  resetApiUrl: () => {
      localStorage.removeItem('MATAB_API_URL');
      location.reload();
  },

  checkConnection: async (): Promise<boolean> => {
    try {
        // Simple ping
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
        await fetch(`${API_URL}/doctors`, { signal: controller.signal });
        clearTimeout(timeoutId);
        return true;
    } catch {
        return false;
    }
  },

  // --- AUTH ---
  login: async (username: string, password: string, role: string): Promise<Personnel | null> => {
    return tryFetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
    }, () => {
        // Fallback Logic
        const p = localStore.personnel.find(u => u.national_code === username && u.password === password);
        if (p) {
             if (p.role !== role) throw new Error('نقش انتخاب شده صحیح نیست (آفلاین)');
             return p;
        }
        const d = localStore.doctors.find(u => u.national_code === username && u.password === password);
        if (d) {
             if (role !== 'پزشک') throw new Error('نقش شما پزشک است (آفلاین)');
             return { ...d, role: 'پزشک' } as unknown as Personnel;
        }
        throw new Error('نام کاربری یا رمز عبور اشتباه است (حالت آفلاین)');
    });
  },

  updateCredentials: async (currentNationalCode: string, newNationalCode: string, newPassword: string): Promise<Personnel> => {
      return tryFetch(`${API_URL}/update-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentNationalCode, newNationalCode, newPassword })
    }, () => {
        const pIndex = localStore.personnel.findIndex(u => u.national_code === currentNationalCode);
        if (pIndex !== -1) {
            localStore.personnel[pIndex] = { ...localStore.personnel[pIndex], national_code: newNationalCode, password: newPassword };
            return localStore.personnel[pIndex];
        }
        throw new Error('کاربر یافت نشد');
    });
  },

  // --- DOCTORS ---
  getDoctors: async (): Promise<Doctor[]> => {
    return tryFetch(`${API_URL}/doctors`, undefined, () => [...localStore.doctors]);
  },

  createDoctor: async (doctor: Omit<Doctor, 'doctor_id'>): Promise<Doctor> => {
     return tryFetch(`${API_URL}/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctor)
    }, () => {
        const newDoc = { ...doctor, doctor_id: Math.floor(Math.random() * 10000), password: doctor.national_code } as Doctor;
        localStore.doctors.push(newDoc);
        return newDoc;
    });
  },

  deleteDoctor: async (id: number) => {
     return tryFetch(`${API_URL}/doctors/${id}`, { method: 'DELETE' }, () => {
         localStore.doctors = localStore.doctors.filter(d => d.doctor_id !== id);
     });
  },

  // --- PATIENTS ---
  getPatients: async (): Promise<Patient[]> => {
    return tryFetch(`${API_URL}/patients`, undefined, () => [...localStore.patients]);
  },

  findPatientByNationalCode: async (code: string): Promise<Patient | undefined> => {
    return tryFetch(`${API_URL}/patients/${code}`, undefined, () => {
        return localStore.patients.find(p => p.national_code === code);
    });
  },

  createPatient: async (patient: Omit<Patient, 'patient_id'>): Promise<Patient> => {
    return tryFetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient)
    }, () => {
        const newPatient = { ...patient, patient_id: Math.floor(Math.random() * 10000) };
        localStore.patients.push(newPatient);
        return newPatient;
    });
  },

  updatePatient: async (updatedPatient: Patient) => {
    return tryFetch(`${API_URL}/patients/${updatedPatient.patient_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPatient)
    }, () => {
        const idx = localStore.patients.findIndex(p => p.patient_id === updatedPatient.patient_id);
        if (idx !== -1) localStore.patients[idx] = updatedPatient;
    });
  },

  // --- PERSONNEL ---
  getPersonnel: async (): Promise<Personnel[]> => {
    return tryFetch(`${API_URL}/personnel`, undefined, () => [...localStore.personnel]);
  },

  createPersonnel: async (person: Personnel): Promise<Personnel> => {
    return tryFetch(`${API_URL}/personnel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(person)
    }, () => {
        const newP = { ...person, password: person.national_code };
        localStore.personnel.push(newP);
        return newP;
    });
  },

  updatePersonnel: async (person: Personnel) => {
    return tryFetch(`${API_URL}/personnel/${person.national_code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(person)
    }, () => {
        const idx = localStore.personnel.findIndex(p => p.national_code === person.national_code);
        if(idx !== -1) localStore.personnel[idx] = person;
    });
  },

  deletePersonnel: async (nationalCode: string) => {
    return tryFetch(`${API_URL}/personnel/${nationalCode}`, { method: 'DELETE' }, () => {
        localStore.personnel = localStore.personnel.filter(p => p.national_code !== nationalCode);
    });
  },

  // --- MEDICINES ---
  getMedicines: async (): Promise<Medicine[]> => {
    return tryFetch(`${API_URL}/medicines`, undefined, () => [...localStore.medicines]);
  },

  createMedicine: async (medicine: Omit<Medicine, 'medicine_id'>): Promise<Medicine> => {
    return tryFetch(`${API_URL}/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicine)
    }, () => {
        const newM = { ...medicine, medicine_id: Math.floor(Math.random() * 10000) };
        localStore.medicines.push(newM);
        return newM;
    });
  },

  deleteMedicine: async (id: number) => {
    return tryFetch(`${API_URL}/medicines/${id}`, { method: 'DELETE' }, () => {
        localStore.medicines = localStore.medicines.filter(m => m.medicine_id !== id);
    });
  },

  // --- APPOINTMENTS ---
  getAppointments: async (): Promise<Appointment[]> => {
    return tryFetch(`${API_URL}/appointments`, undefined, () => {
        // Hydrate relations for mock view
        return localStore.appointments.map(a => ({
            ...a,
            patient: localStore.patients.find(p => p.patient_id === a.patient_id),
            doctor: localStore.doctors.find(d => d.doctor_id === a.doctor_id)
        })).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    });
  },

  getTakenSlots: async (doctorId: number, date: string): Promise<string[]> => {
    // Reusing getAppointments logic for consistency
    const all = await db.getAppointments();
    return all
      .filter(a => a.doctor_id === doctorId && a.reserved_date === date && a.status !== AppointmentStatus.Canceled)
      .map(a => a.reserved_time);
  },

  checkAvailability: async (doctorId: number, date: string, time: string): Promise<boolean> => {
    const taken = await db.getTakenSlots(doctorId, date);
    return !taken.includes(time);
  },

  createAppointment: async (appt: Omit<Appointment, 'appointment_id' | 'created_at' | 'status' | 'tracking_code'>): Promise<Appointment | null> => {
    return tryFetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...appt, created_at: new Date().toISOString() })
    }, () => {
         // Check availability in mock
         const isTaken = localStore.appointments.some(a => 
             a.doctor_id === appt.doctor_id && 
             a.reserved_date === appt.reserved_date && 
             a.reserved_time === appt.reserved_time &&
             a.status !== AppointmentStatus.Canceled
         );
         if (isTaken) throw new Error('این زمان قبلاً رزرو شده است (آفلاین).');

         const newAppt: Appointment = {
             appointment_id: Math.floor(Math.random() * 10000),
             tracking_code: 'OFF-' + Math.floor(100000 + Math.random() * 900000),
             patient_id: appt.patient_id,
             doctor_id: appt.doctor_id,
             reserved_date: appt.reserved_date,
             reserved_time: appt.reserved_time,
             status: AppointmentStatus.Pending,
             created_at: new Date().toISOString()
         };
         localStore.appointments.push(newAppt);
         return newAppt;
    });
  },

  updateAppointmentStatus: async (id: number, status: AppointmentStatus) => {
    return tryFetch(`${API_URL}/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    }, () => {
        const idx = localStore.appointments.findIndex(a => a.appointment_id === id);
        if (idx !== -1) localStore.appointments[idx].status = status;
    });
  },

  // --- MEDICAL RECORDS ---
  getMedicalRecords: async (): Promise<MedicalRecord[]> => {
    return tryFetch(`${API_URL}/medical_records`, undefined, () => {
         return localStore.records.map(r => ({
             ...r,
             patient: localStore.patients.find(p => p.patient_id === r.patient_id),
             doctor: localStore.doctors.find(d => d.doctor_id === r.doctor_id),
             medicine: localStore.medicines.find(m => m.medicine_id === r.medicine_id),
             personnel: localStore.personnel.find(p => p.national_code === r.personnel_national_code)
         })).sort((a,b) => b.record_id - a.record_id);
    });
  },

  createMedicalRecord: async (record: Omit<MedicalRecord, 'record_id'>) => {
    return tryFetch(`${API_URL}/medical_records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...record, created_at: new Date().toISOString() })
    }, () => {
        const newRecord = { ...record, record_id: Math.floor(Math.random() * 10000) };
        localStore.records.push(newRecord);
        return newRecord;
    });
  },

  updateMedicalRecord: async (updatedRecord: MedicalRecord) => {
     return tryFetch(`${API_URL}/medical_records/${updatedRecord.record_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecord)
    }, () => {
        const idx = localStore.records.findIndex(r => r.record_id === updatedRecord.record_id);
        if (idx !== -1) localStore.records[idx] = updatedRecord;
    });
  },
  
  reset: () => {
      // In offline mode, reset local store
      alert("دیتابیس آفلاین بازنشانی شد (رفرش کنید).");
      location.reload();
  }
};
