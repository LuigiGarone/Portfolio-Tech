# Note di Rilascio - Estrazione Vincitore Pasqua

## Versione 1.0.1 (Aprile 2025)

### Miglioramenti principali
- **Gestione file migliorata**: Risolto il problema di lettura dei file Excel nell'applicazione packagizzata
- **Interfaccia utente migliorata**: Aggiunti indicatori di caricamento e messaggi di stato più chiari
- **Logging avanzato**: Aggiunto logging dettagliato con timestamp per facilitare il debug
- **Visualizzazione vincitore**: Migliorata l'animazione e la visualizzazione del vincitore estratto

### Correzioni di bug
- Risolto il problema `x.charCodeAt is not a function` durante la lettura di file Excel
- Corretta la gestione dei percorsi file nell'applicazione packagizzata
- Risolti problemi di visualizzazione su schermi ad alta risoluzione
- Migliorata la gestione degli errori nel caso di file non accessibili

### Miglioramenti tecnici
- Implementati metodi diversi di lettura dei file Excel basati sul formato
- Aggiunta verifica del formato del file prima della lettura
- Migliorato il meccanismo di ricerca dei file in diverse posizioni
- Ottimizzato il consumo di memoria durante la lettura di file di grandi dimensioni

### Documentazione
- Aggiunta guida utente dettagliata
- Aggiunte istruzioni di installazione e uso
- Aggiunto file README.html per una migliore esperienza utente
- Incluso file di esempio per facilitare l'uso dell'applicazione

## Versione 1.0.0 (Marzo 2025)

### Caratteristiche iniziali
- Interfaccia utente semplice per la selezione del file Excel
- Funzionalità di estrazione casuale del vincitore
- Supporto per file Excel (.xlsx, .xls) e CSV
- Countdown visivo prima dell'estrazione
- Visualizzazione del vincitore estratto

### Limitazioni note nella versione iniziale
- Problemi di lettura dei file Excel in alcune configurazioni
- Mancanza di feedback visivo durante le operazioni di caricamento
- Gestione limitata degli errori
- Documentazione minima

## Roadmap Futura

### Versione 1.1.0 (Pianificata)
- Supporto per l'estrazione di vincitori multipli
- Opzione per escludere vincitori precedenti
- Miglioramento delle animazioni e degli effetti visivi
- Possibilità di personalizzare il countdown

### Versione 1.2.0 (Pianificata)
- Salvataggio dello storico delle estrazioni
- Esportazione dei risultati in formato Excel o PDF
- Tema chiaro/scuro per l'interfaccia utente
- Supporto per formati di file aggiuntivi

### Versione 2.0.0 (In considerazione)
- Versione web dell'applicazione
- Supporto per database oltre ai file Excel
- Modalità presentazione per visualizzazione su grandi schermi
- Integrazione con servizi di notifica (email, SMS)

## Informazioni di Distribuzione

### Pacchetto di Distribuzione
Il pacchetto di distribuzione contiene:
- Applicazione eseguibile (`Estrazione Vincitore.exe`)
- File di documentazione (README.md, GUIDA_UTENTE.md, LEGGIMI.txt)
- File di esempio (esempio_partecipanti.csv)

### Metodo di Aggiornamento
Per aggiornare da una versione precedente:
1. Scarica l'ultima versione dal link di download
2. Estrai il pacchetto in una nuova cartella
3. Sostituisci la versione precedente (non è richiesta disinstallazione)
4. I file di dati esistenti rimangono compatibili con la nuova versione

### Supporto Versioni Precedenti
- La versione 1.0.1 è retrocompatibile con i file creati per la versione 1.0.0
- Non è previsto il supporto a lungo termine per la versione 1.0.0

## Segnalazione Problemi

Per segnalare problemi o suggerire miglioramenti:

1. Apri un issue sulla [pagina GitHub del progetto](https://github.com/tuoprofilo/portfolio-tech/issues)
2. Invia un'email a [support@example.com](mailto:support@example.com)
3. Includi sempre le seguenti informazioni:
   - Versione dell'applicazione
   - Sistema operativo e versione
   - Descrizione dettagliata del problema
   - Screenshot se pertinenti
   - File di log (se disponibili)
