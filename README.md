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
│   └── prototype-3-text-to-3d-env/
│       ├── index.html
│       ├── style.css
│       └── script.js
├── assets/
│   ├── images/
│   └── shared-components/
└── README.md
```

## Come Accedere ai Prototipi

1. Visita il sito GitHub Pages: https://giacomo-cappella-abamc.github.io/exmemory-prototypes/
2. Clicca su uno dei prototype nella pagina principale per visualizzarlo
3. Ogni prototype si aprirà in una nuova pagina dedicata

## Aggiunta di Nuovi Prototipi

Per aggiungere un nuovo prototype:

1. Crea una nuova cartella dentro `prototypes/` con un nome descrittivo (es. `prototype-4-nome`)
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
- [Eventuali altre tecnologie specifiche per i singoli prototype]

## Licenza

Questo progetto è rilasciato sotto licenza MIT - vedere il file [LICENSE](LICENSE) per dettagli.

## Contatti

Giacomo Cappella - https://github.com/giacomo-cappella-abamc