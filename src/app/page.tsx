import { Storefront } from "@/components/storefront/Storefront";
import { getCommerce } from "@/lib/commerce";
import { SITE_NAME } from "@/lib/site";

export default async function HomePage() {
  const commerce = getCommerce();
  const products = await commerce.listProducts();
  return <Storefront products={products} initialHandle={null} mode={commerce.mode} siteName={SITE_NAME} />;
}
