"use client";

import Image from "next/image";
import Link from "next/link";
import { FaDiscord, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-800 bg-background py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="Collabute"
            width={32}
            height={32}
            className="mr-2"
          />
          <span className="text-white text-xl font-bold">Collabute</span>
        </div>

        {/* Legal Links */}
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/terms"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Terms & Conditions
          </Link>
          <Link
            href="/privacy"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Privacy Policy
          </Link>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          <Link
            href="https://x.com/collabute"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors opacity-60 hover:opacity-100"
          >
            <Image src="/twitterx.png" alt="X" width={20} height={20} />
          </Link>
          <Link
            href="https://discord.gg/7q3BBpEvwP"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaDiscord size={20} />
          </Link>
          <Link
            href="https://github.com/muperdev/collabute"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaGithub size={20} />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
