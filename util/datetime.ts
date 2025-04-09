/**
 * Formats transport time strings into user-friendly displays in different languages.
 * Supports both absolute time (clock time) and relative time (minutes from now).
 * 
 * 将交通时间字符串格式化为不同语言的用户友好显示。
 * 支持绝对时间（时钟时间）和相对时间（距现在的分钟数）。
 * 
 * @param isoString - ISO-formatted date string to format - 要格式化的ISO格式日期字符串
 * @param lang - Language for the formatted output (English, Traditional Chinese, or Simplified Chinese)
 *               格式化输出的语言（英文、繁体中文或简体中文）
 * @param type - Whether to display as absolute time or relative time - 是显示为绝对时间还是相对时间
 * @returns Formatted time string in the specified language - 指定语言的格式化时间字符串
 */
export const formatTransportTime = (
    isoString: string,
    lang: 'en' | 'zh-Hant' | 'zh-Hans' | 'zh',
    type: 'absolute' | 'relative' = 'absolute'
  ) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
  
      if (type === 'relative') {
        // Calculate minutes difference for relative time display
        const diffMinutes = Math.round((date.getTime() - now.getTime()) / 60000);
        
        // Handle special case when arrival is imminent
        if (diffMinutes < 1) {
          return lang === 'en' ? 'Due' : '即将到达';
        }
        
        // Format minutes remaining
        if (diffMinutes < 60) {
          if (lang === 'en') {
            return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''}`;
          } else {
            return `${diffMinutes}分钟`;
          }
        }
      }
  
      // Format as absolute time using locale-specific formatting
      const formatter = new Intl.DateTimeFormat(
        lang === 'en' ? 'en-US' : (lang === 'zh-Hant' ? 'zh-HK' : 'zh-CN'),
        {
          hour: 'numeric',
          minute: '2-digit',
          hour12: lang === 'en',
          timeZone: 'Asia/Hong_Kong'
        }
      );
  
      return formatter.format(date);
    } catch  {
      // Handle invalid date strings
      console.error('Invalid datetime format:', isoString);
      return lang === 'en' ? 'Invalid time' : '时间无效';
    }
  };
