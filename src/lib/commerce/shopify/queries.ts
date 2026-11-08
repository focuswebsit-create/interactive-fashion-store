const PRODUCT_FIELDS = /* GraphQL */ `
  fragment RackProduct on Product {
    id
    handle
    title
    productType
    description
    tags
    featuredImage { url altText width height }
    hangerHook: metafield(namespace: "custom", key: "hanger_hook") { value }
    priceRange { minVariantPrice { amount currencyCode } }
    options { name optionValues { name swatch { color } } }
    variants(first: 30) {
      nodes { id availableForSale selectedOptions { name value } }
    }
  }
`;

export const PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query RackProducts($first: Int!, $query: String) {
    products(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
      nodes { ...RackProduct }
    }
  }
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

export type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  description: string;
  tags: string[];
  featuredImage: { url: string; altText: string | null; width: number; height: number } | null;
  hangerHook: { value: string } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  options: { name: string; optionValues: { name: string; swatch: { color: string | null } | null }[] }[];
  variants: { nodes: { id: string; availableForSale: boolean; selectedOptions: { name: string; value: string }[] }[] };
};

export type ProductsQueryResult = { products: { nodes: ShopifyProductNode[] } };
export type CartCreateResult = {
  cartCreate: { cart: { id: string; checkoutUrl: string } | null; userErrors: { field: string[] | null; message: string }[] };
};
