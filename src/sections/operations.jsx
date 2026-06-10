// Split from src/app.jsx for lazy section loading. Do not load directly; index.html compiles this file on demand.
function OperationsCenter({ page, runAutomations }) {
  const items = {
    Automations: operationsMock.automations,
    "n8n Workflows": [
      { title: "Daily opportunity discovery", detail: "Ready to schedule after source credentials and deployment environment variables are confirmed.", status: "Setup" },
      { title: "Revenue activity import", detail: "Connect payment or storefront sources before showing sales records here.", status: "Not connected" },
      { title: "Client intake workflow", detail: "Connect a real intake form or CRM source before creating client tasks.", status: "Not connected" }
    ],
    "Workflow Health": [
      { title: "Local automation tools", detail: "Manual app actions and validation scripts are available.", status: "Ready" },
      { title: "External scheduled workflows", detail: "Waiting for scheduler, webhook endpoints, and credentials.", status: "Not connected" }
    ],
    Logs: [
      { title: "Activity log", detail: "Real app creates, updates, deletes, uploads, and automations appear when records exist.", status: "Ready" },
      { title: "Integration logs", detail: "n8n or connector execution logs will appear after a live integration is connected.", status: "Not connected" }
    ],
    Tasks: operationsMock.highestValueActions,
    "Calendar/Deadlines": operationsMock.deadlines.map(item => ({ title: item.title, detail: item.date, status: item.type }))
  };
  return <MockWorkspace title={page} subtitle="Operations command center for workflows, tasks, logs, and deadlines." items={items[page] || []} action={page === "Automations" ? <button className="btn" onClick={runAutomations}>Run local automations</button> : null} />;
}

