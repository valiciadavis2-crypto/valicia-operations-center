// Opportunity intake parsing helpers loaded with the Government section.
function inferFulfillmentTypes(text = "") {
  const value = String(text).toLowerCase();
  const types = [];
  if (/supply|supplies|materials|product|equipment|furniture|dme|parts|commodity|kit/.test(value)) types.push("supplier");
  if (/manufacturer|fabricat|produce|made|assembly|assemble/.test(value)) types.push("manufacturer");
  if (/distributor|wholesale|reseller|dealer/.test(value)) types.push("distributor");
  if (/delivery|shipping|transport|logistics|freight|courier/.test(value)) types.push("delivery/logistics");
  if (/install|installation|setup|deploy|configure|assembly/.test(value)) types.push("installer");
  if (/pricing|cost proposal|price volume/.test(value)) types.push("pricing partner");
  if (/proposal|technical writing|compliance matrix|past performance/.test(value)) types.push("proposal support");
  if (/remote|virtual|online|administrative|clerical|records|consulting|training/.test(value)) types.push("remote support");
  if (/service|support|maintenance|repair|consulting|training|technical/.test(value)) types.push("subcontractor");
  return [...new Set(types.length ? types : ["subcontractor"])];
}

function extractLocationContext(text = "") {
  const value = String(text || "");
  const zip = (value.match(/\b\d{5}(?:-\d{4})?\b/) || [])[0] || "";
  const state = /\bAL\b|Alabama/i.test(value) ? "AL" : "";
  const city = (value.match(/\bMontgomery\b|\bBirmingham\b|\bPrattville\b|\bMobile\b|\bHuntsville\b/i) || [])[0] || "";
  const county = (value.match(/\b[A-Z][a-z]+ County\b/) || [])[0] || "";
  return { city, state, zip, county };
}

function locationAwareSearchTerm(category, partnerType, location = {}) {
  const loc = location.zip || [location.city, location.state].filter(Boolean).join(" ") || location.county || "Alabama";
  return `${category} ${partnerType} ${loc}`.replace(/\s+/g, " ").trim();
}

