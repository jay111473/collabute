import Feature from "@/components/home/feature";
import Hero from "@/components/home/hero";
import EarlyBirdPromo from "@/components/home/early-bird-promo";
import About from "@/components/home/about";
import Developers from "@/components/home/developers";
import HowItWorks from "@/components/home/how-it-works";
import FAQ from "@/components/home/faq";

export default async function Home() {
  return (
    <>
      <main className="flex min-h-screen min-w-screen flex-col items-center justify-center px-2 py-8 lg:px-24 lg:py-4 h-full font-sans gap-y-24 bg-background relative">
        <Hero />
        <EarlyBirdPromo />
        <Feature />
        <About />
        <Developers />
        <HowItWorks />
        <FAQ />
      </main>
    </>
  );
}
