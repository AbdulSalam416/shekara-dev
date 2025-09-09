import { siteConfig } from '../../siteConfig';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
      
      </div>
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                {siteConfig.siteName}
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed">
              {siteConfig.footerCta.title}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {siteConfig.footer.links.slice(0, 3).map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                {siteConfig.footer.links.slice(3).map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">{siteConfig.footer.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
