import type { FormEvent } from "react";

export type AuthMode = "login" | "signup";

export type Nominee = {
  id: string;
  abbreviation: string;
  name: string;
  fullName: string;
  party: string;
  leader: string;
  symbol: string;
  voteCount: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthFormSubmit = (event?: FormEvent<HTMLFormElement>) => void;

