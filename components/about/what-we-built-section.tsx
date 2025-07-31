import React from "react";

const WhatWeBuiltSection = () => {
  return (
    <section className="w-full py-32">
      <div className="w-full max-w-4xl mx-auto px-6 text-center space-y-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
          What We Built
        </h2>
        
        <div className="space-y-8 text-sm sm:text-base text-gray-400 leading-relaxed max-w-3xl mx-auto">
          <p className="text-lg sm:text-xl font-semibold text-gray-300">
            A platform where creating products feels rewarding again.
          </p>
          
          <p>
            Our AI helps founders transform initial concepts into clear project plans. 
            Developers discover projects that align with their interests. Team leads 
            access straightforward tools that deliver results.
          </p>
          
          <p>
            Fair compensation for quality work. Streamlined processes. 
            <span className="font-semibold text-gray-300"> Simply build great products with people who understand.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhatWeBuiltSection; 