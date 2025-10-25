"use client"
import { useEffect, useRef, useState } from "react"
import type React from "react"

interface Model {
  name: string
  url: string
  description: string
  isLocal?: boolean
}

export default function ModelViewer() {
  const [currentModel, setCurrentModel] = useState<string>("")
  const [currentModelName, setCurrentModelName] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [uploadedModels, setUploadedModels] = useState<Model[]>([])
  const [localModels, setLocalModels] = useState<Model[]>([])
  const modelViewerRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultModels: Model[] = [
  ]

  useEffect(() => {
    const loadLocalModels = async () => {
      try {
        const response = await fetch("/api/models")
        if (response.ok) {
          const data = await response.json()
          setLocalModels(data.models || [])
        }
      } catch (err) {
        console.log("[v0] Failed to load local models:", err)
      }
    }
    loadLocalModels()
  }, [])

  const allModels = [...defaultModels, ...localModels, ...uploadedModels]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".glb")) {
      setError("Chỉ hỗ trợ file .glb")
      return
    }

    const blobUrl = URL.createObjectURL(file)
    const modelName = file.name.replace(".glb", "")
    const newModel: Model = {
      name: modelName,
      url: blobUrl,
      description: "📁 Local",
      isLocal: true,
    }

    setUploadedModels([...uploadedModels, newModel])
    handleModelSelect(newModel)
    setError("")

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Initialize with first model
  useEffect(() => {
    if (allModels.length > 0) {
      setCurrentModel(allModels[0].url)
      setCurrentModelName(allModels[0].name)
    }
  }, [])

  // Load model-viewer script
  useEffect(() => {
    const script = document.createElement("script")
    script.type = "module"
    script.src = "https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js"
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    const modelViewer = modelViewerRef.current
    if (!modelViewer) return

    const handleLoad = () => {
      setLoading(false)
      setError("")
    }

    const handleError = () => {
      setLoading(false)
      setError("Không thể tải model. Vui lòng thử lại.")
    }

    // Attach listeners
    modelViewer.addEventListener("load", handleLoad)
    modelViewer.addEventListener("error", handleError)

    // Timeout fallback
    const timeoutId = setTimeout(() => {
      setLoading(false)
    }, 8000)

    return () => {
      clearTimeout(timeoutId)
      modelViewer.removeEventListener("load", handleLoad)
      modelViewer.removeEventListener("error", handleError)
    }
  }, [currentModel])

  const handleModelSelect = (model: Model) => {
    setCurrentModel(model.url)
    setCurrentModelName(model.name)
    setLoading(true)
    setError("")
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-cyan-500/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">AR Model Viewer</h1>
              <p className="text-cyan-400/80 text-sm">Khám phá các mô hình 3D tương tác</p>
            </div>
            <div className="text-right">
              <div className="text-cyan-400 text-sm font-mono">{currentModelName && `[${currentModelName}]`}</div>
            </div>
          </div>

          <div className="mb-4 flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300 text-sm font-semibold"
            >
              + Thêm file GLB
            </button>
            <input ref={fileInputRef} type="file" accept=".glb" onChange={handleFileUpload} className="hidden" />
            {uploadedModels.length > 0 && (
              <div className="text-cyan-400/60 text-sm flex items-center">{uploadedModels.length} file đã tải</div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {allModels.map((model) => (
              <button
                key={model.name}
                onClick={() => handleModelSelect(model)}
                className={`group relative px-4 py-3 rounded-lg transition-all duration-300 ${
                  currentModelName === model.name
                    ? "bg-cyan-500/20 border border-cyan-400 shadow-lg shadow-cyan-500/50"
                    : "bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800"
                }`}
              >
                <div className="text-left">
                  <div className="text-white font-semibold text-sm">{model.name}</div>
                  <div className="text-slate-400 text-xs mt-1">{model.description}</div>
                </div>
                {currentModelName === model.name && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {error && <div className="text-red-400 text-sm mt-4 font-mono">{error}</div>}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {/* Grid background effect */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, 0.05) 25%, rgba(0, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.05) 75%, rgba(0, 255, 255, 0.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, 0.05) 25%, rgba(0, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.05) 75%, rgba(0, 255, 255, 0.05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-cyan-400 font-mono text-sm">Đang tải model...</p>
            </div>
          </div>
        )}

        {/* Model viewer */}
        {currentModel && (
          <model-viewer
            ref={modelViewerRef}
            src={currentModel}
            alt="3D Model"
            auto-rotate
            camera-controls
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        )}
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md border-t border-cyan-500/30 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-slate-300">
              <span className="text-cyan-400 font-mono">→</span> Kéo để xoay
            </div>
            <div className="text-slate-300">
              <span className="text-cyan-400 font-mono">⊕</span> Cuộn để phóng to/thu nhỏ
            </div>
            <div className="text-slate-300">
              <span className="text-cyan-400 font-mono">◉</span> Tự động xoay được bật
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
