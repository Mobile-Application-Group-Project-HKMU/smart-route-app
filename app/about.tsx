// Import necessary React and React Native components
// 导入必要的React和React Native组件
import { useEffect } from "react";
import {
  StyleSheet,
  Pressable,
  Linking,
  useColorScheme,
  ScrollView,
} from "react-native";
// Import navigation tools from Expo Router
// 从Expo Router导入导航工具
import { router, useLocalSearchParams } from "expo-router";

// Import custom themed components from local directories
// 从本地目录导入自定义主题组件
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
// Import language context for multilingual support
// 导入语言上下文以支持多语言
import { useLanguage } from "@/contexts/LanguageContext";

// Define content for multiple languages (English, Traditional Chinese, Simplified Chinese)
// 定义多语言内容（英文、繁体中文、简体中文）
const CONTENT = {
  en: {
    // English language content
    // 英语内容
    title: "Project Overview",
    teamTitle: "Technical Team Composition",
    termsTitle: "Usage Policy & Terms",
    school: "Hong Kong Metropolitan University",
    projectContext: {
      department: "Department of Computer Engineering",
      course: "COMP S313F Mobile Application Programming",
      academicPeriod: "Spring Term 2025",
      projectType: "Course Group Project",
    },
    description:
      "This academic initiative serves as a comprehensive implementation of modern mobile development paradigms, integrating cutting-edge technologies and industry best practices.",
    keyFeatures: {
      title: "Core Functionalities",
      items: [
        "Real-time Data Visualization Engine",
        "Dynamic Multi-Language Localization System",
        "Adaptive Responsive Layout Architecture",
      ],
    },
    technicalSpecifications: {
      title: "Technical Architecture",
      stack: [
        "Frontend: React Expo 5 (Application Routing)",
        "Language: TypeScript",
        "State Management: Git",
      ],
    },
    policy: {
      title: "Usage Terms & Conditions",
      clauses: [
        "STRICTLY NON-COMMERCIAL USE ONLY",
        "Data integrity disclaimer - independent verification recommended for mission-critical applications",
        "Limited liability clause for system-derived decisions",
        "Open Source License: MIT (Massachusetts Institute of Technology)",
      ],
    },
  },
  "zh-Hant": {
    // Traditional Chinese content
    // 繁体中文内容
    title: "項目概況",
    teamTitle: "技術團隊構成",
    termsTitle: "使用條款與政策",
    school: "香港都會大學",
    projectContext: {
      department: "電腦工程系",
      course: "COMP S313F 移動應用程式編程",
      academicPeriod: "2025年春季學期",
      projectType: "課程小組項目",
    },
    description:
      "本學術項目作為現代移動開發範式的綜合實踐，整合了前沿技術方案與行業最佳實踐。",
    keyFeatures: {
      title: "核心功能體系",
      items: [
        "實時數據可視化引擎",
        "動態多語言本地化系統",
        "自適應響應式佈局架構",
      ],
    },
    technicalSpecifications: {
      title: "技術架構說明",
      stack: [
        "前端: React Expo 5 (Application Routing)",
        "開發語言: TypeScript",
        "狀態管理: Git",
      ],
    },
    policy: {
      title: "使用條款與免責聲明",
      clauses: [
        "嚴格限於非商業用途",
        "數據完整性免責聲明 - 關鍵業務場景建議獨立驗證",
        "系統衍生決策的有限責任條款",
        "開源協議: MIT (麻省理工學院許可證)",
      ],
    },
  },
  "zh-Hans": {
    // Simplified Chinese content
    // 简体中文内容
    title: "项目概况",
    teamTitle: "技术团队构成",
    termsTitle: "使用条款与政策",
    school: "香港都会大学",
    projectContext: {
      department: "电脑工程系",
      course: "COMP S313F 移动应用程序编程",
      academicPeriod: "2025年春季学期",
      projectType: "课程小组项目",
    },
    description:
      "本学术项目作为现代移动开发范式的综合实践，整合了前沿技术方案与行业最佳实践。",
    keyFeatures: {
      title: "核心功能体系",
      items: [
        "实时数据可视化引擎",
        "动态多语言本地化系统",
        "自适应响应式布局架构",
      ],
    },
    technicalSpecifications: {
      title: "技术架构说明",
      stack: [
        "前端: React Expo 5 (Application Routing)",
        "开发语言: TypeScript",
        "状态管理: Git",
      ],
    },
    policy: {
      title: "使用条款与免责声明",
      clauses: [
        "严格限于非商业用途",
        "数据完整性免责声明 - 关键业务场景建议独立验证",
        "系统衍生决策的有限责任条款",
        "开源协议: MIT (麻省理工学院许可证)",
      ],
    },
  },
};

