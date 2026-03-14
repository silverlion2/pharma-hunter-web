export const fallbackData = [
  {
    ticker: 'ALT', name: 'Altimmune', score: 94.5, target_area: 'Metabolic', is_past_deal: false, warning_flag: null,
    cash_score: 82.0, scarcity_score: 95.0, milestone_score: 100.0, valuation_score: 88.0,
    predicted_time: '14-30 Days (Imminent)', estimated_premium: '+65% ~ +80%',
    shadow_signals: [{ type: 'OPTIONS', date: 'T-1 EOD', desc: 'Strike $12.5 Call Sweep (Vol: 4500 vs OI: 1200)', mood: 'HIGH-INTENT' }],
    digest: "Altimmune's Pemvidutide shows significant liver fat reduction alongside weight loss, differentiating it in the MASH space. With cash runway dropping below 0.6 years, management is highly incentivized to execute a buyout. Options flow indicates massive institutional positioning.\n\nVERDICT: Based on the critical cash pressure score of 82.0 and high asset scarcity (95.0), the Overall Quant Score stands at 94.5/100. We estimate a highly probable acquisition scenario within the next quarter, projecting an estimated M&A premium of +65% ~ +80% above the current trading price."
  },
  {
    ticker: 'TERN', name: 'Terns Pharma', score: 88.0, target_area: 'Metabolic', is_past_deal: false, warning_flag: 'AI_TIMEOUT',
    cash_score: 70.0, scarcity_score: 95.0, milestone_score: 75.0, valuation_score: 80.0,
    predicted_time: '1-3 Months', estimated_premium: '+55% ~ +70%',
    shadow_signals: [],
    digest: "Terns holds TERN-601, a highly scarce oral GLP-1 candidate. Big Pharma desperately needs oral formulations to combat the cold-chain logistics of injectables. TERN's valuation gap represents a prime entry point for MNCs looking to leapfrog into the obesity race.\n\nVERDICT: High-conviction mid-term target. Scarcity premium is compounding."
  },
  {
    ticker: 'ETNB', name: '89bio', score: 82.3, target_area: 'Metabolic', is_past_deal: false, warning_flag: 'SEC_MISSING',
    cash_score: 50.0, scarcity_score: 85.0, milestone_score: 90.0, valuation_score: 75.0,
    predicted_time: '3-6 Months', estimated_premium: '+45% ~ +60%',
    shadow_signals: [{ type: 'CLINICAL', date: 'ACTIVE', desc: 'Phase III Initiation matches MNC Needs', mood: 'STRATEGIC' }],
    digest: "As the premier independent FGF21 specialist, 89bio's Pegozafermin is a foundational asset for combination MASH therapies. Domain registries suggest exploratory talks with European MNCs. \n\nVERDICT: Strong bolt-on candidate ahead of Phase III interim readouts."
  },
  {
    ticker: 'MDGL', name: 'Madrigal', score: 75.0, target_area: 'Metabolic', is_past_deal: false, warning_flag: null,
    cash_score: 40.0, scarcity_score: 70.0, milestone_score: 100.0, valuation_score: 60.0, 
    predicted_time: 'TBD / Event Driven', estimated_premium: '+30% ~ +45%', shadow_signals: [],
    digest: "Having secured the first-ever FDA approval for MASH (Rezdiffra), Madrigal has de-risked its asset entirely. The question is no longer clinical, but commercial. MNCs with massive primary care salesforces are observing the early launch trajectory to justify a $8B+ buyout.\n\nVERDICT: De-risked commercial target. Awaiting sales data validation."
  },
  {
    ticker: 'VKTX', name: 'Viking Tx', score: 68.5, target_area: 'Metabolic', is_past_deal: false, warning_flag: null,
    cash_score: 30.0, scarcity_score: 95.0, milestone_score: 75.0, valuation_score: 30.0, 
    predicted_time: '3-6 Months', estimated_premium: '+35% ~ +50%', shadow_signals: [],
    digest: "Viking's dual GLP/GIP and oral VK2735 are elite assets. However, the current enterprise value prices in near-perfection. While it remains a strategic prize, acquirers will likely demand longer-term durability data before committing to a mega-merger.\n\nVERDICT: Elite asset, but valuation requires patience."
  },
  {
    ticker: 'IMVT', name: 'Immunovant', score: 89.5, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
    cash_score: 65.0, scarcity_score: 80.0, milestone_score: 90.0, valuation_score: 75.0, 
    predicted_time: '1-3 Months', estimated_premium: '+50% ~ +65%', shadow_signals: [],
    digest: "IMVT-1402 (FcRn inhibitor) is emerging as a best-in-class pipeline-in-a-product for autoimmune disorders. Roivant's majority stake structurally positions IMVT for a full spin-out or MNC acquisition. Deep options sweep activity observed post-Phase 2.\n\nVERDICT: Tier-1 immunology target. Buyout highly probable within 180 days."
  },
  {
    ticker: 'APLS', name: 'Apellis', score: 86.0, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
    cash_score: 55.0, scarcity_score: 75.0, milestone_score: 100.0, valuation_score: 85.0, 
    predicted_time: '1-3 Months', estimated_premium: '+55% ~ +70%', shadow_signals: [],
    digest: "Apellis dominates the complement C3 space. Despite recent commercial turbulence, the underlying science is highly validated. MNCs lacking a complement franchise view APLS as a distressed, yet highly valuable, turnaround acquisition.\n\nVERDICT: Opportunistic buyout candidate due to temporary valuation depression."
  },
  {
    ticker: 'CABA', name: 'Cabaletta Bio', score: 85.5, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
    cash_score: 70.0, scarcity_score: 90.0, milestone_score: 75.0, valuation_score: 80.0, 
    predicted_time: '3-6 Months', estimated_premium: '+60% ~ +75%', shadow_signals: [],
    digest: "Cell therapy is pivoting from oncology to autoimmune. Cabaletta's CD19-CAR T data in lupus presents a paradigm shift. Big Pharma is urgently looking to secure IP in auto-CAR-T before the window closes.\n\nVERDICT: Highly scarce modality. Prime target for early-stage integration."
  },
  {
    ticker: 'KYTX', name: 'Kymera', score: 81.0, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
    cash_score: 50.0, scarcity_score: 80.0, milestone_score: 75.0, valuation_score: 70.0, 
    predicted_time: '3-6 Months', estimated_premium: '+40% ~ +55%', shadow_signals: [],
    digest: "Kymera's IRAK4 degrader (partnered with Sanofi) offers a novel oral approach to immunology. Sanofi already has deep insight into the clinical data room, establishing them as the natural buyer if Phase 2 expansion proves successful.\n\nVERDICT: High probability of partner-driven acquisition."
  },
  {
    ticker: 'VTYX', name: 'Ventyx Bio', score: 72.0, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
    cash_score: 85.0, scarcity_score: 60.0, milestone_score: 50.0, valuation_score: 95.0, 
    predicted_time: 'TBD / Event Driven', estimated_premium: '+45% ~ +60%', shadow_signals: [],
    digest: "Trading below cash value post-trial failure, VTYX retains multiple shots on goal (NLRP3, TYK2). Sanofi recently took an equity stake. This is a classic 'sum-of-the-parts' acquisition target for an MNC looking for cheap pipeline optionality.\n\nVERDICT: Deep value play. Acquirer could buy the entire company just for the cash and patents."
  },
  {
    ticker: 'ALPN', name: 'Alpine Immune', score: 96.5, target_area: 'Autoimmune', is_past_deal: true, deal_info: "Acquired by Vertex ($4.9B) | April 2024", warning_flag: null,
    cash_score: 85.0, scarcity_score: 95.0, milestone_score: 100.0, valuation_score: 80.0,
    predicted_time: 'REALIZED', estimated_premium: 'REALIZED',
    shadow_signals: [{ type: 'OPTIONS', date: 'T-7 DAYS', desc: 'Abnormal OTM Call Sweep Volume Detected', mood: 'VALIDATED' }],
    digest: "[T-7 Days Report]: ALPN's Phase 2 IgA nephropathy data established Povetacicept as a best-in-class dual antagonist. Massive unhedged OTM call buying detected 5 days prior. Vertex faces extreme pipeline gap pressure outside of cystic fibrosis.\n\nOUTCOME: Acquired at 67% premium."
  },
  {
    ticker: 'RXDX', name: 'Prometheus', score: 98.0, target_area: 'Autoimmune', is_past_deal: true, deal_info: "Acquired by Merck ($10.8B) | April 2023", warning_flag: null,
    cash_score: 88.0, scarcity_score: 95.0, milestone_score: 100.0, valuation_score: 75.0, 
    predicted_time: 'REALIZED', estimated_premium: 'REALIZED', shadow_signals: [],
    digest: "[T-7 Days Report]: PRA023's Phase 2 results in Ulcerative Colitis are unprecedented. Merck's Keytruda patent cliff (2028) requires immediate revenue replacement. Talent migration signals indicate deep DD is concluded.\n\nOUTCOME: Acquired at 75% premium."
  },
  {
    ticker: 'HIBI', name: 'HI-Bio', score: 91.5, target_area: 'Autoimmune', is_past_deal: true, deal_info: "Acquired by Biogen ($1.8B) | May 2024", warning_flag: null,
    cash_score: 75.0, scarcity_score: 85.0, milestone_score: 90.0, valuation_score: 80.0, 
    predicted_time: 'REALIZED', estimated_premium: 'REALIZED', shadow_signals: [],
    digest: "[T-7 Days Report]: Felzartamab shows durable remission in primary membranous nephropathy. Biogen is aggressively expanding into immunology to offset neurology risk. Private market shadow intelligence flagged term sheet negotiations.\n\nOUTCOME: Acquired via definitive merger agreement."
  },
  {
    ticker: 'CBAY', name: 'CymaBay', score: 95.0, target_area: 'Metabolic', is_past_deal: true, deal_info: "Acquired by Gilead ($4.3B) | Feb 2024", warning_flag: null,
    cash_score: 80.0, scarcity_score: 90.0, milestone_score: 100.0, valuation_score: 85.0, 
    predicted_time: 'REALIZED', estimated_premium: 'REALIZED', shadow_signals: [],
    digest: "[T-7 Days Report]: Seladelpar NDA acceptance imminent for PBC. Gilead needs a liver asset to replace its aging HCV franchise. Options volume spiked 3x normal average over the last 48 hours.\n\nOUTCOME: Acquired at 27% premium to its 52-week absolute high."
  },
  {
    ticker: 'CRMO', name: 'Carmot', score: 88.5, target_area: 'Metabolic', is_past_deal: true, deal_info: "Acquired by Roche ($2.7B) | Dec 2023", warning_flag: null,
    cash_score: 90.0, scarcity_score: 95.0, milestone_score: 50.0, valuation_score: 75.0, 
    predicted_time: 'REALIZED', estimated_premium: 'REALIZED', shadow_signals: [],
    digest: "[T-7 Days Report]: Private Biotech Carmot owns a highly potent dual GLP-1/GIP receptor agonist. Roche completely missed the initial obesity wave and is desperate to enter the market. Capital infusion patterns suggest immediate M&A action.\n\nOUTCOME: Acquired upfront for $2.7B + milestones."
  }
];

export const defaultGaps = {
  'Metabolic': [
    { name: 'PFE', target: 'MASH / Obesity', level: 92, color: 'bg-blue-500' },
    { name: 'NVS', target: 'Metabolic Combos', level: 85, color: 'bg-cyan-500' },
    { name: 'GSK', target: 'Liver Disease', level: 70, color: 'bg-teal-500' }
  ],
  'Autoimmune': [
    { name: 'ABBV', target: 'Immunology Cliff', level: 95, color: 'bg-indigo-500' },
    { name: 'JNJ', target: 'Targeted Autoimmune', level: 88, color: 'bg-blue-500' },
    { name: 'SNY', target: 'Oral Immunology', level: 82, color: 'bg-cyan-500' }
  ]
};
