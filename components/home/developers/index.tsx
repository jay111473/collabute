"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AIBadge from "@/components/uikit/ai-badge";
import Image from "next/image";
import { CosmicButton } from "@/components/uikit/cosmic-button";
import DevelopersCard from "@/components/uikit/developers-card";

function Developers() {
  return (
    <section className="w-full relative overflow-hidden min-h-[50vh] flex flex-col justify-center items-center py-10">
      <div className="absolute w-full flex top-0 justify-center items-center">
        <Image
          src="/matrix.png"
          alt="Hero background"
          width={1250}
          height={588}
          className="max-w-full h-auto"
          priority
        />
      </div>
      <div className="container px-4 md:px-6 relative">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center">
            <AIBadge text="Developers" />
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 mb-4">
            <h2 className="text-2xl md:text-[36px] font-bold text-white mt-4 mb-2 md:mb-0 md:mt-0 flex justify-center items-center">
              <Image
                src="/logo.svg"
                alt="Code"
                width={40}
                height={32}
                className="mt-1"
              />
              ode Your Way
            </h2>
            <h2 className="text-2xl md:text-[36px] font-bold mb-4 md:mb-0 flex justify-center items-center capitalize text-darkPrimary">
             out of the matrix
            </h2>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6 md:mb-8 px-4">
            Your skills deserve recognition and fair compensation. Collabute
            integrates seamlessly with GitHub, allowing you to contribute
            effectively and earn based on your contributions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 md:mb-16">
            <CosmicButton className="px-6 py-2.5 rounded-md text-white font-medium w-full sm:w-auto">
              Join as a Developer
            </CosmicButton>
            <Button
              variant="outline"
              className="px-6 py-2.5 rounded-md !border-opacity-30 bg-transparent text-white font-medium w-full sm:w-auto"
            >
              Perks & Benefits
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-x-4 px-4 w-full max-w-[1400px]">
        <div className="grid grid-cols-1 gap-4 w-full md:w-1/2">
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
            imageClassName="w-full"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 w-full md:w-1/2">
          <DevelopersCard
            title={"Access to Innovative Projects"}
            description={"Work on ideas that could disrupt industries."}
            image={"/projects.png"}
            imageClassName="w-full md:-mr-10"
          />
          <DevelopersCard
            title={"Withdraw instantly "}
            description={"Build your portfolio and enhance your skills."}
            image={"/payment.png"}
            imageClassName="w-full md:-mr-36"
          />
          <DevelopersCard
            title={"Earn Based on Contribution"}
            description={"Collaborate efficiently with familiar tools and access AI-powered features."}
            image={"/earn.png"}
            imageClassName="w-full md:-mr-28"
          />
        </div>
      </div>
    </section>
  );
}

export default Developers;
