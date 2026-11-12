export type RecordStatus =
  'QUEUED' | 'CAPTURING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role?: 'LAWYER' | 'COMMON_USER';
};

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
};

export type EvidenceRecord = {
  id: string;
  title: string;
  url: string;
  status: RecordStatus;
  progress?: number;
  createdAt: string;
};
