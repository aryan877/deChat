import { Cluster } from "@repo/de-agent";
import { create } from "zustand";

const CLUSTER_STORAGE_KEY = "selectedCluster";

// Get initial cluster from localStorage or default to sonicBlaze
const getInitialCluster = (): Cluster => {
  if (typeof window === "undefined") return "sonicBlaze";
  const stored = localStorage.getItem(CLUSTER_STORAGE_KEY);
  return (stored as Cluster) || "sonicBlaze";
};

interface ClusterState {
  selectedCluster: Cluster;
  setSelectedCluster: (cluster: Cluster) => void;
}

export const useClusterStore = create<ClusterState>((set) => ({
  selectedCluster: getInitialCluster(),
  setSelectedCluster: (cluster) => {
    localStorage.setItem(CLUSTER_STORAGE_KEY, cluster);
    set({ selectedCluster: cluster });
  },
}));
