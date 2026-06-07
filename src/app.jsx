const { useEffect, useMemo, useState } = React;

const today = "2026-06-06";
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
  { category: "Revenue", pages: ["Revenue", "Universal Opportunities", "Funding Opportunities", "Eligibility Review", "Application Drafts", "Required Documents", "Budget & Narrative", "Submission Tracker", "Awards/Outcomes"] },
  { category: "HR Consulting", pages: ["Clients", "Contacts", "Engagements", "Cases", "Investigations", "Documents", "Invoices", "Reports"] },
  { category: "Government", pages: ["Opportunities", "Opportunity Detail", "AI Fit Review", "Subcontractor Finder", "Outreach Tracker", "Reminder Queue", "Awards"] },
  { category: "Operations", pages: ["Automations", "n8n Workflows", "Workflow Health", "Logs", "Tasks", "Calendar/Deadlines"] },
  { category: "AI Workspace", pages: ["HR Document Generator", "Government Proposal Assistant", "Capability Statement Generator", "Investigation Report Generator", "Email Writer", "Prompt Library"] },
  { category: "Admin", pages: ["Settings", "Users", "Integrations", "API Keys/Secrets", "Storage", "System Status"] }
];

const hrPages = ["Clients", "Contacts", "Engagements", "Cases", "Investigations", "Documents", "Invoices", "Reports"];
const revenuePages = ["Universal Opportunities"];
const fundingPages = ["Funding Opportunities", "Eligibility Review", "Application Drafts", "Required Documents", "Budget & Narrative", "Submission Tracker", "Awards/Outcomes"];
const governmentPages = ["Opportunities", "Opportunity Detail", "AI Fit Review", "Subcontractor Finder", "Outreach Tracker", "Reminder Queue", "Awards"];
const operationsPages = ["Automations", "n8n Workflows", "Workflow Health", "Logs", "Tasks", "Calendar/Deadlines"];
const aiWorkspacePages = ["Government Proposal Assistant", "Capability Statement Generator", "Investigation Report Generator", "Email Writer", "Prompt Library"];
const adminPages = ["Users", "Integrations", "API Keys/Secrets", "Storage", "System Status"];

const operationsMock = {
  highestValueActions: [
    { title: "Submit Riverbend renewal proposal", detail: "Contract ends 2026-12-31. Draft terms and send by Friday.", status: "High value" },
    { title: "Review SAM opportunity fit", detail: "HR compliance support solicitation closes soon.", status: "Due soon" },
    { title: "Publish HR AI OS product update", detail: "Add screenshots and one email campaign for Gumroad/Stan.", status: "Revenue" }
  ],
  governmentOpportunities: [
    { title: "HR Compliance Advisory Support", agency: "Department of Labor", due: "2026-06-14", fit: 88, value: "$145,000" },
    { title: "Employee Relations Training", agency: "GSA", due: "2026-06-21", fit: 74, value: "$82,000" }
  ],
  automations: [
    { title: "Invoice overdue sweep", detail: "Ready to run daily at 8:00 AM.", status: "Healthy" },
    { title: "Lead capture to CRM", detail: "Waiting on n8n webhook URL.", status: "Needs connection" },
    { title: "Government opportunity digest", detail: "Mock feed active until API is connected.", status: "Mock" }
  ],
  deadlines: [
    { title: "Magnolia Care retainer due", date: "2026-06-04", type: "Invoice" },
    { title: "Investigation follow-up", date: "2026-06-10", type: "Client" },
    { title: "Proposal outline review", date: "2026-06-12", type: "Government" }
  ],
  recentSales: [
    { source: "Gumroad", item: "HR AI OS Starter Kit", amount: "$49", date: "Today" },
    { source: "Etsy", item: "HR Investigation Checklist", amount: "$12", date: "Yesterday" },
    { source: "Stan Store", item: "HR Compliance Mini Toolkit", amount: "$27", date: "This week" }
  ],
  opportunities: [
    { title: "HR Compliance Advisory Support", agency: "Department of Labor", solicitation_number: "DOL-26-HR-104", naics: "541612", set_aside: "WOSB", due_date: "2026-06-14", status: "Reviewing", fit_score: 88, estimated_value: 145000, next_action: "Draft capability match notes" },
    { title: "Employee Relations Training", agency: "GSA", solicitation_number: "GSA-26-ER-219", naics: "611430", set_aside: "Small Business", due_date: "2026-06-21", status: "Pipeline", fit_score: 74, estimated_value: 82000, next_action: "Confirm subcontractor capacity" },
    { title: "Workplace Investigation Support", agency: "VA", solicitation_number: "VA-26-INV-033", naics: "541611", set_aside: "SDVOSB partner", due_date: "2026-07-02", status: "Partner needed", fit_score: 69, estimated_value: 210000, next_action: "Identify prime partner" }
  ]
};

const defaultGovernmentData = {
  selectedOpportunityId: "gov-1",
  opportunities: [
    {
      id: "gov-1",
      title: "HR Compliance Advisory Support",
      agency: "Department of Labor",
      solicitation_number: "DOL-26-HR-104",
      naics: "541612",
      set_aside: "WOSB",
      due_date: "2026-06-14",
      estimated_value: 145000,
      status: "AI Review",
      fit_score: 88,
      next_action: "Draft subcontractor outreach",
      source_url: "https://sam.gov/mock/dol-26-hr-104",
      notes: "Strong fit for HR compliance, investigations, and employee relations advisory support.",
      pws_summary: "Provide HR compliance advisory support, workplace policy review, training recommendations, and investigation guidance for agency HR leaders.",
      ai_executive_summary: "This is a strong opportunity for V Solutions because it aligns with HR compliance, employee relations, documentation, and workplace investigation expertise. A subcontractor or teaming partner may strengthen federal past performance and pricing depth.",
      summary: "Agency needs HR compliance advisory support, policy review, and workplace investigation guidance.",
      requirements: "HR compliance expertise, federal contracting readiness, training support, documented past performance, and scalable response capacity.",
      scope_of_work: "Review HR practices, advise on compliance questions, support documentation standards, and provide investigation and employee relations guidance.",
      deliverables: ["Compliance advisory memo", "Policy review findings", "Training recommendations", "Investigation support summary", "Monthly status report"],
      risks: ["Federal past performance may need a teaming partner.", "Pricing support is needed before submission.", "Scope may require rapid response capacity."],
      required_capabilities: ["HR compliance", "Employee relations", "Workplace investigations", "Policy review", "Federal contracting readiness"],
      subcontractor_categories: ["Federal HR compliance", "Proposal pricing", "Training facilitation"],
      documents_needed: ["Capability statement", "Past performance summary", "Price quote", "Subcontractor commitment letter"],
      decision: "pursue",
      ai_review: {
        why: "This aligns with Valicia's HR compliance, employee relations, investigations, and fractional HR advisory experience.",
        risks: ["Federal past performance may need a teaming partner.", "Pricing support is needed before submission."],
        missing_requirements: ["Prime/subcontractor role clarity", "Formal pricing worksheet", "Agency-specific past performance examples"],
        recommended_next_action: "Contact two HR compliance subcontractors and one pricing partner by tomorrow.",
        suggested_subcontractor_categories: ["Federal HR compliance", "Proposal pricing", "Training facilitation"]
      }
    },
    {
      id: "gov-2",
      title: "Employee Relations Training",
      agency: "GSA",
      solicitation_number: "GSA-26-ER-219",
      naics: "611430",
      set_aside: "Small Business",
      due_date: "2026-06-21",
      estimated_value: 82000,
      status: "Subcontractors",
      fit_score: 74,
      next_action: "Confirm training delivery partner",
      source_url: "https://sam.gov/mock/gsa-26-er-219",
      notes: "Good fit if training delivery capacity can be expanded.",
      pws_summary: "Design and deliver employee relations training for supervisors and HR staff with supporting materials and reporting.",
      ai_executive_summary: "Valicia can lead the HR subject matter expertise while a training partner can expand facilitation capacity and instructional design support.",
      summary: "Training support for supervisors and HR teams on employee relations and compliant documentation.",
      requirements: "Curriculum design, live facilitation, training materials, virtual delivery, and evaluation reporting.",
      scope_of_work: "Develop training outline, create participant materials, deliver sessions, collect feedback, and provide final training report.",
      deliverables: ["Training curriculum", "Facilitator guide", "Participant workbook", "Attendance/feedback report"],
      risks: ["May require more facilitators than currently available.", "Training sample deck may be required quickly."],
      required_capabilities: ["Employee relations", "Training facilitation", "Instructional design", "Evaluation reporting"],
      subcontractor_categories: ["Training facilitation", "Instructional design"],
      documents_needed: ["Training sample", "Facilitator bio", "Capability statement"],
      decision: "maybe",
      ai_review: {
        why: "Valicia can lead HR subject matter expertise and partner for scale.",
        risks: ["May require more facilitators than currently available."],
        missing_requirements: ["Training sample deck", "Bench of facilitators"],
        recommended_next_action: "Ask training partner for availability and sample pricing.",
        suggested_subcontractor_categories: ["Training facilitation", "Instructional design"]
      }
    },
    {
      id: "gov-3",
      title: "Workplace Investigation Support",
      agency: "VA",
      solicitation_number: "VA-26-INV-033",
      naics: "541611",
      set_aside: "SDVOSB partner",
      due_date: "2026-07-02",
      estimated_value: 210000,
      status: "Partner Needed",
      fit_score: 69,
      next_action: "Identify prime partner",
      source_url: "https://sam.gov/mock/va-26-inv-033",
      notes: "Could be promising with the right SDVOSB prime.",
      pws_summary: "Support workplace investigations, interviews, report writing, confidentiality practices, and case documentation.",
      ai_executive_summary: "The work aligns with investigation strengths, but the set-aside and capacity requirements make this better as a subcontracting or teaming opportunity.",
      summary: "Agency seeks workplace investigation support and neutral report writing.",
      requirements: "Investigators, interview protocols, report templates, confidentiality practices, and government contract vehicle access.",
      scope_of_work: "Conduct intake review, support interviews, document findings, draft investigation reports, and maintain confidential case files.",
      deliverables: ["Investigation plan", "Interview summaries", "Evidence review log", "Findings report", "Recommended action memo"],
      risks: ["Set-aside requires partner alignment.", "Volume could exceed solo capacity.", "Legal review may be needed."],
      required_capabilities: ["Workplace investigations", "Interviewing", "Report writing", "Confidential records", "Legal review coordination"],
      subcontractor_categories: ["SDVOSB prime", "Workplace investigators", "Legal review"],
      documents_needed: ["Investigation capability statement", "Sample report outline", "Teaming agreement"],
      decision: "maybe",
      ai_review: {
        why: "Investigation workflow fits existing HRM capabilities, but partner requirements matter.",
        risks: ["Set-aside requires partner alignment.", "Volume could exceed solo capacity."],
        missing_requirements: ["SDVOSB prime partner", "Investigator bench", "Legal review partner"],
        recommended_next_action: "Shortlist prime partners and send intro outreach.",
        suggested_subcontractor_categories: ["SDVOSB prime", "Workplace investigators", "Legal review"]
      }
    }
  ],
  subcontractors: [
    { id: "sub-1", company_name: "Carter Federal HR Advisors", service_category: "Federal HR compliance", location: "Atlanta, GA", contact_name: "Monique Carter", email: "monique@example.com", phone: "404-555-0138", SAM_registered: true, status: "Interested", last_contact_date: "2026-06-02", notes: "Strong compliance background and available for advisory support." },
    { id: "sub-2", company_name: "Pine Ridge Proposal Pricing", service_category: "Proposal pricing", location: "Birmingham, AL", contact_name: "Evan Price", email: "evan@example.com", phone: "205-555-0174", SAM_registered: true, status: "Email sent", last_contact_date: "2026-06-03", notes: "Can help with rate card and price narrative." },
    { id: "sub-3", company_name: "Magnolia Training Partners", service_category: "Training facilitation", location: "Montgomery, AL", contact_name: "Tasha Green", email: "tasha@example.com", phone: "334-555-0112", SAM_registered: false, status: "Follow up needed", last_contact_date: "2026-06-01", notes: "Great training bench; needs SAM registration check." },
    { id: "sub-4", company_name: "ValorGov Solutions", service_category: "SDVOSB prime", location: "Nashville, TN", contact_name: "Andre Willis", email: "andre@example.com", phone: "615-555-0188", SAM_registered: true, status: "Not contacted", last_contact_date: "", notes: "Potential prime partner for VA opportunity." }
  ],
  outreach: [
    { id: "out-1", opportunity_id: "gov-1", subcontractor_id: "sub-1", status: "interested", follow_up_date: "2026-06-06", last_contact_date: "2026-06-02", draft_email: "", notes: "Asked for scope details and timeline." },
    { id: "out-2", opportunity_id: "gov-1", subcontractor_id: "sub-2", status: "email sent", follow_up_date: "2026-06-07", last_contact_date: "2026-06-03", draft_email: "", notes: "Waiting on pricing support availability." },
    { id: "out-3", opportunity_id: "gov-2", subcontractor_id: "sub-3", status: "follow up needed", follow_up_date: "2026-06-09", last_contact_date: "2026-06-01", draft_email: "", notes: "Need training delivery capacity and sample quote." }
  ],
  reminders: [
    { id: "rem-1", opportunity_id: "gov-1", subcontractor_id: "sub-1", type: "Outreach follow-up", due_date: "2026-06-06", priority: "High", status: "Pending", notes: "Follow up with Carter Federal HR Advisors.", completed_at: "" },
    { id: "rem-2", opportunity_id: "gov-1", subcontractor_id: "", type: "Opportunity due date", due_date: "2026-06-14", priority: "High", status: "Pending", notes: "Proposal due soon.", completed_at: "" }
  ],
  awards: [
    { id: "awd-1", opportunity_id: "gov-0", agency: "Mock State Agency", award_amount: 24000, start_date: "2026-05-01", end_date: "2026-08-31", subcontractors_used: "None", status: "Active", notes: "Sample award record for future tracking." }
  ]
};

