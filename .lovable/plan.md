# AI Yönetici Analizi — Şema Denetimi ve Uygulama Planı

Nothing in production changes until this plan is approved.

## 1. Şema denetimi (gerçek tablolar)

| Alan | Kaynak tablo / kolonlar | Not |
|---|---|---|
| İstasyon / sahip | `auth.users.id` = `station_id` everywhere; `profiles` (full_name, station_name, is_premium) | One login = one station. No separate stations table. |
| Personel | `personnel` (station_id, role, status, attendant_email, attendant_password_hash) | Pompacılar are not Supabase users; they sign in with the `authenticate_pump_attendant` function. |
| Akaryakıt satışı | `fuel_sales` (fuel_type, liters, total_amount, price_per_liter, sale_time, shift_id, shift text) | Fuel types: MOTORİN, LPG, BENZİN, MOTORİN(DİĞER). `personnel_id` is often the owner's id. |
| Vardiya | `shifts` (start_time, end_time, actual_amount = otomasyon satış, cash/card/veresiye/bank_transfers/loyalty_card, over_short, shift_number V1/V2, status) | V1 belongs to the end date (night shift). There are no litres on a shift. |
| Banka/POS detayı | `shift_bank_details` (shift_id, bank_name, amount) | This is a breakdown of `card_sales`, so it is not added on top (that would double count). |
| Komisyon | `commission_rates` (station_id, bank_name, commission_rate) | |
| Alım / maliyet | `fuel_purchases` (liters, purchase_price_per_liter, total_amount, purchase_date), `fuel_purchase_prices` | |
| Stok | `fuel_stock` (current stock only, kept by triggers), `tankers`, `tanker_transactions` | There is no stock history, only the current amount. |
| Cari müşteri | `customers` (station_id, debt_amount, receivable_amount…), `customer_transactions` (transaction_type debt/payment, amount, payment_method, transaction_date, shift_id) | Balances are calculated from the transactions; the stored `debt_amount` fields are not used. |
| Şirket muhasebesi | `companies` (owner_id), `income/expense_invoices`, `checks`, `company_accounts`, `e_invoices`, `incoming_invoices` | Scoped by company owner, not by station_id. Out of scope for fuel KPIs. |
| Kâr analizi | `fuel_profit_calculations` | Saved by users and not reliable, so it is not used as a source. |

**Current access rules:** almost every policy is `station_id = auth.uid()` or `companies.owner_id = auth.uid()`. There is no role or membership table, so "station manager" and "employee" roles **do not exist** today.

### Gaps and risks found
1. **No role system.** "Admin-only" can only mean the station owner. Manager and employee roles need a new `station_members` table plus a `has_station_role()` function. This is an additive change.
2. **No plate or vehicle data.** "Lost customer" can only be measured through cari customers (`customer_transactions`). Cash customers cannot be tracked.
3. **No litres on a shift.** Litres come only from `fuel_sales`. If no Excel/Petronet sales are entered for a day, that day is marked "eksik veri" (missing data), not 0.
4. **No discount field.** Discount analysis is not possible. Gross contribution is shown only for days that have a purchase price (weighted average cost from `fuel_purchases`).
5. **No due dates on veresiye.** Overdue debt is measured by debt age (time since the last payment) and labelled "yaşlandırma" (ageing), not "vade" (due date).
6. **Security debt (existing):**
   - `profiles.petronet_password` is stored in plain text.
   - `uyumsoft_accounts.password_encrypted` should be checked.
   - The `checks` and `customers` insert policies have no WITH CHECK, so a user could write rows for another station_id.
   - 20 linter warnings for mutable search_path on SECURITY DEFINER functions.
   - These are reported and **not changed** in this module unless you approve.
7. Duplicate triggers (`fuel_sale_stock_update` and `trigger_update_fuel_stock_after_sale`, and the same for purchases) **may be changing stock twice**. This needs checking and a separate approval.

## 2. Architecture

```text
pg_cron 05:00 UTC (= 08:00 Istanbul, no DST in TR)
   -> edge fn ai-daily-orchestrator (service role, per-station loop)
        1. lock: analytics.job_runs (station_id, business_date) unique + lease
        2. SQL fn analytics.compute_daily_kpis(station, date)  [deterministic]
        3. completeness check -> data_quality_status
        4. minimal anonymized JSON -> OpenAI Responses (strict json_schema)
        5. zod validate -> analytics.ai_reports (revision n)
        6. optional email (dedupe key) 
UI page "AI Yönetici Analizi" -> RPC get_station_report(date) (auth.uid() checked)
Admin "Yeniden Oluştur" -> edge fn ai-regenerate (JWT verified, owner check, rate limit 3/day)
```

