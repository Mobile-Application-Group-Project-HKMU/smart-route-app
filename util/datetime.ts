/**
 * Formats transport time strings into user-friendly displays in different languages.
 * Supports both absolute time (clock time) and relative time (minutes from now).
 * 
 * @param isoString - ISO-formatted date string to format
 * @param lang - Language for the formatted output (English, Traditional Chinese, or Simplified Chinese)
 * @param type - Whether to display as absolute time or relative time
 * @returns Formatted time string in the specified language
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
