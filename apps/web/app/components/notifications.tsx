import { BellIcon, InboxIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";

const notifications = [
  {
    id: 1,
    title: "새가족 등록",
    description: "송지아님이 새가족으로 등록되었습니다.",
    time: "5분 전",
  },
  {
    id: 2,
    title: "목장 모임 알림",
    description: "사랑 목장 모임이 내일 오후 2시에 있습니다.",
    time: "1시간 전",
  },
  {
    id: 3,
    title: "출석 보고",
    description: "이번 주 주일예배 출석률이 85%입니다.",
    time: "3시간 전",
  },
  {
    id: 4,
    title: "생일 알림",
    description: "이영희님의 생일이 이틀 남았습니다.",
    time: "오늘",
  },
  {
    id: 5,
    title: "목장 배정 완료",
    description: "김민수님이 은혜 목장에 배정되었습니다.",
    time: "어제",
  },
  {
    id: 6,
    title: "주일예배 안내",
    description: "이번 주일 특별찬양이 예정되어 있습니다.",
    time: "어제",
  },
  {
    id: 7,
    title: "교육부 알림",
    description: "주일학교 교사 모임이 토요일 오전 10시에 있습니다.",
    time: "2일 전",
  },
  {
    id: 8,
    title: "기도 요청",
    description: "박준호님이 기도 요청을 등록하셨습니다.",
    time: "2일 전",
  },
  {
    id: 9,
    title: "행사 등록",
    description: "부활절 특별예배가 일정에 추가되었습니다.",
    time: "3일 전",
  },
  {
    id: 10,
    title: "목자 보고서",
    description: "이번 주 목장 보고서 제출 마감일입니다.",
    time: "3일 전",
  },
];

export function Notifications() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="size-4" />
          {notifications.length > 0 && (
            <span className="bg-destructive absolute -top-0.5 -right-0.5 size-2 rounded-full" />
          )}
          <span className="sr-only">알림</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>알림</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          <ScrollArea className="max-h-80">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 py-3"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium">{notification.title}</span>
                  <span className="text-muted-foreground text-xs">{notification.time}</span>
                </div>
                <span className="text-muted-foreground text-xs">{notification.description}</span>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        ) : (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>알림이 없습니다</EmptyTitle>
              <EmptyDescription>새로운 알림이 오면 여기에 표시됩니다.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
