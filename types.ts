
// Enum Simulations (kept for UI logic, though schema uses varchar)
export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

export enum AppointmentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Canceled = 'Canceled',
  NoShow = 'NoShow',
}

// Updated themes: Added 'grid' (Login Style)
export type ThemeType = 
  | 'foundation' | 'creative' | 'fluid' | 'nature' | 'urban' | 'dark'
  | 'rose' | 'sky' | 'gray' | 'indigo' | 'amber' | 'stone' | 'slate' | 'fuchsia' | 'cream' | 'grid';

// Table: Personnel
export interface Personnel {
  national_code: string; // PK
  first_name: string;
  last_name: string;
  role: string;
  password?: string; // Added for authentication management
}

// Table: Patient
export interface Patient {
  patient_id: number; // PK
  first_name: string;
  last_name: string;
  national_code: string;
  birth_date: string;
  phone_number: string;
  gender: string; // Changed to string to match schema "varchar"
}

// Table: Doctor
export interface Doctor {
  doctor_id: number; // PK
  first_name: string;
  last_name: string;
  national_code: string; // Added field
  specialty: string;
  medical_system_number: string;
  password?: string; // Added for login support
  
  // UI Helper (Not in schema, but needed for Booking logic)
  work_days: string; 
}

// Table: Medicine
export interface Medicine {
  medicine_id: number; // PK
  medicine_name: string;
  dosage_medicine_name: string;
  dosage_count: number;
  consumption_time: string;
  description: string;
}

// Table: MedicalRecord
export interface MedicalRecord {
  record_id: number; // PK
  patient_id: number; // Ref -> Patient
  doctor_id: number; // Ref -> Doctor
  personnel_national_code: string; // Ref -> Personnel
  medicine_id: number; // Ref -> Medicine
  visit_date: string; // Date
  specialty: string;
  chief_complaint?: string; // Added: Self-declaration / Reason for visit
  description: string; // Doctor's diagnosis

  // UI Joins
  patient?: Patient;
  doctor?: Doctor;
  medicine?: Medicine;
  personnel?: Personnel;
}

// NOTE: Appointment table is NOT in the provided schema.
// However, to maintain the "Nobat Dehi" (Scheduling) functionality requested alongside the SQL,
// we keep this interface for the Application Layer State/Queue management.
// When a visit is completed, it writes to MedicalRecord.
export interface Appointment {
  appointment_id: number;
  tracking_code: string; // New field for user tracking
  patient_id: number;
  doctor_id: number;
  reserved_date: string;
  reserved_time: string;
  status: AppointmentStatus;
  created_at: string;
  
  patient?: Patient;
  doctor?: Doctor;
}
