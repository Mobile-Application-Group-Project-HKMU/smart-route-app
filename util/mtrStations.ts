import { MtrStation } from "./mtr";

/**
 * Gets all MTR stations
 */
export async function getAllStations(): Promise<MtrStation[]> {
  const stations: MtrStation[] = [
    // Airport Express (AEL)
    { stop: 'HOK', name_en: 'Hong Kong', name_tc: '香港', name_sc: '香港', lat: 22.2849, long: 114.1587, company: 'MTR', mode: 'MTR', line_codes: ['AEL', 'TCL'], is_interchange: true, facilities: ['Elevator', 'Escalator', 'Washroom'], exit_info: [{ exit: 'A', destination_en: 'IFC Mall', destination_tc: '國際金融中心商場' }, { exit: 'D', destination_en: 'Central Ferry Piers', destination_tc: '中環渡輪碼頭' }] },
    { stop: 'KOW', name_en: 'Kowloon', name_tc: '九龍', name_sc: '九龙', lat: 22.3045, long: 114.1615, company: 'MTR', mode: 'MTR', line_codes: ['AEL', 'TCL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'TSY', name_en: 'Tsing Yi', name_tc: '青衣', name_sc: '青衣', lat: 22.3586, long: 114.1075, company: 'MTR', mode: 'MTR', line_codes: ['AEL', 'TCL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'AIR', name_en: 'Airport', name_tc: '機場', name_sc: '机场', lat: 22.3160, long: 113.9365, company: 'MTR', mode: 'MTR', line_codes: ['AEL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'AWE', name_en: 'AsiaWorld-Expo', name_tc: '博覽館', name_sc: '博览馆', lat: 22.3215, long: 113.9435, company: 'MTR', mode: 'MTR', line_codes: ['AEL'], is_interchange: false, facilities: [], exit_info: [] },

    // Tung Chung Line (TCL)
    { stop: 'OLY', name_en: 'Olympic', name_tc: '奧運', name_sc: '奥运', lat: 22.3178, long: 114.1602, company: 'MTR', mode: 'MTR', line_codes: ['TCL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'NAC', name_en: 'Nam Cheong', name_tc: '南昌', name_sc: '南昌', lat: 22.3269, long: 114.1540, company: 'MTR', mode: 'MTR', line_codes: ['TCL', 'TML'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'LAK', name_en: 'Lai King', name_tc: '荔景', name_sc: '荔景', lat: 22.3486, long: 114.1262, company: 'MTR', mode: 'MTR', line_codes: ['TCL', 'TWL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'SUN', name_en: 'Sunny Bay', name_tc: '欣澳', name_sc: '欣澳', lat: 22.3318, long: 114.0289, company: 'MTR', mode: 'MTR', line_codes: ['TCL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'TUC', name_en: 'Tung Chung', name_tc: '東涌', name_sc: '东涌', lat: 22.2896, long: 113.9415, company: 'MTR', mode: 'MTR', line_codes: ['TCL'], is_interchange: false, facilities: [], exit_info: [] },

    // Tuen Ma Line (TML)
    { stop: 'WKS', name_en: 'Wu Kai Sha', name_tc: '烏溪沙', name_sc: '乌溪沙', lat: 22.4290, long: 114.2435, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'MOS', name_en: 'Ma On Shan', name_tc: '馬鞍山', name_sc: '马鞍山', lat: 22.4248, long: 114.2320, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'HEO', name_en: 'Heng On', name_tc: '恆安', name_sc: '恒安', lat: 22.4175, long: 114.2258, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'TSH', name_en: 'Tai Shui Hang', name_tc: '大水坑', name_sc: '大水坑', lat: 22.4086, long: 114.2225, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'SHM', name_en: 'Shek Mun', name_tc: '石門', name_sc: '石门', lat: 22.3878, long: 114.2085, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'CIO', name_en: 'City One', name_tc: '第一城', name_sc: '第一城', lat: 22.3829, long: 114.2035, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'STW', name_en: 'Sha Tin Wai', name_tc: '沙田圍', name_sc: '沙田围', lat: 22.3769, long: 114.1945, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'CKT', name_en: 'Che Kung Temple', name_tc: '車公廟', name_sc: '车公庙', lat: 22.3745, long: 114.1855, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'TAW', name_en: 'Tai Wai', name_tc: '大圍', name_sc: '大围', lat: 22.3730, long: 114.1785, company: 'MTR', mode: 'MTR', line_codes: ['TML', 'EAL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'HIK', name_en: 'Hin Keng', name_tc: '顯徑', name_sc: '显径', lat: 22.3640, long: 114.1715, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'DIH', name_en: 'Diamond Hill', name_tc: '鑽石山', name_sc: '钻石山', lat: 22.3400, long: 114.2015, company: 'MTR', mode: 'MTR', line_codes: ['TML', 'KTL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'KAT', name_en: 'Kai Tak', name_tc: '啟德', name_sc: '启德', lat: 22.3305, long: 114.1995, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'SUW', name_en: 'Sung Wong Toi', name_tc: '宋皇臺', name_sc: '宋皇台', lat: 22.3260, long: 114.1905, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'TKW', name_en: 'To Kwa Wan', name_tc: '土瓜灣', name_sc: '土瓜湾', lat: 22.3170, long: 114.1875, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'HOM', name_en: 'Ho Man Tin', name_tc: '何文田', name_sc: '何文田', lat: 22.3095, long: 114.1830, company: 'MTR', mode: 'MTR', line_codes: ['TML', 'KTL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'HUH', name_en: 'Hung Hom', name_tc: '紅磡', name_sc: '红磡', lat: 22.3030, long: 114.1815, company: 'MTR', mode: 'MTR', line_codes: ['TML', 'EAL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'ETS', name_en: 'East Tsim Sha Tsui', name_tc: '尖東', name_sc: '尖东', lat: 22.2945, long: 114.1740, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'AUS', name_en: 'Austin', name_tc: '柯士甸', name_sc: '柯士甸', lat: 22.3040, long: 114.1660, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'MEF', name_en: 'Mei Foo', name_tc: '美孚', name_sc: '美孚', lat: 22.3375, long: 114.1410, company: 'MTR', mode: 'MTR', line_codes: ['TML', 'TWL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'TWW', name_en: 'Tsuen Wan West', name_tc: '荃灣西', name_sc: '荃湾西', lat: 22.3685, long: 114.1100, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'KSR', name_en: 'Kam Sheung Road', name_tc: '錦上路', name_sc: '锦上路', lat: 22.4345, long: 114.0635, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'YUL', name_en: 'Yuen Long', name_tc: '元朗', name_sc: '元朗', lat: 22.4455, long: 114.0350, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'LOP', name_en: 'Long Ping', name_tc: '朗屏', name_sc: '朗屏', lat: 22.4480, long: 114.0255, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'TIS', name_en: 'Tin Shui Wai', name_tc: '天水圍', name_sc: '天水围', lat: 22.4615, long: 114.0050, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'SIH', name_en: 'Siu Hong', name_tc: '兆康', name_sc: '兆康', lat: 22.4115, long: 113.9785, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'TUM', name_en: 'Tuen Mun', name_tc: '屯門', name_sc: '屯门', lat: 22.3950, long: 113.9735, company: 'MTR', mode: 'MTR', line_codes: ['TML'], is_interchange: false, facilities: [], exit_info: [] },

    // Tseung Kwan O Line (TKL)
    { stop: 'NOP', name_en: 'North Point', name_tc: '北角', name_sc: '北角', lat: 22.2875, long: 114.1915, company: 'MTR', mode: 'MTR', line_codes: ['TKL', 'ISL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'QUB', name_en: 'Quarry Bay', name_tc: '鰂魚涌', name_sc: '鲗鱼涌', lat: 22.2870, long: 114.2095, company: 'MTR', mode: 'MTR', line_codes: ['TKL', 'ISL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'YAT', name_en: 'Yau Tong', name_tc: '油塘', name_sc: '油塘', lat: 22.2975, long: 114.2365, company: 'MTR', mode: 'MTR', line_codes: ['TKL', 'KTL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'TIK', name_en: 'Tiu Keng Leng', name_tc: '調景嶺', name_sc: '调景岭', lat: 22.3045, long: 114.2525, company: 'MTR', mode: 'MTR', line_codes: ['TKL', 'KTL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'TKO', name_en: 'Tseung Kwan O', name_tc: '將軍澳', name_sc: '将军澳', lat: 22.3070, long: 114.2600, company: 'MTR', mode: 'MTR', line_codes: ['TKL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'LHP', name_en: 'LOHAS Park', name_tc: '康城', name_sc: '康城', lat: 22.2955, long: 114.2690, company: 'MTR', mode: 'MTR', line_codes: ['TKL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'HAH', name_en: 'Hang Hau', name_tc: '坑口', name_sc: '坑口', lat: 22.3155, long: 114.2645, company: 'MTR', mode: 'MTR', line_codes: ['TKL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'POA', name_en: 'Po Lam', name_tc: '寶琳', name_sc: '宝琳', lat: 22.3225, long: 114.2580, company: 'MTR', mode: 'MTR', line_codes: ['TKL'], is_interchange: false, facilities: [], exit_info: [] },

    // East Rail Line (EAL)
    { stop: 'ADM', name_en: 'Admiralty', name_tc: '金鐘', name_sc: '金钟', lat: 22.2790, long: 114.1645, company: 'MTR', mode: 'MTR', line_codes: ['EAL', 'TWL', 'ISL', 'SIL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'EXC', name_en: 'Exhibition Centre', name_tc: '會展', name_sc: '会展', lat: 22.2810, long: 114.1750, company: 'MTR', mode: 'MTR', line_codes: ['EAL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'MKK', name_en: 'Mong Kok East', name_tc: '旺角東', name_sc: '旺角东', lat: 22.3220, long: 114.1725, company: 'MTR', mode: 'MTR', line_codes: ['EAL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'KOT', name_en: 'Kowloon Tong', name_tc: '九龍塘', name_sc: '九龙塘', lat: 22.3365, long: 114.1760, company: 'MTR', mode: 'MTR', line_codes: ['EAL', 'KTL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'SHT', name_en: 'Sha Tin', name_tc: '沙田', name_sc: '沙田', lat: 22.3815, long: 114.1870, company: 'MTR', mode: 'MTR', line_codes: ['EAL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'FOT', name_en: 'Fo Tan', name_tc: '火炭', name_sc: '火 blends', lat: 22.3965, long: 114.1980, company: 'MTR', mode: 'MTR', line_codes: ['EAL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'RAC', name_en: 'Racecourse', name_tc: '馬場', name_sc: '马场', lat: 22.4010, long: 114.2035, company: 'MTR', mode: 'MTR', line_codes: ['EAL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'UNI', name_en: 'University', name_tc: '大學', name_sc: '大学', lat: 22.4135, long: 114.2100, company: 'MTR', mode: 'MTR', line_codes: ['EAL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'TAP', name_en: 'Tai Po Market', name_tc: '大埔墟', name_sc: '大埔墟', lat: 22.4470, long: 114.1650, company: 'MTR', mode: 'MTR', line_codes: ['EAL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'TWO', name_en: 'Tai Wo', name_tc: '太和', name_sc: '太和', lat: 22.4510, long: 114.1610, company: 'MTR', mode: 'MTR', line_codes: ['EAL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'FAN', name_en: 'Fanling', name_tc: '粉嶺', name_sc: '粉岭', lat: 22.4920, long: 114.1385, company: 'MTR', mode: 'MTR', line_codes: ['EAL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'SHS', name_en: 'Sheung Shui', name_tc: '上水', name_sc: '上水', lat: 22.5010, long: 114.1280, company: 'MTR', mode: 'MTR', line_codes: ['EAL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'LOW', name_en: 'Lo Wu', name_tc: '羅湖', name_sc: '罗湖', lat: 22.5285, long: 114.1135, company: 'MTR', mode: 'MTR', line_codes: ['EAL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'LMC', name_en: 'Lok Ma Chau', name_tc: '落馬洲', name_sc: '落马洲', lat: 22.5145, long: 114.0655, company: 'MTR', mode: 'MTR', line_codes: ['EAL'], is_interchange: false, facilities: [], exit_info: [] },

    // South Island Line (SIL)
    { stop: 'OCP', name_en: 'Ocean Park', name_tc: '海洋公園', name_sc: '海洋公园', lat: 22.2485, long: 114.1745, company: 'MTR', mode: 'MTR', line_codes: ['SIL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'WCH', name_en: 'Wong Chuk Hang', name_tc: '黃竹坑', name_sc: '黄竹坑', lat: 22.2480, long: 114.1680, company: 'MTR', mode: 'MTR', line_codes: ['SIL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'LET', name_en: 'Lei Tung', name_tc: '利東', name_sc: '利东', lat: 22.2415, long: 114.1560, company: 'MTR', mode: 'MTR', line_codes: ['SIL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'SOH', name_en: 'South Horizons', name_tc: '海怡半島', name_sc: '海怡半岛', lat: 22.2430, long: 114.1495, company: 'MTR', mode: 'MTR', line_codes: ['SIL'], is_interchange: false, facilities: [], exit_info: [] },

    // Tsuen Wan Line (TWL)
    { stop: 'CEN', name_en: 'Central', name_tc: '中環', name_sc: '中环', lat: 22.2820, long: 114.1580, company: 'MTR', mode: 'MTR', line_codes: ['TWL', 'ISL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'TST', name_en: 'Tsim Sha Tsui', name_tc: '尖沙咀', name_sc: '尖沙咀', lat: 22.2975, long: 114.1725, company: 'MTR', mode: 'MTR', line_codes: ['TWL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'JOR', name_en: 'Jordan', name_tc: '佐敦', name_sc: '佐敦', lat: 22.3050, long: 114.1715, company: 'MTR', mode: 'MTR', line_codes: ['TWL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'YMT', name_en: 'Yau Ma Tei', name_tc: '油麻地', name_sc: '油麻地', lat: 22.3130, long: 114.1705, company: 'MTR', mode: 'MTR', line_codes: ['TWL', 'KTL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'MOK', name_en: 'Mong Kok', name_tc: '旺角', name_sc: '旺角', lat: 22.3190, long: 114.1695, company: 'MTR', mode: 'MTR', line_codes: ['TWL', 'KTL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'PRE', name_en: 'Prince Edward', name_tc: '太子', name_sc: '太子', lat: 22.3245, long: 114.1685, company: 'MTR', mode: 'MTR', line_codes: ['TWL', 'KTL'], is_interchange: true, facilities: [], exit_info: [] },
    { stop: 'SSP', name_en: 'Sham Shui Po', name_tc: '深水埗', name_sc: '深水埗', lat: 22.3305, long: 114.1625, company: 'MTR', mode: 'MTR', line_codes: ['TWL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'CSW', name_en: 'Cheung Sha Wan', name_tc: '長沙灣', name_sc: '长沙湾', lat: 22.3365, long: 114.1565, company: 'MTR', mode: 'MTR', line_codes: ['TWL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'LCK', name_en: 'Lai Chi Kok', name_tc: '荔枝角', name_sc: '荔枝角', lat: 22.3370, long: 114.1480, company: 'MTR', mode: 'MTR', line_codes: ['TWL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'KWF', name_en: 'Kwai Fong', name_tc: '葵芳', name_sc: '葵芳', lat: 22.3570, long: 114.1310, company: 'MTR', mode: 'MTR', line_codes: ['TWL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'KWH', name_en: 'Kwai Hing', name_tc: '葵興', name_sc: '葵兴', lat: 22.3630, long: 114.1315, company: 'MTR', mode: 'MTR', line_codes: ['TWL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'TWH', name_en: 'Tai Wo Hau', name_tc: '大窩口', name_sc: '大窝口', lat: 22.3705, long: 114.1250, company: 'MTR', mode: 'MTR', line_codes: ['TWL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'TSW', name_en: 'Tsuen Wan', name_tc: '荃灣', name_sc: '荃湾', lat: 22.3735, long: 114.1175, company: 'MTR', mode: 'MTR', line_codes: ['TWL'], is_interchange: false, facilities: [], exit_info: [] },

    // Island Line (ISL)
    { stop: 'KET', name_en: 'Kennedy Town', name_tc: '堅尼地城', name_sc: '坚尼地城', lat: 22.2810, long: 114.1285, company: 'MTR', mode: 'MTR', line_codes: ['ISL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'HKU', name_en: 'HKU', name_tc: '香港大學', name_sc: '香港大学', lat: 22.2840, long: 114.1350, company: 'MTR', mode: 'MTR', line_codes: ['ISL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'SYP', name_en: 'Sai Ying Pun', name_tc: '西營盤', name_sc: '西营盘', lat: 22.2855, long: 114.1425, company: 'MTR', mode: 'MTR', line_codes: ['ISL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'SHW', name_en: 'Sheung Wan', name_tc: '上環', name_sc: '上环', lat: 22.2865, long: 114.1515, company: 'MTR', mode: 'MTR', line_codes: ['ISL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'WAC', name_en: 'Wan Chai', name_tc: '灣仔', name_sc: '湾仔', lat: 22.2770, long: 114.1730, company: 'MTR', mode: 'MTR', line_codes: ['ISL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'CAB', name_en: 'Causeway Bay', name_tc: '銅鑼灣', name_sc: '铜锣湾', lat: 22.2800, long: 114.1850, company: 'MTR', mode: 'MTR', line_codes: ['ISL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'TIH', name_en: 'Tin Hau', name_tc: '天后', name_sc: '天后', lat: 22.2825, long: 114.1920, company: 'MTR', mode: 'MTR', line_codes: ['ISL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'FOH', name_en: 'Fortress Hill', name_tc: '炮台山', name_sc: '炮台山', lat: 22.2880, long: 114.1935, company: 'MTR', mode: 'MTR', line_codes: ['ISL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'TAK', name_en: 'Tai Koo', name_tc: '太古', name_sc: '太古', lat: 22.2865, long: 114.2160, company: 'MTR', mode: 'MTR', line_codes: ['ISL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'SWH', name_en: 'Sai Wan Ho', name_tc: '西灣河', name_sc: '西湾河', lat: 22.2815, long: 114.2225, company: 'MTR', mode: 'MTR', line_codes: ['ISL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'SKW', name_en: 'Shau Kei Wan', name_tc: '筲箕灣', name_sc: '筲箕湾', lat: 22.2790, long: 114.2285, company: 'MTR', mode: 'MTR', line_codes: ['ISL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'HFC', name_en: 'Heng Fa Chuen', name_tc: '杏花邨', name_sc: '杏花邨', lat: 22.2765, long: 114.2400, company: 'MTR', mode: 'MTR', line_codes: ['ISL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'CHW', name_en: 'Chai Wan', name_tc: '柴灣', name_sc: '柴湾', lat: 22.2645, long: 114.2370, company: 'MTR', mode: 'MTR', line_codes: ['ISL'], is_interchange: false, facilities: [], exit_info: [] },

    // Kwun Tong Line (KTL)
    { stop: 'WHA', name_en: 'Whampoa', name_tc: '黃埔', name_sc: '黄埔', lat: 22.3050, long: 114.1900, company: 'MTR', mode: 'MTR', line_codes: ['KTL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'SKM', name_en: 'Shek Kip Mei', name_tc: '石硤尾', name_sc: '石硖尾', lat: 22.3310, long: 114.1680, company: 'MTR', mode: 'MTR', line_codes: ['KTL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'LOF', name_en: 'Lok Fu', name_tc: '樂富', name_sc: '乐富', lat: 22.3375, long: 114.1870, company: 'MTR', mode: 'MTR', line_codes: ['KTL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'WTS', name_en: 'Wong Tai Sin', name_tc: '黃大仙', name_sc: '黄大仙', lat: 22.3415, long: 114.1935, company: 'MTR', mode: 'MTR', line_codes: ['KTL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'CHH', name_en: 'Choi Hung', name_tc: '彩虹', name_sc: '彩虹', lat: 22.3345, long: 114.2085, company: 'MTR', mode: 'MTR', line_codes: ['KTL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'KOB', name_en: 'Kowloon Bay', name_tc: '九龍灣', name_sc: '九龙湾', lat: 22.3235, long: 114.2140, company: 'MTR', mode: 'MTR', line_codes: ['KTL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'NTK', name_en: 'Ngau Tau Kok', name_tc: '牛頭角', name_sc: '牛头角', lat: 22.3150, long: 114.2190, company: 'MTR', mode: 'MTR', line_codes: ['KTL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'KWT', name_en: 'Kwun Tong', name_tc: '觀塘', name_sc: '观塘', lat: 22.3120, long: 114.2265, company: 'MTR', mode: 'MTR', line_codes: ['KTL'], is_interchange: false, facilities: [], exit_info: [] },
    { stop: 'LAT', name_en: 'Lam Tin', name_tc: '藍田', name_sc: '蓝田', lat: 22.3065, long: 114.2335, company: 'MTR', mode: 'MTR', line_codes: ['KTL'], is_interchange: false, facilities: [], exit_info: [] },
  ];
  return stations;
}