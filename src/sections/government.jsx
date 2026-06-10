// Split from src/app.jsx for lazy section loading. Do not load directly; index.html compiles this file on demand.
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

const fulfillmentTypes = ["supplier", "subcontractor", "manufacturer", "distributor", "delivery/logistics", "installer", "pricing partner", "proposal support", "remote support"];

function yesNoUnknown(value, fallback = "unknown") {
  const text = String(value ?? "").toLowerCase();
  if (["yes", "true", "1"].includes(text) || value === true) return "yes";
  if (["no", "false", "0"].includes(text) || value === false) return "no";
  return fallback;
}

function normalizeRadius(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
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
  const geo = assessFulfillmentGeography(opportunity);
  const fulfillmentCategories = recommendedFulfillmentCategories({
    ...opportunity,
    fulfillment_types: inferFulfillmentTypes(`${text} ${opportunity.fulfillment_type || ""}`)
  });
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
    risks: opportunity.risks?.length ? opportunity.risks : ["Confirm past performance relevance.", "Validate deadline and required attachments.", "Confirm whether a prime partner is needed.", geo.serviceAreaAssessment],
    missing_requirements: opportunity.documents_needed?.length ? opportunity.documents_needed : ["Capability statement", "Past performance summary", "Pricing worksheet", "Subcontractor quote"],
    capability_gaps: score >= 85 ? ["Federal pricing support", "Agency-specific past performance examples"] : ["Prime partner", "Federal past performance", "Expanded delivery capacity"],
    prime_vs_subcontract: primeRecommendation,
    recommended_next_action: opportunity.next_action || "Review source documents, confirm fit, and contact potential subcontractors, suppliers, or remote support partners.",
    geography_assessment: geo.serviceAreaAssessment,
    local_subcontractor_required: geo.localSubcontractorRequired,
    supplier_shipping_acceptable: geo.supplierShippingAcceptable,
    remote_support_acceptable: geo.remoteSupportAcceptable,
    suggested_subcontractor_categories: opportunity.subcontractor_categories?.length ? opportunity.subcontractor_categories : (fulfillmentCategories.length ? fulfillmentCategories : (suggested.length ? suggested : ["Remote proposal support", "Remote pricing partner", "Specialized delivery support"])),
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
  const combinedText = `${item.title || ""} ${item.category || ""} ${item.description || ""} ${item.notes || ""}`;
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
    solicitation_number: item.solicitation_number || "",
    set_aside: item.set_aside || "",
    scope_summary: item.scope_summary || "",
    deliverables: Array.isArray(item.deliverables) ? item.deliverables : normalizeExtractedTextList(item.deliverables),
    required_capabilities: Array.isArray(item.required_capabilities) ? item.required_capabilities : normalizeExtractedTextList(item.required_capabilities),
    risks: Array.isArray(item.risks) ? item.risks : normalizeExtractedTextList(item.risks),
    extraction_confidence: item.extraction_confidence || null,
    place_of_performance: item.place_of_performance || item.location || "",
    city: item.city || "",
    state: item.state || "",
    zip_code: item.zip_code || item.zip || "",
    county: item.county || "",
    service_radius: normalizeRadius(item.service_radius),
    remote_virtual_allowed: yesNoUnknown(item.remote_virtual_allowed ?? item.remote_allowed ?? item.virtual_allowed),
    delivery_required: yesNoUnknown(item.delivery_required, "no"),
    shipping_acceptable: yesNoUnknown(item.shipping_acceptable, "unknown"),
    fulfillment_type: item.fulfillment_type || inferFulfillmentTypes(combinedText)[0],
    fulfillment_types: item.fulfillment_types || inferFulfillmentTypes(combinedText),
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
  const combinedText = `${values.title || ""} ${values.agency || ""} ${values.category || ""} ${values.description || ""} ${values.deliverables || ""} ${values.required_capabilities || ""} ${values.notes || ""}`;
  const lowerText = combinedText.toLowerCase();
  const sourceType = values.source_type || "manual";
  const extractedLocation = extractOpportunityLocationFields(combinedText);
  const deliverables = Array.isArray(values.deliverables) ? values.deliverables : normalizeExtractedTextList(values.deliverables);
  const requiredCapabilities = Array.isArray(values.required_capabilities) ? values.required_capabilities : normalizeExtractedTextList(values.required_capabilities);
  const risks = Array.isArray(values.risks) ? values.risks : normalizeExtractedTextList(values.risks);
  return normalizeDiscoveryOpportunity({
    ...extractedLocation,
    ...values,
    id: uid("manual-disc"),
    date_found: today,
    source_type: sourceType,
    source_label: "Manual Entry \u2014 Real Opportunity",
    estimated_value: Number(values.estimated_value || 0),
    deliverables,
    required_capabilities: requiredCapabilities,
    risks,
    scope_summary: values.scope_summary || values.description || "",
    extraction_confidence: values.extraction_confidence || buildExtractionConfidence(values),
    portal_login_needed: values.portal_login_needed || "unknown",
    remote_virtual_allowed: values.remote_virtual_allowed || extractedLocation.remote_virtual_allowed,
    delivery_required: values.delivery_required || extractedLocation.delivery_required,
    shipping_acceptable: values.shipping_acceptable || extractedLocation.shipping_acceptable,
    fulfillment_type: values.fulfillment_type || inferFulfillmentTypes(combinedText)[0],
    fulfillment_types: inferFulfillmentTypes(combinedText),
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
  const pop = item.placeOfPerformance || {};
  const popText = JSON.stringify(pop || {});
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
    place_of_performance: pop.fullAddress || pop.streetAddress || pop.city?.name || "",
    city: pop.city?.name || pop.city || "",
    state: pop.state?.code || pop.state?.name || pop.state || "",
    zip_code: pop.zip || pop.zipCode || "",
    county: pop.county || "",
    remote_virtual_allowed: /remote|virtual|online|telework|off-?site/i.test(text) ? "yes" : "unknown",
    delivery_required: /deliver|delivery|ship to|fob destination|shipping/i.test(text) ? "yes" : "no",
    shipping_acceptable: /shipping|ship to|fob destination/i.test(text) ? "yes" : "unknown",
    fulfillment_type: inferFulfillmentTypes(text)[0],
    fulfillment_types: inferFulfillmentTypes(text),
    local: /montgomery|alabama|\bAL\b/i.test(`${popText} ${text}`),
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
  const location = extractOpportunityLocationFields(snippet);
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
    ...location,
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
      ...extractOpportunityLocationFields(snippet),
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
    solicitation_number: "",
    naics: "",
    set_aside: "",
    description: "",
    scope_summary: "",
    deliverables: "",
    required_capabilities: "",
    risks: "",
    estimated_value: "",
    notes: "",
    portal_login_needed: "unknown",
    document_link: "",
    source_type: "manual",
    place_of_performance: "",
    city: "",
    state: "",
    zip_code: "",
    county: "",
    service_radius: "",
    remote_virtual_allowed: "unknown",
    delivery_required: "no",
    shipping_acceptable: "unknown",
    fulfillment_type: "subcontractor"
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
  const geo = assessFulfillmentGeography(opportunity);
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
    local_subcontractor_required: geo.localSubcontractorRequired,
    supplier_shipping_acceptable: geo.supplierShippingAcceptable,
    remote_support_acceptable: geo.remoteSupportAcceptable,
    service_area_assessment: geo.serviceAreaAssessment,
    fulfillment_types: opportunity.fulfillment_types,
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
    solicitation_number: opportunity.solicitation_number || `DISC-${opportunity.id}`,
    naics: opportunity.naics,
    set_aside: opportunity.set_aside || "Small business / local review",
    due_date: opportunity.due_date,
    estimated_value: opportunity.estimated_value,
    source_url: opportunity.opportunity_url,
    place_of_performance: opportunity.place_of_performance,
    city: opportunity.city,
    state: opportunity.state,
    zip_code: opportunity.zip_code,
    county: opportunity.county,
    service_radius: opportunity.service_radius,
    remote_virtual_allowed: opportunity.remote_virtual_allowed,
    delivery_required: opportunity.delivery_required,
    shipping_acceptable: opportunity.shipping_acceptable,
    fulfillment_type: opportunity.fulfillment_type,
    ai_fit_score: assessment.score,
    status: "AI Review",
    next_action: assessment.recommended_action,
    notes: `${opportunity.description}\n\nCapital-aware discovery source: ${opportunity.source}. Estimated upfront capital: ${amount(assessment.estimated_upfront_capital_required)}. Tier: ${assessment.tier}.`,
    pws_summary: opportunity.scope_summary || opportunity.description,
    summary: opportunity.scope_summary || opportunity.description,
    requirements: `Category: ${opportunity.category}. Validate solicitation requirements, insurance, bonding, timeline, and payment terms before bid.`,
    scope_of_work: opportunity.scope_summary || opportunity.description,
    deliverables: opportunity.deliverables || [],
    risks: (opportunity.risks && opportunity.risks.length ? opportunity.risks : [
      assessment.estimated_upfront_capital_required > 2000 ? "Estimated upfront capital exceeds the target limit." : "Confirm payment timing before committing costs.",
      opportunity.full_time_manageable ? "Confirm deadline workload fits evenings/weekends." : "May not be manageable while employed full-time."
    ]),
    required_capabilities: opportunity.required_capabilities && opportunity.required_capabilities.length ? opportunity.required_capabilities : [opportunity.category, "Vendor coordination", "Government response management"],
    subcontractor_categories: [...recommendedFulfillmentCategories(opportunity), "Proposal pricing"].filter(Boolean),
    documents_needed: ["Capability statement", "Pricing worksheet", "Insurance requirements review", "Subcontractor or supplier quote if needed"],
    decision: assessment.tier === "Tier C" ? "pass" : "pursue",
    ai_review: {
      why: assessment.why_this_fits_valicia,
      risks: assessment.estimated_upfront_capital_required > 2000 ? ["Upfront capital may exceed the preferred limit."] : ["Validate payment timing and contract terms."],
      missing_requirements: ["Final solicitation document", "Insurance/bonding requirements", "Pricing worksheet"],
      recommended_next_action: assessment.recommended_action,
      suggested_subcontractor_categories: recommendedFulfillmentCategories(opportunity)
    }
  });
}

