import Header from "@/components/header";
import Feature from "@/components/home/feature";
import EarlyBirdForm from "@/components/home/early-bird";
import Hero from "@/components/home/hero";
import About from "@/components/home/about";
import Developers from "@/components/home/developers";
import HowItWorks from "@/components/home/how-it-works";

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center px-2 py-8 lg:px-24 lg:py-4 h-full font-sans gap-y-24 bg-[#09090b]">
        <div className="fixed -top-[1px] left-1/2 -translate-x-1/2 w-[800px] h-[90px] bg-gradient-to-r from-transparent via-[#c99dfe]/25 to-transparent z-20" />
        <Header />
        <Hero />
        <Feature />
        <About />
        <Developers />
        <HowItWorks />
      </main>
    </>
  );
}
