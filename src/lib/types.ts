export type Participant = {
  uid: string;
  name: string;
};

export type Transaction = {
  id: string;
  amount: number;
  description?: string;
  payerUid: string;
  participants: string[];
  timestamp: number;
};

export type NetBalances = Record<string, number>;

export type Settlement = {
  fromUid: string;
  toUid: string;
  amount: number;
};

