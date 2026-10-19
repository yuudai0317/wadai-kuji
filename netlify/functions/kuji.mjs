// くじの内容（テーマ・履歴・いま出ているテーマ・設定）を保存し、
// 同じURLを開いた端末どうしでそろえるAPI。保存先は Netlify Blobs で、
// 追加のデータベース契約は要りません。
//
//   GET  /api/kuji  → 保存済みのくじ（未保存なら null）
//   POST /api/kuji  → くじを保存（本文は JSON）
import { getStore } from "@netlify/blobs";

const KEY = "state";

// 1件のくじが大きくなりすぎないよう、常識的な上限を設けておく
const MAX_THEMES = 2000;
const MAX_LEN = 500;

const json = (body, status = 200) =>
  new Response(body === null ? "null" : JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });

// 他端末の書き込みを次の確認で確実に読めるよう、強い整合性で読む
const store = () => getStore({ name: "kuji", consistency: "strong" });

// 文字列の配列だけを通す（空行・長すぎる行・多すぎる件数は落とす）
function cleanList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => typeof v === "string")
    .map((v) => v.trim())
    .filter((v) => v.length > 0 && v.length <= MAX_LEN)
    .slice(0, MAX_THEMES);
}

function cleanOne(value) {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v.length > 0 && v.length <= MAX_LEN ? v : null;
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
      themes: cleanList(body.themes),
      drawn: cleanList(body.drawn),
      current: cleanOne(body.current),
      exclude: typeof body.exclude === "boolean" ? body.exclude : true,
      updatedAt: Number.isFinite(body.updatedAt) ? body.updatedAt : Date.now()
    };

    await store().setJSON(KEY, payload);
    return json({ ok: true, updatedAt: payload.updatedAt });
  }

  return json({ error: "この操作には対応していません。" }, 405);
};

export const config = { path: "/api/kuji" };
