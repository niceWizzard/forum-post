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
import { deleteAdmin } from "@/server/db/actions/forum";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loadingButton";
import { useState } from "react";
import { ForumAdmin } from "@/server/db/schema/types";

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
  const { data: forumAdmins, refetch: refetchAdmins } =
    trpc.getForumAdmins.useQuery(forumId, {
      initialData: [],
    });
  return (
    <>
      <h3>Admins</h3>
      <div className="flex flex-col gap-3 border-b border-foreground-lighter py-4">
        {forumAdmins.map((v) => (
          <AdminView
            key={v.id}
            admin={v}
            refetchAdmins={refetchAdmins}
            forumId={forumId}
          />
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

function AdminView({
  admin,
  refetchAdmins,
  forumId,
}: {
  admin: ForumAdmin;
  refetchAdmins: () => void;
  forumId: string;
}) {
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);

  return (
    <div className="flex gap-2 text-sm  px-3 py-2 rounded-md hover:bg-card cursor-pointer items-center">
      <span className="capitalize text-green-400 px-3 py-2 border border-current rounded-md">
        {admin.status}
      </span>
      <div className="flex flex-grow items-center flex-wrap gap-2">
        <Link
          href={`/profile/${admin.id}`}
          className="text-primary font-light "
          target="_blank"
        >
          #{admin.username}
        </Link>
        <span className="font-light flex-grow">{admin.name}</span>
      </div>
      <LoadingButton
        className="p-2 size-fit"
        variant="destructive"
        onClick={async () => {
          setIsDeletingAdmin(true);
          const res = await deleteAdmin(admin.id, forumId);
          setIsDeletingAdmin(false);
          if (res.error) {
            console.error(res.message);
            toast.error("An error occurred while deleting the admin", {
              description: res.message,
            });
            return;
          }
          toast.success("Admin deleted successfully", {
            description: "Admin removed from forum",
          });
          refetchAdmins();
        }}
        isLoading={isDeletingAdmin}
        loadingText=""
      >
        <TrashIcon size={12} />
      </LoadingButton>
    </div>
  );
}
