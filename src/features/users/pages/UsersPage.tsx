'use client';

import { useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import Avatar from '@/components/Avatar';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useInput } from '@/hooks/useInput';
import { asyncReceiveUsers } from '@/features/users/states/action';

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.users);
  const [query, onQueryChange] = useInput('');

  useEffect(() => {
    dispatch(asyncReceiveUsers());
  }, [dispatch]);

  const keyword = query.trim().toLowerCase();
  const visibleUsers = users.filter((item) =>
    `${item.name} ${item.email}`.toLowerCase().includes(keyword),
  );

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Daftar Pengguna</h1>
      <p className="mt-1 text-muted">Temukan pengguna lain yang terdaftar di Ruang Post.</p>

      <div className="relative mt-6 max-w-md">
        <label htmlFor="user-search-input" className="sr-only">
          Cari pengguna
        </label>
        <FiSearch
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted"
        />
        <input
          id="user-search-input"
          type="search"
          value={query}
          onChange={onQueryChange}
          placeholder="Cari nama atau email"
          className="field pl-10"
        />
      </div>

      {visibleUsers.length === 0 ? (
        <p className="card mt-8 p-10 text-center text-muted">Tidak ada pengguna yang ditemukan.</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleUsers.map((item) => (
            <li key={item.id} className="card flex items-center gap-4 p-5">
              <Avatar name={item.name} photo={item.photo} size="md" />
              <div className="min-w-0">
                <p className="truncate font-bold">{item.name}</p>
                <p className="truncate text-sm text-muted">{item.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
