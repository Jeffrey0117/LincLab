'use client';

import { Button } from '@/components/ui/button';
import { strategyCategories } from '@/lib/automation-data';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(strategyCategories).map(([key, category]) => (
        <Button
          key={key}
          variant={selectedCategory === key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(key)}
          className={cn(
            'transition-all duration-200',
            selectedCategory === key && 'shadow-md'
          )}
        >
          <span className="mr-2 text-lg">{category.icon}</span>
          {category.label}
        </Button>
      ))}
    </div>
  );
}