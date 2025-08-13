export const d2r = Math.PI / 180; // Degree to radian conversion factor
export const r2d = 180 / Math.PI;

// Helper function: Constrain latitude between [-π/2, π/2]
function inrangeEl(rad: number): number {
    return Math.max(-Math.PI/2, Math.min(Math.PI/2, rad));
}

export function drLatitude(latitude: number): { deg: number; rad: number } {
    return {
        deg: latitude,
        rad: inrangeEl(latitude * d2r)
    };
}

export function drLongitude(longitude: number): { deg: number; rad: number } {
    let rad = longitude * d2r;
    // Normalize longitude to [-π, π] range
    while (rad <= -Math.PI) rad += 2 * Math.PI;
    while (rad > Math.PI) rad -= 2 * Math.PI;
    
    return {
        deg: longitude, //度数
        rad: rad //弧度
    };
}