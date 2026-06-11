import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        style: {
          background: "#ffffff",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
          fontSize: "14px",
          fontWeight: "500",
        },
        classNames: {
          toast: "bg-white text-slate-900 border-slate-200 shadow-lg",
          title: "text-slate-900 font-semibold",
          description: "text-slate-600",
          actionButton: "bg-indigo-600 text-white",
          cancelButton: "bg-slate-100 text-slate-700",
          success: "border-l-4 border-l-emerald-500",
          error: "border-l-4 border-l-red-500",
          warning: "border-l-4 border-l-amber-500",
          info: "border-l-4 border-l-blue-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
