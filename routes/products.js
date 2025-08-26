const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// ROTA: GET /api/products - Obter todos os produtos
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos.', error: error.message });
  }
});

// ROTA: GET /api/products/:id - Obter um produto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar o produto.', error: error.message });
  }
});

// ROTA: POST /api/products - Adicionar um novo produto (espera uma imageUrl no corpo)
router.post('/', protect, admin, async (req, res) => {
  const { name, description, price, category, imageUrl, inStock, isFeatured } = req.body;

  try {
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      imageUrl, // Usando a URL do corpo da requisição
      inStock,
      isFeatured,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar produto.', error: error.message });
  }
});

// ROTA: PUT /api/products/:id - Atualizar um produto (espera uma imageUrl no corpo)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body, // O corpo da requisição já contém a nova imageUrl, se houver
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Produto não encontrado para atualização.' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar produto.', error: error.message });
  }
});

// ROTA: DELETE /api/products/:id - Deletar um produto
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Produto não encontrado para deletar.' });
    }
    res.json({ message: 'Produto deletado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar produto.', error: error.message });
  }
});

module.exports = router;
