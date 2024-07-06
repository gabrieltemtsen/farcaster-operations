import { NeynarAPIClient } from "@neynar/nodejs-sdk";

if (!process.env.NEXT_PUBLIC_NEYNAR_API_KEY) {
  throw new Error("Make sure you set NEYNAR_API_KEY in your .env files");
}

const neynarClient = new NeynarAPIClient(process.env.NEXT_PUBLIC_NEYNAR_API_KEY);

export default neynarClient;