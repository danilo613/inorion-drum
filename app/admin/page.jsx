'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'inorion_admin_pw';

// 国コード -> 国旗絵文字 (よく来そうな国だけ最低限。無ければコードのまま表示)
const FLAGS = {
  JP: '🇯🇵', MM: '🇲🇲', TH: '🇹🇭', VN: '🇻🇳', ID: '🇮🇩', PH: '🇵🇭',
  US: '🇺🇸', BR: '🇧🇷', IN: '🇮🇳', KR: '🇰🇷', TW: '🇹🇼', CN: '🇨🇳',
  XX: '🌐',
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);

  const fetchStats = useCallback(async (pw, d) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin-stats?days=${d}`, {
        headers: { 'x-admin-password': pw },
      });
      if (!res.ok) {
        setError('パスワードが違うか、取得に失敗しました');
        setAuthed(false);
        sessionStorage.removeItem(STORAGE_KEY);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStats(data.stats);
      setAuthed(true);
      sessionStorage.setItem(STORAGE_KEY, pw);
    } catch (e) {
      setError('通信に失敗しました');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPassword(saved);
      fetchStats(saved, days);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    fetchStats(password, days);
  }

  function handleDaysChange(newDays) {
    setDays(newDays);
    if (authed) fetchStats(password, newDays);
  }

  const maxCountryTotal = stats?.countries?.[0]?.total || 1;
  const maxDateTotal = Math.max(1, ...(stats?.dates?.map((d) => d.total) || [1]));

  return (
    <div style={styles.page}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      <div style={styles.wrap}>
        <div style={styles.eyebrow}>INORION DRUM</div>
        <h1 style={styles.h1}>管理画面</h1>

        {!authed && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? '確認中…' : '入る'}
            </button>
            {error && <div style={styles.error}>{error}</div>}
          </form>
        )}

        {authed && stats && (
          <>
            <div style={styles.daysRow}>
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDaysChange(d)}
                  style={{
                    ...styles.dayBtn,
                    ...(days === d ? styles.dayBtnActive : {}),
                  }}
                >
                  {d}日間
                </button>
              ))}
            </div>

            <div style={styles.summaryRow}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>合計訪問数</div>
                <div style={styles.summaryValue}>{stats.total.toLocaleString()}</div>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>国・地域数</div>
                <div style={styles.summaryValue}>{stats.countries.length}</div>
              </div>
            </div>

            <div style={styles.panel}>
              <div style={styles.panelTitle}>国別</div>
              {stats.countries.length === 0 && (
                <div style={styles.empty}>まだデータがありません</div>
              )}
              {stats.countries.map(({ country, total }) => (
                <div key={country} style={styles.barRow}>
                  <div style={styles.barLabel}>
                    <span style={{ marginRight: 6 }}>{FLAGS[country] || '🏳️'}</span>
                    {country}
                  </div>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.barFill,
                        width: `${Math.max(2, (total / maxCountryTotal) * 100)}%`,
                      }}
                    />
                  </div>
                  <div style={styles.barValue}>{total.toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div style={styles.panel}>
              <div style={styles.panelTitle}>日別推移</div>
              <div style={styles.dateChart}>
                {stats.dates.map(({ date, total }) => (
                  <div key={date} style={styles.dateCol} title={`${date}: ${total}`}>
                    <div
                      style={{
                        ...styles.dateBar,
                        height: `${Math.max(3, (total / maxDateTotal) * 100)}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={styles.dateAxis}>
                <span>{stats.dates[0]?.date}</span>
                <span>{stats.dates[stats.dates.length - 1]?.date}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const gold = '#c9a24c';
const goldBright = '#f2d488';

const styles = {
  page: {
    minHeight: '100vh',
    background: '#05060a',
    color: '#efe7d6',
    fontFamily:
      '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif',
    padding: '32px 16px 60px',
  },
  wrap: { maxWidth: 640, margin: '0 auto' },
  eyebrow: {
    fontSize: 11,
    letterSpacing: '0.3em',
    color: '#3fa79d',
    textAlign: 'center',
    marginBottom: 6,
  },
  h1: { fontSize: 22, textAlign: 'center', color: goldBright, marginBottom: 32 },
  form: { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 280, margin: '0 auto' },
  input: {
    padding: '10px 14px',
    borderRadius: 8,
    border: `1px solid ${gold}55`,
    background: '#0d0f18',
    color: '#efe7d6',
    fontSize: 14,
  },
  button: {
    padding: '10px 14px',
    borderRadius: 8,
    border: `1px solid ${gold}88`,
    background: `${gold}22`,
    color: goldBright,
    fontSize: 14,
    cursor: 'pointer',
  },
  error: { color: '#e88', fontSize: 12, textAlign: 'center' },
  daysRow: { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 },
  dayBtn: {
    padding: '6px 14px',
    borderRadius: 999,
    border: `1px solid ${gold}44`,
    background: 'transparent',
    color: '#a89e88',
    fontSize: 12,
    cursor: 'pointer',
  },
  dayBtnActive: { borderColor: `${gold}cc`, color: goldBright, background: `${gold}22` },
  summaryRow: { display: 'flex', gap: 12, marginBottom: 28 },
  summaryCard: {
    flex: 1,
    padding: '16px',
    borderRadius: 12,
    border: `1px solid ${gold}33`,
    textAlign: 'center',
  },
  summaryLabel: { fontSize: 11, color: '#a89e88', marginBottom: 6 },
  summaryValue: { fontSize: 26, color: goldBright },
  panel: {
    marginBottom: 28,
    paddingTop: 16,
    borderTop: `1px solid ${gold}33`,
  },
  panelTitle: { fontSize: 12, letterSpacing: '0.2em', color: '#a89e88', marginBottom: 14 },
  empty: { fontSize: 13, color: '#a89e88' },
  barRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  barLabel: { width: 56, fontSize: 13 },
  barTrack: { flex: 1, height: 8, background: '#ffffff0d', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', background: `linear-gradient(to right, #6b4f1c, ${gold}, ${goldBright})` },
  barValue: { width: 56, textAlign: 'right', fontSize: 13, color: goldBright },
  dateChart: { display: 'flex', alignItems: 'flex-end', gap: 2, height: 100 },
  dateCol: { flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' },
  dateBar: { width: '100%', background: `linear-gradient(to top, #6b4f1c, ${gold})`, borderRadius: '2px 2px 0 0' },
  dateAxis: { display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#a89e88', marginTop: 6 },
};
