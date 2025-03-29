import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Mobile optimization - fix iOS viewport height issues
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  
  // Set safe area insets as CSS variables if not already available through env()
  if (typeof window !== 'undefined') {
    const safeAreaTop = window.innerHeight - document.documentElement.clientHeight;
    if (safeAreaTop > 0) {
      document.documentElement.style.setProperty('--safe-area-inset-top', `${safeAreaTop}px`);
    }
  }
}

// Initialize viewport height
setViewportHeight();

// Update on resize and orientation change
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', () => {
  // Slight delay to ensure the browser has completed any UI adjustments
  setTimeout(setViewportHeight, 100);
});

// Prevent bouncing/scrolling in iOS when not needed
document.addEventListener('touchmove', (e) => {
  if (e.target instanceof HTMLElement) {
    const targetElement = e.target as HTMLElement;
    
    // Allow scrolling only on elements that need to scroll
    const isScrollable = 
      targetElement.classList.contains('overflow-y-auto') || 
      targetElement.classList.contains('overflow-auto');
      
    if (!isScrollable) {
      const isAtTop = window.scrollY <= 0;
      const isAtBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight;
      
      // Prevent pull-to-refresh and overscroll behaviors
      if ((isAtTop && e.touches[0].screenY > 0) || 
          (isAtBottom && e.touches[0].screenY < 0)) {
        e.preventDefault();
      }
    }
  }
}, { passive: false });

createRoot(document.getElementById("root")!).render(<App />);
