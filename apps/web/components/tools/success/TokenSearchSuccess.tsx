import React, { useState } from "react";
import { Check, Coins, Copy, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { ShadowTokenSearchResponse } from "@repo/de-agent";

interface TokenSearchSuccessProps {
  data: ShadowTokenSearchResponse;
}

export function TokenSearchSuccess({ data }: TokenSearchSuccessProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const getExplorerUrl = (address: string) => {
    try {
      return `https://sonicscan.org/token/${address}`;
    } catch (error) {
      console.error("Error constructing explorer URL:", error);
      return "#";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Coins className="w-5 h-5 text-primary" />
        <h3 className="text-base font-medium">Token Search Results</h3>
        <Badge variant="secondary" className="ml-2">
          {data.count} results
        </Badge>
      </div>

      {/* Results */}
      <div className="grid gap-3">
        {data.data.map((token, index) => (
          <div
            key={`${token.address}-${index}`}
            className="bg-card rounded-lg border border-border p-4"
          >
            <div className="flex flex-col gap-3">
              {/* Token Logo, Name and Symbol */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted">
                    {token.logo ? (
                      <Image
                        src={token.logo}
                        alt={`${token.name} logo`}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <Coins className="w-5 h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{token.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {token.symbol}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">
                  Contract Address
                </span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded truncate">
                    {token.address}
                  </code>
                  <button
                    onClick={() => copyToClipboard(token.address)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Copy address"
                  >
                    {copiedAddress === token.address ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={getExplorerUrl(token.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/90 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Token Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    Decimals
                  </span>
                  <span className="font-mono">{token.decimals}</span>
                </div>
                {token.createdAt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">
                      Created
                    </span>
                    <span className="font-mono">
                      {new Date(token.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(!data.data || data.data.length === 0) && (
        <div className="bg-muted/30 rounded-md p-4 text-center text-muted-foreground">
          <p>No tokens found matching your search criteria</p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground mt-2">
        <p>
          Search results are from the Sonic chain token registry. Click the
          external link icon to view more details on SonicScan.
        </p>
      </div>
    </div>
  );
}
