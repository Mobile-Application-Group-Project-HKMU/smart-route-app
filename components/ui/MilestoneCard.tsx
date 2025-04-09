import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from './IconSymbol';
import { ImpactMilestone } from '@/types/impact-types';
import { useColorScheme } from '@/hooks/useColorScheme';

interface MilestoneCardProps {
  milestone: ImpactMilestone;
}

export default function MilestoneCard({ milestone }: MilestoneCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  // Different colors for different metric types
  const metricColors = {
    distance: '#4a90e2',
    co2: '#2ecc71',
    journeys: '#9b59b6',
    calories: '#e74c3c',
    steps: '#f39c12'
  };
  
  const color = metricColors[milestone.metricType];
  const backgroundColor = milestone.isAchieved 
    ? (colorScheme === 'light' ? `${color}30` : `${color}20`) 
    : (colorScheme === 'light' ? '#f0f0f0' : '#2c2c2c');
  
  return (
    <ThemedView style={[styles.card, { backgroundColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: milestone.isAchieved ? color : '#888' }]}>
        <IconSymbol 
          name={milestone.iconName as any} 
          size={24} 
          color="#ffffff" 
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.title}>{milestone.title}</ThemedText>
          {milestone.isAchieved && (
            <IconSymbol name="checkmark.circle.fill" size={20} color={color} />
          )}
        </View>
        <ThemedText style={styles.description}>{milestone.description}</ThemedText>
        
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar,
              { 
                backgroundColor: milestone.isAchieved ? color : (colorScheme === 'light' ? '#ddd' : '#444'),
                width: '100%' 
              }
            ]} 
          />
          <ThemedText style={styles.progressText}>
            {milestone.isAchieved ? 'Completed' : `Target: ${milestone.threshold}${getMetricUnit(milestone.metricType)}`}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

function getMetricUnit(metricType: string): string {
  switch (metricType) {
    case 'distance': return 'km';
    case 'co2': return 'kg';
    case 'journeys': return '';
    case 'calories': return 'cal';
    case 'steps': return '';
    default: return '';
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 10,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    opacity: 0.6,
  }
});
