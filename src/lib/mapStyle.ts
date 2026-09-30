// Monochrome Google Map style for the Street Entrance step (MapPinPicker) —
// matches the white gallery design: near-white landscape, light-grey roads
// with a slightly darker stroke, building footprints picked out with a
// noticeably darker stroke so courtyard/building edges read clearly at high
// zoom, business/POI clutter hidden, and transit stations kept but
// greyscale. The marker itself isn't part of the map style — its default red
// pin stays the only colour on the map.
export const MONOCHROME_MAP_STYLE = [
  // Base: desaturate everything to light grey before the per-feature
  // overrides below pick out specific surfaces.
  { elementType: "geometry", stylers: [{ saturation: -100 }, { lightness: 40 }] },

  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },

  { featureType: "landscape.man_made", elementType: "geometry.fill", stylers: [{ color: "#f0f0f0" }] },
  { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#8a8a8a" }, { weight: 1.4 }] },

  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#e2e2e2" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#c7c7c7" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },

  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9e9e9" }] },

  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
  { featureType: "poi.place_of_worship", stylers: [{ visibility: "off" }] },
  { featureType: "poi.sports_complex", stylers: [{ visibility: "off" }] },

  { featureType: "transit.station", stylers: [{ visibility: "on" }, { saturation: -100 }] },
];