function recommendedFulfillmentCategories(opportunity = {}) {
  const types = opportunity.fulfillment_types || inferFulfillmentTypes(`${opportunity.title || ""} ${opportunity.category || ""} ${opportunity.description || ""}`);
  const location = [opportunity.city, opportunity.state, opportunity.zip_code].filter(Boolean).join(" ") || opportunity.place_of_performance || "Alabama";
  return types.map(type => {
    if (type === "supplier") return opportunity.shipping_acceptable === "yes" ? "National supplier / shippable goods" : `Local supplier near ${location}`;
    if (type === "delivery/logistics") return `Regional delivery/logistics partner near ${location}`;
    if (type === "installer") return `Local installer near ${location}`;
    if (type === "pricing partner") return "Remote pricing partner";
    if (type === "proposal support") return "Remote proposal support";
    if (type === "remote support") return "Remote administrative/support partner";
    if (type === "manufacturer") return opportunity.shipping_acceptable === "yes" ? "Manufacturer with shipping capability" : `Regional manufacturer near ${location}`;
    if (type === "distributor") return opportunity.shipping_acceptable === "yes" ? "Distributor with shipping capability" : `Regional distributor near ${location}`;
    return `Local subcontractor near ${location}`;
  });
}

function scoreFulfillmentPartnerMatch(opportunity, partner, neededCategories = []) {
  const partnerText = `${partner.company_name || ""} ${partner.service_category || ""} ${partner.fulfillment_type || ""} ${partner.location || ""} ${partner.notes || ""}`.toLowerCase();
  const opportunityText = `${opportunity.title || ""} ${opportunity.category || ""} ${opportunity.fulfillment_type || ""} ${(opportunity.subcontractor_categories || []).join(" ")}`.toLowerCase();
  const geo = assessFulfillmentGeography(opportunity, partner);
  let score = 0;
  if (neededCategories.some(category => partnerText.includes(String(category).toLowerCase()))) score += 30;
  if (partner.fulfillment_type && opportunityText.includes(String(partner.fulfillment_type).toLowerCase())) score += 20;
  if (geo.localSubcontractorRequired && partner.state && opportunity.state && String(partner.state).toLowerCase() === String(opportunity.state).toLowerCase()) score += 20;
  if (geo.localSubcontractorRequired && partner.zip_code && opportunity.zip_code && String(partner.zip_code).slice(0, 3) === String(opportunity.zip_code).slice(0, 3)) score += 15;
  if (geo.supplierShippingAcceptable && (partner.national_supplier === "yes" || partner.delivery_shipping_capability === "yes")) score += 25;
  if (opportunity.delivery_required === "yes" && partner.delivery_shipping_capability === "yes") score += 25;
  if (geo.remoteSupportAcceptable && partner.remote_service === "yes") score += 20;
  if (/supplier|manufacturer|distributor/.test(partner.fulfillment_type || "") && /supplier|manufacturer|distributor/.test(opportunityText)) score += 15;
  if (/pricing partner|proposal support|remote support/.test(partner.fulfillment_type || "") && /pricing|proposal|remote|admin/.test(opportunityText)) score += 15;
  return score;
}

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
  const prefillManualOpportunity = values => {
    setManualForm({ ...getInitialManualDiscoveryForm(), ...values });
    setManualFormError("");
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
  const opportunities = useMemo(() => allDiscoveryOpportunities
    .map(item => ({ ...item, assessment: assessDiscoveryOpportunity(item) }))
    .filter(item => !archivedIds.includes(item.id)), [allDiscoveryOpportunities, archivedIds]);
  const sources = useMemo(() => ["All", ...Array.from(new Set([...opportunityDiscoverySources, ...manualOpportunities.map(item => item.source)].filter(Boolean)))], [manualOpportunities]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(opportunities.map(item => item.category)))], [opportunities]);
  const dueMatches = useMemo(() => item => {
    const days = daysUntil(item.due_date);
    if (dueFilter === "All") return true;
    if (dueFilter === "Next 14 days") return days !== null && days >= 0 && days <= 14;
    if (dueFilter === "Next 30 days") return days !== null && days >= 0 && days <= 30;
    return true;
  }, [dueFilter]);
  const visible = useMemo(() => opportunities
    .filter(item => sourceFilter === "All" || item.source === sourceFilter)
    .filter(item => categoryFilter === "All" || item.category === categoryFilter)
    .filter(item => tierFilter === "All" || item.assessment.tier === tierFilter)
    .filter(dueMatches)
    .sort((a, b) => {
      const tierWeight = tier => tier === "Tier A" ? 0 : tier === "Tier B" ? 1 : 2;
      return tierWeight(a.assessment.tier) - tierWeight(b.assessment.tier) || b.assessment.score - a.assessment.score;
    }), [opportunities, sourceFilter, categoryFilter, tierFilter, dueMatches]);
  const tierA = useMemo(() => visible.filter(item => item.assessment.tier === "Tier A").length, [visible]);
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
      <OpportunityIntakePanel onPrefill={prefillManualOpportunity} />
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
            <label>Solicitation number<input value={manualForm.solicitation_number} onChange={e => setManualField("solicitation_number", e.target.value)} /></label>
            <label>NAICS<input value={manualForm.naics} onChange={e => setManualField("naics", e.target.value)} /></label>
            <label>Set-aside<input value={manualForm.set_aside} onChange={e => setManualField("set_aside", e.target.value)} /></label>
            <label>Estimated value<input type="number" min="0" value={manualForm.estimated_value} onChange={e => setManualField("estimated_value", e.target.value)} /></label>
            <label>Portal/login needed<select value={manualForm.portal_login_needed} onChange={e => setManualField("portal_login_needed", e.target.value)}>{["unknown", "yes", "no"].map(option => <option key={option}>{option}</option>)}</select></label>
            <label>Source type<select value={manualForm.source_type} onChange={e => setManualField("source_type", e.target.value)}>{["manual", "live", "credentialed portal", "email/PDF"].map(option => <option key={option}>{option}</option>)}</select></label>
            <label>Document link<input value={manualForm.document_link} onChange={e => setManualField("document_link", e.target.value)} placeholder="PDF or shared document URL" /></label>
            <label>Place of performance<input value={manualForm.place_of_performance} onChange={e => setManualField("place_of_performance", e.target.value)} placeholder="Facility, address, or service area" /></label>
            <label>City<input value={manualForm.city} onChange={e => setManualField("city", e.target.value)} /></label>
            <label>State<input value={manualForm.state} onChange={e => setManualField("state", e.target.value)} placeholder="AL" /></label>
            <label>ZIP code<input value={manualForm.zip_code} onChange={e => setManualField("zip_code", e.target.value)} /></label>
            <label>County<input value={manualForm.county} onChange={e => setManualField("county", e.target.value)} /></label>
            <label>Service radius<input type="number" min="0" value={manualForm.service_radius} onChange={e => setManualField("service_radius", e.target.value)} /></label>
            <label>Remote/virtual allowed<select value={manualForm.remote_virtual_allowed} onChange={e => setManualField("remote_virtual_allowed", e.target.value)}>{["unknown", "yes", "no"].map(option => <option key={option}>{option}</option>)}</select></label>
            <label>Delivery required<select value={manualForm.delivery_required} onChange={e => setManualField("delivery_required", e.target.value)}>{["no", "yes", "unknown"].map(option => <option key={option}>{option}</option>)}</select></label>
            <label>Shipping acceptable<select value={manualForm.shipping_acceptable} onChange={e => setManualField("shipping_acceptable", e.target.value)}>{["unknown", "yes", "no"].map(option => <option key={option}>{option}</option>)}</select></label>
            <label>Fulfillment type<select value={manualForm.fulfillment_type} onChange={e => setManualField("fulfillment_type", e.target.value)}>{fulfillmentTypes.map(option => <option key={option}>{option}</option>)}</select></label>
          </div>
          <label>Description<textarea required rows="4" value={manualForm.description} onChange={e => setManualField("description", e.target.value)} /></label>
          <label>Deliverables<textarea rows="3" value={manualForm.deliverables} onChange={e => setManualField("deliverables", e.target.value)} placeholder="One deliverable per line." /></label>
          <label>Required capabilities<textarea rows="3" value={manualForm.required_capabilities} onChange={e => setManualField("required_capabilities", e.target.value)} placeholder="One capability per line." /></label>
          <label>Risks<textarea rows="3" value={manualForm.risks} onChange={e => setManualField("risks", e.target.value)} placeholder="One risk per line." /></label>
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
            <p className="muted"><strong>Fulfillment:</strong> {item.fulfillment_type || "subcontractor"} - <strong>Location:</strong> {[item.place_of_performance, item.city, item.state, item.zip_code].filter(Boolean).join(", ") || "Not specified"} - <strong>Remote:</strong> {item.remote_virtual_allowed} - <strong>Delivery:</strong> {item.delivery_required} - <strong>Shipping:</strong> {item.shipping_acceptable}</p>
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
              <p><strong>Geography:</strong> {assessment.service_area_assessment}</p>
              <p><strong>Local required:</strong> {assessment.local_subcontractor_required ? "Yes" : "No"} - <strong>Shipping acceptable:</strong> {assessment.supplier_shipping_acceptable ? "Yes" : "No"} - <strong>Remote acceptable:</strong> {assessment.remote_support_acceptable ? "Yes" : "No"}</p>
              <p><strong>Fulfillment types:</strong> {(assessment.fulfillment_types || []).join(", ") || "subcontractor"}</p>
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

