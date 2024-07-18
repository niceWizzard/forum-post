import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "lucia";
import { trpc } from "@/app/_trpc/client";
import { useEffect, useState } from "react";
import { setNotifictionAsRead } from "@/server/db/actions/notification";
import { toast } from "sonner";

export default function NotificationsButton({
  user,
  isLoading,
}: {
  user: User | null;
  isLoading: boolean;
}) {
  const { data: notifications, refetch: refetchNotifications } =
    trpc.getNotifications.useQuery(undefined, {
      initialData: null,
      refetchInterval: 10000,
    });
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (
      isOpen &&
      notifications &&
      notifications &&
      notifications.unreadCount > 0
    ) {
      (async () => {
        console.log("FETCHING");
        const res = await setNotifictionAsRead();
        if (res.error) {
          console.error(res.message);
          toast.error("An error has occurred", {
            description: res.message,
          });
          return;
        }
        refetchNotifications();
      })();
    }
  }, [isOpen, notifications, refetchNotifications]);
  if (isLoading || !user || notifications == null) return null;
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        Notifications{" "}
        {notifications.unreadCount > 0 && `(${notifications.unreadCount})`}
      </PopoverTrigger>
      <PopoverContent>
        <div>
          {notifications.notifications.map((v) => (
            <div key={v.id}>
              {String(!!v.readAt)}
              {v.message}
            </div>
          ))}
          {notifications.notifications.length == 0 && (
            <span>No notifications.</span>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
