import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 350px or reaching lower portions of the page
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.7, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 15 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Return to top"
          className="fixed bottom-6 right-6 z-50 flex size-11 items-center justify-center rounded-full border border-white/10 bg-[#131d2e]/85 text-foreground backdrop-blur-md shadow-lg shadow-black/30 transition-colors duration-300 hover:border-primary/60 hover:bg-[#182438] hover:text-primary md:bottom-8 md:right-8 md:size-12 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ChevronUp
            className="size-5 stroke-[2.5] text-foreground/90 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-primary"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