function OpportunityIntakePanel({ onPrefill }) {
  // â”€â”€ constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const MAX_TEXT_CHARS  = 6000;   // hard cap on pasted / extracted text
  const MAX_FILE_BYTES  = 2 * 1024 * 1024; // 2 MB file size guard
  const RAW_SCAN_LIMIT  = 80000;  // only run printable-char regex over first 80 KB of raw file

  // â”€â”€ state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [intakeTab,    setIntakeTab]    = useState("text");
  const [renderedTab,  setRenderedTab]  = useState("text");
  const [tabSwitching, setTabSwitching] = useState(false);
  const [intakeText,   setIntakeText]   = useState("");
  const [intakeUrl,    setIntakeUrl]    = useState("");
  const [fileStatus,   setFileStatus]   = useState("");
  const [fileLoading,  setFileLoading]  = useState(false);
  const [editForm,     setEditForm]     = useState(null);
  const [intakeErr,    setIntakeErr]    = useState("");
  const [intakeSaved,  setIntakeSaved]  = useState(false);
  const [extractionReport, setExtractionReport] = useState(null);
  const [extractionNotice, setExtractionNotice] = useState("");
  // Fulfillment and search terms are computed ONCE when the user clicks
  // "Extract & Prefill" and stored in state — NOT recomputed on every keystroke.
  const [fulfillment,  setFulfillment]  = useState([]);
  const [searchTerms,  setSearchTerms]  = useState([]);

  const switchIntakeTab = tab => {
    if (tab === intakeTab) return;
    setIntakeTab(tab);
    setIntakeErr("");
    setExtractionNotice("");
    setTabSwitching(true);
    requestAnimationFrame(() => {
      setRenderedTab(tab);
      setTabSwitching(false);
    });
  };

  // â”€â”€ file reader â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const readFile = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Guard: reject oversized files before reading
    if (file.size > MAX_FILE_BYTES) {
      setFileStatus("File exceeds 2 MB limit — paste the solicitation text instead.");
      return;
    }
    setFileLoading(true);
    setFileStatus("Reading " + file.name + "...");
    setIntakeErr("");
    const reader = new FileReader();
    reader.onload = evt => {
      // Slice raw content BEFORE running the character-class regex to avoid
      // scanning megabytes of PDF binary on the main thread.
      const raw = String(evt.target.result || "").slice(0, RAW_SCAN_LIMIT);
      const printable = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/ {3,}/g, " ").trim();
      setFileLoading(false);
      if (printable.length < 40) {
        setFileStatus(file.name + " — binary PDF with minimal readable text. Paste the solicitation text manually below for best results.");
        setIntakeText("");
      } else {
        setFileStatus(file.name + " — " + printable.length + " readable characters extracted (capped at 6,000).");
        setIntakeText(printable.slice(0, MAX_TEXT_CHARS));
      }
    };
    reader.onerror = () => {
      setFileLoading(false);
      setFileStatus("Could not read the file. Try pasting the solicitation text instead.");
    };
    reader.readAsText(file, "utf-8");
  };

  // â”€â”€ extract handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // All regex work (parseOpportunityText, suggestFulfillmentPartners,
  // generateIntakeSearchTerms) runs ONLY when the user explicitly clicks this
  // button — never during typing or re-renders.
  const handleExtract = () => {
    const text = intakeText.trim().slice(0, MAX_TEXT_CHARS);
    const url  = intakeUrl.trim();
    if (!text && !url) { setIntakeErr("Paste solicitation text, a URL, or upload a file first."); return; }

    let sourceGuess = "Pasted text";
    if (url) {
      try { sourceGuess = new URL(url.startsWith("http") ? url : "https://" + url).hostname.replace("www.", ""); }
      catch { sourceGuess = "URL"; }
    }
    if (url && !text) {
      const form = {
        ...getInitialManualDiscoveryForm(),
        opportunity_url: url,
        source: sourceGuess,
        source_type: "credentialed portal",
        portal_login_needed: "yes"
      };
      setEditForm(form);
      setExtractionReport(buildExtractionConfidence(form));
      setExtractionNotice("URL saved. Paste solicitation text or upload a document for field extraction.");
      setIntakeErr("");
      setIntakeSaved(false);
      setFulfillment([]);
      setSearchTerms([]);
      return;
    }

    const parsed = parseOpportunityText(text, url);
    const form = {
      title:               parsed.title  || "",
      agency:              parsed.agency || "",
      due_date:            parsed.due_date || "",
      opportunity_url:     url || parsed.source_url || "",
      source:              sourceGuess,
      category:            inferDiscoveryCategory(`${parsed.title || ""} ${parsed.description || ""} ${text}`),
      solicitation_number: parsed.solicitation_number || "",
      naics:               parsed.naics || "",
      set_aside:           parsed.set_aside || "",
      description:         (parsed.description || text).slice(0, 900),
      estimated_value:     parsed.estimated_value || "",
      portal_login_needed: "unknown",
      document_link:       "",
      notes:               (parsed.notes || "").slice(0, 220),
      source_type:         url ? "url" : "email/PDF",
      deliverables:        (parsed.deliverables || []).join("\n"),
      required_capabilities: (parsed.required_capabilities || []).join("\n"),
      risks:               (parsed.risks || []).join("\n"),
      place_of_performance: parsed.place_of_performance || "",
      city:                parsed.city || "",
      state:               parsed.state || "",
      zip_code:            parsed.zip_code || "",
      county:              parsed.county || "",
      service_radius:      parsed.service_radius || "",
      remote_virtual_allowed: parsed.remote_virtual_allowed || "unknown",
      delivery_required:   parsed.delivery_required || "no",
      shipping_acceptable: parsed.shipping_acceptable || "unknown",
      fulfillment_type:    parsed.fulfillment_type || "subcontractor"
    };
    setEditForm(form);
    setExtractionReport(buildExtractionConfidence(form));
    setExtractionNotice("");
    setIntakeErr("");
    setIntakeSaved(false);

    // Compute fulfillment suggestions and search terms once, then store in
    // state — they will not be recalculated until the next Extract click.
    setFulfillment(suggestFulfillmentPartners(text || form.description, form.category));
    setSearchTerms(generateIntakeSearchTerms(form.title, form.agency, form.category, text));
  };

  // â”€â”€ field setter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const setField = (k, v) => setEditForm(prev => ({ ...prev, [k]: v }));

  // â”€â”€ save handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleAdd = () => {
    onPrefill({ ...editForm });
    setIntakeSaved(true);
    setIntakeText(""); setIntakeUrl(""); setEditForm(null);
    setFulfillment([]); setSearchTerms([]);
    setExtractionReport(null); setExtractionNotice("");
    setFileStatus(""); setIntakeErr("");
  };

  // â”€â”€ clear handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleClear = () => {
    setEditForm(null); setFulfillment([]); setSearchTerms([]);
    setExtractionReport(null); setExtractionNotice("");
    setIntakeSaved(false); setIntakeErr("");
  };

  // â”€â”€ render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="card form">
      <div className="panel-head">
        <h3>AI-Assisted Opportunity Intake</h3>
        <span className="badge success">Smart Prefill</span>
      </div>
      <p className="muted">Paste a URL, upload a PDF or text file, or paste solicitation text — fields will be pre-populated for your review before saving. Text is capped at 6,000 characters and files at 2 MB to keep the browser responsive.</p>
      {intakeSaved && <p className="badge success">Fields copied to Manual Add Opportunity. Review them, then click Add Real Opportunity.</p>}

      <div className="tabs">
        {[["text", "Paste Text"], ["url", "Paste URL"], ["file", "Upload PDF / Doc"]].map(([v, lbl]) =>
          <button key={v} type="button" className={intakeTab === v ? "active" : ""} aria-pressed={intakeTab === v} onClick={() => switchIntakeTab(v)}>{lbl}</button>
        )}
      </div>
      {tabSwitching && <p className="muted">Switching intake view...</p>}

      {renderedTab === "text" && (
        <label>Solicitation text
          <textarea rows="6" value={intakeText}
            onChange={e => setIntakeText(e.target.value.slice(0, MAX_TEXT_CHARS))}
            placeholder="Paste the full solicitation, bid notice, email body, or opportunity description here..." />
        </label>
      )}
      {renderedTab === "url" && (<>
        <label>Opportunity URL<input value={intakeUrl} onChange={e => setIntakeUrl(e.target.value)} placeholder="https://sam.gov/opp/..." /></label>
        <label>Solicitation text (paste manually if the portal requires a login)
          <textarea rows="5" value={intakeText}
            onChange={e => setIntakeText(e.target.value.slice(0, MAX_TEXT_CHARS))}
            placeholder="Paste opportunity text here. Live scraping is not available for credentialed portals." />
        </label>
      </>)}
      {renderedTab === "file" && (<>
        <label>Upload PDF or text file (max 2 MB)
          <input type="file" accept=".pdf,.txt,.doc,.docx,.rtf,.md" onChange={readFile} disabled={fileLoading} />
        </label>
        {fileLoading && <p className="muted">Reading file — please wait...</p>}
        {!fileLoading && fileStatus && <p className="muted">{fileStatus}</p>}
        <label>Extracted or additional text
          <textarea rows="4" value={intakeText}
            onChange={e => setIntakeText(e.target.value.slice(0, MAX_TEXT_CHARS))}
            placeholder="Extracted text appears here. Edit or add more context before extracting fields." />
        </label>
      </>)}

      {extractionNotice && <p className="badge">{extractionNotice}</p>}
      {intakeErr && !editForm && <p className="badge danger">{intakeErr}</p>}
      <div className="actions">
        <button className="btn" type="button" onClick={handleExtract} disabled={fileLoading || tabSwitching}>{tabSwitching ? "Switching..." : "Extract & Prefill Fields"}</button>
        {editForm && <button className="btn secondary" type="button" onClick={handleClear}>Clear</button>}
      </div>

      {editForm && (<>
        <hr />
        <h4>Review Extracted Fields</h4>
        <p className="muted">Fields have been pre-populated from your input. Correct anything that looks wrong, then copy the fields to Manual Add Opportunity for final review.</p>
        <div className="grid three-col">
          <label>Title *<input value={editForm.title} onChange={e => setField("title", e.target.value)} /></label>
          <label>Agency *<input value={editForm.agency} onChange={e => setField("agency", e.target.value)} /></label>
          <label>Due date<input type="date" value={editForm.due_date} onChange={e => setField("due_date", e.target.value)} /></label>
          <label>Opportunity URL<input value={editForm.opportunity_url} onChange={e => setField("opportunity_url", e.target.value)} /></label>
          <label>Source *<input value={editForm.source} onChange={e => setField("source", e.target.value)} placeholder="SAM.gov, Alabama Buys..." /></label>
          <label>Category *<input value={editForm.category} onChange={e => setField("category", e.target.value)} placeholder="Admin services, supplies, training..." /></label>
          <label>Solicitation number<input value={editForm.solicitation_number || ""} onChange={e => setField("solicitation_number", e.target.value)} /></label>
          <label>NAICS<input value={editForm.naics || ""} onChange={e => setField("naics", e.target.value)} /></label>
          <label>Set-aside<input value={editForm.set_aside || ""} onChange={e => setField("set_aside", e.target.value)} /></label>
          <label>Estimated value<input type="number" min="0" value={editForm.estimated_value} onChange={e => setField("estimated_value", e.target.value)} /></label>
          <label>Portal/login needed
            <select value={editForm.portal_login_needed} onChange={e => setField("portal_login_needed", e.target.value)}>
              {["unknown", "yes", "no"].map(o => <option key={o}>{o}</option>)}
            </select>
          </label>
          <label>Document link<input value={editForm.document_link} onChange={e => setField("document_link", e.target.value)} placeholder="PDF or shared doc URL" /></label>
          <label>Place of performance<input value={editForm.place_of_performance || ""} onChange={e => setField("place_of_performance", e.target.value)} placeholder="Facility, address, or service area" /></label>
          <label>City<input value={editForm.city || ""} onChange={e => setField("city", e.target.value)} /></label>
          <label>State<input value={editForm.state || ""} onChange={e => setField("state", e.target.value)} placeholder="AL" /></label>
          <label>ZIP code<input value={editForm.zip_code || ""} onChange={e => setField("zip_code", e.target.value)} /></label>
          <label>County<input value={editForm.county || ""} onChange={e => setField("county", e.target.value)} /></label>
          <label>Service radius<input type="number" min="0" value={editForm.service_radius || ""} onChange={e => setField("service_radius", e.target.value)} /></label>
          <label>Remote/virtual allowed<select value={editForm.remote_virtual_allowed || "unknown"} onChange={e => setField("remote_virtual_allowed", e.target.value)}>{["unknown", "yes", "no"].map(o => <option key={o}>{o}</option>)}</select></label>
          <label>Delivery required<select value={editForm.delivery_required || "no"} onChange={e => setField("delivery_required", e.target.value)}>{["no", "yes", "unknown"].map(o => <option key={o}>{o}</option>)}</select></label>
          <label>Shipping acceptable<select value={editForm.shipping_acceptable || "unknown"} onChange={e => setField("shipping_acceptable", e.target.value)}>{["unknown", "yes", "no"].map(o => <option key={o}>{o}</option>)}</select></label>
          <label>Fulfillment type<select value={editForm.fulfillment_type || "subcontractor"} onChange={e => setField("fulfillment_type", e.target.value)}>{fulfillmentTypes.map(o => <option key={o}>{o}</option>)}</select></label>
        </div>
        <label>Description *<textarea rows="4" value={editForm.description} onChange={e => setField("description", e.target.value)} /></label>
        <label>Deliverables<textarea rows="3" value={editForm.deliverables || ""} onChange={e => setField("deliverables", e.target.value)} placeholder="One deliverable per line." /></label>
        <label>Required capabilities<textarea rows="3" value={editForm.required_capabilities || ""} onChange={e => setField("required_capabilities", e.target.value)} placeholder="One capability per line." /></label>
        <label>Risks<textarea rows="3" value={editForm.risks || ""} onChange={e => setField("risks", e.target.value)} placeholder="One risk per line." /></label>
        <label>Notes<textarea rows="3" value={editForm.notes} onChange={e => setField("notes", e.target.value)} placeholder="Bid details, login notes, quote needs, why this looks practical." /></label>
        {extractionReport && (
          <div className="grid three-col">
            <InfoList title="Found" items={extractionReport.found.length ? extractionReport.found : ["No fields extracted yet"]} />
            <InfoList title="Needs Review" items={extractionReport.needsReview.length ? extractionReport.needsReview : ["No review flags"]} />
            <InfoList title="Missing" items={extractionReport.missing.length ? extractionReport.missing : ["No required fields missing"]} />
          </div>
        )}
        {intakeErr && <p className="badge danger">{intakeErr}</p>}
        <div className="actions"><button className="btn" type="button" onClick={handleAdd}>Copy to Manual Add Form</button></div>

        {fulfillment.length > 0 && (
          <div className="info-block">
            <h4>Fulfillment Suggestions</h4>
            <p className="muted">Based on the opportunity text, consider finding these types of partners before bidding:</p>
            {fulfillment.map(s => (
              <div key={s.role} style={{ marginBottom: ".5rem" }}>
                <strong>{s.role}:</strong> {s.reason}
                <br /><span className="muted">Search: <em>{s.search}</em></span>
              </div>
            ))}
          </div>
        )}
        {searchTerms.length > 0 && (
          <div className="info-block">
            <h4>Suggested Search Terms</h4>
            <p className="muted">Use these terms to find suppliers, subcontractors, and teaming partners online:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginTop: ".5rem" }}>
              {searchTerms.map(term => <span key={term} className="badge">{term}</span>)}
            </div>
          </div>
        )}
      </>)}
    </div>
  );
}

