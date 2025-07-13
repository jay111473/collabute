"use client";

import { useEffect, useState } from "react";
import { FaTwitter, FaDiscord, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("July 30, 2025 12:00:00").getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto text-white">
      {/* Slogan */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center mb-4">
          <Image src="/logo.png" alt="Collabute Logo" width={80} height={80} />
        </div>
        <h2 className="text-xs sm:text-sm uppercase tracking-widest text-gray-300 mb-3">
          Coming Soon
        </h2>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-2">
          BUILD NOW
        </h1>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          &amp; FOREVER
        </h1>
      </motion.div>

      {/* Countdown */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-7 items-center text-center gap-0 mb-16"
      >
        {/* Days */}
        <div className="col-span-1 flex flex-col items-center">
          <div className="min-w-[70px] sm:min-w-[100px] md:min-w-[110px]">
            <span className="text-3xl sm:text-5xl md:text-6xl font-bold">
              {timeLeft.days.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest mt-3">
            days
          </span>
        </div>

        {/* Colon */}
        <div className="col-span-1 flex flex-col items-center self-start pt-2 sm:pt-3 md:pt-5">
          <span className="text-2xl sm:text-4xl md:text-5xl font-medium">
            :
          </span>
        </div>

        {/* Hours */}
        <div className="col-span-1 flex flex-col items-center">
          <div className="min-w-[70px] sm:min-w-[100px] md:min-w-[110px]">
            <span className="text-3xl sm:text-5xl md:text-6xl font-bold">
              {timeLeft.hours.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest mt-3">
            hours
          </span>
        </div>

        {/* Colon */}
        <div className="col-span-1 flex flex-col items-center self-start pt-2 sm:pt-3 md:pt-5">
          <span className="text-2xl sm:text-4xl md:text-5xl font-medium">
            :
          </span>
        </div>

        {/* Minutes */}
        <div className="col-span-1 flex flex-col items-center">
          <div className="min-w-[70px] sm:min-w-[100px] md:min-w-[110px]">
            <span className="text-3xl sm:text-5xl md:text-6xl font-bold">
              {timeLeft.minutes.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest mt-3">
            minutes
          </span>
        </div>

        {/* Colon */}
        <div className="col-span-1 flex flex-col items-center self-start pt-2 sm:pt-3 md:pt-5">
          <span className="text-2xl sm:text-4xl md:text-5xl font-medium">
            :
          </span>
        </div>

        {/* Seconds */}
        <div className="col-span-1 flex flex-col items-center">
          <div className="min-w-[70px] sm:min-w-[100px] md:min-w-[110px]">
            <span className="text-3xl sm:text-5xl md:text-6xl font-bold">
              {timeLeft.seconds.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest mt-3">
            seconds
          </span>
        </div>
      </motion.div>

      {/* Call to action button */}
      <Link href="/early-bird">
        <motion.button
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-3 mb-16 px-12 py-3 border border-white hover:bg-white hover:text-black transition-colors duration-300 uppercase tracking-widest text-xs"
        >
          Register for Early Access
        </motion.button>
      </Link>

      {/* Social media icons */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex space-x-7 mt-1 mb-8"
      >
        <Link
          href="https://x.com/collabute"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-gray-300 transition-colors duration-300"
        >
          <Image src="/twitterx.png" alt="X" width={28} height={28} />
        </Link>
        <Link
          href="https://discord.gg/3PUyPGF2"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-gray-300 transition-colors duration-300"
        >
          <FaDiscord size={28} />
        </Link>
        <Link
          href="https://github.com/muperdev/collabute"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-gray-300 transition-colors duration-300"
        >
          <FaGithub size={28} />
        </Link>
      </motion.div>
    </div>
  );
};

export default CountdownTimer;
