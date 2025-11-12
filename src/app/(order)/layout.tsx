'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { PREORDER_CLOSED } from '@/lib/utils';

type OrderLayoutProps = {
  children: React.ReactNode;
};

export default function OrderLayout({ children }: OrderLayoutProps) {
  return (
    <>
      {PREORDER_CLOSED && (
        <Card
          role="alert"
          className="my-2 border-destructive/30 bg-destructive/5"
        >
          <CardContent className="py-3">
            <p className="text-sm">
              <span className="font-semibold text-destructive">
                ปิดพรีออเดอร์แล้ว
              </span>{' '}
              ขอบคุณทุกออเดอร์นะคะ/ครับ 🙏 รอบถัดไปจะแจ้งให้ทราบอีกครั้ง
            </p>
          </CardContent>

          <CardFooter className="pt-0 text-sm text-muted-foreground">
            พบกันที่ วันที่ 13 พฤศจิกายน เวลา 09:00 - 12:30 น. ที่ตึกศิลปาศาสตร์
            (Sola Building) ชั้น 1 (B13)
          </CardFooter>
        </Card>
      )}

      {children}
    </>
  );
}
