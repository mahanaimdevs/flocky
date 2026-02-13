import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { MyCellGroup } from "@/components/dashboard/my-cell-group";
import { NewMembersList } from "@/components/dashboard/new-members-list";
import { UpcomingBirthdays } from "@/components/dashboard/upcoming-birthdays";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";

export default function Dashboard() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
        <MyCellGroup />
        <div className="grid grid-cols-1 gap-4 md:gap-6 @3xl/main:grid-cols-[1fr_2fr]">
          <UpcomingBirthdays />
          <AttendanceChart />
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-6 @3xl/main:grid-cols-[1fr_2fr]">
          <UpcomingEvents />
          <NewMembersList />
        </div>
      </div>
    </div>
  );
}
