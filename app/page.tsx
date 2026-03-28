export default function Home() {
  const cardStyle = {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "20px",
    color: "white",
  } as const;

  const smallCard = {
    ...cardStyle,
    padding: "16px",
  } as const;

  const badge = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#1f2937",
    fontSize: "12px",
    marginRight: "8px",
    marginBottom: "8px",
  } as const;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#030712",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", color: "#9ca3af" }}>
              Credit Repair CRM
            </div>
            <h1 style={{ margin: "6px 0 0 0", fontSize: "36px" }}>
              DisputePilot
            </h1>
          </div>

          <div>
            <button
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 18px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Add Client
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={smallCard}>
            <div style={{ color: "#9ca3af", fontSize: "14px" }}>Active Clients</div>
            <div style={{ fontSize: "32px", marginTop: "8px", fontWeight: "bold" }}>
              128
            </div>
          </div>

          <div style={smallCard}>
            <div style={{ color: "#9ca3af", fontSize: "14px" }}>Open Disputes</div>
            <div style={{ fontSize: "32px", marginTop: "8px", fontWeight: "bold" }}>
              342
            </div>
          </div>

          <div style={smallCard}>
            <div style={{ color: "#9ca3af", fontSize: "14px" }}>Monthly Revenue</div>
            <div style={{ fontSize: "32px", marginTop: "8px", fontWeight: "bold" }}>
              $9,480
            </div>
          </div>

          <div style={smallCard}>
            <div style={{ color: "#9ca3af", fontSize: "14px" }}>Pending Tasks</div>
            <div style={{ fontSize: "32px", marginTop: "8px", fontWeight: "bold" }}>
              27
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Client Management</h2>

            <div
              style={{
                background: "#0f172a",
                border: "1px solid #1f2937",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: "bold" }}>Sarah Johnson</div>
                  <div style={{ color: "#9ca3af", fontSize: "14px" }}>
                    sarah@example.com
                  </div>
                </div>
                <div style={{ color: "#86efac" }}>Active</div>
              </div>
              <div style={{ marginTop: "12px" }}>
                <span style={badge}>Premium Repair</span>
                <span style={badge}>Round 2</span>
                <span style={badge}>Paid</span>
              </div>
            </div>

            <div
              style={{
                background: "#0f172a",
                border: "1px solid #1f2937",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: "bold" }}>Marcus Lee</div>
                  <div style={{ color: "#9ca3af", fontSize: "14px" }}>
                    marcus@example.com
                  </div>
                </div>
                <div style={{ color: "#fcd34d" }}>Needs Docs</div>
              </div>
              <div style={{ marginTop: "12px" }}>
                <span style={badge}>Starter Plan</span>
                <span style={badge}>Onboarding</span>
                <span style={badge}>Past Due</span>
              </div>
            </div>

            <div
              style={{
                background: "#0f172a",
                border: "1px solid #1f2937",
                borderRadius: "14px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: "bold" }}>Olivia Carter</div>
                  <div style={{ color: "#9ca3af", fontSize: "14px" }}>
                    olivia@example.com
                  </div>
                </div>
                <div style={{ color: "#86efac" }}>Active</div>
              </div>
              <div style={{ marginTop: "12px" }}>
                <span style={badge}>Business Credit Build</span>
                <span style={badge}>Round 1</span>
                <span style={badge}>Paid</span>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Quick Actions</h2>

            <div style={{ display: "grid", gap: "10px" }}>
              <button style={actionButtonStyle}>Upload Credit Report</button>
              <button style={actionButtonStyle}>Generate Dispute Letters</button>
              <button style={actionButtonStyle}>Create Invoice</button>
              <button style={actionButtonStyle}>Send Client Message</button>
            </div>

            <div style={{ marginTop: "24px" }}>
              <h3>Today&apos;s Activity</h3>
              <ul style={{ color: "#d1d5db", paddingLeft: "20px", lineHeight: 1.8 }}>
                <li>7 new clients completed onboarding</li>
                <li>24 dispute letters ready for export</li>
                <li>3 invoices failed renewal</li>
                <li>11 client messages waiting</li>
              </ul>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Open Disputes</h2>

            <div style={rowStyle}>
              <div>
                <div style={{ fontWeight: "bold" }}>Capital One</div>
                <div style={{ color: "#9ca3af", fontSize: "14px" }}>
                  Sarah Johnson • Late payment inaccurate
                </div>
              </div>
              <div style={{ color: "#93c5fd" }}>Sent</div>
            </div>

            <div style={rowStyle}>
              <div>
                <div style={{ fontWeight: "bold" }}>Medical Collection</div>
                <div style={{ color: "#9ca3af", fontSize: "14px" }}>
                  Sarah Johnson • Not mine
                </div>
              </div>
              <div style={{ color: "#fcd34d" }}>Under Review</div>
            </div>

            <div style={rowStyle}>
              <div>
                <div style={{ fontWeight: "bold" }}>Credit One</div>
                <div style={{ color: "#9ca3af", fontSize: "14px" }}>
                  Marcus Lee • Balance mismatch
                </div>
              </div>
              <div style={{ color: "#d1d5db" }}>Draft</div>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Documents</h2>

            <div style={rowStyle}>
              <div>Driver License.pdf</div>
              <div style={{ color: "#9ca3af" }}>Sarah Johnson</div>
            </div>

            <div style={rowStyle}>
              <div>Utility Bill.pdf</div>
              <div style={{ color: "#9ca3af" }}>Sarah Johnson</div>
            </div>

            <div style={rowStyle}>
              <div>SmartCredit Report.pdf</div>
              <div style={{ color: "#9ca3af" }}>Sarah Johnson</div>
            </div>

            <div style={rowStyle}>
              <div>Welcome Agreement.pdf</div>
              <div style={{ color: "#9ca3af" }}>Marcus Lee</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const actionButtonStyle = {
  background: "#0f172a",
  color: "white",
  border: "1px solid #1f2937",
  borderRadius: "12px",
  padding: "14px",
  textAlign: "left" as const,
  cursor: "pointer",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  padding: "14px 0",
  borderBottom: "1px solid #1f2937",
};