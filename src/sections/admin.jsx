// Split from src/app.jsx for lazy Admin section loading. Do not load directly; index.html compiles this file on demand.
function AdminPage({ page, realMode }) {
  const items = {
    Users: [
      { title: "Current user access", detail: realMode ? "Managed through Supabase Auth." : "Local workspace has no user management until Supabase sign-in is enabled.", status: realMode ? "Secured" : "Local" }
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

function Settings({ data, config, saveSettings, exportBackup, realMode }) {
  const [form, setForm] = useState({ ...defaultSettings, ...data.settings, ...config });
  return <><Title title="Settings" subtitle={realMode ? "Business profile is saved to Supabase profiles." : "Configure Supabase URL/key here, or keep using demo mode."} /><div className="card form form-grid">
    {Object.keys(defaultSettings).map(k => <label key={k}>{label(k)}<input value={form[k] || ""} onChange={e => setForm({ ...form, [k]: e.target.value })} /></label>)}
    <button className="btn" onClick={() => saveSettings(form)}>Save settings</button>
    <button className="btn secondary" onClick={exportBackup}>Export JSON backup</button>
  </div></>;
}
