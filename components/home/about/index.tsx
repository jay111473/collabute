"use client"

import { motion } from "framer-motion"
import { Card } from "../../ui/card"
import { Button } from "@/components/ui/button"

interface FeatureCardProps {
  title: string
  description: string
  delay: number
}

function FeatureCard({ title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center"
    >
      <div className="mb-6 rounded-full border border-purple-500/20 bg-purple-500/5 p-4 w-[72px] h-[72px] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-purple-500/20" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed max-w-[280px]">
        {description}
      </p>
    </motion.div>
  )
}

function About() {
  const features = [
    {
      title: "Immediate Access to Talent",
      description: "Find the right developers without the wait.",
    },
    {
      title: "AI-Powered Project Management",
      description: "Optimize tasks and streamline workflows.",
    },
    {
      title: "Stay Ahead of Competitors",
      description: "Launch your ideas before the market shifts.",
    },
  ]

  return (
    <section className="w-full py-16 relative">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <div className="inline-block rounded-full bg-transparent border border-white/20 px-4 py-1.5 mb-4 text-sm">
            ✨ Entrepreneurs
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bring Your Ideas to Life <span className="text-purple-500">Faster</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-12">
            In today&apos;s competitive market, timing is everything. Collabute connects you instantly with skilled developers,
            eliminating the delays of traditional hiring processes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Button variant="primary" className="px-6 py-2.5 rounded-md text-white font-medium transition-colors">
              Bring Your Idea to Life
            </Button>
            <Button variant="outline" className="px-6 py-2.5 rounded-md !border-opacity-30 bg-transparent text-white font-medium">
              How it works
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
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
    </section>
  )
}

export default About
