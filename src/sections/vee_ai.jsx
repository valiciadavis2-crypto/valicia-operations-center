// Vee AI — Agent 4 Control Room (v3, mock mode).
// Supervised autonomous Manager Agent.
// Draft-only: nothing is sent, posted, emailed, or charged.
// All external actions require explicit approval (Level 2).
// State structured for Supabase migration when ready.

// ── Helpers ──────────────────────────────────────────────────────────────────

function veeAiValue(form, key, fallback) {
  const raw = String(form[key] || "").trim();
  return raw || fallback;
}

// ── Command Actions ───────────────────────────────────────────────────────────

const veeAiActions = [
  {
    id: "todays-priority",
    icon: "\u{1F3AF}",
    title: "Today's Priority",
    blurb: "Pick one focus and get a simple plan for today.",
    cta: "Plan my day",
    fields: [
      { key: "focus", label: "Focus area", type: "select", options: ["Driven By Dezign", "V Solutions HR", "Government Contracting", "Content Creation", "Career Prep"] },
      { key: "task", label: "Most important task today", placeholder: "e.g. Finish the candle ad draft" },
      { key: "deadline", label: "Deadline or time window", placeholder: "e.g. By 3:00 PM" },
      { key: "energy", label: "Energy level", type: "select", options: ["Medium", "High", "Low"] }
    ],
    generate: form => {
      const focus = veeAiValue(form, "focus", "Driven By Dezign");
      const task = veeAiValue(form, "task", "your most important task");
      const deadline = veeAiValue(form, "deadline", "end of day");
      const energy = veeAiValue(form, "energy", "Medium");
      const pace = energy === "High" ? "Run the full push: deep work first, admin later." : energy === "Low" ? "Protect your energy: one focused 25-minute block, then decide." : "Steady pace: two focused blocks with a short break between.";
      return [
        { heading: "Priority Call", body: `Today's one thing for ${focus}: ${task}. Target: ${deadline}. Everything else is secondary.` },
        { heading: "Game Plan", list: [`Block 1 — set up: open only what "${task}" needs and silence notifications.`, `Block 2 — execute: work it to "good enough to ship," not perfect.`, `Block 3 — close: ship it or schedule the final step before ${deadline}.`] },
        { heading: "Energy Note", body: pace },
        { heading: "Next Steps", list: ["Start Block 1 within the next 15 minutes.", `Write down that "${task}" ships by ${deadline}.`, "Reopen Vee AI tonight and log what actually shipped."] }
      ];
    }
  },
  {
    id: "create-product-ad",
    icon: "\u{1F4E3}",
    title: "Create Product Ad",
    blurb: "Turn a Driven By Dezign product into a short-form ad draft.",
    cta: "Draft my ad",
    fields: [
      { key: "product", label: "Product name", placeholder: "e.g. Amber Glow candle" },
      { key: "audience", label: "Who is it for?", placeholder: "e.g. Busy moms who love cozy nights" },
      { key: "platform", label: "Platform", type: "select", options: ["TikTok", "Instagram Reels", "Facebook", "YouTube Shorts"] },
      { key: "tone", label: "Tone", type: "select", options: ["Warm", "Bold", "Luxury", "Playful"] },
      { key: "offer", label: "Offer or hook", placeholder: "e.g. 20% off launch weekend" }
    ],
    generate: form => {
      const product = veeAiValue(form, "product", "the product");
      const audience = veeAiValue(form, "audience", "your ideal customer");
      const platform = veeAiValue(form, "platform", "TikTok");
      const tone = veeAiValue(form, "tone", "Warm");
      const offer = veeAiValue(form, "offer", "a limited-time launch offer");
      return [
        { heading: "Ad Angle", body: `${tone} problem-to-payoff angle: show ${audience} the before-and-after moment ${product} creates, then anchor it with ${offer}.` },
        { heading: "Script", body: `HOOK (0-3s): "Stop scrolling — if you're ${audience.toLowerCase()}, this is for you."\nPROBLEM (3-8s): Name the everyday frustration ${product} solves, in one sentence.\nREVEAL (8-15s): Show ${product} in action with one slow close-up detail shot.\nPROOF (15-22s): One honest line about why it works, or a quick real reaction.\nCTA (22-30s): "${offer} — tap the link before it's gone."` },
        { heading: "Caption", body: `${product} was made for ${audience.toLowerCase()}. ${offer}. Comment "INFO" and I'll send you the details. #DrivenByDezign #SmallBusiness #ShopSmall` },
        { heading: "Image/Video Prompt", body: `Vertical 9:16 ${platform} ad. Hero shot of ${product} on a clean styled background, warm directional lighting, hands interacting with the product, quick cuts between detail shots, bold on-screen captions, ${tone.toLowerCase()} energy throughout.` },
        { heading: "Next Steps", list: [`Shoot or gather 3-5 clips of ${product}: hero shot, close-up, in-use moment.`, "Paste the Image/Video Prompt into Higgsfield later to generate the visual.", `Post on ${platform} at your audience's peak time and pin the offer comment.`] }
      ];
    }
  },
  {
    id: "generate-visual-prompt",
    icon: "\u{1F3A8}",
    title: "Generate Visual Prompt",
    blurb: "Build a ready-to-paste image or video generation prompt.",
    cta: "Build my prompt",
    fields: [
      { key: "subject", label: "Subject", placeholder: "e.g. Soy candle on a marble tray" },
      { key: "format", label: "Format", type: "select", options: ["Image", "Video"] },
      { key: "style", label: "Style", placeholder: "e.g. Cinematic, editorial, cozy lifestyle" },
      { key: "mood", label: "Mood", placeholder: "e.g. Calm evening luxury" },
      { key: "ratio", label: "Aspect ratio", type: "select", options: ["9:16", "1:1", "4:5", "16:9"] }
    ],
    generate: form => {
      const subject = veeAiValue(form, "subject", "the subject");
      const format = veeAiValue(form, "format", "Image");
      const style = veeAiValue(form, "style", "clean editorial");
      const mood = veeAiValue(form, "mood", "warm and inviting");
      const ratio = veeAiValue(form, "ratio", "9:16");
      const videoExtras = format === "Video" ? " Slow push-in camera movement, soft rack focus on the key detail, 5-8 second loop, natural motion only." : " Sharp focus on the key detail, soft depth of field in the background.";
      return [
        { heading: "Image/Video Prompt", body: `${format} prompt, ${ratio}: ${subject}, ${style.toLowerCase()} style, ${mood.toLowerCase()} mood, warm directional lighting with soft shadows, rich texture detail, professional product photography quality.${videoExtras}` },
        { heading: "Prompt Notes", list: ["Keep the subject description identical across variations so results stay consistent.", "Avoid asking for text inside the image — add captions in editing instead.", `Generate 2-4 variations at ${ratio} and pick the strongest one.`] },
        { heading: "Next Steps", list: ["Paste this prompt into Higgsfield later (mock mode — nothing is sent now).", "Save the best result to your content library with the product name.", "Reuse the same style and mood words for the rest of the campaign."] }
      ];
    }
  },
  {
    id: "government-opportunity-helper",
    icon: "\u{1F3DB}\u{FE0F}",
    title: "Government Opportunity Helper",
    blurb: "Size up a contract opportunity and get a bid checklist.",
    cta: "Review this opportunity",
    fields: [
      { key: "title", label: "Opportunity title", placeholder: "e.g. HR training services RFP" },
      { key: "agency", label: "Agency or buyer", placeholder: "e.g. City of Montgomery" },
      { key: "due", label: "Response due date", type: "date" },
      { key: "scope", label: "Scope summary", type: "textarea", placeholder: "Paste or summarize what they're asking for" }
    ],
    generate: form => {
      const title = veeAiValue(form, "title", "this opportunity");
      const agency = veeAiValue(form, "agency", "the agency");
      const due = veeAiValue(form, "due", "the posted deadline");
      const scope = veeAiValue(form, "scope", "the posted scope of work");
      return [
        { heading: "Fit Snapshot", body: `${title} from ${agency} — responses due ${due}. Core ask: ${scope}. Decide go/no-go within 48 hours.` },
        { heading: "Capability Angle", body: `Position V Solutions as the responsive local partner: hands-on HR consulting experience, fast turnaround, and direct owner involvement.` },
        { heading: "Go/No-Go Questions", list: ["Does the NAICS code and size standard match V Solutions?", "Is there a set-aside (small business, woman-owned) that helps you?", "Can you show at least one comparable past performance story?", "Do you need a teaming partner to cover any gap?"] },
        { heading: "Next Steps", list: ["Pull the full solicitation and read evaluation criteria first.", "Log this in the Government section so deadlines are tracked.", `Draft the capability angle and have it reviewed before ${due}.`, "Send to Claude Code to expand into a full proposal outline."] }
      ];
    }
  },
  {
    id: "hr-content-creator",
    icon: "\u{1F4DD}",
    title: "HR Content Creator",
    blurb: "Draft V Solutions HR content for LinkedIn, video, or email.",
    cta: "Draft my content",
    fields: [
      { key: "topic", label: "Topic", placeholder: "e.g. How to document performance issues" },
      { key: "audience", label: "Audience", type: "select", options: ["Small business owners", "HR managers", "Employees", "Job seekers"] },
      { key: "format", label: "Format", type: "select", options: ["LinkedIn post", "Short video", "Carousel", "Email newsletter"] },
      { key: "cta", label: "Call to action", placeholder: "e.g. Book a free HR consult" }
    ],
    generate: form => {
      const topic = veeAiValue(form, "topic", "an HR best practice");
      const audience = veeAiValue(form, "audience", "Small business owners");
      const format = veeAiValue(form, "format", "LinkedIn post");
      const cta = veeAiValue(form, "cta", "Book a free HR consult with V Solutions");
      return [
        { heading: "Content Angle", body: `Speak to ${audience.toLowerCase()} who are getting ${topic.toLowerCase()} wrong without realizing it. Lead with the cost of the mistake, then give them the fix in plain language.` },
        { heading: "Draft", body: `HOOK: Most ${audience.toLowerCase()} handle "${topic}" wrong — and it costs them.\nPOINT 1: Name the common mistake you see in real engagements.\nPOINT 2: Give the correct approach in 2-3 plain-language sentences.\nPOINT 3: Share one quick win they can apply this week.\nCLOSE: ${cta}.` },
        { heading: "Caption", body: `${topic} doesn't have to be complicated. Here's how ${audience.toLowerCase()} can get it right. ${cta}. #HRConsulting #VSolutionsHR #SmallBusinessHR` },
        { heading: "Next Steps", list: [`Personalize the draft with one real (anonymized) story from a client engagement.`, `Format it for ${format} — keep the hook as the first line on screen.`, "Send to Claude Code to expand into a full content series."] }
      ];
    }
  },
  {
    id: "interview-prep",
    icon: "\u{1F4BC}",
    title: "Interview Prep",
    blurb: "Get a pitch, likely questions, and STAR story starters.",
    cta: "Prep me",
    fields: [
      { key: "role", label: "Role you're interviewing for", placeholder: "e.g. Senior HR Business Partner" },
      { key: "company", label: "Company or agency", placeholder: "e.g. State of Alabama" },
      { key: "type", label: "Interview type", type: "select", options: ["Phone screen", "Behavioral", "Panel", "Technical"] },
      { key: "strengths", label: "Your top strengths for this role", type: "textarea", placeholder: "e.g. Employee relations, investigations, building HR from scratch" }
    ],
    generate: form => {
      const role = veeAiValue(form, "role", "the role");
      const company = veeAiValue(form, "company", "the company");
      const type = veeAiValue(form, "type", "Behavioral");
      const strengths = veeAiValue(form, "strengths", "your core HR strengths");
      return [
        { heading: "Elevator Pitch", body: `I'm an HR professional and consultant whose strengths are ${strengths.toLowerCase()}. I've built and run HR functions hands-on — including my own consulting practice. I'm targeting the ${role} role at ${company} because it's exactly where that mix pays off.` },
        { heading: "Likely Questions", list: [`Walk me through your experience most relevant to ${role}.`, "Tell me about a difficult employee relations situation and how you resolved it.", `Why ${company}, and why now?`, type === "Technical" ? "How do you stay current on employment law and compliance?" : "What would your first 90 days look like in this role?"] },
        { heading: "STAR Story Starters", list: ["A time you handled a sensitive investigation from intake to resolution.", "A time you built or fixed an HR process that leadership noticed.", "A time you delivered a hard recommendation and stood behind it."] },
        { heading: "Next Steps", list: [`Write out one full STAR story per starter above — say them out loud once.`, `Research ${company}: recent news, mission language, and who's on the panel.`, `Prepare 2-3 questions that show you understand the ${role} role.`, "Send to Claude Code for a mock-interview question drill."] }
      ];
    }
  }
];

