import { Sun } from 'aa-js'
import { juliandays } from 'aa-js'
import { radec2xyz } from '../../utils/coordinateChange'
import * as THREE from 'three'
import colors from '../../config/color'
import planetConfigs from '../../config/planets-old'
import { createTextSprite } from '../drawFunc/drawLabels'
import { skyStore } from '../../store/skyStore';
import { d2r } from '../../utils/degRad'

export function getSunMesh(
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

    const jd = juliandays.getJulianDay(clock)
    const coords = Sun.getApparentGeocentricEquatorialCoordinates(jd)

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
  
    const config = planetConfigs.sun
    const SunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(config.radius, config.segments, config.segments),
      new THREE.MeshBasicMaterial({ color: colors.planets.sun })
    )
    SunMesh.position.copy(xyz)
    planetsGroup.add(SunMesh);

    if(showLabels) {
      const sprite = createTextSprite(skyStore.t(config.name), colors.planets.sun);
      sprite.position.copy(xyz.clone().add(new THREE.Vector3(0, 6, 0))); 
      planetsGroup.add(sprite);
    }
  
    scene.add(planetsGroup)

    skyStore.register('sun', {
      ra: coords.rightAscension * d2r,
      dec: coords.declination * d2r,
      label: 'Sun',
      xyz: xyz
    });
    return planetsGroup
  }
  