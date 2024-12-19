"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface FeatureCardProps {
  title: string
  description: string
  delay: number
  isRightColumn?: boolean
}

function FeatureCard({ title, description, delay, isRightColumn }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={`relative p-8 group md:${isRightColumn ? 'text-left' : 'text-right'} text-left`}
    >
      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-white mb-3">
          {title}
        </h3>
        <p className={`text-gray-400 text-base leading-relaxed max-w-[400px] md:${isRightColumn ? 'ml-0' : 'ml-auto'}`}>
          {description}
        </p>
      </div>
    </motion.div>
  )
}

function Developers() {
  const features = [
    {
      title: "Seamless GitHub Integration",
      description: "Collaborate efficiently with familiar tools and access AI-powered features.",
    },
    {
      title: "Access to Innovative Projects",
      description: "Work on ideas that could disrupt industries.",
    },
    {
      title: "Earn Based on Contribution",
      description: "Collaborate efficiently with familiar tools and access AI-powered features.",
    },
    {
      title: "Team Up with the Best",
      description: "Team up with exceptional developers and like-minded people to create impactful solutions.",
    },
    {
      title: "Professional Growth",
      description: "Build your portfolio and enhance your skills.",
    },
  ]

  return (
    <section className="w-full py-20 relative overflow-hidden">
      <div className="container px-4 md:px-6 relative">
        <div className="text-center mb-12">
          <div className="inline-block rounded-full bg-transparent border border-white/20 px-4 py-1.5 mb-4 text-sm">
            ✨ For developers
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-purple-400">Collaborate</span>, Code, and Get Paid
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Your skills deserve recognition and fair compensation. Collabute integrates seamlessly with GitHub,
            allowing you to contribute effectively and earn based on your contributions.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Button variant="primary" className="px-6 py-2.5 rounded-md text-white font-medium">
              Join as a Developer
            </Button>
            <Button variant="outline" className="px-6 py-2.5 rounded-md !border-opacity-30 bg-transparent text-white font-medium">
              Perks & Benefits
            </Button>
          </div>
        </div>

        {/* Desktop Layout with Background */}
        <div className="hidden md:block">
          <div 
            className="relative mx-auto max-w-[1200px] min-h-[1100px] bg-no-repeat bg-center bg-cover"
            style={{
              backgroundImage: 'url("/border-background.png")',
              backgroundSize: '100% 100%'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-x-16 gap-y-6 max-w-[900px] -mt-36">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={feature.title}
                    title={feature.title}
                    description={feature.description}
                    delay={index * 0.2}
                    isRightColumn={index % 2 === 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex flex-col gap-y-8 max-w-[500px] mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                delay={index * 0.2}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Developers
