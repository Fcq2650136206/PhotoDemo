const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

// 演示数据：菜单 → 分类 → 组 → 照片
let data = {
  menus: [
    { id: 1, name: '客片', order: 1 },
    { id: 2, name: '我的', order: 2 }
  ],
  categories: [
    { id: 1, name: '内景', menuId: 1, order: 1 },
    { id: 2, name: '外景', menuId: 1, order: 2 }
  ],
  albums: [
    { id: 1, name: '仲夏夜之梦', categoryId: 1, cover: '', order: 1 }
  ],
  photos: [
    { id: 1, albumId: 1, url: 'photos/仲夏夜之梦/1.jpg', order: 1 }
  ]
}

// 公开接口
app.get('/api/menus', (req, res) => res.json(data.menus))
app.get('/api/categories', (req, res) =>
  res.json(data.categories.filter(c => c.menuId == req.query.menuId)))
app.get('/api/albums', (req, res) =>
  res.json(data.albums.filter(a => a.categoryId == req.query.categoryId)))
app.get('/api/photos', (req, res) =>
  res.json(data.photos.filter(p => p.albumId == req.query.albumId)))

app.listen(3000, () => console.log('后端跑在 http://localhost:3000'))
