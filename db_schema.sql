
-- Matab Yar Database Schema

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  national_code TEXT UNIQUE NOT NULL,
  birth_date TEXT,
  phone_number TEXT,
  gender TEXT
);

-- 2. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  doctor_id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  national_code TEXT UNIQUE NOT NULL,
  specialty TEXT,
  medical_system_number TEXT UNIQUE,
  work_days TEXT,
  password TEXT
);

-- 3. Personnel Table
CREATE TABLE IF NOT EXISTS personnel (
  national_code TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL,
  password TEXT
);

-- 4. Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
  medicine_id INTEGER PRIMARY KEY AUTOINCREMENT,
  medicine_name TEXT NOT NULL,
  dosage_medicine_name TEXT,
  dosage_count INTEGER DEFAULT 1,
  consumption_time TEXT,
  description TEXT
);

-- 5. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracking_code TEXT UNIQUE NOT NULL,
  patient_id INTEGER,
  doctor_id INTEGER,
  reserved_date TEXT NOT NULL,
  reserved_time TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TEXT,
  FOREIGN KEY(patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  FOREIGN KEY(doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
);

-- 6. Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
  record_id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER,
  doctor_id INTEGER,
  personnel_national_code TEXT,
  medicine_id INTEGER,
  visit_date TEXT,
  specialty TEXT,
  chief_complaint TEXT,
  description TEXT,
  created_at TEXT,
  FOREIGN KEY(patient_id) REFERENCES patients(patient_id) ON DELETE SET NULL,
  FOREIGN KEY(doctor_id) REFERENCES doctors(doctor_id) ON DELETE SET NULL,
  FOREIGN KEY(personnel_national_code) REFERENCES personnel(national_code) ON DELETE SET NULL,
  FOREIGN KEY(medicine_id) REFERENCES medicines(medicine_id) ON DELETE SET NULL
);
