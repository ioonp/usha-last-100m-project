## Fix: Restrict profile visibility to owner

The `profiles` table currently has a SELECT policy `USING (true)`, exposing all user IDs, display names, and avatar URLs to anyone (including unauthenticated visitors). The codebase doesn't actually read from `profiles` anywhere outside the generated types, so locking it down is safe.

### Change

Replace the public-read policy with an owner-only policy via migration:

```sql
DROP POLICY "Profiles viewable by everyone" ON public.profiles;

CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

### Why owner-only (not "public for published locations")

Nothing in the viewer/public pages reads `profiles` — the wayfinding pages render `studio_name`, `logo_url`, etc. directly from `locations`. So there's no need to expose any profile rows publicly.

### Verification

- Re-run the security scan; the finding should clear.
- Confirm dashboard still loads (it doesn't query profiles).