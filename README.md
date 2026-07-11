# Usha

**Guides people through the last 100 meters — from where the map ends to the actual door.**

## The problem

Map apps drop visitors at a street address. But in Berlin, many studios, galleries, and clinics sit inside courtyards (Hinterhöfe) — behind archways, across passages, up the second staircase. The visitor is at the correct address, but still can't find the door.

Usha picks up where Google Maps stops and walks people to the entrance, photo by photo.

## How it works

**Creators** (venue owners) build a Guide in a few minutes:
1. Set the Street Entrance — the spot where map apps drop visitors
2. Add photo Checkpoints with directional arrows, leading to the Destination
3. Share the public **Find Me link**

**Walkers** (visitors) open the link and follow a full-screen photo trail to the door. No app, no account — it just works in the browser.

## Status

Early-stage side project. Creator wizard, Walker flow, and analytics are live. Currently onboarding first pilot studios in Berlin.

Try it: [usha-project.lovable.app](https://usha-project.lovable.app)

## Stack

- Vite + React (mobile-first)
- Supabase — auth, database, RLS
- Google Maps API — Places Autocomplete, map pins
- Umami — analytics
- Built with Claude Code, deployed via Lovable

**Gotchas:**
- Test geolocation on the deployed URL, not Lovable's editor preview (the iframe suppresses location prompts)
- Google Maps API key is restricted at domain level: `https://usha-project.lovable.app/*`
