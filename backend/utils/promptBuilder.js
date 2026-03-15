export const buildPrompt = ({ style, customPrompt, roomType }) => {
  if (customPrompt?.trim()) {
    return `This is a ${roomType || "room"}. Keep the exact same room layout and architecture. Do not change walls, windows, or camera angle. Replace existing furniture and decor using this description: ${customPrompt}. Realistic interior design photography.`;
  }
  const styles = {
    modern:      `This is a ${roomType || "room"}. Keep the same layout. Replace furniture with modern pieces — sleek sofa, glass coffee table, minimalist lighting. Neutral modern wall colors. Realistic interior design photography.`,
    traditional: `This is a ${roomType || "room"}. Keep same architecture. Replace furniture with classic wooden pieces, traditional lamps, elegant decor. Warm traditional wall tones. Realistic interior design photo.`,
    minimal:     `This is a ${roomType || "room"}. Same structure. Minimalist furniture only, remove clutter. Clean white or light grey walls. Scandinavian interior. Realistic interior photography.`,
    aesthetic:   `This is a ${roomType || "room"}. Same layout. Aesthetic style furniture, plants, cozy lighting, trendy decor. Pastel or warm wall colors. Instagram aesthetic. Realistic interior photography.`,
    luxury:      `This is a ${roomType || "room"}. Same structure. High-end luxury furniture, marble surfaces, velvet upholstery, gold accents, dramatic lighting. Luxury hotel-style interior. Realistic interior photography.`,
    bohemian:    `This is a ${roomType || "room"}. Same layout. Bohemian eclectic pieces, layered textiles, woven baskets, macrame, many plants. Warm earthy tones. Relaxed boho interior design. Realistic interior photography.`,
  };
  return styles[style] || styles.modern;
};
