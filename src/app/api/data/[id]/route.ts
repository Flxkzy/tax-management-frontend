import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/${params.id}`, {
      headers: {
        Authorization: `Bearer ${request.cookies.get("token")?.value || ""}`,
        "Content-Type": "application/json",
      },
    })

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

export async function DELETE(request: NextRequest, context: { params?: { id?: string } }) {
  try {
    const params = await context.params; // Ensure params is awaited

    if (!params?.id) {
      return new Response(JSON.stringify({ error: "Missing ID parameter" }), { status: 400 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/${params.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${request.cookies.get("token")?.value || ""}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete data");

    return new Response(JSON.stringify({ message: "Deleted successfully" }), { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ error: "An unknown error occurred" }), { status: 500 });
  }
}




