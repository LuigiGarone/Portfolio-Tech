const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

// Abilita logging su file
const log = require('electron-log');
log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'logs/main.log');
log.transports.console.level = 'debug';
log.transports.file.level = 'debug';

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

  // Apri gli strumenti di sviluppo solo in modalità sviluppo
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  win.loadFile('index.html');

  // Log percorsi utili
  log.info('INFORMAZIONI DI SISTEMA:');
  log.info('Versione Node:', process.version);
  log.info('Architettura:', process.arch);
  log.info('Piattaforma:', process.platform);
  log.info('User Data:', app.getPath('userData'));
  log.info('Executable Path:', app.getPath('exe'));
  log.info('App Path:', app.getAppPath());
  log.info('Desktop Path:', app.getPath('desktop'));
  log.info('Documents Path:', app.getPath('documents'));
  log.info('Current Working Directory:', process.cwd());
}

app.whenReady().then(() => {
  log.info('Applicazione avviata');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function findFileInMultiplePaths(filename) {
  log.info('Ricerca file con percorso:', filename);
  
  // Verifica diretta del percorso originale
  try {
    if (fs.existsSync(filename)) {
      log.info(`File trovato al percorso originale: ${filename}`);
      return filename;
    }
  } catch (error) {
    log.error(`Errore verifica percorso originale ${filename}:`, error);
  }
  
  // Usa il nome del file senza percorso per la ricerca successiva
  const baseFilename = path.basename(filename);
  log.info(`Ricerca file con nome base: ${baseFilename}`);
  
  // Array di percorsi di ricerca, in ordine di priorità
  const searchPaths = [
    // Percorsi correnti
    process.cwd(),
    // Percorsi di sistema
    app.getPath('desktop'),
    app.getPath('downloads'),
    app.getPath('documents'),
    // Percorsi relativi all'applicazione
    app.getAppPath(),
    path.dirname(app.getPath('exe')),
    // Cartelle personali dell'utente
    path.join(process.env.USERPROFILE, 'Downloads'),
    path.join(process.env.USERPROFILE, 'Desktop'),
    path.join(process.env.USERPROFILE, 'Documents'),
    // Percorsi relativi all'eseguibile 
    path.join(path.dirname(app.getPath('exe')), 'resources'),
    path.join(path.dirname(app.getPath('exe')), 'resources', 'app'),
    path.join(path.dirname(app.getPath('exe')), 'resources', 'app.asar')
  ];

  // Log di tutti i percorsi di ricerca
  log.info('Percorsi di ricerca file:');
  searchPaths.forEach((p, i) => log.info(`${i+1}. ${p}`));

  // Cerca il file in tutti i percorsi
  for (const searchPath of searchPaths) {
    try {
      const fullPath = path.join(searchPath, baseFilename);
      log.info(`Verifica percorso: ${fullPath}`);
      
      if (fs.existsSync(fullPath)) {
        log.info(`✅ File trovato: ${fullPath}`);
        return fullPath;
      }
    } catch (error) {
      log.error(`Errore verifica percorso ${searchPath}:`, error);
    }
  }

  log.error(`❌ File ${baseFilename} non trovato in nessun percorso`);
  return null;
}

ipcMain.handle('read-excel', async (event, originalFilePath) => {
  log.info('=== INIZIO LETTURA FILE EXCEL ===');
  log.info('Tentativo di lettura file:', originalFilePath);

  try {
    // Controllo validità del percorso
    if (!originalFilePath) {
      log.error('Percorso file non valido o nullo');
      return { error: 'Percorso file non valido o non selezionato' };
    }

    log.info('Tipo del percorso:', typeof originalFilePath);
    log.info('Lunghezza del percorso:', originalFilePath.length);
    
    // Cerca il file usando sia il percorso completo che il nome del file
    const filePath = findFileInMultiplePaths(originalFilePath);

    // Verifica se il file è stato trovato
    if (!filePath) {
      log.error('File non trovato in nessun percorso');
      return { error: `File non trovato: ${path.basename(originalFilePath)}` };
    }
    
    log.info('Percorso file finale trovato:', filePath);

    // Verifica esistenza file prima di leggere
    try {
      if (!fs.existsSync(filePath)) {
        log.error('File non esistente:', filePath);
        return { error: `File esiste ma non è accessibile: ${filePath}` };
      }
      
      // Log dei dettagli del file
      const stats = fs.statSync(filePath);
      log.info('Dettagli file:', {
        size: `${stats.size} bytes`,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        permissions: stats.mode.toString(8)
      });
    } catch (fsError) {
      log.error('Errore accesso al file system:', fsError);
      return { error: `Errore accesso al file: ${fsError.message}` };
    }

    // Verifica che il file abbia un'estensione Excel valida
    const fileExt = path.extname(filePath).toLowerCase();
    if (!['.xlsx', '.xls', '.csv'].includes(fileExt)) {
      log.error(`Estensione file non supportata: ${fileExt}`);
      return { error: `Il file selezionato non è un file Excel valido. Estensioni supportate: .xlsx, .xls, .csv` };
    }

    log.info(`Estensione file riconosciuta: ${fileExt}`);
    
    // Leggi il file Excel con gestione errori
    log.info('Tentativo lettura file Excel:', filePath);
    let workbook;
    try {
      // Supporto per diversi tipi di lettura
      try {
        // Primo tentativo: lettura come array di bytes
        const excelBuffer = fs.readFileSync(filePath);
        log.info(`File letto con successo, dimensione buffer: ${excelBuffer.length} bytes`);
        
        // Scegliamo il metodo di lettura in base all'estensione
        if (fileExt === '.csv') {
          // Per CSV, usiamo il parsing diretto
          const csvString = excelBuffer.toString('utf8');
          workbook = XLSX.read(csvString, { type: 'string' });
        } else {
          // Per XLSX e XLS, usiamo l'array binario
          workbook = XLSX.read(new Uint8Array(excelBuffer), { type: 'array' });
        }
      } catch (firstError) {
        log.warn('Primo tentativo di lettura fallito, provo metodo alternativo:', firstError.message);
        try {
          // Secondo tentativo: lettura diretta
          workbook = XLSX.readFile(filePath, { type: 'binary' });
        } catch (secondError) {
          log.error('Tutti i tentativi di lettura falliti');
          throw new Error(`Impossibile leggere il file Excel: ${secondError.message}`);
        }
      }
      
      log.info('File Excel caricato con successo');
    } catch (readError) {
      log.error('Errore lettura file Excel:', readError);
      return { error: `Errore formato file Excel: ${readError.message}` };
    }

    // Verifica che ci sia almeno un foglio
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      log.error('File Excel senza fogli');
      return { error: 'Il file Excel non contiene fogli di lavoro' };
    }
    
    // Prendi il primo foglio
    const sheetName = workbook.SheetNames[0];
    log.info('Foglio selezionato:', sheetName);
    log.info('Tutti i fogli disponibili:', workbook.SheetNames.join(', '));

    const worksheet = workbook.Sheets[sheetName];

    // Loggare range del foglio
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z100');
    log.info('Range del foglio:', worksheet['!ref']);
    log.info(`Dimensioni: ${range.e.r - range.s.r + 1} righe x ${range.e.c - range.s.c + 1} colonne`);

    // Converti in array per leggere direttamente le celle
    const data = [];
    
    // Leggi dalla riga 1 alla 100, colonna B
    log.info('Inizio estrazione nomi dalla colonna B...');
    for (let row = 1; row <= 100; row++) {
      const cellAddress = `B${row}`;
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v) {
        data.push(cell.v);
        log.debug(`Riga ${row}, valore: ${cell.v}`);
      } else {
        log.debug(`Riga ${row} vuota o non trovata`);
      }
    }

    log.info(`Estrazione completata: ${data.length} nomi trovati`);
    
    // Verifica se ci sono dati
    if (data.length === 0) {
      log.error('Nessun nome trovato nella colonna B');
      return { error: 'Nessun nome trovato nella colonna B. Inserisci i nomi nella colonna B del foglio Excel.' };
    }

    // Converti tutto in stringhe e rimuovi eventuali duplicati
    const cleanedData = [...new Set(data.map(item => String(item).trim()))];
    log.info(`Dati ripuliti: ${cleanedData.length} nomi unici`);
    
    // Mostra primi 5 nomi come esempio
    const examples = cleanedData.slice(0, 5);
    log.info('Esempi di nomi estratti:', examples.join(', '));
    
    log.info('=== LETTURA FILE EXCEL COMPLETATA CON SUCCESSO ===');
    return cleanedData;
  } catch (error) {
    log.error('=== ERRORE CRITICO ===');
    log.error('Errore completo:', error);
    log.error('Stack trace:', error.stack);
    return { 
      error: `Errore nel caricamento del file: ${error.message}`,
      stack: error.stack 
    };
  }
});

