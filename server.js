import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import os from 'os'; // Added to detect IP address
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for ES Modules path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001; // Support environment port for hosting

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Files (Frontend) - IMPORTANT FOR PRODUCTION
app.use(express.static(path.join(__dirname, 'dist')));

// Database Connection (Creates file 'matab_yar.db' automatically)
const db = new sqlite3.Database('./matab_yar.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database (matab_yar.db).');
    initDb();
  }
});

// Initialize Tables
function initDb() {
  db.serialize(() => {
    // 1. Patients
    db.run(`CREATE TABLE IF NOT EXISTS patients (
      patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      national_code TEXT UNIQUE NOT NULL,
      birth_date TEXT,
      phone_number TEXT,
      gender TEXT
    )`);

    // 2. Doctors
    db.run(`CREATE TABLE IF NOT EXISTS doctors (
      doctor_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      national_code TEXT UNIQUE NOT NULL,
      specialty TEXT,
      medical_system_number TEXT UNIQUE,
      work_days TEXT,
      password TEXT
    )`);

    // 3. Personnel
    db.run(`CREATE TABLE IF NOT EXISTS personnel (
      national_code TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL,
      password TEXT
    )`, (err) => {
        if (!err) {
            // Seed Admin (INSERT OR IGNORE for SQLite)
            db.run(`INSERT OR IGNORE INTO personnel (national_code, first_name, last_name, role, password) 
            VALUES ('admin', 'مدیر', 'سیستم', 'مدیر', '123')`);
        }
    });

    // 4. Medicines
    db.run(`CREATE TABLE IF NOT EXISTS medicines (
      medicine_id INTEGER PRIMARY KEY AUTOINCREMENT,
      medicine_name TEXT NOT NULL,
      dosage_medicine_name TEXT,
      dosage_count INTEGER DEFAULT 1,
      consumption_time TEXT,
      description TEXT
    )`);

    // 5. Appointments
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
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
    )`);

    // 6. Medical Records
    db.run(`CREATE TABLE IF NOT EXISTS medical_records (
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
    )`);
  });
}

// --- API ENDPOINTS ---

// Login
app.post('/api/login', (req, res) => {
  const { username, password, role } = req.body;
  
  // Check Personnel table
  db.get(`SELECT * FROM personnel WHERE national_code = ? AND password = ?`, [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (row) {
      if (row.role !== role) return res.status(400).json({ error: 'نقش انتخاب شده صحیح نیست' });
      return res.json(row);
    }

    // Check Doctors table
    db.get(`SELECT * FROM doctors WHERE national_code = ? AND password = ?`, [username, password], (err, docRow) => {
      if (err) return res.status(500).json({ error: err.message });
      if (docRow) {
         if (role !== 'پزشک') return res.status(400).json({ error: 'نقش شما پزشک است' });
         return res.json({ ...docRow, role: 'پزشک' });
      }
      return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است' });
    });
  });
});

// Update Credentials
app.post('/api/update-credentials', (req, res) => {
    const { currentNationalCode, newNationalCode, newPassword } = req.body;
    
    db.run(`UPDATE personnel SET national_code = ?, password = ? WHERE national_code = ?`, 
      [newNationalCode, newPassword, currentNationalCode], 
      function(err) {
        if (this.changes > 0) {
            db.get(`SELECT * FROM personnel WHERE national_code = ?`, [newNationalCode], (e, r) => res.json(r));
        } else {
            db.run(`UPDATE doctors SET national_code = ?, password = ? WHERE national_code = ?`,
             [newNationalCode, newPassword, currentNationalCode],
             function(err2) {
                if(this.changes > 0) {
                    db.get(`SELECT * FROM doctors WHERE national_code = ?`, [newNationalCode], (e, r) => res.json({...r, role: 'پزشک'}));
                } else {
                    res.status(404).json({error: 'کاربر یافت نشد'});
                }
             }
            )
        }
    });
});

// --- DOCTORS ---
app.get('/api/doctors', (req, res) => {
  db.all("SELECT * FROM doctors", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/doctors', (req, res) => {
  const { first_name, last_name, national_code, specialty, medical_system_number, work_days } = req.body;
  db.run(`INSERT INTO doctors (first_name, last_name, national_code, specialty, medical_system_number, work_days, password) VALUES (?,?,?,?,?,?,?)`,
    [first_name, last_name, national_code, specialty, medical_system_number, work_days, national_code],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ doctor_id: this.lastID, ...req.body });
    }
  );
});

app.delete('/api/doctors/:id', (req, res) => {
  db.run(`DELETE FROM doctors WHERE doctor_id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

// --- PATIENTS ---
app.get('/api/patients', (req, res) => {
  db.all("SELECT * FROM patients", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/patients/:code', (req, res) => {
    db.get("SELECT * FROM patients WHERE national_code = ?", [req.params.code], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      // FIX: Return null explicitly if undefined to ensure valid JSON is sent
      res.json(row || null);
    });
});

app.post('/api/patients', (req, res) => {
  const { first_name, last_name, national_code, birth_date, phone_number, gender } = req.body;
  db.run(`INSERT INTO patients (first_name, last_name, national_code, birth_date, phone_number, gender) VALUES (?,?,?,?,?,?)`,
    [first_name, last_name, national_code, birth_date, phone_number, gender],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ patient_id: this.lastID, ...req.body });
    }
  );
});

