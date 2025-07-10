import { ProjectInfo } from "@/components/wizard/project-info";
import { ProjectTimeline } from "@/components/wizard/project-timeline";
import { ProjectLeader } from "@/components/wizard/project-leader";
import { IndustryCompetitors } from "@/components/wizard/industry-competitors";
import { BusinessComparison } from "@/components/wizard/business-comparison";
import { TrackTasksGenerator } from "@/components/wizard/track-tasks-generator";
import ProjectTracks from "@/components/wizard/project-tracks";
import { TpmDetails } from "@/components/wizard/tpm-details";
import { StepIntroduction } from "@/components/wizard/step-introduction";
import {
  WizardData,
  Industry,
  Competitor,
  ProjectTrack,
  GeneratedProject,
  ProjectType
} from "@/types/wizard";

interface WizardStepRendererProps {
  currentStep: number;
  wizardData: WizardData;
  isLoading: boolean;
  canProceed: boolean;
  suggestedIndustries: Industry[];
  suggestedCompetitors: Competitor[];
  suggestedTracks: ProjectTrack[];
  userid: string;
  token: string;
  hasBookedMeeting: boolean;
  onNext: () => void;
  onProjectTypeChange: (type: ProjectType) => void;
  onProjectInfoChange: (info: any) => void;

  onProjectsChange: (projects: GeneratedProject[]) => void;
  onTracksChange: (tracks: ProjectTrack[]) => void;
  onLeaderChange: (leader: any) => void;
  onGitHubImport: (repository: any) => void;
  onBookMeeting: () => void;
  onRetryBusinessComparison?: () => void;
  onRetryFeatureComparison?: () => void;
}

export function WizardStepRenderer({
  currentStep,
  wizardData,
  isLoading,
  canProceed,
  suggestedIndustries,
  suggestedTracks,
  hasBookedMeeting,
  onNext,
  onProjectInfoChange,
  onProjectsChange,
  onTracksChange,
  onLeaderChange,
  onBookMeeting,
  onRetryBusinessComparison,
  onRetryFeatureComparison,
}: WizardStepRendererProps) {
  switch (currentStep) {
    case 0:
      return (
        <div className="col-span-2">
          <ProjectInfo
            onProjectInfoChange={onProjectInfoChange}
            onNext={onNext}
            canProceed={canProceed}
            isLoading={isLoading}
            suggestedIndustries={suggestedIndustries}
          />
        </div>
      );

    case 1:
      return (
        <div className="col-span-2 space-y-6">
          <StepIntroduction step={currentStep} />
          <BusinessComparison
            isLoading={isLoading}
            comparisonData={wizardData.businessComparison || undefined}
            onRetry={onRetryBusinessComparison}
          />
        </div>
      );

    case 2:
      return (
        <div className="col-span-2 space-y-6">
          <StepIntroduction step={currentStep} />
          <IndustryCompetitors
            isLoading={isLoading}
            comparisonData={wizardData.featureComparison || undefined}
            onRetry={onRetryFeatureComparison}
          />
        </div>
      );

    case 3:
      return (
        <div className="col-span-2 space-y-6">
          <StepIntroduction step={currentStep} />
          <ProjectTracks
            onTracksChange={onTracksChange}
            isLoading={isLoading}
            suggestedTracks={suggestedTracks}
          />
        </div>
      );

    case 4:
      return (
        <div className="col-span-2 space-y-6">
          <StepIntroduction step={currentStep} />
          <TrackTasksGenerator
            projectInfo={wizardData.projectInfo!}
            tracks={wizardData.tracks}
            competitors={wizardData.competitors}
            businessComparison={wizardData.businessComparison}
            isLoading={isLoading}
            onTasksGenerated={(tasks) => {
              // Handle the generated tasks - you can add this to wizard data if needed
              console.log("Generated track tasks:", tasks);
            }}
          />
        </div>
      );

    case 5:
      return (
        <div className="col-span-2 space-y-6">
          <StepIntroduction step={currentStep} />
          <ProjectLeader
            onLeaderChange={onLeaderChange}
            selectedLeader={wizardData.leader}
          />
        </div>
      );

    case 6:
      return (
        <div className="col-span-2 space-y-6">
          <StepIntroduction step={currentStep} />
          {wizardData.leader ? (
            <TpmDetails
              selectedLeader={wizardData.leader}
              onBookMeeting={onBookMeeting}
              hasBookedMeeting={hasBookedMeeting}
            />
          ) : (
            <div className="text-center text-white">
              No Technical Product Manager selected
            </div>
          )}
        </div>
      );

    case 7:
      return (
        <div className="col-span-2 space-y-6">
          <StepIntroduction step={currentStep} />
          <ProjectTimeline
            features={wizardData.projects}
            onFeaturesChange={onProjectsChange}
          />
        </div>
      );

    default:
      return null;
  }
}
