# Elektromobilis Rundālē — landing page

Vienas lapas (single-page) reklāmas lapa ekskursijām ar elektromobili pa Rundāles pils
dārzu un apkārtni. Statiska lapa — tikai HTML, CSS un JavaScript, bez build rīkiem.

## Saturs

- **Aptuveni 20 minūšu brauciens** pa baroka dārza skaistākajām alejām
- **Stāstījums 14 valodās** (arī pati lapa pārslēdzama 14 valodās)
- **Cena 5 € / personai**, sezona no 1. maija līdz oktobra vidum
- Galerija ar lightbox, Google karte, kontakti (tālr. / WhatsApp / e-pasts)
- **Brauciens cauri lapai** — pēc sākuma video elektromobilis ar piekabi seko
  vienam nepārtrauktam celiņam. Sadaļas uzreiz ir pilnā platumā, bez pietuvināšanas,
  samazinātiem priekšskatījumiem vai paslēpta satura. Starp tām ir dārza posmi,
  kuru augstums pielāgojas attālumam starp vārtiem un dārza laukumu proporcijām.
  Datorā pieredzes sadaļā mašīna brauc starp teksta un fotogrāfiju kolonnām,
  valodās pa vidusjoslu, bet pēc valodām turpina pa labo pusi. Pilna ekrāna
  17 gadu kartē tas brauc pa taisno labo aleju. Kamēr karte paliek vietā un
  veidojas cipari, mašīna ar piekabi pa šo aleju virzās lēnāk; ritinot atpakaļ,
  abi atgriežas pa to pašu ceļu. Telefonā
  valodu vidusjoslai tā piebrauc zem virsraksta, brīvajā vietā pirms kartītēm.
  Visām sadaļām un kājenei izmantots vienāds vecās lapas krēmkrāsas fons — #FAF6EC.
  Valodu kartīšu pāri ar plašu slīdēšanu vienā plaknē sāk savilkties jau pirms
  mašīnas piebraukšanas rindai un aiz piekabes aizveras līdz šaurai 12 px spraugai.
  Atvērtās kartītes ir tālāk atvirzītas, nedaudz samazinātas un nolaistas;
  sakļaujoties tās paceļas un atgūst pilnu izmēru. Kustības platums pielāgojas ekrānam.
  Abas puses kustas ar nobīdi; ritinot atpakaļ, tās atkal atveras.
  Kartīšu kustība un mašīna izmanto vienu
  ritinājuma pozīciju. Pēdējā dārzā mašīna apstājas pirms celiņa beigām.
  Sākumā divas strūklakas ir izvietotas simetriski sānos, katra savā apļveida
  celiņā. Pa vidu mašīna brauc taisni; pagrieziens uz nākamo sadaļu sākas tikai
  aiz strūklakām. Ritināšanai nav atsevišķa palēninājuma šajā posmā.
  Katras sadaļas augšējā un apakšējā mala robežojas ar dzīvžogu un atvērtiem vārtiem.
  Liepas atrodas ārpus sadaļām, aiz dzīvžogiem; arī koku vainagi paliek ārpus maršruta.
  Astoņi pāreju posmi saglabā iepriekšējos 3D dekorāciju attēlus, projekciju,
  ēnas un krāsas. Alejas un apstādījumi tagad veido simetriskus pārus ap katra
  posma vidusasi. Mašīnas ceļš savieno sadaļu vārtus; pārējais dārzs vairs netiek
  sašķiebts līdzi brauciena trajektorijai. Dzīvžogi veido nepārtrauktu kontūru ap
  visu celiņu tīklu, saglabājot vienādu atstarpi un atvērtus krustojumus.
  Paviljonu laukumi ir savienoti ar alejām, parterā ir divas sānu strūklakas un pāra dobes,
  pēdējā posmā saglabāts kanāls. Koki ir izvietoti pāros un nepārklāj dzīvžogus.
  Abās 17 gadu kartes malās turpinās tas pats fona attēls ar precīzi sakrītošu
  mērogu un attēla koordinātām. Pāreja notiek pilnā šķērsalejā ārpus redzamās
  sadaļas, nevis patvaļīgi pārgrieztos apstādījumos. Šīs alejas platums sakrīt
  abās kartēs; koku galotnes un nepārtrauktie dzīvžogi paliek veseli.
  Pārējām alejām, sānu ejām un apļveida celiņiem lietots viens 4,8 pasaules vienību platums;
  priekšlaukumi saglabā savas kontūras. Celiņu virsma tiek uzzīmēta kopā, bez
  kontūrlīnijām malās vai šuvēm krustojumos. Cauri skatam ejošie celiņi turpinās
  līdz tā malai, un dzīvžogos tiem ir atbilstoši atvērumi.
  Šīs ir stilizētas franču dārza kompozīcijas, nevis precīzi muzeja plāna fragmenti
  vai faktiskā elektromobiļa ekskursijas maršruts. Agrāk pārzīmētais muzeja plāns
  ar avotu saitēm saglabāts `rundale-garden-plan.js`. Telefonā kompozīcijas saglabā
  simetriju; mazākajos laukumos elementi tiek izlaisti tikai veselos pāros.
  Ceļš, apstādījumi un transportlīdzekļi izmanto vienas koordinātas. Piekabe seko
  pa to pašu trajektoriju arī līkumos un ritinot atpakaļ. Apstādījumu izvietojums
  rezervē vietu visai mašīnai, piekabei, sakabei un objektu projekcijām.
  Dārza attēli tiek uzzīmēti tikai pēc izkārtojuma maiņas; ritinot pārvietojas
  vienīgi neliels mašīnas Canvas slānis. Dekorāciju kopīgais atlants ir 34 KB.
  Mašīnu attēli tiek dekodēti vienreiz un koplietoti ar 17 gadu skatu.
  Pārlūkos ar `ImageBitmap` atbalstu dekodētie pikseļi saglabājas atmiņā,
  novēršot atkārtotu WebP atkodēšanu pirmajā 17 gadu animācijas kadrā.
  Nav dzīvas WebGL ainas vai patstāvīgas brauciena pārzīmēšanas dīkstāvē.
  Samazinātas kustības režīmā dārzs paliek statisks. Bez JavaScript vai attēlu
  ielādes kļūmes gadījumā pieejama parasta lasāma lapa. Sākuma video, sadaļu adreses,
  fotogrāfijas, abas valodu kolonnas un viss teksts ir saglabāts.
