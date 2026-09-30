// Google Map style for the Street Entrance step (MapPinPicker) — a warm,
// high-contrast palette where buildings, ground, and streets are clearly
// distinct: beige building footprints with a crisp stroke, lighter beige
// ground/courtyards, blue-tinted roads (a lighter tint for local streets),
// green parks, blue water. Business/POI labels stay hidden; transit station
// icons stay visible. The marker itself isn't part of the map style — its
// default red pin stays the only saturated colour tied to app branding.
//
// Exported name kept as MONOCHROME_MAP_STYLE (now a misnomer) so
// MapPinPicker's import doesn't need to change alongside this palette swap.
export const MONOCHROME_MAP_STYLE = [
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#EEECE8" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#EEECE8" }] },

  { featureType: "landscape.man_made", elementType: "geometry.fill", stylers: [{ color: "#F1E6DA" }] },
  { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#C9BCAE" }] },

  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#DCE5D3" }] },

  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#BCC4DC" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#A9B2CD" }] },
  { featureType: "road.arterial", elementType: "geometry.fill", stylers: [{ color: "#BCC4DC" }] },
  { featureType: "road.arterial", elementType: "geometry.stroke", stylers: [{ color: "#A9B2CD" }] },
  { featureType: "road.local", elementType: "geometry.fill", stylers: [{ color: "#CDD3E6" }] },
  { featureType: "road.local", elementType: "geometry.stroke", stylers: [{ color: "#B8C0D8" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6F6F6F" }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },

  { featureType: "water", elementType: "geometry", stylers: [{ color: "#C8D8E4" }] },

  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#B0B0B0" }] },
  { featureType: "transit.station", stylers: [{ visibility: "on" }] },

  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
  { featureType: "poi.place_of_worship", stylers: [{ visibility: "off" }] },
  { featureType: "poi.sports_complex", stylers: [{ visibility: "off" }] },
];
