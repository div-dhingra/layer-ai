export enum AuthType {
  API_KEY = 'api_key',
  SESSION = 'session'
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      apiKeyId?: string;
      apiKeyHash?: string;
      authType?: AuthType;
    }
  }
}
