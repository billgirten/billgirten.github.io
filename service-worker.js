// const CACHE_NAME = "billgirten-cache-v1";
// const urlsToCache = [
//   "/",
//   "/index.html",
//   "/styles/index.css",
//   "/images/icons/favicon-32x32.png"
// ];

// // Install event
// self.addEventListener("install", event => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
//   );
// });

// // Fetch event
// self.addEventListener("fetch", event => {
//   event.respondWith(
//     caches.match(event.request).then(response => response || fetch(event.request))
//   );
// });

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
//const APP_VERSION = process.env.REACT_APP_VERSION || 'v.1.0.0.0';

const CACHE_NAME = "billgirten-cache-v0";
const PRECACHE_ASSETS = [
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/baseball/AaronJudge.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/baseball/BryceHarper.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/baseball/JuanSoto.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/baseball/KenGriffeyJr.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/baseball/MikeTrout.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/baseball/MookieBetts.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/baseball/RonaldAcunaJr.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/baseball/ShoheiOhtani.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/basketball/LeBronJames.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/basketball/StephCurry.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/basketball/MichaelJordan.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/basketball/LukaDoncic.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/basketball/VictorWembanyama.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/football/PatrickMahomes.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/football/TomBrady.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/football/JoeBurrow.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/football/JoshAllen.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/football/LamarJackson.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/hockey/WayneGretzky.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/players/hockey/ConnorMcDavid.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/releases/BB-2024Donruss.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/releases/BB-2024Finest.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/releases/BB-2024ToppsChrome.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/releases/BK-2023HauntedHoops.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/releases/BK-2023PaniniContenders.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/releases/FB-2023DonrussOptic.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/releases/FB-2023PaniniContenders.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/releases/FB-2024ScoreATreat.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/brands/topps/BowmanChrome.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/brands/topps/Topps.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/brands/topps/ToppsHeritage.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/brands/topps/ToppsChrome.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/brands/topps/ToppsAllenGinter.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/brands/panini/DonrussOptic.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/brands/panini/PaniniContenders.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/brands/panini/PaniniMosaic.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/brands/panini/PaniniPrizm.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/brands/panini/PaniniSelect.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/brands/upper_deck/OPeeChee.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/brands/upper_deck/UpperDeck.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/teams/BostonCeltics.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/teams/BostonRedSox.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/teams/ChicagoCubs.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/teams/DallasCowboys.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/teams/GoldenStateWarriors.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/teams/KansasCityChiefs.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/teams/LosAngelesDodgers.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/teams/LosAngelesLakers.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/teams/NewYorkKnicks.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/teams/NewYorkYankees.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/teams/PittsburghSteelers.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/teams/StLouisCardinals.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/sports/Baseball.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/sports/Basketball.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/sports/Football.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/sports/Hockey.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/sports/Soccer.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/sports/Racing.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/sports/Wrestling.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/sports/MMA.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/sports/Golf.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/graders/PSA.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/graders/SGC.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/graders/CGC.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/graders/BGS.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/graders/Other.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/graders/PSADNA.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/attributes/RC.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/attributes/Auto.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/attributes/SN.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/attributes/MEM.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/attributes/SP.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/attributes/VAR.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/attributes/Errors.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/quality_qbs/PatrickMahomes.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/quality_qbs/JoeBurrow.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/quality_qbs/JoshAllen.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/quality_qbs/LamarJackson.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/quality_qbs/DakPrescott.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/quality_qbs/CJStroud.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/quality_qbs/BrockPurdy.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/quality_qbs/JalenHurts.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/quality_qbs/JustinHerbert.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/quality_qbs/JordanLove.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/rainbow/Blue.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/rainbow/Red.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/rainbow/Green.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/rainbow/Purple.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/rainbow/Orange.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/rainbow/Yellow.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/rainbow/Pink.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/classic_sets/BB-1987Topps.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/classic_sets/BB-1952Topps.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/classic_sets/BB-1989UpperDeck.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/classic_sets/BB-1993Finest.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/classic_sets/FB-1989Score.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/classic_sets/FB-1990ProSet.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/classic_sets/BK-1996ToppsChrome.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/classic_sets/BK-1997MetalUniverse.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1980s/CalRipkenJr.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1980s/MikeSchmidt.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1980s/RickeyHenderson.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1980s/NolanRyan.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1980s/MagicJohnson.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1980s/Kareem.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1980s/LarryBird.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1980s/DanMarino.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1980s/JoeMontana.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1980s/WalterPayton.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1980s/WayneGretzky.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1980s/MarioLemieux.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1990s/BarryBonds.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1990s/KenGriffeyJr.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1990s/FrankThomas.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1990s/GregMaddux.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1990s/TonyGwynn.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1990s/MichaelJordan.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1990s/HakeemOlajuwon.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1990s/PatrickEwing.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1990s/JerryRice.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1990s/DeionSanders.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1990s/BarrySanders.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1990s/BrettFavre.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1990s/BoJackson.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/1990s/JaromirJagr.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/2000s/Ichiro.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/2000s/AlbertPujols.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/2000s/DerekJeter.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/2000s/AlexRodriguez.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/2000s/DavidOrtiz.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/2000s/KobeBryant.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/2000s/Shaq.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/2000s/TimDuncan.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/2000s/TomBrady.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/2000s/PeytonManning.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/2000s/RandyMoss.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/CalRipkenJr.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/MikeSchmidt.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/RickeyHenderson.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/NolanRyan.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/BarryBonds.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/KenGriffeyJr.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/FrankThomas.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/GregMaddux.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/TonyGwynn.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/AlbertPujols.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/DerekJeter.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/BabeRuth.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/HankAaron.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/WillieMays.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/TedWilliams.png',
    'https://bsc-media-images.s3.amazonaws.com/sliders/lineup_legends/MickeyMantle.png',
];

// Listener for the install event - pre-caches our assets list on service worker install.
async function precache() {
    const cache = await caches.open(CACHE_NAME);
    return cache.addAll(PRECACHE_ASSETS);
}

async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        await cache.delete(keys[0]); // delete oldest
        await trimCache(cacheName, maxItems); // recurse
    }
}

async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            await trimCache(CACHE_NAME, 100);
        }
        return networkResponse;
    } catch (error) {
        return Response.error();
    }
}

self.addEventListener('fetch', event => {
    if (PRECACHE_ASSETS.includes(event.request.url)) {
        event.respondWith(cacheFirst(event.request));
    }
});

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(precache());
});

self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))));
    self.clients.claim();
});
