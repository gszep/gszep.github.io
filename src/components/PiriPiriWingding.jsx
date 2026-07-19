import React, { useState, useEffect, useRef, useMemo } from "react";
import { ref, onValue, set, remove, update } from "firebase/database";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "../lib/firebase.js";

/* ------------------------------------------------------------------ *
 *  ALGARVE FAMILY WISH BOARD  ("Piri-Piri Wingding")
 *  A shared voting board for 12 people (8 adults + kids 1,4,7,9)
 *  staying in Olhos de Água, 15–22 Aug 2026.
 *  - React to the starter ideas with emojis
 *  - Add your own idea
 *  - Say which nights you'd like a shared dinner out (so we book early)
 *  Everyone who opens the link shares one live board via Firebase
 *  Realtime Database. Anonymous auth gates writes; see src/lib/firebase.js.
 * ------------------------------------------------------------------ */

/* Root path for this board in RTDB. */
const BOARD = "boards/algarve";

/* RTDB keys can't contain . # $ [ ] / — sanitize anything used as a key
   (person names). Normal first names pass through unchanged. */
const sanitizeKey = (s) => s.trim().replace(/[.#$/\[\]]/g, "-");

/* ---- seed content (from our research, all within ~30 min drive) ---- */
const SEED_IDEAS = [
  // CHILL
  { id: "c1", cat: "chill", title: "Town-beach morning", note: "Praia dos Olhos de Água — calm, shallow, walkable from the villa.", suits: "All ages", shade: false, source: "starter" },
  { id: "c2", cat: "chill", title: "Lazy villa & pool day", note: "No driving, no plans. Floats, books, a long lunch in.", suits: "All ages", shade: true, source: "starter" },
  { id: "c3", cat: "chill", title: "Long lunch: Restaurante Olhos d'Água", note: "Authentic Portuguese in the village. Book ahead for 12.", suits: "All ages", shade: true, source: "starter" },
  { id: "c4", cat: "chill", title: "Sunset fish dinner: O Pássaro Azul", note: "Right on the beach at dusk — mind the tide with a buggy.", suits: "All ages", shade: false, source: "starter" },
  { id: "c5", cat: "chill", title: "Ice cream & seafront stroll", note: "Easy evening potter through the old fishing village.", suits: "All ages", shade: false, source: "starter" },
  { id: "c6", cat: "chill", title: "Brunch at By the Sea", note: "Relaxed daytime spot, brilliant with the little ones.", suits: "All ages", shade: true, source: "starter" },

  // ACTIVE
  { id: "a1", cat: "active", title: "Zoomarine", note: "Dolphins, shows, water area & rides. Guia, ~20 min. Under 1m free.", suits: "Ages 4–10", shade: false, source: "starter" },
  { id: "a2", cat: "active", title: "Aquashow water park", note: "Big slides for the 7 & 9s + Aquakids for littles. Quarteira, ~15 min.", suits: "Big kids + littles", shade: false, source: "starter" },
  { id: "a3", cat: "active", title: "Falésia cliff walk", note: "Dramatic red cliffs, pine shade up top. ~5 min.", suits: "All ages", shade: true, source: "starter" },
  { id: "a4", cat: "active", title: "Benagil sea-caves boat trip", note: "The famous cave with the skylight, plus coves for a swim.", suits: "All ages", shade: false, source: "starter" },
  { id: "a5", cat: "active", title: "Adega do Cantor wine tasting", note: "Grown-up afternoon in Guia, ~20 min. Book ahead.", suits: "Grown-ups", shade: true, source: "starter" },
  { id: "a6", cat: "active", title: "Krazy World animal park", note: "Rescue animals + splash pools. Gentle. Algoz, ~30 min.", suits: "Younger kids", shade: false, source: "starter" },
  { id: "a7", cat: "active", title: "Albufeira Old Town", note: "Cobbled lanes, beach and boat trips. ~15 min.", suits: "All ages", shade: true, source: "starter" },
  { id: "a8", cat: "active", title: "Vilamoura marina afternoon", note: "Stroll the boats, ice cream, people-watching. ~15 min.", suits: "All ages", shade: false, source: "starter" },
  { id: "a9", cat: "active", title: "Aqualand water park", note: "Quieter water-park alternative. Alcantarilha, ~30 min.", suits: "Big kids", shade: false, source: "starter" },
  { id: "a10", cat: "active", title: "Dolphin-watching boat trip", note: "Head out to spot dolphins off the coast.", suits: "All ages", shade: false, source: "starter" },

  // ON THE WATER
  { id: "w1", cat: "water", title: "Bareboat sail from Vilamoura", note: "Skipper it yourself — Grisha's got the licence. Cove-hop & anchor for a swim.", suits: "Grown-ups +", shade: false, source: "starter" },
  { id: "w2", cat: "water", title: "Skippered charter (Cool Charters)", note: "Someone else drives — caves, coves and swim stops.", suits: "All ages", shade: false, source: "starter" },
  { id: "w3", cat: "water", title: "Kayak sea-cave tour (SUPA)", note: "Paddle through arches from Praia do Castelo. Safe with kids.", suits: "Big kids +", shade: false, source: "starter" },
  { id: "w4", cat: "water", title: "Beginner surf / SUP lesson", note: "Gentle Falésia waves — a great first lesson for the 7 & 9s.", suits: "Big kids", shade: false, source: "starter" },
  { id: "w5", cat: "water", title: "Jet-ski & parasailing", note: "Adrenaline add-ons from Albufeira marina.", suits: "Grown-ups / teens", shade: false, source: "starter" },
];

/* Stable display order. Cards are deliberately NOT sorted by reaction count —
   re-ranking on every tap made items jump out from under your finger. Starter
   ideas keep their authored order; anything added later lands at the end
   (ids are "u<timestamp>", so they stay in the order they were added). */
const SEED_ORDER = new Map(SEED_IDEAS.map((i, idx) => [i.id, idx]));
const displayOrder = (i) =>
  SEED_ORDER.has(i.id) ? SEED_ORDER.get(i.id) : SEED_ORDER.size;

const WEEK = [
  { id: "d15", day: "Sat 15", kind: "easy", title: "Arrival", desc: "Everyone lands through the day. Settle in, pool time, and an easy villa supper." },
  { id: "d16", day: "Sun 16", kind: "easy", title: "Settling in", desc: "A gentle beach morning at Olhos de Água, then a lazy afternoon by the pool." },
  { id: "d17", day: "Mon 17", kind: "out", fixed: true, title: "First activity day", desc: "A big morning outing — e.g. Zoomarine or Falésia beach — then everyone out together for dinner." },
  { id: "d18", day: "Tue 18", kind: "free", title: "Your call", desc: "Shaped by the vote — maybe a water-park day at Aquashow, or a boat trip along the coast." },
  { id: "d19", day: "Wed 19", kind: "free", title: "Your call", desc: "A natural split day: kayak caves or a surf lesson for some, wine tasting for the grown-ups, beach for the littles." },
  { id: "d20", day: "Thu 20", kind: "villa", fixed: true, title: "Villa feast night", desc: "Easy daytime (Krazy World or a quiet beach), then pizzas or a barbecue for the whole house." },
  { id: "d21", day: "Fri 21", kind: "open", title: "Wind-down", desc: "Last swim, a marina or old-town wander, relaxed evening — out together or in smaller groups." },
  { id: "d22", day: "Sat 22", kind: "travel", title: "Departure", desc: "Pack up, a final coffee or beach walk, then off to the airport." },
];

const KIND = {
  out:    { label: "Out together", color: "#0E5A6E" },
  villa:  { label: "Villa feast",  color: "#C77D2E" },
  easy:   { label: "Villa night",  color: "#1FA396" },
  free:   { label: "Free-for-all", color: "#E9663B" },
  open:   { label: "Open",         color: "#2E6DB4" },
  travel: { label: "Travel day",   color: "#8A9599" },
};

const REACTIONS = ["👍", "😍", "🎉", "🏖️", "😴"];

const RESTAURANTS = [
  { id: "r1", name: "A Lagosteira", note: "Roomy & well-run — best for a table of 12. Lobster tank.", maps: "https://maps.google.com/?cid=678385334939657228" },
  { id: "r2", name: "Restaurante Olhos d'Água", note: "Authentic Portuguese in the village.", maps: "https://maps.google.com/?cid=1586534743399575749" },
  { id: "r3", name: "Calheiros", note: "Piri-piri chicken & steak, buzzy.", maps: "https://maps.google.com/?cid=12357573707303470301" },
  { id: "r4", name: "O Pássaro Azul", note: "Beach-side sunset fish dinner.", maps: "https://maps.google.com/?cid=14253802638507826338" },
  { id: "r5", name: "By the Sea", note: "Casual, easy with kids.", maps: "https://www.google.com/maps/search/?api=1&query=By%20the%20Sea%20Olhos%20de%20Agua&query_place_id=ChIJjwKEM9vLGg0RkTatUXqcw5o" },
];

/* ---- link helpers ---- */
const cid = (c) => "https://maps.google.com/?cid=" + c;
const qmaps = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const pmaps = (name, pid) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(name) + "&query_place_id=" + pid;

/* Google Places photos (representative, one per place) */
const IMG = {
  beach: "https://lh3.googleusercontent.com/place-photos/AJRVUZPQIiEPgEaAYKmzsuMEz3L2NRLnhV3kk-qp1jd8jwEJPp6NjXNFlHKlzCKpcFaJwDEOXY17MBa5e9UldGd5suEydalSLfc0iTFjDSxCWP-96CbY5dJb4s2inJ9LgusDI6E6aBB3dv7DiQFTHQ=s1600-w800-h600",
  restOlhos: "https://lh3.googleusercontent.com/place-photos/AJRVUZPZ0mIMJFeJo2te8auUFCm7V7c9kMPfI7_mJN0nmaoEM5QV61-RIPCyLzHfcvxIo6Jrz4CQsCgbnZVeUSup1faRukEiVg5n7A1sHqPMiMZjp428ILsshLE-JiVTs43CzhO7AKbb5dEnsM94QA=s1600-w800-h600",
  passaro: "https://lh3.googleusercontent.com/place-photos/AJRVUZMaSqKXJjecBylRpBI9StrIvSj5dIiGVIT966qxzwilPY4lhO77QY1xJrwUR1BmGR93ChyCnxoveyInK-mPpGbEHlyJfiJjPCez6UZK4pMpmANfwREt7k6y_DDS88cP5e4Bb5UOmwdAijbou7o=s1600-w800-h600",
  zoomarine: "https://lh3.googleusercontent.com/place-photos/AJRVUZMrAtTGErlcQmuqsM04ZLGJGhMRiWYEVGFGCGX7O22CMCJCXNxO7MmupM5E7R3Bbin4wbvEH5HlJ_n9NSGbMCUWlPk9ySZ2wkROiKd4zAhb9BYaW2FH4pDjuOBWlh0C_nrWi1OwSknTCbjS=s1600-w800-h600",
  aquashow: "https://lh3.googleusercontent.com/place-photos/AJRVUZOq2M83YTiZBtIsz4vs4dvENrJ6rEbH8aIA5hA4Om7JR5Y5tkQQpvSJ6tqN8JZ7igGSLPE1z_lNeR59RFFzQbggWXaCrCKPSiL_7iJ8xcomopPtwqnWyHVEac4NUz8tvn9wsXUNUW5bzdyuMA=s1600-w800-h600",
  falesia: "https://lh3.googleusercontent.com/place-photos/AJRVUZNj5FJNLhZ_zxLBprEIi9syJQtwjcGArXhkhoR0IB6azopHyGEBLLqjrMCmBWbpxUlDgZiu2NeKsf_En7LPDXNh1LPY_s2nEo7eO428XasdT6R6XxDI-zgwdcOAY51fjnHyXTm2OYuhdfgi-w=s1600-w800-h600",
  krazy: "https://lh3.googleusercontent.com/place-photos/AJRVUZMvwFcDcermb5T4XKG1C1LO0wXKQI1jECBewHwh2xB6ahSJN4XtW-7xODkuUtg_Hmvtd1udbWjDMGp22VVqoXUUzYez0Lat8Bv8RT_9DYVU3UqFNdiMmVyUUAJMtevg4p3SjME2pbSEo92OpL8=s1600-w800-h600",
  oldtown: "https://lh3.googleusercontent.com/place-photos/AJRVUZMBodvsY2qyAG_sLigc3-H-AzS5NceBG-qBagY19j9-ick1kNAX4z1dX_PV2ZAKjdLcQHeUehp6udHKvNWC-0Pat0np136bc7TSbY0h2tC_vwk8o0ngtyc1X2Ru6Y3LTsrwsoXO-pj-6-1NFQ=s1600-w800-h600",
  vilamoura: "https://lh3.googleusercontent.com/place-photos/AJRVUZNxK8Nb0jGd-QohMgP_EJCKpumsAIYE8owQj81imMya3EEuC-YaygottMQxprdTFXaBKXCLBSd9V7_x6SCrQN9ACZUys78fdif7xyYRgi3TbCxFmxoED96vtAccU3_c-k4uLQwNnQ3IaUkuqYI=s1600-w800-h600",
  aqualand: "https://lh3.googleusercontent.com/place-photos/AJRVUZPxo1S5xa4W6lPtjg_dvjzBVVGOM2U5iBWcuFYnVILOlwxpWF2T0DYV_Yzx2xj4lRwkkuCVeSct8_DZzU1dHSbDCXLu53WnQrTLar0VIdclMATF1-vfrvqdmRZp_KgQbXmFVYbEUyv-A9rSirh-B-Mqyg=s1600-w800-h600",
};

/* Deeper detail per starter idea — looked up at render, not stored */
const DETAILS = {
  c1: { img: IMG.beach, maps: cid("15274520669397784669"), desc: "The village's own cove: soft sand, shallow water, and the freshwater springs that bubble up through the beach at low tide. Sunbeds, showers and cafés right there, and an easy walk from the villa — ideal with the 1- and 4-year-olds." },
  c2: { noMaps: true, desc: "A do-nothing day at base. Pool, shade, snacks and naps for the littles — the recovery day that keeps everyone sane between outings." },
  c3: { img: IMG.restOlhos, maps: cid("1586534743399575749"), desc: "A village institution for about 30 years — grilled fish and sweet prawns, peppercorn steak, warm service. Buzzy and well-priced; book ahead for a table of 12." },
  c4: { img: IMG.passaro, maps: cid("14253802638507826338"), web: "http://passaroazul.pt/", desc: "Fresh fish almost on the sand, best at sunset — order by weight from the counter. Mind the tide: sometimes it's the steps rather than the beach walk, so watch the buggy." },
  c5: { img: IMG.beach, maps: qmaps("Olhos de Agua village Algarve"), desc: "An easy evening: wander the seafront, watch the fishing boats come in, grab a gelato. No plan required." },
  c6: { maps: pmaps("By the Sea Olhos de Agua", "ChIJjwKEM9vLGg0RkTatUXqcw5o"), desc: "Relaxed brunch-and-cocktails spot on the seafront — toasties, poke bowls, burgers, and staff who are great with kids." },

  a1: { img: IMG.zoomarine, maps: cid("10157786535580481711"), web: "https://www.zoomarine.pt/", desc: "The region's marine theme park: dolphin, sea-lion and bird-of-prey shows, a water-play area, fairground rides and a 4D cinema. Best all-rounder for ages 4–10. Under 1m tall is free; grab a show schedule on arrival and plan the day around it." },
  a2: { img: IMG.aquashow, maps: cid("18292645273975041217"), web: "https://aquashowpark.com/", desc: "Portugal's biggest water park — a genuine water roller-coaster and steep slides for the 7 & 9s, plus Aquakids and Aqualandia splash zones for the little ones. Slides have height limits (~1.10–1.40m), so measure the kids first." },
  a3: { img: IMG.falesia, maps: cid("14970393337637753104"), desc: "A jaw-dropping stretch of sand beneath red-orange cliffs, with pine shade along the top. Vast, so it never feels crowded. Use the Bar Falésia access to skip the 120 steps with a buggy." },
  a4: { maps: qmaps("Benagil Cave Algarve"), desc: "The Algarve's iconic sea cave with a natural skylight, reached by boat with stops at hidden coves for a swim. Trips leave from Albufeira and Vilamoura marinas — pick a morning slot for calmer seas." },
  a5: { maps: qmaps("Adega do Cantor Guia Algarve"), desc: "A small hillside winery near Guia (~20 min) with vineyard-and-coast views, once co-owned by Cliff Richard. Tastings run about €10–20 and booking ahead is essential — a shaded grown-ups' afternoon while others take the kids to the beach." },
  a6: { img: IMG.krazy, maps: cid("106706211701508031"), web: "https://www.krazyworld.com/", desc: "A gentle rescue-animal park with reptile handling, a petting area and a small splash pool — relaxed and cheap, well-judged for the 1- and 4-year-olds. About 30 min inland." },
  a7: { img: IMG.oldtown, maps: cid("8655630820112625133"), desc: "Whitewashed cobbled lanes, a tunnel down to the beach, and the marina nearby for boat trips. Family-friendly by day (it gets rowdier late). About 15 min." },
  a8: { img: IMG.vilamoura, maps: cid("11747829863163665369"), web: "http://www.marinadevilamoura.com/", desc: "A glossy marina to stroll — superyachts, ice cream, cafés, and the launch point for boat trips. An easy, partly-shaded afternoon. About 15 min." },
  a9: { img: IMG.aqualand, maps: cid("9341993766026799173"), web: "https://www.aqualand.pt/", desc: "A quieter water-park alternative to Aquashow, about 30 min west. Shorter queues on weekdays; take your own snacks, as on-site food is pricey." },
  a10: { maps: qmaps("dolphin watching Albufeira marina"), desc: "A shorter boat outing to spot dolphins off the coast, often combined with the Benagil caves. Good for a half-day when a full sail feels like too much with the baby." },

  w1: { img: IMG.vilamoura, maps: cid("11747829863163665369"), web: "https://www.clickandboat.com/uk/boat-hire/portugal/vilamoura", desc: "Grisha has a sailing licence, so we can take a boat out ourselves from Vilamoura — sailboats from ~£170/day, motorboats from ~£200. Cove-hop west toward Benagil or east to the Ria Formosa lagoons, anchor and swim." },
  w2: { maps: pmaps("Cool Charters Vilamoura", "ChIJFQMM4pO1Gg0RhzjzX60Frds"), desc: "A top-rated skippered charter from Vilamoura for days you'd rather not be at the helm — caves, coves, swim stops and snacks aboard. Lovely for a family day with the kids." },
  w3: { maps: pmaps("SUPA Albufeira", "ChIJQazyj_rLGg0R67XTYQ_qVDA"), web: "https://www.supalbufeira.com/", desc: "Guided kayak/SUP trips from Praia do Castelo through arches and sea caves, with two guides and a safety boat. Reviewers rate them highly with kids and nervous first-timers. About 20 min." },
  w4: { maps: pmaps("Vilamoura Surf Project", "ChIJJaVMGo-1Gg0Rtjvkm8q3-hI"), web: "https://en.vilamourasurf.com/", desc: "Beginner surf, SUP and bodyboard lessons on Falésia beach's gentle waves — federation-certified, softboards and wetsuits provided, and instructors who are brilliant with young kids. About 15 min." },
  w5: { maps: pmaps("Marina de Albufeira", "ChIJyc5L99LNGg0RCMkHJNqWtCc"), desc: "Adrenaline add-ons — jet-ski hire and parasailing — booked at Albufeira marina, the hub for water excursions. Better suited to the grown-ups and teens." },
};

const CAT = {
  chill:  { label: "Chill",        color: "#1FA396", ink: "#0c5f57" },
  active: { label: "Active",       color: "#E9663B", ink: "#9c3c1c" },
  water:  { label: "On the water", color: "#2E6DB4", ink: "#1c4a82" },
};

/* ---------------------------------------------------------------------------
   PERSISTENCE  (realtime collaboration via Firebase Realtime Database)

   Best-practice schema for reactions/voting — ONE LEAF PER USER, so there are
   no counters to increment, no transactions, and no write contention:

     boards/algarve/ideas/{ideaId}                    = { cat, title, note, ... }
     boards/algarve/reactions/{itemId}/{emoji}/{user} = true     // react on
     (remove that leaf to react off)     count = number of children
     boards/algarve/people/{user}                     = true

   Ideas are stored as an object keyed by id (arrays are discouraged in RTDB)
   and normalized to an array on read, since the UI expects data.ideas as a list.
--------------------------------------------------------------------------- */

/* Seed the starter ideas once. Keyed by their fixed ids (c1, a1, …), so this
   is idempotent — re-running never duplicates. Uses update() so it can't
   clobber any reactions/people already present. */
function seedBoard() {
  const ideas = {};
  SEED_IDEAS.forEach((i) => {
    ideas[i.id] = {
      cat: i.cat, title: i.title, note: i.note || "",
      suits: i.suits || "", shade: !!i.shade, source: i.source || "starter",
    };
  });
  return update(ref(db, `${BOARD}/ideas`), ideas);
}

/* Normalize the raw RTDB snapshot into the shape the UI expects. */
function normalize(v) {
  return {
    ideas: Object.entries(v.ideas || {}).map(([id, i]) => ({ id, ...i })),
    reactions: v.reactions || {},
    people: Object.keys(v.people || {}),
  };
}

/* Remember who you are on THIS device (works once deployed; the Claude preview
   disables localStorage, so these calls silently no-op here). This is per-device
   identity only — cross-person sync is the database's job. */
const NAME_KEY = "wingos_name";
function loadName() { try { return localStorage.getItem(NAME_KEY) || null; } catch (e) { return null; } }
function saveName(n) { try { localStorage.setItem(NAME_KEY, n); } catch (e) {} }

/* ---- colour a person's initials consistently ---- */
const AVATAR_COLORS = ["#0E5A6E", "#E9663B", "#1FA396", "#2E6DB4", "#F2A93B", "#6F8F4E", "#B4457E", "#8A5A2B"];
function personColor(name) {
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
const initials = (n) => n.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

/* ---- shared reaction bar (per-emoji counts live on each button) ---- */
function ReactionBar({ id, reactions, user, onReact, stop }) {
  const r = (reactions && reactions[id]) || {};
  return (
    <div className="reacts">
      {REACTIONS.map((em) => {
        const who = Object.keys(r[em] || {});
        const mine = who.includes(user);
        return (
          <button key={em} className={"react " + (mine ? "on" : "")}
            onClick={(e) => { if (stop) e.stopPropagation(); onReact(id, em); }}
            title={who.length ? who.join(", ") : "React with " + em}>
            <span className="rem">{em}</span>{who.length > 0 && <span className="rn">{who.length}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================== */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const [activeIdea, setActiveIdea] = useState(null);

  useEffect(() => {
    // restore who you are on this device
    const saved = loadName();
    if (saved) setUser(saved);

    // Realtime sync: sign in anonymously (rules require auth != null), then
    // subscribe to the whole board. Seed the starter ideas once if empty.
    let unsub = () => {};
    signInAnonymously(auth)
      .then(() => {
        unsub = onValue(ref(db, BOARD), (snap) => {
          const v = snap.val();
          if (!v || !v.ideas) { seedBoard(); return; } // fires again after seed
          setData(normalize(v));
          setLoading(false);
        });
      })
      .catch((e) => { console.error("Auth failed", e); setLoading(false); });
    return () => unsub();
  }, []);

  /* ---------- actions: one granular write per event ---------- */
  const toggleReaction = (id, emoji) => {
    if (!user) return;
    const path = `${BOARD}/reactions/${id}/${emoji}/${user}`;
    const mine = data?.reactions?.[id]?.[emoji]?.[user];
    if (mine) remove(ref(db, path));
    else set(ref(db, path), true);
  };

  const addIdea = (idea) => {
    if (!user) return;
    const id = "u" + Date.now() + Math.floor(Math.random() * 99);
    set(ref(db, `${BOARD}/ideas/${id}`), {
      cat: idea.cat, title: idea.title, note: idea.note || "",
      suits: idea.suits || "", shade: !!idea.shade,
      source: idea.source || "added", by: user,
    });
    set(ref(db, `${BOARD}/reactions/${id}/👍/${user}`), true); // author auto-likes
  };

  const joinAs = (name) => {
    const clean = sanitizeKey(name);
    if (!clean) return;
    saveName(clean); // remember on this device
    set(ref(db, `${BOARD}/people/${clean}`), true);
    setUser(clean);
  };

  if (loading) return <Splash line="Setting the table…" />;

  return (
    <>
      <style>{CSS}</style>
      {!user && <NameGate people={data.people} onJoin={joinAs} />}
      <div className="wrap">
        <Header user={user} />

        <RhythmBanner />

        <MealsView data={data} user={user} onReact={toggleReaction} />

        <IdeasView data={data} user={user} filter={filter} setFilter={setFilter} onReact={toggleReaction} addIdea={addIdea} onOpen={setActiveIdea} />

        <footer className="foot">
          <span>Everyone on this link shares one live board — reactions and ideas sync for everyone.</span>
        </footer>
      </div>

      {activeIdea && (() => {
        const idea = data.ideas.find((i) => i.id === activeIdea);
        if (!idea) return null;
        return <IdeaDetail idea={idea} user={user} reactions={data.reactions} onReact={toggleReaction} onClose={() => setActiveIdea(null)} />;
      })()}
    </>
  );
}

/* ------------------------------ Rhythm banner ------------------------------ */
function RhythmBanner() {
  return (
    <section className="rhythm">
      <h2 className="rhythm-h"><SunIcon /> How we'll pace the days</h2>
      <p className="rhythm-intro">Land gently first — <b>chill at the villa Saturday & Sunday</b>. <b>Monday is our first activity day</b>: something out in the morning, then everyone together for dinner. In the August heat, timing is everything —</p>
      <div className="rhythm-cols">
        <div className="rblock"><span className="r-ico">🌅</span><b>Mornings · ~9–1</b><span>Get out while it's fresh — beaches, parks, boats.</span></div>
        <div className="rblock noon"><span className="r-ico">☀️</span><b>Midday · ~1–5</b><span>Peak sun. Seek shade — villa, long lunch, siesta for the littles.</span></div>
        <div className="rblock"><span className="r-ico">🌇</span><b>Evenings · ~5–late</b><span>Back out — dinner, a stroll, sunset on the water.</span></div>
      </div>
    </section>
  );
}

/* ------------------------------- Header ------------------------------- */
function Header({ user }) {
  return (
    <header className="head">
      <div className="head-band">
        <p className="eyebrow">The Wingos · Algarve · 15–22 August 2026</p>
        <h1 className="title">Piri-Piri Wingding</h1>
        <p className="lede">Everything for our week in one scroll: how we'll pace the days, the plan day by day, the restaurants to book, and the activities to react to.</p>
      </div>
      <div className="head-meta">
        {user
          ? <span className="who"><i className="dot" style={{ background: personColor(user) }} />You're reacting as <b>{user}</b></span>
          : <span className="who">Pick your name to start</span>}
      </div>
    </header>
  );
}

/* ------------------------------ Ideas view ------------------------------ */
function IdeasView({ data, user, filter, setFilter, onReact, addIdea, onOpen }) {
  // Stable order — intentionally independent of reaction counts, so a card
  // never moves when you react to it.
  const visible = useMemo(() => {
    return [...data.ideas]
      .filter((i) => filter === "all" ? true : i.cat === filter)
      .sort((a, b) => displayOrder(a) - displayOrder(b) || a.id.localeCompare(b.id));
  }, [data.ideas, filter]);

  const counts = useMemo(() => {
    const c = { all: data.ideas.length, chill: 0, active: 0, water: 0 };
    data.ideas.forEach((i) => c[i.cat]++);
    return c;
  }, [data]);

  return (
    <section className="activities">
      <div className="activities-intro">
        <h2 className="mh">Activities we'd like to do</h2>
        <p className="msub">React to anything you fancy with an emoji — the counts show how keen everyone is. Tap a card for photos, details and booking links, or add your own below.</p>
      </div>
      <div className="chips">
        <Chip on={filter === "all"} onClick={() => setFilter("all")} label={`Everything · ${counts.all}`} color="#0E5A6E" />
        <Chip on={filter === "chill"} onClick={() => setFilter("chill")} label={`Chill · ${counts.chill}`} color={CAT.chill.color} />
        <Chip on={filter === "active"} onClick={() => setFilter("active")} label={`Active · ${counts.active}`} color={CAT.active.color} />
        <Chip on={filter === "water"} onClick={() => setFilter("water")} label={`On the water · ${counts.water}`} color={CAT.water.color} />
      </div>

      <div className="grid">
        {visible.map((i) => (
          <IdeaCard key={i.id} idea={i} user={user} reactions={data.reactions} onReact={onReact} onOpen={onOpen} />
        ))}
      </div>

      <AddIdea onAdd={addIdea} />
    </section>
  );
}

function IdeaCard({ idea, user, reactions, onReact, onOpen }) {
  const cat = CAT[idea.cat];
  return (
    <article className="card clickable" style={{ "--cat": cat.color }} role="button" tabIndex={0}
      onClick={() => onOpen(idea.id)} onKeyDown={(e) => { if (e.key === "Enter") onOpen(idea.id); }}
      aria-label={"Open details for " + idea.title}>
      <div className="card-top">
        <span className="tag" style={{ color: cat.ink, background: cat.color + "22", borderColor: cat.color + "55" }}>{cat.label}</span>
        {idea.shade && <span className="shade" title="Has good shade / indoor option">☂ shade</span>}
      </div>

      <h3 className="card-title">{idea.title}</h3>
      {idea.note && <p className="card-note">{idea.note}</p>}

      <div className="card-mid">
        {idea.suits && <span className="suits">{idea.suits}</span>}
        {idea.source === "concierge" && <span className="src">via concierge</span>}
        {idea.by && idea.source !== "starter" && <span className="src">added by {idea.by}</span>}
        <span className="details-hint">Details →</span>
      </div>

      <div className="card-foot col">
        <ReactionBar id={idea.id} reactions={reactions} user={user} onReact={onReact} stop />
      </div>
    </article>
  );
}

function IdeaDetail({ idea, user, reactions, onReact, onClose }) {
  const cat = CAT[idea.cat];
  const det = DETAILS[idea.id] || {};
  const maps = det.noMaps ? null : (det.maps || qmaps(idea.title + " Olhos de Agua Algarve"));
  const web = det.web;
  const img = det.img;
  const desc = det.desc || idea.note;
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="detail" onClick={(e) => e.stopPropagation()}>
        <button className="x float" onClick={onClose} aria-label="Close">✕</button>
        <div className="detail-hero">
          {img && imgOk
            ? <img src={img} alt={idea.title} onError={() => setImgOk(false)} />
            : <div className="hero-fallback" style={{ background: "linear-gradient(135deg," + cat.color + "," + cat.ink + ")" }}><SunIcon /></div>}
        </div>
        <div className="detail-body">
          <span className="tag" style={{ color: cat.ink, background: cat.color + "22", borderColor: cat.color + "55" }}>{cat.label}</span>
          <h2 className="detail-title">{idea.title}</h2>
          <p className="detail-desc">{desc}</p>
          <div className="detail-meta">
            {idea.suits && <span className="suits">{idea.suits}</span>}
            {idea.shade && <span className="shade">☂ good shade</span>}
          </div>
          <div className="detail-links">
            {maps && <a className="linkout" href={maps} target="_blank" rel="noreferrer">📍 Open in Google Maps</a>}
            {web && <a className="linkout web" href={web} target="_blank" rel="noreferrer">🔗 Website &amp; booking</a>}
          </div>
          <div className="detail-react">
            <span className="dv-label">React</span>
            <ReactionBar id={idea.id} reactions={reactions} user={user} onReact={onReact} />
          </div>
          {img && imgOk && <p className="credit">Photo via Google Maps</p>}
        </div>
      </div>
    </div>
  );
}

function AddIdea({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [cat, setCat] = useState("active");
  const submit = () => { if (!title.trim()) return; onAdd({ title, note, cat }); setTitle(""); setNote(""); setOpen(false); };
  if (!open) return <button className="add-open" onClick={() => setOpen(true)}>+ Add your own idea</button>;
  return (
    <div className="add">
      <h3 className="add-h">Add an idea</h3>
      <input className="in" placeholder="What is it? (e.g. Loulé Saturday market)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className="in" placeholder="One-line note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="add-cats">
        {Object.entries(CAT).map(([k, v]) => (
          <button key={k} className={"catpick " + (cat === k ? "on" : "")} style={{ "--cat": v.color }} onClick={() => setCat(k)}>{v.label}</button>
        ))}
      </div>
      <div className="add-actions">
        <button className="primary" onClick={submit}>Add to board</button>
        <button className="ghost" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}

/* ------------------------------ Meals view ------------------------------ */
function MealsView({ data, user, onReact }) {
  // Fixed order, for the same reason as the activity cards.
  const restaurants = RESTAURANTS;

  return (
    <section className="meals">
      <div className="meals-intro">
        <h2 className="mh">Suggestions for the week</h2>
        <p className="msub">These are just our suggestions for the week — let us know how you feel with emojis.</p>
      </div>

      <div className="week">
        {WEEK.map((w) => {
          const k = KIND[w.kind];
          return (
            <div key={w.id} className="wday" style={{ borderLeftColor: k.color, ...(w.fixed ? { background: "linear-gradient(180deg,#EFF6F4,#fff)" } : {}) }}>
              <div className="wday-day">{w.day}</div>
              <div className="wday-main">
                <div className="wday-top">
                  <span className="wtitle">{w.fixed && <span className="fixed-star">★ </span>}{w.title}</span>
                  <span className="wtag" style={{ background: k.color }}>{k.label}</span>
                </div>
                <p className="wnote">{w.desc}</p>
                <ReactionBar id={w.id} reactions={data.reactions} user={user} onReact={onReact} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="meals-intro">
        <h2 className="mh">Favourite spots for the big table</h2>
        <p className="msub">React to the places you'd most like to book — whichever gets the most love is what we'll reserve for Monday (and any other night we head out). Tap a name for its map, menu and reviews.</p>
      </div>

      <div className="rlist">
        {restaurants.map((r) => (
          <div key={r.id} className="rrow">
            <div className="rinfo">
              <a className="rname" href={r.maps} target="_blank" rel="noreferrer">{r.name} <span className="mapspin">📍</span></a>
              <p>{r.note}</p>
            </div>
            <ReactionBar id={r.id} reactions={data.reactions} user={user} onReact={onReact} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- small bits ----------------------------- */
function Chip({ on, onClick, label, color }) {
  return <button className={"fchip " + (on ? "on" : "")} style={{ "--c": color }} onClick={onClick}>{label}</button>;
}
function SunIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="#F2A93B" /><g stroke="#F2A93B" strokeWidth="1.8" strokeLinecap="round">{[...Array(8)].map((_, i) => { const a = (i * Math.PI) / 4; return <line key={i} x1={12 + Math.cos(a) * 7} y1={12 + Math.sin(a) * 7} x2={12 + Math.cos(a) * 9.5} y2={12 + Math.sin(a) * 9.5} />; })}</g></svg>);
}
function Splash({ line }) {
  return (<><style>{CSS}</style><div className="splash"><SunIcon /><p>{line}</p></div></>);
}
function NameGate({ people, onJoin }) {
  const [name, setName] = useState("");
  return (
    <div className="gate-bg">
      <div className="gate">
        <SunIcon />
        <h2>Who's voting?</h2>
        <p>Pick your name so we can see who's keen on what.</p>
        {people.length > 0 && (
          <div className="gate-people">
            {people.map((p) => (
              <button key={p} className="gp" onClick={() => onJoin(p)}><i className="av sm" style={{ background: personColor(p) }}>{initials(p)}</i>{p}</button>
            ))}
          </div>
        )}
        <div className="gate-add">
          <input className="in" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onJoin(name); }} />
          <button className="primary" onClick={() => onJoin(name)}>Start voting</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- styles ------------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Nunito:wght@400;600;700;800&display=swap');
* { box-sizing: border-box; }
:root{
  --sand:#F7F3E9; --card:#ffffff; --ink:#21343B; --muted:#5C6F76;
  --teal:#0E5A6E; --teal2:#14788F; --marigold:#F2A93B; --line:#E7DFCE;
}
body{ margin:0; }
.wrap{ max-width:960px; margin:0 auto; padding:0 16px 120px; font-family:'Nunito',system-ui,sans-serif; color:var(--ink); background:
  radial-gradient(1200px 400px at 50% -180px, #E5F1EF 0%, rgba(229,241,239,0) 70%) , var(--sand); min-height:100vh; }
@media (prefers-reduced-motion: reduce){ *{ animation:none!important; transition:none!important; } }

/* header */
.head{ padding-top:26px; }
.head-band{ }
.eyebrow{ font-size:12.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--teal2); font-weight:800; margin:0 0 8px; }
.title{ font-family:'Fraunces',serif; font-weight:600; font-size:clamp(30px,6vw,46px); line-height:1.02; margin:0; color:var(--teal); letter-spacing:-.01em; }
.lede{ font-size:15.5px; color:var(--muted); max-width:60ch; margin:12px 0 0; }
.head-meta{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin:18px 0 6px; flex-wrap:wrap; }
.who{ font-size:14px; color:var(--ink); display:flex; align-items:center; gap:8px; }
.who b{ color:var(--teal); }
.dot{ width:12px; height:12px; border-radius:50%; display:inline-block; }

/* tabs */
.tabs{ display:flex; gap:6px; margin:14px 0 18px; background:#fff; border:1px solid var(--line); border-radius:14px; padding:5px; width:fit-content; }
.tab{ border:0; background:transparent; font-family:inherit; font-weight:800; font-size:14px; color:var(--muted); padding:9px 16px; border-radius:10px; cursor:pointer; }
.tab.on{ background:var(--teal); color:#fff; }

/* filter chips */
.chips{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
.fchip{ border:1.5px solid var(--line); background:#fff; color:var(--muted); font-family:inherit; font-weight:700; font-size:13px; padding:7px 13px; border-radius:999px; cursor:pointer; }
.fchip.on{ border-color:var(--c); color:#fff; background:var(--c); }

/* grid */
.grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(255px,1fr)); gap:14px; }
.card{ background:var(--card); border:1px solid var(--line); border-left:4px solid var(--cat); border-radius:16px; padding:16px 16px 12px; display:flex; flex-direction:column; box-shadow:0 1px 0 rgba(33,52,59,.03); transition:transform .12s ease, box-shadow .12s ease; }
.card:hover{ transform:translateY(-2px); box-shadow:0 10px 24px -14px rgba(14,90,110,.35); }
.card-top{ display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.tag{ font-size:11.5px; font-weight:800; padding:3px 9px; border-radius:999px; border:1px solid; }
.shade{ font-size:11.5px; font-weight:700; color:#7a6a3d; background:#F6EBCB; padding:3px 8px; border-radius:999px; }
.rank{ margin-left:auto; font-family:'Fraunces',serif; font-weight:700; color:var(--marigold); font-size:16px; }
.card-title{ font-family:'Fraunces',serif; font-weight:600; font-size:19px; line-height:1.12; margin:0 0 6px; }
.card-note{ font-size:13.5px; color:var(--muted); margin:0 0 10px; line-height:1.4; }
.card-mid{ display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; }
.suits{ font-size:11.5px; font-weight:700; color:var(--teal2); background:#E5F1EF; padding:3px 8px; border-radius:6px; }
.src{ font-size:11px; color:var(--muted); font-style:italic; align-self:center; }
.card-foot{ display:flex; align-items:center; justify-content:space-between; margin-top:auto; padding-top:10px; border-top:1px dashed var(--line); }
.vote{ display:flex; align-items:center; gap:6px; }
.vbtn{ width:30px; height:30px; border-radius:9px; border:1.5px solid var(--line); background:#fff; cursor:pointer; font-size:12px; color:var(--muted); line-height:1; }
.vbtn.up.act{ background:var(--cat); border-color:var(--cat); color:#fff; }
.vbtn.down.act{ background:#c94a3a; border-color:#c94a3a; color:#fff; }
.score{ min-width:30px; text-align:center; font-weight:800; font-size:15px; color:var(--muted); }
.score.pos{ color:var(--teal); } .score.neg{ color:#c94a3a; }
.fans{ display:flex; align-items:center; gap:-6px; }
.av{ width:26px; height:26px; border-radius:50%; color:#fff; font-size:10.5px; font-weight:800; display:inline-flex; align-items:center; justify-content:center; border:2px solid #fff; margin-left:-6px; font-style:normal; }
.av.sm{ width:22px; height:22px; font-size:9.5px; margin-left:-5px; }
.av.more{ background:#9aa8ac; }
.nofans{ font-size:12px; color:#a7b1b4; font-style:italic; }

/* add idea */
.add-open{ margin:18px 0 0; background:transparent; border:1.5px dashed var(--teal2); color:var(--teal); font-family:inherit; font-weight:800; font-size:14px; padding:12px 18px; border-radius:12px; cursor:pointer; width:100%; }
.add{ margin-top:18px; background:#fff; border:1px solid var(--line); border-radius:16px; padding:16px; }
.add-h{ font-family:'Fraunces',serif; margin:0 0 12px; color:var(--teal); font-weight:600; }
.in{ width:100%; border:1.5px solid var(--line); border-radius:10px; padding:11px 13px; font-family:inherit; font-size:14px; color:var(--ink); background:#fff; margin-bottom:10px; }
.in:focus-visible{ outline:3px solid #bfe0da; border-color:var(--teal2); }
.add-cats{ display:flex; gap:8px; flex-wrap:wrap; margin:2px 0 12px; }
.catpick{ border:1.5px solid var(--line); background:#fff; color:var(--muted); font-family:inherit; font-weight:700; font-size:13px; padding:7px 13px; border-radius:999px; cursor:pointer; }
.catpick.on{ background:var(--cat); border-color:var(--cat); color:#fff; }
.add-actions{ display:flex; gap:8px; }
.primary{ background:var(--teal); color:#fff; border:0; font-family:inherit; font-weight:800; font-size:14px; padding:11px 18px; border-radius:10px; cursor:pointer; }
.primary:hover{ background:var(--teal2); }
.primary.sm{ padding:8px 14px; font-size:13px; }
.ghost{ background:#fff; border:1.5px solid var(--line); color:var(--muted); font-family:inherit; font-weight:800; font-size:14px; padding:9px 16px; border-radius:10px; cursor:pointer; }

/* meals */
.meals-intro{ margin:8px 0 12px; }
.mh{ font-family:'Fraunces',serif; font-weight:600; color:var(--teal); font-size:22px; margin:0 0 4px; }
.msub{ font-size:14px; color:var(--muted); margin:0; max-width:60ch; }
.nights{ display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:10px; margin-bottom:26px; }
.night{ text-align:left; background:#fff; border:1.5px solid var(--line); border-radius:14px; padding:12px; cursor:pointer; display:flex; flex-direction:column; gap:3px; font-family:inherit; }
.night.on{ border-color:var(--marigold); background:linear-gradient(180deg,#FEF6E4,#fff); box-shadow:0 6px 16px -12px rgba(242,169,59,.7); }
.night-day{ font-family:'Fraunces',serif; font-weight:700; font-size:18px; color:var(--ink); }
.night-sub{ font-size:11px; color:var(--muted); }
.night-count{ font-size:12.5px; font-weight:800; color:var(--teal2); margin-top:2px; }
.night-fans{ display:flex; margin-top:4px; min-height:22px; }
.rlist{ display:flex; flex-direction:column; gap:10px; }
.rrow{ display:flex; flex-direction:column; align-items:flex-start; gap:10px; background:#fff; border:1px solid var(--line); border-radius:14px; padding:12px 14px; }
.rinfo{ width:100%; } .rinfo h4{ margin:0 0 2px; font-family:'Fraunces',serif; font-weight:600; font-size:16px; color:var(--ink); }
.rinfo p{ margin:0; font-size:13px; color:var(--muted); }
.heart{ border:1.5px solid var(--line); background:#fff; color:#c94a3a; font-family:inherit; font-weight:800; font-size:14px; padding:9px 14px; border-radius:10px; cursor:pointer; display:flex; gap:6px; align-items:center; }
.heart.on{ background:#c94a3a; color:#fff; border-color:#c94a3a; }

/* footer */
.foot{ margin-top:34px; padding-top:16px; border-top:1px solid var(--line); display:flex; justify-content:space-between; gap:12px; align-items:center; flex-wrap:wrap; font-size:12.5px; color:var(--muted); }
.linkbtn{ background:none; border:0; color:#a7b1b4; text-decoration:underline; cursor:pointer; font-family:inherit; font-size:12.5px; }

/* FAB + concierge */
.fab{ position:fixed; right:16px; bottom:16px; background:var(--teal); color:#fff; border:0; border-radius:999px; padding:13px 18px; font-family:inherit; font-weight:800; font-size:14px; cursor:pointer; display:flex; align-items:center; gap:9px; box-shadow:0 12px 30px -10px rgba(14,90,110,.6); }
.fab:hover{ background:var(--teal2); }
.sheet-bg{ position:fixed; inset:0; background:rgba(20,40,46,.45); display:flex; align-items:flex-end; justify-content:center; z-index:50; padding:0; }
.sheet{ background:var(--sand); width:100%; max-width:520px; height:min(78vh,640px); border-radius:20px 20px 0 0; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 -10px 40px rgba(0,0,0,.25); }
@media(min-width:560px){ .sheet-bg{ align-items:center; } .sheet{ border-radius:20px; } }
.sheet-head{ display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:var(--teal); color:#fff; }
.sheet-head b{ margin-left:6px; }
.sheet-head > div{ display:flex; align-items:center; }
.x{ background:rgba(255,255,255,.18); border:0; color:#fff; width:30px; height:30px; border-radius:8px; cursor:pointer; font-size:14px; }
.chat{ flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }
.bubble{ max-width:82%; padding:11px 14px; border-radius:16px; font-size:14px; line-height:1.4; }
.bubble.assistant{ background:#fff; border:1px solid var(--line); align-self:flex-start; border-bottom-left-radius:5px; }
.bubble.user{ background:var(--teal2); color:#fff; align-self:flex-end; border-bottom-right-radius:5px; }
.bubble.thinking{ display:flex; gap:5px; }
.bubble.thinking span{ width:7px; height:7px; border-radius:50%; background:#bcc7ca; animation:blink 1.2s infinite; }
.bubble.thinking span:nth-child(2){ animation-delay:.2s; } .bubble.thinking span:nth-child(3){ animation-delay:.4s; }
@keyframes blink{ 0%,60%,100%{ opacity:.3; } 30%{ opacity:1; } }
.suggest{ background:#fff; border:1px solid var(--line); border-radius:14px; padding:12px; display:flex; align-items:center; gap:10px; align-self:stretch; }
.stag{ font-size:11px; font-weight:800; padding:3px 8px; border-radius:999px; white-space:nowrap; }
.sbody{ flex:1; } .sbody b{ font-size:14px; } .sbody p{ margin:2px 0 0; font-size:12.5px; color:var(--muted); }
.chat-in{ display:flex; gap:8px; padding:12px; border-top:1px solid var(--line); background:var(--sand); }
.chat-in .in{ margin:0; }

/* splash + gate */
.splash{ min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; font-family:'Nunito',sans-serif; color:var(--teal); background:var(--sand); }
.gate-bg{ position:fixed; inset:0; background:rgba(20,40,46,.55); display:flex; align-items:center; justify-content:center; z-index:60; padding:18px; }
.gate{ background:#fff; border-radius:20px; padding:26px 22px; max-width:400px; width:100%; text-align:center; font-family:'Nunito',sans-serif; }
.gate h2{ font-family:'Fraunces',serif; color:var(--teal); margin:10px 0 4px; font-weight:600; }
.gate p{ color:var(--muted); font-size:14px; margin:0 0 16px; }
.gate-people{ display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:14px; }
.gp{ display:flex; align-items:center; gap:7px; background:var(--sand); border:1px solid var(--line); border-radius:999px; padding:6px 12px 6px 6px; font-family:inherit; font-weight:700; font-size:13px; color:var(--ink); cursor:pointer; }
.gate-add{ display:flex; gap:8px; }
.gate-add .in{ margin:0; }

/* clickable card + details hint */
.card.clickable{ cursor:pointer; }
.card.clickable:focus-visible{ outline:3px solid #bfe0da; outline-offset:2px; }
.details-hint{ margin-left:auto; align-self:center; font-size:12px; font-weight:800; color:var(--cat); opacity:.9; }

/* upvote pill */
.upvote{ display:inline-flex; align-items:center; gap:6px; border:1.5px solid var(--line); background:#fff; color:var(--muted); font-family:inherit; font-weight:800; cursor:pointer; padding:8px 14px; border-radius:999px; font-size:13px; }
.upvote .up-ico{ font-size:10px; color:var(--cat,var(--teal)); }
.upvote .up-n{ font-size:15px; color:var(--ink); }
.upvote:hover{ border-color:var(--cat,var(--teal2)); }
.upvote.act{ background:var(--cat,var(--teal)); border-color:var(--cat,var(--teal)); color:#fff; }
.upvote.act .up-ico, .upvote.act .up-n{ color:#fff; }
.upvote.big{ font-size:14px; padding:11px 18px; }

/* restaurant name link */
.rname{ display:inline-flex; align-items:center; gap:6px; font-family:'Fraunces',serif; font-weight:600; font-size:16px; color:var(--teal); text-decoration:none; margin:0 0 2px; }
.rname:hover{ text-decoration:underline; }
.mapspin{ font-size:12px; }

/* detail modal */
.detail{ background:var(--sand); width:100%; max-width:520px; max-height:90vh; border-radius:20px 20px 0 0; overflow-y:auto; position:relative; box-shadow:0 -10px 40px rgba(0,0,0,.25); }
@media(min-width:560px){ .detail{ border-radius:20px; } }
.x.float{ position:absolute; top:12px; right:12px; z-index:2; background:rgba(20,40,46,.55); border:0; color:#fff; width:34px; height:34px; border-radius:10px; cursor:pointer; font-size:15px; }
.detail-hero{ width:100%; height:210px; overflow:hidden; background:#e7e0d0; }
.detail-hero img{ width:100%; height:100%; object-fit:cover; display:block; }
.hero-fallback{ width:100%; height:100%; display:flex; align-items:center; justify-content:center; transform:scale(1.6); opacity:.9; }
.detail-body{ padding:18px 20px 22px; }
.detail-title{ font-family:'Fraunces',serif; font-weight:600; font-size:26px; line-height:1.08; margin:10px 0 8px; color:var(--ink); }
.detail-desc{ font-size:15px; line-height:1.5; color:#3f5259; margin:0 0 14px; }
.detail-meta{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
.detail-links{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px; }
.linkout{ display:inline-flex; align-items:center; gap:7px; text-decoration:none; font-family:inherit; font-weight:800; font-size:14px; padding:11px 16px; border-radius:11px; background:#fff; border:1.5px solid var(--line); color:var(--teal); }
.linkout:hover{ border-color:var(--teal2); }
.linkout.web{ background:var(--teal); color:#fff; border-color:var(--teal); }
.detail-vote{ display:flex; align-items:center; justify-content:space-between; gap:12px; background:#fff; border:1px solid var(--line); border-radius:14px; padding:12px 14px; }
.dv-label{ font-weight:800; font-size:14px; color:var(--ink); }
.credit{ font-size:11px; color:#a7b1b4; margin:12px 0 0; text-align:right; }

/* rhythm banner */
.rhythm{ background:linear-gradient(180deg,#E9F3F1,#ffffff); border:1px solid var(--line); border-radius:18px; padding:16px 16px 14px; margin:6px 0 4px; }
.rhythm-h{ display:flex; align-items:center; gap:8px; font-family:'Fraunces',serif; font-weight:600; font-size:19px; color:var(--teal); margin:0 0 8px; }
.rhythm-intro{ font-size:14px; color:#3f5259; line-height:1.5; margin:0 0 14px; }
.rhythm-intro b{ color:var(--teal); }
.rhythm-cols{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
@media(max-width:640px){ .rhythm-cols{ grid-template-columns:1fr; } }
.rblock{ background:#fff; border:1px solid var(--line); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:3px; }
.rblock .r-ico{ font-size:20px; line-height:1; }
.rblock b{ font-size:13.5px; color:var(--ink); }
.rblock span:last-child{ font-size:12.5px; color:var(--muted); line-height:1.4; }
.rblock.noon{ border-color:#F0D79A; background:linear-gradient(180deg,#FEF6E4,#fff); }

/* recommended dinner night */
.night.rec:not(.on){ border-color:var(--teal2); box-shadow:0 5px 16px -11px rgba(20,120,143,.7); }
.rec-badge{ align-self:flex-start; font-size:10px; font-weight:800; color:#fff; background:var(--teal2); padding:2px 8px; border-radius:999px; margin-bottom:3px; }

/* week at a glance */
.week{ display:flex; flex-direction:column; gap:8px; margin-bottom:28px; }
.wday{ display:flex; gap:14px; background:#fff; border:1px solid var(--line); border-left:4px solid #ccc; border-radius:14px; padding:12px 14px; }
.wday-day{ font-family:'Fraunces',serif; font-weight:700; font-size:15px; color:var(--ink); min-width:52px; padding-top:1px; }
.wday-main{ flex:1; min-width:0; }
.wday-top{ display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; }
.wtitle{ font-weight:800; font-size:14.5px; color:var(--ink); }
.fixed-star{ color:var(--marigold); }
.wtag{ font-size:10.5px; font-weight:800; padding:3px 10px; border-radius:999px; color:#fff; white-space:nowrap; }
.wnote{ margin:5px 0 0; font-size:13px; color:var(--muted); line-height:1.42; }

/* activities section divider */
.activities-intro{ margin:30px 0 14px; padding-top:26px; border-top:1px solid var(--line); }

/* day reactions */
.reacts{ display:flex; gap:6px; flex-wrap:wrap; margin-top:10px; }
.react{ display:inline-flex; align-items:center; gap:5px; border:1.5px solid var(--line); background:#fff; border-radius:999px; padding:3px 9px; cursor:pointer; font-family:inherit; font-size:14px; line-height:1.25; }
.react .rn{ font-size:12px; font-weight:800; color:var(--muted); }
.react:hover{ border-color:var(--teal2); }
.react.on{ background:#EAF4F2; border-color:var(--teal2); }
.react.on .rn{ color:var(--teal); }

/* unified-reaction layout tweaks */
.card-foot.col{ flex-direction:column; align-items:stretch; gap:8px; }
.detail-react{ background:#fff; border:1px solid var(--line); border-radius:14px; padding:12px 14px; }
.detail-react .dv-label{ display:block; font-weight:800; font-size:14px; color:var(--ink); margin-bottom:8px; }
`;
