
class ProductService {
  async getAllPhones(page = 1, limit = 12) {
    try {
      const skip = (page - 1) * limit;
      const result = await dummyJsonAPI.getAllPhones(limit, skip);
      
      if (!result.success) throw new Error(result.message);

      const transformedProducts = result.products.map(p => 
        dummyJsonAPI.transformPhoneProduct(p)
      );

      return {
        success: true,
        products: transformedProducts,
        pagination: {
          total: result.total,
          page,
          limit,
          pages: Math.ceil(result.total / limit)
        }
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getPhonesByBrand(brand, page = 1, limit = 12) {
    try {
      const result = await dummyJsonAPI.getPhonesByBrand(brand, limit);
      
      if (!result.success) throw new Error(result.message);

      const transformedProducts = result.products.map(p => 
        dummyJsonAPI.transformPhoneProduct(p)
      );

      return {
        success: true,
        products: transformedProducts,
        brand,
        total: result.total
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getPhoneById(productId) {
    try {
      const result = await dummyJsonAPI.getPhoneById(productId);
      
      if (!result.success) throw new Error(result.message);

      const transformedProduct = dummyJsonAPI.transformPhoneProduct(result.product);

      return {
        success: true,
        product: transformedProduct
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async searchPhones(query, limit = 12) {
    try {
      const result = await dummyJsonAPI.searchPhones(query, limit);
      
      if (!result.success) throw new Error(result.message);

      const transformedProducts = result.products.map(p => 
        dummyJsonAPI.transformPhoneProduct(p)
      );

      return {
        success: true,
        products: transformedProducts,
        query,
        total: result.total
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getPhoneBrands() {
    try {
      const result = await dummyJsonAPI.getPhoneBrands();
      
      if (!result.success) throw new Error(result.message);

      return {
        success: true,
        brands: result.brands,
        total: result.total
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default new ProductService();