- **Negaisa aina** — pie brauciena plānošanas piezīmes ir reālistisks, caurspīdīgs
  [mākoņa attēls](assets/img/weather/rain-cloud.webp), kas dzīvo: tas pats foto ir
  salikts vairākos mīksti maskētos slāņos (dūmaka, trīs kupoli, priekšējās skrandas),
  un katrs elpo savā ritmā (9–25 s), tāpēc siluets nekad nestāv uz vietas. Ik pēc
  5–14 s uzplaiksnī zibens: biežāk mākonis iedegas no iekšpuses, retāk redzams
  žūburains kanāls, kas iznāk no mākoņa pamatnes un datorā nokāpj pa mašīnas joslu
  līdz zemei. Katrs uzliesmojums ir vairāki mirgojumi ar pēcspīdumu, un kartīte ar
  apkārtni uz mirkli kļūst nedaudz gaišāka. Dīkstāvē kustību dzen tikai CSS
  (bez papildu kadru cikla); kanālu uz `canvas` zīmē tikai uzliesmojuma laikā.
  Mašīna labajā pusē izbrauc caur mākoni; divas dubļainas riteņu sliedes
  atklājas tikai aiz piekabes līdz sadaļas beigām. Ritinot atpakaļ, tās pazūd.
  Visa kustība apstājas ārpus ekrāna, paslēptā cilnē un samazinātas kustības režīmā.
  Pārbaudei lapas adresei var pievienot `?storm=bolt&seed=3&at=40` (iesaldē vienu
  konkrētu zibens kadru) vai `?storm=none` (miers).
  [Ģenerēšanas apraksts un izmantotais prompts](assets/img/weather/README.md)
  ir saglabāti pie mākoņa faila.
