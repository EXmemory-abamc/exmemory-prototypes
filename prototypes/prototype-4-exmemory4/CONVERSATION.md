# EXmemory — Cronologia completa della conversazione

## Panoramica

Progetto di visualizzazione 3D del terremoto dell'Italia centrale del 2016 usando Three.js.
Evoluto attraverso 4 versioni principali, da un singolo file HTML a un'architettura multi-pagina.

---

## Versione 0 — `italia_3d.html`

Singolo file Three.js con:
- Terreno 3D dell'Italia centrale (Lazio, Toscana, Umbria, Marche, Abruzzo)
- Texture satellitare ESRI World Imagery
- Rilievo altimetrico NASA SRTM via AWS Terrarium tiles
- 25 tiles a zoom 8, 2.5x esagerazione verticale
- OrbitControls + UI in italiano
- File: `C:\Users\gcapp\italia_3d.html`

---

## Versione 1 — `EXmemory_2` (v2.0)

Primo rebuild strutturato. Basato sul codice EXmemory originale.

### Bug fix applicati

| # | Problema | Fix |
|---|----------|-----|
| 1 | Pulsanti Pre/Post non funzionanti | `onclick="setCityState('pre')"` |
| 2 | Edifici invisibili (coordinate errate) | Rimosso `osmToLocal()`, usato `x*sc, z*sc` |
| 3 | Camera troppo vicina | `(-2, 16, 13)` FOV 42 |
| 4 | Edifici non renderizzati | Riscritto con `InstancedMesh` |
| 5 | City-toggle resta tra i livelli | Gestito in `updateUI()` |
| 6 | Logo non caricato | Path `assets/images/logo.png` |

### Architettura
- Singolo file `index.html` (1135 righe, 53KB)
- `buildings.js` esterno (43KB JSON, 340 edifici OSM)
- 4 livelli: Earth → Country → City → Room
- Three.js v0.158.0 con OrbitControls da examples/js/

### File
```
C:\EXmemory_2\
├── index.html
├── EXmemory_2.html  (standalone con buildings inline)
└── assets/
    ├── data/        (buildings.js, amatrice-buildings.json)
    ├── images/      (foto, logo)
    └── textures/    (earth-day, earth-night, earth-topology)
```

---

## Versione 2 — `EXmemory_3` (v3.0)

Rebuild completo con requisiti estesi.

### Novità

#### Globo Earth
- Texture NASA Blue Marble (high-res satellite)
- Bump map da earth-topology.png per rilievo continenti
- Atmosfera più sottile (raggio 1.02)

#### Terreno Italia (Country)
- 15 tile SRTM (5×3 grid, zoom 8)
- Dimensione 14×14 unità, 120 segmenti
- ESRI World Imagery + SRTM reale
- Fallback procedurale per file:// (CORS)

#### Città Amatrice (City)
- Ground texture satellitare pre/post: `uploads/2A.jpg` / `uploads/2B.jpg`
- Toggle sincronizzato col pulsante Pre/Post
- 6 edifici marker rossi con pulse ring
- Ogni marker → stanza unica (`REMAP_MARKERS`)

#### Multi-Room
- 3 room in `ROOM_DATA[]`
- Ogni room con: testo, foto, video, audio, dati INGV, ancore multiple
- Ancore posizionabili su qualsiasi oggetto 3D (crepe, mobili, detriti)
- Popup con tab: Testo, Foto, Video (YouTube embed), Audio, INGV
- Navigazione prev/next disabilitata in room view

#### UI/UX
- Logo enlarged (36px)
- Tagline "EXpanded MEMORY"
- Info panel fisso a sinistra
- `text-shadow` per leggibilità testo
- Breadcrumb cliccabili (navigazione indietro)

#### Fix tecnici
- `logarithmicDepthBuffer: true` (Z-fighting)
- `polygonOffset` su materiali co-planari
- Gestione errori texture (`onerror` callback su TextureLoader)
- Tasto Escape per chiudere popup
- Rimosso duplicato di `openPopup` (causava SyntaxError)

### File
```
C:\EXmemory_3\
├── index.html  (1516 righe, ~120KB)
└── uploads/    (2A.jpg, 2B.jpg, foto, audio, 0A.jpg–2C.jpg)
```

---

## Versione 3 — `EXmemory_4` (multi-pagina)

Refactor architetturale: ogni livello in una pagina HTML separata.

### Motivazione
- Debugging più semplice (un livello per pagina)
- Caricamento più veloce nel browser
- Isolamento completo tra scene Three.js
- Sviluppo parallelo dei livelli

### Struttura

