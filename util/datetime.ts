
export const formatTransportTime = (
    isoString: string,
    lang: 'en' | 'zh',
    type: 'absolute' | 'relative' = 'absolute'
  ) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
  
      if (type === 'relative') {
        const diffMinutes = Math.round((date.getTime() - now.getTime()) / 60000);
        
        if (diffMinutes < 1) return lang === 'en' ? 'Due' : '即将到达';
        if (diffMinutes < 60) {
          return lang === 'en' 
            ? `${diffMinutes} min${diffMinutes > 1 ? 's' : ''}`
            : `${diffMinutes}分钟`;
        }
      }
  
      const formatter = new Intl.DateTimeFormat(
        lang === 'en' ? 'en-US' : 'zh-CN',
        {
          hour: 'numeric',
          minute: '2-digit',
          hour12: lang === 'en',
          timeZone: 'Asia/Hong_Kong'
        }
      );
  
      return formatter.format(date);
    } catch  {
      console.error('Invalid datetime format:', isoString);
      return lang === 'en' ? 'Invalid time' : '时间无效';
    }
  };
  