"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import CDMLayout from "@/components/CDMLayout";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Icons = {
  Save: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
};

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "active",
    address: "",
    city: "",
    state: "",
    zip: "",
    ssn: "",
    dob: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("clients")
        .insert([{
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          ssn: formData.ssn,
          dob: formData.dob,
          notes: formData.notes
        }])
        .select();

      if (error) throw error;
      
      alert("Client added successfully!");
      router.push("/clients");
    } catch (error) {
      alert("Error adding client. Please check your Supabase connection.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s"
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px"
  };

  return (
    <CDMLayout>
      <PageHeader 
        title="Add New Customer" 
        description="Create a new client record"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Customers", href: "/clients" }, { label: "Add New" }]}
      />
      
      <div style={{ padding: "24px" }}>
        <form onSubmit={handleSubmit}>
          {/* Form Grid */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "20px",
            marginBottom: "24px"
          }}>
            {/* Personal Info */}
            <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: "0 0 16px 0" }}>Personal Information</h3>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>First Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  style={inputStyle}
                  placeholder="Enter first name"
                />
              </div>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Last Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  style={inputStyle}
                  placeholder="Enter last name"
                />
              </div>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Email *</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={inputStyle}
                  placeholder="Enter email address"
                />
              </div>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Phone</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={inputStyle}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Date of Birth</label>
                <input 
                  type="date" 
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>SSN (Last 4)</label>
                <input 
                  type="text" 
                  maxLength={4}
                  value={formData.ssn}
                  onChange={(e) => setFormData({...formData, ssn: e.target.value})}
                  style={inputStyle}
                  placeholder="XXXX"
                />
              </div>
            </div>

            {/* Address */}
            <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: "0 0 16px 0" }}>Address</h3>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Street Address</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={inputStyle}
                  placeholder="Enter street address"
                />
              </div>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>City</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  style={inputStyle}
                  placeholder="Enter city"
                />
              </div>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>State</label>
                <input 
                  type="text" 
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  style={inputStyle}
                  placeholder="Enter state"
                />
              </div>
              
              <div>
                <label style={labelStyle}>ZIP Code</label>
                <input 
                  type="text" 
                  value={formData.zip}
                  onChange={(e) => setFormData({...formData, zip: e.target.value})}
                  style={inputStyle}
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>

            {/* Status & Notes */}
            <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: "0 0 16px 0" }}>Status & Notes</h3>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={{...inputStyle, cursor: "pointer"}}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={{...inputStyle, minHeight: "120px", resize: "vertical"}}
                  placeholder="Enter any additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <Link href="/clients" style={{ textDecoration: "none" }}>
              <button 
                type="button"
                style={{ 
                  padding: "10px 20px",
                  backgroundColor: "#fff",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </Link>
            <button 
              type="submit"
              disabled={loading}
              style={{ 
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Icons.Save />
              {loading ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </CDMLayout>
  );
}
