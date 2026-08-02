import "./globals.css";

export const metadata = {
  title: "Inorion DRUM",
  description: "Virtual GUDAdrum — Inorion DRUM",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
