"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface EligibleEntry {
    id: string;
    employeeCode: string;
    employeeName: string;
    financialYear: string;
    createdAt: string;
}

export function EligibilityClient() {
    const [list, setList] = useState<EligibleEntry[]>([]);
    const [employeeCode, setEmployeeCode] = useState("");
    const [employeeName, setEmployeeName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    function load() {
        fetch("/api/eligible-employees")
            .then((r) => r.json())
            .then(setList)
            .finally(() => setLoading(false));
    }

    useEffect(load, []);

    async function handleAdd() {
        if (!employeeCode || !employeeName) return;
        setSaving(true);
        try {
            await fetch("/api/eligible-employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeCode, employeeName }),
            });
            setEmployeeCode("");
            setEmployeeName("");
            load();
        } finally {
            setSaving(false);
        }
    }

    async function handleRemove(id: string) {
        await fetch(`/api/eligible-employees/${id}`, { method: "DELETE" });
        load();
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border bg-white p-4">
                <p className="mb-3 text-sm text-muted-foreground">
                    Only employees added here can access the appraisal form this cycle. Everyone else
                    will see a message asking them to wait for HR instructions.
                </p>
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <Label>Employee Code</Label>
                        <Input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} className="w-40" />
                    </div>
                    <div>
                        <Label>Employee Name</Label>
                        <Input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="w-56" />
                    </div>
                    <Button onClick={handleAdd} disabled={saving}>
                        {saving ? "Adding…" : "Add"}
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border bg-white">
                {loading ? (
                    <p className="p-4 text-sm text-muted-foreground">Loading…</p>
                ) : list.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">No employees added yet for this cycle.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                                <th className="p-3">Code</th>
                                <th className="p-3">Name</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((e) => (
                                <tr key={e.id} className="border-b last:border-0">
                                    <td className="p-3">{e.employeeCode}</td>
                                    <td className="p-3">{e.employeeName}</td>
                                    <td className="p-3 text-right">
                                        <Button size="sm" variant="ghost" onClick={() => handleRemove(e.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}