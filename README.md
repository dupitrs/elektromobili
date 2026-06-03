# Elektromobilis Rundālē — landing page

Vienas lapas (single-page) reklāmas lapa ekskursijām ar elektromobili pa Rundāles pils
dārzu un apkārtni. Statiska lapa — tikai HTML, CSS un JavaScript, bez build rīkiem.

## Saturs

- **19 minūšu brauciens** pa baroka dārza skaistākajām alejām
- **Stāstījums 13 valodās** (LV/EN pārslēgs lapā)
- **Cena 5 € / personai**, sezona no 1. maija līdz oktobra vidum
- Galerija ar lightbox, Google karte, kontakti (tālr. / WhatsApp / e-pasts)

## Struktūra

```
index.html              # lapas saturs (latviešu valodā, ar data-i18n atslēgām)
assets/
  css/style.css         # dizaina sistēma + visi stili
  js/main.js            # navigācija, animācijas, LV/EN, lightbox
  img/                  # web-optimizētās bildes (hero.jpg, gallery-*.jpg, ...)
  img/originals/        # oriģinālās bildes (pirms optimizācijas)
```

## Palaišana lokāli

Vienkārši atver `index.html` pārlūkā, vai palaid lokālu serveri:

```bash
python -m http.server 8000
# atver http://localhost:8000
```

> Google kartes iframe un fontiem nepieciešams interneta savienojums.

## Kontakti

- Pēteris Grabovskis — **+371 29169034** (tālr. / WhatsApp)
- E-pasts: **emobilis@inbox.lv**
- IK „Somnium", „Maldoņi" 1, Rundāles pagasts, Bauskas novads, LV-3921

## Bilžu avoti

Bildes iegūtas no oficiālās lapas <https://elektromobilis.wordpress.com/>
(Facebook lapa <https://www.facebook.com/rundalemobilis> neatļauj automātisku
satura izgūšanu bez autentifikācijas). Pirms publicēšanas pārliecinieties par
tiesībām izmantot attēlus.

## Dizains

- Krāsas ņemtas no paša objekta: pils krēmkrāsa/zelts, baroka dārza zaļais,
  elektromobiļu sarkano jumtiņu akcents.
- Fonti: Cormorant Garamond (virsraksti) + Mulish (teksts).
- Veidots, izmantojot `taste-skill` (anti-slop frontend) un `ui-ux-pro-max`
  dizaina vadlīnijas (pieejamība, tipogrāfija, kustība).
