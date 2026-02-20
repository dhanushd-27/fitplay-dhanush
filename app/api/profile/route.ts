import { authOptions } from "@/lib/auth";
import { UserUpdateInputObjectSchema } from "@/lib/generated/zod/schemas";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session?.user.role === "ADMIN") {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const profile = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                wallet: true,
                orders: true,
                company: true,
            }
        });

        return new NextResponse(JSON.stringify({ data: profile }), { status: 200 });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

// Edit user profile
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session?.user.role === "ADMIN") {
            return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const body = await req.json();
        const {name, email, password, role, companyId, verified, claimed} = body;
        if (name || email || password || role || companyId || verified || claimed) {
            return new NextResponse(JSON.stringify({ error: "Can't update, invalid fields" }), { status: 400 });
        }
        const parsedBody = UserUpdateInputObjectSchema.parse(body);
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: parsedBody,
        });

        return new NextResponse(JSON.stringify({ data: updatedUser }), { status: 200 });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}