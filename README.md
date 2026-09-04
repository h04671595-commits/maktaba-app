# مكتبة المطالعة العمومية بوعينان — استمارة التسجيل + لوحة الأدمن

تطبيق ويب لاستمارة تسجيل طفل مع رفع ملفات (رسم/صورة) ولوحة أدمن مدمجة.
Backend: Node.js + Express. البيانات: Firebase Realtime Database.

**تخزين الملفات:** تُحوَّل صور ورسومات الأطفال إلى نص Base64 وتُخزَّن مباشرة داخل سجل الطفل في
Realtime Database. هذا الحل مجاني بالكامل (يُجنّب خطة Firebase Blaze المدفوعة) ويبقي الملفات
دائمة على Firebase مهما أُعيد نشر الخادم. الحد الأقصى لإجمالي الملفات المرفوعة: 6MB لكل استمارة.

---

## 1) المتطلبات المسبقة

- مشروع Firebase فعّال (Realtime Database) مع مفتاح خدمة `serviceAccountKey.json`.
- الملاحظة: **لا حاجة لتفعيل Firebase Storage** — الحفظ يتم داخل قاعدة البيانات نفسها.

---

## 2) التشغيل محلياً للتطوير

```bash
npm install
npm run dev        # أو: node server.js
# يفتح على http://localhost:3000
```

يُقرأ مفتاح الخدمة من `serviceAccountKey.json` (أو من متغير البيئة `SERVICE_ACCOUNT_JSON` إن وُجد).

---

## 3) النشر على Render (مجاني)

### طريقة A — عبر Blueprint (render.yaml)
1. ادفع المشروع إلى مستودع GitHub (الملفات: `server.js`, `package.json`, `package-lock.json`, `public/`, `render.yaml`, `Procfile`).
   لاحظ: `.gitignore` يستثني `node_modules`, `.env`, `serviceAccountKey.json`.
2. في Render: **New → Blueprint** واختر المستودع.
3. سيُطلب منك إدخال المتغيرات السرية قبل/بعد الإنشاء:
   - `ADMIN_PASSWORD` → كلمة مرور الأدمن
   - `SERVICE_ACCOUNT_JSON` → **محتوى `serviceAccountKey.json` كاملاً** (انسخ الكل)

### طريقة B — Web Service يدوي
1. فرّغ المستودع على GitHub (بدون `serviceAccountKey.json`).
2. Render → **New → Web Service** → اختر المستودع.
3. Runtime: **Node** | Build: `npm install` | Start: `node server.js`.
4. أضف المتغيرات: `ADMIN_PASSWORD`, `SERVICE_ACCOUNT_JSON`.
5. أنشئ الخدمة وانتظر حتى يصبح `Live`.

---

## 4) بعد التشغيل
- الموقع الرئيسي (الاستمارة): `https://<your-app>.onrender.com/`
- لوحة الأدمن المدمجة: من الاستمارة اضغط زر الترس ⚙ أعلى الصفحة، ثم سجّل بكلمة المرور.
- لوحة الأدمن المنفصلة: `https://<your-app>.onrender.com/admin`

---

## المتغيرات البيئية

| المتغير | الوصف | مثال |
|---|---|---|
| `ADMIN_PASSWORD` | كلمة مرور لوحة الأدمن | `maktaba123@` |
| `SERVICE_ACCOUNT_JSON` | محتوى `serviceAccountKey.json` (JSON مضغوط) | `{...}` |
| `PORT` | منفذ الخادم (Render يضبطه تلقائياً) | `3000` |
| `DATABASE_URL` | اختياري — يُشتق من project_id إن تُرك | — |

---

## نقاط ملاحظة
- الملفات تُخزّن كـ Base64 داخل RTDB؛ إجمالي الملفات لكل استمارة محدّد بـ 6MB لتفادي تجاوز
  حدود حجم قاعدة البيانات المجانية.
- لملفات أكبر أو أرشفة ضخمة، قد تحتاج خطة Blaze + Firebase Storage — لكن الحل الحالي مجاني تماماً.
