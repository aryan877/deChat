import { Cluster } from "@repo/de-agent";
import { create } from "zustand";

interface ClusterState {
  selectedCluster: Cluster;
  setSelectedCluster: (cluster: Cluster) => void;
}

export const useClusterStore = create<ClusterState>((set) => ({
  selectedCluster: "sonicBlaze" as Cluster,
  setSelectedCluster: (cluster) => set({ selectedCluster: cluster }),
}));
