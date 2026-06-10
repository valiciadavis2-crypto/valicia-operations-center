// Split from src/app.jsx for lazy Home section loading. Do not load directly; index.html compiles this file on demand.
function HomeDashboard({ data, metrics, governmentData, fundingData, realMode, runAutomations, setPage }) {
  const govStats = getGovernmentStats(governmentData);
  const fundingStats = getFundingStats(fundingData);
  const universalOpportunities = getUniversalOpportunities(data, governmentData, fundingData);
  const universalStats = getUniversalOpportunityStats(universalOpportunities);
  return (
    <>
      <Title
        title="Good morning, Valicia."
        subtitle={realMode ? "What should you focus on today? Supabase is connected and your command center is secured." : "What should you focus on today? Local workspace is ready for real records."}
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
