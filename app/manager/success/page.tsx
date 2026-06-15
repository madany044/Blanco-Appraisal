import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function ManagerSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <CheckCircle className="h-16 w-16 text-blanco-success mx-auto mb-4" />
          <CardTitle className="text-blanco-success">Manager Submission Successful</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Reporting Manager review has been submitted successfully. The form is now with Management for the final stage.
          </p>
          <Link href="/manager">
            <Button variant="outline">Return to Reporting Manager Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
