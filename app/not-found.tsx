import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className=" min-h-[78vh] flex flex-col items-center justify-center bg-black text-white padding-global">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 Error */}
        <div className="mb-6">
          <h1 className="text-8xl md:text-9xl font-bold text-white mb-4">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-300 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-black transition-all duration-300 px-8 py-3"
            >
              Go Home
            </Button>
          </Link>
          <Link href="/contact">
            <Button className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 transition-all duration-300 px-8 py-3">
              Contact Us
            </Button>
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-sm text-gray-500">
          <p>
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
