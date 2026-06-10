const { useEffect, useMemo, useState } = React;

const today = currentDate();
const demoOwnerId = "demo-user";
const configKey = "vshr-supabase-config";
const demoDataKey = "vshr-data";
const governmentDataKey = "vshr-government-data";
const fundingDataKey = "vshr-funding-data";

const defaultSettings = {
  business_name: "V Solutions LLC",
  business_email: "valicia@example.com",
  phone: "",
  address: "Montgomery, AL",
  default_hourly_rate: 150,
  default_invoice_terms: "Net 15",
  default_monthly_retainer_terms: "Monthly retainer billed in advance",
  supabase_url: "",
  supabase_anon_key: ""
};

const emptyData = {
  settings: defaultSettings,
  clients: [],
  contacts: [],
  engagements: [],
  cases: [],
  investigations: [],
  documents: [],
  invoices: [],
  invoice_line_items: [],
  investigation_interviews: [],
  ai_documents: [],
  notes: [],
  activity_logs: []
};

const fieldSets = {
  clients: [
    ["company_name", "Company name"], ["industry", "Industry"], ["employee_count", "Employee count", "number"],
    ["address", "Address"], ["city", "City"], ["state", "State"], ["website", "Website"],
    ["status", "Status", "select", ["Lead", "Active", "Paused", "Former"]],
    ["contract_start_date", "Contract start", "date"], ["contract_end_date", "Contract end", "date"],
    ["monthly_retainer_amount", "Monthly retainer", "number"], ["billing_frequency", "Billing frequency"],
    ["notes", "Notes", "textarea"]
  ],
  contacts: [
    ["client_id", "Client", "client"], ["name", "Contact name"], ["title", "Title"], ["email", "Email"],
    ["phone", "Phone"], ["role", "Role", "select", ["Owner", "HR Contact", "Manager", "Finance", "Legal", "Other"]],
    ["primary_contact", "Primary contact", "checkbox"], ["notes", "Notes", "textarea"]
  ],
  invoices: [
    ["client_id", "Client", "client"], ["invoice_date", "Invoice date", "date"], ["due_date", "Due date", "date"],
    ["billing_period_start", "Billing period start", "date"], ["billing_period_end", "Billing period end", "date"],
    ["status", "Status", "select", ["Draft", "Sent", "Paid", "Overdue", "Cancelled"]],
    ["subtotal", "Subtotal", "number"], ["discount", "Discount", "number"], ["tax", "Tax", "number"],
    ["payment_date", "Payment date", "date"], ["payment_method", "Payment method"], ["notes", "Notes", "textarea"]
  ],
  documents: [
    ["client_id", "Client", "client"], ["title", "Document title"],
    ["document_type", "Document type", "select", ["Contract", "Handbook", "Policy", "Investigation Report", "Corrective Action", "Performance Document", "Accommodation Document", "Training Material", "Invoice", "Template", "Other"]],
    ["expiration_date", "Expiration date", "date"], ["notes", "Notes", "textarea"]
  ],
  engagements: [
    ["client_id", "Client", "client"], ["service_date", "Date of service", "date"],
    ["service_category", "Service category", "select", ["HR Consulting", "Employee Relations", "Investigation", "Policy Review", "Handbook", "Training", "Accommodation", "Corrective Action", "Performance Management", "Compliance", "Other"]],
    ["description", "Description of work", "textarea"], ["hours_worked", "Hours worked", "number"], ["billable", "Billable", "checkbox"],
    ["hourly_rate", "Hourly rate", "number"], ["invoice_status", "Invoice status", "select", ["Not Invoiced", "Invoiced", "Paid"]],
    ["related_case_id", "Related case optional"], ["notes", "Notes", "textarea"]
  ],
  cases: [
    ["client_id", "Client", "client"], ["case_type", "Case type", "select", ["Employee Relations", "Policy Question", "Accommodation", "Leave", "Performance", "Corrective Action", "Termination Review", "Training Request", "Compliance", "General HR Question"]],
    ["priority", "Priority", "select", ["Low", "Medium", "High", "Urgent"]], ["status", "Status", "select", ["Open", "In Progress", "Waiting on Client", "Resolved", "Closed"]],
    ["employee_involved", "Employee involved"], ["manager_involved", "Manager involved"], ["summary", "Summary", "textarea"],
    ["recommendation", "Recommendation", "textarea"], ["date_opened", "Date opened", "date"], ["due_date", "Due date", "date"],
    ["date_closed", "Date closed", "date"], ["assigned_consultant", "Assigned consultant"], ["notes", "Notes", "textarea"]
  ],
  investigations: [
    ["client_id", "Client", "client"], ["date_opened", "Date opened", "date"], ["date_closed", "Date closed", "date"],
    ["complainant", "Complainant"], ["respondent", "Respondent / accused"], ["department", "Department"], ["shift", "Shift"],
    ["complaint_summary", "Complaint summary", "textarea"], ["prior_discipline", "Prior discipline", "checkbox"],
    ["witness_1", "Witness 1"], ["witness_2", "Witness 2"], ["witness_3", "Witness 3"], ["evidence_reviewed", "Evidence reviewed", "textarea"],
    ["status", "Investigation status", "select", ["Intake", "Interviews Scheduled", "Interviews Complete", "Evidence Review", "Findings Drafted", "Closed"]],
    ["findings", "Findings", "select", ["Substantiated", "Unsubstantiated", "Inconclusive", "Partially Substantiated"]],
    ["recommended_action", "Recommended action", "textarea"], ["final_summary", "Final summary", "textarea"], ["investigator_name", "Investigator name"],
    ["follow_up_date", "Follow-up date", "date"], ["notes", "Notes", "textarea"]
  ]
};

const navigation = [
  { category: "Home", pages: ["Home"] },
  { category: "Vee AI", pages: ["Vee AI"] },
  { category: "Revenue", pages: ["Revenue", "Universal Opportunities", "Makeable Product Trend Finder", "Funding Opportunities", "Eligibility Review", "Application Drafts", "Required Documents", "Budget & Narrative", "Submission Tracker", "Awards/Outcomes"] },
  { category: "HR Consulting", pages: ["Clients", "Contacts", "Engagements", "Cases", "Investigations", "Documents", "Invoices", "Reports"] },
  { category: "Government", pages: ["Opportunity Discovery", "Opportunities", "Opportunity Detail", "AI Fit Review", "Subcontractor Finder", "Outreach Tracker", "Reminder Queue", "Awards"] },
  { category: "Operations", pages: ["Automations", "n8n Workflows", "Workflow Health", "Logs", "Tasks", "Calendar/Deadlines"] },
  { category: "AI Workspace", pages: ["HR Document Generator", "Government Proposal Assistant", "Capability Statement Generator", "Investigation Report Generator", "Email Writer", "Prompt Library"] },
  { category: "Admin", pages: ["Settings", "Users", "Integrations", "API Keys/Secrets", "Storage", "System Status"] }
];

const hrPages = ["Clients", "Contacts", "Engagements", "Cases", "Investigations", "Documents", "Invoices", "Reports"];
const revenuePages = ["Universal Opportunities"];
const productTrendPages = ["Makeable Product Trend Finder"];
const fundingPages = ["Funding Opportunities", "Eligibility Review", "Application Drafts", "Required Documents", "Budget & Narrative", "Submission Tracker", "Awards/Outcomes"];
const governmentPages = ["Opportunity Discovery", "Opportunities", "Opportunity Detail", "AI Fit Review", "Subcontractor Finder", "Outreach Tracker", "Reminder Queue", "Awards"];
const operationsPages = ["Automations", "n8n Workflows", "Workflow Health", "Logs", "Tasks", "Calendar/Deadlines"];
const aiWorkspacePages = ["Government Proposal Assistant", "Capability Statement Generator", "Investigation Report Generator", "Email Writer", "Prompt Library"];
const veeAiPages = ["Vee AI"];
const adminPages = ["Users", "Integrations", "API Keys/Secrets", "Storage", "System Status"];

const operationsMock = {
  highestValueActions: [
    { title: "No priority tasks yet", detail: "Add real clients, opportunities, invoices, or reminders to create focus items.", status: "Empty" }
  ],
  governmentOpportunities: [],
  automations: [
    { title: "Local automation tools", detail: "Manual checks can run after real records are added.", status: "Ready" },
    { title: "External automations", detail: "Connect n8n, storefronts, payment tools, or scheduled jobs before showing live automation activity.", status: "Not connected" }
  ],
  deadlines: [
    { title: "No deadlines yet", date: "Add a real invoice, case, opportunity, or reminder to populate this view.", type: "Empty" }
  ],
  recentSales: [],
  opportunities: []
};

const defaultGovernmentData = {
  selectedOpportunityId: "",
  opportunities: [],
  subcontractors: [],
  outreach: [],
  reminders: [],
  awards: []
};

const opportunityDiscoveryAdapters = [
  {
    id: "alabama-procurement",
    name: "Alabama Buys",
    sourceType: "Live Source",
    connectionStatus: "not checked yet",
    liveConnected: true,
    fetch: fetchAlabamaProcurementOpportunities
  },
  {
    id: "city-of-montgomery",
    name: "City of Montgomery opportunities",
    sourceType: "Live Source",
    connectionStatus: "not checked yet",
    liveConnected: true,
    fetch: fetchCityOfMontgomeryOpportunities
  },
  {
    id: "sam-gov",
    name: "SAM.gov",
    sourceType: "Live Source",
    connectionStatus: "SAM.gov not connected \u2014 API key required.",
    liveConnected: true,
    fetch: fetchSamGovOpportunities
  },
  {
    id: "montgomery-county",
    name: "Montgomery County opportunities",
    sourceType: "Not Connected",
    connectionStatus: "not connected yet",
    liveConnected: false,
    fetch: fetchMontgomeryCountyOpportunities
  }
];

const opportunityDiscoverySources = opportunityDiscoveryAdapters.map(adapter => adapter.name);
const alabamaBuysPublicSolicitationsUrl = "https://www.alabamabuys.gov/page.aspx/en/rfp/request_browse_public";
const cityOfMontgomeryOpenGovUrl = "https://procurement.opengov.com/portal/montgomeryal";
const cityOfMontgomeryBidsInfoUrl = "https://www.montgomeryal.gov/Home/Components/RFP/RFP/1192/160";
const samGovOpportunitiesApiUrl = "https://api.sam.gov/opportunities/v2/search";
const samGovApiKeyStorageKey = "valicia-sam-gov-api-key";

const developerTestOpportunityDiscoveryMock = [
  {
    id: "disc-1",
    title: "HR Policy Review and Employee Handbook Update",
    agency: "City of Montgomery",
    due_date: "2026-06-28",
    opportunity_url: "https://www.montgomeryal.gov/mock/procurement/hr-policy-review",
    category: "HR consulting",
    description: "Review existing personnel policies, recommend compliance updates, and deliver an updated employee handbook draft for a small municipal department.",
    estimated_value: 18000,
    date_found: today,
    source: "City of Montgomery opportunities",
    naics: "541612",
    local: true,
    fits_existing_naics: true,
    estimated_upfront_capital: 450,
    can_leverage_subcontractors: true,
    can_leverage_suppliers: false,
    full_time_manageable: true,
    complexity: "Low",
    staffing_needs: "Owner-led with optional legal review subcontractor.",
    equipment_needs: "Laptop, document tools, and secure file storage already available.",
    supply_needs: "No material supplies required.",
    likelihood_of_subcontracting: "Moderate",
    likelihood_of_supplier_use: "Low"
  },
  {
    id: "disc-2",
    title: "Small Business Vendor Outreach Coordination",
    agency: "Montgomery County",
    due_date: "2026-07-03",
    opportunity_url: "https://www.mc-ala.org/mock/purchasing/vendor-outreach",
    category: "Administrative services",
    description: "Coordinate vendor outreach, maintain a contact list, schedule information sessions, and prepare weekly participation reports for county procurement staff.",
    estimated_value: 12500,
    date_found: today,
    source: "Montgomery County opportunities",
    naics: "541611",
    local: true,
    fits_existing_naics: true,
    estimated_upfront_capital: 300,
    can_leverage_subcontractors: true,
    can_leverage_suppliers: true,
    full_time_manageable: true,
    complexity: "Low",
    staffing_needs: "Part-time coordination; subcontract admin support can be added if volume rises.",
    equipment_needs: "No special equipment.",
    supply_needs: "Possible low-cost printing or meeting supplies.",
    likelihood_of_subcontracting: "Moderate",
    likelihood_of_supplier_use: "Moderate"
  },
  {
    id: "disc-3",
    title: "Training Room Supplies and Workshop Logistics",
    agency: "State of Alabama Department of Human Resources",
    due_date: "2026-07-10",
    opportunity_url: "https://procurement.alabama.gov/mock/training-logistics",
    category: "Supply and coordination",
    description: "Provide workshop supply kits, coordinate delivery, confirm room setup, and manage post-session materials inventory for regional training sessions.",
    estimated_value: 22000,
    date_found: today,
    source: "Alabama procurement opportunities",
    naics: "561110",
    local: false,
    fits_existing_naics: true,
    estimated_upfront_capital: 1800,
    can_leverage_subcontractors: true,
    can_leverage_suppliers: true,
    full_time_manageable: true,
    complexity: "Moderate",
    staffing_needs: "Owner coordination with local delivery or print supplier support.",
    equipment_needs: "No owned equipment required if delivery is outsourced.",
    supply_needs: "Printed materials, folders, labels, and workshop kits purchased after award or deposit.",
    likelihood_of_subcontracting: "Moderate",
    likelihood_of_supplier_use: "High"
  },
  {
    id: "disc-4",
    title: "Records Cleanup and Administrative Process Mapping",
    agency: "City of Montgomery",
    due_date: "2026-07-18",
    opportunity_url: "https://www.montgomeryal.gov/mock/procurement/records-process-mapping",
    category: "Administrative services",
    description: "Document a small department's records workflow, identify process gaps, and produce a cleanup plan with templates and tracking recommendations.",
    estimated_value: 9500,
    date_found: today,
    source: "City of Montgomery opportunities",
    naics: "541611",
    local: true,
    fits_existing_naics: true,
    estimated_upfront_capital: 250,
    can_leverage_subcontractors: false,
    can_leverage_suppliers: false,
    full_time_manageable: true,
    complexity: "Low",
    staffing_needs: "Owner-led consulting project.",
    equipment_needs: "No special equipment.",
    supply_needs: "No material supplies required.",
    likelihood_of_subcontracting: "Low",
    likelihood_of_supplier_use: "Low"
  },
  {
    id: "disc-5",
    title: "County Facilities Janitorial Services - Multiple Buildings",
    agency: "Montgomery County",
    due_date: "2026-06-24",
    opportunity_url: "https://www.mc-ala.org/mock/purchasing/janitorial-buildings",
    category: "Facilities services",
    description: "Provide recurring janitorial services across multiple county facilities, including labor, cleaning equipment, supplies, insurance, and backup coverage.",
    estimated_value: 150000,
    date_found: today,
    source: "Montgomery County opportunities",
    naics: "561720",
    local: true,
    fits_existing_naics: false,
    estimated_upfront_capital: 6500,
    can_leverage_subcontractors: true,
    can_leverage_suppliers: true,
    full_time_manageable: false,
    complexity: "High",
    staffing_needs: "Payroll-heavy recurring coverage across multiple sites.",
    equipment_needs: "Cleaning equipment, chemicals, carts, and backup inventory.",
    supply_needs: "High recurring supply need.",
    likelihood_of_subcontracting: "High",
    likelihood_of_supplier_use: "High"
  }
];

const revenueChannels = [];

const makerCapabilities = {
  equipment: ["DTF", "UV DTF", "Sublimation", "CO2 Laser", "3D Printer"],
  materials: [
    "t-shirt blank", "hoodie blank", "sweatshirt blank", "tote bag", "apron", "DTF transfer",
    "3mm acrylic", "adhesive sheet", "UV DTF print", "UV DTF wrap", "glass can", "tumbler", "mug",
    "keychain blank", "phone case blank", "car coaster blank", "acrylic blank", "sticker vinyl",
    "sublimation desk mat blank", "sublimation mouse pad blank", "sublimation paper", "sublimation ink",
    "garden flag blank", "puzzle blank", "coaster blank", "aluminum photo panel", "polyester apparel",
    "light wood", "craft board", "PLA filament"
  ],
  blockedEquipment: ["embroidery machine", "CNC router", "screen printing press", "crochet skill/material process", "resin pouring"],
  blockedProcesses: ["embroidery", "crochet", "jewelry casting", "resin pouring", "screen printing", "large woodworking", "furniture"]
};

const productPipelineKey = "vshr-maker-product-pipeline";
const pipelineStatuses = ["Idea", "Design Needed", "Prototype Needed", "Mockup Needed", "Ready to List", "Listed", "Archived"];

const mockTrendSourceAdapters = [
  {
    id: "etsy-trending",
    label: "Etsy trending searches",
    status: "Disconnected - AI suggestions",
    fetchTrends: () => [
      trendSeed("trend-etsy-teacher-sign", "Etsy trending searches", "Back-to-school acrylic teacher name sign", "Layered acrylic sign", "Personalized gifts", "Personalized classroom name signs are showing seasonal buyer interest.", ["teacher gift", "classroom decor", "name sign", "back to school"], "Rising seasonal searches for teacher gifts", "clear", "Back to school", "Medium", 35, 8, 25, ["CO2 Laser", "UV DTF"], ["3mm acrylic", "adhesive sheet", "UV DTF print"]),
      trendSeed("trend-etsy-crochet-plushie", "Etsy trending searches", "Crochet plushie", "Plush toy", "Toys", "Soft handmade plush characters with viral search interest.", ["crochet plush", "amigurumi", "cute plushie"], "High saves on plush listings", "clear", "All year", "High", 32, 10, 120, ["crochet skill/material process"], ["yarn", "stuffing"])
    ]
  },
  {
    id: "pinterest-trends",
    label: "Pinterest trends",
    status: "Disconnected - AI suggestions",
    fetchTrends: () => [
      trendSeed("trend-pin-desk-mat", "Pinterest trends", "Personalized desk mat", "Desk mat", "Office decor", "Custom desk mats for teachers, gamers, and home offices.", ["desk mat", "teacher desk", "office gift", "personalized"], "More pins around office refresh and teacher desks", "clear", "Back to school", "Medium", 28, 7, 12, ["Sublimation"], ["sublimation desk mat blank", "sublimation paper", "sublimation ink"]),
      trendSeed("trend-pin-resin-tray", "Pinterest trends", "Resin river tray", "Decor tray", "Home decor", "River-style resin serving trays with embedded color effects.", ["resin tray", "river tray", "home decor"], "Popular inspiration pins", "unclear", "Holiday gifting", "High", 65, 55, 180, ["resin pouring"], ["resin", "mold", "pigment"])
    ]
  },
  {
    id: "tiktok-craft",
    label: "TikTok craft/product trends",
    status: "Disconnected - AI suggestions",
    fetchTrends: () => [
      trendSeed("trend-tt-hr-sweatshirt", "TikTok craft/product trends", "Funny HR office humor sweatshirt", "Sweatshirt", "Apparel", "Office humor sweatshirts aimed at HR, managers, and admin teams.", ["HR humor", "office sweatshirt", "work bestie", "employee relations"], "Short-form office humor posts are gaining engagement", "clear", "Fall/Winter", "Medium", 35, 12, 10, ["DTF"], ["sweatshirt blank", "DTF transfer"]),
      trendSeed("trend-tt-glass-can-wrap", "TikTok craft/product trends", "UV DTF glass can wrap", "Glass can", "Drinkware", "Cute themed glass cans with fast personalization options.", ["glass can", "UV DTF wrap", "iced coffee cup", "teacher cup"], "Repeat product demos are getting strong saves", "clear", "Summer/Back to school", "Medium", 18, 5, 8, ["UV DTF"], ["glass can", "UV DTF wrap"])
    ]
  },
  {
    id: "amazon-movers",
    label: "Amazon Movers & Shakers",
    status: "Disconnected - AI suggestions",
    fetchTrends: () => [
      trendSeed("trend-amz-phone-stand", "Amazon Movers & Shakers", "3D printed phone stand", "Phone stand", "Desk accessories", "Simple desk phone stands with personalization and color options.", ["phone stand", "desk accessory", "3D printed gift"], "Desk accessories moving in office organization", "clear", "All year", "High", 12, 2, 90, ["3D Printer"], ["PLA filament"])
    ]
  },
  {
    id: "google-trends",
    label: "Google Trends",
    status: "Disconnected - AI suggestions",
    fetchTrends: () => [
      trendSeed("trend-google-cnc-sign", "Google Trends", "CNC carved wooden sign", "Wood sign", "Home decor", "Deep carved rustic wood signs with family names.", ["wood sign", "CNC sign", "family name sign"], "Search interest appears steady", "clear", "Holiday gifting", "High", 80, 24, 150, ["CNC router"], ["hardwood board", "stain"])
    ]
  },
  {
    id: "reddit-seasonal",
    label: "Reddit craft communities",
    status: "Disconnected - AI suggestions",
    fetchTrends: () => [
      trendSeed("trend-reddit-varsity", "Reddit craft communities", "Embroidered varsity sweatshirt", "Sweatshirt", "Apparel", "Varsity-style embroidered names and mascot sweatshirts.", ["embroidered sweatshirt", "varsity", "custom apparel"], "Discussion volume is high", "clear", "Fall/Winter", "High", 48, 18, 45, ["embroidery machine"], ["sweatshirt blank", "thread", "stabilizer"])
    ]
  },
  {
    id: "seasonal-calendar",
    label: "Seasonal calendars",
    status: "Disconnected - AI suggestions",
    fetchTrends: () => [
      trendSeed("trend-season-cake-topper", "Seasonal calendars", "Graduation acrylic cake topper", "Cake topper", "Party decor", "Fast custom graduation toppers for local pickup and shipping.", ["graduation topper", "acrylic cake topper", "class of 2026"], "Seasonal demand window is approaching", "clear", "Graduation", "Medium", 22, 4, 18, ["CO2 Laser"], ["3mm acrylic"])
    ]
  }
];

const fundingDocumentTypes = [
  "capability statement",
  "business license",
  "SAM/UEI info",
  "WOSB certification",
  "tax documents",
  "bank statements",
  "budget",
  "quote/invoice",
  "resume/bio",
  "prior work samples"
];

const opportunityWorkflowStages = ["Opportunity", "AI Review", "Documents", "Outreach", "Proposal/Application", "Follow Up", "Award/Won/Lost", "Revenue"];
const opportunityTypes = ["Government Contract", "Grant", "HR Consulting Client", "Digital Product Opportunity", "AI Service Opportunity", "Speaking/Training Opportunity"];

const universalOpportunitySeed = [];

const defaultFundingData = {
  selectedFundingId: "",
  opportunities: []
};

function loadDemoData() {
  const saved = localStorage.getItem(demoDataKey);
  return saved ? sanitizeLocalBusinessData({ ...emptyData, ...JSON.parse(saved) }) : { ...emptyData, settings: defaultSettings };
}

function saveDemoData(data) {
  localStorage.setItem(demoDataKey, JSON.stringify(data));
}

function isSeedBusinessRecord(item = {}) {
  const text = `${item.id || ""} ${item.company_name || ""} ${item.name || ""} ${item.email || ""} ${item.invoice_number || ""} ${item.case_number || ""} ${item.investigation_number || ""} ${item.title || ""} ${item.file_name || ""} ${item.note_body || ""} ${item.message || ""}`;
  return /Riverbend Manufacturing|Magnolia Care Group|Dena Brooks|Marcus Lee|Alicia Moore|VS-2026-00[12]|CASE-2026-00[12]|INV-2026-001|riverbend-agreement\.pdf|Riverbend Manufacturing added|VS-2026-002 created/i.test(text);
}

function sanitizeLocalBusinessData(raw = {}) {
  const data = { ...emptyData, ...raw, settings: { ...defaultSettings, ...(raw.settings || {}) } };
  const clients = (data.clients || []).filter(item => !isSeedBusinessRecord(item));
  const clientIds = new Set(clients.map(item => item.id));
  const contacts = (data.contacts || []).filter(item => clientIds.has(item.client_id) && !isSeedBusinessRecord(item));
  const engagements = (data.engagements || []).filter(item => clientIds.has(item.client_id) && !isSeedBusinessRecord(item));
  const cases = (data.cases || []).filter(item => clientIds.has(item.client_id) && !isSeedBusinessRecord(item));
  const investigations = (data.investigations || []).filter(item => clientIds.has(item.client_id) && !isSeedBusinessRecord(item));
  const invoices = (data.invoices || []).filter(item => clientIds.has(item.client_id) && !isSeedBusinessRecord(item));
  const invoiceIds = new Set(invoices.map(item => item.id));
  return {
    ...data,
    clients,
    contacts,
    engagements,
    cases,
    investigations,
    invoices,
    invoice_line_items: (data.invoice_line_items || []).filter(item => invoiceIds.has(item.invoice_id) && !isSeedBusinessRecord(item)),
    documents: (data.documents || []).filter(item => (!item.client_id || clientIds.has(item.client_id)) && !isSeedBusinessRecord(item)),
    notes: (data.notes || []).filter(item => !isSeedBusinessRecord(item)),
    activity_logs: (data.activity_logs || []).filter(item => !isSeedBusinessRecord(item))
  };
}

function loadGovernmentData() {
  const saved = localStorage.getItem(governmentDataKey);
  const data = saved ? { ...defaultGovernmentData, ...JSON.parse(saved) } : defaultGovernmentData;
  const opportunities = (data.opportunities || []).map(normalizeGovernmentOpportunity).filter(item => !isGovernmentMockOpportunity(item));
  const opportunityIds = new Set(opportunities.map(item => item.id));
  const subcontractors = (data.subcontractors || []).map(normalizeGovernmentSubcontractor).filter(item => !isGovernmentMockSubcontractor(item));
  const subcontractorIds = new Set(subcontractors.map(item => item.id));
  const outreach = (data.outreach || [])
    .map(normalizeGovernmentOutreach)
    .filter(item => opportunityIds.has(item.opportunity_id) && subcontractorIds.has(item.subcontractor_id) && !isGovernmentMockOutreach(item));
  const reminders = (data.reminders || [])
    .map(normalizeGovernmentReminder)
    .filter(item => (!item.opportunity_id || opportunityIds.has(item.opportunity_id)) && (!item.subcontractor_id || subcontractorIds.has(item.subcontractor_id)) && !isGovernmentMockReminder(item));
  return {
    ...data,
    selectedOpportunityId: opportunityIds.has(data.selectedOpportunityId) ? data.selectedOpportunityId : opportunities[0]?.id || "",
    opportunities,
    subcontractors,
    outreach,
    reminders,
    awards: (data.awards || []).filter(item => !isGovernmentMockAward(item))
  };
}

function saveGovernmentData(data) {
  localStorage.setItem(governmentDataKey, JSON.stringify(data));
}

function isGovernmentMockOpportunity(item = {}) {
  const text = `${item.id || ""} ${item.title || ""} ${item.agency || ""} ${item.solicitation_number || ""} ${item.source_url || ""} ${item.notes || ""}`;
  return /^gov-[123]$/.test(item.id || "")
    || /\/mock\//i.test(item.source_url || "")
    || /DOL-26-HR-104|GSA-26-ER-219|VA-26-INV-033|HR Compliance Advisory Support|Employee Relations Training|Workplace Investigation Support/i.test(text);
}

function isGovernmentMockSubcontractor(item = {}) {
  const text = `${item.id || ""} ${item.company_name || ""} ${item.email || ""} ${item.notes || ""}`;
  return /^sub-[1234]$/.test(item.id || "")
    || /Carter Federal HR Advisors|Pine Ridge Proposal Pricing|Magnolia Training Partners|ValorGov Solutions|example\.com/i.test(text);
}

function isGovernmentMockOutreach(item = {}) {
  return /^out-[123]$/.test(item.id || "") || /^gov-[123]$/.test(item.opportunity_id || "") || /^sub-[1234]$/.test(item.subcontractor_id || "");
}

function isGovernmentMockReminder(item = {}) {
  const text = `${item.id || ""} ${item.notes || ""}`;
  return /^rem-[12]$/.test(item.id || "") || /^gov-[123]$/.test(item.opportunity_id || "") || /^sub-[1234]$/.test(item.subcontractor_id || "") || /Carter Federal HR Advisors|Proposal due soon/i.test(text);
}

function isGovernmentMockAward(item = {}) {
  const text = `${item.id || ""} ${item.agency || ""} ${item.notes || ""}`;
  return /^awd-1$/.test(item.id || "") || /Mock State Agency|Sample award record/i.test(text);
}

function loadFundingData() {
  const saved = localStorage.getItem(fundingDataKey);
  const data = saved ? { ...defaultFundingData, ...JSON.parse(saved) } : defaultFundingData;
  const opportunities = (data.opportunities || []).filter(item => !isMockFundingOpportunity(item));
  return {
    ...data,
    selectedFundingId: opportunities.some(item => item.id === data.selectedFundingId) ? data.selectedFundingId : opportunities[0]?.id || "",
    opportunities
  };
}

function saveFundingData(data) {
  localStorage.setItem(fundingDataKey, JSON.stringify(data));
}

function isMockFundingOpportunity(item = {}) {
  const text = `${item.id || ""} ${item.title || ""} ${item.funder || ""} ${item.application_url || ""} ${item.notes || ""}`;
  return /^fund-[123]$/.test(item.id || "")
    || /Mock Local Economic Development Office|Mock Creator Economy Fund|Mock State Development Authority|example\.com\/mock|Women-Owned Business Growth Grant|Digital Product Micro-Grant|State Small Business Technology Loan/i.test(text);
}

function loadConfig() {
  const saved = localStorage.getItem(configKey);
  return saved ? JSON.parse(saved) : { supabase_url: "", supabase_anon_key: "" };
}

function saveConfig(config) {
  localStorage.setItem(configKey, JSON.stringify(config));
}

function normalizeSupabaseUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  try {
    const url = new URL(text);
    return `${url.protocol}//${url.host}`;
  } catch {
    return text.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  }
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function currentDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function currentDateTime() {
  return new Date().toLocaleString();
}

function makeSupabase(config) {
  const supabaseUrl = normalizeSupabaseUrl(config.supabase_url);
  const supabaseKey = String(config.supabase_anon_key || "").trim();
  if (!supabaseUrl || !supabaseKey || !window.supabase) return null;
  return window.supabase.createClient(supabaseUrl, supabaseKey);
}

function normalizeGovernmentOpportunity(item = {}) {
  const aiFitScore = Number(item.ai_fit_score ?? item.fit_score ?? 0);
  return {
    id: item.id || uid("gov"),
    title: item.title || "",
    agency: item.agency || "",
    solicitation_number: item.solicitation_number || "",
    naics: item.naics || "",
    set_aside: item.set_aside || "",
    due_date: item.due_date || "",
    estimated_value: Number(item.estimated_value || 0),
    source_url: item.source_url || "",
    description: item.description || item.opportunity_text || item.notes || "",
    opportunity_text: item.opportunity_text || item.description || "",
    ai_fit_score: aiFitScore,
    fit_score: aiFitScore,
    status: item.status || "New",
    next_action: item.next_action || "",
    notes: item.notes || "",
    pws_summary: item.pws_summary || item.notes || "",
    ai_executive_summary: item.ai_executive_summary || "AI executive summary will be generated from the opportunity metadata, scope, NAICS, and capability fit.",
    summary: item.summary || item.notes || "",
    requirements: item.requirements || "",
    scope_of_work: item.scope_of_work || "",
    deliverables: item.deliverables || [],
    risks: item.risks || [],
    required_capabilities: item.required_capabilities || [],
    subcontractor_categories: item.subcontractor_categories || [],
    documents_needed: item.documents_needed || [],
    decision: item.decision || "maybe",
    ai_review: item.ai_review || {
      why: "Run AI review after this opportunity is qualified.",
      risks: [],
      missing_requirements: [],
      recommended_next_action: item.next_action || "Review fit and required documents.",
      suggested_subcontractor_categories: []
    },
    award_outcome: normalizeAwardOutcome(item.award_outcome || {}, item),
    created_at: item.created_at,
    updated_at: item.updated_at
  };
}

