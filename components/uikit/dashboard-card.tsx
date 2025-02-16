import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  subtext,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  subtext?: string;
}) => {
  return (
    <Card className="relative overflow-hidden rounded-[20px] border border-white/10 bg-darkGray">
      <div className="absolute" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-darkPrimary">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-darkPrimary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtext && (
          <p className="text-xs text-white/60 mt-1">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
