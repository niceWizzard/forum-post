import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AssignAdminForm } from "./AssignAdminForm";
import { trpc } from "@/app/_trpc/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrashIcon, X } from "lucide-react";

export function AssignAdminDialog({ forumId }: { forumId: string }) {
  return (
    <Dialog>
      <DialogTrigger>Assign an admin.</DialogTrigger>
      <DialogContent className="min-h-[70vh]">
        <DialogHeader>
          <DialogTitle>Assign an Admin</DialogTitle>
          <div className="flex flex-col gap-4 h-full">
            <CurrentAdmins forumId={forumId} />
            <AssignAdminForm forumId={forumId} />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function CurrentAdmins({ forumId }: { forumId: string }) {
  const { data: forumAdmins } = trpc.getForumAdmins.useQuery(forumId, {
    initialData: [],
  });
  return (
    <>
      <h3>Admins</h3>
      <div className="flex flex-col gap-3 border-b border-foreground-lighter py-4">
        {forumAdmins.map((v) => (
          <div
            key={v.id}
            className="flex gap-2 text-sm  px-3 py-2 rounded-md hover:bg-card cursor-pointer items-center"
          >
            <span className="capitalize text-green-400 px-3 py-2 border border-current rounded-md">
              {v.status}
            </span>
            <div className="flex flex-grow items-center flex-wrap gap-2">
              <Link
                href={`/profile/${v.id}`}
                className="text-primary font-light "
                target="_blank"
              >
                #{v.username}
              </Link>
              <span className="font-light flex-grow">{v.name}</span>
            </div>
            <Button className="p-2 size-fit" variant="destructive">
              <TrashIcon size={12} />
            </Button>
          </div>
        ))}
        {forumAdmins.length == 0 && (
          <span className="text-sm font-light text-foreground-lighter text-center">
            No admins.
          </span>
        )}
      </div>
    </>
  );
}
