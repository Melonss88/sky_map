interface PlanetConfig {
    name: string;    // 行星名称
    radius: number;  // 视觉化比例尺寸
    segments?: number; // 创建几何体时的细分面数
    interval: number;
}

const planetConfigs: Record<string, PlanetConfig> = {
    sun: {
        name: 'Sun',
        radius: 2.0,  // 基准大小
        segments: 32,
        interval: 1
    },
    moon: {
        name: 'Moon',
        radius: 1.0,
        segments: 16,
        interval: 0
    },
    Mercury: {
        name: 'Mercury',
        radius: 0.3,
        segments: 20,
        interval: 2.5
    },
    Venus: {
        name: 'Venus',
        radius: 0.6,
        segments: 24,
        interval: 8,
    },
    Earth: {
        name: 'Earth',
        radius: 0.5,
        segments: 24,
        interval: 1,
    },
    Mars: {
        name: 'Mars',
        radius: 0.4,
        segments: 24,
        interval: 20
    },
    Jupiter: {
        name: 'Jupiter',
        radius: 0.9,
        segments: 36,
        interval: 110,
    },
    Saturn: {
        name: 'Saturn',
        radius: 0.6,
        segments: 32,
        interval: 300,
    },
    Uranus: {
        name: 'Uranus',
        radius: 0.6,
        segments: 24,
        interval: 900,
    },
    Neptune: {
        name: 'Neptune',
        radius: 0.4,
        segments: 24,
        interval: 1800,
    },
    // Pluto: {
    //     name: 'Pluto',
    //     radius: 0.15,
    //     segments: 12
    // }
};

export default planetConfigs;