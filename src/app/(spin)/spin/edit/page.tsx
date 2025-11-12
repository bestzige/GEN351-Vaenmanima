'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  WheelItem,
  initialWheelConfig,
  loadConfig,
  saveConfig,
} from '@/lib/spin-wheel';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function SpinEditPage() {
  const [items, setItems] = useState<WheelItem[]>(initialWheelConfig);
  const router = useRouter();

  useEffect(() => {
    setItems(loadConfig());
  }, []);

  const handleNameChange = (index: number, value: string) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, name: value } : it))
    );
  };

  const handleWeightChange = (index: number, value: string) => {
    const num = Math.max(0, Number(value) || 0);
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, weight: num } : it))
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { name: '', weight: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const validItems = items
      .map((it) => ({
        ...it,
        name: it.name.trim(),
        weight: Math.max(0, it.weight ?? 0),
      }))
      .filter((it) => it.name !== '');

    if (validItems.length < 2) {
      alert('กรุณาเพิ่มรายการอย่างน้อยสองรายการ');
      return;
    }

    if (validItems.every((it) => (it.weight ?? 0) <= 0)) {
      alert('ต้องมีอย่างน้อย 1 รายการที่ weight > 0');
      return;
    }

    saveConfig(validItems);
    alert('✅ บันทึกเรียบร้อย!');
    router.push('/spin');
  };

  const totalWeight = useMemo(
    () => items.reduce((s, it) => s + Math.max(0, it.weight ?? 0), 0),
    [items]
  );

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            ⚙️ ตั้งค่าวงล้อ
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_160px_80px] items-center gap-2 p-2 border rounded-md"
              >
                <Input
                  placeholder="ชื่อรายการ (เช่น: ไก่)"
                  value={item.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.weight}
                    onChange={(e) => handleWeightChange(index, e.target.value)}
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-3 text-sm text-gray-600">
            น้ำหนักรวมตอนนี้: <b>{totalWeight}</b>
          </div>

          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={addItem}
              className="space-x-2"
            >
              <PlusCircle className="h-4 w-4" /> <span>เพิ่มรายการ</span>
            </Button>
            <Button
              onClick={handleSave}
              className="space-x-2 bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4" /> <span>บันทึกและไปหน้าวงล้อ</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 text-sm text-gray-500 text-center">
        <b>หมายเหตุ:</b> ยิ่ง weight เยอะ จะยิ่งมีโอกาสถูกสุ่มออกมากขึ้น
      </div>
    </div>
  );
}
