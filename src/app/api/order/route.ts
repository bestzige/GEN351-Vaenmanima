import { OrderFormSchema } from '@/lib/schemas';
import { appendOrder } from '@/lib/sheets';
import { fireAndForget, getErrorMessage } from '@/lib/utils';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const verifyTurnstile = async (token: string | null) => {
  if (!token) return false;
  const secret = process.env.TURNSTILE_SECRET_KEY!;
  try {
    const resp = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: token }),
      }
    );
    const data = await resp.json();
    return !!data.success;
  } catch {
    return false;
  }
};

const buildOneLineSummary = (qty: number, unit: number) =>
  `หมี่ไก่ฉีก ${unit}x${qty} = ${unit * qty} บาท`;

const sendDiscord = async (payload: {
  orderId: string;
  name: string;
  phone: string;
  qty: number;
  unit: number;
  total: number;
  note?: string;
  slipUrl?: string;
}) => {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;

  const line = buildOneLineSummary(payload.qty, payload.unit);

  const content = [
    `🧾 **New Order** \`${payload.orderId}\``,
    `👤 ${payload.name} | 📞 ${payload.phone}`,
    `• ${line}`,
    payload.note ? `📝 Note: ${payload.note}` : '',
    `💰 รวม: **${payload.total.toLocaleString()} บาท**`,
    payload.slipUrl ? `🖼️ Slip: ${payload.slipUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  } catch {}
};

const computeAndValidate = async (clientItems: any[]) => {
  const basePrice = 59;
  const qty = Array.isArray(clientItems) ? clientItems.length : 0;
  const total = basePrice * qty;
  const normalizedItems =
    qty > 0 ? [{ name: 'หมี่ไก่ฉีก', basePrice, addons: [], qty }] : [];
  const summary = buildOneLineSummary(qty, basePrice);
  return { total, qty, unit: basePrice, normalizedItems, summary };
};

export const POST = async (req: NextRequest) => {
  try {
    const ct = req.headers.get('content-type') || '';

    if (ct.includes('multipart/form-data')) {
      const form = await req.formData();
      const name = (form.get('name') as string) || '';
      const phone = (form.get('phone') as string) || '';
      const itemsRaw = (form.get('items') as string) || '[]';
      const note = ((form.get('note') as string) || '').slice(0, 200); // รับ note
      const file = form.get('file') as File | null;
      const tToken =
        (form.get('cf-turnstile-response') as string) ||
        (form.get('turnstileToken') as string) ||
        null;

      const ok = await verifyTurnstile(tToken);
      if (!ok)
        return NextResponse.json(
          { error: 'การยืนยันบอทไม่ผ่าน กรุณาลองใหม่' },
          { status: 400 }
        );

      const parsed = OrderFormSchema.pick({
        name: true,
        phone: true,
      }).safeParse({ name, phone });
      if (!parsed.success)
        return NextResponse.json(
          { error: parsed.error.issues },
          { status: 400 }
        );

      const clientItems = JSON.parse(itemsRaw);
      const { total, qty, unit, normalizedItems } = await computeAndValidate(
        clientItems
      );

      const orderId = nanoid(10);

      let slipUrl = '';
      if (file) {
        const bucket = process.env.R2_BUCKET_NAME!;
        const publicBase = process.env.R2_PUBLIC_BASE_URL!;
        const buf = Buffer.from(await file.arrayBuffer());
        const ext =
          (file.type?.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '') ||
          'png';
        const key = `slips/slip_${orderId}_${Date.now()}.${ext}`;

        await R2.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buf,
            ContentType: file.type || 'image/png',
          })
        );

        slipUrl = `${publicBase.replace(/\/+$/, '')}/${key}`;
      }

      await appendOrder({
        timestampISO: new Date().toISOString(),
        orderId,
        customerName: parsed.data.name,
        phone: parsed.data.phone,
        itemsJSON: JSON.stringify(normalizedItems),
        total,
        status: 'PENDING',
        note,
        slipUrl,
      });

      fireAndForget(
        sendDiscord({
          orderId,
          name: parsed.data.name,
          phone: parsed.data.phone,
          qty,
          unit,
          total,
          note,
          slipUrl,
        })
      );

      return NextResponse.json({
        ok: true,
        orderId,
        total,
        slipUploaded: !!file,
      });
    }

    const json = await req.json();
    const tToken = (json?.turnstileToken as string) || null;
    const note = (json?.note as string | undefined)?.slice(0, 200) || '';
    const ok = await verifyTurnstile(tToken);
    if (!ok)
      return NextResponse.json(
        { error: 'การยืนยันบอทไม่ผ่าน กรุณาลองใหม่' },
        { status: 400 }
      );

    const parsed = OrderFormSchema.pick({ name: true, phone: true }).safeParse({
      name: json?.name,
      phone: json?.phone,
    });
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

    const { total, qty, unit, normalizedItems } = await computeAndValidate(
      json?.items || []
    );
    const orderId = nanoid(10);

    await appendOrder({
      timestampISO: new Date().toISOString(),
      orderId,
      customerName: parsed.data.name,
      phone: parsed.data.phone,
      itemsJSON: JSON.stringify(normalizedItems),
      total,
      status: 'PENDING',
      note,
    });

    fireAndForget(
      sendDiscord({
        orderId,
        name: parsed.data.name,
        phone: parsed.data.phone,
        qty,
        unit,
        total,
        note,
      })
    );

    return NextResponse.json({ ok: true, orderId, total });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(e, 'เกิดข้อผิดพลาด กรุณาลองใหม่') },
      { status: 500 }
    );
  }
};
