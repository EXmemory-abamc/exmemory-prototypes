# Text-to-3D Environment Generator

Genera ambienti 3D interattivi da descrizioni testuali — senza chiavi API, senza server, tutto nel browser.

## Indice

- [Come funziona](#come-funziona)
- [Flusso per l'utente](#flusso-per-lutente)
- [Flusso per il moderatore](#flusso-per-il-moderatore)
- [Trasformare il testo in prompt](#trasformare-il-testo-in-prompt)
- [Modalità Structured](#modalit%C3%A0-structured)
- [Architettura](#architettura)
- [Sviluppo](#sviluppo)

---

## Come funziona

L'applicazione usa un **flusso con moderatore umano**: non c'è un'integrazione diretta con API LLM. Invece:

```
Utente descrive → Moderatore prepara prompt → LLM (via copia/incolla) → JSON → Validazione → Render 3D
```

| Componente | Ruolo |
|---|---|
| **Utente** | Descrive la scena in linguaggio naturale |
| **Moderatore** | Seleziona un preset, copia il prompt, incolla la risposta JSON |
| **LLM** | Qualsiasi LLM gratuito (ChatGPT, Claude, Gemini, DeepSeek...) |
| **Validatore** | Controlla che il JSON sia corretto prima del rendering |
| **Renderer Three.js** | Costruisce la scena 3D con ambienti, luci, ombre, particelle, acqua animata |

### Tre modalità di input

| Modalità | Descrizione |
|---|---|
| **User** | Scrivi in linguaggio naturale, invia al moderatore |
| **Moderator** | Seleziona preset, copia prompt, incolla JSON dal LLM |
| **Structured** | Descrivi la scena riga per riga (parser diretto, senza LLM) |

---

## Flusso per l'utente

1. Apri l'app nel browser (localhost:5173 in sviluppo)
2. Vai al tab **User**
3. Scrivi una descrizione in italiano o inglese, ad esempio:

   > Un lago di montagna al tramonto con pini e una baita di legno sulla riva

4. Clicca **"Submit to Moderator"**
5. L'app passa automaticamente al tab **Moderator**, dove il moderatore umano preparerà il prompt per il LLM
6. Attendi che il moderatore completi il flusso — la scena apparirà nel visore 3D

### Cosa può descrivere

- **Ambiente**: cielo, terreno, nebbia — "un prato verde all'alba con cielo stellato"
- **Oggetti**: forme geometriche, alberi, rocce, nuvole — "tre alberi, una roccia, una nuvola"
- **Luci**: direzionale, ambientale, puntiforme — "luce calda del tramonto"
- **Materiali**: colori, rugosità, riflessi — "una sfera metallica rossa"
- **Animazioni**: rotazione, galleggiamento, orbita, pulsazione — "un cubo che ruota lentamente"
- **Interazioni**: clicca su un oggetto per vedere una descrizione

---

## Flusso per il moderatore

Il moderatore fa da ponte tra la descrizione dell'utente e il LLM.

### Passo 1: Ricevi la descrizione

Nel tab **Moderator**, vedi in alto cosa ha scritto l'utente:

> **User said:** *"Un lago di montagna al tramonto con pini e una baita di legno sulla riva"*

### Passo 2: Scegli un preset

Seleziona il preset più adatto dal menu a tendina:

| Preset | Quando usarlo |
|---|---|
| **Basic Scene** | Scene semplici con pochi oggetti e luce base |
| **Nature Scene** | Paesaggi naturali: alberi, rocce, acqua, erba |
| **Interior Scene** | Ambienti interni: stanze con muri e arredi semplici |
| **Abstract Scene** | Scene artistiche con forme geometriche e colori vivaci |

### Passo 3: Copia il prompt

Clicca **"Copy Prompt"**. Il prompt generato include:
- La descrizione dell'utente
- La struttura JSON supportata (serve da reference per il LLM)
- Istruzioni per restituire solo JSON valido

### Passo 4: Incolla nel LLM

Apri il tuo LLM preferito (ChatGPT, Claude, Gemini, DeepSeek...) e incolla il prompt. Il LLM restituirà un JSON strutturato.

### Passo 5: Incolla il JSON nell'app

Copia il JSON dalla risposta del LLM e incollalo nell'area di testo **"Paste LLM JSON here"**.

### Passo 6: Valida

Clicca **"Validate JSON"**. Il validatore controlla:
- Che sia JSON sintatticamente valido
- Che i campi corrispondano allo schema atteso
- Che i tipi siano corretti (es. `color` deve essere stringa)
- Che non ci siano campi sconosciuti

Se ci sono errori, vengono mostrati uno per uno con indicazione del campo da correggere.

### Passo 7: Render

Clicca **"Render Scene"** per visualizzare la scena 3D.

> **Se il LLM sbaglia:** Puoi correggere manualmente il JSON nell'area di testo e rivalidare. I preset includono anche un esempio funzionante da cui partire.

---

## Trasformare il testo in prompt

Questa sezione spiega come le descrizioni vengono trasformate in prompt efficaci per il LLM.

### Anatomia del prompt

```
You are a 3D scene generator. Create a Three.js scene JSON from this description:

"[descrizione utente]"

<reference allo schema JSON>
<istruzioni su formato output>
<esempio di output valido>
```

### Come scrivere prompt efficaci per il LLM

1. **Sii specifico su colori e posizioni**: invece di "un albero", meglio "un albero verde scuro a sinistra del lago"
2. **Descrivi l'atmosfera**: "tramonto con luce calda" produce una scena molto diversa da "notte stellata"
3. **Specifica le dimensioni relative**: "un grande masso accanto a un piccolo cespuglio"
4. **Combina elementi**: più dettagli = scene più ricche

### Esempi di trasformazione

| Testo utente | Prompt generato (sintesi) |
|---|---|
| "Una stanza con un tavolo e una sedia" | _Create a room with floor, walls, one table (box), one chair (box+cylinder)..._ |
| "Montagna con lago e alberi" | _Terrain ground, animated water, tree objects, fog, directional light..._ |
| "Spazio astratto con forme colorate che ruotano" | _Stars sky, torus/icosahedron/torusKnot with animations (rotate), vivid colors..._ |
| "Spiaggia tropicale al tramonto" | _Sunset sky gradient, water ground, palm-like trees, hemisphere light, warm colors..._ |

### Prompt custom

Se il preset non basta, puoi modificare manualmente il prompt prima di copiarlo — l'area di preview è editabile (nel codice, non ancora nell'UI). In alternativa puoi creare un preset personalizzato modificando `src/llm/prompts.ts`.

---

## Modalità Structured

Una scorciatoia per evitare il LLM: descrivi la scena riga per riga con una sintassi semplice.

```
sky: sunset top #ff6b35 bottom #f7c948
ground: terrain color #4a7c3f
light: directional from (8, 12, 6) shadow
add: tree at (-3, 0, 2) color #5c8a3f
add: rock at (1, 0, 3) color #666666
add: box at (0, 0.5, 0) size 2 1 1 color #ff4444 rotate 0 0.5 0
fog: light
```

Note: questa modalità è pensata per scene semplici. Per scene complesse, usa il flusso Moderator.

---

## Architettura

```
src/
├── main.ts            # Entry point: UI event wiring + Three.js init
├── style.css          # Tema scuro con layout sidebar + viewport
│
├── types/
│   └── scene.ts       # SceneSchema + tutti i tipi condivisi
│
├── scene/
│   ├── renderer.ts    # Three.js init, OrbitControls, animation loop
│   ├── builder.ts     # Orchestratore: schema → scena 3D completa
│   ├── environment.ts # Sky (4 tipi), Ground (3 tipi), Fog
│   ├── lights.ts      # 5 tipi di luce + ombre
│   ├── geometries.ts  # 12 primitive + compositi (albero, nuvola)
│   ├── materials.ts   # Material factory da MaterialProps
│   ├── objects.ts     # Assembla oggetti + interazioni + animazioni
│   ├── water.ts       # Acqua animata con ShaderMaterial + Fresnel
│   ├── vegetation.ts  # Erba InstancedMesh, alberi/rocce procedurali
│   ├── particles.ts   # Pioggia, neve, lucciole, foglie, polvere
│   └── animation.ts   # Sistema animazioni per-oggetto
│
├── llm/
│   ├── prompts.ts     # 4 preset di prompt per il moderatore
│   ├── validator.ts   # Validatore JSON con errori campo per campo
│   └── structured.ts  # Parser per input strutturato riga per riga
│
└── ui/                # (riservato per future astrazioni UI)
```

### Flusso dei dati

```
Descrizione utente
       │
       ▼
┌─────────────────────────────────────────────────────┐
│                   Moderatore                         │
│  (sceglie preset → copia prompt → LLM → incolla)    │
└─────────────────────┬───────────────────────────────┘
       │
       ▼
  SceneSchema JSON     ◄── Validatore (controlli campo per campo)
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  builder.ts                                           │
│  ├── environment.ts  → cielo, terreno, nebbia        │
│  ├── lights.ts       → 5 tipi di luce                │
│  ├── objects.ts      → oggetti + interazioni         │
│  ├── vegetation.ts   → erba, alberi, rocce           │
│  ├── water.ts        → acqua animata (shader)        │
│  └── particles.ts    → pioggia/neve/lucciole         │
└─────────────────────┬───────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  renderer.ts                                          │
│  ├── WebGLRenderer + OrbitControls                   │
│  ├── animation loop → animazioni + acqua + particelle│
│  └── resize handler                                  │
└─────────────────────────────────────────────────────┘
       │
       ▼
   🎮 Scena 3D interattiva nel browser
```

---

## Sviluppo

### Prerequisiti

- Node.js 18+
- npm

### Setup

```bash
cd text-to-3d-env
npm install
npm run dev
```

Apri `http://localhost:5173` nel browser.

### Comandi

| Comando | Descrizione |
|---|---|
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` | Build di produzione in `dist/` |
| `npm run preview` | Anteprima della build di produzione |

### Dipendenze

- **Three.js** — Renderer 3D WebGL
- **Vite** — Bundler e dev server
- **TypeScript** — Tipizzazione statica
