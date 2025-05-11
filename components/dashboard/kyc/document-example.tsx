"use client";

interface DocumentExampleProps { 
  title: string; 
  description: string;
}

const DocumentExample = ({ title, description }: DocumentExampleProps) => (
  <div className="rounded-[8px] border border-white/10 bg-darkGray/50 p-3 flex flex-col items-center">
    <div className="w-full h-32 bg-gray-800 rounded-[4px] flex items-center justify-center mb-2">
      <span className="text-xs text-gray-400">
        {title}
      </span>
    </div>
    <span className="text-xs text-gray-400">
      {description}
    </span>
  </div>
);

export default DocumentExample; 