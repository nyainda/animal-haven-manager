
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, className }) => {
  return (
    <div 
      className={cn(
        "group relative card-gradient p-8 rounded-2xl transition-all duration-300 shadow-sm",
        "hover:shadow-lg hover:-translate-y-1 hover:bg-primary/5",
        className
      )}
    >
      <div className="flex flex-col items-start gap-4 font-serif text-sm">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <Icon size={24} strokeWidth={1.5} />
        </div>
        
        <h3 className="text-xl font-bold">{title}</h3>
        
        <p className="text-foreground/70">{description}</p>
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default FeatureCard;
