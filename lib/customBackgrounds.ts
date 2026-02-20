// Custom background patterns for hero sections
export const createCustomBackground = (type: 'wellness' | 'cta' | 'hero' = 'wellness') => {
  switch (type) {
    case 'cta':
      return `
        linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 25%, rgba(4, 120, 87, 0.9) 50%, rgba(6, 95, 70, 0.9) 75%, rgba(8, 84, 60, 0.9) 100%),
        radial-gradient(circle at 20% 50%, rgba(52, 211, 153, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(20, 184, 166, 0.2) 0%, transparent 50%),
        linear-gradient(45deg, #064e3b 0%, #065f46 25%, #047857 50%, #059669 75%, #10b981 100%)
      `;
    case 'wellness':
      return `
        linear-gradient(120deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 30%, rgba(13, 148, 136, 0.8) 60%, rgba(5, 150, 105, 0.9) 100%),
        radial-gradient(circle at 30% 20%, rgba(52, 211, 153, 0.2) 0%, transparent 40%),
        radial-gradient(circle at 70% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 40%),
        linear-gradient(45deg, #0f172a 0%, #1e293b 50%, #0d9488 100%)
      `;
    case 'hero':
    default:
      return `
        linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(13, 148, 136, 0.9) 50%, rgba(5, 150, 105, 0.95) 100%),
        radial-gradient(ellipse at top right, rgba(52, 211, 153, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at bottom left, rgba(20, 184, 166, 0.1) 0%, transparent 50%)
      `;
  }
};

export default createCustomBackground;