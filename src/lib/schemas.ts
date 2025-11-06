import { z } from 'zod';

export const OrderFormSchema = z.object({
  name: z.string().min(2, 'กรอกชื่ออย่างน้อย 2 ตัวอักษร'),
  phone: z.string().regex(/^0\d{9}$/, 'กรอกเบอร์ 10 หลักขึ้นต้นด้วย 0'),
});
