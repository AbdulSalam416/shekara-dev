import './global.css';
import '../../../../libs/ui/src/styles/global.css'
export const metadata = {
  title: 'Welcome to ArtiEaz',
  description: 'An all in one platform for your workflow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
