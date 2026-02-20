// import { NextRequest, NextResponse } from 'next/server';
// import crypto from 'crypto';


// const SHOPIFY_API_KEY = process.env.SHOPIFY_CLIENT_ID!;
// const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES!;
// const SHOPIFY_CALLBACK_URL = process.env.CALLBACK_URL!;


// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);


//   const shop = searchParams.get('shop'); 

//   if (!shop) {
//     return new NextResponse('Missing shop param', { status: 400 });
//   }


//   const state = crypto.randomBytes(16).toString('hex');

  
//   const authorizeUrl =
//     `https://${shop}/admin/oauth/authorize` +
//     `?client_id=${SHOPIFY_API_KEY}` +
//     `&scope=${encodeURIComponent(SHOPIFY_SCOPES)}` +
//     `&redirect_uri=${encodeURIComponent(SHOPIFY_CALLBACK_URL)}` +
//     `&state=${state}`;

//   return NextResponse.redirect(authorizeUrl);
// }

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const SHOPIFY_API_KEY = process.env.SHOPIFY_CLIENT_ID!;
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES!;
const SHOPIFY_CALLBACK_URL = process.env.CALLBACK_URL!;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);



  if (!session || session.user.role !== "VENDOR") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");

 if (!shop || !shop.endsWith(".myshopify.com")) {
  return new NextResponse("Invalid shop domain", { status: 400 });
}

  const state = crypto.randomBytes(16).toString("hex");

  const authorizeUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${SHOPIFY_API_KEY}` +
    `&scope=${encodeURIComponent(SHOPIFY_SCOPES)}` +
    `&redirect_uri=${encodeURIComponent(SHOPIFY_CALLBACK_URL)}` +
    `&state=${state}`;

  const response = NextResponse.redirect(authorizeUrl);

  // Store vendor context
  response.cookies.set("shopify_vendor_id", session.user.id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  response.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  return response;
}
