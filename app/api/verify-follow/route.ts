import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest, res: NextResponse) {
    try {
    const body = await req.json();
    const { user, frameData } = body;
    const userFid = user.fid;
    const author = frameData.fid;

    let url = `https://api.pinata.cloud/v3/farcaster/users?fid=${userFid}&following=true`;
    const options = {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
    };

    let isFollowing = false;
    let hasMoreData = true;
    let nextCursor = null;

    // Array to store promises for concurrent requests
    const fetchPromises = [];

    // Function to fetch a page of data
    const fetchData = async (cursor) => {
      const response = await axios.get(url, {
        ...options,
        params: cursor ? { cursor } : {},
      });
      return response.data;
    };

    // Fetch the first page of data
    let data = await fetchData(null);
    let count = 0;

    while (hasMoreData) {
      // Check if userFid is in the list of followers
      console.log(++count)
      if (data.users.some(follow => follow.user.fid === author)) {
        isFollowing = true;
        break;
      }

      // If there's more data, prepare to fetch the next page
      if (data.next && data.next.cursor) {
        nextCursor = data.next.cursor;
        fetchPromises.push(fetchData(nextCursor));

        // Fetch next batch in parallel
        if (fetchPromises.length >= 5) { // You can adjust the batch size as needed
          const results = await Promise.all(fetchPromises);
          fetchPromises.length = 0; // Clear the promises array
          for (const result of results) {
            if (result.users.some(follow => follow.user.fid === author)) {
              isFollowing = true;
              hasMoreData = false;
              break;
            }
            if (result.next && result.next.cursor) {
              nextCursor = result.next.cursor;
              fetchPromises.push(fetchData(nextCursor));
            } else {
              hasMoreData = false;
            }
          }
        }
      } else {
        hasMoreData = false;
      }

      if (isFollowing) {
        break;
      }

      // Fetch the next page of data
      if (fetchPromises.length === 0 && nextCursor) {

        data = await fetchData(nextCursor);
      }
    }

    if (isFollowing) {
      console.log('User is following');
      return NextResponse.json({ success: true, isFollowing: isFollowing });
    } else {
      console.log('User is not following');
      return NextResponse.json({ success: false });
    }

  } catch (error) {
    console.error('error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
