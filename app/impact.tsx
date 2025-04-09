import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, TouchableOpacity, Alert, Share } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ImpactCard from '@/components/ui/ImpactCard';
import MilestoneCard from '@/components/ui/MilestoneCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserImpactMetrics, ImpactStreak, ImpactMilestone } from '@/types/impact-types';
import { getUserImpactMetrics, getImpactStreak, clearImpactData } from '@/util/impactStorage';
import { getImpactMilestones } from '@/util/impactCalculator';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function ImpactScreen() {
  const { t } = useLanguage();
  const themeStyles = useThemeStyles();
  const [metrics, setMetrics] = useState<UserImpactMetrics | null>(null);
  const [streak, setStreak] = useState<ImpactStreak | null>(null);
  const [milestones, setMilestones] = useState<ImpactMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadImpactData();
  }, []);
  
  const loadImpactData = async () => {
    setLoading(true);
    try {
      const userMetrics = await getUserImpactMetrics();
      const userStreak = await getImpactStreak();
      const userMilestones = getImpactMilestones(userMetrics);
      
      setMetrics(userMetrics);
      setStreak(userStreak);
      setMilestones(userMilestones);
    } catch (error) {
      console.error('Failed to load impact data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleShare = async () => {
    if (!metrics) return;
    
    try {
      await Share.share({
        message: t('impact.share.message', {
          journeys: metrics.totalJourneys,
          distance: metrics.totalDistanceKm.toFixed(1),
          co2: metrics.totalCO2Saved.toFixed(1),
          trees: metrics.treesEquivalent.toFixed(1)
        }),
        title: t('impact.share.title'),
      });
    } catch (error) {
      console.error('Error sharing impact data:', error);
    }
  };
  
  const handleReset = () => {
    Alert.alert(
      t('impact.reset.title'),
      t('impact.reset.confirmation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.confirm'), 
          style: 'destructive',
          onPress: async () => {
            await clearImpactData();
            loadImpactData();
          }
        }
      ]
    );
  };
  
  const achievedMilestones = milestones.filter(m => m.isAchieved);
  const pendingMilestones = milestones.filter(m => !m.isAchieved);
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: t('impact.title'),
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={{ marginRight: 16 }}>
              <IconSymbol name="square.and.arrow.up" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={{ marginTop: 16 }}>
            {t('impact.loading')}
          </ThemedText>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Impact summary section */}
          <ThemedView style={styles.summarySection}>
            <View style={styles.headerContainer}>
              <ThemedText style={styles.sectionTitle}>
                {t('impact.summary.title')}
              </ThemedText>
              
              {streak && streak.currentStreak > 0 && (
                <View style={styles.streakBadge}>
                  <IconSymbol name="flame.fill" size={16} color="#FF9500" />
                  <ThemedText style={styles.streakText}>
                    {streak.currentStreak} {t('impact.summary.dayStreak')}
                  </ThemedText>
                </View>
              )}
            </View>
            
            {metrics && (
              <View style={styles.metricsGrid}>
                <ImpactCard
                  icon="bus.fill"
                  value={metrics.totalJourneys}
                  label={t('impact.metrics.journeys')}
                  color="#4a90e2"
                />
                
                <ImpactCard
                  icon="map.fill"
                  value={metrics.totalDistanceKm.toFixed(1)}
                  label={t('impact.metrics.distance')}
                  suffix="km"
                  color="#9b59b6"
                />
                
                <ImpactCard
                  icon="leaf.fill"
                  value={metrics.totalCO2Saved.toFixed(1)}
                  label={t('impact.metrics.co2Saved')}
                  suffix="kg"
                  color="#2ecc71"
                />
                
                <ImpactCard
                  icon="drop.fill"
                  value={metrics.gasEquivalent.toFixed(1)}
                  label={t('impact.metrics.fuelSaved')}
                  suffix="L"
                  color="#e67e22"
                />
                
                <ImpactCard
                  icon="flame.fill"
                  value={Math.round(metrics.totalCaloriesBurned)}
                  label={t('impact.metrics.caloriesBurned')}
                  color="#e74c3c"
                />
                
                <ImpactCard
                  icon="figure.walk"
                  value={Math.round(metrics.totalStepsCount)}
                  label={t('impact.metrics.steps')}
                  color="#3498db"
                />
              </View>
            )}
            
            {metrics && metrics.totalCO2Saved > 0 && (
              <ThemedView style={styles.impactBox}>
                <ThemedText style={styles.impactTitle}>
                  {t('impact.equivalents.title')}
                </ThemedText>
                <ThemedText style={styles.impactText}>
                  {t('impact.equivalents.trees', {
                    count: metrics.treesEquivalent.toFixed(1)
                  })}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          
          {/* Milestones section */}
          {achievedMilestones.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                {t('impact.milestones.achieved')} ({achievedMilestones.length})
              </ThemedText>
              
              {achievedMilestones.map(milestone => (
                <MilestoneCard 
                  key={milestone.id} 
                  milestone={milestone} 
                />
              ))}
            </ThemedView>
          )}
          
          {pendingMilestones.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                {t('impact.milestones.next')}
              </ThemedText>
              
              {pendingMilestones.slice(0, 3).map(milestone => (
                <MilestoneCard 
                  key={milestone.id} 
                  milestone={milestone} 
                />
              ))}
            </ThemedView>
          )}
          
          {/* Debug reset button (in development only) */}
          <TouchableOpacity
            style={[
              themeStyles.secondaryButton,
              styles.resetButton
            ]}
            onPress={handleReset}
          >
            <IconSymbol name="arrow.counterclockwise" size={16} color="#999" />
            <ThemedText style={styles.resetButtonText}>
              {t('impact.reset.button')}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summarySection: {
    marginBottom: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
    marginLeft: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  impactBox: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#27ae60',
  },
  impactText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#27ae60',
  },
  section: {
    marginBottom: 24,
  },
  resetButton: {
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  }
});
