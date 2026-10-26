import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp, Target, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

type Report = {
  business_date: string; revision: number; data_quality_status: string;
  metrics: any; payload: any; model: string | null; created_at: string;
};

const fmt = (n: number | null | undefined, d = 0) =>
  n == null ? "-" : Number(n).toLocaleString("tr-TR", { maximumFractionDigits: d });

const dayStr = (offset: number) => {
  const t = new Date(Date.now() + 3 * 3600_000);
  t.setUTCDate(t.getUTCDate() - offset);
  return t.toISOString().slice(0, 10);
};

const QUALITY: Record<string, { label: string; cls: string }> = {
  tam: { label: "Veri tam", cls: "bg-green-100 text-green-800" },
  eksik_veri: { label: "Eksik veri", cls: "bg-yellow-100 text-yellow-800" },
  mutabakat_bekliyor: { label: "Kapanmamış vardiya var", cls: "bg-orange-100 text-orange-800" },
  yetersiz_veri: { label: "Veri yok", cls: "bg-red-100 text-red-800" },
};
const PRI: Record<string, string> = { yüksek: "bg-red-100 text-red-800", orta: "bg-yellow-100 text-yellow-800", düşük: "bg-muted text-muted-foreground" };

const RANGES = [
  { key: "today", label: "Bugün", from: 0, to: 0 },
  { key: "yesterday", label: "Dün", from: 1, to: 1 },
  { key: "7", label: "Son 7 Gün", from: 7, to: 1 },
  { key: "30", label: "Son 30 Gün", from: 30, to: 1 },
];

