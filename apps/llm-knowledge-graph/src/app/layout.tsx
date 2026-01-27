import './global.css';
import '../../../../libs/ui/src/styles/global.css';
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
    <html lang="en">
      <body> {children}</body>
    </html>
  );
}
