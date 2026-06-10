// Split from src/app.jsx for lazy section loading. Do not load directly; index.html compiles this file on demand.
function Module({ page, data, setModal, patchRecord, deleteRecord, addRecord, createInvoiceFromEngagements }) {
  const table = page.toLowerCase();
  const rows = data[table] || [];
  const [filter, setFilter] = useState("");
  const searchableRows = useMemo(() => rows.map(row => ({ row, search: Object.values(row).join(" ").toLowerCase() })), [rows]);
  const visible = useMemo(() => {
    const query = filter.toLowerCase();
    return searchableRows.filter(item => item.search.includes(query)).map(item => item.row);
  }, [searchableRows, filter]);
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
  const searchableDocuments = useMemo(() => data.documents.map(row => ({ row, search: Object.values(row).join(" ").toLowerCase() })), [data.documents]);
  const visible = useMemo(() => {
    const query = filter.toLowerCase();
    return searchableDocuments.filter(item => item.search.includes(query)).map(item => item.row);
  }, [searchableDocuments, filter]);
  return (
    <>
      <Title title="Documents" subtitle={realMode ? "Upload files to private Supabase Storage." : "Local upload records are saved in this browser without file contents."} action={<button className="btn" onClick={() => setUploadOpen(true)}>Upload document</button>} />
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
  return <><Title title="AI HR Document Generator" subtitle={realMode ? "Drafts save to Supabase ai_documents under the signed-in owner." : "Drafts save locally in this browser."} />
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

const outreachStatuses = ["Draft", "Ready", "Sent", "Called", "Responded", "Interested", "Quote Requested", "Quote Received", "Declined", "Follow Up Needed", "Partner Selected"];

