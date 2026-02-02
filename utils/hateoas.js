// HATEOAS (Hypermedia as the Engine of Application State) Utility
// Adds hypermedia links to API responses

const BASE_URL = process.env.API_BASE_URL || '';

/**
 * Add HATEOAS links to a single product
 */
function addProductLinks(product, baseUrl = BASE_URL) {
  const productData = product.toJSON ? product.toJSON() : product;

  return {
    ...productData,
    _links: {
      self: { href: `${baseUrl}/api/v1/products/${productData.id}` },
      collection: { href: `${baseUrl}/api/v1/products` },
      quantity: { href: `${baseUrl}/api/v1/products/${productData.id}/quantity` },
      category: productData.categoryId
        ? { href: `${baseUrl}/api/v1/categories/${productData.categoryId}` }
        : null,
      brand: productData.brandId
        ? { href: `${baseUrl}/api/v1/brands/${productData.brandId}` }
        : null,
      color: productData.colorId
        ? { href: `${baseUrl}/api/v1/colors/${productData.colorId}` }
        : null,
      size: productData.sizeId
        ? { href: `${baseUrl}/api/v1/sizes/${productData.sizeId}` }
        : null,
      gender: productData.genderId
        ? { href: `${baseUrl}/api/v1/genders/${productData.genderId}` }
        : null,
    }
  };
}

/**
 * Add HATEOAS links to a product collection
 */
function addProductCollectionLinks(products, baseUrl = BASE_URL, pagination = null) {
  const items = products.map(product => addProductLinks(product, baseUrl));

  const response = {
    _embedded: {
      products: items
    },
    _links: {
      self: { href: `${baseUrl}/api/v1/products` },
    },
    count: items.length
  };

  // Add pagination links if provided
  if (pagination) {
    const { page, limit, total } = pagination;
    const totalPages = Math.ceil(total / limit);

    response._links.first = { href: `${baseUrl}/api/v1/products?page=1&limit=${limit}` };
    response._links.last = { href: `${baseUrl}/api/v1/products?page=${totalPages}&limit=${limit}` };

    if (page > 1) {
      response._links.prev = { href: `${baseUrl}/api/v1/products?page=${page - 1}&limit=${limit}` };
    }
    if (page < totalPages) {
      response._links.next = { href: `${baseUrl}/api/v1/products?page=${page + 1}&limit=${limit}` };
    }

    response.pagination = { page, limit, total, totalPages };
  }

  return response;
}

/**
 * Add HATEOAS links to a generic resource
 */
function addResourceLinks(resource, resourceType, baseUrl = BASE_URL) {
  const resourceData = resource.toJSON ? resource.toJSON() : resource;

  return {
    ...resourceData,
    _links: {
      self: { href: `${baseUrl}/api/v1/${resourceType}/${resourceData.id}` },
      collection: { href: `${baseUrl}/api/v1/${resourceType}` }
    }
  };
}

/**
 * Add HATEOAS links to a resource collection
 */
function addCollectionLinks(items, resourceType, baseUrl = BASE_URL) {
  const enrichedItems = items.map(item => addResourceLinks(item, resourceType, baseUrl));

  return {
    _embedded: {
      [resourceType]: enrichedItems
    },
    _links: {
      self: { href: `${baseUrl}/api/v1/${resourceType}` }
    },
    count: enrichedItems.length
  };
}

/**
 * Add HATEOAS links to an order
 */
function addOrderLinks(order, baseUrl = BASE_URL) {
  const orderData = order.toJSON ? order.toJSON() : order;

  return {
    ...orderData,
    _links: {
      self: { href: `${baseUrl}/api/v1/orders/${orderData.id}` },
      collection: { href: `${baseUrl}/api/v1/orders` },
      user: orderData.userId
        ? { href: `${baseUrl}/api/v1/users/${orderData.userId}` }
        : null,
    }
  };
}

module.exports = {
  addProductLinks,
  addProductCollectionLinks,
  addResourceLinks,
  addCollectionLinks,
  addOrderLinks,
  BASE_URL
};