# Handoff — Connect Instagram + Facebook for Ratio's "Post to socials"

## Goal
Finish the **one-time Meta authorization** so the already-built "Post to socials" feature can post. All code is done, deployed, and committed — only 3 secrets remain to be captured and set.

## Environment
- Frontend: `/Users/Ratiocoffee/Documents/Ratio/Admin/ratio-app/new/index.html` (single file). Push via **GitHub Desktop** (terminal has no git auth).
- Supabase project: `kjhudxzvidhynpabnalp` (Sydney). Edge functions deploy via MCP.
- Plan file: `/Users/Ratiocoffee/.claude/plans/25-each-bag-dazzling-coral.md`
- Drive the user's real Chrome via `mcp__claude-in-chrome__*` (call `tabs_context_mcp` first; tab was `1489019615`, re-fetch it). The extension side panel sometimes sleeps — if tools return "not connected", ask the user to click the Claude icon in Chrome to wake it.
- **Language: reply to the user only in Traditional Chinese (繁體中文), including reasoning.** UI text stays English.

## Already DONE (do not redo)
- `social-post` edge function **v1** deployed (verify_jwt true, director-only). Graph API v25.0. Actions: `status` (returns `{connected,reason,targets}`) and `post` (IG carousel + FB multi-photo, per-target try/catch, humanized errors). Reads secrets `META_PAGE_TOKEN` / `META_PAGE_ID` / `META_IG_ID` (+ optional `META_GRAPH_VERSION`).
- Frontend: Tools → Marketing tile **"Post to socials"** → `openSocialPostSheet()` → pick bean → Colour/Photo preview → caption (from `promoCaptions`) → uploads 4 JPEGs to `mail-assets` bucket as `social-<slug>-<n>.jpg` → `callFn('social-post',{action:'post'})`. Same-day repost guard via `activity_log`. All jscheck'd, stub-tested, committed & pushed.
- **Meta account side already good**: FB Page "Ratio" and IG `@ratio.crowsnest` exist and are linked. User is a Meta developer (business_id `911785966453222`).
- **Mid-wizard**: creating a Business app named **"Ratio Social Poster"** at developers.facebook.com. On the use-case step, BOTH **"管理 Instagram 的訊息和內容"** (IG) and **"管理粉絲專頁的所有內容"** (FB Page) are selected ("已新增 2 個使用案例"). An earlier accidental "存取 Threads API" pick was already removed — don't re-check it.

## RESUME HERE — next click is 繼續
1. Click **繼續** through remaining creation steps (商家/business → 要求/requirements → 總覽/overview). Attach the business portfolio if asked. ⚠ The page auto-scrolls after clicks — screenshot and verify before each click.
2. In the new app: **App Settings → Basic** → add a **Privacy Policy URL** (any shop page, e.g. `https://ratio-theta.vercel.app/`) → Save → flip **App Mode → Live** in the top bar (**critical**, otherwise FB posts are admin-only / invisible to the public). Copy **App ID** and **App Secret**.
3. **Graph API Explorer** (developers.facebook.com/tools/explorer): select this app → add permissions `pages_show_list, pages_read_engagement, pages_manage_posts, instagram_basic, instagram_content_publish` (+ `business_management`) → Generate Access Token → in the popup grant the Ratio Page + @ratio.crowsnest.
4. Exchange for a long-lived token — open in browser:
   `https://graph.facebook.com/v25.0/oauth/access_token?grant_type=fb_exchange_token&client_id=<APP_ID>&client_secret=<APP_SECRET>&fb_exchange_token=<token from step 3>`
5. `https://graph.facebook.com/v25.0/me/accounts?access_token=<long-lived token>` → find "Ratio": its `id` = **META_PAGE_ID**, its `access_token` = **META_PAGE_TOKEN** (this Page token never expires).
6. `https://graph.facebook.com/v25.0/<PAGE_ID>?fields=instagram_business_account&access_token=<Page token>` → `instagram_business_account.id` = **META_IG_ID**.
7. **Set 3 secrets** in Supabase → project `kjhudxzvidhynpabnalp` → Edge Functions → Secrets: `META_PAGE_TOKEN`, `META_PAGE_ID`, `META_IG_ID`.
   ⚠ **Security rule: the assistant must NOT type tokens/secrets into fields.** Navigate the user to the Secrets page and have **the user paste** the 3 values themselves. Guide, don't type.
8. Verify: in the app, **Tools → Post to socials** should now show the two account names with a ✓ (this calls `social-post` `status`). Then do a real end-to-end post test = round 3 of the plan: post one shelf bean → confirm IG 4-image carousel + FB multi-photo post appear (check FB in an **incognito window** to confirm public visibility) → permalinks open → `activity_log` has `posted socials` → press same bean again to confirm the "already posted today" guard.

## Token recovery (future reference)
The Page token only dies if the user changes their FB password or Meta forces a security check. If `status` ever returns `reason:'token_expired'`, just redo steps 3–7. Steps 1–2 never need redoing.

## Unrelated loose end (optional, ask the user)
Test account **Hung / wu110681@gmail.com** is currently `director` (can see payroll/finance). Ask whether to demote it back down. To do it: `update profiles set role='...' where id='6f59bead-d09d-4438-b678-11cb077c819f'` (this is Hung's id).
