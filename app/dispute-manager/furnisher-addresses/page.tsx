"use client";

import { useEffect, useState } from "react";
import CDMLayout from "@/components/CDMLayout";

type Creditor = {
  id: number | string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

const SAMPLE: Creditor[] = [
  { id: 1, name: "Equifax Information Services", address: "PO Box 740256", city: "Atlanta", state: "GA", zip: "30374" },
  { id: 2, name: "Experian", address: "PO Box 4500", city: "Allen", state: "TX", zip: "75013" },
  { id: 3, name: "TransUnion LLC", address: "PO Box 2000", city: "Chester", state: "PA", zip: "19016" },
  { id: 4, name: "Capital One Financial", address: "PO Box 30285", city: "Salt Lake City", state: "UT", zip: "84130" },
  { id: 5, name: "Midland Credit Management", address: "350 Camino De La Reina Ste 100", city: "San Diego", state: "CA", zip: "92108" },
  { id: 6, name: "Portfolio Recovery Associates", address: "120 Corporate Blvd", city: "Norfolk", state: "VA", zip: "23502" },
  { id: 7, name: "Synchrony Bank", address: "PO Box 965004", city: "Orlando", state: "FL", zip: "32896" },
  { id: 8, name: "Comenity Bank", address: "PO Box 182789", city: "Columbus", state: "OH", zip: "43218" },
  { id: 9, name: "LVNV Funding LLC", address: "PO Box 10497", city: "Greenville", state: "SC", zip: "29603" },
  { id: 10, name: "Navient Solutions", address: "PO Box 9640", city: "Wilkes-Barre", state: "PA", zip: "18773" },
];

const LOCAL_KEY = "disputepilot.furnisher-addresses";

export default function Page() {
  const [rows, setRows] = useState<Creditor[]>(SAMPLE);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Creditor | null>(null);
  const [editing, setEditing] = useState<Creditor | null>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", address: "", city: "", state: "", zip: "" });
  const formIds = {
    name: "furnisher-name",
    address: "furnisher-address",
    city: "furnisher-city",
    state: "furnisher-state",
    zip: "furnisher-zip",
  } as const;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCAL_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length) setRows(parsed);
    } catch {
      // ignore local storage errors
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
    } catch {
      // ignore local storage errors
    }
  }, [rows]);

  const filtered = rows.filter((row) => {
    const q = search.toLowerCase();
    return !q || row.name.toLowerCase().includes(q) || row.city.toLowerCase().includes(q);
  });

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 7,
    fontSize: 14,
    boxSizing: "border-box",
  };

  function openCreate() {
    setEditing(null);
    setForm({ name: "", address: "", city: "", state: "", zip: "" });
    setShowForm(true);
  }

  function closeCreate() {
    setShowForm(false);
    setMessage("");
  }

  function saveCreate() {
    if (!form.name.trim()) return;
    const creditor: Creditor = { id: Date.now(), ...form };
    setRows((prev) => [creditor, ...prev]);
    setMessage(`Saved creditor: ${form.name}`);
    setShowForm(false);
    setForm({ name: "", address: "", city: "", state: "", zip: "" });
  }

  function openEdit(row: Creditor) {
    setEditing(row);
    setForm({ name: row.name, address: row.address, city: row.city, state: row.state, zip: row.zip });
    setShowEdit(true);
  }

  function closeEdit() {
    setShowEdit(false);
    setEditing(null);
  }

  function saveEdit() {
    if (!editing) return;
    setRows((prev) => prev.map((row) => (row.id === editing.id ? { ...editing, ...form } : row)));
    setMessage(`Updated creditor: ${form.name}`);
    closeEdit();
  }

  function removeCreditor(row: Creditor) {
    setRows((prev) => prev.filter((item) => item.id !== row.id));
    setDeleteTarget(null);
    setMessage(`Deleted creditor: ${row.name}`);
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", color: "#1e293b" }}>Furnisher Addresses</h1>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Creditor and bureau mailing addresses for dispute letters.</p>
          </div>
          <button
            onClick={openCreate}
            style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
          >
            + Add New Creditor
          </button>
        </div>

        {message && (
          <div role="status" aria-live="polite" style={{ background: "#ecfdf5", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, fontWeight: 600 }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or city…"
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                {["Name", "Address", "City", "State", "Zip", "Action"].map((heading) => (
                  <th key={heading} style={{ textAlign: "left", padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 36, textAlign: "center", color: "#94a3b8" }}>
                    No results found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "11px 16px", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{row.name}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13, color: "#475569" }}>{row.address}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13, color: "#475569" }}>{row.city}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13, color: "#475569" }}>{row.state}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13, color: "#475569" }}>{row.zip}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => openEdit(row)}
                          style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(row)}
                          style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #fca5a5", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#ef4444", fontWeight: 600 }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 10 }}>
          {filtered.length} of {rows.length} creditors
        </p>

        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 500 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>Add New Creditor</h2>
              <div style={{ marginBottom: 14 }}>
                <label htmlFor={formIds.name} style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Company Name</label>
                <input id={formIds.name} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inp} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label htmlFor={formIds.address} style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Address</label>
                <input id={formIds.address} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} style={inp} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px", gap: 12, marginBottom: 22 }}>
                <div>
                  <label htmlFor={formIds.city} style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>City</label>
                  <input id={formIds.city} value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label htmlFor={formIds.state} style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>State</label>
                  <input id={formIds.state} value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} maxLength={2} style={inp} />
                </div>
                <div>
                  <label htmlFor={formIds.zip} style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Zip</label>
                  <input id={formIds.zip} value={form.zip} onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))} maxLength={10} style={inp} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={closeCreate} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={saveCreate} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>
                  Add Creditor
                </button>
              </div>
            </div>
          </div>
        )}

        {showEdit && editing && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 500 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>Edit Creditor</h2>
              <div style={{ marginBottom: 14 }}>
                <label htmlFor={formIds.name} style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Company Name</label>
                <input id={formIds.name} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inp} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label htmlFor={formIds.address} style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Address</label>
                <input id={formIds.address} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} style={inp} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px", gap: 12, marginBottom: 22 }}>
                <div>
                  <label htmlFor={formIds.city} style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>City</label>
                  <input id={formIds.city} value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label htmlFor={formIds.state} style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>State</label>
                  <input id={formIds.state} value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} maxLength={2} style={inp} />
                </div>
                <div>
                  <label htmlFor={formIds.zip} style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Zip</label>
                  <input id={formIds.zip} value={form.zip} onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))} maxLength={10} style={inp} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={closeEdit} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={saveEdit} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 360 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700 }}>Delete Creditor?</h2>
              <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>This action removes the creditor from the current session.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setDeleteTarget(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={() => removeCreditor(deleteTarget)} style={{ padding: "9px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
