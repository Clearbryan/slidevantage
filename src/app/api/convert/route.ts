import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readdir, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  try {
    const { fileUrl } = await req.json()
    if (!fileUrl) return NextResponse.json({ error: 'fileUrl required' }, { status: 400 })

    if (!fileUrl.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'Only local uploads supported' }, { status: 400 })
    }

    const filename  = path.basename(fileUrl)
    const ext       = path.extname(filename).toLowerCase()
    if (!['.pptx', '.ppt', '.odp', '.pdf'].includes(ext)) {
      return NextResponse.json({ error: `Format ${ext} not supported for preview` }, { status: 400 })
    }

    const uploadsDir  = path.join(process.cwd(), 'public', 'uploads')
    const inputFile   = path.join(uploadsDir, filename)
    const previewsDir = path.join(uploadsDir, 'previews')
    const stem        = filename.replace(/\.[^.]+$/, '')
    const outDir      = path.join(previewsDir, stem)

    if (!existsSync(inputFile)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Return cached previews if already generated
    if (existsSync(outDir)) {
      const existing = (await readdir(outDir)).filter(f => f.endsWith('.png')).sort()
      if (existing.length > 0) {
        return NextResponse.json({
          images: existing.map(f => `/uploads/previews/${stem}/${f}`)
        })
      }
    }

    await mkdir(outDir, { recursive: true })

    // Step 1: PPTX → PDF via LibreOffice
    await execAsync(
      `libreoffice --headless --convert-to pdf --outdir "${outDir}" "${inputFile}"`,
      { timeout: 60000 }
    )

    const afterConvert = await readdir(outDir)
    const pdfFile      = afterConvert.find(f => f.endsWith('.pdf'))
    if (!pdfFile) return NextResponse.json({ error: 'PDF conversion failed' }, { status: 500 })

    const pdfPath = path.join(outDir, pdfFile)

    // Step 2: PDF → PNG per page via ImageMagick
    await execAsync(
      `convert -density 150 -background white -alpha remove -alpha off "${pdfPath}" -quality 85 "${path.join(outDir, 'slide-%03d.png')}"`,
      { timeout: 120000 }
    )

    const generated = (await readdir(outDir)).filter(f => f.endsWith('.png')).sort()
    if (!generated.length) return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })

    return NextResponse.json({
      images: generated.map(f => `/uploads/previews/${stem}/${f}`)
    })
  } catch (err: any) {
    console.error('[convert]', err.message)
    return NextResponse.json({ error: err.message || 'Conversion failed' }, { status: 500 })
  }
}
