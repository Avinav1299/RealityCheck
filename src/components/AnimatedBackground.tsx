import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface AnimatedBackgroundProps {
  variant?: 'cubes' | 'starfield' | 'minimal';
  intensity?: 'low' | 'medium' | 'high';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  variant = 'cubes', 
  intensity = 'medium' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();
  const animationRef = useRef<number>();
  const [isMinimalMode, setIsMinimalMode] = useState(false);

  // Detect low-power devices
  useEffect(() => {
    const checkPerformance = () => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Check device memory (if available)
      const deviceMemory = (navigator as any).deviceMemory;
      const isLowMemory = deviceMemory && deviceMemory < 4;
      
      // Check for mobile devices
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      setIsMinimalMode(prefersReducedMotion || isLowMemory || (isMobile && intensity === 'high'));
    };

    checkPerformance();
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isMinimalMode) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation elements
    const elements: Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      rotation: number;
      rotationSpeed: number;
      color: string;
      pulse: number;
      pulseSpeed: number;
    }> = [];

    // Create elements based on variant
    const createElement = () => {
      const intensityMultiplier = intensity === 'low' ? 0.5 : intensity === 'high' ? 2 : 1;
      const numElements = Math.floor((canvas.width * canvas.height) / (variant === 'cubes' ? 15000 : 8000) * intensityMultiplier);
      
      elements.length = 0;
      
      for (let i = 0; i < numElements; i++) {
        const colors = isDark 
          ? ['rgba(59, 130, 246, 0.3)', 'rgba(139, 92, 246, 0.3)', 'rgba(236, 72, 153, 0.3)', 'rgba(6, 182, 212, 0.3)']
          : ['rgba(59, 130, 246, 0.2)', 'rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)', 'rgba(6, 182, 212, 0.2)'];
        
        elements.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * (variant === 'cubes' ? 8 : 3) + (variant === 'cubes' ? 4 : 1),
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random() * 0.6 + 0.2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          color: colors[Math.floor(Math.random() * colors.length)],
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01
        });
      }
    };

    createElement();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      elements.forEach((element) => {
        // Update position
        element.y += element.speed;
        element.rotation += element.rotationSpeed;
        element.pulse += element.pulseSpeed;
        
        // Calculate pulsing opacity
        const pulseOpacity = element.opacity * (0.5 + 0.5 * Math.sin(element.pulse));
        
        // Reset position when off screen
        if (element.y > canvas.height + element.size) {
          element.y = -element.size;
          element.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(element.x, element.y);
        ctx.rotate(element.rotation);
        ctx.globalAlpha = pulseOpacity;

        if (variant === 'cubes') {
          // Draw cube/square
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, element.size);
          gradient.addColorStop(0, element.color);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(-element.size / 2, -element.size / 2, element.size, element.size);
          
          // Add glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = element.color;
          ctx.strokeStyle = element.color;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(-element.size / 2, -element.size / 2, element.size, element.size);
        } else {
          // Draw star/circle for starfield
          ctx.beginPath();
          ctx.arc(0, 0, element.size, 0, Math.PI * 2);
          ctx.fillStyle = element.color;
          ctx.fill();
          
          // Add glow for larger elements
          if (element.size > 2) {
            ctx.beginPath();
            ctx.arc(0, 0, element.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = element.color.replace(/0\.\d+/, '0.1');
            ctx.fill();
          }
        }

        ctx.restore();
      });

      // Add subtle nebula effect
      if (variant === 'cubes' && isDark) {
        const gradient = ctx.createRadialGradient(
          canvas.width * 0.3, canvas.height * 0.3, 0,
          canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.5
        );
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.02)');
        gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.01)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.005)');
        
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
  }, [isDark, variant, intensity, isMinimalMode]);

  // Don't render canvas in minimal mode
  if (isMinimalMode) {
    return (
      <div 
        className={`fixed inset-0 pointer-events-none transition-colors duration-1000 ${
          isDark ? 'bg-black' : 'bg-white'
        }`}
        style={{ zIndex: 1 }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${
        isDark ? 'opacity-100' : 'opacity-30'
      }`}
      style={{ zIndex: 1 }}
    />
  );
};

export default AnimatedBackground;