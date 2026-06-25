import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const THUMB_SIZE = 22;
const TRACK_HEIGHT = 6;
const HEIGHT = 36;

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

  const panResponder = useMemo(() => {
    const clamp = (touchX: number) =>
      Math.max(0, Math.min(effectiveWidth, touchX - THUMB_SIZE / 2));
    const toValue = (position: number) =>
      minimumValue + (position / effectiveWidth) * range;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        isDragging.current = true;
        scale.value = withTiming(1.15, { duration: 120 });
        const next = clamp(evt.nativeEvent.locationX);
        translateX.value = next;
        callbacksRef.current.onValueChange(toValue(next));
        callbacksRef.current.onSlidingStart?.();
      },
      onPanResponderMove: (evt) => {
        const next = clamp(evt.nativeEvent.locationX);
        translateX.value = next;
        callbacksRef.current.onValueChange(toValue(next));
      },
      onPanResponderRelease: (evt) => {
        const next = clamp(evt.nativeEvent.locationX);
        isDragging.current = false;
        scale.value = withTiming(1, { duration: 140 });
        callbacksRef.current.onSlidingComplete?.(toValue(next));
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        scale.value = withTiming(1, { duration: 140 });
      },
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
    <View
      onLayout={handleLayout}
      {...panResponder.panHandlers}
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
  );
};
