import { readdirSync } from "fs"
import { join } from "path"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const modelsDir = join(process.cwd(), "public", "models")
    const files = readdirSync(modelsDir)
    const glbFiles = files.filter((file) => file.toLowerCase().endsWith(".glb"))

    const models = glbFiles.map((file) => ({
      name: file.replace(".glb", ""),
      url: `/models/${file}`,
      description: "📁 Local",
      isLocal: true,
    }))

    return NextResponse.json({ models })
  } catch (error) {
    // Folder doesn't exist or other error - return empty list
    return NextResponse.json({ models: [] })
  }
}
