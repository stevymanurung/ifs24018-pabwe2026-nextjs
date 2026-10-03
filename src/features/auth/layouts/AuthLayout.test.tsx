import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { putAccessToken } from '@/helpers/apiHelper';
import AuthLayout from '@/features/auth/layouts/AuthLayout';
import { routerMock } from '@/navigationMock';

describe('AuthLayout', () => {
  it('merender children dan banner tanpa mengalihkan bila belum login', () => {
    render(
      <AuthLayout>
        <h1>Konten Auth</h1>
      </AuthLayout>,
    );
    expect(screen.getByRole('heading', { name: 'Konten Auth' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Tentang Ruang Post' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('mengalihkan ke dashboard bila sesi sudah aktif', () => {
    putAccessToken('tok');
    render(<AuthLayout>isi</AuthLayout>);
    expect(routerMock.replace).toHaveBeenCalledWith('/');
  });
});
