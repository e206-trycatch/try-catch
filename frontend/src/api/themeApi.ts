import api from './api';

export type ThemeSummaryDto = Readonly<{
  themeId: number;
  name: string;
  description: string;
  genre: string;
  level: number;
  themeImageUrl: string;
}>;

type ThemeListResult = Readonly<{
  result: ThemeSummaryDto[];
}>;

type ApiResponseNullable<T> = Readonly<{
  message: string;
  result: T | null;
}>;

// /themes API에서 테마 목록 배열 반환 (실패 시 null)
export const fetchThemeList = async (
  signal?: AbortSignal,
): Promise<ThemeSummaryDto[] | null> => {
  const { data } = await api.get<ApiResponseNullable<ThemeListResult>>(
    '/themes',
    { signal },
  );
  const themes = data.result?.result;
  return Array.isArray(themes) ? themes : null;
};

// 특정 themeId의 이미지 URL만 반환 (실패 시 null)
export const fetchThemeImageUrl = async (
  themeId: number,
): Promise<string | null> => {
  try {
    const themes = await fetchThemeList();
    if (!themes) return null;
    return themes.find((t) => t.themeId === themeId)?.themeImageUrl ?? null;
  } catch {
    return null;
  }
};
