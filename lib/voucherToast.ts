import { toast } from 'sonner';

export const voucherToast = {
  success: (message: string, credits?: number) => {
    toast.success(message, {
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
      description: credits ? `${credits} credits added to your wallet` : undefined,
    });
  },

  error: (message: string) => {
    toast.error(message, {
      className: "border-red-200 bg-red-50 text-red-800",
    });
  },

  info: (message: string) => {
    toast.info(message, {
      className: "border-blue-200 bg-blue-50 text-blue-800",
    });
  },

  warning: (message: string) => {
    toast.warning(message, {
      className: "border-yellow-200 bg-yellow-50 text-yellow-800",
    });
  },
};