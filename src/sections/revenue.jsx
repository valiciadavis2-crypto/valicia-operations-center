// Split from src/app.jsx for lazy section loading. Do not load directly; index.html compiles this file on demand.
function RevenueCenter({ metrics, fundingData, governmentData, data, productPipeline = [], setPage }) {
  const [active, setActive] = useState("All");
  const fundingStats = useMemo(() => getFundingStats(fundingData), [fundingData]);
  const govStats = useMemo(() => getGovernmentStats(governmentData), [governmentData]);
  const universalStats = useMemo(() => {
    const universalOpportunities = getUniversalOpportunities(data, governmentData, fundingData, productPipeline);
    return getUniversalOpportunityStats(universalOpportunities);
  }, [data, governmentData, fundingData, productPipeline]);
  const revenueChannelsWithGovernment = useMemo(() => [
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
  ].filter(channel => channel.month || channel.pending || channel.pipeline || channel.name === "HR Consulting" || channel.name === "Government Pipeline"), [data, metrics, govStats, fundingStats, productPipeline]);
  const selected = useMemo(() => active === "All" ? revenueChannelsWithGovernment : revenueChannelsWithGovernment.filter(channel => channel.name === active), [active, revenueChannelsWithGovernment]);
  const totals = useMemo(() => revenueChannelsWithGovernment.reduce((acc, channel) => ({
    today: acc.today + channel.today,
    month: acc.month + channel.month,
    pending: acc.pending + channel.pending,
    pipeline: acc.pipeline + channel.pipeline
  }), { today: 0, month: 0, pending: 0, pipeline: 0 }), [revenueChannelsWithGovernment]);
  const paidInvoices = useMemo(() => data.invoices.filter(item => item.status === "Paid"), [data.invoices]);

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
          {paidInvoices.slice(0, 6).map(item => <div key={item.id}><strong>{item.invoice_number}: {amount(item.total)}</strong><span className="muted">{clientName(data, item.client_id)} - {item.payment_date || item.invoice_date || "No date"}</span></div>)}
          {!paidInvoices.length && <p className="muted">No paid invoice records yet. Add a real invoice and mark it paid to see revenue activity.</p>}
        </div>
      </div>
    </>
  );
}

function MakeableProductTrendFinder({ productPipeline = [], setProductPipeline }) {
  const [filters, setFilters] = useState({ equipment: "All", recommendation: "All", category: "All", source: "All", profit: "All", time: "All" });
  const [selectedOutput, setSelectedOutput] = useState(null);
  const scannedTrends = useMemo(getNormalizedProductTrends, []);
  const evaluatedTrends = useMemo(() => scannedTrends.map(evaluateProductTrend).sort((a, b) => b.score - a.score), [scannedTrends]);
  const accepted = useMemo(() => evaluatedTrends.filter(item => item.canMake && item.recommendation !== "REJECT"), [evaluatedTrends]);
  const rejected = useMemo(() => evaluatedTrends.filter(item => !item.canMake || item.recommendation === "REJECT"), [evaluatedTrends]);
  const visible = useMemo(() => accepted.filter(item => matchesProductTrendFilters(item, filters)), [accepted, filters]);
  const dashboard = useMemo(() => getProductTrendDashboard(evaluatedTrends, accepted, rejected), [evaluatedTrends, accepted, rejected]);
  const sourceCounts = useMemo(() => group(evaluatedTrends, "source"), [evaluatedTrends]);
  const filterOptions = useMemo(() => getProductTrendFilterOptions(evaluatedTrends), [evaluatedTrends]);

  const updateFilter = (key, value) => setFilters({ ...filters, [key]: value });
  const savePipeline = next => {
    setProductPipeline(next);
    localStorage.setItem(productPipelineKey, JSON.stringify(next));
  };
  const addToPipeline = trend => {
    const exists = productPipeline.some(item => item.sourceTrendId === trend.id);
    if (exists) return;
    // TODO: Persist product pipeline records to Supabase or Airtable once the production data store is selected.
    savePipeline([...productPipeline, {
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
  const updatePipelineStatus = (id, status) => savePipeline(productPipeline.map(item => item.id === id ? { ...item, status } : item));
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
          <div className="panel-head"><h3>Local Product Pipeline</h3><span className="badge">{productPipeline.length} saved</span></div>
          <div className="table-wrap compact-table">
            <table>
              <thead><tr><th>Product</th><th>Profit</th><th>Score</th><th>Status</th></tr></thead>
              <tbody>
                {productPipeline.map(item => <tr key={item.id}>
                  <td><strong>{item.productName}</strong><span className="table-subline">{item.equipment.join(", ")}</span></td>
                  <td>{amount(item.estimatedProfit)}</td>
                  <td>{item.score}</td>
                  <td><select value={item.status} onChange={e => updatePipelineStatus(item.id, e.target.value)}>{pipelineStatuses.map(status => <option key={status}>{status}</option>)}</select></td>
                </tr>)}
                {!productPipeline.length && <tr><td colSpan="4" className="muted">Saved product ideas will appear here after you add an AI-generated suggestion to the local product pipeline.</td></tr>}
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
          {visible.map(trend => <ProductOpportunityCard key={trend.id} trend={trend} inPipeline={productPipeline.some(item => item.sourceTrendId === trend.id)} addToPipeline={addToPipeline} openOutput={openOutput} />)}
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
  const digital = productPipeline.map(item => ({
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

