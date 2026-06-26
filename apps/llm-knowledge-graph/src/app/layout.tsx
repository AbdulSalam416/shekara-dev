import React from 'react';
import Script from 'next/script';
import './global.css';
import Providers from '../components/core/Providers';

export const metadata = {
  title: 'LLM Knowledge Graph',
  description: '.....',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}
          {/*<Analytics />*/}
        </Providers>
        <Script
          data-goatcounter="https://mind-graph-research.goatcounter.com/count"
          async
          src="//gc.zgo.at/count.js"
        />
      </body>
    </html>
  );
}

