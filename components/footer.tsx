"use client";

import Image from "next/image";
import Link from "next/link";
import { FaTwitter, FaLinkedin, FaInstagram, FaDiscord } from "react-icons/fa";

type FooterLinkProps = {
  href: string;
  label: string;
};

const FooterLink = ({ href, label }: FooterLinkProps) => (
  <Link
    href={href}
    className="text-gray-400 hover:text-white transition-colors duration-200"
  >
    {label}
  </Link>
);

const Footer = () => {
  return (
    <footer className="w-full relative overflow-hidden bg-black py-16">
      <div className="relative z-10 mx-auto" style={{ maxWidth: "1440px" }}>
        <div
          className="relative mx-auto"
          style={{
            height: "511px",
            padding: "60px 121px",
            borderRadius: "12px 0px 0px 12px",
            borderTop: "1px solid rgba(198, 157, 248, 0.20)",
            borderBottom: "1px solid rgba(198, 157, 248, 0.20)",
            borderLeft: "1px solid rgba(198, 157, 248, 0.20)",
            backgroundColor: "#0A0A14",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Base dark background */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(180deg, #141432 0%, #080814 40%, #000000 100%)",
            }}
          />

          {/* Starry background with top-focused mask */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url('/starry-background.png')`,
              backgroundRepeat: "repeat",
              backgroundSize: "400px 400px",
              opacity: 0.25,
              mixBlendMode: "screen",
              mask: "radial-gradient(120% 70% at 50% 0%, white 0%, rgba(255, 255, 255, 0.7) 10%, rgba(255, 255, 255, 0.3) 30%, transparent 60%)",
              WebkitMask:
                "radial-gradient(120% 70% at 50% 0%, white 0%, rgba(255, 255, 255, 0.7) 10%, rgba(255, 255, 255, 0.3) 30%, transparent 60%)",
            }}
          />

          {/* Top radial gradient for purple glow */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `radial-gradient(120% 80% at 50% 0%, rgba(198, 157, 248, 0.5) 0%, rgba(198, 157, 248, 0.25) 20%, rgba(198, 157, 248, 0.05) 40%, rgba(17, 23, 61, 0.00) 60%)`,
              mixBlendMode: "screen",
            }}
          />

          {/* Additional purple accent at the very top */}
          <div
            className="absolute top-0 left-0 right-0 h-[120px] z-0"
            style={{
              background: `linear-gradient(to bottom, rgba(198, 157, 248, 0.25) 0%, rgba(198, 157, 248, 0.05) 70%, transparent 100%)`,
              mixBlendMode: "screen",
            }}
          />

          {/* Dark vignette effect around the edges */}
          <div
            className="absolute inset-0 z-0"
            style={{
              boxShadow: "inset 0 0 200px 100px rgba(0, 0, 0, 0.9)",
              pointerEvents: "none",
            }}
          />

          {/* Content container */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Top section with logo, social links and navigation */}
            <div
              className="flex flex-col md:flex-row justify-between"
              style={{ gap: "90px" }}
            >
              {/* Logo and social links */}
              <div className="mb-8 md:mb-0">
                <div className="flex items-center mb-6">
                  <Image
                    src="/logo.svg"
                    alt="Collabute"
                    width={48}
                    height={48}
                    className="mr-2"
                  />
                  <span className="text-white text-2xl font-bold">
                    Collabute
                  </span>
                </div>

                <div className="flex space-x-6">
                  <Link
                    href="https://twitter.com"
                    className="text-gray-400 hover:text-white"
                  >
                    <FaTwitter size={20} />
                  </Link>
                  <Link
                    href="https://linkedin.com"
                    className="text-gray-400 hover:text-white"
                  >
                    <FaLinkedin size={20} />
                  </Link>
                  <Link
                    href="https://instagram.com"
                    className="text-gray-400 hover:text-white"
                  >
                    <FaInstagram size={20} />
                  </Link>
                  <Link
                    href="https://discord.com"
                    className="text-gray-400 hover:text-white"
                  >
                    <FaDiscord size={20} />
                  </Link>
                </div>
              </div>

              {/* Navigation columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
                {/* Products column */}
                <div>
                  <h3 className="text-white text-lg font-medium mb-4">
                    Products
                  </h3>
                  <div className="flex flex-col space-y-3">
                    <FooterLink href="/lending" label="Lending" />
                    <FooterLink href="/borrowing" label="Borrowing" />
                    <FooterLink href="/markets" label="Markets" />
                  </div>
                </div>

                {/* Tools column */}
                <div>
                  <h3 className="text-white text-lg font-medium mb-4">Tools</h3>
                  <div className="flex flex-col space-y-3">
                    <FooterLink href="/tokens" label="Tokens" />
                    <FooterLink href="/convert" label="Convert" />
                    <FooterLink
                      href="/explore-traders"
                      label="Explore Traders"
                    />
                    <FooterLink href="/pricing" label="Pricing" />
                  </div>
                </div>

                {/* Support column */}
                <div>
                  <h3 className="text-white text-lg font-medium mb-4">
                    Support
                  </h3>
                  <div className="flex flex-col space-y-3">
                    <FooterLink
                      href="/beginners-guide"
                      label="Beginners Guide"
                    />
                    <FooterLink href="/help-center" label="Help Center" />
                    <FooterLink href="/feedbacks" label="Feedbacks" />
                    <FooterLink href="/api-doc" label="API Doc" />
                  </div>
                </div>
              </div>
            </div>

            {/* Copyright - centered vertically and horizontally */}
            <div className="mt-auto mb-auto text-center">
              <p className="text-gray-500">
                © Collabute 2024. ALL RIGHTS RESERVED
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
