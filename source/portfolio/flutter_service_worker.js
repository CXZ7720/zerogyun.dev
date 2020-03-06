'use strict';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "/assets\AssetManifest.json": "2efbb41d7877d10aac9d091f58ccd7b9",
"/assets\FontManifest.json": "01700ba55b08a6141f33e168c4a6c22f",
"/assets\fonts\MaterialIcons-Regular.ttf": "56d3ffdef7a25659eab6a68a3fbfaf16",
"/assets\images\android.png": "9146f97b9e78230ebac6b3f29f2af435",
"/assets\images\bushanyang.jpg": "ca35b558531eb7138f600c5f3b73ace5",
"/assets\images\bushanyang_dark.jpg": "de3381ae70ed30007c7ff6020a496681",
"/assets\images\domain.png": "3ab0b35ae418a7eefe36aec352acd153",
"/assets\images\github-logo.png": "aae9f9a12316d548de7b9647bcb2b75e",
"/assets\images\googleplay.png": "42d78d7e9279288f043cb2c2ee1058db",
"/assets\images\hanyang.png": "7413c01e04b41fc6c5cd25b61052b5da",
"/assets\images\homepage.png": "9725640ccc64c91359528ec6f364cbf2",
"/assets\images\hybus_iphone_mockup.png": "4531bcae01e558ec5f4aad82af34be56",
"/assets\images\hybus_iphone_mockup2.png": "c806cfe6e19593932e45f26a0efe9f2a",
"/assets\images\hybus_iphone_mockup_resized.png": "03fd024ec1096ce62fe6c1e8b40927ab",
"/assets\images\linkedin-logo.png": "0a09d43167631cdcdf705c01cc04b920",
"/assets\images\mail.png": "c97854a3cbee61c9c7382275959c2078",
"/assets\images\node.png": "cf14a1d9ee5dd7c349cf589a1f01ff6a",
"/assets\images\play1.png": "67ad1fba1f2147f03a183ad33c31a95c",
"/assets\images\play2.png": "f63a3adea557c5f3167717c864fad683",
"/assets\images\profile.jpg": "4f56d04baf5ba75ec6ac61c2e287032e",
"/assets\images\vue.png": "1d1956a8c74c3e7df08ec100faea48a8",
"/assets\images\whale.png": "41bc2edf7319ef6f87b0a7299e91b336",
"/assets\images\whale_store.jpg": "cf584ffeb061189002ec50dcd485258f",
"/assets\LICENSE": "f19e6ec599fa96e48525fe9366960378",
"/assets\packages\cupertino_icons\assets\CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"/index.html": "4c670f7bfc6bb6b74d6de86a39a57d2c",
"/main.dart.js": "4f0ed0479011eef02634fec193219096"
};

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheName) {
      return caches.delete(cacheName);
    }).then(function (_) {
      return caches.open(CACHE_NAME);
    }).then(function (cache) {
      return cache.addAll(Object.keys(RESOURCES));
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request, {
          credentials: 'include'
        });
      })
  );
});
