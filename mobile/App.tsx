/**
 * Aramina — calm mental-health companion (Persian, RTL).
 * Root wires providers, a light status bar over the lilac background, and the
 * hand-rolled RootNavigator (splash → onboarding → auth → tabbed app).
 *
 * Vazir is applied explicitly on every text style (via theme `rtlText` or a
 * direct `fontFamily`); the font is bundled natively (react-native.config.js /
 * ios Info.plist). The render patch below is only a best-effort fallback — it
 * is a no-op on RN 0.86 where Text is a function component (no `.render`), so
 * styles must not rely on it.
 */
import React from 'react';
import { StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors, FONT_FAMILY } from './src/theme';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationProvider } from './src/navigation/NavigationContext';
import { RootNavigator } from './src/navigation/RootNavigator';

// Best-effort fallback: wrap Text/TextInput's render so Vazir is merged UNDER
// the caller's style. NOTE: on RN 0.86 both are function components with no
// `.render`, so this silently no-ops — every text style therefore sets the font
// explicitly (theme `rtlText` / direct `fontFamily`). Kept for legacy/forwardRef
// builds; harmless where it can't apply.
const patchFont = (Comp: any) => {
  const target =
    typeof Comp?.render === 'function'
      ? Comp
      : typeof Comp?.type?.render === 'function'
      ? Comp.type
      : null;
  if (!target || target.__vazirPatched) return;
  const orig = target.render;
  target.render = function patched(...args: any[]) {
    const el = orig.apply(this, args);
    if (!el) return el;
    return React.cloneElement(el, {
      style: [{ fontFamily: FONT_FAMILY }, el.props?.style],
    });
  };
  target.__vazirPatched = true;
};
patchFont(Text);
patchFont(TextInput);

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.root}>
        <AuthProvider>
          <NavigationProvider>
            <RootNavigator />
          </NavigationProvider>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});

export default App;
