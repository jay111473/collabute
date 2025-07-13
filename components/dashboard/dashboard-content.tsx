"use client";

import {
  DollarSign,
  ArrowLeftRight,
  GitPullRequest,
  GitCommit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { truncateToFourWords } from "@/lib/utils";
import { Project, Issue, User } from "@/types/dashboard";
import DashboardCard from "@/components/uikit/dashboard-card";
import { RecentProjectCard } from "@/components/dashboard/projects/recent-project-card";
import FloatingBottomBar from "@/components/dashboard/floating-bottom-bar";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { VerificationAlerts } from "@/components/dashboard/verification-alerts";
import { useFloatingNav } from "@/lib/hooks/use-floating-nav";
import { useProjectsData } from "@/hooks/use-projects-data";
import { useUserData } from "@/hooks/use-user-data";
import { Button } from "@/components/ui/button";

interface DashboardContentProps {
  user: User;
}

const RecentProjectsList = ({ projects }: { projects: Project[] }) => (
  <div className="space-y-3">
    {projects.slice(0, 3).map((project) => (
      <RecentProjectCard key={project.id} project={project} />
    ))}
  </div>
);

const IssuesTable = ({ issues }: { issues: Issue[] }) => (
  <Table>
    {issues?.length === 0 && (
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="text-center py-4 text-md">
            You don&apos;t have any issues yet.
          </TableCell>
        </TableRow>
      </TableBody>
    )}
    <TableBody>
      {issues?.map((issue) => (
        <TableRow
          key={issue.id}
          className="border-white/5 bg-darkGray hover:bg-white/5 rounded-lg mx-0 p-0 flex items-center m-0"
        >
          <TableCell className="flex justify-center items-center space-x-4 py-2">
            <div className="bg-neutral-800 p-2 rounded-lg">
              <GitCommit className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-white" title={issue.title}>
                {truncateToFourWords(issue.title)}
              </span>
              <p className="text-xs text-white/60">
                {issue.description
                  ? issue.description.length > 40
                    ? issue.description.substring(0, 20) + "..."
                    : issue.description
                  : "No description"}
              </p>
            </div>
          </TableCell>

          <TableCell>
            <Badge
              className={`${
                issue.priority === "high"
                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                  : issue.priority === "medium"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : "bg-green-500/10 text-green-500 border-green-500/20"
              }`}
            >
              {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
            </Badge>
          </TableCell>
          <TableCell>
            <span className="text-sm text-white/70">
              {new Date(issue.updatedAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const DashboardContent = ({ user }: DashboardContentProps) => {
  const { 
    projects, 
    loading: projectsLoading, 
    error: projectsError,
    refetch: refetchProjects 
  } = useProjectsData({ limit: 6 });
  const { isFloatingNavEnabled } = useFloatingNav();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isLoading = projectsLoading;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close the mobile menu when switching to desktop view
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darkGray p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">Error loading projects: {projectsError}</p>
        <Button onClick={refetchProjects} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // Render floating navigation layout
  if (isFloatingNavEnabled) {
    return (
      <>
        <div className="flex flex-col h-screen bg-black">
          <Header />

          <main className="flex-1 overflow-y-auto flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 pb-24">
            {/* Verification Alerts */}
            <VerificationAlerts user={user} />
            {user.type === "developer" && (
              <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                <DashboardCard
                  title="Issues"
                  value={user.developerFields?.issues?.length || 0}
                  icon={GitPullRequest}
                  subtext="+180.1% from last month"
                />
                <DashboardCard
                  title="Balance"
                  value={`$${user.wallet}`}
                  icon={DollarSign}
                  subtext="+19% from last month"
                />
                <DashboardCard
                  title="Total Payments"
                  value={`$${user.developerFields?.totalPayment || 0}`}
                  icon={ArrowLeftRight}
                  subtext="+20.1% from last month"
                />
              </div>
            )}
            {user.type === "startup" && (
              <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-2">
                <DashboardCard
                  title="Projects"
                  value={projects.length || 0}
                  icon={GitPullRequest}
                  subtext="+180.1% from last month"
                />
                <DashboardCard
                  title="My Funds"
                  value={`$${user.wallet}`}
                  icon={DollarSign}
                  subtext="+19% from last month"
                />
              </div>
            )}
            {user.type === "developer" && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-darkGray rounded-lg border-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-white">
                      Recent projects
                    </CardTitle>
                    <button className="text-sm text-white/70 hover:text-white flex items-center gap-1">
                      Show all
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <RecentProjectsList projects={user.projects as Project[]} />
                  </CardContent>
                </Card>
                <Card className="bg-darkGray rounded-lg border-none">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Issues</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 px-2 pb-4">
                    <IssuesTable
                      issues={user.developerFields?.issues as Issue[]}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
            {user.type === "startup" && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-darkGray rounded-lg border-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-white">
                      Recent projects
                    </CardTitle>
                    <button className="text-sm text-white/70 hover:text-white flex items-center gap-1">
                      Show all
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <RecentProjectsList projects={user.projects as Project[]} />
                  </CardContent>
                </Card>
                <Card className="bg-darkGray rounded-lg border-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-white">Highlights</CardTitle>
                    <button className="text-sm text-white/70 hover:text-white flex items-center gap-1">
                      Show all
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-orange-500 font-medium">
                          Urgent
                        </span>
                        <span className="text-white">Milestone Overdue!</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center">
                            <GitPullRequest className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-white text-sm">
                            AI Video Creator Tool [milestone 1]
                          </span>
                          <div className="flex items-center gap-1 text-xs text-red-400 ml-auto">
                            <span>Overdue</span>
                            <span>2days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>

        {/* Floating Bottom Bar */}
        <FloatingBottomBar user={user} />
      </>
    );
  }

  // Render traditional sidebar layout
  return (
    <div className="flex flex-col">
      <div className="flex flex-1">
        {/* Desktop Sidebar - Visible on md+ screens */}
        <div className="hidden md:block border-r border-white/10 bg-black text-white w-1/5">
          <Sidebar user={user} />
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={cn(
            "fixed inset-0 bg-black/80 z-40 md:hidden transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Mobile Sidebar - Slides in from left */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-4/5 max-w-xs bg-black border-r border-white/10 md:hidden",
            "transform transition-transform duration-300 ease-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="logo" width={32} height={32} />
              <h1 className="text-lg font-bold text-white">Collabute</h1>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
          <div className="p-4">
            <Sidebar user={user} />
          </div>
        </div>

        <div className="flex flex-col bg-black w-full">
          <div className="relative flex items-center">
            {/* Hamburger Menu Button - Only on mobile */}
            <button
              className="md:hidden p-2 ml-4 my-3 rounded-lg bg-darkGray/80 text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <Header />
          </div>

          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {/* Verification Alerts */}
            <VerificationAlerts user={user} />
            {user.type === "developer" && (
              <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                <DashboardCard
                  title="Issues"
                  value={user.developerFields?.issues?.length || 0}
                  icon={GitPullRequest}
                  subtext="+180.1% from last month"
                />
                <DashboardCard
                  title="Balance"
                  value={`$${user.wallet}`}
                  icon={DollarSign}
                  subtext="+19% from last month"
                />
                <DashboardCard
                  title="Total Payments"
                  value={`$${user.developerFields?.totalPayment || 0}`}
                  icon={ArrowLeftRight}
                  subtext="+20.1% from last month"
                />
              </div>
            )}
            {user.type === "startup" && (
              <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-2">
                <DashboardCard
                  title="Projects"
                  value={user?.projects?.length || 0}
                  icon={GitPullRequest}
                  subtext="+180.1% from last month"
                />
                <DashboardCard
                  title="My Funds"
                  value={`$${user.wallet}`}
                  icon={DollarSign}
                  subtext="+19% from last month"
                />
              </div>
            )}
            {user.type === "developer" && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-darkGray rounded-lg border-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-white">
                      Recent projects
                    </CardTitle>
                    <button className="text-sm text-white/70 hover:text-white flex items-center gap-1">
                      Show all
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <RecentProjectsList projects={user.projects as Project[]} />
                  </CardContent>
                </Card>
                <Card className="bg-darkGray rounded-lg border-none">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Issues</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 px-2 pb-4">
                    <IssuesTable
                      issues={user.developerFields?.issues as Issue[]}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
            {user.type === "startup" && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-darkGray rounded-lg border-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-white">
                      Recent projects
                    </CardTitle>
                    <button className="text-sm text-white/70 hover:text-white flex items-center gap-1">
                      Show all
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <RecentProjectsList projects={user.projects as Project[]} />
                  </CardContent>
                </Card>
                <Card className="bg-darkGray rounded-lg border-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-white">Highlights</CardTitle>
                    <button className="text-sm text-white/70 hover:text-white flex items-center gap-1">
                      Show all
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-orange-500 font-medium">
                          Urgent
                        </span>
                        <span className="text-white">Milestone Overdue!</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center">
                            <GitPullRequest className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-white text-sm">
                            AI Video Creator Tool [milestone 1]
                          </span>
                          <div className="flex items-center gap-1 text-xs text-red-400 ml-auto">
                            <span>Overdue</span>
                            <span>2days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
