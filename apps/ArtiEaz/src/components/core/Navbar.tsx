import { Button } from '@app-ui';
import { siteConfig } from '../../siteConfig';
import { CodeXml } from 'lucide-react';

export const NavBar = () => {
  return (
    <nav className="bg-white py-4 px-6 fixed w-full z-10 ">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold flex gap-2 items-start text-center">
          <span className={'bg-gradient-blue rounded-xl p-2'}> <CodeXml color={'#fff'}/></span>
          <p>{siteConfig.siteName}</p>
        </div>
        <div className="flex items-center space-x-6">
          {siteConfig.nav.map((item, index) => (

              <a
                key={index}
                href={item.href}
                className="text-primary-default hover:text-gray-900 font-medium"
              >
                {item.label}
              </a>
          ))}
        </div>
        <div className="flex items-center space-x-6">
          {/*{siteConfig.nav.map((item, index) => (*/}
          {/*  item.type === "button" ? (*/}
              <Button
                key={'support'}
                variant={'default'}
                className={
                "bg-gradient-blue hover:bg-blue-600 text-white px-6 py-2 rounded-full"
                }
              >
                {"Support Developer"}
              </Button>
          {/*  ) : (*/}
          {/*    <a*/}
          {/*      key={index}*/}
          {/*      href={item.href}*/}
          {/*      className="text-gray-700 hover:text-gray-900 font-medium"*/}
          {/*    >*/}
          {/*      {item.label}*/}
          {/*    </a>*/}
          {/*  )*/}
          {/*))}*/}
        </div>
      </div>
    </nav>
  );
};
