# Expo Speech TTS Implementation Guide

This guide documents how to implement Expo Speech for Arabic Text-to-Speech in the LearnArabic app. This replaces the problematic `react-native-sherpa-onnx-offline-tts` library with a simple, working solution.

## Why Expo Speech?

After extensive debugging, we discovered that `react-native-sherpa-onnx-offline-tts` has fundamental audio playback issues on iOS:
- Audio generates successfully but plays silently
- Volume metering always returns 0
- The library's April 2025 update removed `.defaultToSpeaker`, causing incorrect audio routing
- Extensive patches and workarounds failed to resolve the core issue

**Expo Speech works immediately** with iOS's native TTS engine, provides good Arabic voice quality, and requires no complex setup.

## Installation

### 1. Install Expo Speech

```bash
npx expo install expo-speech
```

This will add `expo-speech` to your `package.json`:

```json
{
  "dependencies": {
    "expo-speech": "~14.0.7"
  }
}
```

### 2. Rebuild iOS App

Since expo-speech is a native module, rebuild the app:

```bash
npx expo run:ios --device YOUR_DEVICE_ID
```

## Implementation

### 1. Create ExpoTTSService.js

Create a new TTS service using Expo Speech at `src/services/ExpoTTSService.js`:

```javascript
// src/services/ExpoTTSService.js
// Arabic Text-to-Speech service using Expo Speech (iOS native TTS)

import * as Speech from 'expo-speech';

class ExpoArabicTTSService {
  constructor() {
    this.speaking = false;
  }

  /**
   * Speak Arabic text aloud using iOS native TTS
   * @param {string} text - Arabic text to speak
   * @param {number} speed - Speech speed (0.5 = slow, 1.0 = normal, 1.5 = fast)
   */
  async speak(text, speed = 1.0) {
    console.log('🔊 Expo TTS.speak() called with text:', text.substring(0, 50), 'speed:', speed);

    if (!text || typeof text !== 'string') {
      console.warn('❌ Invalid text provided to TTS');
      return;
    }

    try {
      this.speaking = true;

      // Use iOS native TTS with Arabic language
      await Speech.speak(text, {
        language: 'ar-SA', // Arabic (Saudi Arabia) - best Arabic voice on iOS
        pitch: 1.0,
        rate: speed,
        onDone: () => {
          console.log('✅ Speech completed');
          this.speaking = false;
        },
        onError: (error) => {
          console.error('❌ Speech error:', error);
          this.speaking = false;
        }
      });

      console.log('🎤 Speech started successfully');
    } catch (error) {
      this.speaking = false;
      console.error('❌ TTS speak error:', error);
    }
  }

  /**
   * Stop currently playing speech
   */
  async stop() {
    if (!this.speaking) {
      return;
    }

    try {
      await Speech.stop();
      this.speaking = false;
      console.log('TTS stopped');
    } catch (error) {
      console.error('Failed to stop TTS:', error);
    }
  }

  /**
   * Check if TTS is currently speaking
   */
  isSpeaking() {
    return this.speaking;
  }

  /**
   * Expo Speech doesn't require initialization
   */
  async initialize() {
    console.log('✓ Expo Speech ready (no initialization needed)');
  }

  isInitialized() {
    return true;
  }
}

// Export singleton instance
export default new ExpoArabicTTSService();
```

### 2. Update TTSContext.js

Update the import in `src/context/TTSContext.js` to use the new service:

**Before:**
```javascript
import TTSService from '../services/TTSService';
```

**After:**
```javascript
import TTSService from '../services/ExpoTTSService';
```

That's it! Just change one line.

### 3. Configure Audio Session (Optional but Recommended)

To ensure TTS works even in silent mode, configure the audio session in `ios/LearnArabic/AppDelegate.swift`:

Add this import at the top:
```swift
import AVFoundation
```

Add this code in the `application(didFinishLaunchingWithOptions)` method before the delegate setup:

```swift
// Configure audio session for TTS playback (plays even in silent mode)
do {
  try AVAudioSession.sharedInstance().setCategory(
    .playback,
    mode: .spokenAudio,
    options: [.defaultToSpeaker, .allowBluetooth, .allowBluetoothA2DP]
  )
  try AVAudioSession.sharedInstance().setActive(true)
  print("✓ Audio session configured for TTS playback")
} catch {
  print("⚠️ Failed to configure audio session: \(error)")
}
```

## Features

### Arabic Language Support

Expo Speech uses iOS's built-in Arabic voices. The quality is good and continues to improve with each iOS update.

**Supported Arabic voices:**
- `ar-SA` - Saudi Arabian Arabic (recommended)
- `ar-AE` - UAE Arabic
- `ar` - Generic Arabic

### Speed Control

The `speak()` method accepts a speed parameter:
- `0.5` - Slow (good for learning)
- `1.0` - Normal speed (default)
- `1.5` - Fast
- Custom values between 0.1 and 2.0

### Error Handling

The service includes proper error handling with callbacks:
- `onDone` - Called when speech finishes
- `onError` - Called if speech fails

### Silent Mode Support

With the `AVAudioSession` configuration in AppDelegate.swift, TTS will work even when the device is in silent mode.

### Bluetooth Support

The audio session configuration includes `.allowBluetooth` and `.allowBluetoothA2DP`, so TTS works with:
- Bluetooth headphones
- Bluetooth speakers
- AirPods
- CarPlay

## Integration Points

