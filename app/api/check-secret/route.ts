import { NextResponse } from "next/server";

export async function GET() {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  
  return NextResponse.json({
    secret: secret ? `${secret.substring(0, 8)}...` : "Not set",
    length: secret ? secret.length : 0,
    environment: process.env.NODE_ENV
  });
}
