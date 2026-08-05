import React, { useEffect, useRef } from 'react';

interface NodePoint {
  id: string;
  name: string;
  xRatio: number;
  yRatio: number;
  vx: number;
  vy: number;
  currentX: number;
  currentY: number;
  pulsePhase: number;
  category: string;
}

interface EdgeConnection {
  from: string;
  to: string;
}

export const ImpactNetworkCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with lerp inertia
    let mouse = { 
      x: width * 0.4, 
      y: height * 0.4, 
      targetX: width * 0.4, 
      targetY: height * 0.4,
      smoothX: width * 0.4,
      smoothY: height * 0.4
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Spatial NGO Data Nodes (Delhi, Gurugram, Jaipur, Varanasi, Patna, Pune)
    const initialNodes: NodePoint[] = [
      { id: 'DEL', name: 'Delhi NCR Hub', xRatio: 0.16, yRatio: 0.26, vx: 0.15, vy: 0.1, currentX: 0, currentY: 0, pulsePhase: 0, category: 'HQ' },
      { id: 'GUR', name: 'Gurugram STEM', xRatio: 0.26, yRatio: 0.44, vx: -0.1, vy: 0.12, currentX: 0, currentY: 0, pulsePhase: 1.2, category: 'Education' },
      { id: 'JAI', name: 'Jaipur SHG', xRatio: 0.12, yRatio: 0.65, vx: 0.12, vy: -0.14, currentX: 0, currentY: 0, pulsePhase: 2.4, category: 'Women' },
      { id: 'VAR', name: 'Varanasi Health', xRatio: 0.46, yRatio: 0.22, vx: -0.14, vy: 0.08, currentX: 0, currentY: 0, pulsePhase: 3.6, category: 'Health' },
      { id: 'PAT', name: 'Patna Girls School', xRatio: 0.54, yRatio: 0.52, vx: 0.08, vy: -0.1, currentX: 0, currentY: 0, pulsePhase: 4.8, category: 'Education' },
      { id: 'PUN', name: 'Pune Watershed', xRatio: 0.36, yRatio: 0.82, vx: -0.12, vy: 0.14, currentX: 0, currentY: 0, pulsePhase: 5.5, category: 'Environment' }
    ];

    const connections: EdgeConnection[] = [
      { from: 'DEL', to: 'GUR' },
      { from: 'DEL', to: 'VAR' },
      { from: 'GUR', to: 'JAI' },
      { from: 'VAR', to: 'PAT' },
      { from: 'JAI', to: 'PUN' },
      { from: 'PAT', to: 'PUN' },
      { from: 'GUR', to: 'PAT' }
    ];

    // Main render loop
    const render = () => {
      // Fluid lerp mouse physics (Inertial delay)
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;
      
      // Secondary smooth layer
      mouse.smoothX += (mouse.x - mouse.smoothX) * 0.04;
      mouse.smoothY += (mouse.y - mouse.smoothY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // 1. Amplified Elegant Ambient Light Source (Layer 1: 100-200px visible movement)
      const lightRadius = Math.max(width, height) * 0.38;
      const lightGradient = ctx.createRadialGradient(
        mouse.smoothX, mouse.smoothY, 0,
        mouse.smoothX, mouse.smoothY, lightRadius
      );
      lightGradient.addColorStop(0, 'rgba(15, 118, 110, 0.11)');
      lightGradient.addColorStop(0.35, 'rgba(5, 150, 105, 0.045)');
      lightGradient.addColorStop(0.7, 'rgba(15, 118, 110, 0.012)');
      lightGradient.addColorStop(1, 'rgba(248, 250, 252, 0)');

      ctx.fillStyle = lightGradient;
      ctx.fillRect(0, 0, width, height);

      // Calculate node coordinates with gravitational reactance & organic float
      initialNodes.forEach(node => {
        node.pulsePhase += 0.018;
        const floatX = Math.sin(node.pulsePhase) * 7;
        const floatY = Math.cos(node.pulsePhase * 0.85) * 7;

        let baseX = node.xRatio * width + floatX;
        let baseY = node.yRatio * height + floatY;

        // Gravitational Pull towards cursor proximity
        const distToMouse = Math.hypot(mouse.x - baseX, mouse.y - baseY);
        const gravRadius = 280;

        if (distToMouse < gravRadius) {
          const force = (1 - distToMouse / gravRadius) * 24; // Subtle 24px gravitational pull
          const angle = Math.atan2(mouse.y - baseY, mouse.x - baseX);
          baseX += Math.cos(angle) * force;
          baseY += Math.sin(angle) * force;
        }

        node.currentX += (baseX - node.currentX) * 0.1;
        node.currentY += (baseY - node.currentY) * 0.1;
      });

      // 2. Multi-Layer Connection Edges (Proximity Illuminated Hairlines)
      connections.forEach(conn => {
        const fromNode = initialNodes.find(n => n.id === conn.from);
        const toNode = initialNodes.find(n => n.id === conn.to);
        if (!fromNode || !toNode) return;

        // Proximity distance from edge midpoint to mouse
        const midX = (fromNode.currentX + toNode.currentX) / 2;
        const midY = (fromNode.currentY + toNode.currentY) / 2;
        const distToMouse = Math.hypot(mouse.x - midX, mouse.y - midY);

        let strokeAlpha = 0.14;
        let lineWidth = 1;

        if (distToMouse < 260) {
          const factor = 1 - distToMouse / 260;
          strokeAlpha += factor * 0.42; // Up to 0.56 alpha on proximity
          lineWidth = 1 + factor * 1.5;
        }

        ctx.beginPath();
        ctx.moveTo(fromNode.currentX, fromNode.currentY);
        ctx.lineTo(toNode.currentX, toNode.currentY);
        ctx.strokeStyle = `rgba(15, 118, 110, ${strokeAlpha})`;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 3. Dynamic Nodes & Gravitational Proximity Rings
      initialNodes.forEach(node => {
        const distToMouse = Math.hypot(mouse.x - node.currentX, mouse.y - node.currentY);
        const isHovered = distToMouse < 220;
        const ringScale = isHovered ? (220 - distToMouse) / 220 : 0;

        // Outer Gravitational Pulse Field Ring
        ctx.beginPath();
        ctx.arc(
          node.currentX, 
          node.currentY, 
          7 + Math.sin(node.pulsePhase) * 3 + ringScale * 12, 
          0, 
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(15, 118, 110, ${0.08 + ringScale * 0.22})`;
        ctx.fill();

        // Inner Bright Core
        ctx.beginPath();
        ctx.arc(node.currentX, node.currentY, 3.5 + ringScale * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#0f766e' : '#475569';
        ctx.fill();

        // Typography Node Label
        if (isHovered || width > 1100) {
          ctx.font = `${isHovered ? 'bold 11px' : '10px'} "Plus Jakarta Sans", sans-serif`;
          ctx.fillStyle = isHovered ? '#0f172a' : '#64748b';
          ctx.fillText(node.name, node.currentX + 12, node.currentY + 4);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
    />
  );
};
