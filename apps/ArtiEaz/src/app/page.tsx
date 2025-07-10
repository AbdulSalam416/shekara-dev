import { Button } from '@app-ui';
import { NavBar } from '@/components/core/Navbar';
import { Hero } from '@/components/core/Hero';

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
        <Button/>
    </div>
  );
}