function GovernmentOpportunities({ governmentData, selectOpportunity, saveGovernmentOpportunity, deleteGovernmentOpportunity, setPage }) {
  const stats = useMemo(() => getGovernmentStats(governmentData), [governmentData]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [highFitOnly, setHighFitOnly] = useState(false);
  const [dueSoonOnly, setDueSoonOnly] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const statuses = ["All", "New", "AI Review", "Subcontractors", "Outreach", "Proposal", "Submitted", "Pending Award", "Awarded", "Lost", "Cancelled", "Withdrawn"];
  const visible = useMemo(() => governmentData.opportunities.filter(item => {
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesHighFit = !highFitOnly || Number(item.ai_fit_score ?? item.fit_score ?? 0) > 80;
    const days = daysUntil(item.due_date);
    const matchesDueSoon = !dueSoonOnly || (days !== null && days >= 0 && days <= 14);
    return matchesStatus && matchesHighFit && matchesDueSoon;
  }), [governmentData.opportunities, statusFilter, highFitOnly, dueSoonOnly]);
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
  const [renderedMode, setRenderedMode] = useState("text");
  const [modeSwitching, setModeSwitching] = useState(false);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [manualState, setManualState] = useState({ title: "", agency: "", solicitation_number: "", naics: "", set_aside: "", due_date: "", estimated_value: 0, source_url: "", place_of_performance: "", city: "", state: "", zip_code: "", county: "", service_radius: 0, remote_virtual_allowed: "unknown", delivery_required: "no", shipping_acceptable: "unknown", fulfillment_type: "subcontractor", notes: "" });
  const activeManual = manualState;
  const switchMode = value => {
    if (value === mode) return;
    setMode(value);
    setModeSwitching(true);
    requestAnimationFrame(() => {
      setRenderedMode(value);
      setModeSwitching(false);
    });
  };
  return <div className="modal-backdrop"><div className="modal">
    <h3>Import Opportunity</h3>
    <div className="tabs">
      {[["text", "Paste text"], ["url", "Paste URL"], ["manual", "Manual entry"]].map(([value, labelText]) => <button key={value} type="button" className={mode === value ? "active" : ""} aria-pressed={mode === value} onClick={() => switchMode(value)}>{labelText}</button>)}
    </div>
    {modeSwitching && <p className="muted">Switching import view...</p>}
    <div className="form form-grid">
      {renderedMode === "text" && <label>Opportunity text<textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste the solicitation, email, or opportunity description here..." /></label>}
      {renderedMode === "url" && <>
        <label>Opportunity URL<input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." /></label>
        <label>Opportunity text<textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste opportunity text manually. Live scraping is not enabled yet." /></label>
      </>}
      {renderedMode === "manual" && ["title", "agency", "solicitation_number", "naics", "set_aside", "due_date", "estimated_value", "source_url", "place_of_performance", "city", "state", "zip_code", "county", "service_radius", "remote_virtual_allowed", "delivery_required", "shipping_acceptable", "fulfillment_type", "notes"].map(key => <label key={key}>{label(key)}
        {key === "notes" ? <textarea value={activeManual[key] || ""} onChange={e => setManualState({ ...activeManual, [key]: e.target.value })} /> :
        ["remote_virtual_allowed", "delivery_required", "shipping_acceptable"].includes(key) ? <select value={activeManual[key] || "unknown"} onChange={e => setManualState({ ...activeManual, [key]: e.target.value })}>{["unknown", "yes", "no"].map(option => <option key={option}>{option}</option>)}</select> :
        key === "fulfillment_type" ? <select value={activeManual[key] || "subcontractor"} onChange={e => setManualState({ ...activeManual, [key]: e.target.value })}>{fulfillmentTypes.map(option => <option key={option}>{option}</option>)}</select> :
        <input type={key === "due_date" ? "date" : ["estimated_value", "service_radius"].includes(key) ? "number" : "text"} value={activeManual[key] || ""} onChange={e => setManualState({ ...activeManual, [key]: ["estimated_value", "service_radius"].includes(key) ? Number(e.target.value || 0) : e.target.value })} />}
      </label>)}
    </div>
    <div className="actions"><button className="btn secondary" type="button" onClick={onClose}>Cancel</button><button className="btn" type="button" disabled={modeSwitching} onClick={() => onImport({ text, url, manual: activeManual })}>{modeSwitching ? "Switching..." : "Save imported opportunity"}</button></div>
  </div></div>;
}

function assessFulfillmentGeography(opportunity = {}, partner = null) {
  const typeText = `${opportunity.fulfillment_type || ""} ${(opportunity.fulfillment_types || []).join(" ")} ${opportunity.category || ""}`.toLowerCase();
  const localSubcontractorRequired = /installer|delivery|logistics|janitorial|maintenance|repair|onsite|facility|subcontractor/.test(typeText) && opportunity.remote_virtual_allowed !== "yes";
  const supplierShippingAcceptable = opportunity.shipping_acceptable === "yes" || (/supplier|distributor|manufacturer/.test(typeText) && opportunity.delivery_required !== "yes");
  const remoteSupportAcceptable = opportunity.remote_virtual_allowed === "yes" || /proposal|pricing|remote support|administrative|consulting/.test(typeText);
  let serviceAreaAssessment = localSubcontractorRequired
    ? "Local or regional partner should be prioritized for the place of performance."
    : remoteSupportAcceptable
      ? "Remote support can be used for administrative, pricing, proposal, or consulting work."
      : supplierShippingAcceptable
        ? "Supplier shipping appears acceptable; national suppliers can be considered."
        : "Confirm place of performance and delivery terms before selecting partners.";
  if (partner) {
    const sameState = opportunity.state && partner.state && String(opportunity.state).toLowerCase() === String(partner.state).toLowerCase();
    const sameZip = opportunity.zip_code && partner.zip_code && String(opportunity.zip_code).slice(0, 3) === String(partner.zip_code).slice(0, 3);
    if (sameZip || sameState) serviceAreaAssessment = "Partner appears geographically aligned with the opportunity.";
    else if (partner.remote_service === "yes" && remoteSupportAcceptable) serviceAreaAssessment = "Partner is remote-capable and the opportunity appears remote-friendly.";
    else if (partner.national_supplier === "yes" && supplierShippingAcceptable) serviceAreaAssessment = "National supplier may fit because shipping appears acceptable.";
  }
  return { localSubcontractorRequired, supplierShippingAcceptable, remoteSupportAcceptable, serviceAreaAssessment };
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
    ["place_of_performance", "Place of performance"],
    ["city", "City"],
    ["state", "State"],
    ["zip_code", "ZIP code"],
    ["county", "County"],
    ["service_radius", "Service radius", "number"],
    ["remote_virtual_allowed", "Remote/virtual allowed", "select", ["unknown", "yes", "no"]],
    ["delivery_required", "Delivery required", "select", ["no", "yes", "unknown"]],
    ["shipping_acceptable", "Shipping acceptable", "select", ["unknown", "yes", "no"]],
    ["fulfillment_type", "Fulfillment type", "select", fulfillmentTypes],
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
  const outreachRows = useMemo(() => governmentData.outreach.filter(item => item.opportunity_id === opportunity.id), [governmentData.outreach, opportunity.id]);
  const reminderRows = useMemo(() => (governmentData.reminders || []).map(normalizeGovernmentReminder).filter(item => item.opportunity_id === opportunity.id), [governmentData.reminders, opportunity.id]);
  const timeline = useMemo(() => getOpportunityTimeline(opportunity, governmentData), [opportunity, governmentData]);
  const selectedPartners = useMemo(() => outreachRows.filter(row => ["Interested", "Quote Requested", "Quote Received", "Partner Selected"].includes(normalizeOutreachStatus(row.status))), [outreachRows]);
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
          {["title", "agency", "solicitation_number", "naics", "set_aside", "due_date", "estimated_value", "source_url", "place_of_performance", "city", "state", "zip_code", "county", "service_radius", "remote_virtual_allowed", "delivery_required", "shipping_acceptable", "fulfillment_type", "ai_fit_score", "status", "next_action", "notes"].map(key => (
            <label key={key}>{label(key)}
              {key === "notes" ? <textarea value={form[key] || ""} onChange={e => set(key, e.target.value)} /> :
              key === "status" ? <select value={form.status || "New"} onChange={e => set("status", e.target.value)}>{["New", "AI Review", "Subcontractors", "Outreach", "Proposal", "Submitted", "Pending Award", "Awarded", "Lost", "Cancelled", "Withdrawn"].map(item => <option key={item}>{item}</option>)}</select> :
              ["remote_virtual_allowed", "delivery_required", "shipping_acceptable"].includes(key) ? <select value={form[key] || "unknown"} onChange={e => set(key, e.target.value)}>{["unknown", "yes", "no"].map(item => <option key={item}>{item}</option>)}</select> :
              key === "fulfillment_type" ? <select value={form[key] || "subcontractor"} onChange={e => set(key, e.target.value)}>{fulfillmentTypes.map(item => <option key={item}>{item}</option>)}</select> :
              <input type={["estimated_value", "ai_fit_score", "service_radius"].includes(key) ? "number" : key === "due_date" ? "date" : "text"} value={form[key] || ""} onChange={e => set(key, ["estimated_value", "ai_fit_score", "service_radius"].includes(key) ? Number(e.target.value || 0) : e.target.value)} />}
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
          <InfoBlock title="Fulfillment geography" text={review.geography_assessment || assessFulfillmentGeography(opportunity).serviceAreaAssessment} />
          <InfoBlock title="Location rules" text={`Local subcontractor required: ${review.local_subcontractor_required ? "Yes" : "No"}. Supplier shipping acceptable: ${review.supplier_shipping_acceptable ? "Yes" : "No"}. Remote support acceptable: ${review.remote_support_acceptable ? "Yes" : "No"}.`} />
          <InfoBlock title="Recommended next action" text={review.recommended_next_action} />
        </div>
        <div className="card">
          <InfoList title="Capability gaps" items={review.capability_gaps} />
          <InfoList title="Risks" items={review.risks} />
          <InfoList title="Missing requirements" items={review.missing_requirements} />
          <InfoList title="Suggested fulfillment partner categories" items={review.suggested_subcontractor_categories} />
        </div>
      </div>
    </>
  );
}

function SubcontractorFinder({ governmentData, updateGovernmentData, selectedOpportunity, setPage }) {
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState(normalizeGovernmentSubcontractor({ status: "not contacted", sam_registration_status: "unknown" }));
  const neededCategories = useMemo(() => selectedOpportunity.subcontractor_categories?.length
    ? selectedOpportunity.subcontractor_categories
    : generateAIFitAnalysis(selectedOpportunity).suggested_subcontractor_categories, [selectedOpportunity]);
  const matchScore = item => scoreFulfillmentPartnerMatch(selectedOpportunity, item, neededCategories);
  const searchableSubcontractors = useMemo(() => governmentData.subcontractors.map(item => ({
    item,
    search: `${item.company_name || ""} ${item.contact_name || ""} ${item.email || ""} ${item.phone || ""} ${item.service_category || ""} ${item.fulfillment_type || ""} ${item.location || ""} ${item.city || ""} ${item.state || ""} ${item.zip_code || ""} ${item.status || ""} ${item.notes || ""}`.toLowerCase()
  })), [governmentData.subcontractors]);
  const visible = useMemo(() => {
    const query = filter.toLowerCase();
    return searchableSubcontractors
      .filter(row => row.search.includes(query))
      .map(row => row.item)
      .sort((a, b) => matchScore(b) - matchScore(a));
  }, [searchableSubcontractors, filter, selectedOpportunity, neededCategories]);
  const selectedOutreach = useMemo(() => governmentData.outreach.filter(item => item.opportunity_id === selectedOpportunity.id), [governmentData.outreach, selectedOpportunity.id]);
  const attachedIds = useMemo(() => new Set(selectedOutreach.map(item => item.subcontractor_id)), [selectedOutreach]);
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
      <Title title="Subcontractor Finder" subtitle={`Fulfillment finder and partner CRM for ${selectedOpportunity.title}.`} action={<button className="btn" onClick={() => setPage("Outreach Tracker")}>Open outreach</button>} />
      <div className="card">
        <div className="panel-head"><h3>Subcontractor Needs</h3><span className="mode">{selectedOutreach.length} attached</span></div>
        <div className="tabs section-tabs">{neededCategories.map(category => <button key={category} className="active" onClick={() => setFilter(category)}>{category}</button>)}</div>
        <p className="muted">Fulfillment logic prioritizes local partners for service contracts, regional partners for delivery/logistics, national suppliers for shippable products, and remote partners for admin, proposal, and pricing work.</p>
        <div className="mini-metrics">
          <span><b>{selectedOpportunity.fulfillment_type || "subcontractor"}</b><small>fulfillment type</small></span>
          <span><b>{[selectedOpportunity.city, selectedOpportunity.state, selectedOpportunity.zip_code].filter(Boolean).join(" ") || "TBD"}</b><small>service location</small></span>
          <span><b>{selectedOpportunity.remote_virtual_allowed}</b><small>remote allowed</small></span>
          <span><b>{selectedOpportunity.shipping_acceptable}</b><small>shipping acceptable</small></span>
        </div>
      </div>
      <div className="card form">
        <div className="panel-head"><h3>Add subcontractor</h3><span className="badge">Prime contractor CRM</span></div>
        <div className="form-grid">
          <label>Company name<input value={form.company_name} onChange={e => updateForm({ company_name: e.target.value })} /></label>
          <label>Contact name<input value={form.contact_name} onChange={e => updateForm({ contact_name: e.target.value })} /></label>
          <label>Email<input type="email" value={form.email} onChange={e => updateForm({ email: e.target.value })} /></label>
          <label>Phone<input value={form.phone} onChange={e => updateForm({ phone: e.target.value })} /></label>
          <label>Service category<input value={form.service_category} onChange={e => updateForm({ service_category: e.target.value })} /></label>
          <label>Fulfillment type<select value={form.fulfillment_type} onChange={e => updateForm({ fulfillment_type: e.target.value })}>{fulfillmentTypes.map(type => <option key={type}>{type}</option>)}</select></label>
          <label>Location<input value={form.location} onChange={e => updateForm({ location: e.target.value })} /></label>
          <label>City<input value={form.city} onChange={e => updateForm({ city: e.target.value })} /></label>
          <label>State<input value={form.state} onChange={e => updateForm({ state: e.target.value })} /></label>
          <label>ZIP code<input value={form.zip_code} onChange={e => updateForm({ zip_code: e.target.value })} /></label>
          <label>Service area/radius<input type="number" min="0" value={form.service_area_radius || ""} onChange={e => updateForm({ service_area_radius: e.target.value })} /></label>
          <label>Remote service<select value={form.remote_service} onChange={e => updateForm({ remote_service: e.target.value })}>{["no", "yes", "unknown"].map(option => <option key={option}>{option}</option>)}</select></label>
          <label>Delivery/shipping capability<select value={form.delivery_shipping_capability} onChange={e => updateForm({ delivery_shipping_capability: e.target.value })}>{["no", "yes", "unknown"].map(option => <option key={option}>{option}</option>)}</select></label>
          <label>National supplier<select value={form.national_supplier} onChange={e => updateForm({ national_supplier: e.target.value })}>{["no", "yes", "unknown"].map(option => <option key={option}>{option}</option>)}</select></label>
          <label>SAM registered<select value={form.sam_registration_status} onChange={e => updateForm({ sam_registration_status: e.target.value })}>{samRegistrationOptions.map(option => <option key={option} value={option}>{label(option)}</option>)}</select></label>
          <label>Status<select value={form.status} onChange={e => updateForm({ status: e.target.value })}>{subcontractorStatuses.map(status => <option key={status} value={status}>{label(status)}</option>)}</select></label>
          <label>Last contacted date<input type="date" value={form.last_contact_date || ""} onChange={e => updateForm({ last_contact_date: e.target.value })} /></label>
          <label>Next follow-up date<input type="date" value={form.next_follow_up_date || ""} onChange={e => updateForm({ next_follow_up_date: e.target.value })} /></label>
        </div>
        <label>Notes<textarea value={form.notes || ""} onChange={e => updateForm({ notes: e.target.value })} /></label>
        <div className="actions"><button className="btn" onClick={addSubcontractor}>Add to CRM</button></div>
      </div>
      <div className="card">
        <div className="toolbar"><input placeholder="Search by company, service, location, fulfillment type, status..." value={filter} onChange={e => setFilter(e.target.value)} /></div>
        <div className="table-wrap subcontractor-crm"><table><thead><tr>{["company", "contact", "email", "phone", "service_category", "fulfillment_type", "location", "service_area", "remote", "delivery_shipping", "national_supplier", "SAM_registered", "status", "last_contacted", "next_follow_up", "notes"].map(c => <th key={c}>{label(c)}</th>)}<th>Actions</th></tr></thead><tbody>
          {visible.map(item => <tr key={item.id}>
            <td><strong>{item.company_name}</strong>{matchScore(item) ? <span className="muted table-subline">Suggested match: {matchScore(item)} pts</span> : null}{attachedIds.has(item.id) ? <span className="badge success table-subline">Attached</span> : null}</td>
            <td><input value={item.contact_name || ""} onChange={e => patchSubcontractor(item.id, { contact_name: e.target.value })} /></td>
            <td><input type="email" value={item.email || ""} onChange={e => patchSubcontractor(item.id, { email: e.target.value })} /></td>
            <td><input value={item.phone || ""} onChange={e => patchSubcontractor(item.id, { phone: e.target.value })} /></td>
            <td><input value={item.service_category || ""} onChange={e => patchSubcontractor(item.id, { service_category: e.target.value })} /></td>
            <td><select value={item.fulfillment_type || "subcontractor"} onChange={e => patchSubcontractor(item.id, { fulfillment_type: e.target.value })}>{fulfillmentTypes.map(type => <option key={type}>{type}</option>)}</select></td>
            <td><input value={item.location || ""} onChange={e => patchSubcontractor(item.id, { location: e.target.value })} placeholder="City, state, or service area" /><input value={item.city || ""} onChange={e => patchSubcontractor(item.id, { city: e.target.value })} placeholder="City" /><input value={item.state || ""} onChange={e => patchSubcontractor(item.id, { state: e.target.value })} placeholder="State" /><input value={item.zip_code || ""} onChange={e => patchSubcontractor(item.id, { zip_code: e.target.value })} placeholder="ZIP" /></td>
            <td><input type="number" value={item.service_area_radius || ""} onChange={e => patchSubcontractor(item.id, { service_area_radius: e.target.value })} /></td>
            <td><select value={item.remote_service || "no"} onChange={e => patchSubcontractor(item.id, { remote_service: e.target.value })}>{["no", "yes", "unknown"].map(option => <option key={option}>{option}</option>)}</select></td>
            <td><select value={item.delivery_shipping_capability || "no"} onChange={e => patchSubcontractor(item.id, { delivery_shipping_capability: e.target.value })}>{["no", "yes", "unknown"].map(option => <option key={option}>{option}</option>)}</select></td>
            <td><select value={item.national_supplier || "no"} onChange={e => patchSubcontractor(item.id, { national_supplier: e.target.value })}>{["no", "yes", "unknown"].map(option => <option key={option}>{option}</option>)}</select></td>
            <td><select value={item.sam_registration_status || "unknown"} onChange={e => patchSubcontractor(item.id, { sam_registration_status: e.target.value })}>{samRegistrationOptions.map(option => <option key={option} value={option}>{label(option)}</option>)}</select></td>
            <td><select value={item.status} onChange={e => patchSubcontractor(item.id, { status: e.target.value })}>{subcontractorStatuses.map(status => <option key={status} value={status}>{label(status)}</option>)}</select></td>
            <td><input type="date" value={item.last_contact_date || ""} onChange={e => patchSubcontractor(item.id, { last_contact_date: e.target.value })} /></td>
            <td><input type="date" value={item.next_follow_up_date || ""} onChange={e => patchSubcontractor(item.id, { next_follow_up_date: e.target.value })} /></td>
            <td><textarea value={item.notes || ""} onChange={e => patchSubcontractor(item.id, { notes: e.target.value })} /></td>
            <td><button className="btn secondary" onClick={() => attachToOutreach(item.id)}>{attachedIds.has(item.id) ? "Open" : "Attach"}</button></td>
          </tr>)}
          {!visible.length && <tr><td colSpan="17" className="muted">{governmentData.subcontractors.length ? "No partners match this filter." : "No subcontractors, suppliers, or fulfillment partners in the CRM yet. Add real partners here, then attach them to opportunities."}</td></tr>}
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
  const baseRows = useMemo(() => governmentData.outreach.filter(item => opportunityFilter === "all" || item.opportunity_id === opportunityFilter), [governmentData.outreach, opportunityFilter]);
  const followUpMatches = useMemo(() => row => {
    if (followUpFilter === "all") return true;
    const days = daysUntil(row.follow_up_date);
    if (followUpFilter === "due") return days !== null && days <= 0;
    if (followUpFilter === "next7") return days !== null && days >= 0 && days <= 7;
    if (followUpFilter === "missing") return !row.follow_up_date;
    return true;
  }, [followUpFilter]);
  const rows = useMemo(() => baseRows.filter(item => {
    const matchesStatus = statusFilter === "All" || normalizeOutreachStatus(item.status) === statusFilter;
    return matchesStatus && followUpMatches(item);
  }), [baseRows, statusFilter, followUpMatches]);
  const stats = useMemo(() => getOutreachStats(rows), [rows]);
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

