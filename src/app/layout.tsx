import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import VerticalNavbar from "./components/Navbar";


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
          <main className="">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
