# Kova Health native app setup and deployment

This guide adds iOS and Android patient apps to the Kova Health plan. Build the synthetic web demo first, then native simulator builds, device integrations and signed beta releases. Keep the provider workspace on the web initially. All six patient modules belong in the native app.

These are future implementation instructions, not commands already executed. The workspace currently contains planning documents and references, not a runnable application. No simulator, native binary or store listing has been created. Documentation checked October 31, 2026; confirm toolchain and store requirements again when releasing.

## 1 Choose the architecture

Use React Native with Expo Router, TypeScript and Expo development builds. Use platform health bridges, implemented as maintained compatible libraries or scoped Swift/Kotlin Expo modules. Expo supports custom native code in development builds; Expo Go alone is insufficient for this integration. [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/).

Proposed repository structure:

```text
apps/
  web/                  Next.js patient and provider web app
  mobile/               React Native iOS and Android patient app
packages/
  domain/               Types, validation and health calculations
  api-client/           Shared request/response contracts
  design-tokens/        Color, typography and spacing values
supabase/
  migrations/           Schema and access policies
docs/
```

Share business logic and backend services, while using native navigation and components on phones. Keep all vendor secrets and privileged processing on the backend. Vercel hosts web/API services, Supabase stores authorized data, and native app stores distribute the installed mobile binaries. Mobile API requests need verified bearer tokens; do not assume web cookie authentication transfers to mobile.

## 2 Prepare accounts and the Mac

For simulator work, install the development tools before paying for distribution services. For beta distribution, prepare owner-controlled Expo, Apple Developer/App Store Connect and Google Play Console accounts, along with GitHub, Supabase and Vercel access. Choose permanent production identifiers only after confirming the organization/domain; use separate demo identifiers.

On this Mac, xcode-select currently points to /Library/Developer/CommandLineTools. Xcode.app, Android Studio.app and the Android SDK were not found in their standard locations during the planning check. They could exist elsewhere; confirm before reinstalling.

1. Install full Xcode from Apple's distribution channel. Open it once, finish first-launch setup and accept the license.
2. In Xcode Settings, install an iOS simulator runtime under Components/Platforms, depending on the Xcode version. Select Xcode under Locations → Command Line Tools.
3. Install Android Studio. In SDK Manager, install an SDK platform compatible with the selected Expo release, platform tools, emulator and required build tools. Use its compatible bundled JDK. The compile/target SDK is separate from the emulator OS version.
4. In Android Studio Device Manager, create a phone virtual device with a compatible Google Play image, preferably Android 14 or newer for the first Health Connect test. Choose an architecture matching the Mac, such as ARM64 on Apple Silicon. Launch the emulator.
5. Use the Node version supported by the selected Expo SDK. Pin versions and the package-manager lockfile for reproducible builds.

