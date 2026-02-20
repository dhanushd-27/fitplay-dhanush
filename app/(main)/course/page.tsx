

import { Suspense } from "react";
import CourseModuleClient from "./CourseModuleClient"
import { useUser } from '@/app/hooks/useUser';
import { toast } from 'sonner';

export default function CoursePage() {
 
  return (
    <Suspense fallback={<div className="p-10">Loading course…</div>}>
      <CourseModuleClient />
    </Suspense>
  );
}
