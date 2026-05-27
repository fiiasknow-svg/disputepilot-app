"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const FILE_TABS = ["All Files", "Images", "Documents"];
const CATEGORIES = ["All Categories", "Branding", "Contracts", "Templates", "Client Docs", "Bureau Responses"];
type FileItem = { id: number; name: string; type: "image" | "document"; ext: string; size: string; sizeKB: number; uploaded: string; category: string; objectUrl?: string };
const FILES_STORAGE_KEY = "dp_images_documents_files";

const SAMPLE: FileItem[] = [
  { id: 1, name: "company-logo.png",           type: "image",    ext: "PNG",  size: "84 KB",  sizeKB: 84,  uploaded: "2025-01-15", category: "Branding" },
  { id: 2, name: "banner-header.jpg",           type: "image",    ext: "JPG",  size: "220 KB", sizeKB: 220, uploaded: "2025-01-15", category: "Branding" },
  { id: 3, name: "service-agreement.pdf",       type: "document", ext: "PDF",  size: "142 KB", sizeKB: 142, uploaded: "2025-02-01", category: "Contracts" },
  { id: 4, name: "croa-disclosure.pdf",         type: "document", ext: "PDF",  size: "96 KB",  sizeKB: 96,  uploaded: "2025-02-01", category: "Contracts" },
  { id: 5, name: "equifax-letter-template.docx",type: "document", ext: "DOCX", size: "38 KB",  sizeKB: 38,  uploaded: "2025-02-10", category: "Templates" },
  { id: 6, name: "client-id-sample.jpg",        type: "image",    ext: "JPG",  size: "310 KB", sizeKB: 310, uploaded: "2025-03-01", category: "Client Docs" },
  { id: 7, name: "transunion-response.pdf",     type: "document", ext: "PDF",  size: "204 KB", sizeKB: 204, uploaded: "2025-03-14", category: "Bureau Responses" },
  { id: 8, name: "onboarding-checklist.pdf",    type: "document", ext: "PDF",  size: "58 KB",  sizeKB: 58,  uploaded: "2025-03-20", category: "Templates" },
  { id: 9, name: "credit-score-chart.png",      type: "image",    ext: "PNG",  size: "145 KB", sizeKB: 145, uploaded: "2025-04-01", category: "Branding" },
];

const EXT_COLOR: Record<string, string> = { PDF: "#ef4444", DOCX: "#3b82f6", DOC: "#3b82f6", JPG: "#f59e0b", PNG: "#10b981", XLSX: "#22c55e", CSV: "#22c55e" };

const EXT_ICON: Record<string, string> = {
  PDF: "📄", DOCX: "📝", DOC: "📝", JPG: "🖼", PNG: "🖼", XLSX: "📊", CSV: "📊",
};

