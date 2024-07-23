import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loadingButton";
import { assignAdmin } from "@/server/db/actions/forum";
import { User } from "@/server/db/schema/types";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { SearchResults } from "./SearchResult";

export function AssignAdminForm({ forumId }: { forumId: string }) {
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
  const utils = trpc.useUtils();

  const {
    data: searchedUsers,
    refetch,
    isFetching,
  } = trpc.searchUsername.useQuery(
    { username: search, forumId },
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
    if (isSubmitting || selectedUsers.length === 0) return;
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
    utils.getForumAdmins.refetch(forumId);
    refetch();
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
