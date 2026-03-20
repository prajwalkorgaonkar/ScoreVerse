import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const headers = Object.fromEntries(request.headers)
  return NextResponse.json({ 
    headers,
    cookies: request.headers.get('cookie')
  })
}
