// src/services/gasApi.ts
//
// GAS Web Apps ไม่รองรับ CORS preflight (OPTIONS)
// วิธีแก้:
//   GET  → ใช้ fetch() ปกติ (no preflight)
//   POST → ส่งเป็น application/x-www-form-urlencoded
//          แทน application/json เพื่อหลีกเลี่ยง preflight
//          แล้วให้ Code.gs อ่านจาก e.parameter แทน e.postData
//
import type { GSheetRow, UpdatePayload } from '@/types';

const GAS_URL = import.meta.env.VITE_GAS_URL as string;

// ── GET ──────────────────────────────────────────────────────
export async function fetchProgress(): Promise<GSheetRow[]> {
  const res = await fetch(`${GAS_URL}?t=${Date.now()}`, {
    method: 'GET',
    redirect: 'follow',
  });
  const data = await res.json();
  if (!data.success)
    throw new Error(data.error);
  return data.data as GSheetRow[];
}

export async function fetchTable(tableName: string): Promise<any[]> {
  const res = await fetch(`${GAS_URL}?t=${Date.now()}&table=${tableName}`, {
    method: 'GET',
    redirect: 'follow',
  });
  const data = await res.json();
  if (!data.success)
    throw new Error(data.error);
  return data.data;
}

// ── POST helper — ส่งเป็น form-urlencoded (no preflight) ────
async function gasPost(body: Record<string, string>): Promise<any> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  });
  const data = await res.json();
  if (!data.success)
    throw new Error(data.error);
  return data;
}

export async function updateAction(payload: UpdatePayload): Promise<void> {
  await gasPost({
    action: 'update',
    payload: JSON.stringify(payload),
  });
}

export async function bulkUpdateActions(
  payloads: UpdatePayload[],
): Promise<void> {
  await gasPost({
    action: 'bulkUpdate',
    payloads: JSON.stringify(payloads),
  });
}

export async function updateTableRow(tableName: string, payload: any): Promise<void> {
  await gasPost({
    action: 'update',
    table: tableName,
    payload: JSON.stringify(payload),
  });
}

export async function deleteTableRow(tableName: string, id: string): Promise<void> {
  await gasPost({
    action: 'delete',
    table: tableName,
    payload: JSON.stringify({ id }),
  });
}
