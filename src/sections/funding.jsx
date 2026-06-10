// Split from src/app.jsx for lazy Funding section loading. Do not load directly; index.html compiles this file on demand.
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

function getSelectedFunding(fundingData) {
  return fundingData.opportunities.find(item => item.id === fundingData.selectedFundingId) || fundingData.opportunities[0];
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
