import React from "react";
import { Search, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { SonicSearchResult } from "@repo/de-agent";

interface SearchSuccessProps {
  data: SonicSearchResult[];
}

export function SearchSuccess({ data }: SearchSuccessProps) {
  const getExplorerUrl = (link: string) => {
    try {
      // Remove any leading slashes to avoid double slashes
      const cleanLink = link.startsWith("/") ? link.slice(1) : link;
      return `https://sonicscan.org/${cleanLink}`;
    } catch (error) {
      console.error("Error constructing explorer URL:", error);
      return "#";
    }
  };

  const getImageUrl = (img: string) => {
    try {
      if (!img) return "";
      // Check if it's already a full URL
      if (img.startsWith("http://") || img.startsWith("https://")) {
        return img;
      }
      // Handle relative URLs
      return `https://sonicscan.org${img.startsWith("/") ? "" : "/"}${img}`;
    } catch (error) {
      console.error("Error constructing image URL:", error);
      return "";
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-primary" />
        <h3 className="text-base font-medium">Search Results</h3>
      </div>

      {/* Results List */}
      <div className="grid gap-3">
        {data.map((result, index) => (
          <div
            key={`${result.address}-${index}`}
            className="bg-card rounded-lg border border-border p-4"
          >
            <div className="flex flex-col gap-3">
              {/* Title and Group */}
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <h4 className="font-medium">{result.title || "Untitled"}</h4>
                  <Badge variant="secondary" className="w-fit">
                    {result.group}
                  </Badge>
                </div>
                {result.img && (
                  <div className="relative w-8 h-8">
                    <Image
                      src={getImageUrl(result.img)}
                      alt={result.title || "Token image"}
                      className="rounded-full object-cover"
                      fill
                      sizes="32px"
                      onError={(e) => {
                        // Hide the image on error
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Address</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded truncate">
                    {result.address}
                  </code>
                  <a
                    href={getExplorerUrl(result.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/90 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Description */}
              {result.desc && (
                <div className="text-sm text-muted-foreground">
                  {result.desc}
                </div>
              )}

              {/* Additional Info */}
              <div className="flex flex-wrap gap-2 mt-1">
                {result.website && (
                  <Badge variant="outline" className="text-xs">
                    Website Available
                  </Badge>
                )}
                {result.is_checked === "1" && (
                  <Badge variant="default" className="bg-green-600 text-xs">
                    Verified
                  </Badge>
                )}
                {result.reputation && (
                  <Badge variant="secondary" className="text-xs">
                    Reputation: {result.reputation}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(!data || data.length === 0) && (
        <div className="bg-muted/30 rounded-md p-4 text-center text-muted-foreground">
          <p>No results found</p>
        </div>
      )}
    </div>
  );
}
