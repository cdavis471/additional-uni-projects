import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "The Museum of Modern Art (MoMA) Catalogue",
  description:
    "C20441826 (TU856/4) | Enterprise Application Development (CMPU4023)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}

        <footer className="site-footer">
          <h3>CONOR DAVIS</h3>
          <p>C20441826 | TU856/4 | CMPU4023 ASSIGNMENT</p>
        </footer>
      </body>
    </html>
  );
}