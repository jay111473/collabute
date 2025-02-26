"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@/types/dashboard";
import { Plus, Zap, X } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AccountSettingsProps {
  user: User;
}

type Skill = {
  skill?: string | null;
  id?: string | null;
};

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [skills, setSkills] = useState<Skill[]>(user.developerFields?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddSkill = () => {
    if (newSkill && !skills?.some(s => s.skill === newSkill)) {
      setSkills([...skills, { skill: newSkill, id: Date.now().toString() }]);
      setNewSkill("");
      setIsDialogOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    setSkills(skills.filter((skill) => skill.id !== skillId));
  };

  const handleSaveChanges = () => {
    // TODO: Implement save changes functionality
    console.log("Saving changes...");
  };

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-xl">Account Settings</h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">First name</label>
          <Input
            defaultValue={user.name}
            className="border border-grayBorders bg-transparent text-white h-12 px-4 rounded"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400">Email</label>
        <Input
          defaultValue={user.email}
          className="border border-grayBorders bg-transparent text-white h-12 px-4 rounded"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400">Account type</label>
        <div className="border border-grayBorders bg-transparent h-12 px-4 rounded flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary2" />
          <span className="text-white">
            {user.type === "developer" ? "Developer" : "Startup"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400">Skill set</label>
        <div className="flex flex-wrap items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border border-grayBorders bg-transparent text-white hover:bg-[#1C1C1C] h-10 px-4 rounded-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add more
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-darkGray border-grayBorders">
              <DialogHeader>
                <DialogTitle className="text-white">Add Skill</DialogTitle>
              </DialogHeader>
              <div className="flex gap-2 mt-4">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter skill name"
                  className="border border-grayBorders bg-transparent text-white h-12 px-4 rounded"
                />
                <Button
                  onClick={handleAddSkill}
                  className="bg-primary2 text-white hover:bg-primary2/90"
                >
                  Add
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {skills?.map((skillItem) => (
            <div
              key={skillItem.id}
              className="bg-[#1C1C1C] text-white px-4 py-2 rounded-full text-sm"
            >
              {skillItem.skill}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveChanges}
          className="bg-primary2 text-white hover:bg-primary2/90 h-11 px-6 rounded"
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
