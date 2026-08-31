// High-fidelity, self-contained SVG Data URIs for Solar Equipment
// These never fail to load regardless of network, ad-blockers, or sandbox restrictions.

export const SOLAR_PANEL_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f2b48"/>
    </linearGradient>
    <linearGradient id="cellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="40%" stop-color="#172554"/>
      <stop offset="70%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e40af"/>
    </linearGradient>
    <linearGradient id="glassSheen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>
      <stop offset="30%" stop-color="rgba(255,255,255,0.05)"/>
      <stop offset="70%" stop-color="rgba(255,255,255,0)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.15)"/>
    </linearGradient>
    <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="50%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="600" fill="url(#skyGrad)"/>

  <!-- Sun Rays background effect -->
  <circle cx="700" cy="100" r="180" fill="#f59e0b" opacity="0.15" filter="url(#glow)"/>
  <circle cx="700" cy="100" r="80" fill="#fbbf24" opacity="0.25"/>

  <!-- Main Solar Panel (Perspective / 3D Look) -->
  <g transform="translate(140, 70)">
    <!-- Outer Silver Frame -->
    <rect x="0" y="0" width="520" height="420" rx="12" fill="url(#frameGrad)" stroke="#475569" stroke-width="4"/>
    <rect x="12" y="12" width="496" height="396" rx="6" fill="#020617"/>

    <!-- Solar Cells Matrix (6x10 Mono Cells) -->
    <!-- Rows -->
    <g fill="url(#cellGrad)" stroke="#38bdf8" stroke-width="1.2" stroke-opacity="0.6">
      <!-- Col 1 -->
      <rect x="18" y="18" width="76" height="60" rx="3"/>
      <rect x="18" y="82" width="76" height="60" rx="3"/>
      <rect x="18" y="146" width="76" height="60" rx="3"/>
      <rect x="18" y="210" width="76" height="60" rx="3"/>
      <rect x="18" y="274" width="76" height="60" rx="3"/>
      <rect x="18" y="338" width="76" height="60" rx="3"/>

      <!-- Col 2 -->
      <rect x="98" y="18" width="76" height="60" rx="3"/>
      <rect x="98" y="82" width="76" height="60" rx="3"/>
      <rect x="98" y="146" width="76" height="60" rx="3"/>
      <rect x="98" y="210" width="76" height="60" rx="3"/>
      <rect x="98" y="274" width="76" height="60" rx="3"/>
      <rect x="98" y="338" width="76" height="60" rx="3"/>

      <!-- Col 3 -->
      <rect x="178" y="18" width="76" height="60" rx="3"/>
      <rect x="178" y="82" width="76" height="60" rx="3"/>
      <rect x="178" y="146" width="76" height="60" rx="3"/>
      <rect x="178" y="210" width="76" height="60" rx="3"/>
      <rect x="178" y="274" width="76" height="60" rx="3"/>
      <rect x="178" y="338" width="76" height="60" rx="3"/>

      <!-- Col 4 -->
      <rect x="258" y="18" width="76" height="60" rx="3"/>
      <rect x="258" y="82" width="76" height="60" rx="3"/>
      <rect x="258" y="146" width="76" height="60" rx="3"/>
      <rect x="258" y="210" width="76" height="60" rx="3"/>
      <rect x="258" y="274" width="76" height="60" rx="3"/>
      <rect x="258" y="338" width="76" height="60" rx="3"/>

      <!-- Col 5 -->
      <rect x="338" y="18" width="76" height="60" rx="3"/>
      <rect x="338" y="82" width="76" height="60" rx="3"/>
      <rect x="338" y="146" width="76" height="60" rx="3"/>
      <rect x="338" y="210" width="76" height="60" rx="3"/>
      <rect x="338" y="274" width="76" height="60" rx="3"/>
      <rect x="338" y="338" width="76" height="60" rx="3"/>

      <!-- Col 6 -->
      <rect x="418" y="18" width="84" height="60" rx="3"/>
      <rect x="418" y="82" width="84" height="60" rx="3"/>
      <rect x="418" y="146" width="84" height="60" rx="3"/>
      <rect x="418" y="210" width="84" height="60" rx="3"/>
      <rect x="418" y="274" width="84" height="60" rx="3"/>
      <rect x="418" y="338" width="84" height="60" rx="3"/>
    </g>

    <!-- Busbars / Silver Conducting lines -->
    <path d="M 12 48 L 508 48 M 12 112 L 508 112 M 12 176 L 508 176 M 12 240 L 508 240 M 12 304 L 508 304 M 12 368 L 508 368" stroke="#ffffff" stroke-width="0.8" opacity="0.75"/>
    <path d="M 56 12 L 56 408 M 136 12 L 136 408 M 216 12 L 216 408 M 296 12 L 296 408 M 376 12 L 376 408 M 460 12 L 460 408" stroke="#ffffff" stroke-width="0.8" opacity="0.75"/>

    <!-- Glass Reflection Sheen -->
    <polygon points="12,12 350,12 120,408 12,408" fill="url(#glassSheen)"/>
    <polygon points="280,12 450,12 300,408 180,408" fill="url(#glassSheen)" opacity="0.5"/>
  </g>

  <!-- High-end Badge Overlays -->
  <g transform="translate(60, 520)">
    <rect width="220" height="42" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <circle cx="24" cy="21" r="10" fill="#f59e0b"/>
    <text x="44" y="26" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Longi Hi-MO X6 585W</text>
  </g>

  <g transform="translate(520, 520)">
    <rect width="220" height="42" rx="8" fill="#065f46" stroke="#059669" stroke-width="1.5"/>
    <text x="32" y="26" fill="#34d399" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Tier-1 TopCon N-Type</text>
  </g>
</svg>
`)}`;

export const INVERTER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="invBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="50%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="lcdGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="screenDisplay" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="orangeAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="600" fill="url(#invBg)"/>

  <!-- Glow effect -->
  <circle cx="400" cy="270" r="240" fill="#0284c7" opacity="0.12"/>

  <!-- Inverter Body -->
  <g transform="translate(240, 50)">
    <!-- Shadow -->
    <rect x="15" y="15" width="320" height="460" rx="28" fill="#000000" opacity="0.4"/>

    <!-- Main White/Silver Case -->
    <rect x="0" y="0" width="320" height="460" rx="24" fill="url(#chassisGrad)" stroke="#94a3b8" stroke-width="2"/>

    <!-- Top Orange Brand Accent Strip -->
    <rect x="0" y="0" width="320" height="18" rx="10" fill="url(#orangeAccent)"/>

    <!-- Brand Header -->
    <text x="160" y="52" fill="#0f172a" font-family="system-ui, sans-serif" font-size="22" font-weight="900" text-anchor="middle" letter-spacing="2">INVEREX</text>
    <text x="160" y="72" fill="#ea580c" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="1">NITROX 6KW HYBRID</text>

    <!-- LCD Glass Display Window -->
    <rect x="35" y="95" width="250" height="180" rx="14" fill="url(#lcdGrad)" stroke="#334155" stroke-width="3"/>
    <rect x="45" y="105" width="230" height="160" rx="10" fill="url(#screenDisplay)"/>

    <!-- Screen UI Graphics -->
    <g fill="#ffffff" font-family="system-ui, sans-serif">
      <text x="60" y="132" font-size="12" font-weight="bold" opacity="0.9">SOLAR PV POWER</text>
      <text x="60" y="165" font-size="26" font-weight="900">5,840 <tspan font-size="14">W</tspan></text>
      
      <line x1="60" y1="180" x2="255" y2="180" stroke="#bae6fd" stroke-width="1.5" opacity="0.5"/>

      <text x="60" y="205" font-size="11" font-weight="bold">GRID: 230V 50Hz</text>
      <text x="165" y="205" font-size="11" font-weight="bold">BATT: 53.2V</text>
      
      <!-- Energy flow arrows -->
      <circle cx="70" cy="235" r="10" fill="#22c55e"/>
      <text x="86" y="239" font-size="11" font-weight="bold">NORMAL (EXPORTING)</text>
    </g>

    <!-- Navigation Buttons -->
    <circle cx="85" cy="305" r="12" fill="#475569" stroke="#64748b"/>
    <circle cx="135" cy="305" r="12" fill="#475569" stroke="#64748b"/>
    <circle cx="185" cy="305" r="12" fill="#475569" stroke="#64748b"/>
    <circle cx="235" cy="305" r="12" fill="#ea580c" stroke="#f97316"/>

    <!-- Bottom Vent Grill -->
    <g stroke="#64748b" stroke-width="3" stroke-linecap="round">
      <line x1="50" y1="350" x2="270" y2="350"/>
      <line x1="50" y1="365" x2="270" y2="365"/>
      <line x1="50" y1="380" x2="270" y2="380"/>
      <line x1="50" y1="395" x2="270" y2="395"/>
    </g>

    <!-- Bottom Connection Terminals / Wi-Fi Stick -->
    <rect x="70" y="445" width="40" height="25" rx="4" fill="#334155"/>
    <rect x="130" y="445" width="60" height="25" rx="4" fill="#334155"/>
    <rect x="210" y="445" width="40" height="25" rx="4" fill="#0284c7"/>
    <text x="230" y="462" fill="#ffffff" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">WiFi</text>
  </g>

  <!-- Feature Badges -->
  <g transform="translate(60, 520)">
    <rect width="200" height="42" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="25" y="26" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Dual MPPT + WiFi</text>
  </g>

  <g transform="translate(540, 520)">
    <rect width="200" height="42" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="25" y="26" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Net-Metering IP65</text>
  </g>
</svg>
`)}`;

export const COMPLETE_SYSTEM_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="60%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#bae6fd"/>
    </linearGradient>
    <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="panelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e40af"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="800" height="600" fill="url(#sky)"/>

  <!-- Sun -->
  <circle cx="680" cy="110" r="55" fill="#fbbf24"/>
  <circle cx="680" cy="110" r="75" fill="#fef08a" opacity="0.4"/>

  <!-- Ground / Greenery -->
  <rect y="460" width="800" height="140" fill="#15803d"/>
  <rect y="480" width="800" height="120" fill="#166534"/>

  <!-- Modern House / Building -->
  <g transform="translate(100, 200)">
    <!-- House walls -->
    <polygon points="40,160 560,160 560,280 40,280" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    <!-- House Foundation -->
    <rect x="20" y="270" width="560" height="20" fill="#94a3b8"/>

    <!-- House Door & Windows -->
    <rect x="260" y="195" width="55" height="85" fill="#334155" rx="4"/>
    <rect x="90" y="185" width="70" height="55" fill="#0284c7" stroke="#ffffff" stroke-width="3" rx="4"/>
    <rect x="430" y="185" width="70" height="55" fill="#0284c7" stroke="#ffffff" stroke-width="3" rx="4"/>

    <!-- Slanted Rooftop for Solar -->
    <polygon points="0,160 300,30 600,160" fill="url(#roofGrad)" stroke="#0f172a" stroke-width="3"/>

    <!-- Solar Panels Array on Left Pitch (3D angled) -->
    <g transform="translate(70, 70) skewY(15) scale(0.9, 0.7)">
      <!-- Row 1 -->
      <rect x="0" y="0" width="65" height="45" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" rx="2"/>
      <rect x="70" y="0" width="65" height="45" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" rx="2"/>
      <rect x="140" y="0" width="65" height="45" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" rx="2"/>
      <rect x="210" y="0" width="65" height="45" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" rx="2"/>
      <!-- Row 2 -->
      <rect x="0" y="50" width="65" height="45" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" rx="2"/>
      <rect x="70" y="50" width="65" height="45" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" rx="2"/>
      <rect x="140" y="50" width="65" height="45" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" rx="2"/>
      <rect x="210" y="50" width="65" height="45" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" rx="2"/>
    </g>

    <!-- Solar Panels Array on Right Pitch -->
    <g transform="translate(320, 110) skewY(-15) scale(0.9, 0.7)">
      <!-- Row 1 -->
      <rect x="0" y="0" width="65" height="45" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" rx="2"/>
      <rect x="70" y="0" width="65" height="45" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" rx="2"/>
      <rect x="140" y="0" width="65" height="45" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" rx="2"/>
      <!-- Row 2 -->
      <rect x="0" y="50" width="65" height="45" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" rx="2"/>
      <rect x="70" y="50" width="65" height="45" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" rx="2"/>
      <rect x="140" y="50" width="65" height="45" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" rx="2"/>
    </g>

    <!-- Electric Green Net-Meter on wall -->
    <rect x="40" y="200" width="28" height="35" fill="#0f172a" rx="3"/>
    <circle cx="54" cy="212" r="6" fill="#22c55e"/>
    <text x="54" y="228" fill="#4ade80" font-family="sans-serif" font-size="6" font-weight="bold" text-anchor="middle">NET</text>
  </g>

  <!-- Banner Overlays -->
  <g transform="translate(60, 40)">
    <rect width="290" height="44" rx="10" fill="#0f172a" opacity="0.9" stroke="#334155" stroke-width="1.5"/>
    <text x="20" y="28" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">10kW Complete On-Grid Turnkey</text>
  </g>

  <g transform="translate(490, 40)">
    <rect width="250" height="44" rx="10" fill="#065f46" opacity="0.95" stroke="#10b981" stroke-width="1.5"/>
    <text x="20" y="28" fill="#34d399" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Save 1,200+ Units / Month</text>
  </g>
</svg>
`)}`;

export function getEquipmentFallbackImage(category: string, title?: string): string {
  const t = (title || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  if (cat === 'panel' || t.includes('panel') || t.includes('longi') || t.includes('jinko') || t.includes('canadian')) {
    return SOLAR_PANEL_IMAGE;
  }
  if (cat === 'inverter' || t.includes('inverter') || t.includes('nitrox') || t.includes('growatt') || t.includes('huawei')) {
    return INVERTER_IMAGE;
  }
  return COMPLETE_SYSTEM_IMAGE;
}
