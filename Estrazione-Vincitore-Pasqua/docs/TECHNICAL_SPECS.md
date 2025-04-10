# Specifiche Tecniche - Estrazione Vincitore Pasqua

Questo documento fornisce le specifiche tecniche dettagliate dell'applicazione "Estrazione Vincitore Pasqua", includendo requisiti di sistema, dipendenze software, struttura del progetto e dettagli implementativi.

## Requisiti di Sistema

### Requisiti Minimi
- **Sistema Operativo**: Windows 10/11 (64-bit)
- **Processore**: Intel/AMD dual-core o superiore
- **Memoria**: 2GB RAM
- **Spazio su disco**: 100MB di spazio libero
- **Risoluzione**: 1024x768 o superiore

### Requisiti Consigliati
- **Sistema Operativo**: Windows 10/11 (ultima versione)
- **Processore**: Intel/AMD quad-core o superiore
- **Memoria**: 4GB RAM
- **Spazio su disco**: 250MB di spazio libero
- **Risoluzione**: 1920x1080 o superiore

## Dipendenze Software

L'applicazione è costruita utilizzando le seguenti tecnologie e librerie:

| Dipendenza | Versione | Scopo |
|------------|----------|-------|
| Electron | 24.1.2 | Framework per applicazioni desktop |
| electron-log | 4.4.8 | Sistema di logging |
| SheetJS (xlsx) | 0.18.5 | Lettura e manipolazione file Excel |
| electron-builder | 24.13.3 | Packaging dell'applicazione |

## Struttura del Progetto

```
estrazione-vincitore-pasqua/
├── main.js               # Processo principale Electron
├── index.html            # UI (processo di rendering)
├── package.json          # Configurazione progetto
├── node_modules/         # Dipendenze installate
└── dist/                 # Output di build
    └── win-unpacked/     # Applicazione eseguibile
```

## Dettagli Implementativi

### Processo Principale (main.js)

#### Inizializzazione dell'Applicazione
```javascript
function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    title: "Estrazione Vincitore Pasqua",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  log.info('Applicazione avviata');
  createWindow();
});
```

#### Sistema di Logging
```javascript
const log = require('electron-log');
log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'logs/main.log');
log.transports.console.level = 'debug';
log.transports.file.level = 'debug';
```

#### Gestori IPC
```javascript
ipcMain.handle('read-excel', async (event, originalFilePath) => {
  // Implementazione lettura Excel
});

ipcMain.handle('select-file', async () => {
  // Implementazione selezione file
});
```

### Processo di Rendering (index.html)

#### Struttura UI
```html
<div id="app">
  <h1>🐰 Estrazione Vincitore Pasqua 🎉</h1>
  <button id="selectFile">
    <div class="button-content">
      <span class="loading hidden" id="selectLoading"></span>
      <span>Seleziona File Excel</span>
    </div>
  </button>
  
  <div id="participantsInfo"></div>
  
  <button id="startExtraction" disabled>
    <div class="button-content">
      <span class="loading hidden" id="extractionLoading"></span>
      <span>Avvia Estrazione</span>
    </div>
  </button>
  
  <div id="countdown"></div>
  <div id="winner"></div>
  
  <div id="debugInfo">
    <button id="debugToggle">Nascondi</button>
    Debug Info:
  </div>
</div>
```

#### Gestione Eventi JavaScript
```javascript
selectFileBtn.addEventListener('click', async () => {
  // Gestione selezione file
});

startExtractionBtn.addEventListener('click', () => {
  startExtraction();
});

function startExtraction() {
  // Implementazione estrazione vincitore
}

function selectWinner() {
  // Selezione randomica del vincitore
}
```

## Formato File di Input

L'applicazione supporta i seguenti formati di file:
- Microsoft Excel (.xlsx)
- Excel Legacy (.xls)
- Comma Separated Values (.csv)

### Struttura Dati Attesa
- I nomi dei partecipanti devono essere nella colonna B del foglio Excel
- L'applicazione legge fino a 100 righe a partire dalla riga 1
- Non sono necessarie intestazioni di colonna
- Le celle vuote vengono ignorate

Esempio di formato corretto:
```
| A | B           | C |
|---|-------------|---|
|   | Mario Rossi |   |
|   | Luca Bianchi|   |
|   | Anna Verdi  |   |
```

## Algoritmo di Estrazione

L'estrazione del vincitore utilizza il generatore di numeri pseudo-casuali di JavaScript:

```javascript
function selectWinner() {
  if (participants && participants.length > 0) {
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[randomIndex];
    // Mostra il vincitore
  }
}
```

## Gestione Errori

L'applicazione implementa meccanismi robusti di gestione degli errori:

1. **Verifica formato file**:
   ```javascript
   const fileExt = path.extname(filePath).toLowerCase();
   if (!['.xlsx', '.xls', '.csv'].includes(fileExt)) {
     return { error: `Il file selezionato non è un file Excel valido` };
   }
   ```

2. **Strategia multi-metodo per la lettura dei file**:
   ```javascript
   try {
     // Primo metodo
   } catch (firstError) {
     try {
       // Secondo metodo (fallback)
     } catch (secondError) {
       // Gestione errore
     }
   }
   ```

3. **Verifiche di integrità dei dati**:
   ```javascript
   if (data.length === 0) {
     return { error: 'Nessun nome trovato nella colonna B.' };
   }
   ```

## Packaging e Distribuzione

### Configurazione electron-builder
```json
"build": {
  "appId": "com.tuaorganizzazione.estrazionepasqua",
  "productName": "Estrazione Vincitore Pasqua",
  "files": [
    "**/*",
    "!**/*.xlsx"
  ],
  "win": {
    "target": [
      "portable"
    ],
    "sign": false,
    "signDlls": false
  }
}
```

### Script di build
```
npm run dist
```

### Output della build
- Applicazione portatile Windows (.exe)
- Non richiede installazione

## Performance

L'applicazione è ottimizzata per:
- Avvio rapido (< 3 secondi su hardware standard)
- Caricamento veloce di file Excel (< 1 secondo per file di dimensioni standard)
- Consumo di memoria ridotto (< 100MB in uso normale)
- Responsività dell'interfaccia utente

## Limitazioni note

- Supporto solo per sistemi Windows (64-bit)
- Nessun supporto per file Excel protetti da password
- Massimo 100 partecipanti per estrazione
- Nessuna persistenza dei dati tra sessioni
- Nessuna funzionalità di rete o cloud

## Considerazioni sulla sicurezza

- L'applicazione opera esclusivamente in locale
- Non effettua connessioni di rete
- Non memorizza dati sensibili
- Non richiede privilegi elevati per l'esecuzione
