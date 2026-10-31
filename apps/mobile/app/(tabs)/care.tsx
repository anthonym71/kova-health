import { ScrollView, Text } from "react-native";

/** care - synthetic demo scaffold screen. Implement per docs/BUILD-PROMPT.md module specs. */
export default function Screen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: "#FAF6F0" }}>
      <Text style={{ fontSize: 24, fontWeight: "700", color: "#17222E" }}>Care</Text>
      <Text style={{ marginTop: 4, color: "#64707E" }}>Synthetic demo scaffold - module UI to be implemented natively (no WebView).</Text>
    </ScrollView>
  );
}
