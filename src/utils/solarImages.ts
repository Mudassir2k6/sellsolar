// High-fidelity, self-contained SVG Data URIs for Solar Equipment
// Encoded as standard base64 data URIs so they load reliably across all browsers, webviews, and iframes.

function toSvgDataUri(svg: string): string {
  const clean = svg.trim();
  if (typeof Buffer !== 'undefined') {
    return `data:image/svg+xml;base64,${Buffer.from(clean).toString('base64')}`;
  }
  if (typeof btoa !== 'undefined') {
    try {
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(clean)))}`;
    } catch {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(clean)}`;
    }
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(clean)}`;
}

export const SOLAR_PANEL_IMAGE = toSvgDataUri(`
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
    <text x="44" y="26" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Longi / Jinko / Canadian</text>
  </g>

  <g transform="translate(520, 520)">
    <rect width="220" height="42" rx="8" fill="#065f46" stroke="#059669" stroke-width="1.5"/>
    <text x="32" y="26" fill="#34d399" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Tier-1 TopCon N-Type</text>
  </g>
</svg>
`);

export const INVERTER_IMAGE = toSvgDataUri(`
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
    <text x="160" y="52" fill="#0f172a" font-family="system-ui, sans-serif" font-size="22" font-weight="900" text-anchor="middle" letter-spacing="2">INVEREX / CROWN</text>
    <text x="160" y="72" fill="#ea580c" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="1">HYBRID ON/OFF GRID SMART INVERTER</text>

    <!-- LCD Glass Display Window -->
    <rect x="35" y="95" width="250" height="180" rx="14" fill="url(#lcdGrad)" stroke="#334155" stroke-width="3"/>
    <rect x="45" y="105" width="230" height="160" rx="10" fill="url(#screenDisplay)"/>

    <!-- Screen UI Graphics -->
    <g fill="#ffffff" font-family="system-ui, sans-serif">
      <text x="60" y="132" font-size="12" font-weight="bold" opacity="0.9">SOLAR PV GENERATION</text>
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
`);

export const BATTERY_IMAGE = toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="batBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="batCase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="emeraldLed" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#batBg)"/>
  <circle cx="400" cy="270" r="220" fill="#10b981" opacity="0.12"/>
  <g transform="translate(180, 80)">
    <rect x="0" y="0" width="440" height="380" rx="20" fill="url(#batCase)" stroke="#334155" stroke-width="3"/>
    <rect x="0" y="0" width="440" height="24" rx="10" fill="#047857"/>
    <text x="220" y="65" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="22" font-weight="900" text-anchor="middle" letter-spacing="2">NARADA / PHOENIX / OSAKA</text>
    <text x="220" y="88" fill="#34d399" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="1">48V 100Ah LiFePO4 / TUBULAR DEEP CYCLE</text>
    <rect x="40" y="120" width="360" height="150" rx="12" fill="#020617" stroke="#1e293b" stroke-width="2"/>
    <text x="65" y="160" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold">BATTERY STATUS</text>
    <text x="65" y="195" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="900">53.4 V <tspan font-size="14" fill="#10b981">100% S.O.C</tspan></text>
    <g transform="translate(65, 215)">
      <rect x="0" y="0" width="55" height="16" rx="4" fill="url(#emeraldLed)"/>
      <rect x="62" y="0" width="55" height="16" rx="4" fill="url(#emeraldLed)"/>
      <rect x="124" y="0" width="55" height="16" rx="4" fill="url(#emeraldLed)"/>
      <rect x="186" y="0" width="55" height="16" rx="4" fill="url(#emeraldLed)"/>
      <rect x="248" y="0" width="55" height="16" rx="4" fill="url(#emeraldLed)"/>
    </g>
    <circle cx="80" cy="330" r="16" fill="#ef4444" stroke="#f87171" stroke-width="2"/>
    <text x="80" y="335" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">+</text>
    <circle cx="360" cy="330" r="16" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
    <text x="360" y="335" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">-</text>
  </g>
  <g transform="translate(60, 520)">
    <rect width="220" height="42" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="25" y="26" fill="#34d399" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">6,000+ Cycle Life</text>
  </g>
  <g transform="translate(520, 520)">
    <rect width="220" height="42" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="25" y="26" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Built-in Smart BMS</text>
  </g>
</svg>
`);

export const COMPLETE_SYSTEM_IMAGE = toSvgDataUri(`
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
`);