app.put('/api/patients/:id', (req, res) => {
    const { first_name, last_name, national_code, birth_date, phone_number, gender } = req.body;
    db.run(`UPDATE patients SET first_name=?, last_name=?, national_code=?, birth_date=?, phone_number=?, gender=? WHERE patient_id=?`,
      [first_name, last_name, national_code, birth_date, phone_number, gender, req.params.id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Updated' });
      }
    );
});

// --- PERSONNEL ---
app.get('/api/personnel', (req, res) => {
    db.all("SELECT * FROM personnel", [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
});

app.post('/api/personnel', (req, res) => {
    const { national_code, first_name, last_name, role } = req.body;
    db.run(`INSERT INTO personnel (national_code, first_name, last_name, role, password) VALUES (?,?,?,?,?)`,
      [national_code, first_name, last_name, role, national_code],
      function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ ...req.body });
      }
    );
});

app.put('/api/personnel/:code', (req, res) => {
    const { first_name, last_name, role } = req.body;
    db.run(`UPDATE personnel SET first_name=?, last_name=?, role=? WHERE national_code=?`,
      [first_name, last_name, role, req.params.code],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Updated' });
      }
    );
});

app.delete('/api/personnel/:code', (req, res) => {
    db.run(`DELETE FROM personnel WHERE national_code = ?`, [req.params.code], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Deleted' });
    });
});

// --- MEDICINES ---
app.get('/api/medicines', (req, res) => {
    db.all("SELECT * FROM medicines", [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
});

app.post('/api/medicines', (req, res) => {
    const { medicine_name, dosage_medicine_name, dosage_count, consumption_time, description } = req.body;
    db.run(`INSERT INTO medicines (medicine_name, dosage_medicine_name, dosage_count, consumption_time, description) VALUES (?,?,?,?,?)`,
      [medicine_name, dosage_medicine_name, dosage_count, consumption_time, description],
      function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ medicine_id: this.lastID, ...req.body });
      }
    );
});

app.delete('/api/medicines/:id', (req, res) => {
    db.run(`DELETE FROM medicines WHERE medicine_id = ?`, [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Deleted' });
    });
});

// --- APPOINTMENTS ---
app.get('/api/appointments', (req, res) => {
    const query = `
        SELECT 
            a.*,
            p.first_name as p_first, p.last_name as p_last, p.national_code as p_code,
            d.first_name as d_first, d.last_name as d_last, d.specialty as d_spec
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.patient_id
        LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
        ORDER BY a.created_at DESC
    `;
    db.all(query, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const structured = rows.map(row => ({
          ...row,
          patient: row.p_first ? { first_name: row.p_first, last_name: row.p_last, national_code: row.p_code } : null,
          doctor: row.d_first ? { first_name: row.d_first, last_name: row.d_last, specialty: row.d_spec } : null
      }));
      res.json(structured);
    });
});

