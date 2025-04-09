import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import VerticalNavbar from "./components/Navbar";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0a]">
        <AuthProvider>
          <VerticalNavbar />
          <main className="mr-40 mt-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
