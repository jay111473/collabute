"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AIBadge from "@/components/uikit/ai-badge";
import Image from "next/image";
import { CosmicButton } from "@/components/uikit/cosmic-button";
import DevelopersCard from "@/components/uikit/developers-card";
interface FeatureCardProps {
  title: string;
  description: string;
  delay: number;
  isRightColumn?: boolean;
}

function FeatureCard({
  title,
  description,
  delay,
  isRightColumn,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={`relative p-8 group md:${
        isRightColumn ? "text-left" : "text-right"
      } text-left`}
    >
      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p
          className={`text-gray-400 text-base leading-relaxed max-w-[400px] md:${
            isRightColumn ? "ml-0" : "ml-auto"
          }`}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function Developers() {
  const features = [
    {
      title: "Seamless GitHub Integration",
      description:
        "Collaborate efficiently with familiar tools and access AI-powered features.",
    },
    {
      title: "Access to Innovative Projects",
      description: "Work on ideas that could disrupt industries.",
    },
    {
      title: "Earn Based on Contribution",
      description:
        "Collaborate efficiently with familiar tools and access AI-powered features.",
    },
    {
      title: "Team Up with the Best",
      description:
        "Team up with exceptional developers and like-minded people to create impactful solutions.",
    },
    {
      title: "Professional Growth",
      description: "Build your portfolio and enhance your skills.",
    },
  ];

  return (
    <section className="w-full relative overflow-hidden min-h-[50vh] flex flex-col justify-center items-center py-10">
      <div className="absolute w-full flex top-0 justify-center items-center">
        <Image
          src="/matrix.png"
          alt="Hero background"
          width={812}
          height={588}
          className=""
          priority
        />
      </div>
      <div className="container px-4 md:px-6 relative">
        <div className="text-center mb-12">
          <div className="flex justify-center">
            <AIBadge text="Developers" />
          </div>
          <div className="flex justify-center items-center gap-2">
            <h2 className="text-2xl md:text-[36px] font-bold text-white mt-4 mb-6 flex justify-center items-center">
              <Image
                src="/logo.svg"
                alt="Code"
                width={40}
                height={32}
                className="mt-1"
              />
              ode Your Way
            </h2>
            <h2 className="text-2xl md:text-[36px] font-bold text-white mt-4 mb-6 flex justify-center items-center capitalize">
              <span className="text-darkPrimary">out of the matrix</span>
            </h2>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Your skills deserve recognition and fair compensation. Collabute
            integrates seamlessly with GitHub, allowing you to contribute
            effectively and earn based on your contributions.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <CosmicButton className="px-6 py-2.5 rounded-md text-white font-medium">
              Join as a Developer
            </CosmicButton>
            <Button
              variant="outline"
              className="px-6 py-2.5 rounded-md !border-opacity-30 bg-transparent text-white font-medium"
            >
              Perks & Benefits
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-start gap-x-4 ">
        <div className="grid grid-cols-1 gap-4 w-1/2">
          <DevelopersCard
            title={"Seamless GitHub Integration"}
            description={
              "Collaborate efficiently with familiar tools and access AI-powered features."
            }
            image={"/git.png"}
          />
          <DevelopersCard
            title={"Team Up with the Best"}
            description={
              "Team up with exceptional developers and like-minded people to create impactful solutions."
            }
            image={"/teamup.png"}
          />
          <DevelopersCard
            title={"Professional Growth"}
            description={
              "Build your portfolio and enhance your skills."
            }
            image={"/growth.png"}
            imageClassName="w-full "
          />
        </div>
        <div className="grid grid-cols-1 gap-4 w-1/2">
          <DevelopersCard
            title={"Access to Innovative Projects"}
            description={"Work on ideas that could disrupt industries."}
            image={"/projects.png"}
            imageClassName="w-full -mr-10"
          />
          <DevelopersCard
            title={"Withdraw instantly "}
            description={"Build your portfolio and enhance your skills."}
            image={"/payment.png"}
            imageClassName="w-full -mr-36"
          />
          <DevelopersCard
            title={"Earn Based on Contribution"}
            description={"Collaborate efficiently with familiar tools and access AI-powered features."}
            image={"/earn.png"}
            imageClassName="w-full -mr-28"
          />
        </div>
      </div>
    </section>
  );
}

export default Developers;
