import React from "react";
import { SonicDocsSearchResponse } from "@repo/de-agent";
import ReactMarkdown from "react-markdown";

interface DocsSearchSuccessProps {
  data: SonicDocsSearchResponse;
}

export function DocsSearchSuccess({ data }: DocsSearchSuccessProps) {
  if (!data.answer) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              a: ({ ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                />
              ),
            }}
          >
            {data.answer}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
