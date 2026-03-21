export const buildPrompt = ({ style, customPrompt, roomType }) => {
  const baseRules = `
CRITICAL INSTRUCTIONS (STRICTLY ENFORCED):

STRUCTURE LOCK:
- Preserve ONLY the room layout: walls, windows, doors, and camera angle.
- DO NOT change geometry, proportions, or perspective.

FULL RECONSTRUCTION (NOT ENHANCEMENT):
- Completely rebuild the interior from scratch.
- Treat the original image as a layout reference ONLY.
- Ignore all original textures, materials, furniture, and surfaces.

MANDATORY CLEAN REPLACEMENT:
- Remove ALL damage: cracks, stains, mold, dirt, dust, scratches, peeling paint, rust.
- Remove ALL old furniture, clutter, garbage, and broken items.
- Replace EVERYTHING with brand-new, premium-quality elements.

NEGATIVE CONSTRAINTS (STRICTLY FORBIDDEN):
- No cracks, no dirt, no stains, no aging, no grunge.
- No worn-out textures or damaged surfaces.
- No old or reused furniture.

SURFACE QUALITY:
- Walls must be perfectly smooth and freshly painted.
- Floors must be spotless (marble/wood/high-end tile).
- Furniture must look new, sharp, and premium.

LIGHTING (VERY IMPORTANT):
- Bright, professional interior lighting.
- Soft shadows, global illumination, natural highlights.
- No dark, flat, or dull lighting.

REALISM:
- Ultra photorealistic materials (wood, marble, fabric, glass, metal).
- Correct reflections, shadows, and depth.
- High-end interior photoshoot quality.

FINAL GOAL:
The result must look like a BRAND NEW luxury interior — not a repaired version of the old room.
`;

  if (customPrompt?.trim()) {
    return `
Interior redesign of the same ${roomType || "room"}.

${baseRules}

CUSTOM STYLE INSTRUCTIONS:
${customPrompt}

FINAL OUTPUT:
Ultra-realistic luxury interior, perfectly clean, 4K photorealistic render, magazine-quality, sharp details, professional lighting.
`;
  }

  const styles = {
    modern: `
Interior redesign of the same ${roomType || "room"}.

${baseRules}

STYLE: MODERN LUXURY
- Minimalist, clutter-free layout
- Sleek premium furniture with clean lines
- Materials: glass, marble, metal, polished wood
- Neutral palette: white, beige, grey, black
- Hidden LED ceiling lights, ambient strip lighting
- Large open feeling, elegant simplicity

FINAL OUTPUT:
Bright modern luxury interior, ultra-clean, soft shadows, high-end materials, 4K architectural visualization, magazine-quality.
`,

    traditional: `
Interior redesign of the same ${roomType || "room"}.

${baseRules}

STYLE: CLASSIC TRADITIONAL
- Rich wooden furniture with carved details
- Ornate decor and elegant craftsmanship
- Warm tones: cream, gold, brown, beige
- Chandeliers and warm ambient lighting
- Decorative curtains, rugs, classic wall art

FINAL OUTPUT:
Warm, elegant traditional interior, cinematic lighting, rich textures, ultra-realistic 4K render, timeless luxury feel.
`,

    aesthetic: `
Interior redesign of the same ${roomType || "room"}.

${baseRules}

STYLE: AESTHETIC COZY
- Soft, modern furniture with rounded edges
- Indoor plants and natural decor elements
- Warm/pastel tones (beige, peach, soft green, off-white)
- Textured fabrics, rugs, wall art
- Cozy lighting: warm lamps, diffused glow, ambient lighting

FINAL OUTPUT:
Cozy Instagram-style interior, warm dreamy lighting, soft shadows, ultra-realistic 4K render, clean and stylish aesthetic.
`
  };

  return styles[style] || styles.modern;
};