app.post('/api/appointments', (req, res) => {
    const { patient_id, doctor_id, reserved_date, reserved_time, created_at } = req.body;
    let { tracking_code, status } = req.body;

    // Fix: Generate tracking code if missing
    if (!tracking_code) {
        tracking_code = Math.floor(10000000 + Math.random() * 90000000).toString();
    }
    
    // Default status
    if (!status) status = 'Pending';
    
    // Check availability
    db.all(`SELECT * FROM appointments WHERE doctor_id=? AND reserved_date=? AND reserved_time=? AND status != 'Canceled'`,
        [doctor_id, reserved_date, reserved_time],
        (err, rows) => {
            if (rows && rows.length > 0) return res.status(409).json({ error: 'این زمان قبلاً رزرو شده است.' });
            
            db.run(`INSERT INTO appointments (tracking_code, patient_id, doctor_id, reserved_date, reserved_time, status, created_at) VALUES (?,?,?,?,?,?,?)`,
                [tracking_code, patient_id, doctor_id, reserved_date, reserved_time, status, created_at],
                function(err) {
                    if (err) return res.status(400).json({ error: err.message });
                    res.json({ 
                        appointment_id: this.lastID, 
                        tracking_code, 
                        patient_id, 
                        doctor_id, 
                        reserved_date, 
                        reserved_time, 
                        status, 
                        created_at 
                    });
                }
            );
        }
    );
});

app.put('/api/appointments/:id/status', (req, res) => {
    const { status } = req.body;
    db.run(`UPDATE appointments SET status=? WHERE appointment_id=?`, [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Updated' });
    });
});

// --- MEDICAL RECORDS ---
app.get('/api/medical_records', (req, res) => {
    const query = `
        SELECT 
            r.*,
            p.first_name as p_first, p.last_name as p_last, p.national_code as p_code,
            d.first_name as d_first, d.last_name as d_last,
            m.medicine_name, m.dosage_medicine_name, m.consumption_time as m_time,
            per.first_name as per_first, per.last_name as per_last
        FROM medical_records r
        LEFT JOIN patients p ON r.patient_id = p.patient_id
        LEFT JOIN doctors d ON r.doctor_id = d.doctor_id
        LEFT JOIN medicines m ON r.medicine_id = m.medicine_id
        LEFT JOIN personnel per ON r.personnel_national_code = per.national_code
        ORDER BY r.record_id DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const structured = rows.map(row => ({
            ...row,
            patient: row.p_first ? { first_name: row.p_first, last_name: row.p_last, national_code: row.p_code } : null,
            doctor: row.d_first ? { first_name: row.d_first, last_name: row.d_last } : null,
            medicine: row.medicine_name ? { medicine_name: row.medicine_name, dosage_medicine_name: row.dosage_medicine_name, consumption_time: row.m_time } : null,
            personnel: row.per_first ? { first_name: row.per_first, last_name: row.per_last } : null
        }));
        res.json(structured);
    });
});

app.post('/api/medical_records', (req, res) => {
    const { patient_id, doctor_id, personnel_national_code, medicine_id, visit_date, specialty, chief_complaint, description, created_at } = req.body;
    // Fix: Handle empty medicine_id by converting to null
    const finalMedicineId = medicine_id || null;
    
    db.run(`INSERT INTO medical_records (patient_id, doctor_id, personnel_national_code, medicine_id, visit_date, specialty, chief_complaint, description, created_at) VALUES (?,?,?,?,?,?,?,?,?)`,
        [patient_id, doctor_id, personnel_national_code, finalMedicineId, visit_date, specialty, chief_complaint, description, created_at || new Date().toISOString()],
        function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ record_id: this.lastID, ...req.body });
        }
    );
});

app.put('/api/medical_records/:id', (req, res) => {
    const { chief_complaint, description, medicine_id } = req.body;
    // Fix: Handle empty medicine_id by converting to null
    const finalMedicineId = medicine_id || null;
    
    db.run(`UPDATE medical_records SET chief_complaint=?, description=?, medicine_id=? WHERE record_id=?`,
        [chief_complaint, description, finalMedicineId, req.params.id],
        function(err) {
             if (err) return res.status(500).json({ error: err.message });
             res.json({ message: 'Updated' });
        }
    );
});

// --- SPA Fallback for Production ---
// This must be the LAST route.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Bind to 0.0.0.0 to allow access from local network
app.listen(PORT, '0.0.0.0', () => {
    // Detect and print the local IP address for the user
    const interfaces = os.networkInterfaces();
    let lanIp = 'localhost';
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal (127.0.0.1) and non-IPv4 addresses
            if ('IPv4' !== iface.family || iface.internal) {
                continue;
            }
            // Usually the first external IPv4 is the LAN IP
            lanIp = iface.address;
        }
    }

    console.log('\n==================================================');
    console.log(`🚀 APPLICATION IS READY!`);
    console.log(`💻 On this PC:      http://localhost:${PORT}`);
    console.log(`📱 On your Mobile:  http://${lanIp}:${PORT}`);
    console.log('==================================================');
    console.log(`(NOTE: If mobile cannot connect, turn off Windows Firewall)\n`);
});