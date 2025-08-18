export function getImageUrl(product) {
  if (!product) return "";
  if (product.image?.url) return product.image.url;
  if (product.imageUrl) return product.imageUrl;
  if (Array.isArray(product.images) && product.images[0]?.url)
    return product.images[0].url;
  return "";
}
