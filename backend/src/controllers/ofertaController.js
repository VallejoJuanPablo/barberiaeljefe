const OfertaRelampago = require('../models/OfertaRelampago');

const getOfertas = async (req, res) => {
  try {
    const ofertas = await OfertaRelampago.find().sort({ fechaDesde: -1 });
    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener ofertas', error: error.message });
  }
};

const getOfertaById = async (req, res) => {
  try {
    const oferta = await OfertaRelampago.findById(req.params.id);
    if (!oferta) return res.status(404).json({ mensaje: 'Oferta no encontrada' });
    res.json(oferta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener oferta', error: error.message });
  }
};

const createOferta = async (req, res) => {
  try {
    const oferta = await OfertaRelampago.create(req.body);
    res.status(201).json(oferta);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear oferta', error: error.message });
  }
};

const updateOferta = async (req, res) => {
  try {
    const oferta = await OfertaRelampago.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!oferta) return res.status(404).json({ mensaje: 'Oferta no encontrada' });
    res.json(oferta);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar oferta', error: error.message });
  }
};

const deleteOferta = async (req, res) => {
  try {
    const oferta = await OfertaRelampago.findByIdAndDelete(req.params.id);
    if (!oferta) return res.status(404).json({ mensaje: 'Oferta no encontrada' });
    res.json({ mensaje: 'Oferta eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar oferta', error: error.message });
  }
};

module.exports = { getOfertas, getOfertaById, createOferta, updateOferta, deleteOferta };
