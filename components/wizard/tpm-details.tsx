import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPinIcon,
  CalendarIcon,
  GithubIcon,
  StarIcon,
  CodeIcon,
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  VideoIcon,
} from "lucide-react";
import { Lead } from "@/types/wizard";

interface TpmDetailsProps {
  selectedLeader: Lead;
  onBookMeeting: () => void;
  hasBookedMeeting?: boolean;
}

export function TpmDetails({
  selectedLeader,
  onBookMeeting,
  hasBookedMeeting = false,
}: TpmDetailsProps) {
  const formatJoinedDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getSkillsArray = () => {
    // Try to get skills from projectManagerFields stack first
    // if (selectedLeader.projectManagerFields?.stack) {
    //   return selectedLeader.projectManagerFields.stack
    //     .map((tech) => tech.name)
    //     .slice(0, 8);
    // }
    // Fallback to developerFields skills
    if (selectedLeader.developerFields?.skills) {
      return selectedLeader.developerFields.skills
        .map((skill) => skill.skill)
        .slice(0, 8);
    }
    return [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Project Management",
    ];
  };

  const getExperience = () => {
    return (
      selectedLeader.projectManagerFields?.professionalPMExperience ||
      selectedLeader.developerFields?.experience ||
      3
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
          <h2 className="text-2xl font-semibold text-white">
            Your Technical Product Manager
          </h2>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
          Great choice! Here&apos;s detailed information about your selected
          Technical Product Manager. You can book a meeting to discuss your
          project requirements and get started.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <Card className="bg-[#1a1a1a] border-zinc-800 p-8">
            <CardContent className="p-0 space-y-8">
              {/* Header Section */}
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24 rounded-full border-4 border-white/10">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${selectedLeader.name || selectedLeader.email}.png`}
                    alt={selectedLeader.name || "Project Manager"}
                    className="rounded-full"
                  />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {selectedLeader.name || "Project Manager"}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-2 bg-zinc-800/50 px-4 py-2 rounded-full">
                      <CodeIcon className="h-5 w-5 text-white/60" />
                      <span className="text-white/80 font-medium">
                        Technical Product Manager
                      </span>
                    </div>
                  </div>
                  {/* {selectedLeader.projectManagerFields?.availability ===
                    "available" && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      Available Now
                    </Badge>
                  )} */}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-3 gap-6 py-6 border-y border-zinc-800">
                <div className="flex items-center gap-3 text-white/60">
                  <MapPinIcon className="h-5 w-5" />
                  <div>
                    <div className="text-xs text-white/40">Location</div>
                    <div className="text-white">
                      {selectedLeader.country || "United States"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <CalendarIcon className="h-5 w-5" />
                  <div>
                    <div className="text-xs text-white/40">Joined</div>
                    <div className="text-white">
                      {formatJoinedDate(selectedLeader._creationTime)}
                    </div>
                  </div>
                </div>
                {selectedLeader.githubProfile?.githubUsername && (
                  <div className="flex items-center gap-3 text-white/60">
                    <GithubIcon className="h-5 w-5" />
                    <div>
                      <div className="text-xs text-white/40">GitHub</div>
                      <div className="text-white">
                        @{selectedLeader.githubProfile.githubUsername}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {selectedLeader.projectsManaged || 0}
                  </div>
                  <div className="text-sm text-white/60 flex items-center justify-center gap-1">
                    <BriefcaseIcon className="h-4 w-4" />
                    Projects Managed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    +{getExperience()}
                  </div>
                  <div className="text-sm text-white/60 flex items-center justify-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    Years Experience
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <StarIcon className="h-8 w-8 text-purple-400 fill-current" />
                    <span className="text-4xl font-bold text-purple-400">
                      4.9
                    </span>
                  </div>
                  <div className="text-sm text-white/60">Client Rating</div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">
                  Technical Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {getSkillsArray().map((skill: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-zinc-800/50 text-white/80 border-zinc-700 px-3 py-1"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Industry Experience */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">
                  Industry Experience
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedLeader.industry
                    ? [selectedLeader.industry, "Technology", "SaaS"]
                    : ["Technology", "SaaS", "E-commerce"]
                  )
                    .slice(0, 5)
                    .map((industry, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-darkPrimary/10 text-darkPrimary border-darkPrimary/20 px-3 py-1"
                      >
                        {industry}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Book Meeting Card */}
          <Card className="bg-gradient-to-br from-darkPrimary/20 to-purple-600/20 border-darkPrimary/30 p-6">
            <CardContent className="p-0 space-y-4">
              <div className="text-center space-y-2">
                {hasBookedMeeting ? (
                  <CheckCircleIcon className="h-12 w-12 text-emerald-400 mx-auto" />
                ) : (
                  <VideoIcon className="h-12 w-12 text-darkPrimary mx-auto" />
                )}
                <h4 className="text-xl font-semibold text-white">
                  {hasBookedMeeting
                    ? "Meeting Scheduled!"
                    : "Ready to Get Started?"}
                </h4>
                <p className="text-sm text-white/70">
                  {hasBookedMeeting
                    ? "Great! Your discovery call has been scheduled. You can now proceed to create your project draft."
                    : "Book a 30-minute discovery call to discuss your project requirements and timeline."}
                </p>
              </div>
              <Button
                onClick={onBookMeeting}
                disabled={hasBookedMeeting}
                className={`w-full font-semibold py-3 ${
                  hasBookedMeeting
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
                    : "bg-darkPrimary hover:bg-darkPrimary/90 text-black"
                }`}
              >
                {hasBookedMeeting
                  ? `✓ Meeting Booked with ${(selectedLeader.name || "Manager").split(" ")[0]}`
                  : `Book a Meeting with ${(selectedLeader.name || "Manager").split(" ")[0]}`}
              </Button>
            </CardContent>
          </Card>

          {/* What to Expect */}
          <Card className="bg-[#1a1a1a] border-zinc-800 p-6">
            <CardContent className="p-0 space-y-4">
              <h4 className="text-lg font-semibold text-white">
                What to Expect
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white font-medium">
                      Project Discovery
                    </div>
                    <div className="text-white/60">
                      Deep dive into your requirements and goals
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white font-medium">
                      Timeline Planning
                    </div>
                    <div className="text-white/60">
                      Create realistic milestones and deliverables
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white font-medium">Team Assembly</div>
                    <div className="text-white/60">
                      Match you with the perfect development team
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white font-medium">Next Steps</div>
                    <div className="text-white/60">
                      Define immediate actions and project kickoff
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="bg-[#1a1a1a] border-zinc-800 p-6">
            <CardContent className="p-0 space-y-4">
              <h4 className="text-lg font-semibold text-white">Quick Facts</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Response Time</span>
                  <span className="text-white">Within 2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Time Zone</span>
                  <span className="text-white">EST (UTC-5)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Languages</span>
                  <span className="text-white">English, Spanish</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Availability</span>
                  <span className="text-emerald-400">Immediate Start</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
