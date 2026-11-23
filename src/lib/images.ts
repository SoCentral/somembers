// Bygger bilde-URL-er via ImageKit i riktig storrelse og format.
// Bildene vises alltid i 320x320 px, saa vi lager en 320- og en 640-versjon
// (640 for skjermer med hoy pikseltetthet) og lar nettleseren velge.

const PLACEHOLDER =
  "https://cdn.prod.website-files.com/633d71ff5625100570e7e68c/68f8d711d95a532bded7c6c3_default.png";

const DISPLAY_SIZE = 320;

type Fit = "cover" | "contain";

// Filnavn kan inneholde mellomrom. I srcset betyr mellomrom og komma skille
// mellom bildeutgaver, saa adressen maa kodes (mellomrom -> %20).
const encode = (url: string) => {
  try {
    return encodeURI(decodeURI(url));
  } catch {
    return encodeURI(url);
  }
};

const transform = (rawUrl: string, size: number, fit: Fit) => {
  const url = encode(rawUrl);
  // cover: beskjaer til kvadrat (som object-fit: cover)
  // contain: skalerer ned saa hele bildet passer inni (som object-fit: contain)
  const crop = fit === "contain" ? ",c-at_max" : "";
  return `${url}?tr=w-${size},h-${size}${crop},q-80,f-auto`;
};

export function imageAttrs(url: string | null | undefined, fit: Fit) {
  if (!url) {
    return { src: PLACEHOLDER, width: DISPLAY_SIZE, height: DISPLAY_SIZE };
  }
  return {
    src: transform(url, DISPLAY_SIZE * 2, fit),
    srcset: `${transform(url, DISPLAY_SIZE, fit)} ${DISPLAY_SIZE}w, ${transform(url, DISPLAY_SIZE * 2, fit)} ${DISPLAY_SIZE * 2}w`,
    sizes: `${DISPLAY_SIZE}px`,
    width: DISPLAY_SIZE,
    height: DISPLAY_SIZE,
  };
}
