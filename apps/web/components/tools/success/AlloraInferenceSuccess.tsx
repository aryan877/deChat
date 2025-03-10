import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { AlloraInferenceResponse } from "@repo/de-agent";

interface AlloraInferenceSuccessProps {
  data: AlloraInferenceResponse;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return `${date.toLocaleString()} (${formatDistanceToNow(date, { addSuffix: true })})`;
}

export function AlloraInferenceSuccess({ data }: AlloraInferenceSuccessProps) {
  console.log("AlloraInferenceSuccess", data);
  if (!data || !data.inference_data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Allora Inference</CardTitle>
          <CardDescription>No inference data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const inferenceData = data.inference_data;
  const tokenDecimals = data.token_decimals || 18;
  const topicId = inferenceData.topic_id || "Unknown";

  // Create a typed array of confidence intervals
  type ConfidenceInterval = {
    percentile: number;
    value: string;
    normalizedValue: string;
  };

  // Ensure we only map values that exist in both arrays
  const confidenceIntervals: ConfidenceInterval[] = [];
  const minLength = Math.min(
    inferenceData.confidence_interval_percentiles?.length || 0,
    inferenceData.confidence_interval_values?.length || 0,
    inferenceData.confidence_interval_percentiles_normalized?.length ||
      Infinity,
    inferenceData.confidence_interval_values_normalized?.length || Infinity
  );

  for (let i = 0; i < minLength; i++) {
    const percentileValue =
      inferenceData.confidence_interval_percentiles_normalized?.[i] ||
      inferenceData.confidence_interval_percentiles[i];

    const value = inferenceData.confidence_interval_values[i];
    const normalizedValue =
      inferenceData.confidence_interval_values_normalized?.[i] || value;

    if (percentileValue !== undefined && value !== undefined) {
      const percentile = Number(percentileValue);

      if (!isNaN(percentile)) {
        confidenceIntervals.push({
          percentile,
          value: value.toString(),
          normalizedValue: normalizedValue?.toString() || "0",
        });
      }
    }
  }

  // Use normalized value if available
  const networkInference = inferenceData.network_inference || "0";
  const normalizedValue =
    inferenceData.network_inference_normalized !== undefined
      ? inferenceData.network_inference_normalized
      : networkInference;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Allora Inference</CardTitle>
        <CardDescription>Prediction data for topic {topicId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Network Inference
            </h3>
            <p className="text-2xl font-bold">
              {typeof normalizedValue === "number"
                ? normalizedValue.toFixed(4)
                : parseFloat(normalizedValue.toString()).toFixed(4)}
            </p>
            <p className="text-sm text-muted-foreground">
              Raw: {inferenceData.network_inference}
            </p>
            <p className="text-xs text-muted-foreground">
              Token Decimals: {tokenDecimals}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Timestamp
            </h3>
            <p className="text-lg">
              {formatTimestamp(inferenceData.timestamp)}
            </p>
          </div>
        </div>

        {confidenceIntervals.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Confidence Intervals
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {confidenceIntervals.map((interval) => (
                <div
                  key={interval.percentile}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span className="text-sm">{interval.percentile}%</span>
                  <span className="font-medium">
                    {parseFloat(interval.normalizedValue).toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.signature && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Signature
            </h3>
            <div className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
              {data.signature}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