function governmentOpportunityPayload(values) {
  return {
    title: values.title || "",
    agency: values.agency || "",
    solicitation_number: values.solicitation_number || "",
    naics: values.naics || "",
    set_aside: values.set_aside || "",
    due_date: values.due_date || null,
    estimated_value: Number(values.estimated_value || 0),
    source_url: values.source_url || "",
    ai_fit_score: Number(values.ai_fit_score ?? values.fit_score ?? 0),
    status: values.status || "New",
    next_action: values.next_action || "",
    notes: values.notes || ""
  };
}

const subcontractorStatuses = ["not contacted", "emailed", "called", "responded", "interested", "not interested"];
const samRegistrationOptions = ["unknown", "yes", "no"];

function normalizeSamRegistrationStatus(item = {}) {
  const raw = String(item.sam_registration_status || item.sam_registered_status || "").toLowerCase();
  if (samRegistrationOptions.includes(raw)) return raw;
  if (item.SAM_registered === true || item.sam_registered === true) return "yes";
  if (item.SAM_registered === false || item.sam_registered === false) return "no";
  return "unknown";
}

function normalizeSubcontractorStatus(status = "") {
  const text = String(status || "").toLowerCase();
  const map = {
    "not contacted": "not contacted",
    drafted: "not contacted",
    draft: "not contacted",
    ready: "not contacted",
    sent: "emailed",
    "email sent": "emailed",
    emailed: "emailed",
    called: "called",
    responded: "responded",
    interested: "interested",
    declined: "not interested",
    "not interested": "not interested",
    "quote requested": "interested",
    "quote received": "interested",
    "follow up needed": "emailed",
    "partner selected": "interested"
  };
  return map[text] || (subcontractorStatuses.includes(text) ? text : "not contacted");
}

function normalizeGovernmentSubcontractor(item = {}) {
  const samStatus = normalizeSamRegistrationStatus(item);
  return {
    id: item.id || uid("sub"),
    company_name: item.company_name || "",
    service_category: item.service_category || "",
    location: item.location || "",
    contact_name: item.contact_name || "",
    email: item.email || "",
    phone: item.phone || "",
    SAM_registered: samStatus === "yes",
    sam_registration_status: samStatus,
    status: normalizeSubcontractorStatus(item.status),
    last_contact_date: item.last_contact_date || "",
    next_follow_up_date: item.next_follow_up_date || item.follow_up_date || "",
    notes: item.notes || "",
    created_at: item.created_at,
    updated_at: item.updated_at
  };
}

function governmentSubcontractorPayload(item) {
  const samStatus = normalizeSamRegistrationStatus(item);
  return {
    id: item.id,
    company_name: item.company_name || "",
    service_category: item.service_category || "",
    location: item.location || "",
    contact_name: item.contact_name || "",
    email: item.email || "",
    phone: item.phone || "",
    sam_registered: samStatus === "yes",
    sam_registration_status: samStatus,
    status: normalizeSubcontractorStatus(item.status),
    last_contact_date: item.last_contact_date || null,
    next_follow_up_date: item.next_follow_up_date || null,
    notes: item.notes || ""
  };
}

function normalizeGovernmentOutreach(item = {}) {
  return {
    id: item.id || uid("out"),
    opportunity_id: item.opportunity_id || "",
    subcontractor_id: item.subcontractor_id || "",
    status: normalizeOutreachStatus(item.status),
    created_at: item.created_at || today,
    follow_up_date: item.follow_up_date || "",
    last_contact_date: item.last_contact_date || "",
    draft_email: item.draft_email || "",
    notes: item.notes || "",
    response_summary: item.response_summary || ""
  };
}

function governmentOutreachPayload(item) {
  return {
    id: item.id,
    opportunity_id: item.opportunity_id,
    subcontractor_id: item.subcontractor_id || null,
    status: normalizeOutreachStatus(item.status),
    created_at: item.created_at || today,
    follow_up_date: item.follow_up_date || null,
    last_contact_date: item.last_contact_date || null,
    draft_email: item.draft_email || "",
    notes: item.notes || "",
    response_summary: item.response_summary || ""
  };
}

function governmentReminderPayload(item) {
  const reminder = normalizeGovernmentReminder(item);
  return {
    id: reminder.id,
    opportunity_id: reminder.opportunity_id,
    subcontractor_id: reminder.subcontractor_id || null,
    type: reminder.type,
    due_date: reminder.due_date || today,
    priority: reminder.priority,
    status: reminder.status,
    notes: reminder.notes || "",
    completed_at: reminder.completed_at || null
  };
}

function governmentAwardPayload(opportunity) {
  const outcome = normalizeAwardOutcome(opportunity.award_outcome, opportunity);
  return {
    id: `awd-${opportunity.id}`,
    opportunity_id: opportunity.id,
    award_status: outcome.award_status,
    award_date: outcome.award_date || null,
    award_amount: Number(outcome.award_amount || 0),
    prime_or_subcontract: outcome.prime_or_subcontract || "Prime",
    contract_number: outcome.contract_number || "",
    period_of_performance: outcome.period_of_performance || "",
    awarding_agency: outcome.awarding_agency || "",
    assigned_subcontractors: outcome.assigned_subcontractors || [],
    internal_notes: outcome.internal_notes || "",
    reason_lost: outcome.reason_lost || "",
    winning_competitor: outcome.winning_competitor || "",
    lessons_learned: outcome.lessons_learned || ""
  };
}

function parseOpportunityText(text = "", url = "") {
  const clean = String(text || "").trim();
  const lines = clean.split("\n").map(line => line.trim()).filter(Boolean);
  const findLine = (...patterns) => lines.find(line => patterns.some(pattern => line.toLowerCase().includes(pattern)));
  const valueAfterColon = line => line?.includes(":") ? line.split(":").slice(1).join(":").trim() : "";
  const amountMatch = clean.match(/\$?([0-9][0-9,]*(?:\.\d{2})?)/);
  const dateMatch = clean.match(/\b(20\d{2}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/20\d{2})\b/);
  const naicsMatch = clean.match(/\b\d{6}\b/);
  const titleLine = valueAfterColon(findLine("title", "opportunity")) || lines[0] || "Imported Government Opportunity";
  const agency = valueAfterColon(findLine("agency", "department", "office")) || "Agency TBD";
  const solicitation = valueAfterColon(findLine("solicitation", "rfp", "notice")) || "";
  const setAside = valueAfterColon(findLine("set-aside", "set aside")) || "";
  const description = clean || "Opportunity text will be added during review.";
  return normalizeGovernmentOpportunity({
    title: titleLine,
    agency,
    solicitation_number: solicitation,
    naics: naicsMatch?.[0] || "",
    set_aside: setAside,
    due_date: dateMatch ? normalizeDateInput(dateMatch[0]) : "",
    estimated_value: amountMatch ? Number(amountMatch[1].replaceAll(",", "")) : 0,
    source_url: url,
    description,
    opportunity_text: clean,
    status: "New",
    ai_fit_score: 0,
    next_action: "Generate AI review",
    created_at: today,
    notes: description.slice(0, 220)
  });
}

function suggestFulfillmentPartners(text, category) {
  const combined = `${text || ""} ${category || ""}`.toLowerCase();
  const list = [];
  if (/supply|supplies|materials|equipment|product|printing|books|paper|furniture|uniform|janitorial|cleaning|food|commodity|kit|parts/.test(combined))
    list.push({ role: "Supplier", reason: "Opportunity involves goods, materials, or physical products.", search: `${category || "government"} supplier Alabama small business` });
  if (/install|maintenance|repair|IT\b|technical|software|electrical|plumbing|hvac|landscap|security|translation|interpreter|medical|clinical|network|data|cyber/.test(combined))
    list.push({ role: "Subcontractor", reason: "Specialized labor or technical service language detected.", search: `${category || "government"} subcontractor Montgomery Alabama` });
  list.push({ role: "Pricing Partner", reason: "Government bids require detailed pricing and cost breakdowns.", search: "government contract pricing consultant Alabama" });
  if (/deliver|transport|logistics|shipping|distribution|freight|courier/.test(combined))
    list.push({ role: "Delivery — Logistics", reason: "Delivery or distribution requirements detected.", search: "delivery logistics partner Alabama small business" });
  if (/install|setup|deploy|configure|assembl/.test(combined))
    list.push({ role: "Installer", reason: "Installation or deployment work identified.", search: "installer contractor Alabama" });
  list.push({ role: "Proposal Support", reason: "All government bids benefit from a professional proposal writer.", search: "government proposal writer small business Alabama" });
  return list;
}

function generateIntakeSearchTerms(title, agency, category, text) {
  const combined = `${title || ""} ${category || ""} ${text || ""}`.toLowerCase();
  const terms = [];
  if (title) terms.push(`${title} government contract`);
  if (agency) terms.push(`${agency} vendor registration`);
  if (category) terms.push(`${category} small business Alabama`);
  if (/hr\b|human resources|personnel|workforce/.test(combined)) terms.push("HR consulting Alabama", "human resources small business vendor");
  if (/training/.test(combined)) terms.push("training provider Alabama", "workforce training subcontractor");
  if (/supply|supplies|materials/.test(combined)) terms.push("office supplies Alabama government vendor");
  if (/IT\b|technology|software|computer|network/.test(combined)) terms.push("IT subcontractor Alabama", "technology services small business");
  if (/janitorial|cleaning|custodial/.test(combined)) terms.push("janitorial services Montgomery AL");
  if (/admin|clerical|office support/.test(combined)) terms.push("administrative services Alabama subcontractor");
  terms.push("SAM.gov small business", "Alabama small business vendor");
  return [...new Set(terms)].slice(0, 10);
}

function normalizeDateInput(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parts = value.split("/");
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return value;
}

function cleanPayload(values) {
  const generated = new Set(["id", "created_at", "updated_at", "total", "amount"]);
  const numeric = new Set(["employee_count", "monthly_retainer_amount", "subtotal", "discount", "tax", "quantity", "rate", "hours_worked", "hourly_rate"]);
  const payload = {};
  Object.entries(values).forEach(([key, value]) => {
    if (generated.has(key)) return;
    if (value === "") payload[key] = null;
    else if (numeric.has(key)) payload[key] = Number(value || 0);
    else payload[key] = value;
  });
  return payload;
}

function clientName(data, id) {
  return data.clients.find(c => c.id === id)?.company_name || "Unassigned";
}

