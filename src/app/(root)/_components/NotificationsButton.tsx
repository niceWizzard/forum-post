"use client";

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
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
      notifications.unreadCount > 0
    ) {
      (async () => {
        const res = await setNotifictionAsRead();
        if (res.error) {
          console.error(res.message);
          toast.error("Failed to mark notifications as read", {
            description: res.message,
          });
          return;
        }
        refetchNotifications();
      })();
    }
  }, [isOpen, notifications, refetchNotifications]);

  if (isLoading || !user || notifications == null) return null;

  const unreadCount = notifications.unreadCount || 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg border border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 ? (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          ) : (
            <span className="flex items-center text-xs text-muted-foreground gap-1">
              <CheckCheck className="h-3 w-3" /> All read
            </span>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-border">
          {notifications.notifications.map((v) => (
            <Link
              key={v.id}
              href={v.linkTo ?? "#"}
              onClick={() => setIsOpen(false)}
              className="block"
            >
              <div
                className={`px-4 py-3 text-xs transition-colors hover:bg-muted/60 ${
                  !v.readAt ? "bg-muted/30 font-medium" : "text-muted-foreground"
                }`}
                dangerouslySetInnerHTML={{ __html: v.message }}
              />
            </Link>
          ))}
          {notifications.notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Inbox className="h-8 w-8 mb-2 stroke-1 opacity-50" />
              <p className="text-xs font-normal">No notifications yet</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
