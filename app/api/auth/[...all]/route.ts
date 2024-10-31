import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";
import arcjet, { protectSignup } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    protectSignup({
      email: {
        mode: "LIVE",
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
      },
      bots: {
        mode: "LIVE",
        allow: [],
      },
      rateLimit: {
        // uses a sliding window rate limit
        mode: "LIVE",
        interval: "10m", // counts requests over a 10 minute sliding window
        max: 5000, // allows 5 submissions within the window
      },
    }),
  ],
});

const betterAuthHandlers = toNextJsHandler(auth.handler);

const ajProtectedPOST = async (req: NextRequest) => {
  const { email } = await req.clone().json();

  const decision = await aj.protect(req, { email });
  console.log(decision.isDenied())
  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      let message = '';
      if (decision.reason.emailTypes.includes("INVALID")) {
        message = "email address format is invalid. Is there a typo?";
      } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
        message = "we do not allow disposable email addresses.";
      } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
        message =
          "your email domain does not have an MX record. Is there a typo?";
      } else {
        message = "invalid email.";
      }

      return NextResponse.json({
        message, reason: decision.reason,
      }, { status: 400 })

    } else {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  } else {
    return betterAuthHandlers.POST(req)
  }
}

export { ajProtectedPOST as POST }
export const { GET } = betterAuthHandlers;