function veeAiBuildHandoff(action, form, output) {
  const lines = [];
  lines.push("VEE AI HANDOFF (v3 — Agent 4 Control Room, mock mode)");
  lines.push(`Action: ${action.title}`);
  lines.push(`Created: ${new Date().toLocaleString()}`);
  lines.push("");
  lines.push("INPUTS");
  action.fields.forEach(field => { lines.push(`- ${field.label}: ${String(form[field.key] || "").trim() || "(not set)"}`); });
  lines.push("");
  lines.push("DRAFT OUTPUT");
  output.forEach(block => {
    lines.push(`${block.heading}:`);
    if (block.list) block.list.forEach(item => lines.push(`- ${item}`));
    else lines.push(block.body);
    lines.push("");
  });
  lines.push("ROUTING (when ready — nothing is sent automatically)");
  lines.push("- Approval Queue: submit this draft before any external action.");
  lines.push("- Claude Code: refine copy, expand next steps, or wire real AI.");
  lines.push("- Higgsfield: paste the image/video prompt to generate the visual.");
  return lines.join("\n");
}

// ── Control Room Data Layer ───────────────────────────────────────────────────

const crKey = "vshr-agent4-cr";

const crStatusCls = {
  pending: "warn", approved: "success", rejected: "danger", postponed: "",
  sent: "", posted: "success", won: "success", lost: "danger",
  running: "warn", completed: "success", failed: "danger",
  draft: "", active: "success", slow: "warn", reviewing: "warn",
};

function CrBadge({ status }) {
  const cls = crStatusCls[status] || "";
  return <span className={["badge", cls].filter(Boolean).join(" ")}>{status}</span>;
}

// Permission level: 0=Observe, 1=Prepare, 2=Request, 3=Act
function PermLevelBadge({ level }) {
  const labels = { 0: "L0: Observe", 1: "L1: Prepare", 2: "L2: Request", 3: "L3: Act" };
  const cls = { 0: "", 1: "", 2: "warn", 3: "success" };
  return (
    <span className={["badge", cls[level] || ""].filter(Boolean).join(" ")} style={{ fontSize: 11 }}>
      {labels[level] !== undefined ? labels[level] : `L${level}`}
    </span>
  );
}

function RiskBadge({ level }) {
  const cls = { low: "", medium: "warn", high: "danger" };
  return (
    <span className={["badge", cls[level] || ""].filter(Boolean).join(" ")} style={{ fontSize: 11 }}>
      Risk: {level}
    </span>
  );
}

