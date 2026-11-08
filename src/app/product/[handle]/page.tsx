import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Storefront } from "@/components/storefront/Storefront";
import { getCommerce } from "@/lib/commerce";
import { formatMoney } from "@/lib/format";
import { SITE_NAME } from "@/lib/site";

export async function generateStaticParams() {
  const products = await getCommerce().listProducts();
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: PageProps<"/product/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const product = await getCommerce().getProduct(handle);
  if (!product) return { title: "Not found" };
  return {
    title: `${product.name} — ${product.colorName}`,
    description: `${product.tagline} ${formatMoney(product.price)}.`,
  };
}

async function ProductStorefront({ params }: Pick<PageProps<"/product/[handle]">, "params">) {
  const { handle } = await params;
  const commerce = getCommerce();
  const products = await commerce.listProducts();
  if (!products.some((p) => p.handle === handle)) notFound();
  return <Storefront products={products} initialHandle={handle} mode={commerce.mode} siteName={SITE_NAME} />;
}

/**
 * Deep-linkable product URL. It renders the same storefront with the garment
 * already selected; in-app navigation between rack and product uses shallow
 * history updates so the rack (and its scroll position) never unmounts.
 * `params` is read inside <Suspense> so the route keeps an instant static shell.
 */
export default function ProductPage(props: PageProps<"/product/[handle]">) {
  return (
    <Suspense fallback={<div className="h-svh bg-[var(--page)]" aria-busy="true" />}>
      <ProductStorefront params={props.params} />
    </Suspense>
  );
}
