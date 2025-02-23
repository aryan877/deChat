import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, X } from "lucide-react";
import { ConfirmationToolResult } from "@/app/types/tools";
import { AskForConfirmationInput } from "@repo/de-agent";

interface ConfirmationToolProps {
  args: AskForConfirmationInput;
  onSubmit: (result: ConfirmationToolResult) => void;
}

export function ConfirmationTool({ args, onSubmit }: ConfirmationToolProps) {
  const handleConfirm = () => {
    onSubmit({
      status: "success",
      message: "Action confirmed",
      data: {
        confirmed: true,
      },
    });
  };

  const handleCancel = () => {
    onSubmit({
      status: "cancelled",
      message: "Action cancelled by user",
      data: {
        confirmed: false,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-3">
      <Card className="p-2 space-y-3 bg-muted/50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="font-medium text-sm text-foreground">
              Confirmation Required
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {args.message}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={handleConfirm}
                size="sm"
                className="h-8 bg-primary hover:bg-primary/90 transition-colors"
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Confirm
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="h-8 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-colors"
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 p-2 rounded-md border border-border/50">
              <AlertCircle className="h-3 w-3 flex-shrink-0 text-primary/70" />
              <span>
                Please review the details carefully before confirming.
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
