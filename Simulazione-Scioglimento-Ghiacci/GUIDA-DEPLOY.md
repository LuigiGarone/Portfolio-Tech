# 🚀 Guida Deploy Gratuito — Simulazione Innalzamento dei Mari
**Autore:** Luigi Garone

Questa guida spiega come pubblicare il file `innalzamento-dei-mari.html` gratuitamente su internet, per poi condividere il link su LinkedIn e Facebook.

---

## ✅ Opzione 1 — Netlify Drop (il più veloce, 2 minuti)

### Prerequisiti
Nessuno. Funziona da qualsiasi browser.

### Passi
1. Apri il browser e vai su: **https://netlify.com/drop**
2. Trascina il file `innalzamento-dei-mari.html` nell'area verde
3. Netlify genera automaticamente un URL del tipo: `https://amazing-name-123456.netlify.app`
4. Copia il link e usalo nel post LinkedIn/Facebook

### Note
- Link attivo per sempre (finché non elimini il deploy)
- Per aggiornare: ridepploya il file sulla stessa UI
- Per un dominio personalizzato (es. `simulazione.tuodominio.it`) occorre un account Netlify gratuito

### Punteggio: ⭐⭐⭐⭐⭐
> Il metodo più rapido. Zero account richiesto per il primo deploy.

---

## ✅ Opzione 2 — GitHub Pages (permanente, professionale)

### Prerequisiti
- Account GitHub gratuito su https://github.com

### Passi
1. Accedi a GitHub
2. Crea un nuovo repository: **New → Repository name** → es. `sea-level-sim`
3. Imposta **Public**, spunta **Add a README file** → clicca **Create repository**
4. Nel repository, clicca **Add file → Upload files**
5. Trascina `innalzamento-dei-mari.html` e **rinominalo** `index.html` prima dell'upload (o rinominalo direttamente nell'upload)
6. Commit changes
7. Vai su **Settings → Pages → Source → Deploy from a branch → main / root**
8. Salva. Dopo ~2 minuti il sito è live su: `https://TUOUSERNAME.github.io/sea-level-sim`

### Note
- URL permanente e professionale
- Puoi collegare un dominio personalizzato gratuitamente
- Ottimo per inserire nel portfolio LinkedIn

### Punteggio: ⭐⭐⭐⭐⭐
> Ideale per portfolio professionale e link permanente da mettere nel profilo LinkedIn.

---

## ✅ Opzione 3 — Vercel (deploy da GitHub in 1 click)

### Prerequisiti
- Repository GitHub (vedi Opzione 2)
- Account Vercel gratuito su https://vercel.com

### Passi
1. Vai su **https://vercel.com/new**
2. Collega il tuo account GitHub
3. Importa il repository `sea-level-sim`
4. Clicca **Deploy**
5. Vercel genera un URL tipo: `https://sea-level-sim.vercel.app`

### Note
- Deploy automatico ad ogni push su GitHub
- Analytics base gratuiti
- CDN globale (veloce ovunque)

---

## ✅ Opzione 4 — Surge.sh (da terminale)

### Prerequisiti
- Node.js installato

### Passi
```bash
npm install --global surge
cd "D:\Repo\Portfolio-Tech\Simulazione-Scioglimento-Ghiacci"
# Rinomina temporaneamente per Surge
copy innalzamento-dei-mari.html index.html
surge
# Segui le istruzioni (email, password, dominio)
```
URL tipo: `https://innalzamento-mari.surge.sh`

---

## 📢 Come condividere su LinkedIn e Facebook

### Post LinkedIn (testo suggerito)
```
🌊 Ho creato una simulazione interattiva sull'innalzamento dei mari.

Basata su dati scientifici IPCC AR6 (2021), NASA, NOAA e USGS, permette di visualizzare:
- Scenari dal 2050 allo scioglimento totale dei ghiacci (+65m)
- Le aree italiane più a rischio (Venezia, Delta del Po, Pianura Padana…)
- I paesi più vulnerabili per percentuale di territorio sommerso

🔗 Prova la simulazione: [INSERISCI LINK]

Il cambiamento climatico non è un problema del futuro. È un problema di oggi.

#ClimateChange #SeaLevelRise #DataViz #IPCC #CambiamentoClimatico
```

### Suggerimento per aumentare la visibilità
1. **Screenshot**: fai uno screenshot con la mappa al +2m o +65m e allegalo al post (le immagini aumentano la reach)
2. **Video**: registra 30 secondi con OBS o ShareX mostrando l'animazione → allegalo come video al post
3. **Tag**: tagga @IPCC, @NASA Earth, @CMCC Foundation se pertinente

### Screenshot rapido
- Windows: `Win + Shift + S` per screenshot area selezionata
- Poi incolla direttamente nel post LinkedIn

### Screen record (GIF/video)
- **ScreenToGif** (gratuito): https://www.screentogif.com/
- Registra 15-20 secondi dell'animazione → esporta come GIF → allega al post

---

## ⚠️ Note tecniche

Il file `innalzamento-dei-mari.html` richiede **connessione internet** perché carica:
- Mappa mondiale da CDN: `cdn.jsdelivr.net/npm/world-atlas@2`
- D3.js da: `cdnjs.cloudflare.com`
- Font da: `fonts.googleapis.com`

Per una versione **offline completa** (tutto incluso nel file), sarebbe necessario bundlare le librerie — operazione fattibile ma che aumenterebbe il file da ~50KB a ~1MB.

---

*Documento generato il 15 marzo 2026 | © Luigi Garone*
