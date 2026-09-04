const BeneficioRelampago = require('../models/BeneficioRelampago');

const getBeneficiosRelampago = async (req, res) => {
  try {
    const beneficios = await BeneficioRelampago.find().sort({ fechaDesde: -1 });
    res.json(beneficios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener beneficios relámpago', error: error.message });
  }
};

const getBeneficioRelampagoById = async (req, res) => {
  try {
    const beneficio = await BeneficioRelampago.findById(req.params.id);
    if (!beneficio) return res.status(404).json({ mensaje: 'Beneficio relámpago no encontrado' });
    res.json(beneficio);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener beneficio relámpago', error: error.message });
  }
};

const createBeneficioRelampago = async (req, res) => {
  try {
    const beneficio = await BeneficioRelampago.create(req.body);
    res.status(201).json(beneficio);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear beneficio relámpago', error: error.message });
  }
};

const updateBeneficioRelampago = async (req, res) => {
  try {
    const beneficio = await BeneficioRelampago.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!beneficio) return res.status(404).json({ mensaje: 'Beneficio relámpago no encontrado' });
    res.json(beneficio);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar beneficio relámpago', error: error.message });
  }
};

const deleteBeneficioRelampago = async (req, res) => {
  try {
    const beneficio = await BeneficioRelampago.findByIdAndDelete(req.params.id);
    if (!beneficio) return res.status(404).json({ mensaje: 'Beneficio relámpago no encontrado' });
    res.json({ mensaje: 'Beneficio relámpago eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar beneficio relámpago', error: error.message });
  }
};

module.exports = { getBeneficiosRelampago, getBeneficioRelampagoById, createBeneficioRelampago, updateBeneficioRelampago, deleteBeneficioRelampago };