function splitCleanLines(text = "") {
  return String(text || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
}

function valueAfterKnownLabel(line = "", labels = []) {
  const escaped = labels.map(item => String(item).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const match = String(line || "").match(new RegExp(`^\\s*(?:${escaped})\\s*(?:#|number|no\\.)?\\s*[:\\-]\\s*(.+)$`, "i"));
  return match ? match[1].trim() : "";
}

function findLabeledValue(lines = [], labels = []) {
  for (const line of lines) {
    const value = valueAfterKnownLabel(line, labels);
    if (value) return value;
  }
  return "";
}

function normalizeExtractedTextList(value = "", maxItems = 6) {
  const text = String(value || "").trim();
  if (!text) return [];
  return text
    .split(/\n|;|(?:\s+-\s+)|(?:\s+\*\s+)/)
    .map(item => item.replace(/^[-*â€¢\d.)\s]+/, "").trim())
    .filter(item => item.length > 3)
    .slice(0, maxItems);
}

function extractSectionText(text = "", headings = [], maxChars = 700) {
  const clean = String(text || "");
  const escaped = headings.map(item => String(item).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const pattern = new RegExp(`(?:^|\\n)\\s*(?:${escaped})\\s*:?\\s*\\n?([\\s\\S]{0,${maxChars}}?)(?=\\n\\s*[A-Z][A-Za-z /-]{2,40}\\s*:|\\n\\s*(?:${escaped})\\s*:|$)`, "i");
  const match = clean.match(pattern);
  return match ? match[1].trim() : "";
}

function extractOpportunityDueDate(text = "", lines = []) {
  const datePattern = /\b(20\d{2}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/20\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+20\d{2})\b/i;
  const dueLine = lines.find(line => /due|deadline|closing|response date|proposal due|offer due|bid opening/i.test(line));
  const dueMatch = (dueLine || "").match(datePattern) || String(text || "").match(datePattern);
  if (!dueMatch) return "";
  const normalized = normalizeDateInput(dueMatch[0]);
  if (normalized) return normalized;
  const parsed = new Date(dueMatch[0]);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function extractEstimatedValue(text = "", lines = []) {
  const moneyPattern = /\$\s?([0-9][0-9,]*(?:\.\d{2})?)/;
  const valueLine = lines.find(line => /estimated value|budget|ceiling|award amount|contract value|not to exceed|nte/i.test(line));
  const match = (valueLine || "").match(moneyPattern) || String(text || "").match(/\b(?:estimated value|budget|ceiling|award amount|not to exceed|nte)[^\n$]{0,60}\$\s?([0-9][0-9,]*(?:\.\d{2})?)/i);
  return match ? Number(match[1].replaceAll(",", "")) : 0;
}

function inferOpportunityRisks(text = "") {
  const value = String(text || "").toLowerCase();
  const risks = [];
  if (/bond|bonding/.test(value)) risks.push("Bonding requirements may increase upfront cost.");
  if (/insurance|certificate of insurance|coi/.test(value)) risks.push("Insurance requirements need review before bidding.");
  if (/onsite|on-site|site visit|facility access/.test(value)) risks.push("Onsite work may require a local partner or schedule planning.");
  if (/delivery|shipping|freight|fob destination/.test(value)) risks.push("Delivery or shipping costs need supplier quote validation.");
  if (/equipment|vehicle|machinery|tools/.test(value)) risks.push("Equipment needs may exceed the preferred capital limit.");
  if (/background check|clearance|credential/.test(value)) risks.push("Credentialing or background checks may affect timeline.");
  if (/staffing|recruiting|temporary personnel|temp labor/.test(value)) risks.push("Staffing or recruiting language detected; avoid unless scope is clearly not staffing.");
  return risks.slice(0, 6);
}

function buildExtractionConfidence(form = {}) {
  const checks = [
    ["title", "Title", "missing"],
    ["agency", "Agency", "missing"],
    ["due_date", "Due date", "missing"],
    ["solicitation_number", "Solicitation number", "needsReview"],
    ["naics", "NAICS", "needsReview"],
    ["set_aside", "Set-aside", "needsReview"],
    ["place_of_performance", "Place of performance", "needsReview"],
    ["city", "City", "needsReview"],
    ["state", "State", "needsReview"],
    ["zip_code", "ZIP", "needsReview"],
    ["county", "County", "needsReview"],
    ["description", "Scope summary", "missing"],
    ["deliverables", "Deliverables", "needsReview"],
    ["required_capabilities", "Required capabilities", "needsReview"],
    ["risks", "Risks", "needsReview"],
    ["estimated_value", "Estimated value", "needsReview"]
  ];
  return checks.reduce((acc, [key, text, fallback]) => {
    const value = form[key];
    const hasValue = Array.isArray(value) ? value.length > 0 : Boolean(String(value || "").trim());
    if (hasValue) acc.found.push(text);
    else if (fallback === "missing") acc.missing.push(text);
    else acc.needsReview.push(text);
    return acc;
  }, { found: [], needsReview: [], missing: [] });
}

function parseOpportunityText(text = "", url = "") {
  const clean = String(text || "").trim();
  const lines = splitCleanLines(clean);
  const location = extractOpportunityLocationFields(clean);
  const firstUsefulLine = lines.find(line => !/^(solicitation|notice|rfp|rfq|ifb|agency|department|office|date|due)[:\s-]/i.test(line));
  const scopeSummary = extractSectionText(clean, ["scope of work", "scope", "description", "statement of work", "work requirements"])
    || clean.slice(0, 700);
  const deliverableText = extractSectionText(clean, ["deliverables", "deliverable", "delivery", "submission requirements"]);
  const capabilityText = extractSectionText(clean, ["required capabilities", "requirements", "contractor requirements", "qualifications", "experience", "capabilities"]);
  const solicitation = findLabeledValue(lines, ["solicitation number", "solicitation", "notice id", "rfp", "rfq", "ifb", "bid number", "project number"])
    || (clean.match(/\b(?:solicitation|notice|rfp|rfq|ifb|bid)(?:\s+number|\s+no\.?|\s+#)?\s*[:#-]?\s*([A-Z0-9-]{5,})/i) || [])[1]
    || "";
  const naicsMatch = clean.match(/\bNAICS(?:\s+code)?\s*[:#-]?\s*(\d{6})\b/i) || clean.match(/\b\d{6}\b/);
  const form = {
    title: findLabeledValue(lines, ["title", "opportunity title", "project title", "subject"]) || firstUsefulLine || "",
    agency: findLabeledValue(lines, ["agency", "department", "office", "issuing office", "buyer", "organization"]) || "",
    solicitation_number: solicitation,
    naics: naicsMatch?.[1] || naicsMatch?.[0] || "",
    set_aside: findLabeledValue(lines, ["set-aside", "set aside", "type of set aside", "small business set-aside"]) || "",
    due_date: extractOpportunityDueDate(clean, lines),
    estimated_value: extractEstimatedValue(clean, lines),
    source_url: url,
    ...location,
    description: scopeSummary || clean || "",
    scope_summary: scopeSummary,
    deliverables: normalizeExtractedTextList(deliverableText),
    required_capabilities: normalizeExtractedTextList(capabilityText),
    risks: inferOpportunityRisks(clean),
    opportunity_text: clean,
    status: "New",
    ai_fit_score: 0,
    next_action: "Generate AI review",
    created_at: today,
    notes: [solicitation ? `Solicitation: ${solicitation}` : "", location.place_of_performance ? `Place of performance: ${location.place_of_performance}` : ""].filter(Boolean).join(" | ")
  };
  return normalizeGovernmentOpportunity(form);
}

function extractOpportunityLocationFields(text = "") {
  const clean = String(text || "");
  const lines = clean.split("\n").map(line => line.trim()).filter(Boolean);
  const findLine = (...patterns) => lines.find(line => patterns.some(pattern => line.toLowerCase().includes(pattern)));
  const valueAfterColon = line => line?.includes(":") ? line.split(":").slice(1).join(":").trim() : "";
  const location = extractLocationContext(clean);
  const cityStateZip = clean.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\s*,?\s+(AL|Alabama)\s+(\d{5}(?:-\d{4})?)?\b/);
  const countyMatch = clean.match(/\b([A-Z][a-z]+)\s+County\b/i);
  const place = valueAfterColon(findLine("place of performance", "performance location", "delivery location", "shipping address", "facility address", "ship to", "deliver to"))
    || (clean.match(/(?:place of performance|delivery location|shipping address|facility address|ship to|deliver to)[^\n.]{0,160}/i) || [])[0]
    || "";
  return {
    place_of_performance: place,
    city: location.city || cityStateZip?.[1] || "",
    state: location.state || (cityStateZip ? "AL" : ""),
    zip_code: location.zip || cityStateZip?.[3] || "",
    county: location.county.replace(/\s+County$/i, "") || countyMatch?.[1] || "",
    remote_virtual_allowed: /remote|virtual|online|telework|off-?site/i.test(clean) ? "yes" : "unknown",
    delivery_required: /delivery required|deliver to|ship to|delivery location|shipping address|freight|courier/i.test(clean) ? "yes" : "no",
    shipping_acceptable: /shipping acceptable|may be shipped|ship to|shipping address|fob destination/i.test(clean) ? "yes" : "unknown",
    fulfillment_type: inferFulfillmentTypes(clean)[0]
  };
}

function suggestFulfillmentPartners(text, category) {
  const combined = `${text || ""} ${category || ""}`.toLowerCase();
  const location = extractLocationContext(text);
  const list = [];
  if (/supply|supplies|materials|equipment|product|printing|books|paper|furniture|uniform|janitorial|cleaning|food|commodity|kit|parts/.test(combined))
    list.push({ role: "Supplier", reason: "Opportunity involves goods, materials, or physical products.", search: locationAwareSearchTerm(category || "government", "supplier", location) });
  if (/install|maintenance|repair|IT\b|technical|software|electrical|plumbing|hvac|landscap|security|translation|interpreter|medical|clinical|network|data|cyber/.test(combined))
    list.push({ role: "Subcontractor", reason: "Specialized labor or technical service language detected.", search: locationAwareSearchTerm(category || "government", "subcontractor", location) });
  if (/manufacturer|fabricat|produce|made|assembly|assemble/.test(combined))
    list.push({ role: "Manufacturer", reason: "Manufacturing or assembly language detected.", search: locationAwareSearchTerm(category || "government", "manufacturer", location) });
  if (/distributor|wholesale|reseller|dealer/.test(combined))
    list.push({ role: "Distributor", reason: "Distribution or resale sourcing may be needed.", search: locationAwareSearchTerm(category || "government", "distributor", location) });
  list.push({ role: "Pricing Partner", reason: "Government bids require detailed pricing and cost breakdowns.", search: "proposal pricing consultant remote government contracts" });
  if (/deliver|transport|logistics|shipping|distribution|freight|courier/.test(combined))
    list.push({ role: "Delivery â€” Logistics", reason: "Delivery or distribution requirements detected.", search: "delivery logistics partner Alabama small business" });
  if (/install|setup|deploy|configure|assembl/.test(combined))
    list.push({ role: "Installer", reason: "Installation or deployment work identified.", search: locationAwareSearchTerm(category || "government", "installer", location) });
  list.push({ role: "Proposal Support", reason: "All government bids benefit from a professional proposal writer.", search: "government proposal support remote small business" });
  if (/remote|virtual|online|web conference|email support|administrative|pricing|proposal/.test(combined))
    list.push({ role: "Remote Support", reason: "Remote support appears acceptable for admin, proposal, or pricing work.", search: "remote government contract administrative support consultant" });
  return list;
}

function generateIntakeSearchTerms(title, agency, category, text) {
  const combined = `${title || ""} ${category || ""} ${text || ""}`.toLowerCase();
  const location = extractLocationContext(text);
  const terms = [];
  if (title) terms.push(`${title} government contract`);
  if (agency) terms.push(`${agency} vendor registration`);
  if (category) terms.push(locationAwareSearchTerm(category, "small business", location));
  if (/hr\b|human resources|personnel|workforce/.test(combined)) terms.push("HR consulting Alabama", "human resources small business vendor");
  if (/training/.test(combined)) terms.push("training provider Alabama", "workforce training subcontractor");
  if (/supply|supplies|materials|furniture|medical|dme/.test(combined)) terms.push("medical furniture supplier Montgomery AL", "DME supplier Alabama", locationAwareSearchTerm(category || "commercial supplies", "supplier", location));
  if (/IT\b|technology|software|computer|network/.test(combined)) terms.push("IT subcontractor Alabama", "technology services small business");
  if (/janitorial|cleaning|custodial/.test(combined)) terms.push("commercial janitorial subcontractor 36104", locationAwareSearchTerm("janitorial", "subcontractor", location));
  if (/admin|clerical|office support/.test(combined)) terms.push("administrative services Alabama subcontractor");
  if (/delivery|logistics|shipping|freight|courier/.test(combined)) terms.push("government contract delivery partner Alabama");
  if (/pricing|proposal/.test(combined)) terms.push("proposal pricing consultant remote government contracts");
  terms.push("SAM.gov small business", "Alabama small business vendor");
  return [...new Set(terms)].slice(0, 10);
}

