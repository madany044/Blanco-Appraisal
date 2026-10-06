"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, UserCheck, Check, Search } from "lucide-react";

interface EligibleEntry {
    id: string;
    employeeCode: string;
    employeeName: string;
    financialYear: string;
    createdAt: string;
}

interface EnrolledProfile {
    id: string;
    employeeCode: string;
    employeeName: string;
}

export function EligibilityClient() {
    const [list, setList] = useState<EligibleEntry[]>([]);
    const [enrolled, setEnrolled] = useState<EnrolledProfile[]>([]);
    const [employeeCode, setEmployeeCode] = useState("");
    const [employeeName, setEmployeeName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [activeField, setActiveField] = useState<"code" | "name" | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    function load() {
        fetch("/api/eligible-employees")
            .then((r) => r.json())
            .then(setList)
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        load();
        fetch("/api/employee-profiles")
            .then((r) => (r.ok ? r.json() : []))
            .then((data) => {
                if (Array.isArray(data)) {
                    setEnrolled(data);
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (formRef.current && !formRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleCodeChange(val: string) {
        setEmployeeCode(val);
        setActiveField("code");
        setShowSuggestions(true);

        const query = val.trim().toLowerCase();
        if (query) {
            const match = enrolled.find((e) => e.employeeCode.toLowerCase() === query);
            if (match) {
                setEmployeeName(match.employeeName);
            }
        }
    }

    function handleNameChange(val: string) {
        setEmployeeName(val);
        setActiveField("name");
        setShowSuggestions(true);

        const query = val.trim().toLowerCase();
        if (query) {
            const match = enrolled.find((e) => e.employeeName.toLowerCase() === query);
            if (match) {
                setEmployeeCode(match.employeeCode);
            }
        }
    }

    function selectProfile(profile: EnrolledProfile) {
        setEmployeeCode(profile.employeeCode);
        setEmployeeName(profile.employeeName);
        setShowSuggestions(false);
        setActiveField(null);
    }

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
            setShowSuggestions(false);
            setActiveField(null);
            load();
        } finally {
            setSaving(false);
        }
    }

    async function handleRemove(id: string) {
        await fetch(`/api/eligible-employees/${id}`, { method: "DELETE" });
        load();
    }

    const currentQuery =
        activeField === "code"
            ? employeeCode.trim().toLowerCase()
            : activeField === "name"
            ? employeeName.trim().toLowerCase()
            : "";

    const filteredSuggestions = currentQuery
        ? enrolled.filter(
              (e) =>
                  e.employeeCode.toLowerCase().includes(currentQuery) ||
                  e.employeeName.toLowerCase().includes(currentQuery)
          )
        : [];

    return (
        <div className="space-y-6">
            <div className="rounded-lg border bg-white p-4" ref={formRef}>
                <p className="mb-3 text-sm text-muted-foreground">
                    Only employees added here can access the appraisal form this cycle. Everyone else
                    will see a message asking them to wait for HR instructions.
                </p>
                <div className="relative">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="relative">
                            <Label>Employee Code</Label>
                            <div className="relative">
                                <Input
                                    value={employeeCode}
                                    onChange={(e) => handleCodeChange(e.target.value)}
                                    onFocus={() => {
                                        setActiveField("code");
                                        setShowSuggestions(true);
                                    }}
                                    placeholder="e.g. BL001"
                                    className="w-44 pr-8"
                                />
                                <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                            </div>
                        </div>
                        <div className="relative">
                            <Label>Employee Name</Label>
                            <div className="relative">
                                <Input
                                    value={employeeName}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    onFocus={() => {
                                        setActiveField("name");
                                        setShowSuggestions(true);
                                    }}
                                    placeholder="Search or enter name"
                                    className="w-64 pr-8"
                                />
                                <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                            </div>
                        </div>
                        <Button onClick={handleAdd} disabled={saving || !employeeCode.trim() || !employeeName.trim()}>
                            {saving ? "Adding…" : "Add"}
                        </Button>
                    </div>

                    {/* Autocomplete Suggestions Dropdown */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full max-w-lg overflow-y-auto rounded-md border bg-white p-1 shadow-lg ring-1 ring-black/5">
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b mb-1">
                                <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                                Enrolled Employee Suggestions ({filteredSuggestions.length})
                            </div>
                            <div className="divide-y divide-slate-100">
                                {filteredSuggestions.map((profile) => {
                                    const isAdded = list.some(
                                        (e) => e.employeeCode.toLowerCase() === profile.employeeCode.toLowerCase()
                                    );
                                    return (
                                        <button
                                            key={profile.id}
                                            type="button"
                                            onClick={() => selectProfile(profile)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between group rounded"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 group-hover:bg-blue-100 transition-colors">
                                                    {profile.employeeCode}
                                                </span>
                                                <span className="font-medium text-slate-900 group-hover:text-blue-700">
                                                    {profile.employeeName}
                                                </span>
                                            </div>
                                            {isAdded && (
                                                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-medium">
                                                    <Check className="h-3 w-3 text-emerald-600" /> Added
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
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
                                <tr key={e.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                    <td className="p-3 font-mono font-medium">{e.employeeCode}</td>
                                    <td className="p-3 font-medium">{e.employeeName}</td>
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