function crSeed() {
  return {
    approvalQueue: [
      {
        id: "aq-1",
        title: "Post summer candle promo — Instagram & TikTok",
        type: "Social Post",
        business: "Driven By Dezign",
        description: "Agent drafted a summer candle collection announcement with script, caption, and visual prompt.",
        noticed: "Amber Glow Soy Candle is approved in the Product Pipeline with 18 units in inventory. No active promotion is running for this product.",
        why: "An approved product with inventory generates revenue only when buyers can see it. This product is ready but invisible to customers.",
        recommended_action: "Approve this post and publish to Instagram and TikTok. Visual prompt is ready for Higgsfield if you need a generated asset.",
        expected_value: "Est. 3–8 units sold at $24.99 = $75–$200 from a single post, with zero production cost.",
        risk_level: "low",
        permission_level: 2,
        status: "pending",
        created_at: "2026-06-09",
        notes: "",
      },
      {
        id: "aq-2",
        title: "Outreach email to Birmingham Janitorial Co.",
        type: "Email Draft",
        business: "Government Contracting",
        description: "Draft intro email to Birmingham Janitorial Co. requesting teaming on the County Facilities bid.",
        noticed: "Birmingham Janitorial Co. quote is in the tracker as pending (not yet contacted) with 8 days until the County Facilities Janitorial bid deadline of 2026-06-18.",
        why: "Without a confirmed subcontractor, V Solutions cannot submit a competitive bid on a $150,000 contract. Every day unsent reduces time to vet, negotiate, and finalize the teaming agreement.",
        recommended_action: "Approve and send the intro outreach email to Birmingham Janitorial Co. today to start the teaming conversation.",
        expected_value: "Required to bid on the $150,000 County Facilities contract. Sub confirmation unlocks the bid.",
        risk_level: "medium",
        permission_level: 2,
        status: "pending",
        created_at: "2026-06-09",
        notes: "",
      },
      {
        id: "aq-3",
        title: "Follow-up to Metro Cleaning Solutions",
        type: "Email Draft",
        business: "Government Contracting",
        description: "Follow-up email to Metro Cleaning Solutions — 5 days since initial contact with no response.",
        noticed: "Metro Cleaning Solutions was sent a $71,500 quote request on 2026-06-05. As of 2026-06-10 (5 days later), there has been no response. The bid deadline is 2026-06-18 — 8 days away.",
        why: "5 days of silence on a $71,500 sub quote is a risk signal. They may be unresponsive, overcommitted, or pricing you out. You need to know now — not at day 7 — so you can pivot to Birmingham if needed.",
        recommended_action: "Send a brief follow-up today. If no response in 48 hours, promote Birmingham Janitorial Co. to primary sub and move Metro to backup.",
        expected_value: "Resolves $71,500 subcontractor uncertainty and protects the overall bid timeline.",
        risk_level: "low",
        permission_level: 2,
        status: "approved",
        created_at: "2026-06-08",
        notes: "Reviewed — matches tone. Approved for sending.",
      },
      {
        id: "aq-4",
        title: "LinkedIn HR tip post — performance documentation",
        type: "Social Post",
        business: "V Solutions HR",
        description: "Post on documenting performance issues, drafted by HR Content Creator.",
        noticed: "No V Solutions HR content has been posted to LinkedIn in the past 7 days. Consistent posting directly supports inbound consulting lead flow.",
        why: "LinkedIn content keeps V Solutions visible to small business owners making HR decisions. A 7-day gap reduces search visibility and pipeline momentum.",
        recommended_action: "Revise the draft to include one specific, anonymized real-world example before approving. Generic tips underperform on LinkedIn — specificity drives engagement.",
        expected_value: "Brand visibility for V Solutions HR consulting. Supports inbound pipeline over a 30–90 day window.",
        risk_level: "low",
        permission_level: 2,
        status: "rejected",
        created_at: "2026-06-07",
        notes: "Too generic. Needs a specific example from a real engagement before resubmitting.",
      },
      {
        id: "aq-5",
        title: "Create Etsy listing — Custom Pet Memorial Frame",
        type: "Product Listing",
        business: "Driven By Dezign",
        description: "Laser-cut custom pet memorial frame is design-complete. Agent prepared a listing draft at $45.00 as a made-to-order item.",
        noticed: "Custom Pet Memorial Frame (Laser) is marked 'approved' in the Product Pipeline with a completed laser file but no active listing. Inventory shows zero — it is not yet listed anywhere.",
        why: "A completed, approved product sitting unlisted generates $0. This is a made-to-order item — it requires no upfront inventory. There is no cost to listing it today.",
        recommended_action: "Approve and publish the Etsy listing at $45.00 as made-to-order. Each order fills from your laser engraver with no pre-production cost.",
        expected_value: "$45.00 per order at near-zero marginal cost. High-margin product with emotional purchase motivation.",
        risk_level: "low",
        permission_level: 2,
        status: "pending",
        created_at: "2026-06-10",
        notes: "",
      },
      {
        id: "aq-6",
        title: "Daily priority task list — June 10",
        type: "Internal Task",
        business: "All",
        description: "Agent compiled a prioritized action list for today based on quote deadlines, product pipeline status, and pending approvals.",
        noticed: "2 high-urgency quote actions, 3 pending Level 2 approvals, and 1 approved product ready to list detected across the Control Room as of June 10, 2026.",
        why: "Consolidating the day's most time-sensitive actions prevents missed deadlines. The janitorial bid deadline (8 days) is the most critical item.",
        recommended_action: "Use this as your task checklist for June 10: (1) Send Metro follow-up, (2) Send Birmingham outreach, (3) Publish Etsy pet frame listing.",
        expected_value: "Prevents missed deadline on $150K bid. Estimated 20–30 minutes to complete all three actions.",
        risk_level: "low",
        permission_level: 1,
        status: "pending",
        created_at: "2026-06-10",
        notes: "",
      },
    ],
    agentLog: [
      { id: "al-1", agent: "Government Opportunity Helper", action: "Analyzed HR Policy Review RFP — City of Montgomery", status: "completed", timestamp: "2026-06-10 09:14", source: "manual", output_preview: "Go/No-Go: Yes. Fit: High. Teaming: not required." },
      { id: "al-2", agent: "HR Content Creator", action: "Drafted LinkedIn post on performance documentation", status: "completed", timestamp: "2026-06-10 08:55", source: "manual", output_preview: "LinkedIn post draft ready. 3 hook variations generated." },
      { id: "al-3", agent: "Create Product Ad", action: "Generated TikTok ad script for Amber Glow Candle", status: "completed", timestamp: "2026-06-09 17:30", source: "manual", output_preview: "Script + caption + visual prompt ready." },
      { id: "al-4", agent: "Daily Opportunity Scout", action: "Scanned Alabama Buys + City of Montgomery for new opportunities", status: "completed", timestamp: "2026-06-10 06:00", source: "scheduled", output_preview: "5 opportunities reviewed, 2 flagged for approval queue." },
      { id: "al-5", agent: "Quote Reminder Agent", action: "Checked for overdue quote follow-ups", status: "completed", timestamp: "2026-06-10 06:05", source: "scheduled", output_preview: "1 follow-up drafted: Metro Cleaning (5 days since submission)." },
      { id: "al-6", agent: "Social Media Scheduler", action: "Prepared this week's candle content calendar", status: "failed", timestamp: "2026-06-09 22:00", source: "scheduled", output_preview: "No approved drafts found — posting skipped." },
      { id: "al-7", agent: "Equipment ROI Monitor", action: "Monthly ROI snapshot for Driven By Dezign equipment", status: "completed", timestamp: "2026-06-10 06:10", source: "scheduled", output_preview: "5 items tracked. DTF and Sublimation highest performers." },
    ],
    productPipeline: [
      { id: "pp-1", name: "Amber Glow Soy Candle", category: "Candles", platform: "TikTok + Etsy", stage: "Ad In Review", status: "pending", price: 24.99, inventory: 18, created_at: "2026-06-08", notes: "Awaiting approval queue sign-off on TikTok ad." },
      { id: "pp-2", name: "Navy & Gold Tumbler (DTF)", category: "Drinkware", platform: "Etsy + Instagram", stage: "Live", status: "posted", price: 34.99, inventory: 6, created_at: "2026-06-05", notes: "Listed on Etsy. Watch inventory." },
      { id: "pp-3", name: "Custom Pet Memorial Frame (Laser)", category: "Gifts", platform: "Etsy", stage: "Design Ready", status: "approved", price: 45.00, inventory: 0, created_at: "2026-06-09", notes: "Laser file done. Ready to list." },
      { id: "pp-4", name: "V Solutions HR Branded Notebook", category: "Merch", platform: "Amazon KDP", stage: "Draft", status: "pending", price: 12.99, inventory: null, created_at: "2026-06-10", notes: "Cover design in progress." },
      { id: "pp-5", name: "Summer Citrus Candle Set", category: "Candles", platform: "TikTok + Etsy", stage: "Concept", status: "pending", price: 39.99, inventory: null, created_at: "2026-06-10", notes: "Seasonal drop. Scent formula needs finalizing." },
    ],
    quoteTracker: [
      { id: "qt-1", subcontractor: "Birmingham Janitorial Co.", opportunity: "County Facilities Janitorial – Multiple Buildings", amount: 68000, status: "pending", due_date: "2026-06-18", submitted_date: "", notes: "Need to send intro + quote request email." },
      { id: "qt-2", subcontractor: "Metro Cleaning Solutions", opportunity: "County Facilities Janitorial – Multiple Buildings", amount: 71500, status: "sent", due_date: "2026-06-18", submitted_date: "2026-06-05", notes: "Sent initial contact. Awaiting response." },
      { id: "qt-3", subcontractor: "Alabama HR Consulting Group", opportunity: "HR Policy Review – City of Montgomery", amount: 4200, status: "won", due_date: "2026-06-28", submitted_date: "2026-06-04", notes: "Confirmed as legal review subcontractor." },
      { id: "qt-4", subcontractor: "Capital City Staffing", opportunity: "Small Business Vendor Outreach", amount: 6000, status: "lost", due_date: "2026-07-03", submitted_date: "2026-06-02", notes: "Went with another vendor. Note for future bids." },
    ],
    equipmentROI: [
      { id: "eq-1", equipment: "DTF Printer", cost: 3200, monthly_revenue: 850, jobs_last_30: 14, roi_months: 4, status: "active", notes: "Primary shirt/apparel printer. High demand." },
      { id: "eq-2", equipment: "CO2 Laser Engraver", cost: 4800, monthly_revenue: 620, jobs_last_30: 9, roi_months: 8, status: "active", notes: "Frames, keychains, wood signs. Growing." },
      { id: "eq-3", equipment: "UV DTF Printer", cost: 2100, monthly_revenue: 410, jobs_last_30: 7, roi_months: 5, status: "active", notes: "Wraps and hard-surface prints." },
      { id: "eq-4", equipment: "Sublimation Setup", cost: 900, monthly_revenue: 290, jobs_last_30: 11, roi_months: 3, status: "active", notes: "Tumblers, mugs, desk mats." },
      { id: "eq-5", equipment: "3D Printer", cost: 650, monthly_revenue: 85, jobs_last_30: 2, roi_months: 8, status: "slow", notes: "Custom prototypes only. Low volume." },
    ],
  };
}

