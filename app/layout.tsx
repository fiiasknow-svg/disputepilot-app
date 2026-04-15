import type { ReactNode } from "react";

export const metadata = {
  title: "DisputePilot",
  description: "Credit Repair CRM",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
