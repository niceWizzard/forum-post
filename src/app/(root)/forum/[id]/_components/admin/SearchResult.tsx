import { Button } from "@/components/ui/button";
import { User } from "@/server/db/schema/types";
import { Loader2 } from "lucide-react";

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
};
