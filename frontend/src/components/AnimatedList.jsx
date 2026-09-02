import React, { useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * AnimatedList — React Bits Animated List Component
 * Reference: https://reactbits.dev/components/animated-list
 *
 * Implements smooth top-to-bottom entrance animations with staggered timing,
 * individual item transitions, and stable re-render tracking.
 */
const AnimatedList = ({
  children,
  items,
  renderItem,
  keyExtractor = (item, index) => item?._id || item?.id || index,
  className = '',
  itemClassName = '',
  as: ContainerComponent = 'tbody',
  itemAs: ItemComponent = 'tr',
  stagger = 0.055,
  initialDelay = 0.02,
  duration = 0.4,
  enterOffset = -22,
  easing = [0.25, 0.46, 0.45, 0.94],
  emptyContent = null,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const animatedKeysRef = useRef(new Set());

  // Motion component selection
  const MotionContainer = useMemo(
    () => (typeof ContainerComponent === 'string' ? motion[ContainerComponent] || motion.tbody : motion(ContainerComponent)),
    [ContainerComponent]
  );

  const MotionItem = useMemo(
    () => (typeof ItemComponent === 'string' ? motion[ItemComponent] || motion.tr : motion(ItemComponent)),
    [ItemComponent]
  );

  // If using items array with renderItem
  if (items) {
    if (items.length === 0 && emptyContent) {
      return emptyContent;
    }

    return (
      <MotionContainer className={`animated-list ${className}`}>
        <AnimatePresence mode="popLayout" initial={true}>
          {items.map((item, index) => {
            const key = keyExtractor(item, index);
            const isFirstSeen = !animatedKeysRef.current.has(key);
            if (isFirstSeen) {
              animatedKeysRef.current.add(key);
            }

            // Stagger only applies on first appearance
            const delay = isFirstSeen && !shouldReduceMotion ? initialDelay + index * stagger : 0;

            return (
              <MotionItem
                key={key}
                layout={!shouldReduceMotion ? 'position' : false}
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: enterOffset }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: shouldReduceMotion
                    ? { duration: 0.1 }
                    : {
                        duration: duration,
                        ease: easing,
                        delay: delay,
                      },
                }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        y: enterOffset * 0.6,
                        transition: { duration: 0.22, ease: 'easeIn' },
                      }
                }
                className={`animated-list-item ${itemClassName}`}
              >
                {renderItem ? renderItem(item, index) : item}
              </MotionItem>
            );
          })}
        </AnimatePresence>
      </MotionContainer>
    );
  }

  // If using children directly
  const childrenArray = React.Children.toArray(children);

  if (childrenArray.length === 0 && emptyContent) {
    return emptyContent;
  }

  return (
    <MotionContainer className={`animated-list ${className}`}>
      <AnimatePresence mode="popLayout" initial={true}>
        {childrenArray.map((child, index) => {
          const key = child.key || index;
          const isFirstSeen = !animatedKeysRef.current.has(key);
          if (isFirstSeen) {
            animatedKeysRef.current.add(key);
          }

          const delay = isFirstSeen && !shouldReduceMotion ? initialDelay + index * stagger : 0;

          return (
            <MotionItem
              key={key}
              layout={!shouldReduceMotion ? 'position' : false}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: enterOffset }
              }
              animate={{
                opacity: 1,
                y: 0,
                transition: shouldReduceMotion
                  ? { duration: 0.1 }
                  : {
                      duration: duration,
                      ease: easing,
                      delay: delay,
                    },
              }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      y: enterOffset * 0.6,
                      transition: { duration: 0.22, ease: 'easeIn' },
                    }
              }
              className={`animated-list-item ${itemClassName}`}
            >
              {child}
            </MotionItem>
          );
        })}
      </AnimatePresence>
    </MotionContainer>
  );
};

export default AnimatedList;
