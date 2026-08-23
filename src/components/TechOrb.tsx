import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function TechOrb() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ─── Renderer ────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const setSize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };

    mount.appendChild(renderer.domElement);

    // ─── Scene & Camera ──────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 4.5);
    setSize();

    // ─── Lighting ────────────────────────────────────────────────
    // Ambient
    const ambient = new THREE.AmbientLight(0x1a1a2e, 2);
    scene.add(ambient);

    // Key light — warm copper-ish
    const keyLight = new THREE.DirectionalLight(0xffddaa, 3.5);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill light — cool blue rim
    const fillLight = new THREE.DirectionalLight(0x4488ff, 1.8);
    fillLight.position.set(-4, 1, -2);
    scene.add(fillLight);

    // Back / rim light — electric blue
    const rimLight = new THREE.PointLight(0x60a5fa, 3, 10);
    rimLight.position.set(0, -3, -3);
    scene.add(rimLight);

    // ─── Materials ───────────────────────────────────────────────
    // Dark matte hull
    const matteMat = new THREE.MeshStandardMaterial({
      color: 0x111118,
      roughness: 0.75,
      metalness: 0.3,
    });

    // Copper/bronze accent
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xc87533,
      roughness: 0.25,
      metalness: 0.95,
      envMapIntensity: 1.2,
    });

    // Glowing emissive ring
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x1a6fff,
      emissive: 0x1a6fff,
      emissiveIntensity: 2.5,
      roughness: 0.1,
      metalness: 0.6,
    });

    // Glass / lens
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x88bbff,
      emissive: 0x2255ff,
      emissiveIntensity: 0.8,
      roughness: 0.05,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75,
    });

    // ─── Group (everything rotates together) ─────────────────────
    const group = new THREE.Group();
    scene.add(group);

    // ─── Core sphere ─────────────────────────────────────────────
    const coreMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 64, 64),
      matteMat
    );
    coreMesh.castShadow = true;
    group.add(coreMesh);

    // ─── Equatorial ring (copper) ────────────────────────────────
    const ringGeo = new THREE.TorusGeometry(0.92, 0.055, 24, 120);
    const ring1 = new THREE.Mesh(ringGeo, copperMat);
    ring1.castShadow = true;
    group.add(ring1);

    // Tilted secondary ring (glow blue)
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.82, 0.03, 20, 100),
      glowMat
    );
    ring2.rotation.x = Math.PI / 2.4;
    ring2.rotation.z = Math.PI / 6;
    group.add(ring2);

    // Outer orbital ring (copper, tilted opposite)
    const ring3 = new THREE.Mesh(
      new THREE.TorusGeometry(1.08, 0.025, 16, 100),
      copperMat
    );
    ring3.rotation.x = Math.PI / 2;
    ring3.rotation.y = Math.PI / 4;
    group.add(ring3);

    // ─── Four copper "thruster" pods ─────────────────────────────
    const podGeo = new THREE.CapsuleGeometry(0.09, 0.22, 8, 16);
    const podAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    podAngles.forEach((angle) => {
      const pod = new THREE.Mesh(podGeo, copperMat);
      pod.position.set(Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0);
      pod.rotation.z = angle + Math.PI / 2;
      group.add(pod);

      // thruster glow dot
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 12, 12),
        new THREE.MeshStandardMaterial({
          color: 0x60a5fa,
          emissive: 0x60a5fa,
          emissiveIntensity: 4,
        })
      );
      glow.position.copy(pod.position);
      glow.position.multiplyScalar(1.12);
      group.add(glow);
    });

    // ─── Central lens ────────────────────────────────────────────
    const lens = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 32),
      glassMat
    );
    lens.position.set(0, 0, 0.55);
    group.add(lens);

    // Inner pupil
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x001122,
        emissive: 0x004488,
        emissiveIntensity: 1.5,
        roughness: 0.05,
        metalness: 1,
      })
    );
    pupil.position.set(0, 0, 0.72);
    group.add(pupil);

    // ─── Subtle point lights for lens glow ───────────────────────
    const lensGlow = new THREE.PointLight(0x4488ff, 2.5, 3);
    lensGlow.position.set(0, 0, 1.2);
    group.add(lensGlow);

    // ─── Mouse tracking ──────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const targetRot = { x: 0, y: 0 };
    const currentRot = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      // Normalize to -1..+1 relative to window
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      // Gentle parallax rotation (max ±20°)
      targetRot.y = mouse.x * 0.35;
      targetRot.x = mouse.y * -0.2;
    };

    // Touch support
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      mouse.x = (t.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
      targetRot.y = mouse.x * 0.35;
      targetRot.x = mouse.y * -0.2;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // ─── Resize ──────────────────────────────────────────────────
    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(mount);

    // ─── Animate ─────────────────────────────────────────────────
    let frame: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Levitation — smooth sine bob
      group.position.y = Math.sin(t * 0.9) * 0.12;

      // Auto slow spin (Y axis)
      group.rotation.y += 0.003;

      // Smooth mouse interpolation (lerp)
      const lerpFactor = 0.06;
      currentRot.x += (targetRot.x - currentRot.x) * lerpFactor;
      currentRot.y += (targetRot.y - currentRot.y) * lerpFactor;

      // Apply: base auto-spin + mouse tilt
      group.rotation.x = currentRot.x;
      // Blend mouse Y rotation on top of the auto spin
      group.rotation.y += currentRot.y * 0.02;

      // Rings counter-rotate for gyroscope feel
      ring2.rotation.z += 0.006;
      ring3.rotation.x += 0.004;

      // Pulse glow brightness
      const pulse = Math.sin(t * 2.4) * 0.5 + 1.5;
      (glowMat as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
      lensGlow.intensity = pulse * 1.8;

      renderer.render(scene, camera);
    };

    animate();

    // ─── Cleanup ─────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      aria-hidden="true"
      style={{ cursor: "none" }}
    />
  );
}
