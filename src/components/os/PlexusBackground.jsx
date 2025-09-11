import React from 'react';

export default function PlexusBackground() {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const THREE = window.THREE;
    if (!THREE) return;
    const canvas = ref.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const points = [];
    for (let i = 0; i < 200; i++) {
      const p = new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
      p.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.08);
      points.push(p);
    }
    const pointGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const pointMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
    const particles = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(particles);

    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    camera.position.z = 50;
    let mouseX = 0, mouseY = 0, rafId = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX - window.innerWidth / 2;
      mouseY = e.clientY - window.innerHeight / 2;
    };
    document.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      const positions = particles.geometry.attributes.position.array;
      const linePositions = [];
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.add(p.velocity);
        if (p.x < -50 || p.x > 50) p.velocity.x *= -1;
        if (p.y < -50 || p.y > 50) p.velocity.y *= -1;
        if (p.z < -50 || p.z > 50) p.velocity.z *= -1;
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          if (p.distanceTo(p2) < 15) {
            linePositions.push(p.x, p.y, p.z, p2.x, p2.y, p2.z);
          }
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      camera.position.x += (mouseX * 0.001 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 0.001 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
    };
  }, []);

  return <canvas id="bg-canvas" ref={ref} />;
}

