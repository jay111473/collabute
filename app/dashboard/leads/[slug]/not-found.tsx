import Link from "next/link";
import { ArrowLeft, UserX } from "lucide-react";

export default function LeadNotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center">
        <div className="h-24 w-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserX className="h-12 w-12 text-gray-400" />
        </div>

        <h1 className="text-2xl font-semibold text-white mb-3">
          Lead Not Found
        </h1>

        <p className="text-gray-400 mb-8">
          The lead profile you&apos;re looking for doesn&apos;t exist or may
          have been removed.
        </p>

        <Link
          href="/dashboard/leads"
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leads
        </Link>
      </div>
    </div>
  );
}
