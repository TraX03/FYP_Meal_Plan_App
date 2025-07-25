import { Colors } from "@/constants/Colors";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { styles } from "./styles";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  animationDuration?: number;
  label?: string;
}

const ScoreCircle = ({
  score,
  size = 100,
  strokeWidth = 10,
  animationDuration = 1500,
  label = "Health Score",
}: ScoreCircleProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scoreAnimatedValue = useRef(new Animated.Value(0)).current;

  const [displayedScore, setDisplayedScore] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const getColor = (score: number): string => {
    if (score >= 80) return Colors.feedback.success;
    if (score >= 50) return Colors.feedback.warning;
    return Colors.feedback.error;
  };

  useEffect(() => {
    animatedValue.setValue(0);
    scoreAnimatedValue.setValue(0);

    Animated.timing(animatedValue, {
      toValue: score,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();

    Animated.timing(scoreAnimatedValue, {
      toValue: score,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();

    const id = scoreAnimatedValue.addListener(({ value }) => {
      setDisplayedScore(Math.round(value));
    });

    return () => {
      scoreAnimatedValue.removeListener(id);
    };
  }, [score, animationDuration]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: "clamp",
  });

  return (
    <View
      className="items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size} className="absolute">
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.surface.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View className="absolute items-center justify-center">
        <Text style={styles.scoreText}>{displayedScore}</Text>
        <Text style={styles.labelText}>{label}</Text>
      </View>
    </View>
  );
};

export default ScoreCircle;
