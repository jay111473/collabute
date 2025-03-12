'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import AIBadge from '@/components/uikit/ai-badge'
import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "How does Collabute ensure fair compensation?",
    answer: "Developers are paid based on their actual contributions, tracked through GitHub activities, ensuring transparency and fairness."
  },
  {
    question: "How does the GitHub integration work?",
    answer: "Collabute seamlessly integrates with GitHub for version control, task management, and real-time collaboration, making it easy to track contributions and manage projects."
  },
  {
    question: "What types of projects are available?",
    answer: "We offer a diverse range of projects from startups and entrepreneurs, spanning web development, mobile apps, AI/ML, blockchain, and more. You can choose projects that match your skills and interests."
  },
  {
    question: "How do I get started?",
    answer: "Simply sign up as a developer or entrepreneur, complete your profile, and start exploring projects or posting your ideas. Our AI-powered matching system will help connect you with the right opportunities or talent."
  }
]

function FAQItem({ 
  item, 
  isOpen, 
  onClick 
}: { 
  item: FAQItem
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      initial={false}
      className={cn(
        "rounded-[32px] overflow-hidden w-full text-left",
        "bg-[#0A0A0C] backdrop-blur-sm transition-all p-8",
        "hover:bg-[#0C0C0E]"
      )}
    >
      <div className="w-full flex items-center justify-between">
        <span className="text-xl font-medium text-white">{item.question}</span>
        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 0 : 0 }}
          className="flex-shrink-0 ml-4"
        >
          {isOpen ? (
            <X className="h-8 w-8 text-purple-400" />
          ) : (
            <Plus className="h-8 w-8 text-purple-400" />
          )}
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-6 text-gray-400 text-base">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="w-full relative">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <AIBadge text="People asked, so we answered" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-4">
            Frequently asked <span className="text-purple-400">Questions</span>
          </h2>
          <p className="text-gray-400 mt-6 max-w-2xl text-base">
            Your skills deserve recognition and fair compensation. Collabute integrates seamlessly with GitHub,
            allowing you to contribute effectively and earn based on your contributions.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              item={faq}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ 