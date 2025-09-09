import { NavBar } from '../components/core/Navbar';
import { Cta } from '../components/core/Cta';
import { ToolsSection } from '../components/core/ToolsSection';
import { Footer } from '../components/core/Footer';
import { Testimonials } from '../components/core/Testimonials';
import { Hero } from '../components/core/Hero';

export default function Index() {
  
  return (
    <div>
      <NavBar />
      <Hero/>
      <ToolsSection/>
      <Cta/>
      <Footer/>
    </div>
  );
}
