import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function EmployeeCorrectionSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <CheckCircle className="h-16 w-16 text-blanco-success mx-auto mb-4" />
          <CardTitle className="text-blanco-success">Employee Correction Requested Successfully</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            The employee can now log in to edit and resubmit their existing appraisal. Your instructions have been saved. Please notify the employee through your usual channel.
          </p>
          <Link href="/hr">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
