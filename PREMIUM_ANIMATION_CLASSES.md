# 🎬 PREMIUM ANIMATION CLASS LIBRARY

## Drop-In Tailwind Classes for 60FPS Performance

Use these classes instead of custom durations/easings:

### **✅ ENTRANCE ANIMATIONS (Use in gsap.fromTo)**

```javascript
// Fast entrance (0.4s) - Buttons, inputs
{ y: 10, opacity: 0 }
→ { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
CLASS: will-change-transform

// Medium entrance (0.6s) - Cards, sections
{ y: 15, opacity: 0 }
→ { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.06 }
CLASS: will-change-transform

// Cinematic entrance (0.8s) - Hero only
{ yPercent: 10, opacity: 0 }
→ { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out" }
CLASS: will-change-transform

// Scale entrance (0.5s)
{ scale: 0.98, opacity: 0 }
→ { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" }
CLASS: will-change-transform
```

---

### **✅ HOVER ANIMATIONS (Tailwind Only)**

Instead of complex gsap hover animations:

```html
<!-- BEFORE (Bad - triggers box-shadow paint) -->
<div class="hover:shadow-[0_20px_50px_rgba(...)] transition-all duration-500">

<!-- AFTER (Good - instant, cheap opacity/border) -->
<div class="hover:border-[#D4AF37]/30 hover:shadow-[0_5px_15px_rgba(0,0,0,0.03)] transition-all duration-200 will-change-transform">
```

Key classes for premium hovers:
```html
<!-- Hover Border Color Only -->
<div class="border border-transparent hover:border-[#D4AF37]/30 duration-200">

<!-- Hover Opacity Shift -->
<div class="opacity-90 hover:opacity-100 duration-200">

<!-- Hover Scale (Minimal) -->
<div class="hover:scale-[1.01] duration-300 will-change-transform">

<!-- Hover with subtle shadow -->
<div class="shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)] duration-250">

<!-- Hover text color (Instant for interactive) -->
<div class="text-[#111111] hover:text-[#D4AF37] duration-200">
```

---

### **✅ STATUS INDICATORS**

DON'T use `animate-pulse` everywhere. Instead:

```html
<!-- CRITICAL indicator only (fast pulse) -->
<span class="w-2 h-2 bg-[#D4AF37] animate-pulse" style="animationDuration: 1.8s"></span>

<!-- Recording indicator (ultra fast) -->
<span class="animate-pulse" style="animationDuration: 1.5s"></span>

<!-- Connection badge (slow) -->
<span class="animate-pulse" style="animationDuration: 2.5s"></span>

<!-- Background glow (optional, not critical) -->
<div class="animate-pulse" style="animationDuration: 3s"></div>

<!-- AVOID: animating multiple elements with animate-pulse -->
```

---

### **✅ SCROLL REVEAL (ScrollTrigger + Tailwind)**

```javascript
// Fast reveal on scroll
gsap.fromTo(el,
  { y: 20, opacity: 0 },
  { 
    y: 0, opacity: 1, duration: 0.6, ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 80%" }
  }
);

// Add to element:
className="... will-change-transform"
```

---

### **✅ SMOOTH BACKGROUND GLOWS**

For ambient background effects:

```html
<!-- Glow (No animation by default) -->
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none"></div>

<!-- IF YOU MUST ANIMATE IT: Use will-change, reduce frequency -->
<div class="... will-change-filter animation-slow" style="animationDuration: 8s"></div>

<!-- BETTER: Just use fixed glow, no animation -->
```

---

### **✅ CARD INTERACTIONS**

Best practice hover card pattern:

```html
<div class="group relative bg-white border border-[#001433]/5 rounded-[1rem] p-8 transition-all duration-300 will-change-transform overflow-hidden hover:shadow-[0_5px_15px_rgba(0,0,0,0.03)] hover:border-[#D4AF37]/30">
  
  <!-- Optional: Subtle glow on hover (no expensive blur) -->
  <div class="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-[30px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
  
  <!-- Content -->
  <h3 class="group-hover:text-[#D4AF37] transition-colors duration-200">Title</h3>
  
  <!-- Hover action button -->
  <button class="group-hover:scale-105 transition-transform duration-200 will-change-transform">
    Action
  </button>
</div>
```

**Why this works:**
- ✅ Border change (cheap)
- ✅ Shadow is minimal and instant
- ✅ Glow appears on opacity (not filter transition)
- ✅ All properties use will-change
- ✅ Durations are ≤300ms

---

### **✅ NAVIGATION ITEMS**

Premium nav hover pattern:

```html
<!-- Active state (instant visual feedback) -->
<button class="text-[#D4AF37] font-black transition-colors duration-150">
  Active
</button>

<!-- Hover state (quick, snappy) -->
<button class="text-[#001433]/40 hover:text-[#001433] hover:bg-white transition-all duration-200">
  Inactive
</button>

<!-- Focus state (accessibility) -->
<button class="focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 duration-100">
  Keyboard Nav
</button>
```

---

