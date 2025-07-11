import { Button } from '@app-ui';
import { siteConfig } from '../../siteConfig';

export const Hero = () => {
  return (
    <section className="relative bg-gray-100 py-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gray-300 rounded-lg transform rotate-12 opacity-60"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gray-400 rounded-lg transform -rotate-12 opacity-40"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gray-300 rounded-lg transform rotate-45 opacity-30"></div>
        <div className="absolute bottom-32 right-20 w-28 h-28 bg-gray-400 rounded-lg transform -rotate-45 opacity-50"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center px-6">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          {siteConfig.hero.title}
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          {siteConfig.hero.subtitle}
        </p>

        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-full">
          {siteConfig.hero.ctaText}
        </Button>
      </div>
    </section>
  );
};