ipcMain.handle('select-file', async () => {
  log.info('Avvio dialogo selezione file');
  
  try {
    // Definisci cartelle iniziali di ricerca
    const defaultPaths = [
      app.getPath('desktop'),
      app.getPath('documents'),
      app.getPath('downloads'),
      process.cwd()
    ];
    
    // Trova la prima cartella valida
    let defaultPath = null;
    for (const p of defaultPaths) {
      try {
        if (fs.existsSync(p)) {
          defaultPath = p;
          log.info(`Cartella iniziale per dialogo: ${p}`);
          break;
        }
      } catch (e) {
        log.debug(`Cartella non accessibile: ${p}`);
      }
    }
    
    // Configura dialogo
    const options = {
      title: 'Seleziona File Excel con Partecipanti',
      defaultPath,
      buttonLabel: 'Seleziona File',
      properties: ['openFile'],
      filters: [
        { name: 'Excel Files', extensions: ['xlsx', 'xls', 'csv'] }
      ]
    };
    
    log.info('Apertura dialogo con opzioni:', JSON.stringify(options));
    const result = await dialog.showOpenDialog(options);
    
    // Gestisci il risultato
    if (result.canceled) {
      log.info('Selezione file annullata dall\'utente');
      return null;
    }
    
    const selectedFile = result.filePaths[0];
    log.info('File selezionato dall\'utente:', selectedFile);
    
    // Controlla se il file esiste
    if (selectedFile && fs.existsSync(selectedFile)) {
      log.info('File verificato e accessibile');
      return selectedFile;
    } else if (selectedFile) {
      log.error('File selezionato ma non accessibile:', selectedFile);
      return selectedFile; // Restituisci comunque il percorso, gestiremo l'errore dopo
    }
    
    return null;
  } catch (error) {
    log.error('Errore durante apertura dialogo di selezione:', error);
    return null;
  }
});
