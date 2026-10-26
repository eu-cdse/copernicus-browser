// maplibre-gl 6 is ESM-only (no `require` export condition) and needs WebGL2, which jsdom doesn't provide.
// Only GlTileLayer.js imports it, and no test renders the GL map, so this stub just lets modules that
// import the Map component (e.g. App.jsx) load under Jest.
class Map {
  remove() {}
}

module.exports = { Map, setWorkerUrl() {} };
