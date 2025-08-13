import * as THREE from 'three';
import { d2r, drLatitude } from './degRad'
import { calculateAstronomicalTimes } from './date'

// 赤道坐标转换成地平坐标
export function coord2horizon(
  ra: number,               
  dec: number,              
  LST: number ,   
  latitude: number          
): [alt: number, az: number] {
  const ha = (Math.PI * LST / 12) - ra;

  const sinDec = Math.sin(dec);
  const cosDec = Math.cos(dec);
  const sinLat = Math.sin(latitude);
  const cosLat = Math.cos(latitude);

  // 计算高度 (Alt)
  const sinAlt = sinDec * sinLat + cosDec * cosLat * Math.cos(ha);
  const alt = Math.asin(sinAlt);

  // 计算方位角 (Az)
  const cosAz = (sinDec - sinAlt * sinLat) / (Math.cos(alt) * cosLat);
  let az = Math.acos(THREE.MathUtils.clamp(cosAz, -1, 1));  // 防止浮点误差导致 NaN

  // 判断东/西半球
  if (Math.sin(ha) > 0) {
    az = 2 * Math.PI - az;
  }

  return [alt, az];
}

// 赤道坐标转化成xyz坐标方法调用
export function radec2xyz(
  raDeg: number,         
  decDeg: number,         
  clock: Date,
  latitudeDeg: number,    
  longitudeDeg: number,
  radius : number             
): THREE.Vector3 {
  const ra = raDeg * d2r;
  const dec = decDeg * d2r;
  const latitude = drLatitude(latitudeDeg).rad;
  const { LST } = calculateAstronomicalTimes(clock, longitudeDeg)

  const [alt, az] = coord2horizon(ra, dec, LST, latitude);
  
  return altAzToVector3(az, alt, radius);
}

// 地平坐标转化成xyz坐标
export function altAzToVector3(
  az: number,
  alt: number,
  radius: number
): THREE.Vector3 {
  const x = -radius * Math.cos(alt) * Math.sin(az);  // 东向左，所以取负值
  const y = radius * Math.sin(alt);                
  const z = radius * Math.cos(alt) * Math.cos(az);  

  return new THREE.Vector3(x, y, z);
}

//赤道坐标直接转xyz
export function raDecToVector3(
  raDeg: number,  
  decDeg: number, 
  latDeg: number, 
  radius: number
): THREE.Vector3 {
  const raRad = raDeg * d2r;
  const decRad = decDeg * d2r;
  const latRad = latDeg * d2r;

  // 1. 标准天球坐标
  const x = radius * Math.cos(decRad) * Math.sin(raRad); // 6h=+X
  const z = radius * Math.cos(decRad) * Math.cos(raRad); // 0h=+Z
  const y = radius * Math.sin(decRad);
  const vec = new THREE.Vector3(x, y, z);

  // 2. 根据观测者纬度旋转天赤道
  const tiltAngle = Math.PI/2 - latRad; // 天赤道倾斜 = 90° - 纬度
  vec.applyAxisAngle(new THREE.Vector3(1, 0, 0), tiltAngle);

  return vec;
}

// 设置az之后方向转换
export function az_off(az: number, azOff: number) {
  const azRad = (az - azOff + 180) * d2r;
  return azRad
}

// 黄道坐标转xyz
export function ecliptic2xyz(
  l: number,
  b: number,
  LST: number,
  latRad: number,
  radius: number,
  azOff: number = 0
): THREE.Vector3 {
  // 1. 黄道坐标转赤道坐标
  const raDec = eclipticToEquatorial(l * d2r, b * d2r);
  
  // 2. 赤道坐标转地平坐标
  const [alt, az] = coord2horizon(raDec.ra, raDec.dec, LST, latRad);
  
  // 3. 应用方位角偏移
  const adjustedAz = (az * 180 / Math.PI - azOff + 180) * d2r; //az_off
  
  // 4. 地平坐标转三维坐标
  return altAzToVector3(adjustedAz, alt, radius);
}

export function eclipticToEquatorial(l: number, b: number): {ra: number, dec: number} {
  const epsilon = 23.439291 * d2r;
  const sinE = Math.sin(epsilon);
  const cosE = Math.cos(epsilon);
  
  const sinL = Math.sin(l);
  const cosL = Math.cos(l);
  const sinB = Math.sin(b);
  const cosB = Math.cos(b);
  
  // 计算赤经
  const ra = Math.atan2(
    sinL * cosE - Math.tan(b) * sinE,
    cosL
  );
  
  // 计算赤纬
  const dec = Math.asin(
    sinB * cosE + cosB * sinE * sinL
  );
  
  // 确保赤经为正
  return {
    ra: ra < 0 ? ra + 2 * Math.PI : ra,
    dec: dec
  };
}
