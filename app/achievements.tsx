// Achievements Screen - Displays user achievements with categorization and progress
// 成就页面 - 显示用户成就，包括分类和进度

// React and React Native imports (React 和 React Native 导入)
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';

// Component imports (组件导入)
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Context and utilities imports (上下文和工具导入)
import { useLanguage } from '@/contexts/LanguageContext';
import { Achievement, AchievementCategory, UserAchievements } from '@/types/achievement-types';
import { getAchievementColor, getAchievementPoints, getUserAchievements } from '@/util/achievements';

export default function AchievementsScreen() {
  // Language context for i18n (用于国际化的语言上下文)
  const { t, language } = useLanguage();
  // State for loading status (加载状态)
  const [loading, setLoading] = useState(true);
  // State for user achievements data (用户成就数据)
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  // State for active category filter (当前选中的成就类别过滤器)
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'ALL'>('ALL');
  
  // Load achievements on component mount (组件挂载时加载成就)
  useEffect(() => {
    loadAchievements();
  }, []);
  
  // Fetch user achievements from API (从API获取用户成就)
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
  
  // Filter achievements by category (按类别过滤成就)
  const getAchievementsForCategory = (category: AchievementCategory | 'ALL') => {
    if (!userAchievements) return [];
    
    if (category === 'ALL') {
      return userAchievements.achievements;
    }
    
    return userAchievements.achievements.filter(
      achievement => achievement.category === category
    );
  };
  
  // Get translated category title (获取经过翻译的类别标题)
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
  
  // Component for displaying achievement statistics (显示成就统计的组件)
  const renderAchievementStats = () => {
    if (!userAchievements) return null;
    
    // Calculate statistics (计算统计数据)
    const totalAchievements = userAchievements.achievements.length;
    const unlockedAchievements = userAchievements.achievements.filter(
      a => a.status === 'UNLOCKED'
    ).length;
    const achievementPoints = getAchievementPoints(userAchievements.achievements);
    
    return (
      <ThemedView style={styles.statsContainer}>
        {/* Unlocked achievements count (已解锁成就数量) */}
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>{unlockedAchievements}</ThemedText>
          <ThemedText style={styles.statLabel}>
            {t('achievements.stats.unlocked')}
          </ThemedText>
        </View>
        
        <View style={styles.statDivider} />
        
        {/* Completion percentage (完成百分比) */}
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>
            {Math.round((unlockedAchievements / totalAchievements) * 100)}%
          </ThemedText>
          <ThemedText style={styles.statLabel}>
            {t('achievements.stats.completion')}
          </ThemedText>
        </View>
        
        <View style={styles.statDivider} />
        
        {/* Total achievement points (成就总积分) */}
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>{achievementPoints}</ThemedText>
          <ThemedText style={styles.statLabel}>
            {t('achievements.stats.points')}
          </ThemedText>
        </View>
      </ThemedView>
    );
  };
  
  // Horizontal scrollable category tabs (可横向滚动的类别选项卡)
  const renderCategoryTabs = () => {
    // Available categories (可用的类别)
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
  
  // Render individual achievement card (渲染单个成就卡片)
  const renderAchievement = (achievement: Achievement) => {
    // Get color based on achievement level (根据成就级别获取颜色)
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
        {/* Achievement header with icon and title (带有图标和标题的成就头部) */}
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
        
        {/* Achievement description (成就描述) */}
        <ThemedText style={styles.achievementDescription}>
          {achievement.description[language]}
        </ThemedText>
        
        {/* Progress bar (进度条) */}
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
        
        {/* Progress text showing current/required values (显示当前/所需值的进度文本) */}
        <ThemedText style={styles.progressText}>
          {achievement.currentValue} / {achievement.requirement}
        </ThemedText>
        
        {/* Unlocked date if achievement is unlocked (如果成就已解锁则显示解锁日期) */}
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
  
  // Loading indicator when data is being fetched (数据获取时的加载指示器)
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
  
  // Main render of the achievements screen (成就页面的主渲染)
  return (
    <ThemedView style={styles.container}>
      {/* Screen header with back button (带有返回按钮的屏幕标题) */}
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
      
      {/* Scrollable content with stats, categories, and achievements (包含统计、类别和成就的可滚动内容) */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderAchievementStats()}
        {renderCategoryTabs()}
        
        {/* Achievement cards container (成就卡片容器) */}
        <ThemedView style={styles.achievementsContainer}>
          {getAchievementsForCategory(activeCategory).map(renderAchievement)}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

// Styles for the achievements screen (成就页面样式)
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
