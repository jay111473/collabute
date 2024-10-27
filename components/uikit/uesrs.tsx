import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Users as UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  users: Array<{ src: string; label: string }>;
};

const bgs = [
  "bg-green-200",
  "bg-red-200",
  "bg-yellow-200",
  "bg-orange-200",
  "bg-purple-200",
  "bg-blue-200",
];

export const Users: React.FC<Props> = ({ users }) => {
  return (
    <span className="flex border border-gray-400 px-2 py-1 rounded-full gap-2 items-center pr-5">
      <UsersIcon />
      <span className="text-sm font-bold">{users?.length}</span>
      <span className="flex">
        {users?.map((user, index) => {
          return (
            <span key={index} className="-mr-5">
              <Avatar className="flex items-center">
                <AvatarImage src={user?.src} />
                <AvatarFallback
                  className={cn(bgs[index % bgs?.length], "w-8 h-8")}
                >
                  {user?.label?.slice(0, 2)?.toUpperCase?.()}
                </AvatarFallback>
              </Avatar>
            </span>
          );
        })}
      </span>
    </span>
  );
};
