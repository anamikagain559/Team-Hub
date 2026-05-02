import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "../components/ThemeProvider";

import { SocketProvider } from "../context/SocketContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TeamHub - Collaborative Team Hub",
  description: "Manage shared goals, post announcements, and track action items in real time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SocketProvider>
            {children}
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
