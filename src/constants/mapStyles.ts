interface MapStyleElement {
  featureType: string;
  elementType?: string;
  stylers: Array<{ [key: string]: string }>;
}

export const customMapStyle: MapStyleElement[] = [
	{
		featureType: "road",
		elementType: "geometry",
		stylers: [{ color: "#FFEFDE" }], // Road color
	},
	{
		featureType: "road",
		elementType: "geometry.stroke",
		stylers: [{ color: "#378044" }], // Road border
	},
	{
		featureType: "road",
		elementType: "labels.text",
		stylers: [{ visibility: "off" }],
	},
	{
		featureType: "landscape",
		elementType: "geometry",
		stylers: [{ color: "#d0ffd9" }], // Landscape background
	},
	{
		featureType: "water",
		elementType: "geometry",
		stylers: [{ color: "#4682B4" }],
	},
	{
		featureType: "poi",
		stylers: [{ visibility: "off" }], // Hide points of interest
	},
	{
		featureType: "transit",
		stylers: [{ visibility: "off" }], // Hide public transport
	},
	{
		featureType: "administrative",
		stylers: [{ visibility: "off" }], // Hide administrative boundaries
	},
];
