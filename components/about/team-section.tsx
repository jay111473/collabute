import Image from "next/image";
import React from "react";

const TeamSection = () => {
  return (
    <section className="w-full relative">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-12">
          <div className="space-y-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              The Team
            </h2>

            {/* Team Photo */}
            <div className="relative group w-full flex justify-center">
              <div className="aspect-[16/9] w-[700px] rounded-xl overflow-hidden border border-white/10">
                <Image
                  src="/about-us.jpg"
                  alt="Team members"
                  width={500}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
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
        </div>
      </div>
    </section>
  );
};

export default TeamSection; 