export const SELL_SOLAR_PROMO_IMAGE = toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="sellBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="60%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
    <linearGradient id="goldSun" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="pnlG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#sellBg)"/>
  <circle cx="680" cy="90" r="140" fill="url(#goldSun)" opacity="0.25"/>
  <circle cx="680" cy="90" r="60" fill="url(#goldSun)"/>
  
  <g transform="translate(80, 100)">
    <rect x="0" y="20" width="220" height="150" rx="8" fill="url(#pnlG)" stroke="#38bdf8" stroke-width="2" transform="skewY(-4)"/>
    <rect x="180" y="0" width="220" height="150" rx="8" fill="url(#pnlG)" stroke="#38bdf8" stroke-width="2" transform="skewY(-4)"/>
    <rect x="360" y="-20" width="220" height="150" rx="8" fill="url(#pnlG)" stroke="#38bdf8" stroke-width="2" transform="skewY(-4)"/>
  </g>
  
  <g transform="translate(50, 310)">
    <rect width="360" height="80" rx="14" fill="#0f172a" opacity="0.95" stroke="#334155" stroke-width="2"/>
    <text x="25" y="38" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="900">Post Free Solar Ads</text>
    <text x="25" y="62" fill="#34d399" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Connect with 10,000+ Monthly Buyers</text>
  </g>
  <g transform="translate(460, 310)">
    <rect width="290" height="80" rx="14" fill="#065f46" opacity="0.95" stroke="#10b981" stroke-width="2"/>
    <text x="25" y="38" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="900">0% Commission</text>
    <text x="25" y="62" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Direct WhatsApp &amp; Call Inquiries</text>
  </g>
</svg>
`);

export const TURNKEY_INSTALL_PROMO_IMAGE = toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="instBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="60%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#instBg)"/>
  
  <g transform="translate(100, 40)">
    <polygon points="50,220 300,70 550,220" fill="#1e293b" stroke="#334155" stroke-width="3"/>
    <g transform="translate(120, 110) skewY(14) scale(0.9, 0.7)">
      <rect x="0" y="0" width="70" height="50" fill="#0284c7" stroke="#67e8f9" stroke-width="1.5" rx="2"/>
      <rect x="80" y="0" width="70" height="50" fill="#0284c7" stroke="#67e8f9" stroke-width="1.5" rx="2"/>
      <rect x="160" y="0" width="70" height="50" fill="#0284c7" stroke="#67e8f9" stroke-width="1.5" rx="2"/>
      <rect x="0" y="60" width="70" height="50" fill="#0284c7" stroke="#67e8f9" stroke-width="1.5" rx="2"/>
      <rect x="80" y="60" width="70" height="50" fill="#0284c7" stroke="#67e8f9" stroke-width="1.5" rx="2"/>
      <rect x="160" y="60" width="70" height="50" fill="#0284c7" stroke="#67e8f9" stroke-width="1.5" rx="2"/>
    </g>
    <rect x="90" y="220" width="420" height="100" fill="#f8fafc"/>
    <rect x="120" y="240" width="40" height="50" fill="#0284c7" rx="3"/>
    <rect x="420" y="240" width="40" height="50" fill="#0284c7" rx="3"/>
    <rect x="280" y="235" width="40" height="50" fill="#0f172a" rx="4"/>
    <circle cx="300" cy="250" r="8" fill="#10b981"/>
    <text x="300" y="272" fill="#34d399" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">NET</text>
  </g>
  
  <g transform="translate(50, 310)">
    <rect width="360" height="80" rx="14" fill="#0f172a" opacity="0.95" stroke="#334155" stroke-width="2"/>
    <text x="25" y="38" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="900">Turnkey EPC Installation</text>
    <text x="25" y="62" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">On-Grid, Hybrid &amp; Commercial Systems</text>
  </g>
  <g transform="translate(460, 310)">
    <rect width="290" height="80" rx="14" fill="#065f46" opacity="0.95" stroke="#10b981" stroke-width="2"/>
    <text x="25" y="38" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="900">Green Net-Metering</text>
    <text x="25" y="62" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">DISCO &amp; NEPRA Approval Handled</text>
  </g>
</svg>
`);

