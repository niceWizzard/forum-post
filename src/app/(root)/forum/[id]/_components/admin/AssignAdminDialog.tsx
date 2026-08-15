import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AssignAdminForm } from "./AssignAdminForm";
import { trpc } from "@/app/_trpc/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Trash2, UserCheck } from "lucide-react";
import { deleteAdmin } from "@/server/db/actions/forum";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loadingButton";
import { useState } from "react";
import { ForumAdmin } from "@/server/db/schema/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function AssignAdminDialog({ forumId }: { forumId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs font-normal gap-2 h-8"
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Manage Moderators</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg border-border">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-lg font-bold">Community Moderators</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Assign or remove moderators for this community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <CurrentAdmins forumId={forumId} />
          <Separator />
          <AssignAdminForm forumId={forumId} />
        </div>
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
    <div className="space-y-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Current Admins
      </span>
      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
        {forumAdmins.map((v) => (
          <AdminView
            key={v.id}
            admin={v}
            refetchAdmins={refetchAdmins}
            forumId={forumId}
          />
        ))}
        {forumAdmins.length === 0 && (
          <p className="text-xs text-muted-foreground py-2 text-center">
            No appointed moderators yet.
          </p>
        )}
      </div>
    </div>
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
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-border bg-card text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        <Link
          href={`/profile/${admin.id}`}
          className="font-medium text-foreground hover:underline truncate"
          target="_blank"
        >
          @{admin.username}
        </Link>
        <span className="text-muted-foreground truncate hidden sm:inline">
          ({admin.name})
        </span>
        <Badge
          variant={admin.status === "accepted" ? "secondary" : "outline"}
          className="text-[10px] capitalize ml-1 font-normal"
        >
          {admin.status}
        </Badge>
      </div>

      <LoadingButton
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
        onClick={async () => {
          setIsDeletingAdmin(true);
          const res = await deleteAdmin(admin.id, forumId);
          setIsDeletingAdmin(false);
          if (res.error) {
            toast.error("Could not remove admin", {
              description: res.message,
            });
            return;
          }
          toast.success("Admin removed");
          refetchAdmins();
        }}
        isLoading={isDeletingAdmin}
        loadingText=""
      >
        <Trash2 className="h-3.5 w-3.5" />
      </LoadingButton>
    </div>
  );
}
