'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Turnstile from 'react-turnstile';
import { z } from 'zod';

import FileUpload from '@/components/file-upload';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getErrorMessage } from '@/lib/utils';
import Image from 'next/image';
import * as promptparse from 'promptparse';

const FormSchema = z.object({
  name: z.string().min(2, 'กรอกชื่ออย่างน้อย 2 ตัวอักษร'),
  phone: z.string().regex(/^0\d{9}$/, 'กรอกเบอร์ 10 หลักขึ้นต้นด้วย 0'),
});
type TForm = z.infer<typeof FormSchema>;

type DraftItem = { name: string; basePrice: number; addons: [] };
type Draft = { items: DraftItem[]; total: number; note?: string };

const CheckoutPage = () => {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [randomKey, setRandomKey] = useState(
    Math.random().toString(36).substring(2)
  );
  const fileRef = useRef<HTMLInputElement | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TForm>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: '', phone: '' },
  });

  useEffect(() => {
    const raw = sessionStorage.getItem('orderDraft');
    if (!raw) {
      router.replace('/');
      return;
    }
    try {
      const obj = JSON.parse(raw) as Draft;
      if (!obj?.items?.length) throw new Error('no items');
      setDraft(obj);
    } catch {
      router.replace('/');
    }
  }, [router]);

  const unit = 59;
  const count = useMemo(() => draft?.items.length ?? 0, [draft]);
  const total = useMemo(() => unit * count, [unit, count]);

  const onSubmit = async (values: TForm) => {
    if (!draft) return;
    if (!turnstileToken) {
      setErrorMsg('กรุณายืนยันว่าไม่ใช่บอท');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const fd = new FormData();
      fd.append('name', values.name);
      fd.append('phone', values.phone);
      fd.append('items', JSON.stringify(draft.items));
      fd.append('turnstileToken', turnstileToken);
      if (draft.note) fd.append('note', draft.note);
      if (fileRef.current?.files?.[0])
        fd.append('file', fileRef.current.files[0]);

      const res = await fetch('/api/order', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'สั่งซื้อไม่สำเร็จ');
      sessionStorage.removeItem('orderDraft');
      router.replace(`/thanks/${data.orderId}`);
    } catch (e: unknown) {
      setErrorMsg(getErrorMessage(e, 'เกิดข้อผิดพลาด กรุณาลองใหม่'));
      setSubmitting(false);
    } finally {
      setRandomKey(Math.random().toString(36).substring(2));
    }
  };

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  const qrImageUrl = useMemo(() => {
    const payload = promptparse.generate.anyId({
      target: process.env.NEXT_PUBLIC_PROMPTPAY_ACCOUNT_NUMBER || '',
      type: 'MSISDN',
      amount: total,
    });
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${payload}`;
  }, [total]);

  const accountName = process.env.NEXT_PUBLIC_PROMPTPAY_ACCOUNT_NAME || '';

  return (
    <form
      className="space-y-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">STEP 2: ชำระเงิน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            กรุณากรอกข้อมูลติดต่อและอัปโหลดสลิปชำระเงิน จากนั้นกดยืนยัน
          </div>
          <Separator />

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">ชื่อ</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    id="name"
                    placeholder="จะให้เราเรียกคุณว่าอะไรดี คะคนเก่ง?"
                    {...field}
                    autoFocus
                  />
                )}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {errors.name.message as string}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">เบอร์ติดต่อ</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    id="phone"
                    type="tel"
                    maxLength={10}
                    placeholder="08x-xxx-xxxx"
                    {...field}
                  />
                )}
              />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1">
                  {errors.phone.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>สรุปรายการ</Label>
            <div className="rounded-md border p-3 text-sm bg-white">
              <div className="flex justify-between py-1">
                <span>หมี่ไก่ฉีก 59x{count}</span>
                <span className="font-medium">{total}฿</span>
              </div>
              {draft?.note && (
                <div className="mt-1 text-xs text-muted-foreground">
                  หมายเหตุ:{' '}
                  <span className="font-medium text-foreground">
                    {draft.note}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Image
              src={qrImageUrl}
              alt="QR"
              className="w-64 h-64 object-contain rounded-md border p-2"
              width={256}
              height={256}
            />
            <div className="text-sm text-center">
              สแกนจ่ายที่บัญชี:{' '}
              <span className="font-semibold">{accountName}</span>
            </div>
            <div className="text-sm">
              ยอดที่ต้องชำระ:{' '}
              <span className="font-semibold text-primary">
                {total.toLocaleString()} บาท
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <FileUpload
              label="อัปโหลดสลิป"
              hint="รองรับ JPG/PNG ขนาดไม่เกิน 5MB"
              accept="image/*"
              maxSizeMB={5}
              required
              ref={fileRef}
              onFileChange={() => {
                setErrorMsg('');
              }}
            />
          </div>

          <div className="pt-2 flex justify-center">
            <Turnstile
              key={randomKey}
              theme="light"
              sitekey={siteKey}
              onSuccess={(t) => setTurnstileToken(t)}
              onExpire={() => setTurnstileToken('')}
              onError={() => setTurnstileToken('')}
            />
          </div>

          {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
        </CardContent>
        <CardFooter className="items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => history.back()}
          >
            ย้อนกลับ
          </Button>
          <Button
            type="submit"
            disabled={submitting || !turnstileToken}
          >
            {submitting ? 'กำลังส่งคำสั่งซื้อ…' : 'ยืนยันสั่งซื้อ'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CheckoutPage;
