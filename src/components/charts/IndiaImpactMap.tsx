import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  INDIA_STATES_GEOJSON, 
  STATE_METADATA_MAP, 
  NGO_PROJECT_LOCATIONS, 
  StateGeoMetadata 
} from '../../data/indiaGeoJson';
import { formatNumber, formatINR } from '../../utils/formatters';
import { Layers, ZoomIn, ZoomOut, RotateCcw, MapPin, X, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';

export type MapMetricType = 'reach' | 'funding' | 'projects' | 'beneficiaries' | 'volunteers';

interface IndiaImpactMapProps {
  onSelectState?: (stateName: string) => void;
  selectedState?: string | null;
}

export const IndiaImpactMap: React.FC<IndiaImpactMapProps> = ({
  onSelectState,
  selectedState: externalSelectedState
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const [activeMetric, setActiveMetric] = useState<MapMetricType>('reach');
  const [selectedState, setSelectedState] = useState<string | null>(externalSelectedState || null);
  const [hoveredState, setHoveredState] = useState<StateGeoMetadata | null>(null);

  const activeStateMetadata = selectedState ? STATE_METADATA_MAP[selectedState] || null : null;

  // Sync external selectedState prop
  useEffect(() => {
    if (externalSelectedState !== undefined) {
      setSelectedState(externalSelectedState);
      if (externalSelectedState && STATE_METADATA_MAP[externalSelectedState] && mapInstanceRef.current) {
        const meta = STATE_METADATA_MAP[externalSelectedState];
        mapInstanceRef.current.flyTo(meta.center, 7, { duration: 1.2 });
      }
    }
  }, [externalSelectedState]);

  // Calculate max metric value for dynamic choropleth scaling
  const getMetricValue = (meta: StateGeoMetadata, metric: MapMetricType): number => {
    switch (metric) {
      case 'reach': return meta.reach;
      case 'funding': return meta.fundingLakhs;
      case 'projects': return meta.projectsCount;
      case 'beneficiaries': return meta.beneficiaries;
      case 'volunteers': return meta.volunteers;
      default: return meta.reach;
    }
  };

  const allMetValues = Object.values(STATE_METADATA_MAP).map(m => getMetricValue(m, activeMetric));
  const maxMetricVal = Math.max(...allMetValues, 1);

  // Professional Teal Choropleth Color Scale
  const getChoroplethColor = (val: number, max: number): string => {
    const ratio = val / max;
    if (ratio > 0.75) return '#0f766e'; // Deep Teal
    if (ratio > 0.45) return '#0d9488'; // Medium Teal
    if (ratio > 0.20) return '#2dd4bf'; // Light Teal
    if (ratio > 0.05) return '#99f6e4'; // Soft Teal
    return '#f1f5f9'; // Neutral Slate
  };

  // Initialize Real Leaflet Map with CartoDB Positron Basemap
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on India
    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // CartoDB Positron Light Basemap Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Render Project Location Markers
    NGO_PROJECT_LOCATIONS.forEach(proj => {
      const radius = proj.scale === 'major' ? 9 : proj.scale === 'regional' ? 6 : 4;
      const color = proj.status === 'At Risk' ? '#dc2626' : proj.status === 'Completed' ? '#0284c7' : '#0f766e';

      const circle = L.circleMarker([proj.lat, proj.lng], {
        radius,
        color: '#ffffff',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95
      }).addTo(map);

      // Popup on Marker Hover / Click
      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; font-size: 11px; color: #0f172a;">
          <div style="font-weight: 700; color: #0f766e; margin-bottom: 2px;">${proj.name}</div>
          <div style="color: #64748b; font-size: 10px; margin-bottom: 4px;">${proj.location} • ${proj.program}</div>
          <div style="display: flex; justify-content: space-between; gap: 8px; font-family: monospace; font-size: 10px;">
            <span>Reach: <strong>${formatNumber(proj.beneficiaries)}</strong></span>
            <span>Budget: <strong>₹${proj.fundingLakhs}L</strong></span>
          </div>
        </div>
      `;
      circle.bindPopup(popupContent);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update GeoJSON State Polygons whenever activeMetric or selectedState changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    const geoJsonLayer = L.geoJSON(INDIA_STATES_GEOJSON as any, {
      style: (feature) => {
        const stateName = feature?.properties?.name;
        const meta = STATE_METADATA_MAP[stateName];
        const val = meta ? getMetricValue(meta, activeMetric) : 0;
        const fillColor = meta ? getChoroplethColor(val, maxMetricVal) : '#e2e8f0';
        const isSelected = stateName === selectedState;

        return {
          fillColor,
          weight: isSelected ? 2.5 : 1.2,
          opacity: 1,
          color: isSelected ? '#0f766e' : '#cbd5e1',
          fillOpacity: isSelected ? 0.9 : 0.75
        };
      },
      onEachFeature: (feature, layer) => {
        const stateName = feature.properties.name;
        const meta = STATE_METADATA_MAP[stateName];

        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({
              weight: 2.5,
              color: '#0f766e',
              fillOpacity: 0.95
            });
            if (meta) setHoveredState(meta);
          },
          mouseout: (e) => {
            const l = e.target;
            const isSelected = stateName === selectedState;
            l.setStyle({
              weight: isSelected ? 2.5 : 1.2,
              color: isSelected ? '#0f766e' : '#cbd5e1',
              fillOpacity: isSelected ? 0.9 : 0.75
            });
            setHoveredState(null);
          },
          click: (e) => {
            setSelectedState(stateName);
            if (onSelectState) onSelectState(stateName);
            if (meta) {
              map.flyTo(meta.center, 7, { duration: 1.2 });
            }
          }
        });
      }
    }).addTo(map);

    geoJsonLayerRef.current = geoJsonLayer;
  }, [activeMetric, selectedState]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    setSelectedState(null);
    if (onSelectState) onSelectState('All India');
    mapInstanceRef.current?.flyTo([22.5937, 78.9629], 5, { duration: 1.2 });
  };

  return (
    <div className="relative w-full h-[520px] rounded-xl border border-slate-200 bg-slate-50 overflow-hidden font-sans">
      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Metric Layer Selector */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-1 text-xs">
        <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
          <Layers className="w-3 h-3 text-teal-700" /> Layer:
        </span>
        {(['reach', 'funding', 'projects', 'beneficiaries', 'volunteers'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setActiveMetric(m)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${
              activeMetric === m
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {m === 'funding' ? 'Funding (₹)' : m}
          </button>
        ))}
      </div>

      {/* Map Control Tools (Zoom In, Zoom Out, Reset View) */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 rounded-lg bg-white/95 border border-slate-200 text-slate-700 hover:text-teal-800 shadow-sm hover:bg-slate-50 transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 rounded-lg bg-white/95 border border-slate-200 text-slate-700 hover:text-teal-800 shadow-sm hover:bg-slate-50 transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          title="Reset India View"
          className="p-2 rounded-lg bg-white/95 border border-slate-200 text-slate-700 hover:text-teal-800 shadow-sm hover:bg-slate-50 transition flex items-center gap-1 text-xs font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Dynamic Choropleth Color Scale Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Choropleth Intensity ({activeMetric.toUpperCase()})
        </span>
        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-600">
          <span>Low</span>
          <div className="flex h-2.5 w-24 rounded overflow-hidden border border-slate-200">
            <span className="flex-1 bg-[#ccfbf1]" />
            <span className="flex-1 bg-[#2dd4bf]" />
            <span className="flex-1 bg-[#0d9488]" />
            <span className="flex-1 bg-[#0f766e]" />
          </div>
          <span>High ({activeMetric === 'funding' ? `₹${(maxMetricVal/100).toFixed(1)}Cr` : formatNumber(maxMetricVal)})</span>
        </div>
      </div>

      {/* Hover State Tooltip */}
      {hoveredState && !activeStateMetadata && (
        <div className="absolute top-16 left-3 z-10 bg-white/95 border border-slate-200 shadow-lg p-3 rounded-xl text-xs space-y-1 max-w-xs animate-in fade-in zoom-in-95">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-700" /> {hoveredState.name}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
            <div>Reach: <strong className="text-teal-800">{formatNumber(hoveredState.reach)}</strong></div>
            <div>Funding: <strong className="text-slate-800">₹{(hoveredState.fundingLakhs/100).toFixed(2)} Cr</strong></div>
            <div>Projects: <strong className="text-slate-800">{hoveredState.projectsCount}</strong></div>
            <div>Score: <strong className="text-emerald-700">{hoveredState.impactScore}/100</strong></div>
          </div>
        </div>
      )}

      {/* Selected State Detail Panel Drawer */}
      {activeStateMetadata && (
        <div className="absolute top-14 right-3 bottom-14 z-20 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 flex flex-col justify-between text-xs animate-in slide-in-from-right duration-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider block">State Detail Panel</span>
                <h3 className="text-base font-extrabold text-slate-900">{activeStateMetadata.name}</h3>
              </div>
              <button
                onClick={() => setSelectedState(null)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100">
                <span className="text-[10px] text-teal-800 font-semibold block">PEOPLE REACHED</span>
                <span className="font-mono font-extrabold text-teal-900 text-sm">{formatNumber(activeStateMetadata.reach)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block">ACTIVE PROJECTS</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">{activeStateMetadata.projectsCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block">FUNDING DEPLOYED</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">₹{(activeStateMetadata.fundingLakhs/100).toFixed(2)} Cr</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] text-emerald-800 font-semibold block">IMPACT SCORE</span>
                <span className="font-mono font-extrabold text-emerald-900 text-sm">{activeStateMetadata.impactScore}/100</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Program Verticals</span>
              <div className="flex flex-wrap gap-1">
                {activeStateMetadata.topPrograms.map(tp => (
                  <span key={tp} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold">
                    {tp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setSelectedState(null)}
              className="w-full py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1.5"
            >
              View State Analytics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
