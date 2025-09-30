import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const secret = request.headers.get("sanity-webhook-secret");
    
    console.log("=== SANITY WEBHOOK DEBUG ===");
    console.log("Headers received:", Object.fromEntries(request.headers.entries()));
    console.log("Secret received:", secret);
    console.log("Body received:", JSON.stringify(body, null, 2));
    console.log("===========================");
    
    return NextResponse.json({
      success: true,
      receivedSecret: secret,
      body: body,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error in test webhook:", err);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    );
  }
}
