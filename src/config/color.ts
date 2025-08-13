interface ColorPalette {
    txt: string;
    black: string;
    white: string;
    grey: string;
    stars: string;
    cardinal: string;
    constellation: string;
    constellationboundary: string;
    showers: string;
    galaxy: string;
    azLines: string;
    az: string;
    eqLines: string,
    eq: string;
    ec: string;
    gal: string;
    meridian: string;
    pointers?: string; 
}
interface PlanetsPalette {
    sun: string;
    moon: string;
    Venus: string;
    Mercury: string;
    Mars: string;
    Jupiter: string;
    Saturn: string;
    Uranus: string;
    Neptune: string;
    Pluto: string;
}

interface ColorSchemes {
    normal: ColorPalette;
    planets: PlanetsPalette;
}

const colors: ColorSchemes = {
    normal: {
        txt: "rgb(255,255,255)",
        black: "rgb(0,0,0)",
        white: "rgb(255,255,255)",
        grey: "rgb(100,100,100)",
        stars: 'rgb(255,255,255)',
        cardinal: 'rgba(163,228,255)',
        constellation: "rgba(180,180,255)",
        constellationboundary: "rgba(255,255,100)",
        showers: "rgba(100,255,100)",
        galaxy: "rgba(100,200,255)",
        azLines: "rgba(5,126,102)",
        eqLines: "rgba(255,100,100)",
        az: "rgba(5,126,102)",
        eq: "rgba(255,100,100)",
        ec: 'rgba(255,0,0)',
        gal: 'rgba(100,200,255,0.4)',
        meridian: 'rgba(25,255,0)',
        pointers: 'rgb(200,200,200)'
    },
    planets: {
        sun: 'rgb(255,215,0)',
        moon: 'rgb(150,150,150)',
        Venus: "rgb(245,222,179)",
        Mercury: 'rgb(195,164,195)',
        Mars: 'rgb(255,50,50)',
        Jupiter: 'rgb(255,150,150)',
        Saturn: 'rgb(200,150,150)',
        Uranus: 'rgb(173,216,230)',
        Neptune: 'rgb(70,130,180)',
        Pluto: 'rgb(220,220,220)'
    }
};

export default colors;