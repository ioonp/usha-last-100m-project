<aside>

  **Usha guides people through the last 100 meters — from where the map ends to the actual door.**

One link. With photos, not another text message from you.

</aside>

**Status:** 🌱 Early-stage side project · Berlin pilot · usha-project.lovable.app

---

## The problem

Map apps drop visitors at a street address — and stop there.

But in Berlin, many studios, galleries, and clinics sit inside courtyards (*Hinterhöfe*) — behind archways, across passages, up the second staircase. The visitor is at the **correct address** and still can't find the door.

The cost is small but constant:

| 😖 Today | 🧭 With Usha |
| --- | --- |
| "I'm at the gate — where now?" | Visitor self-serves from a photo trail |
| Host retypes directions for every guest | Written once, reused forever |
| Late arrivals, interrupted sessions | On-time arrivals, calm start |

> Usha picks up where Google Maps stops and walks people to the entrance, photo by photo.
> 

## How it works

### Creators — venue owners, in a few minutes

1. **📍 Set the Street Entrance** — the exact spot where map apps drop visitors
2. **📸 Add photo Checkpoints** — each with a directional arrow, leading to the Destination
3. **🔗 Share the public Find Me link** — in booking confirmations, emails, signatures, event invites

### Visitors

Open the link → follow a full-screen photo trail to the door.

**No app, no account, no install** — it just works in the browser.

## Who it's for

- 🧘 **Studios & teachers** — yoga, dance, music, language classes
- 🎨 **Galleries & event hosts** — pop-ups, openings, workshops
- 🩺 **Clinics & practices** — first-time patients, back-courtyard entrances
- 💼 **Offices & co-working** — client visits, interviews
- 🏠 **Hosts & viewings** — Airbnb, flat viewings, private invites

<aside>


**Hero use case:** Berlin *Hinterhof* venues with recurring visitors. Everything else is a bonus, not the pitch.

</aside>

## Core concepts

| Term | Meaning |
| --- | --- |
| **Guide** | One published path for one venue |
| **Street Entrance** | Where map apps end and Usha begins |
| **Checkpoint** | A photo + directional arrow along the path |
| **Destination** | The actual door |
| **Find Me link** | The public URL shared with visitors |
| **Creator / Walker** | Venue owner / visitor |

## Status & roadmap

**Live**

- Creator wizard
- Walker flow
- Analytics

**Next**

- [ ]  Onboard first pilot studios in Berlin
- [ ]  Collect Walker drop-off data per checkpoint
- [ ]  QR code + embeddable snippet for booking confirmations
- [ ]  Multi-language guides (DE / EN)

## Stack

- ⚡ **Vite + React** — mobile-first
- 🗄️ **Supabase** — auth, database, RLS
- 🗺️ **Google Maps API** — Places Autocomplete, map pins
- 📈 **Umami** — analytics
- 🤖 **Claude Code** for build, **Lovable** for deploy
