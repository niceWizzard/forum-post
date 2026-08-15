import { Button } from "@/components/ui/button";
import { User } from "@/server/db/schema/types";
import { Loader2, Plus, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export const SearchResults = ({
  search,
  filteredUsers,
  onSearchSelect,
  isFetching,
}: {
  search: string;
  filteredUsers: User[];
  isFetching: boolean;
  onSearchSelect: (v: User) => void;
}) => {
  return (
    <div className="flex flex-col gap-1 max-h-40 overflow-y-auto rounded-md border border-border bg-background p-1 text-xs">
      {isFetching && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Searching members...</span>
        </div>
      )}

      {!isFetching &&
        filteredUsers.map((user) => (
          <button
            key={user.id}
            type="button"
            className="flex items-center justify-between p-2 rounded-md hover:bg-muted text-left transition-colors"
            onClick={() => onSearchSelect(user)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Avatar
                fallback={user.username || "U"}
                className="h-6 w-6 text-[10px]"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-foreground truncate">
                  @{user.username}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {user.name}
                </span>
              </div>
            </div>
            <Plus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </button>
        ))}

      {!isFetching && search && filteredUsers.length === 0 && (
        <div className="py-4 text-center text-muted-foreground text-xs">
          No matching members found.
        </div>
      )}

      {!isFetching && !search && (
        <div className="py-4 text-center text-muted-foreground text-xs">
          Type a username above to search.
        </div>
      )}
    </div>
  );
};
