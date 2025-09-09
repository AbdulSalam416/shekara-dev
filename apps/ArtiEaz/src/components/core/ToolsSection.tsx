
import { DynamicIcon, IconName } from '@shekara-dev/ui';
import {Card, CardHeader, CardDescription, CardContent, Button, CardTitle,Badge} from  '@shekara-dev/ui'
import { siteConfig } from '../../siteConfig';
export const ToolsSection = () => {
  const iconColors = ['#00c950', '#2b7fff', '#ad46ff', '#ff6900']
  return (
    <section className="py-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {siteConfig.toolsSection.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {siteConfig.toolsSection.subtitle}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {siteConfig.toolsSection.tools.map((tool, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className={`bg-[${iconColors[index]}] p-2 rounded-md` }>
                    <DynamicIcon name={tool.icon as IconName} color={'#fff'}/>
                  </div>
                  <Badge
                    variant={tool.status === "live" ? "default" : "secondary"}
                    className={tool.status === "live" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                  >
                    {tool.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {tool.description}
                </CardDescription>
                <Button
                  variant="outline"
                  className="mt-4 w-full group-hover:bg-blue-50 group-hover:border-blue-300 transition-all"
                  disabled={tool.status === "coming soon"}
                >
                  {tool.status === "live" ? "Try Now" : "Coming Soon"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
