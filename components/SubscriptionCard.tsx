import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import Theme from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Button from './Button';
import ThemedText from './ThemedText';

interface SubscriptionCardProps {
  onSubscribe: () => void;
  loading?: boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  onSubscribe,
  loading = false,
}) => {
  const { theme } = useThemeStore();
  
  const features = [
    'Unlimited barcode scanning',
    'Unlimited AI food recognition',
    'Personalized nutrition insights',
    'AI meal recommendations',
    'Export nutrition data',
  ];
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <ThemedText
            size="xxl"
            weight="bold"
            color="background"
            style={styles.title}
          >
            fitIQ Premium
          </ThemedText>
          <ThemedText
            size="xxxl"
            weight="bold"
            color="background"
            style={styles.price}
          >
            $5
            <ThemedText size="lg" color="background">
              /month
            </ThemedText>
          </ThemedText>
          
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.checkCircle}>
                  <Check size={14} color="#fff" />
                </View>
                <ThemedText color="background">{feature}</ThemedText>
              </View>
            ))}
          </View>
          
          <Button
            title="Subscribe Now"
            onPress={onSubscribe}
            variant="secondary"
            loading={loading}
            style={styles.button}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 24,
  },
  gradient: {
    borderRadius: 16,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  price: {
    marginBottom: 24,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  button: {
    width: '100%',
  },
});

export default SubscriptionCard;