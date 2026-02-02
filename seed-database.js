// Database Seeding Script - Add Base Data and Sample Products
// Run this ONCE to populate Categories, Brands, Sizes, Colors, Genders, and Sample Products with Images

const {
  sequelize,
  Role,
  Category,
  Brand,
  Size,
  Color,
  Gender,
  User,
  Product,
} = require('./models');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Sync database - ALTER tables to add new columns
    await sequelize.sync({ alter: true });
    console.log('✅ Database connected and tables updated\n');

    // 1. Seed Roles
    console.log('📝 Seeding Roles...');
    const roles = [
      { id: 1, name: 'admin' },
      { id: 2, name: 'advanced' },
      { id: 3, name: 'simple' },
    ];

    for (const role of roles) {
      await Role.findOrCreate({
        where: { id: role.id },
        defaults: role,
      });
    }
    console.log('✅ Roles seeded\n');

    // 2. Seed Categories
    console.log('📝 Seeding Categories...');
    const categories = [
      { name: 'Shirts', description: 'T-shirts, dress shirts, casual shirts' },
      { name: 'Pants', description: 'Jeans, trousers, casual pants' },
      { name: 'Jackets', description: 'Winter jackets, blazers, hoodies' },
      { name: 'Shoes', description: 'Sneakers, boots, formal shoes' },
      { name: 'Accessories', description: 'Belts, hats, scarves, bags' },
    ];

    const categoryMap = {};
    for (const category of categories) {
      const [cat] = await Category.findOrCreate({
        where: { name: category.name },
        defaults: category,
      });
      categoryMap[category.name] = cat.id;
    }
    console.log('✅ Categories seeded\n');

    // 3. Seed Brands
    console.log('📝 Seeding Brands...');
    const brands = [
      { name: 'Nike', description: 'Athletic apparel and footwear' },
      { name: 'Adidas', description: 'Sportswear and athletic shoes' },
      { name: 'Zara', description: 'Fashion clothing and accessories' },
      { name: 'H&M', description: 'Affordable fashion clothing' },
      { name: 'Tommy Hilfiger', description: 'Premium casual wear' },
      { name: 'Levis', description: 'Denim and casual wear' },
      { name: 'Puma', description: 'Athletic and casual sportswear' },
      { name: 'Gap', description: 'American casual clothing' },
      { name: 'Djerf Avenue', description: 'Scandinavian minimalist fashion' },
      { name: 'Reformation', description: 'Sustainable fashion brand' },
      { name: 'COS', description: 'Modern minimalist essentials' },
      { name: 'Arket', description: 'Nordic lifestyle brand' },
      { name: 'Sezane', description: 'Parisian chic fashion' },
      { name: 'Everlane', description: 'Radical transparency fashion' },
      { name: 'Aritzia', description: 'Everyday luxury fashion' },
      { name: 'Other Stories', description: 'Contemporary fashion stories' },
      { name: 'Massimo Dutti', description: 'Elegant casual wear' },
      { name: 'Mango', description: 'Mediterranean style fashion' },
    ];

    const brandMap = {};
    for (const brand of brands) {
      const [br] = await Brand.findOrCreate({
        where: { name: brand.name },
        defaults: brand,
      });
      brandMap[brand.name] = br.id;
    }
    console.log('✅ Brands seeded\n');

    // 4. Seed Sizes
    console.log('📝 Seeding Sizes...');
    const sizes = [
      { name: 'XS' },
      { name: 'S' },
      { name: 'M' },
      { name: 'L' },
      { name: 'XL' },
      { name: 'XXL' },
    ];

    const sizeMap = {};
    for (const size of sizes) {
      const [sz] = await Size.findOrCreate({
        where: { name: size.name },
        defaults: size,
      });
      sizeMap[size.name] = sz.id;
    }
    console.log('✅ Sizes seeded\n');

    // 5. Seed Colors
    console.log('📝 Seeding Colors...');
    const colors = [
      { name: 'Black' },
      { name: 'White' },
      { name: 'Red' },
      { name: 'Blue' },
      { name: 'Green' },
      { name: 'Yellow' },
      { name: 'Gray' },
      { name: 'Navy' },
      { name: 'Brown' },
      { name: 'Pink' },
      { name: 'Beige' },
      { name: 'Cream' },
      { name: 'Olive' },
      { name: 'Burgundy' },
      { name: 'Camel' },
    ];

    const colorMap = {};
    for (const color of colors) {
      const [cl] = await Color.findOrCreate({
        where: { name: color.name },
        defaults: color,
      });
      colorMap[color.name] = cl.id;
    }
    console.log('✅ Colors seeded\n');

    // 6. Seed Genders
    console.log('📝 Seeding Genders...');
    const genders = [
      { name: 'Men' },
      { name: 'Women' },
      { name: 'Children' },
      { name: 'Unisex' },
    ];

    const genderMap = {};
    for (const gender of genders) {
      const [gn] = await Gender.findOrCreate({
        where: { name: gender.name },
        defaults: gender,
      });
      genderMap[gender.name] = gn.id;
    }
    console.log('✅ Genders seeded\n');

    // 7. Create Admin User
    console.log('📝 Creating default admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        passwordHash: hashedPassword,
        roleId: 1,
      },
    });
    console.log('✅ Admin user created\n');
    console.log('   Username: admin');
    console.log('   Password: admin123\n');

    // 8. Seed Sample Products with Images
    console.log('📝 Seeding Sample Products with Images...');
    const sampleProducts = [
      {
        name: 'Nike Air Max 270',
        description: 'Premium running shoes with air cushioning and modern design',
        price: 149.99,
        initialQuantity: 50,
        categoryId: categoryMap['Shoes'],
        brandId: brandMap['Nike'],
        colorId: colorMap['Black'],
        sizeId: sizeMap['L'],
        genderId: genderMap['Men'],
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
      },
      {
        name: 'Adidas Ultraboost',
        description: 'High-performance running shoes with responsive cushioning',
        price: 179.99,
        initialQuantity: 45,
        categoryId: categoryMap['Shoes'],
        brandId: brandMap['Adidas'],
        colorId: colorMap['White'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Men'],
        imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&h=500&fit=crop',
      },
      {
        name: 'Levis 501 Original Jeans',
        description: 'Classic straight-fit jeans with authentic styling',
        price: 89.99,
        initialQuantity: 60,
        categoryId: categoryMap['Pants'],
        brandId: brandMap['Levis'],
        colorId: colorMap['Blue'],
        sizeId: sizeMap['L'],
        genderId: genderMap['Men'],
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
      },
      {
        name: 'Nike Sportswear Hoodie',
        description: 'Comfortable fleece hoodie for casual wear',
        price: 69.99,
        initialQuantity: 75,
        categoryId: categoryMap['Jackets'],
        brandId: brandMap['Nike'],
        colorId: colorMap['Gray'],
        sizeId: sizeMap['L'],
        genderId: genderMap['Unisex'],
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
      },
      {
        name: 'Zara White Cotton Shirt',
        description: 'Elegant white shirt perfect for formal occasions',
        price: 49.99,
        initialQuantity: 80,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['Zara'],
        colorId: colorMap['White'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Men'],
        imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=500&fit=crop',
      },
      {
        name: 'H&M Floral Summer Dress',
        description: 'Light and airy summer dress with floral pattern',
        price: 39.99,
        initialQuantity: 90,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['H&M'],
        colorId: colorMap['Pink'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
      },
      {
        name: 'Tommy Hilfiger Bomber Jacket',
        description: 'Classic bomber jacket with signature branding',
        price: 159.99,
        initialQuantity: 40,
        categoryId: categoryMap['Jackets'],
        brandId: brandMap['Tommy Hilfiger'],
        colorId: colorMap['Navy'],
        sizeId: sizeMap['L'],
        genderId: genderMap['Men'],
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
      },
      {
        name: 'Puma Classic T-Shirt',
        description: 'Comfortable cotton t-shirt for everyday wear',
        price: 29.99,
        initialQuantity: 100,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['Puma'],
        colorId: colorMap['Black'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Unisex'],
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      },
      {
        name: 'Adidas Track Pants',
        description: 'Athletic track pants with three stripes',
        price: 59.99,
        initialQuantity: 70,
        categoryId: categoryMap['Pants'],
        brandId: brandMap['Adidas'],
        colorId: colorMap['Black'],
        sizeId: sizeMap['L'],
        genderId: genderMap['Unisex'],
        imageUrl: 'https://images.unsplash.com/photo-1624378515195-6bbdb73dff1a?w=500&h=500&fit=crop',
      },
      {
        name: 'Nike Sneakers - Women',
        description: 'Stylish and comfortable sneakers for women',
        price: 119.99,
        initialQuantity: 55,
        categoryId: categoryMap['Shoes'],
        brandId: brandMap['Nike'],
        colorId: colorMap['White'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&h=500&fit=crop',
      },
      {
        name: 'Gap Denim Jacket',
        description: 'Classic denim jacket for any season',
        price: 79.99,
        initialQuantity: 65,
        categoryId: categoryMap['Jackets'],
        brandId: brandMap['Gap'],
        colorId: colorMap['Blue'],
        sizeId: sizeMap['L'],
        genderId: genderMap['Unisex'],
        imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&h=500&fit=crop',
      },
      {
        name: 'Levis Black Skinny Jeans',
        description: 'Modern skinny fit jeans in classic black',
        price: 94.99,
        initialQuantity: 58,
        categoryId: categoryMap['Pants'],
        brandId: brandMap['Levis'],
        colorId: colorMap['Black'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=500&fit=crop',
      },
      // Djerf Avenue Products
      {
        name: 'Cloud Knit Sweater',
        description: 'Oversized chunky knit sweater in soft cream',
        price: 189.00,
        initialQuantity: 35,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['Djerf Avenue'],
        colorId: colorMap['Cream'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500&fit=crop',
      },
      {
        name: 'Favorite Daughter Jeans',
        description: 'High-waisted wide leg jeans in light wash',
        price: 159.00,
        initialQuantity: 42,
        categoryId: categoryMap['Pants'],
        brandId: brandMap['Djerf Avenue'],
        colorId: colorMap['Blue'],
        sizeId: sizeMap['S'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=500&h=500&fit=crop',
      },
      {
        name: 'Pillow Puffer Jacket',
        description: 'Cozy oversized puffer in classic black',
        price: 279.00,
        initialQuantity: 28,
        categoryId: categoryMap['Jackets'],
        brandId: brandMap['Djerf Avenue'],
        colorId: colorMap['Black'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=500&fit=crop',
      },
      // Reformation Products
      {
        name: 'Cynthia Midi Dress',
        description: 'Elegant silk midi dress with adjustable straps',
        price: 278.00,
        initialQuantity: 25,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['Reformation'],
        colorId: colorMap['Black'],
        sizeId: sizeMap['S'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
      },
      {
        name: 'Cashmere Boyfriend Sweater',
        description: 'Luxurious cashmere sweater in oatmeal',
        price: 248.00,
        initialQuantity: 30,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['Reformation'],
        colorId: colorMap['Beige'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=500&fit=crop',
      },
      // COS Products
      {
        name: 'Oversized Wool Coat',
        description: 'Minimalist wool blend coat in camel',
        price: 390.00,
        initialQuantity: 20,
        categoryId: categoryMap['Jackets'],
        brandId: brandMap['COS'],
        colorId: colorMap['Camel'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=500&h=500&fit=crop',
      },
      {
        name: 'Relaxed Linen Shirt',
        description: 'Breathable linen shirt in crisp white',
        price: 115.00,
        initialQuantity: 55,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['COS'],
        colorId: colorMap['White'],
        sizeId: sizeMap['L'],
        genderId: genderMap['Unisex'],
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=500&fit=crop',
      },
      {
        name: 'Wide Leg Trousers',
        description: 'Tailored wide leg trousers in navy',
        price: 135.00,
        initialQuantity: 40,
        categoryId: categoryMap['Pants'],
        brandId: brandMap['COS'],
        colorId: colorMap['Navy'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop',
      },
      // Arket Products
      {
        name: 'Merino Wool Cardigan',
        description: 'Soft merino wool cardigan in olive green',
        price: 99.00,
        initialQuantity: 45,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['Arket'],
        colorId: colorMap['Olive'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Unisex'],
        imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=500&fit=crop',
      },
      {
        name: 'Cotton Canvas Jacket',
        description: 'Durable canvas jacket for everyday wear',
        price: 149.00,
        initialQuantity: 35,
        categoryId: categoryMap['Jackets'],
        brandId: brandMap['Arket'],
        colorId: colorMap['Beige'],
        sizeId: sizeMap['L'],
        genderId: genderMap['Men'],
        imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
      },
      // Sezane Products
      {
        name: 'Scott Cardigan',
        description: 'Classic Parisian cardigan with gold buttons',
        price: 195.00,
        initialQuantity: 38,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['Sezane'],
        colorId: colorMap['Cream'],
        sizeId: sizeMap['S'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=500&fit=crop',
      },
      {
        name: 'Brune Boots',
        description: 'Elegant leather ankle boots in brown',
        price: 285.00,
        initialQuantity: 25,
        categoryId: categoryMap['Shoes'],
        brandId: brandMap['Sezane'],
        colorId: colorMap['Brown'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=500&fit=crop',
      },
      // Everlane Products
      {
        name: 'The Way-High Jean',
        description: 'Ultra high-rise organic cotton jeans',
        price: 118.00,
        initialQuantity: 50,
        categoryId: categoryMap['Pants'],
        brandId: brandMap['Everlane'],
        colorId: colorMap['Blue'],
        sizeId: sizeMap['S'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500&h=500&fit=crop',
      },
      {
        name: 'The Cashmere Crew',
        description: 'Grade-A cashmere sweater in heather gray',
        price: 145.00,
        initialQuantity: 40,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['Everlane'],
        colorId: colorMap['Gray'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Unisex'],
        imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&h=500&fit=crop',
      },
      {
        name: 'The ReNew Puffer',
        description: 'Recycled down puffer in deep burgundy',
        price: 198.00,
        initialQuantity: 32,
        categoryId: categoryMap['Jackets'],
        brandId: brandMap['Everlane'],
        colorId: colorMap['Burgundy'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd628b0?w=500&h=500&fit=crop',
      },
      // Aritzia Products
      {
        name: 'Super Puff Jacket',
        description: 'Iconic oversized puffer in matte black',
        price: 350.00,
        initialQuantity: 28,
        categoryId: categoryMap['Jackets'],
        brandId: brandMap['Aritzia'],
        colorId: colorMap['Black'],
        sizeId: sizeMap['S'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=500&h=500&fit=crop',
      },
      {
        name: 'Effortless Pant',
        description: 'Flowing wide leg trousers in cream',
        price: 148.00,
        initialQuantity: 45,
        categoryId: categoryMap['Pants'],
        brandId: brandMap['Aritzia'],
        colorId: colorMap['Cream'],
        sizeId: sizeMap['S'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=500&fit=crop',
      },
      {
        name: 'Contour Bodysuit',
        description: 'Sculpting bodysuit in classic black',
        price: 68.00,
        initialQuantity: 60,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['Aritzia'],
        colorId: colorMap['Black'],
        sizeId: sizeMap['XS'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop',
      },
      // Other Stories Products
      {
        name: 'Leather Trench Coat',
        description: 'Buttery soft leather trench in cognac',
        price: 449.00,
        initialQuantity: 15,
        categoryId: categoryMap['Jackets'],
        brandId: brandMap['Other Stories'],
        colorId: colorMap['Brown'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=500&h=500&fit=crop',
      },
      {
        name: 'Ribbed Knit Dress',
        description: 'Form-fitting ribbed midi dress',
        price: 129.00,
        initialQuantity: 40,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['Other Stories'],
        colorId: colorMap['Beige'],
        sizeId: sizeMap['S'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=500&h=500&fit=crop',
      },
      // Massimo Dutti Products
      {
        name: 'Wool Blend Blazer',
        description: 'Structured blazer in charcoal gray',
        price: 259.00,
        initialQuantity: 30,
        categoryId: categoryMap['Jackets'],
        brandId: brandMap['Massimo Dutti'],
        colorId: colorMap['Gray'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Men'],
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&h=500&fit=crop',
      },
      {
        name: 'Silk Blend Shirt',
        description: 'Luxurious silk blend shirt in ivory',
        price: 149.00,
        initialQuantity: 35,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['Massimo Dutti'],
        colorId: colorMap['White'],
        sizeId: sizeMap['S'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=500&h=500&fit=crop',
      },
      {
        name: 'Leather Chelsea Boots',
        description: 'Premium leather boots in black',
        price: 229.00,
        initialQuantity: 25,
        categoryId: categoryMap['Shoes'],
        brandId: brandMap['Massimo Dutti'],
        colorId: colorMap['Black'],
        sizeId: sizeMap['L'],
        genderId: genderMap['Men'],
        imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&h=500&fit=crop',
      },
      // Mango Products
      {
        name: 'Structured Linen Blazer',
        description: 'Summer linen blazer in sand',
        price: 119.99,
        initialQuantity: 40,
        categoryId: categoryMap['Jackets'],
        brandId: brandMap['Mango'],
        colorId: colorMap['Beige'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop',
      },
      {
        name: 'Pleated Midi Skirt',
        description: 'Flowing pleated skirt in olive',
        price: 79.99,
        initialQuantity: 50,
        categoryId: categoryMap['Pants'],
        brandId: brandMap['Mango'],
        colorId: colorMap['Olive'],
        sizeId: sizeMap['S'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0uj23?w=500&h=500&fit=crop',
      },
      {
        name: 'Cotton Oversized Tee',
        description: 'Relaxed fit organic cotton tee',
        price: 35.99,
        initialQuantity: 80,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['Mango'],
        colorId: colorMap['White'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Unisex'],
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      },
      // More Zara Products
      {
        name: 'Satin Slip Dress',
        description: 'Elegant satin midi dress in champagne',
        price: 89.90,
        initialQuantity: 45,
        categoryId: categoryMap['Shirts'],
        brandId: brandMap['Zara'],
        colorId: colorMap['Cream'],
        sizeId: sizeMap['S'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
      },
      {
        name: 'Leather Biker Jacket',
        description: 'Classic leather jacket in black',
        price: 199.00,
        initialQuantity: 30,
        categoryId: categoryMap['Jackets'],
        brandId: brandMap['Zara'],
        colorId: colorMap['Black'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
      },
      {
        name: 'Minimalist Loafers',
        description: 'Sleek leather loafers in tan',
        price: 119.00,
        initialQuantity: 35,
        categoryId: categoryMap['Shoes'],
        brandId: brandMap['Zara'],
        colorId: colorMap['Brown'],
        sizeId: sizeMap['M'],
        genderId: genderMap['Women'],
        imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=500&fit=crop',
      },
    ];

    for (const product of sampleProducts) {
      await Product.findOrCreate({
        where: { name: product.name },
        defaults: product,
      });
    }
    console.log('✅ Sample products seeded (40+ products with images)\n');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log('   - 3 Roles');
    console.log('   - 5 Categories');
    console.log('   - 18 Brands (including ethical brands)');
    console.log('   - 6 Sizes');
    console.log('   - 15 Colors');
    console.log('   - 4 Genders');
    console.log('   - 1 Admin User');
    console.log('   - 40+ Stylish Products with Images\n');
    console.log('🚀 You can now:');
    console.log('   1. Start the backend: npm start');
    console.log('   2. Start React app: cd client && npm start');
    console.log('   3. Login with: admin / admin123');
    console.log('   4. Browse products on home page');
    console.log('   5. Go to Admin Dashboard to add more products!\n');
    console.log('📸 All products include images from Unsplash\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
