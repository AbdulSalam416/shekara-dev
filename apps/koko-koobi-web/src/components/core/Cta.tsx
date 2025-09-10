import { Button, IconName } from '@shekara-dev/ui';
import { siteConfig } from '../../siteConfig';
export const Cta = () => {
  return (
    <section className="relative bg-light  py-20">
      <div className="relative max-w-5xl gap-5 mx-auto flex flex-col items-center text-center px-6">
        <h1 className="text-5xl md:text-3xl font-bold text-primary-default mb-3 leading-tight">
          {siteConfig.cta.title}
        </h1>
        <p className="text-xl text-primary-default mb-8 max-w-3xl mx-auto leading-relaxed">
          {siteConfig.cta.subtitle}
        </p>
        <Button className="bg-gradient-blue text-white px-8 py-3 text-lg font-semibold rounded-full w-fit">
          {siteConfig.cta.ctaText}
        </Button>
      </div>
    </section>
  );
};
