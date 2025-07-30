import AIBadge from "@/components/uikit/ai-badge";
import Image from "next/image";
import React from "react";

const AboutUsComponent = () => {
  return (
    <div className="w-full mt-24 space-y-32">
      {/* Original Hero Section */}
      <section className="w-full relative">
        <div className="container px-4 md:px-6 flex flex-col items-center">
          <div className="relative w-full h-[600px] flex flex-col items-center">
            {/* Image as background */}
            <div className="absolute inset-0 w-full h-full z-0 top-10">
              <Image
                src="/about-us-hero.png"
                alt="Pyramid visual"
                className="w-full h-full object-cover"
                objectFit="cover"
                layout="fill"
              />
            </div>

            {/* Text overlay positioned at top 1/3 */}
            <div className="flex flex-col items-center text-center z-10 relative ">
              <AIBadge text="About us" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                A New Way to Build{" "}
                <span className="text-purple-400">Together</span>
              </h2>
            </div>

            {/* Quote at the bottom */}
            <p className="text-white text-xl text-center mt-auto mb-6 z-10">
              &ldquo; When People Gather They Build The Greatests &rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="w-full relative">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div className="space-y-6">
              <AIBadge text="Story" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                We&apos;ve all felt it—that{" "}
                <span className="text-purple-400">disconnect</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Founders chasing their next big idea. Developers looking for
                  something that actually matters. And somehow, both sides still
                  feel stuck. Too many forms, too much noise, and not enough
                  real connection.
                </p>
                <p>
                  That&apos;s why we started Collabute. To bring builders and
                  dreamers into the same room. To create a space where startups
                  find people who care, and developers find projects worth
                  showing up for.
                </p>
              </div>
              <div className="bg-darkGray/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">
                  This isn&apos;t just another platform.
                </p>
                <p className="text-white text-lg font-semibold">
                  It&apos;s a new way of working—with meaning, with people, and
                  with purpose.
                </p>
              </div>
            </div>

            {/* Right - Brain Illustration */}
            <div className="relative h-[500px] flex items-center justify-center">
              <Image
                src="/brain-illustration.png"
                alt="Connected brain network"
                width={400}
                height={400}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="w-full relative">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - 3D Purple Shape */}
            <div className="relative h-[500px] flex items-center justify-center">
              <div className="w-full h-full bg-darkGray rounded-2xl flex items-center justify-center">
                <Image
                  src="/purple-3d-shape.png"
                  alt="3D purple ribbon shape"
                  width={400}
                  height={400}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Right - Text Content */}
            <div className="space-y-6">
              <AIBadge text="The journey" />
              <h2 className="text-3xl md:text-4xl font-bold text-purple-400">
                Why We&apos;re Here
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                The journey of creation has become fragmented. Startups
                tirelessly search for the right talent, while developers seek
                projects that ignite their passion. This disconnect stifles
                innovation and dampens the spirit of collaboration. We
                envisioned a space where these paths converge seamlessly.
              </p>
              <div className="bg-darkGray/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <p className="text-white text-lg font-semibold">
                  Collabute exists to bridge this gap, fostering an environment
                  where meaningful partnerships are formed, and groundbreaking
                  projects come to life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="w-full relative">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-8">
            {/* Spotlight Graphic */}
            <div className="relative h-[300px] flex items-center justify-center">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-purple-500/20 to-transparent rounded-full blur-xl"></div>
              <div className="relative z-10">
                <AIBadge text="Vision" />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white">
              The <span className="text-purple-400">Landscape</span>
            </h2>

            <div className="max-w-4xl mx-auto space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                Success is defined by collaboration and shared vision. The
                nature of work is changing—people want freedom, purpose, and the
                chance to build something meaningful. Startups need partners,
                not just employees. Developers want to be part of something
                bigger than themselves.
              </p>
              <p>
                We&apos;re building a world where trust and contributions matter
                more than titles and contracts. Where the best ideas win,
                regardless of where they come from. Where every connection has
                the potential to change the world.
              </p>
            </div>

            <div className="bg-darkGray/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-2xl mx-auto">
              <p className="text-white text-xl font-semibold text-center">
                Success is defined by the strength of collaborations
              </p>
              <p className="text-white text-xl font-semibold text-center">
                and the shared vision of its participants
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="w-full relative">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Circular Graphic */}
            <div className="relative h-[500px] flex items-center justify-center">
              <Image
                src="/circular-approach-shapes.png"
                alt="Circular approach graphic"
                width={400}
                height={400}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Right - Text Content */}
            <div className="space-y-6">
              <AIBadge text="Mindset" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Our <span className="text-purple-400">Approach</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                At Collabute, we prioritize quality and authenticity. Our
                platform is designed to ensure that every collaboration is
                meaningful and impactful. We believe in:
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="text-purple-400 font-semibold">
                      Seamless Connections:
                    </span>
                    <span className="text-gray-300">
                      {" "}
                      Effortlessly linking startups with developers who share
                      their vision.
                    </span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="text-purple-400 font-semibold">
                      Transparent Processes:
                    </span>
                    <span className="text-gray-300">
                      {" "}
                      Cultivating trust through open communication and clear
                      expectations.
                    </span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="text-purple-400 font-semibold">
                      Celebrating Contributions:
                    </span>
                    <span className="text-gray-300">
                      {" "}
                      Recognizing and rewarding the dedication and expertise
                      each member brings to the table.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full relative">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-12">
            <div className="space-y-6">
              <div className="flex justify-center">
                <AIBadge text="Story" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                The Team
              </h2>
              <div className="max-w-4xl mx-auto space-y-6 text-gray-300 text-lg leading-relaxed">
                <p>
                  We&apos;re a small team with big hearts—and zero interest in
                  doing things the &quot;usual&quot; way. Some of us write code,
                  some design pixels, some make sure the whole thing
                  doesn&apos;t crash—but all of us are here to flip the script
                  on how things get built.
                </p>
                <p>
                  We&apos;re not into fancy titles or corporate layers. We talk
                  like humans, work like a crew, and celebrate the small wins
                  just as much as the big ones.
                </p>
                <p>
                  We&apos;re not here to follow the rules—we&apos;re here to
                  make better ones. And if you ever want to jam with us, throw
                  ideas our way, or just say hey, our door&apos;s wide open.
                </p>
              </div>
            </div>

            {/* Team Photos */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="relative group">
                <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src="/team-member-1.png"
                    alt="Team member 1"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="relative group">
                <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src="/team-member-2.png"
                    alt="Team member 2"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="relative group">
                <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src="/team-member-3.png"
                    alt="Team member 3"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsComponent;
