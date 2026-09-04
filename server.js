require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('نوع الملف غير مدعوم'));
  }
});

let db = null;
let firebaseError = null;

function initFirebase() {
  if (db) return db;
  try {
    let serviceAccount;
    if (process.env.SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
    } else {
      serviceAccount = require('./serviceAccountKey.json');
    }
    if (!serviceAccount.project_id || serviceAccount.project_id.startsWith('YOUR_')) {
      throw new Error('لم يتم إعداد بيانات Firebase. ضع مفتاح الخدمة الحقيقي في serviceAccountKey.json');
    }
    const databaseURL = process.env.DATABASE_URL || `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`;
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL
    });
    db = admin.database();
    firebaseError = null;
  } catch (error) {
    firebaseError = error;
    db = null;
  }
  return db;
}

initFirebase();

function encodeFileToBase64(file) {
  return {
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    data: file.buffer.toString('base64')
  };
}

app.post('/api/submit', upload.array('attachments', 5), async (req, res) => {
  const database = initFirebase();
  if (!database) {
    return res.status(500).json({
      success: false,
      message: 'Firebase غير مُهيأ. أضف مفتاح الخدمة الحقيقي في serviceAccountKey.json',
      error: firebaseError ? firebaseError.message : ''
    });
  }
  try {
    const formData = {
      childName: req.body.child_name,
      childAge: parseInt(req.body.child_age),
      guardianPhone: req.body.guardian_phone,
      province: req.body.province || '',
      municipality: req.body.municipality,
      gender: req.body.gender,
      guardianName: req.body.guardian_name,
      relationship: req.body.relationship || '',
      guardianConsent: req.body.guardian_consent === 'on',
      files: [],
      createdAt: admin.database.ServerValue.TIMESTAMP
    };

    if (req.files && req.files.length > 0) {
      formData.files = [];
      for (const file of req.files) {
        formData.files.push(encodeFileToBase64(file));
      }
      const totalBytes = formData.files.reduce((sum, f) => sum + f.size, 0);
      if (totalBytes > 6 * 1024 * 1024) {
        return res.status(413).json({
          success: false,
          message: 'إجمالي حجم الملفات كبير جداً (الحد الأقصى 6MB). يرجى رفع صور/رسومات أصغر.'
        });
      }
    }

    const newRef = await db.ref('submissions').push(formData);
    res.status(201).json({
      success: true,
      message: 'تم إرسال النموذج بنجاح',
      id: newRef.key
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إرسال النموذج',
      error: error.message
    });
  }
});

app.get('/api/submissions', async (req, res) => {
  const database = initFirebase();
  if (!database) {
    return res.status(500).json({
      success: false,
      message: 'Firebase غير مُهيأ. أضف مفتاح الخدمة الحقيقي في serviceAccountKey.json',
      error: firebaseError ? firebaseError.message : ''
    });
  }
  try {
    const snapshot = await db.ref('submissions').once('value');
    const data = snapshot.val() || {};
    const submissions = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));

    submissions.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    res.json({ success: true, data: submissions });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات',
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'code.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
