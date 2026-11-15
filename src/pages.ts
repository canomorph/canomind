export const mm2px = (mm: number) => Math.round((mm / 25.4) * 96);
// portrait sizes in mm (ISO 216)
export const A_SIZES: [string, number, number][] = [["A0", 841, 1189], ["A1", 594, 841], ["A2", 420, 594], ["A3", 297, 420], ["A4", 210, 297], ["A5", 148, 210], ["A6", 105, 148]];
export const B_SIZES: [string, number, number][] = [["B0", 1000, 1414], ["B1", 707, 1000], ["B2", 500, 707], ["B3", 353, 500], ["B4", 250, 353], ["B5", 176, 250], ["B6", 125, 176]];
export const SCREENS: [string, number, number][] = [["HD", 1280, 720], ["Full HD", 1920, 1080], ["Quad HD", 2560, 1440], ["4K", 3840, 2160], ["8K", 7680, 4320]];
export const MARK_SIZES = [...A_SIZES, ...B_SIZES];
export const MARK_COLORS = ["#e53935", "#fb8c00", "#43a047", "#1e88e5", "#8e24aa", "#00897b", "#6d4c41", "#d81b60"];
export const markColor = (id: string) => MARK_COLORS[Math.max(0, MARK_SIZES.findIndex((s) => s[0] === id)) % MARK_COLORS.length];
export const cm = (mm: number) => (mm / 10).toFixed(1);
export const inch = (mm: number) => (mm / 25.4).toFixed(2);
