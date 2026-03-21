export const buildPrompt = ({ style, customPrompt, roomType }) => {
  const baseRules = `
IMPORTANT STRICT RULES:
- Preserve the EXACT original room layout, architecture, wall positions, windows, doors, and camera perspective.
- DO NOT alter room structure, proportions, or viewpoint.

RESTORATION & CLEANUP (MANDATORY):
- Completely REMOVE all damage: cracks, stains, peeling paint, dampness, scratches, dirt, dust, clutter, or imperfections.
- Replace ALL damaged, old, broken, or worn-out furniture and decor with brand-new, pristine items.
- Surfaces must appear clean, polished, and flawless.

LIGHTING (VERY IMPORTANT):
- Apply realistic, high-quality lighting that MATCHES the target style.
- Ensure proper brightness, soft shadows, natural/global illumination, and depth.
- Eliminate dull, flat, or poorly lit areas. The room should feel professionally lit.

REALISM:
- Use realistic materials (wood, marble, fabric, metal, glass).
- Ensure proper reflections, shadows, depth, and spatial consistency.
- Output should look like a high-end interior photoshoot.

- Remove any watermark, logo, or text overlay if present.
`;

  if (customPrompt?.trim()) {
    return `Interior redesign of the same ${roomType || "room"}.

${baseRules}

Redesign the entire interior (ceiling to floor) including furniture, lighting, decor, flooring, walls, and ceiling using this description:
${customPrompt}

FINAL OUTPUT:
Ultra-realistic interior design photography, high-end architectural visualization, perfectly clean and refined space, 4K photorealistic render, magazine-quality.`;
  }

  const styles = {
    modern: `Interior redesign of the same ${roomType || "room"}.

${baseRules}

STYLE TRANSFORMATION: MODERN LUXURY
- Minimalist, clutter-free design
- Sleek premium furniture
- Glass, marble, or metal finishes
- Neutral color palette (white, beige, grey, black)
- Hidden LED ceiling lighting, ambient strip lighting
- Clean lines and sophisticated decor

FINAL OUTPUT:
Bright, well-lit modern luxury interior, ultra-realistic, soft shadows, premium materials, 4K architectural render.`,

    traditional: `Interior redesign of the same ${roomType || "room"}.

${baseRules}

STYLE TRANSFORMATION: CLASSIC TRADITIONAL
- Rich wooden furniture with fine craftsmanship
- Ornate details, carved elements
- Chandeliers, warm ambient lighting
- Warm wall tones (cream, gold, brown)
- Elegant curtains, rugs, and classic decor

FINAL OUTPUT:
Warm, inviting traditional interior, cinematic lighting, rich textures, ultra-realistic 4K render.`,

    aesthetic: `Interior redesign of the same ${roomType || "room"}.

${baseRules}

STYLE TRANSFORMATION: AESTHETIC COZY
- Soft, stylish furniture
- Indoor plants and natural elements
- Pastel or warm color palette
- Textured fabrics, rugs, and wall art
- Cozy ambient lighting (warm lamps, diffused light)

FINAL OUTPUT:
Soft, cozy, Instagram-style aesthetic interior, warm lighting, dreamy atmosphere, ultra-realistic 4K render.`
  };

  return styles[style] || styles.modern;
};