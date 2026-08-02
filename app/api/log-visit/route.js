import { NextResponse } from 'next/server';
import { logVisit } from '../../../lib/geoStats';

// Vercelでは、Edge/Node関数に geo 情報がリクエストヘッダーとして自動付与される。
// (Vercelのドキュメントに従い、x-vercel-ip-country 等のヘッダーから取得するのが
//  現行の推奨方法。ローカル開発時はこれらのヘッダーは付与されないため、
//  未検出時は 'XX' にフォールバックする。)

export async function POST(req) {
  try {
    const country = req.headers.get('x-vercel-ip-country') || 'XX';
    const region = req.headers.get('x-vercel-ip-country-region') || '';
    const city = req.headers.get('x-vercel-ip-city') || '';

    const result = await logVisit({ country, region, city });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('log-visit error', err);
    // 失敗してもアプリ本体の体験は絶対に止めない (計測はあくまでおまけ)
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
