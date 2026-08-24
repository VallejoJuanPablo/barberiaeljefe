const Marca = require('../models/Marca');

const getMarcas = async (req, res) => {
  try {
    const marcas = await Marca.find().sort({ orden: 1, nombre: 1 });
    res.json(marcas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener marcas', error: error.message });
  }
};

const getMarcaById = async (req, res) => {
  try {
    const marca = await Marca.findById(req.params.id);
    if (!marca) return res.status(404).json({ mensaje: 'Marca no encontrada' });
    res.json(marca);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener marca', error: error.message });
  }
};

const createMarca = async (req, res) => {
  try {
    const marca = await Marca.create(req.body);
    res.status(201).json(marca);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear marca', error: error.message });
  }
};

const updateMarca = async (req, res) => {
  try {
    const marca = await Marca.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!marca) return res.status(404).json({ mensaje: 'Marca no encontrada' });
    res.json(marca);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar marca', error: error.message });
  }
};

const deleteMarca = async (req, res) => {
  try {
    const marca = await Marca.findByIdAndDelete(req.params.id);
    if (!marca) return res.status(404).json({ mensaje: 'Marca no encontrada' });
    res.json({ mensaje: 'Marca eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar marca', error: error.message });
  }
};

module.exports = { getMarcas, getMarcaById, createMarca, updateMarca, deleteMarca };
