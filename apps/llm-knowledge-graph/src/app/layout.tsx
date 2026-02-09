import './global.css';
import '../../../../libs/ui/src/styles/global.css';
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