function amount(n) {
  return Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function addDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function addBusinessDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00`);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return date.toISOString().slice(0, 10);
}

function daysUntil(dateText) {
  if (!dateText) return null;
  const start = new Date(`${today}T00:00:00`);
  const end = new Date(`${dateText}T00:00:00`);
  return Math.ceil((end - start) / 86400000);
}

function dueLabel(dateText) {
  const days = daysUntil(dateText);
  if (days === null) return "No due date";
  if (days < 0) return `${Math.abs(days)} day(s) overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days} day(s) left`;
}

function arrayToLines(items = []) {
  return Array.isArray(items) ? items.join("\n") : String(items || "");
}

function linesToArray(text) {
  return String(text || "").split("\n").map(item => item.trim()).filter(Boolean);
}

function downloadText(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [headers.join(","), ...rows.map(row => headers.map(key => csvEscape(row[key])).join(","))].join("\n");
}

function printHtml(title, html) {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return;
  win.document.write(`<!doctype html><html><head><title>${title}</title><style>
    body{font-family:Arial,sans-serif;color:#1f2937;margin:32px}
    h1,h2,h3{color:#10233f} table{width:100%;border-collapse:collapse;margin-top:18px}
    th,td{border-bottom:1px solid #d9dfeb;padding:10px;text-align:left}
    .brand{border-bottom:3px solid #c8a24a;padding-bottom:12px;margin-bottom:20px}
    .right{text-align:right}.muted{color:#667085}.badge{display:inline-block;padding:4px 8px;border:1px solid #d9dfeb;border-radius:999px}
  </style></head><body>${html}</body></html>`);
  win.document.close();
  win.focus();
}

function invoiceHtml(invoice, data) {
  const lines = data.invoice_line_items.filter(item => item.invoice_id === invoice.id);
  return `<div class="brand">
    <h1>V Solutions LLC</h1>
    <p>HR Consulting<br>Owner: Valicia Davis, MBA, PHR<br>Montgomery, AL</p>
  </div>
  <h2>Invoice ${invoice.invoice_number}</h2>
  <p><strong>Client:</strong> ${clientName(data, invoice.client_id)}<br>
  <strong>Status:</strong> ${invoice.status}<br>
  <strong>Invoice date:</strong> ${invoice.invoice_date || ""}<br>
  <strong>Due date:</strong> ${invoice.due_date || ""}</p>
  <table><thead><tr><th>Description</th><th>Category</th><th class="right">Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead><tbody>
    ${lines.length ? lines.map(line => `<tr><td>${line.description || ""}</td><td>${line.service_category || ""}</td><td class="right">${line.quantity || ""}</td><td class="right">${amount(line.rate)}</td><td class="right">${amount(line.amount || Number(line.quantity || 0) * Number(line.rate || 0))}</td></tr>`).join("") : `<tr><td>Consulting services</td><td>HR Consulting</td><td class="right">1</td><td class="right">${amount(invoice.subtotal)}</td><td class="right">${amount(invoice.subtotal)}</td></tr>`}
  </tbody></table>
  <h3 class="right">Total: ${amount(invoice.total)}</h3>
  <p><strong>Services:</strong> HR consulting, compliance, workplace investigations, AI-powered HR solutions, fractional HR support</p>
  <p class="muted">${invoice.notes || ""}</p>`;
}

function investigationHtml(item, data) {
  const interviews = data.investigation_interviews.filter(row => row.investigation_id === item.id);
  const notes = data.notes.filter(row => row.parent_type === "investigation" && row.parent_id === item.id);
  return `<div class="brand"><h1>Investigation Report</h1><p>V Solutions LLC HR Consulting</p></div>
    <h2>${item.investigation_number}</h2>
    <p><strong>Client:</strong> ${clientName(data, item.client_id)}<br>
    <strong>Status:</strong> ${item.status || ""}<br>
    <strong>Date opened:</strong> ${item.date_opened || ""}<br>
    <strong>Investigator:</strong> ${item.investigator_name || ""}</p>
    <h3>Parties</h3><p><strong>Complainant:</strong> ${item.complainant || ""}<br><strong>Respondent:</strong> ${item.respondent || ""}<br><strong>Department:</strong> ${item.department || ""}<br><strong>Shift:</strong> ${item.shift || ""}</p>
    <h3>Complaint Summary</h3><p>${item.complaint_summary || ""}</p>
    <h3>Evidence Reviewed</h3><p>${item.evidence_reviewed || ""}</p>
    <h3>Findings</h3><p><span class="badge">${item.findings || "Pending"}</span></p>
    <h3>Recommended Action</h3><p>${item.recommended_action || ""}</p>
    <h3>Final Summary</h3><p>${item.final_summary || ""}</p>
    <h3>Interview Notes</h3>${interviews.length ? interviews.map(row => `<p><strong>${row.interviewee_name}</strong> (${row.interview_date || ""})<br>${row.interview_notes || ""}</p>`).join("") : "<p>No interview notes entered.</p>"}
    <h3>Timeline Notes</h3>${notes.length ? notes.map(row => `<p><strong>${String(row.created_at || "").slice(0, 10)}</strong><br>${row.note_body || ""}</p>`).join("") : "<p>No notes entered.</p>"}`;
}

function statusClass(status) {
  if (["Active", "Paid", "Resolved", "Closed"].includes(status)) return "success";
  if (["Overdue", "Urgent", "High"].includes(status)) return "danger";
  if (["Sent", "In Progress", "Waiting on Client", "Interviews Scheduled", "Lead"].includes(status)) return "warn";
  return "";
}

function App() {
  const [config, setConfig] = useState(loadConfig);
  const [supabaseClient, setSupabaseClient] = useState(() => makeSupabase(loadConfig()));
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(!makeSupabase(loadConfig()));
  const [data, setData] = useState(loadDemoData);
  const [governmentData, setGovernmentData] = useState(loadGovernmentData);
  const [fundingData, setFundingData] = useState(loadFundingData);
  const [page, setPage] = useState("Home");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sectionReady, setSectionReady] = useState({ home: false, reports: false, search: false, funding: false, hr: false, government: false, admin: false, operations: false, aiWorkspace: false, veeAi: false });

  const realMode = !!supabaseClient && !!session && !demoMode;
  const homeSectionActive = page === "Home";
  const reportsSectionActive = page === "Reports";
  const searchSectionActive = !!query;
  const fundingSectionActive = fundingPages.includes(page);
  const hrSectionActive = page === "Documents" || hrPages.includes(page);
  const governmentSectionActive = governmentPages.includes(page);
  const adminSectionActive = page === "Settings" || adminPages.includes(page);
  const operationsSectionActive = operationsPages.includes(page);
  const aiWorkspaceSectionActive = aiWorkspacePages.includes(page);
  const veeAiSectionActive = veeAiPages.includes(page);

  useEffect(() => {
    if (!supabaseClient || demoMode) {
      setAuthLoading(false);
      return;
    }
    let alive = true;
    supabaseClient.auth.getSession().then(({ data: authData }) => {
      if (alive) {
        setSession(authData.session);
        setAuthLoading(false);
      }
    });
    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, [supabaseClient, demoMode]);

  useEffect(() => {
    if (realMode) loadSupabaseData();
  }, [realMode]);

  useEffect(() => {
    if (!homeSectionActive || sectionReady.home || !window.loadValiciaSection) return;
    let alive = true;
    window.loadValiciaSection("home").then(() => {
      if (alive) setSectionReady(prev => ({ ...prev, home: true }));
    }).catch(err => {
      if (alive) setError(err.message || "Unable to load Home.");
    });
    return () => { alive = false; };
  }, [homeSectionActive, sectionReady.home]);

  useEffect(() => {
    if (!reportsSectionActive || sectionReady.reports || !window.loadValiciaSection) return;
    let alive = true;
    window.loadValiciaSection("reports").then(() => {
      if (alive) setSectionReady(prev => ({ ...prev, reports: true }));
    }).catch(err => {
      if (alive) setError(err.message || "Unable to load Reports.");
    });
    return () => { alive = false; };
  }, [reportsSectionActive, sectionReady.reports]);

  useEffect(() => {
    if (!searchSectionActive || sectionReady.search || !window.loadValiciaSection) return;
    let alive = true;
    window.loadValiciaSection("search").then(() => {
      if (alive) setSectionReady(prev => ({ ...prev, search: true }));
    }).catch(err => {
      if (alive) setError(err.message || "Unable to load Search.");
    });
    return () => { alive = false; };
  }, [searchSectionActive, sectionReady.search]);

  useEffect(() => {
    if (!fundingSectionActive || sectionReady.funding || !window.loadValiciaSection) return;
    let alive = true;
    window.loadValiciaSection("funding").then(() => {
      if (alive) setSectionReady(prev => ({ ...prev, funding: true }));
    }).catch(err => {
      if (alive) setError(err.message || "Unable to load Funding.");
    });
    return () => { alive = false; };
  }, [fundingSectionActive, sectionReady.funding]);

  useEffect(() => {
    if (!hrSectionActive || sectionReady.hr || !window.loadValiciaSection) return;
    let alive = true;
    window.loadValiciaSection("hr").then(() => {
      if (alive) setSectionReady(prev => ({ ...prev, hr: true }));
    }).catch(err => {
      if (alive) setError(err.message || "Unable to load HR Consulting.");
    });
    return () => { alive = false; };
  }, [hrSectionActive, sectionReady.hr]);

  useEffect(() => {
    if (!governmentSectionActive || sectionReady.government || !window.loadValiciaSection) return;
    let alive = true;
    window.loadValiciaSection("government").then(() => {
      if (alive) setSectionReady(prev => ({ ...prev, government: true }));
    }).catch(err => {
      if (alive) setError(err.message || "Unable to load Government.");
    });
    return () => { alive = false; };
  }, [governmentSectionActive, sectionReady.government]);

  useEffect(() => {
    if (!adminSectionActive || sectionReady.admin || !window.loadValiciaSection) return;
    let alive = true;
    window.loadValiciaSection("admin").then(() => {
      if (alive) setSectionReady(prev => ({ ...prev, admin: true }));
    }).catch(err => {
      if (alive) setError(err.message || "Unable to load Admin.");
    });
    return () => { alive = false; };
  }, [adminSectionActive, sectionReady.admin]);

  useEffect(() => {
    if (!operationsSectionActive || sectionReady.operations || !window.loadValiciaSection) return;
    let alive = true;
    window.loadValiciaSection("operations").then(() => {
      if (alive) setSectionReady(prev => ({ ...prev, operations: true }));
    }).catch(err => {
      if (alive) setError(err.message || "Unable to load Operations.");
    });
    return () => { alive = false; };
  }, [operationsSectionActive, sectionReady.operations]);

  useEffect(() => {
    if (!aiWorkspaceSectionActive || sectionReady.aiWorkspace || !window.loadValiciaSection) return;
    let alive = true;
    window.loadValiciaSection("aiWorkspace").then(() => {
      if (alive) setSectionReady(prev => ({ ...prev, aiWorkspace: true }));
    }).catch(err => {
      if (alive) setError(err.message || "Unable to load AI Workspace.");
    });
    return () => { alive = false; };
  }, [aiWorkspaceSectionActive, sectionReady.aiWorkspace]);

  useEffect(() => {
    if (!veeAiSectionActive || sectionReady.veeAi || !window.loadValiciaSection) return;
    let alive = true;
    window.loadValiciaSection("veeAi").then(() => {
      if (alive) setSectionReady(prev => ({ ...prev, veeAi: true }));
    }).catch(err => {
      if (alive) setError(err.message || "Unable to load Vee AI.");
    });
    return () => { alive = false; };
  }, [veeAiSectionActive, sectionReady.veeAi]);

  const storeConfig = next => {
    const cleaned = {
      supabase_url: normalizeSupabaseUrl(next.supabase_url),
      supabase_anon_key: String(next.supabase_anon_key || "").trim()
    };
    saveConfig(cleaned);
    setConfig(cleaned);
    const client = makeSupabase(cleaned);
    setSupabaseClient(client);
    setDemoMode(!client);
    setNotice(client ? "Supabase configured. Sign in to continue." : "Supabase configuration is incomplete.");
  };

  const loadSupabaseData = async () => {
    setLoading(true);
    setError("");
    try {
      const [clients, contacts, invoices, lineItems, documents, engagements, cases, investigations, interviews, aiDocs, notes, logs, profile] = await Promise.all([
        supabaseClient.from("clients").select("*").order("company_name"),
        supabaseClient.from("contacts").select("*").order("name"),
        supabaseClient.from("invoices").select("*").order("invoice_date", { ascending: false }),
        supabaseClient.from("invoice_line_items").select("*"),
        supabaseClient.from("documents").select("*").order("created_at", { ascending: false }),
        supabaseClient.from("engagements").select("*").order("service_date", { ascending: false }),
        supabaseClient.from("cases").select("*").order("date_opened", { ascending: false }),
        supabaseClient.from("investigations").select("*").order("date_opened", { ascending: false }),
        supabaseClient.from("investigation_interviews").select("*").order("interview_date", { ascending: false }),
        supabaseClient.from("ai_documents").select("*").order("created_at", { ascending: false }),
        supabaseClient.from("notes").select("*").order("created_at", { ascending: false }),
        supabaseClient.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(25),
        supabaseClient.from("profiles").select("*").eq("id", session.user.id).maybeSingle()
      ]);
      [clients, contacts, invoices, lineItems, documents, engagements, cases, investigations, interviews, aiDocs, notes, logs, profile].forEach(result => {
        if (result.error) throw result.error;
      });
      setData({
        ...emptyData,
        settings: { ...defaultSettings, ...(profile.data || {}), ...config },
        clients: clients.data || [],
        contacts: contacts.data || [],
        invoices: invoices.data || [],
        invoice_line_items: lineItems.data || [],
        documents: documents.data || [],
        engagements: engagements.data || [],
        cases: cases.data || [],
        investigations: investigations.data || [],
        investigation_interviews: interviews.data || [],
        ai_documents: aiDocs.data || [],
        notes: notes.data || [],
        activity_logs: logs.data || []
      });
      await loadGovernmentOpportunities();
    } catch (err) {
      setError(err.message || "Unable to load Supabase data.");
    } finally {
      setLoading(false);
    }
  };

  const updateDemo = next => {
    setData(next);
    saveDemoData(next);
  };

  const updateGovernmentData = next => {
    const previous = governmentData;
    setGovernmentData(next);
    if (!realMode) {
      saveGovernmentData(next);
      return;
    }
    persistGovernmentData(previous, next).catch(err => {
      setError(err.message || "Unable to save government command center data.");
    });
  };

  const sameRecord = (left, right) => JSON.stringify(left || null) === JSON.stringify(right || null);

  const persistGovernmentRows = async (table, previousRows, nextRows, payloadFor) => {
    const previousById = new Map((previousRows || []).filter(item => item.id).map(item => [item.id, item]));
    const nextById = new Map((nextRows || []).filter(item => item.id).map(item => [item.id, item]));
    const removedIds = [...previousById.keys()].filter(id => !nextById.has(id));
    if (removedIds.length) {
      const deleteResult = await supabaseClient.from(table).delete().in("id", removedIds);
      if (deleteResult.error) throw deleteResult.error;
    }
    const changed = [...nextById.values()].filter(item => !sameRecord(previousById.get(item.id), item));
    if (changed.length) {
      const upsertResult = await supabaseClient.from(table).upsert(changed.map(item => ({ ...payloadFor(item), owner_id: session.user.id })));
      if (upsertResult.error) throw upsertResult.error;
    }
  };

  const persistGovernmentData = async (previous, next) => {
    const changedOpportunities = (next.opportunities || []).filter(item => {
      const old = (previous.opportunities || []).find(row => row.id === item.id);
      return old && !sameRecord(old, item);
    });
    for (const item of changedOpportunities) {
      const updateResult = await supabaseClient.from("government_opportunities").update(governmentOpportunityPayload(item)).eq("id", item.id);
      if (updateResult.error) throw updateResult.error;
    }
    await persistGovernmentRows("government_subcontractors", previous.subcontractors || [], next.subcontractors || [], governmentSubcontractorPayload);
    await persistGovernmentRows("government_outreach", previous.outreach || [], next.outreach || [], governmentOutreachPayload);
    await persistGovernmentRows("government_reminders", previous.reminders || [], next.reminders || [], governmentReminderPayload);

    const previousAwardRows = (previous.opportunities || []).map(item => ({ id: `awd-${item.id}`, ...governmentAwardPayload(item) }));
    const nextAwardRows = (next.opportunities || []).map(item => ({ id: `awd-${item.id}`, ...governmentAwardPayload(item) }));
    await persistGovernmentRows("government_awards", previousAwardRows, nextAwardRows, item => item);
  };

  const loadGovernmentOpportunities = async () => {
    if (!realMode) return;
    const [opportunitiesResult, subcontractorsResult, outreachResult, remindersResult, awardsResult] = await Promise.all([
      supabaseClient.from("government_opportunities").select("*").order("due_date", { ascending: true, nullsFirst: false }),
      supabaseClient.from("government_subcontractors").select("*").order("company_name"),
      supabaseClient.from("government_outreach").select("*").order("created_at", { ascending: false }),
      supabaseClient.from("government_reminders").select("*").order("due_date", { ascending: true }),
      supabaseClient.from("government_awards").select("*")
    ]);
    const results = [opportunitiesResult, subcontractorsResult, outreachResult, remindersResult, awardsResult];
    const failed = results.find(result => result.error);
    if (failed) {
      const message = failed.error.message || "";
      if (message.includes("government_") || message.includes("schema cache")) {
        setNotice("Government command center is using local data. Run the updated 003_government_opportunities.sql migration to enable full Supabase persistence.");
        return;
      }
      throw failed.error;
    }
    const subcontractors = (subcontractorsResult.data || []).map(normalizeGovernmentSubcontractor).filter(item => !isGovernmentMockSubcontractor(item));
    const awards = (awardsResult.data || []).filter(item => !isGovernmentMockAward(item));
    const awardsByOpportunityId = new Map(awards.map(item => [item.opportunity_id, item]));
    const opportunities = (opportunitiesResult.data || []).map(item => {
      const award = awardsByOpportunityId.get(item.id);
      return normalizeGovernmentOpportunity({
        ...item,
        award_outcome: award ? {
          award_status: award.award_status,
          award_date: award.award_date,
          award_amount: award.award_amount,
          prime_or_subcontract: award.prime_or_subcontract,
          contract_number: award.contract_number,
          period_of_performance: award.period_of_performance,
          awarding_agency: award.awarding_agency,
          assigned_subcontractors: award.assigned_subcontractors || [],
          internal_notes: award.internal_notes,
          reason_lost: award.reason_lost,
          winning_competitor: award.winning_competitor,
          lessons_learned: award.lessons_learned
        } : {}
      });
    }).filter(item => !isGovernmentMockOpportunity(item));
    const opportunityIds = new Set(opportunities.map(item => item.id));
    const subcontractorIds = new Set(subcontractors.map(item => item.id));
    setGovernmentData(prev => ({
      ...prev,
      selectedOpportunityId: opportunities.some(item => item.id === prev.selectedOpportunityId) ? prev.selectedOpportunityId : opportunities[0]?.id || "",
      opportunities,
      subcontractors,
      outreach: (outreachResult.data || [])
        .map(normalizeGovernmentOutreach)
        .filter(item => opportunityIds.has(item.opportunity_id) && subcontractorIds.has(item.subcontractor_id) && !isGovernmentMockOutreach(item)),
      reminders: (remindersResult.data || [])
        .map(normalizeGovernmentReminder)
        .filter(item => (!item.opportunity_id || opportunityIds.has(item.opportunity_id)) && (!item.subcontractor_id || subcontractorIds.has(item.subcontractor_id)) && !isGovernmentMockReminder(item)),
      awards
    }));
  };

  const saveGovernmentOpportunity = async (values, id) => {
    setError("");
    const payload = governmentOpportunityPayload(values);
    if (!payload.title.trim()) {
      setError("Opportunity title is required.");
      return;
    }
    if (!realMode) {
      const record = normalizeGovernmentOpportunity({ ...values, ...payload, id: id || uid("gov"), updated_at: today, created_at: values.created_at || today });
      const nextOpportunities = id
        ? governmentData.opportunities.map(item => item.id === id ? record : item)
        : [record, ...governmentData.opportunities];
      updateGovernmentData({
        ...governmentData,
        selectedOpportunityId: record.id,
        opportunities: nextOpportunities,
        reminders: mergeGovernmentReminders(governmentData.reminders, automaticOpportunityReminders(record))
      });
      setNotice(id ? "Government opportunity updated." : "Government opportunity created.");
      return record;
    }
    try {
      const request = id
        ? supabaseClient.from("government_opportunities").update(payload).eq("id", id).select().single()
        : supabaseClient.from("government_opportunities").insert({ ...payload, owner_id: session.user.id }).select().single();
      const result = await request;
      if (result.error) throw result.error;
      const savedOpportunity = normalizeGovernmentOpportunity(result.data);
      const reminderAdditions = automaticOpportunityReminders(savedOpportunity);
      if (reminderAdditions.length) {
        const reminderResult = await supabaseClient.from("government_reminders").upsert(
          reminderAdditions.map(item => ({ ...governmentReminderPayload(item), owner_id: session.user.id }))
        );
        if (reminderResult.error) throw reminderResult.error;
      }
      await logActivity(id ? "Government opportunity updated" : "Government opportunity created", "government_opportunity", result.data.id, `${result.data.title} saved.`);
      await loadGovernmentOpportunities();
      setGovernmentData(prev => ({ ...prev, selectedOpportunityId: result.data.id }));
      setNotice(id ? "Government opportunity updated." : "Government opportunity created.");
      return savedOpportunity;
    } catch (err) {
      setError(err.message || "Unable to save government opportunity.");
      return null;
    }
  };

  const deleteGovernmentOpportunity = async id => {
    setError("");
    if (!confirm("Delete this government opportunity?")) return;
    if (!realMode) {
      const nextOpportunities = governmentData.opportunities.filter(item => item.id !== id);
      updateGovernmentData({
        ...governmentData,
        selectedOpportunityId: nextOpportunities[0]?.id || "",
        opportunities: nextOpportunities,
        outreach: governmentData.outreach.filter(item => item.opportunity_id !== id),
        reminders: (governmentData.reminders || []).filter(item => item.opportunity_id !== id)
      });
      setNotice("Government opportunity deleted.");
      return;
    }
    try {
      const result = await supabaseClient.from("government_opportunities").delete().eq("id", id);
      if (result.error) throw result.error;
      await logActivity("Government opportunity deleted", "government_opportunity", id, "Government opportunity deleted.");
      await loadGovernmentOpportunities();
      setNotice("Government opportunity deleted.");
    } catch (err) {
      setError(err.message || "Unable to delete government opportunity.");
    }
  };

  const updateFundingData = next => {
    setFundingData(next);
    saveFundingData(next);
  };

  const logActivity = async (action, parentType, parentId, message) => {
    if (!realMode) return;
    await supabaseClient.from("activity_logs").insert({
      owner_id: session.user.id,
      action,
      parent_type: parentType,
      parent_id: parentId,
      message
    });
  };

  const addRecord = async (table, values) => {
    setError("");
    if (!realMode) {
      const record = { ...values, id: uid(table[0]), owner_id: demoOwnerId, created_at: today, updated_at: today };
      if (table === "cases") record.case_number = values.case_number || `CASE-2026-${String(data.cases.length + 1).padStart(3, "0")}`;
      if (table === "investigations") record.investigation_number = values.investigation_number || `INV-2026-${String(data.investigations.length + 1).padStart(3, "0")}`;
      if (table === "invoices") {
        record.invoice_number = `VS-2026-${String(data.invoices.length + 1).padStart(3, "0")}`;
        record.total = Number(record.subtotal || 0) - Number(record.discount || 0) + Number(record.tax || 0);
      }
      const log = { id: uid("a"), action: `${table.slice(0, -1)} created`, parent_type: table.slice(0, -1), parent_id: record.id, message: `${table} record created.`, created_at: today };
      updateDemo({ ...data, [table]: [record, ...(data[table] || [])], activity_logs: [log, ...data.activity_logs] });
      setModal(null);
      return;
    }

    try {
      const payload = { ...cleanPayload(values), owner_id: session.user.id };
      if (table === "invoices") payload.invoice_number = values.invoice_number || `VS-${new Date().getFullYear()}-${String(data.invoices.length + 1).padStart(3, "0")}`;
      if (table === "cases") payload.case_number = values.case_number || `CASE-${new Date().getFullYear()}-${String(data.cases.length + 1).padStart(3, "0")}`;
      if (table === "investigations") payload.investigation_number = values.investigation_number || `INV-${new Date().getFullYear()}-${String(data.investigations.length + 1).padStart(3, "0")}`;
      const result = await supabaseClient.from(table).insert(payload).select().single();
      if (result.error) throw result.error;
      await logActivity(`${table.slice(0, -1)} created`, table.slice(0, -1), result.data.id, `${table} record created.`);
      await loadSupabaseData();
      setModal(null);
    } catch (err) {
      setError(err.message || "Unable to create record.");
    }
  };

  const patchRecord = async (table, id, values) => {
    setError("");
    if (!realMode) {
      const rows = data[table].map(row => row.id === id ? { ...row, ...values, updated_at: today } : row);
      updateDemo({
        ...data,
        [table]: rows,
        activity_logs: [{ id: uid("a"), owner_id: demoOwnerId, action: `${table.slice(0, -1)} updated`, parent_type: table.slice(0, -1), parent_id: id, message: `${table} record updated.`, created_at: today }, ...data.activity_logs]
      });
      return;
    }
    try {
      const result = await supabaseClient.from(table).update(cleanPayload(values)).eq("id", id).select().single();
      if (result.error) throw result.error;
      await logActivity(`${table.slice(0, -1)} updated`, table.slice(0, -1), id, `${table} record updated.`);
      await loadSupabaseData();
    } catch (err) {
      setError(err.message || "Unable to update record.");
    }
  };

  const deleteRecord = async (table, id) => {
    setError("");
    if (!confirm("Delete this record?")) return;
    if (!realMode) {
      updateDemo({
        ...data,
        [table]: data[table].filter(row => row.id !== id),
        activity_logs: [{ id: uid("a"), owner_id: demoOwnerId, action: `${table.slice(0, -1)} deleted`, parent_type: table.slice(0, -1), parent_id: id, message: `${table} record deleted.`, created_at: today }, ...data.activity_logs]
      });
      return;
    }
    try {
      if (table === "documents") {
        const doc = data.documents.find(row => row.id === id);
        if (doc?.storage_path) await supabaseClient.storage.from("hr-documents").remove([doc.storage_path]);
      }
      const result = await supabaseClient.from(table).delete().eq("id", id);
      if (result.error) throw result.error;
      await logActivity(`${table.slice(0, -1)} deleted`, table.slice(0, -1), id, `${table} record deleted.`);
      await loadSupabaseData();
    } catch (err) {
      setError(err.message || "Unable to delete record.");
    }
  };

  const downloadDocument = async doc => {
    setError("");
    if (!realMode || !doc.storage_path) {
      setNotice("Demo documents do not have stored file contents.");
      return;
    }
    const result = await supabaseClient.storage.from("hr-documents").createSignedUrl(doc.storage_path, 60);
    if (result.error) setError(result.error.message);
    else window.open(result.data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const saveModal = async (table, values, id) => {
    id ? await patchRecord(table, id, values) : await addRecord(table, values);
    setModal(null);
  };

  const createInvoiceFromEngagements = async (clientId, engagementIds) => {
    setError("");
    const selected = data.engagements.filter(item => engagementIds.includes(item.id));
    if (!clientId || !selected.length) {
      setError("Select a client and at least one engagement.");
      return;
    }
    const subtotal = selected.reduce((sum, item) => sum + Number(item.amount || Number(item.hours_worked || 0) * Number(item.hourly_rate || 0)), 0);
    const invoiceNumber = `VS-${new Date().getFullYear()}-${String(data.invoices.length + 1).padStart(3, "0")}`;
    const invoicePayload = {
      client_id: clientId,
      invoice_number: invoiceNumber,
      invoice_date: today,
      due_date: addDays(today, 15),
      billing_period_start: selected.map(item => item.service_date).sort()[0],
      billing_period_end: selected.map(item => item.service_date).sort().slice(-1)[0],
      status: "Draft",
      subtotal,
      discount: 0,
      tax: 0,
      notes: "Generated from billable engagement entries."
    };

    if (!realMode) {
      const invoice = { ...invoicePayload, id: uid("v"), owner_id: demoOwnerId, total: subtotal, created_at: today, updated_at: today };
      const lineItems = selected.map(item => ({
        id: uid("li"),
        owner_id: demoOwnerId,
        invoice_id: invoice.id,
        description: item.description || item.service_category,
        service_category: item.service_category,
        quantity: Number(item.hours_worked || 0),
        rate: Number(item.hourly_rate || 0),
        amount: Number(item.amount || Number(item.hours_worked || 0) * Number(item.hourly_rate || 0)),
        related_engagement_id: item.id
      }));
      updateDemo({
        ...data,
        invoices: [invoice, ...data.invoices],
        invoice_line_items: [...lineItems, ...data.invoice_line_items],
        engagements: data.engagements.map(item => engagementIds.includes(item.id) ? { ...item, invoice_status: "Invoiced" } : item),
        activity_logs: [{ id: uid("a"), owner_id: demoOwnerId, action: "Invoice created", parent_type: "invoice", parent_id: invoice.id, message: `${invoiceNumber} created from engagements.`, created_at: today }, ...data.activity_logs]
      });
      setNotice(`${invoiceNumber} created from selected engagements.`);
      return;
    }

    try {
      const invoiceResult = await supabaseClient.from("invoices").insert({ ...invoicePayload, owner_id: session.user.id }).select().single();
      if (invoiceResult.error) throw invoiceResult.error;
      const invoice = invoiceResult.data;
      const linePayloads = selected.map(item => ({
        owner_id: session.user.id,
        invoice_id: invoice.id,
        description: item.description || item.service_category,
        service_category: item.service_category,
        quantity: Number(item.hours_worked || 0),
        rate: Number(item.hourly_rate || 0),
        related_engagement_id: item.id
      }));
      const lineResult = await supabaseClient.from("invoice_line_items").insert(linePayloads);
      if (lineResult.error) throw lineResult.error;
      const updateResult = await supabaseClient.from("engagements").update({ invoice_status: "Invoiced" }).in("id", engagementIds);
      if (updateResult.error) throw updateResult.error;
      await logActivity("Invoice created", "invoice", invoice.id, `${invoice.invoice_number} created from engagements.`);
      await loadSupabaseData();
      setNotice(`${invoice.invoice_number} created from selected engagements.`);
    } catch (err) {
      setError(err.message || "Unable to create invoice from engagements.");
    }
  };

  const runAutomations = async () => {
    const overdueInvoices = data.invoices.filter(item => !["Paid", "Cancelled", "Overdue"].includes(item.status) && item.due_date && item.due_date < today);
    const upcomingRenewals = data.clients.filter(client => client.contract_end_date && client.contract_end_date >= today && client.contract_end_date <= addDays(today, 60));

    if (!realMode) {
      updateDemo({
        ...data,
        invoices: data.invoices.map(item => overdueInvoices.some(overdue => overdue.id === item.id) ? { ...item, status: "Overdue" } : item),
        activity_logs: [
          ...overdueInvoices.map(item => ({ id: uid("a"), owner_id: demoOwnerId, action: "Invoice marked overdue", parent_type: "invoice", parent_id: item.id, message: `${item.invoice_number} marked overdue.`, created_at: today })),
          ...upcomingRenewals.map(client => ({ id: uid("a"), owner_id: demoOwnerId, action: "Renewal reminder", parent_type: "client", parent_id: client.id, message: `${client.company_name} contract renews on ${client.contract_end_date}.`, created_at: today })),
          ...data.activity_logs
        ]
      });
      setNotice(`Automation complete: ${overdueInvoices.length} overdue invoice(s), ${upcomingRenewals.length} renewal reminder(s).`);
      return;
    }

    try {
      for (const invoice of overdueInvoices) {
        const result = await supabaseClient.from("invoices").update({ status: "Overdue" }).eq("id", invoice.id);
        if (result.error) throw result.error;
        await logActivity("Invoice marked overdue", "invoice", invoice.id, `${invoice.invoice_number} marked overdue.`);
      }
      for (const client of upcomingRenewals) {
        await logActivity("Renewal reminder", "client", client.id, `${client.company_name} contract renews on ${client.contract_end_date}.`);
      }
      await loadSupabaseData();
      setNotice(`Automation complete: ${overdueInvoices.length} overdue invoice(s), ${upcomingRenewals.length} renewal reminder(s).`);
    } catch (err) {
      setError(err.message || "Unable to run automations.");
    }
  };

  const saveSettings = async nextSettings => {
    const nextConfig = {
      supabase_url: nextSettings.supabase_url || config.supabase_url,
      supabase_anon_key: nextSettings.supabase_anon_key || config.supabase_anon_key
    };
    storeConfig(nextConfig);
    if (!realMode) {
      updateDemo({ ...data, settings: { ...nextSettings, ...nextConfig } });
      return;
    }
    const payload = {
      id: session.user.id,
      full_name: nextSettings.full_name || "",
      business_name: nextSettings.business_name,
      business_email: nextSettings.business_email,
      phone: nextSettings.phone,
      address: nextSettings.address,
      default_hourly_rate: Number(nextSettings.default_hourly_rate || 0),
      default_invoice_terms: nextSettings.default_invoice_terms,
      default_monthly_retainer_terms: nextSettings.default_monthly_retainer_terms
    };
    const result = await supabaseClient.from("profiles").upsert(payload).select().single();
    if (result.error) setError(result.error.message);
    else {
      setNotice("Settings saved.");
      await loadSupabaseData();
    }
  };

  const uploadDocument = async (form, file) => {
    setError("");
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    if (!realMode) {
      const doc = { ...form, id: uid("d"), owner_id: demoOwnerId, file_name: file.name, storage_path: "", created_at: today };
      updateDemo({ ...data, documents: [doc, ...data.documents] });
      return;
    }
    try {
      const path = `${session.user.id}/${Date.now()}-${file.name}`;
      const upload = await supabaseClient.storage.from("hr-documents").upload(path, file);
      if (upload.error) throw upload.error;
      const insert = await supabaseClient.from("documents").insert({
        ...cleanPayload(form),
        owner_id: session.user.id,
        file_name: file.name,
        storage_path: path
      }).select().single();
      if (insert.error) throw insert.error;
      await logActivity("Document uploaded", "document", insert.data.id, `${file.name} uploaded.`);
      await loadSupabaseData();
      setNotice("Document uploaded.");
    } catch (err) {
      setError(err.message || "Unable to upload document.");
    }
  };

  const signOut = async () => {
    if (supabaseClient) await supabaseClient.auth.signOut();
    setSession(null);
  };

  const exportBackup = () => {
    const backup = {
      exported_at: new Date().toISOString(),
      app: "Valicia Operations Center",
      mode: realMode ? "supabase" : "demo",
      data,
      governmentData,
      fundingData
    };
    downloadText(`v-solutions-hr-os-backup-${today}.json`, JSON.stringify(backup, null, 2), "application/json");
  };

  const metrics = useMemo(() => {
    const activeClients = data.clients.filter(c => c.status === "Active").length;
    const openCases = data.cases.filter(c => !["Resolved", "Closed"].includes(c.status)).length;
    const openInvestigations = data.investigations.filter(i => i.status !== "Closed").length;
    const outstanding = data.invoices.filter(i => !["Paid", "Cancelled"].includes(i.status)).reduce((s, i) => s + Number(i.total || 0), 0);
    const monthlyRevenue = data.invoices.filter(i => i.status === "Paid" && (i.payment_date || "").startsWith("2026-05")).reduce((s, i) => s + Number(i.total || 0), 0);
    const overdue = data.invoices.filter(i => i.status !== "Paid" && i.due_date && i.due_date < today).length;
    const renewals = data.clients.filter(c => c.contract_end_date && c.contract_end_date <= "2026-12-31").length;
    const billableHours = data.engagements.filter(e => e.billable).reduce((s, e) => s + Number(e.hours_worked || 0), 0);
    return { activeClients, openCases, openInvestigations, outstanding, monthlyRevenue, overdue, renewals, billableHours };
  }, [data]);

  const activeCategory = navigation.find(section => section.pages.includes(page))?.category || "Home";

  if (authLoading) return <Splash text="Loading Valicia Operations Center..." />;
  if (!demoMode && !session) return <AuthGate config={config} storeConfig={storeConfig} supabaseClient={supabaseClient} setDemoMode={setDemoMode} error={error} setError={setError} />;

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand"><h1>Valicia Operations Center</h1><span>{realMode ? "Supabase secured mode" : "Local mode"}</span></div>
        <nav className="nav category-nav" aria-label="Main sections">
          {navigation.map(section => {
            const isActive = section.category === activeCategory;
            return (
              <div className="nav-group" key={section.category}>
                <button className={isActive ? "active" : ""} aria-expanded={isActive} onClick={() => setPage(section.pages[0])}>{section.category}</button>
                {isActive && section.pages.length > 1 && (
                  <div className="subnav">
                    {section.pages.map(p => <button key={p} className={page === p ? "active" : ""} aria-current={page === p ? "page" : undefined} onClick={() => setPage(p)}>{p}</button>)}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
      <main className="main" id="main-content">
        <div className="topbar" role="search">
          <label className="sr-only" htmlFor="global-search">Global search</label>
          <input id="global-search" className="search" aria-label="Global search" placeholder="Search clients, contacts, invoices, documents..." value={query} onChange={e => setQuery(e.target.value)} />
          {loading && <span className="mode">Syncing...</span>}
          <span className="mode">{realMode ? session.user.email : "Local workspace"}</span>
          {realMode && <button className="btn secondary" onClick={signOut}>Sign out</button>}
        </div>
        <section className="content">
          {notice && <Banner type="info" text={notice} onClose={() => setNotice("")} />}
          {error && <Banner type="error" text={error} onClose={() => setError("")} />}
          {query ? (sectionReady.search ? <Search data={data} query={query} setPage={setPage} /> : <Splash text="Loading Search..." />) :
            page === "Home" ? (sectionReady.home ? <HomeDashboard data={data} metrics={metrics} governmentData={governmentData} fundingData={fundingData} realMode={realMode} runAutomations={runAutomations} setPage={setPage} /> : <Splash text="Loading Home..." />) :
            page === "Revenue" ? <RevenueCenter metrics={metrics} fundingData={fundingData} governmentData={governmentData} data={data} setPage={setPage} /> :
            productTrendPages.includes(page) ? <MakeableProductTrendFinder /> :
            revenuePages.includes(page) ? <UniversalOpportunityEngine data={data} governmentData={governmentData} fundingData={fundingData} setPage={setPage} /> :
            fundingPages.includes(page) ? (sectionReady.funding ? <FundingCenter page={page} fundingData={fundingData} updateFundingData={updateFundingData} setPage={setPage} /> : <Splash text="Loading Funding..." />) :
            page === "Reports" ? (sectionReady.reports ? <Reports data={data} /> : <Splash text="Loading Reports..." />) :
            page === "Settings" ? (sectionReady.admin ? <Settings data={data} config={config} saveSettings={saveSettings} exportBackup={exportBackup} realMode={realMode} /> : <Splash text="Loading Admin..." />) :
            page === "HR Document Generator" ? <AIGenerator data={data} addRecord={addRecord} realMode={realMode} /> :
            page === "Documents" ? (sectionReady.hr ? <DocumentsModule data={data} setModal={setModal} deleteRecord={deleteRecord} uploadDocument={uploadDocument} downloadDocument={downloadDocument} realMode={realMode} /> : <Splash text="Loading HR Consulting..." />) :
            hrPages.includes(page) ? (sectionReady.hr ? <Module page={page} data={data} setModal={setModal} patchRecord={patchRecord} deleteRecord={deleteRecord} addRecord={addRecord} createInvoiceFromEngagements={createInvoiceFromEngagements} /> : <Splash text="Loading HR Consulting..." />) :
            governmentPages.includes(page) ? (sectionReady.government ? <GovernmentCenter page={page} governmentData={governmentData} updateGovernmentData={updateGovernmentData} saveGovernmentOpportunity={saveGovernmentOpportunity} deleteGovernmentOpportunity={deleteGovernmentOpportunity} setPage={setPage} /> : <Splash text="Loading Government..." />) :
            operationsPages.includes(page) ? (sectionReady.operations ? <OperationsCenter page={page} runAutomations={runAutomations} /> : <Splash text="Loading Operations..." />) :
            aiWorkspacePages.includes(page) ? (sectionReady.aiWorkspace ? <AIWorkspacePage page={page} /> : <Splash text="Loading AI Workspace..." />) :
            veeAiPages.includes(page) ? (sectionReady.veeAi ? <VeeAIPage /> : <Splash text="Loading Vee AI..." />) :
            adminPages.includes(page) ? (sectionReady.admin ? <AdminPage page={page} realMode={realMode} /> : <Splash text="Loading Admin..." />) :
            (sectionReady.home ? <HomeDashboard data={data} metrics={metrics} governmentData={governmentData} fundingData={fundingData} realMode={realMode} runAutomations={runAutomations} setPage={setPage} /> : <Splash text="Loading Home..." />)}
        </section>
      </main>
      {modal && typeof RecordModal === "function" && <RecordModal modal={modal} data={data} onSave={saveModal} onClose={() => setModal(null)} />}
    </div>
  );
}

function AuthGate({ config, storeConfig, supabaseClient, setDemoMode, error, setError }) {
  const [form, setForm] = useState({ ...config, email: "", password: "" });
  const [mode, setMode] = useState("signin");
  const configured = !!supabaseClient;

  const submit = async () => {
    setError("");
    if (!configured) {
      storeConfig({ supabase_url: form.supabase_url, supabase_anon_key: form.supabase_anon_key });
      return;
    }
    const args = { email: form.email, password: form.password };
    const result = mode === "signup" ? await supabaseClient.auth.signUp(args) : await supabaseClient.auth.signInWithPassword(args);
    if (result.error) setError(result.error.message);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Valicia Operations Center</h1>
        <p>Sign in with Supabase Auth to use secured database mode.</p>
        {error && <Banner type="error" text={error} onClose={() => setError("")} />}
        <div className="form">
          <label>Supabase URL<input value={form.supabase_url || ""} onChange={e => setForm({ ...form, supabase_url: e.target.value })} /></label>
          <label>Supabase anon key<input value={form.supabase_anon_key || ""} onChange={e => setForm({ ...form, supabase_anon_key: e.target.value })} /></label>
          <button className="btn secondary" onClick={() => storeConfig({ supabase_url: form.supabase_url, supabase_anon_key: form.supabase_anon_key })}>Save Supabase config</button>
          <label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
          <label>Password<input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>
          <div className="actions">
            <button className="btn" onClick={submit}>{mode === "signin" ? "Sign in" : "Create account"}</button>
            <button className="btn secondary" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "Need an account?" : "Have an account?"}</button>
            <button className="btn secondary" onClick={() => setDemoMode(true)}>Continue locally</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RevenueCenter({ metrics, fundingData, governmentData, data, setPage }) {
  const [active, setActive] = useState("All");
  const fundingStats = getFundingStats(fundingData);
  const govStats = getGovernmentStats(governmentData);
  const productPipeline = loadProductPipeline();
  const universalOpportunities = getUniversalOpportunities(data, governmentData, fundingData, productPipeline);
  const universalStats = getUniversalOpportunityStats(universalOpportunities);
  const revenueChannelsWithGovernment = [
    {
      name: "HR Consulting",
      today: data.invoices.filter(item => item.status === "Paid" && item.payment_date === today).reduce((sum, item) => sum + Number(item.total || 0), 0),
      month: metrics.monthlyRevenue,
      pending: metrics.outstanding,
      pipeline: data.clients.filter(client => ["Lead", "Active"].includes(client.status)).reduce((sum, client) => sum + Number(client.monthly_retainer_amount || 0) * 12, 0),
      recent: data.clients.length ? `${data.clients.length} real client record(s)` : "No clients yet"
    },
    {
      name: "Government Pipeline",
      today: 0,
      month: govStats.totalAwardedValue,
      pending: 0,
      pipeline: govStats.pipelineValue,
      recent: governmentData.opportunities.length ? `${governmentData.opportunities.length} real opportunity record(s)` : "No opportunities yet"
    },
    {
      name: "Funding & Grants",
      today: 0,
      month: 0,
      pending: 0,
      pipeline: fundingStats.totalPotentialFunding,
      recent: fundingData.opportunities.length ? `${fundingData.opportunities.length} real funding record(s)` : "No funding records yet"
    },
    {
      name: "Product Pipeline",
      today: 0,
      month: 0,
      pending: 0,
      pipeline: productPipeline.reduce((sum, item) => sum + Number(item.estimatedProfit || 0), 0),
      recent: productPipeline.length ? `${productPipeline.length} saved product idea(s)` : "No saved product ideas yet"
    }
  ];
  const selected = active === "All" ? revenueChannelsWithGovernment : revenueChannelsWithGovernment.filter(channel => channel.name === active);
  const totals = revenueChannelsWithGovernment.reduce((acc, channel) => ({
    today: acc.today + channel.today,
    month: acc.month + channel.month,
    pending: acc.pending + channel.pending,
    pipeline: acc.pipeline + channel.pipeline
  }), { today: 0, month: 0, pending: 0, pipeline: 0 });

  return (
    <>
      <Title title="Revenue" subtitle="One place to scan digital products, HR consulting, invoices, and pipeline value." />
      <div className="grid metrics">
        <Metric label="Today's revenue" value={amount(totals.today)} />
        <Metric label="Monthly revenue" value={amount(totals.month)} />
        <Metric label="Pending invoices" value={amount(totals.pending)} />
        <Metric label="Pipeline value" value={amount(totals.pipeline)} />
      </div>
      <div className="card">
        <div className="panel-head"><h3>Universal Opportunity Engine</h3><button className="btn" onClick={() => setPage("Universal Opportunities")}>Open engine</button></div>
        <div className="mini-metrics">
          <span><b>{universalStats.total}</b><small>all opportunities</small></span>
          <span><b>{amount(universalStats.pipelineValue)}</b><small>estimated value</small></span>
          <span><b>{universalStats.highFit}</b><small>high fit</small></span>
          <span><b>{universalStats.dueSoon}</b><small>due soon</small></span>
        </div>
      </div>
      <div className="card">
        <div className="panel-head"><h3>Funding & Grants</h3><button className="btn" onClick={() => setPage("Funding Opportunities")}>Open funding workflow</button></div>
        <div className="mini-metrics">
          <span><b>{fundingStats.newOpportunities}</b><small>new opportunities</small></span>
          <span><b>{fundingStats.deadlinesDueSoon}</b><small>deadlines due soon</small></span>
          <span><b>{fundingStats.draftsInProgress}</b><small>drafts in progress</small></span>
          <span><b>{amount(fundingStats.totalPotentialFunding)}</b><small>potential funding</small></span>
        </div>
      </div>
      <div className="tabs section-tabs">
        {["All", ...revenueChannelsWithGovernment.map(channel => channel.name)].map(name => <button key={name} className={active === name ? "active" : ""} onClick={() => setActive(name)}>{name}</button>)}
      </div>
      <div className="grid three-col">
        {selected.map(channel => <div className="card" key={channel.name}>
          <div className="panel-head"><h3>{channel.name}</h3><span className="badge">{channel.recent}</span></div>
          <div className="mini-metrics">
            <span><b>{amount(channel.today)}</b><small>today</small></span>
            <span><b>{amount(channel.month)}</b><small>month</small></span>
            <span><b>{amount(channel.pending)}</b><small>pending</small></span>
            <span><b>{amount(channel.pipeline)}</b><small>pipeline</small></span>
          </div>
        </div>)}
      </div>
      <div className="card">
        <div className="panel-head"><h3>Recent Sales</h3><span className="mode">Real records only</span></div>
        <div className="activity">
          {data.invoices.filter(item => item.status === "Paid").slice(0, 6).map(item => <div key={item.id}><strong>{item.invoice_number}: {amount(item.total)}</strong><span className="muted">{clientName(data, item.client_id)} - {item.payment_date || item.invoice_date || "No date"}</span></div>)}
          {!data.invoices.filter(item => item.status === "Paid").length && <p className="muted">No paid invoice records yet. Add a real invoice and mark it paid to see revenue activity.</p>}
        </div>
      </div>
    </>
  );
}

function MakeableProductTrendFinder() {
  const [filters, setFilters] = useState({ equipment: "All", recommendation: "All", category: "All", source: "All", profit: "All", time: "All" });
  const [pipeline, setPipeline] = useState(loadProductPipeline);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const scannedTrends = useMemo(getNormalizedProductTrends, []);
  const evaluatedTrends = useMemo(() => scannedTrends.map(evaluateProductTrend).sort((a, b) => b.score - a.score), [scannedTrends]);
  const accepted = evaluatedTrends.filter(item => item.canMake && item.recommendation !== "REJECT");
  const rejected = evaluatedTrends.filter(item => !item.canMake || item.recommendation === "REJECT");
  const visible = accepted.filter(item => matchesProductTrendFilters(item, filters));
  const dashboard = getProductTrendDashboard(evaluatedTrends, accepted, rejected);
  const sourceCounts = group(evaluatedTrends, "source");
  const filterOptions = getProductTrendFilterOptions(evaluatedTrends);

  const updateFilter = (key, value) => setFilters({ ...filters, [key]: value });
  const savePipeline = next => {
    setPipeline(next);
    localStorage.setItem(productPipelineKey, JSON.stringify(next));
  };
  const addToPipeline = trend => {
    const exists = pipeline.some(item => item.sourceTrendId === trend.id);
    if (exists) return;
    // TODO: Persist product pipeline records to Supabase or Airtable once the production data store is selected.
    savePipeline([...pipeline, {
      id: uid("maker-pipeline"),
      sourceTrendId: trend.id,
      productName: trend.trendName,
      category: trend.category,
      equipment: trend.requiredEquipment,
      estimatedProfit: productProfit(trend),
      score: trend.score,
      status: "Idea"
    }]);
  };
  const updatePipelineStatus = (id, status) => savePipeline(pipeline.map(item => item.id === id ? { ...item, status } : item));
  const openOutput = (trend, outputType) => setSelectedOutput({ trend, outputType, output: generateProductTrendOutput(trend, outputType) });

  return (
    <>
      <Title title="Makeable Product Trend Finder" subtitle="AI-generated product suggestions filtered against Valicia's actual production equipment. These are ideas, not saved business records." />
      <div className="grid metrics">
        <Metric label="Total trends scanned" value={dashboard.total} />
        <Metric label="Makeable products" value={dashboard.makeable} />
        <Metric label="Rejected products" value={dashboard.rejected} />
        <Metric label="High-priority ideas" value={dashboard.highPriority} />
        <Metric label="Average profit" value={amount(dashboard.averageProfit)} />
        <Metric label="Last checked" value={dashboard.lastChecked} />
      </div>

      <div className="grid two-col">
        <div className="card">
          <div className="panel-head"><h3>Trend Source Adapter Registry</h3><span className="mode">AI-generated suggestions</span></div>
          <div className="source-grid">
            {mockTrendSourceAdapters.map(source => <div key={source.id}>
              <strong>{source.label}</strong>
              <span className="badge">{source.status}</span>
              <small>{sourceCounts[source.label] || 0} normalized trend(s)</small>
            </div>)}
          </div>
          <p className="muted trend-note">Sources are currently disconnected. Suggestions are generated locally until live scraping/API adapters, credentials, rate limits, and persistence rules are approved.</p>
        </div>
        <div className="card">
          <div className="panel-head"><h3>Local Product Pipeline</h3><span className="badge">{pipeline.length} saved</span></div>
          <div className="table-wrap compact-table">
            <table>
              <thead><tr><th>Product</th><th>Profit</th><th>Score</th><th>Status</th></tr></thead>
              <tbody>
                {pipeline.map(item => <tr key={item.id}>
                  <td><strong>{item.productName}</strong><span className="table-subline">{item.equipment.join(", ")}</span></td>
                  <td>{amount(item.estimatedProfit)}</td>
                  <td>{item.score}</td>
                  <td><select value={item.status} onChange={e => updatePipelineStatus(item.id, e.target.value)}>{pipelineStatuses.map(status => <option key={status}>{status}</option>)}</select></td>
                </tr>)}
                {!pipeline.length && <tr><td colSpan="4" className="muted">Saved product ideas will appear here after you add an AI-generated suggestion to the local product pipeline.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card product-filters">
        <div className="panel-head"><h3>Filters</h3><button className="btn secondary" onClick={() => setFilters({ equipment: "All", recommendation: "All", category: "All", source: "All", profit: "All", time: "All" })}>Reset</button></div>
        <div className="toolbar filter-bar">
          <ProductFilter label="Equipment" value={filters.equipment} options={["All", ...filterOptions.equipment]} onChange={value => updateFilter("equipment", value)} />
          <ProductFilter label="Recommendation" value={filters.recommendation} options={["All", "HIGH PRIORITY", "TEST THIS WEEKEND", "WATCH"]} onChange={value => updateFilter("recommendation", value)} />
          <ProductFilter label="Category" value={filters.category} options={["All", ...filterOptions.categories]} onChange={value => updateFilter("category", value)} />
          <ProductFilter label="Source" value={filters.source} options={["All", ...filterOptions.sources]} onChange={value => updateFilter("source", value)} />
          <ProductFilter label="Profit" value={filters.profit} options={["All", "$0-$10", "$10-$20", "$20+"]} onChange={value => updateFilter("profit", value)} />
          <ProductFilter label="Time" value={filters.time} options={["All", "Under 15 min", "15-45 min", "45+ min"]} onChange={value => updateFilter("time", value)} />
        </div>
      </div>

      <div className="grid two-col">
        <div className="grid">
          {visible.map(trend => <ProductOpportunityCard key={trend.id} trend={trend} inPipeline={pipeline.some(item => item.sourceTrendId === trend.id)} addToPipeline={addToPipeline} openOutput={openOutput} />)}
          {!visible.length && <div className="card"><p className="muted">No makeable products match the current filters.</p></div>}
        </div>
        <div className="grid">
          <div className="card">
            <div className="panel-head"><h3>Rejected Trends</h3><span className="badge danger">{rejected.length} rejected</span></div>
            <details open={false}>
              <summary>Show rejected ideas and reasons</summary>
              <div className="activity rejected-list">
                {rejected.map(item => <div key={item.id}><strong>{item.trendName}</strong><span className="muted">{item.rejectionReason || "Rejected by revenue reality filter."}</span><span className="badge danger">{item.source}</span></div>)}
              </div>
            </details>
          </div>
          <div className="card">
            <h3>Revenue Reality Rules</h3>
            <div className="check-list">
              {["Reject products that need unavailable equipment.", "Reject tests over $50 in material cost.", "Downgrade long production times and low margins.", "Downgrade unclear demand or expensive specialty materials.", "Prioritize fast tests that fit existing tools."].map(rule => <label key={rule}><input type="checkbox" checked readOnly /> {rule}</label>)}
            </div>
          </div>
        </div>
      </div>

      {selectedOutput && <GeneratedProductOutputModal item={selectedOutput} onClose={() => setSelectedOutput(null)} />}
    </>
  );
}

function ProductFilter({ label: labelText, value, options, onChange }) {
  return <label>{labelText}<select value={value} onChange={e => onChange(e.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select></label>;
}

function ProductOpportunityCard({ trend, inPipeline, addToPipeline, openOutput }) {
  const profit = productProfit(trend);
  return <div className="card product-card">
    <div className="panel-head">
      <div><h3>{trend.trendName}</h3><p className="muted">{trend.shortDescription}</p></div>
      <span className={`badge ${trend.recommendation === "HIGH PRIORITY" ? "success" : trend.recommendation === "TEST THIS WEEKEND" ? "warn" : ""}`}>{trend.recommendation}</span>
    </div>
    <div className="product-score"><strong>{trend.score}</strong><span>Trend score</span></div>
    <div className="mini-metrics">
      <span><b>{amount(trend.estimatedMaterialCost)}</b><small>material cost</small></span>
      <span><b>{amount(trend.estimatedSellPrice)}</b><small>sell price</small></span>
      <span><b>{amount(profit)}</b><small>estimated profit</small></span>
      <span><b>{trend.estimatedProductionTime}m</b><small>production time</small></span>
    </div>
    <InfoBlock title="Equipment needed" text={trend.requiredEquipment.join(", ")} />
    <InfoBlock title="Materials needed" text={trend.requiredMaterials.join(", ")} />
    <InfoBlock title="Why this is makeable" text={`Fits existing ${trend.requiredEquipment.join(" + ")} capability with test cost under $50 and no blocked production process.`} />
    <InfoList title="Keywords" items={trend.keywords} />
    <InfoBlock title="Next action" text={nextActionForTrend(trend)} />
    <div className="actions">
      <button className="btn" disabled={inPipeline} onClick={() => addToPipeline(trend)}>{inPipeline ? "Added to Pipeline" : "Add to Product Pipeline"}</button>
      <button className="btn secondary" onClick={() => openOutput(trend, "listing")}>Generate Listing Draft</button>
      <button className="btn secondary" onClick={() => openOutput(trend, "design")}>Generate Design Prompt</button>
      <button className="btn secondary" onClick={() => openOutput(trend, "checklist")}>Save for Later</button>
    </div>
  </div>;
}

function GeneratedProductOutputModal({ item, onClose }) {
  const { trend, outputType, output } = item;
  return <div className="modal-backdrop">
    <div className="modal generated-output">
      <div className="panel-head"><h3>{output.title}</h3><button className="btn secondary" onClick={onClose}>Close</button></div>
      <p className="muted">{trend.trendName} - AI-generated suggestion, not a saved business record. TODO: Replace deterministic helpers with Claude/OpenAI-generated drafts when API integration is approved.</p>
      {outputType === "listing" && <>
        <InfoBlock title="SEO title" text={output.seoTitle} />
        <InfoBlock title="Product description" text={output.description} />
        <InfoList title="13 Etsy tags" items={output.tags} />
        <InfoList title="Materials" items={output.materials} />
        <InfoBlock title="Pricing suggestion" text={output.pricingSuggestion} />
      </>}
      {outputType === "design" && <>
        <InfoBlock title="Design style" text={output.designStyle} />
        <InfoBlock title="Target customer" text={output.targetCustomer} />
        <InfoBlock title="Colors" text={output.colors} />
        <InfoList title="Wording ideas" items={output.wordingIdeas} />
        <InfoBlock title="Mockup suggestion" text={output.mockupSuggestion} />
      </>}
      {outputType === "checklist" && <>
        <InfoList title="Materials" items={output.materials} />
        <InfoList title="Equipment" items={output.equipment} />
        <InfoList title="Steps" items={output.steps} />
        <InfoBlock title="Quality check" text={output.qualityCheck} />
        <InfoBlock title="Packaging note" text={output.packagingNote} />
      </>}
    </div>
  </div>;
}

function trendSeed(id, source, trendName, productType, category, shortDescription, keywords, observedSignal, demandSignal, seasonality, estimatedCompetition, estimatedSellPrice, estimatedMaterialCost, estimatedProductionTime, requiredEquipment, requiredMaterials) {
  return {
    id,
    source,
    trendName,
    productType,
    category,
    shortDescription,
    keywords,
    observedSignal,
    demandSignal,
    seasonality,
    estimatedCompetition,
    estimatedSellPrice,
    estimatedMaterialCost,
    estimatedProductionTime,
    requiredEquipment,
    requiredMaterials,
    canMake: false,
    rejectionReason: "",
    score: 0,
    recommendation: "WATCH"
  };
}

function getNormalizedProductTrends() {
  // TODO: Replace suggestion adapter calls with live source fetchers after anti-bot, API, and caching rules are defined.
  return mockTrendSourceAdapters.flatMap(adapter => adapter.fetchTrends().map(item => ({ ...item, source: adapter.label })));
}

function evaluateProductTrend(trend) {
  const capability = evaluateMakerCapability(trend);
  const revenueReality = evaluateRevenueReality(trend);
  const score = capability.canMake ? scoreProductTrend(trend, revenueReality) : 0;
  const recommendation = getProductRecommendation(score, capability.canMake, revenueReality.reject);
  return {
    ...trend,
    canMake: capability.canMake && !revenueReality.reject,
    rejectionReason: capability.rejectionReason || revenueReality.rejectionReason,
    score,
    recommendation
  };
}

function evaluateMakerCapability(trend) {
  const normalizedEquipment = trend.requiredEquipment.map(item => item.toLowerCase());
  const available = makerCapabilities.equipment.map(item => item.toLowerCase());
  const blockedEquipment = makerCapabilities.blockedEquipment.map(item => item.toLowerCase());
  const blockedProcesses = makerCapabilities.blockedProcesses.map(item => item.toLowerCase());
  const unavailableBlocked = normalizedEquipment.find(item => blockedEquipment.includes(item) || blockedProcesses.some(process => item.includes(process)));
  if (unavailableBlocked) return { canMake: false, rejectionReason: `${titleCase(unavailableBlocked)} is not part of current production capabilities.` };
  const missingEquipment = trend.requiredEquipment.find(item => !available.includes(item.toLowerCase()));
  if (missingEquipment) return { canMake: false, rejectionReason: `${missingEquipment} not available.` };
  return { canMake: true, rejectionReason: "" };
}

function evaluateRevenueReality(trend) {
  const profit = productProfit(trend);
  const margin = trend.estimatedSellPrice ? profit / trend.estimatedSellPrice : 0;
  if (trend.estimatedMaterialCost > 50) return { reject: true, penalty: 30, rejectionReason: "Test cost is over $50." };
  if (String(trend.demandSignal).toLowerCase() === "unclear") return { reject: true, penalty: 25, rejectionReason: "Demand is unclear for a practical test." };
  let penalty = 0;
  if (margin < 0.45) penalty += 20;
  if (trend.estimatedProductionTime > 90) penalty += 12;
  if (trend.estimatedCompetition === "High") penalty += 8;
  return { reject: false, penalty, rejectionReason: "" };
}

function scoreProductTrend(trend, revenueReality) {
  const profit = productProfit(trend);
  const margin = trend.estimatedSellPrice ? profit / trend.estimatedSellPrice : 0;
  const demand = trend.demandSignal === "clear" ? 18 : 8;
  const competition = trend.estimatedCompetition === "Low" ? 12 : trend.estimatedCompetition === "Medium" ? 9 : 5;
  const profitMargin = margin >= 0.65 ? 16 : margin >= 0.5 ? 12 : 6;
  const speed = trend.estimatedProductionTime <= 15 ? 12 : trend.estimatedProductionTime <= 45 ? 9 : 4;
  const materialCost = trend.estimatedMaterialCost <= 8 ? 10 : trend.estimatedMaterialCost <= 15 ? 7 : 4;
  const season = /back to school|graduation|holiday|fall|winter|summer/i.test(trend.seasonality) ? 8 : 5;
  const ease = trend.estimatedMaterialCost <= 15 && trend.estimatedProductionTime <= 45 ? 10 : 5;
  const repeatability = trend.productType.match(/sweatshirt|desk mat|glass can|phone stand|sign|cake topper/i) ? 7 : 4;
  const equipmentFit = trend.requiredEquipment.every(item => makerCapabilities.equipment.includes(item)) ? 9 : 0;
  return Math.max(0, Math.min(100, Math.round(demand + competition + profitMargin + speed + materialCost + season + ease + repeatability + equipmentFit - revenueReality.penalty)));
}

function getProductRecommendation(score, canMake, reject) {
  if (!canMake || reject) return "REJECT";
  if (score >= 82) return "HIGH PRIORITY";
  if (score >= 68) return "TEST THIS WEEKEND";
  return "WATCH";
}

function productProfit(trend) {
  return Number(trend.estimatedSellPrice || 0) - Number(trend.estimatedMaterialCost || 0);
}

function matchesProductTrendFilters(trend, filters) {
  const profit = productProfit(trend);
  if (filters.equipment !== "All" && !trend.requiredEquipment.includes(filters.equipment)) return false;
  if (filters.recommendation !== "All" && trend.recommendation !== filters.recommendation) return false;
  if (filters.category !== "All" && trend.category !== filters.category) return false;
  if (filters.source !== "All" && trend.source !== filters.source) return false;
  if (filters.profit === "$0-$10" && (profit < 0 || profit > 10)) return false;
  if (filters.profit === "$10-$20" && (profit < 10 || profit > 20)) return false;
  if (filters.profit === "$20+" && profit < 20) return false;
  if (filters.time === "Under 15 min" && trend.estimatedProductionTime >= 15) return false;
  if (filters.time === "15-45 min" && (trend.estimatedProductionTime < 15 || trend.estimatedProductionTime > 45)) return false;
  if (filters.time === "45+ min" && trend.estimatedProductionTime <= 45) return false;
  return true;
}

function getProductTrendDashboard(all, accepted, rejected) {
  const averageProfit = accepted.length ? accepted.reduce((sum, item) => sum + productProfit(item), 0) / accepted.length : 0;
  return {
    total: all.length,
    makeable: accepted.length,
    rejected: rejected.length,
    highPriority: accepted.filter(item => item.recommendation === "HIGH PRIORITY").length,
    averageProfit,
    lastChecked: currentDateTime()
  };
}

function getProductTrendFilterOptions(trends) {
  return {
    equipment: uniqueSorted(trends.flatMap(item => item.requiredEquipment).filter(item => makerCapabilities.equipment.includes(item))),
    categories: uniqueSorted(trends.map(item => item.category)),
    sources: uniqueSorted(trends.map(item => item.source))
  };
}

function uniqueSorted(items) {
  return [...new Set(items.filter(Boolean))].sort();
}

function loadProductPipeline() {
  try {
    return JSON.parse(localStorage.getItem(productPipelineKey) || "[]");
  } catch {
    return [];
  }
}

function nextActionForTrend(trend) {
  if (trend.recommendation === "HIGH PRIORITY") return "Price one test batch, create one mockup, and list a limited run this week.";
  if (trend.recommendation === "TEST THIS WEEKEND") return "Prototype one sample this weekend and compare production time against the estimate.";
  return "Watch signals for another week and save supplier/material notes.";
}

function generateProductTrendOutput(trend, outputType) {
  // TODO: Replace these deterministic helpers with Claude/OpenAI API calls for richer listing, design, and checklist output.
  if (outputType === "listing") {
    const tags = uniqueSorted([...trend.keywords, trend.productType, trend.category, "custom gift", "personalized gift", "small business", "made to order"]).slice(0, 13);
    while (tags.length < 13) tags.push(`custom ${tags.length + 1}`);
    return {
      title: "Etsy Listing Draft",
      seoTitle: `${trend.trendName} | Personalized ${trend.productType} | ${trend.seasonality} Gift`,
      description: `Custom ${trend.productType.toLowerCase()} inspired by ${trend.trendName}. Designed for buyers searching for ${trend.keywords.slice(0, 3).join(", ")} with quick small-batch production and a polished handmade finish.`,
      tags,
      materials: trend.requiredMaterials,
      pricingSuggestion: `Suggested test price: ${amount(trend.estimatedSellPrice)}. Estimated material cost: ${amount(trend.estimatedMaterialCost)}. Estimated gross profit before fees/labor: ${amount(productProfit(trend))}.`
    };
  }
  if (outputType === "design") {
    return {
      title: "Design Prompt",
      designStyle: `${trend.category} design with clean production-friendly details for ${trend.productType.toLowerCase()}.`,
      targetCustomer: trend.category === "Apparel" ? "Office workers, HR teams, and gift buyers" : "Gift buyers looking for personalized, practical products",
      colors: "Use two to four high-contrast colors that photograph well on mockups.",
      wordingIdeas: [`Personalized ${trend.productType}`, trend.trendName.replace(/^Funny /, ""), `${trend.seasonality} edition`],
      mockupSuggestion: `Photograph or mock up the ${trend.productType.toLowerCase()} on a bright neutral surface with one close detail shot.`
    };
  }
  return {
    title: "Production Checklist",
    materials: trend.requiredMaterials,
    equipment: trend.requiredEquipment,
    steps: ["Confirm customer personalization and sizing.", "Prepare design file and production settings.", "Produce one sample or small batch.", "Inspect alignment, color, finish, and durability.", "Photograph mockup and record actual production time."],
    qualityCheck: "Check edges, adhesion, color clarity, spelling, and surface cleanliness before packaging.",
    packagingNote: "Package with a simple care card and protect surfaces from scuffs during shipping."
  };
}

function titleCase(text) {
  return String(text || "").replace(/\b\w/g, letter => letter.toUpperCase());
}

function Dashboard({ data, metrics, realMode, runAutomations }) {
  const revenue = groupSum(data.invoices.filter(i => i.status === "Paid"), i => (i.payment_date || i.invoice_date || "").slice(0, 7), "total");
  return (
    <>
      <Title title="Dashboard" subtitle={realMode ? "Authenticated Supabase data with RLS protection." : "Demo data. Connect Supabase in Settings to use real records."} action={<button className="btn" onClick={runAutomations}>Run automations</button>} />
      <div className="grid metrics">
        <Metric label="Active clients" value={metrics.activeClients} />
        <Metric label="Open HR cases" value={metrics.openCases} />
        <Metric label="Open investigations" value={metrics.openInvestigations} />
        <Metric label="Outstanding invoices" value={amount(metrics.outstanding)} />
        <Metric label="Monthly revenue" value={amount(metrics.monthlyRevenue)} />
        <Metric label="Overdue invoices" value={metrics.overdue} />
        <Metric label="Contract renewals" value={metrics.renewals} />
        <Metric label="Billable hours" value={metrics.billableHours} />
        <Metric label="Documents" value={data.documents.length} />
      </div>
      <div className="grid two-col">
        <Bars title="Revenue by month" rows={Object.entries(revenue).map(([label, value]) => ({ label, value, money: true }))} />
        <Bars title="Cases by status" rows={Object.entries(group(data.cases, "status")).map(([label, value]) => ({ label, value }))} />
        <Activity rows={data.activity_logs} />
      </div>
    </>
  );
}

function workflowStageForStatus(status = "") {
  const text = String(status).toLowerCase();
  if (["awarded", "won", "lost", "denied"].some(item => text.includes(item))) return "Award/Won/Lost";
  if (["paid", "revenue"].some(item => text.includes(item))) return "Revenue";
  if (["follow up", "awaiting", "response"].some(item => text.includes(item))) return "Follow Up";
  if (["proposal", "application", "submitted", "ready"].some(item => text.includes(item))) return "Proposal/Application";
  if (["outreach", "subcontractor", "partner"].some(item => text.includes(item))) return "Outreach";
  if (["document", "drafting"].some(item => text.includes(item))) return "Documents";
  if (["ai review", "reviewing"].some(item => text.includes(item))) return "AI Review";
  return "Opportunity";
}

function getUniversalOpportunities(data, governmentData, fundingData, productPipeline = []) {
  const government = governmentData.opportunities.map(item => ({
    id: `gov-${item.id}`,
    type: "Government Contract",
    title: item.title,
    source: item.agency,
    estimated_value: Number(item.estimated_value || 0),
    fit_score: Number(item.ai_fit_score ?? item.fit_score ?? 0),
    deadline: item.due_date,
    status: item.status,
    next_action: item.next_action,
    required_documents: item.documents_needed || [],
    notes: item.notes,
    workflow_stage: workflowStageForStatus(item.status)
  }));
  const funding = fundingData.opportunities.map(item => ({
    id: `fund-${item.id}`,
    type: "Grant",
    title: item.title,
    source: item.funder,
    estimated_value: Number(item.amount_available || 0),
    fit_score: Number(item.fit_score || 0),
    deadline: item.deadline,
    status: item.status,
    next_action: item.next_action,
    required_documents: item.required_documents || [],
    notes: item.notes,
    workflow_stage: workflowStageForStatus(item.status)
  }));
  const hr = data.clients.filter(client => ["Lead", "Active"].includes(client.status)).map(client => ({
    id: `hr-${client.id}`,
    type: "HR Consulting Client",
    title: `${client.company_name} consulting opportunity`,
    source: client.industry || "Client pipeline",
    estimated_value: Number(client.monthly_retainer_amount || 0) * 12,
    fit_score: client.status === "Active" ? 92 : 72,
    deadline: client.contract_end_date || client.contract_start_date || "",
    status: client.status === "Active" ? "Won" : "Opportunity",
    next_action: client.status === "Active" ? "Maintain service delivery and renewal plan" : "Schedule discovery call",
    required_documents: ["Consulting agreement", "Scope of work", "Invoice setup"],
    notes: client.notes,
    workflow_stage: client.status === "Active" ? "Revenue" : "Opportunity"
  }));
  const productIdeas = Array.isArray(productPipeline) ? productPipeline : [];
  const digital = productIdeas.map(item => ({
    id: `digital-${item.id}`,
    type: "Digital Product Opportunity",
    title: item.productName,
    source: "Saved product pipeline",
    estimated_value: Number(item.estimatedProfit || 0),
    fit_score: Number(item.score || 0),
    deadline: "",
    status: item.status,
    next_action: "Validate this saved product idea with real demand and cost notes.",
    required_documents: ["Product description", "Pricing", "Launch assets"],
    notes: "Saved from AI-generated product suggestions.",
    workflow_stage: workflowStageForStatus(item.status)
  }));
  const seeded = universalOpportunitySeed.map(item => ({ ...item, workflow_stage: workflowStageForStatus(item.status) }));
  return [...government, ...funding, ...hr, ...digital, ...seeded];
}

function getUniversalOpportunityStats(opportunities) {
  const dueSoon = opportunities.filter(item => {
    const days = daysUntil(item.deadline);
    return days !== null && days >= 0 && days <= 14;
  });
  return {
    total: opportunities.length,
    pipelineValue: opportunities.reduce((sum, item) => sum + Number(item.estimated_value || 0), 0),
    highFit: opportunities.filter(item => Number(item.fit_score || 0) >= 80).length,
    dueSoon: dueSoon.length,
    active: opportunities.filter(item => !["Award/Won/Lost", "Revenue"].includes(item.workflow_stage)).length
  };
}

function getFundingStats(fundingData) {
  const dueSoon = fundingData.opportunities.filter(item => {
    const days = daysUntil(item.deadline);
    return days !== null && days >= 0 && days <= 14;
  });
  return {
    newOpportunities: fundingData.opportunities.filter(item => ["not started", "reviewing"].includes(item.status)).length,
    deadlinesDueSoon: dueSoon.length,
    draftsInProgress: fundingData.opportunities.filter(item => ["drafting", "documents needed", "ready to submit"].includes(item.status)).length,
    totalPotentialFunding: fundingData.opportunities.reduce((sum, item) => sum + Number(item.amount_available || 0), 0)
  };
}

function UniversalOpportunityEngine({ data, governmentData, fundingData, setPage }) {
  const [typeFilter, setTypeFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [highFitOnly, setHighFitOnly] = useState(false);
  const opportunities = getUniversalOpportunities(data, governmentData, fundingData);
  const stats = getUniversalOpportunityStats(opportunities);
  const visible = opportunities.filter(item => {
    const matchesType = typeFilter === "All" || item.type === typeFilter;
    const matchesStage = stageFilter === "All" || item.workflow_stage === stageFilter;
    const matchesHighFit = !highFitOnly || Number(item.fit_score || 0) >= 80;
    return matchesType && matchesStage && matchesHighFit;
  });
  const stageCounts = opportunityWorkflowStages.map(stage => ({ stage, count: opportunities.filter(item => item.workflow_stage === stage).length }));

  return (
    <>
      <Title title="Universal Opportunity Engine" subtitle="One shared workflow for contracts, grants, consulting, digital products, AI services, and speaking/training." />
      <div className="grid metrics">
        <Metric label="Total opportunities" value={stats.total} />
        <Metric label="Estimated value" value={amount(stats.pipelineValue)} />
        <Metric label="High fit" value={stats.highFit} />
        <Metric label="Due soon" value={stats.dueSoon} />
      </div>
      <div className="card">
        <div className="workflow-strip" aria-label="Universal opportunity workflow">
          {stageCounts.map(item => <div key={item.stage}><strong>{item.stage}</strong><span>{item.count}</span></div>)}
        </div>
      </div>
      <div className="card">
        <div className="toolbar filter-bar">
          <label>Type<select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>{["All", ...opportunityTypes].map(type => <option key={type}>{type}</option>)}</select></label>
          <label>Workflow<select value={stageFilter} onChange={e => setStageFilter(e.target.value)}>{["All", ...opportunityWorkflowStages].map(stage => <option key={stage}>{stage}</option>)}</select></label>
          <label className="inline-check"><input type="checkbox" checked={highFitOnly} onChange={e => setHighFitOnly(e.target.checked)} /> High Fit</label>
          <span className="mode">{visible.length} shown</span>
        </div>
        <div className="table-wrap opportunities-table"><table><thead><tr>{["type", "title", "source", "estimated_value", "fit_score", "deadline", "status", "next_action", "required_documents", "notes"].map(c => <th key={c}>{label(c)}</th>)}<th>Workflow</th></tr></thead><tbody>
          {visible.map(item => <tr key={item.id}>
            <td><span className="badge">{item.type}</span></td>
            <td><strong>{item.title}</strong></td>
            <td>{item.source}</td>
            <td>{amount(item.estimated_value)}</td>
            <td><span className={Number(item.fit_score || 0) >= 80 ? "badge success" : "badge"}>{item.fit_score}%</span></td>
            <td>{item.deadline || "No deadline"}{item.deadline && <><br /><span className="muted">{dueLabel(item.deadline)}</span></>}</td>
            <td><span className="badge warn">{item.status}</span></td>
            <td>{item.next_action}</td>
            <td>{(item.required_documents || []).slice(0, 3).join(", ")}{(item.required_documents || []).length > 3 ? "..." : ""}</td>
            <td>{item.notes}</td>
            <td><span className="mode">{item.workflow_stage}</span></td>
          </tr>)}
          {!visible.length && <tr><td colSpan="11" className="muted">No opportunities match these filters.</td></tr>}
        </tbody></table></div>
      </div>
      <div className="card">
        <div className="panel-head"><h3>Related Workspaces</h3></div>
        <div className="actions">
          <button className="btn secondary" onClick={() => setPage("Opportunities")}>Government</button>
          <button className="btn secondary" onClick={() => setPage("Funding Opportunities")}>Funding & Grants</button>
          <button className="btn secondary" onClick={() => setPage("Clients")}>HR Consulting</button>
          <button className="btn secondary" onClick={() => setPage("Revenue")}>Revenue</button>
        </div>
      </div>
    </>
  );
}

function aiDraft(type, form) {
  return `Draft ${type}

Tone: ${form.tone || "Professional"}

Based on the facts provided, document the issue, confirm the relevant policy or expectation, identify immediate next steps, and preserve supporting records.

Situation summary:
${form.summary || "No summary provided."}

Draft:
This draft is prepared for internal HR consulting review. Confirm company policy, prior practice, and applicable law before issuing final guidance.`;
}

function AIGenerator({ data, addRecord, realMode }) {
  const [form, setForm] = useState({ document_type: "Written warning", tone: "Professional", client_id: "", situation_summary: "" });
  const [output, setOutput] = useState("");
  const types = ["Written warning", "Coaching memo", "Performance improvement plan", "Investigation interview questions", "Investigation findings summary", "Accommodation request response", "Policy draft", "Handbook section", "Client email", "HR recommendation memo"];
  const saveDraft = async () => {
    await addRecord("ai_documents", { ...form, output });
  };
  return <><Title title="AI HR Document Generator" subtitle={realMode ? "Drafts save to Supabase ai_documents under the signed-in owner." : "Demo drafts save locally."} />
    <div className="grid two-col">
      <div className="card form">
        <label>Client<select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}><option value="">Select client</option>{data.clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}</select></label>
        <label>Document type<select value={form.document_type} onChange={e => setForm({ ...form, document_type: e.target.value })}>{types.map(t => <option key={t}>{t}</option>)}</select></label>
        <label>Tone<select value={form.tone} onChange={e => setForm({ ...form, tone: e.target.value })}>{["Professional", "Firm", "Friendly", "Executive"].map(t => <option key={t}>{t}</option>)}</select></label>
        <label>Optional employee name<input value={form.employee_name || ""} onChange={e => setForm({ ...form, employee_name: e.target.value })} /></label>
        <label>Optional policy reference<input value={form.policy_reference || ""} onChange={e => setForm({ ...form, policy_reference: e.target.value })} /></label>
        <label>Situation summary<textarea value={form.situation_summary} onChange={e => setForm({ ...form, situation_summary: e.target.value })} /></label>
        <button className="btn gold" onClick={() => setOutput(aiDraft(form.document_type, { tone: form.tone, summary: form.situation_summary }))}>Generate draft</button>
      </div>
      <div className="card form">
        <label>Editable output<textarea value={output} onChange={e => setOutput(e.target.value)} /></label>
        <button className="btn" onClick={saveDraft}>Save AI draft</button>
      </div>
    </div>
  </>;
}

const outreachStatuses = ["Draft", "Ready", "Sent", "Called", "Responded", "Interested", "Quote Requested", "Quote Received", "Declined", "Follow Up Needed", "Partner Selected"];

function normalizeOutreachStatus(status = "") {
  const text = String(status || "").toLowerCase();
  const map = {
    "not contacted": "Draft",
    drafted: "Draft",
    draft: "Draft",
    ready: "Ready",
    "email drafted": "Draft",
    sent: "Sent",
    "email sent": "Sent",
    emailed: "Sent",
    called: "Called",
    responded: "Responded",
    interested: "Interested",
    declined: "Declined",
    "quote requested": "Quote Requested",
    "quote received": "Quote Received",
    "follow up needed": "Follow Up Needed",
    "partner selected": "Partner Selected"
  };
  return map[text] || status || "Draft";
}

function subcontractorStatusFromOutreach(status = "") {
  const normalized = normalizeOutreachStatus(status);
  if (normalized === "Sent") return "emailed";
  if (normalized === "Called") return "called";
  if (normalized === "Responded") return "responded";
  if (["Interested", "Quote Requested", "Quote Received", "Partner Selected"].includes(normalized)) return "interested";
  if (normalized === "Declined") return "not interested";
  return "";
}

function createOutreachRecord(opportunityId, subcontractorId, notes = "") {
  return {
    id: uid("out"),
    opportunity_id: opportunityId,
    subcontractor_id: subcontractorId,
    status: "Draft",
    created_at: today,
    follow_up_date: "",
    last_contact_date: "",
    draft_email: "",
    notes,
    response_summary: ""
  };
}

const reminderTypes = ["Opportunity due date", "AI review needed", "Subcontractor search needed", "Outreach draft needed", "Outreach follow-up", "Quote due", "Proposal due", "Award follow-up"];
const reminderStatuses = ["Pending", "Completed", "Snoozed", "Cancelled"];
const awardStatuses = ["Pending Award", "Awarded", "Lost", "Cancelled", "Withdrawn"];
const lostReasons = ["Price issue", "Capability gap", "No response", "Cancelled by agency", "Other"];

function normalizeAwardOutcome(item = {}, opportunity = {}) {
  const status = item.award_status || item.status || (["Awarded", "Lost", "Cancelled", "Withdrawn"].includes(opportunity.status) ? opportunity.status : "Pending Award");
  return {
    award_status: awardStatuses.includes(status) ? status : "Pending Award",
    award_date: item.award_date || "",
    award_amount: Number(item.award_amount || opportunity.award_amount || 0),
    prime_or_subcontract: item.prime_or_subcontract || "Prime",
    contract_number: item.contract_number || "",
    period_of_performance: item.period_of_performance || "",
    awarding_agency: item.awarding_agency || opportunity.agency || "",
    assigned_subcontractors: item.assigned_subcontractors || [],
    internal_notes: item.internal_notes || item.notes || "",
    reason_lost: item.reason_lost || "",
    winning_competitor: item.winning_competitor || "",
    lessons_learned: item.lessons_learned || ""
  };
}

function normalizeGovernmentReminder(item = {}) {
  return {
    id: item.id || uid("rem"),
    opportunity_id: item.opportunity_id || item.opportunityId || "",
    subcontractor_id: item.subcontractor_id || item.subcontractorId || "",
    type: item.type || "Outreach follow-up",
    due_date: item.due_date || today,
    priority: item.priority || "Normal",
    status: item.status || "Pending",
    notes: item.notes || "",
    completed_at: item.completed_at || ""
  };
}

function createGovernmentReminder({ opportunityId, subcontractorId = "", type, dueDate, priority = "Normal", notes = "" }) {
  return normalizeGovernmentReminder({
    id: uid("rem"),
    opportunity_id: opportunityId,
    subcontractor_id: subcontractorId,
    type,
    due_date: dueDate || today,
    priority,
    status: "Pending",
    notes
  });
}

function reminderKey(reminder) {
  return [reminder.opportunity_id, reminder.subcontractor_id || "", reminder.type, reminder.due_date, reminder.notes || ""].join("|");
}

function mergeGovernmentReminders(existing = [], additions = []) {
  const seen = new Set();
  return [...existing, ...additions].map(normalizeGovernmentReminder).filter(reminder => {
    const key = reminderKey(reminder);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function automaticOpportunityReminders(opportunity) {
  const reminders = [];
  const days = daysUntil(opportunity.due_date);
  if (opportunity.id) {
    reminders.push(createGovernmentReminder({ opportunityId: opportunity.id, type: "AI review needed", dueDate: today, priority: "High", notes: "Generate AI review before outreach or proposal work." }));
    reminders.push(createGovernmentReminder({ opportunityId: opportunity.id, type: "Subcontractor search needed", dueDate: today, priority: "Normal", notes: "Identify partner categories and attach subcontractors." }));
    reminders.push(createGovernmentReminder({ opportunityId: opportunity.id, type: "Outreach draft needed", dueDate: addBusinessDays(today, 1), priority: "Normal", notes: "Draft outreach for likely subcontractor partners." }));
  }
  if (opportunity.due_date) {
    reminders.push(createGovernmentReminder({ opportunityId: opportunity.id, type: "Opportunity due date", dueDate: opportunity.due_date, priority: "High", notes: `${opportunity.title} is due.` }));
    reminders.push(createGovernmentReminder({ opportunityId: opportunity.id, type: "Proposal due", dueDate: opportunity.due_date, priority: "High", notes: "Final proposal/application due date." }));
    if (days !== null && days <= 7) reminders.push(createGovernmentReminder({ opportunityId: opportunity.id, type: "Opportunity due date", dueDate: today, priority: "High", notes: "Opportunity due within 7 days." }));
    if (days !== null && days <= 3) reminders.push(createGovernmentReminder({ opportunityId: opportunity.id, type: "Proposal due", dueDate: today, priority: "High", notes: "Opportunity due within 3 days." }));
    if (days !== null && days <= 1) reminders.push(createGovernmentReminder({ opportunityId: opportunity.id, type: "Proposal due", dueDate: today, priority: "Urgent", notes: "Opportunity due within 24 hours." }));
  }
  return reminders;
}

function getReminderStats(reminders = []) {
  const active = reminders.map(normalizeGovernmentReminder);
  return {
    dueToday: active.filter(item => item.status === "Pending" && daysUntil(item.due_date) === 0).length,
    dueTomorrow: active.filter(item => item.status === "Pending" && daysUntil(item.due_date) === 1).length,
    overdue: active.filter(item => item.status === "Pending" && daysUntil(item.due_date) < 0).length,
    highPriority: active.filter(item => item.status === "Pending" && ["High", "Urgent"].includes(item.priority)).length,
    completedToday: active.filter(item => item.status === "Completed" && item.completed_at === today).length
  };
}

function getSelectedOpportunity(governmentData) {
  return governmentData.opportunities.find(item => item.id === governmentData.selectedOpportunityId) || governmentData.opportunities[0];
}

function getSubcontractor(governmentData, id) {
  return governmentData.subcontractors.find(item => item.id === id);
}

function getGovernmentStats(governmentData) {
  const dueSoon = governmentData.opportunities.filter(item => {
    const days = daysUntil(item.due_date);
    return days !== null && days >= 0 && days <= 14;
  });
  const awaiting = governmentData.outreach.filter(item => ["Sent", "Responded", "Follow Up Needed"].includes(normalizeOutreachStatus(item.status)));
  const reminderStats = getReminderStats(governmentData.reminders || []);
  const awardStats = getGovernmentAwardStats(governmentData);
  return {
    opportunities: governmentData.opportunities.length,
    newOpportunities: governmentData.opportunities.filter(item => ["New", "AI Review", "Reviewing"].includes(item.status)).length,
    proposalsDueSoon: dueSoon.length,
    awaitingResponses: awaiting.length,
    followUpsDue: reminderStats.dueToday + reminderStats.overdue,
    deadlinesApproaching: dueSoon.length,
    pipelineValue: governmentData.opportunities.reduce((sum, item) => sum + Number(item.estimated_value || 0), 0),
    ...awardStats
  };
}

function getGovernmentAwardStats(governmentData) {
  const opportunities = governmentData.opportunities || [];
  const outcomes = opportunities.map(item => normalizeAwardOutcome(item.award_outcome, item));
  const submitted = opportunities.filter(item => ["Submitted", "Pending Award", "Awarded", "Lost"].includes(item.status) || ["Pending Award", "Awarded", "Lost"].includes(normalizeAwardOutcome(item.award_outcome, item).award_status));
  const awarded = opportunities.filter(item => normalizeAwardOutcome(item.award_outcome, item).award_status === "Awarded");
  const lost = opportunities.filter(item => normalizeAwardOutcome(item.award_outcome, item).award_status === "Lost");
  const pending = opportunities.filter(item => {
    const outcome = normalizeAwardOutcome(item.award_outcome, item);
    return outcome.award_status === "Pending Award" && ["Submitted", "Pending Award"].includes(item.status);
  });
  const totalAwardedValue = awarded.reduce((sum, item) => {
    const outcome = normalizeAwardOutcome(item.award_outcome, item);
    return sum + Number(outcome.award_amount || item.estimated_value || 0);
  }, 0);
  const decided = awarded.length + lost.length;
  return {
    pendingAwards: pending.length,
    contractsWon: awarded.length,
    contractsLost: lost.length,
    totalSubmitted: submitted.length,
    winRate: decided ? Math.round((awarded.length / decided) * 100) : 0,
    totalAwardedValue,
    averageAwardAmount: awarded.length ? Math.round(totalAwardedValue / awarded.length) : 0,
    upcomingPendingAwards: pending.filter(item => {
      const days = daysUntil(item.due_date);
      return days === null || days >= 0;
    }).length,
    outcomes
  };
}

function getOpportunityTimeline(opportunity, governmentData) {
  const outreachRows = governmentData.outreach.filter(item => item.opportunity_id === opportunity.id);
  const reminderRows = (governmentData.reminders || []).filter(item => item.opportunity_id === opportunity.id);
  const outcome = normalizeAwardOutcome(opportunity.award_outcome, opportunity);
  return [
    { title: "Opportunity created", detail: opportunity.created_at || "Created date not recorded", status: "Complete" },
    { title: "AI review completed", detail: opportunity.ai_review?.recommended_next_action || opportunity.ai_executive_summary, status: opportunity.ai_fit_score ? "Complete" : "Pending" },
    { title: "Subcontractors identified", detail: `${new Set(outreachRows.map(item => item.subcontractor_id)).size} attached partner(s)`, status: outreachRows.length ? "Complete" : "Pending" },
    { title: "Outreach completed", detail: `${outreachRows.filter(item => ["Sent", "Called", "Responded", "Interested", "Quote Requested", "Quote Received", "Partner Selected"].includes(normalizeOutreachStatus(item.status))).length} outreach record(s) beyond draft`, status: outreachRows.some(item => normalizeOutreachStatus(item.status) !== "Draft") ? "Complete" : "Pending" },
    { title: "Responses tracked", detail: `${outreachRows.filter(item => ["Responded", "Interested", "Quote Requested", "Quote Received", "Declined", "Partner Selected"].includes(normalizeOutreachStatus(item.status))).length} response outcome(s)`, status: outreachRows.some(item => ["Responded", "Interested", "Quote Requested", "Quote Received", "Declined", "Partner Selected"].includes(normalizeOutreachStatus(item.status))) ? "Complete" : "Pending" },
    { title: "Reminders completed", detail: `${reminderRows.filter(item => item.status === "Completed").length} of ${reminderRows.length} reminder(s) completed`, status: reminderRows.length && reminderRows.every(item => item.status === "Completed" || item.status === "Cancelled") ? "Complete" : "Pending" },
    { title: "Award outcome", detail: outcome.award_status, status: ["Awarded", "Lost", "Cancelled", "Withdrawn"].includes(outcome.award_status) ? "Complete" : "Pending" }
  ];
}

function getOutreachStats(rows) {
  return {
    drafts: rows.filter(item => normalizeOutreachStatus(item.status) === "Draft").length,
    sent: rows.filter(item => normalizeOutreachStatus(item.status) === "Sent").length,
    awaiting: rows.filter(item => ["Sent", "Called", "Responded", "Follow Up Needed"].includes(normalizeOutreachStatus(item.status))).length,
    dueToday: rows.filter(item => {
      const days = daysUntil(item.follow_up_date);
      return days !== null && days <= 0 && !["Declined", "Quote Received", "Partner Selected"].includes(normalizeOutreachStatus(item.status));
    }).length,
    interested: rows.filter(item => ["Interested", "Partner Selected"].includes(normalizeOutreachStatus(item.status))).length,
    quotes: rows.filter(item => normalizeOutreachStatus(item.status) === "Quote Received").length
  };
}

function opportunityBrand(opportunity) {
  const text = `${opportunity.title} ${opportunity.description || ""} ${opportunity.notes || ""} ${(opportunity.subcontractor_categories || []).join(" ")}`.toLowerCase();
  if (["transport", "medical transport", "driver", "patient", "delivery"].some(word => text.includes(word))) {
    return { business: "DrivenbyDezign Care & Transport", signer: "Valicia Davis", focus: "care, transport, logistics, and service delivery support" };
  }
  return { business: "V Solutions LLC", signer: "Valicia Davis", focus: "HR consulting, compliance, training, and operations support" };
}

function draftOutreachEmail(opportunity, subcontractor) {
  const brand = opportunityBrand(opportunity);
  return `Subject: Potential teaming opportunity - ${opportunity.title}

Hi ${subcontractor.contact_name || "there"},

I am reviewing ${opportunity.title} with ${opportunity.agency} (${opportunity.solicitation_number}) and believe your ${subcontractor.service_category || "service"} experience may be a strong fit.

The opportunity is due ${opportunity.due_date} and is currently estimated at ${amount(opportunity.estimated_value)}. I am looking for a subcontractor partner who can support: ${(opportunity.subcontractor_categories || []).join(", ")}.

Would you be open to a quick conversation about availability, relevant experience, and a rough quote?

Thank you,
${brand.signer}
${brand.business}`;
}

function generateAIFitAnalysis(opportunity) {
  const text = `${opportunity.title} ${opportunity.description || ""} ${opportunity.opportunity_text || ""} ${opportunity.notes || ""}`.toLowerCase();
  const categoryMatches = [
    ["janitorial", ["janitorial", "cleaning", "custodial"]],
    ["transportation", ["transportation", "logistics", "driver", "delivery"]],
    ["HR consulting", ["hr", "human resources", "employee relations", "policy", "workplace"]],
    ["training", ["training", "workshop", "facilitation", "curriculum"]],
    ["admin support", ["administrative", "admin", "clerical", "office support"]],
    ["electricians", ["electrician", "electrical", "wiring"]],
    ["uniforms/apparel", ["uniform", "apparel", "clothing", "shirts"]],
    ["medical transport", ["medical transport", "non-emergency", "patient transport", "nemt"]],
    ["facility support", ["facility", "maintenance", "building support"]]
  ];
  const suggested = categoryMatches.filter(([, words]) => words.some(word => text.includes(word))).map(([category]) => category);
  const baseScore = suggested.includes("HR consulting") || suggested.includes("training") ? 88 : suggested.includes("transportation") || suggested.includes("medical transport") ? 82 : suggested.length ? 72 : 58;
  const score = Number(opportunity.ai_fit_score ?? opportunity.fit_score ?? 0) || baseScore;
  const naicsGood = ["541612", "541611", "611430"].includes(String(opportunity.naics || ""));
  const primeRecommendation = score >= 85 && naicsGood ? "Prime or lead subcontractor" : score >= 70 ? "Subcontractor or teaming partner" : "Watch list / pass unless partner-led";
  const urgency = dueLabel(opportunity.due_date);
  return {
    summary: opportunity.description || opportunity.summary || `${opportunity.title} from ${opportunity.agency}.`,
    bid_no_bid: score >= 80 ? "Bid / pursue" : score >= 65 ? "Maybe - pursue with partner" : "No-bid unless strategically important",
    deadline_urgency: urgency,
    why: `${opportunity.title} aligns with Valicia's current capabilities at an estimated ${score}% fit. Deadline urgency: ${urgency}.`,
    hr_capability_alignment: "Strong alignment with HR compliance, employee relations documentation, workplace investigations, policy review, and practical advisory support.",
    government_capability_alignment: "Good alignment when paired with clear past performance, pricing support, a capability statement, and a partner bench for scale.",
    naics_alignment: naicsGood ? `${opportunity.naics} is aligned with HR consulting, management consulting, or training services.` : `${opportunity.naics || "No NAICS listed"} needs review before pursuit.`,
    risks: opportunity.risks?.length ? opportunity.risks : ["Confirm past performance relevance.", "Validate deadline and required attachments.", "Confirm whether a prime partner is needed."],
    missing_requirements: opportunity.documents_needed?.length ? opportunity.documents_needed : ["Capability statement", "Past performance summary", "Pricing worksheet", "Subcontractor quote"],
    capability_gaps: score >= 85 ? ["Federal pricing support", "Agency-specific past performance examples"] : ["Prime partner", "Federal past performance", "Expanded delivery capacity"],
    prime_vs_subcontract: primeRecommendation,
    recommended_next_action: opportunity.next_action || "Review source documents, confirm fit, and contact potential subcontractors.",
    suggested_subcontractor_categories: opportunity.subcontractor_categories?.length ? opportunity.subcontractor_categories : (suggested.length ? suggested : ["Proposal pricing", "Prime partner", "Specialized delivery support"]),
    overall_fit_score: score
  };
}

function draftFollowUpEmail(opportunity, subcontractor) {
  const brand = opportunityBrand(opportunity);
  return `Subject: Follow-up: ${opportunity.title}

Hi ${subcontractor.contact_name || "there"},

I wanted to follow up on my note about ${opportunity.title} with ${opportunity.agency}. The due date is ${opportunity.due_date || "coming up"}, so I am confirming whether your team is interested in discussing a possible teaming role.

If there is interest, could you send availability, relevant capabilities, and any initial questions?

Thank you,
${brand.signer}
${brand.business}`;
}

function draftCallScript(opportunity, subcontractor) {
  const brand = opportunityBrand(opportunity);
  return `Opening: Hi ${subcontractor.contact_name || "there"}, this is ${brand.signer} with ${brand.business}. I am reviewing ${opportunity.title} for ${opportunity.agency} and wanted to see whether ${subcontractor.company_name || "your company"} may be a fit for ${subcontractor.service_category || "supporting the opportunity"}.

Key points:
- Opportunity: ${opportunity.title}
- Due date: ${opportunity.due_date || "TBD"}
- Estimated value: ${amount(opportunity.estimated_value)}
- Support needed: ${(opportunity.subcontractor_categories || opportunity.required_capabilities || []).join(", ") || "capability support"}

Questions:
1. Are you interested and available?
2. Do you have relevant past performance?
3. What would you need to provide a rough quote or teaming input?
4. What is the best next step?`;
}

function draftLinkedInMessage(opportunity, subcontractor) {
  const brand = opportunityBrand(opportunity);
  return `Hi ${subcontractor.contact_name || "there"}, I am reviewing a government opportunity for ${opportunity.agency} related to ${opportunity.title} through ${brand.business}. Your ${subcontractor.service_category || "capability"} background may be a fit. Would you be open to a quick conversation about possible teaming support?`;
}

function draftCapabilityIntro(opportunity, subcontractor) {
  const brand = opportunityBrand(opportunity);
  return `${brand.business} is reviewing ${opportunity.title} for ${opportunity.agency}. We are looking for capable partners who can support ${(opportunity.subcontractor_categories || opportunity.required_capabilities || []).join(", ") || "the required scope"}. ${subcontractor.company_name || "Your company"} appears relevant because of your ${subcontractor.service_category || "listed capabilities"}. We would like to understand your past performance, availability, and whether you can provide input or a quote for this opportunity.`;
}

function normalizeDiscoveryOpportunity(item = {}) {
  return {
    id: item.id || uid("disc"),
    title: item.title || "",
    agency: item.agency || "",
    due_date: item.due_date || item.dueDate || "",
    opportunity_url: item.opportunity_url || item.url || item.source_url || "",
    category: item.category || "Service contract",
    description: item.description || "",
    estimated_value: Number(item.estimated_value || 0),
    date_found: item.date_found || today,
    source: item.source || "Unknown discovery source",
    source_type: item.source_type || "live",
    source_label: item.source_label || "Live Source",
    notes: item.notes || "",
    portal_login_needed: item.portal_login_needed || "unknown",
    document_link: item.document_link || "",
    naics: item.naics || "",
    local: Boolean(item.local),
    fits_existing_naics: Boolean(item.fits_existing_naics),
    estimated_upfront_capital: Number(item.estimated_upfront_capital || 0),
    can_leverage_subcontractors: Boolean(item.can_leverage_subcontractors),
    can_leverage_suppliers: Boolean(item.can_leverage_suppliers),
    full_time_manageable: Boolean(item.full_time_manageable),
    complexity: item.complexity || "Moderate",
    staffing_needs: item.staffing_needs || "Needs review.",
    equipment_needs: item.equipment_needs || "Needs review.",
    supply_needs: item.supply_needs || "Needs review.",
    likelihood_of_subcontracting: item.likelihood_of_subcontracting || "Unknown",
    likelihood_of_supplier_use: item.likelihood_of_supplier_use || "Unknown"
  };
}

function createManualDiscoveryOpportunity(values = {}) {
  const combinedText = `${values.title || ""} ${values.agency || ""} ${values.category || ""} ${values.description || ""} ${values.notes || ""}`;
  const lowerText = combinedText.toLowerCase();
  const sourceType = values.source_type || "manual";
  return normalizeDiscoveryOpportunity({
    ...values,
    id: uid("manual-disc"),
    date_found: today,
    source_type: sourceType,
    source_label: "Manual Entry \u2014 Real Opportunity",
    estimated_value: Number(values.estimated_value || 0),
    portal_login_needed: values.portal_login_needed || "unknown",
    local: /montgomery|alabama|al\b|city|county/.test(lowerText),
    fits_existing_naics: /hr|human resources|training|consulting|administrative|admin|coordination|records|policy|compliance|management|broker|supplier|supply/.test(lowerText),
    estimated_upfront_capital: estimateDiscoveryUpfrontCapital(combinedText),
    can_leverage_subcontractors: /subcontract|partner|installation|delivery|service|support|coordination|specialist|vendor/.test(lowerText),
    can_leverage_suppliers: /supply|supplies|materials|printing|equipment|product|vendor|portal|dibbs|quote/.test(lowerText),
    full_time_manageable: !/daily onsite|full-time onsite|24\/7|large payroll|staffing|recruiting|multiple shifts/.test(lowerText),
    complexity: /construction|bond|bonding|multi-year|statewide|multiple buildings|equipment/.test(lowerText) ? "High" : "Moderate",
    staffing_needs: /staffing|recruiting/.test(lowerText) ? "Avoid - staffing or recruiting language detected." : "Manual entry needs review; likely owner-managed with subcontractor support if required.",
    equipment_needs: /equipment|vehicle|machinery/.test(lowerText) ? "Review equipment requirements before pursuing." : "No major equipment need identified from manual entry.",
    supply_needs: /supply|supplies|materials|product/.test(lowerText) ? "Supplier quote may be needed before bid/no-bid." : "No major supply need identified from manual entry.",
    likelihood_of_subcontracting: /subcontract|partner|service|support|installation|delivery/.test(lowerText) ? "Moderate" : "Low",
    likelihood_of_supplier_use: /supply|supplies|materials|product|quote|vendor/.test(lowerText) ? "High" : "Low"
  });
}

function normalizeIngestedOpportunity(item = {}, adapter) {
  return normalizeDiscoveryOpportunity({
    ...item,
    source: item.source || adapter.name,
    date_found: item.date_found || today
  });
}

function developerTestMockOpportunitiesForSource(sourceName) {
  return developerTestOpportunityDiscoveryMock.filter(item => item.source === sourceName);
}

async function fetchAlabamaProcurementOpportunities() {
  return fetchAlabamaBuysLiveOpportunities();
}

async function fetchCityOfMontgomeryOpportunities() {
  return fetchCityOfMontgomeryLiveOpportunities();
}

async function fetchSamGovOpportunities() {
  return fetchSamGovLiveOpportunities();
}

function fetchMontgomeryCountyOpportunities() {
  // TODO: Connect Montgomery County purchasing source, manual import, or scraper here and map raw notices into normalizeIngestedOpportunity.
  return [];
}

async function fetchAlabamaBuysLiveOpportunities() {
  const response = await fetch(alabamaBuysPublicSolicitationsUrl, { headers: { Accept: "text/html" } });
  if (!response.ok) throw new Error(`Alabama Buys returned ${response.status}`);
  const html = await response.text();
  if (/browser check|please wait while we are checking your browser|login/i.test(html)) throw new Error("Alabama Buys unavailable / blocked");
  return parseAlabamaBuysHtml(html);
}

async function fetchCityOfMontgomeryLiveOpportunities() {
  try {
    const portalResponse = await fetch(cityOfMontgomeryOpenGovUrl, { headers: { Accept: "text/html" } });
    if (portalResponse.ok) {
      const portalHtml = await portalResponse.text();
      const portalRows = parseCityOfMontgomeryOpenGovHtml(portalHtml);
      if (portalRows.length) return portalRows;
    }
  } catch {
    // The OpenGov portal may block static-browser or scheduled fetches; the public City page remains a status check.
  }
  const infoResponse = await fetch(cityOfMontgomeryBidsInfoUrl, { headers: { Accept: "text/html" } });
  if (!infoResponse.ok) throw new Error(`City of Montgomery returned ${infoResponse.status}`);
  const infoHtml = await infoResponse.text();
  if (!/OpenGov|e-Procurement Portal|Bids and Request for Proposals/i.test(infoHtml)) throw new Error("City of Montgomery procurement page unavailable");
  return parseCityOfMontgomeryInfoHtml(infoHtml);
}

function parseCityOfMontgomeryOpenGovHtml(html = "") {
  const text = String(html || "").replace(/\s+/g, " ");
  const rowPattern = /(?:RFP|RFQ|ITB|Bid|Solicitation)[^<]{0,260}/gi;
  const matches = Array.from(text.matchAll(rowPattern))
    .map(match => match[0].trim())
    .filter(snippet => !/subscribe|register|vendor|profile|notification/i.test(snippet))
    .slice(0, 8);
  return matches.map((snippet, index) => normalizeCityOfMontgomeryOpportunity(snippet, `city-live-${index + 1}`, cityOfMontgomeryOpenGovUrl));
}

function parseCityOfMontgomeryInfoHtml(html = "") {
  const text = String(html || "").replace(/\s+/g, " ");
  const hasPortalOnly = /OpenGov|e-Procurement Portal|publishing solicitations/i.test(text);
  if (hasPortalOnly) return [];
  return [];
}

function getSamGovApiKey() {
  try {
    return (localStorage.getItem(samGovApiKeyStorageKey) || window.VALICIA_SAM_GOV_API_KEY || "").trim();
  } catch {
    return (window.VALICIA_SAM_GOV_API_KEY || "").trim();
  }
}

function discoverySourceStatusError(message) {
  const error = new Error(message);
  error.connectionStatus = message;
  return error;
}

async function fetchSamGovLiveOpportunities() {
  const apiKey = getSamGovApiKey();
  if (!apiKey) throw discoverySourceStatusError("SAM.gov not connected \u2014 API key required.");
  const params = new URLSearchParams({
    api_key: apiKey,
    postedFrom: formatSamGovDate(addDays(new Date(), -30)),
    postedTo: formatSamGovDate(new Date()),
    ptype: "o",
    limit: "50",
    offset: "0"
  });
  const response = await fetch(`${samGovOpportunitiesApiUrl}?${params.toString()}`, { headers: { Accept: "application/json" } });
  if (response.status === 401 || response.status === 403) throw discoverySourceStatusError("SAM.gov unavailable/blocked - check API key.");
  if (!response.ok) throw new Error(`SAM.gov returned ${response.status}`);
  const data = await response.json();
  return normalizeSamGovResults(data);
}

function normalizeSamGovResults(data = {}) {
  const rows = Array.isArray(data.opportunitiesData) ? data.opportunitiesData : [];
  return rows
    .filter(item => String(item.active || "").toLowerCase() !== "no")
    .map(normalizeSamGovOpportunity)
    .filter(item => item.title && item.opportunity_url)
    .filter(item => !isStaffingOrRecruitingDiscovery(item))
    .slice(0, 50);
}

function normalizeSamGovOpportunity(item = {}) {
  const text = [
    item.title,
    item.type,
    item.baseType,
    item.typeOfSetAsideDescription,
    item.naicsCode,
    item.classificationCode,
    item.fullParentPathName,
    item.office,
    item.description
  ].filter(Boolean).join(" ");
  const agency = item.fullParentPathName || [item.department, item.subTier, item.office].filter(Boolean).join(" / ") || "Federal agency";
  const noticeUrl = item.uiLink && item.uiLink !== "null"
    ? item.uiLink
    : `https://sam.gov/opp/${item.noticeId || item.solicitationNumber || ""}/view`;
  const estimatedValue = Number(item.award?.amount || 0);
  return normalizeDiscoveryOpportunity({
    id: `sam-${item.noticeId || item.solicitationNumber || uid("notice")}`,
    title: item.title || "SAM.gov opportunity",
    agency,
    due_date: normalizeSamGovDate(item.responseDeadLine || item.reponseDeadLine || item.responseDeadline),
    opportunity_url: noticeUrl,
    category: inferDiscoveryCategory(text),
    description: buildSamGovDescription(item),
    estimated_value: Number.isFinite(estimatedValue) ? estimatedValue : 0,
    date_found: normalizeSamGovDate(item.postedDate) || today,
    source: "SAM.gov",
    source_type: "live",
    source_label: "Live Source",
    document_link: Array.isArray(item.resourceLinks) && item.resourceLinks.length ? item.resourceLinks[0] : "",
    naics: item.naicsCode || "",
    local: /montgomery|alabama|\bAL\b/i.test(JSON.stringify(item.placeOfPerformance || item.officeAddress || {})),
    fits_existing_naics: /541611|541612|611430|561110|administrative|training|consulting|hr|human resources|records|policy|coordination/i.test(text),
    estimated_upfront_capital: estimateDiscoveryUpfrontCapital(text),
    can_leverage_subcontractors: /service|support|maintenance|installation|coordination|logistics|consulting|training|delivery|subcontract/i.test(text),
    can_leverage_suppliers: /supply|supplies|materials|product|equipment|printing|parts|hardware|software|subscription|vendor/i.test(text),
    full_time_manageable: !/24\/7|full-time onsite|daily onsite|staffing|recruiting|construction crew|large payroll|multiple shifts|bonding|performance bond/i.test(text),
    complexity: /construction|bond|bonding|statewide|enterprise|multi-year|multiple locations|facility-wide|large-scale/i.test(text) ? "High" : "Moderate",
    staffing_needs: /staffing|recruiting/.test(text.toLowerCase()) ? "Avoid - staffing or recruiting language detected." : "Review federal scope; likely feasible only with subcontractor or supplier support if delivery is broad.",
    equipment_needs: /equipment|vehicle|machinery|hardware/.test(text.toLowerCase()) ? "Review equipment requirements before pursuing." : "No major equipment need identified from SAM.gov summary.",
    supply_needs: /supply|supplies|materials|parts|product/.test(text.toLowerCase()) ? "Supplier quote may be needed before bid/no-bid." : "No major supply need identified from SAM.gov summary.",
    likelihood_of_subcontracting: /service|support|installation|maintenance|delivery|training|consulting/.test(text.toLowerCase()) ? "Moderate" : "Low",
    likelihood_of_supplier_use: /supply|supplies|materials|parts|product|equipment/.test(text.toLowerCase()) ? "High" : "Moderate"
  });
}

function buildSamGovDescription(item = {}) {
  return [
    item.type ? `Type: ${item.type}.` : "",
    item.solicitationNumber ? `Solicitation: ${item.solicitationNumber}.` : "",
    item.typeOfSetAsideDescription ? `Set-aside: ${item.typeOfSetAsideDescription}.` : "",
    item.naicsCode ? `NAICS: ${item.naicsCode}.` : "",
    item.classificationCode ? `PSC/classification: ${item.classificationCode}.` : "",
    item.responseDeadLine || item.reponseDeadLine ? `Response deadline: ${item.responseDeadLine || item.reponseDeadLine}.` : ""
  ].filter(Boolean).join(" ") || "Live SAM.gov opportunity. Review the notice and attachments before bid/no-bid.";
}

function normalizeCityOfMontgomeryOpportunity(snippet, id, url) {
  return normalizeDiscoveryOpportunity({
    id,
    title: snippet.slice(0, 96),
    agency: "City of Montgomery",
    due_date: normalizeDateFromText(snippet),
    opportunity_url: url,
    category: inferDiscoveryCategory(snippet),
    description: snippet,
    estimated_value: 0,
    date_found: today,
    source: "City of Montgomery opportunities",
    naics: inferDiscoveryNaics(snippet),
    local: true,
    fits_existing_naics: /hr|training|administrative|consulting|policy|records|workshop|coordination/i.test(snippet),
    estimated_upfront_capital: estimateDiscoveryUpfrontCapital(snippet),
    can_leverage_subcontractors: /service|support|training|installation|coordination|delivery/i.test(snippet),
    can_leverage_suppliers: /supply|supplies|materials|printing|equipment|books|advertising/i.test(snippet),
    full_time_manageable: !/multiple buildings|recurring daily|24\/7|large|citywide deployment/i.test(snippet),
    complexity: /citywide|multiple|installation|construction/i.test(snippet) ? "High" : "Moderate",
    staffing_needs: "Needs review from live City of Montgomery solicitation details.",
    equipment_needs: "Needs review from live City of Montgomery solicitation details.",
    supply_needs: "Needs review from live City of Montgomery solicitation details.",
    likelihood_of_subcontracting: /service|installation|delivery|support/i.test(snippet) ? "Moderate" : "Low",
    likelihood_of_supplier_use: /supply|supplies|materials|books|equipment/i.test(snippet) ? "High" : "Moderate"
  });
}

function parseAlabamaBuysHtml(html = "") {
  const text = String(html || "").replace(/\s+/g, " ");
  const rowPattern = /(?:SRC\d{7,}|RFP|RFQ|ITB)[^<]{0,240}/gi;
  const matches = Array.from(text.matchAll(rowPattern)).slice(0, 8);
  return matches.map((match, index) => {
    const snippet = match[0].trim();
    const id = (snippet.match(/SRC\d{7,}/i) || [])[0] || `AL-LIVE-${index + 1}`;
    const dueDate = normalizeDateFromText(snippet) || "";
    return normalizeDiscoveryOpportunity({
      id: `al-live-${id.toLowerCase()}`,
      title: snippet.slice(0, 96),
      agency: "State of Alabama",
      due_date: dueDate,
      opportunity_url: alabamaBuysPublicSolicitationsUrl,
      category: inferDiscoveryCategory(snippet),
      description: snippet,
      estimated_value: 0,
      date_found: today,
      source: "Alabama Buys",
      naics: inferDiscoveryNaics(snippet),
      local: /montgomery|alabama/i.test(snippet),
      fits_existing_naics: /hr|training|administrative|consulting|policy|records|workshop|coordination/i.test(snippet),
      estimated_upfront_capital: estimateDiscoveryUpfrontCapital(snippet),
      can_leverage_subcontractors: /service|support|training|installation|coordination|delivery/i.test(snippet),
      can_leverage_suppliers: /supply|supplies|materials|printing|equipment|books|advertising/i.test(snippet),
      full_time_manageable: !/multiple buildings|recurring daily|24\/7|large|statewide deployment/i.test(snippet),
      complexity: /statewide|multiple|installation|construction/i.test(snippet) ? "High" : "Moderate",
      staffing_needs: "Needs review from live Alabama Buys solicitation details.",
      equipment_needs: "Needs review from live Alabama Buys solicitation details.",
      supply_needs: "Needs review from live Alabama Buys solicitation details.",
      likelihood_of_subcontracting: /service|installation|delivery|support/i.test(snippet) ? "Moderate" : "Low",
      likelihood_of_supplier_use: /supply|supplies|materials|books|equipment/i.test(snippet) ? "High" : "Moderate"
    });
  });
}

function normalizeDateFromText(text = "") {
  const match = String(text).match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+20\d{2}\b/i);
  if (!match) return "";
  const date = new Date(match[0]);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function formatSamGovDate(date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
}

function normalizeSamGovDate(value = "") {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function inferDiscoveryCategory(text = "") {
  const value = String(text).toLowerCase();
  if (/hr|policy|handbook|employee/.test(value)) return "HR consulting";
  if (/training|workshop/.test(value)) return "Training and coordination";
  if (/supply|supplies|materials|books/.test(value)) return "Supply and coordination";
  if (/logistics|delivery|fulfillment|shipping/.test(value)) return "Logistics coordination";
  if (/consulting|management|program support|technical assistance/.test(value)) return "Consulting and management support";
  if (/administrative|records|coordination/.test(value)) return "Administrative services";
  if (/software|subscription|license|it support/.test(value)) return "Technology or supplier-supported services";
  return "Government opportunity";
}

function inferDiscoveryNaics(text = "") {
  const value = String(text).toLowerCase();
  if (/hr|policy|employee/.test(value)) return "541612";
  if (/training|workshop/.test(value)) return "611430";
  if (/administrative|records|coordination/.test(value)) return "541611";
  return "";
}

function estimateDiscoveryUpfrontCapital(text = "") {
  const value = String(text).toLowerCase();
  if (/bond|bonding|construction crew|vehicle fleet|heavy equipment|major inventory|statewide deployment|multiple buildings/.test(value)) return 6500;
  if (/construction|vehicle|equipment|statewide|multiple locations/.test(value)) return 5000;
  if (/supplies|materials|books|printing|parts|hardware/.test(value)) return 1500;
  if (/consulting|training|administrative|records|coordination|program support|technical assistance/.test(value)) return 750;
  return 750;
}

function isStaffingOrRecruitingDiscovery(item = {}) {
  return /staffing|recruiting|temporary labor|temp labor|personnel placement|staff augmentation/i.test(`${item.title || ""} ${item.description || ""} ${item.category || ""}`);
}

function createOpportunityDiscoveryInitialResult() {
  const sourceStatuses = opportunityDiscoveryAdapters.map(adapter => {
    return {
      id: adapter.id,
      name: adapter.name,
      sourceType: adapter.sourceType,
      connectionStatus: adapter.connectionStatus,
      count: 0
    };
  });
  return {
    opportunities: [],
    sourceStatuses,
    mode: "Live Only",
    connectionStatus: "No live check run yet",
    lastChecked: currentDateTime()
  };
}

function createDeveloperTestOpportunityDiscoveryResult() {
  const sourceStatuses = opportunityDiscoveryAdapters.map(adapter => {
    const rows = developerTestMockOpportunitiesForSource(adapter.name);
    return {
      id: adapter.id,
      name: adapter.name,
      sourceType: "Developer/Test Mock Data",
      connectionStatus: "developer test mode only",
      count: rows.length
    };
  });
  return {
    opportunities: developerTestOpportunityDiscoveryMock.map(normalizeDiscoveryOpportunity),
    sourceStatuses,
    mode: "Developer/Test Mock Data",
    connectionStatus: "Developer/test mode only",
    lastChecked: currentDateTime()
  };
}

async function runOpportunityDiscoveryIngestion() {
  const results = await Promise.all(opportunityDiscoveryAdapters.map(async adapter => {
    if (!adapter.liveConnected) {
      return {
        rows: [],
        status: {
          id: adapter.id,
          name: adapter.name,
          sourceType: adapter.sourceType,
          connectionStatus: "not connected yet",
          count: 0
        }
      };
    }
    try {
      const rows = (await adapter.fetch()).map(item => normalizeIngestedOpportunity(item, adapter));
      return {
        rows,
        status: {
          id: adapter.id,
          name: adapter.name,
          sourceType: adapter.sourceType,
          connectionStatus: rows.length ? "live connected" : "no live opportunities found",
          count: rows.length
        }
      };
    } catch (error) {
      return {
        rows: [],
        status: {
          id: adapter.id,
          name: adapter.name,
          sourceType: adapter.sourceType,
          connectionStatus: error.connectionStatus || "unavailable/blocked",
          count: 0
        }
      };
    }
  }));
  const opportunities = results.flatMap(result => result.rows);
  const sourceStatuses = results.map(result => result.status);
  return {
    opportunities,
    sourceStatuses,
    mode: "Live Only",
    connectionStatus: opportunities.length ? "Live opportunities found" : "No live opportunities found from connected sources yet.",
    lastChecked: currentDateTime()
  };
}

function pipelineHasDiscoveryOpportunity(governmentData, discoveryItem) {
  const url = discoveryItem.opportunity_url || "";
  const discoveryNumber = `DISC-${discoveryItem.id}`;
  return (governmentData.opportunities || []).some(item =>
    (url && item.source_url === url) ||
    item.solicitation_number === discoveryNumber ||
    item.title === discoveryItem.title
  );
}

function selectTopDiscoveryMatches(opportunities, governmentData = {}) {
  return opportunities
    .map(item => ({ ...item, assessment: assessDiscoveryOpportunity(item) }))
    .filter(item => item.assessment.tier !== "Tier C")
    .sort((a, b) => {
      const tierWeight = tier => tier === "Tier A" ? 0 : tier === "Tier B" ? 1 : 2;
      return tierWeight(a.assessment.tier) - tierWeight(b.assessment.tier)
        || b.assessment.score - a.assessment.score
        || Number(a.estimated_upfront_capital || 0) - Number(b.estimated_upfront_capital || 0);
    })
    .slice(0, 5)
    .map(item => ({
      ...item,
      isNewTierA: item.assessment.tier === "Tier A" && !pipelineHasDiscoveryOpportunity(governmentData, item)
    }));
}

function runDailyOpportunityDiscoveryAutomation(governmentData = {}, ingestionInput) {
  const ingestion = ingestionInput || runOpportunityDiscoveryIngestion();
  const scored = ingestion.opportunities.map(item => ({ ...item, assessment: assessDiscoveryOpportunity(item) }));
  const topMatches = selectTopDiscoveryMatches(ingestion.opportunities, governmentData);
  return {
    ...ingestion,
    scored,
    topMatches,
    newTierA: topMatches.filter(item => item.isNewTierA),
    reviewQueue: topMatches.map(item => ({
      id: `review-${item.id}`,
      title: item.title,
      agency: item.agency,
      tier: item.assessment.tier,
      score: item.assessment.score,
      due_date: item.due_date,
      priority: item.isNewTierA ? "High" : "Normal",
      status: pipelineHasDiscoveryOpportunity(governmentData, item) ? "In Pipeline" : "Needs Review",
      notes: item.assessment.recommended_action
    })),
    automationStatus: "Daily Automation Ready",
    lastRun: ingestion.lastChecked
  };
}

function createDiscoveryReviewQueue(opportunities, governmentData = {}) {
  return selectTopDiscoveryMatches(opportunities, governmentData).map(item => ({
    id: `review-${item.id}`,
    title: item.title,
    agency: item.agency,
    tier: item.assessment.tier,
    score: item.assessment.score,
    due_date: item.due_date,
    source_label: item.source_label || "Live Source",
    priority: item.isNewTierA ? "High" : "Normal",
    status: pipelineHasDiscoveryOpportunity(governmentData, item) ? "In Pipeline" : "Needs Review",
    notes: item.assessment.recommended_action
  }));
}

function getInitialManualDiscoveryForm() {
  return {
    title: "",
    agency: "",
    due_date: "",
    opportunity_url: "",
    source: "",
    category: "",
    description: "",
    estimated_value: "",
    notes: "",
    portal_login_needed: "unknown",
    document_link: "",
    source_type: "manual"
  };
}

function scoreDiscoveryOpportunity(item) {
  const opportunity = normalizeDiscoveryOpportunity(item);
  const score =
    (opportunity.local ? 20 : 0) +
    (opportunity.fits_existing_naics ? 20 : 0) +
    (opportunity.estimated_upfront_capital <= 2000 ? 30 : 0) +
    (opportunity.can_leverage_subcontractors ? 10 : 0) +
    (opportunity.can_leverage_suppliers ? 10 : 0) +
    (opportunity.full_time_manageable ? 10 : 0);
  return score;
}

function classifyDiscoveryOpportunity(item) {
  const opportunity = normalizeDiscoveryOpportunity(item);
  const score = scoreDiscoveryOpportunity(opportunity);
  if (opportunity.estimated_upfront_capital <= 2000 && score >= 80) return "Tier A";
  if (opportunity.estimated_upfront_capital <= 4000 && score >= 50) return "Tier B";
  return "Tier C";
}

function assessDiscoveryOpportunity(item) {
  const opportunity = normalizeDiscoveryOpportunity(item);
  const score = scoreDiscoveryOpportunity(opportunity);
  const tier = classifyDiscoveryOpportunity(opportunity);
  const recommendedAction = tier === "Tier A"
    ? "Review opportunity and add to the government pipeline."
    : tier === "Tier B"
      ? "Validate requirements, pricing, and partner plan before pursuing."
      : "Archive unless scope or capital requirements change.";
  const fitReasons = [
    opportunity.local ? "local to Montgomery/Alabama" : "",
    opportunity.fits_existing_naics ? "aligned with existing consulting/admin NAICS" : "",
    opportunity.estimated_upfront_capital <= 2000 ? "estimated upfront capital is within the $2,000 limit" : "",
    opportunity.can_leverage_subcontractors ? "can use subcontractor support" : "",
    opportunity.can_leverage_suppliers ? "can use suppliers instead of buying equipment" : "",
    opportunity.full_time_manageable ? "can be managed around full-time employment" : ""
  ].filter(Boolean);
  return {
    score,
    tier,
    estimated_upfront_capital_required: opportunity.estimated_upfront_capital,
    complexity: opportunity.complexity,
    staffing_needs: opportunity.staffing_needs,
    equipment_needs: opportunity.equipment_needs,
    supply_needs: opportunity.supply_needs,
    likelihood_of_subcontracting: opportunity.likelihood_of_subcontracting,
    likelihood_of_supplier_use: opportunity.likelihood_of_supplier_use,
    recommended_action: recommendedAction,
    why_this_fits_valicia: fitReasons.length
      ? `This is practical because it is ${fitReasons.join(", ")}.`
      : "This needs caution because it does not clearly match Valicia's low-capital, owner-managed pursuit profile."
  };
}

function discoveryToGovernmentOpportunity(item) {
  const opportunity = normalizeDiscoveryOpportunity(item);
  const assessment = assessDiscoveryOpportunity(opportunity);
  return normalizeGovernmentOpportunity({
    title: opportunity.title,
    agency: opportunity.agency,
    solicitation_number: `DISC-${opportunity.id}`,
    naics: opportunity.naics,
    set_aside: "Small business / local review",
    due_date: opportunity.due_date,
    estimated_value: opportunity.estimated_value,
    source_url: opportunity.opportunity_url,
    ai_fit_score: assessment.score,
    status: "AI Review",
    next_action: assessment.recommended_action,
    notes: `${opportunity.description}\n\nCapital-aware discovery source: ${opportunity.source}. Estimated upfront capital: ${amount(assessment.estimated_upfront_capital_required)}. Tier: ${assessment.tier}.`,
    pws_summary: opportunity.description,
    summary: opportunity.description,
    requirements: `Category: ${opportunity.category}. Validate solicitation requirements, insurance, bonding, timeline, and payment terms before bid.`,
    scope_of_work: opportunity.description,
    risks: [
      assessment.estimated_upfront_capital_required > 2000 ? "Estimated upfront capital exceeds the target limit." : "Confirm payment timing before committing costs.",
      opportunity.full_time_manageable ? "Confirm deadline workload fits evenings/weekends." : "May not be manageable while employed full-time."
    ],
    required_capabilities: [opportunity.category, "Vendor coordination", "Government response management"],
    subcontractor_categories: [
      opportunity.can_leverage_subcontractors ? "Specialized delivery subcontractor" : "",
      opportunity.can_leverage_suppliers ? "Local supplier" : "",
      "Proposal pricing"
    ].filter(Boolean),
    documents_needed: ["Capability statement", "Pricing worksheet", "Insurance requirements review", "Subcontractor or supplier quote if needed"],
    decision: assessment.tier === "Tier C" ? "pass" : "pursue",
    ai_review: {
      why: assessment.why_this_fits_valicia,
      risks: assessment.estimated_upfront_capital_required > 2000 ? ["Upfront capital may exceed the preferred limit."] : ["Validate payment timing and contract terms."],
      missing_requirements: ["Final solicitation document", "Insurance/bonding requirements", "Pricing worksheet"],
      recommended_next_action: assessment.recommended_action,
      suggested_subcontractor_categories: [
        opportunity.can_leverage_subcontractors ? "Specialized delivery subcontractor" : "",
        opportunity.can_leverage_suppliers ? "Supplier/vendor quote" : ""
      ].filter(Boolean)
    }
  });
}

/*
Government section implementation lives in src/sections/government.jsx and is
loaded through window.loadValiciaSection("government"). Keep this legacy copy
inactive so the section file remains the single live source of truth.
function GovernmentCenter({ page, governmentData, updateGovernmentData, saveGovernmentOpportunity, deleteGovernmentOpportunity, setPage }) {
  const selectedOpportunity = getSelectedOpportunity(governmentData);
  const selectOpportunity = id => updateGovernmentData({ ...governmentData, selectedOpportunityId: id });
  if (!selectedOpportunity && !["Opportunity Discovery", "Opportunities"].includes(page)) {
    return <MockWorkspace title={page} subtitle="Create or select a government opportunity first." items={[{ title: "No opportunity selected", detail: "Open Government Opportunities and add a persistent opportunity record.", status: "Empty" }]} />;
  }
  const updateOpportunity = updates => saveGovernmentOpportunity({ ...selectedOpportunity, ...updates }, selectedOpportunity.id);

  if (page === "Opportunity Discovery") return <OpportunityDiscovery governmentData={governmentData} saveGovernmentOpportunity={saveGovernmentOpportunity} setPage={setPage} />;
  if (page === "Opportunities") return <GovernmentOpportunities governmentData={governmentData} selectOpportunity={selectOpportunity} saveGovernmentOpportunity={saveGovernmentOpportunity} deleteGovernmentOpportunity={deleteGovernmentOpportunity} setPage={setPage} />;
  if (page === "Opportunity Detail") return <OpportunityDetail opportunity={selectedOpportunity} governmentData={governmentData} updateOpportunity={updateOpportunity} setPage={setPage} />;
  if (page === "AI Fit Review") return <AIFitReview opportunity={selectedOpportunity} updateOpportunity={updateOpportunity} setPage={setPage} />;
  if (page === "Subcontractor Finder") return <SubcontractorFinder governmentData={governmentData} updateGovernmentData={updateGovernmentData} selectedOpportunity={selectedOpportunity} setPage={setPage} />;
  if (page === "Outreach Tracker") return <OutreachTracker governmentData={governmentData} updateGovernmentData={updateGovernmentData} selectedOpportunity={selectedOpportunity} />;
  if (page === "Reminder Queue") return <ReminderQueue governmentData={governmentData} updateGovernmentData={updateGovernmentData} />;
  if (page === "Awards") return <AwardsTracker governmentData={governmentData} updateGovernmentData={updateGovernmentData} />;
  return <GovernmentOpportunities governmentData={governmentData} selectOpportunity={selectOpportunity} setPage={setPage} />;
}

function OpportunityDiscovery({ governmentData, saveGovernmentOpportunity, setPage }) {
  const [sourceFilter, setSourceFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [dueFilter, setDueFilter] = useState("All");
  const [archivedIds, setArchivedIds] = useState([]);
  const [ingestionResult, setIngestionResult] = useState(() => createOpportunityDiscoveryInitialResult());
  const [manualOpportunities, setManualOpportunities] = useState([]);
  const [manualForm, setManualForm] = useState(() => getInitialManualDiscoveryForm());
  const [manualFormError, setManualFormError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const automationResult = useMemo(() => runDailyOpportunityDiscoveryAutomation(governmentData, ingestionResult), [governmentData, ingestionResult]);
  const allDiscoveryOpportunities = useMemo(
    () => [...manualOpportunities, ...ingestionResult.opportunities],
    [manualOpportunities, ingestionResult.opportunities]
  );
  const reviewQueue = useMemo(() => createDiscoveryReviewQueue(allDiscoveryOpportunities, governmentData), [allDiscoveryOpportunities, governmentData]);
  const refreshOpportunities = async () => {
    setRefreshing(true);
    try {
      setIngestionResult(await runOpportunityDiscoveryIngestion());
    } catch {
      setIngestionResult(createOpportunityDiscoveryInitialResult());
    } finally {
      setRefreshing(false);
    }
  };
  const setManualField = (key, value) => {
    setManualForm({ ...manualForm, [key]: value });
    if (manualFormError) setManualFormError("");
  };
  const addManualOpportunity = event => {
    event.preventDefault();
    const required = ["title", "agency", "due_date", "opportunity_url", "source", "category", "description"];
    const missing = required.filter(key => !String(manualForm[key] || "").trim());
    if (missing.length) {
      setManualFormError(`Complete required field(s): ${missing.map(label).join(", ")}.`);
      return;
    }
    const manualOpportunity = createManualDiscoveryOpportunity(manualForm);
    setManualOpportunities([manualOpportunity, ...manualOpportunities]);
    setManualForm(getInitialManualDiscoveryForm());
  };
  const opportunities = allDiscoveryOpportunities
    .map(item => ({ ...item, assessment: assessDiscoveryOpportunity(item) }))
    .filter(item => !archivedIds.includes(item.id));
  const sources = ["All", ...Array.from(new Set([...opportunityDiscoverySources, ...manualOpportunities.map(item => item.source)].filter(Boolean)))];
  const categories = ["All", ...Array.from(new Set(opportunities.map(item => item.category)))];
  const dueMatches = item => {
    const days = daysUntil(item.due_date);
    if (dueFilter === "All") return true;
    if (dueFilter === "Next 14 days") return days !== null && days >= 0 && days <= 14;
    if (dueFilter === "Next 30 days") return days !== null && days >= 0 && days <= 30;
    return true;
  };
  const visible = opportunities
    .filter(item => sourceFilter === "All" || item.source === sourceFilter)
    .filter(item => categoryFilter === "All" || item.category === categoryFilter)
    .filter(item => tierFilter === "All" || item.assessment.tier === tierFilter)
    .filter(dueMatches)
    .sort((a, b) => {
      const tierWeight = tier => tier === "Tier A" ? 0 : tier === "Tier B" ? 1 : 2;
      return tierWeight(a.assessment.tier) - tierWeight(b.assessment.tier) || b.assessment.score - a.assessment.score;
    });
  const tierA = visible.filter(item => item.assessment.tier === "Tier A").length;
  const addToPipeline = async (item, status = "AI Review", nextPage = "Opportunities") => {
    await saveGovernmentOpportunity({ ...discoveryToGovernmentOpportunity(item), status });
    setPage(nextPage);
  };
  const archive = id => setArchivedIds([...archivedIds, id]);
  return (
    <>
      <Title title="Opportunity Discovery" subtitle="Capital-aware local and state opportunity shortlist for practical government pursuits." action={<button className="btn" onClick={refreshOpportunities}>{refreshing ? "Refreshing..." : "Refresh Opportunities"}</button>} />
      <div className="grid metrics">
        <Metric label="Curated opportunities" value={visible.length} />
        <Metric label="Tier A matches" value={tierA} />
        <Metric label="Capital target" value="$2,000" />
        <Metric label="Ingestion mode" value={ingestionResult.mode} />
      </div>
      <div className="card">
        <div className="panel-head"><h3>Daily automation</h3><span className="badge success">{automationResult.automationStatus}</span></div>
        <p className="muted">Last run: {automationResult.lastRun}. Scheduled automation uses live adapters only. Manual entries are real opportunities Valicia adds in this browser session and are scored in Top Matches for Review, but they are not invented by the daily script.</p>
        <div className="mini-metrics">
          <span><b>{automationResult.topMatches.length}</b><small>top matches</small></span>
          <span><b>{automationResult.newTierA.length}</b><small>new Tier A</small></span>
          <span><b>{manualOpportunities.length}</b><small>manual real entries</small></span>
        </div>
      </div>
      <div className="card">
        <div className="panel-head"><h3>Ingestion status</h3><span className="badge">{ingestionResult.connectionStatus}</span></div>
        <div className="grid three-col">
          {ingestionResult.sourceStatuses.map(source => <div className="info-block" key={source.id}>
            <h4>{source.name}</h4>
            <p><strong>{source.name}:</strong> {source.connectionStatus}</p>
            <p className="muted">{source.count} normalized opportunity record(s).</p>
          </div>)}
        </div>
        <p className="muted">Last checked: {ingestionResult.lastChecked}. {ingestionResult.connectionStatus}</p>
      </div>
      <OpportunityIntakePanel onAdd={opp => setManualOpportunities([opp, ...manualOpportunities])} />
      <div className="card form">
        <div className="panel-head"><h3>Manual Add Opportunity</h3><span className="badge success">Manual Entry {"\u2014"} Real Opportunity</span></div>
        <p className="muted">Use this for real notices copied from blocked portals, DIBBS, SAM.gov, Alabama Buys, City or County portals, emails, PDFs, or vendor portals. Entries are local to this app session until database persistence is added.</p>
        <form onSubmit={addManualOpportunity}>
          <div className="grid three-col">
            <label>Title<input required value={manualForm.title} onChange={e => setManualField("title", e.target.value)} /></label>
            <label>Agency<input required value={manualForm.agency} onChange={e => setManualField("agency", e.target.value)} /></label>
            <label>Due date<input required type="date" value={manualForm.due_date} onChange={e => setManualField("due_date", e.target.value)} /></label>
            <label>Opportunity URL<input required type="url" value={manualForm.opportunity_url} onChange={e => setManualField("opportunity_url", e.target.value)} /></label>
            <label>Source<input required value={manualForm.source} onChange={e => setManualField("source", e.target.value)} placeholder="SAM.gov, DIBBS, Alabama Buys..." /></label>
            <label>Category<input required value={manualForm.category} onChange={e => setManualField("category", e.target.value)} placeholder="Admin services, supplies..." /></label>
            <label>Estimated value<input type="number" min="0" value={manualForm.estimated_value} onChange={e => setManualField("estimated_value", e.target.value)} /></label>
            <label>Portal/login needed<select value={manualForm.portal_login_needed} onChange={e => setManualField("portal_login_needed", e.target.value)}>{["unknown", "yes", "no"].map(option => <option key={option}>{option}</option>)}</select></label>
            <label>Source type<select value={manualForm.source_type} onChange={e => setManualField("source_type", e.target.value)}>{["manual", "live", "credentialed portal", "email/PDF"].map(option => <option key={option}>{option}</option>)}</select></label>
            <label>Document link<input value={manualForm.document_link} onChange={e => setManualField("document_link", e.target.value)} placeholder="PDF or shared document URL" /></label>
          </div>
          <label>Description<textarea required rows="4" value={manualForm.description} onChange={e => setManualField("description", e.target.value)} /></label>
          <label>Notes<textarea rows="3" value={manualForm.notes} onChange={e => setManualField("notes", e.target.value)} placeholder="Bid details, login notes, quote needs, or why this looks practical." /></label>
          {manualFormError && <p className="badge danger">{manualFormError}</p>}
          <div className="actions"><button className="btn" type="submit">Add Real Opportunity</button></div>
        </form>
      </div>
      <div className="card toolbar filter-bar">
        <label>Source<select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>{sources.map(source => <option key={source}>{source}</option>)}</select></label>
        <label>Category<select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>{categories.map(category => <option key={category}>{category}</option>)}</select></label>
        <label>Tier<select value={tierFilter} onChange={e => setTierFilter(e.target.value)}>{["All", "Tier A", "Tier B", "Tier C"].map(tier => <option key={tier}>{tier}</option>)}</select></label>
        <label>Due date<select value={dueFilter} onChange={e => setDueFilter(e.target.value)}>{["All", "Next 14 days", "Next 30 days"].map(option => <option key={option}>{option}</option>)}</select></label>
      </div>
      <div className="card">
        <div className="panel-head"><h3>Top Matches for Review</h3><span className="badge">{reviewQueue.length} queued</span></div>
        <div className="activity compact">
          {reviewQueue.map(item => <div key={item.id}>
            <strong>{item.title}</strong>
            <span className="muted">{item.agency} - {item.tier} - {item.score} score - due {item.due_date || "TBD"}</span>
            <span className="muted">{item.source_label}</span>
            <span className={item.priority === "High" ? "badge success" : "badge"}>{item.status}{item.priority === "High" ? " - New Tier A" : ""}</span>
          </div>)}
          {!reviewQueue.length && <p className="muted">No live opportunities found from connected sources yet. Add a real opportunity manually if a portal is blocked or credentialed.</p>}
        </div>
      </div>
      <div className="grid two-col">
        {visible.map(item => {
          const assessment = item.assessment;
          const tierClass = assessment.tier === "Tier A" ? "badge success" : assessment.tier === "Tier B" ? "badge warn" : "badge danger";
          return <div className="card action-card form" key={item.id}>
            <div className="panel-head"><h3>{item.title}</h3><span className={tierClass}>{assessment.tier}</span></div>
            <p><strong>{item.agency}</strong> - {item.source}</p>
            <p><span className="badge success">{item.source_label || "Live Source"}</span> <span className="muted">{item.source} - found {item.date_found} - {item.category} - <a href={item.opportunity_url} target="_blank" rel="noreferrer">Opportunity URL</a></span></p>
            {item.document_link && <p className="muted">Document: <a href={item.document_link} target="_blank" rel="noreferrer">Open document</a></p>}
            {item.portal_login_needed !== "unknown" && <p className="muted">Portal/login needed: {item.portal_login_needed}</p>}
            <p>{item.description}</p>
            {item.notes && <p className="muted"><strong>Notes:</strong> {item.notes}</p>}
            <div className="mini-metrics">
              <span><b>{assessment.score}</b><small>capital fit score</small></span>
              <span><b>{amount(assessment.estimated_upfront_capital_required)}</b><small>upfront capital</small></span>
              <span><b>{item.due_date || "TBD"}</b><small>{dueLabel(item.due_date)}</small></span>
              <span><b>{item.estimated_value ? amount(item.estimated_value) : "TBD"}</b><small>estimated value</small></span>
            </div>
            <InfoBlock title="Why This Fits Valicia" text={assessment.why_this_fits_valicia} />
            <div className="info-block">
              <h4>AI assessment</h4>
              <p><strong>Complexity:</strong> {assessment.complexity}</p>
              <p><strong>Staffing:</strong> {assessment.staffing_needs}</p>
              <p><strong>Equipment:</strong> {assessment.equipment_needs}</p>
              <p><strong>Supplies:</strong> {assessment.supply_needs}</p>
              <p><strong>Subcontracting:</strong> {assessment.likelihood_of_subcontracting} - <strong>Supplier use:</strong> {assessment.likelihood_of_supplier_use}</p>
              <p><strong>Recommended action:</strong> {assessment.recommended_action}</p>
            </div>
            <div className="actions">
              <button className="btn secondary" onClick={() => addToPipeline(item, "AI Review", "Opportunity Detail")}>Review Opportunity</button>
              <button className="btn secondary" onClick={() => addToPipeline(item, "AI Review", "Opportunities")}>Add to Pipeline</button>
              <button className="btn secondary" onClick={() => addToPipeline(item, "Subcontractors", "Subcontractor Finder")}>Find Subcontractors</button>
              <button className="btn secondary" onClick={() => archive(item.id)}>Archive</button>
            </div>
          </div>;
        })}
        {!visible.length && <div className="card"><p className="muted">No live opportunities found from connected sources yet.</p></div>}
      </div>
      <div className="card">
        <div className="panel-head"><h3>Future ingestion placeholders</h3><span className="badge">Live-only dashboard</span></div>
        <p className="muted">Normal Opportunity Discovery shows live records only. Developer/test mock data remains available through `createDeveloperTestOpportunityDiscoveryResult`, but mock rows are not displayed in the dashboard or written by daily automation.</p>
      </div>
    </>
  );
}

function OpportunityIntakePanel({ onAdd }) {
  const MAX_TEXT_CHARS = 6000;
  const MAX_FILE_BYTES = 2 * 1024 * 1024;
  const RAW_SCAN_LIMIT = 80000;

  const [intakeTab,   setIntakeTab]   = useState("text");
  const [intakeText,  setIntakeText]  = useState("");
  const [intakeUrl,   setIntakeUrl]   = useState("");
  const [fileStatus,  setFileStatus]  = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [editForm,    setEditForm]    = useState(null);
  const [intakeErr,   setIntakeErr]   = useState("");
  const [intakeSaved, setIntakeSaved] = useState(false);
  // Computed once on Extract click — never on every keystroke
  const [fulfillment,  setFulfillment]  = useState([]);
  const [searchTerms,  setSearchTerms]  = useState([]);

  const readFile = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileStatus("File exceeds 2 MB — paste the solicitation text instead.");
      return;
    }
    setFileLoading(true);
    setFileStatus("Reading " + file.name + "...");
    setIntakeErr("");
    const reader = new FileReader();
    reader.onload = evt => {
      const raw = String(evt.target.result || "").slice(0, RAW_SCAN_LIMIT);
      const printable = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/ {3,}/g, " ").trim();
      setFileLoading(false);
      if (printable.length < 40) {
        setFileStatus(file.name + " — binary PDF with minimal readable text. Paste the solicitation text manually.");
        setIntakeText("");
      } else {
        setFileStatus(file.name + " — " + printable.length + " readable characters extracted.");
        setIntakeText(printable.slice(0, MAX_TEXT_CHARS));
      }
    };
    reader.onerror = () => { setFileLoading(false); setFileStatus("Could not read file. Paste the solicitation text instead."); };
    reader.readAsText(file, "utf-8");
  };

  const handleExtract = () => {
    const text = intakeText.trim().slice(0, MAX_TEXT_CHARS);
    const url  = intakeUrl.trim();
    if (!text && !url) { setIntakeErr("Paste solicitation text, a URL, or upload a file first."); return; }
    const parsed = parseOpportunityText(text, url);
    let sourceGuess = "Pasted text";
    if (url) { try { sourceGuess = new URL(url.startsWith("http") ? url : "https://" + url).hostname.replace("www.", ""); } catch { sourceGuess = "URL"; } }
    const form = {
      title: parsed.title || "", agency: parsed.agency || "", due_date: parsed.due_date || "",
      opportunity_url: url || parsed.source_url || "", source: sourceGuess, category: "",
      description: (parsed.description || text).slice(0, 500),
      estimated_value: parsed.estimated_value || "", portal_login_needed: "unknown",
      document_link: "", notes: (parsed.notes || "").slice(0, 220),
      source_type: url ? "url" : "email/PDF"
    };
    setEditForm(form);
    setIntakeErr("");
    setIntakeSaved(false);
    setFulfillment(suggestFulfillmentPartners(text || form.description, form.category));
    setSearchTerms(generateIntakeSearchTerms(form.title, form.agency, form.category, text));
  };

  const setField = (k, v) => setEditForm(prev => ({ ...prev, [k]: v }));

  const handleAdd = () => {
    const required = ["title", "agency", "source", "category", "description"];
    const missing  = required.filter(k => !String(editForm[k] || "").trim());
    if (missing.length) { setIntakeErr("Complete required field(s): " + missing.map(label).join(", ") + "."); return; }
    onAdd(createManualDiscoveryOpportunity({ ...editForm }));
    setIntakeSaved(true);
    setIntakeText(""); setIntakeUrl(""); setEditForm(null);
    setFulfillment([]); setSearchTerms([]);
    setFileStatus(""); setIntakeErr("");
  };

  const handleClear = () => { setEditForm(null); setFulfillment([]); setSearchTerms([]); setIntakeSaved(false); setIntakeErr(""); };

  return (
    <div className="card form">
      <div className="panel-head"><h3>AI-Assisted Opportunity Intake</h3><span className="badge success">Smart Prefill</span></div>
      <p className="muted">Paste a URL, upload a PDF or text file, or paste solicitation text — fields will be pre-populated for review before saving. Text is capped at 6,000 characters and files at 2 MB.</p>
      {intakeSaved && <p className="badge success">Opportunity added to Discovery. See it in Top Matches for Review below.</p>}
      <div className="tabs">
        {[["text","Paste Text"],["url","Paste URL"],["file","Upload PDF / Doc"]].map(([v,lbl]) =>
          <button key={v} className={intakeTab===v?"active":""} onClick={()=>{setIntakeTab(v);setIntakeErr("");}}>{lbl}</button>
        )}
      </div>
      {intakeTab==="text" && <label>Solicitation text<textarea rows="6" value={intakeText} onChange={e=>setIntakeText(e.target.value.slice(0,MAX_TEXT_CHARS))} placeholder="Paste the full solicitation, bid notice, email body, or opportunity description here..." /></label>}
      {intakeTab==="url" && <><label>Opportunity URL<input value={intakeUrl} onChange={e=>setIntakeUrl(e.target.value)} placeholder="https://sam.gov/opp/..." /></label><label>Solicitation text (paste manually if the portal requires a login)<textarea rows="5" value={intakeText} onChange={e=>setIntakeText(e.target.value.slice(0,MAX_TEXT_CHARS))} placeholder="Paste opportunity text here. Live scraping is not available for credentialed portals." /></label></>}
      {intakeTab==="file" && <><label>Upload PDF or text file (max 2 MB)<input type="file" accept=".pdf,.txt,.doc,.docx,.rtf,.md" onChange={readFile} disabled={fileLoading} /></label>{fileLoading && <p className="muted">Reading file — please wait...</p>}{!fileLoading && fileStatus && <p className="muted">{fileStatus}</p>}<label>Extracted or additional text<textarea rows="4" value={intakeText} onChange={e=>setIntakeText(e.target.value.slice(0,MAX_TEXT_CHARS))} placeholder="Extracted text appears here. Edit or add more context before extracting fields." /></label></>}
      {intakeErr && !editForm && <p className="badge danger">{intakeErr}</p>}
      <div className="actions">
        <button className="btn" onClick={handleExtract} disabled={fileLoading}>Extract &amp; Prefill Fields</button>
        {editForm && <button className="btn secondary" onClick={handleClear}>Clear</button>}
      </div>
      {editForm && <>
        <hr />
        <h4>Review &amp; Edit Before Saving</h4>
        <p className="muted">Fields have been pre-populated. Correct anything that looks wrong, fill in Category, then save.</p>
        <div className="grid three-col">
          <label>Title *<input value={editForm.title} onChange={e=>setField("title",e.target.value)} /></label>
          <label>Agency *<input value={editForm.agency} onChange={e=>setField("agency",e.target.value)} /></label>
          <label>Due date<input type="date" value={editForm.due_date} onChange={e=>setField("due_date",e.target.value)} /></label>
          <label>Opportunity URL<input value={editForm.opportunity_url} onChange={e=>setField("opportunity_url",e.target.value)} /></label>
          <label>Source *<input value={editForm.source} onChange={e=>setField("source",e.target.value)} placeholder="SAM.gov, Alabama Buys..." /></label>
          <label>Category *<input value={editForm.category} onChange={e=>setField("category",e.target.value)} placeholder="Admin services, supplies, training..." /></label>
          <label>Estimated value<input type="number" min="0" value={editForm.estimated_value} onChange={e=>setField("estimated_value",e.target.value)} /></label>
          <label>Portal/login needed<select value={editForm.portal_login_needed} onChange={e=>setField("portal_login_needed",e.target.value)}>{["unknown","yes","no"].map(o=><option key={o}>{o}</option>)}</select></label>
          <label>Document link<input value={editForm.document_link} onChange={e=>setField("document_link",e.target.value)} placeholder="PDF or shared doc URL" /></label>
        </div>
        <label>Description *<textarea rows="4" value={editForm.description} onChange={e=>setField("description",e.target.value)} /></label>
        <label>Notes<textarea rows="3" value={editForm.notes} onChange={e=>setField("notes",e.target.value)} placeholder="Bid details, login notes, quote needs, why this looks practical." /></label>
        {intakeErr && <p className="badge danger">{intakeErr}</p>}
        <div className="actions"><button className="btn" onClick={handleAdd}>Add to Discovery</button></div>
        {fulfillment.length>0 && <div className="info-block"><h4>Fulfillment Suggestions</h4><p className="muted">Consider finding these types of partners before bidding:</p>{fulfillment.map(s=><div key={s.role} style={{marginBottom:".5rem"}}><strong>{s.role}:</strong> {s.reason}<br /><span className="muted">Search: <em>{s.search}</em></span></div>)}</div>}
        {searchTerms.length>0 && <div className="info-block"><h4>Suggested Search Terms</h4><p className="muted">Use these to find suppliers, subcontractors, and teaming partners online:</p><div style={{display:"flex",flexWrap:"wrap",gap:".4rem",marginTop:".5rem"}}>{searchTerms.map(term=><span key={term} className="badge">{term}</span>)}</div></div>}
      </>}
    </div>
  );
}

function GovernmentOpportunities({ governmentData, selectOpportunity, saveGovernmentOpportunity, deleteGovernmentOpportunity, setPage }) {
  const stats = getGovernmentStats(governmentData);
  const [statusFilter, setStatusFilter] = useState("All");
  const [highFitOnly, setHighFitOnly] = useState(false);
  const [dueSoonOnly, setDueSoonOnly] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const statuses = ["All", "New", "AI Review", "Subcontractors", "Outreach", "Proposal", "Submitted", "Pending Award", "Awarded", "Lost", "Cancelled", "Withdrawn"];
  const visible = governmentData.opportunities.filter(item => {
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesHighFit = !highFitOnly || Number(item.ai_fit_score ?? item.fit_score ?? 0) > 80;
    const days = daysUntil(item.due_date);
    const matchesDueSoon = !dueSoonOnly || (days !== null && days >= 0 && days <= 14);
    return matchesStatus && matchesHighFit && matchesDueSoon;
  });
  const go = (item, nextPage) => {
    selectOpportunity(item.id);
    setPage(nextPage);
  };
  return (
    <>
      <Title title="Government Opportunities" subtitle="Move from opportunity scan to AI review, subcontractor outreach, reminders, and award tracking." action={<div className="actions"><button className="btn secondary" onClick={() => setImportOpen(true)}>Import Opportunity</button><button className="btn" onClick={() => setEditing({})}>Add Opportunity</button></div>} />
      <div className="grid metrics">
        <Metric label="Opportunities" value={stats.opportunities} />
        <Metric label="Pending awards" value={stats.pendingAwards} />
        <Metric label="Contracts won" value={stats.contractsWon} />
        <Metric label="Contracts lost" value={stats.contractsLost} />
        <Metric label="Win rate" value={`${stats.winRate}%`} />
        <Metric label="Total pipeline value" value={amount(stats.pipelineValue)} />
        <Metric label="Total awarded value" value={amount(stats.totalAwardedValue)} />
      </div>
      <div className="card">
        <div className="toolbar filter-bar">
          <label>Status<select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
          <label className="inline-check"><input type="checkbox" checked={highFitOnly} onChange={e => setHighFitOnly(e.target.checked)} /> High Fit &gt; 80%</label>
          <label className="inline-check"><input type="checkbox" checked={dueSoonOnly} onChange={e => setDueSoonOnly(e.target.checked)} /> Due Soon</label>
          <span className="mode">{visible.length} shown</span>
        </div>
        <div className="table-wrap opportunities-table"><table><thead><tr>{["title", "agency", "due_date", "estimated_value", "ai_fit_score", "status", "next_action"].map(c => <th key={c}>{label(c)}</th>)}<th>Actions</th></tr></thead><tbody>
          {visible.map(item => <tr key={item.id}>
            <td><strong>{item.title}</strong><span className="muted table-subline">{item.solicitation_number} - NAICS {item.naics} - {item.set_aside}</span></td><td>{item.agency}</td><td>{item.due_date}<br /><span className="muted">{dueLabel(item.due_date)}</span></td><td>{amount(item.estimated_value)}</td><td><span className={Number(item.ai_fit_score ?? item.fit_score ?? 0) > 80 ? "badge success" : "badge"}>{item.ai_fit_score ?? item.fit_score}%</span></td><td><span className="badge warn">{item.status}</span></td><td>{item.next_action}</td>
            <td><div className="row-actions">
              <button className="btn secondary" onClick={() => go(item, "Opportunity Detail")}>View Detail</button>
              <button className="btn secondary" onClick={() => go(item, "AI Fit Review")}>AI Review</button>
              <button className="btn secondary" onClick={() => go(item, "Subcontractor Finder")}>Find Subs</button>
              <button className="btn secondary" onClick={() => go(item, "Outreach Tracker")}>Draft Outreach</button>
              <button className="btn secondary" onClick={() => setEditing(item)}>Edit</button>
              <button className="btn secondary" onClick={() => deleteGovernmentOpportunity(item.id)}>Delete</button>
            </div></td>
          </tr>)}
          {!visible.length && <tr><td colSpan="8" className="muted">{governmentData.opportunities.length ? "No opportunities match these filters." : "No saved government opportunities yet. Use Opportunity Discovery, Import Opportunity, or Add Opportunity to add a real record."}</td></tr>}
        </tbody></table></div>
      </div>
      {editing && <GovernmentOpportunityModal
        record={editing.id ? editing : null}
        onClose={() => setEditing(null)}
        onSave={async values => {
          await saveGovernmentOpportunity(values, editing.id);
          setEditing(null);
        }}
      />}
      {importOpen && <GovernmentOpportunityImportModal
        onClose={() => setImportOpen(false)}
        onImport={async values => {
          const imported = parseOpportunityText(values.text, values.url);
          const manualValues = Object.fromEntries(Object.entries(values.manual || {}).filter(([, value]) => value !== "" && value !== null && value !== undefined));
          const finalRecord = normalizeGovernmentOpportunity({ ...imported, ...manualValues, source_url: values.url || values.manual.source_url || imported.source_url });
          await saveGovernmentOpportunity(finalRecord);
          setImportOpen(false);
        }}
      />}
    </>
  );
}

function GovernmentOpportunityImportModal({ onImport, onClose }) {
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [manualState, setManualState] = useState({ title: "", agency: "", solicitation_number: "", naics: "", set_aside: "", due_date: "", estimated_value: 0, source_url: "", notes: "" });
  const activeManual = manualState;
  return <div className="modal-backdrop"><div className="modal">
    <h3>Import Opportunity</h3>
    <div className="tabs">
      {[["text", "Paste text"], ["url", "Paste URL"], ["manual", "Manual entry"]].map(([value, labelText]) => <button key={value} className={mode === value ? "active" : ""} onClick={() => setMode(value)}>{labelText}</button>)}
    </div>
    <div className="form form-grid">
      {mode === "text" && <label>Opportunity text<textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste the solicitation, email, or opportunity description here..." /></label>}
      {mode === "url" && <>
        <label>Opportunity URL<input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." /></label>
        <label>Opportunity text<textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste opportunity text manually. Live scraping is not enabled yet." /></label>
      </>}
      {mode === "manual" && ["title", "agency", "solicitation_number", "naics", "set_aside", "due_date", "estimated_value", "source_url", "notes"].map(key => <label key={key}>{label(key)}
        {key === "notes" ? <textarea value={activeManual[key] || ""} onChange={e => setManualState({ ...activeManual, [key]: e.target.value })} /> :
        <input type={key === "due_date" ? "date" : key === "estimated_value" ? "number" : "text"} value={activeManual[key] || ""} onChange={e => setManualState({ ...activeManual, [key]: key === "estimated_value" ? Number(e.target.value || 0) : e.target.value })} />}
      </label>)}
    </div>
    <div className="actions"><button className="btn secondary" onClick={onClose}>Cancel</button><button className="btn" onClick={() => onImport({ text, url, manual: activeManual })}>Save imported opportunity</button></div>
  </div></div>;
}

function GovernmentOpportunityModal({ record, onSave, onClose }) {
  const [form, setForm] = useState(normalizeGovernmentOpportunity(record || { status: "New" }));
  const set = (key, value) => setForm({ ...form, [key]: value });
  const fields = [
    ["title", "Title"],
    ["agency", "Agency"],
    ["solicitation_number", "Solicitation number"],
    ["naics", "NAICS"],
    ["set_aside", "Set-aside"],
    ["due_date", "Due date", "date"],
    ["estimated_value", "Estimated value", "number"],
    ["source_url", "Source URL"],
    ["ai_fit_score", "AI fit score", "number"],
    ["status", "Status", "select", ["New", "AI Review", "Subcontractors", "Outreach", "Proposal", "Submitted", "Pending Award", "Awarded", "Lost", "Cancelled", "Withdrawn"]],
    ["next_action", "Next action"],
    ["notes", "Notes", "textarea"]
  ];
  return <div className="modal-backdrop"><div className="modal">
    <h3>{record ? "Edit" : "Add"} Government Opportunity</h3>
    <div className="form form-grid">
      {fields.map(([key, name, type = "text", options]) => <label key={key}>{name}
        {type === "textarea" ? <textarea value={form[key] || ""} onChange={e => set(key, e.target.value)} /> :
        type === "select" ? <select value={form[key] || options[0]} onChange={e => set(key, e.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select> :
        <input type={type} value={form[key] || ""} onChange={e => set(key, type === "number" ? Number(e.target.value || 0) : e.target.value)} />}
      </label>)}
    </div>
    <div className="actions"><button className="btn secondary" onClick={onClose}>Cancel</button><button className="btn" onClick={() => onSave(form)}>Save opportunity</button></div>
  </div></div>;
}

function OpportunityDetail({ opportunity, governmentData, updateOpportunity, setPage }) {
  const [form, setForm] = useState(opportunity);
  useEffect(() => setForm(opportunity), [opportunity.id]);
  const set = (key, value) => setForm({ ...form, [key]: value });
  const outreachRows = governmentData.outreach.filter(item => item.opportunity_id === opportunity.id);
  const reminderRows = (governmentData.reminders || []).map(normalizeGovernmentReminder).filter(item => item.opportunity_id === opportunity.id);
  const timeline = getOpportunityTimeline(opportunity, governmentData);
  const selectedPartners = outreachRows.filter(row => ["Interested", "Quote Requested", "Quote Received", "Partner Selected"].includes(normalizeOutreachStatus(row.status)));
  return (
    <>
      <Title title="Opportunity Detail" subtitle={`${opportunity.title} - ${opportunity.agency}`} action={<button className="btn" onClick={() => setPage("AI Fit Review")}>Open AI fit review</button>} />
      <div className="grid metrics">
        <Metric label="AI fit score" value={`${form.ai_fit_score ?? form.fit_score}%`} />
        <Metric label="Estimated value" value={amount(form.estimated_value)} />
        <Metric label="Proposal countdown" value={dueLabel(form.due_date)} />
        <Metric label="Status" value={form.status} />
      </div>
      <div className="grid two-col">
        <div className="card form">
          <div className="panel-head"><h3>Opportunity Data</h3><span className="badge">{form.status}</span></div>
          {["title", "agency", "solicitation_number", "naics", "set_aside", "due_date", "estimated_value", "source_url", "ai_fit_score", "status", "next_action", "notes"].map(key => (
            <label key={key}>{label(key)}
              {key === "notes" ? <textarea value={form[key] || ""} onChange={e => set(key, e.target.value)} /> :
              key === "status" ? <select value={form.status || "New"} onChange={e => set("status", e.target.value)}>{["New", "AI Review", "Subcontractors", "Outreach", "Proposal", "Submitted", "Pending Award", "Awarded", "Lost", "Cancelled", "Withdrawn"].map(item => <option key={item}>{item}</option>)}</select> :
              <input type={["estimated_value", "ai_fit_score"].includes(key) ? "number" : key === "due_date" ? "date" : "text"} value={form[key] || ""} onChange={e => set(key, ["estimated_value", "ai_fit_score"].includes(key) ? Number(e.target.value || 0) : e.target.value)} />}
            </label>
          ))}
          <div className="actions"><button className="btn" onClick={() => updateOpportunity(form)}>Save opportunity</button></div>
        </div>
        <div className="card form">
          <h3>Contract Detail</h3>
          <label>PWS summary<textarea value={form.pws_summary || ""} onChange={e => set("pws_summary", e.target.value)} /></label>
          <label>AI executive summary<textarea value={form.ai_executive_summary || ""} onChange={e => set("ai_executive_summary", e.target.value)} /></label>
          <label>Scope of work<textarea value={form.scope_of_work || ""} onChange={e => set("scope_of_work", e.target.value)} /></label>
          <label>Deliverables<textarea value={arrayToLines(form.deliverables)} onChange={e => set("deliverables", linesToArray(e.target.value))} /></label>
          <label>Risks<textarea value={arrayToLines(form.risks)} onChange={e => set("risks", linesToArray(e.target.value))} /></label>
          <label>Required capabilities<textarea value={arrayToLines(form.required_capabilities)} onChange={e => set("required_capabilities", linesToArray(e.target.value))} /></label>
          <div className="actions"><button className="btn" onClick={() => updateOpportunity(form)}>Save contract detail</button></div>
        </div>
      </div>
      <div className="card">
        <div className="panel-head"><h3>Attached Subcontractors & Outreach History</h3><button className="btn secondary" onClick={() => setPage("Outreach Tracker")}>Open Outreach Tracker</button></div>
        <div className="table-wrap"><table><thead><tr>{["company", "capability", "status", "date_created", "last_contact_date", "next_follow_up_date", "response_summary", "notes"].map(c => <th key={c}>{label(c)}</th>)}</tr></thead><tbody>
          {outreachRows.map(row => {
            const sub = getSubcontractor(governmentData, row.subcontractor_id);
            return <tr key={row.id}><td><strong>{sub?.company_name || "Subcontractor"}</strong></td><td>{sub?.service_category || ""}</td><td><span className="badge">{normalizeOutreachStatus(row.status)}</span></td><td>{row.created_at || ""}</td><td>{row.last_contact_date || ""}</td><td>{row.follow_up_date || ""}</td><td>{row.response_summary || ""}</td><td>{row.notes || ""}</td></tr>;
          })}
          {!outreachRows.length && <tr><td colSpan="8" className="muted">No subcontractors attached yet.</td></tr>}
        </tbody></table></div>
      </div>
      <div className="card">
        <div className="panel-head"><h3>Opportunity Reminders</h3><button className="btn secondary" onClick={() => setPage("Reminder Queue")}>Open Reminder Queue</button></div>
        <div className="table-wrap"><table><thead><tr>{["type", "related_subcontractor", "due_date", "priority", "status", "notes"].map(c => <th key={c}>{label(c)}</th>)}</tr></thead><tbody>
          {reminderRows.map(row => {
            const sub = getSubcontractor(governmentData, row.subcontractor_id);
            return <tr key={row.id}><td><strong>{row.type}</strong></td><td>{sub?.company_name || "None"}</td><td>{row.due_date}<br /><span className="muted">{dueLabel(row.due_date)}</span></td><td><span className={row.priority === "Urgent" ? "badge warn" : "badge"}>{row.priority}</span></td><td><span className="badge">{row.status}</span></td><td>{row.notes}</td></tr>;
          })}
          {!reminderRows.length && <tr><td colSpan="6" className="muted">No reminders created for this opportunity yet.</td></tr>}
        </tbody></table></div>
      </div>
      <div className="grid two-col">
        <div className="card">
          <div className="panel-head"><h3>Lifecycle Timeline</h3><span className="badge">{normalizeAwardOutcome(opportunity.award_outcome, opportunity).award_status}</span></div>
          <div className="activity">
            {timeline.map(item => <div key={item.title}><strong>{item.title}</strong><span className="muted">{item.detail || "No detail yet."}</span><span className={item.status === "Complete" ? "badge success" : "badge"}>{item.status}</span></div>)}
          </div>
        </div>
        <div className="card">
          <div className="panel-head"><h3>Selected Partners</h3><button className="btn secondary" onClick={() => setPage("Awards")}>Open Award Tracking</button></div>
          <div className="activity">
            {selectedPartners.map(row => {
              const sub = getSubcontractor(governmentData, row.subcontractor_id);
              return <div key={row.id}><strong>{sub?.company_name || "Subcontractor"}</strong><span className="muted">{normalizeOutreachStatus(row.status)} - {row.notes || "No notes yet."}</span></div>;
            })}
            {!selectedPartners.length && <p className="muted">No selected or interested partners yet.</p>}
          </div>
        </div>
      </div>
    </>
  );
}

function AIFitReview({ opportunity, updateOpportunity, setPage }) {
  const [review, setReview] = useState({ ...generateAIFitAnalysis(opportunity), ...(opportunity.ai_review || {}) });
  useEffect(() => setReview({ ...generateAIFitAnalysis(opportunity), ...(opportunity.ai_review || {}) }), [opportunity.id]);
  const generate = () => {
    const nextReview = generateAIFitAnalysis(opportunity);
    setReview(nextReview);
    updateOpportunity({
      ai_review: nextReview,
      ai_fit_score: nextReview.overall_fit_score,
      status: "AI Review",
      summary: nextReview.summary,
      ai_executive_summary: nextReview.why,
      subcontractor_categories: nextReview.suggested_subcontractor_categories,
      documents_needed: nextReview.missing_requirements,
      risks: nextReview.risks,
      next_action: nextReview.recommended_next_action
    });
  };
  return (
    <>
      <Title title="AI Fit Review" subtitle="Capital-aware fit analysis for deciding whether to pursue, pass, or partner." action={<div className="actions"><button className="btn secondary" onClick={generate}>Generate AI Review</button><button className="btn" onClick={() => setPage("Subcontractor Finder")}>Find subcontractors</button></div>} />
      <div className="grid metrics">
        <Metric label="Overall fit score" value={`${review.overall_fit_score ?? opportunity.ai_fit_score ?? opportunity.fit_score}%`} />
        <Metric label="Prime vs subcontract" value={review.prime_vs_subcontract} />
        <Metric label="Due date" value={opportunity.due_date} />
        <Metric label="Value" value={amount(opportunity.estimated_value)} />
      </div>
      <div className="grid two-col">
        <div className="card">
          <InfoBlock title="Fit analysis" text={review.why} />
          <InfoBlock title="HR capability alignment" text={review.hr_capability_alignment} />
          <InfoBlock title="Government capability alignment" text={review.government_capability_alignment} />
          <InfoBlock title="NAICS alignment" text={review.naics_alignment} />
          <InfoBlock title="Recommended next action" text={review.recommended_next_action} />
        </div>
        <div className="card">
          <InfoList title="Capability gaps" items={review.capability_gaps} />
          <InfoList title="Risks" items={review.risks} />
          <InfoList title="Missing requirements" items={review.missing_requirements} />
          <InfoList title="Suggested subcontractor categories" items={review.suggested_subcontractor_categories} />
        </div>
      </div>
    </>
  );
}

function SubcontractorFinder({ governmentData, updateGovernmentData, selectedOpportunity, setPage }) {
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState(normalizeGovernmentSubcontractor({ status: "not contacted", sam_registration_status: "unknown" }));
  const neededCategories = selectedOpportunity.subcontractor_categories?.length
    ? selectedOpportunity.subcontractor_categories
    : generateAIFitAnalysis(selectedOpportunity).suggested_subcontractor_categories;
  const matchScore = item => neededCategories.some(category =>
    `${item.service_category} ${item.notes}`.toLowerCase().includes(String(category).toLowerCase())
  ) ? 1 : 0;
  const visible = governmentData.subcontractors
    .filter(item => JSON.stringify(item).toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => matchScore(b) - matchScore(a));
  const selectedOutreach = governmentData.outreach.filter(item => item.opportunity_id === selectedOpportunity.id);
  const attachedIds = new Set(selectedOutreach.map(item => item.subcontractor_id));
  const updateForm = updates => setForm(normalizeGovernmentSubcontractor({ ...form, ...updates }));
  const patchSubcontractor = (id, updates) => updateGovernmentData({
    ...governmentData,
    subcontractors: governmentData.subcontractors.map(item => item.id === id ? normalizeGovernmentSubcontractor({ ...item, ...updates }) : item)
  });
  const addSubcontractor = () => {
    if (!form.company_name.trim()) return;
    const record = normalizeGovernmentSubcontractor({ ...form, id: uid("sub"), created_at: today, updated_at: today });
    updateGovernmentData({ ...governmentData, subcontractors: [record, ...governmentData.subcontractors] });
    setForm(normalizeGovernmentSubcontractor({ status: "not contacted", sam_registration_status: "unknown" }));
  };
  const attachToOutreach = subcontractorId => {
    const exists = governmentData.outreach.some(item => item.opportunity_id === selectedOpportunity.id && item.subcontractor_id === subcontractorId);
    if (exists) {
      setPage("Outreach Tracker");
      return;
    }
    updateGovernmentData({
      ...governmentData,
      outreach: [createOutreachRecord(selectedOpportunity.id, subcontractorId, `Matched from subcontractor needs: ${neededCategories.join(", ")}`), ...governmentData.outreach]
    });
    setPage("Outreach Tracker");
  };
  return (
    <>
      <Title title="Subcontractor Finder" subtitle={`Subcontractor CRM for ${selectedOpportunity.title}.`} action={<button className="btn" onClick={() => setPage("Outreach Tracker")}>Open outreach</button>} />
      <div className="card">
        <div className="panel-head"><h3>Subcontractor Needs</h3><span className="mode">{selectedOutreach.length} attached</span></div>
        <div className="tabs section-tabs">{neededCategories.map(category => <button key={category} className="active" onClick={() => setFilter(category)}>{category}</button>)}</div>
      </div>
      <div className="card form">
        <div className="panel-head"><h3>Add subcontractor</h3><span className="badge">Prime contractor CRM</span></div>
        <div className="form-grid">
          <label>Company name<input value={form.company_name} onChange={e => updateForm({ company_name: e.target.value })} /></label>
          <label>Contact name<input value={form.contact_name} onChange={e => updateForm({ contact_name: e.target.value })} /></label>
          <label>Email<input type="email" value={form.email} onChange={e => updateForm({ email: e.target.value })} /></label>
          <label>Phone<input value={form.phone} onChange={e => updateForm({ phone: e.target.value })} /></label>
          <label>Service category<input value={form.service_category} onChange={e => updateForm({ service_category: e.target.value })} /></label>
          <label>Location<input value={form.location} onChange={e => updateForm({ location: e.target.value })} /></label>
          <label>SAM registered<select value={form.sam_registration_status} onChange={e => updateForm({ sam_registration_status: e.target.value })}>{samRegistrationOptions.map(option => <option key={option} value={option}>{label(option)}</option>)}</select></label>
          <label>Status<select value={form.status} onChange={e => updateForm({ status: e.target.value })}>{subcontractorStatuses.map(status => <option key={status} value={status}>{label(status)}</option>)}</select></label>
          <label>Last contacted date<input type="date" value={form.last_contact_date || ""} onChange={e => updateForm({ last_contact_date: e.target.value })} /></label>
          <label>Next follow-up date<input type="date" value={form.next_follow_up_date || ""} onChange={e => updateForm({ next_follow_up_date: e.target.value })} /></label>
        </div>
        <label>Notes<textarea value={form.notes || ""} onChange={e => updateForm({ notes: e.target.value })} /></label>
        <div className="actions"><button className="btn" onClick={addSubcontractor}>Add to CRM</button></div>
      </div>
      <div className="card">
        <div className="toolbar"><input placeholder="Search by company, service, location, status..." value={filter} onChange={e => setFilter(e.target.value)} /></div>
        <div className="table-wrap subcontractor-crm"><table><thead><tr>{["company", "contact", "email", "phone", "service_category", "location", "SAM_registered", "status", "last_contacted", "next_follow_up", "notes"].map(c => <th key={c}>{label(c)}</th>)}<th>Actions</th></tr></thead><tbody>
          {visible.map(item => <tr key={item.id}>
            <td><strong>{item.company_name}</strong>{matchScore(item) ? <span className="muted table-subline">Suggested match</span> : null}{attachedIds.has(item.id) ? <span className="badge success table-subline">Attached</span> : null}</td>
            <td><input value={item.contact_name || ""} onChange={e => patchSubcontractor(item.id, { contact_name: e.target.value })} /></td>
            <td><input type="email" value={item.email || ""} onChange={e => patchSubcontractor(item.id, { email: e.target.value })} /></td>
            <td><input value={item.phone || ""} onChange={e => patchSubcontractor(item.id, { phone: e.target.value })} /></td>
            <td><input value={item.service_category || ""} onChange={e => patchSubcontractor(item.id, { service_category: e.target.value })} /></td>
            <td><input value={item.location || ""} onChange={e => patchSubcontractor(item.id, { location: e.target.value })} /></td>
            <td><select value={item.sam_registration_status || "unknown"} onChange={e => patchSubcontractor(item.id, { sam_registration_status: e.target.value })}>{samRegistrationOptions.map(option => <option key={option} value={option}>{label(option)}</option>)}</select></td>
            <td><select value={item.status} onChange={e => patchSubcontractor(item.id, { status: e.target.value })}>{subcontractorStatuses.map(status => <option key={status} value={status}>{label(status)}</option>)}</select></td>
            <td><input type="date" value={item.last_contact_date || ""} onChange={e => patchSubcontractor(item.id, { last_contact_date: e.target.value })} /></td>
            <td><input type="date" value={item.next_follow_up_date || ""} onChange={e => patchSubcontractor(item.id, { next_follow_up_date: e.target.value })} /></td>
            <td><textarea value={item.notes || ""} onChange={e => patchSubcontractor(item.id, { notes: e.target.value })} /></td>
            <td><button className="btn secondary" onClick={() => attachToOutreach(item.id)}>{attachedIds.has(item.id) ? "Open" : "Attach"}</button></td>
          </tr>)}
          {!visible.length && <tr><td colSpan="12" className="muted">{governmentData.subcontractors.length ? "No subcontractors match this filter." : "No subcontractors in the CRM yet. Add real subcontractors here, then attach them to opportunities."}</td></tr>}
        </tbody></table></div>
      </div>
    </>
  );
}

function OutreachTracker({ governmentData, updateGovernmentData, selectedOpportunity }) {
  const [subcontractorId, setSubcontractorId] = useState(governmentData.subcontractors[0]?.id || "");
  const [opportunityFilter, setOpportunityFilter] = useState(selectedOpportunity.id || "all");
  const [statusFilter, setStatusFilter] = useState("All");
  const [followUpFilter, setFollowUpFilter] = useState("due");
  const baseRows = governmentData.outreach.filter(item => opportunityFilter === "all" || item.opportunity_id === opportunityFilter);
  const followUpMatches = row => {
    if (followUpFilter === "all") return true;
    const days = daysUntil(row.follow_up_date);
    if (followUpFilter === "due") return days !== null && days <= 0;
    if (followUpFilter === "next7") return days !== null && days >= 0 && days <= 7;
    if (followUpFilter === "missing") return !row.follow_up_date;
    return true;
  };
  const rows = baseRows.filter(item => {
    const matchesStatus = statusFilter === "All" || normalizeOutreachStatus(item.status) === statusFilter;
    return matchesStatus && followUpMatches(item);
  });
  const stats = getOutreachStats(rows);
  const draftAll = () => {
    const nextOutreach = governmentData.outreach.map(item => {
      if (opportunityFilter !== "all" && item.opportunity_id !== opportunityFilter) return item;
      const sub = getSubcontractor(governmentData, item.subcontractor_id);
      const opportunity = governmentData.opportunities.find(row => row.id === item.opportunity_id) || selectedOpportunity;
      return { ...item, status: "Draft", draft_email: draftOutreachEmail(opportunity, sub || {}) };
    });
    updateGovernmentData({ ...governmentData, outreach: nextOutreach });
  };
  const addOutreach = () => {
    const targetOpportunityId = opportunityFilter === "all" ? selectedOpportunity.id : opportunityFilter;
    if (!subcontractorId || governmentData.outreach.some(item => item.opportunity_id === targetOpportunityId && item.subcontractor_id === subcontractorId)) return;
    updateGovernmentData({ ...governmentData, outreach: [createOutreachRecord(targetOpportunityId, subcontractorId), ...governmentData.outreach] });
  };
  const patchOutreach = (id, updates) => {
    const current = governmentData.outreach.find(item => item.id === id);
    const opportunityId = current?.opportunity_id || selectedOpportunity.id;
    const nextUpdates = { ...updates };
    const reminderAdditions = [];
    if (normalizeOutreachStatus(updates.status) === "Sent") {
      nextUpdates.status = "Sent";
      nextUpdates.last_contact_date = today;
      nextUpdates.follow_up_date = updates.follow_up_date || addBusinessDays(today, 2);
      nextUpdates.notes = updates.notes || "Outreach sent. Follow-up reminder created automatically.";
      reminderAdditions.push(createGovernmentReminder({
        opportunityId,
        subcontractorId: current?.subcontractor_id || "",
        type: "Outreach follow-up",
        dueDate: nextUpdates.follow_up_date,
        priority: "High",
        notes: "Follow up 2 business days after outreach was marked sent."
      }));
    }
    if (normalizeOutreachStatus(updates.status) === "Called") {
      nextUpdates.status = "Called";
      nextUpdates.last_contact_date = today;
      nextUpdates.follow_up_date = updates.follow_up_date || current?.follow_up_date || addBusinessDays(today, 2);
      nextUpdates.notes = updates.notes || "Call logged. Follow-up date set for the subcontractor.";
      reminderAdditions.push(createGovernmentReminder({
        opportunityId,
        subcontractorId: current?.subcontractor_id || "",
        type: "Outreach follow-up",
        dueDate: nextUpdates.follow_up_date,
        priority: "Normal",
        notes: "Follow up after subcontractor call."
      }));
    }
    if (normalizeOutreachStatus(updates.status) === "Responded") {
      nextUpdates.status = "Responded";
      nextUpdates.last_contact_date = today;
      nextUpdates.follow_up_date = updates.follow_up_date || current?.follow_up_date || addBusinessDays(today, 2);
      nextUpdates.response_summary = updates.response_summary || current?.response_summary || "Subcontractor responded. Capture interest, quote needs, and availability.";
    }
    if (normalizeOutreachStatus(updates.status) === "Quote Requested") {
      nextUpdates.status = "Quote Requested";
      nextUpdates.last_contact_date = nextUpdates.last_contact_date || today;
      nextUpdates.follow_up_date = updates.follow_up_date || current?.follow_up_date || addBusinessDays(today, 2);
      reminderAdditions.push(createGovernmentReminder({
        opportunityId,
        subcontractorId: current?.subcontractor_id || "",
        type: "Quote due",
        dueDate: nextUpdates.follow_up_date,
        priority: "High",
        notes: "Check whether quote has been received from attached subcontractor."
      }));
    }
    if (normalizeOutreachStatus(updates.status) === "Follow Up Needed") {
      nextUpdates.status = "Follow Up Needed";
      nextUpdates.follow_up_date = updates.follow_up_date || current?.follow_up_date || today;
      reminderAdditions.push(createGovernmentReminder({
        opportunityId,
        subcontractorId: current?.subcontractor_id || "",
        type: "Outreach follow-up",
        dueDate: nextUpdates.follow_up_date,
        priority: "High",
        notes: "Outreach needs follow-up."
      }));
    }
    const crmStatus = updates.status ? subcontractorStatusFromOutreach(updates.status) : "";
    updateGovernmentData({
      ...governmentData,
      outreach: governmentData.outreach.map(item => item.id === id ? { ...item, ...nextUpdates } : item),
      subcontractors: governmentData.subcontractors.map(item => item.id === current?.subcontractor_id ? normalizeGovernmentSubcontractor({
        ...item,
        status: crmStatus || item.status,
        last_contact_date: nextUpdates.last_contact_date || item.last_contact_date,
        next_follow_up_date: nextUpdates.follow_up_date || item.next_follow_up_date
      }) : item),
      reminders: mergeGovernmentReminders(governmentData.reminders || [], reminderAdditions)
    });
  };
  const markOutreach = (row, status) => {
    const updates = { status };
    if (status === "Sent") updates.follow_up_date = row.follow_up_date || addBusinessDays(today, 2);
    if (status === "Called") updates.follow_up_date = row.follow_up_date || addBusinessDays(today, 2);
    if (status === "Responded") updates.follow_up_date = row.follow_up_date || addBusinessDays(today, 2);
    if (status === "Follow Up Needed" && !row.follow_up_date) updates.follow_up_date = today;
    patchOutreach(row.id, updates);
  };
  const scheduleFollowUp = row => patchOutreach(row.id, {
    status: "Follow Up Needed",
    follow_up_date: row.follow_up_date || addBusinessDays(today, 2)
  });
  return (
    <>
      <Title title="Outreach Tracker" subtitle="Manage subcontractor follow-ups for government opportunities." action={<button className="btn" onClick={draftAll}>Draft Outreach</button>} />
      <div className="grid metrics">
        <Metric label="Drafts" value={stats.drafts} />
        <Metric label="Sent" value={stats.sent} />
        <Metric label="Awaiting response" value={stats.awaiting} />
        <Metric label="Follow-ups due today" value={stats.dueToday} />
        <Metric label="Interested partners" value={stats.interested} />
        <Metric label="Quotes received" value={stats.quotes} />
      </div>
      <div className="card toolbar filter-bar">
        <label>Opportunity<select value={opportunityFilter} onChange={e => setOpportunityFilter(e.target.value)}><option value="all">All opportunities</option>{governmentData.opportunities.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <label>Status<select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All</option>{outreachStatuses.map(status => <option key={status}>{status}</option>)}</select></label>
        <label>Next follow-up due<select value={followUpFilter} onChange={e => setFollowUpFilter(e.target.value)}><option value="due">Due or overdue</option><option value="next7">Next 7 days</option><option value="missing">No follow-up date</option><option value="all">All follow-ups</option></select></label>
      </div>
      <div className="card toolbar">
        {governmentData.subcontractors.length ? <select value={subcontractorId} onChange={e => setSubcontractorId(e.target.value)}>{governmentData.subcontractors.map(item => <option key={item.id} value={item.id}>{item.company_name} - {item.service_category}</option>)}</select> : <span className="muted">Add a real subcontractor in Subcontractor Finder before creating outreach.</span>}
        <button className="btn" onClick={addOutreach} disabled={!governmentData.subcontractors.length}>Attach subcontractor</button>
      </div>
      <div className="grid two-col">
        {rows.map(row => {
          const opportunity = governmentData.opportunities.find(item => item.id === row.opportunity_id) || selectedOpportunity;
          const sub = getSubcontractor(governmentData, row.subcontractor_id);
          const outreachEmail = draftOutreachEmail(opportunity, sub || {});
          const followUpEmail = draftFollowUpEmail(opportunity, sub || {});
          const callScript = draftCallScript(opportunity, sub || {});
          const capabilityIntro = draftCapabilityIntro(opportunity, sub || {});
          const linkedInMessage = draftLinkedInMessage(opportunity, sub || {});
          const draft = row.draft_email || outreachEmail;
          return <div className="card form" key={row.id}>
            <div className="panel-head"><h3>{sub?.company_name || "Subcontractor"}</h3><span className="badge">{normalizeOutreachStatus(row.status)}</span></div>
            <div className="info-block">
              <h4>{opportunity.title}</h4>
              <p>{opportunity.agency || "Agency TBD"} - {sub?.service_category || "Capability TBD"} - follow-up {row.follow_up_date ? dueLabel(row.follow_up_date) : "not scheduled"}</p>
            </div>
            <label>Status<select value={row.status} onChange={e => patchOutreach(row.id, { status: e.target.value })}>{outreachStatuses.map(status => <option key={status}>{status}</option>)}</select></label>
            <label>Date created<input value={row.created_at || ""} onChange={e => patchOutreach(row.id, { created_at: e.target.value })} /></label>
            <label>Last contact date<input type="date" value={row.last_contact_date || ""} onChange={e => patchOutreach(row.id, { last_contact_date: e.target.value })} /></label>
            <label>Follow-up date<input type="date" value={row.follow_up_date || ""} onChange={e => patchOutreach(row.id, { follow_up_date: e.target.value })} /></label>
            <label>Response summary<textarea value={row.response_summary || ""} onChange={e => patchOutreach(row.id, { response_summary: e.target.value })} /></label>
            <label>Notes<textarea value={row.notes || ""} onChange={e => patchOutreach(row.id, { notes: e.target.value })} /></label>
            <div className="actions">
              <button className="btn secondary" onClick={() => markOutreach(row, "Sent")}>Mark emailed</button>
              <button className="btn secondary" onClick={() => markOutreach(row, "Called")}>Mark called</button>
              <button className="btn secondary" onClick={() => markOutreach(row, "Responded")}>Mark responded</button>
              <button className="btn secondary" onClick={() => scheduleFollowUp(row)}>Schedule follow-up</button>
            </div>
            <div className="actions">
              <button className="btn secondary" onClick={() => patchOutreach(row.id, { draft_email: outreachEmail, status: "Draft" })}>Generate initial outreach email</button>
              <button className="btn secondary" onClick={() => patchOutreach(row.id, { draft_email: followUpEmail, status: "Follow Up Needed" })}>Generate follow-up email</button>
              <button className="btn secondary" onClick={() => patchOutreach(row.id, { draft_email: capabilityIntro, status: "Ready" })}>Capability intro</button>
              <button className="btn secondary" onClick={() => patchOutreach(row.id, { draft_email: callScript })}>Generate short call script</button>
              <button className="btn secondary" onClick={() => patchOutreach(row.id, { draft_email: linkedInMessage })}>Generate LinkedIn message</button>
            </div>
            <label>Draft Outreach<textarea value={row.draft_email || ""} placeholder={draft} onChange={e => patchOutreach(row.id, { draft_email: e.target.value })} /></label>
          </div>;
        })}
        {!rows.length && <div className="card"><p className="muted">No subcontractor follow-ups match these filters.</p></div>}
      </div>
    </>
  );
}

function ReminderQueue({ governmentData, updateGovernmentData }) {
  const reminders = (governmentData.reminders || []).map(normalizeGovernmentReminder);
  const stats = getReminderStats(reminders);
  const sortedReminders = reminders.slice().sort((a, b) => {
    const statusWeight = status => status === "Pending" ? 0 : status === "Snoozed" ? 1 : 2;
    return statusWeight(a.status) - statusWeight(b.status) || String(a.due_date).localeCompare(String(b.due_date));
  });
  const patchReminder = (id, updates) => {
    const nextUpdates = { ...updates };
    if (updates.status === "Completed") nextUpdates.completed_at = today;
    if (updates.status && updates.status !== "Completed") nextUpdates.completed_at = "";
    updateGovernmentData({
      ...governmentData,
      reminders: reminders.map(item => item.id === id ? normalizeGovernmentReminder({ ...item, ...nextUpdates }) : item)
    });
  };
  return (
    <>
      <Title title="Reminder Queue" subtitle="Track opportunity deadlines, AI review tasks, subcontractor work, outreach follow-ups, quotes, proposals, and award follow-ups." />
      <div className="grid metrics">
        <Metric label="Due today" value={stats.dueToday} />
        <Metric label="Due tomorrow" value={stats.dueTomorrow} />
        <Metric label="Overdue" value={stats.overdue} />
        <Metric label="High priority" value={stats.highPriority} />
        <Metric label="Completed today" value={stats.completedToday} />
      </div>
      <div className="card">
        <div className="table-wrap"><table><thead><tr>{["opportunity", "related_subcontractor", "reminder_type", "due_date", "priority", "status", "notes"].map(c => <th key={c}>{label(c)}</th>)}<th>Actions</th></tr></thead><tbody>
          {sortedReminders.map(item => {
            const opp = governmentData.opportunities.find(row => row.id === item.opportunity_id);
            const sub = getSubcontractor(governmentData, item.subcontractor_id);
            return <tr key={item.id}>
              <td><strong>{opp?.title || "Opportunity"}</strong><span className="muted table-subline">{opp?.agency || ""}</span></td>
              <td>{sub?.company_name || "None"}</td>
              <td><select value={item.type} onChange={e => patchReminder(item.id, { type: e.target.value })}>{reminderTypes.map(type => <option key={type}>{type}</option>)}</select></td>
              <td><input type="date" value={item.due_date || ""} onChange={e => patchReminder(item.id, { due_date: e.target.value })} /><span className="muted table-subline">{dueLabel(item.due_date)}</span></td>
              <td><select value={item.priority} onChange={e => patchReminder(item.id, { priority: e.target.value })}>{["Low", "Normal", "High", "Urgent"].map(priority => <option key={priority}>{priority}</option>)}</select></td>
              <td><select value={item.status} onChange={e => patchReminder(item.id, { status: e.target.value })}>{reminderStatuses.map(status => <option key={status}>{status}</option>)}</select></td>
              <td><textarea value={item.notes || ""} onChange={e => patchReminder(item.id, { notes: e.target.value })} /></td>
              <td><div className="row-actions">
                <button className="btn secondary" onClick={() => patchReminder(item.id, { status: "Completed" })}>Complete</button>
                <button className="btn secondary" onClick={() => patchReminder(item.id, { status: "Snoozed", due_date: addBusinessDays(today, 1) })}>Snooze</button>
                <button className="btn secondary" onClick={() => patchReminder(item.id, { status: "Cancelled" })}>Cancel</button>
              </div></td>
            </tr>;
          })}
          {!sortedReminders.length && <tr><td colSpan="8" className="muted">No reminders yet. Add an opportunity or mark outreach sent to create reminders automatically.</td></tr>}
        </tbody></table></div>
      </div>
    </>
  );
}

function AwardsTracker({ governmentData, updateGovernmentData }) {
  const stats = getGovernmentAwardStats(governmentData);
  const patchAward = (opportunityId, updates) => {
    let reminderAdditions = [];
    const nextOpportunities = governmentData.opportunities.map(item => {
      if (item.id !== opportunityId) return item;
      const nextOutcome = normalizeAwardOutcome({ ...item.award_outcome, ...updates }, item);
      const nextStatus = ["Awarded", "Lost", "Cancelled", "Withdrawn"].includes(nextOutcome.award_status) ? nextOutcome.award_status : "Pending Award";
      if (nextOutcome.award_status === "Pending Award") {
        reminderAdditions = [createGovernmentReminder({
          opportunityId: item.id,
          type: "Award follow-up",
          dueDate: addBusinessDays(today, 5),
          priority: "Normal",
          notes: "Check agency award status and update outcome."
        })];
      }
      return normalizeGovernmentOpportunity({
        ...item,
        status: nextStatus,
        award_outcome: nextOutcome,
        next_action: nextOutcome.award_status === "Awarded" ? "Begin contract kickoff" : nextOutcome.award_status === "Lost" ? "Capture lessons learned" : "Track award decision",
        updated_at: today
      });
    });
    updateGovernmentData({
      ...governmentData,
      opportunities: nextOpportunities,
      reminders: mergeGovernmentReminders(governmentData.reminders || [], reminderAdditions)
    });
  };
  const toggleAssignedSubcontractor = (opportunity, subcontractorId, checked) => {
    const outcome = normalizeAwardOutcome(opportunity.award_outcome, opportunity);
    const assigned = new Set(outcome.assigned_subcontractors || []);
    if (checked) assigned.add(subcontractorId);
    else assigned.delete(subcontractorId);
    patchAward(opportunity.id, { assigned_subcontractors: Array.from(assigned) });
  };
  return (
    <>
      <Title title="Awards" subtitle="Record award outcomes, lost reasons, selected partners, and contract value." />
      <div className="grid metrics">
        <Metric label="Total submitted" value={stats.totalSubmitted} />
        <Metric label="Total awarded" value={stats.contractsWon} />
        <Metric label="Total lost" value={stats.contractsLost} />
        <Metric label="Win rate" value={`${stats.winRate}%`} />
        <Metric label="Total contract value" value={amount(stats.totalAwardedValue)} />
        <Metric label="Average award amount" value={amount(stats.averageAwardAmount)} />
        <Metric label="Upcoming pending awards" value={stats.upcomingPendingAwards} />
      </div>
      <div className="card">
        <div className="panel-head"><h3>Government Awards Report</h3><span className="mode">Live/local records</span></div>
        <div className="table-wrap"><table><thead><tr>{["opportunity", "agency", "award_status", "award_amount", "prime_or_subcontract", "contract_number", "period_of_performance", "reason_lost"].map(c => <th key={c}>{label(c)}</th>)}</tr></thead><tbody>
          {governmentData.opportunities.map(item => {
            const outcome = normalizeAwardOutcome(item.award_outcome, item);
            return <tr key={item.id}><td><strong>{item.title}</strong></td><td>{outcome.awarding_agency}</td><td><span className={outcome.award_status === "Awarded" ? "badge success" : outcome.award_status === "Lost" ? "badge warn" : "badge"}>{outcome.award_status}</span></td><td>{amount(outcome.award_amount || item.estimated_value)}</td><td>{outcome.prime_or_subcontract}</td><td>{outcome.contract_number || "TBD"}</td><td>{outcome.period_of_performance || "TBD"}</td><td>{outcome.reason_lost || ""}</td></tr>;
          })}
          {!governmentData.opportunities.length && <tr><td colSpan="8" className="muted">No award records yet. Add a real opportunity to the pipeline, then update award status here.</td></tr>}
        </tbody></table></div>
      </div>
      <div className="grid two-col">
        {governmentData.opportunities.map(item => {
          const outcome = normalizeAwardOutcome(item.award_outcome, item);
          const outreachRows = governmentData.outreach.filter(row => row.opportunity_id === item.id);
          const attachedSubs = outreachRows.map(row => ({ outreach: row, subcontractor: getSubcontractor(governmentData, row.subcontractor_id) })).filter(row => row.subcontractor);
          return <div className="card form" key={item.id}>
            <div className="panel-head"><h3>{item.title}</h3><span className="badge">{outcome.award_status}</span></div>
            <label>Award status<select value={outcome.award_status} onChange={e => patchAward(item.id, { award_status: e.target.value })}>{awardStatuses.map(status => <option key={status}>{status}</option>)}</select></label>
            <label>Award date<input type="date" value={outcome.award_date || ""} onChange={e => patchAward(item.id, { award_date: e.target.value })} /></label>
            <label>Award amount<input type="number" value={outcome.award_amount || ""} onChange={e => patchAward(item.id, { award_amount: Number(e.target.value || 0) })} /></label>
            <label>Prime or subcontract<select value={outcome.prime_or_subcontract} onChange={e => patchAward(item.id, { prime_or_subcontract: e.target.value })}>{["Prime", "Subcontract"].map(option => <option key={option}>{option}</option>)}</select></label>
            <label>Contract number<input value={outcome.contract_number || ""} onChange={e => patchAward(item.id, { contract_number: e.target.value })} /></label>
            <label>Period of performance<input value={outcome.period_of_performance || ""} placeholder="2026-07-01 to 2027-06-30" onChange={e => patchAward(item.id, { period_of_performance: e.target.value })} /></label>
            <label>Awarding agency<input value={outcome.awarding_agency || ""} onChange={e => patchAward(item.id, { awarding_agency: e.target.value })} /></label>
            {outcome.award_status === "Lost" && <>
              <label>Reason lost<select value={outcome.reason_lost || ""} onChange={e => patchAward(item.id, { reason_lost: e.target.value })}><option value="">Select reason</option>{lostReasons.map(reason => <option key={reason}>{reason}</option>)}</select></label>
              <label>Winning competitor<input value={outcome.winning_competitor || ""} onChange={e => patchAward(item.id, { winning_competitor: e.target.value })} /></label>
              <label>Lessons learned<textarea value={outcome.lessons_learned || ""} onChange={e => patchAward(item.id, { lessons_learned: e.target.value })} /></label>
            </>}
            <div className="info-block">
              <h4>Assigned subcontractors</h4>
              {attachedSubs.map(({ outreach, subcontractor }) => <label key={subcontractor.id} className="inline-check">
                <input type="checkbox" checked={(outcome.assigned_subcontractors || []).includes(subcontractor.id)} onChange={e => toggleAssignedSubcontractor(item, subcontractor.id, e.target.checked)} />
                {subcontractor.company_name} - {normalizeOutreachStatus(outreach.status)}
              </label>)}
              {!attachedSubs.length && <p className="muted">No subcontractors attached yet.</p>}
            </div>
            <label>Internal notes<textarea value={outcome.internal_notes || ""} onChange={e => patchAward(item.id, { internal_notes: e.target.value })} /></label>
          </div>;
        })}
        {!governmentData.opportunities.length && <div className="card"><p className="muted">No opportunities are available for award tracking yet.</p></div>}
      </div>
    </>
  );
}
*/

function InfoBlock({ title, text }) {
  return <div className="info-block"><h4>{title}</h4><p>{text || "Not entered yet."}</p></div>;
}

function InfoList({ title, items = [] }) {
  return <div className="info-block"><h4>{title}</h4>{items.length ? <ul>{items.map(item => <li key={item}>{item}</li>)}</ul> : <p className="muted">None listed yet.</p>}</div>;
}

function MockWorkspace({ title, subtitle, items, action }) {
  return (
    <>
      <Title title={title} subtitle={subtitle} action={action} />
      <div className="grid three-col">
        {items.map(item => <div className="card action-card" key={`${title}-${item.title}`}>
          <span className="badge">{item.status}</span>
          <h3>{item.title}</h3>
          <p>{item.detail}</p>
        </div>)}
        {!items.length && <div className="card"><p className="muted">This workspace is ready for future integration data.</p></div>}
      </div>
    </>
  );
}

function FocusCard({ title, items, action, onAction }) {
  return <div className="card action-card">
    <div className="panel-head"><h3>{title}</h3>{action && <button className="btn secondary" onClick={onAction}>{action}</button>}</div>
    <div className="activity compact">
      {items.map(item => <div key={`${title}-${item.title}`}><strong>{item.title}</strong><span className="muted">{item.detail}</span><span className="badge">{item.status}</span></div>)}
    </div>
  </div>;
}

function NotesPanel({ rows, parentType, parentId, addRecord }) {
  const [body, setBody] = useState("");
  const save = async () => {
    if (!body.trim()) return;
    await addRecord("notes", { parent_type: parentType, parent_id: parentId, note_body: body.trim() });
    setBody("");
  };
  return <div className="notes-panel">
    <div className="form">
      <label>Add note<textarea value={body} onChange={e => setBody(e.target.value)} /></label>
      <button className="btn" onClick={save}>Add note</button>
    </div>
    <Timeline title="Notes timeline" rows={rows} />
  </div>;
}

function Timeline({ title, rows }) {
  return <div className="activity timeline"><h3>{title}</h3>
    {rows.length ? rows.map(row => <div key={row.id}><strong>{String(row.created_at || row.interview_date || today).slice(0, 10)}</strong><span className="muted">{row.note_body || row.interview_notes || row.message}</span></div>) : <p className="muted">No entries yet.</p>}
  </div>;
}

function InvoiceTools({ data, createInvoiceFromEngagements }) {
  const [invoiceId, setInvoiceId] = useState(data.invoices[0]?.id || "");
  const [clientId, setClientId] = useState("");
  const [selected, setSelected] = useState([]);
  const invoice = data.invoices.find(item => item.id === invoiceId);
  const billable = data.engagements.filter(item => item.billable && item.invoice_status === "Not Invoiced" && (!clientId || item.client_id === clientId));
  const emailCopy = invoice ? `Hello,\n\nPlease see invoice ${invoice.invoice_number} from V Solutions LLC for ${amount(invoice.total)}. The due date is ${invoice.due_date || "listed on the invoice"}.\n\nServices include HR consulting, compliance, workplace investigations, AI-powered HR solutions, and fractional HR support.\n\nThank you,\nValicia Davis, MBA, PHR\nV Solutions LLC` : "";

  const toggle = id => setSelected(selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id]);
  const printInvoice = () => invoice && printHtml(`Invoice ${invoice.invoice_number}`, invoiceHtml(invoice, data));
  const downloadInvoice = () => invoice && downloadText(`${invoice.invoice_number}.html`, invoiceHtml(invoice, data), "text/html");
  const downloadEmail = () => invoice && downloadText(`${invoice.invoice_number}-email.txt`, emailCopy);

  return <div className="grid two-col">
    <div className="card">
      <h3>Invoice print/download</h3>
      <div className="form">
        <label>Invoice<select value={invoiceId} onChange={e => setInvoiceId(e.target.value)}>{data.invoices.map(item => <option key={item.id} value={item.id}>{item.invoice_number} - {clientName(data, item.client_id)}</option>)}</select></label>
        <div className="actions">
          <button className="btn secondary" onClick={printInvoice}>Print invoice</button>
          <button className="btn secondary" onClick={downloadInvoice}>Download HTML</button>
          <button className="btn secondary" onClick={downloadEmail}>Download email copy</button>
        </div>
      </div>
      <p><strong>V Solutions LLC</strong><br />HR Consulting<br />Owner: Valicia Davis, MBA, PHR<br />Location: Montgomery, AL<br />Services: HR consulting, compliance, workplace investigations, AI-powered HR solutions, fractional HR support</p>
    </div>
    <div className="card">
      <h3>Create invoice from engagements</h3>
      <div className="form">
        <label>Client<select value={clientId} onChange={e => { setClientId(e.target.value); setSelected([]); }}><option value="">Select client</option>{data.clients.map(client => <option key={client.id} value={client.id}>{client.company_name}</option>)}</select></label>
        <div className="check-list">
          {billable.length ? billable.map(item => <label key={item.id}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} /> {item.service_date} - {item.service_category} - {amount(item.amount || Number(item.hours_worked || 0) * Number(item.hourly_rate || 0))}</label>) : <p className="muted">No uninvoiced billable engagements for this client.</p>}
        </div>
        <button className="btn" onClick={() => createInvoiceFromEngagements(clientId, selected)}>Create draft invoice</button>
      </div>
    </div>
  </div>;
}

function Title({ title, subtitle, action }) { return <div className="page-title"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>; }
function Metric({ label, value }) { return <div className="card metric"><small>{label}</small><strong>{value}</strong></div>; }
function Splash({ text }) { return <div className="auth-page"><div className="auth-card"><h1>{text}</h1></div></div>; }
function Banner({ type, text, onClose }) { return <div className={`banner ${type}`}><span>{text}</span><button onClick={onClose}>Dismiss</button></div>; }
function Activity({ rows }) { return <div className="card"><h3>Recent activity</h3><div className="activity">{rows.slice(0,6).map(r => <div key={r.id}><strong>{r.action}</strong><span className="muted">{r.message} {String(r.created_at || "").slice(0, 10)}</span></div>)}{!rows.length && <p className="muted">No activity yet.</p>}</div></div>; }
function Bars({ title, rows }) {
  const max = Math.max(1, ...rows.map(r => Number(r.value) || 0));
  const content = <div className="bars">{rows.length ? rows.map(r => <div className="bar" key={r.label}><span><b>{r.label || "Unspecified"}</b><em>{r.money ? amount(r.value) : r.value}</em></span><i style={{ width: `${Math.max(8, (Number(r.value) || 0) / max * 100)}%` }} /></div>) : <p className="muted">No data yet.</p>}</div>;
  return title ? <div className="card"><h3>{title}</h3>{content}</div> : content;
}
function label(k) { return k.replaceAll("_", " ").replace(/\b\w/g, m => m.toUpperCase()); }
function cell(row, c, data) { const v = c === "client_id" ? clientName(data, row[c]) : row[c]; if (c.includes("amount") || c === "total") return amount(v); if (["status", "priority", "invoice_status"].includes(c)) return <span className={`badge ${statusClass(v)}`}>{v}</span>; if (typeof v === "boolean") return v ? "Yes" : "No"; return v || ""; }
function group(rows, key) { return rows.reduce((a, r) => ({ ...a, [r[key] || "Unspecified"]: (a[r[key] || "Unspecified"] || 0) + 1 }), {}); }
function groupSum(rows, keyFn, valueKey) {
  return rows.reduce((a, r) => {
    const k =
      typeof keyFn === "function"
        ? keyFn(r)
        : r[keyFn];

    const label = k || "Unspecified";

    return {
      ...a,
      [label]: (a[label] || 0) + Number(r[valueKey] || 0),
    };
  }, {});
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
