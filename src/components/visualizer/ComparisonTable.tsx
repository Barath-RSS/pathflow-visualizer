import { ALGORITHMS } from "@/lib/pathfinding/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ComparisonTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Algorithm</TableHead>
          <TableHead>Data Structure</TableHead>
          <TableHead>Shortest Path</TableHead>
          <TableHead>Heuristic</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.values(ALGORITHMS).map((a) => (
          <TableRow key={a.key}>
            <TableCell className="font-medium">{a.short}</TableCell>
            <TableCell>{a.dataStructure}</TableCell>
            <TableCell>{a.shortestPath}</TableCell>
            <TableCell>{a.heuristic}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
