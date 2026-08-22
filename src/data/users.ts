import type { Role } from "@/lib/session";

export type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  state: string;
  status: "verified" | "pending" | "suspended";
};

export const directoryUsers: DirectoryUser[] = [
  {
    id: "u-admin",
    name: "Portal Admin",
    email: "admin@naijapass.ng",
    role: "admin",
    state: "FCT",
    status: "verified",
  },
  {
    id: "u-govt",
    name: "FCT Secretariat",
    email: "govt@naijapass.ng",
    role: "govt",
    state: "FCT",
    status: "verified",
  },
  {
    id: "u-tunde",
    name: "Tunde Adebayo",
    email: "tunde@example.com",
    role: "individual",
    state: "Lagos",
    status: "verified",
  },
  {
    id: "u-berger",
    name: "Julius Berger Nigeria",
    email: "bids@julius-berger.ng",
    role: "business",
    state: "FCT",
    status: "verified",
  },
  {
    id: "u-gig",
    name: "GIG Logistics",
    email: "ops@giglogistics.ng",
    role: "business",
    state: "FCT",
    status: "verified",
  },
  {
    id: "u-pending",
    name: "Kemi Okon",
    email: "kemi@example.com",
    role: "individual",
    state: "Rivers",
    status: "pending",
  },
];
