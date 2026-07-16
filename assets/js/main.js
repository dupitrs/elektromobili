/* =====================================================================
   Elektromobilis Rundālē — interactions
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- i18n: 14 languages ---------- */
  // Switcher order matches the tour's commentary list. `flag` is the SVG
  // basename under assets/img/flags/. LV is the source text held in the HTML
  // (captured below as data-lv); the other 13 come from DICT.
  var LANGS = [
    { code: "lv", label: "LV", native: "Latviski", flag: "lv" },
    { code: "et", label: "ET", native: "Eesti",    flag: "ee" },
    { code: "en", label: "EN", native: "English",  flag: "gb" },
    { code: "es", label: "ES", native: "Espa\u00f1ol",  flag: "es" },
    { code: "lt", label: "LT", native: "Lietuvi\u0173", flag: "lt" },
    { code: "fr", label: "FR", native: "Fran\u00e7ais", flag: "fr" },
    { code: "it", label: "IT", native: "Italiano", flag: "it" },
    { code: "ko", label: "KO", native: "\ud55c\uad6d\uc5b4", flag: "kr" },
    { code: "de", label: "DE", native: "Deutsch",  flag: "de" },
    { code: "ja", label: "JA", native: "\u65e5\u672c\u8a9e", flag: "jp" },
    { code: "el", label: "EL", native: "\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac", flag: "gr" },
    { code: "fi", label: "FI", native: "Suomi",    flag: "fi" },
    { code: "ru", label: "RU", native: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439", flag: "ru" },
    { code: "pl", label: "PL", native: "Polski",   flag: "pl" }
  ];

  var DICT = {
    "en": {
          "a11y.skip": "Skip to content",
          "nav.experience": "Experience",
          "nav.included": "Included",
          "nav.languages": "Languages",
          "nav.gallery": "Gallery",
          "nav.visit": "Visit",
          "nav.contact": "Contact",
          "hero.eyebrow": "May – October · Rundāle Palace Garden",
          "hero.title": "Aristocratic leisure in the Rundāle Palace garden",
          "hero.sub": "Every year we invite you to enjoy an approximately 20-minute ride through the most beautiful places of the French garden, with commentary in 14 languages.",
          "hero.priceUnit": "/ per person",
          "exp.eyebrow": "The experience",
          "exp.title": "A moment of royal serenity",
          "exp.p1": "Every year from May to October we invite you to enjoy aristocratic leisure in the Rundāle Palace garden, where a historic landscape meets beauty and silence.",
          "exp.p2": "Allow yourself a moment of royal serenity. Watch the garden's splendour and listen to stories of the garden and its history. We are here to make your visit to Rundāle special.",
          "exp.quote": "“Where history meets silence.”",
          "years.label": "years' experience",
          "offer.eyebrow": "In the offer",
          "offer.title": "Everything for an unhurried outing",
          "offer.lead": "A quiet, exclusive ride through Rundāle Palace's French garden. The tour starts and ends at the garden entrance.",
          "offer.i1t": "The finest garden spots",
          "offer.i1d": "A ride through Rundāle Palace's French garden.",
          "offer.i2t": "Commentary in 14 languages",
          "offer.i2d": "A tour almost everyone can understand. Clear narration for every guest.",
          "offer.i3t": "Royal serenity",
          "offer.i3d": "A calm outing, perfectly suited to couples, families and every guest.",
          "ticket.label": "Tour pass",
          "ticket.priceUnit": "per person",
          "ticket.r1l": "Duration",
          "ticket.r2l": "Languages",
          "ticket.r3l": "Hours",
          "ticket.r4l": "Start",
          "ticket.r4v": "at the garden entrance",
          "ticket.cta": "Get in touch",
          "lang.eyebrow": "14 languages",
          "lang.title": "Commentary in 14 languages",
          "lang.sub": "A tour almost everyone can understand, no matter which corner of the world you've come from.",
          "gallery.eyebrow": "Gallery",
          "gallery.title": "Moments from the garden",
          "visit.eyebrow": "Visit",
          "visit.title": "Plan your ride",
          "visit.season": "Season",
          "visit.seasonV": "From May to October",
          "visit.hours": "Opening hours",
          "visit.hoursV": "Every day 11:00–17:00",
          "visit.price": "Price",
          "visit.priceV": "€5 per person",
          "visit.duration": "Duration",
          "visit.durationV": "About 20 minutes",
          "visit.place": "Place",
          "visit.placeV": "Rundāle Palace garden and surroundings",
          "visit.start": "Start and finish",
          "visit.startV": "At the garden entrance",
          "visit.rainTitle": "In rainy weather",
          "visit.rainText": "Tours are not held in rainy weather. We recommend keeping an eye on the forecast.",
          "contact.eyebrow": "Contact",
          "contact.title": "See you in the Rundāle Palace garden!",
          "contact.callLabel": "Phone",
          "contact.waLabel": "WhatsApp",
          "contact.emailLabel": "Email",
          "contact.addressLabel": "Address",
          "contact.ctaCall": "Call",
          "contact.ctaEmail": "Write an email",
          "contact.mapLink": "Open in Google Maps →",
          "footer.tagline": "Aristocratic leisure in the Rundāle Palace garden by electric car.",
          "footer.credit": "Developed by",
          "lang.lv1": "Latvian",
          "lang.lv2": "Estonian",
          "lang.lv3": "English",
          "lang.lv4": "Spanish",
          "lang.lv5": "Lithuanian",
          "lang.lv6": "French",
          "lang.lv7": "Italian",
          "lang.lv8": "Korean",
          "lang.lv9": "German",
          "lang.lv10": "Japanese",
          "lang.lv11": "Greek",
          "lang.lv12": "Finnish",
          "lang.lv13": "Russian",
          "lang.lv14": "Polish"
    },
    "et": {
          "a11y.skip": "Liigu sisu juurde",
          "nav.experience": "Elamus",
          "nav.included": "Sisaldub",
          "nav.languages": "Keeled",
          "nav.gallery": "Galerii",
          "nav.visit": "Külasta",
          "nav.contact": "Kontakt",
          "hero.eyebrow": "Mai – oktoober · Rundāle lossi aed",
          "hero.title": "Aristokraatlik puhkus Rundāle lossi aias",
          "hero.sub": "Igal aastal kutsume teid nautima ligikaudu 20-minutilist sõitu läbi prantsuse aia kauneimate paikade, kommentaaridega 14 keeles.",
          "hero.priceUnit": "/ inimese kohta",
          "exp.eyebrow": "Elamus",
          "exp.title": "Hetk kuninglikku rahu",
          "exp.p1": "Igal aastal maist oktoobrini kutsume teid nautima aristokraatlikku puhkust Rundāle lossi aias, kus ajalooline maastik kohtub ilu ja vaikusega.",
          "exp.p2": "Lubage endale hetk kuninglikku rahu. Imetlege aia hiilgust ja kuulake lugusid aiast ja selle ajaloost. Oleme siin selleks, et muuta teie külaskäik Rundālesse eriliseks.",
          "exp.quote": "“Kus ajalugu kohtub vaikusega.”",
          "years.label": "aastat kogemust",
          "offer.eyebrow": "Pakkumises",
          "offer.title": "Kõik kiirustamata väljasõiduks",
          "offer.lead": "Vaikne ja eksklusiivne sõit läbi Rundāle lossi prantsuse aia. Ekskursioon algab ja lõpeb aia sissepääsu juures.",
          "offer.i1t": "Aia kauneimad paigad",
          "offer.i1d": "Sõit läbi Rundāle lossi prantsuse aia.",
          "offer.i2t": "Kommentaarid 14 keeles",
          "offer.i2d": "Ekskursioon, mida saab mõista peaaegu igaüks. Selge jutustus igale külalisele.",
          "offer.i3t": "Kuninglik rahu",
          "offer.i3d": "Rahulik väljasõit, mis sobib ideaalselt paaridele, peredele ja igale külalisele.",
          "ticket.label": "Ekskursioonipilet",
          "ticket.priceUnit": "inimese kohta",
          "ticket.r1l": "Kestus",
          "ticket.r2l": "Keeled",
          "ticket.r3l": "Kellaajad",
          "ticket.r4l": "Algus",
          "ticket.r4v": "aia sissepääsu juures",
          "ticket.cta": "Võta ühendust",
          "lang.eyebrow": "14 keelt",
          "lang.title": "Kommentaarid 14 keeles",
          "lang.sub": "Ekskursioon, mida saab mõista peaaegu igaüks, ükskõik millisest maailma nurgast te ka ei tuleks.",
          "gallery.eyebrow": "Galerii",
          "gallery.title": "Hetked aiast",
          "visit.eyebrow": "Külasta",
          "visit.title": "Planeeri oma sõit",
          "visit.season": "Hooaeg",
          "visit.seasonV": "Maist oktoobrini",
          "visit.hours": "Lahtiolekuajad",
          "visit.hoursV": "Iga päev 11:00–17:00",
          "visit.price": "Hind",
          "visit.priceV": "€5 inimese kohta",
          "visit.duration": "Kestus",
          "visit.durationV": "Umbes 20 minutit",
          "visit.place": "Koht",
          "visit.placeV": "Rundāle lossi aed ja selle ümbrus",
          "visit.start": "Algus ja lõpp",
          "visit.startV": "Aia sissepääsu juures",
          "visit.rainTitle": "Vihmase ilmaga",
          "visit.rainText": "Vihmase ilmaga ekskursioone ei toimu. Soovitame jälgida ilmateadet.",
          "contact.eyebrow": "Kontakt",
          "contact.title": "Kohtumiseni Rundāle lossi aias!",
          "contact.callLabel": "Telefon",
          "contact.waLabel": "WhatsApp",
          "contact.emailLabel": "E-post",
          "contact.addressLabel": "Aadress",
          "contact.ctaCall": "Helista",
          "contact.ctaEmail": "Kirjuta e-kiri",
          "contact.mapLink": "Ava Google Mapsis →",
          "footer.tagline": "Aristokraatlik puhkus Rundāle lossi aias elektriautoga.",
          "footer.credit": "Arendas",
          "lang.lv1": "läti keel",
          "lang.lv2": "eesti keel",
          "lang.lv3": "inglise keel",
          "lang.lv4": "hispaania keel",
          "lang.lv5": "leedu keel",
          "lang.lv6": "prantsuse keel",
          "lang.lv7": "itaalia keel",
          "lang.lv8": "korea keel",
          "lang.lv9": "saksa keel",
          "lang.lv10": "jaapani keel",
          "lang.lv11": "kreeka keel",
          "lang.lv12": "soome keel",
          "lang.lv13": "vene keel",
          "lang.lv14": "poola keel"
    },
    "es": {
          "a11y.skip": "Saltar al contenido",
          "nav.experience": "Experiencia",
          "nav.included": "Incluido",
          "nav.languages": "Idiomas",
          "nav.gallery": "Galería",
          "nav.visit": "Visita",
          "nav.contact": "Contacto",
          "hero.eyebrow": "Mayo – Octubre · Jardín del Palacio de Rundāle",
          "hero.title": "Ocio aristocrático en el jardín del Palacio de Rundāle",
          "hero.sub": "Cada año te invitamos a disfrutar de un paseo de unos 20 minutos por los rincones más bellos del jardín francés, con comentarios en 14 idiomas.",
          "hero.priceUnit": "/ por persona",
          "exp.eyebrow": "La experiencia",
          "exp.title": "Un instante de serenidad real",
          "exp.p1": "Cada año, de mayo a octubre, te invitamos a disfrutar del ocio aristocrático en el jardín del Palacio de Rundāle, donde un paisaje histórico se encuentra con la belleza y el silencio.",
          "exp.p2": "Concédete un instante de serenidad real. Contempla el esplendor del jardín y escucha las historias del jardín y su pasado. Estamos aquí para hacer que tu visita a Rundāle sea especial.",
          "exp.quote": "“Donde la historia se encuentra con el silencio.”",
          "years.label": "años de experiencia",
          "offer.eyebrow": "En la oferta",
          "offer.title": "Todo para una salida sin prisas",
          "offer.lead": "Un paseo tranquilo y exclusivo por el jardín francés del Palacio de Rundāle. El recorrido comienza y termina en la entrada del jardín.",
          "offer.i1t": "Los rincones más bellos del jardín",
          "offer.i1d": "Un paseo por el jardín francés del Palacio de Rundāle.",
          "offer.i2t": "Comentarios en 14 idiomas",
          "offer.i2d": "Un recorrido que casi todos pueden entender. Una narración clara para cada visitante.",
          "offer.i3t": "Serenidad real",
          "offer.i3d": "Una salida tranquila, perfecta para parejas, familias y todo tipo de visitantes.",
          "ticket.label": "Pase del recorrido",
          "ticket.priceUnit": "por persona",
          "ticket.r1l": "Duración",
          "ticket.r2l": "Idiomas",
          "ticket.r3l": "Horario",
          "ticket.r4l": "Inicio",
          "ticket.r4v": "en la entrada del jardín",
          "ticket.cta": "Ponte en contacto",
          "lang.eyebrow": "14 idiomas",
          "lang.title": "Comentarios en 14 idiomas",
          "lang.sub": "Un recorrido que casi todos pueden entender, sin importar de qué rincón del mundo vengas.",
          "gallery.eyebrow": "Galería",
          "gallery.title": "Momentos del jardín",
          "visit.eyebrow": "Visita",
          "visit.title": "Planifica tu paseo",
          "visit.season": "Temporada",
          "visit.seasonV": "De mayo a octubre",
          "visit.hours": "Horario de apertura",
          "visit.hoursV": "Todos los días de 11:00–17:00",
          "visit.price": "Precio",
          "visit.priceV": "5 € por persona",
          "visit.duration": "Duración",
          "visit.durationV": "Unos 20 minutos",
          "visit.place": "Lugar",
          "visit.placeV": "Jardín del Palacio de Rundāle y alrededores",
          "visit.start": "Inicio y fin",
          "visit.startV": "En la entrada del jardín",
          "visit.rainTitle": "Con lluvia",
          "visit.rainText": "Los recorridos no se realizan con lluvia. Recomendamos estar atentos al pronóstico del tiempo.",
          "contact.eyebrow": "Contacto",
          "contact.title": "¡Nos vemos en el jardín del Palacio de Rundāle!",
          "contact.callLabel": "Teléfono",
          "contact.waLabel": "WhatsApp",
          "contact.emailLabel": "Correo electrónico",
          "contact.addressLabel": "Dirección",
          "contact.ctaCall": "Llamar",
          "contact.ctaEmail": "Escribir un correo",
          "contact.mapLink": "Abrir en Google Maps →",
          "footer.tagline": "Ocio aristocrático en coche eléctrico por el jardín del Palacio de Rundāle.",
          "footer.credit": "Desarrollado por",
          "lang.lv1": "Letón",
          "lang.lv2": "Estonio",
          "lang.lv3": "Inglés",
          "lang.lv4": "Español",
          "lang.lv5": "Lituano",
          "lang.lv6": "Francés",
          "lang.lv7": "Italiano",
          "lang.lv8": "Coreano",
          "lang.lv9": "Alemán",
          "lang.lv10": "Japonés",
          "lang.lv11": "Griego",
          "lang.lv12": "Finés",
          "lang.lv13": "Ruso",
          "lang.lv14": "Polaco"
    },
    "lt": {
          "a11y.skip": "Pereiti prie turinio",
          "nav.experience": "Patirtis",
          "nav.included": "Kas įskaičiuota",
          "nav.languages": "Kalbos",
          "nav.gallery": "Galerija",
          "nav.visit": "Apsilankymas",
          "nav.contact": "Kontaktai",
          "hero.eyebrow": "Gegužė – spalis · Rundāle rūmų sodas",
          "hero.title": "Aristokratiškas poilsis Rundāle rūmų sode",
          "hero.sub": "Kasmet kviečiame mėgautis maždaug 20 minučių pasivažinėjimu po gražiausius prancūziško sodo kampelius su gidu 14 kalbų.",
          "hero.priceUnit": "/ vienam asmeniui",
          "exp.eyebrow": "Patirtis",
          "exp.title": "Karališkos ramybės akimirka",
          "exp.p1": "Kasmet nuo gegužės iki spalio kviečiame pasimėgauti aristokratišku poilsiu Rundāle rūmų sode, kur istorinis kraštovaizdis susitinka su grožiu ir tyla.",
          "exp.p2": "Leiskite sau karališkos ramybės akimirką. Grožėkitės sodo didybe ir klausykitės pasakojimų apie sodą bei jo istoriją. Esame čia tam, kad jūsų apsilankymas Rundāle taptų ypatingas.",
          "exp.quote": "„Kur istorija susitinka su tyla.“",
          "years.label": "metų patirtis",
          "offer.eyebrow": "Pasiūlyme",
          "offer.title": "Viskas neskubiam pasivažinėjimui",
          "offer.lead": "Ramus, išskirtinis pasivažinėjimas po Rundāle rūmų prancūzišką sodą. Ekskursija prasideda ir baigiasi prie sodo įėjimo.",
          "offer.i1t": "Gražiausi sodo kampeliai",
          "offer.i1d": "Pasivažinėjimas po Rundāle rūmų prancūzišką sodą.",
          "offer.i2t": "Pasakojimas 14 kalbų",
          "offer.i2d": "Ekskursija, kurią supras beveik kiekvienas. Aiškus pasakojimas kiekvienam svečiui.",
          "offer.i3t": "Karališka ramybė",
          "offer.i3d": "Ramus pasivažinėjimas, puikiai tinkantis poroms, šeimoms ir kiekvienam svečiui.",
          "ticket.label": "Ekskursijos bilietas",
          "ticket.priceUnit": "vienam asmeniui",
          "ticket.r1l": "Trukmė",
          "ticket.r2l": "Kalbos",
          "ticket.r3l": "Darbo laikas",
          "ticket.r4l": "Pradžia",
          "ticket.r4v": "prie sodo įėjimo",
          "ticket.cta": "Susisiekite",
          "lang.eyebrow": "14 kalbų",
          "lang.title": "Pasakojimas 14 kalbų",
          "lang.sub": "Ekskursija, kurią supras beveik kiekvienas, nesvarbu, iš kurio pasaulio kampelio atvykote.",
          "gallery.eyebrow": "Galerija",
          "gallery.title": "Akimirkos iš sodo",
          "visit.eyebrow": "Apsilankymas",
          "visit.title": "Suplanuokite savo pasivažinėjimą",
          "visit.season": "Sezonas",
          "visit.seasonV": "Nuo gegužės iki spalio",
          "visit.hours": "Darbo laikas",
          "visit.hoursV": "Kasdien 11:00–17:00",
          "visit.price": "Kaina",
          "visit.priceV": "€5 vienam asmeniui",
          "visit.duration": "Trukmė",
          "visit.durationV": "Apie 20 minučių",
          "visit.place": "Vieta",
          "visit.placeV": "Rundāle rūmų sodas ir jo apylinkės",
          "visit.start": "Pradžia ir pabaiga",
          "visit.startV": "Prie sodo įėjimo",
          "visit.rainTitle": "Lietingu oru",
          "visit.rainText": "Lietingu oru ekskursijos nevyksta. Rekomenduojame sekti orų prognozę.",
          "contact.eyebrow": "Kontaktai",
          "contact.title": "Iki pasimatymo Rundāle rūmų sode!",
          "contact.callLabel": "Telefonas",
          "contact.waLabel": "WhatsApp",
          "contact.emailLabel": "El. paštas",
          "contact.addressLabel": "Adresas",
          "contact.ctaCall": "Skambinti",
          "contact.ctaEmail": "Parašyti el. laišką",
          "contact.mapLink": "Atverti „Google Maps“ →",
          "footer.tagline": "Aristokratiškas poilsis Rundāle rūmų sode elektromobiliu.",
          "footer.credit": "Sukūrė",
          "lang.lv1": "Latvių",
          "lang.lv2": "Estų",
          "lang.lv3": "Anglų",
          "lang.lv4": "Ispanų",
          "lang.lv5": "Lietuvių",
          "lang.lv6": "Prancūzų",
          "lang.lv7": "Italų",
          "lang.lv8": "Korėjiečių",
          "lang.lv9": "Vokiečių",
          "lang.lv10": "Japonų",
          "lang.lv11": "Graikų",
          "lang.lv12": "Suomių",
          "lang.lv13": "Rusų",
          "lang.lv14": "Lenkų"
    },
    "fr": {
          "a11y.skip": "Aller au contenu",
          "nav.experience": "L'expérience",
          "nav.included": "Inclus",
          "nav.languages": "Langues",
          "nav.gallery": "Galerie",
          "nav.visit": "Visite",
          "nav.contact": "Contact",
          "hero.eyebrow": "Mai – octobre · Jardin du château de Rundāle",
          "hero.title": "Loisir aristocratique dans le jardin du château de Rundāle",
          "hero.sub": "Chaque année, nous vous invitons à profiter d'une promenade d'environ 20 minutes à travers les plus beaux endroits du jardin à la française, avec des commentaires en 14 langues.",
          "hero.priceUnit": "/ par personne",
          "exp.eyebrow": "L'expérience",
          "exp.title": "Un instant de sérénité royale",
          "exp.p1": "Chaque année, de mai à octobre, nous vous invitons à savourer un loisir aristocratique dans le jardin du château de Rundāle, où un paysage historique se marie à la beauté et au silence.",
          "exp.p2": "Offrez-vous un instant de sérénité royale. Admirez la splendeur du jardin et laissez-vous conter son histoire. Nous sommes là pour rendre votre visite à Rundāle inoubliable.",
          "exp.quote": "“Là où l'histoire rencontre le silence.”",
          "years.label": "ans d'expérience",
          "offer.eyebrow": "Dans l'offre",
          "offer.title": "Tout pour une sortie sans hâte",
          "offer.lead": "Une promenade paisible et exclusive à travers le jardin à la française du château de Rundāle. La visite commence et se termine à l'entrée du jardin.",
          "offer.i1t": "Les plus beaux coins du jardin",
          "offer.i1d": "Une promenade à travers le jardin à la française du château de Rundāle.",
          "offer.i2t": "Commentaires en 14 langues",
          "offer.i2d": "Une visite que presque tout le monde peut comprendre. Un récit clair pour chaque invité.",
          "offer.i3t": "Sérénité royale",
          "offer.i3d": "Une sortie tout en douceur, parfaitement adaptée aux couples, aux familles et à chaque visiteur.",
          "ticket.label": "Billet de visite",
          "ticket.priceUnit": "par personne",
          "ticket.r1l": "Durée",
          "ticket.r2l": "Langues",
          "ticket.r3l": "Horaires",
          "ticket.r4l": "Départ",
          "ticket.r4v": "à l'entrée du jardin",
          "ticket.cta": "Prendre contact",
          "lang.eyebrow": "14 langues",
          "lang.title": "Commentaires en 14 langues",
          "lang.sub": "Une visite que presque tout le monde peut comprendre, d'où que vous veniez dans le monde.",
          "gallery.eyebrow": "Galerie",
          "gallery.title": "Instants du jardin",
          "visit.eyebrow": "Visite",
          "visit.title": "Planifiez votre promenade",
          "visit.season": "Saison",
          "visit.seasonV": "De mai à octobre",
          "visit.hours": "Heures d'ouverture",
          "visit.hoursV": "Tous les jours 11:00–17:00",
          "visit.price": "Prix",
          "visit.priceV": "5 € par personne",
          "visit.duration": "Durée",
          "visit.durationV": "Environ 20 minutes",
          "visit.place": "Lieu",
          "visit.placeV": "Le jardin du château de Rundāle et ses environs",
          "visit.start": "Départ et arrivée",
          "visit.startV": "À l'entrée du jardin",
          "visit.rainTitle": "Par temps de pluie",
          "visit.rainText": "Les visites n'ont pas lieu par temps de pluie. Nous vous recommandons de surveiller les prévisions météo.",
          "contact.eyebrow": "Contact",
          "contact.title": "Rendez-vous dans le jardin du château de Rundāle !",
          "contact.callLabel": "Téléphone",
          "contact.waLabel": "WhatsApp",
          "contact.emailLabel": "E-mail",
          "contact.addressLabel": "Adresse",
          "contact.ctaCall": "Appeler",
          "contact.ctaEmail": "Envoyer un e-mail",
          "contact.mapLink": "Ouvrir dans Google Maps →",
          "footer.tagline": "Loisir aristocratique en voiture électrique dans le jardin du château de Rundāle.",
          "footer.credit": "Développé par",
          "lang.lv1": "Letton",
          "lang.lv2": "Estonien",
          "lang.lv3": "Anglais",
          "lang.lv4": "Espagnol",
          "lang.lv5": "Lituanien",
          "lang.lv6": "Français",
          "lang.lv7": "Italien",
          "lang.lv8": "Coréen",
          "lang.lv9": "Allemand",
          "lang.lv10": "Japonais",
          "lang.lv11": "Grec",
          "lang.lv12": "Finnois",
          "lang.lv13": "Russe",
          "lang.lv14": "Polonais"
    },
    "it": {
          "a11y.skip": "Vai al contenuto",
          "nav.experience": "Esperienza",
          "nav.included": "Incluso",
          "nav.languages": "Lingue",
          "nav.gallery": "Galleria",
          "nav.visit": "Visita",
          "nav.contact": "Contatti",
          "hero.eyebrow": "Maggio – Ottobre · Giardino del Palazzo di Rundāle",
          "hero.title": "Ozio aristocratico nel giardino del Palazzo di Rundāle",
          "hero.sub": "Ogni anno vi invitiamo a godervi un giro di circa 20 minuti tra gli angoli più belli del giardino alla francese, con commento in 14 lingue.",
          "hero.priceUnit": "/ a persona",
          "exp.eyebrow": "L'esperienza",
          "exp.title": "Un momento di serenità regale",
          "exp.p1": "Ogni anno, da maggio a ottobre, vi invitiamo a concedervi un ozio aristocratico nel giardino del Palazzo di Rundāle, dove un paesaggio storico incontra la bellezza e il silenzio.",
          "exp.p2": "Concedetevi un momento di serenità regale. Ammirate lo splendore del giardino e ascoltate le storie del parco e della sua storia. Siamo qui per rendere speciale la vostra visita a Rundāle.",
          "exp.quote": "“Dove la storia incontra il silenzio.”",
          "years.label": "anni di esperienza",
          "offer.eyebrow": "Nell'offerta",
          "offer.title": "Tutto per una gita senza fretta",
          "offer.lead": "Un giro tranquillo ed esclusivo attraverso il giardino alla francese del Palazzo di Rundāle. Il tour parte e termina all'ingresso del giardino.",
          "offer.i1t": "Gli angoli più belli del giardino",
          "offer.i1d": "Un giro attraverso il giardino alla francese del Palazzo di Rundāle.",
          "offer.i2t": "Commento in 14 lingue",
          "offer.i2d": "Un tour che quasi tutti possono comprendere. Una narrazione chiara per ogni ospite.",
          "offer.i3t": "Serenità regale",
          "offer.i3d": "Una gita rilassante, perfetta per coppie, famiglie e ogni ospite.",
          "ticket.label": "Biglietto del tour",
          "ticket.priceUnit": "a persona",
          "ticket.r1l": "Durata",
          "ticket.r2l": "Lingue",
          "ticket.r3l": "Orari",
          "ticket.r4l": "Partenza",
          "ticket.r4v": "all'ingresso del giardino",
          "ticket.cta": "Contattaci",
          "lang.eyebrow": "14 lingue",
          "lang.title": "Commento in 14 lingue",
          "lang.sub": "Un tour che quasi tutti possono comprendere, da qualunque angolo del mondo proveniate.",
          "gallery.eyebrow": "Galleria",
          "gallery.title": "Momenti dal giardino",
          "visit.eyebrow": "Visita",
          "visit.title": "Pianifica il tuo giro",
          "visit.season": "Stagione",
          "visit.seasonV": "Da maggio a ottobre",
          "visit.hours": "Orari di apertura",
          "visit.hoursV": "Tutti i giorni 11:00–17:00",
          "visit.price": "Prezzo",
          "visit.priceV": "€5 a persona",
          "visit.duration": "Durata",
          "visit.durationV": "Circa 20 minuti",
          "visit.place": "Luogo",
          "visit.placeV": "Giardino del Palazzo di Rundāle e dintorni",
          "visit.start": "Partenza e arrivo",
          "visit.startV": "All'ingresso del giardino",
          "visit.rainTitle": "In caso di pioggia",
          "visit.rainText": "I tour non si svolgono in caso di pioggia. Vi consigliamo di tenere d'occhio le previsioni meteo.",
          "contact.eyebrow": "Contatti",
          "contact.title": "Ci vediamo nel giardino del Palazzo di Rundāle!",
          "contact.callLabel": "Telefono",
          "contact.waLabel": "WhatsApp",
          "contact.emailLabel": "Email",
          "contact.addressLabel": "Indirizzo",
          "contact.ctaCall": "Chiama",
          "contact.ctaEmail": "Scrivi un'email",
          "contact.mapLink": "Apri in Google Maps →",
          "footer.tagline": "Ozio aristocratico nel giardino del Palazzo di Rundāle in auto elettrica.",
          "footer.credit": "Sviluppato da",
          "lang.lv1": "Lettone",
          "lang.lv2": "Estone",
          "lang.lv3": "Inglese",
          "lang.lv4": "Spagnolo",
          "lang.lv5": "Lituano",
          "lang.lv6": "Francese",
          "lang.lv7": "Italiano",
          "lang.lv8": "Coreano",
          "lang.lv9": "Tedesco",
          "lang.lv10": "Giapponese",
          "lang.lv11": "Greco",
          "lang.lv12": "Finlandese",
          "lang.lv13": "Russo",
          "lang.lv14": "Polacco"
    },
    "ko": {
          "a11y.skip": "본문으로 건너뛰기",
          "nav.experience": "체험",
          "nav.included": "포함 사항",
          "nav.languages": "언어",
          "nav.gallery": "갤러리",
          "nav.visit": "방문 안내",
          "nav.contact": "문의",
          "hero.eyebrow": "5월 – 10월 · 룬달레 궁전 정원",
          "hero.title": "룬달레 궁전 정원에서 즐기는 귀족의 여유",
          "hero.sub": "해마다 여러분을 프랑스식 정원의 가장 아름다운 곳으로 안내하는 약 20분간의 드라이브에 초대합니다. 14개 언어로 해설이 제공됩니다.",
          "hero.priceUnit": "/ 1인당",
          "exp.eyebrow": "체험 소개",
          "exp.title": "왕가의 고요함이 깃든 순간",
          "exp.p1": "5월부터 10월까지, 해마다 여러분을 룬달레 궁전 정원에서 누리는 귀족의 여유로 초대합니다. 이곳에서는 유서 깊은 풍경이 아름다움과 고요함을 만납니다.",
          "exp.p2": "왕가의 고요함이 깃든 한때를 만끽하세요. 정원의 화려한 정취를 감상하며 정원과 그 역사에 얽힌 이야기에 귀 기울여 보세요. 저희는 여러분의 룬달레 방문을 특별하게 만들어 드리기 위해 이곳에 있습니다.",
          "exp.quote": "“역사가 고요함을 만나는 곳.”",
          "years.label": "년의 경험",
          "offer.eyebrow": "제공 내용",
          "offer.title": "여유로운 나들이를 위한 모든 것",
          "offer.lead": "룬달레 궁전의 프랑스식 정원을 조용하고 특별하게 둘러보는 드라이브. 투어는 정원 입구에서 시작해 정원 입구에서 마무리됩니다.",
          "offer.i1t": "정원에서 가장 아름다운 명소",
          "offer.i1d": "룬달레 궁전의 프랑스식 정원을 둘러보는 드라이브.",
          "offer.i2t": "14개 언어 해설",
          "offer.i2d": "누구나 편안하게 이해할 수 있는 투어. 모든 손님을 위한 또렷한 해설을 제공합니다.",
          "offer.i3t": "왕가의 고요함",
          "offer.i3d": "연인, 가족 등 모든 손님에게 잘 어울리는 차분한 나들이.",
          "ticket.label": "투어 이용권",
          "ticket.priceUnit": "1인당",
          "ticket.r1l": "소요 시간",
          "ticket.r2l": "언어",
          "ticket.r3l": "운영 시간",
          "ticket.r4l": "출발",
          "ticket.r4v": "정원 입구에서",
          "ticket.cta": "문의하기",
          "lang.eyebrow": "14개 언어",
          "lang.title": "14개 언어로 제공되는 해설",
          "lang.sub": "세계 어느 곳에서 오셨든, 거의 누구나 이해할 수 있는 투어입니다.",
          "gallery.eyebrow": "갤러리",
          "gallery.title": "정원에서의 순간들",
          "visit.eyebrow": "방문 안내",
          "visit.title": "드라이브 계획하기",
          "visit.season": "시즌",
          "visit.seasonV": "5월부터 10월까지",
          "visit.hours": "운영 시간",
          "visit.hoursV": "매일 11:00–17:00",
          "visit.price": "가격",
          "visit.priceV": "1인당 €5",
          "visit.duration": "소요 시간",
          "visit.durationV": "약 20분",
          "visit.place": "장소",
          "visit.placeV": "룬달레 궁전 정원 및 그 일대",
          "visit.start": "출발 및 도착",
          "visit.startV": "정원 입구에서",
          "visit.rainTitle": "우천 시",
          "visit.rainText": "비가 오는 날에는 투어가 진행되지 않습니다. 일기 예보를 미리 확인하시길 권장합니다.",
          "contact.eyebrow": "문의",
          "contact.title": "룬달레 궁전 정원에서 뵙겠습니다!",
          "contact.callLabel": "전화",
          "contact.waLabel": "WhatsApp",
          "contact.emailLabel": "이메일",
          "contact.addressLabel": "주소",
          "contact.ctaCall": "전화하기",
          "contact.ctaEmail": "이메일 보내기",
          "contact.mapLink": "Google 지도에서 열기 →",
          "footer.tagline": "전기차로 즐기는 룬달레 궁전 정원에서의 귀족적 여유.",
          "footer.credit": "제작",
          "lang.lv1": "라트비아어",
          "lang.lv2": "에스토니아어",
          "lang.lv3": "영어",
          "lang.lv4": "스페인어",
          "lang.lv5": "리투아니아어",
          "lang.lv6": "프랑스어",
          "lang.lv7": "이탈리아어",
          "lang.lv8": "한국어",
          "lang.lv9": "독일어",
          "lang.lv10": "일본어",
          "lang.lv11": "그리스어",
          "lang.lv12": "핀란드어",
          "lang.lv13": "러시아어",
          "lang.lv14": "폴란드어"
    },
    "de": {
          "a11y.skip": "Zum Inhalt springen",
          "nav.experience": "Erlebnis",
          "nav.included": "Inklusive",
          "nav.languages": "Sprachen",
          "nav.gallery": "Galerie",
          "nav.visit": "Besuch",
          "nav.contact": "Kontakt",
          "hero.eyebrow": "Mai – Oktober · Garten von Schloss Rundāle",
          "hero.title": "Aristokratische Muße im Garten von Schloss Rundāle",
          "hero.sub": "Jedes Jahr laden wir Sie zu einer etwa 20-minütigen Fahrt durch die schönsten Ecken des französischen Gartens ein – mit Erläuterungen in 14 Sprachen.",
          "hero.priceUnit": "/ pro Person",
          "exp.eyebrow": "Das Erlebnis",
          "exp.title": "Ein Moment königlicher Gelassenheit",
          "exp.p1": "Jedes Jahr von Mai bis Oktober laden wir Sie zu aristokratischer Muße im Garten von Schloss Rundāle ein, wo eine historische Landschaft auf Schönheit und Stille trifft.",
          "exp.p2": "Gönnen Sie sich einen Moment königlicher Gelassenheit. Bewundern Sie die Pracht des Gartens und lauschen Sie den Geschichten rund um den Garten und seine Vergangenheit. Wir sind hier, um Ihren Besuch in Rundāle zu etwas Besonderem zu machen.",
          "exp.quote": "„Wo Geschichte auf Stille trifft.“",
          "years.label": "Jahre Erfahrung",
          "offer.eyebrow": "Im Angebot",
          "offer.title": "Alles für einen entspannten Ausflug",
          "offer.lead": "Eine ruhige, exklusive Fahrt durch den französischen Garten von Schloss Rundāle. Die Tour beginnt und endet am Garteneingang.",
          "offer.i1t": "Die schönsten Ecken des Gartens",
          "offer.i1d": "Eine Fahrt durch den französischen Garten von Schloss Rundāle.",
          "offer.i2t": "Erläuterungen in 14 Sprachen",
          "offer.i2d": "Eine Tour, die fast jeder versteht. Verständliche Erzählungen für jeden Gast.",
          "offer.i3t": "Königliche Gelassenheit",
          "offer.i3d": "Ein ruhiger Ausflug, ideal für Paare, Familien und jeden Gast.",
          "ticket.label": "Tour-Ticket",
          "ticket.priceUnit": "pro Person",
          "ticket.r1l": "Dauer",
          "ticket.r2l": "Sprachen",
          "ticket.r3l": "Öffnungszeiten",
          "ticket.r4l": "Start",
          "ticket.r4v": "am Garteneingang",
          "ticket.cta": "Kontakt aufnehmen",
          "lang.eyebrow": "14 Sprachen",
          "lang.title": "Erläuterungen in 14 Sprachen",
          "lang.sub": "Eine Tour, die fast jeder versteht – egal aus welchem Winkel der Welt Sie kommen.",
          "gallery.eyebrow": "Galerie",
          "gallery.title": "Momente aus dem Garten",
          "visit.eyebrow": "Besuch",
          "visit.title": "Planen Sie Ihre Fahrt",
          "visit.season": "Saison",
          "visit.seasonV": "Von Mai bis Oktober",
          "visit.hours": "Öffnungszeiten",
          "visit.hoursV": "Täglich 11:00–17:00",
          "visit.price": "Preis",
          "visit.priceV": "€5 pro Person",
          "visit.duration": "Dauer",
          "visit.durationV": "Etwa 20 Minuten",
          "visit.place": "Ort",
          "visit.placeV": "Garten von Schloss Rundāle und Umgebung",
          "visit.start": "Start und Ziel",
          "visit.startV": "Am Garteneingang",
          "visit.rainTitle": "Bei Regenwetter",
          "visit.rainText": "Bei Regenwetter finden keine Touren statt. Wir empfehlen, die Wettervorhersage im Auge zu behalten.",
          "contact.eyebrow": "Kontakt",
          "contact.title": "Wir sehen uns im Garten von Schloss Rundāle!",
          "contact.callLabel": "Telefon",
          "contact.waLabel": "WhatsApp",
          "contact.emailLabel": "E-Mail",
          "contact.addressLabel": "Adresse",
          "contact.ctaCall": "Anrufen",
          "contact.ctaEmail": "E-Mail schreiben",
          "contact.mapLink": "In Google Maps öffnen →",
          "footer.tagline": "Aristokratische Muße im Garten von Schloss Rundāle mit dem Elektroauto.",
          "footer.credit": "Entwickelt von",
          "lang.lv1": "Lettisch",
          "lang.lv2": "Estnisch",
          "lang.lv3": "Englisch",
          "lang.lv4": "Spanisch",
          "lang.lv5": "Litauisch",
          "lang.lv6": "Französisch",
          "lang.lv7": "Italienisch",
          "lang.lv8": "Koreanisch",
          "lang.lv9": "Deutsch",
          "lang.lv10": "Japanisch",
          "lang.lv11": "Griechisch",
          "lang.lv12": "Finnisch",
          "lang.lv13": "Russisch",
          "lang.lv14": "Polnisch"
    },
    "ja": {
          "a11y.skip": "本文へスキップ",
          "nav.experience": "体験",
          "nav.included": "含まれるもの",
          "nav.languages": "対応言語",
          "nav.gallery": "ギャラリー",
          "nav.visit": "訪問案内",
          "nav.contact": "お問い合わせ",
          "hero.eyebrow": "5月～10月 · ルンダーレ宮殿庭園",
          "hero.title": "ルンダーレ宮殿の庭園で味わう、貴族のようなひととき",
          "hero.sub": "毎年、フランス式庭園のもっとも美しい場所を約20分かけてめぐる乗車をご案内しています。ガイドは14の言語でお楽しみいただけます。",
          "hero.priceUnit": "／お一人様",
          "exp.eyebrow": "体験について",
          "exp.title": "王侯のような静けさに包まれる時間",
          "exp.p1": "毎年5月から10月まで、ルンダーレ宮殿の庭園で貴族のようなひとときをお過ごしいただけます。歴史ある景観が、美しさと静寂とともに広がります。",
          "exp.p2": "王侯のような穏やかなひとときに身をゆだねてください。庭園の華やかな景色を眺め、庭とその歴史にまつわる物語に耳を傾けましょう。私たちは、ルンダーレでのご訪問を特別なものにするためにここにいます。",
          "exp.quote": "“歴史が静寂と出会う場所。”",
          "years.label": "年の経験",
          "offer.eyebrow": "ご提供内容",
          "offer.title": "ゆったりとしたお出かけに必要なすべて",
          "offer.lead": "ルンダーレ宮殿のフランス式庭園を、静かに、ぜいたくにめぐる乗車です。ツアーは庭園の入口から始まり、同じ場所で終わります。",
          "offer.i1t": "庭園のもっとも美しいスポット",
          "offer.i1d": "ルンダーレ宮殿のフランス式庭園をめぐる乗車。",
          "offer.i2t": "14言語によるガイド",
          "offer.i2d": "ほとんどどなたにもお楽しみいただけるツアー。すべてのお客様に分かりやすいご案内をお届けします。",
          "offer.i3t": "王侯のような静けさ",
          "offer.i3d": "落ち着いたお出かけで、カップルにもご家族にも、どんなお客様にもぴったりです。",
          "ticket.label": "ツアーパス",
          "ticket.priceUnit": "お一人様",
          "ticket.r1l": "所要時間",
          "ticket.r2l": "言語",
          "ticket.r3l": "営業時間",
          "ticket.r4l": "出発",
          "ticket.r4v": "庭園の入口にて",
          "ticket.cta": "お問い合わせ",
          "lang.eyebrow": "14の言語",
          "lang.title": "14言語によるガイド",
          "lang.sub": "世界のどの地域からお越しの方でも、ほとんどどなたにもお楽しみいただけるツアーです。",
          "gallery.eyebrow": "ギャラリー",
          "gallery.title": "庭園でのひととき",
          "visit.eyebrow": "訪問案内",
          "visit.title": "乗車の計画を立てる",
          "visit.season": "シーズン",
          "visit.seasonV": "5月から10月まで",
          "visit.hours": "営業時間",
          "visit.hoursV": "毎日 11:00–17:00",
          "visit.price": "料金",
          "visit.priceV": "お一人様 €5",
          "visit.duration": "所要時間",
          "visit.durationV": "約20分",
          "visit.place": "場所",
          "visit.placeV": "ルンダーレ宮殿の庭園とその周辺",
          "visit.start": "出発と到着",
          "visit.startV": "庭園の入口にて",
          "visit.rainTitle": "雨天の場合",
          "visit.rainText": "雨天の際はツアーを実施いたしません。天気予報をご確認いただくことをおすすめします。",
          "contact.eyebrow": "お問い合わせ",
          "contact.title": "ルンダーレ宮殿の庭園でお会いしましょう！",
          "contact.callLabel": "電話",
          "contact.waLabel": "WhatsApp",
          "contact.emailLabel": "メール",
          "contact.addressLabel": "住所",
          "contact.ctaCall": "電話する",
          "contact.ctaEmail": "メールを送る",
          "contact.mapLink": "Google マップで開く →",
          "footer.tagline": "電気自動車でめぐる、ルンダーレ宮殿庭園での貴族のようなひととき。",
          "footer.credit": "制作",
          "lang.lv1": "ラトビア語",
          "lang.lv2": "エストニア語",
          "lang.lv3": "英語",
          "lang.lv4": "スペイン語",
          "lang.lv5": "リトアニア語",
          "lang.lv6": "フランス語",
          "lang.lv7": "イタリア語",
          "lang.lv8": "韓国語",
          "lang.lv9": "ドイツ語",
          "lang.lv10": "日本語",
          "lang.lv11": "ギリシャ語",
          "lang.lv12": "フィンランド語",
          "lang.lv13": "ロシア語",
          "lang.lv14": "ポーランド語"
    },
    "el": {
          "a11y.skip": "Μετάβαση στο περιεχόμενο",
          "nav.experience": "Εμπειρία",
          "nav.included": "Τι περιλαμβάνεται",
          "nav.languages": "Γλώσσες",
          "nav.gallery": "Συλλογή",
          "nav.visit": "Επίσκεψη",
          "nav.contact": "Επικοινωνία",
          "hero.eyebrow": "Μάιος – Οκτώβριος · Κήπος του Ανακτόρου Rundāle",
          "hero.title": "Αριστοκρατική αναψυχή στον κήπο του Ανακτόρου Rundāle",
          "hero.sub": "Κάθε χρόνο σας προσκαλούμε να απολαύσετε μια βόλτα περίπου 20 λεπτών στα ομορφότερα σημεία του γαλλικού κήπου, με ξενάγηση σε 14 γλώσσες.",
          "hero.priceUnit": "/ ανά άτομο",
          "exp.eyebrow": "Η εμπειρία",
          "exp.title": "Μια στιγμή βασιλικής γαλήνης",
          "exp.p1": "Κάθε χρόνο, από τον Μάιο έως τον Οκτώβριο, σας προσκαλούμε να απολαύσετε την αριστοκρατική αναψυχή στον κήπο του Ανακτόρου Rundāle, εκεί όπου ένα ιστορικό τοπίο συναντά την ομορφιά και τη σιωπή.",
          "exp.p2": "Χαρίστε στον εαυτό σας μια στιγμή βασιλικής γαλήνης. Θαυμάστε τη μεγαλοπρέπεια του κήπου και ακούστε ιστορίες για τον κήπο και το παρελθόν του. Είμαστε εδώ για να κάνουμε την επίσκεψή σας στο Rundāle ξεχωριστή.",
          "exp.quote": "“Εκεί όπου η ιστορία συναντά τη σιωπή.”",
          "years.label": "χρόνια εμπειρίας",
          "offer.eyebrow": "Στην προσφορά",
          "offer.title": "Όλα για μια ξεκούραστη εκδρομή",
          "offer.lead": "Μια ήσυχη, αποκλειστική βόλτα στον γαλλικό κήπο του Ανακτόρου Rundāle. Η ξενάγηση ξεκινά και ολοκληρώνεται στην είσοδο του κήπου.",
          "offer.i1t": "Τα ωραιότερα σημεία του κήπου",
          "offer.i1d": "Μια βόλτα στον γαλλικό κήπο του Ανακτόρου Rundāle.",
          "offer.i2t": "Ξενάγηση σε 14 γλώσσες",
          "offer.i2d": "Μια ξενάγηση που μπορούν να κατανοήσουν σχεδόν όλοι. Καθαρή αφήγηση για κάθε επισκέπτη.",
          "offer.i3t": "Βασιλική γαλήνη",
          "offer.i3d": "Μια ήρεμη εκδρομή, ιδανική για ζευγάρια, οικογένειες και κάθε επισκέπτη.",
          "ticket.label": "Εισιτήριο ξενάγησης",
          "ticket.priceUnit": "ανά άτομο",
          "ticket.r1l": "Διάρκεια",
          "ticket.r2l": "Γλώσσες",
          "ticket.r3l": "Ώρες",
          "ticket.r4l": "Αφετηρία",
          "ticket.r4v": "στην είσοδο του κήπου",
          "ticket.cta": "Επικοινωνήστε μαζί μας",
          "lang.eyebrow": "14 γλώσσες",
          "lang.title": "Ξενάγηση σε 14 γλώσσες",
          "lang.sub": "Μια ξενάγηση που μπορούν να κατανοήσουν σχεδόν όλοι, όποια γωνιά του κόσμου κι αν σας φέρνει εδώ.",
          "gallery.eyebrow": "Συλλογή",
          "gallery.title": "Στιγμές από τον κήπο",
          "visit.eyebrow": "Επίσκεψη",
          "visit.title": "Σχεδιάστε τη βόλτα σας",
          "visit.season": "Σεζόν",
          "visit.seasonV": "Από τον Μάιο έως τον Οκτώβριο",
          "visit.hours": "Ώρες λειτουργίας",
          "visit.hoursV": "Καθημερινά 11:00–17:00",
          "visit.price": "Τιμή",
          "visit.priceV": "€5 ανά άτομο",
          "visit.duration": "Διάρκεια",
          "visit.durationV": "Περίπου 20 λεπτά",
          "visit.place": "Τοποθεσία",
          "visit.placeV": "Κήπος του Ανακτόρου Rundāle και ο περιβάλλων χώρος",
          "visit.start": "Αφετηρία και τερματισμός",
          "visit.startV": "Στην είσοδο του κήπου",
          "visit.rainTitle": "Σε βροχερό καιρό",
          "visit.rainText": "Οι ξεναγήσεις δεν πραγματοποιούνται με βροχερό καιρό. Σας συνιστούμε να παρακολουθείτε την πρόγνωση του καιρού.",
          "contact.eyebrow": "Επικοινωνία",
          "contact.title": "Τα λέμε στον κήπο του Ανακτόρου Rundāle!",
          "contact.callLabel": "Τηλέφωνο",
          "contact.waLabel": "WhatsApp",
          "contact.emailLabel": "Email",
          "contact.addressLabel": "Διεύθυνση",
          "contact.ctaCall": "Καλέστε μας",
          "contact.ctaEmail": "Στείλτε email",
          "contact.mapLink": "Άνοιγμα στους Χάρτες Google →",
          "footer.tagline": "Αριστοκρατική αναψυχή στον κήπο του Ανακτόρου Rundāle με ηλεκτρικό αυτοκίνητο.",
          "footer.credit": "Ανάπτυξη από",
          "lang.lv1": "Λετονικά",
          "lang.lv2": "Εσθονικά",
          "lang.lv3": "Αγγλικά",
          "lang.lv4": "Ισπανικά",
          "lang.lv5": "Λιθουανικά",
          "lang.lv6": "Γαλλικά",
          "lang.lv7": "Ιταλικά",
          "lang.lv8": "Κορεατικά",
          "lang.lv9": "Γερμανικά",
          "lang.lv10": "Ιαπωνικά",
          "lang.lv11": "Ελληνικά",
          "lang.lv12": "Φινλανδικά",
          "lang.lv13": "Ρωσικά",
          "lang.lv14": "Πολωνικά"
    },
    "fi": {
          "a11y.skip": "Siirry sisältöön",
          "nav.experience": "Elämys",
          "nav.included": "Sisältyy",
          "nav.languages": "Kielet",
          "nav.gallery": "Galleria",
          "nav.visit": "Vieraile",
          "nav.contact": "Yhteystiedot",
          "hero.eyebrow": "Toukokuu – lokakuu · Rundālen palatsin puutarha",
          "hero.title": "Aristokraattista huvia Rundālen palatsin puutarhassa",
          "hero.sub": "Kutsumme sinut joka vuosi nauttimaan noin 20 minuutin ajelusta ranskalaisen puutarhan kauneimpien paikkojen halki, opastuksella 14 kielellä.",
          "hero.priceUnit": "/ per henkilö",
          "exp.eyebrow": "Elämys",
          "exp.title": "Hetki kuninkaallista rauhaa",
          "exp.p1": "Kutsumme sinut joka vuosi toukokuusta lokakuuhun nauttimaan aristokraattisesta huvista Rundālen palatsin puutarhassa, jossa historiallinen maisema kohtaa kauneuden ja hiljaisuuden.",
          "exp.p2": "Salli itsellesi hetki kuninkaallista rauhaa. Ihaile puutarhan loistoa ja kuuntele tarinoita puutarhasta ja sen historiasta. Olemme täällä tehdäksemme vierailustasi Rundālessa erityisen.",
          "exp.quote": "“Missä historia kohtaa hiljaisuuden.”",
          "years.label": "vuoden kokemus",
          "offer.eyebrow": "Tarjonnassa",
          "offer.title": "Kaikki kiireettömään retkeen",
          "offer.lead": "Rauhallinen ja eksklusiivinen ajelu Rundālen palatsin ranskalaisen puutarhan halki. Kierros alkaa ja päättyy puutarhan sisäänkäynnillä.",
          "offer.i1t": "Puutarhan hienoimmat paikat",
          "offer.i1d": "Ajelu Rundālen palatsin ranskalaisen puutarhan halki.",
          "offer.i2t": "Opastus 14 kielellä",
          "offer.i2d": "Kierros, jonka lähes jokainen ymmärtää. Selkeä kerronta jokaiselle vieraalle.",
          "offer.i3t": "Kuninkaallista rauhaa",
          "offer.i3d": "Rauhallinen retki, joka sopii täydellisesti pariskunnille, perheille ja jokaiselle vieraalle.",
          "ticket.label": "Kierroslippu",
          "ticket.priceUnit": "per henkilö",
          "ticket.r1l": "Kesto",
          "ticket.r2l": "Kielet",
          "ticket.r3l": "Aukioloajat",
          "ticket.r4l": "Lähtö",
          "ticket.r4v": "puutarhan sisäänkäynniltä",
          "ticket.cta": "Ota yhteyttä",
          "lang.eyebrow": "14 kieltä",
          "lang.title": "Opastus 14 kielellä",
          "lang.sub": "Kierros, jonka lähes jokainen ymmärtää, riippumatta siitä, mistä maailmankolkasta olet saapunut.",
          "gallery.eyebrow": "Galleria",
          "gallery.title": "Hetkiä puutarhasta",
          "visit.eyebrow": "Vieraile",
          "visit.title": "Suunnittele ajelusi",
          "visit.season": "Kausi",
          "visit.seasonV": "Toukokuusta lokakuuhun",
          "visit.hours": "Aukioloajat",
          "visit.hoursV": "Joka päivä 11:00–17:00",
          "visit.price": "Hinta",
          "visit.priceV": "5 € per henkilö",
          "visit.duration": "Kesto",
          "visit.durationV": "Noin 20 minuuttia",
          "visit.place": "Paikka",
          "visit.placeV": "Rundālen palatsin puutarha ja ympäristö",
          "visit.start": "Lähtö ja päätepiste",
          "visit.startV": "Puutarhan sisäänkäynnillä",
          "visit.rainTitle": "Sateisella säällä",
          "visit.rainText": "Kierroksia ei järjestetä sateisella säällä. Suosittelemme seuraamaan sääennustetta.",
          "contact.eyebrow": "Yhteystiedot",
          "contact.title": "Nähdään Rundālen palatsin puutarhassa!",
          "contact.callLabel": "Puhelin",
          "contact.waLabel": "WhatsApp",
          "contact.emailLabel": "Sähköposti",
          "contact.addressLabel": "Osoite",
          "contact.ctaCall": "Soita",
          "contact.ctaEmail": "Kirjoita sähköposti",
          "contact.mapLink": "Avaa Google Mapsissa →",
          "footer.tagline": "Aristokraattista huvia Rundālen palatsin puutarhassa sähköautolla.",
          "footer.credit": "Kehittänyt",
          "lang.lv1": "latvia",
          "lang.lv2": "viro",
          "lang.lv3": "englanti",
          "lang.lv4": "espanja",
          "lang.lv5": "liettua",
          "lang.lv6": "ranska",
          "lang.lv7": "italia",
          "lang.lv8": "korea",
          "lang.lv9": "saksa",
          "lang.lv10": "japani",
          "lang.lv11": "kreikka",
          "lang.lv12": "suomi",
          "lang.lv13": "venäjä",
          "lang.lv14": "puola"
    },
    "ru": {
          "a11y.skip": "Перейти к содержанию",
          "nav.experience": "Впечатление",
          "nav.included": "Что включено",
          "nav.languages": "Языки",
          "nav.gallery": "Галерея",
          "nav.visit": "Визит",
          "nav.contact": "Контакты",
          "hero.eyebrow": "Май – октябрь · Сад Рундальского дворца",
          "hero.title": "Аристократический отдых в саду Рундальского дворца",
          "hero.sub": "Каждый год мы приглашаем вас насладиться примерно 20-минутной поездкой по самым красивым уголкам французского сада с комментариями на 14 языках.",
          "hero.priceUnit": "/ с человека",
          "exp.eyebrow": "Впечатление",
          "exp.title": "Мгновение королевского покоя",
          "exp.p1": "Каждый год с мая по октябрь мы приглашаем вас насладиться аристократическим отдыхом в саду Рундальского дворца, где исторический ландшафт сочетается с красотой и тишиной.",
          "exp.p2": "Подарите себе мгновение королевского покоя. Полюбуйтесь великолепием сада и послушайте истории о нём самом и его прошлом. Мы здесь, чтобы сделать ваш визит в Рундале особенным.",
          "exp.quote": "“Где история встречается с тишиной.”",
          "years.label": "лет опыта",
          "offer.eyebrow": "В предложении",
          "offer.title": "Всё для неспешной прогулки",
          "offer.lead": "Тихая, эксклюзивная поездка по французскому саду Рундальского дворца. Тур начинается и заканчивается у входа в сад.",
          "offer.i1t": "Самые живописные уголки сада",
          "offer.i1d": "Поездка по французскому саду Рундальского дворца.",
          "offer.i2t": "Комментарии на 14 языках",
          "offer.i2d": "Тур, понятный практически каждому. Ясный рассказ для каждого гостя.",
          "offer.i3t": "Королевский покой",
          "offer.i3d": "Спокойная прогулка, идеально подходящая для пар, семей и любого гостя.",
          "ticket.label": "Билет на тур",
          "ticket.priceUnit": "с человека",
          "ticket.r1l": "Длительность",
          "ticket.r2l": "Языки",
          "ticket.r3l": "Часы работы",
          "ticket.r4l": "Старт",
          "ticket.r4v": "у входа в сад",
          "ticket.cta": "Связаться с нами",
          "lang.eyebrow": "14 языков",
          "lang.title": "Комментарии на 14 языках",
          "lang.sub": "Тур, понятный практически каждому, из какого бы уголка мира вы ни приехали.",
          "gallery.eyebrow": "Галерея",
          "gallery.title": "Мгновения из сада",
          "visit.eyebrow": "Визит",
          "visit.title": "Спланируйте свою поездку",
          "visit.season": "Сезон",
          "visit.seasonV": "С мая по октябрь",
          "visit.hours": "Часы работы",
          "visit.hoursV": "Каждый день 11:00–17:00",
          "visit.price": "Цена",
          "visit.priceV": "€5 с человека",
          "visit.duration": "Длительность",
          "visit.durationV": "Около 20 минут",
          "visit.place": "Место",
          "visit.placeV": "Сад Рундальского дворца и окрестности",
          "visit.start": "Старт и финиш",
          "visit.startV": "У входа в сад",
          "visit.rainTitle": "В дождливую погоду",
          "visit.rainText": "В дождливую погоду туры не проводятся. Рекомендуем следить за прогнозом.",
          "contact.eyebrow": "Контакты",
          "contact.title": "До встречи в саду Рундальского дворца!",
          "contact.callLabel": "Телефон",
          "contact.waLabel": "WhatsApp",
          "contact.emailLabel": "Эл. почта",
          "contact.addressLabel": "Адрес",
          "contact.ctaCall": "Позвонить",
          "contact.ctaEmail": "Написать письмо",
          "contact.mapLink": "Открыть в Google Maps →",
          "footer.tagline": "Аристократический отдых в саду Рундальского дворца на электромобиле.",
          "footer.credit": "Разработано",
          "lang.lv1": "Латышский",
          "lang.lv2": "Эстонский",
          "lang.lv3": "Английский",
          "lang.lv4": "Испанский",
          "lang.lv5": "Литовский",
          "lang.lv6": "Французский",
          "lang.lv7": "Итальянский",
          "lang.lv8": "Корейский",
          "lang.lv9": "Немецкий",
          "lang.lv10": "Японский",
          "lang.lv11": "Греческий",
          "lang.lv12": "Финский",
          "lang.lv13": "Русский",
          "lang.lv14": "Польский"
    },
    "pl": {
          "a11y.skip": "Przejdź do treści",
          "nav.experience": "Przeżycie",
          "nav.included": "W cenie",
          "nav.languages": "Języki",
          "nav.gallery": "Galeria",
          "nav.visit": "Wizyta",
          "nav.contact": "Kontakt",
          "hero.eyebrow": "Maj – październik · Ogród Pałacu Rundāle",
          "hero.title": "Arystokratyczny wypoczynek w ogrodzie Pałacu Rundāle",
          "hero.sub": "Każdego roku zapraszamy na około 20-minutową przejażdżkę po najpiękniejszych zakątkach francuskiego ogrodu, z komentarzem w 14 językach.",
          "hero.priceUnit": "/ od osoby",
          "exp.eyebrow": "Przeżycie",
          "exp.title": "Chwila królewskiego spokoju",
          "exp.p1": "Każdego roku od maja do października zapraszamy do arystokratycznego wypoczynku w ogrodzie Pałacu Rundāle, gdzie historyczny krajobraz spotyka się z pięknem i ciszą.",
          "exp.p2": "Pozwól sobie na chwilę królewskiego spokoju. Podziwiaj przepych ogrodu i wysłuchaj opowieści o nim i jego historii. Jesteśmy tu po to, by uczynić Twoją wizytę w Rundāle wyjątkową.",
          "exp.quote": "“Tam, gdzie historia spotyka ciszę.”",
          "years.label": "lat doświadczenia",
          "offer.eyebrow": "W ofercie",
          "offer.title": "Wszystko dla niespiesznej wycieczki",
          "offer.lead": "Cicha, ekskluzywna przejażdżka po francuskim ogrodzie Pałacu Rundāle. Wycieczka rozpoczyna się i kończy przy wejściu do ogrodu.",
          "offer.i1t": "Najpiękniejsze zakątki ogrodu",
          "offer.i1d": "Przejażdżka po francuskim ogrodzie Pałacu Rundāle.",
          "offer.i2t": "Komentarz w 14 językach",
          "offer.i2d": "Wycieczka zrozumiała niemal dla każdego. Wyraźna narracja dla każdego gościa.",
          "offer.i3t": "Królewski spokój",
          "offer.i3d": "Spokojna wycieczka, idealna dla par, rodzin i każdego gościa.",
          "ticket.label": "Bilet na wycieczkę",
          "ticket.priceUnit": "od osoby",
          "ticket.r1l": "Czas trwania",
          "ticket.r2l": "Języki",
          "ticket.r3l": "Godziny",
          "ticket.r4l": "Start",
          "ticket.r4v": "przy wejściu do ogrodu",
          "ticket.cta": "Skontaktuj się",
          "lang.eyebrow": "14 języków",
          "lang.title": "Komentarz w 14 językach",
          "lang.sub": "Wycieczka zrozumiała niemal dla każdego, bez względu na to, z którego zakątka świata przybywasz.",
          "gallery.eyebrow": "Galeria",
          "gallery.title": "Chwile z ogrodu",
          "visit.eyebrow": "Wizyta",
          "visit.title": "Zaplanuj swoją przejażdżkę",
          "visit.season": "Sezon",
          "visit.seasonV": "Od maja do października",
          "visit.hours": "Godziny otwarcia",
          "visit.hoursV": "Codziennie 11:00–17:00",
          "visit.price": "Cena",
          "visit.priceV": "5 € od osoby",
          "visit.duration": "Czas trwania",
          "visit.durationV": "Około 20 minut",
          "visit.place": "Miejsce",
          "visit.placeV": "Ogród Pałacu Rundāle i okolice",
          "visit.start": "Start i meta",
          "visit.startV": "Przy wejściu do ogrodu",
          "visit.rainTitle": "W deszczową pogodę",
          "visit.rainText": "W deszczową pogodę wycieczki się nie odbywają. Zalecamy śledzenie prognozy pogody.",
          "contact.eyebrow": "Kontakt",
          "contact.title": "Do zobaczenia w ogrodzie Pałacu Rundāle!",
          "contact.callLabel": "Telefon",
          "contact.waLabel": "WhatsApp",
          "contact.emailLabel": "E-mail",
          "contact.addressLabel": "Adres",
          "contact.ctaCall": "Zadzwoń",
          "contact.ctaEmail": "Napisz e-mail",
          "contact.mapLink": "Otwórz w Google Maps →",
          "footer.tagline": "Arystokratyczny wypoczynek w ogrodzie Pałacu Rundāle elektromobilem.",
          "footer.credit": "Stworzone przez",
          "lang.lv1": "łotewski",
          "lang.lv2": "estoński",
          "lang.lv3": "angielski",
          "lang.lv4": "hiszpański",
          "lang.lv5": "litewski",
          "lang.lv6": "francuski",
          "lang.lv7": "włoski",
          "lang.lv8": "koreański",
          "lang.lv9": "niemiecki",
          "lang.lv10": "japoński",
          "lang.lv11": "grecki",
          "lang.lv12": "fiński",
          "lang.lv13": "rosyjski",
          "lang.lv14": "polski"
    }
  };

  var TITLES = {
    lv: "Elektromobilis Rund\u0101l\u0113 \u00b7 ekskursijas ar elektromobili pa Rund\u0101les pils d\u0101rzu",
    en: "Elektromobilis Rund\u0101l\u0113 \u00b7 electric-car tours of the Rund\u0101le Palace garden"
  };
  LANGS.forEach(function (L) {
    if (!TITLES[L.code] && DICT[L.code] && DICT[L.code]["hero.title"]) {
      TITLES[L.code] = "Elektromobilis Rund\u0101l\u0113 \u00b7 " + DICT[L.code]["hero.title"];
    }
  });

  function metaFor(code) {
    for (var i = 0; i < LANGS.length; i++) { if (LANGS[i].code === code) return LANGS[i]; }
    return LANGS[0];
  }
  function isLang(l) { return l === "lv" || !!DICT[l]; }

  var i18nNodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
  // Capture the original Latvian text on each node (LV is the source language).
  i18nNodes.forEach(function (el) { el.setAttribute("data-lv", el.textContent); });

  function applyLang(lang) {
    if (!isLang(lang)) lang = "lv";
    var dict = lang === "lv" ? null : DICT[lang];
    i18nNodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.textContent = (dict && dict[key] != null) ? dict[key] : el.getAttribute("data-lv");
    });
    document.documentElement.lang = lang;
    document.title = TITLES[lang] || TITLES.lv;
    updateSwitchUI(lang);
    try { localStorage.setItem("erm-lang", lang); } catch (e) {}
    document.dispatchEvent(new CustomEvent("erm:langchange", { detail: lang }));
  }

  /* ---------- Language switcher (dropdown, built from LANGS) ---------- */
  var langSwitch = document.getElementById("langSwitch");
  var langBtn = null, langMenu = null, langMenuItems = {};
  function openMenu() {
    if (!langMenu) return;
    langMenu.hidden = false;
    langSwitch.classList.add("open");
    langBtn.setAttribute("aria-expanded", "true");
  }
  function closeMenu() {
    if (!langMenu) return;
    langMenu.hidden = true;
    langSwitch.classList.remove("open");
    langBtn.setAttribute("aria-expanded", "false");
  }
  function updateSwitchUI(lang) {
    if (!langBtn) return;
    var m = metaFor(lang);
    var f = langBtn.querySelector(".lang-cur-flag");
    var c = langBtn.querySelector(".lang-cur-code");
    if (f) f.src = "assets/img/flags/" + m.flag + ".svg";
    if (c) c.textContent = m.label;
    Object.keys(langMenuItems).forEach(function (code) {
      var active = code === lang;
      langMenuItems[code].classList.toggle("is-active", active);
      langMenuItems[code].setAttribute("aria-selected", active ? "true" : "false");
    });
  }
  function buildSwitcher() {
    if (!langSwitch) return;
    langBtn = document.createElement("button");
    langBtn.type = "button";
    langBtn.className = "lang-current";
    langBtn.setAttribute("aria-haspopup", "listbox");
    langBtn.setAttribute("aria-expanded", "false");
    langBtn.setAttribute("aria-label", "Valoda / Language");
    langBtn.innerHTML = '<img class="lang-cur-flag" alt="" width="22" height="16" />' +
      '<span class="lang-cur-code"></span>' +
      '<svg class="lang-caret" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    langMenu = document.createElement("ul");
    langMenu.className = "lang-menu";
    langMenu.setAttribute("role", "listbox");
    langMenu.setAttribute("aria-label", "Valoda / Language");
    langMenu.hidden = true;

    LANGS.forEach(function (L) {
      var li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("data-lang", L.code);
      li.innerHTML = '<img src="assets/img/flags/' + L.flag + '.svg" alt="" width="22" height="16" />' +
        '<span class="lang-menu-native">' + L.native + '</span>' +
        '<span class="lang-menu-code">' + L.label + '</span>';
      li.addEventListener("click", function () { applyLang(L.code); closeMenu(); langBtn.focus(); });
      langMenu.appendChild(li);
      langMenuItems[L.code] = li;
    });

    langSwitch.appendChild(langBtn);
    langSwitch.appendChild(langMenu);

    langBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (langMenu.hidden) openMenu(); else closeMenu();
    });
    document.addEventListener("click", function (e) {
      if (langSwitch && !langSwitch.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && langMenu && !langMenu.hidden) { closeMenu(); langBtn.focus(); }
    });
  }
  buildSwitcher();

  var savedLang = "lv";
  try { savedLang = localStorage.getItem("erm-lang") || "lv"; } catch (e) {}
  if (!isLang(savedLang)) savedLang = "lv";
  applyLang(savedLang);

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 30) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");
  function closeNav() {
    nav.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
  navToggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Aizvērt izvēlni" : "Atvērt izvēlni");
  });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
  window.addEventListener("resize", function () { if (window.innerWidth > 860) closeNav(); });

  /* ---------- Reveal on scroll ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Active nav link ---------- */
  var sections = ["pieredze", "ieklauts", "valodas", "galerija", "apmeklejums", "kontakti"]
    .map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var navLinks = {};
  nav.querySelectorAll("a").forEach(function (a) {
    var id = a.getAttribute("href").replace("#", "");
    navLinks[id] = a;
  });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.remove("active"); });
          if (navLinks[e.target.id]) navLinks[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var galItems = Array.prototype.slice.call(document.querySelectorAll(".gal-item"));
  var slides = galItems.map(function (b) {
    var img = b.querySelector("img");
    return { src: b.getAttribute("data-full"), alt: img ? img.alt : "" };
  });
  var current = 0;
  var lastFocus = null;

  function showSlide(i) {
    current = (i + slides.length) % slides.length;
    lbImg.src = slides[current].src;
    lbImg.alt = slides[current].alt;
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    showSlide(i);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("open"); });
    document.body.style.overflow = "hidden";
    document.getElementById("lbClose").focus();
  }
  function closeLb() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(function () { lb.hidden = true; lbImg.src = ""; }, 280);
    if (lastFocus) lastFocus.focus();
  }
  galItems.forEach(function (b, i) { b.addEventListener("click", function () { openLb(i); }); });
  document.getElementById("lbClose").addEventListener("click", closeLb);
  document.getElementById("lbPrev").addEventListener("click", function () { showSlide(current - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { showSlide(current + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") showSlide(current - 1);
    else if (e.key === "ArrowRight") showSlide(current + 1);
  });

  /* ---------- Hero video + parallax scroll ---------- */
  var heroEl = document.querySelector(".hero");
  var heroMedia = document.querySelector(".hero-media");
  var heroContent = document.querySelector(".hero-content");
  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    if (reduce) {
      heroVideo.removeAttribute("autoplay");
      try { heroVideo.pause(); } catch (e) {}
      document.body.classList.add("no-hero-video");
    } else {
      heroVideo.muted = true;
      var pp = heroVideo.play();
      if (pp && pp.catch) pp.catch(function () { document.body.classList.add("no-hero-video"); });
    }
  }
  if (!reduce && heroEl && heroMedia) {
    var hticking = false;
    var onHeroParallax = function () {
      if (hticking) return;
      hticking = true;
      requestAnimationFrame(function () {
        var h = heroEl.offsetHeight || window.innerHeight;
        var p = Math.min(1, Math.max(0, window.scrollY / h));
        heroMedia.style.transform = "scale(" + (1 + p * 0.12).toFixed(4) + ") translateY(" + (p * 4).toFixed(2) + "%)";
        if (heroContent) {
          heroContent.style.transform = "translateY(" + (p * -38).toFixed(1) + "px)";
          heroContent.style.opacity = Math.max(0, 1 - p * 1.15).toFixed(3);
        }
        hticking = false;
      });
    };
    window.addEventListener("scroll", onHeroParallax, { passive: true });
    onHeroParallax();
  }

  /* ---------- Languages: staggered reveal as you scroll ---------- */
  var langItems = document.querySelectorAll(".lang-list li");
  if (langItems.length && !reduce && "IntersectionObserver" in window) {
    langItems.forEach(function (li, i) {
      li.classList.add("reveal");
      li.style.transitionDelay = ((i % 3) * 70 + Math.floor(i / 3) * 55) + "ms";
    });
    var lio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target;
          el.classList.add("in");
          lio.unobserve(el);
          setTimeout(function () { el.classList.remove("reveal", "in"); el.style.transitionDelay = ""; }, 950);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    langItems.forEach(function (li) { lio.observe(li); });
  }

  /* ---------- Footer year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Background music ---------- */
  var audio = document.getElementById("bgAudio");
  var audioBtn = document.getElementById("audioToggle");
  if (audio && audioBtn) {
    audio.volume = 0.35;
    audio.loop = true;
    var AUDIO_LABEL = {
      lv: { on: "Izslēgt mūziku", off: "Ieslēgt mūziku" },
      en: { on: "Turn music off", off: "Turn music on" }
    };
    function audioLabel() {
      return AUDIO_LABEL[document.documentElement.lang] || AUDIO_LABEL.en;
    }

    function audioUI() {
      var playing = !audio.paused && !audio.muted;
      audioBtn.classList.toggle("is-muted", !playing);
      audioBtn.classList.toggle("is-playing", playing);
      audioBtn.setAttribute("aria-pressed", playing ? "true" : "false");
      var lbl = audioLabel();
      audioBtn.setAttribute("aria-label", playing ? lbl.on : lbl.off);
    }

    function audioPlay() {
      audio.muted = false;
      if (audio.preload !== "auto") audio.preload = "auto"; // fetch the mp3 only now
      var pr = audio.play();
      if (pr && pr.catch) pr.catch(function () {});
    }

    // Browsers block sound until the visitor interacts, so start on the very
    // first gesture anywhere (scroll / tap / click / key). This is as close to
    // "plays on entry" as browser autoplay policy allows, and it keeps the mp3
    // out of the initial load (preload stays "none" until that first gesture).
    var GESTURES = ["pointerdown", "keydown", "touchstart", "wheel", "scroll"];
    function removeFirstGesture() {
      GESTURES.forEach(function (ev) { window.removeEventListener(ev, firstGesture, true); });
    }
    function firstGesture(e) {
      if (audioBtn.contains(e.target)) { removeFirstGesture(); return; }
      if (audio.paused) audioPlay();
      removeFirstGesture();
    }
    GESTURES.forEach(function (ev) { window.addEventListener(ev, firstGesture, true); });

    audioBtn.addEventListener("click", function () {
      if (audio.paused || audio.muted) audioPlay();
      else audio.pause();
    });

    audio.addEventListener("play", audioUI);
    audio.addEventListener("pause", audioUI);
    audio.addEventListener("volumechange", audioUI);
    // Keep the button's aria-label in sync when the language is switched.
    document.addEventListener("erm:langchange", audioUI);
    audioUI();
  }
})();
