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
    <div style={{ maxWidth: 420, marginBottom: 20 }}>
      <p style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#6b7a99",
        marginBottom: 8,
      }}>
        Increment Slab Reference
      </p>
      <div style={{
        background: "#f8f9fc",
        border: "1px solid #e2e6ef",
        borderRadius: 10,
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#1a4b8c" }}>
              <th style={{
                padding: "6px 12px",
                textAlign: "left",
                color: "#fff",
                fontWeight: 600,
              }}>
                CTC Range (Annual)
              </th>
              <th style={{
                padding: "6px 12px",
                textAlign: "left",
                color: "#fff",
                fontWeight: 600,
              }}>
                Max Increment %
              </th>
            </tr>
          </thead>
          <tbody>
            {slabs.map((slab, idx) => {
              const max = slab.ctcMax ?? Infinity;
              const isActive =
                highlightCtc != null &&
                highlightCtc >= slab.ctcMin &&
                highlightCtc <= max;
              const isLast = idx === slabs.length - 1;
              return (
                <tr
                  key={slab.id}
                  style={{
                    background: isActive ? "#e8f0fb" : idx % 2 === 0 ? "#fff" : "#f8f9fc",
                    borderBottom: isLast ? "none" : "1px solid #e2e6ef",
                  }}
                >
                  <td style={{
                    padding: "5px 12px",
                    color: isActive ? "#1a4b8c" : "#333f5c",
                    fontWeight: isActive ? 700 : 400,
                  }}>
                    {formatRange(slab.ctcMin, slab.ctcMax)}
                  </td>
                  <td style={{
                    padding: "5px 12px",
                    color: isActive ? "#1a4b8c" : "#333f5c",
                    fontWeight: isActive ? 700 : 400,
                  }}>
                    0% to {decimalToNumber(slab.maxPct)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {maxAllowed != null && (
        <p style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#1a8c5a",
          marginTop: 8,
        }}>
          Maximum allowed increment for this employee: {maxAllowed}%
        </p>
      )}
    </div>
  );
}