export type RecordStatus =
  'QUEUED' | 'CAPTURING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'LAWYER' | 'COMMON';
};

export type CreditPackage = {
  id: number;
  name: string;
  credits: number;
  pricePerCreditCents: number;
  benefitsDescription: string;
};

export type CreditBilling = {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  postalCode: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type CreditPurchase = {
  id: number;
  packageId: number;
  totalCents: number;
  status: string;
  createdAt: string;
};

export type EvidenceRecord = {
  id: string;
  title: string;
  url: string;
  status: RecordStatus;
  progress?: number;
  createdAt: string;
};
