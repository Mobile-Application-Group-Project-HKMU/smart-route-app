import homeTranslations from './home';
import { planTranslations } from './plan';
import stopTranslations from './stop';
import tabsTranslations from './tabs';
import mtrTranslations from './mtr';
import settingsTranslations from './settings';
import busTranslations from './bus';
import nearbyTranslations from './nearby';
import achievementsTranslations from './achievements';

// Merge all translations
export const translations = {
  ...homeTranslations,
  ...settingsTranslations,
  ...busTranslations,
  ...stopTranslations,
  ...nearbyTranslations,
  ...planTranslations,
  ...tabsTranslations,
  ...mtrTranslations,
  ...achievementsTranslations,
  en: {
    impact: {
      title: "Transit Impact",
      loading: "Loading your impact data...",
      summary: {
        title: "Your Transit Impact",
        dayStreak: "day streak"
      },
      metrics: {
        journeys: "Total Journeys",
        distance: "Distance Traveled",
        co2Saved: "CO2 Emissions Saved",
        fuelSaved: "Fuel Saved",
        caloriesBurned: "Calories Burned",
        steps: "Steps Taken"
      },
      equivalents: {
        title: "Environmental Impact",
        trees: "Equivalent to {{count}} trees absorbing CO2 for a year"
      },
      milestones: {
        achieved: "Achievements Unlocked",
        next: "Next Milestones"
      },
      record: {
        title: "Record Transit Impact",
        description: "Save your journey's environmental impact",
        processing: "Processing your journey data..."
      },
      recorded: {
        title: "Journey Recorded",
        message: "Great job! You've saved {{co2}}kg of CO2 and burned {{calories}} calories on this trip."
      },
      share: {
        title: "My Transit Impact Stats",
        message: "I've taken {{journeys}} public transit journeys, traveled {{distance}}km, and saved {{co2}}kg of CO2 emissions! That's equivalent to {{trees}} trees absorbing CO2 for a year. #SustainableTransit"
      },
      error: {
        title: "Recording Failed",
        message: "Unable to record your journey impact. Please try again."
      },
      reset: {
        button: "Reset Impact Data",
        title: "Reset Data",
        confirmation: "This will reset all your impact data. This action cannot be undone. Are you sure you want to continue?"
      }
    }
  },
  "zh-Hant": {
    impact: {
      title: "交通影響",
      loading: "正在加載您的影響數據...",
      summary: {
        title: "您的交通影響",
        dayStreak: "天連續紀錄"
      },
      metrics: {
        journeys: "總行程數",
        distance: "行駛距離",
        co2Saved: "減少的碳排放",
        fuelSaved: "節省的燃油",
        caloriesBurned: "消耗的卡路里",
        steps: "行走步數"
      },
      equivalents: {
        title: "環境影響",
        trees: "相當於{{count}}棵樹一年吸收的二氧化碳"
      },
      milestones: {
        achieved: "已解鎖成就",
        next: "下一個里程碑"
      },
      record: {
        title: "記錄交通影響",
        description: "保存您的旅程環保影響",
        processing: "正在處理您的旅程數據..."
      },
      recorded: {
        title: "行程已記錄",
        message: "做得好！此次旅程您減少了{{co2}}公斤的碳排放並消耗了{{calories}}卡路里。"
      },
      share: {
        title: "我的交通影響統計",
        message: "我已乘坐公共交通{{journeys}}次，行駛了{{distance}}公里，減少了{{co2}}公斤的碳排放！這相當於{{trees}}棵樹一年吸收的二氧化碳。#可持續交通"
      },
      error: {
        title: "記錄失敗",
        message: "無法記錄您的旅程影響。請再試一次。"
      },
      reset: {
        button: "重置影響數據",
        title: "重置數據",
        confirmation: "這將重置您所有的影響數據。此操作無法撤銷。您確定要繼續嗎？"
      }
    }
  },
  "zh-Hans": {
    impact: {
      title: "交通影响",
      loading: "正在加载您的影响数据...",
      summary: {
        title: "您的交通影响",
        dayStreak: "天连续记录"
      },
      metrics: {
        journeys: "总行程数",
        distance: "行驶距离",
        co2Saved: "减少的碳排放",
        fuelSaved: "节省的燃油",
        caloriesBurned: "消耗的卡路里",
        steps: "行走步数"
      },
      equivalents: {
        title: "环境影响",
        trees: "相当于{{count}}棵树一年吸收的二氧化碳"
      },
      milestones: {
        achieved: "已解锁成就",
        next: "下一个里程碑"
      },
      record: {
        title: "记录交通影响",
        description: "保存您的旅程环保影响",
        processing: "正在处理您的旅程数据..."
      },
      recorded: {
        title: "行程已记录",
        message: "做得好！此次旅程您减少了{{co2}}公斤的碳排放并消耗了{{calories}}卡路里。"
      },
      share: {
        title: "我的交通影响统计",
        message: "我已乘坐公共交通{{journeys}}次，行驶了{{distance}}公里，减少了{{co2}}公斤的碳排放！这相当于{{trees}}棵树一年吸收的二氧化碳。#可持续交通"
      },
      error: {
        title: "记录失败",
        message: "无法记录您的旅程影响。请再试一次。"
      },
      reset: {
        button: "重置影响数据",
        title: "重置数据",
        confirmation: "这将重置您所有的影响数据。此操作无法撤销。您确定要继续吗？"
      }
    }
  }
};

// Export types for type safety
export type TranslationKey = keyof typeof translations;
export type LanguageCode = 'en' | 'zh-Hant' | 'zh-Hans';
