const fs = require("fs");
const path = require("path");

const today = currentDate();

const adapters = [
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

const alabamaBuysPublicSolicitationsUrl = "https://www.alabamabuys.gov/page.aspx/en/rfp/request_browse_public";
const cityOfMontgomeryOpenGovUrl = "https://procurement.opengov.com/portal/montgomeryal";
const cityOfMontgomeryBidsInfoUrl = "https://www.montgomeryal.gov/Home/Components/RFP/RFP/1192/160";
const samGovOpportunitiesApiUrl = "https://api.sam.gov/opportunities/v2/search";

const developerTestMockOpportunities = [
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

function currentDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function developerTestMockOpportunitiesForSource(sourceName) {
  return developerTestMockOpportunities.filter(item => item.source === sourceName);
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
  // TODO: Connect Montgomery County purchasing source, manual import, or scraper here.
  return [];
}

async function fetchAlabamaBuysLiveOpportunities() {
  if (typeof fetch !== "function") return [];
  const response = await fetch(alabamaBuysPublicSolicitationsUrl, { headers: { Accept: "text/html" } });
  if (!response.ok) throw new Error(`Alabama Buys returned ${response.status}`);
  const html = await response.text();
  if (/browser check|please wait while we are checking your browser|login/i.test(html)) throw new Error("Alabama Buys unavailable / blocked");
  return parseAlabamaBuysHtml(html);
}

async function fetchCityOfMontgomeryLiveOpportunities() {
  if (typeof fetch !== "function") return [];
  try {
    const portalResponse = await fetch(cityOfMontgomeryOpenGovUrl, { headers: { Accept: "text/html" } });
    if (portalResponse.ok) {
      const portalHtml = await portalResponse.text();
      const portalRows = parseCityOfMontgomeryOpenGovHtml(portalHtml);
      if (portalRows.length) return portalRows;
    }
  } catch {
    // The OpenGov portal may block scheduled fetches; the public City page remains a status check.
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
  return Array.from(text.matchAll(rowPattern))
    .map(match => match[0].trim())
    .filter(snippet => !/subscribe|register|vendor|profile|notification/i.test(snippet))
    .slice(0, 8)
    .map((snippet, index) => normalizeCityOfMontgomeryOpportunity(snippet, `city-live-${index + 1}`, cityOfMontgomeryOpenGovUrl));
}

function parseCityOfMontgomeryInfoHtml() {
  return [];
}

function discoverySourceStatusError(message) {
  const error = new Error(message);
  error.connectionStatus = message;
  return error;
}

async function fetchSamGovLiveOpportunities() {
  const apiKey = (process.env.SAM_GOV_API_KEY || "").trim();
  if (!apiKey) throw discoverySourceStatusError("SAM.gov not connected \u2014 API key required.");
  if (typeof fetch !== "function") throw new Error("fetch is unavailable in this Node runtime");
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
    .filter(item => !isStaffingOrRecruiting(item))
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
  return {
    id: `sam-${item.noticeId || item.solicitationNumber || Date.now()}`,
    title: item.title || "SAM.gov opportunity",
    agency,
    due_date: normalizeSamGovDate(item.responseDeadLine || item.reponseDeadLine || item.responseDeadline),
    opportunity_url: noticeUrl,
    category: inferCategory(text),
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
    estimated_upfront_capital: estimateUpfrontCapital(text),
    can_leverage_subcontractors: /service|support|maintenance|installation|coordination|logistics|consulting|training|delivery|subcontract/i.test(text),
    can_leverage_suppliers: /supply|supplies|materials|product|equipment|printing|parts|hardware|software|subscription|vendor/i.test(text),
    full_time_manageable: !/24\/7|full-time onsite|daily onsite|staffing|recruiting|construction crew|large payroll|multiple shifts|bonding|performance bond/i.test(text),
    complexity: /construction|bond|bonding|statewide|enterprise|multi-year|multiple locations|facility-wide|large-scale/i.test(text) ? "High" : "Moderate",
    staffing_needs: /staffing|recruiting/.test(text.toLowerCase()) ? "Avoid - staffing or recruiting language detected." : "Review federal scope; likely feasible only with subcontractor or supplier support if delivery is broad.",
    equipment_needs: /equipment|vehicle|machinery|hardware/.test(text.toLowerCase()) ? "Review equipment requirements before pursuing." : "No major equipment need identified from SAM.gov summary.",
    supply_needs: /supply|supplies|materials|parts|product/.test(text.toLowerCase()) ? "Supplier quote may be needed before bid/no-bid." : "No major supply need identified from SAM.gov summary.",
    likelihood_of_subcontracting: /service|support|installation|maintenance|delivery|training|consulting/.test(text.toLowerCase()) ? "Moderate" : "Low",
    likelihood_of_supplier_use: /supply|supplies|materials|parts|product|equipment/.test(text.toLowerCase()) ? "High" : "Moderate"
  };
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
  return {
    id,
    title: snippet.slice(0, 96),
    agency: "City of Montgomery",
    due_date: normalizeDateFromText(snippet),
    opportunity_url: url,
    category: inferCategory(snippet),
    description: snippet,
    estimated_value: 0,
    date_found: today,
    source: "City of Montgomery opportunities",
    naics: inferNaics(snippet),
    local: true,
    fits_existing_naics: /hr|training|administrative|consulting|policy|records|workshop|coordination/i.test(snippet),
    estimated_upfront_capital: estimateUpfrontCapital(snippet),
    can_leverage_subcontractors: /service|support|training|installation|coordination|delivery/i.test(snippet),
    can_leverage_suppliers: /supply|supplies|materials|printing|equipment|books|advertising/i.test(snippet),
    full_time_manageable: !/multiple buildings|recurring daily|24\/7|large|citywide deployment/i.test(snippet),
    complexity: /citywide|multiple|installation|construction/i.test(snippet) ? "High" : "Moderate",
    staffing_needs: "Needs review from live City of Montgomery solicitation details.",
    equipment_needs: "Needs review from live City of Montgomery solicitation details.",
    supply_needs: "Needs review from live City of Montgomery solicitation details.",
    likelihood_of_subcontracting: /service|installation|delivery|support/i.test(snippet) ? "Moderate" : "Low",
    likelihood_of_supplier_use: /supply|supplies|materials|books|equipment/i.test(snippet) ? "High" : "Moderate"
  };
}

function parseAlabamaBuysHtml(html = "") {
  const text = String(html || "").replace(/\s+/g, " ");
  const rowPattern = /(?:SRC\d{7,}|RFP|RFQ|ITB)[^<]{0,240}/gi;
  return Array.from(text.matchAll(rowPattern)).slice(0, 8).map((match, index) => {
    const snippet = match[0].trim();
    const id = (snippet.match(/SRC\d{7,}/i) || [])[0] || `AL-LIVE-${index + 1}`;
    return {
      id: `al-live-${id.toLowerCase()}`,
      title: snippet.slice(0, 96),
      agency: "State of Alabama",
      due_date: normalizeDateFromText(snippet),
      opportunity_url: alabamaBuysPublicSolicitationsUrl,
      category: inferCategory(snippet),
      description: snippet,
      estimated_value: 0,
      date_found: today,
      source: "Alabama Buys",
      naics: inferNaics(snippet),
      local: /montgomery|alabama/i.test(snippet),
      fits_existing_naics: /hr|training|administrative|consulting|policy|records|workshop|coordination/i.test(snippet),
      estimated_upfront_capital: estimateUpfrontCapital(snippet),
      can_leverage_subcontractors: /service|support|training|installation|coordination|delivery/i.test(snippet),
      can_leverage_suppliers: /supply|supplies|materials|printing|equipment|books|advertising/i.test(snippet),
      full_time_manageable: !/multiple buildings|recurring daily|24\/7|large|statewide deployment/i.test(snippet),
      complexity: /statewide|multiple|installation|construction/i.test(snippet) ? "High" : "Moderate",
      staffing_needs: "Needs review from live Alabama Buys solicitation details.",
      equipment_needs: "Needs review from live Alabama Buys solicitation details.",
      supply_needs: "Needs review from live Alabama Buys solicitation details.",
      likelihood_of_subcontracting: /service|installation|delivery|support/i.test(snippet) ? "Moderate" : "Low",
      likelihood_of_supplier_use: /supply|supplies|materials|books|equipment/i.test(snippet) ? "High" : "Moderate"
    };
  });
}

function normalizeDateFromText(text = "") {
  const match = String(text).match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+20\d{2}\b/i);
  if (!match) return "";
  const date = new Date(match[0]);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatSamGovDate(date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
}

function normalizeSamGovDate(value = "") {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function inferCategory(text = "") {
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

function inferNaics(text = "") {
  const value = String(text).toLowerCase();
  if (/hr|policy|employee/.test(value)) return "541612";
  if (/training|workshop/.test(value)) return "611430";
  if (/administrative|records|coordination/.test(value)) return "541611";
  return "";
}

function estimateUpfrontCapital(text = "") {
  const value = String(text).toLowerCase();
  if (/bond|bonding|construction crew|vehicle fleet|heavy equipment|major inventory|statewide deployment|multiple buildings/.test(value)) return 6500;
  if (/construction|vehicle|equipment|statewide|multiple locations/.test(value)) return 5000;
  if (/supplies|materials|books|printing|parts|hardware/.test(value)) return 1500;
  if (/consulting|training|administrative|records|coordination|program support|technical assistance/.test(value)) return 750;
  return 750;
}

function isStaffingOrRecruiting(item = {}) {
  return /staffing|recruiting|temporary labor|temp labor|personnel placement|staff augmentation/i.test(`${item.title || ""} ${item.description || ""} ${item.category || ""}`);
}

function score(item) {
  return (item.local ? 20 : 0)
    + (item.fits_existing_naics ? 20 : 0)
    + (Number(item.estimated_upfront_capital || 0) <= 2000 ? 30 : 0)
    + (item.can_leverage_subcontractors ? 10 : 0)
    + (item.can_leverage_suppliers ? 10 : 0)
    + (item.full_time_manageable ? 10 : 0);
}

function tier(item) {
  const total = score(item);
  if (Number(item.estimated_upfront_capital || 0) <= 2000 && total >= 80) return "Tier A";
  if (Number(item.estimated_upfront_capital || 0) <= 4000 && total >= 50) return "Tier B";
  return "Tier C";
}

async function run() {
  const results = await Promise.all(adapters.map(async adapter => {
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
      const rows = (await adapter.fetch()).map(item => ({ ...item, source: item.source || adapter.name, date_found: item.date_found || today }));
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
  const scored = opportunities.map(item => ({
    ...item,
    score: score(item),
    tier: tier(item)
  }));
  const topMatches = scored
    .filter(item => item.tier !== "Tier C")
    .sort((a, b) => {
      const tierWeight = value => value === "Tier A" ? 0 : value === "Tier B" ? 1 : 2;
      return tierWeight(a.tier) - tierWeight(b.tier)
        || b.score - a.score
        || Number(a.estimated_upfront_capital || 0) - Number(b.estimated_upfront_capital || 0);
    })
    .slice(0, 5);
  return {
    mode: "Live Only",
    automationStatus: "Daily Automation Ready",
    connectionStatus: topMatches.length ? "Live opportunities found" : "No live opportunities found from connected sources yet.",
    lastRun: new Date().toISOString(),
    sourceStatuses,
    topMatches,
    message: topMatches.length ? "" : "No live opportunities found from connected sources yet.",
    reviewQueue: topMatches.map(item => ({
      title: item.title,
      agency: item.agency,
      tier: item.tier,
      score: item.score,
      due_date: item.due_date,
      status: item.tier === "Tier A" ? "Needs Review" : "Watch",
      priority: item.tier === "Tier A" ? "High" : "Normal"
    }))
  };
}

run().then(report => {
  const outputPath = path.resolve(__dirname, "..", "workflows", "daily-opportunity-discovery-latest.json");
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Daily opportunity discovery complete. ${report.topMatches.length} top match(es) written to ${outputPath}`);
}).catch(error => {
  console.error(error.message || "Daily opportunity discovery failed.");
  process.exit(1);
});
