import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (session.user.role === "HR") {
            const hr = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true },
            });

            if (!hr || !hr.companyId) {
                return NextResponse.json({ error: "HR does not belong to any company" }, { status: 400 });
            }

            const users = await prisma.user.findMany({
                where: { companyId: hr.companyId },
                include: {
                    wallet: true,
                },
                orderBy: {
                    name: "asc",
                },
            });

            return NextResponse.json({ users });
        } else if (session.user.role === "ADMIN") {
            const searchParams = req.nextUrl.searchParams;
            const companyId = searchParams.get("companyId");
            const filter = searchParams.get("filter"); // optional: 'paid' | 'company' | 'all'

            let whereClause: any = {};

            if (companyId) {
                whereClause = { companyId };
            } else if (filter === "paid") {
                // only paid users (no company)
                whereClause = { companyId: null };
            } else if (filter === "company") {
                // only users belonging to some company
                whereClause = { NOT: { companyId: null } };
            } else {
                // default: return all users (both paid and company users)
                whereClause = {};
            }

            const users = await prisma.user.findMany({
                where: whereClause,
                include: {
                    wallet: true,
                },
                orderBy: {
                    name: "asc",
                },
            });

            return NextResponse.json({ users });
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}