// Array containing team member information
// 包含团队成员信息的数组
const TEAM_MEMBERS = [
  {
    name: "Li Yanpei",
    role: "Frontend Development / Server Deploy",
    studentId: "13522245",
    href: "https://hiko.dev",
  },
  {
    name: "Li Yuan",
    role: "Group Member",
    studentId: "13549915",
    href: "",
  },
  {
    name: "LEE Meng Hin",
    role: "Group Member",
    studentId: "13799930",
    href: "https://github.com/menghinnn",
  },
  {
    name: "Chan Antony",
    role: "Group Member",
    studentId: "13830346",
    href: "https://github.com/ac0915",
  },
  {
    name: "Sze Tsz Yam",
    role: "Group Member",
    studentId: "13852523",
    href: "https://github.com/BryantSzeTY",
  },
  {
    name: "Poon Chun Him",
    role: "Group Member",
    studentId: "13810488",
    href: "",
  },
];

// Main component for the About screen
// 关于页面的主要组件
export default function AboutScreen() {
  // Get navigation parameters - checks if navigated from index page
  // 获取导航参数 - 检查是否从索引页面导航而来
  const { fromIndex } = useLocalSearchParams();
  // Get current language from context
  // 从上下文获取当前语言
  const { language } = useLanguage();
  // Select content based on current language
  // 根据当前语言选择内容
  const content = CONTENT[language];
  // Get current color scheme (light/dark)
  // 获取当前颜色方案（浅色/深色）
  const colorScheme = useColorScheme();

  // Effect to prevent direct navigation to this page
  // 防止直接导航到此页面的效果钩子
  useEffect(() => {
    // Redirect to home if not navigated from index
    // 如果不是从主页导航而来，则重定向到主页
    if (fromIndex !== "true") {
      router.replace("/");
    }
  }, [fromIndex]);

  // Function to open external links when team member is clicked
  // 当点击团队成员时打开外部链接的函数
  const openLink = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  // Render the about screen UI
  // 渲染关于页面的UI
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* University and project context section */}
        {/* 大学和项目背景部分 */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.schoolName}>{content.school}</ThemedText>
          <ThemedView style={styles.contextBox}>
            <ThemedText style={styles.contextItem}>
              {content.projectContext.department}
            </ThemedText>
            <ThemedText style={styles.contextItem}>
              {content.projectContext.course}
            </ThemedText>
            <ThemedText style={styles.contextItem}>
              {content.projectContext.academicPeriod}
            </ThemedText>
            <ThemedText style={styles.contextItem}>
              {content.projectContext.projectType}
            </ThemedText>
          </ThemedView>
          <ThemedText style={styles.description}>
            {content.description}
          </ThemedText>
        </ThemedView>

        {/* Key features section */}
        {/* 核心功能部分 */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {content.keyFeatures.title}
          </ThemedText>
          {/* Map through and display all feature items */}
          {/* 遍历并显示所有功能项 */}
          {content.keyFeatures.items.map((item, index) => (
            <ThemedText key={index} style={styles.listItem}>
              • {item}
            </ThemedText>
          ))}
        </ThemedView>

        {/* Technical specifications section */}
        {/* 技术规格部分 */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {content.technicalSpecifications.title}
          </ThemedText>
          {content.technicalSpecifications.stack.map((item, index) => (
            <ThemedText key={index} style={styles.listItem}>
              • {item}
            </ThemedText>
          ))}
        </ThemedView>

        {/* Team members section with clickable profiles */}
        {/* 团队成员部分，带有可点击的个人资料 */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {content.teamTitle}
          </ThemedText>
          <ThemedView style={styles.teamList}>
            {TEAM_MEMBERS.map((member, index) => (
              <Pressable
                key={index}
                style={styles.teamMember}
                onPress={() => member.href && openLink(member.href)}
              >
                <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                <ThemedText style={styles.memberRole}>{member.role}</ThemedText>
                <ThemedText style={styles.memberId}>
                  ID: {member.studentId}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Policy and terms section */}
        {/* 政策和条款部分 */}
        <ThemedView style={[styles.section, styles.policySection]}>
          <ThemedText style={styles.sectionTitle}>
            {content.termsTitle}
          </ThemedText>
          {content.policy.clauses.map((clause, index) => (
            <ThemedText key={index} style={styles.policyItem}>
              {clause}
            </ThemedText>
          ))}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

// Styles for the about screen
// 关于页面的样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  // Header styles for navigation and language switcher
  // 导航和语言切换器的标题样式
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  languageSwitcherContainer: {
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  schoolName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  contextBox: {
    backgroundColor: "rgba(161, 206, 220, 0.2)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  contextItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  listItem: {
    fontSize: 14,
    marginBottom: 8,
    paddingLeft: 8,
  },
  teamList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  teamMember: {
    width: "48%",
    backgroundColor: "rgba(161, 206, 220, 0.2)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  // Member information display styles
  // 成员信息显示样式
  memberName: {
    fontWeight: "bold",
    fontSize: 15,
  },
  memberRole: {
    fontSize: 13,
    marginTop: 4,
  },
  memberId: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  // Policy section with special styling
  // 具有特殊样式的政策部分
  policySection: {
    backgroundColor: "rgba(255, 213, 128, 0.2)",
    borderRadius: 8,
  },
  policyItem: {
    fontSize: 13,
    marginBottom: 10,
    paddingLeft: 8,
  },
});
