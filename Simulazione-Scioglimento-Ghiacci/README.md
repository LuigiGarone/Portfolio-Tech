# 🌊 Simulazione Innalzamento dei Mari

**Autore:** Luigi Garone  
**Data creazione:** 15 marzo 2026  

## Descrizione

Simulazione interattiva HTML/JS che visualizza l'impatto dell'innalzamento del livello del mare a livello mondiale e italiano. Basata su dati scientifici IPCC AR6, NASA, NOAA, USGS.

## File

| File | Descrizione |
|---|---|
| `innalzamento-dei-mari.html` | Simulatore interattivo (standalone, richiede internet per le mappe) |
| `RICERCA-DATI-CLIMATICI.md` | Ricerca scientifica completa con 23 fonti accreditate |

## Funzionalità

- Slider 0–65m per simulare qualsiasi livello di innalzamento
- Tab **🌍 MONDO** e **🇮🇹 ITALIA** a schermo intero
- 7 scenari preimpostati (2050 ottimistico → scioglimento totale)
- Animazione automatica
- Tabella paesi più colpiti con % di superficie sommersa
- Tabella zone italiane a rischio (14 aree con soglie scientifiche)
- Statistiche in tempo reale: superficie globale, popolazione a rischio, km² Italia
- Tooltip interattivi su mappe e città

## Tecnologie

- D3.js v7 + TopoJSON
- Natural Earth 110m (via CDN jsDelivr)
- Google Fonts: Bebas Neue + Inconsolata

## Fonti principali

IPCC AR6 (2021) · NASA Sea Level Portal · NOAA Climate.gov · USGS · AntarcticGlaciers.org · NSIDC

## Hosting consigliato

Aprire `innalzamento-dei-mari.html` nel browser (richiede connessione internet).  
Per condividere: [Netlify Drop](https://netlify.com/drop) → trascina il file → link pubblico.
