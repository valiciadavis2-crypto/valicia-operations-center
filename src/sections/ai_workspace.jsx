// Split from src/app.jsx for lazy AI Workspace section loading. Do not load directly; index.html compiles this file on demand.
function AIWorkspacePage({ page }) {
  const items = {
    "Government Proposal Assistant": [
      { title: "No opportunity selected", detail: "Select a real government opportunity before generating proposal support.", status: "Empty" }
    ],
    "Capability Statement Generator": [
      { title: "Capability statement helper", detail: "Generate differentiators, NAICS, services, and contact blocks from real profile details.", status: "AI draft" }
    ],
    "Investigation Report Generator": [
      { title: "Existing investigation exporter", detail: "Current investigation report print/download remains available under HR Consulting.", status: "Available" }
    ],
    "Email Writer": [
      { title: "No email record selected", detail: "Create a real client, invoice, subcontractor outreach, or opportunity first.", status: "Empty" }
    ],
    "Prompt Library": [
      { title: "HR consulting prompts", detail: "Recommendation memos, corrective action, policy drafts, and investigation questions.", status: "Starter set" },
      { title: "Government prompts", detail: "Opportunity fit checks, capability statement bullets, and proposal outlines.", status: "Starter set" }
    ]
  };
  return <MockWorkspace title={page} subtitle="AI workspace tools show real saved drafts only after a real record is selected or generated." items={items[page] || []} />;
}