export const CABLES_WIRING_IMAGE = toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="cableBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#1e1e38"/>
    </linearGradient>
    <linearGradient id="copperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="50%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
    <linearGradient id="tinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="50%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
    <linearGradient id="redSheath" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <linearGradient id="blackSheath" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>

  <rect width="800" height="600" fill="url(#cableBg)"/>
  <circle cx="400" cy="270" r="230" fill="#ea580c" opacity="0.1"/>

  <!-- Cable Coils Graphic -->
  <g transform="translate(180, 70)">
    <!-- Red Cable Coil (Positive DC) -->
    <ellipse cx="140" cy="180" rx="140" ry="110" fill="none" stroke="url(#redSheath)" stroke-width="26"/>
    <ellipse cx="140" cy="180" rx="110" ry="85" fill="none" stroke="url(#redSheath)" stroke-width="22"/>
    <ellipse cx="140" cy="180" rx="80" ry="60" fill="none" stroke="url(#redSheath)" stroke-width="20"/>

    <!-- Black Cable Coil (Negative DC) -->
    <ellipse cx="300" cy="240" rx="140" ry="110" fill="none" stroke="url(#blackSheath)" stroke-width="26"/>
    <ellipse cx="300" cy="240" rx="110" ry="85" fill="none" stroke="url(#blackSheath)" stroke-width="22"/>
    <ellipse cx="300" cy="240" rx="80" ry="60" fill="none" stroke="url(#blackSheath)" stroke-width="20"/>

    <!-- Cut Cable Ends Showing Pure Tinned Copper Strands -->
    <g transform="translate(390, 80) rotate(-35)">
      <rect x="0" y="0" width="130" height="34" rx="17" fill="url(#redSheath)" stroke="#f87171" stroke-width="2"/>
      <rect x="90" y="5" width="40" height="24" rx="12" fill="#ffffff" opacity="0.8"/>
      <rect x="110" y="7" width="55" height="20" rx="4" fill="url(#copperGrad)"/>
      <rect x="135" y="8" width="45" height="18" rx="2" fill="url(#tinGrad)"/>
    </g>

    <g transform="translate(20, 290) rotate(25)">
      <rect x="0" y="0" width="130" height="34" rx="17" fill="url(#blackSheath)" stroke="#64748b" stroke-width="2"/>
      <rect x="90" y="5" width="40" height="24" rx="12" fill="#ffffff" opacity="0.8"/>
      <rect x="110" y="7" width="55" height="20" rx="4" fill="url(#copperGrad)"/>
      <rect x="135" y="8" width="45" height="18" rx="2" fill="url(#tinGrad)"/>
    </g>
  </g>

  <!-- Spec & Brand Badges -->
  <g transform="translate(60, 510)">
    <rect width="250" height="46" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
    <text x="24" y="28" fill="#f97316" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Fast • Pakistan Cables • MCI</text>
  </g>

  <g transform="translate(480, 510)">
    <rect width="260" height="46" rx="10" fill="#065f46" stroke="#10b981" stroke-width="1.5"/>
    <text x="24" y="28" fill="#34d399" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">4mm² &amp; 6mm² TUV DC XLPO</text>
  </g>
</svg>
`);

export const SOLAR_ACCESSORIES_IMAGE = toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="accBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#141f2e"/>
    </linearGradient>
    <linearGradient id="dbBoxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="chintBlue" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
  </defs>

  <rect width="800" height="600" fill="url(#accBg)"/>
  <circle cx="400" cy="270" r="230" fill="#0284c7" opacity="0.1"/>

  <!-- IP65 Distribution Box & Breaker Gear -->
  <g transform="translate(180, 70)">
    <!-- DB Enclosure Base -->
    <rect x="0" y="0" width="440" height="380" rx="20" fill="url(#dbBoxGrad)" stroke="#64748b" stroke-width="4"/>
    <rect x="18" y="18" width="404" height="344" rx="14" fill="#0f172a" stroke="#334155" stroke-width="2"/>

    <!-- DIN Rail -->
    <rect x="35" y="180" width="370" height="24" fill="#94a3b8" rx="3"/>

    <!-- CHINT / TOMZN DC 2P Breaker -->
    <g transform="translate(60, 110)">
      <rect width="70" height="150" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="10" y="10" width="50" height="30" rx="4" fill="url(#chintBlue)"/>
      <text x="35" y="28" fill="#ffffff" font-family="sans-serif" font-size="9" font-weight="900" text-anchor="middle">CHINT</text>
      <!-- Switch Lever -->
      <rect x="22" y="65" width="26" height="45" rx="5" fill="#dc2626"/>
      <circle cx="35" cy="85" r="4" fill="#ffffff"/>
      <text x="35" y="138" fill="#0f172a" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">2P 32A DC</text>
    </g>

    <!-- DC SPD Surge Protector -->
    <g transform="translate(145, 110)">
      <rect width="70" height="150" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="10" y="10" width="50" height="25" rx="3" fill="#ea580c"/>
      <text x="35" y="26" fill="#ffffff" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">TOMZN</text>
      <!-- SPD Status Windows (Green=OK) -->
      <rect x="18" y="55" width="34" height="22" rx="4" fill="#22c55e" stroke="#15803d"/>
      <text x="35" y="70" fill="#ffffff" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">1000V</text>
      <text x="35" y="138" fill="#0f172a" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">DC SPD 40kA</text>
    </g>

    <!-- AC 4P Breaker -->
    <g transform="translate(230, 110)">
      <rect width="95" height="150" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="10" y="10" width="75" height="25" rx="3" fill="#0284c7"/>
      <text x="47" y="26" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">AC 4P 63A</text>
      <rect x="35" y="65" width="25" height="45" rx="5" fill="#15803d"/>
      <text x="47" y="138" fill="#0f172a" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">4P 400V</text>
    </g>

    <!-- Voltage / Ampere Digital Protector -->
    <g transform="translate(340, 110)">
      <rect width="65" height="150" rx="8" fill="#020617" stroke="#334155" stroke-width="2"/>
      <rect x="8" y="25" width="49" height="50" rx="6" fill="#090d16" stroke="#1e293b"/>
      <text x="32" y="48" fill="#ef4444" font-family="monospace" font-size="16" font-weight="bold" text-anchor="middle">230</text>
      <text x="32" y="66" fill="#22c55e" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">16.4</text>
      <text x="32" y="138" fill="#94a3b8" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">V/A Meter</text>
    </g>
  </g>

  <!-- Spec Badges -->
  <g transform="translate(60, 510)">
    <rect width="280" height="46" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
    <text x="24" y="28" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">CHINT • CNC • TOMZN Switchgear</text>
  </g>

  <g transform="translate(460, 510)">
    <rect width="280" height="46" rx="10" fill="#065f46" stroke="#10b981" stroke-width="1.5"/>
    <text x="24" y="28" fill="#34d399" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Distribution Boxes &amp; Surge SPDs</text>
  </g>
</svg>
`);