### **✅ MODAL PATTERNS**

Smooth modal entrance/exit:

```html
<!-- Modal Container (Controls entrance/exit via gsap) -->
<div class="fixed inset-0 z-[999999] flex items-center justify-center p-4">
  
  <!-- Backdrop (Animate separately for smooth blur) -->
  <div class="modal-backdrop absolute inset-0 bg-black/40"></div>
  
  <!-- Modal Card (Main animation target) -->
  <div class="w-full max-w-2xl bg-white rounded-[2.5rem] border border-white shadow-[0_40px_80px_rgba(0,0,0,0.3)] z-10 will-change-transform">
    <!-- Content -->
  </div>
</div>

<!-- GSAP Timeline:
gsap.fromTo('.modal-backdrop', 
  { opacity: 0, backdropFilter: 'blur(0px)' }, 
  { opacity: 1, backdropFilter: 'blur(10px)', duration: 0.4, ease: "power2.out" }
);

gsap.fromTo(modalRef.current, 
  { opacity: 0, scale: 0.99, y: 15 }, 
  { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out" }
);
-->
```

---

### **✅ RESPONSIVE ANIMATION TWEAKS**

Mobile devices need even lighter animations:

```html
<!-- Desktop: Full animation -->
<div class="duration-500 md:duration-300">
  Premium hover
</div>

<!-- Mobile: Instant (prefers-reduced-motion respected) -->
<div class="duration-200 sm:duration-150">
  Quick feedback
</div>

<!-- Respect user preference -->
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### **✅ DISALLOWED PATTERNS**

❌ **DO NOT USE:**

```html
<!-- Too many simultaneous animations -->
<div class="animate-pulse hover:scale-110 group-hover:shadow-[0_30px_60px_*] transition-all duration-700">

<!-- Complex 3D transforms -->
<div class="transform-gpu rotateX-10 rotateY-20 scale-95">

<!-- Heavy filters on transitions -->
<div class="hover:blur-lg hover:brightness-110 transition-all duration-500">

<!-- Long stagger delays -->
<div class="stagger-500"> <!-- Every element waiting 0.5s -->

<!-- Multiple effects on one hover -->
<div class="hover:shadow-2xl hover:scale-125 hover:rotate-6 duration-700">
```

---

### **✅ ACCESSIBILITY**

Always include:

```html
<!-- Keyboard focus visible -->
<button class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37]">
  Click me
</button>

<!-- Respect motion preferences -->
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0ms !important; transition-duration: 0ms !important; }
}

<!-- Sufficient color contrast -->
<div class="text-white bg-[#111111]"> <!-- WCAG AA ✓ -->
```

---

### **✅ PERFORMANCE OPTIMIZED UTILITIES**

Add to your `@layer utilities`:

```css
/* Instant, optimized stagger */
.stagger-tight { @apply stagger-5; }
.stagger-medium { @apply stagger-10; }
.stagger-loose { @apply stagger-20; }

/* Premium easing presets */
.ease-premium { @apply ease-[cubic-bezier(0.4, 0, 0.2, 1)]; }
.ease-smooth { @apply ease-[cubic-bezier(0.2, 0, 0.8, 1)]; }

/* Safe animation targets */
.safe-animate { @apply will-change-transform; }
.safe-animate-opacity { @apply will-change-opacity; }

/* Duration standards */
.duration-fast { @apply duration-200; }
.duration-standard { @apply duration-300; }
.duration-slow { @apply duration-500; }
```

---

### **✅ REAL-WORLD EXAMPLE**

Complete button component with premium animations:

```jsx
export function PremiumButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-8 py-4 rounded-full
        bg-[#111111] text-white
        font-black uppercase tracking-[0.3em] text-[10px]
        border border-transparent
        transition-all duration-200
        will-change-transform
        hover:bg-[#D4AF37] 
        hover:text-[#111111]
        hover:shadow-[0_10px_30px_rgba(212,175,55,0.3)]
        active:scale-95
        disabled:opacity-50 disabled:hover:bg-[#111111] disabled:hover:text-white
        focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50
      `}
    >
      {children}
    </button>
  );
}
```

Benefits:
- ✅ Instant hover feedback
- ✅ No box-shadow jank
- ✅ GPU-accelerated (scale only)
- ✅ Accessibility built-in
- ✅ 60FPS on all devices

---

## 🎯 GOLDEN RULES

1. **Durations:** 0.2s - 0.6s (never exceed 0.8s for UI)
2. **Easing:** power2.out, power3.out, expo.out only
3. **Distances:** y: 10-20px, scale: 0.98-1.01 (subtle)
4. **Properties:** transform, opacity ONLY
5. **Stagger:** 0.04-0.08s (tight waves)
6. **will-change:** Always on continuous animations
7. **Hover:** 0.2-0.3s duration, instant visual feedback
8. **Mobile:** Reduce all durations by 50%
9. **Accessibility:** Respect prefers-reduced-motion

Follow these patterns and you'll have Apple/Stripe-level animations. 🚀
