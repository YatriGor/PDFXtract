import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers(); // Await the headers() function
  const signature = headersList.get("Some-Signature") as string; // Corrected usage

  try {
    console.log("Received webhook event with body:", body);
    console.log("Signature:", signature);
    // Future: Implement event handling logic here
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return new NextResponse("Webhook error", { status: 400 });
  }

  console.log("Webhook received. Processing logic will be added soon.");
  return new NextResponse(null, { status: 200 });
}
