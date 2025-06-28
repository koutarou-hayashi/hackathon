// next-auth.d.ts
import { DefaultSession, DefaultJWT } from "next-auth";

// Sessionにカスタムプロパティを追加
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // ここでidプロパティを追加
    } & DefaultSession["user"]; // 既存のDefaultSessionのuserプロパティも結合
  }
}

// JWTにカスタムプロパティを追加
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string; // JWTトークンにaccessTokenを追加
    // 必要に応じて、他のカスタムプロパティもここに追加
  }
}