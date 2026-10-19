// くじの進行状況（引いた話題・履歴・カテゴリ・いま出ている話題）を保存し、
// 同じURLを開いた端末どうしでそろえるAPI。保存先は Netlify Blobs で、
// 追加のデータベース契約は要りません。
//
//   GET  /api/kuji  → 保存済みの状態（未保存なら null）
//   POST /api/kuji  → 状態を保存（本文は JSON）
import { getStore } from "@netlify/blobs";

const KEY = "state";

// index.html の話題数と履歴の上限。想定外の値を弾くために持っておく。
const THEME_COUNT = 500;
const MAX_HISTORY = 10;
const MAX_FILTER_LEN = 60;

const json = (body, status = 200) =>
  new Response(body === null ? "null" : JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });

// 他端末の書き込みを次の確認で確実に読めるよう、強い整合性で読む
const store = () => getStore({ name: "wadai-kuji", consistency: "strong" });

// 話題の番号の配列だけを通す（範囲外・重複・多すぎる件数は落とす）
function cleanIndexes(value, max) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const out = [];
  for (const v of value) {
    if (!Number.isInteger(v) || v < 0 || v >= THEME_COUNT) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
    if (out.length >= max) break;
  }
  return out;
}

function cleanIndex(value) {
  return Number.isInteger(value) && value >= 0 && value < THEME_COUNT ? value : null;
}

export default async (req) => {
  if (req.method === "GET") {
    const data = await store().get(KEY, { type: "json" });
    return json(data ?? null);
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "JSONとして読み取れませんでした。" }, 400);
    }
    if (!body || typeof body !== "object") {
      return json({ error: "内容が空です。" }, 400);
    }

    const payload = {
      used: cleanIndexes(body.used, THEME_COUNT),
      history: cleanIndexes(body.history, MAX_HISTORY),
      filter:
        typeof body.filter === "string" && body.filter.length <= MAX_FILTER_LEN
          ? body.filter
          : "すべて",
      current: cleanIndex(body.current),
      updatedAt: Number.isFinite(body.updatedAt) ? body.updatedAt : Date.now()
    };

    await store().setJSON(KEY, payload);
    return json({ ok: true, updatedAt: payload.updatedAt });
  }

  return json({ error: "この操作には対応していません。" }, 405);
};

export const config = { path: "/api/kuji" };
