import { NextResponse } from 'next/server';
import Pusher from 'pusher';

// このエンドポイントは Pusher の presence チャンネル(「今このチャンネルに誰がいるか」を
// 教えてくれる仕組み)を使うために必須の認証窓口。app_id と secret はここでしか使わない
// (ブラウザ側のコードには一切書かない)。
// key と cluster は公開情報(ブラウザ側の play.html にも同じ値を直書きしている)なので、
// ここでは環境変数を増やさずリテラルで持たせる。

const PUSHER_KEY = '5af11c1071a586b5404d';
const PUSHER_CLUSTER = 'ap3';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(req) {
  try {
    if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_SECRET) {
      return NextResponse.json({ error: 'pusher not configured' }, { status: 500 });
    }

    const form = await req.formData();
    const socketId = form.get('socket_id');
    const channelName = form.get('channel_name');

    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'missing socket_id or channel_name' }, { status: 400 });
    }

    // presence チャンネル以外の認証は今のところ扱わない
    if (!channelName.startsWith('presence-')) {
      return NextResponse.json({ error: 'unsupported channel' }, { status: 400 });
    }

    // ログイン機能はないので、接続のたびに匿名の一時IDを発行するだけ。
    // 個人を特定する情報は一切含めない。
    const userId = 'guest-' + Math.random().toString(36).slice(2, 10);

    const authResponse = pusher.authorizeChannel(socketId, channelName, {
      user_id: userId,
      user_info: {},
    });

    return NextResponse.json(authResponse);
  } catch (err) {
    console.error('pusher-auth error', err);
    return NextResponse.json({ error: 'auth failed' }, { status: 500 });
  }
}
