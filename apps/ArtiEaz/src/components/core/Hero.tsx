import { Button, IconName } from '@app-ui';
import { siteConfig } from '../../siteConfig';
import { Code, Sparkles } from 'lucide-react';
import {IconLabel} from "@app-ui"
export const Hero = () => {
  return (
    <section className="relative bg-light  py-20">
      <div className="relative max-w-5xl gap-6 mx-auto flex flex-col items-center text-center px-6">
        <p className={'bg-[#dbeafe] rounded-lg gap-2 w-fit p-3 text-accent-default flex text-center'}> <Sparkles/>  <span className={''}>AI Powered Development Tools</span></p>
        <h1 className="text-5xl md:text-6xl font-bold text-primary-default mb-6 leading-tight">
          {siteConfig.hero.title_l1} <span className={'bg-gradient-blue text-transparent bg-clip-text'}>{siteConfig.hero.title_l2}</span>
        </h1>
        <p className="text-xl text-primary-default mb-8 max-w-3xl mx-auto leading-relaxed">
          {siteConfig.hero.subtitle}
        </p>

        <Button className="bg-accent-default text-white px-8 py-3 text-lg font-semibold rounded-full w-fit">
          {siteConfig.hero.ctaText}
        </Button>

        <div className={'flex w-full items-center justify-center gap-3'}>
          {siteConfig.hero.highlights.map((highlight, i) => (
            <IconLabel key={i}  icon={highlight.icon as IconName} text={highlight.text} />
          ))}
        </div>
      </div>
    </section>
  );
};
