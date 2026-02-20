"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-white text-gray-900 border border-gray-200 shadow-xl rounded-lg backdrop-blur-sm",
          description: "text-gray-600",
          title: "text-gray-900 font-semibold",
          actionButton:
            "bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1 rounded-md font-medium",
          cancelButton:
            "bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded-md",
          success:
            "!bg-emerald-50 !text-emerald-800 !border-emerald-200 shadow-lg",
          error:
            "!bg-red-50 !text-red-800 !border-red-200 shadow-lg",
          warning:
            "!bg-yellow-50 !text-yellow-800 !border-yellow-200 shadow-lg",
          info: 
            "!bg-blue-50 !text-blue-800 !border-blue-200 shadow-lg",
        },
      }}
      position="top-right"
      expand={false}
      richColors={false}
      closeButton={true}
      {...props}
    />
  );
};

export { Toaster };
