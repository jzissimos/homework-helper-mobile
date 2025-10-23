// Confetti Celebration Component
// Shows animated confetti when achievements/goals are completed

import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Dimensions } from 'react-native'
import { colors } from '../theme/colors'

const { width, height } = Dimensions.get('window')

interface ConfettiPiece {
  id: number
  x: Animated.Value
  y: Animated.Value
  rotate: Animated.Value
  color: string
  size: number
}

interface Props {
  show: boolean
  onComplete?: () => void
}

export function ConfettiCelebration({ show, onComplete }: Props) {
  const confettiPieces = useRef<ConfettiPiece[]>([])
  const animationsRef = useRef<Animated.CompositeAnimation[]>([])

  useEffect(() => {
    if (show) {
      startConfetti()
    }
  }, [show])

  function startConfetti() {
    // Create 30 confetti pieces
    const pieces: ConfettiPiece[] = []
    const animations: Animated.CompositeAnimation[] = []

    const confettiColors = [
      colors.primary,
      colors.secondary,
      colors.success,
      '#FFD700', // Gold
      '#FF69B4', // Pink
      '#00CED1', // Turquoise
    ]

    for (let i = 0; i < 30; i++) {
      const startX = Math.random() * width
      const endX = startX + (Math.random() - 0.5) * 200
      const endY = height + 100

      const piece: ConfettiPiece = {
        id: i,
        x: new Animated.Value(startX),
        y: new Animated.Value(-50),
        rotate: new Animated.Value(0),
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        size: Math.random() * 8 + 6,
      }

      pieces.push(piece)

      // Animate falling
      const fallDuration = Math.random() * 1000 + 2000
      const animation = Animated.parallel([
        Animated.timing(piece.y, {
          toValue: endY,
          duration: fallDuration,
          useNativeDriver: true,
        }),
        Animated.timing(piece.x, {
          toValue: endX,
          duration: fallDuration,
          useNativeDriver: true,
        }),
        Animated.timing(piece.rotate, {
          toValue: Math.random() * 10 + 5,
          duration: fallDuration,
          useNativeDriver: true,
        }),
      ])

      animations.push(animation)
      animation.start()
    }

    confettiPieces.current = pieces
    animationsRef.current = animations

    // Clean up after animation
    setTimeout(() => {
      confettiPieces.current = []
      animationsRef.current = []
      if (onComplete) {
        onComplete()
      }
    }, 3500)
  }

  if (!show || confettiPieces.current.length === 0) {
    return null
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.current.map((piece) => (
        <Animated.View
          key={piece.id}
          style={[
            styles.confetti,
            {
              left: 0,
              top: 0,
              width: piece.size,
              height: piece.size * 1.5,
              backgroundColor: piece.color,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                {
                  rotate: piece.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
})
