const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())

const DB_FILE = path.join(__dirname, 'data.json')
const ADMIN_TOKEN = '123456'

// 第一次运行写入初始数据
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    menus: [{ id: 1, name: '客片', order: 1 }, { id: 2, name: '关于我', order: 2 }],
    categories: [{ id: 1, name: '内景', menuId: 1, order: 1 }, { id: 2, name: '外景', menuId: 1, order: 2 }],
    albums: [{ id: 1, name: '仲夏夜之梦', categoryId: 1, cover: '', order: 1 }],
    photos: [],
    nextId: 10
  }, null, 2))
}

function load() { return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) }
function save(db) { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)) }
function auth(req, res, next) {
  if (req.headers['x-admin-token'] !== ADMIN_TOKEN) return res.status(401).json({ error: '未授权' })
  next()
}

// ===== 公开接口 =====
app.get('/api/menus', (req, res) => res.json(load().menus))
app.get('/api/categories', (req, res) => res.json(load().categories.filter(c => c.menuId == req.query.menuId)))
app.get('/api/albums', (req, res) => res.json(load().albums.filter(a => a.categoryId == req.query.categoryId)))
app.get('/api/photos', (req, res) => res.json(load().photos.filter(p => p.albumId == req.query.albumId)))

// ===== 菜单 =====
app.post('/api/menus', auth, (req, res) => {
  const db = load()
  const item = { id: db.nextId++, name: req.body.name, order: db.menus.length + 1 }
  db.menus.push(item); save(db); res.json(item)
})
app.put('/api/menus/:id', auth, (req, res) => {
  const db = load()
  const item = db.menus.find(m => m.id == req.params.id)
  if (!item) return res.status(404).json({ error: '不存在' })
  if (req.body.name) item.name = req.body.name
  save(db); res.json(item)
})
app.delete('/api/menus/:id', auth, (req, res) => {
  const db = load()
  const id = Number(req.params.id)
  const catIds = db.categories.filter(c => c.menuId === id).map(c => c.id)
  const albumIds = db.albums.filter(a => catIds.includes(a.categoryId)).map(a => a.id)
  db.photos = db.photos.filter(p => !albumIds.includes(p.albumId))
  db.albums = db.albums.filter(a => !albumIds.includes(a.id))
  db.categories = db.categories.filter(c => c.menuId !== id)
  db.menus = db.menus.filter(m => m.id !== id)
  save(db); res.json({ ok: true })
})

// ===== 分类 =====
app.post('/api/categories', auth, (req, res) => {
  const db = load()
  const item = { id: db.nextId++, name: req.body.name, menuId: req.body.menuId, order: db.categories.length + 1 }
  db.categories.push(item); save(db); res.json(item)
})
app.put('/api/categories/:id', auth, (req, res) => {
  const db = load()
  const item = db.categories.find(c => c.id == req.params.id)
  if (!item) return res.status(404).json({ error: '不存在' })
  if (req.body.name) item.name = req.body.name
  save(db); res.json(item)
})
app.delete('/api/categories/:id', auth, (req, res) => {
  const db = load()
  const id = Number(req.params.id)
  const albumIds = db.albums.filter(a => a.categoryId === id).map(a => a.id)
  db.photos = db.photos.filter(p => !albumIds.includes(p.albumId))
  db.albums = db.albums.filter(a => !albumIds.includes(a.id))
  db.categories = db.categories.filter(c => c.id !== id)
  save(db); res.json({ ok: true })
})

// ===== 相册 =====
app.post('/api/albums', auth, (req, res) => {
  const db = load()
  const item = { id: db.nextId++, name: req.body.name, categoryId: req.body.categoryId, cover: req.body.cover || '', order: db.albums.length + 1 }
  db.albums.push(item); save(db); res.json(item)
})
app.put('/api/albums/:id', auth, (req, res) => {
  const db = load()
  const item = db.albums.find(a => a.id == req.params.id)
  if (!item) return res.status(404).json({ error: '不存在' })
  if (req.body.name) item.name = req.body.name
  if (req.body.cover) item.cover = req.body.cover
  save(db); res.json(item)
})
app.delete('/api/albums/:id', auth, (req, res) => {
  const db = load()
  const id = Number(req.params.id)
  db.photos = db.photos.filter(p => p.albumId !== id)
  db.albums = db.albums.filter(a => a.id !== id)
  save(db); res.json({ ok: true })
})

// ===== 照片 =====
app.post('/api/photos', auth, (req, res) => {
  const db = load()
  const item = { id: db.nextId++, albumId: req.body.albumId, url: req.body.url, order: db.photos.length + 1 }
  db.photos.push(item); save(db); res.json(item)
})
app.delete('/api/photos/:id', auth, (req, res) => {
  const db = load()
  db.photos = db.photos.filter(p => p.id != req.params.id)
  save(db); res.json({ ok: true })
})

app.listen(3000, () => console.log('后端跑在 http://localhost:3000，密码: 123456'))
