import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import ModelslabTest from "@/components/modelslab-test";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-12 px-4">
      <Card className="w-full max-w-md mb-12">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 mb-4">
            Did you forget to add the page to the router?
          </p>
          
          <Link to="/" className="text-primary hover:underline">
            Return Home
          </Link>
        </CardContent>
      </Card>
      
      {/* Test component for ModelsLab API */}
      <div className="w-full max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">ModelsLab API Test</h2>
        <ModelslabTest />
      </div>
    </div>
  );
}
