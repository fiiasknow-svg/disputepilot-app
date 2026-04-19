"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import CDMLayout from "@/components/CDMLayout";

const supabase = createClient(
  "https://wrjgjxltgpksjgifqszt.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS = Array.from({ length: 80 }, (_, i) => String(new Date().getFullYear() - i));
const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const PROVIDERS = ["SmartCredit", "MyFreeScore360", "IdentityIQ", "mySCOREIQ", "PrivacyGuard"];
const STATUSES = ["active", "pending", "inactive", "cancelled"];

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "",
    dob_month: "", dob_day: "", dob_year: "",
    ssn: "", street_address: "", city: "", state: "", zip: "",
    mobile_phone: "", home_phone: "", work_phone: "",
    email: "", status: "active", assign_to: "",
    registration_date: "", end_date: "", portal_access: false,
    comments: "",
    cc_number: "", cc_cvv: "", cc_expiry: "",
    cm_username: "", cm_password: "", cm_last4: "", cm_provider: "",
    full_name: "",
  });

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("clients").select("*").eq("id", id).single();
      if (data) {
        const nameParts = (data.full_name || "").split(" ");
        setForm(f => ({
          ...f,
          ...data,
          first_name: data.first_name || nameParts[0] || "",
          middle_name: data.middle_name || "",
          last_name: data.last_name || nameParts.slice(1).join(" ") || "",
        }));
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function set(key: string, val: any) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function save() {
    setSaving(true);
    const fullName = [form.first_name, form.middle_name, form.last_name].filter(Boolean).join(" ");
    await supabase.from("clients").update({ ...form, full_name: fullName }).eq("id", id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inp = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const };
  const sel = { ...inp };
  const label = (text: string) => (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.03em" }}>{text}</label>
  );

  function field(labelText: string, key: string, type = "text") {
    return (
      <div>
        {label(labelText)}
        <input type={type} value={(form as any)[key] || ""} onChange={e => set(key, e.target.value)} style={inp} />
      </div>
    );
  }

  function selectField(labelText: string, key: string, options: string[]) {
    return (
      <div>
        {label(labelText)}
        <select value={(form as any)[key] || ""} onChange={e => set(key, e.target.value)}
          style={{ ...sel, background: "#fff" }}>
          <option value="">--</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  const sectionStyle = { background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 24, marginBottom: 20 };
  const sectionHeader = (title: string) => (
    <h2 style={{ fontSize: 14, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", margin: "0 0 18px", paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>{title}</h2>
  );
  const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 };

  if (loading) return <CDMLayout><div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading…</div></CDMLayout>;

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1000 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", color: "#1e293b" }}>
              {form.first_name || form.full_name || "Client"} {form.last_name}
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Edit client profile</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => router.push("/clients")}
              style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
              Cancel
            </button>
            <button onClick={save} disabled={saving}
              style={{ padding: "9px 24px", background: saved ? "#10b981" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
              {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Name */}
        <div style={sectionStyle}>
          {sectionHeader("Personal Information")}
          <div style={{ ...grid3, marginBottom: 16 }}>
            {field("First Name", "first_name")}
            {field("Middle Name", "middle_name")}
            {field("Last Name", "last_name")}
          </div>
          <div style={{ ...grid3, marginBottom: 16 }}>
            <div>
              {label("Date of Birth")}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 80px", gap: 6 }}>
                <select value={form.dob_month} onChange={e => set("dob_month", e.target.value)} style={{ ...sel, background: "#fff" }}>
                  <option value="">Month</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={form.dob_day} onChange={e => set("dob_day", e.target.value)} style={{ ...sel, background: "#fff" }}>
                  <option value="">Day</option>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={form.dob_year} onChange={e => set("dob_year", e.target.value)} style={{ ...sel, background: "#fff" }}>
                  <option value="">Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            {field("SSN", "ssn")}
            {field("Street Address", "street_address")}
          </div>
          <div style={{ ...grid3 }}>
            {field("City", "city")}
            {selectField("State", "state", STATES)}
            {field("Zip", "zip")}
          </div>
        </div>

        {/* Contact */}
        <div style={sectionStyle}>
          {sectionHeader("Contact")}
          <div style={{ ...grid3, marginBottom: 16 }}>
            {field("Mobile Phone", "mobile_phone", "tel")}
            {field("Home Phone", "home_phone", "tel")}
            {field("Work Phone", "work_phone", "tel")}
          </div>
          <div style={{ ...grid3 }}>
            {field("Email", "email", "email")}
            {selectField("Status", "status", STATUSES)}
            {field("Assign To", "assign_to")}
          </div>
        </div>

        {/* Account */}
        <div style={sectionStyle}>
          {sectionHeader("Account Settings")}
          <div style={{ ...grid3, marginBottom: 16 }}>
            {field("Registration Date", "registration_date", "date")}
            {field("End Date", "end_date", "date")}
            <div>
              {label("Client Portal Access")}
              <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, cursor: "pointer" }}>
                <input type="checkbox" checked={!!form.portal_access} onChange={e => set("portal_access", e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "#1e3a5f" }} />
                <span style={{ fontSize: 14, color: "#1e293b" }}>Enabled</span>
              </label>
            </div>
          </div>
          <div>
            {label("Comments")}
            <textarea value={form.comments || ""} onChange={e => set("comments", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, minHeight: 80, resize: "vertical", boxSizing: "border-box" as const }} />
          </div>
        </div>

        {/* Billing */}
        <div style={sectionStyle}>
          {sectionHeader("Credit Card on File")}
          <div style={{ ...grid3 }}>
            {field("Card Number", "cc_number")}
            {field("CVV", "cc_cvv")}
            {field("Expiration (MM/YY)", "cc_expiry")}
          </div>
        </div>

        {/* Credit Monitoring */}
        <div style={sectionStyle}>
          {sectionHeader("Credit Monitoring")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
            {field("Username", "cm_username")}
            {field("Password", "cm_password")}
            {field("Last 4 SSN", "cm_last4")}
            {selectField("Provider", "cm_provider", PROVIDERS)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingBottom: 32 }}>
          <button onClick={() => router.push("/clients")}
            style={{ padding: "10px 24px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            style={{ padding: "10px 28px", background: saved ? "#10b981" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </CDMLayout>
  );
}