const revenueChannels = [
  { name: "Etsy", today: 12, month: 318, pending: 0, pipeline: 1200, recent: "Investigation checklist sold" },
  { name: "Gumroad", today: 49, month: 735, pending: 0, pipeline: 2500, recent: "HR AI OS Starter Kit sold" },
  { name: "Stan Store", today: 27, month: 486, pending: 0, pipeline: 1800, recent: "Compliance mini toolkit sold" },
  { name: "TikTok Shop future", today: 0, month: 0, pending: 0, pipeline: 900, recent: "Setup pending" },
  { name: "HR AI OS", today: 0, month: 1299, pending: 0, pipeline: 6500, recent: "Demo follow-up scheduled" },
  { name: "HR Consulting", today: 0, month: 2500, pending: 1800, pipeline: 9200, recent: "Riverbend retainer paid" },
  { name: "Government Pipeline", today: 0, month: 0, pending: 0, pipeline: 437000, recent: "DOL opportunity added" }
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

const universalOpportunitySeed = [
  {
    id: "ai-opp-1",
    type: "AI Service Opportunity",
    title: "HR AI Workflow Setup Package",
    source: "Inbound discovery call",
    estimated_value: 4500,
    fit_score: 91,
    deadline: "2026-06-24",
    status: "AI Review",
    next_action: "Create service scope and implementation timeline",
    required_documents: ["Service proposal", "Implementation checklist", "Client intake notes"],
    notes: "High-fit service opportunity for automating HR documentation and client intake."
  },
  {
    id: "speak-opp-1",
    type: "Speaking/Training Opportunity",
    title: "Small Business HR Compliance Workshop",
    source: "Local business association",
    estimated_value: 2500,
    fit_score: 84,
    deadline: "2026-07-01",
    status: "Outreach",
    next_action: "Send workshop outline and speaker bio",
    required_documents: ["Speaker bio", "Workshop outline", "W-9", "Prior training samples"],
    notes: "Good brand-building and lead-generation opportunity."
  }
];

const defaultFundingData = {
  selectedFundingId: "fund-1",
  opportunities: [
    {
      id: "fund-1",
      title: "Women-Owned Business Growth Grant",
      funder: "Mock Local Economic Development Office",
      funding_type: "grant",
      amount_available: 25000,
      deadline: "2026-06-18",
      eligibility_status: "Likely eligible",
      fit_score: 86,
      required_documents: ["capability statement", "business license", "WOSB certification", "budget", "resume/bio"],
      application_url: "https://example.com/mock-growth-grant",
      status: "drafting",
      next_action: "Draft use of funds and community impact sections",
      notes: "Good fit for expanding HR AI OS and government contracting readiness.",
      eligibility_review: {
        eligibility_match: "Strong match as a woman-owned consulting business with growth plans and documented service offerings.",
        concerns: ["Need a concise budget narrative.", "May need proof of local business registration."],
        missing_documents: ["Updated capability statement", "Budget", "WOSB certification"],
        recommended_next_action: "Complete budget and owner background draft before document upload."
      },
      drafts: {},
      budget_narrative: {
        budget_total: 25000,
        use_of_funds: "Software, automation setup, proposal support, marketing, and delivery capacity for HR consulting products.",
        narrative: "Funding will help V Solutions LLC expand operations, improve service delivery, and increase access to practical HR compliance tools for small businesses."
      },
      documents: fundingDocumentTypes.map(name => ({ name, status: ["capability statement", "business license", "resume/bio"].includes(name) ? "ready" : "needed", notes: "" })),
      outcome: { status: "not started", submitted_date: "", award_amount: 0, decision_date: "", notes: "" }
    },
    {
      id: "fund-2",
      title: "Digital Product Micro-Grant",
      funder: "Mock Creator Economy Fund",
      funding_type: "pitch competition",
      amount_available: 10000,
      deadline: "2026-06-28",
      eligibility_status: "Reviewing",
      fit_score: 78,
      required_documents: ["business license", "budget", "prior work samples", "bank statements"],
      application_url: "https://example.com/mock-creator-grant",
      status: "reviewing",
      next_action: "Confirm revenue history and upload product samples",
      notes: "Could support HR templates, mini-courses, and AI workflow products.",
      eligibility_review: {
        eligibility_match: "Moderate fit because digital product revenue and business model are aligned.",
        concerns: ["May require monthly sales proof.", "Pitch deck may be needed."],
        missing_documents: ["Bank statements", "Prior work samples"],
        recommended_next_action: "Gather recent sales screenshots and create one-page product roadmap."
      },
      drafts: {},
      budget_narrative: {
        budget_total: 10000,
        use_of_funds: "Design, product development, video production, and launch campaigns.",
        narrative: "Funding will accelerate digital HR product development and expand affordable compliance support."
      },
      documents: fundingDocumentTypes.map(name => ({ name, status: ["business license"].includes(name) ? "ready" : "needed", notes: "" })),
      outcome: { status: "reviewing", submitted_date: "", award_amount: 0, decision_date: "", notes: "" }
    },
    {
      id: "fund-3",
      title: "State Small Business Technology Loan",
      funder: "Mock State Development Authority",
      funding_type: "loan",
      amount_available: 50000,
      deadline: "2026-07-15",
      eligibility_status: "Maybe",
      fit_score: 64,
      required_documents: ["tax documents", "bank statements", "budget", "business license"],
      application_url: "https://example.com/mock-tech-loan",
      status: "documents needed",
      next_action: "Decide whether loan terms fit growth plan",
      notes: "Potential but less ideal than grants because it adds repayment obligation.",
      eligibility_review: {
        eligibility_match: "Possible match if technology expansion costs are documented.",
        concerns: ["Debt may not be preferred.", "Financial documents must be current."],
        missing_documents: ["Tax documents", "Bank statements", "Detailed budget"],
        recommended_next_action: "Review loan terms before drafting."
      },
      drafts: {},
      budget_narrative: {
        budget_total: 50000,
        use_of_funds: "Technology stack, automation, secure document workflows, and implementation support.",
        narrative: "Loan proceeds would support infrastructure for scalable HR consulting and AI-enabled operations."
      },
      documents: fundingDocumentTypes.map(name => ({ name, status: "needed", notes: "" })),
      outcome: { status: "documents needed", submitted_date: "", award_amount: 0, decision_date: "", notes: "" }
    }
  ]
};

const seed = {
  ...emptyData,
  settings: defaultSettings,
  clients: [
    { id: "c1", owner_id: demoOwnerId, company_name: "Riverbend Manufacturing", industry: "Manufacturing", employee_count: 86, address: "1200 Commerce Dr", city: "Montgomery", state: "AL", website: "https://example.com", status: "Active", contract_start_date: "2026-01-01", contract_end_date: "2026-12-31", monthly_retainer_amount: 2500, billing_frequency: "Monthly", notes: "Fractional HR support.", created_at: "2026-01-01", updated_at: today },
    { id: "c2", owner_id: demoOwnerId, company_name: "Magnolia Care Group", industry: "Healthcare", employee_count: 42, address: "455 Wellness Ave", city: "Prattville", state: "AL", website: "https://example.org", status: "Lead", contract_start_date: "2026-05-15", contract_end_date: "2026-11-15", monthly_retainer_amount: 1800, billing_frequency: "Monthly", notes: "Needs handbook and compliance audit.", created_at: "2026-05-10", updated_at: today }
  ],
  contacts: [
    { id: "ct1", owner_id: demoOwnerId, client_id: "c1", name: "Dena Brooks", title: "Owner", email: "dena@example.com", phone: "334-555-0144", role: "Owner", primary_contact: true, notes: "" },
    { id: "ct2", owner_id: demoOwnerId, client_id: "c1", name: "Marcus Lee", title: "Plant Manager", email: "marcus@example.com", phone: "334-555-0199", role: "Manager", primary_contact: false, notes: "" },
    { id: "ct3", owner_id: demoOwnerId, client_id: "c2", name: "Alicia Moore", title: "Finance Director", email: "alicia@example.com", phone: "334-555-0177", role: "Finance", primary_contact: true, notes: "" }
  ],
  engagements: [
    { id: "e1", owner_id: demoOwnerId, client_id: "c1", service_date: "2026-05-03", service_category: "HR Consulting", description: "Monthly compliance call", hours_worked: 2, billable: true, hourly_rate: 150, invoice_status: "Paid", notes: "" },
    { id: "e2", owner_id: demoOwnerId, client_id: "c1", service_date: "2026-05-20", service_category: "Investigation", description: "Investigation intake and planning", hours_worked: 3, billable: true, hourly_rate: 175, invoice_status: "Not Invoiced", notes: "" },
    { id: "e3", owner_id: demoOwnerId, client_id: "c2", service_date: "2026-05-22", service_category: "Handbook", description: "Handbook gap review", hours_worked: 4, billable: true, hourly_rate: 150, invoice_status: "Not Invoiced", notes: "" }
  ],
  cases: [
    { id: "k1", owner_id: demoOwnerId, case_number: "CASE-2026-001", client_id: "c1", case_type: "Employee Relations", priority: "High", status: "Open", employee_involved: "Employee A", manager_involved: "Marcus Lee", summary: "Attendance and conduct concerns.", recommendation: "", date_opened: "2026-05-08", due_date: "2026-06-05", date_closed: "", assigned_consultant: "Valicia Davis", notes: "" },
    { id: "k2", owner_id: demoOwnerId, case_number: "CASE-2026-002", client_id: "c2", case_type: "Policy Question", priority: "Medium", status: "In Progress", employee_involved: "", manager_involved: "Alicia Moore", summary: "PTO policy update question.", recommendation: "", date_opened: "2026-05-18", due_date: "2026-06-07", date_closed: "", assigned_consultant: "Valicia Davis", notes: "" }
  ],
  investigations: [
    { id: "i1", owner_id: demoOwnerId, investigation_number: "INV-2026-001", client_id: "c1", date_opened: "2026-05-19", date_closed: "", complainant: "Employee B", respondent: "Supervisor C", department: "Production", shift: "2nd", complaint_summary: "Alleged hostile conduct and retaliation.", prior_discipline: false, witness_1: "Witness A", witness_2: "Witness B", witness_3: "", evidence_reviewed: "Emails, attendance records", status: "Interviews Scheduled", findings: "Inconclusive", recommended_action: "", final_summary: "", investigator_name: "Valicia Davis", follow_up_date: "2026-06-10", notes: "" }
  ],
  invoices: [
    { id: "v1", owner_id: demoOwnerId, invoice_number: "VS-2026-001", client_id: "c1", invoice_date: "2026-05-01", due_date: "2026-05-16", billing_period_start: "2026-05-01", billing_period_end: "2026-05-31", status: "Paid", subtotal: 2500, discount: 0, tax: 0, total: 2500, payment_date: "2026-05-12", payment_method: "ACH", notes: "Monthly retainer" },
    { id: "v2", owner_id: demoOwnerId, invoice_number: "VS-2026-002", client_id: "c2", invoice_date: "2026-05-20", due_date: "2026-06-04", billing_period_start: "2026-05-15", billing_period_end: "2026-06-14", status: "Sent", subtotal: 1800, discount: 0, tax: 0, total: 1800, payment_date: "", payment_method: "", notes: "Initial retainer" }
  ],
  invoice_line_items: [
    { id: "li1", owner_id: demoOwnerId, invoice_id: "v1", description: "Monthly HR consulting retainer", service_category: "HR Consulting", quantity: 1, rate: 2500, amount: 2500 },
    { id: "li2", owner_id: demoOwnerId, invoice_id: "v2", description: "Initial monthly retainer", service_category: "HR Consulting", quantity: 1, rate: 1800, amount: 1800 }
  ],
  documents: [
    { id: "d1", owner_id: demoOwnerId, client_id: "c1", title: "Signed Consulting Agreement", document_type: "Contract", file_name: "riverbend-agreement.pdf", storage_path: "", expiration_date: "2026-12-31", notes: "", created_at: "2026-01-01" }
  ],
  ai_documents: [],
  notes: [
    { id: "n1", owner_id: demoOwnerId, parent_type: "client", parent_id: "c1", note_body: "Prepare renewal discussion before Q4.", created_by: demoOwnerId, created_at: "2026-05-30" }
  ],
  activity_logs: [
    { id: "a1", owner_id: demoOwnerId, action: "Client created", parent_type: "client", parent_id: "c1", message: "Riverbend Manufacturing added.", created_at: "2026-01-01" },
    { id: "a2", owner_id: demoOwnerId, action: "Invoice created", parent_type: "invoice", parent_id: "v2", message: "VS-2026-002 created.", created_at: "2026-05-20" }
  ]
};

function loadDemoData() {
  const saved = localStorage.getItem(demoDataKey);
  return saved ? { ...emptyData, ...JSON.parse(saved) } : seed;
}

function saveDemoData(data) {
  localStorage.setItem(demoDataKey, JSON.stringify(data));
}

function loadGovernmentData() {
  const saved = localStorage.getItem(governmentDataKey);
  const data = saved ? { ...defaultGovernmentData, ...JSON.parse(saved) } : defaultGovernmentData;
  return {
    ...data,
    opportunities: (data.opportunities || []).map(normalizeGovernmentOpportunity),
    outreach: (data.outreach || []).map(item => ({ ...item, status: normalizeOutreachStatus(item.status), created_at: item.created_at || today, response_summary: item.response_summary || "" })),
    reminders: (data.reminders || []).map(normalizeGovernmentReminder)
  };
}

function saveGovernmentData(data) {
  localStorage.setItem(governmentDataKey, JSON.stringify(data));
}

function loadFundingData() {
  const saved = localStorage.getItem(fundingDataKey);
  return saved ? { ...defaultFundingData, ...JSON.parse(saved) } : defaultFundingData;
}

function saveFundingData(data) {
  localStorage.setItem(fundingDataKey, JSON.stringify(data));
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

  const realMode = !!supabaseClient && !!session && !demoMode;

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
    setGovernmentData(next);
    saveGovernmentData(next);
  };

  const loadGovernmentOpportunities = async () => {
    if (!realMode) return;
    const result = await supabaseClient
      .from("government_opportunities")
      .select("*")
      .order("due_date", { ascending: true, nullsFirst: false });
    if (result.error) {
      const message = result.error.message || "";
      if (message.includes("government_opportunities") || message.includes("schema cache")) {
        setNotice("Government opportunities are using local data. Run migration 003_government_opportunities.sql to enable Supabase persistence.");
        return;
      }
      throw result.error;
    }
    const opportunities = (result.data || []).map(normalizeGovernmentOpportunity);
    setGovernmentData(prev => ({
      ...prev,
      selectedOpportunityId: opportunities.some(item => item.id === prev.selectedOpportunityId) ? prev.selectedOpportunityId : opportunities[0]?.id || "",
      opportunities
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
      return;
    }
    try {
      const request = id
        ? supabaseClient.from("government_opportunities").update(payload).eq("id", id).select().single()
        : supabaseClient.from("government_opportunities").insert({ ...payload, owner_id: session.user.id }).select().single();
      const result = await request;
      if (result.error) throw result.error;
      await logActivity(id ? "Government opportunity updated" : "Government opportunity created", "government_opportunity", result.data.id, `${result.data.title} saved.`);
      await loadGovernmentOpportunities();
      setGovernmentData(prev => ({ ...prev, selectedOpportunityId: result.data.id }));
      setNotice(id ? "Government opportunity updated." : "Government opportunity created.");
    } catch (err) {
      setError(err.message || "Unable to save government opportunity.");
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
        <div className="brand"><h1>Valicia Operations Center</h1><span>{realMode ? "Supabase secured mode" : "Demo mode"}</span></div>
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
          <span className="mode">{realMode ? session.user.email : "Phase 5 Demo"}</span>
          {realMode && <button className="btn secondary" onClick={signOut}>Sign out</button>}
        </div>
        <section className="content">
          {notice && <Banner type="info" text={notice} onClose={() => setNotice("")} />}
          {error && <Banner type="error" text={error} onClose={() => setError("")} />}
          {query ? <Search data={data} query={query} setPage={setPage} /> :
            page === "Home" ? <HomeDashboard data={data} metrics={metrics} governmentData={governmentData} fundingData={fundingData} realMode={realMode} runAutomations={runAutomations} setPage={setPage} /> :
            page === "Revenue" ? <RevenueCenter metrics={metrics} fundingData={fundingData} governmentData={governmentData} data={data} setPage={setPage} /> :
            revenuePages.includes(page) ? <UniversalOpportunityEngine data={data} governmentData={governmentData} fundingData={fundingData} setPage={setPage} /> :
            fundingPages.includes(page) ? <FundingCenter page={page} fundingData={fundingData} updateFundingData={updateFundingData} setPage={setPage} /> :
            page === "Reports" ? <Reports data={data} /> :
            page === "Settings" ? <Settings data={data} config={config} saveSettings={saveSettings} exportBackup={exportBackup} realMode={realMode} /> :
            page === "HR Document Generator" ? <AIGenerator data={data} addRecord={addRecord} realMode={realMode} /> :
            page === "Documents" ? <DocumentsModule data={data} setModal={setModal} deleteRecord={deleteRecord} uploadDocument={uploadDocument} downloadDocument={downloadDocument} realMode={realMode} /> :
            hrPages.includes(page) ? <Module page={page} data={data} setModal={setModal} patchRecord={patchRecord} deleteRecord={deleteRecord} addRecord={addRecord} createInvoiceFromEngagements={createInvoiceFromEngagements} /> :
            governmentPages.includes(page) ? <GovernmentCenter page={page} governmentData={governmentData} updateGovernmentData={updateGovernmentData} saveGovernmentOpportunity={saveGovernmentOpportunity} deleteGovernmentOpportunity={deleteGovernmentOpportunity} setPage={setPage} /> :
            operationsPages.includes(page) ? <OperationsCenter page={page} runAutomations={runAutomations} /> :
            aiWorkspacePages.includes(page) ? <AIWorkspacePage page={page} /> :
            adminPages.includes(page) ? <AdminPage page={page} realMode={realMode} /> :
            <HomeDashboard data={data} metrics={metrics} governmentData={governmentData} fundingData={fundingData} realMode={realMode} runAutomations={runAutomations} setPage={setPage} />}
        </section>
      </main>
      {modal && <RecordModal modal={modal} data={data} onSave={saveModal} onClose={() => setModal(null)} />}
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
            <button className="btn secondary" onClick={() => setDemoMode(true)}>Continue demo</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeDashboard({ data, metrics, governmentData, fundingData, realMode, runAutomations, setPage }) {
  const govStats = getGovernmentStats(governmentData);
  const fundingStats = getFundingStats(fundingData);
  const universalOpportunities = getUniversalOpportunities(data, governmentData, fundingData);
  const universalStats = getUniversalOpportunityStats(universalOpportunities);
  return (
    <>
      <Title
        title="Good morning, Valicia."
        subtitle={realMode ? "What should you focus on today? Supabase is connected and your command center is secured." : "What should you focus on today? Demo mode is using mock and local data."}
        action={<button className="btn" onClick={runAutomations}>Run automations</button>}
      />
      <div className="chief-grid">
        <FocusCard title="Highest Value Actions" items={operationsMock.highestValueActions} action="Open tasks" onAction={() => setPage("Tasks")} />
        <FocusCard title="All Opportunities" items={[
          { title: `${universalStats.total} total opportunities`, detail: `${amount(universalStats.pipelineValue)} estimated total value`, status: "Universal" },
          { title: `${universalStats.highFit} high-fit opportunities`, detail: "Fit score of 80% or higher.", status: "High fit" },
          { title: `${universalStats.dueSoon} due soon`, detail: `${universalStats.active} active opportunities still moving.`, status: "Focus" }
        ]} action="Open engine" onAction={() => setPage("Universal Opportunities")} />
        <FocusCard title="Government Opportunities" items={[
          { title: `${govStats.opportunities} opportunities`, detail: `${amount(govStats.pipelineValue)} total pipeline value`, status: "Pipeline" },
          { title: `${govStats.awaitingResponses} awaiting response`, detail: "Subcontractor outreach needs attention.", status: "Outreach" },
          { title: `${govStats.followUpsDue} follow-up(s) due`, detail: "Includes overdue and due-today reminders.", status: "Reminder" },
          { title: `${govStats.deadlinesApproaching} deadlines approaching`, detail: "Due within the next 14 days.", status: "Deadline" },
          { title: `${govStats.contractsWon} won / ${govStats.contractsLost} lost`, detail: `${govStats.winRate}% win rate and ${amount(govStats.totalAwardedValue)} awarded.`, status: "Awards" }
        ]} action="Review opportunities" onAction={() => setPage("Opportunities")} />
        <FocusCard title="HR Consulting" items={[
          { title: `${metrics.activeClients} active clients`, detail: `${metrics.openCases} open cases and ${metrics.openInvestigations} active investigations`, status: "Client work" },
          { title: `${metrics.billableHours} billable hours tracked`, detail: "Review uninvoiced engagements before month-end.", status: "Billing" }
        ]} action="Open clients" onAction={() => setPage("Clients")} />
        <FocusCard title="Revenue" items={[
          { title: amount(metrics.monthlyRevenue), detail: "HR consulting revenue recorded this month.", status: "Collected" },
          { title: amount(metrics.outstanding), detail: "Pending invoices across consulting work.", status: metrics.overdue ? `${metrics.overdue} overdue` : "On track" }
        ]} action="Open revenue" onAction={() => setPage("Revenue")} />
        <FocusCard title="Funding & Grants" items={[
          { title: `${fundingStats.newOpportunities} new opportunities`, detail: `${amount(fundingStats.totalPotentialFunding)} total potential funding`, status: "Funding" },
          { title: `${fundingStats.deadlinesDueSoon} deadlines due soon`, detail: "Due within the next 14 days.", status: "Deadline" },
          { title: `${fundingStats.draftsInProgress} drafts in progress`, detail: "Applications being reviewed or drafted.", status: "Drafting" }
        ]} action="Open funding" onAction={() => setPage("Funding Opportunities")} />
        <FocusCard title="Automations" items={operationsMock.automations} action="Check workflow health" onAction={() => setPage("Workflow Health")} />
        <FocusCard title="Upcoming Deadlines" items={operationsMock.deadlines.map(item => ({ title: item.title, detail: item.date, status: item.type }))} action="Open calendar" onAction={() => setPage("Calendar/Deadlines")} />
        <div className="card span-two">
          <div className="panel-head"><h3>Recent Activity</h3><button className="btn secondary" onClick={() => setPage("Logs")}>View logs</button></div>
          <Activity rows={data.activity_logs} />
        </div>
      </div>
    </>
  );
}

function RevenueCenter({ metrics, fundingData, governmentData, data, setPage }) {
  const [active, setActive] = useState("All");
  const fundingStats = getFundingStats(fundingData);
  const govStats = getGovernmentStats(governmentData);
  const universalOpportunities = getUniversalOpportunities(data, governmentData, fundingData);
  const universalStats = getUniversalOpportunityStats(universalOpportunities);
  const revenueChannelsWithGovernment = revenueChannels.map(channel => channel.name === "Government Pipeline"
    ? { ...channel, month: govStats.totalAwardedValue, pipeline: govStats.pipelineValue, recent: `${govStats.contractsWon} contract(s) won` }
    : channel
  );
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
        <Metric label="Monthly revenue" value={amount(totals.month + metrics.monthlyRevenue)} />
        <Metric label="Pending invoices" value={amount(totals.pending + metrics.outstanding)} />
        <Metric label="Pipeline value" value={amount(totals.pipeline + fundingStats.totalPotentialFunding)} />
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
        <div className="panel-head"><h3>Recent Sales</h3><span className="mode">Mock data</span></div>
        <div className="activity">{operationsMock.recentSales.map(item => <div key={`${item.source}-${item.item}`}><strong>{item.source}: {item.amount}</strong><span className="muted">{item.item} - {item.date}</span></div>)}</div>
      </div>
    </>
  );
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

const draftSections = [
  "business summary",
  "owner background",
  "need statement",
  "use of funds",
  "community impact",
  "project timeline",
  "sustainability plan"
];

const submissionStatuses = ["not started", "reviewing", "drafting", "documents needed", "ready to submit", "submitted", "awarded", "denied"];

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

function getUniversalOpportunities(data, governmentData, fundingData) {
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
  const digital = revenueChannels.filter(channel => ["Etsy", "Gumroad", "Stan Store", "TikTok Shop future", "HR AI OS"].includes(channel.name)).map(channel => ({
    id: `digital-${channel.name}`,
    type: "Digital Product Opportunity",
    title: `${channel.name} growth opportunity`,
    source: channel.name,
    estimated_value: Number(channel.pipeline || 0),
    fit_score: channel.pipeline > 1000 ? 80 : 62,
    deadline: "",
    status: channel.name === "TikTok Shop future" ? "Opportunity" : "Revenue",
    next_action: channel.name === "TikTok Shop future" ? "Define product listing and launch checklist" : "Review sales trend and optimize offer",
    required_documents: ["Product description", "Pricing", "Launch assets"],
    notes: channel.recent,
    workflow_stage: channel.name === "TikTok Shop future" ? "Opportunity" : "Revenue"
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

function getSelectedFunding(fundingData) {
  return fundingData.opportunities.find(item => item.id === fundingData.selectedFundingId) || fundingData.opportunities[0];
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

function generateFundingDraft(opportunity, section) {
  const businessName = "V Solutions LLC";
  const templates = {
    "business summary": `${businessName} is an HR consulting and AI-enabled operations company led by Valicia Davis, MBA, PHR. The business provides HR compliance support, employee relations guidance, workplace investigation support, and practical digital tools for small businesses.`,
    "owner background": "Valicia Davis brings HR leadership, compliance knowledge, business operations experience, and a practical understanding of the needs facing small employers. Her background supports both direct consulting delivery and scalable digital product development.",
    "need statement": `Funding is needed to expand delivery capacity, improve systems, and accelerate growth for ${opportunity.title}. The support would help convert current demand into stronger service delivery, better documentation, and more consistent revenue operations.`,
    "use of funds": opportunity.budget_narrative?.use_of_funds || "Funds will be used for technology, implementation support, marketing, documentation, and capacity-building activities.",
    "community impact": "This project will help small businesses access clearer HR compliance tools, reduce workplace risk, and support more stable employment practices in the community.",
    "project timeline": "Month 1: finalize planning and vendor setup. Month 2: build or purchase required tools and documents. Month 3: launch improved workflows, marketing, and reporting. Month 4+: monitor outcomes and refine delivery.",
    "sustainability plan": "The project will be sustained through recurring HR consulting revenue, digital product sales, improved workflow automation, and stronger public/private sector pipeline development."
  };
  return templates[section] || "";
}

function FundingCenter({ page, fundingData, updateFundingData, setPage }) {
  const selectedFunding = getSelectedFunding(fundingData);
  const selectFunding = id => updateFundingData({ ...fundingData, selectedFundingId: id });
  const updateFunding = updates => updateFundingData({ ...fundingData, opportunities: fundingData.opportunities.map(item => item.id === selectedFunding.id ? { ...item, ...updates } : item) });
  if (page === "Funding Opportunities") return <FundingOpportunities fundingData={fundingData} selectFunding={selectFunding} setPage={setPage} />;
  if (page === "Eligibility Review") return <EligibilityReview opportunity={selectedFunding} setPage={setPage} />;
  if (page === "Application Drafts") return <ApplicationDrafts opportunity={selectedFunding} updateFunding={updateFunding} />;
  if (page === "Required Documents") return <FundingDocuments opportunity={selectedFunding} updateFunding={updateFunding} />;
  if (page === "Budget & Narrative") return <BudgetNarrative opportunity={selectedFunding} updateFunding={updateFunding} />;
  if (page === "Submission Tracker") return <SubmissionTracker fundingData={fundingData} updateFundingData={updateFundingData} />;
  if (page === "Awards/Outcomes") return <FundingOutcomes fundingData={fundingData} />;
  return <FundingOpportunities fundingData={fundingData} selectFunding={selectFunding} setPage={setPage} />;
}

function FundingOpportunities({ fundingData, selectFunding, setPage }) {
  const stats = getFundingStats(fundingData);
  const open = (item, nextPage) => {
    selectFunding(item.id);
    setPage(nextPage);
  };
  return (
    <>
      <Title title="Funding Opportunities" subtitle="Track grants, loans, pitch competitions, local funding, and federal/state programs." />
      <div className="grid metrics">
        <Metric label="New opportunities" value={stats.newOpportunities} />
        <Metric label="Due soon" value={stats.deadlinesDueSoon} />
        <Metric label="Drafts in progress" value={stats.draftsInProgress} />
        <Metric label="Potential funding" value={amount(stats.totalPotentialFunding)} />
      </div>
      <div className="card">
        <div className="table-wrap opportunities-table"><table><thead><tr>{["title", "funder", "funding_type", "amount_available", "deadline", "eligibility_status", "fit_score", "status", "next_action"].map(c => <th key={c}>{label(c)}</th>)}<th>Actions</th></tr></thead><tbody>
          {fundingData.opportunities.map(item => <tr key={item.id}>
            <td><strong>{item.title}</strong><span className="muted table-subline">{item.notes}</span></td><td>{item.funder}</td><td>{item.funding_type}</td><td>{amount(item.amount_available)}</td><td>{item.deadline}<br /><span className="muted">{dueLabel(item.deadline)}</span></td><td>{item.eligibility_status}</td><td><span className={Number(item.fit_score || 0) > 80 ? "badge success" : "badge"}>{item.fit_score}%</span></td><td><span className="badge warn">{item.status}</span></td><td>{item.next_action}</td>
            <td><div className="row-actions"><button className="btn secondary" onClick={() => open(item, "Eligibility Review")}>Eligibility</button><button className="btn secondary" onClick={() => open(item, "Application Drafts")}>Draft</button><button className="btn secondary" onClick={() => open(item, "Required Documents")}>Docs</button><button className="btn secondary" onClick={() => open(item, "Submission Tracker")}>Track</button></div></td>
          </tr>)}
        </tbody></table></div>
      </div>
    </>
  );
}

function EligibilityReview({ opportunity, setPage }) {
  const review = opportunity.eligibility_review || {};
  return (
    <>
      <Title title="Eligibility Review" subtitle={`${opportunity.title} - mock AI eligibility analysis.`} action={<button className="btn" onClick={() => setPage("Application Drafts")}>Start draft</button>} />
      <div className="grid metrics">
        <Metric label="Fit score" value={`${opportunity.fit_score}%`} />
        <Metric label="Eligibility" value={opportunity.eligibility_status} />
        <Metric label="Deadline" value={dueLabel(opportunity.deadline)} />
        <Metric label="Amount" value={amount(opportunity.amount_available)} />
      </div>
      <div className="grid two-col">
        <div className="card"><InfoBlock title="Eligibility match" text={review.eligibility_match} /><InfoBlock title="Recommended next action" text={review.recommended_next_action} /></div>
        <div className="card"><InfoList title="Concerns" items={review.concerns} /><InfoList title="Missing documents" items={review.missing_documents} /></div>
      </div>
    </>
  );
}

function ApplicationDrafts({ opportunity, updateFunding }) {
  const drafts = opportunity.drafts || {};
  const setDraft = (section, value) => updateFunding({ drafts: { ...drafts, [section]: value } });
  const generate = section => setDraft(section, generateFundingDraft(opportunity, section));
  return (
    <>
      <Title title="Application Drafts" subtitle={`Draft core responses for ${opportunity.title}.`} />
      <div className="grid two-col">
        {draftSections.map(section => <div className="card form" key={section}>
          <div className="panel-head"><h3>{label(section)}</h3><button className="btn secondary" onClick={() => generate(section)}>Generate draft</button></div>
          <label>Response<textarea value={drafts[section] || ""} onChange={e => setDraft(section, e.target.value)} /></label>
        </div>)}
      </div>
    </>
  );
}

function FundingDocuments({ opportunity, updateFunding }) {
  const patchDoc = (name, updates) => updateFunding({ documents: opportunity.documents.map(doc => doc.name === name ? { ...doc, ...updates } : doc) });
  return (
    <>
      <Title title="Required Documents" subtitle={`Document checklist for ${opportunity.title}.`} />
      <div className="grid three-col">
        {opportunity.documents.map(doc => <div className="card form" key={doc.name}>
          <div className="panel-head"><h3>{label(doc.name)}</h3><span className={doc.status === "ready" ? "badge success" : "badge warn"}>{doc.status}</span></div>
          <label>Status<select value={doc.status} onChange={e => patchDoc(doc.name, { status: e.target.value })}>{["needed", "requested", "ready", "not applicable"].map(status => <option key={status}>{status}</option>)}</select></label>
          <label>Notes<textarea value={doc.notes || ""} onChange={e => patchDoc(doc.name, { notes: e.target.value })} /></label>
        </div>)}
      </div>
    </>
  );
}

function BudgetNarrative({ opportunity, updateFunding }) {
  const budget = opportunity.budget_narrative || {};
  const patchBudget = updates => updateFunding({ budget_narrative: { ...budget, ...updates } });
  return (
    <>
      <Title title="Budget & Narrative" subtitle={`Budget story for ${opportunity.title}.`} />
      <div className="grid two-col">
        <div className="card form">
          <label>Budget total<input type="number" value={budget.budget_total || 0} onChange={e => patchBudget({ budget_total: Number(e.target.value || 0) })} /></label>
          <label>Use of funds<textarea value={budget.use_of_funds || ""} onChange={e => patchBudget({ use_of_funds: e.target.value })} /></label>
        </div>
        <div className="card form">
          <label>Narrative<textarea value={budget.narrative || ""} onChange={e => patchBudget({ narrative: e.target.value })} /></label>
        </div>
      </div>
    </>
  );
}

function SubmissionTracker({ fundingData, updateFundingData }) {
  const patchOutcome = (id, updates) => updateFundingData({ ...fundingData, opportunities: fundingData.opportunities.map(item => item.id === id ? { ...item, status: updates.status || item.status, outcome: { ...item.outcome, ...updates } } : item) });
  return (
    <>
      <Title title="Submission Tracker" subtitle="Track each application from not started through awarded or denied." />
      <div className="card">
        <div className="table-wrap"><table><thead><tr>{["title", "funder", "deadline", "status", "submitted_date", "award_amount", "decision_date", "notes"].map(c => <th key={c}>{label(c)}</th>)}</tr></thead><tbody>
          {fundingData.opportunities.map(item => <tr key={item.id}><td><strong>{item.title}</strong></td><td>{item.funder}</td><td>{item.deadline}</td><td><select value={item.outcome?.status || item.status} onChange={e => patchOutcome(item.id, { status: e.target.value })}>{submissionStatuses.map(status => <option key={status}>{status}</option>)}</select></td><td>{item.outcome?.submitted_date || ""}</td><td>{amount(item.outcome?.award_amount || 0)}</td><td>{item.outcome?.decision_date || ""}</td><td>{item.outcome?.notes || item.notes}</td></tr>)}
        </tbody></table></div>
      </div>
    </>
  );
}

function FundingOutcomes({ fundingData }) {
  const outcomes = fundingData.opportunities.filter(item => ["submitted", "awarded", "denied"].includes(item.outcome?.status || item.status));
  return (
    <>
      <Title title="Awards/Outcomes" subtitle="Submitted, awarded, and denied funding decisions." />
      <div className="grid three-col">
        {outcomes.map(item => <div className="card action-card" key={item.id}><span className="badge">{item.outcome?.status || item.status}</span><h3>{item.title}</h3><p>{item.funder}</p><p>{amount(item.outcome?.award_amount || item.amount_available)}</p></div>)}
        {!outcomes.length && <div className="card"><p className="muted">No submitted, awarded, or denied funding outcomes yet.</p></div>}
      </div>
    </>
  );
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

function Module({ page, data, setModal, patchRecord, deleteRecord, addRecord, createInvoiceFromEngagements }) {
  const table = page.toLowerCase();
  const rows = data[table] || [];
  const [filter, setFilter] = useState("");
  const visible = rows.filter(r => JSON.stringify(r).toLowerCase().includes(filter.toLowerCase()));
  const columns = {
    clients: ["company_name", "industry", "status", "contract_end_date", "monthly_retainer_amount"],
    contacts: ["name", "client_id", "role", "email", "primary_contact"],
    invoices: ["invoice_number", "client_id", "invoice_date", "due_date", "status", "total"],
    engagements: ["service_date", "client_id", "service_category", "hours_worked", "invoice_status"],
    cases: ["case_number", "client_id", "case_type", "priority", "status"],
    investigations: ["investigation_number", "client_id", "complainant", "respondent", "status"]
  }[table] || [];
  const active = ["clients", "contacts", "invoices", "engagements", "cases", "investigations"].includes(table);

  return (
    <>
      <Title title={page} subtitle={active ? `Manage ${page.toLowerCase()} with authenticated CRUD.` : "Planned for a later phase."} action={active && <button className="btn" onClick={() => setModal({ table })}>Add {page.slice(0, -1)}</button>} />
      <div className="card">
        <div className="toolbar"><input placeholder={`Filter ${page.toLowerCase()}...`} value={filter} onChange={e => setFilter(e.target.value)} /></div>
        {active ? <Table rows={visible} columns={columns} data={data} patchRecord={patchRecord} deleteRecord={deleteRecord} setModal={setModal} table={table} /> : <p className="muted">This module will be activated in the next phase.</p>}
      </div>
      {table === "clients" && visible[0] && <ClientDetail client={visible[0]} data={data} addRecord={addRecord} />}
      {table === "invoices" && <InvoiceTools data={data} createInvoiceFromEngagements={createInvoiceFromEngagements} />}
      {table === "cases" && visible[0] && <CaseDetail item={visible[0]} data={data} patchRecord={patchRecord} addRecord={addRecord} />}
      {table === "investigations" && visible[0] && <InvestigationDetail item={visible[0]} data={data} patchRecord={patchRecord} addRecord={addRecord} />}
    </>
  );
}

function DocumentsModule({ data, setModal, deleteRecord, uploadDocument, downloadDocument, realMode }) {
  const [filter, setFilter] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const visible = data.documents.filter(r => JSON.stringify(r).toLowerCase().includes(filter.toLowerCase()));
  return (
    <>
      <Title title="Documents" subtitle={realMode ? "Upload files to private Supabase Storage." : "Demo upload records are stored locally without file contents."} action={<button className="btn" onClick={() => setUploadOpen(true)}>Upload document</button>} />
      {uploadOpen && <DocumentUpload data={data} uploadDocument={uploadDocument} onClose={() => setUploadOpen(false)} />}
      <div className="card">
        <div className="toolbar"><input placeholder="Filter documents..." value={filter} onChange={e => setFilter(e.target.value)} /></div>
        <Table rows={visible} columns={["title", "client_id", "document_type", "file_name", "expiration_date"]} data={data} patchRecord={() => {}} deleteRecord={deleteRecord} setModal={setModal} table="documents" downloadDocument={downloadDocument} />
      </div>
    </>
  );
}

function DocumentUpload({ data, uploadDocument, onClose }) {
  const [form, setForm] = useState({ document_type: "Contract", client_id: "" });
  const [file, setFile] = useState(null);
  const set = (key, value) => setForm({ ...form, [key]: value });
  return (
    <div className="card">
      <div className="panel-head"><h3>Upload Document</h3><button className="btn secondary" onClick={onClose}>Close</button></div>
      <div className="form form-grid">
        <Form fields={fieldSets.documents} form={form} set={set} data={data} />
        <label>File<input type="file" onChange={e => setFile(e.target.files[0])} /></label>
      </div>
      <div className="actions"><button className="btn" onClick={async () => { await uploadDocument(form, file); onClose(); }}>Upload</button></div>
    </div>
  );
}

function Table({ rows, columns, data, patchRecord, deleteRecord, setModal, table, downloadDocument }) {
  return <div className="table-wrap"><table><thead><tr>{columns.map(c => <th key={c}>{label(c)}</th>)}<th>Actions</th></tr></thead><tbody>
    {rows.map(row => <tr key={row.id}>{columns.map(c => <td key={c}>{cell(row, c, data)}</td>)}<td>
      {table === "invoices" && row.status !== "Paid" && <button className="btn secondary" onClick={() => patchRecord(table, row.id, { status: "Paid", payment_date: today })}>Mark paid</button>}
      {table === "invoices" && row.status === "Draft" && <button className="btn secondary" onClick={() => patchRecord(table, row.id, { status: "Sent" })}>Mark sent</button>}
      {table === "documents" && <button className="btn secondary" onClick={() => downloadDocument(row)}>Download</button>}
      {["clients", "contacts", "invoices", "engagements", "cases", "investigations"].includes(table) && <button className="btn secondary" onClick={() => setModal({ table, record: row })}>Edit</button>}
      {["clients", "contacts", "invoices", "documents", "engagements", "cases", "investigations"].includes(table) && <button className="btn secondary" onClick={() => deleteRecord(table, row.id)}>Delete</button>}
    </td></tr>)}
    {!rows.length && <tr><td colSpan={columns.length + 1} className="muted">No records found.</td></tr>}
  </tbody></table></div>;
}

function RecordModal({ modal, data, onSave, onClose }) {
  const { table, record } = modal;
  const fields = fieldSets[table];
  const [form, setForm] = useState(record || {});
  const set = (key, value) => setForm({ ...form, [key]: value });
  return <div className="modal-backdrop"><div className="modal">
    <h3>{record ? "Edit" : "Add"} {table.slice(0, -1)}</h3>
    <div className="form form-grid"><Form fields={fields} form={form} set={set} data={data} /></div>
    <div className="actions"><button className="btn secondary" onClick={onClose}>Cancel</button><button className="btn" onClick={() => onSave(table, form, record?.id)}>Save</button></div>
  </div></div>;
}

function Form({ fields, form, set, data }) {
  return <>{fields.map(([key, name, type = "text", options]) => <label key={key}>{name}
    {type === "textarea" ? <textarea value={form[key] || ""} onChange={e => set(key, e.target.value)} /> :
    type === "select" ? <select value={form[key] || options[0]} onChange={e => set(key, e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select> :
    type === "client" ? <select value={form[key] || ""} onChange={e => set(key, e.target.value)}><option value="">Select client</option>{data.clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}</select> :
    type === "checkbox" ? <input type="checkbox" checked={!!form[key]} onChange={e => set(key, e.target.checked)} /> :
    <input type={type} value={form[key] || ""} onChange={e => set(key, e.target.value)} />}
  </label>)}</>;
}

function ClientDetail({ client, data, addRecord }) {
  const [tab, setTab] = useState("Overview");
  const tabs = ["Overview", "Contacts", "Engagements", "Cases", "Investigations", "Documents", "Invoices", "Notes"];
  const related = {
    Contacts: data.contacts.filter(r => r.client_id === client.id),
    Engagements: data.engagements.filter(r => r.client_id === client.id),
    Cases: data.cases.filter(r => r.client_id === client.id),
    Investigations: data.investigations.filter(r => r.client_id === client.id),
    Documents: data.documents.filter(r => r.client_id === client.id),
    Invoices: data.invoices.filter(r => r.client_id === client.id),
    Notes: data.notes.filter(r => r.parent_type === "client" && r.parent_id === client.id)
  };
  return <div className="card"><div className="panel-head"><h3>{client.company_name}</h3><span className={`badge ${statusClass(client.status)}`}>{client.status}</span></div>
    <div className="tabs">{tabs.map(t => <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === "Overview" ? <p>{client.notes || "No overview notes yet."}</p> : tab === "Notes" ? <NotesPanel rows={related.Notes} parentType="client" parentId={client.id} addRecord={addRecord} /> : <pre>{JSON.stringify(related[tab], null, 2)}</pre>}
  </div>;
}

function CaseDetail({ item, data, patchRecord, addRecord }) {
  const notes = data.notes.filter(r => r.parent_type === "case" && r.parent_id === item.id);
  return <div className="card">
    <div className="panel-head"><h3>{item.case_number}</h3><span className={`badge ${statusClass(item.status)}`}>{item.status}</span></div>
    <p><strong>Summary:</strong> {item.summary || "No summary yet."}</p>
    <p><strong>Recommendation:</strong> {item.recommendation || "No recommendation drafted."}</p>
    <div className="actions">
      <button className="btn secondary" onClick={() => patchRecord("cases", item.id, { recommendation: aiDraft("HR recommendation memo", { tone: "Professional", summary: item.summary }) })}>Generate recommendation draft</button>
      <button className="btn secondary" onClick={() => patchRecord("cases", item.id, { status: "Closed", date_closed: today })}>Close case</button>
    </div>
    <NotesPanel rows={notes} parentType="case" parentId={item.id} addRecord={addRecord} />
  </div>;
}

function InvestigationDetail({ item, data, patchRecord, addRecord }) {
  const interviews = data.investigation_interviews.filter(r => r.investigation_id === item.id);
  const notes = data.notes.filter(r => r.parent_type === "investigation" && r.parent_id === item.id);
  const [interview, setInterview] = useState({ interviewee_name: "", interview_date: today, interview_notes: "" });
  const saveInterview = async () => {
    if (!interview.interviewee_name.trim()) return;
    await addRecord("investigation_interviews", { ...interview, investigation_id: item.id });
    setInterview({ interviewee_name: "", interview_date: today, interview_notes: "" });
  };
  const printReport = () => printHtml(`Investigation ${item.investigation_number}`, investigationHtml(item, data));
  const downloadReport = () => downloadText(`${item.investigation_number}-report.html`, investigationHtml(item, data), "text/html");
  return <div className="card">
    <div className="panel-head"><h3>{item.investigation_number}</h3><span className={`badge ${statusClass(item.status)}`}>{item.status}</span></div>
    <p><strong>Complaint:</strong> {item.complaint_summary || "No complaint summary yet."}</p>
    <p><strong>Final summary:</strong> {item.final_summary || "No final summary drafted."}</p>
    <div className="actions">
      <button className="btn secondary" onClick={() => patchRecord("investigations", item.id, { notes: aiDraft("Investigation interview questions", { tone: "Professional", summary: item.complaint_summary }) })}>Generate interview questions</button>
      <button className="btn secondary" onClick={() => patchRecord("investigations", item.id, { final_summary: aiDraft("Investigation findings summary", { tone: "Executive", summary: item.complaint_summary }) })}>Draft investigation summary</button>
      <button className="btn secondary" onClick={printReport}>Print report</button>
      <button className="btn secondary" onClick={downloadReport}>Download report</button>
    </div>
    <div className="form form-grid">
      <label>Interviewee<input value={interview.interviewee_name} onChange={e => setInterview({ ...interview, interviewee_name: e.target.value })} /></label>
      <label>Interview date<input type="date" value={interview.interview_date} onChange={e => setInterview({ ...interview, interview_date: e.target.value })} /></label>
      <label>Interview notes<textarea value={interview.interview_notes} onChange={e => setInterview({ ...interview, interview_notes: e.target.value })} /></label>
      <button className="btn" onClick={saveInterview}>Add interview note</button>
    </div>
    <Timeline title="Interview notes" rows={interviews.map(r => ({ ...r, note_body: `${r.interviewee_name}: ${r.interview_notes || ""}` }))} />
    <NotesPanel rows={notes} parentType="investigation" parentId={item.id} addRecord={addRecord} />
  </div>;
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

const outreachStatuses = ["Draft", "Ready", "Sent", "Responded", "Interested", "Quote Requested", "Quote Received", "Declined", "Follow Up Needed", "Partner Selected"];

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
    { title: "Opportunity created", detail: opportunity.created_at || "Demo seed record", status: "Complete" },
    { title: "AI review completed", detail: opportunity.ai_review?.recommended_next_action || opportunity.ai_executive_summary, status: opportunity.ai_fit_score ? "Complete" : "Pending" },
    { title: "Subcontractors identified", detail: `${new Set(outreachRows.map(item => item.subcontractor_id)).size} attached partner(s)`, status: outreachRows.length ? "Complete" : "Pending" },
    { title: "Outreach completed", detail: `${outreachRows.filter(item => ["Sent", "Responded", "Interested", "Quote Requested", "Quote Received", "Partner Selected"].includes(normalizeOutreachStatus(item.status))).length} outreach record(s) beyond draft`, status: outreachRows.some(item => normalizeOutreachStatus(item.status) !== "Draft") ? "Complete" : "Pending" },
    { title: "Responses tracked", detail: `${outreachRows.filter(item => ["Responded", "Interested", "Quote Requested", "Quote Received", "Declined", "Partner Selected"].includes(normalizeOutreachStatus(item.status))).length} response outcome(s)`, status: outreachRows.some(item => ["Responded", "Interested", "Quote Requested", "Quote Received", "Declined", "Partner Selected"].includes(normalizeOutreachStatus(item.status))) ? "Complete" : "Pending" },
    { title: "Reminders completed", detail: `${reminderRows.filter(item => item.status === "Completed").length} of ${reminderRows.length} reminder(s) completed`, status: reminderRows.length && reminderRows.every(item => item.status === "Completed" || item.status === "Cancelled") ? "Complete" : "Pending" },
    { title: "Award outcome", detail: outcome.award_status, status: ["Awarded", "Lost", "Cancelled", "Withdrawn"].includes(outcome.award_status) ? "Complete" : "Pending" }
  ];
}

function getOutreachStats(rows) {
  return {
    drafts: rows.filter(item => normalizeOutreachStatus(item.status) === "Draft").length,
    sent: rows.filter(item => normalizeOutreachStatus(item.status) === "Sent").length,
    awaiting: rows.filter(item => ["Sent", "Responded", "Follow Up Needed"].includes(normalizeOutreachStatus(item.status))).length,
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

function GovernmentCenter({ page, governmentData, updateGovernmentData, saveGovernmentOpportunity, deleteGovernmentOpportunity, setPage }) {
  const selectedOpportunity = getSelectedOpportunity(governmentData);
  const selectOpportunity = id => updateGovernmentData({ ...governmentData, selectedOpportunityId: id });
  if (!selectedOpportunity && page !== "Opportunities") {
    return <MockWorkspace title={page} subtitle="Create or select a government opportunity first." items={[{ title: "No opportunity selected", detail: "Open Government Opportunities and add a persistent opportunity record.", status: "Empty" }]} />;
  }
  const updateOpportunity = updates => saveGovernmentOpportunity({ ...selectedOpportunity, ...updates }, selectedOpportunity.id);

  if (page === "Opportunities") return <GovernmentOpportunities governmentData={governmentData} selectOpportunity={selectOpportunity} saveGovernmentOpportunity={saveGovernmentOpportunity} deleteGovernmentOpportunity={deleteGovernmentOpportunity} setPage={setPage} />;
  if (page === "Opportunity Detail") return <OpportunityDetail opportunity={selectedOpportunity} governmentData={governmentData} updateOpportunity={updateOpportunity} setPage={setPage} />;
  if (page === "AI Fit Review") return <AIFitReview opportunity={selectedOpportunity} updateOpportunity={updateOpportunity} setPage={setPage} />;
  if (page === "Subcontractor Finder") return <SubcontractorFinder governmentData={governmentData} updateGovernmentData={updateGovernmentData} selectedOpportunity={selectedOpportunity} setPage={setPage} />;
  if (page === "Outreach Tracker") return <OutreachTracker governmentData={governmentData} updateGovernmentData={updateGovernmentData} selectedOpportunity={selectedOpportunity} />;
  if (page === "Reminder Queue") return <ReminderQueue governmentData={governmentData} updateGovernmentData={updateGovernmentData} />;
  if (page === "Awards") return <AwardsTracker governmentData={governmentData} updateGovernmentData={updateGovernmentData} />;
  return <GovernmentOpportunities governmentData={governmentData} selectOpportunity={selectOpportunity} setPage={setPage} />;
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
          {!visible.length && <tr><td colSpan="8" className="muted">No opportunities match these filters.</td></tr>}
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
      <Title title="AI Fit Review" subtitle="Mock AI analysis for deciding whether to pursue, pass, or partner." action={<div className="actions"><button className="btn secondary" onClick={generate}>Generate AI Review</button><button className="btn" onClick={() => setPage("Subcontractor Finder")}>Find subcontractors</button></div>} />
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
  const neededCategories = selectedOpportunity.subcontractor_categories?.length
    ? selectedOpportunity.subcontractor_categories
    : generateAIFitAnalysis(selectedOpportunity).suggested_subcontractor_categories;
  const matchScore = item => neededCategories.some(category =>
    `${item.service_category} ${item.notes}`.toLowerCase().includes(String(category).toLowerCase())
  ) ? 1 : 0;
  const visible = governmentData.subcontractors
    .filter(item => JSON.stringify(item).toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => matchScore(b) - matchScore(a));
  const patchSubcontractor = (id, updates) => updateGovernmentData({ ...governmentData, subcontractors: governmentData.subcontractors.map(item => item.id === id ? { ...item, ...updates } : item) });
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
      <Title title="Subcontractor Finder" subtitle={`Match subcontractors to ${selectedOpportunity.title}.`} action={<button className="btn" onClick={() => setPage("Outreach Tracker")}>Open outreach</button>} />
      <div className="card">
        <div className="panel-head"><h3>Subcontractor Needs</h3><span className="mode">{neededCategories.length} suggested</span></div>
        <div className="tabs section-tabs">{neededCategories.map(category => <button key={category} className="active" onClick={() => setFilter(category)}>{category}</button>)}</div>
      </div>
      <div className="card">
        <div className="toolbar"><input placeholder="Search by company, service, location, status..." value={filter} onChange={e => setFilter(e.target.value)} /></div>
        <div className="table-wrap"><table><thead><tr>{["company", "capability", "location", "contact_info", "SAM_registered", "outreach_status", "last_contact_date", "notes"].map(c => <th key={c}>{label(c)}</th>)}<th>Actions</th></tr></thead><tbody>
          {visible.map(item => <tr key={item.id}><td><strong>{item.company_name}</strong>{matchScore(item) ? <span className="muted table-subline">Suggested match</span> : null}</td><td>{item.service_category}</td><td>{item.location}</td><td><strong>{item.contact_name}</strong><br /><span className="muted">{item.email}<br />{item.phone}</span></td><td>{item.SAM_registered ? "Yes" : "No"}</td><td><select value={item.status} onChange={e => patchSubcontractor(item.id, { status: e.target.value })}>{["Not contacted", "Drafted", "Sent", "Responded", "Interested", "Declined", "Quote received", "Follow up needed"].map(status => <option key={status}>{status}</option>)}</select></td><td>{item.last_contact_date || "Not yet"}</td><td>{item.notes}</td><td><button className="btn secondary" onClick={() => attachToOutreach(item.id)}>Attach</button></td></tr>)}
        </tbody></table></div>
      </div>
    </>
  );
}

function OutreachTracker({ governmentData, updateGovernmentData, selectedOpportunity }) {
  const [subcontractorId, setSubcontractorId] = useState(governmentData.subcontractors[0]?.id || "");
  const rows = governmentData.outreach.filter(item => item.opportunity_id === selectedOpportunity.id);
  const stats = getOutreachStats(rows);
  const draftAll = () => {
    const nextOutreach = governmentData.outreach.map(item => {
      if (item.opportunity_id !== selectedOpportunity.id) return item;
      const sub = getSubcontractor(governmentData, item.subcontractor_id);
      return { ...item, status: "Draft", draft_email: draftOutreachEmail(selectedOpportunity, sub || {}) };
    });
    updateGovernmentData({ ...governmentData, outreach: nextOutreach });
  };
  const addOutreach = () => {
    if (!subcontractorId || rows.some(item => item.subcontractor_id === subcontractorId)) return;
    updateGovernmentData({ ...governmentData, outreach: [createOutreachRecord(selectedOpportunity.id, subcontractorId), ...governmentData.outreach] });
  };
  const patchOutreach = (id, updates) => {
    const current = governmentData.outreach.find(item => item.id === id);
    const nextUpdates = { ...updates };
    const reminderAdditions = [];
    if (normalizeOutreachStatus(updates.status) === "Sent") {
      nextUpdates.status = "Sent";
      nextUpdates.last_contact_date = today;
      nextUpdates.follow_up_date = updates.follow_up_date || addBusinessDays(today, 2);
      nextUpdates.notes = updates.notes || "Outreach sent. Follow-up reminder created automatically.";
      reminderAdditions.push(createGovernmentReminder({
        opportunityId: selectedOpportunity.id,
        subcontractorId: current?.subcontractor_id || "",
        type: "Outreach follow-up",
        dueDate: nextUpdates.follow_up_date,
        priority: "High",
        notes: "Follow up 2 business days after outreach was marked sent."
      }));
    }
    if (normalizeOutreachStatus(updates.status) === "Quote Requested") {
      nextUpdates.status = "Quote Requested";
      nextUpdates.last_contact_date = nextUpdates.last_contact_date || today;
      nextUpdates.follow_up_date = updates.follow_up_date || current?.follow_up_date || addBusinessDays(today, 2);
      reminderAdditions.push(createGovernmentReminder({
        opportunityId: selectedOpportunity.id,
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
        opportunityId: selectedOpportunity.id,
        subcontractorId: current?.subcontractor_id || "",
        type: "Outreach follow-up",
        dueDate: nextUpdates.follow_up_date,
        priority: "High",
        notes: "Outreach needs follow-up."
      }));
    }
    updateGovernmentData({
      ...governmentData,
      outreach: governmentData.outreach.map(item => item.id === id ? { ...item, ...nextUpdates } : item),
      reminders: mergeGovernmentReminders(governmentData.reminders || [], reminderAdditions)
    });
  };
  const markOutreach = (row, status) => {
    const updates = { status };
    if (status === "Sent") updates.follow_up_date = row.follow_up_date || addBusinessDays(today, 2);
    if (status === "Follow Up Needed" && !row.follow_up_date) updates.follow_up_date = today;
    patchOutreach(row.id, updates);
  };
  return (
    <>
      <Title title="Outreach Tracker" subtitle={`Track subcontractor outreach for ${selectedOpportunity.title}.`} action={<button className="btn" onClick={draftAll}>Draft Outreach</button>} />
      <div className="grid metrics">
        <Metric label="Drafts" value={stats.drafts} />
        <Metric label="Sent" value={stats.sent} />
        <Metric label="Awaiting response" value={stats.awaiting} />
        <Metric label="Follow-ups due today" value={stats.dueToday} />
        <Metric label="Interested partners" value={stats.interested} />
        <Metric label="Quotes received" value={stats.quotes} />
      </div>
      <div className="card toolbar">
        <select value={subcontractorId} onChange={e => setSubcontractorId(e.target.value)}>{governmentData.subcontractors.map(item => <option key={item.id} value={item.id}>{item.company_name} - {item.service_category}</option>)}</select>
        <button className="btn" onClick={addOutreach}>Attach subcontractor</button>
      </div>
      <div className="grid two-col">
        {rows.map(row => {
          const sub = getSubcontractor(governmentData, row.subcontractor_id);
          const outreachEmail = draftOutreachEmail(selectedOpportunity, sub || {});
          const followUpEmail = draftFollowUpEmail(selectedOpportunity, sub || {});
          const callScript = draftCallScript(selectedOpportunity, sub || {});
          const capabilityIntro = draftCapabilityIntro(selectedOpportunity, sub || {});
          const linkedInMessage = draftLinkedInMessage(selectedOpportunity, sub || {});
          const draft = row.draft_email || outreachEmail;
          return <div className="card form" key={row.id}>
            <div className="panel-head"><h3>{sub?.company_name || "Subcontractor"}</h3><span className="badge">{row.status}</span></div>
            <label>Status<select value={row.status} onChange={e => patchOutreach(row.id, { status: e.target.value })}>{outreachStatuses.map(status => <option key={status}>{status}</option>)}</select></label>
            <label>Date created<input value={row.created_at || ""} onChange={e => patchOutreach(row.id, { created_at: e.target.value })} /></label>
            <label>Last contact date<input type="date" value={row.last_contact_date || ""} onChange={e => patchOutreach(row.id, { last_contact_date: e.target.value })} /></label>
            <label>Follow-up date<input type="date" value={row.follow_up_date || ""} onChange={e => patchOutreach(row.id, { follow_up_date: e.target.value })} /></label>
            <label>Response summary<textarea value={row.response_summary || ""} onChange={e => patchOutreach(row.id, { response_summary: e.target.value })} /></label>
            <label>Notes<textarea value={row.notes || ""} onChange={e => patchOutreach(row.id, { notes: e.target.value })} /></label>
            <div className="actions">
              <button className="btn secondary" onClick={() => patchOutreach(row.id, { draft_email: outreachEmail, status: "Draft" })}>Generate initial outreach email</button>
              <button className="btn secondary" onClick={() => patchOutreach(row.id, { draft_email: followUpEmail, status: "Follow Up Needed" })}>Generate follow-up email</button>
              <button className="btn secondary" onClick={() => patchOutreach(row.id, { draft_email: capabilityIntro, status: "Ready" })}>Capability intro</button>
              <button className="btn secondary" onClick={() => patchOutreach(row.id, { draft_email: callScript })}>Generate short call script</button>
              <button className="btn secondary" onClick={() => patchOutreach(row.id, { draft_email: linkedInMessage })}>Generate LinkedIn message</button>
            </div>
            <div className="actions">
              {outreachStatuses.map(status => <button key={status} className="btn secondary" onClick={() => markOutreach(row, status)}>Mark {status}</button>)}
            </div>
            <label>Draft Outreach<textarea value={row.draft_email || ""} placeholder={draft} onChange={e => patchOutreach(row.id, { draft_email: e.target.value })} /></label>
          </div>;
        })}
        {!rows.length && <div className="card"><p className="muted">No subcontractors attached to this opportunity yet.</p></div>}
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
        <div className="panel-head"><h3>Government Awards Report</h3><span className="mode">Demo/local report</span></div>
        <div className="table-wrap"><table><thead><tr>{["opportunity", "agency", "award_status", "award_amount", "prime_or_subcontract", "contract_number", "period_of_performance", "reason_lost"].map(c => <th key={c}>{label(c)}</th>)}</tr></thead><tbody>
          {governmentData.opportunities.map(item => {
            const outcome = normalizeAwardOutcome(item.award_outcome, item);
            return <tr key={item.id}><td><strong>{item.title}</strong></td><td>{outcome.awarding_agency}</td><td><span className={outcome.award_status === "Awarded" ? "badge success" : outcome.award_status === "Lost" ? "badge warn" : "badge"}>{outcome.award_status}</span></td><td>{amount(outcome.award_amount || item.estimated_value)}</td><td>{outcome.prime_or_subcontract}</td><td>{outcome.contract_number || "TBD"}</td><td>{outcome.period_of_performance || "TBD"}</td><td>{outcome.reason_lost || ""}</td></tr>;
          })}
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
      </div>
    </>
  );
}

function InfoBlock({ title, text }) {
  return <div className="info-block"><h4>{title}</h4><p>{text || "Not entered yet."}</p></div>;
}

function InfoList({ title, items = [] }) {
  return <div className="info-block"><h4>{title}</h4>{items.length ? <ul>{items.map(item => <li key={item}>{item}</li>)}</ul> : <p className="muted">None listed yet.</p>}</div>;
}

function OperationsCenter({ page, runAutomations }) {
  const items = {
    Automations: operationsMock.automations,
    "n8n Workflows": [
      { title: "Opportunity digest workflow", detail: "Pull SAM.gov matches, score fit, send morning brief.", status: "To connect" },
      { title: "Digital product sale alert", detail: "Route Etsy/Gumroad/Stan sales into revenue log.", status: "To connect" },
      { title: "Client intake workflow", detail: "Form submission to client record, task, and welcome email.", status: "To connect" }
    ],
    "Workflow Health": [
      { title: "Invoice automation", detail: "Local app workflow available now.", status: "Healthy" },
      { title: "External n8n workflows", detail: "Waiting for webhook endpoints and credentials.", status: "Offline" }
    ],
    Logs: [
      { title: "Activity log", detail: "Supabase activity logs are retained for creates, updates, deletes, uploads, and automations.", status: "Active" },
      { title: "Integration logs", detail: "n8n execution logs will appear after connection.", status: "Future" }
    ],
    Tasks: operationsMock.highestValueActions,
    "Calendar/Deadlines": operationsMock.deadlines.map(item => ({ title: item.title, detail: item.date, status: item.type }))
  };
  return <MockWorkspace title={page} subtitle="Operations command center for workflows, tasks, logs, and deadlines." items={items[page] || []} action={page === "Automations" ? <button className="btn" onClick={runAutomations}>Run local automations</button> : null} />;
}

function AIWorkspacePage({ page }) {
  const items = {
    "Government Proposal Assistant": [
      { title: "Proposal outline builder", detail: "Turn opportunity notes into compliance matrix, win themes, and section outline.", status: "Mock" },
      { title: "Past performance matcher", detail: "Map HR consulting work to agency requirements.", status: "Mock" }
    ],
    "Capability Statement Generator": [
      { title: "Core one-page capability statement", detail: "Generate differentiators, NAICS, services, and contact block.", status: "Mock" }
    ],
    "Investigation Report Generator": [
      { title: "Existing investigation exporter", detail: "Current investigation report print/download remains available under HR Consulting.", status: "Available" }
    ],
    "Email Writer": [
      { title: "Client follow-up email", detail: "Draft concise client updates, invoice reminders, and proposal outreach.", status: "Mock" }
    ],
    "Prompt Library": [
      { title: "HR consulting prompts", detail: "Recommendation memos, corrective action, policy drafts, and investigation questions.", status: "Starter set" },
      { title: "Government prompts", detail: "Opportunity fit checks, capability statement bullets, and proposal outlines.", status: "Starter set" }
    ]
  };
  return <MockWorkspace title={page} subtitle="AI workspace placeholder using mock workflows until connected to production AI tools." items={items[page] || []} />;
}

function AdminPage({ page, realMode }) {
  const items = {
    Users: [
      { title: "Current user access", detail: realMode ? "Managed through Supabase Auth." : "Demo mode has no user management.", status: realMode ? "Secured" : "Demo" }
    ],
    Integrations: [
      { title: "Supabase", detail: "Auth, database, storage, and RLS are active when signed in.", status: realMode ? "Connected" : "Not connected" },
      { title: "Netlify", detail: "Static deployment target for anywhere access.", status: "Configured" },
      { title: "n8n", detail: "Workflow automation layer to connect later.", status: "Future" }
    ],
    "API Keys/Secrets": [
      { title: "Secrets vault placeholder", detail: "Store production secrets in Netlify, Supabase, or n8n environments, not in browser code.", status: "Important" }
    ],
    Storage: [
      { title: "hr-documents bucket", detail: "Private Supabase Storage bucket scoped by signed-in user.", status: "Ready" }
    ],
    "System Status": [
      { title: "Application shell", detail: "Static React app deployable on Netlify.", status: "Online" },
      { title: "Database security", detail: "RLS policies protect owner-scoped records.", status: "Enabled" }
    ]
  };
  return <MockWorkspace title={page} subtitle="Administrative controls and production-readiness placeholders." items={items[page] || []} />;
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

function Settings({ data, config, saveSettings, exportBackup, realMode }) {
  const [form, setForm] = useState({ ...defaultSettings, ...data.settings, ...config });
  return <><Title title="Settings" subtitle={realMode ? "Business profile is saved to Supabase profiles." : "Configure Supabase URL/key here, or keep using demo mode."} /><div className="card form form-grid">
    {Object.keys(defaultSettings).map(k => <label key={k}>{label(k)}<input value={form[k] || ""} onChange={e => setForm({ ...form, [k]: e.target.value })} /></label>)}
    <button className="btn" onClick={() => saveSettings(form)}>Save settings</button>
    <button className="btn secondary" onClick={exportBackup}>Export JSON backup</button>
  </div></>;
}

function Reports({ data }) {
  const reports = [
    ["Revenue by month", groupSum(data.invoices, i => (i.invoice_date || "").slice(0, 7), "total"), true],
    ["Outstanding invoices", Object.fromEntries(data.invoices.filter(i => i.status !== "Paid").map(i => [i.invoice_number, i.total])), true],
    ["Clients by status", group(data.clients, "status"), false],
    ["Open cases by client", group(data.cases.filter(c => !["Closed", "Resolved"].includes(c.status)).map(c => ({ ...c, client: clientName(data, c.client_id) })), "client"), false],
    ["Investigation status report", group(data.investigations, "status"), false],
    ["Billable hours by client", groupSum(data.engagements.filter(e => e.billable).map(e => ({ ...e, client: clientName(data, e.client_id) })), e => e.client, "hours_worked"), false],
    ["Services by category", group(data.engagements, "service_category"), false]
  ];
  const exportAll = () => {
    const rows = reports.flatMap(([title, values]) => Object.entries(values).map(([label, value]) => ({ report: title, label, value })));
    downloadText("v-solutions-reports.csv", toCsv(rows), "text/csv");
  };
  return <><Title title="Reports" subtitle="Phase 4 reports with CSV exports." action={<button className="btn" onClick={exportAll}>Export all CSV</button>} /><div className="grid two-col">{reports.map(([title, rows, money]) => <ReportCard key={title} title={title} rows={rows} money={money} />)}</div></>;
}

function ReportCard({ title, rows, money }) {
  const chartRows = Object.entries(rows).map(([label, value]) => ({ label, value, money }));
  const exportOne = () => downloadText(`${title.toLowerCase().replaceAll(" ", "-")}.csv`, toCsv(chartRows), "text/csv");
  return <div className="card">
    <div className="panel-head"><h3>{title}</h3><button className="btn secondary" onClick={exportOne}>CSV</button></div>
    <Bars title="" rows={chartRows} />
  </div>;
}

function Search({ data, query, setPage }) {
  const tables = ["clients", "contacts", "engagements", "cases", "investigations", "invoices", "documents"];
  const results = tables.flatMap(t => (data[t] || []).filter(r => JSON.stringify(r).toLowerCase().includes(query.toLowerCase())).map(r => ({ table: t, row: r })));
  return <><Title title="Search Results" subtitle={`${results.length} result(s) for "${query}".`} /><div className="card activity">{results.map(({ table, row }) => <div key={`${table}-${row.id}`}><strong>{table}: {row.company_name || row.name || row.case_number || row.investigation_number || row.invoice_number || row.title || row.service_category}</strong><span className="muted">{clientName(data, row.client_id)} </span><button className="btn secondary" onClick={() => setPage(table[0].toUpperCase() + table.slice(1))}>Open module</button></div>)}</div></>;
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
function groupSum(rows, keyFn, valueKey) { return rows.reduce((a, r) => { const k = typeof keyFn === "function" ? keyFn(r) : r[keyFn]; return { ...a, [k || "Unspecified"]: (a[k || "Unspecified"] || 0) + Number(r[valueKey] || 0) }; }, {}); }

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
