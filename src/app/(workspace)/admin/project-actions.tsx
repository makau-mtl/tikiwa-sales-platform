"use client";

import Link from "next/link";
import { useRef } from "react";
import { MoreHorizontal } from "lucide-react";
import { deleteProject, toggleProjectPublication } from "./actions";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescriptionText,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitleText,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
} from "@/components/ui";

export function ProjectActions({
  projectId,
  projectName,
  isPublished,
}: {
  projectId: string;
  projectName: string;
  isPublished: boolean;
}) {
  const publishForm = useRef<HTMLFormElement>(null);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${projectName}`}>
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/admin/projects/${projectId}`}>View project</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/projects/${projectId}#details-heading`}>Edit project</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => publishForm.current?.requestSubmit()}>
            {isPublished ? "Unpublish project" : "Publish project"}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/inventory/${projectId}/import`}>Import plots</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/projects/${projectId}/media`}>Manage media</Link>
          </DropdownMenuItem>
          <div className="my-1 h-px bg-[#e8ede9]" />
          <Dialog>
            <DropdownMenuItem asChild>
              <DialogTrigger className="w-full text-left text-[#9a4032] focus:bg-[#fff2ef]">
                Delete project
              </DialogTrigger>
            </DropdownMenuItem>
            <DialogContent>
              <DialogHeader>
                <DialogTitleText>Delete {projectName}?</DialogTitleText>
                <DialogDescriptionText>
                  This permanently removes the project and its associated inventory. Type the project name to confirm.
                </DialogDescriptionText>
              </DialogHeader>
              <form action={deleteProject} className="space-y-4">
                <input type="hidden" name="project_id" value={projectId} />
                <Label className="block">
                  Project name
                  <Input className="mt-1.5" name="confirm_name" autoComplete="off" required />
                </Label>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" variant="destructive">Delete project</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>

      <form ref={publishForm} action={toggleProjectPublication} className="sr-only">
        <input type="hidden" name="project_id" value={projectId} />
        <input type="hidden" name="return_to" value="/admin" />
      </form>
    </div>
  );
}