import Header from "@/components/header";
import Feature from "@/components/home/feature";
import Hero from "@/components/home/hero";
import About from "@/components/home/about";
import Developers from "@/components/home/developers";
import HowItWorks from "@/components/home/how-it-works";
import FAQ from "@/components/home/faq";
import Footer from "@/components/footer";
import Image from "next/image";
import CountdownTimer from "@/components/home/countdown-timer";

export default async function Home() {
  return (
    <>
      <div className="relative h-full min-h-screen w-full">
        {/* Background image - Mobile (hidden on md and above) */}
        <div className="absolute inset-0 z-0 block md:hidden">
          <Image
            src="/build-now-and-forever-mobile.png"
            alt="Background"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Background image - Desktop (hidden on smaller than md) */}
        <div className="absolute inset-0 z-0 hidden md:block">
          <Image
            src="/background-coming-soon.jpg"
            alt="Background"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>

        <main className="relative z-20 flex min-h-screen min-w-screen flex-col items-center justify-center px-2 py-8 lg:px-24 lg:py-4 h-full font-sans gap-y-24 bg-transparent">
          {/* <div className="fixed -top-[1px] left-1/2 -translate-x-1/2 w-[800px] h-[90px] bg-gradient-to-r from-transparent via-[#c99dfe]/25 to-transparent z-20" /> */}
          {/* <Header isAuthenticated={isAuthenticated } />
          <Hero />
          <Feature />
          <About />
          <Developers />
          <HowItWorks />
          <FAQ /> */}

          {/* Countdown Timer */}
          <div className="w-full h-full flex items-center justify-center">
            <CountdownTimer />
          </div>
        </main>
        {/* <div className="relative z-10">
          <Footer />
        </div> */}
      </div>
    </>
  );
}
