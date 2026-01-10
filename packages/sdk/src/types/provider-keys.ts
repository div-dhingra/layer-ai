// Provider Keys (BYOK - Bring Your Own Keys)

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

export interface ProviderKey {
  id: string;
  userId: string;
  provider: string;
  encryptedKey: EncryptedData;
  keyPrefix: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
