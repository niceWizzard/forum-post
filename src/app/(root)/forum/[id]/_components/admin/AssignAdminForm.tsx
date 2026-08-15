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
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";

export function AssignAdminForm({ forumId }: { forumId: string }) {
  const [search, setSearch] = useState("");
  const onSearch = useDebouncedCallback(
    (v: React.ChangeEvent<HTMLInputElement>) => {
      const value = v.target.value.trim();
      setSearch(value);
      if (value) {
        setTimeout(() => {
          refetch();
        }, 10);
      }
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
        !selectedUsers.find((v) => v.id === u.id) &&
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
      toast.error("Could not assign admins", {
        description: res.message,
      });
      return;
    }
    setSelectedUsers([]);
    utils.getForumAdmins.refetch(forumId);
    refetch();
    toast.success("Moderation invitations sent successfully");
  }

  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Invite New Moderator
      </span>

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-border bg-muted/40">
          {selectedUsers.map((v) => (
            <Badge
              key={v.id}
              variant="secondary"
              className="gap-1 text-xs pr-1 font-normal"
            >
              <span>@{v.username}</span>
              <button
                type="button"
                onClick={() =>
                  setSelectedUsers(
                    selectedUsers.filter((selected) => selected.id !== v.id)
                  )
                }
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search user by username..."
          className="pl-8 text-xs"
          onChange={onSearch}
        />
      </div>

      <SearchResults
        search={search}
        filteredUsers={filteredUsers}
        onSearchSelect={onSearchSelect}
        isFetching={isFetching}
      />

      <div className="flex justify-end pt-2">
        <LoadingButton
          size="sm"
          disabled={selectedUsers.length === 0}
          isLoading={isSubmitting}
          loadingText="Inviting..."
          onClick={onAssign}
        >
          Send Invitations ({selectedUsers.length})
        </LoadingButton>
      </div>
    </div>
  );
}
