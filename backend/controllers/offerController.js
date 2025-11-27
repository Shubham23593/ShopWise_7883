export const getAllOffers = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Offers fetched',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default { getAllOffers };