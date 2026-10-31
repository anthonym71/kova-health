import { ScrollView, Text, View } from "react-native";

/** Today - synthetic demo screen. HealthKit/Health Connect reads require a
 * development build on a physical device; simulator uses the synthetic adapter. */
export default function Today() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: "#FAF6F0" }}>
      <Text style={{ fontSize: 24, fontWeight: "700", color: "#17222E" }}>Good afternoon, Alex</Text>
      <Text style={{ marginTop: 4, color: "#64707E" }}>Synthetic demo - no real health data</Text>
      <View style={{ marginTop: 16, backgroundColor: "#FFF", borderRadius: 16, padding: 16 }}>
        <Text style={{ fontWeight: "600", color: "#0E7C6B" }}>Care team</Text>
        <Text style={{ marginTop: 4, color: "#33404F" }}>Dr. Priya Nair, MD (synthetic)</Text>
        <Text style={{ marginTop: 4, fontSize: 12, color: "#97A1AD" }}>
          Next visit: Tue Nov 3, 2:30 PM ET - demo adapter, no real clinician
        </Text>
      </View>
      <View style={{ marginTop: 12, backgroundColor: "#FFF", borderRadius: 16, padding: 16 }}>
        <Text style={{ fontWeight: "600", color: "#17222E" }}>Daily actions</Text>
        <Text style={{ marginTop: 4, color: "#33404F" }}>Steps 7,234 / 8,000 - Water 1,500 / 2,000 ml</Text>
      </View>
    </ScrollView>
  );
}
