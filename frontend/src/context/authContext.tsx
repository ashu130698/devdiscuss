import { createContext } from "react";

export type User = {
  _id: string;
  name: string;
  email: string;
};

export type AuthContextType = {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
