const Empresa = require('../models/Empresa');
const Cliente = require('../models/Cliente');

// GET /api/empresas
const getEmpresas = async (req, res) => {
  try {
    const empresas = await Empresa.find().populate('membresiaId').sort({ createdAt: -1 });

    // Agregar conteo de empleados asignados a cada empresa
    const result = await Promise.all(
      empresas.map(async (emp) => {
        const asignados = await Cliente.countDocuments({ empresaId: emp._id, deletedAt: null });
        const obj = emp.toObject();
        obj.asignados = asignados;
        return obj;
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener empresas', error: error.message });
  }
};

// GET /api/empresas/:id
const getEmpresaById = async (req, res) => {
  try {
    const empresa = await Empresa.findById(req.params.id).populate('membresiaId');
    if (!empresa) {
      return res.status(404).json({ mensaje: 'Empresa no encontrada' });
    }

    const asignados = await Cliente.countDocuments({ empresaId: empresa._id, deletedAt: null });
    const obj = empresa.toObject();
    obj.asignados = asignados;

    res.json(obj);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la empresa', error: error.message });
  }
};

// POST /api/empresas
const createEmpresa = async (req, res) => {
  try {
    const empresa = new Empresa(req.body);
    await empresa.save();
    res.status(201).json(empresa);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe una empresa con ese código' });
    }
    if (error.name === 'ValidationError') {
      const campos = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ mensaje: campos.join('. ') });
    }
    res.status(500).json({ mensaje: 'Error al crear la empresa. Intentá de nuevo.' });
  }
};

// PUT /api/empresas/:id
const updateEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findById(req.params.id);
    if (!empresa) {
      return res.status(404).json({ mensaje: 'Empresa no encontrada' });
    }

    // Si se reduce el pack, verificar que no haya más empleados asignados que el nuevo cupo
    if (req.body.pack && req.body.pack < empresa.pack) {
      const asignados = await Cliente.countDocuments({ empresaId: empresa._id, deletedAt: null });
      if (asignados > req.body.pack) {
        return res.status(400).json({
          mensaje: `No se puede reducir el pack a ${req.body.pack}. Hay ${asignados} empleados asignados. Desvinculá empleados primero.`
        });
      }
    }

    Object.assign(empresa, req.body);
    await empresa.save();
    res.json(empresa);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe una empresa con ese código' });
    }
    if (error.name === 'ValidationError') {
      const campos = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ mensaje: campos.join('. ') });
    }
    res.status(500).json({ mensaje: 'Error al actualizar la empresa. Intentá de nuevo.' });
  }
};

// DELETE /api/empresas/:id
const deleteEmpresa = async (req, res) => {
  try {
    const asignados = await Cliente.countDocuments({ empresaId: req.params.id, deletedAt: null });
    if (asignados > 0) {
      return res.status(400).json({
        mensaje: `No se puede eliminar. Hay ${asignados} cliente(s) asignados. Desvinculalos primero.`
      });
    }

    const empresa = await Empresa.findByIdAndDelete(req.params.id);
    if (!empresa) {
      return res.status(404).json({ mensaje: 'Empresa no encontrada' });
    }
    res.json({ mensaje: 'Empresa eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la empresa', error: error.message });
  }
};

// PUT /api/empresas/:id/pago — Registrar pago mensual
const registrarPago = async (req, res) => {
  try {
    const empresa = await Empresa.findByIdAndUpdate(
      req.params.id,
      { ultimoPago: new Date(), estado: 'activa' },
      { new: true }
    );
    if (!empresa) {
      return res.status(404).json({ mensaje: 'Empresa no encontrada' });
    }
    res.json({ mensaje: 'Pago registrado correctamente', empresa });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar el pago', error: error.message });
  }
};

// PUT /api/empresas/:id/suspender
const suspenderEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findByIdAndUpdate(
      req.params.id,
      { estado: 'suspendida' },
      { new: true }
    );
    if (!empresa) {
      return res.status(404).json({ mensaje: 'Empresa no encontrada' });
    }
    res.json({ mensaje: 'Empresa suspendida', empresa });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al suspender la empresa', error: error.message });
  }
};

// GET /api/empresas/:id/empleados — Clientes asignados a una empresa
const getEmpleados = async (req, res) => {
  try {
    const clientes = await Cliente.find({ empresaId: req.params.id, deletedAt: null })
      .sort({ nombre: 1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener empleados', error: error.message });
  }
};

module.exports = {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  registrarPago,
  suspenderEmpresa,
  getEmpleados
};
