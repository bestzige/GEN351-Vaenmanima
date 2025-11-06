'use server';
import { sheetsClient } from './google';

const SHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
const SHEET_NAME = process.env.GOOGLE_SHEETS_WORKSHEET_NAME || 'Orders';

export type OrderRow = {
  timestampISO: string;
  orderId: string;
  customerName: string;
  phone: string;
  itemsJSON: string;
  total: number;
  status: 'PENDING' | 'PAID' | 'SENT';
  note?: string;
  slipUrl?: string;
};

type OrderItem = {
  name: string;
  basePrice: number;
  qty?: number;
  addons: { label: string; unitPrice: number; qty: number }[];
};

const formatItemsHuman = (itemsJson: string): string => {
  try {
    const items = JSON.parse(itemsJson) as OrderItem[];
    if (!Array.isArray(items) || items.length === 0) return '';

    return items
      .map((it) => {
        const unitBase = Number(it.basePrice) || 0;
        const qty = Math.max(1, Number(it.qty) || 1);
        const addons = Array.isArray(it.addons) ? it.addons : [];
        const addonsPerUnit = addons.reduce(
          (s, a) => s + (Number(a.unitPrice) || 0) * (Number(a.qty) || 0),
          0
        );

        const perUnit = unitBase + addonsPerUnit;
        const lineTotal = perUnit * qty;

        const parts = addons
          .filter((a) => (a.qty || 0) > 0)
          .map((a) => `${a.label} (${Number(a.unitPrice) || 0}x${a.qty})`);

        const unitText = qty > 1 ? `${perUnit}x${qty}` : `${perUnit}`;

        return `- ${
          parts.length
            ? `${it.name} (${unitText}; ${parts.join(', ')}) = ${lineTotal} บาท`
            : `${it.name} (${unitText}) = ${lineTotal} บาท`
        }`;
      })
      .join('\n');
  } catch {
    return itemsJson;
  }
};

const HEADERS = [
  'Timestamp', // A
  'OrderID', // B
  'Name', // C
  'Phone', // D
  'Items', // E
  'Total', // F
  'Status', // G
  'Note', // H
  'SlipURL', // I
];

export const ensureHeaderRow = async () => {
  const sheets = sheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1:I1`,
  });

  const current = res.data.values?.[0] || [];
  const equal =
    current.length === HEADERS.length &&
    HEADERS.every((h, i) => (current[i] || '').toString().trim() === h);

  if (!equal) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:I1`,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADERS] },
    });
  }
};

export const appendOrder = async (row: OrderRow) => {
  const sheets = sheetsClient();
  await ensureHeaderRow();

  const itemsHuman = formatItemsHuman(row.itemsJSON);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:I`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [
        [
          row.timestampISO,
          row.orderId,
          row.customerName,
          row.phone,
          itemsHuman,
          row.total,
          row.status || 'PENDING',
          row.note || '',
          row.slipUrl || '',
        ],
      ],
    },
  });
};