- **17+ gadu pieredze** — pilna platuma dārza kartē skaitli 17 izveido desmit
  elektromobiļi un četras piekabes; katram elektromobilim ir ne vairāk kā viena piekabe.
  Ciparam 1 ir īss augšējais āķis, četru mašīnu vertikāle un elektromobilis ar piekabi pamatnē;
  ciparam 7 ir horizontāla augša un izteikti slīpa kāja. Vidus atstāts bez apaļiem
  ornamentiem, kas varētu izskatīties pēc papildu cipara. Visu celiņu segums ir vienādā krāsā, ciparus
  veido transportlīdzekļi. Gaišs parks dienasgaismā ar smilšu krāsas celiņiem
  izceļ elektromobiļu sarkanos jumtus. Sadaļa atrodas uzreiz pēc valodām.
  Skati sagatavoti no pilniem 3D modeļiem (Three.js) ar foto `assets/img/exp-cars.webp`
  iedvesmotu Melex virsbūvi, priekšā saīsinātu sarkanu jumtu, slīpu vējstiklu, sēdekļiem,
  riteņiem un sakabēm. Modeļi ir veidoti pēc fotogrāfijas un aptuveniem izmēriem,
  nevis ražotāja CAD datiem. Fonā ir pieklusināts franču dārzs ar celiņiem, dzīvžogiem
  un bosketiem; tas nav precīzs Rundāles parka plāns.
  Apstādījumu vasaras krāsas iedvesmotas no
  [Arta Jutus aerofoto](https://blbs.lv/jaunumi/rundales-pils-darzs-nominets-eiropas-darza-balvai-2021/).
  Abpus celiņiem ir atsevišķas liepu rindas un viena kupla dzīvžoga josla;
  koku vainagi nesaskaras ar dzīvžogiem un krustojumos saglabāta brīva vieta.
  Dzīvžogi veido kopīgu kontūru 4,2 m attālumā no celiņu viduslīnijām, ar precīzi
  savienotiem stūriem. Paviljons atrodas apakšējā labā laukuma vidū.
  Sarkanās dobes un strūklakas nav iekļautas. Karte pielāgota tuvāk izvietotiem cipariem;
  7 un 1 augšas savieno celiņš un 1 turpinās līdz ziemeļu šķērsalejai.
  Arī 1 pamatnes celiņš sasniedz 7 diagonāles viduslīniju, veidojot pilna platuma krustojumu.
  Mašīnas pabeidz 1 vertikāli pirms pamatnes iebraukšanas krustojumā.
  Braucienu vada lapas ritināšana abos virzienos, bez automātiska taimera.
  Karte aizpilda visu ekrānu zem navigācijas un paliek vietā, kamēr ritinājums izveido 17; ritinot augšup,
  mašīnas izbrauc to pašu trajektoriju atpakaļ. Pluss ar nedaudz noapaļotiem stūriem parādās
  jau brauciena vidū ar vieglu iegriešanos un pazūd, ritinot atpakaļ pirms šī punkta.
  Cipari atrodas augstāk, bet zem tiem ir viegls jumtu sarkanās krāsas paraksts ar plānām līnijām abās pusēs.
  Uzraksts un pluss izmanto elektromobiļu jumtu krāsu. Zāliena un celiņu krāsas
  sakrīt ar pārējiem dārza posmiem. Ritinot uz priekšu, fona detaļas pakāpeniski
  pieklusinās līdz 90%, izceļot elektromobiļu veidoto 17. Jumti saglabā sākotnējās krāsas bez papildu mirdzuma.
  Cipari paliek izcelti līdz visa fiksētā ritinājuma posma beigām. Krāsas pakāpeniski atjaunojas
  tikai pēc tam, kad karte jau ir aizritējusi 22% aiz fiksētā posma, nākamo 40% no šī posma garuma laikā.
  Ritinot atpakaļ, abas pārejas darbojas pretējā virzienā.
  Karte sniedzas līdz abām ekrāna malām, bez baltām apmalēm vai noapaļota rāmja.
  Dārza ziemeļu un dienvidu daļas ir pagarinātas arī augstiem telefonu ekrāniem.
  Abās blakus kartēs turpinās tas pats attēls ar identisku mērogu un kadrējumu;
  kopīga šķērsaleja savieno abu karšu celiņus. Blakus posmi saņem to pašu krāsu pieklusinājumu.
  Ritināšanas posms ir īsāks: 420–620 px telefonā un 680–900 px datorā.
  Kamera ir fiksēta tieši dienvidos, vērsta uz ziemeļiem, atstājot vietu uzrakstam zem cipariem.
  `prefers-reduced-motion` rāda uzreiz gatavu kompozīciju. Ja animācijas attēli nav
  pieejami, redzama fotogrāfija un teksts. Kopīgais kartes fons ielādējas līdz ar blakus dārziem;
  pati animācija arī tiek sagatavota uzreiz, lai strauja ritināšana neizraisītu
  fotogrāfijas nomaiņu ar karti jau redzamajā sadaļā. Visi attēli ir vietēji.
  WebGL un Three.js apmeklētāja pārlūkā vairs nav vajadzīgi.
  Ritinājuma vieta tiek rezervēta uzreiz. Vēla attēlu ielāde pielāgojas pašreizējai
  ritināšanas pozīcijai un nemaina sadaļas augstumu.
  Kartes moduļiem, stiliem un attēliem ir saskaņotas versiju adreses, lai pārlūka
  kešatmiņa nesajauktu iepriekšējo izkārtojumu ar jauno animāciju. Mainot šos failus,
  kopā jāatjauno to `v` versija HTML un moduļu importos.
  Dārza fons un katra transportlīdzekļa 72 leņķi ir iepriekš renderēti WebP attēlos
  (kopā aptuveni 1 MB). Pārlūks pārvieto šos skatus ar Canvas 2D, saglabājot
  sākotnējās trajektorijas, piekabes, apgaismojumu un gludus pagriezienus.
  Kustības laikā nav ģeometrijas, dzīvžogu vai ēnu aprēķinu.
  Ārpus ekrāna un stāvot uz vietas animācija netiek pārzīmēta.
  Video, audio un attēliem pievienotas vieglākas versijas. Galerija pilnos attēlus ielādē tikai atverot lightbox,
  un sākuma video tiek apturēts ārpus ekrāna.
- **Vienmērīga lapas ritināšana** — lokāli glabāts [Lenis 1.3.26](https://github.com/darkroomengineering/lenis)
  izlīdzina peles ritentiņa un skārienpaliktņa kustību ar tādu pašu sekošanas koeficientu (lerp 0,1),
  kādu izmanto itsoffbrand.com: katrā kadrā ritinājums noiet aptuveni desmito daļu no atlikušā attāluma,
  tāpēc viens ritentiņa solis mierīgi norimst aptuveni sekundes laikā neatkarīgi no ekrāna kadru ātruma.
  Navigācijas saites uz sadaļām slīd ar maigu sākumu un maigu piebremzēšanu; tālākas sadaļas saņem
  nedaudz vairāk laika (0,7–1,6 s). Skārienekrānos saglabāta pārlūka dabiskā inerce; tiek ievērota
  samazinātas kustības izvēle un galerijas ritināšanas bloķēšana.
- **Mūzika pēc izvēles** — ieslēdzas tikai ar mūzikas pogu. Valodu izvēlne un galerija
  ir lietojamas arī ar tastatūru; lapas teksts paliek redzams arī bez JavaScript.

## Struktūra

```
index.html              # lapas saturs (latviešu valodā, ar data-i18n atslēgām)
assets/
  css/style.css         # dizaina sistēma + visi stili
  css/journey.css       # dārza posmi, vidusjosla un pilna platuma sadaļas
  css/visit-weather.css # reālistiskā mākoņa, lietus un sliežu izkārtojums
  css/fonts.css         # vietējo fontu definīcijas
  fonts/                # Playfair Display, Manrope un OFL licences
  js/main.js            # navigācija, animācijas, 14 valodas, lightbox
  js/smooth-scroll.js   # vienmērīga lapas ritināšana
  js/journey.js         # nepārtraukts mašīnas un piekabes maršruts
  js/journey-formal-garden.js # simetriskas alejas, savienoti dzīvžogi un pāra apstādījumi
  js/journey-gardens.js # iepriekšējo 3D skatu ģenerēšanas ģeometrija
  js/rundale-garden-plan.js # muzeja plāna alejas, bosketu elementi un astoņi fragmenti
  js/journey-garden-renderer.js # statiskie Canvas 2D dārza posmi
  js/journey-worker.js  # dārzu aprēķini un zīmēšana atsevišķā pavedienā
  js/journey-start.js   # dārza worker agrīna palaišana
  js/journey-bake.js    # 3D dekorāciju attēlu ģenerēšana
  js/garden-assets.js   # kopīgi dekodētie mašīnu un piekabju skati
  js/visit-weather.js   # lietus aina un maršrutam atbilstošas riteņu sliedes
  js/years.js           # 17 gadu animācijas agrīna sagatavošana
  js/years-layout.js    # pilna ekrāna sadaļas izmēri un kopīgs kartes/alejas kadrējums
  js/years-scene.js     # viegla Canvas 2D animācija ar iepriekš renderētiem skatiem
  js/years-bake.js      # 3D dārzs un kadru ģenerēšana; lapā neielādējas
  js/years-models.js    # pilnie 3D modeļi kadru ģenerēšanai
  js/years-routes.js    # kopīgas trajektorijas modeļiem un celiņiem
  js/vendor/           # Three.js r180, Lenis 1.3.26 un MIT licences
  img/                  # web-optimizētās bildes (hero.webp, gallery-*.webp, ...)
  img/originals/        # oriģinālās bildes (pirms optimizācijas)
  img/years/            # dārza fons, mašīnu kadri un to izmēri
  img/journey/          # kopīgs dekorāciju atlants; agrāko bosketu skati
scripts/bake-years.cjs   # atkārtoti ģenerē 17 gadu animācijas attēlus
scripts/bake-journey.cjs # atkārtoti ģenerē parka dekorācijas
scripts/bake-opening.cjs # pirmā dārza vieglie sākuma attēli datoram un telefonam
scripts/check-gardens.mjs # 40 izkārtojumu simetrijas un mašīnas joslas pārbaude
scripts/check-years-joins.mjs # 17 gadu kartes savienojumi astoņos ekrāna izmēros
```

## Palaišana lokāli

Sākuma teksts ir redzams bez parādīšanās animācijas; video sāk ielādēties pēc
sākuma foto atkodēšanas, negaidot visas lapas `load`. Dārza moduļa ielādi sāk
`modulepreload`. Pirmā dārza abi WebP attēli ir iekļauti pašā HTML kā data URL:
pārlūkam nav jāveic atsevišķs attēla pieprasījums. `picture` izvēlas telefonam
vai datoram piemēroto skatu, un `decoding="sync"` sagatavo to kopā ar lapas zīmēšanu.
Attēli sagatavoti ar to pašu dārza zīmēšanas kodu. Tas negaida JavaScript,
mašīnas vai worker; gatavais Canvas to pārklāj tajā pašā vietā. Attēls vienmēr
paliek zem Canvas: worker paziņojums vēl nenozīmē, ka pārlūks jau parādījis tā
pikseļus. Tādējādi pārejas laikā nerodas tukšs laukums. Attēls pieejams
arī bez JavaScript. Worker tiek palaists agrāk ar atsevišķu asinhronu moduli,
un pirmā dārza pārrēķini saglabā prioritāti arī pēc fontu ielādes.
Maršrutu un sadaļu izmērus aprēķina uzreiz. Visu astoņu posmu
apstādījumus un attēlus sagatavo atsevišķs Web Worker ar OffscreenCanvas,
sākot ar tuvākajiem posmiem. Smagie aprēķini un zīmēšana nebloķē ritināšanu;
mainoties izmēram, worker saglabā tikai jaunāko gaidošo izkārtojumu katram posmam.
Dārza dekorācijas negaida mašīnu attēlus. Ja worker vai OffscreenCanvas nav
pieejams, paliek parasta lasāma lapa. Kopīgo 17 gadu kartes fonu un mašīnu atlasus
sāk ielādēt uzreiz. Abi piegulošie dārzi tiek uzzīmēti tikai ar gatavu kopīgo fonu,
tādēļ ritinot nepārslēdzas no pagaidu dārza uz citu kompozīciju.
`check-gardens.mjs` pārbauda arī vieglā un pilnā maršruta sakritību.
Ritināšanu pārbauda `node scripts/check-journey-scroll.cjs http://localhost:8000`
(telefonam pievieno `390 844`). Tas pārbauda visus astoņus dārzus un 17 gadu
ainu un ziņo par gariem galvenā pavediena darbiem 12 sekunžu ritināšanas laikā.

Telefonā ievada video darbojas arī ar izslēgtu skaņu un `playsinline`.
Ja automātisko atskaņošanu pārlūks bloķē, to var palaist ar pogu pie cenas.
Samazinātas kustības un datu taupīšanas režīmā atskaņošana sākas tikai pēc pogas nospiešanas.
Ārpus ievada un paslēptā cilnē video tiek apturēts. Pieskāriena ierīcēs teksts un
fotogrāfijas ir redzami uzreiz, bez parādīšanās animācijas gaidīšanas.
Mašīnas Canvas ir absolūti novietots dārza koordinātās: pārlūka ritināšana pārvieto
mašīnu un celiņu kopā arī starp JavaScript kadriem. Telefona pārlūka joslas augstuma
maiņa nepārrēķina dārzus; pagriežot ekrānu, izkārtojums tiek pārrēķināts.

Sākuma ielādes ekrāna procenti rāda 13 gatavības posmus: DOM, fontus, ievada
attēlu, maršruta mašīnu, astoņus uzzīmētos dārza posmus un “17” ainu. Tie nav
lejupielādēto baitu procenti. Pēc 25 sekundēm var turpināt arī tad, ja kāds
resurss kavējas; 45 sekunžu drošības taimeris novērš iestrēgušu ekrānu.

`scripts/check-mobile.cjs` pārbauda video, bloķētas automātiskās atskaņošanas atkopšanu,
mašīnas un ceļa sakritību starp kadriem, dārzu stabilitāti strauji ritinot,
pārlūka joslas izmēra maiņu, navigāciju, galeriju, valodas un samazinātu kustību.
Nepieciešama Playwright instalācija ar Chromium vai WebKit:

```bash
PLAYWRIGHT_MODULE=/path/to/playwright node scripts/check-mobile.cjs chromium
PLAYWRIGHT_MODULE=/path/to/playwright node scripts/check-mobile.cjs webkit
```

Tests pats palaiž lokālu serveri ar MP4 baitu diapazonu atbalstu. Ekrānattēli tiek
saglabāti `/tmp/mobile-fixed-*.png`. Google Maps ārējais iframe testā tiek aizstāts
ar tukšu lapu; tā darbība jāpārbauda atsevišķi. Tests neaizstāj pārbaudi fiziskā iPhone.

Palaid lokālu serveri (3D sadaļas ES moduļiem vajadzīgs HTTP, nevis `file://`):

```bash
python3 -m http.server 8000
# atver http://localhost:8000
```

> Google kartes iframe nepieciešams interneta savienojums. Fonti tiek ielādēti no vietējiem failiem.

Mainot 3D modeļus vai dārzu, attēlus var pārģenerēt ar `node scripts/bake-years.cjs`.
Tikai dārza fonu, neskarot mašīnu kadrus, ģenerē ar `node scripts/bake-years.cjs --background-only`.
Parka dekorāciju atlantu ģenerē ar `node scripts/bake-journey.cjs`.
Pēc pirmā dārza ģeometrijas vai pieredzes sadaļas izkārtojuma izmaiņām tā sākuma
attēlus atjauno ar `node scripts/bake-opening.cjs http://localhost:8000`.
Šī komanda arī ievieto attēlus HTML. Tikai esošo attēlu ievietošanai izmanto
`node scripts/bake-opening.cjs --embed-only`.
Tam vajag Playwright, Chromium un lokālu serveri; lapas darbībai šīs izstrādes
atkarības nav vajadzīgas. Servera adresi norāda `YEARS_PREVIEW_URL` (noklusēti
`http://127.0.0.1:8010`), pārlūka ceļu — `CHROME_PATH`, ja tas atšķiras no
`/usr/bin/chromium`.

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

- Gaiša lapa neatkarīgi no ierīces izskata iestatījuma. Silts balts pamats,
  maigs dārza zaļais un akcents, kas atsaucas uz elektromobiļu sarkanajiem jumtiņiem.
- Ievadā saglabāts lielais fona video ar tekstu virs tā: tumšāks pārklājums, zeltains
  ievadteksts, cenas zīme un ritināšanas norāde kā publicētajā lapā. Galvene paliek
  vienlaidu virs video, tāpēc valodu poga un mūzikas poga nemainās. Pieredzes sadaļā
  pārklājošas fotogrāfijas un citāts. Brauciena kartei ir perforācijas līnija.
- Fonti: Playfair Display (virsraksti un esošā zīmola zīme) + Manrope (teksts),
  glabāti lokāli ar `font-display: swap`.
- Visas 14 valodas izvietotas divās kolonnās arī telefonā. Ritinot kartītes
  secīgi savienojas no abām pusēm kā rāvējslēdzējs tieši aiz piekabes.
  Ja brauciena aina nav pieejama, paliek CSS view timeline vai
  IntersectionObserver animācija; samazinātas kustības režīmā kartītes ir statiskas.
  Karodziņiem izmantotas mazas WebP kopijas; sākotnējie SVG ir saglabāti.
- Pakāpeniska satura parādīšanās, fotogrāfiju kustība ritinot un pogu detaļas.
  Samazinātas kustības režīmā saturs paliek statisks un pilnībā redzams.
- Pārveidots ar `design-taste-frontend` vadlīnijām, saglabājot lapas saturu,
  sadaļu adreses, esošās fotogrāfijas un visus tulkojumus.
