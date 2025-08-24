import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-4">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Did you forget to add the page to the router?
            </p>
          </CardContent>
        </Card>

        {/* Professional Footer Branding */}
        <div className="bg-white/80 backdrop-blur-2xl border border-gray-200/50 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-8 text-center space-y-2">
            <p className="text-xs font-medium text-slate-600">
              © 2025 ShareXConnect. All rights reserved.
            </p>
            <p className="text-xs text-slate-500">
              Designed and developed by{" "}
              <a 
                href="https://aptivonsolin.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 underline-offset-2 hover:underline"
              >
                Aptivon Solution
              </a>
              <span className="italic text-slate-400 ml-1">
                (Building Trust...)
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
