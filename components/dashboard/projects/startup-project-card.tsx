import { Card, CardContent } from "@/components/ui/card";
import { Lead, Media, Project, User } from "@/types/dashboard";
import { GitPullRequest, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Type guard function to safely check if a value is a User object
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "email" in value &&
    typeof (value as any).id === "number" &&
    typeof (value as any).name === "string" &&
    typeof (value as any).email === "string"
  );
}

interface ProjectCardProps {
  project: Project;
}

const ProjectHeader = ({
  title,
  issuesCount,
  description,
}: {
  title: string;
  issuesCount: number;
  description: string;
}) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-medium text-white">{title}</h2>
      <Badge variant="outline" className="text-white text-xs" icon={<GitPullRequest className="w-4 h-4 text-darkPrimary" />}>
        {issuesCount} Issues
      </Badge>
    </div>
    <p className="text-[#666666] text-sm">{description}</p>
  </div>
);

const ProjectLead = ({ lead }: { lead: Lead }) => (
  <div className="flex items-center gap-3">
    <Avatar className="h-10 w-10">
      <AvatarImage
        src={(lead?.profilePicture as Media)?.url || ""}
        alt={lead?.name}
      />
      <AvatarFallback>{lead?.name?.[0]}</AvatarFallback>
    </Avatar>
    <div>
      <h3 className="text-white text-sm">{lead?.name}</h3>
      <p className="text-[#666666] text-xs">Project lead</p>
    </div>
  </div>
);

const CircularProgress = ({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) => {
  const percentage = (completed / total) * 100;
  return (
    <div className="relative w-[100px] h-[100px]">
      <svg className="w-full h-full -rotate-90">
        <circle
          className="text-[#1C1C1C] stroke-current"
          strokeWidth="8"
          fill="none"
          r="42"
          cx="50"
          cy="50"
        />
        <circle
          className="text-[#8B5CF6] stroke-current"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          r="42"
          cx="50"
          cy="50"
          style={{
            strokeDasharray: `${2 * Math.PI * 42}`,
            strokeDashoffset: `${2 * Math.PI * 42 * (1 - percentage / 100)}`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-medium text-white">{completed}</span>
        <span className="text-[#666666] text-sm">/{total}</span>
      </div>
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[#666666] text-sm">
        Issues
      </div>
    </div>
  );
};

const CollaboratorsSection = ({
  count,
  collabuters,
}: {
  count: number;
  collabuters: any[];
}) => (
  <div className="w-full flex justify-between items-center">
    <h3 className="text-[#666666] text-sm">Collabuters</h3>
    <div className="flex items-center gap-2 bg-[#1C1C1C] px-2.5 py-1.5 rounded-xl">
      <Users className="h-4 w-4 text-[#666666]" />
      <span className="text-white text-sm">{count}</span>
      <div className="flex -space-x-2 ml-1.5">
        {collabuters?.slice(0, 5).map((item, i) => {
          const collaboratorUser = item?.collabuter;
          const userName = isUser(collaboratorUser) ? collaboratorUser.name : "U";
          const userProfilePicture = isUser(collaboratorUser) ? collaboratorUser.profilePicture : null;
          const profilePictureUrl = userProfilePicture && typeof userProfilePicture === 'object' && 'url' in userProfilePicture ? userProfilePicture.url : "";
          
          return (
            <Avatar key={i} className="h-6 w-6 border-2 border-[#1C1C1C]">
              <AvatarImage 
                src={profilePictureUrl || ""} 
                alt={userName}
              />
              <AvatarFallback>
                {userName[0]}
              </AvatarFallback>
            </Avatar>
          );
        })}
        {count > 5 && (
          <div className="h-6 w-6 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center text-xs border-2 border-[#1C1C1C]">
            +{count - 5}
          </div>
        )}
      </div>
    </div>
  </div>
);

export const StartupProjectCard = ({ project }: ProjectCardProps) => {
  const { title, issues, description, slug, lead, collabuters } = project;

  return (
    <div>
      <Card className="bg-darkGray border-none rounded-lg transition-colors">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-4">
              <ProjectHeader
                title={title}
                issuesCount={issues?.length || 0}
                description={description}
              />
              <ProjectLead lead={lead as Lead} />
            </div>
            <CircularProgress completed={issues?.length || 0} total={24} />
          </div>

          <CollaboratorsSection
            count={collabuters?.length || 0}
            collabuters={collabuters || []}
          />

          <Button
            className="w-full h-10 bg-primary/40 dark:bg-primary/40 dark:hover:bg-primary/90 hover:bg-primary/90 text-white text-sm rounded-lg"
            variant="default"
          >
            Track progress
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
