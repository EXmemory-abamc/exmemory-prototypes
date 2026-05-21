# EXmemory Prototypes

Raccolta di prototipi interattivi per il progetto EXmemory ospitati su GitHub Pages.

## Descrizione

Questo repository contiene una serie di prototipi sperimentali sviluppati per il progetto EXmemory. Ogni prototype è organizzato in una propria cartella sotto la directory `prototypes/` e può essere visualizzato direttamente tramite GitHub Pages.

## Struttura del Repository

```
exmemory-prototypes/
├── index.html              # Pagina principale con indice dei prototipi
├── css/
│   └── main.css            # Stili comuni per l'indice
├── js/
│   └── index.js            # Logica comune per l'indice
├── prototypes/
│   ├── prototype-1-antigravity/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   ├── prototype-2-sismaroom/
│   │   └── index.html
│   ├── prototype-3-text-to-3d-env/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   ├── prototype-4-exmemory4/
│   │   ├── index.html
│   │   ├── city.html
│   │   ├── country.html
│   │   ├── globe.html
│   │   ├── info.html
│   │   └── room.html
│   └── prototype-5-exmemory5/
│       ├── index.html
│       ├── city.html
│       ├── country.html
│       ├── globe.html
│       └── room.html
├── assets/
│   ├── images/
│   └── shared-components/
└── README.md
```

## Come Accedere ai Prototipi

1. Visita il sito GitHub Pages: https://giacomo-cappella-abamc.github.io/exmemory-prototypes/
2. Clicca su uno dei prototype nella pagina principale per visualizzarlo
3. Ogni prototype si aprirà in una nuova pagina dedicata

## Descrizione dei Prototipi

### Prototype 1: Antigravity
Nonostante il nome, questo non è un esperimento di fisica antigravitazionale, bensì lo **strumento di sviluppo** utilizzato per creare gli altri prototipi EXmemory. È un'applicazione React/Vite con funzionalità avanzate di visualizzazione 3D.

### Prototype 2: Sismaroom
Simulazione sismica in ambiente virtuale che permette di visualizzare e interagire con scenari di terremoto in uno spazio 3D.

### Prototype 3: Text to 3D Env
Generazione di ambienti 3D da descrizioni testuali, utilizzando tecniche di intelligenza artificiale per convertire il linguaggio naturale in scenari tridimensionali.

### Prototype 4: EXmemory_4
Prototipo con visualizzazioni geografiche e contestuali, incluse viste di città, paesi e globo terrestre con dati contestuali sovrapposti.

### Prototype 5: EXmemory_5
Prototipo avanzato con analisi geografiche dettagliate, costruito sulle basi del prototype 4 con funzionalità aggiuntive di esplorazione e analisi.

## Aggiunta di Nuovi Prototipi

Per aggiungere un nuovo prototype:

1. Crea una nuova cartella dentro `prototypes/` con un nome descrittivo (es. `prototype-6-nome`)
2. Posiziona tutti i file necessari (HTML, CSS, JS, asset) per quel prototype nella cartella
3. Aggiorna l'`index.html` principale aggiungendo un link al nuovo prototype nella sezione di navigazione
4. Commit e push le modifiche:
   ```bash
   git add prototypes/tuo-nuovo-prototype/
   git add index.html
   git commit -m "Add nuovo-prototype: [breve descrizione]"
   git push origin main
   ```

## Tecnologie Utilizzate

- HTML5
- CSS3
- JavaScript
- React/Vite (per il prototype Antigravity)
- [Eventuali altre tecnologie specifiche per i singoli prototype]

## Licenza

Questo progetto è rilasciato sotto licenza MIT - vedere il file [LICENSE](LICENSE) per dettagli.

## Contatti

Giacomo Cappella - https://github.com/giacomo-cappella-abamc