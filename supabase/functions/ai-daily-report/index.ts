import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const AIKEY = Deno.env.get("LOVABLE_API_KEY");
const MODEL = "openai/gpt-6-astra";

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const istanbulYesterday = () => {
  const now = new Date(Date.now() + 3 * 3600_000);
  now.setUTCDate(now.getUTCDate() - 1);
  return now.toISOString().slice(0, 10);
};

const itemArr = (props: Record<string, unknown>, req: string[]) => ({
  type: "array",
  items: { type: "object", additionalProperties: false, properties: props, required: req },
});
const S = { type: "string" };
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: S,
    sales_trends: S,
    customer_consumption_changes: S,
    receivables_alerts: itemArr({ level: { type: "string", enum: ["düşük", "orta", "yüksek"] }, text: S }, ["level", "text"]),
    detected_anomalies: itemArr({ code: S, text: S }, ["code", "text"]),
    growth_opportunities: itemArr({ title: S, scenario_extra_litres_per_day: { type: "number" }, explanation: S }, ["title", "scenario_extra_litres_per_day", "explanation"]),
    recommended_actions: itemArr({ priority: { type: "string", enum: ["yüksek", "orta", "düşük"] }, action: S, evidence: S }, ["priority", "action", "evidence"]),
    assumptions: { type: "array", items: S },
    limitations: { type: "array", items: S },
    confidence_level: { type: "string", enum: ["düşük", "orta", "yüksek"] },
  },
  required: ["summary", "sales_trends", "customer_consumption_changes", "receivables_alerts", "detected_anomalies", "growth_opportunities", "recommended_actions", "assumptions", "limitations", "confidence_level"],
};
const Out = z.object({
  summary: z.string(), sales_trends: z.string(), customer_consumption_changes: z.string(),
  receivables_alerts: z.array(z.object({ level: z.string(), text: z.string() })),
  detected_anomalies: z.array(z.object({ code: z.string(), text: z.string() })),
  growth_opportunities: z.array(z.object({ title: z.string(), scenario_extra_litres_per_day: z.number(), explanation: z.string() })),
  recommended_actions: z.array(z.object({ priority: z.string(), action: z.string(), evidence: z.string() })),
  assumptions: z.array(z.string()), limitations: z.array(z.string()), confidence_level: z.string(),
});

class Terminal extends Error {}

async function callAI(metrics: unknown) {
  if (!AIKEY) throw new Terminal("LOVABLE_API_KEY eksik");
  const body = {
    model: MODEL,
    reasoning: { effort: "low" },
    store: false,
    stream: true,
    instructions:
      "Sen bir akaryakıt istasyonu yönetici danışmanısın. Sadece verilen sayıları kullan, yeni sayı uydurma. Sayıları aynen aktar. Fırsatları kesin satış değil 'senaryo' olarak yaz. Veri eksikse açıkça söyle. Gelirden kâr çıkarma; brüt katkı yalnız maliyet verisi varsa. Çok basit Türkçe yaz (ilkokul seviyesi). Hedef günlük 10.000 litre.",
    input: JSON.stringify(metrics),
    text: { format: { type: "json_schema", name: "report", strict: true, schema: SCHEMA } },
  };
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Lovable-API-Key": AIKEY, Authorization: `Bearer ${AIKEY}`, "X-Lovable-AIG-SDK": "fetch", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      let text = "";
      let refusal = "";
      const raw = await r.text();
      for (const line of raw.split("\n")) {
        if (!line.startsWith("data:")) continue;
        try {
          const ev = JSON.parse(line.slice(5).trim());
          if (ev.type === "response.output_text.delta") text += ev.delta;
          if (ev.type === "response.refusal.delta") refusal += ev.delta;
          if (ev.type === "response.failed" || ev.type === "error") throw new Error(JSON.stringify(ev).slice(0, 300));
        } catch (e) { if (!(e instanceof SyntaxError)) throw e; }
      }
      if (refusal) throw new Terminal("AI isteği reddetti");
      if (!text) throw new Terminal("AI boş yanıt verdi");
      return Out.parse(JSON.parse(text));
    }
    const msg = (await r.text()).slice(0, 300);
    if (r.status !== 429 && r.status < 500) throw new Terminal(`AI hata ${r.status}: ${msg}`);
    if (attempt === 3) throw new Error(`AI hata ${r.status}: ${msg}`);
    await new Promise((res) => setTimeout(res, 2000 * attempt ** 2 + Math.random() * 1000));
  }
  throw new Error("unreachable");
}

