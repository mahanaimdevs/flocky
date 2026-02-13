import { format, getDay, parse, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale/ko";
import { CalendarDaysIcon, ClockIcon, MapPinIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type Event, type View } from "react-big-calendar";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { ko },
});

type ChurchEvent = Event & {
  id: string;
  color: string;
  description?: string;
  location?: string;
};

const events: ChurchEvent[] = [
  {
    id: "1",
    title: "주일예배",
    start: new Date(2026, 1, 15, 11, 0),
    end: new Date(2026, 1, 15, 12, 30),
    color: "#3b82f6",
    description: "주일 오전 예배",
    location: "본당",
  },
  {
    id: "2",
    title: "새가족 환영회",
    start: new Date(2026, 1, 16, 13, 0),
    end: new Date(2026, 1, 16, 15, 0),
    color: "#3b82f6",
    description: "새가족을 위한 환영 및 교제 시간",
    location: "친교실",
  },
  {
    id: "3",
    title: "수요예배",
    start: new Date(2026, 1, 18, 19, 30),
    end: new Date(2026, 1, 18, 21, 0),
    color: "#6366f1",
    description: "수요일 저녁 예배",
    location: "본당",
  },
  {
    id: "4",
    title: "청년부 MT",
    start: new Date(2026, 1, 22, 9, 0),
    end: new Date(2026, 1, 23, 17, 0),
    color: "#22c55e",
    description: "청년부 수련회 및 친교",
    location: "양평 수련원",
  },
  {
    id: "5",
    title: "주일예배",
    start: new Date(2026, 1, 22, 11, 0),
    end: new Date(2026, 1, 22, 12, 30),
    color: "#3b82f6",
    description: "주일 오전 예배",
    location: "본당",
  },
  {
    id: "6",
    title: "목장 모임",
    start: new Date(2026, 1, 27, 19, 0),
    end: new Date(2026, 1, 27, 21, 0),
    color: "#f59e0b",
    description: "각 목장별 소그룹 모임",
    location: "각 가정",
  },
  {
    id: "7",
    title: "찬양의 밤",
    start: new Date(2026, 2, 1, 19, 0),
    end: new Date(2026, 2, 1, 21, 30),
    color: "#a855f7",
    description: "특별 찬양 예배 및 기도회",
    location: "본당",
  },
  {
    id: "8",
    title: "주일예배",
    start: new Date(2026, 2, 1, 11, 0),
    end: new Date(2026, 2, 1, 12, 30),
    color: "#3b82f6",
    description: "주일 오전 예배",
    location: "본당",
  },
  {
    id: "9",
    title: "교회 창립기념일",
    start: new Date(2026, 2, 8, 10, 0),
    end: new Date(2026, 2, 8, 15, 0),
    color: "#f97316",
    description: "교회 창립 기념 감사예배 및 축하 행사",
    location: "본당 및 친교실",
  },
  {
    id: "10",
    title: "봄 수련회",
    start: new Date(2026, 2, 14, 9, 0),
    end: new Date(2026, 2, 15, 17, 0),
    color: "#14b8a6",
    description: "전교인 봄 수련회",
    location: "속초 수련원",
  },
  {
    id: "11",
    title: "새벽기도회",
    start: new Date(2026, 2, 16, 5, 30),
    end: new Date(2026, 2, 20, 6, 30),
    color: "#ec4899",
    description: "특별 새벽기도 주간",
    location: "본당",
  },
  {
    id: "12",
    title: "부활절 특별예배",
    start: new Date(2026, 3, 5, 10, 0),
    end: new Date(2026, 3, 5, 12, 30),
    color: "#ef4444",
    description: "부활절 기념 특별예배 및 세례식",
    location: "본당",
  },
  {
    id: "13",
    title: "어린이 성경학교",
    start: new Date(2026, 3, 11, 9, 0),
    end: new Date(2026, 3, 13, 15, 0),
    color: "#06b6d4",
    description: "봄 어린이 성경학교",
    location: "교육관",
  },
  {
    id: "14",
    title: "선교 보고회",
    start: new Date(2026, 3, 19, 14, 0),
    end: new Date(2026, 3, 19, 16, 0),
    color: "#84cc16",
    description: "해외 선교 보고 및 기도회",
    location: "친교실",
  },
];

function formatEventDate(date: Date) {
  return format(date, "M월 d일 (EEE)", { locale: ko });
}

function formatEventTime(start: Date, end: Date) {
  return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 14));
  const [currentView, setCurrentView] = useState<View>("month");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => (a.start as Date).getTime() - (b.start as Date).getTime()),
    [],
  );

  const upcomingEvents = useMemo(
    () => sortedEvents.filter((e) => (e.end as Date) >= new Date(2026, 1, 14)),
    [sortedEvents],
  );

  const eventPropGetter = useCallback(
    (event: ChurchEvent) => ({
      style: {
        backgroundColor: event.color,
        borderColor: event.color,
        color: "#fff",
      },
    }),
    [],
  );

  const handleSelectEvent = useCallback((event: ChurchEvent) => {
    setSelectedEventId(event.id);
  }, []);

  const handleEventListClick = useCallback(
    (event: ChurchEvent) => {
      setSelectedEventId(event.id);
      setCurrentDate(event.start as Date);
      if (currentView === "month") {
        setCurrentView("month");
      }
    },
    [currentView],
  );

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">교회 일정</h1>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 @3xl/main:grid-cols-[2fr_1fr]">
          {/* Calendar */}
          <Card className="min-h-[600px] overflow-hidden">
            <CardContent className="h-full pt-2">
              <Calendar<ChurchEvent>
                localizer={localizer}
                events={events}
                date={currentDate}
                view={currentView}
                onNavigate={handleNavigate}
                onView={handleViewChange}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventPropGetter}
                views={["month", "week", "day", "agenda"]}
                messages={{
                  today: "오늘",
                  previous: "이전",
                  next: "다음",
                  month: "월",
                  week: "주",
                  day: "일",
                  agenda: "목록",
                  date: "날짜",
                  time: "시간",
                  event: "행사",
                  noEventsInRange: "이 기간에 행사가 없습니다.",
                  showMore: (count: number) => `+${count}개 더보기`,
                }}
                style={{ height: "100%", minHeight: 560 }}
                popup
              />
            </CardContent>
          </Card>

          {/* Event List Sidebar */}
          <Card className="max-h-[700px] overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDaysIcon className="size-4" />
                다가오는 행사
              </CardTitle>
              <CardDescription>교회 행사 일정 목록</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto" style={{ maxHeight: "calc(700px - 5.5rem)" }}>
              <div className="flex flex-col gap-1 pr-1">
                {upcomingEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => handleEventListClick(event)}
                    className={`hover:bg-muted/60 flex flex-col gap-1.5 rounded-lg p-2.5 text-left transition-colors ${
                      selectedEventId === event.id
                        ? "bg-muted ring-primary/30 ring-1"
                        : "bg-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                      <span className="text-sm font-medium">{event.title as string}</span>
                    </div>
                    <div className="text-muted-foreground flex flex-col gap-0.5 pl-5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <CalendarDaysIcon className="size-3" />
                        {formatEventDate(event.start as Date)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="size-3" />
                        {formatEventTime(event.start as Date, event.end as Date)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPinIcon className="size-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-muted-foreground pl-5 text-xs">{event.description}</p>
                    )}
                    {(event.end as Date).getTime() - (event.start as Date).getTime() >
                      24 * 60 * 60 * 1000 && (
                      <div className="pl-5">
                        <Badge variant="secondary" className="text-[0.6rem]">
                          다일 행사
                        </Badge>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
