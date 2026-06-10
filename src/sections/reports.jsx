// Split from src/app.jsx for lazy Reports section loading. Do not load directly; index.html compiles this file on demand.
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
