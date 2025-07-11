import { NavBar } from '../components/core/Navbar';
import { Hero } from '../components/core/Hero';
import { ToolsSection } from '../components/core/ToolsSection';
import { Footer } from '../components/core/Footer';
import { Testimonials } from '../components/core/Testimonials';

export default function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.tailwind file.
   */
  return (
    <div>
      <NavBar />
      <Hero/>
      <ToolsSection/>
      <Testimonials/>
      <Footer/>
    </div>
  );
}
