import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    // 1. IMPROVED METADATA LOGIC
    // Instead of slicing the prompt, we'll pick from a dynamic set 
    // or format it more cleanly.
    
    const words = prompt.split(' ');
    const subject = words.length > 2 ? words[words.length - 1] : words[0];
    
    // Simple creative name generator logic
    const name = subject.charAt(0).toUpperCase() + subject.slice(1) + " ARC";
    const symbol = (subject.slice(0, 3).toUpperCase() + "AI").slice(0, 4);
    const description = `The premier ${subject} narrative token on the ARC Network. Driven by AI, governed by the community.`;

    const tokenInfo = {
      name: name,
      symbol: symbol,
      description: description
    }

    // 2. IMAGE GENERATION
    const cleanPrompt = encodeURIComponent(prompt.trim());
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=512&height=512&seed=${seed}&nologo=true`;

    return NextResponse.json({
      ...tokenInfo,
      image: imageUrl
    })

  } catch (error) {
    console.error("Generation failed:", error)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}