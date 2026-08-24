const Beneficio = require('../models/Beneficio');
const Membresia = require('../models/Membresia');

const getBeneficios = async (req, res) => {
  try {
    const beneficios = await Beneficio.find().sort({ categoria: 1, nombre: 1 });
    res.json(beneficios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener beneficios', error: error.message });
  }
};

const getBeneficioById = async (req, res) => {
  try {
    const beneficio = await Beneficio.findById(req.params.id);
    if (!beneficio) return res.status(404).json({ mensaje: 'Beneficio no encontrado' });
    res.json(beneficio);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener beneficio', error: error.message });
  }
};

const createBeneficio = async (req, res) => {
  try {
    const beneficio = await Beneficio.create(req.body);
    res.status(201).json(beneficio);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear beneficio', error: error.message });
  }
};

const updateBeneficio = async (req, res) => {
  try {
    const beneficio = await Beneficio.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!beneficio) return res.status(404).json({ mensaje: 'Beneficio no encontrado' });
    res.json(beneficio);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar beneficio', error: error.message });
  }
};

const deleteBeneficio = async (req, res) => {
  try {
    const beneficio = await Beneficio.findByIdAndDelete(req.params.id);
    if (!beneficio) return res.status(404).json({ mensaje: 'Beneficio no encontrado' });

    // Remover referencia de todas las membresías que lo tenían
    await Membresia.updateMany(
      { beneficios: req.params.id },
      { $pull: { beneficios: req.params.id } }
    );

    res.json({ mensaje: 'Beneficio eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar beneficio', error: error.message });
  }
};

module.exports = { getBeneficios, getBeneficioById, createBeneficio, updateBeneficio, deleteBeneficio };
