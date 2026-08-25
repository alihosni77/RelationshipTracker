export type MessageKind = 'normal' | 'encrypted' | 'time_capsule';

export type LocationShareMode = 'off' | 'while_open' | 'one_hour' | 'until_midnight' | 'continuous';

export interface Couple {
  id: string;
  memberA: string;
  memberB: string;
  createdAt: string;
}

export interface RelationshipMessage {
  id: string;
  coupleId: string;
  senderId: string;
  kind: MessageKind;
  ciphertext?: string;
  plaintext?: string;
  unlockAt?: string;
  createdAt: string;
}

export interface SharedEvent {
  id: string;
  coupleId: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  notes?: string;
}

export interface LoveTapEvent {
  id: string;
  coupleId: string;
  senderId: string;
  createdAt: string;
}

export interface RelationshipRating {
  id: string;
  coupleId: string;
  raterId: string;
  category: string;
  value: number;
  createdAt: string;
}
