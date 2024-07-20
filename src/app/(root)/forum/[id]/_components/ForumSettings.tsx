"use client";

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
import { deleteForum } from "@/server/db/actions/forum";
import { Forum } from "@/server/db/schema/types";
import { useUserStore } from "@/store/userStore";
import { User } from "lucia";
import { Settings } from "lucide-react";
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
            {(forum.isOwner || forum.isAdmin) && <AssignAdminDialog />}
          </SignedIn>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const mockUsers: User[] = [
  { id: "1", name: "John doe", email: "johndoe@gmail.com", username: "Johnny" },
  { id: "2", name: "Jane Doe", email: "janedoe@gmail.com", username: "Jane" },
  {
    id: "3",
    name: "Michael Doe",
    email: "michaeldoe@gmail.com",
    username: "Michael",
  },
  {
    id: "4",
    name: "Janeth doe",
    email: "jennethdoe@gmail.com",
    username: "Janeth",
  },
  { id: "5", name: "Alex Doe", email: "alexdoe@gmail.com", username: "Alex" },
  { id: "6", name: "Tom Doe", email: "tomdoe@gmail.com", username: "Tom" },
  {
    id: "7",
    name: "Sarah Doe",
    email: "sarahdoe@gmail.com",
    username: "Sarah",
  },
  {
    id: "8",
    name: "David Doe",
    email: "daviddoe@gmail.com",
    username: "David",
  },
  { id: "9", name: "Sam smith", email: "sam@gmail.com", username: "Sammy" },
  { id: "10", name: "Lisa Doe", email: "lisa@gmail.com", username: "Lisa" },
  { id: "11", name: "Rose Doe", email: "rose@gmail.com", username: "Rose" },
  { id: "12", name: "Emily Doe", email: "emily@gmail.com", username: "Emily" },
];

function AssignAdminDialog() {
  const [search, setSearch] = useState("");
  const onSearch = useDebouncedCallback(
    (v: React.ChangeEvent<HTMLInputElement>) => {
      const value = v.target.value.trim();
      setSearch(value);
    },
    300
  );
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const filteredUsers = useMemo(() => {
    if (!search) return [];
    return mockUsers.filter(
      (u) =>
        !selectedUsers.find((v) => v.id == u.id) &&
        u.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, selectedUsers]);
  function onSearchSelect(u: User) {
    setSelectedUsers((v) => [...v, u]);
  }
  return (
    <Dialog>
      <DialogTrigger>Assign an admin.</DialogTrigger>
      <DialogContent className="max-h-[90vh] min-h-[70vh]">
        <DialogHeader>
          <DialogTitle>Assign an Admin</DialogTitle>
          <div className="flex flex-col gap-4 min-h-full">
            <div className="flex flex-col gap-3 max-h-48 overflow-y-auto">
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
            />
            <Button>Assign as admins</Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function SearchResults({
  search,
  filteredUsers,
  onSearchSelect,
}: {
  search: string;
  filteredUsers: User[];
  onSearchSelect: (v: User) => void;
}) {
  const firstRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-col p-4 flex-grow gap-3 max-h-[30vh] overflow-y-auto ">
      {filteredUsers.map((user, index) => (
        <Button
          key={user.id}
          variant="ghost"
          className="border border-foreground-lighter"
          onClick={() => onSearchSelect(user)}
        >
          <span className="text-left w-full text-foreground-light">
            <span className="font-light text-primary"> #{user.username}</span> -{" "}
            {user.name}
          </span>
        </Button>
      ))}
      {search && filteredUsers.length === 0 && (
        <div className="text-center text-sm font-light text-foreground-lighter">
          No users found matching the search criteria.
        </div>
      )}
      {!search && (
        <span className="text-foreground-light font-light">
          Type a username into the search bar.
        </span>
      )}
    </div>
  );
}
