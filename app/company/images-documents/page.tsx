"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const TABS = ["All Files", "Images", "Documents"];
type FileItem = { id: number; name: string; type: "image" | "document"; ext: string; size: string; uploaded: string; category: string };

const SAMPLE: FileItem[] = [
  { id: 1, name: "company-logo.png", type: "image", ext: "PNG", size: "84 KB", uploaded: "2025-01-15", category: "Branding" },
  { id: 2, name: "banner-header.jpg", type: "image", ext: "JPG", size: "220 KB", uploaded: "2025-01-15", category: "Branding" },
  { id: 3, name: "service-agreement.pdf", type: "document", ext: "PDF", size: "142 KB", uploaded: "2025-02-01", category: "Contracts" },
  { id: 4, name: "croa-disclosure.pdf", type: "document", ext: "PDF", size: "96 KB", uploaded: "2025-02-01", category: "Contracts" },
  { id: 5, name: "equifax-letter-template.docx", type: "document", ext: "DOCX", size: "38 KB", uploaded: "2025-02-10", category: "Templates" },
  { id: 6, name: "client-id-sample.jpg", type: "image", ext: "JPG", size: "310 KB", uploaded: "2025-03-01", category: "Client Docs" },
  { id: 7, name: "transunion-response.pdf", type: "document", ext: "PDF", size: "204 KB", uploaded: "2025-03-14", category: "Bureau Responses" },
  { id: 8, name: "onboarding-checklist.pdf", type: "document", ext: "PDF", size: "58 KB", uploaded: "2025-03-20", category: "Templates" },
];

const EXT_C: Record<string, string> = { PDF: "#ef4444", DOCX: "#3b82f6", JPG: "#f59e0b", PNG: "#10b981" };

export default function Page() {
  const [tab, setTab] = useState("All Files");
  const [files, setFiles] = useState<FileItem[]>(SAMPLE);
  const [dragOver, setDragOver] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const visible = files.filter(f => {
    const matchTab = tab === "All Files" || (tab === "Images" && f.type === "image") || (tab === "Documents" && f.type === "document");
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.category.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  function fakeUpload() {
    const names = ["credit-report-scan.pdf", "dispute-response.pdf", "logo-v2.png", "contract-signed.pdf"];
    const n = names[Math.floor(Math.random() * names.length)];
    const isImg = n.endsWith(".png") || n.endsWith(".jpg");
    setFiles(prev => [{ id: Date.now(), name: n, type: isImg ? "image" : "document", ext: n.split(".").pop()!.toUpperCase(), size: Math.floor(Math.random() * 400 + 50) + " KB", uploaded: new Date().toISOString().slice(0, 10), category: isImg ? "Branding" : "Documents" }, ...prev]);
  }

  const inp: React.CSSProperties = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1000 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Images &amp; Documents</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>{files.length} files stored</p>
          </div>
          <button onClick={fakeUpload} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ Upload File</button>
        </div>

        <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
          {[{ label: "Total Files", val: files.length, color: "#1e3a5f" }, { label: "Images", val: files.filter(f => f.type === "image").length, color: "#f59e0b" }, { label: "Documents", val: files.filter(f => f.type === "document").length, color: "#3b82f6" }].map(s => (
            <div key={s.label} style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderLeft: `4px solid ${s.color}` }}>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" as const }}>{s.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); fakeUpload(); }}
          onClick={fakeUpload}
          style={{ border: `2px dashed ${dragOver ? "#3b82f6" : "#e2e8f0"}`, borderRadius: 10, padding: "24px 20px", textAlign: "center" as const, background: dragOver ? "#eff6ff" : "#f8fafc", marginBottom: 22, cursor: "pointer", transition: "all 0.15s" }}
        >
          <div style={{ fontSize: 28, marginBottom: 6 }}>📂</div>
          <p style={{ margin: 0, fontWeight: 600, color: dragOver ? "#3b82f6" : "#475569", fontSize: 14 }}>{dragOver ? "Drop to upload" : "Drag & drop files here, or click to browse"}</p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>PDF, DOCX, JPG, PNG — max 10MB per file</p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 2, borderBottom: "2px solid #f1f5f9" }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 18px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e293b" : "#64748b", fontSize: 14, borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2 }}>{t}</button>
            ))}
          </div>
          <input style={{ ...inp, width: 220 }} placeholder="Search files…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}><tr>
              {["File Name", "Category", "Size", "Uploaded", "Actions"].map(h => (
                <th key={h} style={{ textAlign: "left" as const, padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {visible.length === 0
                ? <tr><td colSpan={5} style={{ padding: 40, textAlign: "center" as const, color: "#94a3b8" }}>No files found.</td></tr>
                : visible.map(f => (
                  <tr key={f.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, background: (EXT_C[f.ext] || "#94a3b8") + "20", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: EXT_C[f.ext] || "#64748b" }}>{f.ext}</div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{f.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}><span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{f.category}</span></td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{f.size}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{new Date(f.uploaded).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={{ fontSize: 12, padding: "4px 12px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600 }}>Download</button>
                        <button onClick={() => setDeleteId(f.id)} style={{ fontSize: 12, padding: "4px 12px", border: "1px solid #fee2e2", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#ef4444", fontWeight: 600 }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {deleteId !== null && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 340 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700 }}>Delete File?</h2>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>This cannot be undone.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setDeleteId(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => { setFiles(f => f.filter(x => x.id !== deleteId)); setDeleteId(null); }} style={{ padding: "9px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
