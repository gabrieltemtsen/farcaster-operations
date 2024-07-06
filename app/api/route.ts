import { NextResponse,NextRequest } from 'next/server';
import neynarClient from "../utils/neynarClient";
import { NeynarFrameCreationRequest } from '@neynar/nodejs-sdk/build/neynar-api/v2';

export async function POST(req: NextRequest) {
    if (!process.env.SIGNER_UUID) {
      throw new Error("Make sure you set SIGNER_UUID in your .env file");
    }
  
    try {
      const body = await req.text();
      const hookData = JSON.parse(body);
      const creationRequest: NeynarFrameCreationRequest = {
        name: `gm ${hookData.data.author.username}`,
        pages: [
          {
            image: {
              url: "https://moralis.io/wp-content/uploads/web3wiki/638-gm/637aeda23eca28502f6d3eae_61QOyzDqTfxekyfVuvH7dO5qeRpU50X-Hs46PiZFReI.jpeg",
              aspect_ratio: "1:1",
            },
            title: "Page title",
            buttons: [],
            input: {
              text: {
                enabled: false,
              },
            },
            uuid: "gm",
            version: "vNext",
          },
        ],
      };
      
      const frame = await neynarClient.publishNeynarFrame(creationRequest);
  
      const reply = await neynarClient.publishCast(
        process.env.SIGNER_UUID,
        `gm ${hookData.data.author.username}`,
        {
          replyTo: hookData.data.hash,
          embeds: [
            {
              url: frame.link,
            },
          ],
        }
      );
  
      console.log("reply:", reply);
  
      return NextResponse.json({ status: 'success', reply });
    } catch (error: any) {
      console.error("Error publishing cast:", error);
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
  }
