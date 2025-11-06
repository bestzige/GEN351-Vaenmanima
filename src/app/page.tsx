'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

const FormSchema = z.object({
  qty: z.number().int().min(1, 'อย่างน้อย 1 กล่อง').max(99, 'มากสุด 99 กล่อง'),
  note: z.string().max(200).optional(),
});
type TForm = z.infer<typeof FormSchema>;

const Page = () => {
  const router = useRouter();
  const basePrice = 59;
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TForm>({
    resolver: zodResolver(FormSchema),
    defaultValues: { qty: 1, note: '' },
  });

  const qty = watch('qty') ?? 1;
  const note = watch('note') ?? '';
  const total = useMemo(() => basePrice * qty, [qty]);

  const inc = () =>
    setValue('qty', Math.min((Number(qty) || 1) + 1, 99), {
      shouldValidate: true,
    });
  const dec = () =>
    setValue('qty', Math.max((Number(qty) || 1) - 1, 1), {
      shouldValidate: true,
    });

  const goCheckout = () => {
    const payloadItems = Array.from({ length: qty }, () => ({
      name: 'หมี่ไก่ฉีก',
      basePrice,
      addons: [] as any[],
    }));
    const draft = { items: payloadItems, total, note };
    sessionStorage.setItem('orderDraft', JSON.stringify(draft));
    router.push('/checkout');
  };

  return (
    <form
      className="space-y-2"
      onSubmit={handleSubmit(goCheckout)}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">STEP 1: เลือกรายการ</CardTitle>
        </CardHeader>
        <CardContent>
          <Image
            src="/images/meekai-logo.png"
            alt="หมี่ไก่ฉีก"
            width={250}
            height={100}
            className="object-cover mx-auto mb-4 rounded-md"
          />
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-sm text-muted-foreground">
            เลือกรายการ “หมี่ไก่ฉีก” ราคา {basePrice} บาท ต่อ 1 กล่อง
          </div>
        </CardFooter>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="mb-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center">
                หมี่ไก่ฉีก
                <Badge
                  variant="secondary"
                  className="ml-2"
                >
                  {basePrice}฿
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              หมี่, ไก่ฉีก, หมูกระจก, ผัก, กระเทียมเจียว
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">จำนวน</div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={dec}
                  aria-label="ลดจำนวน"
                >
                  –
                </Button>
                <span className="w-10 text-center text-sm">{qty}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={inc}
                  aria-label="เพิ่มจำนวน"
                >
                  +
                </Button>
              </div>
            </div>

            {errors.qty && (
              <p className="text-xs text-destructive">
                {errors.qty.message as string}
              </p>
            )}

            <div className="flex flex-col gap-1">
              <label
                htmlFor="note"
                className="text-sm"
              >
                เพิ่มเติม (ถ้ามี)
              </label>
              <textarea
                id="note"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
                maxLength={200}
                onChange={(e) => setValue('note', e.target.value)}
                placeholder="เช่น ไม่ใส่ผัก ฯลฯ"
              />
            </div>

            {errors.note && (
              <p className="text-xs text-destructive">
                {errors.note.message as string}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">สรุป</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            หมี่ไก่ฉีก {basePrice}x{qty} ={' '}
            <span className="font-semibold text-primary">
              {total.toLocaleString()} บาท
            </span>
          </div>
          {note && (
            <div className="text-xs text-muted-foreground">
              หมายเหตุ:{' '}
              <span className="font-medium text-foreground">{note}</span>
            </div>
          )}
          <Separator />
          <div className="text-xs text-muted-foreground">
            กด "ชำระเงิน" เพื่อไปกรอกชื่อ/เบอร์ และอัปโหลดสลิป
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">ชำระเงิน</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default Page;
