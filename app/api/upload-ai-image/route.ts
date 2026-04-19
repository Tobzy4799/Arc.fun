import { NextResponse } from 'next/server'
import axios from 'axios'
import FormData from 'form-data'

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 })
    }

    // 1. Fetch image from AI provider (Fal.ai, etc.)
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data)

    // 2. Prepare Pinata upload
    const formData = new FormData()
    // We use a generic name, or you could pass the token name in the body
    formData.append('file', buffer, { 
      filename: 'ai-token.png',
      contentType: 'image/png' 
    })

    const pinataRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
  headers: {
    ...formData.getHeaders(),
    // Use the JWT from your .env here
    Authorization: `Bearer ${process.env.PINATA_JWT}`, 
  },
})

    // This matches the result.ipfsHash expectation in your AICoinGenerator
    return NextResponse.json({ ipfsHash: pinataRes.data.IpfsHash })
    
  } catch (error: any) {
    console.error("IPFS Upload Error:", error.response?.data || error.message)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}