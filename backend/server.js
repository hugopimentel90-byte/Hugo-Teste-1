
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- Auth ---

// REGISTER
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }

    // Nota: Em produção, você DEVE usar bcrypt para hashear a senha.
    // const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: password, // Use hash aqui em produção
        name: name || 'Novo Usuário',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0ea5e9&color=fff`
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar conta.' });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Nota: Em produção, use bcrypt.compare(password, user.password)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// --- Boards ---
app.get('/api/boards', async (req, res) => {
  const { userId } = req.query;
  const boards = await prisma.board.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' }
  });
  res.json(boards);
});

app.post('/api/boards', async (req, res) => {
  const board = await prisma.board.create({ data: req.body });
  res.json(board);
});

app.put('/api/boards/:id', async (req, res) => {
  const board = await prisma.board.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(board);
});

app.delete('/api/boards/:id', async (req, res) => {
  await prisma.board.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- Lists ---
app.get('/api/lists', async (req, res) => {
  const { boardId } = req.query;
  const lists = await prisma.list.findMany({
    where: { boardId },
    orderBy: { order: 'asc' }
  });
  res.json(lists);
});

app.post('/api/lists', async (req, res) => {
  const list = await prisma.list.create({ data: req.body });
  res.json(list);
});

app.delete('/api/lists/:id', async (req, res) => {
  await prisma.list.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

app.put('/api/lists/:id', async (req, res) => {
    const list = await prisma.list.update({
        where: { id: req.params.id },
        data: req.body
    });
    res.json(list);
});

app.post('/api/lists/reorder', async (req, res) => {
    const { boardId, listIds } = req.body;
    // Transaction to update order
    const updates = listIds.map((id, index) => 
        prisma.list.update({
            where: { id },
            data: { order: index }
        })
    );
    await prisma.$transaction(updates);
    res.json({ success: true });
});

// --- Cards ---
app.get('/api/cards', async (req, res) => {
  const { listIds } = req.query; // Expecting comma separated IDs
  if(!listIds) return res.json([]);
  
  const ids = listIds.split(',');
  const cards = await prisma.card.findMany({
    where: { listId: { in: ids } },
    include: { labels: true, checklist: true, comments: true },
    orderBy: { order: 'asc' }
  });
  res.json(cards);
});

app.post('/api/cards', async (req, res) => {
  const card = await prisma.card.create({
    data: {
        ...req.body,
        labels: { create: [] },
        checklist: { create: [] },
        comments: { create: [] }
    },
    include: { labels: true, checklist: true, comments: true }
  });
  res.json(card);
});

app.put('/api/cards/:id', async (req, res) => {
  const { labels, checklist, comments, ...data } = req.body;
  // Simple update for fields, relations handled separately or ignored in this simple endpoint
  const card = await prisma.card.update({
    where: { id: req.params.id },
    data: data,
    include: { labels: true, checklist: true, comments: true }
  });
  res.json(card);
});

app.delete('/api/cards/:id', async (req, res) => {
  await prisma.card.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- Nested Card Items (Labels, Checklists, Comments) ---

app.post('/api/comments', async (req, res) => {
    const comment = await prisma.comment.create({ data: req.body });
    res.json(comment);
});

app.delete('/api/comments/:id', async (req, res) => {
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
});

app.post('/api/checklist', async (req, res) => {
    const item = await prisma.checklistItem.create({ data: req.body });
    res.json(item);
});

app.put('/api/checklist/:id', async (req, res) => {
    const item = await prisma.checklistItem.update({
        where: { id: req.params.id },
        data: req.body
    });
    res.json(item);
});

app.delete('/api/checklist/:id', async (req, res) => {
    await prisma.checklistItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
});

app.post('/api/cards/:id/labels', async (req, res) => {
    const { text, color } = req.body;
    const label = await prisma.label.create({
        data: {
            text, color, cardId: req.params.id
        }
    });
    res.json(label);
});

app.delete('/api/labels/:id', async (req, res) => {
    await prisma.label.delete({ where: { id: req.params.id } });
    res.json({ success: true });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