export const AIExecutiveAnalysis = () => {
  const { toast } = useToast();
  const [range, setRange] = useState("yesterday");
  const [reports, setReports] = useState<Report[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const r = RANGES.find((x) => x.key === range)!;

  const load = async () => {
    setLoading(true);
    const [{ data }, { data: j }] = await Promise.all([
      supabase.rpc("get_ai_reports" as any, { p_from: dayStr(90), p_to: dayStr(0) }),
      supabase.rpc("get_ai_job_status" as any),
    ]);
    setReports((data as Report[]) ?? []);
    setJobs((j as any[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const inRange = useMemo(
    () => reports.filter((x) => x.business_date >= dayStr(r.from) && x.business_date <= dayStr(r.to)),
    [reports, r]
  );
  const current = selected ? reports.find((x) => x.business_date === selected) : inRange[0];
  const m = current?.metrics;
  const p = current?.payload;
  const rangeLitres = inRange.reduce((s, x) => s + Number(x.metrics?.total_litres ?? 0), 0);
  const rangeAvg = inRange.length ? rangeLitres / inRange.length : 0;

  const regenerate = async () => {
    setBusy(true);
    const date = selected ?? dayStr(r.to);
    const { data, error } = await supabase.functions.invoke("ai-daily-report", { body: { mode: "regenerate", date } });
    setBusy(false);
    if (error || (data as any)?.error) {
      let msg = (data as any)?.error ?? (data as any)?.status;
      try { msg = (await (error as any)?.context?.json())?.error ?? msg; } catch { /* ignore */ }
      toast({ title: "Rapor oluşmadı", description: msg || "Bir hata oldu.", variant: "destructive" });
    } else {
      toast({ title: "Hazır", description: `${date} raporu oluştu.` });
      setSelected(date);
    }
    load();
  };

  const job = jobs.find((x) => x.business_date === (current?.business_date ?? dayStr(1)));
  const goalPct = m ? Math.min(100, (Number(m.total_litres) / 10000) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />AI Yönetici Analizi</CardTitle>
            <CardDescription>Her sabah 08:00'de dünün raporu hazırlanır. Sayılar sizin kayıtlarınızdan hesaplanır.</CardDescription>
          </div>
          <Button onClick={regenerate} disabled={busy}>
            <RefreshCw className={`h-4 w-4 mr-2 ${busy ? "animate-spin" : ""}`} />{busy ? "Hazırlanıyor..." : "Yeniden Oluştur"}
          </Button>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {RANGES.map((x) => (
            <Button key={x.key} size="sm" variant={range === x.key ? "default" : "outline"} onClick={() => { setRange(x.key); setSelected(null); }}>{x.label}</Button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {current ? `Rapor: ${new Date(current.created_at).toLocaleString("tr-TR")} (sürüm ${current.revision})` : "Rapor yok"}
            {job && <Badge variant="outline">{job.status}</Badge>}
          </div>
        </CardContent>
      </Card>

      {loading ? <div className="py-12 text-center text-muted-foreground">Yükleniyor...</div> : !current ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">
          Bu tarih için rapor yok. "Yeniden Oluştur" ile hemen hazırlayabilirsiniz.
        </CardContent></Card>
      ) : (
        <>
          {job?.error && <Card className="border-destructive"><CardContent className="py-3 text-sm text-destructive">Son deneme hatası: {job.error}</CardContent></Card>}

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2"><CardDescription className="flex items-center gap-1"><Target className="h-4 w-4" />Günlük hedef 10.000 L — {current.business_date}</CardDescription></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(m.total_litres)} L</div>
                <Progress value={goalPct} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">%{fmt(goalPct)} tamam</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardDescription>Ortalama (7 / 30 / 90 gün)</CardDescription></CardHeader>
              <CardContent className="text-lg font-semibold">{fmt(m.trend?.avg_7)} / {fmt(m.trend?.avg_30)} / {fmt(m.trend?.avg_90)} L</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardDescription>Veri durumu</CardDescription></CardHeader>
              <CardContent className="space-y-1">
                <Badge className={QUALITY[current.data_quality_status]?.cls}>{QUALITY[current.data_quality_status]?.label ?? current.data_quality_status}</Badge>
                {inRange.length > 1 && <div className="text-xs text-muted-foreground">Seçili dönem ortalaması: {fmt(rangeAvg)} L/gün ({inRange.length} rapor)</div>}
                {p?.confidence_level && <div className="text-xs">Güven: {p.confidence_level}</div>}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Son 30 gün litre</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={m.trend?.series_30 ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="d" tickFormatter={(v) => String(v).slice(5)} fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <ReferenceLine y={10000} stroke="hsl(var(--destructive))" strokeDasharray="4 4" />
                  <Line dataKey="l" name="Litre" stroke="hsl(var(--primary))" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Yakıt dağılımı</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {(m.fuel_breakdown ?? []).map((f: any) => (
                  <div key={f.fuel_type} className="flex justify-between border-b pb-1">
                    <span className="font-medium">{f.fuel_type}</span>
                    <span>{fmt(f.litres)} L · {fmt(f.revenue)} ₺{f.gross_contribution != null && <> · katkı {fmt(f.gross_contribution)} ₺</>}</span>
                  </div>
                ))}
                {!m.fuel_breakdown?.length && <div className="text-muted-foreground">Satış kaydı yok.</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Vardiya özeti</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-1 text-sm">
                <span>Vardiya sayısı</span><span className="text-right">{m.shifts?.count} {m.shifts?.has_v1 ? "V1" : ""} {m.shifts?.has_v2 ? "V2" : ""}</span>
                <span>Otomasyon satış</span><span className="text-right">{fmt(m.shifts?.automation_sales)} ₺</span>
                <span>Nakit / Kart</span><span className="text-right">{fmt(m.shifts?.cash)} / {fmt(m.shifts?.card)} ₺</span>
                <span>Havale / Sadakat</span><span className="text-right">{fmt(m.shifts?.bank_transfers)} / {fmt(m.shifts?.loyalty)} ₺</span>
                <span>Veresiye</span><span className="text-right">{fmt(m.shifts?.veresiye)} ₺</span>
                <span>Açık / Fazla</span><span className={`text-right ${Number(m.shifts?.over_short) < 0 ? "text-destructive" : ""}`}>{fmt(m.shifts?.over_short)} ₺</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Alacak riski</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>Toplam açık alacak: <b>{fmt(m.receivables?.total_open)} ₺</b> ({m.receivables?.customers_with_debt} müşteri)</div>
                <div className="grid grid-cols-4 gap-1 text-xs text-center">
                  {[["0-30", "b0_30"], ["31-60", "b31_60"], ["61-90", "b61_90"], ["90+", "b90_plus"]].map(([l, k]) => (
                    <div key={k} className="rounded border p-1"><div className="text-muted-foreground">{l} gün</div><div className="font-semibold">{fmt(m.receivables?.aging?.[k])}</div></div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">Gün: son ödemeden bu yana geçen süre.</div>
                {(p?.receivables_alerts ?? []).map((a: any, i: number) => (
                  <div key={i} className="flex gap-2"><Badge className={PRI[a.level]}>{a.level}</Badge><span>{a.text}</span></div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Müşteri kaybı</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>30+ gündür gelmeyen cari: <b>{m.customers?.lost_count}</b></div>
                <div>Alımı yarıdan çok düşen: <b>{m.customers?.declining_count}</b> (≈ {fmt(m.customers?.declining_lost_amount_30)} ₺ / 30 gün)</div>
                {p?.customer_consumption_changes && <p className="text-muted-foreground">{p.customer_consumption_changes}</p>}
              </CardContent>
            </Card>
          </div>

          {p ? (
            <>
              <Card>
                <CardHeader><CardTitle className="text-base">Özet</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm"><p>{p.summary}</p><p className="text-muted-foreground">{p.sales_trends}</p></CardContent>
              </Card>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />Fırsatlar (senaryo)</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {[...(p.growth_opportunities ?? [])].sort((a: any, b: any) => b.scenario_extra_litres_per_day - a.scenario_extra_litres_per_day).map((o: any, i: number) => (
                      <div key={i}><div className="font-medium">{o.title} <span className="text-xs text-muted-foreground">+{fmt(o.scenario_extra_litres_per_day)} L/gün (tahmin)</span></div><div className="text-muted-foreground">{o.explanation}</div></div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Yapılacaklar</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {(p.recommended_actions ?? []).map((a: any, i: number) => (
                      <div key={i} className="flex gap-2"><Badge className={PRI[a.priority]}>{a.priority}</Badge><div><div>{a.action}</div><div className="text-xs text-muted-foreground">Kanıt: {a.evidence}</div></div></div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              {(p.detected_anomalies?.length > 0 || p.limitations?.length > 0) && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Dikkat ve sınırlar</CardTitle></CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    {p.detected_anomalies?.map((a: any, i: number) => <div key={i}>⚠ {a.text}</div>)}
                    {p.limitations?.map((l: string, i: number) => <div key={i} className="text-muted-foreground">• {l}</div>)}
                    {p.assumptions?.map((l: string, i: number) => <div key={i} className="text-muted-foreground">Varsayım: {l}</div>)}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card><CardContent className="py-4 text-sm text-muted-foreground">Bu gün için yeterli veri yok, AI yorumu yapılmadı.</CardContent></Card>
          )}
        </>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Rapor geçmişi</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {reports.slice(0, 30).map((x) => (
            <Button key={x.business_date} size="sm" variant={current?.business_date === x.business_date ? "default" : "outline"} onClick={() => setSelected(x.business_date)}>
              {x.business_date.slice(5)} · {fmt(x.metrics?.total_litres)} L
            </Button>
          ))}
          {!reports.length && <span className="text-sm text-muted-foreground">Henüz rapor yok.</span>}
        </CardContent>
      </Card>
    </div>
  );
};
