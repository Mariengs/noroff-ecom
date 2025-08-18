export function getImageUrl(product) {
  return (
    product?.image?.url || product?.imageUrl || product?.images?.[0]?.url || ""
  );
}
