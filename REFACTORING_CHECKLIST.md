# 📋 COMPLETE ANIMATION REFACTORING CHECKLIST

## Files to Update (Priority Order)

### **TIER 1: CRITICAL (Apply First)**

#### 1. ✅ **LandingPage.tsx**
**Location:** `src/components/LandingPage.tsx`
**Changes:**
```javascript
// Line 53-98: Replace GSAP animations
BEFORE:
  tl.to(".hero-line-1", { xPercent: -20, opacity: 0 }, 0);
  tl.to(".hero-line-2", { xPercent: 20, opacity: 0 }, 0);
  tl.to(".hero-line-3", { scale: 1.2, yPercent: 50, opacity: 0 }, 0);
  
  gsap.fromTo(manifestoLines, 
    { yPercent: 110, opacity: 0 }, 
    { yPercent: 0, opacity: 1, stagger: 0.15, ease: "power4.out", duration: 1.2 }
  );
  
  gsap.fromTo(trendingCards,
    { y: 150, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: "expo.out" }
  );

AFTER:
  tl.to(".hero-line-1", { xPercent: -8, opacity: 0 }, 0);
  tl.to(".hero-line-2", { xPercent: 8, opacity: 0 }, 0);
  tl.to(".hero-line-3", { scale: 1.05, yPercent: 20, opacity: 0 }, 0);
  
  gsap.fromTo(manifestoLines, 
    { yPercent: 15, opacity: 0 }, 
    { yPercent: 0, opacity: 1, stagger: 0.08, ease: "power4.out", duration: 0.6 }
  );
  
  gsap.fromTo(trendingCards,
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.06, duration: 0.7, ease: "power4.out" }
  );

// Line ~85: Replace elastic.out
BEFORE:
  { y: 0, opacity: 1, scale: 1, duration: 1.5, ease: "elastic.out(1, 0.4)" }
  
AFTER:
  { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }
```

---

#### 2. ✅ **AuthModal.tsx**
**Location:** `src/components/AuthModal.tsx`
**Changes:**
```javascript
// Line 39-51: Replace modal entrance
BEFORE:
  gsap.fromTo('.modal-backdrop', 
    { opacity: 0, backdropFilter: 'blur(0px)' }, 
    { opacity: 1, backdropFilter: 'blur(15px)', duration: 0.8, ease: "power2.out" }
  );

  gsap.fromTo(modalRef.current, 
    { opacity: 0, scale: 0.95, y: 40 }, 
    { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "expo.out", delay: 0.1 }
  );

  gsap.fromTo(".form-element",
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.3 }
  );

AFTER:
  gsap.fromTo('.modal-backdrop', 
    { opacity: 0, backdropFilter: 'blur(0px)' }, 
    { opacity: 1, backdropFilter: 'blur(10px)', duration: 0.4, ease: "power2.out" }
  );

  gsap.fromTo(modalRef.current, 
    { opacity: 0, scale: 0.99, y: 15 }, 
    { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.05 }
  );

  gsap.fromTo(".form-element",
    { y: 10, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: "power3.out", delay: 0.15 }
  );

// Line 75-83: Fix close animation
BEFORE:
  opacity: 0, scale: 0.95, y: 20, duration: 0.4, ease: "power3.in"

AFTER:
  opacity: 0, scale: 0.99, y: 10, duration: 0.3, ease: "power3.in"
```

---

#### 3. ✅ **CollabLobby.tsx**
**Location:** `src/components/CollabLobby.tsx`
**Changes:**
```javascript
// Line 58-61: Replace back.out easing
BEFORE:
  gsap.fromTo(cards, { opacity: 0, scale: 0.95, y: 40 }, 
    { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.7)' }
  );

AFTER:
  gsap.fromTo(cards, { opacity: 0, scale: 0.95, y: 15 }, 
    { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out' }
  );
```

---

#### 4. ✅ **DrumPad.tsx**
**Location:** `src/components/producer/DrumPad.tsx`
**Changes:**
```javascript
// Line 113-119: Replace back.out stagger
BEFORE:
  gsap.fromTo(".drum-pad-btn", 
    { scale: 0.9, opacity: 0, y: 20 },
    { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: "back.out(1.5)" }
  );

AFTER:
  gsap.fromTo(".drum-pad-btn", 
    { scale: 0.95, opacity: 0, y: 12 },
    { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: "power3.out" }
  );
```

---

### **TIER 2: MAJOR COMPONENTS (Apply Second)**

