import {
  CalendarIcon,
  CircleHelpIcon,
  ClipboardCheckIcon,
  HomeIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavMain, type NavMainItem } from "./nav-main";
import { NavSecondary, type NavSecondaryItem } from "./nav-secondary";
import { NavUser, type NavUserInfo } from "./nav-user";

type SidebarData = {
  user: NavUserInfo;
  navMain: NavMainItem[];
  navSecondary: NavSecondaryItem[];
};

const data: SidebarData = {
  // TODO: Get this info from auth
  user: {
    name: "안제경",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "대시보드",
      url: "/app/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "교인관리",
      icon: <UsersIcon />,
      items: [
        { title: "교인 목록", url: "#" },
        { title: "새가족", url: "#" },
      ],
    },
    {
      title: "목장",
      icon: <HomeIcon />,
      items: [
        // TODO: Replace hardcoded ID with user's cell group ID from auth
        { title: "내 목장", url: "/app/cell-groups/1" },
        { title: "목장 검색", url: "/app/cell-groups" },
      ],
    },
    {
      title: "출석",
      url: "#",
      icon: <ClipboardCheckIcon />,
    },
    {
      title: "달력",
      url: "#",
      icon: <CalendarIcon />,
    },
    {
      title: "공지사항",
      url: "#",
      icon: <MegaphoneIcon />,
    },
  ],
  navSecondary: [
    {
      title: "설정",
      url: "#",
      icon: <Settings2Icon />,
    },
    {
      title: "도움말",
      url: "#",
      icon: <CircleHelpIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="#">
                <span className="text-base font-semibold">Flocky</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
