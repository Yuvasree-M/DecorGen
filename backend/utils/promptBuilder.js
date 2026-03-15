export const buildPrompt = ({ style, customPrompt, roomType }) => {
  if (customPrompt?.trim()) {
    return `Interior redesign of the same ${roomType || "room"}.

IMPORTANT RULES:
- Preserve the exact original room layout, architecture, wall positions, windows, doors, and camera perspective.
- Do NOT change room structure or dimensions.
- If the input image contains any watermark, logo, or text overlay, remove it during the redesign.

Redesign the interior from ceiling to floor including furniture, lighting, decor, flooring, wall colors, and ceiling design using this description:
${customPrompt}.

Use realistic materials, natural lighting, soft shadows, reflections, and depth.

Ultra-realistic interior design photography, high-end architectural visualization, 4k photorealistic render, magazine-quality interior photo.`;
  }

  const styles = {
    modern: `Interior redesign of the same ${roomType || "room"}.

IMPORTANT RULES:
- Keep the exact same layout, architecture, windows, and camera angle.
- Do NOT modify walls, room shape, or structure.
- Remove watermark, logo, or text if present in the original image.

Transform the interior completely into modern luxury style:
minimalist furniture, sleek sofa, glass or marble coffee table, hidden LED ceiling lighting, neutral wall colors, wooden or marble flooring, modern decor.

Photorealistic interior design photography, architectural visualization, natural lighting, realistic shadows, ultra-detailed 4k render.`,

    traditional: `Interior redesign of the same ${roomType || "room"}.

IMPORTANT RULES:
- Maintain the exact original layout, walls, windows, and camera perspective.
- Do not change room structure.
- Remove watermark or text if present.

Redesign the interior in classic traditional style:
rich wooden furniture, carved tables, elegant lamps, chandeliers, warm wall tones, decorative curtains, patterned rugs.

Ultra-realistic traditional interior photography, cinematic lighting, realistic materials, 4k architectural render.`,

    aesthetic: `Interior redesign of the same ${roomType || "room"}.

IMPORTANT RULES:
- Keep the same layout, walls, windows, and camera angle.
- Do not modify architecture.
- Remove watermark or text if present in the image.

Transform the interior into aesthetic cozy style:
stylish furniture, indoor plants, warm lighting, pastel walls, aesthetic wall art, textured rugs, cozy decor.

Ultra-realistic aesthetic interior photography, instagram-style decor, soft lighting, photorealistic 4k render.`
  };

  return styles[style] || styles.modern;
};