```
C:\EXmemory_4\
├── index.html      (90 righe)   — Landing page con griglia di tile
├── globe.html      (187 righe)  — Earth: NASA Blue Marble + bump map
├── country.html    (279 righe)  — Italia: SRTM + ESRI + region labels
├── city.html       (318 righe)  — Amatrice: satellite ground + edifici
├── room.html       (418 righe)  — Stanza: ?id=N query param + popup
├── info.html       (63 righe)   — Placeholder informazioni progetto
└── uploads/        (11 file)    — Foto, audio, texture satellite

uploads/:
├── 0A.jpg          — Foto stanza 0
├── 1A.jpg, 1B.jpg, 1C.jpg  — Foto stanza 1
├── 2A.jpg, 2B.jpg  — Texture satellite pre/post (anche ground città)
├── 2C.jpg          — Foto stanza 2
├── AMATRICE01.copilot.png, AMATRICE02.gemini.png  — Foto testimonianze
├── la-terra-le-linee-di-faglia-tra-placche-tettoniche-e1a0wf.jpg
└── voice-over-massimo.wav   — Audio testimonianza
```

### Dettaglio pagine

#### `index.html`
- 4 tile cliccabili: 🌍 Globo, 🇮🇹 Italia, 🏛️ Amatrice, ℹ️ Info
- CSS minima, link diretti alle pagine

#### `globe.html`
- Three.js standalone con NASA Blue Marble + bump map
- Orbita theta/phi custom (non OrbitControls)
- Scroll wheel zoom

#### `country.html`
- Three.js standalone con 15 tile SRTM
- ESRI satellitare + fallback procedurale
- Etichette regioni proiettate 3D→2D

#### `city.html`
- Three.js standalone con satellite ground pre/post
- Edifici procedurali (8 file, perimetro, torre chiesa, strade)
- 6 marker rossi → link a `room.html?id=N`
- Toggle Pre/Post, theme toggle, cursor-dot

#### `room.html`
- Three.js standalone, prima persona (yaw/pitch)
- 3 room, selezionate da `?id=N` (default 0)
- Muri, pavimento, soffitto con texture procedurali
- Muro con crepa + finestra
- Mobili: bancone, stufa, tavolo, sedia, detriti, trave
- Ancore invisibili come hotspot cliccabili
- Popup con 5 tab: Testo, Foto, Video, Audio, INGV
- Theme toggle (salvato in localStorage)

#### `info.html`
- Placeholder pagine progetto, fonti, crediti, motivazioni

---

## Dati chiave condivisi tra versioni

### ROOM_DATA (3 room)
```js
const ROOM_DATA = [
  {
    name: 'Casa di Marco',
    luogo: 'Amatrice (RI) — Via Roma, 12',
    testo: 'Testimonianza della notte del 24 agosto...',
    foto: ['0A.jpg'],
    video: ['RvL47qO7K90'],  // YouTube ID
    audio: ['voice-over-massimo.wav'],
    ingv: 'Magnitudo 6.2 (Mw). Profondità 4.4 km.',
    anchors: [
      { type: 'crack', pos: [0, 1.2, -3.8], label: 'La crepa nel muro', testo: '...' },
      { type: 'object', pos: [1.5, 0.7, 0], label: 'La stufa', testo: '...' },
      { type: 'object', pos: [-1.8, 0.6, -1], label: 'Il tavolo', testo: '...' }
    ]
  },
  // ... 2 altre room
];
```

### Marker buildings (link stanza)
```js
const EXMEMORY_MARKERS = [
  { x: -2, z: 2, roomIdx: 0, label: 'Casa di Marco' },
  { x: 3, z: -1, roomIdx: 1, label: 'Casa di Luca' },
  { x: -3.5, z: -2, roomIdx: 2, label: 'Casa di Anna' },
  { x: 0, z: -3, roomIdx: 0, label: 'Casa di Marco' },
  { x: 4, z: 3, roomIdx: 1, label: 'Casa di Luca' },
  { x: -1.5, z: 3.5, roomIdx: 2, label: 'Casa di Anna' }
];
```

### Coordinate terreno Italia (Country)
- Tile: zoom 8, X 135-139, Y 93-95 (15 tiles, 5×3 grid)
- Dimensione: 14×14 unità
- Segmenti: 120×120
- Altezza max: 2900m → 0.7 unità con 2.5x esagerazione verticale

### Token tema
- `localStorage.getItem('exmemory-dark')` — '1' = dark mode
- CSS custom properties: `--bg`, `--fg`, `--mid`, `--border`, `--red`

---

## Librerie e dipendenze

- **Three.js** v0.158.0 — da CDN unpkg (`three.min.js`)
- **Nessun** OrbitControls da examples/js/ (custom theta/phi orbit)
- **Nessun** modulo ES o bundler

---

## Fonti dati

- **NASA Blue Marble**: texture terra (next generation)
- **earth-topology.png**: bump map locale
- **ESRI World Imagery**: tile satellite per `country.html`
- **AWS Terrarium**: elevation tiles SRTM per `country.html`
- **INGV**: dati sismici del terremoto 2016
- **YouTube**: video aerovisione e agenzia nazionale