export function getEquipmentFallbackImage(category: string, title?: string): string {
  const t = (title || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  if (
    cat === 'cables_wiring' ||
    cat.includes('cable') ||
    cat.includes('wire') ||
    t.includes('cable') ||
    t.includes('wire') ||
    t.includes('fast cables') ||
    t.includes('pakistan cable') ||
    t.includes('mci cable') ||
    t.includes('jukai') ||
    t.includes('newage') ||
    t.includes('xlpo') ||
    t.includes('xlpe') ||
    t.includes('4mm') ||
    t.includes('6mm')
  ) {
    return CABLES_WIRING_IMAGE;
  }

  if (
    cat === 'solar_accessories' ||
    cat.includes('accessori') ||
    t.includes('breaker') ||
    t.includes('spd') ||
    t.includes('chint') ||
    t.includes('tomzen') ||
    t.includes('tomzn') ||
    t.includes('cnc') ||
    t.includes('mccb') ||
    t.includes('fuse') ||
    t.includes('distribution box') ||
    t.includes('copper rod') ||
    t.includes('earthing') ||
    t.includes('lightning arrester') ||
    t.includes('mc4') ||
    t.includes('protector') ||
    t.includes('changeover')
  ) {
    return SOLAR_ACCESSORIES_IMAGE;
  }

  if (
    cat.includes('battery') ||
    t.includes('battery') ||
    t.includes('narada') ||
    t.includes('phoenix') ||
    t.includes('osaka') ||
    t.includes('daewoo') ||
    t.includes('pylontech') ||
    t.includes('lifepo4') ||
    t.includes('tubular')
  ) {
    return BATTERY_IMAGE;
  }

  if (
    cat === 'panel' ||
    cat.includes('panel') ||
    t.includes('panel') ||
    t.includes('longi') ||
    t.includes('jinko') ||
    t.includes('canadian') ||
    t.includes('trina') ||
    t.includes('bifacial') ||
    t.includes('topcon') ||
    t.includes('mono') ||
    t.includes('himo')
  ) {
    return SOLAR_PANEL_IMAGE;
  }

  if (
    cat === 'inverter' ||
    cat.includes('inverter') ||
    t.includes('inverter') ||
    t.includes('nitrox') ||
    t.includes('growatt') ||
    t.includes('huawei') ||
    t.includes('inverex') ||
    t.includes('crown') ||
    t.includes('fronius') ||
    t.includes('knox') ||
    t.includes('goodwe') ||
    t.includes('solis') ||
    t.includes('hybrid')
  ) {
    return INVERTER_IMAGE;
  }

  return COMPLETE_SYSTEM_IMAGE;
}
