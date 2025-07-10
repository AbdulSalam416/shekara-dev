import { siteConfig } from '@/siteConfig';
import { Button } from '@app-ui';

export const NavBar = () => {
  return (
    <nav className="bg-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-900">
          {siteConfig.siteName}
        </div>

        <div className="flex items-center space-x-6">
          {siteConfig.nav.map((item, index) => (
            item.type === "button" ? (
              <Button
                key={index}
                variant={item.label === "Get Started" ? "default" : "ghost"}
                className={
                  item.label === "Get Started"
                    ? "bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full"
                    : "text-gray-700 hover:text-gray-900"
                }
              >
                {item.label}
              </Button>
            ) : (
              <a
                key={index}
                href={item.href}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                {item.label}
              </a>
            )
          ))}
        </div>
      </div>
    </nav>
  );
};
