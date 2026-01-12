
export interface CompetitorData {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
}

/**
 * Mengambil data produk dari URL Shopee.
 * Note: Di lingkungan browser murni, kita biasanya memerlukan backend 
 * atau scraping service (ZenRows/ScraperAPI) untuk menghindari block/CORS.
 */
export const scrapeShopeeProduct = async (url: string): Promise<CompetitorData> => {
  // Simulasi pemrosesan scraping
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (!url.includes("shopee.co.id")) {
    throw new Error("Hanya mendukung URL Shopee Indonesia saat ini.");
  }

  // Karena kita tidak bisa scrape Shopee langsung dari client side tanpa proxy, 
  // kita mengembalikan mock data yang realistis berdasarkan URL untuk keperluan demo/MVP
  // Di produksi, ini akan memanggil endpoint /api/scrape
  const productID = url.split("-i.")[1] || "unknown";
  
  return {
    url,
    title: `Produk Kompetitor Terlaris - ${productID}`,
    description: "Deskripsi produk lengkap yang mengandung banyak keyword SEO dan testimoni pelanggan. Menjelaskan fitur utama, bahan, dan cara penggunaan secara mendalam.",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"
  };
};