After installing Xcode, use these checks; the switch command requires local administrator permission and assumes the standard install path:

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
xcodebuild -version
xcrun simctl list devices available
```

For Android, use Android Studio's displayed SDK location and confirm adb is available from its platform-tools directory. Do not infer a working emulator from adb installation alone.

## 3 Scaffold and connect the mobile app

During implementation, create the mobile package only if it does not already exist:

```bash
cd /Users/deepthipotluri/Kova-Health
npx create-expo-app@latest apps/mobile
cd apps/mobile
npx expo install expo-dev-client expo-secure-store
npx expo-doctor
```

Integrate this starter into the chosen repository workspace/package manager and reconcile lockfiles before committing. Add Expo-compatible health modules only after verifying their platform coverage. Clinical records support is a separate requirement from ordinary HealthKit samples. Keep native configuration reproducible with app config and config plugins; do not run destructive native regeneration over uncommitted custom native changes.

Configure app name/icons, iOS bundle ID, Android package ID, URL scheme, supported OS versions and build numbers. Configure HealthKit capabilities and purpose strings, the Android permissions actually used, camera/photo/notification prompts and validated return links. Start with read-only health access and request each category only when the user chooses to connect it.

Use a stable HTTPS synthetic-data backend for simulator/device demos. Mobile public environment values can include an API base URL and Supabase publishable key. They are visible inside the app; never put service-role, EHR, payment-secret or symptom-vendor keys in EXPO_PUBLIC variables. Register exact native auth redirects and verify external OAuth returns. Store session material in secure native storage, not plain preferences.

SecureStore has platform-specific backup/uninstall behavior, including possible iOS keychain persistence. Implement explicit logout/revocation and account deletion; uninstall is not a deletion mechanism. [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/).

## 4 Run the iOS Simulator

After the mobile package and native configuration exist:

```bash
cd /Users/deepthipotluri/Kova-Health/apps/mobile
open -a Simulator
npx expo run:ios
```

Select a simulator if prompted. The initial command compiles and installs the development app and starts Metro, which serves the JavaScript bundle. If no device is found, create/boot one through Xcode's Devices and Simulators window and check that its runtime is installed.

For later JavaScript/TypeScript-only changes, start the development server without rebuilding the native binary:

```bash
npx expo start --dev-client
```

Press i to open the iOS target. Native dependency, entitlement or permission-config changes require another native build. Use the development client's developer menu and React Native debugging tools to inspect UI and network errors; keep health payloads out of logs. [Expo local builds](https://docs.expo.dev/guides/local-app-development/).

Test sign-in, the six module screens, permission explanations, demo records, provider messaging, subscription states and the 15-day expiry boundary using synthetic fixtures. Use a test-clock abstraction for expiry tests rather than changing the device clock and breaking authentication.

## 5 Run the Android Emulator

Launch the configured virtual device in Android Studio Device Manager, then:

```bash
cd /Users/deepthipotluri/Kova-Health/apps/mobile
npx expo run:android
```

The first build installs the development client. For ordinary code edits, use npx expo start --dev-client and press a. Rebuild after native module or manifest changes. The first Gradle build may need SDK downloads and can take longer than subsequent builds.

If the app cannot reach a local backend, remember that localhost on a phone/emulator normally refers to that device. The standard Android Emulator can reach the Mac host through 10.0.2.2; physical devices need an accessible LAN or HTTPS endpoint. Prefer the hosted synthetic demo API for shared testing and do not enable insecure cleartext transport in production just to fix a development URL.

## 6 Test health access and retention

Follow [Wearable connections and data synchronization](WEARABLE-CONNECTIONS.md) for complete patient setup instructions, the vendor/platform capability matrix, source-conflict rules and backend contracts. The native app reads data the companion app has already exported; it does not pair directly with every watch or ring. Test vendor-to-health-platform sharing separately from Kova's read/upload permission.

Start with Apple Watch through Apple Health and a verified Android companion app through Health Connect. Certify additional Garmin/Oura/Google Health routes by actual category availability. Cloud-only vendor routes need their own OAuth tests and do not prove the native SDK path. Test one wearable connected through both routes to ensure the dashboard counts its measurements once. A website can display uploaded native records, but cannot force a local phone-health read while the phone is unavailable.

Use three separate test modes: deterministic synthetic adapter, platform test/sample data, then physical-device integration. Mark each mode in the UI and test report. A working chart does not establish that native permissions or sync work.

| Feature | Simulator or emulator work | Required device validation |
| --- | --- | --- |
| Patient UI and shared API | All six modules, empty/error states and account separation | Layout, gestures, accessibility and networking |
| Apple HealthKit | Supported sample/manual data and permission flow | Real sample reads, revocation, background behavior and locked-device cases |
| Apple clinical records | Apple's supplied simulator sample accounts where available | Supported institution flow with authorized test data; entitlement/bridge support |
| Android Health Connect | Compatible emulator and Toolbox test data | Actual source records, per-type permissions and background limits |
| Camera and barcode | Fixtures and permission-denied fallback | Camera focus, scan reliability and upload cleanup |
| Reminders and remote notifications | Scheduling logic and supported simulated delivery | Permissions, lock screen, focus/battery modes, timezone changes and delivery |
| Video and payments | Handoff UI and local purchase simulations | Camera/microphone, reconnect, store test purchases and restoration |

Apple supplies sample clinical accounts in supported simulators; applications cannot simply manufacture HKClinicalRecord samples. The simulator Health app's available UI depends on its runtime. Android's Health Connect Toolbox can help seed and inspect test records. [Apple clinical samples](https://developer.apple.com/documentation/healthkit/accessing-sample-data-in-the-simulator), [Health Connect Toolbox](https://developer.android.com/health-and-fitness/health-connect/test/health-connect-toolbox).

Implement an early proof: request one read permission, retrieve a record, upload it idempotently, show its source/time, revoke permission and verify the fallback. Then expand to steps, activity, sleep and heart rate. On iOS, an empty HealthKit read is not reliable evidence of denied read access. For background/history features, check runtime support and permission rather than assuming availability.

Kova's health data expires 15 days after first storage; only approved aggregate Insights may persist long term. Apply this on mobile as well as the server. Prefer no persistent local health database in the MVP. Clean temporary photos/files, clear sensitive views when backgrounded/logged out, exclude app-owned sensitive files from backups and avoid medical detail in notifications. OS suspension means cleanup cannot depend on an app timer. Test cleanup on launch/resume and prevent expired reads independently on the backend.

Do not delete the user's Apple Health or Health Connect source records. Keep minimal non-content sync/deduplication state server-side so reinstall or resync cannot restore expired Kova records. Do not schedule reminders beyond a medication schedule's expiry. Device-loss, backup and external-source behavior must be described accurately to users.

## 7 Set up repeatable cloud builds

Expo Application Services, or EAS, can build signed native binaries. Local simulators still need their platform tools. Simulator iOS builds are separate from physical-device builds and do not need a paid Apple Developer membership. [Expo simulator builds](https://docs.expo.dev/build-reference/simulators/).

From apps/mobile, sign in and link the correct owner/project:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

Illustrative eas.json profiles, to adapt and validate with the chosen SDK:

```json
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "development-simulator": {
      "developmentClient": true,
      "distribution": "internal",
      "environment": "development",
      "env": { "APP_VARIANT": "demo" },
      "ios": { "simulator": true },
      "android": { "buildType": "apk" }
    },
    "development-device": {
      "developmentClient": true,
      "distribution": "internal",
      "environment": "development",
      "env": { "APP_VARIANT": "demo" },
      "ios": { "simulator": false },
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "environment": "preview",
      "env": { "APP_VARIANT": "demo" },
      "android": { "buildType": "apk" }
    },
    "beta-store": {
      "distribution": "store",
      "environment": "preview",
      "env": { "APP_VARIANT": "demo" },
      "autoIncrement": true
    },
    "production": {
      "distribution": "store",
      "environment": "production",
      "env": { "APP_VARIANT": "production" },
      "autoIncrement": true
    }
  },
  "submit": {
    "beta-store": { "android": { "track": "internal" } },
    "production": { "android": { "track": "internal" } }
  }
}
```

APP_VARIANT has no effect by itself: implement it in app.config.ts to select the corresponding app identity, linking scheme and app name. Separately configure each EAS environment with its approved API URL. A production-native binary must not accidentally point at synthetic data or vice versa. The beta-store profile is for synthetic TestFlight/Play testing; it uses a store-signed binary with the demo identity. Preview is a standalone internal build without Metro, while a development client needs Metro. See [EAS profile configuration](https://docs.expo.dev/build/eas-json/).

Build and select the exact simulator artifact for installation:

```bash
npx eas-cli@latest build --platform ios --profile development-simulator
npx eas-cli@latest build:run --platform ios
npx expo start --dev-client
```

For Android, use an APK build for direct emulator/device installation:

```bash
npx eas-cli@latest build --platform android --profile development-simulator
npx eas-cli@latest build:run --platform android
```

Select the correct build rather than assuming the latest belongs to the intended environment. An Android store AAB is not the directly installable APK used here; an iOS simulator app cannot be installed on an iPhone.

## 8 Test on physical phones

For local iPhone development, connect and trust the phone, enable Developer Mode when required, configure an appropriate signing team and run npx expo run:ios --device. Local signing capabilities depend on the account and entitlements. EAS device distribution and TestFlight require the appropriate paid Apple program setup; do not confuse simulator success with signing readiness.

For Android, enable Developer Options and USB debugging, connect the phone, accept its computer authorization and run npx expo run:android --device. Confirm the intended device before installation. Use development-device cloud builds when distributing signed development clients; iOS internal/ad-hoc builds require registered devices and provisioning. A preview APK can be installed by authorized Android testers without public store release.

Validate real permissions, reminders, revoked consent, camera/video, reconnect, mobile purchase recovery and 15-day expiry. Use synthetic/manual test readings on test devices until the real-data environment is approved. Recheck access when the app resumes; phone OS background schedules are not guarantees of continuous sync.

## 9 Release an iOS beta through TestFlight

1. Enroll the correct publisher in Apple Developer and create App Store Connect access with appropriate roles. Register the bundle ID and required capabilities. Create the matching app record.
2. Configure signing through EAS or your existing signing process. Confirm the beta variant's API environment and bundle ID.
3. Build a store-signed demo binary with the beta-store profile:

```bash
npx eas-cli@latest build --platform ios --profile beta-store
npx eas-cli@latest submit --platform ios --profile beta-store
```

4. Select the exact completed build during submission and the matching App Store Connect app. Complete processing/export-compliance information in App Store Connect.
5. Add internal testers first. For external testers, create the test group and complete any Beta App Review requirements. Supply a synthetic review account, clear demo-mode instructions and a working backend.
6. Install through TestFlight and run the device acceptance flows. Public App Store release is a separate review/release action, not the result of uploading a beta.

For the live app, build with the production variant, use its app record, complete store metadata/privacy/subscription information and submit for App Review when ready. [EAS iOS submission](https://docs.expo.dev/submit/ios/), [Apple TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/).

## 10 Release an Android beta through Google Play

1. Create and verify the publisher's Play Console account and the matching application/package record. Configure Play App Signing and safeguard the upload credentials.
2. Build a demo store bundle:

```bash
npx eas-cli@latest build --platform android --profile beta-store
```

3. Complete app setup and upload the initial AAB through Play Console when required by the first-release setup. Choose Internal testing and add the tester group. Confirm the opt-in/install link actually works.
4. Configure a scoped Google service account for automated subsequent uploads. Store its credential securely, outside Git.
5. Submit a selected build to the internal track when automation is ready:

```bash
npx eas-cli@latest submit --platform android --profile beta-store
```

6. Run device acceptance tests, then use closed testing and apply for production access as required for the account. For personal accounts created after November 13, 2023, Google's current rule requires at least 12 continuously opted-in testers for 14 days before applying. Check the actual account's requirements at release.
7. Complete health-app declaration, permission justification, Data safety, content rating, app access instructions, privacy/support links and account-deletion requirements. Release the production variant through testing and review before a staged public rollout.

[EAS Android submission](https://docs.expo.dev/submit/android/), [Google testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465), [Health-app declaration](https://support.google.com/googleplay/android-developer/answer/14738291?hl=en).

## 11 Configure the paid agent for native stores

Keep Stripe for web purchases. For the native Guidance Plus digital add-on, plan Apple/Google store billing where applicable, with current storefront exceptions assessed before release. Live person-to-person consultations are a separate payment category from an automated digital agent. Do not assume a telehealth exemption covers the agent subscription. [Apple review rules](https://developer.apple.com/app-store/review/guidelines/), [Google payments policy](https://support.google.com/googleplay/android-developer/answer/10281818).

Create platform product identifiers, verify transactions server-side, link them to the signed-in Kova account, implement restore/manage subscription, handle renewals/refunds/revocations and test duplicate/out-of-order notifications. Keep a unified entitlement record with its billing source. Avoid double-charging someone who already has access through another channel. Use platform test purchases and keep emergency help accessible when entitlements fail.

## 12 Operate releases and diagnose common problems

| Symptom | First check |
| --- | --- |
| iOS build says Xcode is missing | Full Xcode install and xcode-select path; Command Line Tools alone are insufficient |
| No simulator available | Installed runtime and booted device |
| Native module missing | Rebuild development client after adding the module; restarting Metro alone is insufficient |
| Development app cannot load JavaScript | Metro running, reachable host/network and correct project |
| Android build cannot find SDK/JDK | Android Studio SDK path, tools and compatible JDK |
| Phone cannot reach backend | Stable HTTPS URL or correct LAN/emulator host address, not phone localhost |
| Sign-in never returns | App variant's registered redirect, URL scheme/universal link and callback validation |
| No health data appears | Correct platform/data source, supported type, test samples and permission state; do not infer diagnosis or zero values |
| Store upload fails | Correct package/bundle ID, signing, incremented version/build number and publisher permissions |
| Expired data returns after reinstall | Server-side deduplication, source cursors, cache and restore handling |

Keep APIs compatible with installed mobile versions, release database migrations before dependent clients, and test release-mode binaries as well as development clients. Use staged rollouts and a server-side feature disable path. Native dependency/permission changes require new binaries; any later over-the-air JavaScript updates need compatible runtimes, environment separation and applicable review-policy checks. Do not route around store review to enable unreviewed clinical behavior.

MCP is optional. CLI/account access is sufficient for these steps. Ask for scoped Expo, Apple, Google, Supabase, Vercel and GitHub access only when that stage begins; no account secrets should be pasted into chat. Record the commit, environment, build ID, device checks, beta track and review status for each release.
