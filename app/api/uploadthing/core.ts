import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
    imageUploader: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
    })
        .middleware(async ({ req }) => {
            const session = await getServerSession(authOptions);
            const user = session?.user;
            if (!user) throw new UploadThingError("Unauthorized");
            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { uploadedBy: metadata.userId };
        }),

    // ✅ PDF Uploader for shipping labels
    pdfUploader: f({
        blob: { maxFileSize: "8MB", maxFileCount: 1 },
    })
        .middleware(async ({ req }) => {
            const session = await getServerSession(authOptions);
            const user = session?.user;
            if (!user) throw new UploadThingError("Unauthorized");
            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { uploadedBy: metadata.userId, fileUrl: file.ufsUrl };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
