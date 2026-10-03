import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('config', () => {
  it('membaca nilai dari environment', async () => {
    vi.stubEnv('NEXT_PUBLIC_DELCOM_BASEURL', 'https://example.test/api/');
    vi.stubEnv('APP_PORT', '4100');
    const config = await import('@/lib/config');
    expect(config.DELCOM_BASEURL).toBe('https://example.test/api');
    expect(config.APP_PORT).toBe(4100);
  });

  it('memakai nilai bawaan bila environment kosong', async () => {
    vi.stubEnv('NEXT_PUBLIC_DELCOM_BASEURL', undefined);
    vi.stubEnv('APP_PORT', undefined);
    const config = await import('@/lib/config');
    expect(config.DELCOM_BASEURL).toBe('https://open-api.delcom.org/api/v1');
    expect(config.APP_PORT).toBe(3000);
  });
});
