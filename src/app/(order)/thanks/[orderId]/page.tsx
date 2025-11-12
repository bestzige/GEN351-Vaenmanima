'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Clock, MapPin, MessageCircle, Receipt } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const OrderSuccess = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const pickupTime = 'วันที่ 13 พฤศจิกายน เวลา 09:00 - 12:30 น.';
  const pickupPlace = 'ตึกศิลปาศาสตร์ (Sola Building) ชั้น 1 (B13)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-[80vh] flex items-center justify-center bg-linear-to-b from-red-50 to-white"
    >
      <Card className="w-full max-w-md text-center shadow-lg border-0">
        <CardHeader className="pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="mx-auto mb-2 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"
          >
            <Receipt className="text-green-600 w-8 h-8" />
          </motion.div>
          <CardTitle className="text-2xl font-semibold text-green-700">
            รับออเดอร์เรียบร้อย 🎉
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-gray-700">
          <Image
            src="/images/meekai-logo.png"
            alt="หมี่ไก่ฉีก"
            width={250}
            height={100}
            className="object-cover mx-auto mb-4 rounded-md"
          />

          <div>
            <span className="text-sm text-muted-foreground">ORDER ID</span>
            <div className="font-mono text-lg font-medium text-primary">
              {orderId}
            </div>
          </div>

          <div className="rounded-lg bg-green-50 p-3 text-sm leading-relaxed">
            ขอบคุณมากค่ะ/ครับ 💚
            <br />
            ทางร้านได้รับออเดอร์แล้ว และจะตรวจสอบสลิปก่อนดำเนินการ
          </div>

          <div className="pt-2 border-t text-left space-y-2 text-sm md:text-md">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>
                รับได้ที่ <b>{pickupPlace}</b>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>
                ช่วงเวลา <b>{pickupTime}</b>
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-center gap-3">
          <Button
            asChild
            variant="secondary"
            className="rounded-full px-6"
          >
            <Link
              href="https://www.instagram.com/vaenmanima"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              ติดต่อร้าน
            </Link>
          </Button>

          <Button
            asChild
            className="rounded-full px-6"
          >
            <Link href="/">สั่งเพิ่มอีก</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default OrderSuccess;
