"use client";

import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loadingButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SignedIn from "@/components/utils/SignedIn";
import { useEffectUpdate } from "@/lib/utils";
import { assignAdmin, deleteForum } from "@/server/db/actions/forum";
import { Forum, User } from "@/server/db/schema/types";
import { useUserStore } from "@/store/userStore";
import { Loader2, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

export default function ForumSettings({ forum }: { forum: Forum }) {
  const user = useUserStore((v) => v.user);
  const [isDeletingForum, setisDeletingForum] = useState(false);
  const router = useRouter();
  if (!user || (!forum.isOwner && !forum.isAdmin)) return null;

  async function onDeleteForum() {
    setisDeletingForum(true);
    const res = await deleteForum(forum.id);
    setisDeletingForum(false);
    if (res.error) {
      toast.error("An error occurred while deleting the forum", {
        description: res.message,
      });
      return;
    }
    toast.success("Forum deleted successfully", {
      description: "Your forum has been deleted",
    });
    router.push("/feed");
  }
  return (
    <Popover>
      <PopoverTrigger>
        <Settings />
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <SignedIn>
            {forum.isOwner && (
              <LoadingButton
                isLoading={isDeletingForum}
                loadingText="Deleting..."
                onClick={onDeleteForum}
              >
                Delete forum
              </LoadingButton>
            )}
            {(forum.isOwner || forum.isAdmin) && (
              <AssignAdminDialog forumId={forum.id} />
            )}
          </SignedIn>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AssignAdminDialog({ forumId }: { forumId: string }) {
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

function AssignAdminForm({ forumId }: { forumId: string }) {
  const [search, setSearch] = useState("");
  const onSearch = useDebouncedCallback(
    (v: React.ChangeEvent<HTMLInputElement>) => {
      const value = v.target.value.trim();
      setSearch(value);
      value &&
        setTimeout(() => {
          refetch();
        }, 10);
    },
    300
  );
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const {
    data: searchedUsers,
    refetch,
    isFetching,
  } = trpc.searchUsername.useQuery(
    { username: search },
    {
      initialData: [],
      enabled: false,
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!search) return [];
    return searchedUsers.filter(
      (u) =>
        !selectedUsers.find((v) => v.id == u.id) &&
        u.username!.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, searchedUsers, selectedUsers]);

  function onSearchSelect(u: User) {
    setSelectedUsers((v) => [...v, u]);
  }

  async function onAssign() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const res = await assignAdmin(
      forumId,
      selectedUsers.map((v) => v.id)
    );
    setIsSubmitting(false);
    if (res.error) {
      console.error(res);
      toast.error("An error occurred while assigning admins", {
        description: res.message,
      });
      return;
    }
    setSelectedUsers([]);
    toast.success("Admins successfully assigned.");
  }
  return (
    <>
      <div className="flex flex-col gap-3 overflow-y-auto flex-grow max-h-52">
        <h4>Selected users</h4>
        {selectedUsers.map((v) => (
          <div key={v.id} className="flex justify-between items-center">
            <span>{v.username}</span>
            <Button
              onClick={() =>
                setSelectedUsers(
                  selectedUsers.filter((selected) => selected.id !== v.id)
                )
              }
            >
              Remove
            </Button>
          </div>
        ))}
        {selectedUsers.length === 0 && (
          <span className="font-light text-sm  text-foreground-light">
            No selected users.
          </span>
        )}
      </div>
      <Input placeholder="Search a username..." onChange={onSearch} />
      <SearchResults
        search={search}
        filteredUsers={filteredUsers}
        onSearchSelect={onSearchSelect}
        isFetching={isFetching}
      />
      <LoadingButton
        isLoading={isSubmitting}
        loadingText="Assigning..."
        onClick={onAssign}
      >
        Assign as admins
      </LoadingButton>
    </>
  );
}

function SearchResults({
  search,
  filteredUsers,
  onSearchSelect,
  isFetching,
}: {
  search: string;
  filteredUsers: User[];
  isFetching: boolean;
  onSearchSelect: (v: User) => void;
}) {
  return (
    <div className="flex flex-col p-4 flex-grow gap-3 max-h-[30vh] overflow-y-auto text-center">
      {isFetching && (
        <span className="inline-flex gap-2 justify-center items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Searching...
        </span>
      )}
      {!isFetching &&
        filteredUsers.map((user, index) => (
          <Button
            key={user.id}
            variant="ghost"
            className="border border-foreground-lighter"
            onClick={() => onSearchSelect(user)}
          >
            <span className="text-left w-full text-foreground-light">
              <span className="font-light text-primary"> #{user.username}</span>{" "}
              - {user.name}
            </span>
          </Button>
        ))}
      {!isFetching && search && filteredUsers.length === 0 && (
        <div className="text-center text-sm font-light text-foreground-lighter">
          No users found matching the search criteria.
        </div>
      )}
      {!isFetching && !search && (
        <span className="text-foreground-light font-light">
          Type a username into the search bar.
        </span>
      )}
    </div>
  );
}
