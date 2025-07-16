import { LucideProps } from 'lucide-react';
import { IconName, iconRegistry } from '../../lib/icon-registry';
import * as React from 'react';

interface DynamicIconProps extends LucideProps {
  name: IconName;
  fallback?: React.ComponentType<LucideProps>;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
                                                          name,
                                                          fallback,
                                                          ...props
                                                        }) => {
  const IconComponent = iconRegistry[name] || fallback;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in registry`);
    return null;
  }

  return <IconComponent {...props} />;
};
