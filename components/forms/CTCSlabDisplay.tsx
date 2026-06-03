import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SerializedIncrementSlab } from "@/lib/utils";
import { decimalToNumber } from "@/lib/utils";

interface CTCSlabDisplayProps {
  slabs: SerializedIncrementSlab[];
  highlightCtc?: number;
  maxAllowed?: number;
}

function formatRange(min: number, max: number | null): string {
  if (max == null) return `${min.toLocaleString("en-IN")} and above`;
  if (min === 0) return `Less than ${(max + 1).toLocaleString("en-IN")}`;
  return `${min.toLocaleString("en-IN")} to ${max.toLocaleString("en-IN")}`;
}

export function CTCSlabDisplay({ slabs, highlightCtc, maxAllowed }: CTCSlabDisplayProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-blanco-primary">CTC Slab Reference Table</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CTC Range (Annual)</TableHead>
            <TableHead>Maximum Increment %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slabs.map((slab) => {
            const max = slab.ctcMax ?? Infinity;
            const isActive = highlightCtc != null && highlightCtc >= slab.ctcMin && highlightCtc <= max;
            return (
              <TableRow key={slab.id} className={isActive ? "bg-blue-50 font-medium" : ""}>
                <TableCell>{formatRange(slab.ctcMin, slab.ctcMax)}</TableCell>
                <TableCell>0% to {decimalToNumber(slab.maxPct)}%</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {maxAllowed != null && (
        <p className="text-sm font-medium text-blanco-success">
          Maximum allowed increment: {maxAllowed}%
        </p>
      )}
    </div>
  );
}
