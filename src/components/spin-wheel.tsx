'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COLORS, WheelItem, saveNewHistory } from '@/lib/spin-wheel';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface SpinWheelProps {
  config: WheelItem[];
}

type DisplaySegment = {
  start: number;
  end: number;
  index: number;
};

const SpinWheel = ({ config }: SpinWheelProps) => {
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);

  const { segmentAngle, gradientCss, displayRanges, totalWeight } =
    useMemo(() => {
      const n = config.length;
      if (n === 0) {
        return {
          segmentAngle: 0,
          gradientCss: 'none',
          displayRanges: [] as DisplaySegment[],
          totalWeight: 0,
        };
      }

      const angle = 360 / n;
      let cur = 0;
      const ranges: DisplaySegment[] = [];

      const parts: string[] = [];

      for (let i = 0; i < n; i++) {
        const start = cur;
        const end = cur + angle;
        const color = COLORS[i % COLORS.length];
        parts.push(`${color} ${start}deg ${end}deg`);
        ranges.push({ start, end, index: i });
        cur = end;
      }

      const tw = config.reduce((s, it) => s + Math.max(0, it.weight ?? 0), 0);

      return {
        segmentAngle: angle,
        gradientCss: parts.join(', '),
        displayRanges: ranges,
        totalWeight: tw,
      };
    }, [config]);

  const POINTER_ANGLE = 0;
  const duration = 3.5;

  const handleSpin = () => {
    if (isSpinning || config.length < 2 || totalWeight <= 0) return;

    setIsSpinning(true);
    setResult(null);

    const r = Math.random() * totalWeight;
    let acc = 0;
    let wIndex = 0;
    for (let i = 0; i < config.length; i++) {
      acc += Math.max(0, config[i].weight ?? 0);
      if (r < acc) {
        wIndex = i;
        break;
      }
    }
    setWinnerIndex(wIndex);

    const seg = displayRanges[wIndex];
    const segSize = seg.end - seg.start;

    const offset =
      segSize > 10 ? Math.random() * (segSize - 10) + 5 : segSize / 2;
    const targetInternalAngle = seg.start + offset;

    setRotation((prev) => {
      const current = ((prev % 360) + 360) % 360;
      let delta = POINTER_ANGLE - targetInternalAngle - current;
      delta = ((delta % 360) + 360) % 360;
      return prev + 5 * 360 + delta;
    });
  };

  const onSpinComplete = () => {
    if (winnerIndex != null) {
      const name = config[winnerIndex]?.name ?? '';
      setResult(name);
      if (name) saveNewHistory(name);
    }
    setIsSpinning(false);
    setWinnerIndex(null);
  };

  const renderItemText = () => {
    const radius = 120;

    return displayRanges.map((seg) => {
      const mid = (seg.start + seg.end) / 2;
      const x = radius * Math.cos((mid - 90) * (Math.PI / 180));
      const y = radius * Math.sin((mid - 90) * (Math.PI / 180));
      const name = config[seg.index]?.name ?? '';

      return (
        <motion.div
          key={`${name}-${seg.index}`}
          className="absolute text-center text-md w-20 wrap-break-word"
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            transform: `translate(-50%, -50%) rotate(${mid}deg)`,
            color: 'white',
            textShadow: '0 0 2px rgba(0,0,0,0.8)',
          }}
        >
          {name}
        </motion.div>
      );
    });
  };

  if (config.length < 2 || totalWeight <= 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-yellow-50">
        <p className="text-lg font-semibold">
          ⚠️ ตั้งค่ารายการ/น้ำหนักไม่เพียงพอ
        </p>
        <p className="text-sm mt-1">
          ไปที่{' '}
          <Link
            href="/spin/edit"
            className="text-blue-500 underline"
          >
            /spin/edit
          </Link>
          เพื่อเพิ่มรายการและ weight &gt; 0
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-0 h-0 border-t-25 border-l-15 border-r-15 border-solid border-t-red-600 border-l-transparent border-r-transparent -mb-3 z-10" />
      <motion.div
        className={cn(
          'w-80 h-80 rounded-full border-8 border-gray-800 shadow-xl relative cursor-pointer',
          isSpinning ? 'opacity-90' : 'opacity-100'
        )}
        style={{
          background: `conic-gradient(from -90deg, ${gradientCss})`,
        }}
        animate={{ rotate: rotation }}
        transition={{ type: 'tween', ease: 'easeOut', duration }}
        onAnimationComplete={onSpinComplete}
        onClick={handleSpin}
      >
        {renderItemText()}
      </motion.div>

      <div className="mt-8 space-y-4 w-full max-w-sm">
        <Button
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full h-12 text-xl bg-blue-600 hover:bg-blue-700 space-x-2"
        >
          <RefreshCw
            className={cn('h-5 w-5', isSpinning ? 'animate-spin' : '')}
          />
          <span>{isSpinning ? 'กำลังหมุน...' : 'หมุนวงล้อ!'}</span>
        </Button>

        <Card
          className={cn(
            'transition-all duration-300',
            result ? 'border-green-500 shadow-lg' : 'border-gray-200'
          )}
        >
          <CardHeader>
            <CardTitle className="text-2xl text-center">ผลลัพธ์:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center font-extrabold text-4xl text-green-700 h-10">
              {result ? '🎉 ' + result : '...'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpinWheel;
