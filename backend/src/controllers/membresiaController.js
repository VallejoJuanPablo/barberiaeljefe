const Membresia = require('../models/Membresia');

const getMembresias = async (req, res) => {
  try {
    const membresias = await Membresia.find().sort({ precio: 1 });
    res.json(membresias);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener membresías', error: error.message });
  }
};

const getMembresiaById = async (req, res) => {
  try {
    const membresia = await Membresia.findById(req.params.id);
    if (!membresia) return res.status(404).json({ mensaje: 'Membresía no encontrada' });
    res.json(membresia);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener membresía', error: error.message });
  }
};

const createMembresia = async (req, res) => {
  try {
    const membresia = await Membresia.create(req.body);
    res.status(201).json(membresia);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear membresía', error: error.message });
  }
};

const updateMembresia = async (req, res) => {
  try {
    const membresia = await Membresia.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!membresia) return res.status(404).json({ mensaje: 'Membresía no encontrada' });
    res.json(membresia);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar membresía', error: error.message });
  }
};

const deleteMembresia = async (req, res) => {
  try {
    const membresia = await Membresia.findByIdAndDelete(req.params.id);
    if (!membresia) return res.status(404).json({ mensaje: 'Membresía no encontrada' });
    res.json({ mensaje: 'Membresía eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar membresía', error: error.message });
  }
};

module.exports = { getMembresias, getMembresiaById, createMembresia, updateMembresia, deleteMembresia };
