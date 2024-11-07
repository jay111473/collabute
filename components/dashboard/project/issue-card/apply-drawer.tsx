"use client"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Issue } from "@/types/dashboard"
import { useState } from "react"

interface ApplyDrawerProps {
  issue: Issue;
  onApply: (issueId: string) => void;
}

export function ApplyDrawer({ issue, onApply }: ApplyDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation()
    onApply(issue.id)
    setIsOpen(false)
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          className="text-primary border-primary hover:text-white hover:border-primary hover:bg-primary py-2"
        >
          Apply
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Apply for Issue</DrawerTitle>
            <DrawerDescription>
              You are applying for: {issue.title}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            {/* Add your application form content here */}
            <p className="text-sm text-gray-500">
              Budget: ${issue.budget}
            </p>
          </div>
          <DrawerFooter>
            <Button onClick={handleApply}>Submit Application</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 