import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <CheckCircle className="h-16 w-16 text-blanco-success mx-auto mb-4" />
          <CardTitle className="text-blanco-success">Submission Successful</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Your appraisal form has been successfully submitted. Your Team Head and HR will
            review it shortly.
          </p>
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
