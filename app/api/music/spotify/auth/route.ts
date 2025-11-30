// Spotify authentication API route
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Spotify auth API implementation
  return NextResponse.json({ message: 'Spotify auth API endpoint' });
}
