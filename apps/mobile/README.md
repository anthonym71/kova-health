# Kova Health mobile (Expo)

Native iOS/Android patient app. Scaffold status: navigation shell and Today demo
screen only; module screens follow docs/BUILD-PROMPT.md.

- Development builds required (expo-dev-client); Expo Go cannot run health bridges.
- HealthKit / Health Connect adapters are NOT implemented yet - the web app and
  this scaffold use synthetic fixtures. A working chart does not establish that
  native permissions or sync work.
- No service-role, EHR, payment-secret or symptom-vendor keys in EXPO_PUBLIC vars.
- Full simulator/device/beta procedure: ../../docs/NATIVE-APP-GUIDE.md
