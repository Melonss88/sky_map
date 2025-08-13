interface AstronomicalTimesResult {
    GST: number;
    LST: number;
    JD: number;
}
  
    //  计算儒略日（Julian Date）方法1 -- 稍微后面的小数有一点点偏差
export function julianDate(clock: Date): number {
    const time = clock.getTime(); 
    return time / 86400000 + 2440587.5;
}    
//  计算儒略日（Julian Date）方法2  -- 和 aa-js的结果一样
export function getJulianDay(clock: Date): number {
    const Y = clock.getUTCFullYear();
    const M = clock.getUTCMonth() + 1;
    const D = clock.getUTCDate();
    const H = clock.getUTCHours();
    const Min = clock.getUTCMinutes();
    const S = clock.getUTCSeconds();
    return (
      367 * Y
      - Math.floor((7 * (Y + Math.floor((M + 9) / 12))) / 4)
      + Math.floor((275 * M) / 9)
      + D + 1721013.5
      + (H + Min / 60 + S / 3600) / 24
    );
}
  
// 计算恒星时（格林威治 + 当地）
export function calculateAstronomicalTimes(
    clock: Date = new Date(),
    longitude: number = 0
): AstronomicalTimesResult {
    const JD = julianDate(clock);
    const JD0 = Math.floor(JD - 0.5) + 0.5;
    const S = JD0 - 2451545.0;
    const T = S / 36525.0;

    let T0 = (6.697374558 + 2400.051336 * T + 0.000025862 * T * T) % 24;
    if (T0 < 0) T0 += 24;

    const UT =
    (((clock.getUTCMilliseconds() / 1000 + clock.getUTCSeconds()) / 60 +
        clock.getUTCMinutes()) /
        60 +
        clock.getUTCHours());

    const A = UT * 1.002737909;
    T0 += A;

    let GST = T0 % 24;
    if (GST < 0) GST += 24;

    let d = (GST + longitude / 15.0) / 24.0;
    d = d - Math.floor(d);
    if (d < 0) d += 1;

    const LST = 24.0 * d;

    return { GST, LST, JD };
}
  
