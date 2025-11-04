# Page Transitions in SplitMate

## Current Setup

The app now uses native transitions provided by Expo Router and React Navigation.

### Default Behavior

#### iOS

- **Forward Navigation** (Mates → Upload): Slide from right to left
- **Back Navigation** (Upload → Mates): Slide from left to right (reverse)
- Uses iOS's native push/pop animation with proper gesture support

#### Android

- **Forward Navigation**: Fade + slight slide from bottom
- **Back Navigation**: Fade + slight slide to bottom (reverse)
- Uses Android's native fragment transitions

### How It Works

1. **Mates Screen** (`app/(tabs)/mates.tsx`):

   ```tsx
   router.push({
     pathname: "/(tabs)/upload",
   });
   ```

   - Uses `router.push()` for forward navigation
   - Automatically applies platform-specific slide animation

2. **Upload Screen** (`app/(tabs)/upload.tsx`):
   ```tsx
   router.back();
   ```
   - Uses `router.back()` for navigation back
   - Automatically reverses the animation (slide back)
   - Respects the navigation history stack

### Customizing Transitions

If you want to customize the animations further, you have several options:

#### Option 1: Tab-Level Animation (Current)

```tsx
// app/(tabs)/_layout.tsx
<Tabs
  screenOptions={{
    animation: "shift", // or "fade", "none"
  }}
>
```

#### Option 2: Per-Screen Animation

```tsx
<Tabs.Screen
  name="upload"
  options={{
    animation: "slide_from_right", // Only works with certain navigators
  }}
/>
```

#### Option 3: Custom Animated Transitions

For more control, you can use React Native's `Animated` API:

```tsx
import { Animated } from "react-native";

// In your component
const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }).start();
}, []);

return (
  <Animated.View style={{ opacity: fadeAnim }}>
    {/* Your content */}
  </Animated.View>
);
```

#### Option 4: Using react-native-reanimated (Advanced)

For more complex animations, install and use `react-native-reanimated`:

```bash
npx expo install react-native-reanimated
```

```tsx
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";

export default function UploadScreen() {
  return (
    <Animated.View entering={SlideInRight.duration(300)}>
      {/* Your content */}
    </Animated.View>
  );
}
```

### Available Animation Types

For Expo Router tabs, the following animation types are available:

- `"shift"` - Default tab switching animation
- `"fade"` - Fade in/out transition
- `"none"` - No animation

### Best Practices

1. **Use `router.back()`** instead of `router.push()` when going back

   - Maintains proper navigation history
   - Automatically reverses animations
   - Supports native gestures (swipe back on iOS)

2. **Keep animations consistent** across similar flows

   - Forward navigation should always feel like "going deeper"
   - Back navigation should reverse the forward animation

3. **Respect platform conventions**

   - iOS users expect slide animations
   - Android users expect fade + vertical slide
   - Let Expo Router handle this automatically

4. **Don't overdo it**
   - Subtle animations feel more native
   - Fast animations (200-300ms) feel snappier
   - Slow animations (>500ms) feel sluggish

### Current Flow

```
Mates Tab
   ↓ (router.push - slides right to left on iOS)
Upload Screen (hidden from tab bar)
   ↓ (router.back - slides left to right on iOS)
Mates Tab
```

The tab bar is hidden on the Upload screen to make it feel like a modal flow rather than a separate tab destination.
