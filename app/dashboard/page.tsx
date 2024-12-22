import { Button } from "@/components/ui/button";
import {
  CircleUser,
  DollarSign,
  ArrowLeftRight,
  GitPullRequest,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cookies } from "next/headers";
import { truncateToFourWords } from "@/lib/utils";
import { Project, Issue } from "@/types/dashboard";
import { getUser } from "@/lib/get-user";
import DashboardCard from "@/components/uikit/dashboard-card";



const ProjectsTable = ({ projects }: { projects: Project[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Last Updated</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {projects.map((project) => (
        <TableRow key={project.id}>
          <TableCell>{project.title}</TableCell>
          <TableCell>{project.status}</TableCell>
          <TableCell>
            {new Date(project.updatedAt).toLocaleDateString()}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const IssuesTable = ({ issues }: { issues: Issue[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Issue</TableHead>
        <TableHead>Priority</TableHead>
        <TableHead>Assigned To</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {issues.map((issue) => (
        <TableRow key={issue.id}>
          <TableCell className="max-w-xs">
            <span className="block truncate" title={issue.title}>
              {truncateToFourWords(issue.title)}
            </span>
          </TableCell>
          <TableCell>{issue.priority}</TableCell>
          <TableCell>{issue.assignee?.name}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const Dashboard = async () => {
  const token = (await cookies()).get("token")?.value;
  const userId = (await cookies()).get("userid")?.value;
  const user = await getUser(userId || "", token || "");
  if (!token || !userId) {
    window.location.href = "/auth/login";
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-14 justify-between items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <h3 className="text-lg">Dashboard</h3>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-opacity-50"
        >
          <CircleUser className="h-5 w-5" />
        </Button>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
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
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectsTable projects={user.projects as Project[]} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <IssuesTable issues={user.developerFields?.issues as Issue[]} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
