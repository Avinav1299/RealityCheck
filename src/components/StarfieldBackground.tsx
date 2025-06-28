import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star properties
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      twinkle: number;
    }> = [];

    // Create stars
    const createStars = () => {
      const numStars = Math.floor((canvas.width * canvas.height) / 8000);
      stars.length = 0;
      
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random() * 0.8 + 0.2,
          twinkle: Math.random() * Math.PI * 2
        });
      }
    };

    createStars();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isDark) {
        // Draw stars only in dark mode
        stars.forEach((star, index) => {
          // Update twinkle
          star.twinkle += 0.02;
          
          // Calculate opacity with twinkle effect
          const twinkleOpacity = star.opacity * (0.5 + 0.5 * Math.sin(star.twinkle));
          
          // Draw star
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139, 92, 246, ${twinkleOpacity * 0.6})`;
          ctx.fill();
          
          // Add glow effect for larger stars
          if (star.size > 1.5) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139, 92, 246, ${twinkleOpacity * 0.1})`;
            ctx.fill();
          }

          // Move star
          star.y += star.speed;
          
          // Reset star position when it goes off screen
          if (star.y > canvas.height) {
            star.y = -star.size;
            star.x = Math.random() * canvas.width;
          }
        });

        // Add subtle nebula effect
        const gradient = ctx.createRadialGradient(
          canvas.width * 0.3, canvas.height * 0.3, 0,
          canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.5
        );
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.03)');
        gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.02)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.01)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${
        isDark ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ zIndex: 1 }}
    />
  );
};

export default StarfieldBackground;