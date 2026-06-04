import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-blue-700 p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">OpenClaw</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Medical AI That Never Guesses
          </h2>
          <p className="text-emerald-100 text-lg">
            Every answer grounded in peer-reviewed research. Every claim cited.
            Every source verifiable.
          </p>
        </div>
        <p className="text-emerald-200 text-sm">
          Trusted by researchers, clinicians, and biotech teams worldwide.
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}
