import './global.css';
import '../../../../libs/ui/src/styles/global.css';
import Providers from '../components/core/Providers';
import { Analytics } from '@vercel/analytics/next';


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
      </body>
    </html>
  );
}
