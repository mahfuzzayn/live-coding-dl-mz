import connectDB from "@/lib/monogdb";

export async function GET(request: Request) {

    await connectDB();
    return new Response('Hello, world!');
}