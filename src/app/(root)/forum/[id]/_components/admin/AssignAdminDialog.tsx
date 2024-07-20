import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AssignAdminForm } from "./AssignAdminForm";

export function AssignAdminDialog({ forumId }: { forumId: string }) {
  return (
    <Dialog>
      <DialogTrigger>Assign an admin.</DialogTrigger>
      <DialogContent className="min-h-[70vh]">
        <DialogHeader>
          <DialogTitle>Assign an Admin</DialogTitle>
          <div className="flex flex-col gap-4 h-full">
            <AssignAdminForm forumId={forumId} />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
