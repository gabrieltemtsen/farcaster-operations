import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface RequestData {
  recipientFids: number[];
  message: string;
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { recipientFids, message }: RequestData = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_WARPCAST_API_KEY; // Ensure to set your API key in the environment variables

    if (!apiKey) {
      throw new Error("API key is not set");
    }

    const url = "https://api.warpcast.com/v2/ext-send-direct-cast";

    console.log('recipientFids:', recipientFids);

    
    const responses = await Promise.all(recipientFids.map(async (fid) => {
        console.log('fid:', fid);
      const data = {
        recipientFid: fid,
        message,
        idempotencyKey: `${fid}-${Date.now()}` // Generate a unique idempotency key
      };

      const response = await axios.put(url, data, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    }));

    return NextResponse.json({ success: true, responses });
  } catch (error: any) {
    
    return NextResponse.json({ success: false, error: error.message });
  }
}
