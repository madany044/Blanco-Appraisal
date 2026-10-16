import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function ReturnToHRSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <CheckCircle className="h-16 w-16 text-blanco-success mx-auto mb-4" />
          <CardTitle className="text-blanco-success">Returned to HR Successfully</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            The appraisal has been returned to HR with your reason. HR will review it and request corrections from the employee.
          </p>
          <Link href="/manager">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
