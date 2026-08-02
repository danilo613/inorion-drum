'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // ページを開いたら1回だけ来訪ログを送る(失敗しても無視してOK)
    fetch('/api/log-visit', { method: 'POST' }).catch(() => {});
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#05060a',
        color: '#f2d488',
        fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
        textAlign: 'center',
        padding: 20,
      }}
    >
      <div>
        <div style={{ fontSize: 12, letterSpacing: '0.3em', color: '#3fa79d', marginBottom: 12 }}>
          INORION DRUM
        </div>
        <div style={{ fontSize: 14, color: '#a89e88' }}>
          ここに本編のグーダドラムアプリを移植していきます
        </div>
      </div>
    </div>
  );
}
