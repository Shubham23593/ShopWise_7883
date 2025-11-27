import Product from '../models/Product.js';

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { stock },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Stock updated',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default { updateStock };