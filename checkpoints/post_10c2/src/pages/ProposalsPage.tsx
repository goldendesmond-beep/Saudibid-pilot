import React from "react";
import { useSearchParams } from "react-router-dom";
import { ProposalWorkspace } from "../components/proposals/ProposalWorkspace";

export function ProposalsPage() {
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get("proposalId") || undefined;
  const tab = searchParams.get("tab") === "boq" ? "boq" : "proposals";

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <ProposalWorkspace initialProposalId={proposalId} initialTab={tab} />
    </div>
  );
}
