#!/usr/bin/env node
/**
 * Creates the portal admin + one government login per state (36 + FCT)
 * through the Supabase Admin API.
 *
 * This is the alternative to running supabase/admin-account.sql and
 * supabase/govt-accounts.sql by hand. Use it if your Supabase project
 * rejects direct inserts into auth.users, or if you just prefer one command.
 *
 *   node scripts/create-accounts.mjs
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
 * .env.local (or the real environment). Safe to re-run — existing accounts
 * have their password reset rather than erroring.
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const PASS_SUFFIX = "@NaijaPass2026";
const ADMIN_EMAIL = "admin@naijapass.ng";
const ADMIN_PASSWORD = "Admin@NaijaPass2026";

const STATES = [
  ["Abia", "Umuahia"],
  ["Adamawa", "Yola"],
  ["Akwa Ibom", "Uyo"],
  ["Anambra", "Awka"],
  ["Bauchi", "Bauchi"],
  ["Bayelsa", "Yenagoa"],
  ["Benue", "Makurdi"],
  ["Borno", "Maiduguri"],
  ["Cross River", "Calabar"],
  ["Delta", "Asaba"],
  ["Ebonyi", "Abakaliki"],
  ["Edo", "Benin City"],
  ["Ekiti", "Ado-Ekiti"],
  ["Enugu", "Enugu"],
  ["Gombe", "Gombe"],
  ["Imo", "Owerri"],
  ["Jigawa", "Dutse"],
  ["Kaduna", "Kaduna"],
  ["Kano", "Kano"],
  ["Katsina", "Katsina"],
  ["Kebbi", "Birnin Kebbi"],
  ["Kogi", "Lokoja"],
  ["Kwara", "Ilorin"],
  ["Lagos", "Ikeja"],
  ["Nasarawa", "Lafia"],
  ["Niger", "Minna"],
  ["Ogun", "Abeokuta"],
  ["Ondo", "Akure"],
  ["Osun", "Oshogbo"],
  ["Oyo", "Ibadan"],
  ["Plateau", "Jos"],
  ["Rivers", "Port Harcourt"],
  ["Sokoto", "Sokoto"],
  ["Taraba", "Jalingo"],
  ["Yobe", "Damaturu"],
  ["Zamfara", "Gusau"],
  ["FCT", "Abuja"],
];

function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const value = match[2].replace(/^['"]|['"]$/g, "");
    if (value && !process.env[match[1]]) process.env[match[1]] = value;
  }
}

function officeFor(state) {
  return state === "FCT"
    ? "Federal Capital Territory Administration"
    : `${state} State Government`;
}

function credentialsFor(state) {
  const slug = state.toLowerCase().replace(/[\s-]/g, "");
  return {
    email: `${slug}@govt.naijapass.ng`,
    password: `${state.replace(/\s/g, "")}${PASS_SUFFIX}`,
  };
}

/** Creates the auth user, or resets its password if the email already exists. */
async function upsertAuthUser(admin, { email, password, metadata }) {
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (!created.error) return created.data.user.id;

  const alreadyExists =
    created.error.status === 422 || /already/i.test(created.error.message);
  if (!alreadyExists) throw created.error;

  // listUsers is paginated; the directory is small enough to walk it.
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const found = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (found) {
      await admin.auth.admin.updateUserById(found.id, {
        password,
        email_confirm: true,
        user_metadata: metadata,
      });
      return found.id;
    }
    if (data.users.length < 200) break;
  }

  throw new Error(`${email} exists but could not be located`);
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
        "Add them to .env.local (see .env.example) and try again.",
    );
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const adminId = await upsertAuthUser(admin, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    metadata: { full_name: "Portal Admin", role: "admin", state: "FCT" },
  });

  const { error: adminProfileError } = await admin.from("profiles").upsert(
    {
      id: adminId,
      email: ADMIN_EMAIL,
      full_name: "Portal Admin",
      role: "admin",
      account_status: "active",
      state: "FCT",
      kyc_status: "verified",
    },
    { onConflict: "id" },
  );
  if (adminProfileError) throw adminProfileError;
  console.log(`admin    ${ADMIN_EMAIL.padEnd(34)} ${ADMIN_PASSWORD}`);

  const rows = [];
  for (const [state, capital] of STATES) {
    const office = officeFor(state);
    const { email, password } = credentialsFor(state);

    const id = await upsertAuthUser(admin, {
      email,
      password,
      metadata: { full_name: office, role: "govt", state },
    });

    const { error } = await admin.from("profiles").upsert(
      {
        id,
        email,
        full_name: office,
        role: "govt",
        account_status: "active",
        state,
        govt_state: state,
        department: "Office of the Secretary to the State Government",
        office_title: `${office} — ${capital}`,
        kyc_status: "verified",
      },
      { onConflict: "id" },
    );
    if (error) throw error;

    rows.push([state, email, password]);
    console.log(`govt     ${email.padEnd(34)} ${password}`);
  }

  const csv = ["state,email,password", ...rows.map((r) => r.join(","))].join("\n");
  const out = path.join(ROOT, "supabase", "govt-credentials.csv");
  fs.writeFileSync(out, `${csv}\n`);

  console.log(`\n${rows.length} state accounts ready. Credentials → ${out}`);
  console.log("State portal sign-in: /govt/signin");
  console.log("Admin console sign-in: /admin/signin");
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
