# EXmemory v4 — Contesto Progetto per IA

## Sommario

Questo documento descrive l'architettura, le funzionalità e il design del progetto **EXmemory v4** — un sito web interattivo 3D che documenta il terremoto dell'Italia centrale del 2016 attraverso una narrazione spaziale a livelli: Globo → Italia → Amatrice → Stanze dei sopravvissuti.

L'obiettivo è fornire a un'IA tutte le informazioni necessarie per comprendere il progetto e generare **prompt operativi dettagliati** con una lista di modifiche priorizzate.

---

## 1. Visione del Progetto

EXmemory è un archivio digitale immersivo che utilizza Three.js per creare un'esperienza di esplorazione geografica e umana del terremoto del 24 agosto 2016 (Mw 6.2, epicentro Accumoli). Ogni livello approfondisce il contesto: dalla posizione globale dell'Italia, al territorio colpito, alla ricostruzione di Amatrice, fino alle testimonianze personali nelle case dei sopravvissuti.

**Target**: Visitatori del museo / web — esperienza desktop (Three.js non è mobile-first).

---

## 2. Architettura del Sistema

### 2.1 Multi-Pagina (Strategy: Separation of Concerns)

Ogni livello è una pagina HTML autonoma con la propria scena Three.js. Non c'è stato condiviso tra pagine se non via URL query parameter (`?id=N` per room.html) e localStorage (tema).

```
C:\EXmemory_4\
├── index.html      — Landing page (hub di navigazione)
├── globe.html      — Visualizzazione Terra 3D
├── country.html    — Terreno Italia centrale con satellite
├── city.html       — Ricostruzione 3D di Amatrice
├── room.html       — Stanze interne con testimonianze (?id=0,1,2)
├── info.html       — Placeholder pagine progetto, fonti, crediti
└── uploads/        — Asset statici (immagini, audio, texture)
```

### 2.2 Schema Navigazione

```
index.html
  ├──→ globe.html
  │       └──→ country.html  (click su hotspot Italia)
  │               └──→ city.html  (click su hotspot Amatrice)
  │                       └──→ room.html?id=N  (click su edificio marker)
  ├──→ city.html      (direttamente dalla landing)
  └──→ info.html      (pagina informativa)
```

Ogni pagina ha link di navigazione testuali (es. "← Torna al Globo") e/o hotspot 3D cliccabili.

### 2.3 Stack Tecnico

| Componente | Tecnologia | Versione |
|-----------|-----------|----------|
| 3D Engine | Three.js (CDN unpkg) | 0.158.0 |
| Controlli camera | Custom theta/phi orbit (no OrbitControls) | — |
| Texture Terra | NASA Blue Marble (CDN) | — |
| Bump Map | earth-topology.png (locale in uploads/) | — |
| Tile elevazione | AWS Terrarium (SRTM, zoom 8) | — |
| Tile satellite | ESRI World Imagery | — |
| UI Framework | Vanilla HTML/CSS/JS | — |
| Store tema | localStorage key `exmemory-dark` | — |
| Navigazione | URL query param (`?id=N`) | — |
| Font | DM Sans (Google Fonts, CDN) | — |

---

## 3. Funzionalità per Pagina

### 3.1 `index.html` — Landing Page

**Scopo**: Hub di navigazione con griglia di tile cliccabili.

- 4 tile in grid 2×2: 🌍 Globo, 🇮🇹 Italia, 🏛️ Amatrice, ℹ️ Info
- Ogni tile è un link HTML diretto
- Minimalista, nessuna scena Three.js

### 3.2 `globe.html` — Earth View

**Scopo**: Mostrare la Terra da satellite con l'Italia come hotspot.

- **Renderer**: Three.js WebGL con `logarithmicDepthBuffer: true`, `polygonOffset`
- **Globo**: Sfera con texture NASA Blue Marble + bump map da topology.png
- **Atmosfera**: Glow sottile (sfera trasparente raggio 1.02)
- **Hotspot Italia**: Sfera rossa pulsante alla posizione dell'Italia centrale
- **Camera**: Orbita theta/phi custom (mouse drag), zoom con scroll wheel
- **Tema**: Dark/light toggle salvato in localStorage
- **Navigazione**: Click hotspot → window.location.href = 'country.html'

