export const TIER1_PANELS_VERIFICATION = [
  {
    id: 'canadian-solar',
    name: 'Canadian Solar',
    badge: 'Tier-1 CSI Solar Portal',
    queryType: 'web',
    webLink: 'https://snquerycn.csisolar.com/indexEn.html',
    serialLocation: 'Barcode laminated under the front glass (top side) & side frame label',
    instructions: 'Enter the 14 to 16 digit serial number printed on the panel barcode sticker to verify manufacture date, model, and factory grade (Grade A).',
    supportedModels: ['HiKu6 (545W - 555W)', 'HiKu7 (650W - 670W)', 'TOPBiHiKu6 N-Type (585W)', 'TOPBiHiKu7 (620W - 700W)'],
    tips: 'Grade A modules will show full factory test parameters and flash-test data.'
  },
  {
    id: 'jinko-solar',
    name: 'Jinko Solar',
    badge: 'Official Jinko Authenticity Query',
    queryType: 'web',
    webLink: 'https://cs.jinkosolar.com/app/index.html#/customer-complaint/authenticity?lang=en_US',
    serialLocation: 'Laminated under front glass at top left/right corner + barcode on back junction box',
    instructions: 'Input the complete module barcode or serial number into Jinko’s customer service portal for real-time authenticity confirmation.',
    supportedModels: ['Tiger Neo N-Type (575W - 590W)', 'Tiger Neo 610W - 645W', 'Tiger Pro 540W - 560W', 'Bifacial Dual-Glass'],
    tips: 'Confirm that the serial number scanned from the QR code exactly matches the printed alphanumeric text beneath it.'
  },
  {
    id: 'longi-solar',
    name: 'LONGi Solar',
    badge: 'Global Portal + Pakistan Care Desk',
    queryType: 'web_and_email',
    webLink: 'https://www.longi.com/en/modules-authenticity/',
    email: 'LONGicare.pakistan@longi.com',
    serialLocation: 'Internal glass barcode with LONGi logo watermark + side frame bar code',
    instructions: 'Search your serial on the LONGi global authenticity page or send barcode photos to the dedicated Pakistan support desk for written verification.',
    supportedModels: ['Hi-MO 5 (540W - 560W)', 'Hi-MO 6 Explorer / Scientist (575W - 600W)', 'Hi-MO 7 Bifacial (580W - 620W)', 'Hi-MO X10 (640W - 655W)'],
    tips: 'Email LONGicare.pakistan@longi.com with module photo & serial for official warranty claim confirmation.'
  },
  {
    id: 'ja-solar',
    name: 'JA Solar',
    badge: 'JA Solar Traceability System',
    queryType: 'web',
    webLink: 'https://product.jasolar.com/en.html',
    serialLocation: 'Barcode strip under top edge glass + frame label',
    instructions: 'Query JA Solar’s product traceability portal to verify factory testing date, wattage binning, and warranty validity.',
    supportedModels: ['DeepBlue 3.0 (540W - 555W)', 'DeepBlue 4.0 Pro N-Type (570W - 605W)', 'Bifacial Double Glass N-Type'],
    tips: 'Genuine JA Solar panels feature laser-etched matrix codes that remain fully legible through the tempered glass.'
  },
  {
    id: 'astronergy',
    name: 'Astronergy (CHINT Solar)',
    badge: 'Astronergy Official Authenticity',
    queryType: 'web',
    webLink: 'https://www.astronergy.com/module-authenticity/',
    serialLocation: 'Inner glass sticker with Astronergy logo & serial number',
    instructions: 'Access Astronergy’s global module authenticity tool and paste your module serial number for an instant status report.',
    supportedModels: ['Astro N5 (570W - 590W)', 'Astro N7 (610W - 630W)', 'Astro N7s (440W - 460W)', '720W Commercial Bifacial'],
    tips: 'Ensures your modules belong to genuine Chint / Astronergy Tier-1 production lines.'
  },
  {
    id: 'trina-solar',
    name: 'Trina Solar',
    badge: 'Web Portal + iOS App',
    queryType: 'web_and_app',
    webLink: 'https://customerservice.trinasolar.com/#/moduleQuery/index',
    appLink: 'https://apps.apple.com/us/app/voice-of-customer/id1124386873',
    serialLocation: 'Barcode underneath top glass + junction box QR code',
    instructions: 'Query through Trina Customer Service web link or download the official Trina "Voice of Customer" mobile app for live camera scanning.',
    supportedModels: ['Vertex S+ (430W - 450W)', 'Vertex 550W+', 'Vertex 600W - 670W', 'Vertex N-Type TOPCon (600W - 710W)'],
    tips: 'The "Voice of Customer" app allows installers to scan 100+ modules sequentially during commissioning.'
  },
  {
    id: 'sunova-solar',
    name: 'Sunova Solar',
    badge: 'Pakistan Official Desk',
    queryType: 'email',
    email: 'Pakistan@sunova-solar.com',
    serialLocation: 'Barcode on module backsheet and under front glass',
    instructions: 'Send an email with your module serial numbers and supplier invoice to Sunova Solar Pakistan’s team for verification and warranty registration.',
    supportedModels: ['Tangra M (540W - 560W)', 'Tangra S (575W - 595W N-Type)', 'Sunova Bifacial TOPCon'],
    tips: 'Include clear photos of the barcode on the panel frame and under the glass for rapid turnaround.'
  },
  {
    id: 'huasun-solar',
    name: 'Huasun Solar',
    badge: 'Huasun HJT Query Portal',
    queryType: 'web',
    webLink: 'https://www.huasunsolar.com/query.html',
    serialLocation: 'Front glass barcode & junction box inspection label',
    instructions: 'Use Huasun’s official serial query portal to verify high-efficiency Heterojunction (HJT) module credentials.',
    supportedModels: ['Himalaya G10 (430W - 450W)', 'Himalaya G12 (680W - 715W HJT)', 'Huasun Bifacial Double Glass'],
    tips: 'Huasun is the world leading HJT manufacturer; verify serials to safeguard high-yield investments.'
  },
  {
    id: 'yingli-solar',
    name: 'Yingli Solar',
    badge: 'Yingli Cloud Query Portal',
    queryType: 'web',
    webLink: 'https://ylnyph.yinglicloud.com/pclogin/query',
    serialLocation: 'Serial strip under front glass and backsheet specifications label',
    instructions: 'Query Yingli Cloud serial database to confirm panel manufacturing origin, flash data, and anti-counterfeit status.',
    supportedModels: ['Panda 3.0 N-Type TOPCon', 'YLM 540W - 560W', 'Bifacial Panda Commercial 670W+'],
    tips: 'Always confirm the serial number has not been previously registered under a different project.'
  }
];

export const PANEL_INSPECTION_CHECKLIST = [
  {
    title: 'Barcode Laminated Under Glass',
    detail: 'Genuine Tier-1 panels have the primary barcode laminated directly UNDER the front tempered glass during production. If a barcode is just a sticker placed on top of the outer glass, it is a high risk of being counterfeit.'
  },
  {
    title: 'Matching Frame & Junction Box Labels',
    detail: 'The alphanumeric serial number under the glass MUST match the barcode on the outer frame edge and the technical label on the back junction box.'
  },
  {
    title: 'Flash Test Data (STC Performance)',
    detail: 'Official query portals will show factory flash-test results: Open Circuit Voltage (Voc), Short Circuit Current (Isc), Maximum Power (Pmax), and Fill Factor (FF).'
  },
  {
    title: 'Check Grade A vs Grade B / Refurbished',
    detail: 'Some unverified sellers import downgraded B-grade or factory-rejected plates with micro-cracks. Official verification portals confirm if the module is certified Grade A for export.'
  }
];
