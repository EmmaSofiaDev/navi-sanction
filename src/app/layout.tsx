import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NAVI-SANCTION | Maritime War-Risk & AIS Contradiction Gate',
  description: 'Autonomous maritime compliance & life-safety contradiction arbitration engine powered by Sanity Context MCP and Sanity Content Lake.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
