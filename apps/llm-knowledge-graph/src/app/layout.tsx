import './global.css';
import '../../../../libs/ui/src/styles/global.css';
import { SidebarProvider } from '@shekara-dev/ui';
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
    <body> <SidebarProvider>{children}</SidebarProvider></body>
    </html>
  );
}
