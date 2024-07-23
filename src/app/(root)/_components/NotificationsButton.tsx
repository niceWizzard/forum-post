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
import Link from "next/link";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { MailIcon } from "lucide-react";

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
      <PopoverTrigger className="flex gap-2">
        <MailIcon />
        {notifications.unreadCount > 0 && `(${notifications.unreadCount})`}
      </PopoverTrigger>
      <PopoverContent>
        <div>
          {notifications.notifications.map((v) => (
            <Link key={v.id} href={v.linkTo ?? "#"}>
              <div
                dangerouslySetInnerHTML={{ __html: v.message }}
                className={cn(
                  clsx({
                    "bg-card": !v.readAt,
                  }),
                  "px-4 py-2 hover:bg-card"
                )}
              ></div>
            </Link>
          ))}
          {notifications.notifications.length === 0 && (
            <span>No notifications.</span>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
