import { NextResponse } from 'next/server';
import Pusher from 'pusher';

// トグルをONにしていない人にも「今誰かが演奏中かどうか」を知らせるための、
// 読み取り専用のエンドポイント。presence チャンネルに実際に入室(メンバー登録)
// しなくても、Pusher の REST API 経由でチャンネルの在室人数だけを覗き見できる。
// これにより「見るだけの人」が誤ってカウントに混ざることもない。

const PUSHER_KEY = '5af11c1071a586b5404d';
const PUSHER_CLUSTER = 'ap3';
const SCALE_KEYS = ['arcane', 'enigma', 'equinox', 'tonus'];

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: PUSHER_CLUSTER,
  useTLS: true,
});

export async function GET() {
  try {
    if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_SECRET) {
      return NextResponse.json({ error: 'pusher not configured' }, { status: 500 });
    }

    const result = await pusher.get({
      path: '/channels',
      params: { filter_by_prefix: 'presence-scale-', info: 'user_count' },
    });
    const body = await result.json();
    const channels = body.channels || {};

    const counts = {};
    SCALE_KEYS.forEach((key) => {
      const info = channels['presence-scale-' + key];
      counts[key] = info ? (info.user_count || 0) : 0;
    });

    return NextResponse.json(
      { counts },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('scale-presence error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
