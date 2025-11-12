'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PREORDER_CLOSED } from '@/lib/utils';

const OrderLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {PREORDER_CLOSED && (
        <Card
          role="alert"
          className="border-destructive/30 bg-destructive/5 my-2"
        >
          <CardContent className="py-3">
            <p className="text-sm">
              <span className="font-semibold text-destructive">
                ปิดพรีออเดอร์แล้ว
              </span>{' '}
              ขอบคุณทุกออเดอร์นะคะ/ครับ 🙏 รอบถัดไปจะแจ้งให้ทราบอีกครั้ง
            </p>
          </CardContent>
        </Card>
      )}

      {children}
    </>
  );
};

export default OrderLayout;