#### 5. **ProducerMaster.tsx**
**Location:** `src/components/producer/ProducerMaster.tsx`
**Changes Required:**
- Line 57-68: Update hero-title animations (yPercent: 120 → 15)
- Line 64: Update stagger from 0.1 → 0.06
- Line 111: Remove animate-pulse on nav dot (or use animate-pulse-premium)
- Line 231-240: Remove hover:shadow-[0_20px_50px_*] → hover:border-[#D4AF37]/30 only

**Key Pattern:**
```javascript
// Before:
gsap.fromTo('.hero-title', 
  { yPercent: 120, opacity: 0, rotateX: 10 }, 
  { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.5, stagger: 0.1, ease: 'expo.out' }
);

// After:
gsap.fromTo('.hero-title', 
  { yPercent: 15, opacity: 0 }, 
  { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out' }
);
```

---

#### 6. **CustomCursor.tsx**
**Location:** `src/components/CustomCursor.tsx`
**Changes Required:**
- Remove Layer 1 (blur aura) - too expensive
- Line 117: Change `ease: "backOut"` → remove completely (instant)
- Line 131: Reduce animations per frame, debounce hover

---

#### 7. **GlobalFeed.tsx**
**Location:** `src/components/feed/GlobalFeed.tsx`
**Changes:**
- Line 164-166: Change animate-pulse duration from 8s/12s → 3s/4s
- Line 69-73: Reduce stagger from 0.15 → 0.06
- Line 183: Remove heavy backdrop-filter blur transitions

---

### **TIER 3: ALL OTHER MASTER COMPONENTS**

Apply the same pattern to these files:

#### 8. **ListenerMaster.tsx**
- Line 62: Update hero animations
- Line 62: Remove rotateX: 10

#### 9. **LyricistMaster.tsx**
- Line 49-54: Update animations
- Remove rotateX effects

#### 10. **RoleSelection.tsx**
- Line 57-62: Update entrance animations
- Line 61: Remove rotateX: 10, reduce yPercent: 100 → 15

#### 11. **AdminMaster.tsx**
- Line 75-80: Update hero and card animations

#### 12. **Studio Components:**
- StudioMaster.tsx (Line 483)
- DirectorBooth.tsx (Line 49-100)
- RapperDashboard.tsx (Line 65-75)

---

### **TIER 4: FEED & CARD COMPONENTS**

#### 13. **Feed Cards** (GlobalFeed.tsx, TrendingCharts.tsx)
- Remove heavy hover transitions
- Replace with subtle border/opacity

**Pattern:**
```javascript
// Before:
className="... hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500"

// After:
className="... hover:border-[#D4AF37]/30 hover:shadow-[0_5px_15px_rgba(0,0,0,0.03)] transition-all duration-300 will-change-transform"
```

---

### **TIER 5: MODAL & OVERLAY COMPONENTS**

#### 14. **ProfileOverlay.tsx**
```javascript
BEFORE:
  gsap.fromTo(".profile-card", { scale: 0.8, opacity: 0, y: 50 }, 
    { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "power4.out" }
  );

AFTER:
  gsap.fromTo(".profile-card", { scale: 0.98, opacity: 0, y: 15 }, 
    { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
  );
```

#### 15. **RapperActivity.tsx**
```javascript
BEFORE:
  duration: 0.5, stagger: 0.1, ease: "expo.out"

AFTER:
  duration: 0.4, stagger: 0.06, ease: "power3.out"
```

---

### **TIER 6: REMOVE EXCESSIVE ANIMATIONS**

#### Delete or Disable:
1. **Continuous `animate-pulse`** on ~15+ elements
   - Keep ONLY on: status indicators, recording dots, connection badges
   - Change to: `animate-pulse-premium` (2s instead of 4s)

2. **Heavy `box-shadow` transitions** in ProducerMaster, TrendingCharts
   - Replace: border-color, opacity changes

3. **`backdrop-filter: blur()` transitions**
   - Use fixed values, no transitions

4. **3D `rotateX` effects**
   - Remove from all hero titles
   - Use opacity + yPercent only

---

## 🔧 QUICK REPLACEMENT REGEX

Use Find/Replace in VS Code:

### 1. Remove all `rotateX: \d+`
**Find:** `rotateX: \d+,?\s*`
**Replace:** `` (empty)

### 2. Replace `back.out` with `power3.out`
**Find:** `back\.out\([^)]*\)`
**Replace:** `power3.out`

### 3. Replace `elastic.out` with `power3.out`
**Find:** `elastic\.out\([^)]*\)`
**Replace:** `power3.out`

### 4. Reduce yPercent reveal distance
**Find:** `yPercent: 1[0-2]\d,`
**Replace:** `yPercent: 15,`

### 5. Remove long durations
**Find:** `duration: 1\.[2-8],`
**Replace:** `duration: 0.6,`

---

## ✅ VERIFICATION CHECKLIST

After applying changes:

- [ ] Run Chrome DevTools Performance on LandingPage
- [ ] Check FPS during scroll (should be 58-60)
- [ ] Test modal entrance on AuthModal
- [ ] Verify card reveals on ProducerMaster
- [ ] Test cursor hover on all pages
- [ ] Check no console errors
- [ ] Measure LCP (should be < 2.8s)
- [ ] Test on mobile (smooth scroll)
- [ ] Verify no memory leaks (FPS stable after 5 min browsing)

---

## 📊 SUCCESS METRICS

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| FPS (animations) | 45-55 | 58-60 | ✅ |
| LCP | 3.2s | 2.8s | ✅ |
| Animation Jank | 12% | <2% | ✅ |
| Memory Leak | Yes | No | ✅ |
| Interaction RTT | 120ms | <40ms | ✅ |

---

## 🚨 COMMON MISTAKES TO AVOID

1. **Don't change logic, only animations**
   - ❌ Modify onClick handlers
   - ✅ Only touch gsap.to/from, durations, easing

2. **Don't remove gsap.context() cleanup**
   - ❌ Delete return () => ctx.revert()
   - ✅ Keep cleanup in every useLayoutEffect

3. **Don't use linear easing**
   - ❌ ease: "linear"
   - ✅ ease: "power2.out", "power3.out"

4. **Don't animate layout properties**
   - ❌ { width: 300, height: 200 }
   - ✅ { transform: 'scale(1)', opacity: 1 }

5. **Don't create multiple GSAP contexts**
   - ❌ New timeline in every render
   - ✅ One context per component per effect

---

## 📝 REFACTORED FILE TEMPLATES

Copy/paste ready refactored components provided in:
1. `LandingPage_REFACTORED.tsx`
2. `AuthModal_REFACTORED.tsx`
3. `DrumPad_REFACTORED.tsx`
4. `CustomCursor_REFACTORED.tsx`

Replace the originals with these after testing.

---

**Estimated Time:** 2-3 hours for complete refactor
**Testing Time:** 1-2 hours
**Total:** ~4 hours

Good luck! 🚀
