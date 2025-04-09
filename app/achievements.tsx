import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { Achievement, AchievementCategory, UserAchievements } from '@/types/achievement-types';
import { getAchievementColor, getAchievementPoints, getUserAchievements } from '@/util/achievements';

export default function AchievementsScreen() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'ALL'>('ALL');
  
  useEffect(() => {
    loadAchievements();
  }, []);
  
  const loadAchievements = async () => {
    setLoading(true);
    try {
      const achievements = await getUserAchievements();
      setUserAchievements(achievements);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getAchievementsForCategory = (category: AchievementCategory | 'ALL') => {
    if (!userAchievements) return [];
    
    if (category === 'ALL') {
      return userAchievements.achievements;
    }
    
    return userAchievements.achievements.filter(
      achievement => achievement.category === category
    );
  };
  
  const getCategoryTitle = (category: AchievementCategory | 'ALL') => {
    switch (category) {
      case 'ALL':
        return t('achievements.categories.all');
      case 'JOURNEY_COUNT':
        return t('achievements.categories.journeyCount');
      case 'TRANSPORT_VARIETY':
        return t('achievements.categories.transportVariety');
      case 'DISTRICT_EXPLORER':
        return t('achievements.categories.districtExplorer');
      case 'ROUTE_MASTER':
        return t('achievements.categories.routeMaster');
      case 'TIME_TRAVELER':
        return t('achievements.categories.timeTraveler');
      default:
        return '';
    }
  };
  
  const renderAchievementStats = () => {
    if (!userAchievements) return null;
    
    const totalAchievements = userAchievements.achievements.length;
    const unlockedAchievements = userAchievements.achievements.filter(
      a => a.status === 'UNLOCKED'
    ).length;
    const achievementPoints = getAchievementPoints(userAchievements.achievements);
    
    return (
      <ThemedView style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>{unlockedAchievements}</ThemedText>
          <ThemedText style={styles.statLabel}>
            {t('achievements.stats.unlocked')}
          </ThemedText>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>
            {Math.round((unlockedAchievements / totalAchievements) * 100)}%
          </ThemedText>
          <ThemedText style={styles.statLabel}>
            {t('achievements.stats.completion')}
          </ThemedText>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>{achievementPoints}</ThemedText>
          <ThemedText style={styles.statLabel}>
            {t('achievements.stats.points')}
          </ThemedText>
        </View>
      </ThemedView>
    );
  };
  
  const renderCategoryTabs = () => {
    const categories: (AchievementCategory | 'ALL')[] = [
      'ALL',
      'JOURNEY_COUNT',
      'TRANSPORT_VARIETY',
      'DISTRICT_EXPLORER',
      'ROUTE_MASTER'
    ];
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              activeCategory === category && styles.activeCategory
            ]}
            onPress={() => setActiveCategory(category)}
          >
            <ThemedText style={[
              styles.categoryText,
              activeCategory === category && styles.activeCategoryText
            ]}>
              {getCategoryTitle(category)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  const renderAchievement = (achievement: Achievement) => {
    const color = getAchievementColor(achievement.level);
    const isUnlocked = achievement.status === 'UNLOCKED';
    
    return (
      <ThemedView 
        key={achievement.id}
        style={[
          styles.achievementCard,
          isUnlocked ? styles.unlockedCard : styles.lockedCard
        ]}
      >
        <View style={styles.achievementHeader}>
          <View 
            style={[
              styles.achievementBadge,
              { backgroundColor: isUnlocked ? color : '#CCCCCC' }
            ]}
          >
            <IconSymbol 
              name={achievement.icon as any} 
              size={24} 
              color={isUnlocked ? 'white' : '#666666'} 
            />
          </View>
          
          <View style={styles.achievementTitleContainer}>
            <ThemedText style={styles.achievementTitle}>
              {achievement.title[language]}
            </ThemedText>
            <ThemedText style={styles.achievementLevel}>
              {achievement.level}
            </ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.achievementDescription}>
          {achievement.description[language]}
        </ThemedText>
        
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar,
              {
                backgroundColor: isUnlocked ? color : '#E0E0E0',
                width: `${achievement.progress}%`
              }
            ]}
          />
        </View>
        
        <ThemedText style={styles.progressText}>
          {achievement.currentValue} / {achievement.requirement}
        </ThemedText>
        
        {isUnlocked && achievement.unlockedAt && (
          <ThemedText style={styles.unlockedDate}>
            {t('achievements.unlockedOn')}: {achievement.unlockedAt instanceof Date 
              ? achievement.unlockedAt.toLocaleDateString() 
              : typeof achievement.unlockedAt === 'string' 
                ? new Date(achievement.unlockedAt).toLocaleDateString()
                : t('achievements.justNow')}
          </ThemedText>
        )}
      </ThemedView>
    );
  };
  
  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A3161" />
        <ThemedText style={styles.loadingText}>
          {t('achievements.loading')}
        </ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: t('achievements.title'),
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <IconSymbol name="chevron.left" size={24} color="#000000" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderAchievementStats()}
        {renderCategoryTabs()}
        
        <ThemedView style={styles.achievementsContainer}>
          {getAchievementsForCategory(activeCategory).map(renderAchievement)}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  backButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFD580',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  statLabel: {
    fontSize: 14,
    color: '#8B4513',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(139, 69, 19, 0.3)',
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeCategory: {
    backgroundColor: '#0A3161',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: 'white',
  },
  achievementsContainer: {
    gap: 16,
  },
  achievementCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  unlockedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  lockedCard: {
    opacity: 0.7,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementTitleContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  achievementLevel: {
    fontSize: 14,
    opacity: 0.7,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
    opacity: 0.7,
    marginBottom: 8,
  },
  unlockedDate: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
  },
});
