import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function HRDraftSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <CheckCircle className="h-16 w-16 text-blanco-success mx-auto mb-4" />
          <CardTitle className="text-blanco-success">HR Draft Saved Successfully</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Your HR review has been saved as a draft. You can continue filling it from Saved Drafts when ready.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/hr/drafts">
              <Button variant="outline">View Saved Drafts</Button>
            </Link>
            <Link href="/hr">
              <Button>Return to HR Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}