function fmtKB(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export default function Page() {
  const [fileTab, setFileTab] = useState("All Files");
  const [files, setFiles] = useState<FileItem[]>(SAMPLE);
  const [dragOver, setDragOver] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [renameId, setRenameId] = useState<number | null>(null);
  const [renameName, setRenameName] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loadedLocalState, setLoadedLocalState] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const filesRef = useRef<FileItem[]>([]);

  useEffect(() => {
    try {
      const savedFiles = window.localStorage.getItem(FILES_STORAGE_KEY);
      if (savedFiles) setFiles(JSON.parse(savedFiles));
    } catch {
      setMessage("Could not load locally saved file metadata.");
    }
    setLoadedLocalState(true);
  }, []);

  useEffect(() => {
    if (!loadedLocalState) return;
    const metadataOnly = files.map(({ objectUrl, ...file }) => file);
    window.localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(metadataOnly));
  }, [files, loadedLocalState]);

  useEffect(() => { filesRef.current = files; }, [files]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach(file => {
        if (file.objectUrl) URL.revokeObjectURL(file.objectUrl);
      });
    };
  }, []);

  const visible = useMemo(() => files.filter(f => {
    const matchTab = fileTab === "All Files" || (fileTab === "Images" && f.type === "image") || (fileTab === "Documents" && f.type === "document");
    const matchCat = category === "All Categories" || f.category === category;
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.category.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchCat && matchSearch;
  }), [files, fileTab, category, search]);

  const totalKB = files.reduce((s, f) => s + f.sizeKB, 0);
  const imgCount = files.filter(f => f.type === "image").length;
  const docCount = files.filter(f => f.type === "document").length;

  function uploadFiles(fileList: FileList | File[]) {
    const selected = Array.from(fileList);
    if (!selected.length) return;
    const uploaded = selected.map((file, index) => {
      const ext = (file.name.split(".").pop() || "FILE").toUpperCase();
      const isImg = file.type.startsWith("image/") || ["JPG", "JPEG", "PNG", "GIF", "WEBP"].includes(ext);
      const kb = Math.max(1, Math.round(file.size / 1024));
      return { id: Date.now() + index, name: file.name, type: isImg ? "image" as const : "document" as const, ext, size: fmtKB(kb), sizeKB: kb, uploaded: new Date().toISOString().slice(0, 10), category: isImg ? "Branding" : "Client Docs", objectUrl: URL.createObjectURL(file) };
    });
    setFiles(prev => [...uploaded, ...prev]);
    setMessage(`${uploaded.map(file => file.name).join(", ")} uploaded to Images & Documents. Current-session download works; metadata was saved locally because backend storage is not connected.`);
  }

  function downloadFile(file: FileItem) {
    if (!file.objectUrl) {
      setMessage(`${file.name} is stored locally as metadata; file download requires re-upload because backend storage is not connected.`);
      return;
    }
    const link = document.createElement("a");
    link.href = file.objectUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setMessage(`${file.name} download started.`);
  }

  function doRename() {
    if (!renameName.trim() || !renameId) return;
    setFiles(fs => fs.map(f => f.id === renameId ? { ...f, name: renameName.trim() } : f));
    setMessage(`File renamed to ${renameName.trim()}.`);
    setRenameId(null);
    setRenameName("");
  }

  async function copyLink(id: number) {
    try {
      await navigator.clipboard.writeText(`https://app.disputepilot.com/files/${id}`);
    } catch {
      // Clipboard may be blocked in some environments; still continue with visible feedback.
    }
    setCopiedId(id);
    setMessage("Share link copied.");
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1060 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Images &amp; Documents</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>{files.length} files · {fmtKB(totalKB)} used</p>
          </div>
          <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={e => uploadFiles(e.target.files || [])} />
          <button onClick={() => inputRef.current?.click()} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            + Upload File
          </button>
        </div>

        {message && (
          <div role="status" aria-live="polite" style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", marginBottom: 14, color: "#15803d", fontSize: 14, fontWeight: 600 }}>
            {message}
          </div>
        )}

        <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 16px", marginBottom: 14, color: "#92400e", fontSize: 13, fontWeight: 600 }}>
          Stored locally as metadata; file download requires re-upload because backend storage is not connected.
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 14, marginBottom: 20, marginTop: 10 }}>
          {[
            { label: "Total Files",  val: files.length, color: "#1e3a5f", bg: "#eff6ff" },
            { label: "Images",       val: imgCount,     color: "#f59e0b", bg: "#fef9c3" },
            { label: "Documents",    val: docCount,     color: "#3b82f6", bg: "#dbeafe" },
            { label: "Storage Used", val: fmtKB(totalKB), color: "#8b5cf6", bg: "#f5f3ff" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 10, padding: "12px 16px" }}>
              <p style={{ margin: 0, fontSize: 11, color: s.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: typeof s.val === "number" ? 26 : 18, fontWeight: 800, color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          style={{ border: `2px dashed ${dragOver ? "#3b82f6" : "#e2e8f0"}`, borderRadius: 10, padding: "22px 20px", textAlign: "center", background: dragOver ? "#eff6ff" : "#f8fafc", marginBottom: 22, cursor: "pointer", transition: "all 0.15s" }}>
          <div style={{ fontSize: 26, marginBottom: 6 }}>📂</div>
          <p style={{ margin: 0, fontWeight: 600, color: dragOver ? "#3b82f6" : "#475569", fontSize: 14 }}>{dragOver ? "Drop to upload" : "Drag & drop files here, or click to browse"}</p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>PDF, DOCX, JPG, PNG — max 10MB per file</p>
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
          <div style={{ display: "flex", gap: 2, borderBottom: "2px solid #f1f5f9" }}>
            {FILE_TABS.map(t => (
              <button key={t} onClick={() => setFileTab(t)} style={{ padding: "9px 18px", background: "none", border: "none", cursor: "pointer", fontWeight: fileTab === t ? 700 : 500, color: fileTab === t ? "#1e3a5f" : "#64748b", fontSize: 14, borderBottom: fileTab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2 }}>{t}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input style={{ padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, width: 200, outline: "none" }} placeholder="Search files…" value={search} onChange={e => setSearch(e.target.value)} />
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, background: "#fff", cursor: "pointer", color: "#374151" }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            {/* View toggle */}
            <div style={{ display: "flex", border: "1px solid #e2e8f0", borderRadius: 7, overflow: "hidden" }}>
              {(["list", "grid"] as const).map(m => (
                <button key={m} onClick={() => setViewMode(m)}
                  style={{ padding: "7px 12px", background: viewMode === m ? "#1e3a5f" : "#fff", color: viewMode === m ? "#fff" : "#64748b", border: "none", cursor: "pointer", fontSize: 14, fontWeight: viewMode === m ? 700 : 400 }}>
                  {m === "list" ? "☰" : "⊞"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* File count */}
        <div style={{ fontSize: 13, color: "#64748b", margin: "10px 0 12px" }}>{visible.length} file{visible.length !== 1 ? "s" : ""}</div>

        {/* List view */}
        {viewMode === "list" && (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden", border: "1px solid #f1f5f9" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  {["File Name", "Category", "Size", "Uploaded", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.length === 0
                  ? <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No files found.</td></tr>
                  : visible.map(f => (
                    <tr key={f.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, background: (EXT_COLOR[f.ext] || "#94a3b8") + "18", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                            {EXT_ICON[f.ext] || "📁"}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{f.name}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{f.ext}{!f.objectUrl ? " - Download unavailable until re-uploaded" : ""}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{f.category}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{f.size}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>{new Date(f.uploaded).toLocaleDateString()}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => downloadFile(f)} style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600, color: "#1e3a5f" }}>Download</button>
                          <button onClick={() => { setRenameId(f.id); setRenameName(f.name); }}
                            style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600, color: "#374151" }}>Rename</button>
                          <button onClick={() => copyLink(f.id)}
                            style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: copiedId === f.id ? "#dcfce7" : "#fff", fontWeight: 600, color: copiedId === f.id ? "#166534" : "#64748b" }}>
                            {copiedId === f.id ? "✓ Copied" : "Share"}
                          </button>
                          <button onClick={() => setDeleteId(f.id)}
                            style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #fee2e2", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#ef4444", fontWeight: 600 }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid view */}
        {viewMode === "grid" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
            {visible.length === 0 && (
              <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#94a3b8", padding: 40 }}>No files found.</p>
            )}
            {visible.map(f => (
              <div key={f.id} style={{ background: "#fff", borderRadius: 10, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                <div style={{ background: (EXT_COLOR[f.ext] || "#94a3b8") + "15", height: 90, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
                  {EXT_ICON[f.ext] || "📁"}
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.name}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{f.size} · {f.ext}</div>
                  <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
                    <button onClick={() => downloadFile(f)} style={{ flex: 1, fontSize: 11, padding: "4px 0", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600, color: "#1e3a5f" }}>↓</button>
                    <button onClick={() => copyLink(f.id)} style={{ flex: 1, fontSize: 11, padding: "4px 0", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: copiedId === f.id ? "#dcfce7" : "#fff", fontWeight: 600, color: copiedId === f.id ? "#166534" : "#64748b" }}>
                      {copiedId === f.id ? "✓" : "⬡"}
                    </button>
                    <button onClick={() => setDeleteId(f.id)} style={{ flex: 1, fontSize: 11, padding: "4px 0", border: "1px solid #fee2e2", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#ef4444", fontWeight: 600 }}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rename modal */}
        {renameId !== null && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 380 }}>
              <h2 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: "#1e293b" }}>Rename File</h2>
              <input style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box", outline: "none", marginBottom: 20 }}
                value={renameName} onChange={e => setRenameName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doRename()} autoFocus />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setRenameId(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151" }}>Cancel</button>
                <button onClick={doRename} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Rename</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {deleteId !== null && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 340 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700, color: "#1e293b" }}>Delete File?</h2>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>This action cannot be undone and the file will be permanently removed.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setDeleteId(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151" }}>Cancel</button>
                <button onClick={() => { const removed = files.find(x => x.id === deleteId); if (removed?.objectUrl) URL.revokeObjectURL(removed.objectUrl); setFiles(f => f.filter(x => x.id !== deleteId)); setDeleteId(null); setMessage(`${removed?.name || "File"} deleted.`); }}
                  style={{ padding: "9px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
