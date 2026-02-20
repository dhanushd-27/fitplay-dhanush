import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = session.user.role;
        const userId = session.user.id;

        let vouchers;

        // -------------------------------
        // ADMIN → RETURN ALL VOUCHERS
        // -------------------------------
        if (role === "ADMIN") {
            vouchers = await prisma.voucher.findMany({
                include: {
                    companies: true,
                    redemptions: true,
                },
                orderBy: { createdAt: "desc" },
            });

            return NextResponse.json({ vouchers });
        }

        // -------------------------------
        // HR or EMPLOYEE → RETURN ONLY COMPANY VOUCHERS
        // -------------------------------

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { companyId: true },
        });

        // If user has companyId (org employee), show company vouchers.
        // Paid users (no companyId) don't have vouchers → return empty array.
        if (user?.companyId) {
            vouchers = await prisma.voucher.findMany({
                where: {
                    companies: {
                        some: { id: user.companyId },
                    },
                },
                include: {
                    companies: true,
                    redemptions: {
                        where: { userId },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        } else {
            vouchers = [];
        }

        return NextResponse.json({ vouchers });
    } catch (error) {
        console.error("Voucher List Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
