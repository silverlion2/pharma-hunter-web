export const fallbackData = [
  {
    ticker: 'ALT', name: 'Altimmune', score: 94.5, target_area: 'Metabolic', is_past_deal: false, warning_flag: null,
    clinical_score: 85.0, cash_score: 82.0, scarcity_score: 95.0, milestone_score: 100.0, valuation_score: 88.0,
    cash_amount: '$48M', runway_years: '~0.6 Yrs', market_cap: '$580M',
    latest_news_headline: 'Altimmune reports positive Pemvidutide Phase 2 liver fat reduction data',
    predicted_time: '14-30 Days (Imminent)', estimated_premium: '+65% ~ +80%',
    shadow_signals: [{ type: 'OPTIONS', date: 'T-1 EOD', desc: 'Strike $12.5 Call Sweep (Vol: 4500 vs OI: 1200)', mood: 'HIGH-INTENT' }],
    digest: "Altimmune's Pemvidutide shows significant liver fat reduction alongside weight loss, differentiating it in the MASH space. With cash runway dropping below 0.6 years, management is highly incentivized to execute a buyout. Options flow indicates massive institutional positioning.\n\nVERDICT: Based on the critical cash pressure score of 82.0 and high asset scarcity (95.0), the Overall Quant Score stands at 94.5/100. We estimate a highly probable acquisition scenario within the next quarter, projecting an estimated M&A premium of +65% ~ +80% above the current trading price."
  },
  {
    ticker: 'TERN', name: 'Terns Pharma', score: 88.0, target_area: 'Metabolic', is_past_deal: false, warning_flag: 'AI_TIMEOUT',
    clinical_score: 85.0, cash_score: 70.0, scarcity_score: 95.0, milestone_score: 75.0, valuation_score: 80.0,
    cash_amount: '$120M', runway_years: '~1.4 Yrs', market_cap: '$720M',
    latest_news_headline: 'Terns Pharma advances TERN-601 oral GLP-1 into dose-ranging study',
    predicted_time: '1-3 Months', estimated_premium: '+55% ~ +70%',
    shadow_signals: [],
    digest: "Terns holds TERN-601, a highly scarce oral GLP-1 candidate. Big Pharma desperately needs oral formulations to combat the cold-chain logistics of injectables. TERN's valuation gap represents a prime entry point for MNCs looking to leapfrog into the obesity race.\n\nVERDICT: High-conviction mid-term target. Scarcity premium is compounding."
  },
  {
    ticker: 'ETNB', name: '89bio', score: 82.3, target_area: 'Metabolic', is_past_deal: false, warning_flag: 'SEC_MISSING',
    clinical_score: 85.0, cash_score: 50.0, scarcity_score: 85.0, milestone_score: 90.0, valuation_score: 75.0,
    cash_amount: '$210M', runway_years: '~2.1 Yrs', market_cap: '$1.1B',
    latest_news_headline: '89bio initiates Phase III ENLIVEN trial for Pegozafermin in MASH',
    predicted_time: '3-6 Months', estimated_premium: '+45% ~ +60%',
    shadow_signals: [{ type: 'CLINICAL', date: 'ACTIVE', desc: 'Phase III Initiation matches MNC Needs', mood: 'STRATEGIC' }],
    digest: "As the premier independent FGF21 specialist, 89bio's Pegozafermin is a foundational asset for combination MASH therapies. Domain registries suggest exploratory talks with European MNCs. \n\nVERDICT: Strong bolt-on candidate ahead of Phase III interim readouts."
  },
  {
    ticker: 'MDGL', name: 'Madrigal', score: 75.0, target_area: 'Metabolic', is_past_deal: false, warning_flag: null,
    clinical_score: 85.0, cash_score: 40.0, scarcity_score: 70.0, milestone_score: 100.0, valuation_score: 60.0,
    cash_amount: '$680M', runway_years: '~3.2 Yrs', market_cap: '$4.2B',
    latest_news_headline: 'Rezdiffra commercial launch exceeds initial Street projections',
    predicted_time: 'TBD / Event Driven', estimated_premium: '+30% ~ +45%', shadow_signals: [],
    digest: "Having secured the first-ever FDA approval for MASH (Rezdiffra), Madrigal has de-risked its asset entirely. The question is no longer clinical, but commercial. MNCs with massive primary care salesforces are observing the early launch trajectory to justify a $8B+ buyout.\n\nVERDICT: De-risked commercial target. Awaiting sales data validation."
  },
  {
    ticker: 'VKTX', name: 'Viking Tx', score: 68.5, target_area: 'Metabolic', is_past_deal: false, warning_flag: null,
    clinical_score: 85.0, cash_score: 30.0, scarcity_score: 95.0, milestone_score: 75.0, valuation_score: 30.0,
    cash_amount: '$950M', runway_years: '~4.5 Yrs', market_cap: '$8.6B',
    latest_news_headline: 'Viking announces oral VK2735 Phase 2 topline results with 8.2% weight loss',
    predicted_time: '3-6 Months', estimated_premium: '+35% ~ +50%', shadow_signals: [],
    digest: "Viking's dual GLP/GIP and oral VK2735 are elite assets. However, the current enterprise value prices in near-perfection. While it remains a strategic prize, acquirers will likely demand longer-term durability data before committing to a mega-merger.\n\nVERDICT: Elite asset, but valuation requires patience."
  },
  {
    ticker: 'IMVT', name: 'Immunovant', score: 89.5, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
    clinical_score: 85.0, cash_score: 65.0, scarcity_score: 80.0, milestone_score: 90.0, valuation_score: 75.0,
    cash_amount: '$180M', runway_years: '~1.3 Yrs', market_cap: '$3.8B',
    latest_news_headline: 'Immunovant IMVT-1402 achieves primary endpoint in myasthenia gravis trial',
    predicted_time: '1-3 Months', estimated_premium: '+50% ~ +65%', shadow_signals: [],
    digest: "IMVT-1402 (FcRn inhibitor) is emerging as a best-in-class pipeline-in-a-product for autoimmune disorders. Roivant's majority stake structurally positions IMVT for a full spin-out or MNC acquisition. Deep options sweep activity observed post-Phase 2.\n\nVERDICT: Tier-1 immunology target. Buyout highly probable within 180 days."
  },
  {
    ticker: 'APLS', name: 'Apellis', score: 86.0, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
    clinical_score: 85.0, cash_score: 55.0, scarcity_score: 75.0, milestone_score: 100.0, valuation_score: 85.0,
    cash_amount: '$320M', runway_years: '~1.8 Yrs', market_cap: '$2.9B',
    latest_news_headline: 'Apellis expands Syfovre label to broader geographic atrophy population',
    predicted_time: '1-3 Months', estimated_premium: '+55% ~ +70%', shadow_signals: [],
    digest: "Apellis dominates the complement C3 space. Despite recent commercial turbulence, the underlying science is highly validated. MNCs lacking a complement franchise view APLS as a distressed, yet highly valuable, turnaround acquisition.\n\nVERDICT: Opportunistic buyout candidate due to temporary valuation depression."
  },
  {
    ticker: 'CABA', name: 'Cabaletta Bio', score: 85.5, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
    clinical_score: 85.0, cash_score: 70.0, scarcity_score: 90.0, milestone_score: 75.0, valuation_score: 80.0,
    cash_amount: '$130M', runway_years: '~1.2 Yrs', market_cap: '$1.4B',
    latest_news_headline: 'Cabaletta presents durable CD19-CAR T remission data in lupus at ASH',
    predicted_time: '3-6 Months', estimated_premium: '+60% ~ +75%', shadow_signals: [],
    digest: "Cell therapy is pivoting from oncology to autoimmune. Cabaletta's CD19-CAR T data in lupus presents a paradigm shift. Big Pharma is urgently looking to secure IP in auto-CAR-T before the window closes.\n\nVERDICT: Highly scarce modality. Prime target for early-stage integration."
  },
  {
    ticker: 'KYTX', name: 'Kymera', score: 81.0, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
    clinical_score: 85.0, cash_score: 50.0, scarcity_score: 80.0, milestone_score: 75.0, valuation_score: 70.0,
    cash_amount: '$280M', runway_years: '~2.4 Yrs', market_cap: '$2.2B',
    latest_news_headline: 'Kymera reports positive IRAK4 degrader data from Sanofi-partnered trial',
    predicted_time: '3-6 Months', estimated_premium: '+40% ~ +55%', shadow_signals: [],
    digest: "Kymera's IRAK4 degrader (partnered with Sanofi) offers a novel oral approach to immunology. Sanofi already has deep insight into the clinical data room, establishing them as the natural buyer if Phase 2 expansion proves successful.\n\nVERDICT: High probability of partner-driven acquisition."
  },
  {
    ticker: 'VTYX', name: 'Ventyx Bio', score: 72.0, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
    clinical_score: 85.0, cash_score: 85.0, scarcity_score: 60.0, milestone_score: 50.0, valuation_score: 95.0,
    cash_amount: '$410M', runway_years: '~3.8 Yrs', market_cap: '$350M',
    latest_news_headline: 'Ventyx Bio trades below cash; Sanofi increases equity stake to 12%',
    predicted_time: 'TBD / Event Driven', estimated_premium: '+45% ~ +60%', shadow_signals: [],
    digest: "Trading below cash value post-trial failure, VTYX retains multiple shots on goal (NLRP3, TYK2). Sanofi recently took an equity stake. This is a classic 'sum-of-the-parts' acquisition target for an MNC looking for cheap pipeline optionality.\n\nVERDICT: Deep value play. Acquirer could buy the entire company just for the cash and patents."
  },
  {
    ticker: 'ALPN', name: 'Alpine Immune', score: 96.5, target_area: 'Autoimmune', is_past_deal: true, deal_info: "Acquired by Vertex ($4.9B) | April 2024", warning_flag: null,
    clinical_score: 85.0, cash_score: 85.0, scarcity_score: 95.0, milestone_score: 100.0, valuation_score: 80.0,
    cash_amount: '$95M', runway_years: '~0.8 Yrs', market_cap: '$2.8B',
    latest_news_headline: 'Vertex completes $4.9B acquisition of Alpine Immune Sciences',
    predicted_time: 'REALIZED', estimated_premium: 'REALIZED',
    shadow_signals: [{ type: 'OPTIONS', date: 'T-7 DAYS', desc: 'Abnormal OTM Call Sweep Volume Detected', mood: 'VALIDATED' }],
    digest: "[T-7 Days Report]: ALPN's Phase 2 IgA nephropathy data established Povetacicept as a best-in-class dual antagonist. Massive unhedged OTM call buying detected 5 days prior. Vertex faces extreme pipeline gap pressure outside of cystic fibrosis.\n\nOUTCOME: Acquired at 67% premium."
  },
  {
    ticker: 'RXDX', name: 'Prometheus', score: 98.0, target_area: 'Autoimmune', is_past_deal: true, deal_info: "Acquired by Merck ($10.8B) | April 2023", warning_flag: null,
    clinical_score: 85.0, cash_score: 88.0, scarcity_score: 95.0, milestone_score: 100.0, valuation_score: 75.0,
    cash_amount: '$60M', runway_years: '~0.5 Yrs', market_cap: '$6.2B',
    latest_news_headline: 'Merck announces $10.8B definitive agreement to acquire Prometheus Biosciences',
    predicted_time: 'REALIZED', estimated_premium: 'REALIZED', shadow_signals: [],
    digest: "[T-7 Days Report]: PRA023's Phase 2 results in Ulcerative Colitis are unprecedented. Merck's Keytruda patent cliff (2028) requires immediate revenue replacement. Talent migration signals indicate deep DD is concluded.\n\nOUTCOME: Acquired at 75% premium."
  },
  {
    ticker: 'HIBI', name: 'HI-Bio', score: 91.5, target_area: 'Autoimmune', is_past_deal: true, deal_info: "Acquired by Biogen ($1.8B) | May 2024", warning_flag: null,
    clinical_score: 85.0, cash_score: 75.0, scarcity_score: 85.0, milestone_score: 90.0, valuation_score: 80.0,
    cash_amount: '$110M', runway_years: '~1.1 Yrs', market_cap: '$1.0B',
    latest_news_headline: 'Biogen closes $1.8B HI-Bio acquisition to expand immunology portfolio',
    predicted_time: 'REALIZED', estimated_premium: 'REALIZED', shadow_signals: [],
    digest: "[T-7 Days Report]: Felzartamab shows durable remission in primary membranous nephropathy. Biogen is aggressively expanding into immunology to offset neurology risk. Private market shadow intelligence flagged term sheet negotiations.\n\nOUTCOME: Acquired via definitive merger agreement."
  },
  {
    ticker: 'CBAY', name: 'CymaBay', score: 95.0, target_area: 'Metabolic', is_past_deal: true, deal_info: "Acquired by Gilead ($4.3B) | Feb 2024", warning_flag: null,
    clinical_score: 85.0, cash_score: 80.0, scarcity_score: 90.0, milestone_score: 100.0, valuation_score: 85.0,
    cash_amount: '$75M', runway_years: '~0.9 Yrs', market_cap: '$2.5B',
    latest_news_headline: 'Gilead to acquire CymaBay Therapeutics for $4.3B in liver disease push',
    predicted_time: 'REALIZED', estimated_premium: 'REALIZED', shadow_signals: [],
    digest: "[T-7 Days Report]: Seladelpar NDA acceptance imminent for PBC. Gilead needs a liver asset to replace its aging HCV franchise. Options volume spiked 3x normal average over the last 48 hours.\n\nOUTCOME: Acquired at 27% premium to its 52-week absolute high."
  },
  {
    ticker: 'CRMO', name: 'Carmot', score: 88.5, target_area: 'Metabolic', is_past_deal: true, deal_info: "Acquired by Roche ($2.7B) | Dec 2023", warning_flag: null,
    clinical_score: 85.0, cash_score: 90.0, scarcity_score: 95.0, milestone_score: 50.0, valuation_score: 75.0,
    cash_amount: '$35M', runway_years: '~0.4 Yrs', market_cap: '$1.6B',
    latest_news_headline: 'Roche acquires Carmot Therapeutics for $2.7B to enter obesity market',
    predicted_time: 'REALIZED', estimated_premium: 'REALIZED', shadow_signals: [],
    digest: "[T-7 Days Report]: Private Biotech Carmot owns a highly potent dual GLP-1/GIP receptor agonist. Roche completely missed the initial obesity wave and is desperate to enter the market. Capital infusion patterns suggest immediate M&A action.\n\nOUTCOME: Acquired upfront for $2.7B + milestones."
  }
];

