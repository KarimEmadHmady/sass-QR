# نظام الخصم للوجبات

## نظرة عامة
تم إضافة نظام خصم شامل للوجبات يتيح للمطاعم إضافة خصومات مؤقتة على وجباتهم مع تحديد فترة زمنية محددة.

## الميزات الجديدة

### 1. خصائص الخصم في نموذج الوجبة
```javascript
discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
discountStartDate: { type: Date, default: null },
discountEndDate: { type: Date, default: null }
```

### 2. الخصائص الافتراضية المحسوبة
- `discountedPrice`: السعر بعد تطبيق الخصم
- `isDiscountActive()`: دالة للتحقق من نشاط الخصم

## نقاط النهاية (API Endpoints)

### 1. إضافة خصم لوجبة
```
POST /api/meals/:id/discount
```

**المعاملات المطلوبة:**
```json
{
  "discountPercentage": 20,
  "discountStartDate": "2024-01-15T10:00:00.000Z",
  "discountEndDate": "2024-01-20T23:59:59.000Z"
}
```

### 2. إزالة الخصم من وجبة
```
DELETE /api/meals/:id/discount
```

### 3. جلب الوجبات ذات الخصم النشط
```
GET /api/meals/discounts/active
```

### 4. تنظيف الخصومات المنتهية
```
POST /api/meals/discounts/cleanup
```

### 5. إنشاء/تحديث وجبة مع خصم
```
POST /api/meals
PUT /api/meals/:id
```

**مع إضافة حقول الخصم:**
```json
{
  "name": { "en": "Burger", "ar": "برجر" },
  "description": { "en": "Delicious burger", "ar": "برجر لذيذ" },
  "price": 25.99,
  "categoryId": "category_id",
  "discountPercentage": 15,
  "discountStartDate": "2024-01-15T10:00:00.000Z",
  "discountEndDate": "2024-01-20T23:59:59.000Z"
}
```

## قواعد التحقق (Validation Rules)

1. **نسبة الخصم**: يجب أن تكون بين 0 و 100
2. **تواريخ الخصم**: مطلوبة عند تعيين نسبة خصم أكبر من 0
3. **تاريخ البداية**: يجب أن يكون قبل تاريخ النهاية
4. **تاريخ البداية**: لا يمكن أن يكون في الماضي
5. **التنظيف التلقائي**: يتم تنظيف الخصومات المنتهية تلقائياً

## مثال للاستخدام

### إضافة خصم 20% لمدة أسبوع
```javascript
const response = await fetch('/api/meals/meal_id/discount', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_token'
  },
  body: JSON.stringify({
    discountPercentage: 20,
    discountStartDate: new Date('2024-01-15T10:00:00.000Z'),
    discountEndDate: new Date('2024-01-22T23:59:59.000Z')
  })
});
```

### جلب السعر بعد الخصم
```javascript
// في الاستجابة ستجد:
{
  "price": 25.99,
  "discountedPrice": 20.79,
  "discountPercentage": 20,
  "isDiscountActive": true
}
```

## الميزات الأمانية

1. **التحقق من الملكية**: فقط صاحب المطعم يمكنه إدارة خصومات وجباته
2. **التحقق من الاشتراك**: يجب أن يكون المطعم مشترك نشط
3. **التحقق من التواريخ**: منع التواريخ غير المنطقية
4. **التنظيف التلقائي**: إزالة الخصومات المنتهية تلقائياً

## ملاحظات مهمة

- الخصم يتم تطبيقه تلقائياً عند عرض الوجبات
- السعر الأصلي يبقى محفوظاً ويعود تلقائياً بعد انتهاء فترة الخصم
- يمكن إضافة خصم واحد فقط لكل وجبة في نفس الوقت
- النظام يدعم الخصومات المستقبلية (تطبق في تاريخ محدد) 