### Where TTS is Used

The app uses TTS in these locations:

1. **BibleReaderScreen** - When users tap Arabic words
2. **FlashcardScreen** - For reviewing flashcards (via TTSContext)
3. **Any component using TTSContext** - Through the `useTTS()` hook

### TTSContext API

The `TTSContext` provides these methods and state:

```javascript
const {
  ttsEnabled,      // boolean - is TTS enabled?
  ttsSpeed,        // number - current speed (0.5 - 1.5)
  autoPlay,        // boolean - auto-play on card flip?
  speakText,       // function - speak(text, speed)
  stopSpeaking,    // function - stop current speech
  isSpeaking,      // boolean - currently speaking?
  setTtsEnabled,   // function - enable/disable TTS
  setTtsSpeed,     // function - set speed
  setAutoPlay,     // function - enable/disable auto-play
} = useTTS();
```

### Example Usage

```javascript
import { useTTS } from '../context/TTSContext';

function MyComponent() {
  const { speakText, ttsEnabled } = useTTS();

  const handleWordPress = (arabicText) => {
    if (ttsEnabled) {
      speakText(arabicText);
    }
  };

  return (
    <TouchableOpacity onPress={() => handleWordPress('مرحبا')}>
      <Text>مرحبا</Text>
    </TouchableOpacity>
  );
}
```

## Comparison: Expo Speech vs Sherpa-ONNX

| Feature | Expo Speech | Sherpa-ONNX |
|---------|-------------|-------------|
| **Setup Complexity** | ✅ Simple (one npm install) | ❌ Complex (model files, patches) |
| **Audio Playback** | ✅ Works immediately | ❌ Silent/broken on iOS |
| **Voice Quality** | ✅ Good (iOS native) | ✅ Excellent (Piper models) |
| **Offline Support** | ⚠️ After first download | ✅ Fully offline |
| **File Size** | ✅ Small (uses system voices) | ❌ Large (bundled models) |
| **Maintenance** | ✅ Maintained by Expo | ⚠️ Community wrapper |
| **Bluetooth Support** | ✅ Works | ❌ Requires fixes |
| **Silent Mode** | ✅ Works | ❌ Requires fixes |
| **Build Time** | ✅ Fast | ⚠️ Slower (large assets) |

## Troubleshooting

### No Audio Playing

1. **Check device volume** - Press volume up buttons
2. **Check silent mode** - Ensure silent switch is off (if audio session not configured)
3. **Check Bluetooth** - Disconnect any paired devices if needed
4. **Restart app** - Full app restart after installing expo-speech

### Voice Not Downloaded

On first use, iOS may need to download the Arabic voice:
1. Go to Settings → Accessibility → Spoken Content → Voices
2. Download Arabic voice if needed
3. After download, TTS works offline

### Wrong Language

If TTS speaks English instead of Arabic:
- Verify you're passing Arabic text (not English transliteration)
- Check the `language: 'ar-SA'` parameter in `speak()` call

## Performance

### Speed
- **Latency**: ~50-200ms to start speaking
- **No initialization required**: Ready immediately
- **No model loading**: Uses system voices

### Memory
- **Small footprint**: No model files loaded into memory
- **Efficient**: Leverages iOS's optimized TTS engine

### Battery
- **Low impact**: Uses hardware-accelerated audio processing

## Migration from Sherpa-ONNX

If migrating from sherpa-onnx to Expo Speech:

### 1. Remove Sherpa-ONNX (Optional)

```bash
npm uninstall react-native-sherpa-onnx-offline-tts
```

### 2. Remove Sherpa Assets

Delete these files/folders:
- `assets/tts/` - Piper model files
- `scripts/link-tts-assets.js` - Asset linking script
- `scripts/patch-sherpa-audio.js` - Audio patches
- `ios/ar_JO-kareem-medium.onnx` - Model file (if exists)

### 3. Clean Package Scripts

Remove from `package.json`:
```json
{
  "scripts": {
    "postinstall": "node scripts/link-tts-assets.js && node scripts/patch-sherpa-audio.js"
  }
}
```

Change to:
```json
{
  "scripts": {
    "postinstall": ""
  }
}
```

### 4. Clean Podfile

Remove from `ios/Podfile`:
```ruby
# Remove this post_install hook if it exists
post_install do |installer|
  # ...
  `cd .. && node scripts/patch-sherpa-audio.js`
end
```

### 5. Rebuild

```bash
rm -rf node_modules ios/Pods ios/build
npm install
cd ios && pod install && cd ..
npx expo run:ios
```

## Future Considerations

### Voice Quality Improvements

If you need better voice quality in the future:
1. Wait for sherpa-onnx fixes
2. Try alternative offline TTS libraries
3. Use cloud TTS services (Google, Azure, etc.) with caching

### Offline-First

Expo Speech requires internet only for initial voice download. After that:
- ✅ Fully offline
- ✅ No API calls
- ✅ No network dependency

### Custom Voices

iOS doesn't support custom voice models. If custom voices are needed:
- Use cloud TTS services
- Wait for sherpa-onnx fixes
- Implement audio playback separately from generation

## Conclusion

Expo Speech provides a **simple, reliable solution** for Arabic TTS that works immediately without complex setup or troubleshooting. While sherpa-onnx offers better voice quality in theory, its iOS audio playback issues make it impractical for production use.

**For most use cases, Expo Speech is the better choice** - it just works.
