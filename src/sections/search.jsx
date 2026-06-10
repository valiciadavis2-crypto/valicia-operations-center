// Split from src/app.jsx for lazy Search section loading. Do not load directly; index.html compiles this file on demand.
function Search({ data, query, setPage }) {
  const tables = ["clients", "contacts", "engagements", "cases", "investigations", "invoices", "documents"];
  const results = tables.flatMap(t => (data[t] || []).filter(r => JSON.stringify(r).toLowerCase().includes(query.toLowerCase())).map(r => ({ table: t, row: r })));
  return <><Title title="Search Results" subtitle={`${results.length} result(s) for "${query}".`} /><div className="card activity">{results.map(({ table, row }) => <div key={`${table}-${row.id}`}><strong>{table}: {row.company_name || row.name || row.case_number || row.investigation_number || row.invoice_number || row.title || row.service_category}</strong><span className="muted">{clientName(data, row.client_id)} </span><button className="btn secondary" onClick={() => setPage(table[0].toUpperCase() + table.slice(1))}>Open module</button></div>)}</div></>;
}
