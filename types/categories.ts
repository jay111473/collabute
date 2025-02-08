export interface DeveloperCategory {
  id: string;
  name: string;
  description: string;
  iconPath: string;
  examples: string[];
}

export const DEVELOPER_CATEGORIES: DeveloperCategory[] = [
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Online retail and digital marketplace solutions",
    iconPath: "/categories/ecommerce.svg",
    examples: ["Online Stores", "Marketplaces", "Digital Products"],
  },
  {
    id: "web3",
    name: "Web3 & Blockchain",
    description: "Decentralized applications and blockchain technology",
    iconPath: "/categories/web3.svg",
    examples: ["DApps", "Smart Contracts", "NFT Platforms"],
  },
  {
    id: "fintech",
    name: "FinTech",
    description: "Financial technology and digital banking solutions",
    iconPath: "/categories/fintech.svg",
    examples: ["Digital Banking", "Payment Systems", "Investment Platforms"],
  },
  {
    id: "healthtech",
    name: "HealthTech",
    description: "Healthcare and medical technology solutions",
    iconPath: "/categories/healthtech.svg",
    examples: ["Telemedicine", "Health Records", "Medical Apps"],
  },
  {
    id: "edtech",
    name: "EdTech",
    description: "Educational technology and e-learning platforms",
    iconPath: "/categories/edtech.svg",
    examples: ["Learning Platforms", "Educational Apps", "Course Management"],
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    description: "Artificial intelligence and machine learning applications",
    iconPath: "/categories/ai.svg",
    examples: ["AI Models", "ML Applications", "Data Analytics"],
  },
  {
    id: "saas",
    name: "SaaS",
    description: "Software as a Service applications",
    iconPath: "/categories/saas.svg",
    examples: ["Business Tools", "Productivity Apps", "Cloud Solutions"],
  },
  {
    id: "iot",
    name: "IoT & Connected Devices",
    description: "Internet of Things and smart device solutions",
    iconPath: "/categories/iot.svg",
    examples: ["Smart Home", "Industrial IoT", "Connected Devices"],
  },
  {
    id: "gaming",
    name: "Gaming & Entertainment",
    description: "Gaming applications and entertainment platforms",
    iconPath: "/categories/gaming.svg",
    examples: ["Game Development", "Streaming Platforms", "Virtual Reality"],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description: "Security solutions and privacy protection",
    iconPath: "/categories/security.svg",
    examples: ["Security Tools", "Privacy Solutions", "Threat Detection"],
  },
  {
    id: "devops",
    name: "DevOps & Cloud",
    description: "Development operations and cloud infrastructure",
    iconPath: "/categories/devops.svg",
    examples: ["Cloud Infrastructure", "CI/CD", "Monitoring Tools"],
  },
  {
    id: "social",
    name: "Social & Communication",
    description: "Social platforms and communication tools",
    iconPath: "/categories/social.svg",
    examples: ["Social Networks", "Messaging Apps", "Community Platforms"],
  }
]; 