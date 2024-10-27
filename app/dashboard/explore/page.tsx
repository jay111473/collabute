"use client";
import { useTheme } from "next-themes";
import React from "react";
import { ExploreComponent } from "./components/explore";
import { CircleUser } from "lucide-react";
import { Button } from "@/components/ui/button";

const Explore = () => {
  const { setTheme } = useTheme();
  return (
    <>
      <ExploreComponent />
    </>
  );
};

export default Explore;
