'use server'

import { pinata } from "@/lib/pinata"

export async function uploadMetadata(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const name = formData.get("name") as string
    const ticker = formData.get("ticker") as string
    const description = formData.get("description") as string
    
    // New Social Fields
    const twitter = formData.get("twitter") as string
    const telegram = formData.get("telegram") as string
    const website = formData.get("website") as string

    if (!file) throw new Error("No file provided");

    // 1. Upload the image
    const uploadRes = await pinata.upload.file(file)
    
    const imageUrl = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${uploadRes.IpfsHash}`;

    // 2. Upload the JSON Metadata with Socials
    const metadataRes = await pinata.upload.json({
      name: name,
      symbol: ticker,
      description: description,
      image: imageUrl,
      // We bundle these so the frontend can find them easily
      twitter: twitter || "",
      telegram: telegram || "",
      website: website || ""
    })

    return { success: true, ipfsCID: metadataRes.IpfsHash };
    
  } catch (error) {
    console.error("Upload failed details:", error)
    return { success: false, error: "Failed to upload to IPFS" }
  }
}