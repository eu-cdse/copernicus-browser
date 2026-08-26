// Root-relative paths (e.g. '/rrd/foo.png') only resolve correctly when the app is deployed at
// the domain root. Every deployment that serves the app from a subpath (staging, OTC, RRD
// staging, branch review apps) needs the VITE_ROOT_URL prefix, same as other public/ assets
// referenced elsewhere in the app (see LayerHeader.jsx, langUtils.js).
const rrdLogoBaseUrl = `${import.meta.env.VITE_ROOT_URL}rrd/`;

const AirbusLogo = `${rrdLogoBaseUrl}airbus-logo_blue.png`;
const CosmoSkymedLogo = `${rrdLogoBaseUrl}cosmo-skymed-logo.png`;
const CosmoSkymedSecondGenLogo = `${rrdLogoBaseUrl}cosmo-skymed-2nd-logo.png`;
const EUSILogo = `${rrdLogoBaseUrl}EUSI-logo_Blue.png`;
const HISDESATLogo = `${rrdLogoBaseUrl}hisdesat-logo.png`;
const IceyeLogo = `${rrdLogoBaseUrl}iceye-logo.png`;
const PlanetLogo = `${rrdLogoBaseUrl}planet-logo.png`;
const RadarSatLogo = `${rrdLogoBaseUrl}radarsat-logo.png`;
const GeosatLogo = `${rrdLogoBaseUrl}geosat-logo.png`;
const GHGSatLogo = `${rrdLogoBaseUrl}GHGSAT-logo.png`;

export {
  AirbusLogo,
  CosmoSkymedLogo,
  CosmoSkymedSecondGenLogo,
  EUSILogo,
  HISDESATLogo,
  IceyeLogo,
  PlanetLogo,
  RadarSatLogo,
  GeosatLogo,
  GHGSatLogo,
};
