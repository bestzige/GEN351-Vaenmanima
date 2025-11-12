'use client';

import SpinWheel from '@/components/spin-wheel';
import { Button } from '@/components/ui/button';
import { loadConfig, WheelItem } from '@/lib/spin-wheel';
import { History, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const SpinPage = () => {
  const [config, setConfig] = useState<WheelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedConfig = loadConfig();
    setConfig(loadedConfig);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="text-center p-8">กำลังโหลด...</div>;
  }

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">🎰 วงล้อนำโชค</h1>

      <SpinWheel config={config} />

      <div className="mt-8 flex space-x-4">
        <Link
          href="/spin/history"
          passHref
        >
          <Button
            variant="secondary"
            className="space-x-2"
          >
            <History className="h-4 w-4" /> <span>ดูประวัติการสุ่ม</span>
          </Button>
        </Link>
        <Link
          href="/spin/edit"
          passHref
        >
          <Button
            variant="outline"
            className="space-x-2"
          >
            <Settings className="h-4 w-4" /> <span>แก้ไขการตั้งค่า</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SpinPage;
