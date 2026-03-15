# Istruzioni per la Compilazione dell'Applicazione

## Prerequisiti

- Node.js (versione 16 o superiore)
- npm (incluso con Node.js)

## Passaggi per la Compilazione

1. Clonare il repository
```bash
git clone https://github.com/LuigiGarone/Portfolio-Tech/tree/main/Estrazione-Vincitore-Pasqua
cd Estrazione-Vincitore-Pasqua
```

2. Installare le dipendenze
```bash
npm install
```

3. Compilare l'applicazione
```bash
npm run dist
```

## Output della Compilazione

Dopo aver eseguito `npm run dist`, troverai l'eseguibile in:
`./dist/Estrazione Vincitore.exe`

## Risoluzione Problemi Comuni

- Assicurarsi di avere Node.js a 64-bit
- Verificare che tutte le dipendenze siano installate correttamente
- In caso di errori, aggiornare npm e le dipendenze

## Note per Sviluppatori

- La build genera un eseguibile portabile
- Non richiede installazione sul sistema
- Compatibile con Windows 10/11 a 64-bit

## Personalizzazioni Avanzate

Per personalizzare la build, modificare `build.js` o `package.json`
