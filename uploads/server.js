import express from 'express'
import multer from 'multer'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import pool from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const categoryId = req.query.category_id
    let categoryFolder = '插画'
    
    const categoryMap = {
      '1': 'P图',
      '2': '写真',
      '3': '视频',
      '4': '萌宠',
      '5': '宝宝',
      '6': '头像',
      '7': '海报',
      '8': '手抄报',
      '9': '插画',
      '10': 'Logo'
    }
    
    if (categoryId && categoryMap[categoryId]) {
      categoryFolder = categoryMap[categoryId]
    }
    
    const uploadDir = path.join(__dirname, 'public/images', categoryFolder)
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const title = req.body.title || 'untitled'
    const sanitizedTitle = title.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_')
    const extname = path.extname(file.originalname)
    console.log('Uploading file with title:', title, '-> filename:', sanitizedTitle + extname)
    cb(null, sanitizedTitle + extname)
  }
})

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (extname && mimetype) {
      return cb(null, true)
    } else {
      cb(new Error('只支持图片文件 (JPEG, JPG, PNG, GIF, WEBP)'))
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024
  }
})

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: '文件大小超过限制（最大20MB）' })
    }
    return res.status(400).json({ success: false, error: '文件上传错误: ' + err.message })
  } else if (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
  next()
})

app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' })
    }
    
    let finalFilename = req.file.filename
    
    if (req.body.title) {
      const title = req.body.title
      const sanitizedTitle = title.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_')
      const extname = path.extname(req.file.filename)
      const newFilename = sanitizedTitle + extname
      
      const oldPath = req.file.path
      const newPath = path.join(path.dirname(oldPath), newFilename)
      
      try {
        fs.renameSync(oldPath, newPath)
        finalFilename = newFilename
        console.log(`Renamed file from ${req.file.filename} to ${newFilename}`)
      } catch (error) {
        console.error('Failed to rename file:', error)
      }
    }
    
    const categoryId = req.query.category_id
    let categoryFolder = '插画'
    
    const categoryMap = {
      '1': 'P图',
      '2': '写真',
      '3': '视频',
      '4': '萌宠',
      '5': '宝宝',
      '6': '头像',
      '7': '海报',
      '8': '手抄报',
      '9': '插画',
      '10': 'Logo'
    }
    
    if (categoryId && categoryMap[categoryId]) {
      categoryFolder = categoryMap[categoryId]
    }
    
    const imageUrl = `http://localhost:${port}/images/${categoryFolder}/${finalFilename}`
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: finalFilename,
      category: categoryFolder
    })
  } catch (error) {
    res.status(500).json({ error: '上传失败: ' + error.message })
  }
})

app.use('/images', express.static('public/images'))

app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY sort_order ASC')
    res.json({ success: true, data: rows })
  } catch (error) {
    res.status(500).json({ error: '获取分类失败: ' + error.message })
  }
})

app.get('/api/works', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT w.*, c.name as category_name, c.icon as category_icon
      FROM works w
      JOIN categories c ON w.category_id = c.id
      ORDER BY w.created_at DESC
    `)
    res.json({ success: true, data: rows })
  } catch (error) {
    res.status(500).json({ error: '获取作品失败: ' + error.message })
  }
})

app.get('/api/works/favorites', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT w.*, c.name as category_name, c.icon as category_icon
      FROM works w
      JOIN categories c ON w.category_id = c.id
      WHERE w.is_favorite = 1
      ORDER BY w.created_at DESC
    `)
    res.json({ success: true, data: rows })
  } catch (error) {
    res.status(500).json({ error: '获取收藏作品失败: ' + error.message })
  }
})

app.get('/api/works/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT w.*, c.name as category_name, c.icon as category_icon
      FROM works w
      JOIN categories c ON w.category_id = c.id
      WHERE w.id = ?
    `, [req.params.id])
    
    if (rows.length === 0) {
      return res.status(404).json({ error: '作品不存在' })
    }
    
    res.json({ success: true, data: rows[0] })
  } catch (error) {
    res.status(500).json({ error: '获取作品失败: ' + error.message })
  }
})

app.post('/api/works', async (req, res) => {
  try {
    const { title, category_id, image_url, prompt } = req.body
    
    if (!title || !category_id || !image_url || !prompt) {
      return res.status(400).json({ error: '缺少必要字段' })
    }
    
    const [result] = await pool.query(
      'INSERT INTO works (title, category_id, image_url, prompt) VALUES (?, ?, ?, ?)',
      [title, category_id, image_url, prompt]
    )
    
    const [rows] = await pool.query(`
      SELECT w.*, c.name as category_name, c.icon as category_icon
      FROM works w
      JOIN categories c ON w.category_id = c.id
      WHERE w.id = ?
    `, [result.insertId])
    
    res.json({ success: true, data: rows[0] })
  } catch (error) {
    res.status(500).json({ error: '创建作品失败: ' + error.message })
  }
})

app.put('/api/works/:id', async (req, res) => {
  try {
    const { title, category_id, image_url, prompt } = req.body
    const [result] = await pool.query(
      'UPDATE works SET title = ?, category_id = ?, image_url = ?, prompt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, category_id, image_url, prompt, req.params.id]
    )
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '作品不存在' })
    }
    
    const [rows] = await pool.query(`
      SELECT w.*, c.name as category_name, c.icon as category_icon
      FROM works w
      JOIN categories c ON w.category_id = c.id
      WHERE w.id = ?
    `, [req.params.id])
    
    res.json({ success: true, data: rows[0] })
  } catch (error) {
    res.status(500).json({ error: '更新作品失败: ' + error.message })
  }
})

app.put('/api/works/:id/favorite', async (req, res) => {
  try {
    const { is_favorite } = req.body
    console.log(`更新作品 ${req.params.id} 的收藏状态为: ${is_favorite}`)
    const [result] = await pool.query(
      'UPDATE works SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [is_favorite ? 1 : 0, req.params.id]
    )
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '作品不存在' })
    }
    
    const [rows] = await pool.query(`
      SELECT w.*, c.name as category_name, c.icon as category_icon
      FROM works w
      JOIN categories c ON w.category_id = c.id
      WHERE w.id = ?
    `, [req.params.id])
    
    console.log(`作品 ${req.params.id} 收藏状态更新成功`)
    res.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error('更新收藏状态失败:', error)
    res.status(500).json({ error: '更新收藏状态失败: ' + error.message })
  }
})

app.delete('/api/works/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT image_url FROM works WHERE id = ?', [req.params.id])
    
    if (rows.length === 0) {
      return res.status(404).json({ error: '作品不存在' })
    }
    
    const imageUrl = rows[0].image_url
    
    const [result] = await pool.query('DELETE FROM works WHERE id = ?', [req.params.id])
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '作品不存在' })
    }
    
    if (imageUrl && imageUrl.includes('/images/')) {
      const imagePath = imageUrl.split('/images/')[1]
      const filePath = path.join(__dirname, 'public/images', imagePath)
      
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          console.log(`Deleted image: ${imagePath}`)
        }
      } catch (error) {
        console.error(`Failed to delete image: ${error.message}`)
      }
    }
    
    res.json({ success: true, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ error: '删除作品失败: ' + error.message })
  }
})

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`)
})