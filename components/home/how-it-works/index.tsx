'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import AIBadge from '@/components/uikit/ai-badge'

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

const textVariants: Variants = {
  hidden: {
    opacity: 0.15,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    }
  },
}

const letterVariants: Variants = {
  hidden: { opacity: 0.15 },
  visible: { 
    opacity: 1,
  },
}

function ScrollLetter({ 
  char, 
  index, 
  total, 
  parentRef,
}: { 
  char: string
  index: number
  total: number
  parentRef: React.RefObject<HTMLDivElement>
}) {
  const { scrollYProgress } = useScroll({
    target: parentRef,
    offset: ["start end", "center center"]
  })

  const opacity = useTransform(
    scrollYProgress,
    [
      Math.max(0, index / total),
      Math.min(1, (index + 1) / total)
    ],
    [0.15, 1]
  )

  return (
    <motion.span
      style={{ 
        opacity,
        marginRight: char === " " ? "0.25em" : "0em"
      }}
      className="inline-block"
    >
      {char}
    </motion.span>
  )
}

function ScrollAnimatedText({ 
  text, 
  className, 
}: { 
  text: string
  className: string
}) {
  const textRef = useRef<HTMLDivElement>(null)
  const characters = text.split("")

  return (
    <motion.div
      ref={textRef}
      className={className}
    >
      {characters.map((char, index) => (
        <ScrollLetter 
          key={index}
          char={char}
          index={index}
          total={characters.length}
          parentRef={textRef}
        />
      ))}
    </motion.div>
  ) 
}

function FadeInText({ 
  text, 
  className,
  isVisible
}: { 
  text: string
  className: string
  isVisible: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0.15 }}
      animate={{ opacity: isVisible ? 1 : 0.6 }}
      transition={{ duration: 0.7 }}
      className={className}
    >
      {text}
    </motion.div>
  )
}

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
    <section ref={sectionRef} className="relative min-h-screen">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-32">
          <div className="flex justify-center">
            <AIBadge text="How it works" />
          </div>
          <h2 className="text-[36px] font-bold mb-6">
            <span className="text-darkPrimary">
              Collaboration
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
              <div className="space-y-5">
                <div className={cn(
                  "text-zinc-600 text-sm font-medium",
                  activeStep === step.number ? "text-purple-200" : "text-zinc-700"
                )}>
                  Step {step.number}
                </div>
                <ScrollAnimatedText 
                  text={step.title}
                  className={cn(
                    "text-4xl font-bold tracking-tight uppercase",
                    activeStep === step.number ? "text-purple-200" : "text-zinc-700"
                  )}
                />
                <FadeInText 
                  text={step.description}
                  className={cn(
                    "text-2xl font-light leading-relaxed capitalize",
                    activeStep === step.number ? "text-purple-200" : "text-zinc-600"
                  )}
                  isVisible={activeStep === step.number}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
