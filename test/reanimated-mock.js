/* Minimal Reanimated + Worklets stand-ins for Jest.
 * Animations resolve instantly to their target value; layout animations are no-ops.
 * Covers exactly the APIs the game uses. */
const React = require('react');
const { View } = require('react-native');

const target = (v) => (typeof v === 'object' && v !== null && '__target' in v ? v.__target : v);

function makeShared(initial) {
  const sv = { value: initial };
  sv.get = () => sv.value;
  sv.set = (v) => {
    sv.value = target(v);
  };
  return sv;
}

const anim = (toValue) => ({ __target: toValue });

// Layout animation builders: chainable no-ops.
const builder = () => {
  const b = new Proxy({}, { get: (_t, key) => (key === 'build' ? () => ({}) : () => b) });
  return b;
};

const AnimatedView = React.forwardRef((props, ref) => {
  const { entering, exiting, layout, style, ...rest } = props;
  const flat = Array.isArray(style) ? style : [style];
  return React.createElement(View, { ...rest, ref, style: flat });
});

const Easing = new Proxy(
  {},
  { get: () => (...args) => (typeof args[0] === 'function' ? args[0] : (t) => t) },
);

module.exports = {
  __esModule: true,
  default: { View: AnimatedView, createAnimatedComponent: (C) => C },
  View: AnimatedView,
  createAnimatedComponent: (C) => C,
  useSharedValue: (initial) => React.useState(() => makeShared(initial))[0],
  useAnimatedStyle: (fn) => {
    try {
      return fn();
    } catch {
      return {};
    }
  },
  useReducedMotion: () => false,
  withSpring: anim,
  withTiming: anim,
  withDelay: (_ms, a) => a,
  withSequence: (...steps) => steps[steps.length - 1],
  Easing,
  FadeIn: builder(),
  FadeOut: builder(),
  SlideInDown: builder(),
  SlideOutDown: builder(),
  // used by react-native-gesture-handler's Reanimated integration
  isSharedValue: (v) => !!v && typeof v === 'object' && 'value' in v && typeof v.set === 'function',
  useEvent: (handler) => handler,
  useHandler: () => ({ context: {}, doDependenciesDiffer: false, useWeb: true }),
  useComposedEventHandler: (handlers) => (e) => handlers.forEach((h) => h && h(e)),
  setGestureState: () => {},
  NativeEventsManager: undefined,
  // worklets
  scheduleOnRN: (fn, ...args) => fn(...args),
  runOnJS: (fn) => fn,
};
