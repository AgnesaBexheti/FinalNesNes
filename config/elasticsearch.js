const { Client } = require('@elastic/elasticsearch');

// Elasticsearch client configuration
const esClient = new Client({
  node: `http://${process.env.ELASTICSEARCH_HOST || 'localhost'}:${process.env.ELASTICSEARCH_PORT || 9200}`,
  maxRetries: 5,
  requestTimeout: 60000,
});

// Index name for products
const PRODUCTS_INDEX = 'products';

// Initialize Elasticsearch index with mappings
async function initializeIndex() {
  try {
    const indexExists = await esClient.indices.exists({ index: PRODUCTS_INDEX });

    if (!indexExists) {
      await esClient.indices.create({
        index: PRODUCTS_INDEX,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                product_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding']
                }
              }
            }
          },
          mappings: {
            properties: {
              id: { type: 'integer' },
              name: {
                type: 'text',
                analyzer: 'product_analyzer',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              description: {
                type: 'text',
                analyzer: 'product_analyzer'
              },
              price: { type: 'float' },
              category: { type: 'keyword' },
              brand: { type: 'keyword' },
              color: { type: 'keyword' },
              size: { type: 'keyword' },
              gender: { type: 'keyword' },
              imageUrl: { type: 'keyword' }
            }
          }
        }
      });
      console.log(' Elasticsearch index created: products');
    }
    return true;
  } catch (error) {
    console.error('Elasticsearch index initialization error:', error.message);
    return false;
  }
}

// Index a single product
async function indexProduct(product) {
  try {
    await esClient.index({
      index: PRODUCTS_INDEX,
      id: product.id.toString(),
      body: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: product.Category?.name || null,
        brand: product.Brand?.name || null,
        color: product.Color?.name || null,
        size: product.Size?.name || null,
        gender: product.Gender?.name || null,
        imageUrl: product.imageUrl
      },
      refresh: true
    });
    return true;
  } catch (error) {
    console.error('Error indexing product:', error.message);
    return false;
  }
}

// Index all products (bulk)
async function indexAllProducts(products) {
  try {
    if (products.length === 0) return true;

    const operations = products.flatMap(product => [
      { index: { _index: PRODUCTS_INDEX, _id: product.id.toString() } },
      {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: product.Category?.name || null,
        brand: product.Brand?.name || null,
        color: product.Color?.name || null,
        size: product.Size?.name || null,
        gender: product.Gender?.name || null,
        imageUrl: product.imageUrl
      }
    ]);

    const result = await esClient.bulk({ refresh: true, operations });

    if (result.errors) {
      console.error('Some products failed to index');
    }

    console.log(` Indexed ${products.length} products to Elasticsearch`);
    return true;
  } catch (error) {
    console.error('Error bulk indexing products:', error.message);
    return false;
  }
}

// Search products
async function searchProducts(query, filters = {}) {
  try {
    const must = [];
    const filter = [];

    // Full-text search on name and description
    if (query) {
      must.push({
        multi_match: {
          query: query,
          fields: ['name^3', 'description'],
          fuzziness: 'AUTO'
        }
      });
    }

    // Apply filters
    if (filters.category) {
      filter.push({ term: { category: filters.category } });
    }
    if (filters.brand) {
      filter.push({ term: { brand: filters.brand } });
    }
    if (filters.color) {
      filter.push({ term: { color: filters.color } });
    }
    if (filters.size) {
      filter.push({ term: { size: filters.size } });
    }
    if (filters.gender) {
      filter.push({ term: { gender: filters.gender } });
    }
    if (filters.minPrice || filters.maxPrice) {
      const range = { price: {} };
      if (filters.minPrice) range.price.gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) range.price.lte = parseFloat(filters.maxPrice);
      filter.push({ range });
    }

    const searchBody = {
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter: filter
        }
      },
      highlight: {
        fields: {
          name: {},
          description: {}
        }
      }
    };

    const result = await esClient.search({
      index: PRODUCTS_INDEX,
      body: searchBody,
      size: filters.limit || 20
    });

    return {
      total: result.hits.total.value,
      products: result.hits.hits.map(hit => ({
        ...hit._source,
        _score: hit._score,
        highlights: hit.highlight
      }))
    };
  } catch (error) {
    console.error('Elasticsearch search error:', error.message);
    throw error;
  }
}

// Delete product from index
async function deleteProduct(productId) {
  try {
    await esClient.delete({
      index: PRODUCTS_INDEX,
      id: productId.toString(),
      refresh: true
    });
    return true;
  } catch (error) {
    if (error.meta?.statusCode === 404) {
      return true; // Already deleted
    }
    console.error('Error deleting product from index:', error.message);
    return false;
  }
}

// Check connection
async function isConnected() {
  try {
    await esClient.ping();
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  esClient,
  PRODUCTS_INDEX,
  initializeIndex,
  indexProduct,
  indexAllProducts,
  searchProducts,
  deleteProduct,
  isConnected
};
