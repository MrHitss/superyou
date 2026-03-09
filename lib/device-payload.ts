/**
 * Collects device/browser info for login and register API payloads.
 * Used when NEXT_PUBLIC_SUPERYOU_API_BASE is set; all fields optional.
 */

export interface DevicePayload {
  device_id?: string;
  device_name?: string;
  manufacturer?: string;
  model?: string;
  os?: string;
  os_version?: string;
  app_version?: string;
  build_number?: string;
  locale?: string;
  timezone?: string;
  screen_w?: number;
  screen_h?: number;
  dpi?: string;
  is_emulator?: boolean;
  is_tablet?: boolean;
  push_token?: string;
}

function getStableId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem('superyou_device_id');
    if (!id) {
      id = `web-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
      localStorage.setItem('superyou_device_id', id);
    }
    return id;
  } catch {
    return '';
  }
}

export function getDevicePayload(): DevicePayload {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {};
  }
  const ua = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(ua);
  let os: string | undefined;
  let osVersion: string | undefined;
  if (/iPhone|iPad|iPod/.test(ua)) {
    os = 'iOS';
    const match = ua.match(/OS (\d+[._]\d+[._]?\d*)/);
    osVersion = match ? match[1].replace(/_/g, '.') : undefined;
  } else if (/Android/.test(ua)) {
    os = 'Android';
    const match = ua.match(/Android (\d+[.\d]*)/);
    osVersion = match ? match[1] : undefined;
  } else if (/Windows/.test(ua)) {
    os = 'Windows';
  } else if (/Mac OS/.test(ua)) {
    os = 'Mac OS';
  } else {
    os = 'Web';
  }
  return {
    device_id: getStableId(),
    device_name: (navigator as { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands?.[0]?.brand ?? undefined,
    manufacturer: undefined,
    model: undefined,
    os,
    os_version: osVersion,
    app_version: undefined,
    build_number: undefined,
    locale: navigator.language || undefined,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
    screen_w: typeof screen !== 'undefined' ? screen.width : undefined,
    screen_h: typeof screen !== 'undefined' ? screen.height : undefined,
    dpi: typeof window !== 'undefined' && window.devicePixelRatio ? String(Math.round(window.devicePixelRatio * 96)) : undefined,
    is_emulator: false,
    is_tablet: isTablet,
    push_token: undefined,
  };
}
