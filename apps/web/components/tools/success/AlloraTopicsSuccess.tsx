import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlloraSdkTopic } from "@repo/de-agent";

interface AlloraTopicsSuccessProps {
  data: AlloraSdkTopic[];
}

export function AlloraTopicsSuccess({ data }: AlloraTopicsSuccessProps) {
  console.log("AlloraTopicsSuccess", data);
  if (!data || !Array.isArray(data)) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Allora Topics</CardTitle>
          <CardDescription>No topics data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const topics = data;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Allora Topics</CardTitle>
        <CardDescription>
          Available prediction topics from Allora Oracle Network
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topics.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No topics available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Topic Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Workers</TableHead>
                <TableHead>Reputers</TableHead>
                <TableHead>Epoch Length</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((topic) => (
                <TableRow key={topic.topic_id}>
                  <TableCell className="font-medium">
                    {topic.topic_id}
                  </TableCell>
                  <TableCell>{topic.topic_name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={topic.is_active ? "default" : "secondary"}
                      className={topic.is_active ? "bg-green-500" : ""}
                    >
                      {topic.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{topic.worker_count}</TableCell>
                  <TableCell>{topic.reputer_count}</TableCell>
                  <TableCell>{topic.epoch_length} blocks</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
