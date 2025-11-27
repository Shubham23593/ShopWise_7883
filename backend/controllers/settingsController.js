export const getSettings = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        storeName: 'ShopWise',
        storeEmail: 'support@shopwise.com'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default { getSettings };