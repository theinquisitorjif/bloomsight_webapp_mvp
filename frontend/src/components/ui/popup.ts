import mapboxgl, { Map, type LngLatLike } from 'mapbox-gl';

export function createBeachWeatherPopup(mapRef: { current: Map; }, feature: { properties: { name: unknown; }; }, data: { recommendation: unknown; rip_risk: { recommendation: string; }; parking_info: { count: unknown; }; }, lat: number, lng: number) {
  new mapboxgl.Popup()
    .setLngLat([lng, lat] as LngLatLike)
    .setHTML(`
      <div class="p-4 bg-background text-foreground rounded-lg shadow-lg">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="text-lg font-semibold">${feature.properties?.name}</h3>
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">Weather:</p>
            <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
              ${data.recommendation}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">Rip currents:</p>
            <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${
              data.rip_risk.recommendation.toLowerCase().includes('high')
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/80'
                : 'bg-green-500 text-white'
            }">
              ${data.rip_risk.recommendation}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">Parking spots:</p>
            <span class="text-sm text-muted-foreground">${data.parking_info.count}</span>
          </div>
        </div>
      </div>
    `)
    .addTo(mapRef.current!);
}