**Variabili camera**:
```js
let theta = 0.5, phi = 0.3, radius = 2.6;
// theta varia con mouseX, phi con mouseY (clamped -1.1 a 0.8)
// radius varia con scroll wheel (clamped 1.5 a 8)
```

### 3.3 `country.html` — Italia Centrale

**Scopo**: Terreno 3D dell'area colpita con texture satellitare reale.

- **Terreno**: PlaneGeometry 14×14, 120×120 segmenti
- **Tile elevazione**: 15 tile AWS Terrarium (zoom 8, X:135-139, Y:93-95)
- **Tile satellite**: 15 tile ESRI World Imagery (stessa grid)
- **Fallback**: Se tile non caricabili (CORS file://), genera terreno procedurale con noise sinosoidale
- **Mare**: Piano blua sotto il terreno (y = -0.015)
- **Griglia**: Wireframe opzionale durante caricamento
- **Etichette**: Regioni italiane proiettate 3D→2D (Toscana, Lazio, Umbria, Marche, Abruzzo, Mar Tirreno, Mar Adriatico, Amatrice)
- **Hotspot Amatrice**: Sfera rossa pulsante
- **Camera**: Orbita theta/phi, raggio iniziale 8
- **Navigazione**: Link "← Torna al Globo" + click hotspot → city.html

**Formula altezza SRTM**:
```js
h = (R*256 + G + B/256) - 32768;  // Terrarium encoding
// Normalizzata: max 2900m → 0.7 unità, con 2.5x esagerazione verticale
```

### 3.4 `city.html` — Amatrice

**Scopo**: Ricostruzione 3D del centro di Amatrice con toggle pre/post terremoto.

- **Ground**: Piano con texture satellitare (`uploads/2A.jpg` per pre, `2B.jpg` per post)
- **Edifici procedurali**:
  - 8 file di edifici (width variabile), profondità fissa 2
  - Edifici perimetrali (ring around city)
  - Torre chiesa al centro
- **6 Marker rossi**: Edifici speciali cliccabili con pulse ring → `room.html?id=N`
- **Toggle Pre/Post**:
  - `pre` → terracotta + texture verde
  - `post` → colore danni + texture grigia
- **Strade**: Linee sulla ground texture
- **Camera**: Orbita theta/phi, raggio iniziale 14, min 5, max 40
- **Cursor-dot**: Punto rosso segue mouse, si ingrandisce su hotspot
- **Navigazione**: Link ← + click marker edifici

### 3.5 `room.html` — Stanze (?id=N)

**Scopo**: Interni 3D con testimonianze, foto, video, audio, dati INGV.

- **Room**: Box 6×3.5×8 unità (Larghezza×Altezza×Profondità)
- **Texture procedurali**:
  - Pavimento: canvas con texture legno + rumore
  - Pareti: canvas con muratura + rumore
  - Parete fondo: crepa generata con curve quadratiche bezier, finestra con telaio
- **Arredamento**: Bancone, stufa, tavolo, sedia, detriti, trave
- **Camera prima persona**: yaw/pitch via mouse drag, scroll = FOV
- **Ancore interattive**: Mesh invisibili (PlaneGeometry per crepe, SphereGeometry per oggetti) click → popup
- **Query parameter**: `?id=0` = Casa di Marco, `?id=1` = Casa di Luca, `?id=2` = Casa di Anna
- **Navigazione**: Link "← Torna ad Amatrice"

**Controlli room**:
```js
// yaw/pitch drag
roomState.yaw += dx * 0.004;
roomState.pitch = clamp(roomState.pitch - dy * 0.003, -1.1, 0.8);
camera.position.set(0, 2.1, 2.8);
target = camera.position + lookDir.applyEuler(yaw, pitch);
// scroll = FOV
roomState.fov = clamp(roomState.fov - event.deltaY * 0.05, 30, 100);
```

### 3.6 `info.html` — Placeholder

- Pagina statica con struttura per: descrizione progetto, fonti dati, crediti, contatti, bibliografia
- Attualmente placeholder (<div> in costruzione)

---

## 4. Dati e Strutture

### 4.1 ROOM_DATA

Array di 3 oggetti, selezionato via `?id=N`.

```js
const ROOM_DATA = [
  {
    name: 'Casa di Marco',
    luogo: 'Amatrice (RI) — Via Roma, 12',
    testo: 'Testimonianza lunga...',
    foto: ['0A.jpg'],
    video: ['RvL47qO7K90'],  // YouTube video ID
    audio: ['voice-over-massimo.wav'],
    ingv: 'Magnitudo 6.2 (Mw). Profondità 4.4 km. Epicentro: Accumoli (RI).',
    anchors: [
      { type: 'crack', pos: [0, 1.2, -3.8], label: 'La crepa', testo: '...' },
      { type: 'object', pos: [1.5, 0.7, 0], label: 'La stufa', testo: '...' }
    ]
  },
  // ... altre 2 room con struttura identica
];
```

**Campi ROOM_DATA**:
- `name`: Nome stanza / persona
- `luogo`: Indirizzo o località
- `testo`: Testimonianza completa
- `foto[]`: Nomi file in `uploads/`
- `video[]`: ID YouTube (estratti da URL)
- `audio[]`: Nomi file audio in `uploads/`
- `ingv`: Dati sismici ufficiali
- `anchors[]`: Array di punti interattivi
  - `type`: 'crack' | 'object'
  - `pos`: [x, y, z] coordinate 3D
  - `label`: Etichetta testo nel popup
  - `testo`: Descrizione specifica dell'ancora

### 4.2 EXMEMORY_MARKERS

6 edifici nella scena città che linkano alle room:

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

### 4.3 Uploads

```
uploads/ (11 file)
├── 0A.jpg                     — Foto stanza 0 (Casa Marco)
├── 1A.jpg, 1B.jpg, 1C.jpg    — Foto stanza 1 (Casa Luca)
├── 2A.jpg, 2C.jpg             — Foto stanza 2 (Casa Anna)
├── 2B.jpg                     — Non usata attualmente
├── AMATRICE01.copilot.png     — Foto testimonianza popup
├── AMATRICE02.gemini.png      — Foto testimonianza popup
├── la-terra-le-linee-di-faglia...jpg  — Foto INGV
└── voice-over-massimo.wav     — Audio testimonianza
```

**Nota**: `2A.jpg` e `2B.jpg` hanno doppio ruolo — sono anche le texture satellite pre/post per il ground della città.

### 4.4 Coordinate Terreno Italia

```js
const TILE_X = [135, 136, 137, 138, 139];  // 5 colonne
const TILE_Y = [93, 94, 95];                // 3 righe
const ZOOM = 8;
const SIZE = 14;    // dimensione PlaneGeometry
const SEG = 120;    // segmenti PlaneGeometry
// Area coperta: circa lat 41.5-44.0, lon 11.5-14.5
```

### 4.5 Tema (localStorage)

```js
const darkMode = localStorage.getItem('exmemory-dark') === '1';
// Se '1' → CSS variabili scure, altrimenti chiare
// CSS custom properties usate:
// --bg, --fg, --mid, --border, --red
```

**Trigger**: Pulsante "◐ Tema" in ogni pagina.

---

## 5. Design System

### 5.1 Palette Colori

| Ruolo | Dark Mode | Light Mode |
|-------|-----------|------------|
| Sfondo (`--bg`) | `#0c0c0a` | `#f8f8f5` |
| Testo (`--fg`) | `#e4e0da` | `#1c1a18` |
| Mezzotono (`--mid`) | `#888480` | `#888480` |
| Bordo (`--border`) | `#2c2a28` | `#d8d4ce` |
| Rosso EXmemory (`--red`) | `#C0392B` | `#C0392B` |

### 5.2 Tipografia

- **Font**: DM Sans, sans-serif (Google Fonts CDN)
- **Pulsanti**: uppercase, letter-spacing .14em, 10px
- **Breadcrumb**: uppercase, letter-spacing .1em, 9px
- **Etichette livello**: uppercase, letter-spacing .2em, 10px
- **Testimonianze**: 13px, weight 300, line-height 1.8

### 5.3 Componenti UI

- **Logo**: 36px height, fixed top-left
- **Tagline**: "EXpanded MEMORY" sotto il logo, 9px uppercase
- **Breadcrumb**: Fisso in basso, stile "Earth — Italia — Amatrice — Stanza"
- **Info Panel**: Fisso a sinistra, testo descrittivo del progetto
- **Popup**: Modal overlay con backdrop blur, 5 tab (Testo, Foto, Video, Audio, INGV)
- **City-toggle**: Due pulsanti Pre/Post, visibili solo in city view
- **Cursor-dot**: 8px punto rosso segue mouse, si ingrandisce su hotspot

---

## 6. Convenzioni di Codice

### 6.1 Pattern Comuni

- Three.js caricato da CDN unpkg (`<script src="...">`)
- Scene, camera, renderer creati in variabili globali
- `logarithmicDepthBuffer: true` su tutti i renderer (Z-fighting)
- Tutte le texture caricate via `THREE.TextureLoader` con `onerror` callback
- Tema applicato via CSS custom properties su `<html>` + funzione `applyTheme(dark)`
- Animazione: `requestAnimationFrame` loop con `renderer.render()`

### 6.2 Controlli Camera Custom (non OrbitControls)

```js
// Ogni pagina definisce la propria gestione camera
// Pattern theta/phi:
function updateCamera() {
  camera.position.x = radius * Math.sin(theta) * Math.cos(phi);
  camera.position.y = radius * Math.sin(phi);
  camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
  camera.lookAt(0, 0, 0);
}
```

### 6.3 Raycasting per Hotspot

```js
const raycaster = new THREE.Raycaster();
// mouse → NDC
raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
const hits = raycaster.intersectObjects(hotspotMeshes);
// hits[0].object.userData contiene i dati dell'ancora
```

---

## 7. Vincoli e Limitazioni

- **Nessun bundler**: Vanilla JS + CDN, niente import/export ES modules
- **Nessun OrbitControls**: Controlli camera custom per compatibilità
- **Fallback CORS**: Tile SRTM/ESRI non funzionano da file:// — serve server HTTP
- **Singolo file per pagina**: Ogni HTML è autonomo, nessuna dipendenza locale oltre uploads/
- **uploads/ è condiviso**: Tutte le pagine referenziano `uploads/` con path relativi
- **Nessun database**: Contenuti hardcoded in JS (ROOM_DATA, testimonianze)
- **Non responsive**: Progettato per schermi desktop (min 1024px)

---

## 8. Prompt per IA — Richiesta Specifica

L'IA deve:

1. **Leggere l'intero contesto sopra**
2. **Analizzare ogni pagina** (index, globe, country, city, room, info) e identificare:
   - Componenti mancanti o incompleti
   - Miglioramenti possibili
   - Bug potenziali
   - Features da aggiungere
3. **Generare prompt dettagliati** per ogni modifica, strutturati così:

```
## [PRIORITÀ: Alta/Media/Bassa] — [Titolo Modifica]

### Pagina: [nome pagina]
### Descrizione
[2-3 paragrafi che spiegano cosa fare e perché]

### Dettagli implementativi
- [punto tecnico specifico]
- [variabili/funzioni da toccare]
- [pattern da seguire]

### Esempio di output atteso
[se applicabile, frammento di codice o screenshot descrittivo]

### Dipendenze
[altre modifiche da completare prima]
```

4. **Organizzare i prompt in ordine di priorità**:
   - **Alta**: Cose che rompono l'esperienza (bug, mancanze critiche)
   - **Media**: Miglioramenti funzionali importanti
   - **Bassa**: Ottimizzazioni, refactoring, UI polish
