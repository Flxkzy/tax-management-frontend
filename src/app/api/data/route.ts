import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const parentId = searchParams.get("parentId") || null

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/data${parentId ? `?parentId=${parentId}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${request.cookies.get("token")?.value || ""}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch data")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