## 3. New objects (additions only)

Everything goes in a private `analytics` schema that is not exposed through the Data API. The frontend reads only through `SECURITY DEFINER` RPCs that check `auth.uid() = station_id` (or a member role).

- `analytics.daily_kpis` (station_id, business_date, litres by fuel type, revenue, purchase cost when known, shift totals, over_short, collections versus sales separated, veresiye added and collected, completeness flags, `source_hash`)
- `analytics.customer_windows` (customer_id hashed for the AI, litres/amount over 7/30/90 days, last activity, status active/declining/lost)
- `analytics.receivable_aging` (0-30 / 31-60 / 61-90 / 90+ day buckets)
- `analytics.shift_anomalies` (missing V1/V2, large over_short, end time missing, shift without a sale)
- `analytics.job_runs` (status, attempts max 3, error, lease_until)
- `analytics.ai_reports` (station_id, business_date, revision, payload jsonb, model, confidence, created_at; unique (station_id, business_date, revision))
- `analytics.notifications_sent` (dedupe key)
- `public.station_members` (optional, for manager/employee roles)

Double-count rules:
- Sales = `fuel_sales` litres and amount.
- Collections = shift cash + card + transfers.
- Veresiye = credit given.
- `customer_transactions` payments = collections.
- POS bank details are a breakdown only.
- V1 is assigned to its end date.

If data arrives late (the `source_hash` changes), a new revision is written. Old revisions are kept.

## 4. AI (OpenAI)

- **OpenAI choice:** you asked for your own `OPENAI_API_KEY`. The alternative is Lovable AI Gateway, which needs no key and has the same Responses API. Recommendation: Lovable AI. If you want your own key, I'll add it as a secret.
- **Sent:** totals, fuel breakdown, trends, ageing buckets, an anonymized customer list (C-01…), and anomaly codes.
- **Not sent:** names, phone numbers, plates, IDs, account numbers.
- The output is a strict schema with the fields you listed. Numbers are only checked against the evidence values sent; if the AI makes up a number, the report is rejected.

## 5. UI

- Add a new tab to the dashboard, "AI Yönetici Analizi", visible to owners only.
- Date picker: Bugün / Dün / Son 7 / Son 30.
- Progress bar toward the 10,000 L goal.
- 7/30/90-day charts (recharts, which is already in the app).
- Fuel and shift breakdown.
- Lost customers.
- Debt risk.
- Opportunities, labelled "senaryo" (scenario).
- Actions with priority and evidence.
- Data freshness and report status.
- Report history.
- "Yeniden Oluştur" (Generate again) button.
- Simple Turkish throughout.

## 6. Email (optional)

A short summary and a link to the in-app page, which requires login. No customer details. This needs a connected email domain first.

## 7. Tests and rollout

- **Access tests (SQL):** an owner sees their own station, another owner gets 0 rows, anon gets an error, a pompacı has no access, and no write is allowed on raw tables.
- **Reconciliation tests:** daily_kpis litres = SUM(fuel_sales), collection totals = shift sums, ageing total = customer balance. These run on real data for 3 sample days.
- **Failure tests:**
  - OpenAI 429/5xx: retried at most 3 times, then marked failed.
  - 402/403: the job is paused.
  - A second job running at the same time: rejected by the lock.
- **Rollback:** `DROP SCHEMA analytics CASCADE`, `cron.unschedule`, and delete the 2 edge functions. Existing tables are untouched.
- **Staging:** this project has no separate test database, so I recommend testing first with only your own station, using the "generate manually" button.

## 8. Expected cost

- Per station per day: 1 AI call (about 3-6k tokens).
- 10 stations: roughly 300 calls a month, low cost.
- Lovable AI is deducted from your credits; your own OpenAI key is paid to OpenAI.
- The cron job runs once a day, so database load is negligible.

## Decisions needed
1. Lovable AI or your own OpenAI key?
2. Should the role table (manager/employee) be added, or is owner-only enough?
3. Email notifications: now or later?
4. Should the existing security issues (plain-text Petronet password, duplicate stock triggers, missing insert checks) be fixed in a separate step?
