import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../api/router";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type DashboardData = RouterOutputs["soc"]["dashboard"];
export type IncidentListItem = RouterOutputs["soc"]["list"][number];
export type IncidentDetail = RouterOutputs["soc"]["byId"];
