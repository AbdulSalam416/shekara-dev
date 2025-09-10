import { NavBar } from '../components/core/Navbar';
import { Cta } from '../components/core/Cta';
import { ToolsSection } from '../components/core/ToolsSection';
import { Footer } from '../components/core/Footer';
import { Hero } from '../components/core/Hero';

export default function Index() {
  return (
    <div>
      <NavBar />
      <Hero />
      <ToolsSection />
      <Cta />
      <Footer />
    </div>
  );
}
