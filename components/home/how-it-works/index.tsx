'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Step {
  number: number
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: 1,
    title: 'SHARE YOUR IDEAS',
    description: 'Describe your idea, and we\'ll structure it into tasks, create a technical proposal, and develop a business model.'
  },
  {
    number: 2,
    title: 'GET MATCHED',
    description: 'AI algorithms connect you with the best developers based on skills and preferences.'
  },
  {
    number: 3,
    title: 'COLLABORATE SEAMLESSLY VIA GITHUB',
    description: 'Integrate GitHub for version control, task management, and real-time collaboration.'
  },
  {
    number: 4,
    title: 'EXECUTE AND LAUNCH SUCCESSFULLY',
    description: 'Developers contribute, earn based on input, and entrepreneurs launch faster.'
  }
]

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1)
  const sectionRef = useRef<HTMLElement>(null)
  const stepsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      stepsRef.current.forEach((stepEl, index) => {
        if (!stepEl) return

        const rect = stepEl.getBoundingClientRect()
        const windowHeight = window.innerHeight
        
        const inView = rect.top < (windowHeight * 0.66) && rect.bottom > (windowHeight * 0.33)

        if (inView) {
          setActiveStep(index + 1)
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="relative bg-black min-h-screen">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-32">
          <div className="inline-flex items-center gap-2 rounded-full bg-transparent border border-white/30 px-4 py-1.5 mb-6">
            <span className="text-purple-400">✨</span>
            <span className="text-white text-sm">How it works</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-200 to-purple-400 bg-clip-text text-transparent">
              Seamless Collaboration
            </span>
            <span className="text-white"> from Concept to Completion</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Your skills deserve recognition and fair compensation. Collabute integrates seamlessly with GitHub,
            allowing you to contribute effectively and earn based on your contributions.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-[8vh]">
          {steps.map((step, index) => (
            <div
              key={step.number}
              ref={(el) => {
                stepsRef.current[index] = el
              }}
              className={cn(
                'transition-all duration-700',
                activeStep === step.number ? 'opacity-100' : 'opacity-60'
              )}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: activeStep === step.number ? 1 : 0.6
                }}
                transition={{ duration: 0.7 }}
                className="space-y-5"
              >
                <div className={cn(
                  "text-zinc-600 text-sm font-medium",
                  activeStep === step.number ? "text-purple-200" : "text-zinc-700"
                )}>
                  Step {step.number}
                </div>
                <h3 className={cn(
                  "text-4xl font-bold tracking-tight uppercase",
                  activeStep === step.number ? "text-purple-200" : "text-zinc-700"
                )}>
                  {step.title}
                </h3>
                <p className={cn(
                  "text-2xl font-light leading-relaxed capitalize",
                  activeStep === step.number ? "text-purple-200" : "text-zinc-600"
                )}>
                  {step.description}
                </p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
