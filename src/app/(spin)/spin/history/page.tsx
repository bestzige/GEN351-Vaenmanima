'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { loadHistory, SpinHistoryItem } from '@/lib/spin-wheel';
import { ArrowLeft, Clock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const formatTimestamp = (isoString: string) => {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleString('th-TH', options);
};

export default function SpinHistoryPage() {
  const [history, setHistory] = useState<SpinHistoryItem[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const clearHistory = () => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างประวัติการสุ่มทั้งหมด?')) {
      localStorage.removeItem('spinWheelHistory');
      setHistory([]);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center space-x-2">
          <Clock className="h-7 w-7 text-blue-600" />
          <span>ประวัติการสุ่มวงล้อ</span>
        </h1>
        <Link
          href="/spin"
          passHref
        >
          <Button
            variant="outline"
            className="space-x-2"
          >
            <ArrowLeft className="h-4 w-4" /> <span>กลับไปหน้าวงล้อ</span>
          </Button>
        </Link>
      </div>
      <hr className="mb-6" />

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-xl">
            รายการสุ่มล่าสุด ({history.length} รายการ)
          </CardTitle>
          <Button
            variant="destructive"
            onClick={clearHistory}
            disabled={history.length === 0}
            size="sm"
            className="space-x-1"
          >
            <Trash2 className="h-4 w-4" /> <span>ล้างประวัติ</span>
          </Button>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>ยังไม่มีประวัติการสุ่ม</p>
              <p className="mt-1">ไปที่หน้าวงล้อเพื่อเริ่มหมุน!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">#</TableHead>
                    <TableHead>ผลลัพธ์</TableHead>
                    <TableHead className="text-right w-[200px]">
                      เวลาที่สุ่ม
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell className="font-semibold text-lg text-green-700">
                        {item.resultName}
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-600">
                        {formatTimestamp(item.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
