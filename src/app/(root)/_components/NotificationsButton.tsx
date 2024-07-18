import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "lucia";
import { Notification } from "../../../server/db/schema/types";
import { trpc } from "@/app/_trpc/client";

export default function NotificationsButton({
  user,
  isLoading,
}: {
  user: User | null;
  isLoading: boolean;
}) {
  const { data: notifications } = trpc.getNotifications.useQuery(undefined, {
    initialData: null,
    refetchInterval: 10,
  });
  if (isLoading || !user || notifications == null) return null;
  return (
    <Popover>
      <PopoverTrigger>Notifications</PopoverTrigger>
      <PopoverContent>
        {notifications?.map((v) => (
          <div key={v.id}>{v.message}</div>
        ))}
        {notifications.length == 0 && <span>No notifications.</span>}
      </PopoverContent>
    </Popover>
  );
}
