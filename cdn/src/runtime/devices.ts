export const DEVICE_TESTS = {
  tablet: [
    /\((ipad|playbook);[\w\s\);-]+(rim|apple)/i, // iPad/PlayBook
    /applecoremedia\/[\w\.]+ \((ipad)/, // iPad
    /(archos)\s(gamepad2?)/i, // Archos
    /(hp).+(touchpad)/i, // HP TouchPad
    /(hp).+(tablet)/i, // HP Tablet
    /(kindle)\/([\w\.]+)/i, // Kindle
    /\s(nook)[\w\s]+build\/(\w+)/i, // Nook
    /(dell)\s(strea[kpr\s\d]*[\dko])/i, // Dell Streak
    /(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i, // Kindle Fire HD
    /android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7|padfone)/i, // Asus Tablets
    /(sony)\s(tablet\s[ps])\sbuild\//i, // Sony
    /(sony)?(?:sgp.+)\sbuild\//i, // Sony
    /(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i, // Lenovo tablets
    /(nexus\s9)/i, // HTC Nexus 9
    /android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i,
    /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n\d+|sgh-t8[56]9|nexus 10))/i, // Samsung tablets
    /((SM-T\w+))/i,
    /android\s3\.[\s\w;-]{10}(a\d{3})/i, // Acer
    /android.+([vl]k\-?\d{3})\s+build/i, // LG Tablet
    /android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i, // LG Tablet
    /android.+(ideatab[a-z0-9\-\s]+)/i, // Lenovo
    /android.+;\s(pixel c)\s/i, // Google Pixel C
    /android.+(mi[\s\-_]*(?:pad)(?:[\s_]*[\w\s]+)?)\s+build/i, // Mi Pad tablets
    /android.+;\s(m[1-5]\snote)\sbuild/i, // Meizu Tablet
    /android.+[;\/]\s*(RCT[\d\w]+)\s+build/i, // RCA Tablets
    /android.+[;\/]\s*(Venue[\d\s]*)\s+build/i, // Dell Venue Tablets
    /android.+[;\/]\s*(Q[T|M][\d\w]+)\s+build/i, // Verizon Tablet
    /android.+[;\/]\s+(Barnes[&\s]+Noble\s+|BN[RT])(V?.*)\s+build/i, // Barnes & Noble Tablet
    /android.+[;\/]\s+(TM\d{3}.*\b)\s+build/i, // Barnes & Noble Tablet
    /android.+[;\/]\s*(zte)?.+(k\d{2})\s+build/i, // ZTE K Series Tablet
    /android.+[;\/]\s*(zur\d{3})\s+build/i, // Swiss ZUR Tablet
    /android.+[;\/]\s*((Zeki)?TB.*\b)\s+build/i, // Zeki Tablets
    /(android).+[;\/]\s+([YR]\d{2}x?.*)\s+build/i, // Dragon Touch Tablet
    /android.+[;\/]\s+(Dragon[\-\s]+Touch\s+|DT)(.+)\s+build/i, // Dragon Touch Tablet
    /android.+[;\/]\s*(NS-?.+)\s+build/i, // Insignia Tablets
    /android.+[;\/]\s*((NX|Next)-?.+)\s+build/i, // NextBook Tablets
    /android.+[;\/]\s*(V(100MD|700NA|7011|917G).*\b)\s+build/i, // Envizen Tablets
    /android.+[;\/]\s*(Le[\s\-]+Pan)[\s\-]+(.*\b)\s+build/i, // Le Pan Tablets
    /android.+[;\/]\s*(Trio[\s\-]*.*)\s+build/i,
    /android.+[;\/]\s*(Trinity)[\-\s]*(T\d{3})\s+build/i, // Trinity Tablets
    /android.+[;\/]\s*TU_(1491)\s+build/i, // Rotor Tablets
    /android.+(KS(.+))\s+build/i, // Amazon Kindle Tablets
    /android.+(Gigaset)[\s\-]+(Q.+)\s+build/i, // Gigaset Tablets

    // Unidentifiable Tablet
    /\s(tablet|tab)[;\/]/i
  ],
  mobile: [
    /(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i, // Fire Phone
    /\((ip[honed|\s\w*]+);.+(apple)/i, // iPod/iPhone
    /\((ip[honed|\s\w*]+);/i, // iPod/iPhone
    /(blackberry)[\s-]?(\w+)/i, // BlackBerry
    /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i,
    // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
    /(hp)\s([\w\s]+\w)/i, // HP iPAQ
    /(asus)-?(\w+)/i, // Asus
    /\(bb10;\s(\w+)/i, // BlackBerry 10
    /android.+\s([c-g]\d{4}|so[-l]\w+)\sbuild\//i, // Sony
    /(sprint\s(\w+))/i, // Sprint Phones
    /(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i, // HTC
    /(zte)-(\w+)*/i, // ZTE
    /(alcatel|geeksphone|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i,
    // Alcatel/GeeksPhone/Lenovo/Nexian/Panasonic/Sony
    /d\/huawei([\w\s-]+)[;\)]/i,
    /(nexus\s6p)/i, // Huawei
    /(microsoft);\s(lumia[\s\w]+)/i, // Microsoft Lumia
    /(kin\.[onetw]{3})/i, // Microsoft Kin
    /\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i, // Motorola
    /mot[\s-]?(\w+)*/i, // Motorola
    /(XT\d{3,4}) build\//i, // Motorola
    /(nexus\s6)/i, // Motorola
    /((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-\w[\w\d]+))/i, // Samsung
    /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,
    /sec-((sgh\w+))/i,
    /sie-(\w+)*/i, // Siemens Mobile
    /(maemo|nokia).*(n900|lumia\s\d+)/i, // Nokia
    /(nokia)[\s_-]?([\w-]+)*/i,
    /(nexus\s[45])/i, // LG
    /lg[e;\s\/-]+(\w+)*/i,
    /android.+lg(\-?[\d\w]+)\s+build/i,
    /linux;.+((jolla));/i, // Jolla
    /android.+;\s(oppo)\s?([\w\s]+)\sbuild/i, // OPPO
    /android.+;\s(pixel xl|pixel)\s/i, // Google Pixel
    /android.+(\w+)\s+build\/hm\1/i, // Xiaomi Hongmi 'numeric' models
    /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i, // Xiaomi Hongmi
    /android.+(mi[\s\-_]*(?:one|one[\s_]plus|note lte)?[\s_]*(?:\d\w?)?[\s_]*(?:plus)?)\s+build/i, // Xiaomi Mi
    /android.+(redmi[\s\-_]*(?:note)?(?:[\s_]*[\w\s]+)?)\s+build/i, // Redmi Phones
    /android.+a000(1)\s+build/i, // OnePlus
    /android.+oneplus\s(a\d{4})\s+build/i,
    /android.+[;\/]\s*(gen\d{3})\s+build.*49h/i, // Swiss GEN Mobile
    /android.+[;\/]\s*(Xtreme\_?)?(V(1[045]|2[015]|30|40|60|7[05]|90))\s+build/i,
    /android.+[;\/]\s*(LVTEL\-?)?(V1[12])\s+build/i, // LvTel Phones

    // Unidentifiable Mobile
    /\s(mobile)(?:[;\/]|\ssafari)/i
  ],
  desktop: [
    /(mac\sos\sx)\s?([\w\s\.]+\w)*/i, // Mac OS
    /(macintosh|mac(?=_powerpc)\s)/i, // Mac OS
    /microsoft\s(windows)\s(vista|xp)/i, // Windows
    /(windows)\snt\s6\.2;\s(arm)/i // Windows NT
  ]
}