async function sha(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function runStation(admin: any, station: string, date: string, trigger: string, force: boolean) {
  const { data: got } = await admin.rpc("ai_acquire_job", { p_station: station, p_date: date, p_trigger: trigger });
  if (!got) return { station, status: "skipped_locked" };
  try {
    const { data: metrics, error } = await admin.rpc("ai_compute_metrics", { p_station: station, p_date: date });
    if (error) throw error;
    const hash = await sha(JSON.stringify(metrics));
    const { data: prev } = await admin.rpc("ai_latest_hash", { p_station: station, p_date: date });
    if (prev === hash && !force) {
      await admin.rpc("ai_finish_job", { p_station: station, p_date: date, p_status: "unchanged", p_error: null });
      return { station, status: "unchanged" };
    }
    let payload: unknown = null;
    if (metrics.data_quality_status !== "yetersiz_veri") payload = await callAI(metrics);
    await admin.rpc("ai_save_report", {
      p_station: station, p_date: date, p_hash: hash, p_metrics: metrics, p_payload: payload,
      p_quality: metrics.data_quality_status, p_model: payload ? MODEL : null,
    });
    await admin.rpc("ai_finish_job", { p_station: station, p_date: date, p_status: "done", p_error: null });
    return { station, status: "done" };
  } catch (e) {
    const status = e instanceof Terminal ? "paused" : "failed";
    await admin.rpc("ai_finish_job", { p_station: station, p_date: date, p_status: status, p_error: String((e as Error).message ?? e) });
    return { station, status, error: String((e as Error).message ?? e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const admin = createClient(URL_, SERVICE);
  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ mode: z.enum(["cron", "regenerate"]).default("regenerate"), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }).safeParse(body);
  if (!parsed.success) return json({ error: "Geçersiz istek" }, 400);
  const date = parsed.data.date ?? istanbulYesterday();

  if (parsed.data.mode === "cron") {
    const tok = req.headers.get("x-cron-secret") ?? "";
    const { data: ok } = await admin.rpc("ai_check_cron", { p_token: tok });
    if (!tok || !ok) return json({ error: "yetkisiz" }, 401);
    const since = new Date(Date.now() - 45 * 86400_000).toISOString();
    const { data } = await admin.from("shifts").select("station_id").gte("start_time", since).limit(1000);
    const stations = [...new Set((data ?? []).map((r: any) => r.station_id))].slice(0, 50);
    const results = [];
    for (const s of stations) results.push(await runStation(admin, s, date, "cron", false));
    return json({ date, results });
  }

  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "Giriş gerekli" }, 401);
  const userClient = createClient(URL_, ANON, { global: { headers: { Authorization: auth } } });
  const { data: u } = await userClient.auth.getUser();
  if (!u?.user) return json({ error: "Giriş gerekli" }, 401);
  const station = u.user.id; // owner == station; never trust client station_id
  const { data: allowed } = await admin.rpc("ai_regen_allowed", { p_station: station });
  if (!allowed) return json({ error: "Günde en fazla 3 kez yeniden oluşturabilirsiniz." }, 429);
  const r = await runStation(admin, station, date, "manual", true);
  return json(r, r.status === "done" || r.status === "unchanged" ? 200 : r.status === "skipped_locked" ? 409 : 502);
});
