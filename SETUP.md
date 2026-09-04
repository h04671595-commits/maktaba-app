# إعداد قاعدة البيانات

## الخطوة 1: إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد باسم `library-form` أو أي اسم تفضله
3. من لوحة التحكم، اضغط على أيقونةFirestore Database
4. أنشئ قاعدة بيانات جديدة (اختر وضع Development للبداية)

## الخطوة 2: تحميل مفتاح الخادم

1. من Firebase Console، اذهب إلى Project Settings (齿轮图标)
2. اختر تبويب "Service accounts"
3. اضغط على "Generate new private key"
4. حفظ الملف باسم `serviceAccountKey.json` في مجلد المشروع

## الخطوة 3: تثبيت المكتبات وتشغيل الخادم

```bash
npm install
npm start
```

## الخطوة 4: فتح الموقع

افتح المتصفح واذهب إلى:
```
http://localhost:3000
```

## ملاحظات مهمة

- لا تشارك ملف `serviceAccountKey.json` مع أي شخص
- تأكد من إضافة الملف إلى `.gitignore` إذا كنت تستخدم Git
- للعرض كـ admin لجميع المشاركات، اذهب إلى:
  ```
  http://localhost:3000/api/submissions
  ```
