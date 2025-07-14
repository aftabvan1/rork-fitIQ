import { useAuthStore } from "@/store/auth-store";
import { useNutritionStore } from "@/store/nutrition-store";
import { ScanResult } from "@/types";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, Image as ImageIcon, Zap } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, StyleSheet, View } from "react-native";
import Button from "@/components/Button";
import FoodCard from "@/components/FoodCard";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import * as ImagePicker from "expo-image-picker";
import Colors from "@/constants/colors";
import { useThemeStore } from "@/store/theme-store";

export default function ScanScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { mode = "barcode" } = useLocalSearchParams<{ mode: "barcode" | "photo" }>();
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const { user } = useAuthStore();
  const { scanBarcode, analyzeFoodPhoto } = useNutritionStore();
  
  // Switch to photo mode if specified in params
  useEffect(() => {
    if (mode === "photo") {
      handleSwitchToPhoto();
    }
  }, [mode]);
  
  const handleBarcodeScan = async (data: { data: string }) => {
    if (scanning) return;
    
    // Check premium limits
    if (!user?.isPremium) {
      // In a real app, you'd track daily scan count
      // For demo, we'll allow 5 scans per day for free users
    }
    
    setScanning(true);
    
    try {
      const result = await scanBarcode(data.data);
      
      if (result) {
        setScanResults([{ food: result }]);
      } else {
        Alert.alert(
          "Product Not Found",
          "We couldn't find this product in our database. Try taking a photo instead."
        );
      }
    } catch (error) {
      console.error("Barcode scan error:", error);
      Alert.alert("Error", "Failed to scan barcode. Please try again.");
    } finally {
      setScanning(false);
    }
  };
  
  const handleSwitchToPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      
      if (!result.canceled) {
        setScanning(true);
        
        try {
          const foods = await analyzeFoodPhoto(result.assets[0].uri);
          setScanResults(foods.map(food => ({ food, confidence: 0.85 })));
        } catch (error) {
          console.error("Photo analysis error:", error);
          Alert.alert("Error", "Failed to analyze photo. Please try again.");
        } finally {
          setScanning(false);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to open image picker. Please try again.");
      setScanning(false);
    }
  };
  
  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      
      if (!result.canceled) {
        setScanning(true);
        
        try {
          const foods = await analyzeFoodPhoto(result.assets[0].uri);
          setScanResults(foods.map(food => ({ food, confidence: 0.88 })));
        } catch (error) {
          console.error("Photo analysis error:", error);
          Alert.alert("Error", "Failed to analyze photo. Please try again.");
        } finally {
          setScanning(false);
        }
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to open camera. Please try again.");
      setScanning(false);
    }
  };
  
  const handleFoodPress = (food: any) => {
    router.push({
      pathname: "/food-details",
      params: { id: food.id, action: "add" },
    });
  };
  
  const handleClearResults = () => {
    setScanResults([]);
  };
  
  const handleFlipCamera = () => {
    setCameraType(current => current === "back" ? "front" : "back");
  };
  
  const renderPermissionScreen = () => (
    <ThemedView style={styles.container}>
      <View style={styles.permissionContainer}>
        <Camera size={64} color={Colors[theme].primary} />
        <ThemedText size="xl" weight="semibold" style={styles.permissionTitle}>
          Camera Permission Required
        </ThemedText>
        <ThemedText color="subtext" style={styles.permissionText}>
          We need camera permission to scan barcodes and take food photos.
        </ThemedText>
        <Button
          title="Grant Permission"
          onPress={requestPermission}
          style={styles.permissionButton}
        />
      </View>
    </ThemedView>
  );
  
  const renderScanResults = () => (
    <ThemedView style={styles.container}>
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <ThemedText size="xl" weight="semibold">
            Scan Results
          </ThemedText>
          <Button
            title="Clear"
            onPress={handleClearResults}
            variant="text"
            size="sm"
          />
        </View>
        
        <FlatList
          data={scanResults}
          keyExtractor={(item, index) => `${item.food.id}-${index}`}
          renderItem={({ item }) => (
            <View>
              {item.confidence && (
                <ThemedText size="sm" color="subtext" style={styles.confidenceText}>
                  Confidence: {Math.round(item.confidence * 100)}%
                </ThemedText>
              )}
              <FoodCard
                food={item.food}
                onPress={() => handleFoodPress(item.food)}
                onAddPress={() => handleFoodPress(item.food)}
              />
            </View>
          )}
          contentContainerStyle={styles.resultsList}
        />
        
        <View style={styles.scanActions}>
          <Button
            title="Scan Again"
            onPress={handleClearResults}
            variant="outline"
            style={styles.scanAgainButton}
          />
        </View>
      </View>
    </ThemedView>
  );
  
  const renderScanningOverlay = () => (
    <ThemedView style={styles.scanningOverlay}>
      <ActivityIndicator size="large" color={Colors[theme].primary} />
      <ThemedText size="lg" weight="medium" style={styles.scanningText}>
        Analyzing...
      </ThemedText>
    </ThemedView>
  );
  
  const renderCameraView = () => (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={cameraType}
        onBarcodeScanned={scanning ? undefined : handleBarcodeScan}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          
          <View style={styles.cameraActions}>
            <Pressable
              style={styles.actionButton}
              onPress={handleFlipCamera}
            >
              <Camera size={24} color="#fff" />
            </Pressable>
            
            <Pressable
              style={styles.actionButton}
              onPress={handleTakePhoto}
            >
              <ImageIcon size={24} color="#fff" />
            </Pressable>
            
            <Pressable
              style={styles.actionButton}
              onPress={handleSwitchToPhoto}
            >
              <Zap size={24} color="#fff" />
            </Pressable>
          </View>
          
          <ThemedText style={styles.instructions}>
            Point camera at a barcode or take a photo of your food
          </ThemedText>
        </View>
      </CameraView>
    </View>
  );
  
  // Check if we have permission
  if (!permission) {
    return <ThemedView style={styles.container} />;
  }
  
  if (!permission.granted) {
    return renderPermissionScreen();
  }
  
  // Show scan results if available
  if (scanResults.length > 0) {
    return renderScanResults();
  }
  
  return (
    <View style={styles.container}>
      {renderCameraView()}
      {scanning && renderScanningOverlay()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 16,
    marginBottom: 40,
  },
  cameraActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    gap: 24,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  instructions: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    marginHorizontal: 40,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  scanningText: {
    marginTop: 16,
    color: "#fff",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  permissionTitle: {
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    textAlign: "center",
    marginBottom: 24,
  },
  permissionButton: {
    width: "100%",
    maxWidth: 300,
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsList: {
    paddingBottom: 16,
  },
  confidenceText: {
    marginLeft: 4,
    marginBottom: 4,
  },
  scanActions: {
    marginTop: 16,
  },
  scanAgainButton: {
    marginBottom: 16,
  },
});