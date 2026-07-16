import React, { useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, View, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const THUMB_SIZE = 22;
const TRACK_HEIGHT = 6;
const HEIGHT = 36;
const ACTIVATE_X = 8;
const FAIL_Y = 12;

interface SliderProps {
  value: number;
  minimumValue?: number;
  maximumValue: number;
  onValueChange: (value: number) => void;
  onSlidingStart?: () => void;
  onSlidingComplete?: (value: number) => void;
  disabled?: boolean;
  minimumTrackTintColor: string;
  maximumTrackTintColor: string;
  thumbTintColor: string;
  style?: ViewStyle;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  minimumValue = 0,
  maximumValue,
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
  disabled = false,
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  style,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const isDragging = useRef(false);
  const callbacksRef = useRef({
    onValueChange,
    onSlidingStart,
    onSlidingComplete,
  });
  callbacksRef.current = { onValueChange, onSlidingStart, onSlidingComplete };

  const range = Math.max(0.0001, maximumValue - minimumValue);
  const effectiveWidth = Math.max(1, containerWidth - THUMB_SIZE);
  const clampedValue = Math.max(minimumValue, Math.min(maximumValue, value));
  const thumbPosition =
    ((clampedValue - minimumValue) / range) * effectiveWidth;
  const thumbPositionRef = useRef(thumbPosition);
  thumbPositionRef.current = thumbPosition;
  const dragStartPos = useRef(0);
  const activationOffset = useRef(0);

  useEffect(() => {
    if (containerWidth === 0) return;
    const clamped = Math.max(minimumValue, Math.min(maximumValue, value));
    const target = ((clamped - minimumValue) / range) * effectiveWidth;
    if (isDragging.current) {
      translateX.value = target;
    } else {
      translateX.value = withTiming(target, { duration: 90 });
    }
  }, [
    value,
    containerWidth,
    effectiveWidth,
    minimumValue,
    maximumValue,
    range,
    translateX,
  ]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const panGesture = useMemo(() => {
    const clampPos = (position: number) =>
      Math.max(0, Math.min(effectiveWidth, position));
    const toValue = (position: number) =>
      minimumValue + (position / effectiveWidth) * range;

    return Gesture.Pan()
      .enabled(!disabled)
      .maxPointers(1)
      .activeOffsetX([-ACTIVATE_X, ACTIVATE_X])
      .failOffsetY([-FAIL_Y, FAIL_Y])
      .runOnJS(true)
      .onStart((e) => {
        isDragging.current = true;
        dragStartPos.current = thumbPositionRef.current;
        activationOffset.current = e.translationX;
        scale.value = withTiming(1.15, { duration: 120 });
        callbacksRef.current.onSlidingStart?.();
      })
      .onUpdate((e) => {
        const next = clampPos(
          dragStartPos.current + e.translationX - activationOffset.current
        );
        translateX.value = next;
        callbacksRef.current.onValueChange(toValue(next));
      })
      .onEnd((e) => {
        const next = clampPos(
          dragStartPos.current + e.translationX - activationOffset.current
        );
        callbacksRef.current.onSlidingComplete?.(toValue(next));
      })
      .onFinalize(() => {
        isDragging.current = false;
        scale.value = withTiming(1, { duration: 140 });
      });
  }, [disabled, effectiveWidth, minimumValue, range, scale, translateX]);

  const filledStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View
        onLayout={handleLayout}
        style={[
          {
            height: HEIGHT,
            justifyContent: "center",
            opacity: disabled ? 0.4 : 1,
          },
          style,
        ]}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: THUMB_SIZE / 2,
            right: THUMB_SIZE / 2,
            height: TRACK_HEIGHT,
            top: (HEIGHT - TRACK_HEIGHT) / 2,
            backgroundColor: maximumTrackTintColor,
            borderRadius: TRACK_HEIGHT / 2,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={[
              {
                height: TRACK_HEIGHT,
                backgroundColor: minimumTrackTintColor,
                borderRadius: TRACK_HEIGHT / 2,
              },
              filledStyle,
            ]}
          />
        </View>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: (HEIGHT - THUMB_SIZE) / 2,
              left: 0,
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: thumbTintColor,
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            },
            thumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
};
