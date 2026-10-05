'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Orbit, Crosshair, Radio } from 'lucide-react';
import { audioEngine } from './AudioEngine';

export type RadarFrequency = '3.0GHz' | '9.4GHz' | '1.2GHz';

interface SplineMaritimeHoloProps {
  threatLevel: 'TIER_1' | 'TIER_2' | 'TIER_3';
  isAisDark: boolean;
  hasEscort: boolean;
  zoneName: string;
  coordinates: string;
}

// Generate smooth circular radial glow texture to eliminate pixelated squares
function createGlowTexture(isCritical: boolean, isElevated: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const midColor = isCritical ? '#f43f5e' : isElevated ? '#f59e0b' : '#00ffaa';
    const haloColor = isCritical ? 'rgba(244, 63, 94, 0.45)' : isElevated ? 'rgba(245, 158, 11, 0.45)' : 'rgba(0, 229, 153, 0.45)';

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.2, midColor);
    gradient.addColorStop(0.55, haloColor);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Helper: Convert geographic (lat, lon) to 3D Cartesian coordinates on sphere
function latLonToVector3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(r * Math.sin(phi) * Math.cos(theta));
  const z = r * Math.sin(phi) * Math.sin(theta);
  const y = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Key Strategic Maritime Chokepoints
const STRATEGIC_CHOKEPOINTS = [
  { name: 'Bab-el-Mandeb', lat: 12.58, lon: 43.33 },
  { name: 'Suez Canal', lat: 29.97, lon: 32.55 },
  { name: 'Strait of Hormuz', lat: 26.56, lon: 56.25 },
  { name: 'Strait of Malacca', lat: 1.43, lon: 103.0 },
  { name: 'Gibraltar', lat: 35.95, lon: -5.6 },
  { name: 'Cape of Good Hope', lat: -34.35, lon: 18.47 },
];

const CORRIDOR_PAIRS = [
  [0, 1], // Bab-el-Mandeb -> Suez
  [0, 2], // Bab-el-Mandeb -> Hormuz
  [2, 3], // Hormuz -> Malacca
  [1, 4], // Suez -> Gibraltar
  [0, 5], // Bab-el-Mandeb -> Cape of Good Hope
];

