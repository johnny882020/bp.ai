import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ocrEngine, BPOcrResult } from '@/lib/ocrEngine';

interface Props {
  onOpenAddForm: (data: BPOcrResult) => void;
}

export default function CameraCapture({ onOpenAddForm }: Props) {
  const [processing, setProcessing] = useState(false);
  const [progress,   setProgress]   = useState(0);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const process = async (uri: string) => {
    setProcessing(true);
    setProgress(0);

    // Simulate progress steps while ML Kit runs (ML Kit doesn't expose progress)
    const tick = setInterval(() => setProgress((p) => Math.min(p + 15, 85)), 300);
    try {
      const result = await ocrEngine.processImageUri(uri);
      clearInterval(tick);
      setProgress(100);

      if (result.systolic == null && result.diastolic == null) {
        Alert.alert('Not detected', 'Could not read BP values from the image. Try a clearer photo.');
      } else {
        onOpenAddForm(result);
      }
    } catch (e: any) {
      clearInterval(tick);
      Alert.alert('OCR Error', e?.message ?? 'Failed to process image.');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const pickFromCamera = async () => {
    const granted = await requestPermission();
    if (!granted) { Alert.alert('Permission required', 'Camera access is needed to scan readings.'); return; }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) await process(result.assets[0].uri);
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) await process(result.assets[0].uri);
  };

  if (processing) {
    return (
      <View style={styles.processingBox}>
        <ActivityIndicator color="#2563eb" />
        <Text style={styles.processingText}>Scanning… {progress}%</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.btn} onPress={pickFromCamera}>
        <Text style={styles.btnText}>📷  Scan</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={pickFromLibrary}>
        <Text style={[styles.btnText, styles.btnTextSecondary]}>Photo Library</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1,
    height: 40,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondary: { backgroundColor: '#f1f5f9' },
  btnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  btnTextSecondary: { color: '#0f172a' },
  processingBox: {
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
  },
  processingText: { fontSize: 14, color: '#1d4ed8', fontWeight: '500' },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#bfdbfe',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
});
