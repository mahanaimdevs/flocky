import { index, layout, prefix, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  ...prefix("app", [
    layout("components/layout/app-layout.tsx", [
      route("dashboard", "routes/app/dashboard.tsx"),
      ...prefix("cell-groups", [
        index("routes/app/cell-groups/index.tsx"),
        route(":id", "routes/app/cell-groups/details.tsx"),
      ]),
      ...prefix("members", [
        index("routes/app/members/index.tsx"),
        route("new-members", "routes/app/members/new-members.tsx"),
        route(":id", "routes/app/members/details.tsx"),
      ]),
      route("calendar", "routes/app/calendar.tsx"),
    ]),
  ]),
] satisfies RouteConfig as RouteConfig;
