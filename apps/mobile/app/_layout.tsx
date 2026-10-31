import { Tabs } from "expo-router";

/**
 * Kova patient app (synthetic demo scaffold).
 * Native components only - no WebView wrapper. All six patient modules belong here;
 * the provider workspace stays on web. See docs/NATIVE-APP-GUIDE.md.
 */
export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="(tabs)/index" options={{ title: "Today" }} />
      <Tabs.Screen name="(tabs)/track" options={{ title: "Track" }} />
      <Tabs.Screen name="(tabs)/medications" options={{ title: "Meds" }} />
      <Tabs.Screen name="(tabs)/care" options={{ title: "Care Team" }} />
      <Tabs.Screen name="(tabs)/more" options={{ title: "More" }} />
    </Tabs>
  );
}
