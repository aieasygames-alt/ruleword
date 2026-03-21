#!/usr/bin/env node
/**
 * Decap CMS 本地代理服务器
 * 用于本地开发时连接 Git 仓库
 */
import { createServer } from 'http'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = join(__dirname, 'src', 'content', 'games')

// 确保内容目录存在
if (!existsSync(CONTENT_DIR)) {
  mkdirSync(CONTENT_DIR, { recursive: true })
}

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  const url = new URL(req.url || '', `http://localhost:4321`)

  try {
    // GET /api/v1/files - 获取所有文件列表
    if (url.pathname === '/api/v1/files' && req.method === 'GET') {
      const files = existsSync(CONTENT_DIR)
        ? require('fs').readdirSync(CONTENT_DIR)
            .filter(f => f.endsWith('.json'))
            .map(f => ({ path: `src/content/games/${f}`, sha: Date.now().toString() }))
        : []

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(files))
      return
    }

    // GET /api/v1/file - 获取单个文件
    if (url.pathname === '/api/v1/file' && req.method === 'GET') {
      const path = url.searchParams.get('path')
      if (path && existsSync(join(__dirname, path))) {
        const content = readFileSync(join(__dirname, path), 'utf-8')
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ content: btoa(content) }))
        return
      }
      res.writeHead(404)
      res.end('File not found')
      return
    }

    // PUT /api/v1/file - 保存文件
    if (url.pathname === '/api/v1/file' && req.method === 'PUT') {
      let body = ''
      req.on('data', chunk => body += chunk)
      req.on('end', () => {
        try {
          const data = JSON.parse(body)
          const { path, content } = data
          const decodedContent = atob(content)

          const filePath = join(__dirname, path)
          const dir = dirname(filePath)
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true })
          }

          writeFileSync(filePath, decodedContent)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true }))
        } catch (err) {
          res.writeHead(500)
          res.end(err.message)
        }
      })
      return
    }

    res.writeHead(404)
    res.end('Not found')
  } catch (err) {
    res.writeHead(500)
    res.end(err.message)
  }
})

const PORT = 4321
server.listen(PORT, () => {
  console.log(`🚀 CMS Proxy running at http://localhost:${PORT}`)
  console.log(`📁 Content directory: ${CONTENT_DIR}`)
})