export const defaultGaps = {
  'Metabolic': [
    { 
      name: 'Pfizer (PFE)', 
      target: 'Metabolic', 
      level: 92, 
      color: 'bg-blue-500',
      strategic_focus: 'Aggressive expansion into oral weight loss; recovering from Danuglipron clinical setbacks. Seeking differentiated MoAs in obesity/MASH to compete with NVO/LLY.',
      budget_estimate: '$15B - $25B',
      recent_acquisitions: [{name: "Seagen", year: 2023, value: "$43B", area: "Oncology"}, {name: "Arena Pharma", year: 2021, value: "$6.7B", area: "Immunology"}],
      current_pipeline: [{name: "Danuglipron (Daily)", phase: "Phase 2b", type: "Oral GLP-1"}, {name: "PF-06954522", phase: "Phase 1", type: "FGF21"}],
      key_assets: [{name: "Eliquis", revenue_2023: "$6.7B"}, {name: "Prevnar", revenue_2023: "$6.4B"}],
      market_size: '$100B+ Estimated TAM by 2030 (Obesity/MASH)',
      expiring_patents: [{asset: "Eliquis", year: 2026, revenue_at_risk: "$6.7B"}, {asset: "Ibrance", year: 2027, revenue_at_risk: "$4.7B"}],
      scientific_data_overview: 'Clinical focus prioritizing lean mass preservation, gastrointestinal tolerability in oral formulations, and combo-therapies (GLP/GIP/Glucagon). Needs clean safety signals.',
      secondary_targets: ["GLP-1", "FGF21", "Amylin"]
    },
    { 
      name: 'Novartis (NVS)', 
      target: 'Metabolic', 
      level: 85, 
      color: 'bg-cyan-500',
      strategic_focus: 'Building a radioligand and cardiovascular-metabolic powerhouse post-Sandoz spin-off. Looking for next-gen incretins or muscle-sparing metabolic assets.',
      budget_estimate: '$10B - $15B',
      recent_acquisitions: [{name: "MorphoSys", year: 2024, value: "$2.9B", area: "Oncology"}, {name: "DTx Pharma", year: 2023, value: "$1.0B", area: "Neuro"}],
      current_pipeline: [{name: "Pelacarsen", phase: "Phase 3", type: "Lp(a)"}, {name: "Ianalumab", phase: "Phase 3", type: "Sjogrens"}],
      key_assets: [{name: "Entresto", revenue_2023: "$6.0B"}, {name: "Cosentyx", revenue_2023: "$5.0B"}],
      market_size: '$60B+ (Cardio-Metabolic Combos)',
      expiring_patents: [{asset: "Entresto", year: 2025, revenue_at_risk: "$6.0B"}, {asset: "Promacta", year: 2026, revenue_at_risk: "$2.3B"}],
      scientific_data_overview: 'Highly focused on long-acting (monthly/quarterly) formulations or genetic medicines (siRNA) targeting cardiovascular risk outcomes inherent to obesity.',
      secondary_targets: ["siRNA", "PCSK9", "Glucagon"]
    }
  ],
  'Autoimmune': [
    { 
      name: 'AbbVie (ABBV)', 
      target: 'Autoimmune', 
      level: 95, 
      color: 'bg-indigo-500',
      strategic_focus: 'Desperate necessity to replace Humira revenue cliff via Skyrizi/Rinvoq expansion and acquiring novel immunology blockbusters.',
      budget_estimate: '$20B - $30B',
      recent_acquisitions: [{name: "Cerevel", year: 2023, value: "$8.7B", area: "Neuro"}, {name: "ImmunoGen", year: 2023, value: "$10.1B", area: "Oncology"}],
      current_pipeline: [{name: "Lutikizumab", phase: "Phase 2", type: "IL-1a/b"}, {name: "Upadacitinib (expansions)", phase: "Phase 3", type: "JAK1"}],
      key_assets: [{name: "Humira", revenue_2023: "$14.4B (Falling)"}, {name: "Skyrizi", revenue_2023: "$7.7B"}],
      market_size: '$150B+ Immunology Sector',
      expiring_patents: [{asset: "Humira", year: "2023 (Active Cliff)", revenue_at_risk: "$-8.0B YoY"}, {asset: "Imbruvica", year: 2026, revenue_at_risk: "$3.6B"}],
      scientific_data_overview: 'Seeking differentiated MoAs for IBD, Rheumatology, and Derm that can demonstrate superiority over existing TL1A or JAK inhibitors.',
      secondary_targets: ["IL-23", "TL1A", "JAK", "FcRn"]
    },
    { 
      name: 'Sanofi (SNY)', 
      target: 'Autoimmune', 
      level: 88, 
      color: 'bg-blue-500',
      strategic_focus: 'Pivoting hard into "Immunology First" strategy to ride the Dupixent wave and discover its oral successor. Aggressively licensing early-stage auto-immune assets.',
      budget_estimate: '$8B - $12B',
      recent_acquisitions: [{name: "Inhibrx", year: 2024, value: "$1.7B", area: "Rare"}, {name: "Provention Bio", year: 2023, value: "$2.9B", area: "Autoimmune"}],
      current_pipeline: [{name: "Amlitelimab", phase: "Phase 2", type: "OX40L"}, {name: "Frexalimab", phase: "Phase 2", type: "CD40L"}],
      key_assets: [{name: "Dupixent", revenue_2023: "€10.7B"}, {name: "Aubagio", revenue_2023: "€0.9B (Fallen)"}],
      market_size: '$80B+ (Dermatology & Respiratory Immunology)',
      expiring_patents: [{asset: "Aubagio", year: "2023 (Active Cliff)", revenue_at_risk: "€1.0B"}, {asset: "Dupixent", year: "2031", revenue_at_risk: "€15B+"}],
      scientific_data_overview: 'Urgent need for oral immunology assets (degraders, IRAK4, BTK) to protect the franchise from oral competition to Dupixent.',
      secondary_targets: ["OX40L", "IRAK4", "Oral Degraders", "BTK"]
    }
  ],
  'Oncology': [
    { 
      name: 'Merck (MRK)', 
      target: 'Oncology', 
      level: 98, 
      color: 'bg-red-500',
      strategic_focus: 'The Keytruda 2028 patent cliff represents the largest single-drug revenue hole in pharma history. Merck is buying everything with ADC or Next-Gen IO potential.',
      budget_estimate: '$30B+',
      recent_acquisitions: [{name: "Prometheus", year: 2023, value: "$10.8B", area: "Immunology"}, {name: "Seagen (Attempt)", year: 2023, value: "Missed", area: "ADC"}],
      current_pipeline: [{name: "V116 (Vaccine)", phase: "Pre-Registration", type: "Vaccine"}, {name: "MK-2870", phase: "Phase 3", type: "TROP2 ADC"}],
      key_assets: [{name: "Keytruda", revenue_2023: "$25.0B"}, {name: "Gardasil", revenue_2023: "$8.9B"}],
      market_size: '$250B+ Broad Oncology TAM',
      expiring_patents: [{asset: "Keytruda", year: "2028 (LOE)", revenue_at_risk: "$25B+"}, {asset: "Januvia", year: 2026, revenue_at_risk: "$2.0B"}],
      scientific_data_overview: 'Primarily seeking Antibody-Drug Conjugates (ADCs), radiopharma, and novel IO combos to secure market dominance post-Keytruda.',
      secondary_targets: ["ADC", "TROP2", "Claudin", "Radiopharma"]
    }
  ]
};

export const TARGET_DICTIONARY = {
  'Metabolic': ['GLP-1', 'GIP', 'Glucagon', 'FGF21', 'Amylin', 'PCSK9', 'siRNA'],
  'Autoimmune': ['TL1A', 'FcRn', 'JAK', 'IL-23', 'IL-17', 'BTK', 'OX40L', 'IRAK4', 'CD19 CAR-T'],
  'Oncology': ['ADC', 'TROP2', 'Claudin', 'Radiopharma', 'PD-1', 'CTLA-4', 'KRAS', 'EGFR'],
  'Neurology': ['Amyloid', 'Tau', 'LRRK2', 'GBA', 'AAV Gene Therapy'],
  'Rare Diseases': ['Gene Therapy', 'RNAi', 'Enzyme Replacement', 'Oligonucleotides'],
  'Cardiovascular': ['Lp(a)', 'PCSK9', 'Factor XIa'],
  'Immunology': ['TSLP', 'IL-4R', 'IL-31', 'IgE']
};
