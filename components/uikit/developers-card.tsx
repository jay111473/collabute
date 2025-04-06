import Image from "next/image";
import React from "react";

interface DevelopersCardProps {
  title: string;
  description: string;
  image: string;
  imageClassName?: string;
}

const DevelopersCard = ({ title, description, image, imageClassName }: DevelopersCardProps) => {
  return (
    <div className=" flex flex-col border border-white/10 rounded-3xl px-6 pt-8 z-10 overflow-hidden backdrop-blur-md h-max">
      <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_0%,rgba(71,_37,_147,_0.13)_0%,rgba(17,_17,_17,_0.95)_53.24%,rgba(0,_0,_0,_0.98)_100%)]" />
      <div className="flex flex-col gap-2 relative z-20">
        <h3 className="text-white text-lg font-medium">{title}</h3>
        <p className="text-gray-400 text-xs font-light"> {description}</p>
      </div>
      <div className="flex justify-center items-center mt-10">
        <Image src={image} alt="developers-card" width={350} height={300} className={`relative z-20 ${imageClassName}`} />
      </div>
    </div>
  );
};

export default DevelopersCard;
