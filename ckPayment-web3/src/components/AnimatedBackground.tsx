import { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Hexagon grid
    const drawHexGrid = () => {
      if (!ctx) return;

      const size = 40; // Size of hexagons
      const width = canvas.width;
      const height = canvas.height;
      const hexHeight = size * 2;
      const hexWidth = Math.sqrt(3) / 2 * hexHeight;

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.lineWidth = 0.5;

      // Draw hex grid
      for (let y = -hexHeight; y < height + hexHeight; y += hexHeight * 0.75) {
        for (let x = -hexWidth; x < width + hexWidth; x += hexWidth * 3) {
          const xPos = x + (y % (hexHeight * 1.5) === 0 ? 0 : hexWidth * 1.5);
          drawHexagon(ctx, xPos, y, size);
        }
      }
    };

    const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const xVertex = x + size * Math.cos(angle);
        const yVertex = y + size * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(xVertex, yVertex);
        } else {
          ctx.lineTo(xVertex, yVertex);
        }
      }
      ctx.closePath();
      ctx.stroke();
    };

    // Animated particles
    const particles: Particle[] = [];
    const particleCount = 80;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `rgba(74, 222, 128, ${Math.random() * 0.5 + 0.2})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      if (!ctx) return;

      // Clear canvas with slight transparency for trail effect
      ctx.fillStyle = 'rgba(10, 10, 20, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw hex grid
      drawHexGrid();

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();

        // Draw connections between nearby particles
        particles.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = `rgba(74, 222, 128, ${(1 - distance / 150) * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      style={{ zIndex: 1 }}
    />
  );
};

export default AnimatedBackground;
