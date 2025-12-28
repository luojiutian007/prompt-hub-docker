const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
// 尝试加载 sharp，如果安装失败则降级处理
let sharp;
try { sharp = require('sharp'); } catch (e) { console.warn("Sharp 未安装，将跳过图片压缩功能"); }

const app = express();
const PORT = 3000;

// ================= 1. 纯文件数据库配置 =================
const uploadDir = path.join(__dirname, '../uploads');
const thumbDir = path.join(__dirname, '../uploads/thumbs');
const dataDir = path.join(__dirname, '../data');
const dbFile = path.join(dataDir, 'database.json');

// 确保目录存在
fs.ensureDirSync(uploadDir);
fs.ensureDirSync(thumbDir);
fs.ensureDirSync(dataDir);

// 数据库读写助手函数
const getDB = () => {
    if (!fs.existsSync(dbFile)) {
        fs.writeJsonSync(dbFile, []); // 初始化空数组
    }
    return fs.readJsonSync(dbFile);
};

const saveDB = (data) => {
    fs.writeJsonSync(dbFile, data, { spaces: 2 });
};

// ================= 2. 中间件与上传配置 =================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(uploadDir));

// ================= 3. API 接口 (JSON版) =================

// 获取所有数据
app.get('/api/prompts', (req, res) => {
    try {
        const data = getDB();
        // 按更新时间倒序排列
        data.sort((a, b) => new Date(b.updatedTime || 0) - new Date(a.updatedTime || 0));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 保存/更新数据
app.post('/api/prompts', (req, res) => {
    try {
        const item = req.body;
        const db = getDB();
        
        // 确保数据结构完整
        if (!item.history) item.history = [];
        
        if (item.id) {
            // 更新现有逻辑：查找并替换
            const idx = db.findIndex(p => p.id === item.id);
            if (idx !== -1) {
                db[idx] = { ...db[idx], ...item, updatedTime: Date.now() };
                saveDB(db);
                return res.json({ status: 'updated', id: item.id });
            }
        }
        
        // 创建新逻辑
        const newItem = {
            ...item,
            id: Date.now(), // 重新分配基于服务端的时间戳ID
            createdTime: Date.now(),
            updatedTime: Date.now()
        };
        db.unshift(newItem); // 加到最前面
        saveDB(db);
        res.json({ status: 'created', id: newItem.id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 删除数据
app.delete('/api/prompts/:id', (req, res) => {
    try {
        let db = getDB();
        const initialLen = db.length;
        // 过滤掉要删除的ID (注意：前端传来的ID可能是数字也可能是字符串，做一下转换比较)
        db = db.filter(item => String(item.id) !== String(req.params.id));
        
        if (db.length !== initialLen) {
            saveDB(db);
            res.json({ status: 'deleted' });
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 文件上传接口
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).send('No file uploaded.');

        const fileUrl = `/uploads/${file.filename}`;
        
        // 如果 sharp 正常加载且是图片，则生成缩略图
        if (sharp && file.mimetype.startsWith('image/')) {
            const thumbFilename = `thumb-${file.filename}`;
            const thumbPath = path.join(thumbDir, thumbFilename);
            try {
                await sharp(file.path).resize(300).toFile(thumbPath);
                return res.json({ url: fileUrl, thumbnail: `/uploads/thumbs/${thumbFilename}`, type: file.mimetype });
            } catch (e) {
                console.warn("缩略图生成出错，降级使用原图");
            }
        }
        
        // 默认返回原图作为缩略图
        res.json({ url: fileUrl, thumbnail: fileUrl, type: file.mimetype });

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// ================= 启动服务 =================
app.listen(PORT, () => {
    console.log(`
    #############################################
    ✅ 服务启动成功 (Lite模式)
    🏠 访问地址: http://localhost:${PORT}
    📂 数据文件: /data/database.json
    #############################################
    `);
});