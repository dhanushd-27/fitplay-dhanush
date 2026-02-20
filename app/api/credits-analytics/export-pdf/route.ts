import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (role !== "HR")
    return NextResponse.json({ error: "Access denied" }, { status: 403 });

  return exportTransactions(req, session.user.id, role);
}

async function exportTransactions(
  req: NextRequest,
  hrId: string,
  role: string
) {
  const { searchParams } = new URL(req.url);

  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const period = searchParams.get("period"); // 7, 30, 90
  const companyIdParam = searchParams.get("companyId");

  // HR → always use their own companyId
  let companyId: string | null = null;

  if (role === "HR") {
    const hr = await prisma.user.findUnique({
      where: { id: hrId },
      select: { companyId: true },
    });

    if (!hr)
      return NextResponse.json({ error: "Invalid HR account" }, { status: 400 });

    companyId = hr.companyId;
  }

  // Build date filter
  let start: Date | null = null;
  let end: Date | null = null;

  if (period) {
    const days = Number(period);
    if (![7, 30, 90].includes(days))
      return NextResponse.json({ error: "Invalid period" }, { status: 400 });

    end = new Date();
    start = new Date();
    start.setDate(start.getDate() - days);
  } else if (fromDate && toDate) {
    start = new Date(fromDate);
    end = new Date(toDate);
  }

  // Fetch all users under the company
  const users = await prisma.user.findMany({
    where: companyId ? { companyId } : {},
    select: { id: true },
  });

  const userIds = users.map((u) => u.id);

  const filters: any = {
    userId: { in: userIds },
    isDemo: false,
  };

  if (start && end) {
    filters.createdAt = {
      gte: start,
      lte: end,
    };
  }

  const transactions = await prisma.transactionLedger.findMany({
    where: filters,
    include: {
      user: {
        select: { name: true, email: true },
      },
      order: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // -----------------------------
  // Generate PDF
  // -----------------------------
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595, 842]);
  let y = 800;
  const m = 40;
  const lh = 14;

  page.drawText("Transactions Report", { x: m, y, size: 18, font: bold });
  y -= 25;

  if (companyId)
    page.drawText(`Company: ${companyId}`, {
      x: m,
      y,
      size: 11,
      font,
    });

  y -= 20;

  if (start && end) {
    page.drawText(
      `Date Range: ${start.toDateString()} -> ${end.toDateString()}`,
      { x: m, y, size: 10, font }
    );
    y -= 20;
  }

  for (const t of transactions) {
    if (y < 80) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }

    page.drawText(
      `Txn #${t.id.slice(-8)} | ${t.transactionType || "N/A"} | ${t.modeOfPayment}`,
      { x: m, y, size: 11, font: bold }
    );
    y -= lh;

    page.drawText(
      `Rs.${t.amount} | Credit: ${t.isCredit ? "Yes" : "No"} | ${new Date(
        t.createdAt
      ).toLocaleDateString()}`,
      { x: m, y, size: 10, font }
    );
    y -= lh;

    page.drawText(
      `User: ${t.user?.name || "N/A"} (${t.user?.email || ""})`,
      { x: m, y, size: 10, font }
    );
    y -= lh;

    page.drawText(
      `Order Linked: ${t.order ? t.order.id.slice(-8) : "None"}`,
      { x: m, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) }
    );
    y -= 20;
  }

  const pdf = await pdfDoc.save();
  const filename = `transactions_${Date.now()}.pdf`;

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
