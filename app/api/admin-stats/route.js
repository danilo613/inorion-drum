import { NextResponse } from 'next/server';
import { getStats } from '../../../lib/geoStats';

// 簡易パスワード保護。.env の ADMIN_PASSWORD と一致しないとデータを返さない。
// 本格的な認証(NextAuth等)に差し替えたくなったら、ここだけ差し替えればいい。

export async function GET(req) {
  const password = req.headers.get('x-admin-password') || '';

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const days = Number(req.nextUrl.searchParams.get('days') || 30);
  const stats = await getStats({ days });

  return NextResponse.json({ ok: true, stats });
}
