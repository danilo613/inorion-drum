import { kv } from '@vercel/kv';

/**
 * 来訪ログの記録・集計まわりのヘルパー。
 * キー設計:
 *   visit:count:{country}:{YYYY-MM-DD}  -> その国・その日の訪問回数 (INCR)
 *   visit:countries                     -> これまでに記録した国コードのSET
 *   visit:dates                         -> これまでに記録した日付のSET
 *
 * シンプルさ優先: テーブル設計やマイグレーション不要、キーをインクリメントするだけ。
 */

function todayKey(date = new Date()) {
  // YYYY-MM-DD (UTC基準)
  return date.toISOString().slice(0, 10);
}

export async function logVisit({ country, region, city }) {
  const cc = (country || 'XX').toUpperCase();
  const date = todayKey();

  const countKey = `visit:count:${cc}:${date}`;

  await Promise.all([
    kv.incr(countKey),
    kv.sadd('visit:countries', cc),
    kv.sadd('visit:dates', date),
  ]);

  return { country: cc, date };
}

export async function getStats({ days = 30 } = {}) {
  const countries = await kv.smembers('visit:countries');
  const allDates = await kv.smembers('visit:dates');

  // 直近 N 日分だけに絞る
  const dates = allDates
    .sort()
    .slice(-days);

  // country -> date -> count のマトリクスを作る
  const matrix = {};
  let total = 0;

  await Promise.all(
    countries.map(async (cc) => {
      matrix[cc] = {};
      await Promise.all(
        dates.map(async (date) => {
          const key = `visit:count:${cc}:${date}`;
          const count = (await kv.get(key)) || 0;
          matrix[cc][date] = count;
          total += Number(count) || 0;
        })
      );
    })
  );

  // 国別合計を出して多い順にソート
  const byCountry = countries
    .map((cc) => ({
      country: cc,
      total: dates.reduce((sum, d) => sum + (Number(matrix[cc]?.[d]) || 0), 0),
    }))
    .sort((a, b) => b.total - a.total);

  // 日別合計
  const byDate = dates.map((date) => ({
    date,
    total: countries.reduce((sum, cc) => sum + (Number(matrix[cc]?.[date]) || 0), 0),
  }));

  return {
    total,
    countries: byCountry,
    dates: byDate,
    matrix,
  };
}
