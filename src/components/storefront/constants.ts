/** Y-axis turn of garments on the rail (deg). They face the viewer in detail. */
export const RACK_TURN = 56;
export const HOVER_TURN = 14;

export const garmentLayoutId = (productId: string) => `garment-${productId}`;

export const SPRING_LAYOUT = { type: "spring", stiffness: 170, damping: 26, mass: 1 } as const;
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const RACK_SCROLL_KEY = "ifs.rack.scroll.v1";
