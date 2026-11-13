import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

// Fondu + léger glissement vers le haut au premier passage dans le viewport
// (IntersectionObserver plutôt qu'un scroll-listener manuel — plus léger,
// pas de recalcul à chaque pixel de défilement). `once` : l'animation ne
// rejoue pas si l'utilisateur remonte puis redescend, pour rester sobre.
function Reveal({ children, delay = 0, sx, component = 'div' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // Respecte la préférence système : pas d'animation d'entrée si
    // l'utilisateur a demandé de réduire les mouvements.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      component={component}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export default Reveal;
