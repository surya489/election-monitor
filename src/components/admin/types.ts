import type { FormEvent } from "react";
import type { Toast } from "@/components/shared/types";

export type ResultNominee = {
  id: string;
  abbreviation: string;
  name: string;
  fullName: string;
  party: string;
  leader: string;
  symbol: string;
  voteCount: number;
};

export type ElectionResults = {
  totalVotes: number;
  nominees: ResultNominee[];
};

export type { Toast };

export type LoginFormSubmit = (event?: FormEvent<HTMLFormElement>) => void;
