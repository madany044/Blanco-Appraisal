import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EligibilityClient } from "@/components/hr/EligibilityClient";

export default async function EligibilityPage() {
    const user = await getAuthUser();
    if (!user || user.role !== "hr") redirect("/login");

    return (
        <DashboardLayout role="hr" userEmail={user.email} title="Appraisal Eligibility">
            <EligibilityClient />
        </DashboardLayout>
    );
}