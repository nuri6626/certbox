export type Certificate = {
  id: string | number;
  title: string;
  issuer: string;
  holderName: string;
  issueDate: string;
  expiryDate: string;
  category: string;
  certificateNumber: string;
  imageUrl?: string;
  score?: string;
  grade?: string;
  extraData?: Record<string, unknown>;
};