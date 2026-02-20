
// import { NextRequest, NextResponse } from 'next/server';
// import crypto from 'crypto';
// import prisma from "@/lib/prisma";


// const SHOPIFY_API_KEY = process.env.SHOPIFY_CLIENT_ID!;
// const SHOPIFY_API_SECRET = process.env.SHOPIFY_CLIENT_SECRET!;


// function verifyHmac(searchParams: URLSearchParams): boolean {
//   const hmac = searchParams.get('hmac') || '';

 
//   const params = new URLSearchParams();
//   const entries = Array.from(searchParams.entries())
//     .filter(([key]) => key !== 'hmac')
//     .sort(([a], [b]) => a.localeCompare(b));

//   for (const [key, value] of entries) {
//     params.append(key, value);
//   }

//   const message = params.toString();

//   const generatedHmac = crypto
//     .createHmac('sha256', SHOPIFY_API_SECRET)
//     .update(message)
//     .digest('hex');

//   try {
//     return crypto.timingSafeEqual(
//       Buffer.from(hmac, 'utf-8'),
//       Buffer.from(generatedHmac, 'utf-8'),
//     );
//   } catch {
//     return false;
//   }
// }

// export async function GET(req: NextRequest) {
//   const url = new URL(req.url);
//   const searchParams = url.searchParams;

//   const shop = searchParams.get('shop');
//   const code = searchParams.get('code');
//   const hmac = searchParams.get('hmac');

//   if (!shop || !code || !hmac) {
//     return new NextResponse('Missing required params', { status: 400 });
//   }

  
//   if (!verifyHmac(searchParams)) {
//     return new NextResponse('Invalid HMAC', { status: 400 });
//   }

//   const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       client_id: SHOPIFY_API_KEY,
//       client_secret: SHOPIFY_API_SECRET,
//       code,
//     }),
//   });

//   if (!tokenRes.ok) {
//     const text = await tokenRes.text();
//     return new NextResponse(`Error getting access token: ${text}`, { status: 500 });
   
//   }
//    // Hi(tokenRes)

//   const tokenJson = await tokenRes.json() as {
//     access_token: string;
//     scope: string;
//   };

//   const accessToken = tokenJson.access_token;

//   // 3) For now, just log it. Next step is saving to DB.
//   // Hi('Shopify connected:', {
//     shop,
//     accessToken: accessToken,
//     scope: tokenJson.scope,
//   });

//   // Later: save { shop, accessToken } to your DB here with Prisma.

//   // 4) Redirect to a success page in your app
//   return NextResponse.redirect('https://fitplay.life/');
// }

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

const SHOPIFY_API_KEY = process.env.SHOPIFY_CLIENT_ID!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_CLIENT_SECRET!;

function verifyHmac(searchParams: URLSearchParams): boolean {
  const hmac = searchParams.get("hmac") || "";

  const params = new URLSearchParams();
  const entries = Array.from(searchParams.entries())
    .filter(([key]) => key !== "hmac")
    .sort(([a], [b]) => a.localeCompare(b));

  for (const [key, value] of entries) {
    params.append(key, value);
  }

  const message = params.toString();

  const generatedHmac = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET)
    .update(message)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(generatedHmac)
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!shop || !code || !state) {
    return new NextResponse("Missing required parameters", { status: 400 });
  }

  // 🔐 Verify HMAC
  if (!verifyHmac(searchParams)) {
    return new NextResponse("Invalid HMAC", { status: 400 });
  }

  // 🔐 Verify state
  const cookieState = req.cookies.get("shopify_oauth_state")?.value;
  const vendorId = req.cookies.get("shopify_vendor_id")?.value;

  if (!cookieState || cookieState !== state) {
    return new NextResponse("Invalid OAuth state", { status: 400 });
  }

  if (!vendorId) {
    return new NextResponse("Missing vendor context", { status: 400 });
  }

  // 🎟 Exchange code for access token
  const tokenRes = await fetch(
    `https://${shop}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    }
  );

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return new NextResponse(
      `Error getting access token: ${text}`,
      { status: 500 }
    );
  }

  const tokenJson = await tokenRes.json() as {
    access_token: string;
    scope: string;
  };

  const accessToken = tokenJson.access_token;

  // 💾 Save in DB
  await prisma.shopifyStore.upsert({
    where: { vendorId },
    update: {
      shop,
      accessToken,
      scope: tokenJson.scope,
    },
    create: {
      vendorId,
      shop,
      accessToken,
      scope: tokenJson.scope,
    },
  });

  // 🧹 Clear cookies
  const response = NextResponse.redirect("https://fitplay.life/");

  response.cookies.delete("shopify_oauth_state");
  response.cookies.delete("shopify_vendor_id");

  return response;
}
