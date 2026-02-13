import { index, layout, prefix, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  ...prefix("app", [
    layout("components/layout/app-layout.tsx", [route("dashboard", "routes/app/dashboard.tsx")]),
  ]),
] satisfies RouteConfig as RouteConfig;
