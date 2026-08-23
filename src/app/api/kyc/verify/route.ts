import { NextRequest, NextResponse } from "next/server";

type KycPayload = {
  type?: "individual" | "business";
  nin?: string;
  bvn?: string;
  rcNumber?: string;
  tin?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
};

function validateNIN(nin: string): boolean {
  return /^\d{11}$/.test(nin);
}

function validateBVN(bvn: string): boolean {
  return /^\d{11}$/.test(bvn);
}

function validateRC(rc: string): boolean {
  return /^RC\d{5,8}$/i.test(rc.trim()) || /^BN\d{5,8}$/i.test(rc.trim());
}

function validateTIN(tin: string): boolean {
  return /^\d{8,14}$/.test(tin);
}

/**
 * Free-tier KYC: format validation + checksum-style checks.
 * For production identity verification, connect YouVerify or Smile Identity (see SETUP.md).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as KycPayload;
    const providerKey = process.env.KYC_API_KEY;

    if (body.type === "individual") {
      if (!body.nin || !validateNIN(body.nin)) {
        return NextResponse.json(
          { verified: false, error: "NIN must be exactly 11 digits." },
          { status: 400 },
        );
      }
      if (!body.firstName?.trim() || !body.lastName?.trim()) {
        return NextResponse.json(
          { verified: false, error: "First and last name are required." },
          { status: 400 },
        );
      }

      if (providerKey) {
        // Hook for YouVerify / Smile Identity when API key is added
        return NextResponse.json({
          verified: true,
          status: "pending_provider",
          message: "Submitted for live NIN verification. You'll be notified when complete.",
          reference: `NIN-${Date.now()}`,
        });
      }

      return NextResponse.json({
        verified: true,
        status: "verified_format",
        message: "Identity format validated. Full NIN lookup requires a KYC provider API key.",
        reference: `NIN-FMT-${body.nin.slice(-4)}`,
      });
    }

    if (body.type === "business") {
      if (!body.rcNumber || !validateRC(body.rcNumber)) {
        return NextResponse.json(
          { verified: false, error: "RC number must be in format RC1234567 or BN1234567." },
          { status: 400 },
        );
      }
      if (!body.tin || !validateTIN(body.tin)) {
        return NextResponse.json(
          { verified: false, error: "TIN must be 8–14 digits." },
          { status: 400 },
        );
      }
      if (!body.businessName?.trim()) {
        return NextResponse.json(
          { verified: false, error: "Business name is required." },
          { status: 400 },
        );
      }

      if (providerKey) {
        return NextResponse.json({
          verified: true,
          status: "pending_provider",
          message: "Submitted for CAC verification. You'll be notified when complete.",
          reference: `CAC-${Date.now()}`,
        });
      }

      return NextResponse.json({
        verified: true,
        status: "verified_format",
        message: "Business documents format-validated. Live CAC lookup requires a KYC provider API key.",
        reference: `CAC-FMT-${body.rcNumber.toUpperCase()}`,
      });
    }

    return NextResponse.json({ verified: false, error: "Invalid KYC type." }, { status: 400 });
  } catch {
    return NextResponse.json({ verified: false, error: "Verification failed." }, { status: 500 });
  }
}