function useCrState() {
  const [cr, setCr] = useState(() => {
    try {
      const saved = localStorage.getItem(crKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.approvalQueue) return parsed;
      }
    } catch (_) {}
    return crSeed();
  });

  const updateStatus = (table, id, status) => {
    setCr(prev => {
      const next = { ...prev, [table]: prev[table].map(item => item.id === id ? { ...item, status } : item) };
      try { localStorage.setItem(crKey, JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  const updateField = (table, id, field, value) => {
    setCr(prev => {
      const next = { ...prev, [table]: prev[table].map(item => item.id === id ? { ...item, [field]: value } : item) };
      try { localStorage.setItem(crKey, JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  const addItem = (table, item) => {
    setCr(prev => {
      const next = { ...prev, [table]: [...prev[table], item] };
      try { localStorage.setItem(crKey, JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  const resetToSeed = () => {
    const seed = crSeed();
    try { localStorage.setItem(crKey, JSON.stringify(seed)); } catch (_) {}
    setCr(seed);
  };

  return { cr, updateStatus, updateField, addItem, resetToSeed };
}

// ── Quote Intelligence Helpers ────────────────────────────────────────────────

function crDaysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.ceil((d - now) / 86400000);
}

function crDaysSince(dateStr) {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.ceil((now - d) / 86400000);
}

function crNextAction(item) {
  const dup = crDaysUntil(item.due_date);
  const dss = item.submitted_date ? crDaysSince(item.submitted_date) : null;
  if (item.status === "pending") {
    if (dup !== null && dup <= 2) return { urgency: "high", text: `Quote unsent with ${dup} day${dup === 1 ? "" : "s"} left — send immediately.` };
    if (dup !== null && dup <= 7) return { urgency: "medium", text: `${dup} days to deadline. Draft and send quote this week.` };
    return { urgency: "low", text: "No deadline pressure yet. Draft outreach when ready." };
  }
  if (item.status === "sent") {
    if (dup !== null && dup < 0) return { urgency: "high", text: "Deadline has passed — close this as won or lost." };
    if (dss !== null && dss >= 5) return { urgency: "high", text: `${dss} days with no reply on $${item.amount.toLocaleString()}. Follow up now.` };
    if (dss !== null && dss >= 3) return { urgency: "medium", text: `${dss} days since contact. Consider a brief check-in.` };
    return { urgency: "low", text: "Awaiting response. Follow up if no reply by day 5." };
  }
  if (item.status === "won") return { urgency: "none", text: "Confirmed. Add to proposal team and share scope details." };
  if (item.status === "lost") return { urgency: "none", text: "Log reason and keep contact warm for future bids." };
  return { urgency: "low", text: "—" };
}

const crUrgencyBadgeCls = { high: "danger", medium: "warn", low: "" };

function CrUrgencyBadge({ urgency }) {
  if (!urgency || urgency === "none") return null;
  const cls = crUrgencyBadgeCls[urgency] || "";
  const label = urgency === "high" ? "Act now" : urgency === "medium" ? "Follow up" : "Monitor";
  return <span className={["badge", cls].filter(Boolean).join(" ")} style={{ fontSize: 11 }}>{label}</span>;
}

// ── Manager Agent Analysis ────────────────────────────────────────────────────

function agentComputeSummary(cr) {
  // Level 0 — observations from current data state
  const found = [];
  cr.quoteTracker.forEach(q => {
    const na = crNextAction(q);
    if (na.urgency === "high" || na.urgency === "medium") {
      found.push({ urgency: na.urgency, text: na.text, source: "Quote Tracker", id: q.id });
    }
  });
  cr.productPipeline.filter(p => p.status === "approved").forEach(p => {
    found.push({ urgency: "low", text: `${p.name} is approved and ready to post on ${p.platform} — currently unlisted.`, source: "Product Pipeline", id: p.id });
  });
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  found.sort((a, b) => (urgencyOrder[a.urgency] ?? 3) - (urgencyOrder[b.urgency] ?? 3));

  // Level 1 — what the agent prepared (no external action, queued for awareness)
  const prepared = cr.approvalQueue.filter(a => (a.permission_level ?? 2) === 1 && a.status !== "rejected");

  // Level 2 — items needing explicit permission before any external action
  const needsPermission = cr.approvalQueue.filter(a => (a.permission_level ?? 2) >= 2 && a.status === "pending");

  // Top recommendation — highest urgency + most concrete value
  let topRec = null;
  const approvedReady = cr.approvalQueue.find(a => a.status === "approved" && (a.permission_level ?? 2) >= 2);
  if (approvedReady) {
    topRec = { title: approvedReady.title, action: approvedReady.recommended_action, value: approvedReady.expected_value, signal: "approved — ready to send" };
  } else {
    const highUrgentQuote = cr.quoteTracker.find(q => crNextAction(q).urgency === "high" && q.status === "sent");
    if (highUrgentQuote) {
      const na = crNextAction(highUrgentQuote);
      topRec = { title: highUrgentQuote.subcontractor, action: na.text, value: `$${highUrgentQuote.amount.toLocaleString()} bid at stake`, signal: "high urgency" };
    } else if (needsPermission.length > 0) {
      const a = needsPermission[0];
      topRec = { title: a.title, action: a.recommended_action, value: a.expected_value, signal: "awaiting your approval" };
    }
  }

  return { found, prepared, needsPermission, topRec };
}

// ── Manager Agent Summary Panel ───────────────────────────────────────────────

function ManagerAgentSummary({ cr, onTabSwitch }) {
  const [expanded, setExpanded] = useState(true);
  const { found, prepared, needsPermission, topRec } = agentComputeSummary(cr);
  const urgentCount = found.filter(f => f.urgency === "high").length;

  return (
    <div className="card cr-manager-summary">
      <button
        type="button"
        className="cr-ms-header"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div className="cr-ms-title">
          <span className="cr-ms-icon" aria-hidden="true">&#x1F916;</span>
          <div>
            <strong>Agent 4 — Manager Summary</strong>
            <span className="cr-meta" style={{ color: "rgba(255,255,255,.65)" }}>
              Continuous analysis &middot; All external actions require your approval
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {urgentCount > 0 && <span className="badge danger">{urgentCount} urgent</span>}
          {needsPermission.length > 0 && <span className="badge warn">{needsPermission.length} need permission</span>}
          <span className="badge" style={{ background: "rgba(255,255,255,.15)", color: "#fff" }}>
            {expanded ? "Collapse" : "Expand"}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="cr-ms-body">
          <div className="cr-ms-grid">

            {/* What I found */}
            <div className="cr-ms-section">
              <h4>What I found</h4>
              {found.length === 0
                ? <p className="muted" style={{ fontSize: 13, margin: 0 }}>No issues detected in current data.</p>
                : (
                  <ul className="cr-ms-list">
                    {found.map((f, i) => (
                      <li key={i} className={`cr-ms-item cr-ms-item-${f.urgency}`}>
                        <span className="cr-ms-dot" aria-hidden="true" />
                        <span>{f.text} <em className="cr-ms-source">({f.source})</em></span>
                      </li>
                    ))}
                  </ul>
                )
              }
            </div>

            {/* What I prepared */}
            <div className="cr-ms-section">
              <h4>What I prepared</h4>
              {prepared.length === 0
                ? <p className="muted" style={{ fontSize: 13, margin: 0 }}>No Level 1 drafts prepared.</p>
                : (
                  <ul className="cr-ms-list">
                    {prepared.map(a => (
                      <li key={a.id} className="cr-ms-item cr-ms-item-low">
                        <span className="cr-ms-dot" aria-hidden="true" />
                        <span>
                          <strong>{a.title}</strong>
                          <em className="cr-ms-source"> ({a.type})</em>
                        </span>
                      </li>
                    ))}
                  </ul>
                )
              }
            </div>

            {/* What needs permission */}
            <div className="cr-ms-section">
              <h4>What needs your permission</h4>
              {needsPermission.length === 0
                ? <p className="muted" style={{ fontSize: 13, margin: 0 }}>No pending Level 2 approvals.</p>
                : (
                  <ul className="cr-ms-list">
                    {needsPermission.map(a => (
                      <li key={a.id} className="cr-ms-item cr-ms-item-medium">
                        <span className="cr-ms-dot" aria-hidden="true" />
                        <span>
                          <strong>{a.title}</strong>
                          <span className="cr-ms-source"> — {a.type}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )
              }
              {needsPermission.length > 0 && (
                <button type="button" className="btn secondary" style={{ fontSize: 12, padding: "6px 10px", marginTop: 8 }} onClick={() => onTabSwitch("queue")}>
                  Open Approval Queue
                </button>
              )}
            </div>

            {/* Recommend first */}
            <div className="cr-ms-section cr-ms-top-rec">
              <h4>Recommend doing first</h4>
              {topRec
                ? (
                  <div className="cr-ms-rec-card">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <strong>{topRec.title}</strong>
                      <span className="badge warn" style={{ fontSize: 11 }}>{topRec.signal}</span>
                    </div>
                    <p>{topRec.action}</p>
                    <span className="muted" style={{ fontSize: 12 }}>{topRec.value}</span>
                  </div>
                )
                : <p className="muted" style={{ fontSize: 13, margin: 0 }}>No critical actions detected.</p>
              }
            </div>

          </div>

          {/* Permission level legend */}
          <div className="cr-ms-legend">
            <span><PermLevelBadge level={0} /> Read data, analyze, generate recommendations — no approval needed</span>
            <span><PermLevelBadge level={1} /> Draft content, create tasks — no external action, queued for review</span>
            <span><PermLevelBadge level={2} /> Send, post, contact, spend — your explicit approval required</span>
            <span><PermLevelBadge level={3} /> Mark sent, log result, update pipeline — available after Level 2 approval</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Approval Queue Card ───────────────────────────────────────────────────────

function ApprovalQueueCard({ item, updateStatus, updateField }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(item.notes || "");

  const saveNote = () => {
    updateField("approvalQueue", item.id, "notes", editText);
    setEditing(false);
  };

  const permLevel = item.permission_level ?? 2;

  return (
    <div className={["cr-aq-card card", item.status === "pending" ? "cr-aq-pending" : ""].join(" ").trim()}>

      {/* Card header */}
      <div className="cr-aq-head">
        <div style={{ flex: 1 }}>
          <strong>{item.title}</strong>
          <div className="cr-aq-meta">
            <span className="badge" style={{ fontSize: 11 }}>{item.type}</span>
            <PermLevelBadge level={permLevel} />
            <RiskBadge level={item.risk_level || "low"} />
            <span className="muted" style={{ fontSize: 12 }}>{item.business} &middot; {item.created_at}</span>
          </div>
        </div>
        <CrBadge status={item.status} />
      </div>

      {/* 7-field intelligence block */}
      <div className="cr-aq-fields">
        <div className="cr-aq-field">
          <span className="cr-aq-field-label">What Agent 4 noticed</span>
          <span className="cr-aq-field-value">{item.noticed || item.description}</span>
        </div>
        <div className="cr-aq-field">
          <span className="cr-aq-field-label">Why it matters</span>
          <span className="cr-aq-field-value">{item.why || "—"}</span>
        </div>
        <div className="cr-aq-field">
          <span className="cr-aq-field-label">Recommended action</span>
          <span className="cr-aq-field-value cr-aq-action-text">{item.recommended_action || "—"}</span>
        </div>
        <div className="cr-aq-field-row">
          <div className="cr-aq-field">
            <span className="cr-aq-field-label">Expected value</span>
            <span className="cr-aq-field-value">{item.expected_value || "—"}</span>
          </div>
          <div className="cr-aq-field">
            <span className="cr-aq-field-label">Risk level</span>
            <RiskBadge level={item.risk_level || "low"} />
          </div>
          <div className="cr-aq-field">
            <span className="cr-aq-field-label">Permission required</span>
            <PermLevelBadge level={permLevel} />
          </div>
        </div>
      </div>

      {/* Notes display / edit */}
      {item.notes && !editing && (
        <p className="muted cr-aq-note"><em>Note: {item.notes}</em></p>
      )}
      {editing && (
        <div className="cr-aq-edit">
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            placeholder="Add a note or revision instruction..."
          />
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button type="button" className="btn gold" onClick={saveNote}>Save Note</button>
            <button type="button" className="btn secondary" onClick={() => { setEditing(false); setEditText(item.notes || ""); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Action buttons — vary by current status */}
      <div className="cr-aq-actions">
        {item.status === "pending" && (
          <>
            <button type="button" className="btn" onClick={() => updateStatus("approvalQueue", item.id, "approved")}>Approve</button>
            <button type="button" className="btn secondary" onClick={() => updateStatus("approvalQueue", item.id, "rejected")}>Reject</button>
            <button type="button" className="btn secondary" onClick={() => setEditing(v => !v)}>{editing ? "Cancel Edit" : "Edit"}</button>
            <button type="button" className="btn secondary" onClick={() => updateStatus("approvalQueue", item.id, "postponed")}>Postpone</button>
          </>
        )}
        {item.status === "approved" && (
          <>
            <button type="button" className="btn gold" onClick={() => updateStatus("approvalQueue", item.id, "sent")}>Mark Sent / Completed</button>
            <button type="button" className="btn secondary" onClick={() => updateStatus("approvalQueue", item.id, "pending")}>Undo Approval</button>
            <button type="button" className="btn secondary" onClick={() => setEditing(v => !v)}>{editing ? "Cancel Edit" : "Edit"}</button>
          </>
        )}
        {item.status === "sent" && (
          <span className="muted" style={{ fontSize: 13, alignSelf: "center" }}>Completed &mdash; logged in Agent Log.</span>
        )}
        {(item.status === "rejected" || item.status === "postponed") && (
          <>
            <button type="button" className="btn secondary" onClick={() => updateStatus("approvalQueue", item.id, "pending")}>Restore to Pending</button>
            <button type="button" className="btn secondary" onClick={() => setEditing(v => !v)}>{editing ? "Cancel Edit" : "Edit"}</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Approval Queue Tab ────────────────────────────────────────────────────────

function ApprovalQueueTab({ items, updateStatus, updateField }) {
  const [filter, setFilter] = useState("all");
  const visible = filter === "all" ? items : items.filter(i => i.status === filter);
  const pendingCount = items.filter(i => i.status === "pending").length;
  const l2Pending = items.filter(i => i.status === "pending" && (i.permission_level ?? 2) >= 2).length;

  return (
    <div className="agent-cr-section">
      <div className="panel-head">
        <div>
          <h3>Approval Queue</h3>
          <p className="muted cr-section-desc" style={{ margin: 0 }}>
            Every item Agent 4 prepared or flagged — with full reasoning. Nothing external happens without your explicit approval.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {l2Pending > 0 && <span className="badge warn">{l2Pending} need permission</span>}
          {pendingCount > 0 && <span className="badge">{pendingCount} pending total</span>}
        </div>
      </div>

      <div className="toolbar">
        {["all", "pending", "approved", "rejected", "postponed", "sent"].map(f => (
          <button key={f} type="button" className={["btn", filter === f ? "" : "secondary"].join(" ")} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {visible.length === 0
        ? <div className="cr-empty">No items match this filter.</div>
        : (
          <div className="cr-queue-list">
            {visible.map(item => (
              <ApprovalQueueCard
                key={item.id}
                item={item}
                updateStatus={updateStatus}
                updateField={updateField}
              />
            ))}
          </div>
        )
      }
    </div>
  );
}

// ── Agent Activity Log ────────────────────────────────────────────────────────

function AgentLogTab({ items }) {
  const [sourceFilter, setSourceFilter] = useState("all");
  const visible = sourceFilter === "all" ? items : items.filter(i => i.source === sourceFilter);

  return (
    <div className="agent-cr-section">
      <div className="panel-head">
        <h3>Agent Activity Log</h3>
        <span className="muted" style={{ fontSize: 13 }}>{items.length} runs logged</span>
      </div>
      <p className="muted cr-section-desc">Every agent run — manual and scheduled. Read-only. Nothing here has been sent anywhere.</p>
      <div className="toolbar">
        {["all", "manual", "scheduled"].map(f => (
          <button key={f} type="button" className={["btn", sourceFilter === f ? "" : "secondary"].join(" ")} onClick={() => setSourceFilter(f)}>
            {f === "all" ? "All sources" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Agent</th>
              <th>Action</th>
              <th>Output Preview</th>
              <th>Source</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(item => (
              <tr key={item.id}>
                <td style={{ whiteSpace: "nowrap", fontSize: 13 }}>{item.timestamp}</td>
                <td><strong>{item.agent}</strong></td>
                <td style={{ maxWidth: 220 }}>{item.action}</td>
                <td style={{ maxWidth: 280 }}><span className="muted" style={{ fontSize: 13 }}>{item.output_preview}</span></td>
                <td><span className="cr-log-source">{item.source}</span></td>
                <td><CrBadge status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="cr-schedule-note card" style={{ marginTop: 16 }}>
        <div className="panel-head"><h4 style={{ margin: 0, color: "var(--navy)" }}>Mock Scheduled Runs</h4><span className="badge">Simulated</span></div>
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>These simulate daily agent runs (06:00–06:15). When connected to n8n, Supabase Edge Functions, or a cron job, live records will replace these.</p>
        <div className="cr-schedule-list">
          {[
            { name: "Daily Opportunity Scout", time: "06:00", freq: "Daily" },
            { name: "Quote Reminder Agent", time: "06:05", freq: "Daily" },
            { name: "Equipment ROI Monitor", time: "06:10", freq: "Monthly" },
            { name: "Social Media Scheduler", time: "22:00", freq: "Daily" },
          ].map(run => (
            <div key={run.name} className="cr-schedule-row">
              <span>{run.name}</span>
              <span className="muted" style={{ fontSize: 13 }}>{run.freq} at {run.time}</span>
              <span className="badge">mock</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Product Pipeline ──────────────────────────────────────────────────────────

function ProductPipelineTab({ items, updateStatus }) {
  const [filter, setFilter] = useState("all");
  const visible = filter === "all" ? items : items.filter(i => i.status === filter);

  return (
    <div className="agent-cr-section">
      <div className="panel-head">
        <h3>Product Pipeline</h3>
        <span className="badge">{items.length} products</span>
      </div>
      <p className="muted cr-section-desc">Track every Driven By Dezign product from concept to live listing. Status advances manually — posting only happens when you do it.</p>
      <div className="toolbar">
        {["all", "pending", "approved", "posted"].map(s => (
          <button key={s} type="button" className={["btn", filter === s ? "" : "secondary"].join(" ")} onClick={() => setFilter(s)}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Stage</th>
              <th>Price</th>
              <th>Inventory</th>
              <th>Platform</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(item => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  {item.notes && <span className="table-subline muted">{item.notes}</span>}
                </td>
                <td>{item.category}</td>
                <td>{item.stage}</td>
                <td>${item.price != null ? item.price.toFixed(2) : "—"}</td>
                <td>{item.inventory != null ? item.inventory : "—"}</td>
                <td style={{ fontSize: 13 }}>{item.platform}</td>
                <td><CrBadge status={item.status} /></td>
                <td>
                  <div className="row-actions">
                    {item.status === "pending" && <button type="button" className="btn" onClick={() => updateStatus("productPipeline", item.id, "approved")}>Approve</button>}
                    {item.status === "approved" && <button type="button" className="btn" onClick={() => updateStatus("productPipeline", item.id, "posted")}>Mark Posted</button>}
                    {item.status !== "pending" && <button type="button" className="btn secondary" onClick={() => updateStatus("productPipeline", item.id, "pending")}>Reset</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Subcontractor Quote Tracker — Intelligent Edition ────────────────────────

function QuoteTrackerTab({ items, updateStatus, addItem }) {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("flat");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ subcontractor: "", opportunity: "", amount: "", due_date: "", notes: "" });

  const totalOpen = items.filter(i => i.status === "pending" || i.status === "sent").reduce((s, i) => s + i.amount, 0);
  const totalWon = items.filter(i => i.status === "won").reduce((s, i) => s + i.amount, 0);
  const wonCount = items.filter(i => i.status === "won").length;
  const decidedCount = items.filter(i => i.status === "won" || i.status === "lost").length;
  const winRate = decidedCount > 0 ? Math.round((wonCount / decidedCount) * 100) : null;
  const urgentItems = items.filter(i => crNextAction(i).urgency === "high");

  const visible = filter === "all" ? items : items.filter(i => i.status === filter);
  const grouped = visible.reduce((acc, item) => {
    const key = item.opportunity || "Unassigned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const opportunityOptions = [...new Set(items.map(i => i.opportunity).filter(Boolean))];
  const setAF = (k, v) => setAddForm(p => ({ ...p, [k]: v }));

  const handleAddSave = () => {
    if (!addForm.subcontractor.trim()) return;
    addItem("quoteTracker", {
      id: "qt-" + Date.now(),
      subcontractor: addForm.subcontractor.trim(),
      opportunity: addForm.opportunity.trim(),
      amount: Number(addForm.amount) || 0,
      due_date: addForm.due_date,
      submitted_date: "",
      status: "pending",
      notes: addForm.notes.trim(),
    });
    setAddForm({ subcontractor: "", opportunity: "", amount: "", due_date: "", notes: "" });
    setShowAddForm(false);
  };

  return (
    <div className="agent-cr-section">
      <div className="panel-head">
        <h3>Subcontractor Quote Tracker</h3>
        <button type="button" className="btn gold" onClick={() => setShowAddForm(v => !v)}>
          {showAddForm ? "Cancel" : "+ Add Quote"}
        </button>
      </div>
      <p className="muted cr-section-desc">Track subcontractor quotes across government bids. Urgency and next-action are computed from due dates and submission history.</p>

      <div className="grid metrics">
        <div className="card">
          <small className="muted">Open Pipeline</small>
          <strong style={{ color: "var(--navy)", fontSize: 24, display: "block" }}>${totalOpen.toLocaleString()}</strong>
          <span style={{ fontSize: 12, color: "var(--gray-500)" }}>pending + sent</span>
        </div>
        <div className="card">
          <small className="muted">Won Value</small>
          <strong style={{ color: "var(--success)", fontSize: 24, display: "block" }}>${totalWon.toLocaleString()}</strong>
          <span style={{ fontSize: 12, color: "var(--gray-500)" }}>confirmed partners</span>
        </div>
        <div className="card">
          <small className="muted">Win Rate</small>
          <strong style={{ color: "var(--navy)", fontSize: 24, display: "block" }}>{winRate !== null ? `${winRate}%` : "—"}</strong>
          <span style={{ fontSize: 12, color: "var(--gray-500)" }}>{wonCount} won / {decidedCount} decided</span>
        </div>
        <div className="card">
          <small className="muted">Urgent Actions</small>
          <strong style={{ color: urgentItems.length > 0 ? "var(--danger)" : "var(--success)", fontSize: 24, display: "block" }}>{urgentItems.length}</strong>
          <span style={{ fontSize: 12, color: "var(--gray-500)" }}>quotes need action today</span>
        </div>
      </div>

      {urgentItems.length > 0 && (
        <div className="cr-urgency-strip">
          {urgentItems.map(item => {
            const na = crNextAction(item);
            return (
              <div key={item.id} className="cr-urgency-item">
                <strong>{item.subcontractor}</strong>
                <span>{na.text}</span>
                <span className="badge danger">Act now</span>
              </div>
            );
          })}
        </div>
      )}

      {showAddForm && (
        <div className="card cr-add-form">
          <div className="panel-head">
            <h4 style={{ margin: 0, color: "var(--navy)" }}>New Subcontractor Quote</h4>
            <span className="badge warn">Draft only — not sent</span>
          </div>
          <div className="form-grid">
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
              Subcontractor name
              <input type="text" value={addForm.subcontractor} placeholder="Company name" onChange={e => setAF("subcontractor", e.target.value)} style={{ border: "1px solid var(--gray-200)", borderRadius: 8, padding: "10px 11px", background: "var(--white)" }} />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
              Opportunity / Bid
              <input type="text" value={addForm.opportunity} placeholder="Contract name" list="qt-opp-list" onChange={e => setAF("opportunity", e.target.value)} style={{ border: "1px solid var(--gray-200)", borderRadius: 8, padding: "10px 11px", background: "var(--white)" }} />
              <datalist id="qt-opp-list">{opportunityOptions.map(o => <option key={o} value={o} />)}</datalist>
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
              Quote Amount ($)
              <input type="number" value={addForm.amount} placeholder="0" onChange={e => setAF("amount", e.target.value)} style={{ border: "1px solid var(--gray-200)", borderRadius: 8, padding: "10px 11px", background: "var(--white)" }} />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
              Bid Due Date
              <input type="date" value={addForm.due_date} onChange={e => setAF("due_date", e.target.value)} style={{ border: "1px solid var(--gray-200)", borderRadius: 8, padding: "10px 11px", background: "var(--white)" }} />
            </label>
          </div>
          <label style={{ display: "grid", gap: 6, marginTop: 10, fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
            Notes
            <textarea value={addForm.notes} placeholder="Capacity, intro contact, scoping info..." onChange={e => setAF("notes", e.target.value)} style={{ border: "1px solid var(--gray-200)", borderRadius: 8, padding: "10px 11px", background: "var(--white)", minHeight: 70, resize: "vertical" }} />
          </label>
          <div className="actions">
            <button type="button" className="btn secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button type="button" className="btn gold" disabled={!addForm.subcontractor.trim()} onClick={handleAddSave}>Save Quote</button>
          </div>
        </div>
      )}

      <div className="toolbar">
        {["all", "pending", "sent", "won", "lost"].map(f => (
          <button key={f} type="button" className={["btn", filter === f ? "" : "secondary"].join(" ")} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button type="button" className={["btn", view === "flat" ? "" : "secondary"].join(" ")} onClick={() => setView("flat")}>Flat</button>
          <button type="button" className={["btn", view === "grouped" ? "" : "secondary"].join(" ")} onClick={() => setView("grouped")}>By Bid</button>
        </span>
      </div>

      {view === "flat" && (
        visible.length === 0 ? <div className="cr-empty">No items match this filter.</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subcontractor</th>
                  <th>Opportunity</th>
                  <th>Amount</th>
                  <th>Due</th>
                  <th>Since Sent</th>
                  <th>Urgency</th>
                  <th>Next Action</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(item => {
                  const na = crNextAction(item);
                  const dup = crDaysUntil(item.due_date);
                  const dss = item.submitted_date ? crDaysSince(item.submitted_date) : null;
                  const dueDateColor = dup === null ? "var(--gray-500)" : dup < 0 ? "var(--danger)" : dup <= 3 ? "var(--warning)" : "var(--gray-500)";
                  return (
                    <tr key={item.id} className={na.urgency === "high" ? "cr-row-urgent" : ""}>
                      <td>
                        <strong>{item.subcontractor}</strong>
                        {item.notes && <span className="table-subline muted">{item.notes}</span>}
                      </td>
                      <td style={{ maxWidth: 180, fontSize: 13 }}>{item.opportunity}</td>
                      <td style={{ whiteSpace: "nowrap" }}>${item.amount.toLocaleString()}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13 }}>{item.due_date || "—"}</span>
                        {dup !== null && (
                          <span className="table-subline" style={{ color: dueDateColor, fontWeight: 700 }}>
                            {dup < 0 ? `${Math.abs(dup)}d overdue` : `${dup}d left`}
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>{dss !== null ? `${dss}d ago` : "—"}</td>
                      <td><CrUrgencyBadge urgency={na.urgency} /></td>
                      <td style={{ minWidth: 180 }}><span style={{ fontSize: 13, color: "var(--gray-800)", lineHeight: 1.45, display: "block" }}>{na.text}</span></td>
                      <td><CrBadge status={item.status} /></td>
                      <td>
                        <div className="row-actions">
                          {item.status === "pending" && <button type="button" className="btn" onClick={() => updateStatus("quoteTracker", item.id, "sent")}>Mark Sent</button>}
                          {item.status === "sent" && (<><button type="button" className="btn" onClick={() => updateStatus("quoteTracker", item.id, "won")}>Won</button><button type="button" className="btn secondary" onClick={() => updateStatus("quoteTracker", item.id, "lost")}>Lost</button></>)}
                          {(item.status === "won" || item.status === "lost") && <button type="button" className="btn secondary" onClick={() => updateStatus("quoteTracker", item.id, "sent")}>Reset</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {view === "grouped" && (
        Object.keys(grouped).length === 0 ? <div className="cr-empty">No items match this filter.</div> : (
          <div className="cr-grouped-bids">
            {Object.entries(grouped).map(([opp, oppItems]) => {
              const oppTotal = oppItems.reduce((s, i) => s + i.amount, 0);
              const oppDue = oppItems[0]?.due_date || "";
              const dup = crDaysUntil(oppDue);
              const highCount = oppItems.filter(i => crNextAction(i).urgency === "high").length;
              const dupLabel = dup === null ? "" : dup < 0 ? ` — ${Math.abs(dup)}d overdue` : ` — ${dup}d left`;
              return (
                <div key={opp} className="card cr-bid-group">
                  <div className="cr-bid-group-head">
                    <div>
                      <strong style={{ color: "var(--navy)", fontSize: 15 }}>{opp}</strong>
                      <span className="cr-meta">
                        {oppItems.length} sub{oppItems.length !== 1 ? "s" : ""} &middot; ${oppTotal.toLocaleString()} combined
                        {oppDue && ` · Due ${oppDue}${dupLabel}`}
                      </span>
                    </div>
                    {highCount > 0 && <span className="badge danger">{highCount} urgent</span>}
                  </div>
                  <div className="cr-bid-subs">
                    {oppItems.map(item => {
                      const na = crNextAction(item);
                      return (
                        <div key={item.id} className={["cr-bid-sub", na.urgency === "high" ? "cr-bid-sub-urgent" : ""].join(" ").trim()}>
                          <div className="cr-bid-sub-left">
                            <strong>{item.subcontractor}</strong>
                            <span className="cr-meta">${item.amount.toLocaleString()}</span>
                            {item.notes && <span className="cr-meta">{item.notes}</span>}
                          </div>
                          <div className="cr-bid-sub-mid">
                            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                              <CrBadge status={item.status} />
                              <CrUrgencyBadge urgency={na.urgency} />
                            </div>
                            <span style={{ fontSize: 13, color: "var(--gray-800)", lineHeight: 1.45 }}>{na.text}</span>
                          </div>
                          <div className="cr-bid-sub-right">
                            <div className="row-actions">
                              {item.status === "pending" && <button type="button" className="btn" onClick={() => updateStatus("quoteTracker", item.id, "sent")}>Mark Sent</button>}
                              {item.status === "sent" && (<><button type="button" className="btn" onClick={() => updateStatus("quoteTracker", item.id, "won")}>Won</button><button type="button" className="btn secondary" onClick={() => updateStatus("quoteTracker", item.id, "lost")}>Lost</button></>)}
                              {(item.status === "won" || item.status === "lost") && <button type="button" className="btn secondary" onClick={() => updateStatus("quoteTracker", item.id, "sent")}>Reset</button>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

// ── Equipment ROI Tracker ─────────────────────────────────────────────────────

function EquipmentROITab({ items }) {
  const totalCost = items.reduce((s, i) => s + i.cost, 0);
  const totalMonthly = items.reduce((s, i) => s + i.monthly_revenue, 0);
  const maxMonthly = Math.max(...items.map(i => i.monthly_revenue), 1);

  return (
    <div className="agent-cr-section">
      <div className="panel-head">
        <h3>Equipment ROI Tracker</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="badge">${totalCost.toLocaleString()} invested</span>
          <span className="badge success">${totalMonthly.toLocaleString()}/mo</span>
        </div>
      </div>
      <p className="muted cr-section-desc">Monthly revenue vs. investment for each Driven By Dezign machine.</p>
      <div className="grid metrics" style={{ marginBottom: 16 }}>
        <div className="card">
          <small className="muted">Total Equipment Cost</small>
          <strong style={{ color: "var(--navy)", fontSize: 26, display: "block" }}>${totalCost.toLocaleString()}</strong>
        </div>
        <div className="card">
          <small className="muted">Combined Monthly Revenue</small>
          <strong style={{ color: "var(--navy)", fontSize: 26, display: "block" }}>${totalMonthly.toLocaleString()}</strong>
        </div>
        <div className="card">
          <small className="muted">Avg Payback Period</small>
          <strong style={{ color: "var(--navy)", fontSize: 26, display: "block" }}>
            {Math.round(items.reduce((s, i) => s + i.roi_months, 0) / items.length)} mo
          </strong>
        </div>
        <div className="card">
          <small className="muted">Active Equipment</small>
          <strong style={{ color: "var(--navy)", fontSize: 26, display: "block" }}>{items.filter(i => i.status === "active").length} / {items.length}</strong>
        </div>
      </div>
      <div className="grid" style={{ gap: 12 }}>
        {items.map(item => {
          const barWidth = Math.round((item.monthly_revenue / maxMonthly) * 100);
          const roiPct = Math.round((item.monthly_revenue / item.cost) * 100);
          return (
            <div key={item.id} className="card">
              <div className="cr-roi-head">
                <div>
                  <strong style={{ color: "var(--navy)" }}>{item.equipment}</strong>
                  <span className="cr-meta">{item.jobs_last_30} jobs last 30 days &middot; {item.roi_months}-month payback</span>
                </div>
                <CrBadge status={item.status} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, margin: "10px 0 4px" }}>
                <span className="muted">Monthly revenue</span>
                <strong style={{ color: "var(--navy)" }}>${item.monthly_revenue.toLocaleString()} <span className="muted">({roiPct}% of cost/mo)</span></strong>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "var(--gray-100)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${barWidth}%`, borderRadius: 999, background: "linear-gradient(90deg, var(--gold), var(--navy-2))" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}>
                <span className="muted">Cost: ${item.cost.toLocaleString()}</span>
                <span className="muted">{item.notes}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Commands Tab ──────────────────────────────────────────────────────────────

function CommandsTab() {
  const [activeId, setActiveId] = useState("");
  const [form, setForm] = useState({});
  const [output, setOutput] = useState(null);
  const [copied, setCopied] = useState(false);

  const action = veeAiActions.find(a => a.id === activeId) || null;

  const openAction = next => {
    const initial = {};
    next.fields.forEach(field => { if (field.type === "select") initial[field.key] = field.options[0]; });
    setForm(initial);
    setOutput(null);
    setCopied(false);
    setActiveId(next.id);
  };

  const closeAction = () => { setActiveId(""); setOutput(null); setCopied(false); };
  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const runGenerate = () => { if (!action) return; setOutput(action.generate(form)); setCopied(false); };
  const handoffText = action && output ? veeAiBuildHandoff(action, form, output) : "";

  const copyHandoff = () => {
    if (!handoffText) return;
    const done = () => setCopied(true);
    const fallback = () => {
      const el = document.createElement("textarea");
      el.value = handoffText;
      document.body.appendChild(el);
      el.select();
      try { document.execCommand("copy"); done(); } catch (_) {}
      el.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(handoffText).then(done).catch(fallback);
    } else { fallback(); }
  };

  if (!action) {
    return (
      <div>
        <p className="muted" style={{ marginTop: 0, marginBottom: 16 }}>Phone-first command center for Driven By Dezign, V Solutions HR, government contracting, content, and career prep.</p>
        <div className="vee-ai-grid">
          {veeAiActions.map(item => (
            <button key={item.id} type="button" className="vee-ai-card" onClick={() => openAction(item)}>
              <span className="vee-ai-icon" aria-hidden="true">{item.icon}</span>
              <strong>{item.title}</strong>
              <span className="vee-ai-blurb">{item.blurb}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="vee-ai-header" style={{ marginBottom: 16 }}>
        <button type="button" className="btn secondary" onClick={closeAction}>{"←"} All commands</button>
        <span className="badge warn">Mock mode</span>
      </div>
      <div className="card">
        <div className="panel-head">
          <h3><span aria-hidden="true">{action.icon}</span> {action.title}</h3>
        </div>
        <p className="muted vee-ai-form-blurb">{action.blurb}</p>
        <div className="form">
          {action.fields.map(field => (
            <label key={field.key}>{field.label}
              {field.type === "select" ? (
                <select value={form[field.key] || field.options[0]} onChange={e => setField(field.key, e.target.value)}>
                  {field.options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : field.type === "textarea" ? (
                <textarea value={form[field.key] || ""} placeholder={field.placeholder || ""} onChange={e => setField(field.key, e.target.value)} />
              ) : (
                <input type={field.type === "date" ? "date" : "text"} value={form[field.key] || ""} placeholder={field.placeholder || ""} onChange={e => setField(field.key, e.target.value)} />
              )}
            </label>
          ))}
          <button type="button" className="btn gold vee-ai-generate" onClick={runGenerate}>{action.cta}</button>
        </div>
      </div>
      {output && (
        <div className="card generated-output" style={{ marginTop: 16 }}>
          <div className="panel-head">
            <h3>Generated draft</h3>
            <span className="badge success">Ready</span>
          </div>
          {output.map(block => (
            <div className="info-block" key={block.heading}>
              <h4>{block.heading}</h4>
              {block.list
                ? <ul>{block.list.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
                : <p className="vee-ai-multiline">{block.body}</p>
              }
            </div>
          ))}
        </div>
      )}
      {output && (
        <div className="card vee-ai-handoff" style={{ marginTop: 16 }}>
          <div className="panel-head">
            <h3>Send to Approval Queue / Claude Code / Higgsfield</h3>
            <button type="button" className="btn secondary" onClick={copyHandoff}>{copied ? "Copied!" : "Copy"}</button>
          </div>
          <p className="muted">Copy this into Claude Code or Higgsfield when ready. Submit to the Approval Queue before any external action.</p>
          <textarea className="vee-ai-handoff-text" readOnly value={handoffText} aria-label="Handoff text" />
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function VeeAIPage() {
  const [tab, setTab] = useState("queue");
  const { cr, updateStatus, updateField, addItem, resetToSeed } = useCrState();

  const pendingL2 = cr.approvalQueue.filter(i => i.status === "pending" && (i.permission_level ?? 2) >= 2).length;
  const urgentQuotes = cr.quoteTracker.filter(q => crNextAction(q).urgency === "high").length;

  const tabs = [
    { key: "queue", label: pendingL2 > 0 ? `Approval Queue (${pendingL2})` : "Approval Queue" },
    { key: "commands", label: "Commands" },
    { key: "log", label: "Agent Log" },
    { key: "pipeline", label: "Product Pipeline" },
    { key: "quotes", label: urgentQuotes > 0 ? `Quote Tracker (${urgentQuotes})` : "Quote Tracker" },
    { key: "roi", label: "Equipment ROI" },
  ];

  return (
    <div className="agent-cr-root">
      <div className="page-title">
        <div>
          <h2>Agent 4 — Control Room</h2>
          <p>Supervised autonomous manager. Thinks and prepares independently. Acts only with your permission.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {urgentQuotes > 0 && <span className="badge danger">{urgentQuotes} urgent</span>}
          {pendingL2 > 0 && <span className="badge warn">{pendingL2} need approval</span>}
          <span className="badge warn">Mock mode</span>
        </div>
      </div>

      <ManagerAgentSummary cr={cr} onTabSwitch={setTab} />

      <div className="cr-tabs">
        {tabs.map(t => (
          <button key={t.key} type="button" className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "commands"  && <CommandsTab />}
      {tab === "queue"     && <ApprovalQueueTab items={cr.approvalQueue} updateStatus={updateStatus} updateField={updateField} />}
      {tab === "log"       && <AgentLogTab items={cr.agentLog} />}
      {tab === "pipeline"  && <ProductPipelineTab items={cr.productPipeline} updateStatus={updateStatus} />}
      {tab === "quotes"    && <QuoteTrackerTab items={cr.quoteTracker} updateStatus={updateStatus} addItem={addItem} />}
      {tab === "roi"       && <EquipmentROITab items={cr.equipmentROI} />}

      <div className="card" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className="muted" style={{ fontSize: 13 }}>Changes save to localStorage. Supabase sync available when credentials are configured in Settings.</span>
          <button type="button" className="btn secondary" style={{ fontSize: 12, padding: "7px 10px" }} onClick={resetToSeed}>Reset mock data</button>
        </div>
      </div>
    </div>
  );
}
