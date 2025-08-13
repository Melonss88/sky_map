import { Planets, juliandays } from 'aa-js'
import { radec2xyz } from '../../utils/coordinateChange'
import * as THREE from 'three'
import colors from '../../config/color'
import planetConfigs from '../../config/planets-old'
import { createTextSprite } from '../drawFunc/drawLabels'
import { skyStore } from '../../store/skyStore';
import { d2r } from '../../utils/degRad'

export function getPlanetMesh(
  planetKey: string,
  clock: Date,
  latitudeDeg: number,
  longitudeDeg: number,
  radius: number,
  scene: THREE.Scene,
  showPlanets: boolean,
  showLabels: boolean,
  showGround: boolean
) {
  const planetsGroup = new THREE.Group();
  planetsGroup.name = "planets_lines"; 

  if(!showPlanets) return

  const t = skyStore.t.bind(skyStore);

  const jd = juliandays.getJulianDay(clock)
  const planet = Planets[planetKey]
  const coords = planet.getApparentGeocentricEquatorialCoordinates(jd)
  const mag = planet.getMagnitude(jd)

  const xyz = radec2xyz(
    coords.rightAscension,
    coords.declination,
    clock,
    latitudeDeg,
    longitudeDeg,
    radius
  )

  if (showGround && xyz.y <= 0) {
    return null;
  }

  const config = planetConfigs[planetKey]
  const VenusMesh = new THREE.Mesh(
    new THREE.SphereGeometry(
      config.radius, 
      config.segments, 
      config.segments
    ),
    new THREE.MeshBasicMaterial({ 
      color: colors.planets[planetKey]
    })
  );
  VenusMesh.position.copy(xyz)
  planetsGroup.add(VenusMesh);

  if(showLabels) {
    const sprite = createTextSprite(skyStore.t(`planets.${planetKey}`), colors.planets[planetKey]);
    sprite.position.copy(xyz.clone().add(new THREE.Vector3(0, 2, 0))); 
    planetsGroup.add(sprite);
  }

  scene.add(planetsGroup)


  skyStore.register('planets', {
    ra: coords.rightAscension * d2r,
    dec: coords.declination * d2r,
    label: planetKey,
    xyz: xyz
  });
  return planetsGroup
}