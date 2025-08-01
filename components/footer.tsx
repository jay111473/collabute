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

type FooterColumnProps = {
  title: string;
  links: Array<FooterLinkProps>;
};

const FooterColumn = ({ title, links }: FooterColumnProps) => (
  <div>
    <h3 className="text-white text-lg font-medium mb-4">{title}</h3>
    <div className="flex flex-col space-y-3">
      {links.map((link) => (
        <FooterLink key={link.href} href={link.href} label={link.label} />
      ))}
    </div>
  </div>
);

const SocialLink = ({
  href,
  icon: Icon,
}: {
  href: string;
  icon: React.ComponentType<{ size: number }>;
}) => (
  <Link href={href} className="text-gray-400 hover:text-white">
    <Icon size={20} />
  </Link>
);

const FooterBackgroundEffects = () => (
  <>
    {/* Base dark background */}
    <div className="absolute inset-0 z-0 footer-base-bg" />

    {/* Starry background with top-focused mask */}
    <div className="absolute inset-0 z-0 footer-starry-bg" />

    {/* Top radial gradient for purple glow - brightened but still purple */}
    <div className="absolute inset-0 z-0 footer-purple-glow" />

    {/* Additional purple accent at the very top - brightened but still purple */}
    <div className="absolute top-0 left-0 right-0 h-[120px] z-0 footer-top-accent" />

    {/* Dark vignette effect around the edges */}
    <div className="absolute inset-0 z-0 footer-vignette" />
  </>
);

const Footer = () => {
  const socialLinks = [
    { href: "https://twitter.com", icon: FaTwitter },
    { href: "https://linkedin.com", icon: FaLinkedin },
    { href: "https://instagram.com", icon: FaInstagram },
    { href: "https://discord.com", icon: FaDiscord },
  ];

  const footerColumns = [
    {
      title: "Products",
      links: [
        { href: "/about-us", label: "About Us" },
        { href: "/contact-us", label: "Contact Us" },
        { href: "/terms-of-service", label: "Terms of Service" },
      ],
    },
    {
      title: "Support",
      links: [
        { href: "/docs", label: "Docs" },
        { href: "/feedbacks", label: "Feedbacks" },
      ],
    },
  ];

  return (
    <footer className="w-screen bg-black pt-16 mx-0 px-0">
      <div className=" z-10 w-full footer-container">
        <div className="relative footer-content w-full">
          <FooterBackgroundEffects />

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
            <Link
              href="/contact"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Navigation columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16">
            {footerColumns.map((column) => (
              <FooterColumn
                key={column.title}
                title={column.title}
                links={column.links}
              />
            ))}
          </div>
        </div>

        {/* Copyright - moved to bottom */}
        <div className="text-center py-4 mt-16">
          <p className="text-gray-500">
            © Collabute 2025. ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