export default function SplineMaritimeHolo({
  threatLevel,
  isAisDark,
  hasEscort,
  zoneName,
  coordinates,
}: SplineMaritimeHoloProps) {
  const [viewMode, setViewMode] = useState<'globe' | 'sweep'>('globe');
  const [frequencyMode, setFrequencyMode] = useState<RadarFrequency>('9.4GHz');
  
  const threeMountRef = useRef<HTMLDivElement | null>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const viewModeRef = useRef(viewMode);
  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  const frequencyModeRef = useRef(frequencyMode);
  useEffect(() => {
    frequencyModeRef.current = frequencyMode;
  }, [frequencyMode]);

  const isCritical = threatLevel === 'TIER_3';
  const isElevated = threatLevel === 'TIER_2';

  // =========================================================================
  // VIEW 1: Three.js 3D Holographic Chokepoint Globe with Luminous Particles & Corridors
  // =========================================================================
  useEffect(() => {
    const container = threeMountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 420;
    const height = container.clientHeight || 460;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Clear previous elements safely without React removeChild conflict
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Dynamic Zed Green Palette
    const primaryColor = isCritical ? 0xf43f5e : isElevated ? 0xf59e0b : 0x00e599;
    const secondaryColor = isCritical ? 0xfb7185 : isElevated ? 0xfde047 : 0x00ffaa;

    // Group for all rotating elements
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const radius = 72;

    // 1. Refined Luminous Circular Node Constellation (Frequency-calibrated)
    const particleCount = frequencyMode === '9.4GHz' ? 180 : frequencyMode === '3.0GHz' ? 115 : 70;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(primaryColor);
    const altColor = new THREE.Color(secondaryColor);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = radius + (Math.random() - 0.5) * 3;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const mixed = baseColor.clone().lerp(altColor, Math.random() * 0.6);
      particleColors[i * 3] = mixed.r;
      particleColors[i * 3 + 1] = mixed.g;
      particleColors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleTexture = createGlowTexture(isCritical, isElevated);
    const particleMat = new THREE.PointsMaterial({
      size: frequencyMode === '9.4GHz' ? 3.8 : frequencyMode === '3.0GHz' ? 4.5 : 5.4,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particlePoints);

    // 2. Strategic Arched Shipping Corridors
    const corridorMat = new THREE.LineBasicMaterial({
      color: secondaryColor,
      transparent: true,
      opacity: 0.5,
    });

    CORRIDOR_PAIRS.forEach(([idx1, idx2]) => {
      const cp1 = STRATEGIC_CHOKEPOINTS[idx1];
      const cp2 = STRATEGIC_CHOKEPOINTS[idx2];
      const v1 = latLonToVector3(cp1.lat, cp1.lon, radius);
      const v2 = latLonToVector3(cp2.lat, cp2.lon, radius);
      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(radius * 1.15); // Arch slightly above the sphere

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(24);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const corridorLine = new THREE.Line(curveGeo, corridorMat);
      globeGroup.add(corridorLine);
    });

    // 3. Latitude & Longitude Coordinate Wireframe Rings
    const ringMat = new THREE.LineBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.16,
    });

    // Latitude rings
    for (let lat = -60; lat <= 60; lat += 30) {
      const latRadius = radius * Math.cos((lat * Math.PI) / 180);
      const latY = radius * Math.sin((lat * Math.PI) / 180);
      const circleGeo = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * latRadius, latY, Math.sin(angle) * latRadius));
      }
      circleGeo.setFromPoints(points);
      const ringLine = new THREE.Line(circleGeo, ringMat);
      globeGroup.add(ringLine);
    }

    // Longitude meridian half-rings
    for (let lon = 0; lon < 180; lon += 45) {
      const lonGeo = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      const radLon = (lon * Math.PI) / 180;
      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            radius * Math.cos(angle) * Math.sin(radLon),
            radius * Math.sin(angle),
            radius * Math.cos(angle) * Math.cos(radLon)
          )
        );
      }
      lonGeo.setFromPoints(points);
      const lonLine = new THREE.Line(lonGeo, ringMat);
      globeGroup.add(lonLine);
    }

    // Atmospheric Core Halo
    const haloGeo = new THREE.SphereGeometry(radius * 0.96, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    globeGroup.add(haloMesh);

    // 4. Tactical Concentric Azimuth Horizon Gimbal Ring
    const equatorGeo = new THREE.RingGeometry(radius * 1.30, radius * 1.34, 64);
    const equatorMat = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.32,
    });
    const equatorLine = new THREE.Mesh(equatorGeo, equatorMat);
    equatorLine.rotation.x = Math.PI / 2.3;
    globeGroup.add(equatorLine);

    // 5. Upgraded Tactical Ownship Beacon Object
    const ownshipBeaconGroup = new THREE.Group();
    // Default location: Bab-el-Mandeb sector
    const ownshipPos = latLonToVector3(12.58, 43.33, radius);
    ownshipBeaconGroup.position.copy(ownshipPos);

    // A. Tactical Faceted Diamond Core
    const coreGeo = new THREE.OctahedronGeometry(3.2, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: isAisDark ? 0xf59e0b : hasEscort ? 0x00ffaa : 0x00e599,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    ownshipBeaconGroup.add(coreMesh);

    // B. Outer Tactical Diamond Reticle Frame
    const reticleGeo = new THREE.RingGeometry(5.2, 6.0, 4);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: isAisDark ? 0xf59e0b : 0x00ffaa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const reticleMesh = new THREE.Mesh(reticleGeo, reticleMat);
    ownshipBeaconGroup.add(reticleMesh);

    // C. Dynamic Expanding Sonar Ping Wave Ring
    const sonarWaveGeo = new THREE.RingGeometry(3.0, 3.8, 32);
    const sonarWaveMat = new THREE.MeshBasicMaterial({
      color: isAisDark ? 0xf59e0b : 0x00ffaa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const sonarWaveMesh = new THREE.Mesh(sonarWaveGeo, sonarWaveMat);
    ownshipBeaconGroup.add(sonarWaveMesh);

    // D. Course Heading Vector Line (HDG 328° - Course Over Ground)
    const headingPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-4, 10, 3)
    ];
    const headingGeo = new THREE.BufferGeometry().setFromPoints(headingPoints);
    const headingMat = new THREE.LineBasicMaterial({
      color: isAisDark ? 0xf59e0b : 0x00ffaa,
      transparent: true,
      opacity: 0.9,
    });
    const headingLine = new THREE.Line(headingGeo, headingMat);
    ownshipBeaconGroup.add(headingLine);

    globeGroup.add(ownshipBeaconGroup);

    // 6. Threat Zone Dynamic Radar Waves (Tier 3 Red Sea Corridor)
    const threatWaves: THREE.Mesh[] = [];
    if (isCritical) {
      for (let r = 1; r <= 3; r++) {
        const threatRingGeo = new THREE.RingGeometry(r * 14, r * 14 + 0.8, 48);
        const threatRingMat = new THREE.MeshBasicMaterial({
          color: 0xf43f5e,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45 / r,
        });
        const threatWave = new THREE.Mesh(threatRingGeo, threatRingMat);
        threatWave.position.copy(ownshipPos);
        threatWaves.push(threatWave);
        globeGroup.add(threatWave);
      }
    }

    // 7. Interactive Mouse Orbit Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroup.rotation.y += deltaX * 0.008;
      globeGroup.rotation.x += deltaY * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 8. Animation Loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (viewModeRef.current !== 'globe') return;

      const elapsedTime = (performance.now() - startTime) * 0.001;
      const pulseRate = frequencyModeRef.current === '9.4GHz' ? 8.0 : frequencyModeRef.current === '3.0GHz' ? 4.5 : 2.4;
      const speedMult = frequencyModeRef.current === '9.4GHz' ? 1.4 : frequencyModeRef.current === '3.0GHz' ? 1.0 : 0.65;

      // Slow continuous orbital rotation
      if (!isDragging) {
        globeGroup.rotation.y += 0.0025 * speedMult;
      }

      equatorLine.rotation.z = elapsedTime * 0.12 * speedMult;

      // Animate ownship diamond and reticle
      coreMesh.rotation.y = elapsedTime * 2.2 * speedMult;
      reticleMesh.rotation.z = elapsedTime * 1.5 * speedMult;

      // Dynamic Expanding Sonar Ping Wave
      const sonarCycle = (elapsedTime * (pulseRate / 3)) % 1;
      sonarWaveMesh.scale.set(1 + sonarCycle * 3.4, 1 + sonarCycle * 3.4, 1);
      sonarWaveMat.opacity = Math.max(0, 0.85 * (1 - sonarCycle));

      // Make ownship reticle face camera directly
      ownshipBeaconGroup.quaternion.copy(camera.quaternion);

      // Threat wave pulses
      if (isCritical) {
        threatWaves.forEach((tw, idx) => {
          tw.lookAt(camera.position);
          const wavePulse = 1 + Math.sin(elapsedTime * pulseRate + idx) * 0.12;
          tw.scale.set(wavePulse, wavePulse, wavePulse);
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTexture.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      equatorGeo.dispose();
      equatorMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      reticleGeo.dispose();
      reticleMat.dispose();
      sonarWaveGeo.dispose();
      sonarWaveMat.dispose();
    };
  }, [isCritical, isElevated, isAisDark, hasEscort, frequencyMode]);

  // =========================================================================
  // VIEW 2: 2D Tactical PPI Naval Radar Sweep with Ownship & Threat Blips
  // =========================================================================
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      if (viewModeRef.current !== 'sweep') return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(centerX, centerY) - 22;

      ctx.clearRect(0, 0, width, height);

      // 1. Radar Circular Scope Background
      ctx.fillStyle = '#030a06';
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.fill();

      // Scope outer border
      ctx.strokeStyle = isCritical ? 'rgba(244, 63, 94, 0.45)' : 'rgba(0, 229, 153, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. Tactical Range Rings (5nm, 10nm, 15nm, 20nm)
      const ringColor = isCritical ? 'rgba(244, 63, 94, 0.25)' : 'rgba(0, 229, 153, 0.2)';
      [0.25, 0.5, 0.75, 1.0].forEach((ratio, idx) => {
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * ratio, 0, Math.PI * 2);
        ctx.stroke();

        // Range labels
        ctx.fillStyle = isCritical ? '#fb7185' : '#00ffaa';
        ctx.font = '8px monospace';
        ctx.fillText(`${(idx + 1) * 5}NM`, centerX + 4, centerY - maxRadius * ratio + 10);
      });

      // 3. Azimuth Crosshairs (N, S, E, W)
      ctx.strokeStyle = 'rgba(0, 229, 153, 0.15)';
      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.stroke();

      // Cardinal bearings
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText('000° N', centerX - 14, centerY - maxRadius + 14);
      ctx.fillText('090° E', centerX + maxRadius - 38, centerY + 3);
      ctx.fillText('180° S', centerX - 14, centerY + maxRadius - 6);
      ctx.fillText('270° W', centerX - maxRadius + 8, centerY + 3);

      // Frequency Banner in radar scope
      ctx.fillStyle = '#64748b';
      ctx.font = '8px monospace';
      ctx.fillText(`FREQ: ${frequencyModeRef.current}`, centerX - 26, centerY + maxRadius - 16);

      // 4. Rotating Radar Sweep Beam with Zed Green Glow
      const sweepGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      const sweepEndColor = isCritical ? 'rgba(244, 63, 94, 0.45)' : 'rgba(0, 229, 153, 0.38)';
      sweepGradient.addColorStop(0, 'rgba(0, 229, 153, 0.05)');
      sweepGradient.addColorStop(1, sweepEndColor);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxRadius, 0, -Math.PI / 4, true);
      ctx.closePath();
      ctx.fill();

      // Leading beam edge line
      ctx.strokeStyle = isCritical ? '#f43f5e' : '#00ffaa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxRadius, 0);
      ctx.stroke();

      ctx.restore();

      // 5. Center Ownship: MV Nordic Sentinel
      ctx.fillStyle = isAisDark ? '#f59e0b' : '#00ffaa';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Ownship Heading Line (Course 328°)
      ctx.strokeStyle = isAisDark ? '#f59e0b' : '#00ffaa';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, centerY - 18);
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '8px monospace';
      ctx.fillText(isAisDark ? 'OWNSHIP [DARK]' : 'OWNSHIP [AIS ON]', centerX - 42, centerY + 18);

      // 6. Threat Blips (Hostile Anti-Ship Drones in Tier 3)
      if (isCritical) {
        const threats = [
          { x: centerX + maxRadius * 0.65, y: centerY - maxRadius * 0.45, label: 'DRONE LOCK #1' },
          { x: centerX + maxRadius * 0.82, y: centerY - maxRadius * 0.15, label: 'ASBM RADAR #2' },
        ];

        threats.forEach(t => {
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
          ctx.fill();

          // Pulsing danger ring
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 8 + Math.sin(angle * 4) * 3, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#fb7185';
          ctx.font = '8px monospace';
          ctx.fillText(t.label, t.x + 8, t.y + 3);
        });
      }

      // 7. Allied Warship CTF-153 Escort Blip
      if (hasEscort) {
        const escortX = centerX - maxRadius * 0.45;
        const escortY = centerY - maxRadius * 0.35;

        ctx.fillStyle = '#00ffaa';
        ctx.beginPath();
        ctx.arc(escortX, escortY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 229, 153, 0.6)';
        ctx.beginPath();
        ctx.arc(escortX, escortY, 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#00ffaa';
        ctx.font = '8px monospace';
        ctx.fillText('ALLIED WARSHIP CTF-153', escortX - 52, escortY - 10);
      }

      const sweepSpeed = frequencyModeRef.current === '9.4GHz' ? 0.034 : frequencyModeRef.current === '3.0GHz' ? 0.022 : 0.014;
      angle += sweepSpeed;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [threatLevel, isAisDark, hasEscort, viewMode]);

  return (
    <div className="holo-stage-container relative w-full h-full flex flex-col justify-between overflow-hidden">
      {/* Top Tactical View Switcher Toolbar */}
      <div className="stage-view-switcher z-20">
        <div className="view-mode-pill">
          <button
            onClick={() => { setViewMode('globe'); audioEngine.playSonarPing(); }}
            className={`view-pill-btn ${viewMode === 'globe' ? 'active' : ''}`}
            title="Switch to 3D Tactical Holographic Globe"
          >
            <Orbit className="w-3.5 h-3.5 text-emerald-400" />
            <span>3D GLOBE</span>
          </button>
          <button
            onClick={() => { setViewMode('sweep'); audioEngine.playSonarPing(); }}
            className={`view-pill-btn ${viewMode === 'sweep' ? 'active' : ''}`}
            title="Switch to 2D Tactical PPI Naval Radar Sweep"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span>2D RADAR</span>
          </button>
        </div>

        {/* Tactical Radar Frequency Selector */}
        <div className="frequency-selector-pill font-mono">
          <span className="freq-label">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>FREQ:</span>
          </span>
          <button
            onClick={() => { setFrequencyMode('3.0GHz'); audioEngine.playSonarPing(); }}
            className={`freq-btn ${frequencyMode === '3.0GHz' ? 'active' : ''}`}
            title="S-Band (3.0 GHz) - Standard Navigational Radar"
          >
            3.0 GHz
          </button>
          <button
            onClick={() => { setFrequencyMode('9.4GHz'); audioEngine.playSonarPing(); }}
            className={`freq-btn ${frequencyMode === '9.4GHz' ? 'active' : ''}`}
            title="X-Band (9.4 GHz) - High Resolution Targeting Radar"
          >
            9.4 GHz
          </button>
          <button
            onClick={() => { setFrequencyMode('1.2GHz'); audioEngine.playSonarPing(); }}
            className={`freq-btn ${frequencyMode === '1.2GHz' ? 'active' : ''}`}
            title="MIL-UHF (1.2 GHz) - Anti-Jam Tactical Frequency"
          >
            1.2 GHz
          </button>
        </div>
      </div>

      {/* Center 3D Stage Viewport */}
      <div className="stage-viewport flex items-center justify-center relative w-full h-full">
        {/* Viewport A: Three.js 3D Tactical Holographic Globe */}
        <div
          ref={threeMountRef}
          className={`stage-canvas-layer cursor-grab active:cursor-grabbing ${
            viewMode === 'globe' ? 'is-visible' : 'is-hidden'
          }`}
        />

        {/* Viewport B: 2D Tactical PPI Naval Radar Sweep */}
        <div
          className={`stage-canvas-layer flex items-center justify-center ${
            viewMode === 'sweep' ? 'is-visible' : 'is-hidden'
          }`}
        >
          <canvas
            ref={radarCanvasRef}
            width={380}
            height={380}
            className="rounded-full shadow-2xl max-w-[92%] max-h-[92%]"
          />
        </div>

        {/* Tactical Reticle Brackets */}
        <div className="reticle-bracket top-left" />
        <div className="reticle-bracket top-right" />
        <div className="reticle-bracket bottom-left" />
        <div className="reticle-bracket bottom-right" />
      </div>

      {/* Floating Status Indicator Strip */}
      <div className="stage-bottom-hud z-20">
        <div className="hud-pill-status">
          <span className={`hud-dot ${isCritical ? 'danger' : isElevated ? 'warning' : 'safe'}`} />
          <span className="hud-label font-mono">
            {isCritical ? 'TIER 3: DEADLOCK' : isElevated ? 'TIER 2: SPOOFING' : 'TIER 1: CLEAR'}
          </span>
          <span className="hud-divider">|</span>
          <span className="hud-ais font-mono">
            {isAisDark ? 'AIS: SILENCED' : 'AIS: ACTIVE'}
          </span>
          <span className="hud-divider">|</span>
          <span className="hud-escort font-mono text-slate-400">
            {hasEscort ? 'ESCORT: CTF-153' : 'ESCORT: NONE'}
          </span>
          <span className="hud-divider">|</span>
          <span className="hud-freq font-mono text-emerald-400">
            RF: {frequencyMode}
          </span>
        </div>
      </div>
    </div>
  );
}
