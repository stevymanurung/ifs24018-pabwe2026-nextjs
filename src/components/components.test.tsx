import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Avatar from '@/components/Avatar';
import ModalShell from '@/components/ModalShell';
import Providers from '@/components/Providers';
import Spinner from '@/components/Spinner';

describe('Avatar', () => {
  it('menampilkan foto bila tersedia', () => {
    const { container } = render(<Avatar name="Budi" photo="http://open-api.delcom.org/a.png" size="lg" />);
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('src', 'https://open-api.delcom.org/a.png');
    expect(img).toHaveAttribute('alt', '');
  });

  it('menampilkan inisial bila foto kosong', () => {
    render(<Avatar name="  budi" photo={null} size="sm" />);
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});

describe('Spinner', () => {
  it('menampilkan label status', () => {
    render(<Spinner label="Memuat..." />);
    expect(screen.getByRole('status')).toHaveTextContent('Memuat...');
  });
});

describe('ModalShell', () => {
  it('berfokus pada input pertama dan menutup lewat Escape, latar, dan tombol', async () => {
    const onClose = vi.fn();
    render(
      <ModalShell title="Judul Modal" onClose={onClose}>
        <input aria-label="isian" />
      </ModalShell>,
    );
    expect(screen.getByRole('dialog', { name: 'Judul Modal' })).toBeInTheDocument();
    expect(screen.getByLabelText('isian')).toHaveFocus();

    await userEvent.keyboard('a{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Tutup dialog' }));
    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});

describe('Providers', () => {
  it('merender children di dalam Redux Provider', () => {
    render(
      <Providers>
        <p>isi</p>
      </Providers>,
    );
    expect(screen.getByText('isi')).toBeInTheDocument();
  });
});
