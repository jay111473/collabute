"use client";

import AIBadge from "@/components/uikit/ai-badge";
import { Button } from "@/components/ui/button";
import { Mail, Twitter } from "lucide-react";
import React from "react";

const ContactComponent = () => {
  const handleEmailContact = () => {
    window.open("mailto:team@collabute.com");
  };

  const handleTwitterContact = () => {
    window.open("https://twitter.com/collabute", "_blank");
  };

  return (
    <div className="w-full mt-16 sm:mt-20 md:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-background">
      {/* Hero Section */}
      <section className="w-full min-h-[30vh] relative flex items-center">
        <div className="container px-0 relative z-10">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              Get in Touch
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Have questions about Collabute? We&apos;re here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="w-full relative py-8 sm:py-12">
        <div className="container px-0">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email Contact */}
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-darkPrimary rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Email Us
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Send us an email directly
                  </p>
                  <div className="space-y-2">
                    <p className="text-darkPrimary font-semibold text-base sm:text-lg">
                      team@collabute.com
                    </p>
                    <Button
                      onClick={handleEmailContact}
                      className="bg-darkPrimary hover:bg-darkPrimary/90 text-white px-6 py-2"
                    >
                      Send Email
                    </Button>
                  </div>
                </div>
              </div>

              {/* Twitter/X Contact */}
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-darkPrimary rounded-full flex items-center justify-center mx-auto">
                  <Twitter className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Follow on X
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Connect with us on social media
                  </p>
                  <div className="space-y-2">
                    <p className="text-darkPrimary font-semibold text-base sm:text-lg">
                      @collabute
                    </p>
                    <Button
                      onClick={handleTwitterContact}
                      variant="outline"
                      className="border-white/20 hover:border-darkPrimary text-white hover:text-darkPrimary px-6 py-2"
                    >
                      Follow on X
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                We typically respond within 24 hours during business days.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactComponent;
