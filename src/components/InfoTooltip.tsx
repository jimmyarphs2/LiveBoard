import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

interface InfoTooltipProps {
  content: string;
  example?: string;
  whyItMatters?: string;
}

export function InfoTooltip({ content, example, whyItMatters }: InfoTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center justify-center rounded-full p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none">
        <HelpCircle className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-zinc-900 border-zinc-800 text-zinc-200 p-3 shadow-xl">
        <div className="space-y-2">
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-0.5">What this is</h4>
            <p className="text-[13px] leading-relaxed">{content}</p>
          </div>
          
          {example && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-0.5">Example</h4>
              <p className="text-[13px] italic text-zinc-400">"{example}"</p>
            </div>
          )}
          
          {whyItMatters && (
            <div className="pt-2 border-t border-zinc-800">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-0.5">Why it matters</h4>
              <p className="text-[13px] text-indigo-400 font-medium">{whyItMatters}</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
