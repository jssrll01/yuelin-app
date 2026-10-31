# YUÉLÍN client → backend contract

The client never trusts or computes balances, prices, stock, rankings, mission completion, achievements or VIP status.
Every function below must run `security definer`, use `auth.uid()`, and be granted to `authenticated` only.
Where a function is missing the client hides or disables that feature (it detects PGRST202 / 42883) instead of failing.

| Function | Returns | Used by |
|---|---|---|
| `exchange_reward(p_reward uuid, p_key text)` (existing) | `{ok, error?, reference?}`; must check balance, price, stock, is_active, deduct points + reserve stock + write ledger atomically and be idempotent on `p_key` | Confirm dialog |
| `wishlist_ids()` | array of reward ids for `auth.uid()` | Rewards, Wishlist |
| `toggle_wishlist(p_reward uuid)` | `{ok, saved}`; unique (user_id, reward_id) | Rewards, Wishlist |
| `get_leaderboard(p_period 'week'\|'month'\|'all', p_limit int)` | `{ok, rows:[{rank, username, avatar_url, points_balance, points_earned, is_me}], me:{rank, points_earned}}`; ranks by SUM of positive earning ledger rows in the period, excludes members who opted out; never returns email/phone | Home, Leaderboard |
| `get_achievements()` | `{ok, items:[{id, code, title, description, target, progress, unlocked, unlocked_at}]}` | Achievements |
| `get_announcements()` | `{ok, items:[{id, title, body, kind, link}]}` active + eligible only | Home |
| `get_notification_prefs()` / `set_notification_pref(p_category, p_enabled)` | `{ok, prefs:{category:bool}}` | Notifications |
| `archive_notification(p_id uuid)` | `{ok}` (client falls back to DELETE) | Notifications |
| `get_redemption_detail(p_id uuid)` | `{ok, redemption:{fulfillment_note}, history:[{status, note, created_at}]}` owner only | My exchanges |
| `get_vip_dashboard()` | `{ok, tier, status, started_at, ends_at, next_tier, progress, target, benefits:[{title,text}], exclusive_rewards:[{id,name,cost_points}], activity:[{text,created_at}]}` | VIP dashboard |

Tables read directly (RLS must restrict rows to `auth.uid()`): `rewards` (active), `redemptions`, `points_ledger`, `notifications`, `missions`, `user_mission_progress`, `daily_checkins`, `vip_memberships`, `vip_entitlements`.
Optional columns used when present: rewards `image_url`, `is_featured`, `created_at`; redemptions `reference_code`; notifications `category`, `archived_at`; missions `image_url`, `starts_at`, `ends_at`, `target_count`.
