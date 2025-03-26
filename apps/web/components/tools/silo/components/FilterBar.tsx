"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedNetwork: string;
  setSelectedNetwork: (network: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  networks: string[];
  onCancel?: () => void;
  className?: string;
}

export const FilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedNetwork,
  setSelectedNetwork,
  sortOption,
  setSortOption,
  networks,
  className,
}: FilterBarProps) => {
  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 ${className || ""}`}
    >
      <div className="w-full sm:w-auto sm:flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search markets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 w-full"
        />
      </div>

      <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 w-full sm:w-auto">
        <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Networks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Networks</SelectItem>
            {networks.map((chain) => (
              <SelectItem key={chain} value={chain}>
                {chain.charAt(0).toUpperCase() + chain.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tvl-desc">TVL: High to Low</SelectItem>
            <SelectItem value="tvl-asc">TVL: Low to High</SelectItem>
            <SelectItem value="depositApr-desc">
              Deposit APR: High to Low
            </SelectItem>
            <SelectItem value="depositApr-asc">
              Deposit APR: Low to High
            </SelectItem>
            <SelectItem value="borrowApr-desc">
              Borrow APR: High to Low
            </SelectItem>
            <SelectItem value="borrowApr-asc">
              Borrow APR: Low to High
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
