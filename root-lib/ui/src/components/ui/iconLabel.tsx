import { DynamicIcon } from './dynamicIcon';
import { IconName } from '../../lib/icon-registry';

interface IconLabelProps {
  icon: IconName;
  text: string;
  className?: string;
}

export const IconLabel: React.FC<IconLabelProps> = ({
                                                      icon,
                                                      text,
                                                      className = ''
                                                    }) => {
  return (
    <div className={`flex items-center ${className} gap-2`}>
      <span> <DynamicIcon name={icon} /> </span>
      <span>{text}</span>
    </div>
  );
};
