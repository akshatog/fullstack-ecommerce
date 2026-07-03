import prisma from "./prisma/client.js";

const categories = [
  {
    name: "Vases",
    adjectives: ["Nordic", "Ceramic", "Glass", "Minimalist", "Ribbed", "Matte", "Tall", "Sculptural", "Hand-painted", "Textured", "Geometric", "Terracotta"],
    nouns: ["Vase", "Flower Pot", "Decorative Urn", "Centerpiece Vase", "Bud Vase", "Floor Vase"]
  },
  {
    name: "Clocks",
    adjectives: ["Geometric", "Brass", "Wooden", "Silent", "Modern", "Vintage", "Marble", "Floating", "Sunburst", "Minimalist", "Oversized", "Sleek"],
    nouns: ["Table Clock", "Wall Clock", "Mantel Clock", "Desk Clock", "Analog Clock", "Pendulum Clock"]
  },
  {
    name: "Wall Decor",
    adjectives: ["Macrame", "Woven", "Canvas", "Abstract", "Metal", "Framed", "Bohemian", "Floating", "Rustic", "Industrial", "Minimalist", "Gold-leaf"],
    nouns: ["Wall Hanging", "Art Print", "Wall Shelf", "Tapestry", "Mirror", "Decorative Panels"]
  },
  {
    name: "Sculptures",
    adjectives: ["Abstract", "Gold", "Ceramic", "Knot", "Wooden", "Marble", "Bronze", "Modernist", "Twisted", "Geometric", "Resin", "Monochrome"],
    nouns: ["Table Sculpture", "Object", "Statue", "Figurine", "Floor Sculpture", "Bust"]
  }
];

const unsplashUrls = [
  "https://images.unsplash.com/photo-1613521140785-e85e427f8002?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1522758971460-1d21fac222d9?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1549467657-3729906d4eeb?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1584346083533-5c74eb1c0eb3?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1563299718-d7486e969077?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1603006905393-49dc85ee22dc?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1598539958043-4e4c965c490a?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1582582494705-f8ce0b0c24f0?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=800"
];

const generateProducts = () => {
  const products = [];
  let idCounter = 1;
  
  categories.forEach(cat => {
    // Generate exactly 12 products per category (total 48)
    for (let i = 0; i < 12; i++) {
      const adjective = cat.adjectives[i];
      const noun = cat.nouns[i % cat.nouns.length];
      const productName = `${adjective} ${noun}`;
      
      const getRandomUrl = () => unsplashUrls[Math.floor(Math.random() * unsplashUrls.length)];
      
      const mainImageUrl = getRandomUrl();
      let image2Url = getRandomUrl();
      let image3Url = getRandomUrl();
      
      // Attempt to ensure uniqueness among the 3
      while (image2Url === mainImageUrl) image2Url = getRandomUrl();
      while (image3Url === mainImageUrl || image3Url === image2Url) image3Url = getRandomUrl();
      
      products.push({
        name: productName,
        description: `Experience the finest craftsmanship with this stunning ${adjective.toLowerCase()} ${noun.toLowerCase()}. Perfect for adding a touch of elegance and modern flair to any space in your home. Each piece is uniquely designed to complement contemporary interiors.`,
        price: Math.floor(Math.random() * 4000) + 999,
        category: cat.name,
        stock: Math.floor(Math.random() * 50) + 10,
        imageUrl: mainImageUrl,
        images: JSON.stringify([mainImageUrl, image2Url, image3Url]),
        ...(i === 0 && { videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" })
      });
      idCounter++;
    }
  });
  
  return products;
}

async function main() {
  console.log("Cleaning up old data to prevent foreign key errors...");
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  
  console.log("Deleting old products...");
  await prisma.product.deleteMany({});
  
  const products = generateProducts();
  console.log(`Seeding ${products.length} new unique products...`);
  
  const result = await prisma.product.createMany({
    data: products,
    skipDuplicates: true
  });
  console.log(`✅ Successfully added ${result.count} products to the database!`);
}

main()
  .catch(e => {
    console.error("Error seeding products:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

